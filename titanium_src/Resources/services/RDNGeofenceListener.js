/*jslint node:true */
'use strict';

var GeofenceServices = require('services/GeofenceServices');
var PointGeofence = require('objects/PointGeofence');
var Comment = require('objects/Comment');
var Node = require('objects/Node');
var Utils = require('lib/Utils');
var Database = require('lib/Database');

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

/* PUBLIC METHODS */

RDNGeofenceListener.prototype.createInitialGeofences = function() {
	var geofenceServices = GeofenceServices.getInstance();
	
	if (RDNGeofenceListener._hasRunsheets()) {
		var geofences = PointGeofence.newFromDB('runsheet', null, 'location');
		var i;
		for (i = 0; i < geofences.length; i++) {
			geofences[i].setProperty('formType', 'runsheet');
			geofenceServices.registerGeofence(geofences[i]);
		}
		geofenceServices.getNewLocation();
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
		geofenceServices.getNewLocation();
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
	var geofence = GeofenceServices.getInstance().getGeofence(event.geofenceNid);
	if (geofence && geofence.getProperty('formType') === 'runsheet') {
		var timestamp = Utils.getUTCMillisServerCorrected();
		var enteredTime = new Date(timestamp);
		var message = Utils.getRealname() + ' arrived at ' + enteredTime.format('g:i:s A') + ' on ' + enteredTime.format('j M Y');
		
		geofence.setProperty('timeEntered', timestamp);
		
		var saved = Comment.save(this._createRDNComment(message, geofence));
		var node = Node.load(event.geofenceNid);
		
		if (saved && node) {
			var dialog = Titanium.UI.createAlertDialog({
				title: 'RDN GPS Update Recorded',
				message: 'Arrived at "' + node.title + '"'
			});
			dialog.show();
		}
		
		Ti.App.fireEvent('sendComments');
	}
};

RDNGeofenceListener.prototype._handleGeofenceExited = function(event) {
	var geofence = GeofenceServices.getInstance().getGeofence(event.geofenceNid);
	if (geofence && geofence.getProperty('formType') === 'runsheet') {
		var timestamp = Utils.getUTCMillisServerCorrected();
		var exitedTime = new Date(timestamp);
		var message = Utils.getRealname() + ' left at ' + exitedTime.format('g:i:s A') + ' on ' + exitedTime.format('j M Y');
		
		geofence.setProperty('timeExited', timestamp);
		
		Comment.save(this._createRDNComment(message, geofence));
		Ti.App.fireEvent('sendComments');
	}
};

RDNGeofenceListener.prototype._createRDNComment = function(message, geofence) {
	var now = Utils.getUTCTimestampServerCorrected();
	
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
