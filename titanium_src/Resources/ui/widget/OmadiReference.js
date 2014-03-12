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
    element = this.getNewElement(0);
    this.fieldView.add(element);
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
    var widgetView, dbValue, textValue, nodeTypes, possibleValues, options,
        i, query, db, result, wrapper, autocomplete_table, calculatedTop, isHidden,
        vehicleNid, addressLabel;

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
    
    addressLabel = Ti.UI.createLabel({
        text: '',
        height: 0,
        width: Ti.UI.FILL,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        color: '#666',
        font: {
            fontSize: 12
        },
        top: 0
    });
    
    addressLabel.addEventListener('click', function(e){
        try{
            var node;
            if(typeof e.source.widgetView !== 'undefined' && e.source.widgetView.dbValue !== null && e.source.widgetView.dbValue > 0){
                node = Omadi.data.nodeLoad(e.source.widgetView.dbValue);
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
        addressLabel.text = this.getFirstStreetAddress(dbValue) + ' - touch to view';
        addressLabel.height = 20;
    }
    
    if(this.instance.widget.type == 'omadi_reference_select'){
        
        options = [];
        
        for ( i = 0; i < possibleValues.length; i++) {
            options.push(possibleValues[i].title);
        }
        
        widgetView = this.formObj.getLabelField(this.instance);
        widgetView.dbValue = dbValue;
        widgetView.textValue = textValue;
        widgetView.options = options;
        widgetView.possibleValues = possibleValues;
        widgetView.top = 1;
        widgetView.bottom = 1;
        widgetView.setText(textValue);
        
        widgetView.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
        this.formObj.addCheckConditionalFields(widgetView.check_conditional_fields);
        
        if(this.instance.can_edit){
            widgetView.addEventListener('click', function(e) {
                try{
                    var postDialog = Titanium.UI.createOptionDialog();
                    postDialog.options = e.source.options;
                    postDialog.cancel = -1;
                    postDialog.widgetView = e.source;
                    postDialog.show();
    
                    postDialog.addEventListener('click', function(ev) {
                        var text, street;
                        try{
                            if (ev.index >= 0) {
                                
                                if(ev.source.widgetView.possibleValues[ev.index].nid === null){
                                    text = '';   
                                    
                                    ev.source.widgetView.addressLabel.text = '';
                                    ev.source.widgetView.addressLabel.height = 0;
                                }
                                else{
                                    text = ev.source.options[ev.index];
                                    
                                    street = Widget[ev.source.widgetView.instance.field_name].getFirstStreetAddress(ev.source.widgetView.possibleValues[ev.index].nid);
                                    ev.source.widgetView.addressLabel.text = street + ' - touch to view';
                                    ev.source.widgetView.addressLabel.height = 20;
                                }
                                ev.source.widgetView.textValue = text;
                                ev.source.widgetView.dbValue = ev.source.widgetView.possibleValues[ev.index].nid;
                                ev.source.widgetView.setText(text);
                                
                                if (ev.source.widgetView.check_conditional_fields.length > 0) {
                                    Widget[ev.source.widgetView.instance.field_name].formObj.setConditionallyRequiredLabels(ev.source.widgetView.instance, ev.source.widgetView.check_conditional_fields);
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
        
        wrapper.add(widgetView);
        wrapper.add(addressLabel);
    }
    else{
    
        widgetView = this.formObj.getTextField(this.instance);
        
        if(typeof this.instance.settings.hidden_on_form !== 'undefined' && this.instance.settings.hidden_on_form == 1){
            isHidden = true;
            widgetView = Ti.UI.createLabel({
                text: textValue,
                font: {
                    fontSize: 14
                },
                color: '#999'
            });
            
            if(textValue == ''){
                widgetView.text = '- No Options -';
            }
        }
        else{
            widgetView = this.formObj.getTextField(this.instance);
            widgetView.setValue(textValue);
            widgetView.setAutocapitalization(Ti.UI.TEXT_AUTOCAPITALIZATION_WORDS);
            isHidden = false;
        }
        
        widgetView.dbValue = dbValue;
        widgetView.textValue = textValue;
        
        widgetView.lastValue = textValue;
        widgetView.touched = false;
        widgetView.possibleValues = possibleValues;
        widgetView.defaultValueChildFields = [];
        widgetView.onChangeCallbacks = [];
        widgetView.clickedAutocomplete = false;
        widgetView.touched = false;
        widgetView.blurred = true;
        
        if(dbValue > 0){
            widgetView.setColor('#060');
        }
        
        if(!isHidden){
            
            widgetView.defaultValueChildFields = this.setupParentDefaultFields();
    
            autocomplete_table = Titanium.UI.createTableView({
                height : 0,
                backgroundColor : '#fff',
                visible : false,
                borderColor : '#000',
                borderWidth : 0,
                top : 0,
                width: '92%',
                textField : widgetView
            });
    
            widgetView.autocomplete_table = autocomplete_table;
    
            autocomplete_table.addEventListener('click', function(e) {
                var i, callback, street;
                
                try{
                    e.source.textField.textValue = e.source.textField.value = e.rowData.title;
                    e.source.textField.dbValue = e.rowData.nid;
        
                    e.source.autocomplete_table.setHeight(0);
                    e.source.autocomplete_table.setBorderWidth(0);
                    e.source.autocomplete_table.setVisible(false);
                    
                    street = Widget[e.source.textField.instance.field_name].getFirstStreetAddress(e.rowData.nid);
                    e.source.textField.addressLabel.text = street + ' - touch to view';
                    e.source.textField.addressLabel.height = 20;
                    
                    e.source.textField.setColor('#060');
        
                    if (Ti.App.isAndroid) {
                        // Make sure the cursor is at the end of the text
                        e.source.textField.setSelection(e.source.textField.value.length, e.source.textField.value.length);
                    }
        
                    // Pretend like this is just loaded - mainly a fix for android, but makes sense for both
                    //e.source.textField.touched = false;
                    
                    e.source.textField.clickedAutocomplete = true;
                    
                    Widget[e.source.textField.instance.field_name].setChildDefaultValues(e.source.textField);
        
                    if ( typeof e.source.textField.onChangeCallbacks !== 'undefined') {
                        if (e.source.textField.onChangeCallbacks.length > 0) {
                            for ( i = 0; i < e.source.textField.onChangeCallbacks.length; i++) {
                                callback = e.source.textField.onChangeCallbacks[i];
                                Widget[e.source.textField.instance.field_name].formObj[callback](e.source.textField.onChangeCallbackArgs[i]);
                            }
                        }
                    }
                }
                catch(ex1){
                    Omadi.service.sendErrorReport("Exception in omadi reference auto complete: " + ex1);
                }
            });
    
            widgetView.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
            this.formObj.addCheckConditionalFields(widgetView.check_conditional_fields);
    
            widgetView.addEventListener('focus', function(e){
               e.source.touched = true; 
            });
            
            widgetView.addEventListener('click', function(e){
               e.source.touched = true; 
            });
    
            widgetView.addEventListener('blur', function(e) {
                e.source.autocomplete_table.setBorderWidth(0);
                e.source.autocomplete_table.setHeight(0);
                e.source.autocomplete_table.setVisible(false);
                e.source.blurred = true;
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
    
            widgetView.addEventListener('change', function(e) {
                var possibleValues, tableData, i, j, regEx, row, upperCaseValue, callback, street;
                
                try{
                
                    if(Ti.App.isAndroid && e.source.clickedAutocomplete){
                        e.source.clickedAutocomplete = false;
                        Ti.API.debug("IN clicked auto");
                        return;
                    }
                    
                    if (e.source.touched === true) {
                         
                        e.source.dbValue = null;
                        e.source.textValue = e.source.value;
                        
                        e.source.setColor('#ee0000');
                        e.source.addressLabel.setHeight(0);
                        
                        if (e.source.lastValue != e.source.value && e.source.value != '') {
                            possibleValues = e.source.possibleValues;
        
                            upperCaseValue = e.source.value.toUpperCase();
                            tableData = [];
        
                            for ( i = 0; i < possibleValues.length; i++) {
        
                                regEx = new RegExp(e.source.value, 'i');
                                if (possibleValues[i].title.search(regEx) != -1) {
                                    //Check match
                                    if (upperCaseValue == possibleValues[i].title.toUpperCase()) {
                                        e.source.dbValue = possibleValues[i].nid;
                                        
                                        Widget[e.source.instance.field_name].setChildDefaultValues(e.source);
                                        
                                        e.source.autocomplete_table.setHeight(0);
                                        e.source.autocomplete_table.setBorderWidth(0);
                                        e.source.autocomplete_table.setVisible(false);
                                        
                                        street = Widget[e.source.instance.field_name].getFirstStreetAddress(e.source.dbValue);
                                        
                                        e.source.addressLabel.text = street + ' - touch to view';
                                        e.source.addressLabel.height = 20;
                                        
                                        e.source.setColor('#006600');
                                        
                                        if (e.source.onChangeCallbacks.length > 0) {
                                            for ( j = 0; j < e.source.onChangeCallbacks.length; j++) {
                                                callback = e.source.onChangeCallbacks[j];
                                                Widget[e.source.instance.field_name].formObj[callback](e.source.onChangeCallbackArgs[j]);
                                            }
                                        }
                                    }
                                    else {
                                        e.source.dbValue = null;
                                        
                                         //Create partial matching row
                                        row = Ti.UI.createTableViewRow({
                                            height : 38,
                                            title : possibleValues[i].title,
                                            nid : possibleValues[i].nid,
                                            color : '#000000',
                                            autocomplete_table : e.source.autocomplete_table,
                                            textField : e.source
                                        });
                                        
                                        Ti.API.debug(possibleValues[i].title);
            
                                        // apply rows to data array
                                        tableData.push(row);
            
                                        if (tableData.length >= 4) {
                                            break;
                                        }
                                    }
                                }
                            }
        
                            e.source.autocomplete_table.setData(tableData);
        
                            if (tableData.length == 0) {
                                e.source.autocomplete_table.setBorderWidth(0);
                                e.source.autocomplete_table.setHeight(0);
                                e.source.autocomplete_table.setVisible(false);
                            }
                            else {
                                e.source.autocomplete_table.setBorderWidth(1);
                                e.source.autocomplete_table.setHeight(38 * tableData.length);
                                e.source.autocomplete_table.setVisible(true);
                            }
                            
                            if(e.source.blurred){
                                e.source.blurred = false;
                                Widget[e.source.instance.field_name].formObj.scrollToField(e);
                            }
                        }
                        else {
                            e.source.autocomplete_table.setBorderWidth(0);
                            e.source.autocomplete_table.setHeight(0);
                            e.source.autocomplete_table.setVisible(false);
                        }
                    }
                    
                    if(e.source.check_conditional_fields.length > 0){
                        if(typeof e.source.lastValue === 'undefined' || typeof e.source.value === 'undefined' || 
                                  e.source.lastValue == "" || e.source.value == ""){
                            Ti.API.debug("Checking conditionally required");
                            Widget[e.source.instance.field_name].formObj.setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                        }
                    }
                
                    e.source.lastValue = e.source.value;
                }
                catch(ex){
                    Omadi.service.sendError("Exception in omadi reference change event: " + ex);
                }
            });
    
            wrapper.add(widgetView);
            wrapper.add(autocomplete_table);
            wrapper.add(addressLabel);
        }
    }
    
    widgetView.addressLabel = addressLabel;
    addressLabel.widgetView = widgetView;

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


exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new OmadiReferenceWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};


