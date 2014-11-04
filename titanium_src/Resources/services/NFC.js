/* jshint globalstrict:true */
'use strict';

var Utils = require('lib/Utils');
var Database = require('lib/Database');
var Node = require('objects/Node');
var NFCTag = require('objects/NFCTag');

Ti.include('/lib/vendor/CryptoJS/hmac-sha1.js');

var NFC = function NFC() {
	this.networkChangedCallback = null;
	this.backlog = [];
	this.sending = {};
	
	this._initListeners();
	
	this._restoreState();
};

NFC.ENCRYPTION_KEY = CryptoJS.enc.Utf8.parse('OYDnEbi5GXUGj1NqsrHTNfqQFtCIg1YQ');

NFC.prototype.sendScan = function(tag, data) {
	var nfcNode = this._getNFCNode(tag.getData());
	
	if (!nfcNode) {
		Utils.sendErrorReport('Error in NFC.prototype.sendScan: Attempting to send scan with invalid tag.');
		return;
	}
	
	var scanData = data || {};
	scanData.nfc_data = tag.getData();
	scanData.serial = tag.getId();
	scanData.timestamp = Utils.getUTCTimestamp();
	scanData.nid = nfcNode.nid;
	scanData.table = nfcNode.table;
	scanData.field = nfcNode.field;
	scanData.scans = tag.getScanCount();
	scanData.id = new Date().getTime();
	scanData.tries = 0;
	
	this._addToBacklog(scanData);
	this._saveState();
	
	if (Ti.Network.online) {
		this._sendData();
	}
};

NFC.prototype.sendSkip = function(nid, field, data) {
	var nfcNode = Node.load(nid);
	
	if (!nfcNode) {
		Utils.sendErrorReport('Error in NFC.prototype.sendSkip: Attempting to send skip with invalid nid.');
		return;
	}
	
	if (!nfcNode[field]) {
		Utils.sendErrorReport('Error in NFC.prototype.sendSkip: Attempting to send skip with invalid field.');
		return;
	}
	
	var scanData = data || {};
	scanData.nfc_data = nfcNode[field].dbValues[0];
	scanData.serial = NFCTag.getId(String(scanData.nfc_data));
	scanData.timestamp = Utils.getUTCTimestamp();
	scanData.nid = nid;
	scanData.table = nfcNode.table_name;
	scanData.field = field;
	scanData.id = new Date().getTime();
	scanData.tries = 0;
	scanData.scans = -1;
	scanData.skip = true;
	
	this._addToBacklog(scanData);
	this._saveState();
	
	if (Ti.Network.online) {
		this._sendData();
	}
};

/* PRIVATE METHODS */

NFC.prototype._initListeners = function() {
	this._initNetworkListener();
};

NFC.prototype._initNetworkListener = function() {
	var self = this;
	this.networkChangedCallback = function(event) {
		self._handleNetworkChanged(event);
	};
	Ti.Network.addEventListener('change', this.networkChangedCallback);
};

NFC.prototype._getSignature = function(data) {
	return CryptoJS.HmacSHA1(JSON.stringify(data), NFC.ENCRYPTION_KEY).toString(CryptoJS.enc.Base64);
};

NFC.prototype._getNFCNode = function(nfcData) {
	try {
		var nfcFields = this._getNFCFields();
		for (var bundle in nfcFields) {
			var result = Database.query('SELECT nid, ' + nfcFields[bundle].join(', ') + ' FROM ' + bundle + ' WHERE nid > 0');
			while (result.isValidRow()) {
				for (var i = 0; i < nfcFields[bundle].length; i++) {
					var field_name = nfcFields[bundle][i];
					
					if (nfcData == result.fieldByName(field_name)) {
						var node = {
							table: bundle,
							field: field_name,
							nid: result.fieldByName('nid')
						};
						
						result.close();
						Database.close();
						
						return node;
					}
				}
				result.next();
			}
			result.close();
			Database.close();
		}
	} catch (error) {
		Ti.API.error('NFC.prototype._getNFCNode: ' + error);
	}
	
	return null;
};

NFC.prototype._getNFCFields = function() {
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
		Ti.API.error('NFC.prototype._getNFCFields: ' + error);
	}
	
	return nfcFields;
};

