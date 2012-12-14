/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.taxonomy_term_reference = {
    
    // TODO: add autocomplete widget
    
    getFieldView: function(node, instance){"use strict";
        
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
            
            element = Omadi.widgets.taxonomy_term_reference.getNewElement(node, instance,  i);
            instance.elements.push(element);
            fieldView.add(element);
            fieldView.add(Omadi.widgets.getSpacerView());
        }
       
       return fieldView;
    },
    getNewElement: function(node, instance, index){"use strict";
        
        var settings, widgetView, dbValue, textValue, i, options, textOptions, wrapperView, descriptionText, descriptionLabel;
        
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
                    else{
                        textValue = "";
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
        
        descriptionText = "";
        descriptionLabel = Ti.UI.createLabel({
            height: Ti.UI.SIZE,
            width: '100%',
            text: descriptionText,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
            font: {
                fontSize: 14
            },
            color: '#444'
        });
        
        wrapperView = Ti.UI.createView({
           layout: 'vertical',
           height: Ti.UI.SIZE,
           width: '100%' 
        });
        
        widgetView = Titanium.UI.createLabel({
            
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            width : Ti.Platform.displayCaps.platformWidth - 30,
            options : options,
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
            ellipsize: true,
            wordWrap: false,
            
            instance: instance,
            dbValue: dbValue,
            textValue: textValue,
            value : textValue,
            
            view_title : instance.label,
            descriptionLabel: descriptionLabel
        });
        
        if(instance.numVisibleFields > 1){
            widgetView.hintText = '#' + (index + 1) + " " + instance.label;
        }
        
        if(instance.can_edit){
            widgetView.addEventListener('click', function(e) {
                /*global setConditionallyRequiredLabels*/
                var i, postDialog, textOptions;
                
                if(instance.settings.cardinality == -1){
                    

                        Omadi.widgets.getMultipleSelector(e.source);
                       
                   
                }
                else{
                  
                    textOptions = [];
        
                    for(i = 0; i < e.source.options.length; i ++){
                        textOptions.push(e.source.options[i].title);
                    }
                    
                    postDialog = Titanium.UI.createOptionDialog();
                    postDialog.options = textOptions;
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
            
            if (Ti.App.isAndroid) {
                widgetView.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
            }
        }
        
        wrapperView.add(widgetView);
        wrapperView.add(descriptionLabel);
        
        return wrapperView;

    },
    getOptions: function(instance){"use strict";
    
        var db, result, vid, options;
        db = Omadi.utils.openMainDatabase();
        
        result = db.execute("SELECT vid FROM vocabulary WHERE machine_name = '" + instance.settings.vocabulary + "'");
        vid = result.fieldByName('vid');
        result.close();
        
        result = db.execute("SELECT name, tid, description FROM term_data WHERE vid='" + vid + "' GROUP BY name ORDER BY CAST(`weight` AS INTEGER) ASC");

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
                dbValue : result.fieldByName('tid'),
                description: result.fieldByName('description')
            });
            result.next();
        }
        result.close();
        db.close();
        
        return options;
    }
};                        
