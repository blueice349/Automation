/* jshint globalstrict:true */
'use strict';

var Database = require('lib/Database');
var Display = require('lib/Display');
var Utils = require('lib/Utils');

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

exports.Status = {
	NOT_STARTED: 'not_started',
	STARTED: 'started',
	FINISHED: 'finished'
};


exports.Repeat = {
	INFINITE: 0
};

exports.getRoute = function(nid) {
	var routes = getPossibleRoutes();
	
	for (var i = 0; i < routes.length; i++) {
		if (routes[i].nid == nid) {
			return routes[i];
		}
	}
	
	return null;
};

exports.startRoute = function(route) {
	var win = Titanium.UI.createWindow({
        navBarHidden : true,
        route: route,
        url : '/main_windows/routeListener.js',
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
    });
    
    Display.loading();
    win.addEventListener('open', Display.doneLoading);
    win.open();
};

exports.hasRoutes = function() {
	if (!hasRouteAssignment()) {
		return false;
	}
	
	var now = Utils.getUTCTimestampServerCorrected();
	var query = 'SELECT ' + 
					'COUNT(*) ' +
				'FROM ' +
					'route_assignment ' +
				'WHERE ' +
					'driver_1 = ' + Utils.getUid() + ' AND ' +
					'nid > 0 AND ' +
					'assignment_status != "' + exports.Status.FINISHED + '" AND ' +
					'assignment_date < ' + now + ' AND ' +
					'(assignment_date___end IS NULL OR assignment_date = assignment_date___end OR assignment_date___end > ' + now + ')';
	var result = Database.query(query);
	return result.field(0) != 0;
};

function getPossibleRoutes() {
	if (!hasRouteAssignment()) {
		return [];
	}
	exports.hasRoutes();
	
	var now = Utils.getUTCTimestampServerCorrected();
	var query = 'SELECT ' + 
					'assignment_date AS start, ' +
					'assignment_date___end AS end, ' +
					'route_assignment.nid AS nid, ' +
					'name_0 AS title, ' +
					'locations as locationNids, ' +
					'assignment_status AS status, ' +
					'number_completed, ' +
					'repeat_0 AS repeat ' +
				'FROM ' +
					'route_assignment INNER JOIN route ON route_assignment.route_reference = route.nid ' +
				'WHERE ' +
					'driver_1 = ' + Utils.getUid() + ' AND ' +
					'route_assignment.nid > 0 AND ' +
					'assignment_status != "' + exports.Status.FINISHED + '" AND ' +
					'assignment_date < ' + now + ' AND ' +
					'(assignment_date___end IS NULL OR assignment_date = assignment_date___end OR assignment_date___end > ' + now + ')';
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

function askSelectRoute(routes) {
	var options = [];
	for (var i = 0; i < routes.length; i++) {
		options[i] = routes[i].title;
		
		if (routes[i].repeat != 0) {
			options[i] += ' (' + (parseInt(routes[i].number_completed || 0, 10) + 1) + (routes[i].repeat == exports.Repeat.INFINITE ? '' : '/' + parseInt(routes[i].repeat, 10)) + ')';
		}
		
		if (routes[i].status == 'started') {
			options[i] += ' (started)';
		}
	}
	
	var dialog = Ti.UI.createOptionDialog({
       title: 'Select a route.',
       options: options
    });
    
    dialog.addEventListener('click', function(event) {
    	if (routes[event.index]) {
			exports.startRoute(routes[event.index]);
    	}
    });
    
    dialog.show();
}
