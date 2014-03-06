/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

var Widget, Omadi;

function TextWidget(formObj, instance, fieldViewWrapper){"use strict";
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

TextWidget.prototype.getFieldView = function(){"use strict";
    
    var i, element;
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    this.fieldView.add(Omadi.widgets.label.getRegularLabelView(this.instance));
    
    // TODO: setup conditionally 
    //setConditionallyRequiredLabelForInstance(node, instance);
    
    // Add the actual fields
    for(i = 0; i < this.numVisibleFields; i ++){
        element = this.getNewElement(i);
        this.fieldView.add(element);
        this.fieldView.add(Omadi.widgets.getSpacerView());
    }
    
    // TODO: add high cardinality
    // if(settings.cardinality == -1){
        // addAnotherItemButton = Ti.UI.createButton({
           // title: 'Add another item',
           // right: 15,
           // instance: instance,
           // style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            // backgroundGradient: Omadi.display.backgroundGradientGray,
            // borderColor: '#999',
            // borderWidth: 1,
            // width: 150,
            // borderRadius: 10,
            // color: '#eee',
            // top: 10
        // });
//             
        // addAnotherItemButton.addEventListener('click', function(e){
            // var instance = e.source.instance;
            // instance.numVisibleFields ++;
            // Omadi.widgets.unfocusField();
            // Omadi.widgets.shared.redraw(instance);
        // });
//         
        // fieldView.add(addAnotherItemButton);
        // fieldView.add(Omadi.widgets.getSpacerView());
    // }
    
    
    return this.fieldView;
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
    
    Ti.API.debug("Creating text field");
    
    element = Omadi.widgets.getTextField(this.instance);
    
    element.dbValue = dbValue;
    element.textValue = textValue;
    element.setValue(textValue);
    element.setAutocapitalization(Ti.UI.TEXT_AUTOCAPITALIZATION_WORDS);
    
    // TODO: check the conditional fields area
    //element.check_conditional_fields = affectsAnotherConditionalField(instance);
    
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
    
    element.addEventListener('change', function(e) {
        /*global setConditionallyRequiredLabels*/
        var now, milliseconds, timeChange;
        
        now = new Date();
        milliseconds = now.getTime();
        timeChange = milliseconds - e.source.lastChange;
        
        if(e.source.lastValue != e.source.value && (timeChange > 20)){
            e.source.lastChange = milliseconds;
            
            //Ti.API.debug("text value changed: " + e.source.lastValue + " -> " + e.source.value);
            
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
            e.source.lastValue = e.source.value;
            
            // TODO: uncomment the below
            // if(e.source.check_conditional_fields.length > 0){
                // setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
            // }
        }
    });
    
    return element;
};


exports.getFieldView = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget = new TextWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget.getFieldView();
};


