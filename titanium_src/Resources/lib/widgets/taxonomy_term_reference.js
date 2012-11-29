/*jslint eqeq:true, plusplus: true*/
/*global PLATFORM,setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.taxonomy_term_reference = {
    
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
            element = Omadi.widgets.taxonomy_term_reference.getNewElement(node, instance,  i);
            instance.elements.push(element);
            fieldView.add(element);
            fieldView.add(Omadi.widgets.getSpacerView());
        }
       
       return fieldView;
    },
    getNewElement: function(node, instance, index){"use strict";
        
        var settings, widgetView, dbValue, textValue, i, options, textOptions;
        
        if(instance.settings.cardinality == -1){
            dbValue = [];
            textValue = '';
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
        }
        
        settings = instance.settings;
        Ti.API.debug("Creating taxonomy_term_reference field");
        
        options = Omadi.widgets.taxonomy_term_reference.getOptions(instance);
        textOptions = [];
        
        for(i = 0; i < options.length; i ++){
            textOptions.push(options[i].title);
        }
        
        widgetView = Titanium.UI.createButton({
            //borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            width : Ti.Platform.displayCaps.platformWidth - 30,
            options : options,
            textOptions: textOptions,
            title : textValue,
            height: 35,
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
            borderColor: '#999',
            borderRadius: 5,
            
            instance: instance,
            dbValue: dbValue,
            textValue: textValue,
            value : textValue,
            
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
                            ev.source.widgetView.setTitle(textValue);
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
        
        return widgetView;

    },
    getOptions: function(instance){"use strict";
        var db, result, vid, options;
        db = Omadi.utils.openMainDatabase();
        
        result = db.execute("SELECT vid FROM vocabulary WHERE machine_name = '" + instance.settings.vocabulary + "'");
        vid = result.fieldByName('vid');
        result.close();
        
        result = db.execute("SELECT * FROM term_data WHERE vid='" + vid + "' GROUP BY name ORDER BY CAST(`weight` AS INTEGER) ASC");

        options = [];
        
        if(instance.settings.cardinality != -1 && instance.required == 0){
            options.push({
               title: '- None -',
               dbValue: null 
            });
        }
        
        while (result.isValidRow()) {
            options.push({
                title : result.fieldByName('name'),
                dbValue : result.fieldByName('tid')
            });
            result.next();
        }
        result.close();
        db.close();
        
        return options;
    }
};


                          
