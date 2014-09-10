/*jslint node:true */
'use strict';

var Geofence = function(nid, formType) {
	this.breached = false;
	this.timeEntered = null;
	this.timeExited = null;
	this.nid = nid;
	this.formType = formType;
	this.restored = false;
};

/* PUBLIC METHODS */

Geofence.prototype.setBreached = function(breached) {
	if (this.breached != breached) {
		this.breached = breached;
		
		if (this.breached) {
			this.timeEntered = new Date().getTime();
		} else {
			this.timeExited = new Date().getTime();
		}
		
		var eventData = {
			nid: this.nid,
			formType: this.formType,
			restored: this.restored
		};
		
		if (breached) {
			Ti.App.fireEvent('geofenceEntered', eventData);
		} else {
			Ti.App.fireEvent('geofenceExited', eventData);
		}
	}
};

Geofence.prototype.getNid = function() {
	return this.nid;
};

Geofence.prototype.getBreached = function() {
	return this.breached;
};

Geofence.prototype.getTimeEntered = function() {
	return this.timeEntered;
};

Geofence.prototype.getTimeExited = function() {
	return this.timeExited;
};

Geofence.prototype.getState = function() {
	return {
		breached: this.breached,
		timeEntered: this.timeEntered
	};
};

Geofence.prototype.changeUserLocation = function(lat, lng) {
	this.setBreached(this._isInBounds(lat, lng));
	this.restored = false;
};

Geofence.prototype.restoreState = function(state) {
	this.breached = state.breached;
	this.timeEntered = state.timeEntered;
	this.restored = true;
};

/* PRIVATE METHODS */

Geofence.prototype._isInBounds = function(lat, lng) {
	throw new Error('NotImplementedError: Geofence._isInBounds');
};



Geofence.DEGREES_LATITUDE_PER_METER = {
	'0':  0.000009043695025814084,
	'5':  0.000009043005244579906,
	'10': 0.000009040956962941297,
	'15': 0.000009037612714669937,
	'20': 0.000009033074569310463,
	'25': 0.000009027480975877180,
	'30': 0.000009021002488706951,
	'35': 0.000009013836513456284,
	'40': 0.000009006201241523490,
	'45': 0.000008998328965319496,
	'50': 0.000008990458984134339,
	'55': 0.000008982830320502553,
	'60': 0.000008975674469922380,
	'65': 0.000008969208402773408,
	'70': 0.000008963628026782607,
	'75': 0.000008959102302068213,
	'80': 0.000008955768179423095,
	'85': 0.000008953726506925966
};

Geofence.DEGREES_LONGITUDE_PER_METER = {
	'0':  0.000008983155487515938,
	'5':  0.000009017240418297760,
	'10': 0.000009120814492856548,
	'15': 0.000009297961542682454,
	'20': 0.000009555930818896347,
	'25': 0.000009905888393584438,
	'30': 0.000010364171323085090,
	'35': 0.000010954325780547262,
	'40': 0.000011710448468975656,
	'45': 0.000012682821971791810,
	'50': 0.000013947832792746970,
	'55': 0.000015626439566191245,
	'60': 0.000017921153697925226,
	'65': 0.000021197438420499405,
	'70': 0.000026187247928521373,
	'75': 0.000034599689674726130,
	'80': 0.000051563729317812810,
	'85': 0.000102727219992789390
};

module.exports = Geofence;