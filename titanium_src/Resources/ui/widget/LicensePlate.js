/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;

Widget = {};

function LicensePlateWidget(formObj, instance, fieldViewWrapper){"use strict";
    this.formObj = formObj;
    this.instance = instance;
    this.fieldView = null;
    this.node = formObj.node;
    this.dbValues = [];
    this.textValues = [];
    this.nodeElement = null;
    this.numVisibleFields = 1;
    this.fieldViewWrapper = fieldViewWrapper;
    
    if(typeof this.node[this.instance.field_name] !== 'undefined'){
        this.nodeElement = this.node[this.instance.field_name];
        
        if(typeof this.nodeElement.dbValues !== 'undefined' && this.nodeElement.dbValues != null){
            this.dbValues = this.nodeElement.dbValues;
            
        }
        
        if(typeof this.nodeElement.textValues !== 'undefined' && this.nodeElement.textValues != null){
            this.textValues = this.nodeElement.textValues;
        }
    }
}

LicensePlateWidget.prototype.getFieldView = function(){"use strict";
    
    var i, element, addButton;
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    this.fieldView.add(this.formObj.getRegularLabelView(this.instance));
    
    // Add the actual fields
    element = this.getNewElement(0);
    this.fieldView.add(element);
    this.fieldView.add(this.formObj.getSpacerView());
    
    return this.fieldView;
};

LicensePlateWidget.prototype.redraw = function(){"use strict";
    Ti.API.debug("in redraw");
    var origFieldView;
    
    this.formObj.formToNode();
    
    this.node = this.formObj.node;
    if(typeof this.node[this.instance.field_name] !== 'undefined'){
        this.nodeElement = this.node[this.instance.field_name];
        
        if(typeof this.nodeElement.dbValues !== 'undefined' && this.nodeElement.dbValues != null){
            this.dbValues = this.nodeElement.dbValues;   
        }
        
        if(typeof this.nodeElement.textValues !== 'undefined' && this.nodeElement.textValues != null){
            this.textValues = this.nodeElement.textValues;
        }
    }
    
    origFieldView = this.fieldView;
    
    this.getFieldView();
    
    origFieldView.hide();
    
    this.fieldViewWrapper.add(this.fieldView);
    this.fieldViewWrapper.remove(origFieldView);
};

