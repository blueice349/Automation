/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;

Widget = {};

function VehicleFieldsWidget(formObj, instance, fieldViewWrapper){"use strict";
    this.formObj = formObj;
    this.instance = instance;
    this.fieldView = null;
    this.node = formObj.node;
    this.dbValues = [];
    this.textValues = [];
    this.nodeElement = null;
    this.numVisibleFields = 1;
    this.fieldViewWrapper = fieldViewWrapper;
    
    this.element = null;
    this.autocomplete_table = null;
    this.elementWrapper = null;
    
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

VehicleFieldsWidget.prototype.getFieldView = function(){"use strict";
    
    var i, element, addButton;
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    this.fieldView.add(this.formObj.getRegularLabelView(this.instance));
    
    // Add the actual fields
    this.elementWrapper = this.getNewElement(0);
    this.fieldView.add(this.elementWrapper);
    this.fieldView.add(this.formObj.getSpacerView());
    
    return this.fieldView;
};

VehicleFieldsWidget.prototype.redraw = function(){"use strict";
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

VehicleFieldsWidget.prototype.getNewElement = function(index){"use strict";
    var settings, dbValue, textValue, part, nameParts, wrapper, autocomplete_table, possibleValues, db, result, makeValue, real_field_name;

    nameParts = this.instance.field_name.split('___');

    if (nameParts[1]) {
        part = nameParts[1];
        real_field_name = nameParts[0];
    }
    else {
        this.formObj.sendError("There should be parts to this vehicle field!!!:" + this.instance.label);
        alert("There was an error setting up the vehicle fields. Please contact support.");
        return;
    }

    dbValue = "";
    textValue = "";
    if ( typeof this.node[real_field_name] !== 'undefined') {
        if ( typeof this.node[real_field_name].parts[part].textValue !== 'undefined') {
            dbValue = textValue = this.node[real_field_name].parts[part].textValue;
        }
    }
    else if(typeof this.node[this.instance.field_name] !== 'undefined'){
        if(typeof this.node[this.instance.field_name].textValues !== 'undefined'){
            if(typeof this.node[this.instance.field_name].textValues[0] !== 'undefined'){
                 dbValue = textValue = this.node[this.instance.field_name].textValues[0];    
            }
        }
    }

    Ti.API.debug("Creating vehicle_fields " + part + " field: " + this.instance.label);

    possibleValues = [];

    if (part == "make") {
        db = Omadi.utils.openMainDatabase();
        result = db.execute("SELECT DISTINCT make FROM _vehicles");

        while (result.isValidRow()) {
            possibleValues.push(result.fieldByName("make"));
            result.next();
        }
        result.close();
        db.close();
    }

    this.element = this.formObj.getTextField(this.instance);

    this.element.dbValue = dbValue;
    this.element.textValue = textValue;
    this.element.setValue(textValue);
    this.element.setAutocapitalization(Ti.UI.TEXT_AUTOCAPITALIZATION_WORDS);
    this.element.real_field_name = real_field_name;
    this.element.possibleValues = possibleValues;
    this.element.lastValue = textValue;
    this.element.clickedAutocomplete = false;
    this.element.touched = false;
    this.element.blurred = true;

    if (part == 'make') {
        this.element.maxLength = 18;
    }
    else {
        this.element.maxLength = 38;
    }

    this.element.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
    this.formObj.addCheckConditionalFields(this.element.check_conditional_fields);

    if (!this.instance.can_edit) {
        this.element.backgroundImage = '';
        this.element.backgroundColor = '#BDBDBD';
        this.element.borderColor = 'gray';
        this.element.borderRadius = 10;
        this.element.color = '#848484';
        this.element.paddingLeft = 3;
        this.element.paddingRight = 3;
        if (Ti.App.isAndroid) {
            this.element.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
        }
    }

    this.autocomplete_table = Titanium.UI.createTableView({
        zIndex : 999,
        height : 0,
        backgroundColor : '#FFFFFF',
        visible : false,
        borderColor : '#000',
        borderWidth : 0,
        top : 0,
        width: '92%',
        fieldName: this.instance.field_name
    });

    this.autocomplete_table.addEventListener('click', function(e) {
        var widget;
        
        try{
            widget = Widget[e.source.fieldName];
            widget.element.textValue = widget.element.value = widget.element.dbValue = e.rowData.title;
    
            if (Ti.App.isAndroid) {
                // Make sure the cursor is at the end of the text
                widget.element.setSelection(widget.element.value.length, widget.element.value.length);
            }
    
            // Pretend like this is just loaded - mainly a fix for android, but makes sense for both
            //e.source.textField.touched = false;
            widget.element.clickedAutocomplete = true;
    
            widget.autocomplete_table.setHeight(0);
            widget.autocomplete_table.setBorderWidth(0);
            widget.autocomplete_table.setVisible(false);
        }
        catch(ex){
            Omadi.service.sendErrorReport("Exception in vehicle fields autocomplete click: " + ex);
        }
    });

    if (!this.instance.can_edit) {
        this.element.backgroundImage = '';
        this.element.backgroundColor = '#BDBDBD';
        this.element.borderColor = 'gray';
        this.element.borderRadius = 10;
        this.element.color = '#848484';
        this.element.paddingLeft = 3;
        this.element.paddingRight = 3;
        if (Ti.App.isAndroid) {
            this.element.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
        }
    }

    if (this.instance.settings.min_length && this.instance.settings.min_length != null && this.instance.settings.min_length != "null") {
        this.element.minLength = this.instance.settings.min_length;
    }

    this.element.addEventListener('focus', function(e){
       e.source.touched = true; 
    });
    
    this.element.addEventListener('click', function(e){
       e.source.touched = true; 
    });

    this.element.addEventListener('blur', function(e) {
        var widget;
        try{
            widget = Widget[e.source.instance.field_name];
            widget.autocomplete_table.setBorderWidth(0);
            widget.autocomplete_table.setHeight(0);
            widget.autocomplete_table.setVisible(false);
            e.source.blurred = true;
        }
        catch(ex){
            try{
                Omadi.service.sendErrorReport("exception in vehicle fields blur: " + ex);
            }catch(ex1){}
        }
    });

    this.element.addEventListener('change', function(e) {
        var possibleValues, tableData, i, regEx, row, db, result, makeValues, widget, sanitized;
        
        try{
            
            widget = Widget[e.source.instance.field_name];

            if(Ti.App.isAndroid && e.source.clickedAutocomplete){
                widget.element.clickedAutocomplete = false;
                return;
            }
            
            if (e.source.touched === true) {
    
                e.source.textValue = e.source.dbValue = e.source.value;
    
                if (e.source.lastValue != e.source.value && e.source.value != '') {
    
                    if (part == 'make') {
                        possibleValues = e.source.possibleValues;
                    }
                    else {
                        possibleValues = [];
    
                        makeValues = widget.formObj.getFormFieldValues(e.source.real_field_name + '___make');
    
                        if ( typeof makeValues.dbValues !== 'undefined') {
    
                            if (makeValues.dbValues[0] != "") {
                                makeValue = makeValues.dbValues[0];
    
                                db = Omadi.utils.openMainDatabase();
                                result = db.execute("SELECT DISTINCT model FROM _vehicles WHERE make LIKE '%" + makeValue + "%'");
    
                                if (result.rowCount > 0) {
                                    while (result.isValidRow()) {
                                        possibleValues.push(result.fieldByName('model'));
                                        result.next();
                                    }
                                }
                                else {
                                    result = db.execute("SELECT DISTINCT model FROM _vehicles");
                                    while (result.isValidRow()) {
                                        possibleValues.push(result.fieldByName('model'));
                                        result.next();
                                    }
                                }
                                result.close();
                                db.close();
                            }
                        }
                    }
    
                    tableData = [];
    
                    for ( i = 0; i < possibleValues.length; i++) {
                        
                        sanitized = "".toString() + e.source.value;
                        sanitized = sanitized.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                        
                        regEx = new RegExp(sanitized, 'i');
                        if (possibleValues[i].search(regEx) != -1) {
                            //Check match
    
                            //Create partial matching row
                            row = Ti.UI.createTableViewRow({
                                height : 38,
                                title : possibleValues[i],
                                color : '#000000',
                                fieldName: e.source.fieldName
                            });
    
                            // apply rows to data array
                            tableData.push(row);
    
                            if (tableData.length >= 4) {
                                break;
                            }
                        }
                    }
    
                    widget.autocomplete_table.setData(tableData);
    
                    if (tableData.length == 0) {
                        widget.autocomplete_table.setBorderWidth(0);
                        widget.autocomplete_table.setHeight(0);
                        widget.autocomplete_table.setVisible(false);
                    }
                    else {
                        widget.autocomplete_table.setBorderWidth(1);
                        widget.autocomplete_table.setHeight(38 * tableData.length);
                        widget.autocomplete_table.setVisible(true);
                    }
                    
                    if(e.source.blurred){
                        e.source.blurred = false;
                        widget.formObj.scrollToField(e);
                    }
                }
                else {
                    widget.autocomplete_table.setBorderWidth(0);
                    widget.autocomplete_table.setHeight(0);
                    widget.autocomplete_table.setVisible(false);
                }
            }
            e.source.lastValue = e.source.value;
    
            if(e.source.check_conditional_fields.length > 0){
                if(typeof e.source.lastValue === 'undefined' || typeof e.source.value === 'undefined' || 
                          e.source.lastValue == "" || e.source.value == ""){
                    Ti.API.debug("Checking conditionally required");
                    widget.formObj.setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                }
            }
            
            e.source.lastValue = e.source.value;
        }
        catch(ex){
            Omadi.service.sendErrorReport("exception in vehicle fields change listener: " + ex);
        }
    });

    wrapper = Ti.UI.createView({
        width : '100%',
        height : Ti.UI.SIZE,
        layout : 'vertical'
    });

    wrapper.add(this.element);
    wrapper.add(this.autocomplete_table);

    return wrapper;
};

VehicleFieldsWidget.prototype.cleanUp = function(){"use strict";
    var i, j;
    Ti.API.debug("in vehicle widget cleanup");
    
    try{
        Widget[this.instance.field_name] = null;
        
        this.elementWrapper.remove(this.element);
        this.elementWrapper.remove(this.autocomplete_table);
        this.element = null;
        this.autocomplete_table = null;
        this.fieldView.remove(this.elementWrapper);
        this.elementWrapper = null;
        
        this.fieldView = null;
        this.fieldViewWrapper = null;
        this.formObj = null;
        this.node = null;
        this.dbValues = null;
        this.textValues = null;
        this.nodeElement = null;
        this.instance = null;
        
        Ti.API.debug("At end of vehicle widget cleanup");
    }
    catch(ex){
        try{
            Omadi.service.sendErrorReport("Exception cleaning up vehicle widget field: " + ex);
        }
        catch(ex1){}
    }
    
    Omadi = null;
};

exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new VehicleFieldsWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};


