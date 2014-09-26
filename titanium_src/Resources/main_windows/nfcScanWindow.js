/* jshint globalstrict:true */
'use strict';

var NFCEventDispatcher = require('services/NFCEventDispatcher');

function NFCScanWindow(win) {
	this.win = win;
	
	this.shadowView = null;
	this.wrapperView = null;
	this.scanLabel = null;
	this.cancelButton = null;
	this.nfcListener = null;
	
	this._init();
}

/* PIVATE METHODS */

NFCScanWindow.prototype._init = function() {
	this.win.add(this._getShadowView());
	this.win.add(this._getWrapperView());
	
	this._initNFCEventDispatcher();
};

NFCScanWindow.prototype._initNFCEventDispatcher = function() {
	if (Ti.App.isAndroid) {
		this.nfcListener = new NFCEventDispatcher(Titanium.Android.currentActivity);
		this.nfcListener.addNFCListener(this._handleTagScanned.bind(this));
	}
};

NFCScanWindow.prototype._handleTagScanned = function(tag) {
	//if (!tag.isValidOmadiTag()) {
		tag.initTagWithNewData();
	//}
	
	if (tag.getData() && tag.isValidOmadiTag()) {
		this.win.callback(tag.getData());
		this._closeWindow();
	} else {
		if (!tag.isWritable()) {
			alert('This tag cannot be used because it is write protected.');
		} else {
			alert('There was an error scanning this tag. Please try again.');
		}
	}
};

NFCScanWindow.prototype._getShadowView = function() {
	if (this.shadowView === null) {
		this.shadowView = Ti.UI.createView({
	    	top: 0,
	    	bottom: 0,
	    	left: 0,
	    	right: 0,
	    	backgroundColor: '#000',
	    	opacity: 0.5
	    });
	}
	
	return this.shadowView;
};

NFCScanWindow.prototype._getWrapperView = function() {
	if (this.wrapperView === null) {
		this.wrapperView = Ti.UI.createView({
	        width:'95%',
	        height: 220,
	        borderColor: '#aaa',
	        borderWidth: 2,
	        backgroundColor: '#666',
			layout: 'vertical'
	    });
	    
	    this.wrapperView.add(this._getScanLabel());
    	this.wrapperView.add(this._getCancelButton());
	}
	
	return this.wrapperView;
};

NFCScanWindow.prototype._getScanLabel = function() {
	if (this.scanLabel === null) {
		this.scanLabel = Ti.UI.createLabel({
	        text: 'Scan NFC Tag Now',
	        color: '#fff',
	        font: {
	            fontSize: 26,
	            fontWeight: 'bold'
	        },
	        height: 179,
	        width: '100%',
	        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
	        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
	    });
	}
	
	return this.scanLabel;
};

NFCScanWindow.prototype._getCancelButton = function() {
	if (this.cancelButton === null) {
		this.cancelButton = Ti.UI.createLabel({
	        backgroundImage:'/images/black_button2.png',
	        color: '#fff',
	        text: 'Cancel',
	        width: 86,
	        height: 35,
	        left: 6,
	        bottom: 6,
	        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
	        font:{
	            fontWeight: 'bold',
	            fontSize: 14
	        }
	    });
	    
    	this.cancelButton.addEventListener('click', this._closeWindow.bind(this));
	}
	
	return this.cancelButton;
};

NFCScanWindow.prototype._closeWindow = function() {
	this.win.close();
};

(function() {
	new NFCScanWindow(Ti.UI.currentWindow);
}());
