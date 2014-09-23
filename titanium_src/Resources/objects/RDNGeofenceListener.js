/*jslint node:true */
'use strict';

var GeofenceServices = require('services/GeofenceServices');
var PointGeofence = require('objects/PointGeofence');
var Node = require('objects/Node');
var Comment = require('objects/Comment');
var Utils = require('lib/Utils');

var RDNGeofenceListener = function() {
	var self = this;
	Ti.App.addEventListener('geofenceEntered', function(event) {
		self._handleGeofenceEntered(event);
	});
	Ti.App.addEventListener('geofenceExited', function(event) {
		self._handleGeofenceExited(event);
	});
};

/* CONSTANTS */

RDNGeofenceListener.UpdateType = {
	AGENT_GPS_UPDATE: 102
};

RDNGeofenceListener.GEOFENCE_RADIUS_METERS = 200;

/* PUBLIC METHODS */

RDNGeofenceListener.prototype.createInitialGeofences = function() {
	var geofenceServices = GeofenceServices.getInstance();
	
	var geofences = PointGeofence.newFromDB('runsheet', 'location', RDNGeofenceListener.GEOFENCE_RADIUS_METERS);
	var i;
	for (i = 0; i < geofences.length; i++) {
		geofenceServices.registerGeofence(geofences[i]);
	}
};

RDNGeofenceListener.prototype.addOrUpdateGeofence = function(nid, lat, lng) {
	if (!lat && !lng) {
		return;
	}
	
	var geofenceServices = GeofenceServices.getInstance();
	var existingGeofence = geofenceServices.getGeofence(nid);
	
	if (!existingGeofence || existingGeofence.getLat() != lat || existingGeofence.getLng() != lng) {
		var geofence = new PointGeofence(nid, 'runsheet', lat, lng, RDNGeofenceListener.GEOFENCE_RADIUS_METERS);
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
	Ti.API.info('Entered ' + event.formType + ' ' + event.nid);
};

RDNGeofenceListener.prototype._handleGeofenceExited = function(event) {
	Ti.API.info('Exited ' + event.formType + ' ' + event.nid);
	
	Comment.save(this._createRDNComment(event.nid, event.restored));
	Ti.App.fireEvent('sendComments');
};

RDNGeofenceListener.prototype._createRDNComment = function(nid, restored) {
	var now = Utils.getUTCTimestampServerCorrected();
	var message = this._getRDNCommentMessage(nid, restored);
	
	return {
		created: now,
		changed: now,
		uid: Utils.getUid(),
		cid: Comment.getNewCommentCid(),
		nid: nid,
		comment_body: {
			dbValues: [message]
		},
		comment_update_type: {
			dbValues: [RDNGeofenceListener.UpdateType.AGENT_GPS_UPDATE]
		}
	};
};

RDNGeofenceListener.prototype._getRDNCommentMessage = function(nid, restored) {
	var geofence = GeofenceServices.getInstance().getGeofence(nid);
	var enteredTime = new Date(geofence.getTimeEntered());
	var exitedTime = new Date(geofence.getTimeExited());
	
	var message = Utils.getRealname() + ' arrived at ' + enteredTime.format('g:i:s A') + ' on ' + enteredTime.format('j M Y');
	
	if (restored) {
		message += '.';
	} else {
		message += ' and left ' + Utils.formatApproximateDuration(enteredTime, exitedTime) + ' later.';
	}
	
	return message;
};

var rdnGeofenceListener = new RDNGeofenceListener();

exports.getInstance = function() {
	return rdnGeofenceListener;
};
