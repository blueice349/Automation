/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.text_long = {
    
    
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
            element = Omadi.widgets.text_long.getNewElement(node, instance,  i);
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
        
        var settings, widgetView, dbValue, textValue;
        
        dbValue = "";
        textValue = "";
        if(typeof node[instance.field_name] !== 'undefined'){
            if(typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined'){
                dbValue = node[instance.field_name].dbValues[index];
            }
            
            if(typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[index] !== 'undefined'){
                textValue = node[instance.field_name].textValues[index];
            }
        }
        
        settings = instance.settings;
        
        widgetView = Ti.UI.createTextArea({
            autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
            autocorrect: true,
            editable : instance.can_edit,
            enabled : instance.can_edit,
            ellipsize: false,
            keepScreenOn: true,
            suppessReturn: false,
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            width : Ti.Platform.displayCaps.platformWidth - 30,
            height : 100,
            color : '#000000',
            font: {
                fontSize: Omadi.widgets.fontSize
            },
            returnKeyType : Ti.UI.RETURNKEY_DONE,
            backgroundColor: '#fff',
            borderRadius: 10,
            borderColor: '#999',
            borderWidth: 1,
            
            instance: instance,
            dbValue: dbValue,
            textValue: textValue,
            value : textValue
        });
        
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

        widgetView.addEventListener('blur', function(e) {
            //Ti.API.info(e.source.value.length + ' or ' + e.value.length + ' Field number ==> min: ' + e.source.myminLength + ' max: ' + e.source.mymaxLength);
            
            
        });
        
        return widgetView;
    }
};
