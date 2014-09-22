/*jslint node:true */
'use strict';

var Utils = require('lib/Utils');
var nfc = require('ti.nfc');
Ti.include('/lib/vendor/CryptoJS/aes.js');

var NFCTag = function(tag) {
	this.tag = tag;
	this.tech = null;
	this.id = null;
	this.data = null;
	this.valid = null;
};

NFCTag.ENCRYPTION_KEY = 'Ti.App.syncApplication';

/* PUBLIC METHODS */

NFCTag.prototype.initTagWithNewData = function() {
	this._setData(this._generateData());
};

NFCTag.prototype.getData = function() {
	if (this.data === null) {
		var data = '';
		var tech = this.getTech();
		
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
		} finally {
			this._close();
		}
		this.data = data;
	}
	return this.data;
};

NFCTag.prototype.isValidOmadiTag = function() {
	if (this.valid === null) {
		var decryptedId = Utils.hex2a(CryptoJS.AES.decrypt(this._getEncryptedId(), NFCTag.ENCRYPTION_KEY, this._getInitializationVector()));
		this.valid = this.getId() == decryptedId;
	}
	return this.valid;
};

NFCTag.prototype.getTech = function() {
	if (this.tech === null) {
		this.tech = nfc.createTagTechnologyNdef({
			tag: this.tag
		});
	}
	return this.tech;
};

NFCTag.prototype.getId = function() {
	if (this.id === null) {
		this.id = this.getTag().id;
	}
	return this.id;
};

NFCTag.prototype.getTag = function() {
	return this.tag;
};

/* PRIVATE METHODS */

NFCTag.prototype._setData = function(data) {
	var tech = this.getTech();
	
	if (!tech) {
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
	} finally {
		this._close();
	}
};

NFCTag.prototype._generateData = function() {
	var id = String(this.getId());
	var iv = this._generateInitializationVector();
	var encryptedId = CryptoJS.AES.encrypt(id, NFCTag.ENCRYPTION_KEY, iv);
	
	return 'OMADI' + iv + encryptedId;
};

NFCTag.prototype._getInitializationVector = function() {
	return this.getData().substr(5, 16);
};

NFCTag.prototype._getEncryptedId = function() {
	var data = this.getData();
	return data.substring(21, data.length);
};

NFCTag.prototype._generateInitializationVector = function() {
	var millis = new Date().getTime();
	var uid = Utils.getUid();
	var sha = Ti.Utils.sha256(Ti.Utils.base64encode(String(millis + uid)));
	var base64 = Ti.Utils.base64encode(sha).toString();
	return base64.substr(0,16);
};

NFCTag.prototype._connect = function() {
	var tech = this.getTech();
	if (!tech.isConnected()) {
		tech.connect();
	}
};

NFCTag.prototype._close = function() {
	var tech = this.getTech();
	if (tech.isConnected()) {
		tech.close();
	}
};

/* PUBLIC STATIC METHODS */

module.exports = NFCTag;
