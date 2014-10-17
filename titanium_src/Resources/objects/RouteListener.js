/* jshint globalstrict:true */
'use strict';

var RouteLocation = require('objects/RouteLocation');
var Database = require('lib/Database');
var Utils = require('lib/Utils');
var Node = require('objects/Node');
var NFCEventDispatcher = require('services/NFCEventDispatcher');

var RouteListener = function(route) {
	this.nid = route.nid;
	this.node = null;
	this.status = route.status;
	this.title = route.title;
	this.locationNids = JSON.parse(route.locationNids);
	this.index = null;
	this.location = null;
	
	this.tagScannedCallback = null;
	this.nfcEventDispatcher = null;
	
	this._startRoute();
	this._initNFCEventDispatcher();
};

RouteListener.prototype._initNFCEventDispatcher = function() {
	if (Ti.App.isAndroid) {
		this.tagScannedCallback = this._handleTagScanned.bind(this);
		this.nfcEventDispatcher = new NFCEventDispatcher(Titanium.Android.currentActivity);
		this.nfcEventDispatcher.addNFCListener(this.tagScannedCallback);
	}
};

RouteListener.prototype._handleTagScanned = function(tag) {
	if (tag.getData() == this._getLocation().getData()) {
		this.nextLocationNode = null;
		this.nextLocationName = null;
		this.nextLocationIndex = null;
		this.nextLocationTagData = null;
		
		this._setIndex(this._getIndex() + 1);
		
		if (this._getIndex() == this.locationNids.length) {
			this._completeRoute();
		} else {
			alert(this._getLocation().getName());
		}
	}
};

RouteListener.prototype._getLocation = function() {
	if (this.location === null) {
		this.location = new RouteLocation(this.locationNids[this._getIndex()]);
	}
	return this.location;
};

RouteListener.prototype._getIndex = function() {
	if (this.index === null) {
		var routeProgress = Titanium.App.Properties.getObject('routeProgress', {});
		if (typeof routeProgress[this.nid] == 'undefined') {
			routeProgress[this.nid] = 0;
			Titanium.App.Properties.setObject('routeProgress', routeProgress);
		}
		this.index = routeProgress[this.nid];
	}
	return this.index;
};

RouteListener.prototype._setIndex = function(index) {
	if (this.index != index) {
		this.index = index;
		var routeProgress = Titanium.App.Properties.getObject('routeProgress', {});
		routeProgress[this.nid] = this.index;
		Titanium.App.Properties.setObject('routeProgress', routeProgress);
		this.location = new RouteLocation(this.locationNids[this.index]);
	}
};

RouteListener.prototype._startRoute = function() {
	if (this._getStatus() != 'started') {
		this._setStatus('started');
		this._setIndex(0);
	}
	alert(this._getLocation().getName());
};

RouteListener.prototype._completeRoute = function() {
	if (this._getStatus() != 'complete') {
		this._setStatus('complete');
		
		var dialog = Ti.UI.createAlertDialog({
	       title: 'Route completed.',
	       buttonNames: ['ok']
	    });
	    
	    dialog.show();
	}
};

RouteListener.prototype._setStatus = function(status) {
	var dbValue = status;
	var textValue = status.replace('_', ' ').replace(/\w\S*/g, function(word){
		return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
	});
	
	var node  = this._getNode();
	node.assignment_status = {
		dbValues: [dbValue],
		textValues: [textValue]
	};
	Node.save(node);
	this.status = status;
};

RouteListener.prototype._getStatus = function() {
	if (this.status === null) {
		this.status = this._getNode().assignment_status.dbValues[0];
	}
	return this.status;
};

RouteListener.prototype._getNode = function() {
	if (this.node === null) {
		this.node = Node.load(this.nid);
	}
	return this.node;
};

var instance = null;

exports.askToStartRoute = function() {
	var routes = getPossibleRoutes();
	if (routes.length == 0) {
		return;
	}
	
	var dialog = Ti.UI.createAlertDialog({
       title: 'Begin route now?',
       buttonNames: ['Begin route', 'No']
    });
    
    
    dialog.addEventListener('click', function(event) {
    	if (event.index == 0) {
    		askSelectRoute(routes);
    	}
    });
    
    dialog.show();
};

function askSelectRoute(routes) {
	if (routes.length == 1) {
		instance = new RouteListener(routes[0]);
	} else {
		
		var options = [];
		for (var i = 0; i < routes.length; i++) {
			options[i] = routes[i].title + (routes[i].status == 'started' ? ' (started)' : '');
		}
		
		var dialog = Ti.UI.createOptionDialog({
	       title: 'Select a route.',
	       options: options
	    });
	    
	    dialog.addEventListener('click', function(event) {
	    	instance = new RouteListener(routes[event.index]);
	    });
	    
		dialog.show();
	}
}

function getPossibleRoutes() {
	if (!hasRouteAssignment()) {
		return [];
	}
	
	var now = Utils.getUTCTimestampServerCorrected();
	var query = 'SELECT ' + 
					'route.nid AS nid, ' +
					'route_assignment.nid AS assignmentNid, ' +
					'name_0 AS title, ' +
					'locations as locationNids, ' +
					'assignment_status AS status ' +
				'FROM ' +
					'route_assignment INNER JOIN route ON route_assignment.route_reference = route.nid ' +
				'WHERE ' +
					'driver_1 = ' + Utils.getUid() + ' AND ' +
					'route_assignment.nid > 0 AND ' +
					'assignment_status != "complete" AND ' +
					'assignment_date < ' + now + ' AND ' +
					'(assignment_date___end IS NULL OR assignment_date___end > ' + now + ')';
	var result = Database.query(query);
	var data = Database.resultToObjectArray(result);
	result.close();
	Database.close();
	
	return data;
}

function hasRouteAssignment() {
	var result = Database.query('SELECT COUNT(*) FROM node WHERE nid > 0 AND table_name = "route_assignment"');
	var count = result.field(0);
	result.close();
	Database.close();
	return count !== 0;
}

function dbValueToTextValue(dbValue) {
	return dbValue.replace('_', ' ').replace(/\w\S*/g, function(word){
		return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
	});
}

exports.getInstance = function() {
	return instance;
};
