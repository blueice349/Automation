/* jshint globalstrict:true */
'use strict';

var Display = require('lib/Display');

var ProgressBar = function(max, message) {
	this.max = max || 100;
	this.message = message || '';
	this.value = 0;
	
	this.progressBar = null;
	this.wrapperView = null;
};

ProgressBar.prototype.show = function() {
	try {
		var view = this._getWrapperView();
		ProgressBar.mainMenu.add(view);
		view.show();
	} catch (e) {}
};

ProgressBar.prototype.hide = function() {
	try {
		var view = this._getWrapperView();
		view.hide();
		ProgressBar.mainMenu.remove(view);
	} catch (e) {}
};

ProgressBar.prototype.setMessage = function(message) {
	this.message = message;
	this._getProgressBar().setMessage(this.message);
};

ProgressBar.prototype.setValue = function(value) {
	this.value = Math.min(value, this.max);
	this._getProgressBar().setValue(this.value);
};

ProgressBar.prototype.increment = function(amount) {
	if (isNaN(amount)) {
		amount = 1;
	}
	this.setValue(this.value + amount);
};

ProgressBar.prototype._getWrapperView = function() {
	if (this.wrapperView === null) {
		this.wrapperView = Titanium.UI.createView({
	        height : 45,
	        width : '100%',
	        backgroundColor : '#111',
	        opacity : 1,
	        top : Ti.App.isIOS7 ? 20 : 0,
	        zIndex : 100
	    });
	    
	    this.wrapperView.add(this._getProgressBar());
	}
	return this.wrapperView;
};

ProgressBar.prototype._getProgressBar = function() {
	if (this.progressBar === null) {
		this.progressBar = Titanium.UI.createProgressBar({
	        width : "96%",
	        min : 0,
	        max : this.max,
	        top : 2,
	        value : this.value,
	        color : '#fff',
	        message : this.message,
	        font: {
	          fontSize: 14  
	        },
	        style : Ti.App.isIOS ? Titanium.UI.iPhone.ProgressBarStyle.PLAIN : ''
	    });
	}
	return this.progressBar;
};

ProgressBar.mainMenu = Display.currentWindow;



module.exports = ProgressBar;
