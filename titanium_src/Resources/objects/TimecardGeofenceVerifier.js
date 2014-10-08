/*jshint globalscrict:true */
'use strict';

var GeofenceServices = require('services/GeofenceServices');
var PointGeofence = require('objects/PointGeofence');
var Database = require('lib/Database');

var TimecardGeofenceVerifier = function() {
	this.verifyClockIn = null;
	this.verifyClockOut = null;
	this.userJson = null;
	this.geofences = null;
	this.currentGeofences = null;
	this.enabled = null;
	this.locationReferences = null;
	this.error = null;
	
	Ti.App.addEventListener('bundleUpdated', this._handleBundleUpdated.bind(this));
	Ti.App.addEventListener('loggingOut', this._handleLoggingOut.bind(this));
	Ti.Geolocation.addEventListener('location', this._handleLocationChanged.bind(this));
};

/* PUBLIC METHODS */

TimecardGeofenceVerifier.prototype.canClockIn = function() {
	if (!this._isEnabled() || !this._shouldVerifyClockIn()) {
		return true;
	}
	
	return this._isLocationFresh() && this._isLocationAuthorized();
};

TimecardGeofenceVerifier.prototype.canClockOut = function() {
	if (!this._isEnabled() || !this._shouldVerifyClockOut()) {
		return true;
	}
	
	return this._isLocationFresh() && this._isLocationAuthorized();
};

TimecardGeofenceVerifier.prototype.getCurrentGeofences = function() {
	if (this.currentGeofences === null) {
		var geofences = this._getGeofences();
		var currentLocation = GeofenceServices.getInstance().getCurrentLocation();
		this.currentGeofences = [];
		for (var i = 0; i < geofences.length; i++) {
			if (geofences[i].isInBounds(currentLocation.lat, currentLocation.lng)) {
				this.currentGeofences.push(geofences[i]);
			}
		}
	}
	return this.currentGeofences;
};

TimecardGeofenceVerifier.prototype.getError = function() {
	return this.error;
};

/* PRIVATE METHODS */

TimecardGeofenceVerifier.prototype._isLocationAuthorized = function() {
	if (this.getCurrentGeofences().length === 0) {
		this.error = 'You must be in an authorized location';
		return false;
	}
	return true;
};

TimecardGeofenceVerifier.prototype._isLocationFresh = function() {
	var timestamp = GeofenceServices.getInstance().getCurrentLocation().timestamp;
	var now = new Date().getTime();
	
	if (now - timestamp > 900000) { // 15 minutes
		this.error = 'Unable to determine current location. Please make sure GPS is turned on and has a good signal.';
		Ti.Geolocation.getCurrentPosition(function(){});
		return false;
	}
	return true;
};

TimecardGeofenceVerifier.prototype._handleLoggingOut = function(event) {
	this.verifyClockIn = null;
	this.verifyClockOut = null;
	this.userJson = null;
	this.geofences = null;
	this.currentGeofences = null;
	this.enabled = null;
	this.locationReferences = null;
	this.error = null;
};

TimecardGeofenceVerifier.prototype._handleBundleUpdated = function(event) {
	if (event.bundle == 'timecard') {
		var bundle = Omadi.data.getBundle('timecard');
		this.enabled = bundle.data.timecard.allow_geofence_verification == 1;
		if (JSON.stringify(bundle.data.locations) !== JSON.stringify(this._getLocationReferences())) {
			this.locationReferences = bundle.data.locations;
			this.currentGeofences = null;
			this.geofences = null;
		}
		
	}
};

TimecardGeofenceVerifier.prototype._handleLocationChanged = function() {
	this.currentGeofences = null;
};

TimecardGeofenceVerifier.prototype._isEnabled = function() {
	if (this.enabled === null) {
		var bundle = Omadi.data.getBundle('timecard');
		this.enabled = bundle.data.timecard.allow_geofence_verification == 1;
	}
	return this.enabled;
};

TimecardGeofenceVerifier.prototype._shouldVerifyClockIn = function() {
	if (this.verifyClockIn === null) {
		var userJson = this._getUserJson();
		this.verifyClockIn = userJson.timecard_require_geofence &&
				userJson.timecard_require_geofence.und &&
				userJson.timecard_require_geofence.und[0] &&
				userJson.timecard_require_geofence.und[0].value === '1';
	}
	return this.verifyClockIn;
};

TimecardGeofenceVerifier.prototype._shouldVerifyClockOut = function() {
	if (this.verifyClockOut === null) {
		this.verifyClockOut = this._shouldVerifyClockIn();
	}
	return this.verifyClockOut;
};

TimecardGeofenceVerifier.prototype._getUserJson = function() {
	if (this.userJson === null) {
		this.userJson = JSON.parse(Ti.App.Properties.getString('Omadi_session_details', '{user:{}}')).user;
	}
	return this.userJson;
};

TimecardGeofenceVerifier.prototype._getLocationReferences = function() {
	if (this.locationReferences === null) {
		var bundle = Omadi.data.getBundle('timecard');
		this.locationReferences = bundle.data.timecard.locations || [];
	}
	return this.locationReferences;
};

TimecardGeofenceVerifier.prototype._getGeofences = function() {
	if (this.geofences === null) {
		this.geofences = [];
		
		var locationReferences = this._getLocationReferences();
		for (var i = 0; i < locationReferences.length; i++) {
			
			var formType = locationReferences[i].node_type;
			var referenceField = locationReferences[i].reference_field;
			var addressField = locationReferences[i].location_field;
			var geofences = PointGeofence.newFromDB(formType, referenceField, addressField);
			this.geofences = this.geofences.concat(geofences);
		}
	}
	return this.geofences;
};

var timecardGeofenceVerifier = new TimecardGeofenceVerifier();

exports.getInstance = function() {
	return timecardGeofenceVerifier;
};
