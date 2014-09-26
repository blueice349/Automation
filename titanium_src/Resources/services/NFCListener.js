/* jshint globalstrict:true */

var NFCEventDispatcher = require('services/NFCEventDispatcher');
var Database = require('lib/Database');
var Utils = require('lib/Utils');

Ti.include('/lib/vendor/CryptoJS/hmac-sha1.js');

var NFCListener = function() {
	this.nfc = null;
	this.tagScannedCallback = null;
	this.networkChangedCallback = null;
	this.backlog = [];
	this.sending = {};
	
	this._initListeners();
	
	this._restoreState();
};

NFCListener.ENCRYPTION_KEY = CryptoJS.enc.Utf8.parse('OYDnEbi5GXUGj1NqsrHTNfqQFtCIg1YQ');

/* PRIVATE METHODS */

NFCListener.prototype._initListeners = function() {
	this._initNetworkListener();
	this._initNFCEventDispatcher();
};

NFCListener.prototype._initNetworkListener = function() {
	this.networkChangedCallback = this._handleNetworkChanged.bind(this);
	Ti.Network.addEventListener('change', this.networkChangedCallback);
};

NFCListener.prototype._initNFCEventDispatcher = function() {
	if (Ti.App.isAndroid) {
		this.tagScannedCallback = this._handleTagScanned.bind(this);
		this.nfc = new NFCEventDispatcher(Titanium.Android.currentActivity);
		this.nfc.addNFCListener(this.tagScannedCallback);
	}
};

NFCListener.prototype._getSignature = function(data) {
	return CryptoJS.HmacSHA1(JSON.stringify(data), NFCListener.ENCRYPTION_KEY).toString(CryptoJS.enc.Base64);
};

NFCListener.prototype._handleTagScanned = function(tag) {
	var validTags = this._getValidTags();
	var data = validTags[tag.getData()];
	if (data) {
		this._processTag(tag, data.nid, data.field);
	} else {
		alert('There was an error reading the NFC tag. It may not be a valid Omadi tag.');
		Titanium.Media.vibrate([500, 1000, 500, 1000]);
	}
};

NFCListener.prototype._getValidTags = function() {
	var validTags = {};
	
	try {
		var nfcFields = this._getNFCFields();
		for (var bundle in nfcFields) {
			var result = Database.query('SELECT nid, ' + nfcFields[bundle].join(', ') + ' FROM ' + bundle + ' WHERE nid > 0');
			while (result.isValidRow()) {
				for (var i = 0; i < nfcFields[bundle].length; i++) {
					var field_name = nfcFields[bundle][i];
					var nfcData = result.fieldByName(field_name);
					var nid = result.fieldByName('nid');
					
					if (nfcData) {
						validTags[nfcData] = {
							field: field_name,
							nid: nid
						};
					}
				}
				result.next();
			}
			result.close();
			Database.close();
		}
	} catch (error) {
		Ti.API.error('NFCListener.prototype._getValidTags: ' + error);
	}
	
	return validTags;
};

NFCListener.prototype._getNFCFields = function() {
	var nfcFields = {};
	
	try {
		var result = Database.query('SELECT field_name, bundle FROM fields WHERE type = "nfc_field"');
		while (result.isValidRow()) {
			var bundle = result.fieldByName('bundle');
			var field_name = result.fieldByName('field_name');
			
			if (!Utils.startsWith(bundle, 'comment_node_')) {
				if (!nfcFields[bundle]) {
					nfcFields[bundle] = [];
				}
				nfcFields[bundle].push(field_name);
			}
			
			result.next();
		}
		result.close();
		Database.close();
	} catch (error) {
		Ti.API.error('NFCListener.prototype._getNFCFields: ' + error);
	}
	
	return nfcFields;
};

NFCListener.prototype._processTag = function(tag, nid, field) {
	this._addToBacklog({
		nfc_data: tag.getData(),
		serial: tag.getId(),
		timestamp: Utils.getUTCTimestamp(),
		nid: nid,
		field: field,
		id: new Date().getTime(),
		tries: 0
	});
	this._saveState();
	
	if (Ti.Network.online) {
		this._sendData();
	}
};

