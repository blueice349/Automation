/*jslint node:true */
'use strict';

var PointGeofence = require('objects/PointGeofence');

var GeofenceServices = function() {
	this.geofences = {};
	this.breached = {};
	this.currentLocation = {};
	
	var self = this;
	Ti.App.addEventListener('locationChanged', function(event) {
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

/* PIVATE METHODS */

GeofenceServices.prototype._handleLocationChange = function(event) {
	this._updateCurrentLocation(event.lat, event.lng);
	this._updateBreached(event.lat, event.lng);
	this._saveState();
};

GeofenceServices.prototype._updateCurrentLocation = function(lat, lng) {
	this.currentLocaiton.lat = lat;
	this.currentLocaiton.lng = lng;
	this.currentLocaiton.timestamp = new Date().getTime();
};

GeofenceServices.prototype._updateBreached = function(lat, lng) {
	var nid;
	for (nid in this.geofences) {
		this.geofences[nid].changeUserLocation(lat, lng);
		if (this.geofences[nid].getBreached()) {
			this.breached[nid] = this.geofences[nid].getState();
		} else {
			delete this.breached[nid];
		}
	}
};

GeofenceServices.prototype._restoreState = function() {
	var state = JSON.parse(Ti.App.Properties.getString('GeofenceServices.state', '{}'));
	this.breached = state.breached || {};
	this.currentLocaiton = state.currentLocation || {};
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