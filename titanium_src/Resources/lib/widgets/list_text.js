/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField, dbEsc*/

Omadi.widgets.list_text = {

    getFieldView : function(node, instance) {"use strict";

        instance.elements = [];

        var settings = instance.settings, fieldView, i, j, element;

        fieldView = Ti.UI.createView({
            width : '100%',
            layout : 'vertical',
            height : Ti.UI.SIZE,
            instance : instance
        });

        instance.fieldView = fieldView;

        fieldView.add(Omadi.widgets.label.getRegularLabelView(instance));
        //setConditionallyRequiredLabelForInstance(node, instance);

        instance.numVisibleFields = 1;
           
        // Add the actual fields
        for ( i = 0; i < instance.numVisibleFields; i++) {

            element = Omadi.widgets.list_text.getNewElement(node, instance, i);
            instance.elements.push(element);
            fieldView.add(element);
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

        var settings, widgetView, dbValue, textValue, i, options, textOptions, wrapperView, 
            descriptionText, descriptionLabel;
        
        settings = instance.settings;
        
        dbValue = null;
        textValue = "";
        if ( typeof node[instance.field_name] !== 'undefined') {
            if ( typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined') {
                dbValue = node[instance.field_name].dbValues[index];
            }

            if ( typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[index] !== 'undefined') {
                textValue = node[instance.field_name].textValues[index];
            }
        }
        
        Ti.API.debug("Creating list_text field");

        options = Omadi.widgets.list_text.getOptions(instance);
        
        if (dbValue === null && typeof settings.default_value !== 'undefined') {
            if(settings.default_value.length > 0){
                dbValue = settings.default_value;
                
                for(i = 0; i < options.length; i ++){
                    if(options[i].dbValue == dbValue){
                        textValue = options[i].title;
                        break;
                    }
                }
            }
        }

        descriptionText = "";
        descriptionLabel = Ti.UI.createLabel({
            height : Ti.UI.SIZE,
            width : '100%',
            text : descriptionText,
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
            font : {
                fontSize : 14
            },
            color : '#444'
        });

        wrapperView = Ti.UI.createView({
            layout : 'vertical',
            height : Ti.UI.SIZE,
            width : '100%'
        });
        
        // This is a specialty section for only dispatch forms
        // Do not allow the work form to change if it has already been saved
        if(instance.field_name == 'field_tow_type' && dbValue !== null){
            instance.can_edit = false;
        }
        
        widgetView = Omadi.widgets.getLabelField(instance);
        widgetView.top = 1;
        widgetView.bottom = 1;
        widgetView.view_title = instance.label;
        widgetView.descriptionLabel = descriptionLabel;
        widgetView.options = options;
        widgetView.setText(textValue);
        widgetView.textValue = textValue;
        widgetView.dbValue = dbValue;
        
        if (instance.can_edit) {
            widgetView.addEventListener('click', function(e) {
                /*global setConditionallyRequiredLabels*/
                var i, postDialog, textOptions;

                textOptions = [];
                for ( i = 0; i < e.source.options.length; i++) {
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

                        if (textValue == '- None -') {
                            textValue = "";
                        }
                        ev.source.widgetView.textValue = textValue;
                        ev.source.widgetView.setText(textValue);
                        ev.source.widgetView.value = ev.source.widgetView.dbValue = ev.source.widgetView.options[ev.index].dbValue;
                        
                        // This is a special case for dispatching
                        if(ev.source.widgetView.instance.field_name == 'field_tow_type'){
                            Ti.App.fireEvent("omadi:dispatch:towTypeChanged", {
                                dbValue : ev.source.widgetView.dbValue
                            });
                        }
                    }

                    // if (ev.source.widgetView.check_conditional_fields.length > 0) {
// 
                        // setConditionallyRequiredLabels(ev.source.widgetView.instance, ev.source.widgetView.check_conditional_fields);
                    // }
                });
                
            });
        }
        
        //widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);

        wrapperView.add(widgetView);
        wrapperView.add(descriptionLabel);
        
        return wrapperView;
    },
    getOptions : function(instance) {"use strict";
        var options, key;
        
        options = [];

        if (instance.required == 0) {
            options.push({
                title : '- None -',
                dbValue : null
            });
        }

        //Ti.API.debug(instance);
        
        if(typeof instance.settings.allowed_values !== 'undefined'){
            for(key in instance.settings.allowed_values){
                if(instance.settings.allowed_values.hasOwnProperty(key)){
                    options.push({
                        title : instance.settings.allowed_values[key],
                        dbValue : key
                    });
                }
            }
        }

        return options;
    }
};




