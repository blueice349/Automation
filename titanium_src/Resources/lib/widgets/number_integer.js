/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.number_integer = {

    getFieldView : function(node, instance) {"use strict";
        //this.base = Omadi.widgets.base.init(in_instance);
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

        Ti.API.debug(instance.numVisibleFields);

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

            element = Omadi.widgets.number_integer.getNewElement(node, instance, i);
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
        Ti.API.debug("Creating number_integer field");
        
        widgetView = Omadi.widgets.getTextField(instance);

        widgetView.dbValue = dbValue;
        widgetView.textValue = textValue;
        widgetView.setValue(textValue);
        widgetView.setKeyboardType(Ti.UI.KEYBOARD_NUMBER_PAD);

        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);

        if (settings.max != null) {
            widgetView.maxValue = settings.max;
        }

        if (settings.min != null) {
            widgetView.minValue = settings.min;
        }

        widgetView.addEventListener('change', function(e) {
            var tempValue;
            /*global setConditionallyRequiredLabels*/
            /*jslint regexp: true*/
            if (e.source.lastValue != e.source.value) {
                tempValue = e.source.value.replace(/[^0-9\-]/g, '');
                if (tempValue != e.source.value) {
                    e.source.value = tempValue;
                    if (Ti.App.isAndroid) {
                        e.source.setSelection(e.source.value.length, e.source.value.length);
                    }
                }

                if (e.source.value.length > 0) {
                    e.source.dbValue = parseInt(e.source.value, 10);
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
