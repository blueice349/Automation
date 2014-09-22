/*jslint node:true */
'use strict';

var Utils = require('lib/Utils');
var NFCTag = require('objects/NFCTag');
var nfc = require('ti.nfc');

var	act = Ti.Android.currentActivity;

var NFCListener = function() {
	this.adapter = null;
	
	this._initListeners();
};

NFCListener.PRIVATE_KEY = 'OYDnEbi5GXUGj1NqsrHTNfqQFtCIg1YQ';

/* PIVATE METHODS */

NFCListener.prototype._getAdapter = function() {
	if (!this.adapter) {
		this.adapter = nfc.createNfcAdapter({
			onNdefDiscovered: this._handleTagDiscovered,
			onTagDiscovered: this._handleTagDiscovered,
			onTechDiscovered: this._handleTagDiscovered
		});
	}
	return this.adapter;
};

NFCListener.prototype._getFilter = function() {
	if (!this.filter) {
		this.filter = nfc.createNfcForegroundDispatchFilter({
			intentFilters: [
				{ action: nfc.ACTION_TAG_DISCOVERED }
			]
		});
	}
	return this.filter;
};

NFCListener.prototype._initListeners = function() {
	var activity = Ti.Android.currentActivity;
	this._getAdapter().enableForegroundDispatch(this._getFilter());
	
	var self = this;
	activity.addEventListener('newintent', function(e) {
	    self._getAdapter().onNewIntent(e.intent);
	});
	activity.addEventListener('resume', function(e) {
		self._getAdapter().enableForegroundDispatch(self._getFilter());
	});
	activity.addEventListener('pause', function(e) {
		self._getAdapter().disableForegroundDispatch();
	});
};

NFCListener.prototype._handleTagDiscovered = function(event) {
	var tag = new NFCTag(event.tag);

	if (tag.isValidOmadiTag()) {
		alert(tag.getData());	
	}
};

module.exports = NFCListener;