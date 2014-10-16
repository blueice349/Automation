/*jslint node:true */
'use strict';

var Geofence = require('objects/Geofence');
var Utils = require('lib/Utils');
var Database = require('lib/Database');
var Node = require('objects/Node');

Function.prototype.inheritsFrom = function(parent) {
	var child = this;
	child.prototype = Object.create(parent.prototype);
	child.prototype.constructor = child;
	child.prototype.parent = parent.prototype;
	return child;
};

var PointGeofence = function(nid, lat, lng, radiusInMeters) {
	this.parent.constructor.call(this, nid);
	
	this.data = null;
	this.radius = null;
	this.addressField = null;
	this.lat = null;
	this.lng = null;
	this.minLat = null;
	this.maxLat = null;
	this.radiusLat = null;
	this.minLng = null;
	this.maxLng = null;
	this.radiusLng = null;
	
	lat = lat || this._getData().lat;
	lng = lng || this._getData().lng;
	radiusInMeters = radiusInMeters || this._getRadius();
	
	this.lat = parseFloat(lat);
	this.lng = parseFloat(lng);
	
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

PointGeofence.prototype.isInBounds = function(lat, lng) {
	if (lat > this.minLat && lat < this.maxLat && lng > this.minLng && lng < this.maxLng) {
		return Math.pow(lat - this.lat, 2) / Math.pow(this.radiusLat, 2) + Math.pow(lng - this.lng, 2) / Math.pow(this.radiusLng, 2) <= 1;
	}
	return false;
};

/* PRIVATE METHODS */

PointGeofence.prototype._getData = function() {
	if (this.data === null) {
		this.data = PointGeofence._getDataFromDB(this._getFormType(), this._getAddressField(), [this.nid]);
	}
	return this.data;
};
PointGeofence.prototype._getRadius = function() {
	if (this.radius === null) {
		this.radius = PointGeofence._getRadius(this._getFormType(), this._getAddressField());
	}
	return this.radius;
};

PointGeofence.prototype._getAddressField = function() {
	if (this.addressField === null) {
		this.addressField = PointGeofence._getAddressField(this._getFormType());
	}
	return this.addressField;
};

PointGeofence.prototype._getFormType = function() {
	if (this.formType === null) {
		this.formType = PointGeofence._getFormType(this.nid);
	}
	return this.formType;
};

PointGeofence.prototype._calculateBoundingBox = function(lat, lng, radiusInMeters) {
	var key = Math.abs(Math.floor(lat / 5) * 5).toFixed();
	
	var latDelta = Geofence.DEGREES_LATITUDE_PER_METER[key] * radiusInMeters;
	var lngDelta = Geofence.DEGREES_LONGITUDE_PER_METER[key] * radiusInMeters;
    
    try{
        this.minLat = parseFloat((lat - latDelta).toFixed(6));
        this.maxLat = parseFloat((lat + latDelta).toFixed(6));
        this.radiusLat = (this.maxLat - this.minLat) / 2;
        this.minLng = parseFloat((lng - lngDelta).toFixed(6));
        this.maxLng = parseFloat((lng + lngDelta).toFixed(6));
        this.radiusLng = (this.maxLng - this.minLng) / 2;
        
        
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

PointGeofence.newFromDB = function(formType, referenceField, addressField) {
	var geofences = [];
	try {
		var data, radius, type;
		if (!referenceField) {
			data = PointGeofence._getDataFromDB(formType, addressField);
			radius = PointGeofence._getRadius(formType, addressField);
			type = formType;
		} else {
			data = [];
			var nids = PointGeofence._getReferenceNids(formType, referenceField);
			if (nids.length != 0) {
				var referenceFormType = PointGeofence._getFormType(nids[0]);
				data = PointGeofence._getDataFromDB(referenceFormType, addressField, nids);
				radius = PointGeofence._getRadius(referenceFormType, addressField);
				type = referenceFormType;
			}
		}
		for (var i = 0; i < data.length; i++) {
			geofences.push(new PointGeofence(data[i].nid, data[i].lat, data[i].lng, radius));
		}
	} catch(error) {
		Ti.API.error('Error in PointGeofence.newFromDB: ' + error);
	}
	
	return geofences;
};

/* PRIVATE STATIC METHODS */

PointGeofence._radiusCache = {};
PointGeofence._getRadius = function(formType, addressField) {
	if (!PointGeofence._radiusCache[formType]) {
		PointGeofence._radiusCache[formType] = {};
	}
	
	if (!PointGeofence._radiusCache[formType][addressField]) {
		var fields = Node.getFields(formType);
		if (fields &&
			fields[addressField] &&
			fields[addressField].settings &&
			fields[addressField].settings.geofence &&
			fields[addressField].settings.geofence.temp_geofence_radius) {
			PointGeofence._radiusCache[formType][addressField] = fields[addressField].settings.geofence.temp_geofence_radius;
		} else {
			PointGeofence._radiusCache[formType][addressField] = 201;
		}
	}
	return PointGeofence._radiusCache[formType][addressField];
};

PointGeofence._getReferenceNids = function(formType, referenceField) {
	var referenceNids = [];
	try {
		var result = Database.query('SELECT ' + referenceField + ' FROM ' + formType + ' WHERE ' + referenceField + ' IS NOT NULL AND nid > 0');
		while (result.isValidRow()) {
			var nids = Utils.getParsedJSON(result.fieldByName(referenceField));
			if (!Utils.isArray(nids)) {
				nids = [nids];
			}
			for (var i = 0; i < nids.length; i++) {
				referenceNids.push(parseInt(nids[i], 10));
			}
			result.next();
		}
		result.close();
		Database.close();
	} catch (error) {
		Utils.sendErrorReport('Error in PointGeofence._getReferenceNids: ' + error);
	}
	return referenceNids;
};

PointGeofence._formTypeCache = {};
PointGeofence._getFormType = function(nid) {
	if (!PointGeofence._formTypeCache[nid]) {
		try {
			var result = Database.query('SELECT table_name FROM node WHERE nid = ' + nid);
			if (result.isValidRow()) {
				PointGeofence._formTypeCache[nid] = result.fieldByName('table_name');
			}
			result.close();
			Database.close();
		} catch (error) {
			Utils.sendErrorReport('Error in PointGeofence._getFromType: ' + error);
		}
	}
	return PointGeofence._formTypeCache[nid];
};

PointGeofence._getDataFromDB = function(formType, addressField, nids) {
	var data = [];
	
	try {
		var query = 'SELECT nid, ' + addressField + '___lat as lat, ' + addressField + '___lng as lng FROM ' + formType + ' WHERE lat IS NOT NULL AND lng IS NOT NULL';
		if (nids) {
			query += ' AND nid IN (' + nids.join(', ') + ')';
		}
		var result = Database.query(query);
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
	} catch (error) {
		Utils.sendErrorReport('Error in PointGeofence._getDataFromDB: ' + error);
	}
		
	return data;
};

PointGeofence._getAddressField = function(formType) {
	return Node.getBundle(formType).mobile.location_sort_field || 'location';
};

module.exports = PointGeofence;