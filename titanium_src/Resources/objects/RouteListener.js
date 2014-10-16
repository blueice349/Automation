/* jshint globalstrict:true */
'use strict';

var Database = require('lib/Database');
var Utils = require('lib/Utils');
var NFCEventDispatcher = require('services/NFCEventDispatcher');

var RouteListener = function(route) {
	this.nid = route.nid;
	this.assignmentNid = route.assignmentNid;
	this.title = route.title;
	this.locationNids = JSON.parse(route.locationNids);
	this.status = route.status;
	this.node = null;
	this.nextLocationIndex = null;
	this.nextTagData = null;
	
	this.tagScannedCallback = null;
	this.nfcEventDispatcher = null;
	
	this._startRoute();
	this._initNFCEventDispatcher();
};

RouteListener.prototype._initNFCEventDispatcher = function() {
	try {
		if (Ti.App.isAndroid) {
			this.tagScannedCallback = this._handleTagScanned.bind(this);
			this.nfcEventDispatcher = new NFCEventDispatcher(Titanium.Android.currentActivity);
			this.nfcEventDispatcher.addNFCListener(this.tagScannedCallback);
		}
	} catch (error) {
		console.log('------Error in RouteListener.prototype._initNFCEventDispatcher: ' + error);
	}
};

RouteListener.prototype._handleTagScanned = function(tag) {
	try {
		if (tag.getData() == this._getNextTagData()) {
			console.log('------ GOT IT');
		} else {
			console.log('------ This is not the tag you\'re looking for.');
		}
	} catch (error) {
		console.log('------Error in RouteListener.prototype._handleTagScanned: ' + error);
	}
};

RouteListener.prototype._getNextTagData = function() {
	try {
		if (this.nextTagData === null) {
			var node = Node.load(this.locationNids[this._getNextLocationIndex()]);
			this.nextTagData = node.nfc.dbValues;
		}
		return this.nextTagData;
	} catch (error) {
		console.log('------Error in RouteListener.prototype._getNextTagData: ' + error);
	}
};

RouteListener.prototype._getNextLocationIndex = function() {
	try {
		if (this.nextLocationIndex === null) {
			var routeProgress = Titanium.App.Properties.getObject('routeProgress', {});
			if (typeof routeProgress[this.assingmentNid] == 'undefined') {
				routeProgress[this.assingmentNid] = 0;
				Titanium.App.Properties.setObject('routeProgress', routeProgress);
			}
			this.nextLocationIndex = routeProgress[this.assingmentNid];
		}
		return this.nextLocationIndex;
	} catch (error) {
		console.log('------Error in RouteListener.prototype._getNextLocationIndex: ' + error);
	}
};

RouteListener.prototype._setNextLocationIndex = function(index) {
	try {
		this.nextLocationIndex = index;
		var routeProgress = Titanium.App.Properties.getObject('routeProgress', {});
		routeProgress[this.assingmentNid] = index;
		Titanium.App.Properties.setObject('routeProgress', routeProgress);
	} catch (error) {
		console.log('------Error in RouteListener.prototype._setNextLocationIndex: ' + error);
	}
};

RouteListener.prototype._startRoute = function() {
	try {
		if (this.status != 'started') {
			var node  =  this._getNode();
			node.assignment_status = {
				dbValues: ['started'],
				textValues: ['Started']
			};
			Node.save(node);
			this._setNextLocationIndex(0);
		}
	} catch (error) {
		console.log('------Error in RouteListener.prototype._startRoute: ' + error);
	}
};

RouteListener.prototype._completeRoute = function() {
	try {
		var node  =  this._getNode();
		node.assignment_status = {
			dbValues: ['complete'],
			textValues: ['Complete']
		};
		Node.save(node);
	} catch (error) {
		console.log('------Error in RouteListener.prototype._completeRoute: ' + error);
	}
};

RouteListener.prototype._getNode = function() {
	try {
		if (this.node === null) {
			this.node = Node.load(this.assignmentNid);
		}
		return this.node;
	} catch (error) {
		console.log('------Error in RouteListener.prototype._getNode: ' + error);
	}
};

var instance = null;

exports.askToStartRoute = function() {
	try {
		var routes = getPossibleRoutes();
		if (routes.length == 0) {
			return;
		}
		
		var askBeginDialog = Ti.UI.createAlertDialog({
	       title: 'Begin route now?',
	       buttonNames: ['Begin route', 'No']
	    });
	    
	    var options = [];
	    for (var i = 0; i < routes.length; i++) {
	    	options[i] = routes[i].title + (routes[i].status == 'started' ? ' (started)' : '');
	    }
	    
	    askBeginDialog.addEventListener('click', function(event) {
	    	try {
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
	    	} catch (error) {
	    		console.log('------Error in askBeginDialog.addEventListener(\'click\': ' + error);
	    	}
	    });
	    
	    askBeginDialog.show();
	} catch (error) {
		console.log('------Error in exports.askToStartRoute: ' + error);
	}
};

function getPossibleRoutes() {
	try {
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
	} catch (error) {
		console.log('------Error in function getPossibleRoutes: ' + error);
	}
};

function hasRouteAssignment() {
	try {
		var result = Database.query('SELECT COUNT(*) FROM node WHERE nid > 0 AND table_name = "route_assignment"');
		var count = result.field(0);
		result.close();
		Database.close();
		return count !== 0;
	} catch (error) {
		console.log('------Error in function hasRouteAssignment: ' + error);
	}
}

exports.getInstance = function() {
	return instance;
};
