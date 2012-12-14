/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.list_boolean = {

    getFieldView : function(node, instance) {"use strict";

        instance.elements = [];

        var settings = instance.settings, wrapper, labelView, fieldView, i, j, element, addAnotherItemButton = null;

        wrapper = Ti.UI.createView({
            layout : 'vertical',
            height : Ti.UI.SIZE,
            width : Ti.Platform.displayCaps.platformWidth - 30
        });

        fieldView = Ti.UI.createView({
            width : '100%',
            layout : 'horizontal',
            height : Ti.UI.SIZE,
            instance : instance
        });

        instance.fieldView = fieldView;

        setConditionallyRequiredLabelForInstance(node, instance);

        instance.numVisibleFields = 1;

        element = Omadi.widgets.list_boolean.getNewElement(node, instance, 0);
        instance.elements.push(element);
        fieldView.add(element);

        labelView = Omadi.widgets.label.getRegularLabelView(instance);
        labelView.setWidth(labelView.width - 100);
        labelView.setEllipsize(false);
        labelView.setWordWrap(true);
        labelView.setHeight(Ti.UI.SIZE);

        fieldView.add(Ti.UI.createView({
            width : 10,
            height : 10
        }));
        fieldView.add(labelView);

        wrapper.add(fieldView);
        wrapper.add(Omadi.widgets.getSpacerView());

        return wrapper;
    },
    getNewElement : function(node, instance, index) {"use strict";

        var settings, widgetView, dbValue, textValue;

        settings = instance.settings;

        dbValue = "0";
        textValue = "";
        if ( typeof node[instance.field_name] !== 'undefined') {
            if ( typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined') {
                dbValue = node[instance.field_name].dbValues[index];
            }
        }

        if (dbValue != 1) {
            dbValue = "0";
        }

        textValue = dbValue;

        Ti.API.debug("Creating list_boolean field");

        widgetView = Titanium.UI.createView({
            width : 35,
            height : 35,
            borderRadius : 4,
            borderColor : '#333',
            borderWidth : 1,
            backgroundColor : '#FFF',
            enabled : true,

            instance : instance,
            dbValue : dbValue,
            textValue : textValue,
            value : dbValue
        });

        if (dbValue == 1) {
            widgetView.setBackgroundImage('/images/selected_test.png');
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

        widgetView.addEventListener('click', function(e) {
            /*global setConditionallyRequiredLabels*/

            if (e.source.value == 0) {
                e.source.setBackgroundImage('/images/selected_test.png');
                e.source.borderWidth = 2;
                e.source.value = true;
                e.source.dbValue = "1";
                e.source.textValue = "1";
            }
            else {
                e.source.setBackgroundImage(null);
                e.source.borderWidth = 1;
                e.source.value = false;
                e.source.dbValue = "0";
                e.source.textValue = "0";
            }

            if (e.source.check_conditional_fields.length > 0) {
                setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
            }

        });

        return widgetView;
    }
};

