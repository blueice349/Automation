/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;

Widget = {};

function EmailWidget(formObj, instance, fieldViewWrapper){"use strict";
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
    
    if(this.instance.settings.cardinality == -1){
        if(Omadi.utils.isArray(this.dbValues)){
            this.numVisibleFields = this.dbValues.length;
        }
    }
    else{
        this.numVisibleFields = this.instance.settings.cardinality;
    }
}

EmailWidget.prototype.getFieldView = function(){"use strict";
    
    var i, element, addButton;
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    this.fieldView.add(this.formObj.getRegularLabelView(this.instance));
    
    // Add the actual fields
    for(i = 0; i < this.numVisibleFields; i ++){
        element = this.getNewElement(i);
        this.fieldView.add(element);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    if(this.instance.settings.cardinality == -1){
        
        addButton = Ti.UI.createButton({
            title: 'Add another item',
            right: 15,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            backgroundGradient: Omadi.display.backgroundGradientGray,
            borderColor: '#999',
            borderWidth: 1,
            width: 150,
            borderRadius: 10,
            color: '#eee',
            top: 10,
            height: Ti.UI.SIZE,
            fieldName: this.instance.field_name
        });
            
        addButton.addEventListener('click', function(e){
            Widget[e.source.fieldName].numVisibleFields ++;
            Widget[e.source.fieldName].formObj.unfocusField();
            Widget[e.source.fieldName].redraw();
        });
        
        this.fieldView.add(addButton);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    
    //this.formObj.setConditionallyRequiredLabelForInstance(this.instance);
    
    return this.fieldView;
};

EmailWidget.prototype.redraw = function(){"use strict";
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

EmailWidget.prototype.getNewElement = function(index){"use strict";
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
    
    Ti.API.debug("Creating email field: " + this.instance.label);
    
    element = this.formObj.getTextField(this.instance);
    
    element.dbValue = dbValue;
    element.textValue = textValue;
    element.setValue(textValue);
    element.fieldName = this.instance.field_name;
    element.maxLength = 255;
    // Got to be at least a@a.co, additional validation is happening later
    // minLength has no effect right now
    //element.minLength = 6;
    element.setAutocapitalization(Ti.UI.TEXT_AUTOCAPITALIZATION_NONE);
    
    element.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
    this.formObj.addCheckConditionalFields(element.check_conditional_fields);
    
    element.addEventListener('change', function(e) {
        var now, milliseconds, timeChange;
        
        now = new Date();
        milliseconds = now.getTime();
        timeChange = milliseconds - e.source.lastChange;
        
        if(e.source.lastValue != e.source.value && (timeChange > 20)){
            e.source.lastChange = milliseconds;
            
            Ti.API.debug("text value changed: *" + e.source.lastValue + "* -> *" + e.source.value + "*");
            
            e.source.dbValue = e.source.value;
            e.source.textValue = e.source.value;
            
            if(e.source.check_conditional_fields.length > 0){
                if(typeof e.source.lastValue === 'undefined' || typeof e.source.value === 'undefined' || 
                          e.source.lastValue == "" || e.source.value == ""){
                    Ti.API.debug("Checking conditionally required");
                    Widget[e.source.fieldName].formObj.setConditionallyRequiredLabels(Widget[e.source.fieldName].instance, e.source.check_conditional_fields);
                }
            }
            
            e.source.lastValue = e.source.value;
        }
    });
    
    return element;
};


exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new EmailWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};


