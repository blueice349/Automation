/* jshint globalstrict:true */
'use strict';

var RouteLocation = require('objects/RouteLocation');
var RouteListener = require('objects/RouteListener');
var Node = require('objects/Node');
var Utils = require('lib/Utils');
var Display = require('lib/Display');
var Service = require('lib/Service');
var NFCEventDispatcher = require('services/NFCEventDispatcher');
var NFC = require('services/NFC');

var commonDialog;
function showDialog(dialog) {
	if (commonDialog) {
		commonDialog.hide();
	}
	commonDialog = dialog;
	commonDialog.show();
}


function hideDialog() {
	if (commonDialog) {
		commonDialog.hide();
	}
}


var Route = function(route) {
	this.nid = route.nid;
	this.node = null;
	this.title = route.title;
	this.locationNids = JSON.parse(route.locationNids);
	this.index = null;
	this.repeat = null;
	this.tagScannedCallback = null;
	this.nfcEventDispatcher = null;
	this.locations = [];
	
	this.locationNameLabel = null;
	this.locationDescriptionLabel = null;
	this.routeProgressLabel = null;
	
	this._drawInitialElements();
	this._initNFCEventDispatcher();
	this._startRoute();
};

Route.prototype._initNFCEventDispatcher = function() {
	if (Ti.App.isAndroid) {
		var self = this;
		this.tagScannedCallback = function(tag) {
			self._handleTagScanned(tag);
		};
		this.nfcEventDispatcher = new NFCEventDispatcher(Titanium.Android.currentActivity);
		this.nfcEventDispatcher.addNFCListener(this.tagScannedCallback);
	}
};

Route.prototype._cleanUpNFCEventDispatcher = function() {
	if (Ti.App.isAndroid) {
		this.nfcEventDispatcher.removeNFCListener(this.tagScannedCallback);
	}
};

Route.prototype._handleTagScanned = function(tag) {
	var index = this._getIndex();
	var tagIndex = this._getTagIndex(tag, this._getIndex());
	
	if (tagIndex == index) {
		this._currentLocationScanned(tag);
	} else if (tagIndex != -1) {
		this._futureLocationScanned(tag, tagIndex);
	} else {
		tagIndex = this._getTagIndex(tag);
		if (tagIndex != -1) {
			this._previousLocationScanned();
		}
	}
};

Route.prototype._getTagIndex = function(tag, start) {
	for (var i = start || 0; i < this.locationNids.length; i++) {
		if (tag.getData() == this._getLocation(i).getData()) {
			return i;
		}
	}
	return -1;
};

Route.prototype._currentLocationScanned = function(tag) {
	NFC.sendScan(tag);
	this._setIndex(this._getIndex() + 1);
	if (this._getIndex() == this.locationNids.length) {
		this._completeRoute();
	} else {
		this._calloutNextCheckpoint();
	}
};

Route.prototype._futureLocationScanned = function(tag, tagIndex) {
	var skippedLocations = [];
	for (var i = this._getIndex(); i < tagIndex; i++) {
		skippedLocations.push(this._getLocation(i).getName());
	}
	
	var dialog = Ti.UI.createAlertDialog({
		title: skippedLocations.length + ' skipped location' + (skippedLocations.length > 1 ? 's' : ''),
		message: 'You forgot to scan the following locations. Either go back and scan them or skip them and move on to the next location.\n' + skippedLocations.join('\n'),
		buttonNames: ['Go Back', 'Skip']
    });
    
    var self = this;
    dialog.addEventListener('click', function(event) {
    	if (event.index == 1) { // skip
    		for (var i = self._getIndex(); i <= tagIndex; i++) {
    			NFC.sendSkip(self.locationNids[i], 'nfc');
    		}
    		self._setIndex(tagIndex);
    		self._currentLocationScanned(tag);
    	}
    });
    
    showDialog(dialog);
};

Route.prototype._previousLocationScanned = function() {
	var dialog = Ti.UI.createAlertDialog({
       title: 'You have already scanned this location.',
       buttonNames: ['Ok']
    });
    
    var self = this;
    dialog.addEventListener('click', function() {
    	self._calloutNextCheckpoint();
    });
    
    showDialog(dialog);
};

