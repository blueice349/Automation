/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;

var Utils = require('lib/Utils');

Widget = {};

function ListTextWidget(formObj, instance, fieldViewWrapper){"use strict";
    this.formObj = formObj || {};
    this.instance = instance;
    this.fieldView = null;
    this.node = this.formObj.node || [];
    this.dbValues = [];
    this.textValues = [];
    this.elements = [];
    this.elementWrappers = [];
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
        this.elementWrappers[i] = this.getNewElementWrapper(i);
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
            
        addButton.addEventListener('click', function(e){
            try{
                Widget[e.source.fieldName].numVisibleFields ++;
                Widget[e.source.fieldName].formObj.unfocusField();
                Widget[e.source.fieldName].redraw();
            }
            catch(ex){
                Utils.sendErrorReport("Exception in list text add another: " + ex);
            }
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

ListTextWidget.prototype.getNewElementWrapper = function(index){"use strict";
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
    
    Ti.API.debug("Creating list_text field: " + this.instance.label);
    
    options = this.getOptions();
    
    // This is a specialty section for only dispatch forms
    // Do not allow the work form to change if it has already been saved
    if(this.instance.field_name == 'field_tow_type'){
        
        // For iOS, this needs to be set to true initially, and then it can be reset to false below if needed
        // If this line is gone, the can_edit field will be cached incorrectly, and there's not a way to reverse it
        this.instance.can_edit = true;
        
        if(dbValue !== null && this.node.nid > 0){
            this.instance.can_edit = false;
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
    
    if (this.instance.can_edit) {
        element.addEventListener('click', function(e) {
            var i, postDialog, textOptions;
            try{
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
                    try{
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
                                try{
                                    Widget[ev.source.element.instance.field_name].formObj.win.dispatchTabGroup.fireEvent("omadi:dispatch:towTypeChanged", {
                                        dbValue: ev.source.element.dbValue 
                                    });
                                }
                                catch(ex){
                                    Utils.sendErrorReport("Could not fire towtype changed event");
                                    alert("Could not change tow type. Please try again.");
                                }
                            }
                        }
                    }
                    catch(ex2){
                        Utils.sendErrorReport("Exception in list text dialog click: " + ex2);
                    }
                });
            }
            catch(ex){
                Utils.sendErrorReport("Exception in list text label click: " + ex);
            }
        });
    }
    
    wrapper = Ti.UI.createView({
        layout : 'vertical',
        height : Ti.UI.SIZE,
        width : '100%'
    });
    
    this.elements[index] = element;
    
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

ListTextWidget.prototype.cleanUp = function(){"use strict";
    var i, j;
    Ti.API.debug("in list text widget cleanup");
    
    try{
        
        Widget[this.instance.field_name] = null;
        
        for(j = 0; j < this.elements.length; j ++){
            
            this.elementWrappers[j].remove(this.elements[j]);
            this.elements[j] = null;
            
            this.fieldView.remove(this.elementWrappers[j]);
            this.elementWrappers[j] = null;
        }
        
        this.fieldView = null;
        this.fieldViewWrapper = null;
        this.formObj = null;
        this.node = null;
        this.dbValues = null;
        this.textValues = null;
        this.nodeElement = null;
        this.instance = null;
        
        Ti.API.debug("At end of list text widget cleanup");
    }
    catch(ex){
        try{
            Utils.sendErrorReport("Exception cleaning up list text widget field: " + ex);
        }
        catch(ex1){}
    }
    
    Omadi = null;
};

exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new ListTextWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};

exports.getOptions = function(instance) {
	var listText = new ListTextWidget(null, instance, null);
	return listText.getOptions();
};


