/*jslint eqeq:true, plusplus: true*/
/*global PLATFORM,setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.user_reference = {
    
    // TODO: add autocomplete widget
    // TODO: add parent default value
    
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

                instance.numVisibleFields = 1;
            }
            else{
                instance.numVisibleFields = settings.cardinality;
            }
        }
        
        // Add the actual fields
        for(i = 0; i < instance.numVisibleFields; i ++){
            //widgetView = this._getUIComponent(instance); 
            element = Omadi.widgets.user_reference.getNewElement(node, instance,  i);
            instance.elements.push(element);
            fieldView.add(element);
            fieldView.add(Omadi.widgets.getSpacerView());
        }
       
       return fieldView;
    },
    getNewElement: function(node, instance, index){"use strict";
        
        var settings, widgetView, dbValue, textValue, i, options, textOptions, loginDetails;
        
        settings = instance.settings;
        
        if(settings.cardinality == -1){
            dbValue = [];
            textValue = '- None -';
            if(typeof node[instance.field_name] !== 'undefined'){
                if(typeof node[instance.field_name].dbValues !== 'undefined'){
                    dbValue = node[instance.field_name].dbValues;
                }
                
                if(typeof node[instance.field_name].textValues !== 'undefined'){
                    textValue = node[instance.field_name].textValues;
                    if(textValue.length > 0){
                        textValue = textValue.join(', ');
                    }
                }
            }
            
            if (dbValue.length == 0 && typeof settings.default_value !== 'undefined' && settings.default_value == "current_user") {
                loginDetails = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
                dbValue.push(loginDetails.user.uid);
                textValue = loginDetails.user.realname;
            }
        }
        else{
            dbValue = null;
            textValue = "";
            if(typeof node[instance.field_name] !== 'undefined'){
                if(typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined'){
                    dbValue = node[instance.field_name].dbValues[index];
                }
                
                if(typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[index] !== 'undefined'){
                    textValue = node[instance.field_name].textValues[index];
                }
            }
            
            if (dbValue === null && typeof settings.default_value !== 'undefined' && settings.default_value == "current_user") {
                loginDetails = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
                dbValue = loginDetails.user.uid;
                textValue = loginDetails.user.realname;
            }
        }
        
        
        Ti.API.debug("Creating user_reference field");
        
        options = Omadi.widgets.user_reference.getOptions(instance);
        textOptions = [];
        
        for(i = 0; i < options.length; i ++){
            textOptions.push(options[i].title);
        }
        
        widgetView = Titanium.UI.createLabel({
            //borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            width : Ti.Platform.displayCaps.platformWidth - 30,
            options : options,
            textOptions: textOptions,
            text : textValue,
            height: 35,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
            font : {
                fontSize : Omadi.widgets.fontSize
            },
            color : '#000000',
            selectionIndicator : true,
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
                    color : '#f3f3f3',
                    offset : 0.0
                }, {
                    color : '#f9f9f9',
                    offset : 0.4
                }, {
                    color : '#bbb',
                    offset : 1.0
                }]
            },
            borderRadius: 10,
            borderColor: '#999',
            borderWidth: 1,
            
            instance: instance,
            dbValue: dbValue,
            textValue: textValue,
            
            view_title : instance.label
        });
        
        if(instance.numVisibleFields > 1){
            widgetView.hintText = '#' + (index + 1) + " " + instance.label;
        }
        
        if(instance.can_edit){
            widgetView.addEventListener('click', function(e) {
                /*global setConditionallyRequiredLabels*/
                var i, postDialog;
                
                if(instance.settings.cardinality == -1){
                    

                        //for (jsa in e.source.itens) {
                        //    Ti.API.info(jsa + ' = ' + e.source.itens[jsa].title);
                        //}
                        //if (e.source.itens.length == 0) {
                        //    var dt = new Date(e.source.violation_time);
                        //    alert("No violations should be enforced at " + e.source.omadi_reference_title + " at " + date(omadi_time_format, dt) + " on " + weekday[dt.getDay()]);
                         //   return;
                        //}
                        Omadi.widgets.getMultipleSelector(e.source);
                        //changedContentValue(e.source);
                        //noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                   
                }
                else{
                    //Ti.API.info('USPS: '+e.row.usps);
                    //e.source.value = e.row.usps;
                    postDialog = Titanium.UI.createOptionDialog();
                    postDialog.options = e.source.textOptions;
                    postDialog.cancel = -1;
                    postDialog.widgetView = e.source;
                    postDialog.show();
        
                    postDialog.addEventListener('click', function(ev) {
                        if (ev.index >= 0) {
                            var textValue = ev.source.options[ev.index];
                            
                            if(textValue == '- None -'){
                                textValue = "";
                            }
                            ev.source.widgetView.textValue = textValue;
                            ev.source.widgetView.setText(textValue);
                            ev.source.widgetView.value = ev.source.widgetView.dbValue = ev.source.widgetView.options[ev.index].dbValue;
                        }
                        
                        if(ev.source.widgetView.check_conditional_fields.length > 0){
                
                            setConditionallyRequiredLabels(ev.source.widgetView.instance, ev.source.widgetView.check_conditional_fields);
                        }
                        //changedContentValue(e.source);
                        //noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                    });
                }
            });
        }
        
        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);
        
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
        
        return widgetView;

    },
    getOptions: function(instance){"use strict";
        var db, result, options, name, referenceable_roles, rid;
        
        
        options = [];
        
        referenceable_roles = [];
        
        // Get the right roles in the list
        for(rid in instance.settings.referenceable_roles){
            if(instance.settings.referenceable_roles.hasOwnProperty(rid)){
                referenceable_roles.push(instance.settings.referenceable_roles[rid]);
            }
        }
        
        //Ti.API.debug("reference: " + JSON.stringify(referenceable_roles));
        if(referenceable_roles.length == 0){
            referenceable_roles.push(3);
            referenceable_roles.push(4);
            referenceable_roles.push(5);
            referenceable_roles.push(6);
        }
        
        if(referenceable_roles.length > 0){
            db = Omadi.utils.openMainDatabase();

            result = db.execute("SELECT u.username, u.realname, u.uid FROM user u JOIN user_roles r ON r.uid = u.uid WHERE u.uid NOT IN (0,1) AND u.status = 1 AND rid IN (" + referenceable_roles.join(",") + ") GROUP BY u.uid ORDER BY u.realname ASC");
            
            if(instance.settings.cardinality != -1 && instance.required == 0){
                options.push({
                   title: '- None -',
                   dbValue: null 
                });
            }
            
            while (result.isValidRow()) {
                if (result.fieldByName('realname') == '') {
                    name = result.fieldByName('username');
                }
                else {
                    name = result.fieldByName('realname');
                }
    
                options.push({
                    title : name,
                    dbValue : result.fieldByName('uid')
                });
    
                result.next();
            }
            result.close();
            db.close();
        }
        
        
        return options;
    }
};


                          