NFC.prototype._processTag = function(tag, nid, field) {
	this._addToBacklog({
		nfc_data: tag.getData(),
		serial: tag.getId(),
		timestamp: Utils.getUTCTimestamp(),
		nid: nid,
		field: field,
		scans: tag.getScanCount(),
		id: new Date().getTime(),
		tries: 0
	});
	this._saveState();
	
	if (Ti.Network.online) {
		this._sendData();
	}
};

NFC.prototype._sendData = function(tries) {
	var data = this._getBacklog();
	
	if (data.length === 0) {
		return;
	}
	
	this._setBacklog([]);
	this._addToSending(data);
	this._saveState();
	
	
    var networkData = this._getNetworkData(data);
    
    Ti.API.info('Sending tag data: ' + networkData);
	
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

NFC.prototype._getHTTPSuccessFunction = function(data) {
	var self = this;
	return function(event) {
		try {
			var sending = self._getSending();
			var response = JSON.parse(event.source.responseText);
			
			// Add failed uploads to the backlog
			if (response.failed) {
				for (var i = 0; i < response.failed.length; i++) {
					var nfcData = sending[response.failed[i].id];
					if (response.failed[i].retry) {
						nfcData.tries++;
						self._addToBacklog(nfcData);
					} else {
						Utils.sendErrorReport('NFC scan upload rejected by server: ' + response.failed[i].message + ', ' + JSON.stringify(nfcData));
					}
				}
			}
			
			self._removeFromSending(data);
			self._saveState();
			
			if (response.failed) {
				self._sendData();
			}
		} catch (error) {
			Ti.API.error('Error in NFC.prototype._getHTTPSuccessFunction: ' + error);
		}
	};
};

NFC.prototype._getHTTPErrorFunction = function(data, networkData, tries) {
	var self = this;
	return function(event) {
		self._removeFromSending(data);
		self._addToBacklog(data);
		// No need to save state as it will just concatenate sending and backlog.
		
		if (Ti.Network.online) {
			if (tries < 10) {
				self._sendData(tries + 1);
			} else {
				var times = [];
				for (var i = 0; i < data.length; i++) {
					times.push(Utils.getTimeAgoStr(data[i].timestamp));
				}
				
				alert('The NFC tag' + (data.length !== 1 ? 's' : '') + ' you scanned ' + Utils.joinAsSentence(times) + ' failed to upload to the server.');
				Utils.sendErrorReport('Error in NFC.prototype._getHTTPErrorFunction: Quitting after 10 tries: ' + JSON.stringify(event) + ', ' + networkData);
			}
		}
	};
};

NFC.prototype._getNetworkData = function(data) {
	return JSON.stringify({
		data: JSON.stringify(data),
		signature: this._getSignature(data)
	});
};

NFC.prototype._handleNetworkChanged = function(event) {
	if (event.online) {
		this._sendData();
	}
};

NFC.prototype._getBacklog = function() {
	return this.backlog;
};

NFC.prototype._setBacklog = function(backlog) {
	if (Utils.isArray(backlog)) {
		this.backlog = backlog;
	}
};

NFC.prototype._addToBacklog = function(nfcData) {
	this.backlog = this.backlog.concat(nfcData);
};

NFC.prototype._getSending = function() {
	return this.sending;
};

NFC.prototype._addToSending = function(nfcData) {
	for (var i = 0; i < nfcData.length; i++) {
		this.sending[nfcData[i].id] = nfcData[i];
	}
};

NFC.prototype._removeFromSending = function(nfcData) {
	for (var i = 0; i < nfcData.length; i++) {
		delete this.sending[nfcData[i].id];
	}
};

NFC.prototype._restoreState = function() {
	var state = JSON.parse(Ti.App.Properties.getString('NFC.state', '{}'));
	this._setBacklog(state.data || []);
};

NFC.prototype._saveState = function() {
	var state = JSON.stringify({
		data: this._getUnsentData(),
	});
	Ti.App.Properties.setString('NFC.state', state);
};

NFC.prototype._getUnsentData = function() {
	return this._getBacklog().concat(Utils.getValues(this._getSending()));
};


var instance = null;

function getInstance() {
	if (!instance) {
		instance = new NFC();
	}
	return instance;
}

exports.sendScan = function(tag, data) {
	getInstance().sendScan(tag, data);
};

exports.sendSkip = function(nid, data) {
	getInstance().sendSkip(nid, data);
};

