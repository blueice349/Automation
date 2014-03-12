/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;

Widget = {};

function LocationWidget(formObj, instance, fieldViewWrapper){"use strict";
    var nameParts, part;
    
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
    
    nameParts = instance.field_name.split('___');

    if (nameParts[1]) {
        part = nameParts[1];
        if(part == 'postal_code'){
            if(this.instance.isRequired && typeof this.instance.settings.require_zip !== 'undefined' && this.instance.settings.require_zip == 1){
                this.instance.isRequired = true;
            }
            else{
                this.instance.isRequired = false;
            }
        }
    }
    else {
        this.formObj.sendError("There should be parts to this location field!!! " + this.instance.label);
    }
}

LocationWidget.prototype.getFieldView = function(){"use strict";
    
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

LocationWidget.prototype.redraw = function(){"use strict";
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

LocationWidget.prototype.getNewElement = function(index){"use strict";
    var settings, widgetView, dbValue, textValue, part, nameParts, real_field_name, i, options, states;

    nameParts = this.instance.field_name.split('___');

    if (nameParts[1]) {
        part = nameParts[1];
        real_field_name = nameParts[0];
    }
    else {
        Ti.API.error("There should be parts to this location field!!!");
    }

    if (part == 'province') {
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
        
        if (dbValue == "" && typeof this.instance.settings.state_default_value !== 'undefined') {
            dbValue = this.instance.state_default_value;
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
    else {
        dbValue = "";
        textValue = "";
        if (typeof this.node[real_field_name] !== 'undefined') {
            if (typeof this.node[real_field_name].parts[part].textValue !== 'undefined') {
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
    
    Ti.API.info("Creating location " + part + " field: " + this.instance.label);

    if (part == 'province') {// state

        options = [];

        for ( i = 0; i < states.length; i++) {
            options.push(states[i].title);
        }
        
        widgetView = this.formObj.getLabelField(this.instance);
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
    else {
        widgetView = this.formObj.getTextField(this.instance);

        widgetView.dbValue = dbValue;
        widgetView.textValue = textValue;
        widgetView.setValue(textValue);
        widgetView.setAutocapitalization(Ti.UI.TEXT_AUTOCAPITALIZATION_WORDS);
        widgetView.real_field_name = real_field_name;
        
        widgetView.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
        this.formObj.addCheckConditionalFields(widgetView.check_conditional_fields);

        if(part == 'street'){
            widgetView.maxLength = 255;
        }
        else if(part == 'city'){
            widgetView.maxLength = 255;
        }
        else if (part == 'postal_code') {
            widgetView.setKeyboardType(Ti.UI.KEYBOARD_NUMBERS_PUNCTUATION);
            widgetView.maxLength = 16;
        }

        widgetView.addEventListener('focus', function(e) {
            e.source.touched = true;
        });

        widgetView.addEventListener('change', function(e) {
            /*global setConditionallyRequiredLabels*/
            e.source.dbValue = e.source.value;
            e.source.textValue = e.source.value;

            if(e.source.check_conditional_fields.length > 0){
                if(typeof e.source.lastValue === 'undefined' || typeof e.source.value === 'undefined' || 
                          e.source.lastValue == "" || e.source.value == ""){
                    Ti.API.debug("Checking conditionally required");
                    Widget[e.source.instance.field_name].formObj.setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                }
            }
            
            e.source.lastValue = e.source.value;
        });
    }


    return widgetView;
};

LocationWidget.prototype.getStates = function() {"use strict";
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
    Widget[instance.field_name] = new LocationWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};


