/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi, dateWindow, date_picker, time_picker, innerWrapperView, wrapperView;
Widget = {};
dateWindow = null;

var Utils = require('lib/Utils');

function DatestampWidget(formObj, instance, fieldViewWrapper){"use strict";
    this.formObj = formObj;
    this.instance = instance;
    this.fieldView = null;
    this.node = formObj.node;
    this.dbValues = [];
    this.textValues = [];
    this.elements = [];
    this.dateViews = [];
    this.timeViews = [];
    this.nodeElement = null;
    this.numVisibleFields = 1;
    this.fieldViewWrapper = fieldViewWrapper;
    this.onChangeCallbacks = [];
    
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
        if(Omadi.utils.isArray(this.dbValues)){
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

DatestampWidget.prototype.getFieldView = function(){"use strict";
    var i, element, addButton;
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    this.fieldView.add(this.formObj.getRegularLabelView(this.instance));
    
    // Add the actual fields
    for(i = 0; i < this.numVisibleFields; i ++){
        this.elements[i] = this.getNewElement(i);
        this.fieldView.add(this.elements[i]);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    if(this.instance.settings.cardinality == -1){
        
        addButton = Ti.UI.createButton({
            title: ' Add another item ',
            right: 15,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            backgroundGradient: Omadi.display.backgroundGradientGray,
            borderColor: '#999',
            borderWidth: 1,
            width: Ti.UI.SIZE,
            borderRadius: 10,
            color: '#eee',
            top: 10,
            height: Ti.UI.SIZE,
            horizontalWrap: false,
            fieldName: this.instance.field_name
        });
            
        addButton.addEventListener('click', function(e){
            try{
                Widget[e.source.fieldName].numVisibleFields ++;
                Widget[e.source.fieldName].formObj.unfocusField();
                Widget[e.source.fieldName].redraw();
            }
            catch(ex){
                Utils.sendErrorReport("Exception redrawing datestamp field: " + ex);
            }
        });
        
        this.fieldView.add(addButton);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    return this.fieldView;
};

DatestampWidget.prototype.redraw = function(){"use strict";
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

DatestampWidget.prototype.getNewElement = function(index){"use strict";
    var dbValue, textValue, element, i, showTime, jsDate, dateText, timeText, timeView, dateView;
    
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
    
    Ti.API.debug("Creating datestamp field: " + this.instance.label);
    
    if (this.instance.settings.time == 1 || (typeof this.instance.settings.granularity !== 'undefined' && typeof this.instance.settings.granularity.hour !== 'undefined' && this.instance.settings.granularity.hour == 1)) {
        showTime = true;
    }
    else {
        showTime = false;
    }

    jsDate = new Date();

    if (dbValue !== null) {
        jsDate.setTime(parseInt(dbValue, 10) * 1000);
    }
    else if (this.instance.settings.default_value == 'now') {
        dbValue = Math.ceil(jsDate.getTime() / 1000);
        textValue = Omadi.utils.formatDate(dbValue, showTime);
    }
    
    dateText = timeText = "";
    if(dbValue !== null){
        dateText = Omadi.utils.formatDate(dbValue, false);
        timeText = Omadi.utils.formatTime(dbValue);
    }

    element = Ti.UI.createView({
        layout: 'composite',
        width: '100%',
        height: Ti.UI.SIZE,
        dbValue: dbValue,
        textValue: textValue,
        showTime: showTime,
        jsDate: jsDate,
        instance: this.instance
    });
    
    element.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
    this.formObj.addCheckConditionalFields(element.check_conditional_fields);
    
    dateView = this.formObj.getLabelField(this.instance);
    dateView.setText(dateText);
    dateView.top = 1;
    dateView.bottom = 1;
    dateView.delta = index;
    dateView.jsDate = jsDate;
    dateView.origDBValue = dbValue;
    dateView.instance = this.instance;

    dateView.addEventListener('click', function(e) {
        try{
            if (e.source.instance.can_edit) {
                Widget[e.source.instance.field_name].displayPicker(e.source.delta, e.source.jsDate, 'date', showTime, e.source.origDBValue);
            }
        }
        catch(ex){
            Utils.sendErrorReport("Exception in dateview click datestamp: " + ex);
        }
    });
    
    this.dateViews[index] = dateView;
    
    element.add(dateView);
    
    if(showTime){
        
        timeView = this.formObj.getLabelField(this.instance);
        timeView.setText(timeText);
        timeView.top = 1;
        timeView.bottom = 1;
        timeView.width = '37%';
        timeView.right = '4%';
        timeView.left = null;
        timeView.delta = index;
        timeView.jsDate = jsDate;
        timeView.origDBValue = dbValue;
        timeView.instance = this.instance;
        
        dateView.width = '53%';
        dateView.left = '4%';
        dateView.right = null;

        timeView.addEventListener('click', function(e) {
            try{
                if (e.source.instance.can_edit) {
                    Widget[e.source.instance.field_name].displayPicker(e.source.delta, e.source.jsDate, 'time', true, e.source.origDBValue);
                }
            }
            catch(ex){
                Utils.sendErrorReport("Exception with timeview clicked in datestamp: " + ex);
            }
        });
        
        this.timeViews[index] = timeView;
        
        element.add(timeView);
    }
    
    return element;
};

DatestampWidget.prototype.displayPicker = function(delta, jsDate, type, showTime, origDBValue) {"use strict";

    var titleLabel, minDate, opacView, maxDate, 
        okButton, clearButton, buttonView, topButtonsView, 
        widgetYear, doneButton, cancelButton;
    
    Ti.API.debug("in display picker");
    
    if(dateWindow === null){
    
        if (Ti.App.isAndroid) {
            Ti.UI.Android.hideSoftKeyboard();
        }
        
        dateWindow = Ti.UI.createWindow({
            orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT],
            modal: true,
            navBarHidden: true,
            delta: delta,
            jsDate: jsDate,
            showTime: showTime,
            origDBValue: origDBValue
        });
    
        opacView = Ti.UI.createView({
            left : 0,
            right : 0,
            top : 0,
            bottom : 0
        });
    
        dateWindow.add(opacView);
        
        // Use a scrollview with ios as the time picker isn't shown in landscape mode
        wrapperView = Ti.UI.createView({
           width: Ti.UI.SIZE,
           height: Ti.UI.SIZE
        });
    
        innerWrapperView = Ti.UI.createView({
            layout : 'vertical',
            height : Ti.UI.SIZE,
            width : Ti.UI.FILL,
            top: 80
        });
     
        titleLabel = Ti.UI.createLabel({
           backgroundGradient: Omadi.display.backgroundGradientGray,
           width: Ti.UI.FILL,
           height: 30,
           textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
           text: this.instance.label,
           color: '#eee',
           font: {
               fontSize: 16,
               fontWeight: 'bold'
           },
           top: 0
        });
        
        wrapperView.add(titleLabel);
     
     
        topButtonsView = Ti.UI.createView({
            height : 50,
            top: 30,
            width: Ti.UI.FILL,
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
            font : {
                fontSize : 14,
                fontWeight: 'bold'
            },
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
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
            delta: delta,
            instance: this.instance,
            origDBValue: origDBValue,
            jsDate: jsDate,
            showTime: showTime
        });
        topButtonsView.add(okButton);
    
        cancelButton = Ti.UI.createLabel({
            text : 'Cancel',
            width : 75,
            left : 10,
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
            delta: delta,
            instance: this.instance,
            origDBValue: origDBValue,
            jsDate: jsDate,
            showTime: showTime
        });
    
        clearButton = Ti.UI.createLabel({
            text : 'Clear',
            width : 80,
            left : 100,
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
            delta: delta,
            instance: this.instance,
            origDBValue: origDBValue,
            jsDate: jsDate,
            showTime: showTime
        });
    
        topButtonsView.add(cancelButton);
    
        topButtonsView.add(clearButton);
        cancelButton.addEventListener('click', function(e) {
            try{
                dateWindow.close();
            }
            catch(ex){
                Utils.sendErrorReport("Could not cancel out of datestamp window: " + ex);
            }
        });
    
        widgetYear = jsDate.getFullYear();
    
        //Min
        minDate = new Date();
        minDate.setFullYear(widgetYear - 5);
        minDate.setMonth(0);
        minDate.setDate(1);
    
        //Max
        maxDate = new Date();
        maxDate.setFullYear(widgetYear + 5);
        maxDate.setMonth(11);
        maxDate.setDate(31);
        
        if(type == 'date'){
            date_picker = Titanium.UI.createPicker({
                useSpinner : true,
                borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                value : jsDate,
                type : Ti.UI.PICKER_TYPE_DATE,
                minDate : minDate,
                maxDate : maxDate,
                color : '#000000',
                height : Ti.UI.SIZE,
                width : Ti.UI.FILL,
                textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER
            });
            
            if(Ti.App.isAndroid){
                date_picker.width = Ti.UI.SIZE;
            }
            
            // This sounds really stupid - and it is! If this onchange listener isn't in place, 
            // then the date won't actually be recorded
            date_picker.addEventListener('change', function(e){
              // Empty, but necessary
              // do not remove this change listener
            });
    
            innerWrapperView.add(date_picker);
        }
        
        if (showTime && type == 'time') {
            time_picker = Titanium.UI.createPicker({
                useSpinner : true,
                borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                value : jsDate,
                type : Ti.UI.PICKER_TYPE_TIME,
                color : '#000000',
                timezone : null,
                height : Ti.UI.SIZE,
                width : Ti.UI.FILL,
                textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
                format24 : (Omadi.utils.getTimeFormat().indexOf('H') !== -1 ? true : false) // Only available on Android
            });
            
            if(Ti.App.isAndroid){
                time_picker.width = Ti.UI.SIZE;
            }
            
            innerWrapperView.add(time_picker);
    
            // This sounds really stupid - and it is! If this onchange listener isn't in place, 
            // then the date won't actually be recorded
            time_picker.addEventListener('change', function(e){ 
               // Empty, but necessary
            });
        }
        
        okButton.addEventListener('click', function(e) {
            var year, month, date, hour, minute, second, newDate, i, callback, pickerValue, datePickerValue, dbValue, textValue, now, widget;
            
            try{
                newDate = null;
                
                widget = Widget[e.source.instance.field_name];
                
                if(typeof date_picker !== 'undefined' && date_picker !== null){
                    
                    pickerValue = date_picker.getValue();
                    
                    if (e.source.showTime) {
                        if(e.source.origDBValue === null){
                            // The clear button was pressed at some point
                            pickerValue.setHours(0);
                            pickerValue.setMinutes(0);
                        }
                        else{
                            pickerValue.setHours(e.source.jsDate.getHours());
                            pickerValue.setMinutes(e.source.jsDate.getMinutes());
                        }    
                    }
                    else {
                        pickerValue.setHours(0);
                        pickerValue.setMinutes(0);
                    }
                    
                    pickerValue.setSeconds(0);
                    
                    newDate = pickerValue;
                }
                else if(typeof time_picker !== 'undefined' && time_picker !== null){
                    pickerValue = time_picker.getValue();
                    
                    if(e.source.origDBValue === null){
                        // The clear button was pressed at some point
                        now = new Date();
                        pickerValue.setFullYear(now.getFullYear());
                        pickerValue.setMonth(now.getMonth());    
                        pickerValue.setDate(now.getDate());
                    }
                    else{
                        pickerValue.setFullYear(e.source.jsDate.getFullYear());
                        pickerValue.setMonth(e.source.jsDate.getMonth());    
                        pickerValue.setDate(e.source.jsDate.getDate());
                    }
                    
                    newDate = pickerValue;
                }
                else{
                    Utils.sendErrorReport("Neither the time picker nor the date picker were defined.");
                }
                
                if(newDate){
                    e.source.jsDate = newDate;
                    dbValue = Math.ceil(newDate.getTime() / 1000);
                    textValue = Omadi.utils.formatDate(dbValue, e.source.showTime);
                    
                    widget.elements[e.source.delta].dbValue = dbValue;
                    widget.elements[e.source.delta].textValue = textValue;
                    
                    widget.dateViews[e.source.delta].jsDate = newDate;
                    widget.dateViews[e.source.delta].setText(Omadi.utils.formatDate(dbValue, false));
                    widget.dateViews[e.source.delta].origDBValue = dbValue;
                    
                    if(e.source.showTime){
                        widget.timeViews[e.source.delta].setText(Omadi.utils.formatTime(dbValue));
                        widget.timeViews[e.source.delta].origDBValue = dbValue;
                        widget.timeViews[e.source.delta].jsDate = newDate;
                    }
            
                    if ( typeof widget.onChangeCallbacks !== 'undefined') {
                        if (widget.onChangeCallbacks.length > 0) {
                            for ( i = 0; i < widget.onChangeCallbacks.length; i++) {
                                callback = widget.onChangeCallbacks[i].callback;
                                widget.formObj[callback](widget.onChangeCallbacks[i].args);
                            }
                        }
                    }
            
                    if (widget.elements[e.source.delta].check_conditional_fields.length > 0) {
                        widget.formObj.setConditionallyRequiredLabels(e.source.instance, widget.elements[e.source.delta].check_conditional_fields);
                    }
                }
                else{
                    Utils.sendErrorReport("Newdate is null or not defined");
                }
            }
            catch(ex){
                Utils.sendErrorReport("Date ok button clicked problem: " + ex);    
            }
            
            try{
                dateWindow.close();
                
                if(type == 'time'){
                    innerWrapperView.remove(time_picker);
                    time_picker = null;
                }
                else{
                    innerWrapperView.remove(date_picker);
                    date_picker = null;
                }
                
                wrapperView.remove(innerWrapperView);
                dateWindow.remove(wrapperView);
                innerWrapperView = null;
                wrapperView = null;
                dateWindow = null; 
            }
            catch(ex1){
                Utils.sendErrorReport("Date ok button closing window problem: " + ex1);
            }
        });
    
        clearButton.addEventListener('click', function(e) {
            var callback, i, widget;
            
            try{
                widget = Widget[e.source.instance.field_name];
                
                widget.elements[e.source.delta].dbValue = null;
                widget.elements[e.source.delta].textValue = "";
                
                widget.dateViews[e.source.delta].setText("");
                widget.dateViews[e.source.delta].origDBValue = null;
                
                if(e.source.showTime){
                    widget.timeViews[e.source.delta].setText("");
                    widget.timeViews[e.source.delta].origDBValue = null;
                }
        
                if ( typeof widget.elements[e.source.delta].onChangeCallbacks !== 'undefined') {
                    if (widget.elements[e.source.delta].onChangeCallbacks.length > 0) {
                        for ( i = 0; i < widget.elements[e.source.delta].onChangeCallbacks.length; i++) {
                            callback = widget.elements[e.source.delta].onChangeCallbacks[i].callback;
                            widget.formObj[callback](widget.elements[e.source.delta].onChangeCallbacks[i].args);
                        }
                    }
                }
        
                if (widget.elements[e.source.delta].check_conditional_fields.length > 0) {
                    widget.formObj.setConditionallyRequiredLabels(e.source.instance, widget.elements[e.source.delta].check_conditional_fields);
                }
            }
            catch(ex){
                Utils.sendErrorReport("Date clear button clicked problem: " + ex);    
            }
    
            try{
                dateWindow.close();
                
                if(type == 'time'){
                    innerWrapperView.remove(time_picker);
                    time_picker = null;
                }
                else{
                    innerWrapperView.remove(date_picker);
                    date_picker = null;
                }
                
                wrapperView.remove(innerWrapperView);
                dateWindow.remove(wrapperView);
                innerWrapperView = null;
                wrapperView = null;
                dateWindow = null;  
            }
            catch(ex1){
                Utils.sendErrorReport("Date clear button closing window problem: " + ex1);
            }
        });
    
        cancelButton.addEventListener('click', function(e) {
    
            try{
                dateWindow.close();
                
                if(type == 'time'){
                    innerWrapperView.remove(time_picker);
                    time_picker = null;
                }
                else{
                    innerWrapperView.remove(date_picker);
                    date_picker = null;
                }
                
                wrapperView.remove(innerWrapperView);
                dateWindow.remove(wrapperView);
                innerWrapperView = null;
                wrapperView = null;
                dateWindow = null; 
            }
            catch(ex1){
                Utils.sendErrorReport("Date cancel button closing window problem: " + ex1);
            }
        });
    
        wrapperView.add(innerWrapperView);
        dateWindow.add(wrapperView);
        
        dateWindow.addEventListener('android:back', function(e){
            try{
                dateWindow.close();
                
                if(type == 'time'){
                    innerWrapperView.remove(time_picker);
                    time_picker = null;
                }
                else{
                    innerWrapperView.remove(date_picker);
                    date_picker = null;
                }
                
                wrapperView.remove(innerWrapperView);
                dateWindow.remove(wrapperView);
                innerWrapperView = null;
                wrapperView = null;
                dateWindow = null; 
            }
            catch(ex1){
                Utils.sendErrorReport("Date cancel button closing window problem: " + ex1);
            }
        });
        
        dateWindow.open();
    }
};

DatestampWidget.prototype.cleanUp = function(){"use strict";
    var i, j;
    Ti.API.debug("in datestamp widget cleanup");
    
    try{
        
        Widget[this.instance.field_name] = null;
        
        for(j = 0; j < this.elements.length; j ++){
            
            if(typeof this.timeViews[j] !== 'undefined'){
                this.elements[j].remove(this.timeViews[j]);
                this.timeViews[j] = null;
            }
            
            if(typeof this.dateViews[j] !== 'undefined'){
                this.elements[j].remove(this.dateViews[j]);
                this.dateViews[j] = null;
            }
            
            this.fieldView.remove(this.elements[j]);
            this.elements[j] = null;
        }
        
        this.fieldView = null;
        this.fieldViewWrapper = null;
        this.formObj = null;
        this.node = null;
        this.dbValues = null;
        this.textValues = null;
        this.nodeElement = null;
        this.instance = null;
        
        Ti.API.debug("At end of datestamp widget cleanup");
    }
    catch(ex){
        try{
            Utils.sendErrorReport("Exception cleaning up datestamp widget field: " + ex);
        }
        catch(ex1){}
    }
    
    Omadi = null;
};

exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new DatestampWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};