LicensePlateWidget.prototype.getNewElement = function(index){"use strict";
    var settings, widgetView, dbValue, textValue, part, nameParts, real_field_name, i, options, states;

    nameParts = this.instance.field_name.split('___');

    if (nameParts[1]) {
        part = nameParts[1];
        real_field_name = nameParts[0];
    }
    else {
        this.formObj.sendError("There should be parts to this license plate field!!!: " + this.instance.label);
        alert("Could not create the license plate field. Please contact support.");
        return;
    }

    if (part == 'plate') {
        dbValue = "";
        textValue = "";
        
        if ( typeof this.node[real_field_name] !== 'undefined') {
            // The "false" will still allow "FALSE", so we're okay here since CAPS is mandated for a final value
            if ( typeof this.node[real_field_name].parts[part].textValue !== 'undefined' && this.node[real_field_name].parts[part].textValue !== "false") {
                dbValue = textValue = this.node[real_field_name].parts[part].textValue;
            }
        }
        else if(typeof this.node[this.instance.field_name] !== 'undefined'){
            if(typeof this.node[this.instance.field_name].textValues !== 'undefined'){
                if(typeof this.node[this.instance.field_name].textValues[0] !== 'undefined'){
                     dbValue = textValue = this.node[this.instance.field_name].textValues[0];    
                }
            }
        }
    }
    else {

        states = this.getStates();
        dbValue = "";
        textValue = "- None -";
        
        if ( typeof this.node[real_field_name] !== 'undefined') {
            if ( typeof this.node[real_field_name].parts[part].textValue !== 'undefined') {
                dbValue = this.node[real_field_name].parts[part].textValue;
            }
        }
        else if(typeof this.node[this.instance.field_name] !== 'undefined'){
            if(typeof this.node[this.instance.field_name].textValues !== 'undefined'){
                if(typeof this.node[this.instance.field_name].textValues[0] !== 'undefined'){
                     dbValue = textValue = this.node[this.instance.field_name].textValues[0];    
                }
            }
        }

        if (dbValue === "") {
            if ( typeof this.instance.settings.state_default_value !== 'undefined') {
                dbValue = this.instance.settings.state_default_value;
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

    Ti.API.debug("Creating license_plate " + part + " field: " + this.instance.label);

    if (part == "plate") {
        widgetView = this.formObj.getTextField(this.instance);
        
        Ti.API.error(textValue + " " + dbValue);
        
        widgetView.dbValue = dbValue;
        widgetView.textValue = textValue;
        widgetView.setValue(textValue);
        widgetView.maxLength = 10;
        widgetView.setAutocapitalization(Ti.UI.TEXT_AUTOCAPITALIZATION_ALL);
        widgetView.real_field_name = real_field_name;

        widgetView.addEventListener('focus', function(e) {
            e.source.touched = true;
        });
        
        widgetView.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
        this.formObj.addCheckConditionalFields(widgetView.check_conditional_fields);
        
        widgetView.addEventListener('change', function(e) {
            var tempValue;
            /*jslint regexp: true*/

            if (e.source.lastValue != e.source.value) {
                tempValue = "";
                if(e.source.value !== null){
                    tempValue = (e.source.value + "".toString()).replace(/[^0-9a-zA-Z]/g, '');
                    tempValue = tempValue.toUpperCase();
                    // Change the oh's to zeros
                    tempValue = tempValue.replace(/O/g, '0');
                }
                
                e.source.dbValue = tempValue;
                e.source.textValue = tempValue;
                
                if (tempValue != e.source.value) {
                    e.source.value = tempValue;
                    
                    if (Ti.App.isAndroid && e.source.value != null && typeof e.source.value.length !== 'undefined') {
                        e.source.setSelection(e.source.value.length, e.source.value.length);
                    }
                }

                if(e.source.check_conditional_fields.length > 0){
                    if(typeof e.source.lastValue === 'undefined' || typeof e.source.value === 'undefined' || 
                              e.source.lastValue == "" || e.source.value == ""){
                        Ti.API.debug("Checking conditionally required");
                        Widget[e.source.instance.field_name].formObj.setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                    }
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
        
        options.push('- Cancel -');
        
        widgetView = this.formObj.getLabelField(this.instance);
        widgetView.setText(textValue);
        widgetView.textValue = textValue;
        widgetView.dbValue = dbValue;
        widgetView.options = options;
        widgetView.states = states;
        widgetView.real_field_name = real_field_name;
        
        widgetView.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
        this.formObj.addCheckConditionalFields(widgetView.check_conditional_fields);

        widgetView.addEventListener('click', function(e) {
            var postDialog = Titanium.UI.createOptionDialog({
                title: Widget[e.source.instance.field_name].formObj.labelViews[e.source.instance.field_name].text
            });
            
            postDialog.options = e.source.options;
            postDialog.cancel = states.length;
            postDialog.widgetView = e.source;
            postDialog.show();

            postDialog.addEventListener('click', function(ev) {
                var stateIndex;
                
                if (ev.index >= 0 && ev.index != ev.source.cancel) {
                    ev.source.widgetView.textValue = ev.source.options[ev.index];
                    ev.source.widgetView.dbValue = ev.source.widgetView.states[ev.index].usps;
                    ev.source.widgetView.setText(ev.source.options[ev.index]);
                }
            });
        });
    }

    return widgetView;
};

LicensePlateWidget.prototype.getStates = function() {"use strict";
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
};

exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new LicensePlateWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};


