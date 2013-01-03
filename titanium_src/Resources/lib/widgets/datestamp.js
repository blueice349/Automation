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

        return fieldView;
    },
    getNewElement : function(node, instance, index) {"use strict";

        var settings, widgetView, dbValue, textValue, showTime, jsDate;

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

        Ti.API.debug("Datestamp settings: " + settings.time);

        if (settings.time == 1 || typeof settings.granularity.hour !== 'undefined') {
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

        widgetView = Omadi.widgets.getLabelField(instance);
        widgetView.setText(textValue);
        widgetView.textValue = textValue;
        widgetView.dbValue = dbValue;
        widgetView.showTime = showTime;
        widgetView.jsDate = jsDate;

        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);

        widgetView.addEventListener('click', function(e) {
            if (e.source.instance.can_edit) {
                Omadi.widgets.datestamp.displayPicker(e.source);
            }
        });

        return widgetView;
    },
    displayPicker : function(widgetView) {"use strict";

        var dateWindow, titleLabel, minDate, opacView, maxDate, widgetDate, okButton, clearButton, wrapperView, buttonView, topButtonsView, widgetYear, date_picker, time_picker, doneButton, cancelButton;

        if (Ti.App.isAndroid) {
            Ti.UI.Android.hideSoftKeyboard();
        }

        dateWindow = Ti.UI.createWindow({

        });

        opacView = Ti.UI.createView({
            left : 0,
            right : 0,
            top : 0,
            bottom : 0,
            backgroundColor : '#000000',
            opacity : 0.5
        });

        dateWindow.add(opacView);

        wrapperView = Ti.UI.createView({
            layout : 'vertical',
            height : Ti.UI.SIZE,
            width : Ti.UI.SIZE,
            opacity : 1
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

        okButton = Ti.UI.createButton({
            title : 'Done',
            top : 7,
            bottom : 7,
            right : 10,
            width : 80,
            style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            color : '#fff',
            borderRadius : 5,
            font : {
                fontSize : 14
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
        topButtonsView.add(okButton);

        cancelButton = Ti.UI.createButton({
            title : 'Cancel',
            width : 80,
            top : 7,
            bottom : 7,
            left : 10,
            widgetView : widgetView,
            style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            color : '#fff',
            borderRadius : 5,
            font : {
                fontSize : 14
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

        clearButton = Ti.UI.createButton({
            title : 'Clear',
            width : 80,
            top : 7,
            bottom : 7,
            left : 100,
            widgetView : widgetView,
            style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            color : '#fff',
            borderRadius : 5,
            font : {
                fontSize : 14
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

        date_picker = Titanium.UI.createPicker({
            useSpinner : true,
            borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            value : widgetDate,
            font : {
                fontSize : 18
            },
            type : Ti.UI.PICKER_TYPE_DATE,
            minDate : minDate,
            maxDate : maxDate,
            color : '#000000',
            widgetView : widgetView,
            height : Ti.UI.SIZE,
            width : '100%',
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        
        // This sounds really stupid - and it is! If this onchange listener isn't in place, 
        // then the date won't actually be recorded
        date_picker.addEventListener('change', function(e){
          // Empty, but necessary
        });

        wrapperView.add(date_picker);

        if (widgetView.showTime) {
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
                widgetView : widgetView,
                height : Ti.UI.SIZE,
                width : '100%',
                textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
                format24 : (Omadi.utils.getTimeFormat().indexOf('H') !== -1 ? true : false) // Only available on Android
            });
            
            okButton.time_picker = time_picker;
            wrapperView.add(time_picker);

            // This sounds really stupid - and it is! If this onchange listener isn't in place, 
            // then the date won't actually be recorded
            time_picker.addEventListener('change', function(e){ 
               // Empty, but necessary
            });
        }
        
        okButton.widgetView = widgetView;
        okButton.date_picker = date_picker;
        
        okButton.addEventListener('click', function(e) {
            var year, month, date, hour, minute, second, newDate, i, callback, timePickerValue, datePickerValue;
            /*global setConditionallyRequiredLabels*/

            datePickerValue = e.source.date_picker.getValue();

            if (e.source.widgetView.showTime) {
                
                timePickerValue = e.source.time_picker.getValue();
                datePickerValue.setHours(timePickerValue.getHours());
                datePickerValue.setMinutes(timePickerValue.getMinutes());
            }
            else {
                datePickerValue.setHours(0);
                datePickerValue.setMinutes(0);
            }

            datePickerValue.setSeconds(0);

            newDate = datePickerValue;
            e.source.widgetView.jsDate = newDate;
            
            Ti.API.debug(newDate.toString());

            e.source.widgetView.dbValue = Math.ceil(newDate.getTime() / 1000);
            e.source.widgetView.textValue = Omadi.utils.formatDate(e.source.widgetView.dbValue, e.source.widgetView.showTime);

            e.source.widgetView.setText(e.source.widgetView.textValue);

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

            e.source.widgetView.setText(e.source.widgetView.textValue);

            if (e.source.widgetView.check_conditional_fields.length > 0) {
                setConditionallyRequiredLabels(e.source.widgetView.instance, e.source.widgetView.check_conditional_fields);
            }

            dateWindow.close();
        });

        cancelButton.addEventListener('click', function() {

            dateWindow.close();
        });

        dateWindow.add(wrapperView);

        dateWindow.open();

    }
};
