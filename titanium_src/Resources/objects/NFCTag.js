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
	this.scanCount = null;
	this.hasScanCounter_ = null;
	
	this._populateCache();
};

NFCTag.Sound = {
	success: Titanium.Media.createSound({
        url : Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, "sounds/NFC-positive-sound.mp3"),
        volume : 1.0
    }),
    error: Titanium.Media.createSound({
        url : Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, "sounds/NFC-negative-sound.mp3"),
        volume : 1.0
    }),
};

NFCTag.ENCRYPTION_KEY = CryptoJS.enc.Utf8.parse('6p30BYV1p00eADpKPRfZ8wsqSViW8nAm');

NFCTag.NXP = {
	ID_PREFIX: '04',
	Command: {
		READ_COUNTER: 0x39,
		READ: 0x30,
		WRITE: 0xA2
	},
	Address: {
		COUNTER: 0x02,
		CONFIG_ONE: 0x2A
	},
	TagType: {
		NTAG213: 0x12
	}
};

/* PUBLIC METHODS */

NFCTag.prototype.getScanCount = function() {
	if (this.scanCount === null) {
		if (!this.hasScanCounter()) {
			this.scanCount = -1;
			return this.scanCount;
		}
		
		var tech = this._getTech('MifareUltralight');
		if (!tech) {
			this.scanCount = -1;
			return this.scanCount;
		}
		
		var buffer = Ti.createBuffer({
			type: Ti.Codec.TYPE_BYTE,
			length: 2
		});
		buffer[0] = NFCTag.NXP.Command.READ_COUNTER;
		buffer[1] = NFCTag.NXP.Address.COUNTER;
		
		try {
			tech.connect();
			var data = tech.transceive(buffer);
			tech.close();
			
			if (data.length === 3) {
				this.scanCount = (data[2] << 16) + (data[1] << 8) + data[0];
			}
		} catch (error) {
			Ti.API.error('Error in NFCTag.prototype.getScanCount: ' + error);
			this.scanCount = -1;
		}
	}
	return this.scanCount;
};

NFCTag.prototype.hasScanCounter = function() {
	if (this.hasScanCounter_ === null) {
		if (this.getId().substr(0, 2) != NFCTag.NXP.ID_PREFIX) {
			this.hasScanCounter_ = false;
			return this.hasScanCounter_;
		}
		
		var tech = this._getTech('MifareUltralight');
		if (!tech) {
			this.hasScanCounter_ = false;
			return this.hasScanCounter_;
		}
		
		var buffer = Ti.createBuffer({
			type: Ti.Codec.TYPE_BYTE,
			length: 2
		});
		buffer[0] = NFCTag.NXP.Command.READ_COUNTER;
		buffer[1] = NFCTag.NXP.Address.COUNTER;
		
		try {
			tech.connect();
			var data = tech.transceive(buffer);
			tech.close();
			
			this.hasScanCounter_ = true;
		} catch (error) {
			this.hasScanCounter_ = false;
			if (tech.isConnected()) {
				tech.close();
			}
		}
	}
	return this.hasScanCounter_;
};

NFCTag.prototype.getData = function() {
	if (this.data === null) {
		var data = '';
		
		var tech = this._getTech('Ndef');
		if (!tech) {
			this.data = data;
			return this.data;
		}
		
		try {
			tech.connect();
			
			var message = tech.getNdefMessage();
			if (message) {
				var records = message.getRecords(), i;
				for (i = 0; i < records.length; i++) {
					data += records[i].getText();
				}
			}
			tech.close();
			this.data = data;
		} catch (error) {
			Ti.API.error('Error in NFCTag.prototype.getData: ' + error);
		}
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
	try {
		if (!this.isWritable()) {
			return false;
		}
		
		var data = this._generateData();
		this._setData(data);
		
		if (this.getData() !== data) {
			return false;
		}
		
		if (this.hasScanCounter()) {
			this._enableScanCounter();
			if (!this._isScanCounterEnabled()) {
				return false;
			}
		}
		
		this._makeReadOnly();
	} catch (error) {
		Ti.API.info('Error in NFCTag.prototype.initTagWithNewData: ' + error);
		return false;
	}
	
	return true;
};

NFCTag.prototype.isValidOmadiTag = function() {
	if (this.valid === null) {
		try {
			this.valid = this._isLocked() && this._scanCounterIsValid() && this._idsMatch();
		} catch (error) {
			Ti.API.error('Error in NFCTag.prototype.isValidOmadiTag: ' + error);
			this.valid = null;
		}
	}
	return this.valid;
};

NFCTag.prototype.playSuccessFeedback = function() {
	NFCTag.Sound.success.play();
	Titanium.Media.vibrate([0, 250, 125, 250]);
};

NFCTag.prototype.playErrorFeedback = function() {
	NFCTag.Sound.error.play();
	Titanium.Media.vibrate([0, 1000, 500, 1000]);
};

NFCTag.prototype.isWritable = function() {
	if (this.writable === null) {
		var tech = this._getTech('Ndef');
		var writable = false;
		if (tech) {
			tech.connect();
			writable = tech.isWritable();
			tech.close();
		}
		
		this.writable = writable;
	}
	return this.writable;
};

/* PRIVATE METHODS */

NFCTag.prototype._populateCache = function() {
	this.getData();
	this.isValidOmadiTag();
};

NFCTag.prototype._idsMatch = function() {
	try {
		var iv = this._getInitializationVector();
		var encryptedData = this._getEncryptedData();
		var decryptedData = CryptoJS.AES.decrypt(encryptedData, NFCTag.ENCRYPTION_KEY, { iv: iv });
		var data = JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8));
		return this.getId() == data.serial;
	} catch (error) {
		Ti.API.error('Error in NFCTag.prototype._idMatches: ' + error);
		return false;
	}
};

