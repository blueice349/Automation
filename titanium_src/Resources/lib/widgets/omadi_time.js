/*jslint eqeq:true, plusplus: true*/
/*global PLATFORM,setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.omadi_time = {
    
    getFieldView: function(node, instance){"use strict";
        //this.base = Omadi.widgets.base.init(in_instance);
        instance.elements = [];
        
        var settings = instance.settings, fieldView, i, j, element, addAnotherItemButton = null;
        
        fieldView = Ti.UI.createView({
           width: '100%',
           layout: 'vertical',
           height: Ti.UI.SIZE,
           instance: instance
        });
        
        instance.fieldView = fieldView;
        
        fieldView.add(Omadi.widgets.label.getRegularLabelView(instance));
        setConditionallyRequiredLabelForInstance(node, instance);
        
        if(typeof instance.numVisibleFields === 'undefined'){
            
            if(settings.cardinality == -1){
                if(typeof node[instance.field_name] !== 'undefined' && node[instance.field_name].dbValues.length > 0){
                    instance.numVisibleFields = node[instance.field_name].dbValues.length;
                }
                else{
                    instance.numVisibleFields = 1;
                }
            }
            else{
                instance.numVisibleFields = settings.cardinality;
            }
        }
        
        // Add the actual fields
        for(i = 0; i < instance.numVisibleFields; i ++){
            element = Omadi.widgets.omadi_time.getNewElement(node, instance,  i);
            instance.elements.push(element);
            fieldView.add(element);
            fieldView.add(Omadi.widgets.getSpacerView());
        }
        
        if(settings.cardinality == -1){
            addAnotherItemButton = Ti.UI.createButton({
               title: 'Add another item',
               right: 15,
               instance: instance
            });
            
            addAnotherItemButton.addEventListener('click', function(e){
                var instance = e.source.instance;
                instance.numVisibleFields ++;
                Omadi.widgets.shared.redraw(instance);
            });
        
            fieldView.add(addAnotherItemButton);
            fieldView.add(Omadi.widgets.getSpacerView());
        }
       
        return fieldView;
    },
    getNewElement: function(node, instance, index){"use strict";
        
        var settings, widgetView, dbValue, textValue, showTime, jsDate;
        
        settings = instance.settings;
        
        dbValue = null;
        textValue = "";
        
        if(typeof node[instance.field_name] !== 'undefined'){
            if(typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined' && typeof node[instance.field_name].dbValues[index] != null){
                dbValue = node[instance.field_name].dbValues[index];
            }
            
            if(typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[index] !== 'undefined' && typeof node[instance.field_name].textValues[index] != ""){
                textValue = node[instance.field_name].textValues[index];
            }
        }
        
        Ti.API.debug(settings);
        
        Ti.API.debug("Creating omadi_time field");
        
        jsDate = new Date();
        
        if(dbValue !== null){
            jsDate.setTime(parseInt(dbValue, 10) * 1000);
            Ti.API.debug(instance.field_name + " DATE HAS A VALUE");
        }
        else if(settings.default_value == 'now'){

            dbValue = Math.ceil(jsDate.getTime() / 1000);
            
            textValue = Omadi.utils.formatDate(dbValue, showTime);
            
            Ti.API.debug("set to NOW");
        }
        
        widgetView = Titanium.UI.createButton({
            //borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            width : Ti.Platform.displayCaps.platformWidth - 30,
            title : textValue,
            height: 35,
            font : {
                fontSize : Omadi.widgets.fontSize
            },
            color : '#000000',
            selectionIndicator : true,
            backgroundColor : '#fff',
            borderColor: '#999',
            borderRadius: 5,
            
            instance: instance,
            dbValue: dbValue,
            textValue: textValue,
            value : textValue,
            
            jsDate: jsDate
        });
        
        
        //widgetView.hintText = '(000) 000-0000 x0000';
        
        
        //hintText : instance.label,
        
        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);
        
        if (PLATFORM == 'android') {
            widgetView.backgroundImage = '/images/textfield.png';
        }
        
        if (!instance.can_edit) {
            widgetView.backgroundImage = '';
            widgetView.backgroundColor = '#BDBDBD';
            widgetView.borderColor = 'gray';
            widgetView.borderRadius = 10;
            widgetView.color = '#848484';
            widgetView.paddingLeft = 3;
            widgetView.paddingRight = 3;
            if (PLATFORM == 'android') {
                widgetView.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
            }
        }
        
        widgetView.addEventListener('click', function(e) {
            if (e.source.instance.can_edit) {
                Omadi.widgets.omadi_time.displayPicker(e.source);
            }
        });
        
        return widgetView;
    },
    displayPicker: function(widgetView){"use strict";
        
        var dateWindow, titleLabel, minDate, opacView, widgetDate, okButton, clearButton, wrapperView, buttonView, topButtonsView, time_picker, doneButton, cancelButton;
        
        if (PLATFORM == 'android') {
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
            layout: 'vertical',
            height: Ti.UI.SIZE,
            width: Ti.UI.SIZE,
            opacity: 1
        });
       
       topButtonsView = Ti.UI.createView({
            bottom: 0,
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
            width: 80,
            widgetView: widgetView,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            color: '#fff',
            borderRadius: 5,
            font: {
                fontSize: 14
            },
            borderWidth: 1,
            borderColor: '#555',
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
            width: 80,
            top : 7,
            bottom : 7,
            left : 10,
            widgetView: widgetView,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            color: '#fff',
            borderRadius: 5,
            font: {
                fontSize: 14
            },
            borderWidth: 1,
            borderColor: '#555',
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
            width: 80,
            top : 7,
            bottom : 7,
            left : 100,
            widgetView: widgetView,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            color: '#fff',
            borderRadius: 5,
            font: {
                fontSize: 14
            },
            borderWidth: 1,
            borderColor: '#555',
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
            widgetView: widgetView,
            height: Ti.UI.SIZE,
            width: '100%'
            //format24 : (omadi_time_format == 'g:iA' ? false : true)
        });
        
        time_picker.addEventListener('change', function(e) {
            e.source.widgetView.tempDate = e.value;
            Ti.API.debug(e.value);
        });

        wrapperView.add(time_picker);
  
        okButton.addEventListener('click', function(e) {
            /*global setConditionallyRequiredLabels*/
            var newDate, i, callback;
            
            if(typeof e.source.widgetView.tempDate === 'undefined'){
                e.source.widgetView.tempDate = e.source.widgetView.jsDate;
            }
                
            newDate = e.source.widgetView.tempDate;
            e.source.widgetView.jsDate = newDate;
            e.source.widgetView.textValue = Omadi.utils.PHPFormatDate(Math.ceil(newDate.getTime() / 1000), 'g:i A');
            e.source.widgetView.dbValue = Omadi.widgets.omadi_time.dateToSeconds(e.source.widgetView.textValue);
            
            //Ti.API.error(e.source.widgetView.dbValue);
            
            e.source.widgetView.setTitle(e.source.widgetView.textValue);
            
            if(e.source.widgetView.check_conditional_fields.length > 0){
                setConditionallyRequiredLabels(e.source.widgetView.instance, e.source.widgetView.check_conditional_fields);
            }
            
            dateWindow.close();
        });
        
        clearButton.addEventListener('click', function(e) {
            /*global setConditionallyRequiredLabels*/
           
            e.source.widgetView.dbValue = null;
            e.source.widgetView.textValue = "";
            
            e.source.widgetView.setTitle(e.source.widgetView.textValue);
            
            if(e.source.widgetView.check_conditional_fields.length > 0){
                setConditionallyRequiredLabels(e.source.widgetView.instance, e.source.widgetView.check_conditional_fields);
            }
            
            dateWindow.close();
        });

        cancelButton.addEventListener('click', function() {
            dateWindow.close();
        });
        
        dateWindow.add(wrapperView);
        
        dateWindow.open();
        
    },
    dateToSeconds: function(time_text){"use strict";
        
        var is_pm, is_am, time_split, seconds;
        
        time_text = time_text.toUpperCase();
  
        is_pm = (time_text.indexOf('PM') !== -1);
        is_am = (time_text.indexOf('AM') !== -1);
  
        time_text = Omadi.utils.trimWhiteSpace(time_text.replace(/(AM|PM)/g, ''));
  
        time_split = time_text.split(':'); // splite time string into hours & minutes
        seconds = (3600 * parseInt(time_split[0], 10)) + (parseInt(time_split[1], 10) * 60);  // hours + min
  
        if(is_pm && time_split[0] != 12){
            seconds += (12 * 3600);
        }
        else if(is_am && time_split[0] == 12){
            seconds -= (12 * 3600);
        }
  
        return seconds;
    }
};
