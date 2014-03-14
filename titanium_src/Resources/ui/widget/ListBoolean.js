/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;
Widget = {};

function ListBooleanWidget(formObj, instance, fieldViewWrapper){"use strict";
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
    
    this.numVisibleFields = 1;
}

ListBooleanWidget.prototype.getFieldView = function(){"use strict";
    
    var element, addButton, wrapper, labelView;
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    wrapper = Ti.UI.createView({
        width : '100%',
        layout : 'horizontal',
        height : Ti.UI.SIZE,
        instance : this.instance
    });
    
    
    // Add the actual fields
    element = this.getNewElement(0);
    
    labelView = this.formObj.getRegularLabelView(this.instance);
    labelView.setWidth('80%');
    
    labelView.setEllipsize(false);
    labelView.setWordWrap(true);
    
    labelView.setHeight(Ti.UI.SIZE);
    
    wrapper.add(element);
    wrapper.add(Ti.UI.createView({
        width : 10,
        height : 10
    }));
    wrapper.add(labelView);
    
    this.fieldView.add(wrapper);
    this.fieldView.add(this.formObj.getSpacerView());
  
    return this.fieldView;
};

ListBooleanWidget.prototype.redraw = function(){"use strict";
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

ListBooleanWidget.prototype.getNewElement = function(index){"use strict";
    var dbValue, textValue, element;
    
    dbValue = "0";
    textValue = "";
    
    if(this.nodeElement){
        if(typeof this.dbValues[index] !== 'undefined'){
            dbValue = this.dbValues[index];
        }
        
        if(typeof this.textValues[index] !== 'undefined'){
            textValue = this.textValues[index];
        }
    }
    
    if (dbValue != 1) {
        dbValue = "0";
    }

    textValue = dbValue;
    
    Ti.API.debug("Creating checkbox field: " + this.instance.label);
    
    element = Titanium.UI.createView({
        width : 35,
        height : 35,
        borderRadius : 4,
        borderColor : '#333',
        borderWidth : 1,
        backgroundColor : '#FFF',
        enabled : true,
        left: '4%',

        instance : this.instance,
        dbValue : dbValue,
        textValue : textValue,
        value : dbValue
    });

    if (dbValue == 1) {
        element.setBackgroundImage('/images/selected_test.png');
    }

    element.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
    this.formObj.addCheckConditionalFields(element.check_conditional_fields);

    if (!this.instance.can_edit) {
        element.backgroundImage = '';
        element.backgroundColor = '#BDBDBD';
        element.borderColor = 'gray';
        element.borderRadius = 10;
        element.color = '#848484';
        element.paddingLeft = 3;
        element.paddingRight = 3;
    }

    element.addEventListener('click', function(e) {
        try{
            if(e.source.instance.can_edit){
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
                    Widget[e.source.instance.field_name].formObj.setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                }
            }
        }
        catch(ex){
            Omadi.service.sendErrorReport("Exception in checkbox click: " + ex);
        }
    });
    
    return element;
};

exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new ListBooleanWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};


