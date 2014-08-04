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
    this.elementWrappers = [];
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
        this.elementWrappers[i] = this.getNewElementWrapper(i);
        this.fieldView.add(this.elementWrappers[i]);
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

TextWidget.prototype.getNewElementWrapper = function(index){"use strict";
    var dbValue, textValue, element, wrapper, duplicateWarningButton;
    
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
    
    wrapper = Ti.UI.createView({
       width: '92%',
       left: '4%',
       layout: 'horizontal',
       height: Ti.UI.SIZE
    });
    
    element = this.formObj.getTextField(this.instance);
    
    element.width = '100%';
    element.left = 0;
    element.dbValue = dbValue;
    element.textValue = textValue;
    element.setValue(textValue);
    element.fieldName = this.instance.field_name;
    element.fieldIndex = index;
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
    
    wrapper.add(element);
    
    if(index == 0 && typeof this.instance.settings.duplicate_warning !== 'undefined' && this.instance.settings.duplicate_warning == 1){
        
        // Only set the duplicateWarnings property on the first field if many exist, and only when the check should be completed
        this.duplicateWarnings = {};
        
        element.width = '80%';
        
        duplicateWarningButton = Ti.UI.createButton({
           width: 40,
           height: 40,
           left: 5,
           backgroundImage: '/images/checkmark_icon_40.png',
           instance: this.instance
        });
        
        if(Ti.App.isIOS){
            duplicateWarningButton.style = Ti.UI.iPhone.SystemButtonStyle.PLAIN;
        }
        
        duplicateWarningButton.addEventListener('click', function(e){
            var fieldName, value, origLastChange, actualLastChange, widget, formPart;
            
            try{
                fieldName = e.source.instance.field_name;
                
                if(typeof Widget[fieldName] !== 'undefined'){
                    widget = Widget[fieldName];
                    // Make sure the node object is populated correctly since this is not a regular save
                    widget.formObj.formToNode();
                    widget.formObj.showDuplicateWarnings(null);
                }
                else{
                    Ti.API.error("duplicate widget " + fieldName + " doesn't exist");
                }
            }
            catch(ex){
                Ti.API.error("Exception in duplicate warning timeout: " + ex);
                try{
                    Omadi.service.sendErrorReport("Exception in duplicate warning timeout: " + ex);
                }
                catch(ex2){}
            }
        });
        
        wrapper.add(duplicateWarningButton);
    }
    
    this.elements[index] = element;
    
    return wrapper;
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
        
        if(e.source.fieldIndex == 0 && typeof e.source.instance.settings.duplicate_warning !== 'undefined' && e.source.instance.settings.duplicate_warning == 1){
                    
            //Ti.API.debug("Form part == " + Widget[e.source.instance.field_name].formObj.form_part);
            // Only check for duplicate warnings if set in the field settings
            setTimeout(function(){
                var fieldName, value, origLastChange, actualLastChange, widget, formPart;
                
                try{
                    fieldName = e.source.instance.field_name;
                    value = "".toString() + e.source.value;
                    value = value.trim();
                    
                    if(value.length > 0){
                        if(typeof Widget[fieldName] !== 'undefined'){
                            widget = Widget[fieldName];
                            formPart = widget.formObj.form_part;
                            
                            if(formPart <= 0){
                            
                                origLastChange = now;
                            
                                actualLastChange = widget.elements[0].lastChange;
                                
                                if(origLastChange == actualLastChange){
                                    // The last change happened 5 seconds ago, so possibly send request if it hasn't been sent before
                                    
                                    if(typeof widget.duplicateWarnings[value] === 'undefined'){
                                        Ti.API.debug("Send Request baby!");    
                                        
                                        widget.setDuplicateWarnings(fieldName, value, 'silent');
                                    }
                                    else{
                                        Ti.API.debug("Already have the warning cached for " + value);
                                    }
                                }
                            }
                            else{
                                Ti.API.debug("Duplicate form part above 0");
                            }
                        }
                        else{
                            Ti.API.error("duplicate widget " + fieldName + " doesn't exist");
                        }
                    }
                    else{
                        Ti.API.error("value is blank");
                    }
                }
                catch(ex){
                    Ti.API.error("Exception in duplicate warning timeout: " + ex);
                    try{
                        Omadi.service.sendErrorReport("Exception in duplicate warning timeout: " + ex);
                    }
                    catch(ex2){}
                }
                
            }, 4000);
        }
        
        e.source.lastValue = e.source.value;
    }
};

TextWidget.prototype.setDuplicateWarnings = function(fieldName, value, saveType){"use strict";
    
    var http;
    
    try{
        http = Ti.Network.createHTTPClient({
            enableKeepAlive: false,
            validatesSecureCertificate: false
        });
        http.setTimeout(10000);
        http.open('POST', Omadi.DOMAIN_NAME + '/js-fields/omadi_fields/duplicate_warnings.json');
    
        Omadi.utils.setCookieHeader(http);
        http.setRequestHeader("Content-Type", "application/json");
        
        http.onload = function(e) {
            var json;
            
            try{
                Ti.API.debug(this.responseText);
                
                json = JSON.parse(this.responseText);
                
                if(typeof Widget[fieldName] !== 'undefined'){
                
                    Widget[fieldName].duplicateWarnings[value] = json;
                    
                    if(typeof Widget[fieldName].formObj !== 'undefined'){
                        Widget[fieldName].formObj.win.fireEvent('duplicateWarningComplete', {
                            json: json,
                            fieldName: fieldName,
                            value: value,
                            saveType: saveType
                        });
                    }
                }
            }
            catch(ex){
                Omadi.service.sendErrorReport("Exception on onload of setDuplicateWarnings: " + ex);
            }
        };
    
        http.onerror = function(e) {
            try{
                Ti.API.error(JSON.stringify(e));
                Omadi.service.sendErrorReport("Error on setduplicatewarnings: " + JSON.stringify(e));
            }
            catch(ex){
                
            }
        };
        
        http.send(JSON.stringify({
            field_name: fieldName,
            value: value,
            nid: Widget[fieldName].formObj.nid
        }));
    }
    catch(ex){
        Omadi.service.sendErrorReport("Exception in setDuplicateWarnings: " + ex);
    }
};

TextWidget.prototype.cleanUp = function(){"use strict";
    var i, j;
    Ti.API.debug("in text widget cleanup");
    
    try{
        
        Widget[this.instance.field_name] = null;
        
        for(j = 0; j < this.elementWrappers.length; j ++){
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


