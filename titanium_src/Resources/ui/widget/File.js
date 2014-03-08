/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;

Widget = {};

function FileWidget(formObj, instance, fieldViewWrapper){"use strict";
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

FileWidget.prototype.getFieldView = function(){"use strict";
    
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
        if(element){
            this.fieldView.add(element);
            this.fieldView.add(this.formObj.getSpacerView());
        }
    }
    
    return this.fieldView;
};

FileWidget.prototype.redraw = function(){"use strict";
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

FileWidget.prototype.getNewElement = function(index){"use strict";
    var settings, widgetView, dbValue, textValue;

    dbValue = null;
    textValue = "- No file -";
    if ( typeof this.node[this.instance.field_name] !== 'undefined') {
        if ( typeof this.node[this.instance.field_name].dbValues !== 'undefined' && typeof this.node[this.instance.field_name].dbValues[index] !== 'undefined') {
            dbValue = this.node[this.instance.field_name].dbValues[index];
        }

        if ( typeof this.node[this.instance.field_name].textValues !== 'undefined' && typeof this.node[this.instance.field_name].textValues[index] !== 'undefined') {
            textValue = this.node[this.instance.field_name].textValues[index];
        }
    }
    
    if(index == 0 || dbValue !== null){
        Ti.API.debug("Creating file field: " + this.instance.label);

        widgetView = Omadi.widgets.getLabelField(this.instance);
        
        widgetView.dbValue = dbValue;
        widgetView.textValue = textValue;
        widgetView.setText(textValue);
        widgetView.textAlign = Ti.UI.TEXT_ALIGNMENT_LEFT;
        widgetView.backgroundColor = 'transparent';
        widgetView.backgroundGradient = null;
        widgetView.borderWidth = 0;
        widgetView.font.fontWeight = 'bold';
        widgetView.borderColor = 'transparent';
        widgetView.borderRadius = 0;
        widgetView.borderStyle = null;
        widgetView.height = 40;
        
        widgetView.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
        this.formObj.addCheckConditionalFields(widgetView.check_conditional_fields);
        
        if(Omadi.display.getFileViewType(textValue) !== null){
            widgetView.addEventListener('click', function(e){
                Omadi.display.displayFile(e.source.nid, e.source.dbValue, e.source.textValue);
            });
            widgetView.color = '#369';
        }
        else{
            widgetView.color = '#999';
        }
        
        widgetView.nid = node.nid;
        widgetView.height = Ti.UI.SIZE;
        
        return widgetView;
    }
    return null;
};


exports.getFieldView = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new FileWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name].getFieldView();
};


