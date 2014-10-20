/* jshint globalstrict:true */
'use strict';

var RouteLocation = require('objects/RouteLocation');
var Database = require('lib/Database');
var Utils = require('lib/Utils');
var Node = require('objects/Node');
var NFCEventDispatcher = require('services/NFCEventDispatcher');

var commonDialog;
function showDialog(dialog) {
	if (commonDialog) {
		commonDialog.hide();
	}
	commonDialog = dialog;
	commonDialog.show();
}


var RouteListener = function(route) {
	this.nid = route.nid;
	this.node = null;
	this.status = route.status;
	this.title = route.title;
	this.locationNids = JSON.parse(route.locationNids);
	this.index = null;
	this.location = null;
	this.repeat = null;
	this.numberCompleted = null;
	this.tagScannedCallback = null;
	this.nfcEventDispatcher = null;
	
	this._startRoute();
};

RouteListener.prototype._initNFCEventDispatcher = function() {
	if (Ti.App.isAndroid) {
		this.tagScannedCallback = this._handleTagScanned.bind(this);
		this.nfcEventDispatcher = new NFCEventDispatcher(Titanium.Android.currentActivity);
		this.nfcEventDispatcher.addNFCListener(this.tagScannedCallback);
	}
};

RouteListener.prototype._cleanUpNFCEventDispatcher = function() {
	if (Ti.App.isAndroid) {
		this.nfcEventDispatcher.removeNFCListener(this.tagScannedCallback);
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
			this._calloutNextCheckpoint();
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
	var status = this._getStatus();
	if (status != 'started') {
		this._setStatus('started');
		this._setIndex(0);
	}
	
	var dialog = Ti.UI.createAlertDialog({
		title: (status == 'started' ? 'Continuing "' : 'Begining "') + this.title + '"',
	    buttonNames: ['Ok']
	});
	
	dialog.addEventListener('click', function() {
		this._calloutNextCheckpoint();
		this._initNFCEventDispatcher();
	}.bind(this));
	
	showDialog(dialog);
};

RouteListener.prototype._calloutNextCheckpoint = function() {
	var dialog = Ti.UI.createAlertDialog({
       title: 'Next checkpoint: ' + this._getLocation().getName(),
       buttonNames: ['Ok']
    });
    
    showDialog(dialog);
};

RouteListener.prototype._completeRoute = function() {
	if (this._getStatus() != 'complete') {
		this._setIndex(0);
		this._cleanUpNFCEventDispatcher();
		this._incrementNumberCompleted();
		
		if (this._getRepeat() != -1 && this._getNumberCompleted() > this._getRepeat()) {
			this._setStatus('complete');
		} else {
			this._setStatus('not_started');
		}
		
		var dialog = Ti.UI.createAlertDialog({
	       title: 'Route completed.',
	       buttonNames: ['Ok']
	    });
	    
	    dialog.addEventListener('click', function() {
	    	exports.askToStartRoute();
	    });
	    
	    showDialog(dialog);
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

RouteListener.prototype._getRepeat = function() {
	if (this.repeat === null) {
		this.repeat = this._getNode().repeat_0.dbValues[0];
	}
	return this.repeat;
};

RouteListener.prototype._getNumberCompleted = function() {
	if (this.numberCompleted === null) {
		this.numberCompleted = this._getNode().number_completed.dbValues[0] || 0;
	}
	return this.numberCompleted;
};

RouteListener.prototype._incrementNumberCompleted = function() {
	var numberCompleted = this._getNumberCompleted() + 1;
	
	var node  = this._getNode();
	node.number_completed = {
		dbValues: [numberCompleted],
		textValues: [numberCompleted]
	};
	Node.save(node);
	this.numberCompleted = numberCompleted;
};

RouteListener.prototype._getNode = function() {
	if (this.node === null) {
		this.node = Node.load(this.nid);
	}
	return this.node;
};

var instance = null;

exports.askToStartRoute = function() {
	var routes = exports.getPossibleRoutes();
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
    
    showDialog(dialog);
};

exports.getPossibleRoutes = function() {
	if (!hasRouteAssignment()) {
		return [];
	}
	
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
					'assignment_status != "complete" AND ' +
					'assignment_date < ' + now + ' AND ' +
					'(assignment_date___end IS NULL OR assignment_date = assignment_date___end OR assignment_date___end > ' + now + ')';
	var result = Database.query(query);
	var data = Database.resultToObjectArray(result);
	result.close();
	Database.close();
	
	return data;
};

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
			options[i] += ' (' + (parseInt(routes[i].number_completed || 0, 10) + 1) + (routes[i].repeat == -1 ? '' : '/' + (parseInt(routes[i].repeat, 10) + 1)) + ')';
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
    		instance = new RouteListener(routes[event.index]);
    	}
    });
    
    showDialog(dialog);
}

function dbValueToTextValue(dbValue) {
	return dbValue.replace('_', ' ').replace(/\w\S*/g, function(word){
		return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
	});
}

exports.getInstance = function() {
	return instance;
};
