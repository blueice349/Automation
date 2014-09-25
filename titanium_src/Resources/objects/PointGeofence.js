/*jslint node:true */
/*global Omadi */
'use strict';

var Geofence = require('objects/Geofence');
var Utils = require('lib/Utils');
var Database = require('lib/Database');

Function.prototype.inheritsFrom = function(parent) {
	var child = this;
	child.prototype = Object.create(parent.prototype);
	child.prototype.constructor = child;
	child.prototype.parent = parent.prototype;
	return child;
};

var PointGeofence = function(nid, formType, lat, lng, radiusInMeters) {
	
	this.parent.constructor.call(this, nid, formType);
	
	this.lat = parseFloat(lat);
	this.lng = parseFloat(lng);
	
	this.minLat = null;
	this.maxLat = null;
	this.minLng = null;
	this.maxLng = null;
	
	this._calculateBoundingBox(this.lat, this.lng, radiusInMeters);
};
PointGeofence.inheritsFrom(Geofence);

/* PUBLIC METHODS */

PointGeofence.prototype.getLat = function() {
	return this.lat;
};

PointGeofence.prototype.getLng = function() {
	return this.lng;
};

/* PRIVATE METHODS */

PointGeofence.prototype._isInBounds = function(lat, lng) {
	return lat > this.minLat && lat < this.maxLat && lng > this.minLng && lng < this.maxLng;
};

PointGeofence.prototype._calculateBoundingBox = function(lat, lng, radiusInMeters) {
	var key = Math.abs(Math.floor(lat / 5) * 5).toFixed();
	
	var latDelta = Geofence.DEGREES_LATITUDE_PER_METER[key] * radiusInMeters;
	var lngDelta = Geofence.DEGREES_LONGITUDE_PER_METER[key] * radiusInMeters;
    
    try{
        this.minLat = parseFloat((lat - latDelta).toFixed(6));
        this.maxLat = parseFloat((lat + latDelta).toFixed(6));
        this.minLng = parseFloat((lng - lngDelta).toFixed(6));
        this.maxLng = parseFloat((lng + lngDelta).toFixed(6));
    }
    catch(ex){
        this.minLat = null;
        this.maxLat = null;
        this.minLng = null;
        this.maxLng = null;
        Utils.sendErrorReport('Failed to create bounding box. ex: ' + ex + ', key: ' + key + ', lat: ' + lat + ', lng: ' + lng + ', latDelta: ' + latDelta + ', lngDelta: ' + lngDelta);   
    }
};

/* PUBLIC STATIC METHODS */

PointGeofence.newFromDB = function(formType, addressField, radiusInMeters) {
	var data = [], geofences = [];
	try {
		if (this._hasRunsheets()) {
			data = PointGeofence._getDataFromDB(formType, addressField);
			
			var i;
			for (i = 0; i < data.length; i++) {
				geofences.push(new PointGeofence(data[i].nid, formType, data[i].lat, data[i].lng, radiusInMeters));
			}
		}
	} catch(error) {
		Ti.API.error('Error in PointGeofence.newFromDB: ' + error);
	}
	
	return geofences;
};

/* PRIVATE STATIC METHODS */

PointGeofence._getDataFromDB = function(formType, addressField) {
	var result = Database.query("SELECT nid, " + addressField + "___lat as lat, " + addressField + "___lng as lng FROM " + formType + " WHERE lat IS NOT NULL AND lng IS NOT NULL");
	
	var data = [];
	
	while (result.isValidRow()) {
		var row = {
			nid: result.fieldByName('nid'),
			lat: parseFloat(result.fieldByName('lat')),
			lng: parseFloat(result.fieldByName('lng'))
		};
		
		if (row.lat || row.lng) {
			data.push(row);
		}
		
		result.next();
	}
	
	result.close();
	Database.close();
	
	return data;
};

PointGeofence._hasRunsheets = function() {
	var result = Database.query("SELECT * FROM node WHERE table_name = 'runsheet'");
	return result.isValidRow();
};

module.exports = PointGeofence;