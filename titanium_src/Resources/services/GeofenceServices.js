/*jslint node:true */
'use strict';

var Utils = require('lib/Utils');

var GeofenceServices = function() {
	this.geofences = {};
	this.breached = {};
	this.currentLocation = {};
	
	var self = this;
	Ti.Geolocation.addEventListener('location', function(event) {
		self._handleLocationChange(event);
	});
	
	this._restoreState();
};

/* PUBLIC METHODS */

GeofenceServices.prototype.unregisterAllGeofences = function() {
	this.geofences = {};
};

GeofenceServices.prototype.unregisterGeofence = function(nid) {
	delete this.geofences[nid];
};

GeofenceServices.prototype.registerGeofence = function(geofence) {
	var nid = geofence.getNid();
	
	this.geofences[nid] = geofence;
	if (this.breached[nid]) {
		this.geofences[nid].restoreState(this.breached[nid]);
	}
};

GeofenceServices.prototype.getGeofence = function(nid) {
	return this.geofences[nid];
};

GeofenceServices.prototype.getCurrentLocation = function() {
	return this.currentLocation;
};

/* PIVATE METHODS */

GeofenceServices.prototype._handleLocationChange = function(event) {
	if (!event) {
		return;
	}
	this._updateCurrentLocation(event.coords.latitude, event.coords.longitude);
	this._updateBreached(event.coords.latitude, event.coords.longitude);
	this._saveState();
};

GeofenceServices.prototype._updateCurrentLocation = function(lat, lng) {
	this.currentLocation.lat = lat;
	this.currentLocation.lng = lng;
	this.currentLocation.timestamp = Utils.getUTCMillisServerCorrected();
};

GeofenceServices.prototype._updateBreached = function(lat, lng) {
	var nid;
	for (nid in this.geofences) {
		this.geofences[nid].changeUserLocation(lat, lng);
		if (this.geofences[nid].isBreached()) {
			this.breached[nid] = this.geofences[nid].getState();
		} else {
			delete this.breached[nid];
		}
	}
};

GeofenceServices.prototype._restoreState = function() {
	var state = JSON.parse(Ti.App.Properties.getString('GeofenceServices.state', '{}'));
	this.breached = state.breached || {};
	this.currentLocation = state.currentLocation || {};
};

GeofenceServices.prototype._saveState = function() {
	Ti.App.Properties.setString('GeofenceServices.state', JSON.stringify({
		currentLocation: this.currentLocation,
		breached: this.breached
	}));
};

var geofenceServices = new GeofenceServices();

exports.getInstance = function() {
	return geofenceServices;
};
