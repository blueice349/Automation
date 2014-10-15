/*jslint node:true */
'use strict';

var GeofenceServices = require('services/GeofenceServices');
var PointGeofence = require('objects/PointGeofence');
var Node = require('objects/Node');
var Comment = require('objects/Comment');
var Utils = require('lib/Utils');
var Database = require('lib/Database');

var RDNGeofenceListener = function() {
	Ti.App.addEventListener('geofenceEntered', this._handleGeofenceEntered.bind(this));
	Ti.App.addEventListener('geofenceExited', this._handleGeofenceExited.bind(this));
};

/* CONSTANTS */

RDNGeofenceListener.UpdateType = {
	AGENT_GPS_UPDATE: 102
};

/* PUBLIC METHODS */

RDNGeofenceListener.prototype.createInitialGeofences = function() {
	var geofenceServices = GeofenceServices.getInstance();
	
	if (RDNGeofenceListener._hasRunsheets()) {
		var geofences = PointGeofence.newFromDB('runsheet', null, 'location');
		var i;
		for (i = 0; i < geofences.length; i++) {
			geofenceServices.registerGeofence(geofences[i]);
		}
	}
};

RDNGeofenceListener.prototype.addOrUpdateGeofence = function(nid, lat, lng) {
	if (!lat && !lng) {
		return;
	}
	
	var geofenceServices = GeofenceServices.getInstance();
	var existingGeofence = geofenceServices.getGeofence(nid);
	
	if (!existingGeofence || existingGeofence.getLat() != lat || existingGeofence.getLng() != lng) {
		var geofence = new PointGeofence(nid, lat, lng, RDNGeofenceListener.GEOFENCE_RADIUS_METERS);
		geofence.setProperty('formType', 'runsheet');
		geofenceServices.registerGeofence(geofence);
	}
};

RDNGeofenceListener.prototype.deleteGeofence = function(nid) {
	GeofenceServices.getInstance().unregisterGeofence(nid);
};

RDNGeofenceListener.prototype.addOrUpdateGeofences = function(data) {
	var i;
	for (i = 0; i < data.length; i++) {
		if (!data[i].__error) {
			this.addOrUpdateGeofence(data[i].nid, data[i].location___lat, data[i].location___lng);
		}
	}
};

RDNGeofenceListener.prototype.deleteGeofences = function(data) {
	var i;
	for (i = 0; i < data.length; i++) {
		if (!data[i].__error) {
			this.deleteGeofence(data[i].nid);
		}
	}
};

/* PRIVATE METHODS */

RDNGeofenceListener.prototype._handleGeofenceEntered = function(event) {
	if (event.geofence.getProperty('formType') === 'runsheet') {
		event.geofence.setProperty('timeEntered', Utils.getUTCMillisServerCorrected());
	}
};

RDNGeofenceListener.prototype._handleGeofenceExited = function(event) {
	if (event.geofence.getProperty('formType') === 'runsheet') {
		event.geofence.setProperty('timeExited', Utils.getUTCMillisServerCorrected());
		Comment.save(this._createRDNComment(event.geofence));
		Ti.App.fireEvent('sendComments');
	}
};

RDNGeofenceListener.prototype._createRDNComment = function(geofence) {
	var now = Utils.getUTCTimestampServerCorrected();
	var message = this._getRDNCommentMessage(geofence);
	
	return {
		created: now,
		changed: now,
		uid: Utils.getUid(),
		cid: Comment.getNewCommentCid(),
		nid: geofence.getNid(),
		comment_body: {
			dbValues: [message]
		},
		comment_update_type: {
			dbValues: [RDNGeofenceListener.UpdateType.AGENT_GPS_UPDATE]
		}
	};
};

RDNGeofenceListener.prototype._getRDNCommentMessage = function(geofence) {
	var enteredTime = new Date(geofence.getProperty('timeEntered'));
	var exitedTime = new Date(geofence.getProperty('timeExited'));
	
	var message = Utils.getRealname() + ' arrived at ' + enteredTime.format('g:i:s A') + ' on ' + enteredTime.format('j M Y');
	
	if (geofence.wasRestored()) {
		message += '.';
	} else {
		message += ' and left ' + Utils.formatApproximateDuration(enteredTime, exitedTime) + ' later.';
	}
	
	return message;
};

RDNGeofenceListener._hasRunsheets = function() {
	var result = Database.query("SELECT * FROM node WHERE table_name = 'runsheet'");
	var hasRunsheets = result.isValidRow();
	result.close();
	Database.close();
	return hasRunsheets;
};

var rdnGeofenceListener = new RDNGeofenceListener();

exports.getInstance = function() {
	return rdnGeofenceListener;
};
