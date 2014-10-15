/* jshint globalstrict:true */
'use strict';

var Geofence = require('objects/Geofence');

var RouteLocation = function(nid) {
	this.nid = nid;
	this.geofence = null;
	this.nfc = null;
	this.description = null;
	this.status = null;
};

RouteLocation.prototype.getGeofence = function() {
	if (this.geofence === null) {
		this.geofence = new PointGeofence(this.nid);
	}
	return this.geofence;
};

module.exports = RouteLocation;