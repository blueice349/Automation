/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;

Widget = {};

function TextLongWidget(formObj, instance, fieldViewWrapper){"use strict";
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

TextLongWidget.prototype.getFieldView = function(){"use strict";
    
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
            try{
                Widget[e.source.fieldName].numVisibleFields ++;
                Widget[e.source.fieldName].formObj.unfocusField();
                Widget[e.source.fieldName].redraw();
            }
            catch(ex){
                Omadi.service.sendErrorReport("Exception in text long add another: " + ex);
            }
        });
        
        this.fieldView.add(addButton);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    
    //this.formObj.setConditionallyRequiredLabelForInstance(this.instance);
    
    return this.fieldView;
};

TextLongWidget.prototype.redraw = function(){"use strict";
    Ti.API.debug("in redraw");
    var origFieldView;
    
    this.formObj.formToNode();
        
    //Ti.API.debug(JSON.stringify(this.formObj.node));
    
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

TextLongWidget.prototype.getNewElement = function(index){"use strict";
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
    
    Ti.API.debug("Creating textarea field: " + this.instance.label);
    
    element = Ti.UI.createTextArea({
        backgroundColor: '#fff',
        borderRadius: 10,
        borderColor: '#999',
        borderWidth: 1,
        textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
        right: '4%',
        left: '4%',
        width: '92%',
        height: 110,
        color: '#000',
        autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
        autocorrect: true,
        editable: this.instance.can_edit,
        enabled: this.instance.can_edit,
        font: {
            fontSize: 16
        },
        returnKeyType: Ti.UI.RETURNKEY_DEFAULT,
        
        // Android options
        keepScreenOn: true,
        ellipsize: false,
        focusable: true,
        
        // iOS options
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
        suppressReturn: false,
        
        // Custom variables            
        instance: this.instance,
        dbValue: dbValue,
        textValue: textValue,
        value : textValue
    });
    
    element.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
    this.formObj.addCheckConditionalFields(element.check_conditional_fields);
    
    if (!this.instance.can_edit) {
    
        element.setBackgroundColor('#ccc');
        element.setColor('#666');
        
        if (Ti.App.isAndroid) {
            element.setSoftKeyboardOnFocus(Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS);
        }
        else{
            element.setBorderStyle(Ti.UI.INPUT_BORDERSTYLE_NONE);
            element.setPaddingLeft(7);
            element.setPaddingRight(7);
        }
    }

    if (this.instance.settings.min_length && this.instance.settings.min_length != null && this.instance.settings.min_length != "null") {
        element.minLength = this.instance.settings.min_length;
    }
    
    element.addEventListener('change', function(e) {
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
    
    element.addEventListener('focus', function(e){
        try{
            e.source.setBackgroundColor('#def');
            Widget[e.source.instance.field_name].formObj.currentlyFocusedField = e.source;
        }
        catch(ex){
            try{
                Omadi.service.sendErrorReport("Exception in text long focus listener: " + ex);
            }
            catch(ex1){}
        }
    });
    
    element.addEventListener('blur', function(e){
        try{
            e.source.setBackgroundColor('#fff');
        }
        catch(ex){
            try{
                Omadi.service.sendErrorReport("exception in text long blur: " + ex);
            }catch(ex1){}
        }
    });
    
    return element;
};

TextLongWidget.prototype.cleanUp = function(){"use strict";
    var i, j;
    Ti.API.debug("in text long widget cleanup");
    
    try{
        Widget[this.instance.field_name] = null;
        
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
        
        Ti.API.debug("At end of text long widget cleanup");
    }
    catch(ex){
        try{
            Omadi.service.sendErrorReport("Exception cleaning up text long widget field: " + ex);
        }
        catch(ex1){}
    }
    
    Omadi = null;
};

exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new TextLongWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};