Route.prototype._getLocation = function(index) {
	if (typeof this.locations[index] == 'undefined') {
		if (!this.locationNids[index]) {
			this._setIndex(0); // It got broken somehow. Fix the cache and return the first location.
			index = 0;
		}
		this.locations[index] = new RouteLocation(this.locationNids[index]);
	}
	return this.locations[index];
};

Route.prototype._getIndex = function() {
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

Route.prototype._setIndex = function(index) {
	if (this.index != index) {
		this.index = index;
		var routeProgress = Titanium.App.Properties.getObject('routeProgress', {});
		routeProgress[this.nid] = this.index;
		Titanium.App.Properties.setObject('routeProgress', routeProgress);
	}
};

Route.prototype._startRoute = function() {
	var status = this._getStatus();
	if (status != RouteListener.Status.STARTED) {
		this._setStatus(RouteListener.Status.STARTED);
		this._setStartTime();
		this._setIndex(0);
	}
};

Route.prototype._calloutNextCheckpoint = function() {
	hideDialog();
	this._redraw();
};

Route.prototype._completeRoute = function() {
	if (this._getStatus() != RouteListener.Status.FINISHED) {
		this._setIndex(0);
		this._setCompletedTime();
		this._cleanUpNFCEventDispatcher();
		this._incrementNumberCompleted();
		
		if (this._getRepeat() != RouteListener.Repeat.INFINITE && this._getNumberCompleted() == this._getRepeat()) {
			this._setStatus(RouteListener.Status.FINISHED);
		} else {
			this._setStatus(RouteListener.Status.NOT_STARTED);
		}
		
		Service.sendUpdates();
		
		var dialog = Ti.UI.createAlertDialog({
	       title: 'Route completed.',
	       buttonNames: ['Ok']
	    });
	    
	    dialog.addEventListener('click', function() {
	    	instance = null;
	    	currentWindow.close();
	    	RouteListener.askToStartRoute();
	    });
	    
	    showDialog(dialog);
	}
};

Route.prototype._setStatus = function(status) {
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

Route.prototype._getStatus = function() {
	return this._getNode().assignment_status.dbValues[0];
};

Route.prototype._getRepeat = function() {
	return this._getNode().repeat_0.dbValues[0];
};

Route.prototype._getNumberCompleted = function() {
	return this._getNode().number_completed.dbValues[0] || 0;
};

Route.prototype._incrementNumberCompleted = function() {
	var numberCompleted = this._getNumberCompleted() + 1;
	
	var node  = this._getNode();
	node.number_completed = {
		dbValues: [numberCompleted],
		textValues: [numberCompleted]
	};
	Node.save(node);
};

Route.prototype._setStartTime = function() {
	var now = Utils.getUTCTimestampServerCorrected();
	var node  = this._getNode();
	node.actual_time_started.dbValues[this._getNumberCompleted()] = now;
	node.actual_time_started.textValues[this._getNumberCompleted()] = now;
	Node.save(node);
};

Route.prototype._setCompletedTime = function() {
	var now = Utils.getUTCTimestampServerCorrected();
	var node  = this._getNode();
	node.actual_time_completed.dbValues[this._getNumberCompleted()] = now;
	node.actual_time_completed.textValues[this._getNumberCompleted()] = now;
	Node.save(node);
};

Route.prototype._getNode = function() {
	if (this.node === null) {
		this.node = Node.load(this.nid);
	}
	return this.node;
};

Route.prototype._drawInitialElements = function() {
	var wrapper = Ti.UI.createView({
		layout: 'absolute',
		width: '80%'
	});
	
	var headerView = Ti.UI.createView({
		layout: 'absolute',
		left: 0,
		top: 15,
		width: '100%',
		height: 45
	});
	var routeTitleLabel = Ti.UI.createLabel({
		text: this.title,
		color: '#fff',
		font: {
			fontSize: 12
		},
		left: 0,
		height: Ti.UI.SIZE,
		width: Ti.UI.SIZE
	});
	
	var bodyView = Ti.UI.createView({
		layout: 'vertical',
		left: 0,
		top: 60,
		width: '100%',
		height: Ti.UI.SIZE
	});
	var nextCheckpointLabel = Ti.UI.createLabel({
		text: 'Next Checkpoint:',
		color: '#fff',
		font: {
			fontSize: 16,
			fontWeight: 'bold'
		},
		left: 0,
		top: 15,
		bottom: 15,
		height: Ti.UI.SIZE
	});
	var descriptionLabel = Ti.UI.createLabel({
		text: 'Description:',
		color: '#fff',
		font: {
			fontSize: 16,
			fontWeight: 'bold'
		},
		left: 0,
		top: 15,
		bottom: 15,
		height: Ti.UI.SIZE
	});
	
	var footerView = Ti.UI.createView({
		layout: 'absolute',
		left: 0,
		bottom: 0,
		width: '100%',
		height: 45
	});
	var skipButton = Titanium.UI.createLabel({
	    text : 'Skip',
	    width : 60,
	    horizontalAlign : 'right',
	    textAlign : 'center',
	    right : 10,
	    height : 30,
	    backgroundGradient : Display.backgroundGradientGray,
	    font : {
	        fontSize : 14,
	        fontWeight : 'bold'
	    },
	    borderRadius : 5,
	    color : '#000',
	    style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
	});
	var completeButton = Titanium.UI.createLabel({
	    text : 'Complete',
	    width : 70,
	    horizontalAlign : 'right',
	    textAlign : 'center',
	    left : 10,
	    height : 30,
	    backgroundGradient : Display.backgroundGradientGray,
	    font : {
	        fontSize : 14,
	        fontWeight : 'bold'
	    },
	    borderRadius : 5,
	    color : '#000',
	    style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
	});
	
	headerView.add(routeTitleLabel);
	headerView.add(this._getRouteProgressLabel());
	
	bodyView.add(nextCheckpointLabel);
	bodyView.add(this._getLocationNameLabel());
	bodyView.add(descriptionLabel);
	bodyView.add(this._getLocationDescriptionLabel());
	
	footerView.add(skipButton);
	footerView.add(completeButton);
	
	wrapper.add(headerView);
	wrapper.add(bodyView);
	wrapper.add(footerView);
	
	currentWindow.add(wrapper);
	
	var self = this;
	skipButton.addEventListener('click', function(){
		NFC.sendSkip(self.locationNids[self._getIndex()], 'nfc', {
			routeNid: self.nid,
			index: self._getIndex(),
			repeat: self._getRepeat()
		});
		self._setIndex(self._getIndex() + 1);
		if (self._getIndex() == self.locationNids.length) {
			self._completeRoute();
		} else {
			self._calloutNextCheckpoint();
		}
	});
	completeButton.addEventListener('click', function(){
		for (var i = self._getIndex(); i < self.locationNids.length; i++) {
			NFC.sendSkip(self.locationNids[i], 'nfc', {
			routeNid: self.nid,
			index: i,
			repeat: self._getRepeat()
		});
		}
		self._completeRoute();
	});
};

Route.prototype._redraw = function() {
	var location = this._getLocation(this._getIndex());
	
	this._getRouteProgressLabel().text = 'Location ' + (this._getIndex() + 1) + ' of ' + this.locationNids.length;
	this._getLocationNameLabel().text = location.getName();
	this._getLocationDescriptionLabel().text = location.getDescription();
};

Route.prototype._getRouteProgressLabel = function() {
	if (this.routeProgressLabel === null) {
		this.routeProgressLabel = Ti.UI.createLabel({
			text: 'Location ' + (this._getIndex() + 1) + ' of ' + this.locationNids.length,
			color: '#fff',
			font: {
				fontSize: 12
			},
			right: 0,
			height: Ti.UI.SIZE,
			width: Ti.UI.SIZE
		});
	}
	return this.routeProgressLabel;
};

Route.prototype._getLocationNameLabel = function() {
	if (this.locationNameLabel === null) {
		this.locationNameLabel = Ti.UI.createLabel({
			text: this._getLocation(this._getIndex()).getName(),
			color: '#fff',
			font: {
				fontSize: 32,
				fontWeight: 'bold'
			}
		});
	}
	return this.locationNameLabel;
};

Route.prototype._getLocationDescriptionLabel = function() {
	if (this.locationDescriptionLabel === null) {
		this.locationDescriptionLabel = Ti.UI.createLabel({
			text: this._getLocation(this._getIndex()).getDescription(),
			color: '#fff',
			font: {
				fontSize: 16
			},
			left: 15
		});
	}
	return this.locationDescriptionLabel;
};

var instance = null;var currentWindow = Ti.UI.currentWindow;

(function() {
    instance = new Route(currentWindow.route);
})();
