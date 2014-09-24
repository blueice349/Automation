/*jslint node:true */
'use strict';

var Utils = require('lib/Utils');
var NFCTag = require('objects/NFCTag');

if (Ti.App.isAndroid) {
	var nfc = require('ti.nfc');
}

var NFCListener = function(activity) {
	this.adapter = null;
	this.callbacks = [];
	this.activity = activity;
	
	this._initListeners();
};

NFCListener.instances = [];
NFCListener.NULL_CALLBACK = function() {};
NFCListener.PRIVATE_KEY = 'OYDnEbi5GXUGj1NqsrHTNfqQFtCIg1YQ';

/* PUBLIC METHODS */

NFCListener.prototype.addCallback = function(callback) {
	if (typeof callback == 'function' && !this._containsCallback(callback)) {
		this.callbacks.push(callback);
	}
};

NFCListener.prototype.removeCallback = function(callback) {
	var callbacks = [];
	
	for (var i = 0; i < this.callbacks.length; i++) {
		if (this.callbacks[i] != callback) {
			callbacks.push(this.callbacks[i]);
		}
	}
	
	this.callbacks = callbacks;
};

NFCListener.prototype.getActivity = function() {
	return this.activity;
};

/* PIVATE METHODS */

NFCListener.prototype._containsCallback = function(callback) {
	var found = false;
	for (var i = 0; i < this.callbacks.length; i++) {
		found = found || (this.callbacks[i] == callback);
	}
	return found;
};

NFCListener.prototype._getAdapter = function() {
	if (!this.adapter && nfc) {
		this.adapter = nfc.createNfcAdapter({
			onNdefDiscovered: this._handleTagDiscovered.bind(this),
			onTagDiscovered: this._handleTagDiscovered.bind(this),
			onTechDiscovered: this._handleTagDiscovered.bind(this)
		});
	}
	return this.adapter;
};

NFCListener.prototype._getFilter = function() {
	if (!this.filter && nfc) {
		this.filter = nfc.createNfcForegroundDispatchFilter({
			intentFilters: [
				{ action: nfc.ACTION_TAG_DISCOVERED }
			]
		});
	}
	return this.filter;
};

NFCListener.prototype._initListeners = function() {
	var activity = this.getActivity();
	var adapter = this._getAdapter();
	var filter = this._getFilter();
	
	if (!activity || !adapter || !filter) {
		return;
	}
	
	activity.addEventListener('newintent', function(e) {
	    adapter.onNewIntent(e.intent);
	});
	activity.addEventListener('resume', function(e) {
		adapter.enableForegroundDispatch(filter);
	});
	activity.addEventListener('pause', function(e) {
		adapter.disableForegroundDispatch();
	});
};

NFCListener.prototype._handleTagDiscovered = function(event) {
	var tag = new NFCTag(event.tag);
	for (var i = 0; i < this.callbacks.length; i++) {
		this.callbacks[i](tag);
	}
};

module.exports = NFCListener;