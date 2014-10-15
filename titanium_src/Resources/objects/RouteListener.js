/* jshint globalstrict:true */
'use strict';

var RouteLocation = require('objects/RouteLocation');
var Database = require('lib/Database');
var Utils = require('lib/Utils');

var RouteListener = function(route) {
	this.nid = route.id;
	this.locationNids = JSON.parse(route.locations);
	this.locations = [];
	this.currentLocationIndex = 0;
};

RouteListener.prototype._getLocations = function() {
	if (this.locations === null) {
		this.locations = [];
		for (var i = 0; i < this.locationNids.length; i++) {
			this.locations.push(new RouteLocation(this.locationNids[i]));
		}
	}
	return this.locations;
};

var instance = null;

exports.askToStartRoute = function() {
	var routes = exports.getPossibleRoutes();
	if (routes.length == 0) {
		return;
	}
	
	var askBeginDialog = Ti.UI.createAlertDialog({
       title: 'Begin route now?',
       buttonNames: ['Begin route', 'No']
    });
    
    var options = [];
    for (var i = 0; i < routes.length; i++) {
    	options[i] = routes[i].name;
    }
    
    askBeginDialog.addEventListener('click', function(event) {
    	if (event.index == 0) {
    		if (routes.length == 1) {
    			instance = new RouteListener(routes[0]);
    		} else {
    			var selectRouteDialog = Ti.UI.createOptionDialog({
			       title: 'Select a route.',
			       options: options
			    });
			    
			    selectRouteDialog.addEventListener('click', function(event) {
			    	instance = new RouteListener(routes[event.index]);
			    });
			    
    			selectRouteDialog.show();
    		}
    	}
    });
    
    askBeginDialog.show();
};

exports.getPossibleRoutes = function() {
	
	var now = Utils.getUTCTimestampServerCorrected();
	
	var query = 'SELECT ' + 
					'route.nid AS nid, ' +
					'name_0 AS name, ' +
					'locations, ' +
					'category, ' + 
					'approximate_route_duration AS duration, ' +
					'route.description AS description ' +
				'FROM ' +
					'route_assignment INNER JOIN route ON route_assignment.route_reference = route.nid ' +
				'WHERE ' +
					'driver_1 = ' + Utils.getUid() + ' AND ' +
					'route_assignment.nid > 0 AND ' +
					'assignment_status = "not_started" AND ' +
					'assignment_date < ' + now + ' AND ' +
					'(assignment_date___end IS NULL OR assignment_date___end > ' + now + ')';
	
	console.log(query);
	var result = Database.query(query);
	var data = Database.resultToObject(result);
	result.close();
	Database.close();
	
	return data;
};

exports.getInstance = function() {
	return instance;
};
