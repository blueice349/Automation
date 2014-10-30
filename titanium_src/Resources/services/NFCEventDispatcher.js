/* jshint globalstrict:true */
'use strict';

var NFCTag = require('objects/NFCTag');

if (Ti.Platform.name === 'android') { var nfc = require('ti.nfc'); }

var NFCEventDispatcher = function(activity) {
	this.adapter = null;
	this.listeners = [];
	this.activity = activity;
	
	this._initListeners();
};

/* PUBLIC METHODS */

NFCEventDispatcher.prototype.addNFCListener = function(listener) {
	this.listeners.push(listener);
};

NFCEventDispatcher.prototype.removeNFCListener = function(listener) {
	var listeners = [];
	
	for (var i = 0; i < this.listeners.length; i++) {
		if (this.listeners[i] != listener) {
			listeners.push(this.listeners[i]);
		}
	}
	
	this.listeners = listeners;
};

/* PIVATE METHODS */

NFCEventDispatcher.prototype._getActivity = function() {
	return this.activity;
};

NFCEventDispatcher.prototype._getAdapter = function() {
	if (!this.adapter && nfc) {
		this.adapter = nfc.createNfcAdapter({
			onNdefDiscovered: this._handleTagDiscovered.bind(this),
			onTagDiscovered: this._handleTagDiscovered.bind(this),
			onTechDiscovered: this._handleTagDiscovered.bind(this)
		});
	}
	return this.adapter;
};

NFCEventDispatcher.prototype._getFilter = function() {
	if (!this.filter && nfc) {
		this.filter = nfc.createNfcForegroundDispatchFilter({
			intentFilters: [
				{ action: nfc.ACTION_TAG_DISCOVERED }
			]
		});
	}
	return this.filter;
};

NFCEventDispatcher.prototype._handleTagDiscovered = function(event) {
	var tag = new NFCTag(event.tag);
	for (var i = 0; i < this.listeners.length; i++) {
		this.listeners[i](tag);
	}
};

NFCEventDispatcher.prototype._initListeners = function() {
	var activity = this._getActivity();
	var adapter = this._getAdapter();
	var filter = this._getFilter();
	
	if (!activity || !adapter || !filter) {
		return;
	}
	
	activity.addEventListener('newintent', function(e) {
	    adapter.onNewIntent(e.intent);
	});
	activity.addEventListener('resume', function() {
		adapter.enableForegroundDispatch(filter);
	});
	activity.addEventListener('pause', function() {
		adapter.disableForegroundDispatch();
	});
};

module.exports = NFCEventDispatcher;