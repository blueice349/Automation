/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;

Widget = {};

function TextWidget(formObj, instance, fieldViewWrapper){"use strict";
    this.formObj = formObj;
    this.instance = instance;
    this.fieldView = null;
    this.node = formObj.node;
    this.dbValues = [];
    this.textValues = [];
    this.nodeElement = null;
    this.numVisibleFields = 1;
    this.elements = [];
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
        if(Omadi.utils.isArray(this.dbValues)){
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

TextWidget.prototype.getFieldView = function(){"use strict";
    
    var i, element, addButton;
    
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
            backgroundGradient: Omadi.display.backgroundGradientGray,
            borderColor: '#999',
            borderWidth: 1,
            width: Ti.UI.SIZE,
            borderRadius: 10,
            color: '#eee',
            top: 10,
            height: Ti.UI.SIZE,
            fieldName: this.instance.field_name
        });
            
        addButton.addEventListener('click', this.addAnotherCallback);
        
        this.fieldView.add(addButton);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    return this.fieldView;
};

TextWidget.prototype.addAnotherCallback = function(e){"use strict";
    try{
        Widget[e.source.fieldName].numVisibleFields ++;
        Widget[e.source.fieldName].formObj.unfocusField();
        Widget[e.source.fieldName].redraw();
    }
    catch(ex){
        Omadi.service.sendErrorReport("Exception in text field add another: " + ex);
    }
};

TextWidget.prototype.redraw = function(){"use strict";
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
    
    //this.fieldViewWrapper.add(this.fieldView);
    //this.fieldViewWrapper.remove(origFieldView);
};

TextWidget.prototype.getNewElement = function(index){"use strict";
    var dbValue, textValue, element;
    
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
    
    Ti.API.debug("Creating text field: " + this.instance.label);
    
    element = this.formObj.getTextField(this.instance);
    
    element.dbValue = dbValue;
    element.textValue = textValue;
    element.setValue(textValue);
    element.fieldName = this.instance.field_name;
    element.setAutocapitalization(Ti.UI.TEXT_AUTOCAPITALIZATION_WORDS);
    
    element.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
    this.formObj.addCheckConditionalFields(element.check_conditional_fields);
    
    if(typeof this.instance.settings.min_length !== 'undefined'){
        this.instance.settings.min_length = parseInt(this.instance.settings.min_length, 10);
        
        if (this.instance.settings.min_length > 0) {
            element.minLength = this.instance.settings.min_length;
        }
    }
    
    if(typeof this.instance.settings.max_length !== 'undefined'){
        this.instance.settings.max_length = parseInt(this.instance.settings.max_length, 10);
        
        if (this.instance.settings.max_length > 0) {
            element.maxLength = this.instance.settings.max_length;
        }
    }
    
    if (typeof this.instance.settings.capitalization !== null && this.instance.settings.capitalization != null) {
        element.capitalization = this.instance.settings.capitalization;
    }
    
    element.addEventListener('change', this.onChangeListener);
    
    return element;
};

TextWidget.prototype.onChangeListener = function(e) {"use strict";
    var now, milliseconds, timeChange;
    
    now = new Date();
    milliseconds = now.getTime();
    timeChange = milliseconds - e.source.lastChange;
    
    if(e.source.lastValue != e.source.value && (timeChange > 20)){
        e.source.lastChange = milliseconds;
        
        if(typeof e.source.capitalization !== 'undefined'){
            if(e.source.capitalization == 'all_caps' && e.source.value !== null){
              
                e.source.value = (e.source.value + "".toString()).toUpperCase();
              
                if (Ti.App.isAndroid && e.source.value != null && typeof e.source.value.length !== 'undefined') {
                    e.source.setSelection(e.source.value.length, e.source.value.length);
                }
            }
        }
   
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
    }
};

TextWidget.prototype.cleanUp = function(){"use strict";
    var i, j;
    Ti.API.debug("in text widget cleanup");
    
    try{
        
        Widget[this.instance.field_name] = null;
        
        for(j = 0; j < this.elements.length; j ++){
            this.fieldView.remove(this.elements[j]);
            this.elements[j] = null;
        }
        
        //this.fieldViewWrapper.remove(this.fieldView);
        this.fieldView = null;
        this.fieldViewWrapper = null;
        this.formObj = null;
        this.node = null;
        this.dbValues = null;
        this.textValues = null;
        this.nodeElement = null;
        this.instance = null;
        
        Ti.API.debug("At end of text widget cleanup");
    }
    catch(ex){
        try{
            Omadi.service.sendErrorReport("Exception cleaning up text widget field: " + ex);
        }
        catch(ex1){}
    }
    
    Omadi = null;
};

exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new TextWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};


