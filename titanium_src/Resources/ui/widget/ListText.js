/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;

Widget = {};

function ListTextWidget(formObj, instance, fieldViewWrapper){"use strict";
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

ListTextWidget.prototype.getFieldView = function(){"use strict";
    
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
    
    return this.fieldView;
};

ListTextWidget.prototype.redraw = function(){"use strict";
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

ListTextWidget.prototype.getNewElement = function(index){"use strict";
    var dbValue, textValue, element, options, descriptionText, descriptionLabel, wrapper, i;
    
    dbValue = null;
    textValue = "";
    
    if(this.nodeElement){
        if(typeof this.dbValues[index] !== 'undefined'){
            dbValue = this.dbValues[index];
        }
        
        if(typeof this.textValues[index] !== 'undefined'){
            textValue = this.textValues[index];
        }
    }
    
    Ti.API.debug("Creating text_list field: " + this.instance.label);
    
    options = this.getOptions();
    
    // This is a specialty section for only dispatch forms
    // Do not allow the work form to change if it has already been saved
    if(this.instance.field_name == 'field_tow_type'){
        if(dbValue !== null && typeof this.node.dispatch_id !== 'undefined' && this.node.dispatch_id != 0){
            this.instance.can_edit = false;
        }
        else if(typeof Ti.UI.currentWindow.field_tow_type !== 'undefined' && Ti.UI.currentWindow.field_tow_type != null){
            dbValue = Ti.UI.currentWindow.field_tow_type;
            for(i = 0; i < options.length; i ++){
                if(options[i].dbValue == dbValue){
                    textValue = options[i].title;
                    break;
                }
            }
        }
    }
    
    if (dbValue === null && typeof this.instance.settings.default_value !== 'undefined') {
        if(this.instance.settings.default_value.length > 0){
            dbValue = this.instance.settings.default_value;
            
            for(i = 0; i < options.length; i ++){
                if(options[i].dbValue == dbValue){
                    textValue = options[i].title;
                    break;
                }
            }
        }
    }
    
    descriptionText = "";
    descriptionLabel = Ti.UI.createLabel({
        height : Ti.UI.SIZE,
        width : '100%',
        text : descriptionText,
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        font : {
            fontSize : 14
        },
        color : '#444'
    });
    
    element = this.formObj.getLabelField(this.instance);
    element.top = 1;
    element.bottom = 1;
    element.view_title = this.instance.label;
    element.descriptionLabel = descriptionLabel;
    element.options = options;
    element.setText(textValue);
    element.textValue = textValue;
    element.dbValue = dbValue;
    
    // TODO: allow conditional fields for this widget
    //element.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
    //this.formObj.addCheckConditionalFields(element.check_conditional_fields);
    
    if (this.instance.can_edit) {
        element.addEventListener('click', function(e) {
            /*global setConditionallyRequiredLabels*/
            var i, postDialog, textOptions;

            textOptions = [];
            for ( i = 0; i < e.source.options.length; i++) {
                textOptions.push(e.source.options[i].title);
            }

            postDialog = Titanium.UI.createOptionDialog();
            postDialog.options = textOptions;
            postDialog.cancel = -1;
            postDialog.element = e.source;
            postDialog.show();

            postDialog.addEventListener('click', function(ev) {
                if (ev.index >= 0) {
                    var textValue = ev.source.options[ev.index];

                    if (textValue == '- None -') {
                        textValue = "";
                    }
                    ev.source.element.textValue = textValue;
                    ev.source.element.setText(textValue);
                    ev.source.element.value = ev.source.element.dbValue = ev.source.element.options[ev.index].dbValue;
                    
                    // This is a special case for dispatching
                    if(ev.source.element.fieldName == 'field_tow_type'){
                        Ti.App.fireEvent("omadi:dispatch:towTypeChanged", {
                            dbValue : ev.source.element.dbValue
                        });
                    }
                }
            });
            
        });
    }
    
    wrapper = Ti.UI.createView({
        layout : 'vertical',
        height : Ti.UI.SIZE,
        width : '100%'
    });
    
    wrapper.add(element);
    wrapper.add(descriptionLabel);
    
    return wrapper;
};

ListTextWidget.prototype.getOptions = function() {"use strict";
    var options, key;
    
    options = [];

    if (this.instance.required == 0) {
        options.push({
            title : '- None -',
            dbValue : null
        });
    }

    //Ti.API.debug(instance);
    
    if(typeof this.instance.settings.allowed_values !== 'undefined'){
        for(key in this.instance.settings.allowed_values){
            if(this.instance.settings.allowed_values.hasOwnProperty(key)){
                options.push({
                    title : this.instance.settings.allowed_values[key],
                    dbValue : key
                });
            }
        }
    }

    return options;
};


exports.getFieldView = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new ListTextWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name].getFieldView();
};