NFCTag.prototype._scanCounterIsValid = function() {
	// Returns false when there should be a scan counter but isn't. This happens when the phone is pulled away before the scan counter can be read.
	return !this.hasScanCounter() || this.getScanCount() != -1;
};

NFCTag.prototype._isLocked = function() {
	return !this.isWritable();
};

NFCTag.prototype._makeReadOnly = function() {
	var tech = this._getTech('Ndef');
	if (!tech) {
		return;
	}
	
	try {
		tech.connect();
		tech.makeReadOnly();
		tech.close();
	} catch (error) {
		Ti.API.error('Error in NFCTag.prototype._makeReadOnly: ' + error);
	}
};

NFCTag.prototype._enableScanCounter = function() {
	var tech = this._getTech('MifareUltralight');
	if (!tech) {
		return;
	}
	
	var buffer = Ti.createBuffer({
		type: Ti.Codec.TYPE_BYTE,
		length: 6
	});
	buffer[0] = NFCTag.NXP.Command.WRITE;
	buffer[1] = NFCTag.NXP.Address.CONFIG_ONE;
	buffer[2] = parseInt('00010000', 2);
	buffer[3] = 0x00;
	buffer[4] = 0x00;
	buffer[5] = 0x00;
	
	
	try {
		tech.connect();
		tech.transceive(buffer);
		tech.close();
	} catch (error) {
		Ti.API.error('Error in NFCTag.prototype._enableScanCounter: ' + error);
	}
};

NFCTag.prototype._isScanCounterEnabled = function() {
	var tech = this._getTech('MifareUltralight');
	if (!tech) {
		return false;
	}
	
	var buffer = Ti.createBuffer({
		type: Ti.Codec.TYPE_BYTE,
		length: 2
	});
	buffer[0] = NFCTag.NXP.Command.READ;
	buffer[1] = NFCTag.NXP.Address.CONFIG_ONE;
	
	try {
		tech.connect();
		var data = tech.transceive(buffer);
		tech.close();

		return data[0] == parseInt('00010000', 2);
	} catch (error) {
		Ti.API.error('Error in NFCTag.prototype._isScanCounterEnabled: ' + error);
		return false;
	}
};

NFCTag.prototype._getTech = function(type) {
	if (this.tech === null && nfc) {
		var techList = this.tag.getTechList();
		var tech = {};
		for (var i = 0; i < techList.length; i++) {
			var techName = techList[i].split('.').pop();
			tech[techName] = nfc['createTagTechnology' + techName]({ tag: this.tag });
		}
		this.tech = tech;
	}
	return this.tech[type];
};

NFCTag.prototype._setData = function(data) {
	var tech = this._getTech('Ndef');
	if (!tech) {
		return;
	}
	
	try {
		tech.connect();
		
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
		tech.close();
		this.data = data;
	} catch (error) {
		Ti.API.error('Error in NFCTag.prototype._setData: ' + error);
	}
};

NFCTag.prototype._generateData = function() {
	var id = this.getId();
	var iv = this._generateInitializationVector();
	var data = JSON.stringify({
		serial: id,
		count: this.getScanCount()
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
