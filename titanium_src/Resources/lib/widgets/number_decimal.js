/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.number_decimal = {

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

            element = Omadi.widgets.number_decimal.getNewElement(node, instance, i);
            instance.elements.push(element);
            fieldView.add(element);
            fieldView.add(Omadi.widgets.getSpacerView());
        }

        if (settings.cardinality == -1) {
            addAnotherItemButton = Ti.UI.createButton({
                title : 'Add another item',
                right : 15,
                instance : instance,
                style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
                backgroundGradient: Omadi.display.backgroundGradientGray,
                borderColor: '#999',
                borderWidth: 1,
                width: 150,
                borderRadius: 10,
                color: '#eee',
                top: 10
            });

            addAnotherItemButton.addEventListener('click', function(e) {
                var instance = e.source.instance;
                instance.numVisibleFields++;
                Omadi.widgets.unfocusField();
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

        var settings, widgetView, dbValue, textValue;

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

        settings = instance.settings;
        Ti.API.debug("Creating number_decimal field");
        
        if (dbValue === null && typeof settings.default_value !== 'undefined') {
            if(settings.default_value.length > 0){
                dbValue = parseFloat(settings.default_value);
                textValue = dbValue;
            }
        }
        
        widgetView = Omadi.widgets.getTextField(instance);

        widgetView.dbValue = dbValue;
        widgetView.textValue = textValue;
        widgetView.setValue(textValue);
        widgetView.setKeyboardType(Ti.UI.KEYBOARD_DEFAULT);
            
        if (settings.max != null) {
            widgetView.maxValue = settings.max;
        }

        if (settings.min != null) {
            widgetView.minValue = settings.min;
        }

        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);

        if (settings.min_length && settings.min_length != null && settings.min_length != "null") {
            widgetView.minLength = settings.min_length;
        }

        widgetView.addEventListener('change', function(e) {
            var tempValue;
            /*global setConditionallyRequiredLabels*/
            /*jslint regexp: true*/
            Ti.API.debug(e.source.value);
            Ti.API.debug(e.source.lastValue);
            
            // Must compare as strings since 4. and 4 would need to be different, but wouldn't be for a number
            if ((e.source.lastValue + "".toString()) != (e.source.value + "".toString())) {
                tempValue = "";
                if(e.source.value !== null){
                    if((e.source.value + "".toString()).match(/^-?\d*\.?\d*$/)){
                        tempValue = e.source.value;
                    }
                    else{
                        tempValue = e.source.lastValue;
                    }
                }
                
                if (tempValue != e.source.value) {
                    e.source.value = tempValue;
                    if (Ti.App.isAndroid) {
                        e.source.setSelection(e.source.value.length, e.source.value.length);
                    }
                }

                if (e.source.value.length > 0) {
                    e.source.dbValue = parseFloat(e.source.value);
                }
                else {
                    e.source.dbValue = null;
                }

                e.source.textValue = e.source.value;

                if (e.source.check_conditional_fields.length > 0) {
                    setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                }
                e.source.lastValue = e.source.value;
            }
        });

        return widgetView;
    }
};
