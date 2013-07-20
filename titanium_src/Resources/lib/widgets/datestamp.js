/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.datestamp = {

    getFieldView : function(node, instance) {"use strict";

        instance.elements = [];

        var settings = instance.settings, fieldView, i, j, element, addAnotherItemButton = null;

        fieldView = Ti.UI.createView({
            width : '100%',
            layout : 'vertical',
            height : Ti.UI.SIZE,
            instance : instance
        });

        instance.fieldView = fieldView;

        fieldView.add(Omadi.widgets.label.getRegularLabelView(instance));
        setConditionallyRequiredLabelForInstance(node, instance);

        if ( typeof instance.numVisibleFields === 'undefined') {

            if (settings.cardinality == -1) {
                if ( typeof node[instance.field_name] !== 'undefined' && node[instance.field_name].dbValues.length > 0) {
                    instance.numVisibleFields = node[instance.field_name].dbValues.length;
                }
                else {
                    instance.numVisibleFields = 1;
                }
            }
            else {
                instance.numVisibleFields = settings.cardinality;
            }
        }

        // Add the actual fields
        for ( i = 0; i < instance.numVisibleFields; i++) {
            element = Omadi.widgets.datestamp.getNewElement(node, instance, i);
            instance.elements.push(element);
            fieldView.add(element);
            fieldView.add(Omadi.widgets.getSpacerView());
        }

        if (settings.cardinality == -1) {
            addAnotherItemButton = Ti.UI.createButton({
                title : 'Add another item',
                right : 15,
                instance : instance
            });

            addAnotherItemButton.addEventListener('click', function(e) {
                var instance = e.source.instance;
                instance.numVisibleFields++;
                Omadi.widgets.shared.redraw(instance);
            });

            fieldView.add(addAnotherItemButton);
            fieldView.add(Omadi.widgets.getSpacerView());
        }
        
        Ti.UI.currentWindow.addEventListener('close', function(){
            var i;
            
            for(i = 0; i < instance.elements.length; i ++){
                fieldView.remove(instance.elements[i]);
                instance.elements[i] = null;
            }
            
            instance.fieldView = null;
        }); 

        return fieldView;
    },
    getNewElement : function(node, instance, index) {"use strict";

        var settings, widgetView, dbValue, textValue, showTime, jsDate, dateView, dateText, timeView, timeText;

        settings = instance.settings;

        dbValue = null;
        textValue = "";

        if ( typeof node[instance.field_name] !== 'undefined') {
            if ( typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined' && typeof node[instance.field_name].dbValues[index] != null) {
                dbValue = node[instance.field_name].dbValues[index];
            }

            if ( typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[index] !== 'undefined' && typeof node[instance.field_name].textValues[index] != "") {
                textValue = node[instance.field_name].textValues[index];
            }
        }

        //Ti.API.debug(settings);

        if (settings.time == 1 || (typeof settings.granularity !== 'undefined' && typeof settings.granularity.hour !== 'undefined' && settings.granularity.hour == 1)) {
            showTime = true;
        }
        else {
            showTime = false;
        }

        Ti.API.debug("Creating datestamp field");

        jsDate = new Date();

        if (dbValue !== null) {
            jsDate.setTime(parseInt(dbValue, 10) * 1000);
            Ti.API.debug(instance.field_name + " DATE HAS A VALUE");
        }
        else if (settings.default_value == 'now') {
            dbValue = Math.ceil(jsDate.getTime() / 1000);
            textValue = Omadi.utils.formatDate(dbValue, showTime);
        }
        
        dateText = timeText = "";
        if(dbValue !== null){
            dateText = Omadi.utils.formatDate(dbValue, false);
            timeText = Omadi.utils.formatTime(dbValue);
        }

        widgetView = Ti.UI.createView({
            layout: 'composite',
            width: '100%',
            height: Ti.UI.SIZE,
            dbValue: dbValue,
            textValue: textValue,
            showTime: showTime,
            jsDate: jsDate
        });
        
        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);
        
        dateView = Omadi.widgets.getLabelField(instance);
        dateView.setText(dateText);
        dateView.widgetView = widgetView;
        dateView.top = 1;
        dateView.bottom = 1;
        
        Ti.API.debug(dateText);
        Ti.API.debug(dbValue);

        dateView.addEventListener('click', function(e) {
            if (e.source.instance.can_edit) {
                Omadi.widgets.datestamp.displayPicker(e.source.widgetView, 'date');
            }
        });
        
        widgetView.dateView = dateView;
        
        widgetView.add(dateView);
        
        if(showTime){
            
            timeView = Omadi.widgets.getLabelField(instance);
            timeView.setText(timeText);
            timeView.widgetView = widgetView;
            timeView.top = 1;
            timeView.bottom = 1;
            timeView.width = '37%';
            timeView.right = '4%';
            timeView.left = null;
            
            dateView.width = '53%';
            dateView.left = '4%';
            dateView.right = null;
    
            timeView.addEventListener('click', function(e) {
                if (e.source.instance.can_edit) {
                    Omadi.widgets.datestamp.displayPicker(e.source.widgetView, 'time');
                }
            });
            
            widgetView.timeView = timeView;
            
            widgetView.add(timeView);
        }

        return widgetView;
    },
    displayPicker : function(widgetView, type) {"use strict";

        var dateWindow, titleLabel, minDate, opacView, maxDate, widgetDate, 
            okButton, clearButton, wrapperView, buttonView, topButtonsView, 
            widgetYear, date_picker, time_picker, doneButton, cancelButton, 
            innerWrapperView;

        if (Ti.App.isAndroid) {
            Ti.UI.Android.hideSoftKeyboard();
        }
        
        dateWindow = Ti.UI.createWindow();
        
        if(Ti.App.isAndroid){
            dateWindow.modal = true;
            dateWindow.navBarHidden = true;
        }

        opacView = Ti.UI.createView({
            left : 0,
            right : 0,
            top : 0,
            bottom : 0,
            backgroundColor : '#000000',
            opacity : 0.5
        });

        dateWindow.add(opacView);
        
        // Use a scrollview with ios as the time picker isn't shown in landscape mode
        wrapperView = Ti.UI.createView({
           width: Ti.UI.SIZE,
           height: Ti.UI.SIZE,
           backgroundColor: '#000'
        });
    
        innerWrapperView = Ti.UI.createView({
            layout : 'vertical',
            height : Ti.UI.SIZE,
            width : Ti.UI.FILL,
            opacity : 1,
            top: 50
        });
     
        topButtonsView = Ti.UI.createView({
            height : 50,
            top: 0,
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
            }
        });
        topButtonsView.add(okButton);

        cancelButton = Ti.UI.createLabel({
            text : 'Cancel',
            width : 75,
            left : 10,
            height: 35,
            widgetView : widgetView,
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
            widgetView : widgetView,
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

        topButtonsView.add(cancelButton);

        topButtonsView.add(clearButton);
        cancelButton.addEventListener('click', function() {

        });

        widgetDate = widgetView.jsDate;
        widgetYear = widgetDate.getFullYear();

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
                value : widgetDate,
                type : Ti.UI.PICKER_TYPE_DATE,
                minDate : minDate,
                maxDate : maxDate,
                color : '#000000',
                widgetView : widgetView,
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
            okButton.date_picker = date_picker;
        }
        
        if (widgetView.showTime && type == 'time') {
            time_picker = Titanium.UI.createPicker({
                useSpinner : true,
                borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                value : widgetDate,
                type : Ti.UI.PICKER_TYPE_TIME,
                color : '#000000',
                timezone : null,
                widgetView : widgetView,
                height : Ti.UI.SIZE,
                width : Ti.UI.FILL,
                textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
                format24 : (Omadi.utils.getTimeFormat().indexOf('H') !== -1 ? true : false) // Only available on Android
            });
            
            if(Ti.App.isAndroid){
                time_picker.width = Ti.UI.SIZE;
            }
            
            okButton.time_picker = time_picker;
            innerWrapperView.add(time_picker);

            // This sounds really stupid - and it is! If this onchange listener isn't in place, 
            // then the date won't actually be recorded
            time_picker.addEventListener('change', function(e){ 
               // Empty, but necessary
            });
        }
        
        okButton.widgetView = widgetView;
        
        okButton.addEventListener('click', function(e) {
            var year, month, date, hour, minute, second, newDate, i, callback, pickerValue, datePickerValue, dbValue, now;
            /*global setConditionallyRequiredLabels*/
            
            if(typeof e.source.date_picker !== 'undefined'){
                pickerValue = e.source.date_picker.getValue();
                
                if (e.source.widgetView.showTime) {
                    if(e.source.widgetView.dbValue === null){
                        // The clear button was pressed at some point
                        pickerValue.setHours(0);
                        pickerValue.setMinutes(0);
                    }
                    else{
                        pickerValue.setHours(e.source.widgetView.jsDate.getHours());
                        pickerValue.setMinutes(e.source.widgetView.jsDate.getMinutes());
                    }    
                }
                else {
                    pickerValue.setHours(0);
                    pickerValue.setMinutes(0);
                }
                
                pickerValue.setSeconds(0);
                
                newDate = pickerValue;
            }
            else if(typeof e.source.time_picker !== 'undefined'){
                pickerValue = e.source.time_picker.getValue();
                
                if(e.source.widgetView.dbValue === null){
                    // The clear button was pressed at some point
                    now = new Date();
                    pickerValue.setFullYear(now.getFullYear());
                    pickerValue.setMonth(now.getMonth());    
                    pickerValue.setDate(now.getDate());
                }
                else{
                    pickerValue.setFullYear(e.source.widgetView.jsDate.getFullYear());
                    pickerValue.setMonth(e.source.widgetView.jsDate.getMonth());    
                    pickerValue.setDate(e.source.widgetView.jsDate.getDate());
                }
                
                newDate = pickerValue;
            }
            
            e.source.widgetView.jsDate = newDate;
            e.source.widgetView.dbValue = dbValue = Math.ceil(newDate.getTime() / 1000);
            e.source.widgetView.textValue = Omadi.utils.formatDate(e.source.widgetView.dbValue, e.source.widgetView.showTime);
            e.source.widgetView.dateView.setText(Omadi.utils.formatDate(dbValue, false));
            
            if(e.source.widgetView.showTime){
                e.source.widgetView.timeView.setText(Omadi.utils.formatTime(dbValue));
            }
            //Ti.API.debug(newDate.toString());

            if ( typeof e.source.widgetView.onChangeCallbacks !== 'undefined') {
                if (e.source.widgetView.onChangeCallbacks.length > 0) {
                    for ( i = 0; i < e.source.widgetView.onChangeCallbacks.length; i++) {
                        callback = e.source.widgetView.onChangeCallbacks[i];
                        callback(e.source.widgetView.onChangeCallbackArgs[i]);
                    }
                }
            }

            if (e.source.widgetView.check_conditional_fields.length > 0) {
                setConditionallyRequiredLabels(e.source.widgetView.instance, e.source.widgetView.check_conditional_fields);
            }

            dateWindow.close();
        });

        clearButton.addEventListener('click', function(e) {
            /*global setConditionallyRequiredLabels*/

            e.source.widgetView.dbValue = null;
            e.source.widgetView.textValue = "";

            e.source.widgetView.dateView.setText("");
            
            if(e.source.widgetView.showTime){
                e.source.widgetView.timeView.setText("");
            }

            if (e.source.widgetView.check_conditional_fields.length > 0) {
                setConditionallyRequiredLabels(e.source.widgetView.instance, e.source.widgetView.check_conditional_fields);
            }

            dateWindow.close();
        });

        cancelButton.addEventListener('click', function() {

            dateWindow.close();
        });

        wrapperView.add(innerWrapperView);
        dateWindow.add(wrapperView);

        dateWindow.open();

    }
};
