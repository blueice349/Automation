/*jslint eqeq:true, plusplus: true*/

var dateWindow;
var Utils = require('lib/Utils');
var Display = require('lib/Display');
dateWindow = null;

function OmadiTimeWidget(formObj, instance, fieldViewWrapper){"use strict";
    this.formObj = formObj;
    this.instance = instance;
    this.fieldView = null;
    this.node = formObj.node;
    this.dbValues = [];
    this.textValues = [];
    this.elements = [];
    this.nodeElement = null;
    this.numVisibleFields = 1;
    this.fieldViewWrapper = fieldViewWrapper;
    
    if(typeof this.node[this.instance.field_name] !== 'undefined'){
        this.nodeElement = this.node[this.instance.field_name];
        
        if(typeof this.nodeElement.dbValues !== 'undefined' && this.nodeElement.dbValues != null){
            this.dbValues = this.nodeElement.dbValues;   
        }
        
        if(typeof this.nodeElement.textValues !== 'undefined' && this.nodeElement.textValues != null){
            this.textValues = this.nodeElement.textValues;
        }
    }
    
    if(this.instance.settings.cardinality == -1){
        if(Utils.isArray(this.dbValues)){
            this.numVisibleFields = this.dbValues.length;
        }
        if(this.numVisibleFields < 1){
            this.numVisibleFields = 1;
        }
    }
    else{
        this.numVisibleFields = this.instance.settings.cardinality;
    }
}

