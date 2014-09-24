/* jshint globalstrict:true */
'use strict';

var Utils = require('lib/Utils');

function NFCWidget(formObj, instance, fieldViewWrapper){
    this.formObj = formObj;
    this.instance = instance;
    this.node = formObj.node;
    this.dbValues = [];
    this.textValues = [];
    this.nodeElement = this.node[this.instance.field_name] || null;
    this.fieldViewWrapper = fieldViewWrapper;
    
    this.fieldView = null;
    this.labelView = null;
    this.elementWrapperView = null;
    this.scanButton = null;
    this.dataLabel = null;
    this.spacerView = null;
    this.scanWindow = null;
    
    if(this.nodeElement){
        this.dbValues = this.nodeElement.dbValues || [];
        this.textValues = this.nodeElement.textValues || [];
    }
}

NFCWidget.RED = '#600';
NFCWidget.GREEN = '#060';

/* PUBLIC METHODS */

NFCWidget.prototype.getFieldView = function() {
	if (this.fieldView === null) {
		this.fieldView = Ti.UI.createView({
		   width: '100%',
		   layout: 'vertical',
		   height: Ti.UI.SIZE
		});
		
		this.fieldView.add(this._getLabelView());
		this.fieldView.add(this._getElementWrapperView());
		this.fieldView.add(this._getSpacerView());
	}
    
    return this.fieldView;
};

NFCWidget.prototype.cleanUp = function() {
    var i, j;
    Ti.API.debug("in nfc widget cleanup");
    
    try{
        this.fieldView.remove(this.labelView);
        this.fieldView.remove(this.elementWrapperView);
        this.fieldView.remove(this.spacerView);
        this.elementWrapperView.remove(this.scanButton);
        this.elementWrapperView.remove(this.dataLabel);
        
	    this.fieldView = null;
	    this.fieldViewWrapper = null;
	    this.labelView = null;
	    this.elementWrapperView = null;
	    this.scanButton = null;
	    this.dataLabel = null;
	    this.spacerView = null;
	    this.scanWindow = null;
    }
    catch(ex) {
        Utils.sendErrorReport("Exception cleaning up nfc widget field: " + ex);
    }
};

/* PRIVATE METHODS */

NFCWidget.prototype._getLabelView = function() {
	if (this.labelView === null) {
		this.labelView = this.formObj.getRegularLabelView(this.instance);
	}
	return this.labelView;
};

NFCWidget.prototype._getSpacerView = function() {
	if (this.spacerView === null) {
		this.spacerView = this.formObj.getSpacerView();
	}
	return this.spacerView;
};

NFCWidget.prototype._getElementWrapperView = function() {
	if (this.elementWrapperView === null) {
		this.elementWrapperView = Ti.UI.createView({
			width: '92%',
			left: '4%',
			layout: 'horizontal',
			height: Ti.UI.SIZE,
			dbValue: this.dbValues[0]
		});
		
		if (Ti.App.isAndroid) {
			this.elementWrapperView.add(this._getScanButton());
		}
		this.elementWrapperView.add(this._getDataLabel());
	}
	return this.elementWrapperView;
};

NFCWidget.prototype._getScanButton = function() {
	if (this.scanButton === null) {
		this.scanButton = Ti.UI.createLabel({
	        backgroundImage:'/images/blue_button2.png',
	        color: '#fff',
	        text: 'Scan',
	        width:86,
	        height:35,
	        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
	        font: {
	            fontWeight: 'bold',
	            fontSize: 14
	        },
	        instance: this.instance
	    });
	    
	    if (this.dbValues[0]) {
	    	this.scanButton.text = 'Rescan';
	    }
	    
	    this.scanButton.addEventListener('click', this._openScanWindow.bind(this));
	}
	return this.scanButton;
};

NFCWidget.prototype._getDataLabel = function() {
	if (this.dataLabel === null) {
		this.dataLabel = Ti.UI.createLabel({
	        text: 'No NFC Linked',
	        width: 'auto',
	        height: 35,
	        font: {
	        	fontFamily: 'Arial',
	        	fontSize: 14
	        },
	        color: NFCWidget.RED,
	        left: 10
	    });
	    
	    if (this.dbValues[0]) {
	    	this.dataLabel.text = 'NFC Linked';
	    	this.dataLabel.color = NFCWidget.GREEN;
	    }
	}
	return this.dataLabel;
};

NFCWidget.prototype._handleTagScanned = function(data) {
	this.nodeElement.dbValues[0] = this.dbValues[0] = data;
	this.nodeElement.textValues[0] = this.textValues[0] = 'Linked';
	this._getElementWrapperView().dbValue = data;
	
	var dataLabel = this._getDataLabel();
	dataLabel.text = 'New NFC Linked';
	dataLabel.color = NFCWidget.GREEN;
	
	var scanButton = this._getScanButton();
	scanButton.text = 'Rescan';
};

NFCWidget.prototype._openScanWindow = function() {
	if (this.scanWindow === null) {
		this.scanWindow = Ti.UI.createWindow({  
	        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT],
	        modal: true,
	        navBarHidden: true,
        	url: '/main_windows/nfcScanWindow.js',
        	callback: this._handleTagScanned.bind(this)
	    });
	}
	
	this.scanWindow.open();
};

exports.getFieldObject = function(FormObj, instance, fieldViewWrapper){
    return new NFCWidget(FormObj, instance, fieldViewWrapper);
};


