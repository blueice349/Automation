/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;
Widget = {};


function OmadiReferenceWidget(formObj, instance, fieldViewWrapper){"use strict";
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
    this.elementWrapper = null;
    this.autocomplete_table = null;
    this.addressLabel = null;
    
    if(typeof this.node[this.instance.field_name] !== 'undefined'){
        this.nodeElement = this.node[this.instance.field_name];
        
        if(typeof this.nodeElement.dbValues !== 'undefined' && this.nodeElement.dbValues != null){
            this.dbValues = this.nodeElement.dbValues;
        }
        
        if(typeof this.nodeElement.textValues !== 'undefined' && this.nodeElement.textValues != null){
            this.textValues = this.nodeElement.textValues;
        }
    }
}

OmadiReferenceWidget.prototype.getFieldView = function(){"use strict";
    
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

OmadiReferenceWidget.prototype.redraw = function(){"use strict";
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

OmadiReferenceWidget.prototype.getNewElement = function(index){"use strict";
    var dbValue, textValue, nodeTypes, possibleValues, options,
        i, query, db, result, wrapper, autocomplete_table, calculatedTop, isHidden,
        vehicleNid, addressLabel, street;

    dbValue = null;
    textValue = "";
    if ( typeof this.node[this.instance.field_name] !== 'undefined') {
        if ( typeof this.node[this.instance.field_name].dbValues !== 'undefined' && 
                typeof this.node[this.instance.field_name].dbValues[index] !== 'undefined') {
            dbValue = this.node[this.instance.field_name].dbValues[index];
        }

        if ( typeof this.node[this.instance.field_name].textValues !== 'undefined' && 
                typeof this.node[this.instance.field_name].textValues[index] !== 'undefined') {
            textValue = this.node[this.instance.field_name].textValues[index];
        }
    }

    Ti.API.debug("Creating omadi_reference field: " + this.instance.label);

    possibleValues = [];
    nodeTypes = [];

    for (i in this.instance.settings.reference_types) {
        if (this.instance.settings.reference_types.hasOwnProperty(i)) {
            nodeTypes.push(this.instance.settings.reference_types[i]);
        }
    }
    
    // Special case to automatically select the truck the user is in 
    if(nodeTypes.length == 1 && dbValue == null && this.instance.isRequired && nodeTypes[0] == 'company_vehicle'){
        vehicleNid = Omadi.bundles.companyVehicle.getCurrentVehicleNid();
        if(vehicleNid > 0){
            textValue = Omadi.bundles.companyVehicle.getCurrentVehicleName();
            dbValue = vehicleNid;
        }
    }
    
    possibleValues.push({
        title : '- None -',
        nid : null
    });

    if (nodeTypes.length > 0) {
        query = "SELECT title, nid FROM node WHERE table_name IN ('" + nodeTypes.join("','") + "')";

        db = Omadi.utils.openMainDatabase();
        result = db.execute(query);

        while (result.isValidRow()) {
            possibleValues.push({
                title : result.fieldByName('title'),
                nid : result.fieldByName('nid')
            });
            result.next();
        }
        result.close();
        db.close();
    }
    
    wrapper = Ti.UI.createView({
        width : '100%',
        height : Ti.UI.SIZE,
        layout : 'vertical'
    });
    
    this.addressLabel = Ti.UI.createLabel({
        text: '',
        height: 0,
        width: Ti.UI.FILL,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        color: '#666',
        font: {
            fontSize: 12
        },
        top: 0,
        instance: this.instance
    });
    
    this.addressLabel.addEventListener('click', function(e){
        try{
            var node, widget;
            widget = Widget[e.source.instance.field_name];
            
            if(typeof widget.element !== 'undefined' && widget.element.dbValue !== null && widget.element.dbValue > 0){
                node = Omadi.data.nodeLoad(widget.element.dbValue);
                if(node){
                    Omadi.display.openViewWindow(node.type, node.nid);
                }
            }
        }
        catch(ex){
            Omadi.service.sendErrorReport("Exception in address label click from reference: " + ex);
        }
    });
    
    if(dbValue > 0){
        street = this.getFirstStreetAddress(dbValue);
        if(street != ""){
            street += ' - ';
        }
        street += 'touch to view';
        this.addressLabel.text = street;
        this.addressLabel.height = 20;
    }
    
    if(this.instance.widget.type == 'omadi_reference_select'){
        
        options = [];
        
        for ( i = 0; i < possibleValues.length; i++) {
            options.push(possibleValues[i].title);
        }
        
        this.element = this.formObj.getLabelField(this.instance);
        this.element.dbValue = dbValue;
        this.element.textValue = textValue;
        this.element.options = options;
        this.element.possibleValues = possibleValues;
        this.element.top = 1;
        this.element.bottom = 1;
        this.element.setText(textValue);
        
        this.element.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
        this.formObj.addCheckConditionalFields(this.element.check_conditional_fields);
        
        if(this.instance.can_edit){
            this.element.addEventListener('click', function(e) {
                try{
                    var postDialog = Titanium.UI.createOptionDialog();
                    postDialog.options = e.source.options;
                    postDialog.cancel = -1;
                    postDialog.instance = e.source.instance;
                    postDialog.show();
    
                    postDialog.addEventListener('click', function(ev) {
                        var text, street, widget;
                        try{
                            if (ev.index >= 0) {
                                
                                widget = Widget[ev.source.instance.field_name];
                                
                                if(widget.element.possibleValues[ev.index].nid === null){
                                    text = '';   
                                    
                                    widget.addressLabel.text = '';
                                    widget.addressLabel.height = 0;
                                }
                                else{
                                    text = ev.source.options[ev.index];
                                    
                                    street = widget.getFirstStreetAddress(widget.element.possibleValues[ev.index].nid);
                                    
                                    if(street != ""){
                                        street += ' - ';
                                    }
                                    street += 'touch to view';
                                    
                                    widget.addressLabel.text = street;
                                    widget.addressLabel.height = 20;
                                }
                                widget.element.textValue = text;
                                widget.element.dbValue = widget.element.possibleValues[ev.index].nid;
                                widget.element.setText(text);
                                
                                if (widget.element.check_conditional_fields.length > 0) {
                                    widget.formObj.setConditionallyRequiredLabels(ev.source.instance, widget.element.check_conditional_fields);
                                }
                            }
                        }
                        catch(ex){
                            Omadi.service.sendErrorReport("exception changing omadi reference select value dialog: " + ex);
                        }
                    });
                }
                catch(ex){
                    Omadi.service.sendErrorReport("Exception in omadi reference widget view click: " + ex);
                }
            });
        }
        
        wrapper.add(this.element);
        wrapper.add(this.addressLabel);
    }
    else{
    
        this.element = this.formObj.getTextField(this.instance);
        
        if(typeof this.instance.settings.hidden_on_form !== 'undefined' && this.instance.settings.hidden_on_form == 1){
            isHidden = true;
            this.element = Ti.UI.createLabel({
                text: textValue,
                font: {
                    fontSize: 14
                },
                color: '#999'
            });
            
            if(textValue == ''){
                this.element.text = '- No Options -';
            }
        }
        else{
            this.element = this.formObj.getTextField(this.instance);
            this.element.setValue(textValue);
            this.element.setAutocapitalization(Ti.UI.TEXT_AUTOCAPITALIZATION_WORDS);
            isHidden = false;
        }
        
        this.element.dbValue = dbValue;
        this.element.textValue = textValue;
        
        this.element.lastValue = textValue;
        this.element.touched = false;
        this.element.possibleValues = possibleValues;
        this.element.defaultValueChildFields = [];
        this.element.onChangeCallbacks = [];
        this.element.clickedAutocomplete = false;
        this.element.touched = false;
        this.element.blurred = true;
        
        if(dbValue > 0){
            this.element.setColor('#060');
        }
        
        if(!isHidden){
            
            this.element.defaultValueChildFields = this.setupParentDefaultFields();
    
            this.autocomplete_table = Titanium.UI.createTableView({
                height : 0,
                backgroundColor : '#fff',
                visible : false,
                borderColor : '#000',
                borderWidth : 0,
                top : 0,
                width: '92%',
                fieldName: this.instance.field_name
            });
    
            this.autocomplete_table.addEventListener('click', function(e) {
                var i, callback, street, widget;
                
                try{
                    widget = Widget[e.source.fieldName];
                    
                    widget.element.textValue = widget.element.value = e.rowData.title;
                    widget.element.dbValue = e.rowData.nid;
        
                    widget.autocomplete_table.setHeight(0);
                    widget.autocomplete_table.setBorderWidth(0);
                    widget.autocomplete_table.setVisible(false);
                    
                    street = widget.getFirstStreetAddress(e.rowData.nid);
                    if(street != ""){
                        street += ' - ';
                    }
                    street += 'touch to view';
                    
                    widget.addressLabel.text = street;
                    widget.addressLabel.height = 20;
                    
                    widget.element.setColor('#060');
        
                    if (Ti.App.isAndroid) {
                        // Make sure the cursor is at the end of the text
                        widget.element.setSelection(widget.element.value.length, widget.element.value.length);
                    }
        
                    // Pretend like this is just loaded - mainly a fix for android, but makes sense for both
                    //e.source.textField.touched = false;
                    
                    widget.element.clickedAutocomplete = true;
                    
                    widget.setChildDefaultValues(widget.element);
        
                    if ( typeof widget.element.onChangeCallbacks !== 'undefined') {
                        if (widget.element.onChangeCallbacks.length > 0) {
                            for ( i = 0; i < widget.element.onChangeCallbacks.length; i++) {
                                callback = widget.element.onChangeCallbacks[i];
                                widget.formObj[callback](widget.element.onChangeCallbackArgs[i]);
                            }
                        }
                    }
                }
                catch(ex1){
                    Omadi.service.sendErrorReport("Exception in omadi reference auto complete: " + ex1);
                }
            });
    
            this.element.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
            this.formObj.addCheckConditionalFields(this.element.check_conditional_fields);
    
            this.element.addEventListener('focus', function(e){
               e.source.touched = true; 
            });
            
            this.element.addEventListener('click', function(e){
               e.source.touched = true; 
            });
    
            this.element.addEventListener('blur', function(e) {
                try{
                    var widget = Widget[e.source.instance.field_name];
                    widget.autocomplete_table.setBorderWidth(0);
                    widget.autocomplete_table.setHeight(0);
                    widget.autocomplete_table.setVisible(false);
                    widget.element.blurred = true;
                }
                catch(ex){
                    try{
                        Omadi.service.sendErrorReport("exception in omadi reference blur: " + ex);
                    }catch(ex1){}
                }
            });
            
            // TODO: get this part working with the formmodule
            // Ti.UI.currentWindow.addEventListener("customCopy", function(){
                // var i, callback;
//                     
                // Ti.API.debug("In CUSTOM COPY");
                // Omadi.widgets.omadi_reference.setChildDefaultValues(widgetView);
                // //Ti.API.debug(widgetView.onChangeCallbacks);
                // if (widgetView.onChangeCallbacks.length > 0) {
                    // for ( i = 0; i < widgetView.onChangeCallbacks.length; i++) {
                        // callback = widgetView.onChangeCallbacks[i];
                        // callback(widgetView.onChangeCallbackArgs[i]);
                    // }
                // }
            // });
    
            this.element.addEventListener('change', function(e) {
                var possibleValues, tableData, i, j, regEx, row, upperCaseValue, callback, street, widget;
                
                try{
                    
                    widget = Widget[e.source.instance.field_name];
                    if(Ti.App.isAndroid && e.source.clickedAutocomplete){
                        widget.element.clickedAutocomplete = false;
                        Ti.API.debug("IN clicked auto");
                        return;
                    }
                    
                    if (widget.element.touched === true) {
                         
                        widget.element.dbValue = null;
                        widget.element.textValue = widget.element.value;
                        
                        widget.element.setColor('#ee0000');
                        widget.addressLabel.setHeight(0);
                        
                        if (widget.element.lastValue != widget.element.value && widget.element.value != '') {
                            possibleValues = widget.element.possibleValues;
        
                            upperCaseValue = widget.element.value.toUpperCase();
                            tableData = [];
        
                            for ( i = 0; i < possibleValues.length; i++) {
                                // TODO: make sure the regular expression is valid
                                
                                regEx = new RegExp(widget.element.value, 'i');
                                if (possibleValues[i].title.search(regEx) != -1) {
                                    //Check match
                                    if (upperCaseValue == possibleValues[i].title.toUpperCase()) {
                                        widget.element.dbValue = possibleValues[i].nid;
                                        
                                        widget.setChildDefaultValues(e.source);
                                        
                                        widget.autocomplete_table.setHeight(0);
                                        widget.autocomplete_table.setBorderWidth(0);
                                        widget.autocomplete_table.setVisible(false);
                                        
                                        street = widget.getFirstStreetAddress(widget.element.dbValue);
                                        if(street != ""){
                                            street += ' - ';
                                        }
                                        street += 'touch to view';
                                        
                                        widget.addressLabel.text = street;
                                        widget.addressLabel.height = 20;
                                        
                                        widget.element.setColor('#006600');
                                        
                                        if (widget.element.onChangeCallbacks.length > 0) {
                                            for ( j = 0; j < widget.element.onChangeCallbacks.length; j++) {
                                                callback = widget.element.onChangeCallbacks[j];
                                                widget.formObj[callback](widget.element.onChangeCallbackArgs[j]);
                                            }
                                        }
                                    }
                                    else {
                                        widget.element.dbValue = null;
                                        
                                         //Create partial matching row
                                        row = Ti.UI.createTableViewRow({
                                            height : 38,
                                            title : possibleValues[i].title,
                                            nid : possibleValues[i].nid,
                                            color : '#000000',
                                            fieldName: widget.instance.field_name
                                        });
                                        
                                        //Ti.API.debug(possibleValues[i].title);
            
                                        // apply rows to data array
                                        tableData.push(row);
            
                                        if (tableData.length >= 4) {
                                            break;
                                        }
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
                            
                            if(widget.element.blurred){
                                widget.element.blurred = false;
                                widget.formObj.scrollToField(e);
                            }
                        }
                        else {
                            widget.autocomplete_table.setBorderWidth(0);
                            widget.autocomplete_table.setHeight(0);
                            widget.autocomplete_table.setVisible(false);
                        }
                    }
                    
                    if(widget.element.check_conditional_fields.length > 0){
                        if(typeof widget.element.lastValue === 'undefined' || typeof widget.element.value === 'undefined' || 
                                  widget.element.lastValue == "" || widget.element.value == ""){
                            Ti.API.debug("Checking conditionally required");
                            widget.formObj.setConditionallyRequiredLabels(widget.element.instance, widget.element.check_conditional_fields);
                        }
                    }
                
                    widget.element.lastValue = widget.element.value;
                }
                catch(ex){
                    Omadi.service.sendErrorReport("Exception in omadi reference change event: " + ex);
                }
            });
    
            wrapper.add(this.element);
            wrapper.add(this.autocomplete_table);
            wrapper.add(this.addressLabel);
        }
    }
    
    return wrapper;
};

OmadiReferenceWidget.prototype.setupParentDefaultFields = function() {"use strict";
    var instances, field_name, instance, parentFieldName, childFieldNames = [];

    instances = Omadi.data.getFields(this.formObj.type);

    for (field_name in instances) {
        if (instances.hasOwnProperty(field_name)) {
            instance = instances[field_name];
            if ( typeof instance.settings.parent_form_default_value !== 'undefined') {

                if ( typeof instance.settings.parent_form_default_value.parent_field !== 'undefined' && instance.settings.parent_form_default_value.parent_field != "") {

                    parentFieldName = instance.settings.parent_form_default_value.parent_field;

                    if (parentFieldName == this.instance.field_name) {

                        childFieldNames.push({
                            childFieldName : field_name,
                            defaultValueField : instance.settings.parent_form_default_value.default_value_field
                        });
                    }
                }
            }
        }
    }

    return childFieldNames;
};

OmadiReferenceWidget.prototype.setChildDefaultValues = function(widgetView) {"use strict";
    var parentFieldName, defaultValueField, childFieldValues, parentNode, instance, instances, defaultValues, field_name, childFieldName, i, childInstance;
    
    if (widgetView.dbValue > 0) {
        if (widgetView.defaultValueChildFields.length > 0) {
            
            Ti.API.debug("Setting default values");
            
            parentNode = Omadi.data.nodeLoad(widgetView.dbValue);
            
            for ( i = 0; i < widgetView.defaultValueChildFields.length; i++) {
                childFieldName = widgetView.defaultValueChildFields[i].childFieldName;
                defaultValueField = widgetView.defaultValueChildFields[i].defaultValueField;
                childFieldValues = this.formObj.getFormFieldValues(childFieldName);
                
                if ( typeof childFieldValues.dbValues === 'undefined' || childFieldValues.dbValues.length == 0 || childFieldValues.dbValues[0] == null || childFieldValues.dbValues[0] == "") {

                    if ( typeof parentNode[defaultValueField] !== 'undefined') {
                        defaultValues = parentNode[defaultValueField];
                        
                        Ti.API.debug("real defaults: " + JSON.stringify(defaultValues));

                        this.formObj.setValues(childFieldName, defaultValues);
                    }
                }
            }
        }
    }
};

OmadiReferenceWidget.prototype.getFirstStreetAddress = function(nid){"use strict";
    var instances, node, street, field_name;
    
    street = '';
    node = Omadi.data.nodeLoad(nid);
    
    if(node){
        instances = Omadi.data.getFields(node.type);
        for(field_name in instances){
            if(instances.hasOwnProperty(field_name)){
                if(instances[field_name].type == 'location'){
                    if(typeof instances[field_name].part !== 'undefined' && instances[field_name].part == 'street'){
                        if(typeof node[field_name] !== 'undefined' && 
                            typeof node[field_name].dbValues !== 'undefined' && 
                            typeof node[field_name].dbValues[0] !== 'undefined'){
                                
                                street = node[field_name].dbValues[0];
                                break;
                        }   
                    }
                }
            }
        }   
    }
    return street;
};

OmadiReferenceWidget.prototype.cleanUp = function(){"use strict";
    var i, j;
    Ti.API.debug("in integer widget cleanup");
    
    try{
        Widget[this.instance.field_name] = null;
        
        this.elementWrapper.remove(this.element);
        this.elementWrapper.remove(this.addressLabel);
        
        this.element = null;
        this.addressLabel = null;
        
        if(this.autocomplete_table !== null){
            this.elementWrapper.remove(this.autocomplete_table);
            this.autocomplete_table = null;
        }
        
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
        
        Ti.API.debug("At end of integer widget cleanup");
    }
    catch(ex){
        try{
            Omadi.service.sendErrorReport("Exception cleaning up integer widget field: " + ex);
        }
        catch(ex1){}
    }
    
    Omadi = null;
};

exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new OmadiReferenceWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};