OmadiTimeWidget.prototype.getFieldView = function(){"use strict";
    var self = this;
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    this.fieldView.add(this.formObj.getRegularLabelView(this.instance));
    
    // Add the actual fields
    for(var i = 0; i < this.numVisibleFields; i ++){
        this.elements[i] = this.getNewElement(i);
        this.fieldView.add(this.elements[i]);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    if(this.instance.settings.cardinality == -1){
        
        var addButton = Ti.UI.createButton({
            title: ' Add another item ',
            right: 15,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            backgroundGradient: Display.backgroundGradientGray,
            borderColor: '#999',
            borderWidth: 1,
            width: Ti.App.isIOS ? 200 : Ti.UI.SIZE,
            borderRadius: 10,
            color: '#eee',
            top: 10,
            height: Ti.App.isIOS ? 45 : Ti.UI.SIZE,
            fieldName: this.instance.field_name
        });
            
        addButton.addEventListener('click', function(){
            try{
                self.numVisibleFields ++;
                self.formObj.unfocusField();
                self.redraw();
            }
            catch(ex){
                Utils.sendErrorReport("Exception in omadi time add another: " + ex);
            }
        });
        
        this.fieldView.add(addButton);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    return this.fieldView;
};

OmadiTimeWidget.prototype.redraw = function(){"use strict";
    Ti.API.debug("in redraw");
    var origFieldView;
    
    this.formObj.formToNode();
        
    this.node = this.formObj.node;
    if(typeof this.node[this.instance.field_name] !== 'undefined'){
        this.nodeElement = this.node[this.instance.field_name];
        
        if(typeof this.nodeElement.dbValues !== 'undefined' && this.nodeElement.dbValues != null){
            this.dbValues = this.nodeElement.dbValues;   
        }
        
        if(typeof this.nodeElement.textValues !== 'undefined' && this.nodeElement.textValues != null){
            this.textValues = this.nodeElement.textValues;
        }
    }
    
    origFieldView = this.fieldView;
    
    this.getFieldView();
    
    origFieldView.hide();
    
    this.fieldViewWrapper.add(this.fieldView);
    this.fieldViewWrapper.remove(origFieldView);
};

OmadiTimeWidget.prototype.getNewElement = function(index){"use strict";
    var dbValue, textValue, element, jsDate, dateText, timeText, nowTimestamp, midnight;
    var self = this;
    
    dbValue = null;
    textValue = "";
    
    if(this.nodeElement){
        if(typeof this.dbValues[index] !== 'undefined'){
            dbValue = this.dbValues[index];
        }
        
        if(typeof this.textValues[index] !== 'undefined'){
            textValue = this.textValues[index];
        }
    }
    
    Ti.API.debug("Creating time only field: " + this.instance.label);
    
    jsDate = new Date();

    if (dbValue !== null) {
        nowTimestamp = Math.round(jsDate.getTime() / 1000);
        midnight = Utils.getMidnightTimestamp(nowTimestamp);
        jsDate.setTime((midnight + dbValue) * 1000);
    }
    
    dateText = timeText = "";
    if(dbValue !== null){
        dateText = Utils.formatDate(dbValue, false);
        timeText = Utils.formatTime(dbValue);
    }

    element = this.formObj.getLabelField(this.instance);
    element.setText(textValue);
    element.textValue = textValue;
    element.dbValue = dbValue;
    element.jsDate = jsDate;
    
    element.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
    this.formObj.addCheckConditionalFields(element.check_conditional_fields);

    element.addEventListener('click', function(e) {
        try{
            if (e.source.instance.can_edit) {
                self.displayPicker(e.source);
            }
        }
        catch(ex){
            Utils.sendErrorReport("Exception in omadi time click: " + ex);
        }
    });
    
    return element;
};

OmadiTimeWidget.prototype.displayPicker = function(element) {"use strict";

    var opacView, widgetDate, okButton, clearButton, wrapperView, 
        topButtonsView, time_picker, cancelButton;
    var self = this;
    
    try{
        if (Ti.App.isAndroid) {
            Ti.UI.Android.hideSoftKeyboard();
        }
    
        dateWindow = Ti.UI.createWindow({
            orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT],
            modal: true,
            navBarHidden: true
        });
    
        opacView = Ti.UI.createView({
            left : 0,
            right : 0,
            top : 0,
            bottom : 0
        });
    
        dateWindow.add(opacView);
    
        wrapperView = Ti.UI.createView({
            layout : 'vertical',
            height : Ti.UI.SIZE,
            width : Ti.UI.SIZE
        });
    
        topButtonsView = Ti.UI.createView({
            bottom : 0,
            height : 44,
            backgroundGradient : {
                type : 'linear',
                startPoint : {
                    x : '50%',
                    y : '0%'
                },
                endPoint : {
                    x : '50%',
                    y : '100%'
                },
                colors : [{
                    color : '#ccc',
                    offset : 0.0
                }, {
                    color : '#999',
                    offset : 1.0
                }]
            }
        });
    
        wrapperView.add(topButtonsView);
    
        okButton = Ti.UI.createLabel({
            text : 'Done',
            right : 10,
            width : 80,
            height: 35,
            style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            color : '#fff',
            borderRadius : 5,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
            font : {
                fontSize : 14,
                fontWeight: 'bold'
            },
            borderWidth : 1,
            borderColor : '#555',
            backgroundGradient : {
                type : 'linear',
                startPoint : {
                    x : '50%',
                    y : '0%'
                },
                endPoint : {
                    x : '50%',
                    y : '100%'
                },
                colors : [{
                    color : '#999',
                    offset : 0.0
                }, {
                    color : '#444',
                    offset : 1.0
                }]
            },
            instance: element.instance
        });
        topButtonsView.add(okButton);
    
        cancelButton = Ti.UI.createLabel({
            text : 'Cancel',
            width : 80,
            left : 10,
            height: 35,
            element : element,
            style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            color : '#fff',
            borderRadius : 5,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
            font : {
                fontSize : 14,
                fontWeight: 'bold'
            },
            borderWidth : 1,
            borderColor : '#555',
            backgroundGradient : {
                type : 'linear',
                startPoint : {
                    x : '50%',
                    y : '0%'
                },
                endPoint : {
                    x : '50%',
                    y : '100%'
                },
                colors : [{
                    color : '#999',
                    offset : 0.0
                }, {
                    color : '#444',
                    offset : 1.0
                }]
            }
        });
    
        clearButton = Ti.UI.createLabel({
            text : 'Clear',
            width : 80,
            left : 100,
            height: 35,
            element : element,
            style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            color : '#fff',
            borderRadius : 5,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
            font : {
                fontSize : 14,
                fontWeight: 'bold'
            },
            borderWidth : 1,
            borderColor : '#555',
            backgroundGradient : {
                type : 'linear',
                startPoint : {
                    x : '50%',
                    y : '0%'
                },
                endPoint : {
                    x : '50%',
                    y : '100%'
                },
                colors : [{
                    color : '#999',
                    offset : 0.0
                }, {
                    color : '#444',
                    offset : 1.0
                }]
            },
            instance: element.instance
        });
    
        topButtonsView.add(cancelButton);
        topButtonsView.add(clearButton);
    
        widgetDate = element.jsDate;
    
        time_picker = Titanium.UI.createPicker({
            useSpinner : true,
            borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            value : widgetDate,
            font : {
                fontSize : 18
            },
            type : Ti.UI.PICKER_TYPE_TIME,
            color : '#000000',
            timezone : null,
            element : element,
            height : Ti.UI.SIZE, 
            width : '100%',
            format24 : (Utils.getTimeFormat().indexOf('H') !== -1 ? true : false)  // Only available on Android
        });
    
        // This sounds really stupid - and it is! If this onchange listener isn't in place, 
        // then the date won't actually be recorded
        time_picker.addEventListener('change', function() {
            // Empty, but necessary
        });
        
        okButton.time_picker = time_picker;
        okButton.element = element;
        clearButton.element = element;
        
        wrapperView.add(time_picker);
    
        okButton.addEventListener('click', function(e) {
            try{
                var newDate = e.source.time_picker.getValue();
                e.source.element.jsDate = newDate;
                e.source.element.textValue = Utils.phpFormatDate('g:i A', Math.ceil(newDate.getTime() / 1000));
                e.source.element.dbValue = self.dateToSeconds(e.source.element.textValue);
        
                e.source.element.setText(e.source.element.textValue);
        
                if (e.source.element.check_conditional_fields.length > 0) {
                    Ti.API.debug("Checking conditionally required");
                    self.formObj.setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                }
            }
            catch(ex){
                Utils.sendErrorReport("Exception in ok button click in omadi time: " + ex);
            }
            
            dateWindow.close();
        });
    
        clearButton.addEventListener('click', function(e) {
            try{
                e.source.element.dbValue = null;
                e.source.element.textValue = "";
        
                e.source.element.setText(e.source.element.textValue);
        
                if (e.source.element.check_conditional_fields.length > 0) {
                    Ti.API.debug("Checking conditionally required");
                    self.formObj.setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                }  
            }
            catch(ex){
                Utils.sendErrorReport("Exception in omadi time clear button: " + ex);
            }
            
            dateWindow.close();
        });
    
        cancelButton.addEventListener('click', function() {
            dateWindow.close();
        });
    
        dateWindow.add(wrapperView);
        
        dateWindow.addEventListener('android:back', function(){
            dateWindow.close();
            dateWindow = null;
        });
        
        dateWindow.open();
    }
    catch(ex){
        Utils.sendErrorReport("Exception in omadi time display picker: " + ex);
    }
};

OmadiTimeWidget.prototype.dateToSeconds = function(time_text) {"use strict";

    var is_pm, is_am, time_split, seconds;

    time_text = time_text.toUpperCase();

    is_pm = (time_text.indexOf('PM') !== -1);
    is_am = (time_text.indexOf('AM') !== -1);

    time_text = Utils.trimWhiteSpace(time_text.replace(/(AM|PM)/g, ''));

    time_split = time_text.split(':');
    // splite time string into hours & minutes
    seconds = (3600 * parseInt(time_split[0], 10)) + (parseInt(time_split[1], 10) * 60);
    // hours + min

    if (is_pm && time_split[0] != 12) {
        seconds += (12 * 3600);
    }
    else if (is_am && time_split[0] == 12) {
        seconds -= (12 * 3600);
    }

    return seconds;
};

OmadiTimeWidget.prototype.cleanUp = function(){"use strict";
    Ti.API.debug("in time widget cleanup");
    
    try{
        for(var i = 0; i < this.elements.length; i++){
            this.fieldView.remove(this.elements[i]);
            this.elements[i] = null;
        }
        
        this.fieldView = null;
        this.fieldViewWrapper = null;
        this.formObj = null;
        this.node = null;
        this.dbValues = null;
        this.textValues = null;
        this.nodeElement = null;
        this.instance = null;
        
        Ti.API.debug("At end of time widget cleanup");
    }
    catch(ex){
        try{
            Utils.sendErrorReport("Exception cleaning up time widget field: " + ex);
        }
        catch(ex1){}
    }
};

exports.getFieldObject = function(FormObj, instance, fieldViewWrapper){"use strict";
    return new OmadiTimeWidget(FormObj, instance, fieldViewWrapper);
};


