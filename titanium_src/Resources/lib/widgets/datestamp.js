/*jslint eqeq:true, plusplus: true*/
/*global PLATFORM,setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.datestamp = {
    
    //TODO: write a validation function for datestamps
    
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
       
        //Add fields:
        //regionView.add(label[count]);
        //var reffer_index = count;
        Ti.API.debug(instance.numVisibleFields);
        
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
            //widgetView = this._getUIComponent(instance); 
            element = Omadi.widgets.datestamp.getNewElement(node, instance,  i);
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

        
        //No data checkbox functionality
        //noDataCheckbox(reffer_index, regionView, top);
        //if (content[reffer_index].noDataView != null) {
        //    top += 40;
       // }
       
       //fieldViews[this.instance.field_name] = this.fieldView;
       
       //this.fieldView = fieldView;
       //this.initialized = true;
       
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
        
        if(typeof settings.time !== 'undefined' && (settings.time == 1 || typeof settings.granularity.hour !== 'undefined')){
            showTime = true;
        }
        else{
            showTime = false;
        }
        
        Ti.API.debug("Creating datestamp field");
        
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
            
            jsDate: jsDate,
            showTime: showTime
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
    
        if (settings.min_length && settings.min_length != null && settings.min_length != "null") {
            widgetView.minLength = settings.min_length;
        }
        
        widgetView.addEventListener('change', function(e) {
            /*global setConditionallyRequiredLabels*/
            e.source.dbValue = e.source.value;
            e.source.textValue = e.source.value;
            
            if(e.source.check_conditional_fields.length > 0){
                setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
            }
            // changedContentValue(e.source);
            // noDataChecboxEnableDisable(e.source, e.source.reffer_index);
        });
        
        widgetView.addEventListener('click', function(e) {
            if (e.source.instance.can_edit) {
                Omadi.widgets.datestamp.displayPicker(e.source);
            }
        });
        
        return widgetView;
    },
    displayPicker: function(widgetView){"use strict";
        
        var dateWindow, titleLabel, minDate, opacView, maxDate, widgetDate, okButton, wrapperView, buttonView, topButtonsView, widgetYear, date_picker, time_picker, doneButton, cancelButton;
        
        if (PLATFORM == 'android') {
            Ti.UI.Android.hideSoftKeyboard();
            //Ti.API.debug("hid keyboard in display_widget");
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
        //Ti.API.info('====>> Widget settings = ' + widget.settings['time']);
    
        // titleLabel = Ti.UI.createLabel({
            // width : '100%',
            // height : 50,
            // backgroundColor : '#ccc',
            // color : '#000',
            // textAlign : 'center',
            // font : {
                // fontWeight : 'bold',
                // fontSize: 24
            // },
            // text : "Set " + widgetView.instance.label
        // });
        // wrapperView.add(titleLabel);
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
        
        okButton.addEventListener('click', function(e) {
            
    
        });
    
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
        
        topButtonsView.add(cancelButton);
        cancelButton.addEventListener('click', function() {
           
        });
        
        
  
        widgetDate = widgetView.jsDate;
        widgetYear = widgetDate.getFullYear();
        //var changedDate = obj.currentDate;
        //var changedTime = obj.currentDate;
        //iOSDateCal = widgetDate;
        //var date_picker;

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
            widgetView: widgetView,
            height: Ti.UI.SIZE,
            width: '100%'
        });
        
        wrapperView.add(date_picker);
        
        if(widgetView.showTime){
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
                e.source.date_picker.value = e.value;
                //changedTime = e.value;
                e.source.widgetView.tempDate = e.value;
            });
            
            //time_picker.selectionIndicator = true;
            time_picker.date_picker = date_picker;
            date_picker.time_picker = time_picker;
            
            wrapperView.add(time_picker);
        }
            
       
        
        date_picker.addEventListener('change', function(e) {
            if(e.source.widgetView.showTime && typeof e.source.time_picker !== 'undefined'){
                e.source.time_picker.value = e.value;
            }
            //changedDate = e.value;
            //widgetDate = e.value;
            e.source.widgetView.tempDate = e.value;
        });
        
        // buttonView = Ti.UI.createView({
            // height: 70,
            // width: '100%'    
        // });
//         
        // doneButton = Ti.UI.createButton({
            // title : 'Done',
            // bottom : 10,
            // width : '35%',
            // left : '10%',
            // height : 50,
            // widgetView: widgetView
        // });
// 
        // cancelButton = Ti.UI.createButton({
            // title : 'Cancel',
            // bottom : 10,
            // width : '35%',
            // left : '55%',
            // height : 50
        // });
// 
        // buttonView.add(doneButton);
        // buttonView.add(cancelButton);

        okButton.addEventListener('click', function(e) {
            
            // if (PLATFORM == "android") {
                // widgetView.jsDate.setDate(changedDate.getDate());
                // widgetView.jsDate.setMonth(changedDate.getMonth());
                // widgetView.jsDate.setFullYear(changedDate.getFullYear());
                // widgetView.jsDate.setHours(changedTime.getHours());
                // widgetView.jsDate.setMinutes(changedTime.getMinutes());
                // widgetView.jsDate.setSeconds(changedTime.getSeconds());
            // }
            // else {
                //widgetView.jsDate = iOSDateCal;
            //}
            
            var newDate, i, callback;
            
            if(typeof e.source.widgetView.tempDate !== 'undefined'){
                
                newDate = e.source.widgetView.tempDate;
                e.source.widgetView.jsDate = newDate;
                e.source.widgetView.dbValue = Math.ceil(newDate.getTime() / 1000) + "".toString();
                e.source.widgetView.textValue = Omadi.utils.formatDate(e.source.widgetView.dbValue, e.source.widgetView.showTime);
//              
                e.source.widgetView.setTitle(e.source.widgetView.textValue);
                
                if(e.source.widgetView.onChangeCallbacks.length > 0){
                    for(i = 0; i < e.source.widgetView.onChangeCallbacks.length; i ++){
                        callback = e.source.widgetView.onChangeCallbacks[i];
                        callback(e.source.widgetView.onChangeCallbackArgs[i]);
                    }
                }
                
                // obj.value = obj.currentDate.getTime();
    
                // var f_minute = obj.currentDate.getMinutes();
                // var f_hour = obj.currentDate.getHours();
                // var f_date = obj.currentDate.getDate();
                // var f_month = months_set[obj.currentDate.getMonth()];
                // var f_year = obj.currentDate.getFullYear();
//     
                // obj.text = date(omadi_time_format, obj.currentDate) + " - " + f_month + " / " + f_date + " / " + f_year;
                // changedContentValue(obj);
                // setRulesField(obj);
            }
            
            dateWindow.close();
        });

        cancelButton.addEventListener('click', function() {
            // if (obj.value == null) {
                // obj.update_it = false;
            // }
            dateWindow.close();
        });
        //}

        
        dateWindow.add(wrapperView);
        
        dateWindow.open();
        
    }
};