NFCListener.prototype._sendData = function(tries) {
	var data = this._getBacklog();
	
	if (data.length === 0) {
		return;
	}
	
	this._setBacklog([]);
	this._addToSending(data);
	this._saveState();
	
	
    var networkData = this._getNetworkData(data);
	
	var http = Ti.Network.createHTTPClient({
        enableKeepAlive: false,
        validatesSecureCertificate: false,
        timeout: 30000
    });
    http.open('POST', Ti.App.DOMAIN_NAME + '/rest/nfc/scan.json');
    http.setRequestHeader('Content-Type', 'application/json');
    Utils.setCookieHeader(http);
    http.onerror = this._getHTTPErrorFunction(data, networkData, tries || 0);
    http.onload = this._getHTTPSuccessFunction(data);
    http.send(networkData);
};

NFCListener.prototype._getHTTPSuccessFunction = function(data) {
	return function(event) {
		try {
			var sending = this._getSending();
			var response = JSON.parse(event.source.responseText);
			
			// Add failed uploads to the backlog
			if (response.failed) {
				for (var i = 0; i < response.failed.length; i++) {
					var nfcData = sending[response.failed[i].id];
					if (response.failed[i].retry) {
						nfcData.tries++;
						this._addToBacklog(nfcData);
					} else {
						Utils.sendErrorReport('NFC scan upload rejected by server: ' + response.failed[i].message + ', ' + JSON.stringify(nfcData));
					}
				}
			}
			
			this._removeFromSending(data);
			this._saveState();
			
			if (response.failed) {
				this._sendData();
			}
		} catch (error) {
			Ti.API.error('Error in NFCListener.prototype._getHTTPSuccessFunction: ' + error);
		}
	}.bind(this);
};

NFCListener.prototype._getHTTPErrorFunction = function(data, networkData, tries) {
	return function(event) {
		this._removeFromSending(data);
		this._addToBacklog(data);
		// No need to save state as it will just concatenate sending and backlog.
		
		if (Ti.Network.online) {
			if (tries < 10) {
				this._sendData(tries + 1);
			} else {
				var times = [];
				for (var i = 0; i < data.length; i++) {
					times.push(Utils.getTimeAgoStr(data[i].timestamp));
				}
				
				alert('The NFC tag' + (data.length !== 1 ? 's' : '') + ' you scanned ' + Utils.joinAsSentence(times) + ' failed to upload to the server.');
				Utils.sendErrorReport('Error in NFCListener.prototype._getHTTPErrorFunction: Quitting after 10 tries: ' + JSON.stringify(event) + ', ' + networkData);
			}
		}
	}.bind(this);
};

NFCListener.prototype._getNetworkData = function(data) {
	return JSON.stringify({
		data: JSON.stringify(data),
		signature: this._getSignature(data)
	});
};

NFCListener.prototype._handleNetworkChanged = function(event) {
	if (event.online) {
		this._sendData();
	}
};

NFCListener.prototype._getBacklog = function() {
	return this.backlog;
};

NFCListener.prototype._setBacklog = function(backlog) {
	if (Utils.isArray(backlog)) {
		this.backlog = backlog;
	}
};

NFCListener.prototype._addToBacklog = function(nfcData) {
	this.backlog = this.backlog.concat(nfcData);
};

NFCListener.prototype._getSending = function() {
	return this.sending;
};

NFCListener.prototype._addToSending = function(nfcData) {
	for (var i = 0; i < nfcData.length; i++) {
		this.sending[nfcData[i].id] = nfcData[i];
	}
};

NFCListener.prototype._removeFromSending = function(nfcData) {
	for (var i = 0; i < nfcData.length; i++) {
		delete this.sending[nfcData[i].id];
	}
};

NFCListener.prototype._restoreState = function() {
	var state = JSON.parse(Ti.App.Properties.getString('NFCListener.state', '{}'));
	this._setBacklog(state.data || []);
};

NFCListener.prototype._saveState = function() {
	var state = JSON.stringify({
		data: this._getUnsentData(),
	});
	Ti.App.Properties.setString('NFCListener.state', state);
};

NFCListener.prototype._getUnsentData = function() {
	return this._getBacklog().concat(Utils.getValues(this._getSending()));
};

var nfcListener = new NFCListener();

exports.getInstance = function() {
	return nfcListener;
};
