/* jshint globalstrict:true */
'use strict';

var NFC = require('services/NFC');
var NFCEventDispatcher = require('services/NFCEventDispatcher');
var RouteListener = require('objects/RouteListener');
var Database = require('lib/Database');
var Utils = require('lib/Utils');

Ti.include('/lib/vendor/CryptoJS/hmac-sha1.js');

var NFCListener = function(activity) {
	this.nfc = null;
	this.tagScannedCallback = null;
	this.activity = activity;
	
	this._initListeners();
};

NFCListener.ENCRYPTION_KEY = CryptoJS.enc.Utf8.parse('OYDnEbi5GXUGj1NqsrHTNfqQFtCIg1YQ');

/* PRIVATE METHODS */

NFCListener.prototype._initListeners = function() {
	this._initNFCEventDispatcher();
};

NFCListener.prototype._initNFCEventDispatcher = function() {
	if (Ti.App.isAndroid) {
		var self = this;
		this.tagScannedCallback = function(tag) {
			self._handleTagScanned(tag);
		};
		this.nfc = new NFCEventDispatcher(this.activity);
		this.nfc.addNFCListener(this.tagScannedCallback);
	}
};

NFCListener.prototype._handleTagScanned = function(tag) {
	if (!tag.isValidOmadiTag()) {
		tag.playErrorFeedback();
		return false;
	}
	
	var validTags = this._getValidTags();
	if (validTags[tag.getData()]) {
		tag.playSuccessFeedback();
		
		var routes = this._getRoutes(validTags[tag.getData()].nid);
		
		if (routes.length == 0) {
			NFC.sendScan(tag);
			return;
		}
		
		if (routes.length == 1) {
			RouteListener.startRoute(routes[0], tag);
			return;
		}
    		
		var startedRoutes = this._getStartedRoutes(routes);
		if (startedRoutes.length == 1) {
			RouteListener.startRoute(startedRoutes[0], tag);
			return;
		}
		
		RouteListener.askSelectRoute(routes, function(event) {
			if (routes[event.index]) {
				RouteListener.startRoute(routes[event.index], tag);
	    	} else {
	    		NFC.sendScan(tag);
	    	}
		});
	} else {
		alert('There was an error reading the NFC tag. It may not be a valid Omadi tag.');
		tag.playErrorFeedback();
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

NFCListener.prototype._getRoutes = function(nid) {
	var possibleRoutes = RouteListener.getPossibleRoutes();
	
	var routes = [];
	for (var i = 0; i < possibleRoutes.length; i++) {
		if (possibleRoutes[i].locationNids) {
			var locationNids = JSON.parse(possibleRoutes[i].locationNids);
			
			for (var j = 0; j < locationNids.length; j++) {
				if (locationNids[j] == nid) {
					routes.push(possibleRoutes[i]);
				}
			}
		}
	}
	return routes;
};

NFCListener.prototype._getStartedRoutes = function(routes) {
	var started = [];
	for (var i = 0; i < routes.length; i++) {
		if (routes[i].status == RouteListener.Status.STARTED) {
			started.push(routes[i]);
		}
	}
	return started;
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

module.exports = NFCListener;

