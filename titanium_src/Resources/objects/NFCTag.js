/* jshint globalstrict:true */
'use strict';


Ti.include('/lib/vendor/CryptoJS/aes.js');
Ti.include('/lib/vendor/CryptoJS/sha3.js');

if (Ti.Platform.name === 'android') { var nfc = require('ti.nfc'); }

var NFCTag = function(tag) {
	this.tag = tag;
	this.tech = null;
	this.id = null;
	this.data = null;
	this.valid = null;
	this.writable = null;
};

NFCTag.ENCRYPTION_KEY = CryptoJS.enc.Utf8.parse('6p30BYV1p00eADpKPRfZ8wsqSViW8nAm');

/* PUBLIC METHODS */

NFCTag.prototype.getData = function() {
	if (this.data === null) {
		var data = '';
		var tech = this._getTech();
		
		if (!tech) {
			return '';
		}
		
		try {
			this._connect();
			
			var message = tech.getNdefMessage();
			if (message) {
				var records = message.getRecords(), i;
				for (i = 0; i < records.length; i++) {
					data += records[i].getText();
				}
			}
		} catch (error) {
			// ignore bad connection
			Ti.API.error('Error in NFCTag.prototype.getData: ' + error);
		} finally {
			this._close();
		}
		this.data = data;
	}
	return this.data;
};

NFCTag.prototype.getId = function() {
	if (this.id === null) {
		this.id = String(this.getTag().id);
	}
	return this.id;
};

NFCTag.prototype.getTag = function() {
	return this.tag;
};

NFCTag.prototype.initTagWithNewData = function() {
	var success = false;
	try {
		var data = this._generateData();
		this._setData(data);
		success = (this.getData() == data);
	} catch (error) {
		Ti.API.info('Error in NFCTag.prototype.initTagWithNewData: ' + error);
	}
	return success;
};

NFCTag.prototype.isValidOmadiTag = function() {
	if (this.valid === null) {
		try {
			var iv = this._getInitializationVector();
			var encryptedData = this._getEncryptedData();
			var decryptedData = CryptoJS.AES.decrypt(encryptedData, NFCTag.ENCRYPTION_KEY, { iv: iv });
			var data = JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8));
			this.valid = this.getId() == data.serial;
		} catch (error) {
			Ti.API.error('Error in NFCTag.prototype.isValidOmadiTag: ' + error);
			this.valid = null;
		}
	}
	return this.valid;
};

NFCTag.prototype.isWritable = function() {
	if (this.writable === null) {
		try {
			this.writable = this._getTech().isWritable();
		} catch (error) {
			Ti.API.error('Error in NFCTag.prototype.isWritable: ' + error);
			this.writable = null;
		}
	}
	return this.writable;
};

/* PRIVATE METHODS */

NFCTag.prototype._close = function() {
	try {
		var tech = this._getTech();
		if (tech && tech.isConnected()) {
			tech.close();
		}
	} catch (error) {
		Ti.API.error('Error in NFCTag.prototype._connect: ' + error);
	}
};

NFCTag.prototype._connect = function() {
	try {
		var tech = this._getTech();
		if (tech && !tech.isConnected()) {
			tech.connect();
		}
	} catch (error) {
		Ti.API.error('Error in NFCTag.prototype._connect: ' + error);
	}
};

NFCTag.prototype._getTech = function() {
	if (this.tech === null && nfc) {
		try {
			this.tech = nfc.createTagTechnologyNdef({ tag: this.tag });
		} catch (error) {
			Ti.API.error('Error in NFCTag.prototype._getTech: ' + error);
			this.tech = null;
		}
	}
	return this.tech;
};

NFCTag.prototype._setData = function(data) {
	var tech = this._getTech();
	
	if (!tech || !nfc) {
		return;
	}
	
	try {
		this._connect();
		
		if (!tech.isWritable()) {
			return;
		}
		
		var record = nfc.createNdefRecordText({
			text: data
		});
		
		var message = nfc.createNdefMessage({
			records: [record]
		});
		
		tech.writeNdefMessage(message);
		this.data = data;
	} catch (error) {
		// ignore bad connection
		Ti.API.error('Error in NFCTag.prototype._setData: ' + error);
	} finally {
		this._close();
	}
};

NFCTag.prototype._generateData = function() {
	var id = this.getId();
	var iv = this._generateInitializationVector();
	var data = JSON.stringify({
		serial: id,
		count: -1
	});
	var encryptedData = CryptoJS.AES.encrypt(data, NFCTag.ENCRYPTION_KEY, { iv: iv });
	
	var generatedData = 'OMADI' + iv.toString(CryptoJS.enc.Utf8) + encryptedData.toString(CryptoJS.enc.base64);
	return generatedData;
};

NFCTag.prototype._getEncryptedData = function() {
	var data = this.getData();
	return data.substring(21, data.length);
};

NFCTag.prototype._generateInitializationVector = function() {
	var input = String(Math.random());
	var hash = CryptoJS.SHA3(input, { outputLength: 128 }).toString(CryptoJS.enc.Base64);
	return CryptoJS.enc.Utf8.parse(hash.substr(0, 16));
};

NFCTag.prototype._getInitializationVector = function() {
	return CryptoJS.enc.Utf8.parse(this.getData().substring(5, 21));
};


/* PUBLIC STATIC METHODS */

module.exports = NFCTag;
