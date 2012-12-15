/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.license_plate = {

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

        instance.numVisibleFields = 1;

        element = Omadi.widgets.license_plate.getNewElement(node, instance, 0);
        instance.elements.push(element);
        fieldView.add(element);
        fieldView.add(Omadi.widgets.getSpacerView());

        return fieldView;
    },
    getNewElement : function(node, instance, index) {"use strict";

        var settings, widgetView, dbValue, textValue, part, nameParts, real_field_name, i, options, states;

        nameParts = instance.field_name.split('___');

        if (nameParts[1]) {
            part = nameParts[1];
            real_field_name = nameParts[0];
        }
        else {
            Ti.API.error("There should be parts to this vehicle field!!!");
        }

        if (part == 'plate') {
            dbValue = "";
            textValue = "";
            if ( typeof node[real_field_name] !== 'undefined') {
                if ( typeof node[real_field_name].parts[part].textValue !== 'undefined') {
                    dbValue = textValue = node[real_field_name].parts[part].textValue;
                }
            }
        }
        else {

            states = Omadi.widgets.license_plate.getStates();
            dbValue = "";
            textValue = "- None -";
            if ( typeof node[real_field_name] !== 'undefined') {
                if ( typeof node[real_field_name].parts[part].textValue !== 'undefined') {
                    dbValue = node[real_field_name].parts[part].textValue;
                }
            }

            if (dbValue === "") {
                if ( typeof instance.settings.state_default_value !== 'undefined') {
                    dbValue = instance.settings.state_default_value;
                }
            }

            if (dbValue > "") {
                for ( i = 0; i < states.length; i++) {
                    if (states[i].usps == dbValue) {
                        textValue = states[i].title;
                        break;
                    }
                }
            }
        }

        settings = instance.settings;
        Ti.API.debug("Creating license_plate " + part + " field");

        if (part == "plate") {
            
            
            widgetView = Omadi.widgets.getTextField(instance);
            
            widgetView.dbValue = dbValue;
            widgetView.textValue = textValue;
            widgetView.setValue(textValue);
            widgetView.maxLength = 10;
            widgetView.setAutocapitalization(Ti.UI.TEXT_AUTOCAPITALIZATION_ALL);
            widgetView.real_field_name = real_field_name;

            widgetView.addEventListener('focus', function(e) {
                e.source.touched = true;
            });

            widgetView.addEventListener('change', function(e) {
                var tempValue;
                /*jslint regexp: true*/
                /*global setConditionallyRequiredLabels*/

                if (e.source.lastValue != e.source.value) {

                    tempValue = e.source.value.replace(/[^0-9a-zA-Z]/g, '');
                    if (tempValue != e.source.value) {
                        e.source.value = tempValue;
                        if (Ti.App.isAndroid) {
                            e.source.setSelection(e.source.value.length, e.source.value.length);
                        }
                    }

                    if (Ti.App.isAndroid) {
                        if (e.source.value.length > e.source.maxLength) {
                            e.source.value = e.source.value.substring(0, e.source.maxLength);
                            e.source.setSelection(e.source.value.length, e.source.value.length);
                        }
                    }

                    e.source.dbValue = e.source.value;
                    e.source.textValue = e.source.value;

                    if (e.source.check_conditional_fields.length > 0) {
                        setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                    }

                    e.source.lastValue = e.source.value;
                }
            });
        }
        else {// state

            options = [];

            for ( i = 0; i < states.length; i++) {
                options.push(states[i].title);
            }
            
            widgetView = Omadi.widgets.getLabelField(instance);
            widgetView.setText(textValue);
            widgetView.textValue = textValue;
            widgetView.dbValue = dbValue;
            widgetView.options = options;
            widgetView.states = states;
            widgetView.real_field_name = real_field_name;

            widgetView.addEventListener('click', function(e) {
                var postDialog = Titanium.UI.createOptionDialog();
                postDialog.options = e.source.options;
                postDialog.cancel = -1;
                postDialog.widgetView = e.source;
                postDialog.show();

                postDialog.addEventListener('click', function(ev) {
                    if (ev.index >= 0) {
                        ev.source.widgetView.textValue = ev.source.options[ev.index];
                        ev.source.widgetView.dbValue = ev.source.widgetView.states[ev.index].usps;
                        ev.source.widgetView.setText(ev.source.options[ev.index]);
                    }
                });
            });
        }

        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);

        return widgetView;

    },
    getStates : function() {"use strict";
        var states = [];
        states.push({
            title : " - None - ",
            usps : null
        });
        states.push({
            title : "Alabama",
            usps : "AL"
        });
        states.push({
            title : "Alaska",
            usps : "AK"
        });
        states.push({
            title : "Arizona",
            usps : "AZ"
        });
        states.push({
            title : "Arkansas",
            usps : "AR"
        });
        states.push({
            title : "California",
            usps : "CA"
        });
        states.push({
            title : "Colorado",
            usps : "CO"
        });
        states.push({
            title : "Connecticut",
            usps : "CT"
        });
        states.push({
            title : "Delaware",
            usps : "DE"
        });
        states.push({
            title : "Florida",
            usps : "FL"
        });
        states.push({
            title : "Georgia",
            usps : "GA"
        });
        states.push({
            title : "Hawaii",
            usps : "HI"
        });
        states.push({
            title : "Idaho",
            usps : "ID"
        });
        states.push({
            title : "Illinois",
            usps : "IL"
        });
        states.push({
            title : "Indiana",
            usps : "IN"
        });
        states.push({
            title : "Iowa",
            usps : "IA"
        });
        states.push({
            title : "Kansas",
            usps : "KS"
        });
        states.push({
            title : "Kentucky",
            usps : "KY"
        });
        states.push({
            title : "Louisiana",
            usps : "LA"
        });
        states.push({
            title : "Maine",
            usps : "ME"
        });
        states.push({
            title : "Maryland",
            usps : "MD"
        });
        states.push({
            title : "Massachusetts",
            usps : "MA"
        });
        states.push({
            title : "Michigan",
            usps : "MI"
        });
        states.push({
            title : "Minnesota",
            usps : "MN"
        });
        states.push({
            title : "Mississippi",
            usps : "MS"
        });
        states.push({
            title : "Missouri",
            usps : "MO"
        });
        states.push({
            title : "Montana",
            usps : "MT"
        });
        states.push({
            title : "Nebraska",
            usps : "NE"
        });
        states.push({
            title : "Nevada",
            usps : "NV"
        });
        states.push({
            title : "New Hampshire",
            usps : "NH"
        });
        states.push({
            title : "New Jersey",
            usps : "NJ"
        });
        states.push({
            title : "New Mexico",
            usps : "NM"
        });
        states.push({
            title : "New York",
            usps : "NY"
        });
        states.push({
            title : "North Carolina",
            usps : "NC"
        });
        states.push({
            title : "North Dakota",
            usps : "ND"
        });
        states.push({
            title : "Ohio",
            usps : "OH"
        });
        states.push({
            title : "Oklahoma",
            usps : "OK"
        });
        states.push({
            title : "Oregon",
            usps : "OR"
        });
        states.push({
            title : "Pennsylvania",
            usps : "PA"
        });
        states.push({
            title : "Rhode Island",
            usps : "RI"
        });
        states.push({
            title : "South Carolina",
            usps : "SC"
        });
        states.push({
            title : "South Dakota",
            usps : "SD"
        });
        states.push({
            title : "Tennessee",
            usps : "TN"
        });
        states.push({
            title : "Texas",
            usps : "TX"
        });
        states.push({
            title : "Utah",
            usps : "UT"
        });
        states.push({
            title : "Vermont",
            usps : "VT"
        });
        states.push({
            title : "Virginia",
            usps : "VA"
        });
        states.push({
            title : "Washington",
            usps : "WA"
        });
        states.push({
            title : "West Virginia",
            usps : "WV"
        });
        states.push({
            title : "Wisconsin",
            usps : "WI"
        });
        states.push({
            title : "Wyoming",
            usps : "WY"
        });
        states.push({
            title : "Other",
            usps : "-"
        });

        return states;
    }
};

