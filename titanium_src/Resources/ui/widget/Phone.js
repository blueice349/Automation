/*jslint eqeq:true,plusplus:true,regexp:true*/

var Utils = require('lib/Utils');
var Display = require('lib/Display');

function PhoneWidget(formObj, instance, fieldViewWrapper){"use strict";
    this.formObj = formObj;
    this.instance = instance;
    this.fieldView = null;
    this.node = formObj.node;
    this.dbValues = [];
    this.textValues = [];
    this.elements = [];
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
    
    if(this.instance.settings.cardinality == -1){
        if(Utils.isArray(this.dbValues)){
            this.numVisibleFields = this.dbValues.length;
        }
        if(this.numVisibleFields < 1){
            this.numVisibleFields = 1;
        }
    }
    else{
        this.numVisibleFields = this.instance.settings.cardinality;
    }
}

PhoneWidget.prototype.getFieldView = function(){"use strict";
    
    var i, element, addButton;
    var self = this;
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    this.fieldView.add(this.formObj.getRegularLabelView(this.instance));
    
    // Add the actual fields
    for(i = 0; i < this.numVisibleFields; i ++){
        this.elements[i] = this.getNewElement(i);
        this.fieldView.add(this.elements[i]);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    if(this.instance.settings.cardinality == -1){
        
        addButton = Ti.UI.createButton({
            title: ' Add another item ',
            right: 15,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            backgroundGradient: Display.backgroundGradientGray,
            borderColor: '#999',
            borderWidth: 1,
            width: Ti.UI.SIZE,
            borderRadius: 10,
            color: '#eee',
            top: 10,
            height: Ti.UI.SIZE,
            fieldName: this.instance.field_name
        });
            
        addButton.addEventListener('click', function(e){
            try{
                self.numVisibleFields ++;
                self.formObj.unfocusField();
                self.redraw();
            }
            catch(ex){
                Utils.sendErrorReport("Exception in phone add another: " + ex);
            }
        });
        
        this.fieldView.add(addButton);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    return this.fieldView;
};

PhoneWidget.prototype.redraw = function(){"use strict";
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

PhoneWidget.prototype.getNewElement = function(index){"use strict";
    var dbValue, textValue, element;
    var self = this;
    
    dbValue = "";
    textValue = "";
    
    if(this.nodeElement){
        if(typeof this.dbValues[index] !== 'undefined'){
            dbValue = this.dbValues[index];
        }
        
        if(typeof this.textValues[index] !== 'undefined'){
            textValue = this.textValues[index];
        }
    }
    
    Ti.API.debug("Creating phone field: " + this.instance.label);
    
    element = this.formObj.getTextField(this.instance);
    
    element.dbValue = dbValue;
    element.textValue = textValue;
    element.setValue(textValue);
    element.fieldName = this.instance.field_name;
    element.setKeyboardType(Ti.UI.KEYBOARD_NUMBERS_PUNCTUATION);
    
    element.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
    this.formObj.addCheckConditionalFields(element.check_conditional_fields);
    
    if(typeof this.instance.settings.min_length !== 'undefined'){
        this.instance.settings.min_length = parseInt(this.instance.settings.min_length, 10);
        
        if (this.instance.settings.min_length > 0) {
            element.minLength = this.instance.settings.min_length;
        }
    }
    
    element.addEventListener('change', function(e) {
        var now, milliseconds, timeChange, tempValue;
        
        now = new Date();
        milliseconds = now.getTime();
        timeChange = milliseconds - e.source.lastChange;
        
        if(e.source.lastValue != e.source.value && (timeChange > 20)){
            e.source.lastChange = milliseconds;
            
            tempValue = e.source.value.replace(/[^0-9\-\(\)\. ex]/g, '');
            if (tempValue != e.source.value) {
                e.source.value = tempValue;
                if (Ti.App.isAndroid && e.source.value != null && typeof e.source.value.length !== 'undefined') {
                    e.source.setSelection(e.source.value.length, e.source.value.length);
                }
            }
       
            e.source.dbValue = e.source.value;
            e.source.textValue = e.source.value;
            
            if(e.source.check_conditional_fields.length > 0){
                if(typeof e.source.lastValue === 'undefined' || typeof e.source.value === 'undefined' || 
                          e.source.lastValue == "" || e.source.value == ""){
                    Ti.API.debug("Checking conditionally required");
                    self.formObj.setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                }
            }
            
            e.source.lastValue = e.source.value;
        }
    });
    
    return element;
};

PhoneWidget.prototype.cleanUp = function(){"use strict";
    var i, j;
    Ti.API.debug("in phone widget cleanup");
    
    try{
        for(j = 0; j < this.elements.length; j ++){
            this.fieldView.remove(this.elements[j]);
            this.elements[j] = null;
        }
        
        this.fieldView = null;
        this.fieldViewWrapper = null;
        this.formObj = null;
        this.node = null;
        this.dbValues = null;
        this.textValues = null;
        this.nodeElement = null;
        this.instance = null;
        
        Ti.API.debug("At end of phone widget cleanup");
    }
    catch(ex){
        try{
            Utils.sendErrorReport("Exception cleaning up phone widget field: " + ex);
        }
        catch(ex1){}
    }
};

exports.getFieldObject = function(FormObj, instance, fieldViewWrapper){"use strict";
    return new PhoneWidget(FormObj, instance, fieldViewWrapper);
};


