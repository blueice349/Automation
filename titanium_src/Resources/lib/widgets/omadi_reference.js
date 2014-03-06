/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.omadi_reference = {

    getFieldView : function(node, instance) {"use strict";

        instance.elements = [];

        var settings = instance.settings, fieldView, i, j, element, addAnotherItemButton = null, autocomplete_table;

        fieldView = Ti.UI.createView({
            width : '100%',
            layout : 'vertical',
            height : Ti.UI.SIZE,
            instance : instance
        });

        instance.fieldView = fieldView;

        fieldView.add(Omadi.widgets.label.getRegularLabelView(instance));
        setConditionallyRequiredLabelForInstance(node, instance);

        instance.numVisibleFields = 1;

        // Add the actual fields
        element = Omadi.widgets.omadi_reference.getNewElement(node, instance, 0);
        instance.elements.push(element);
        fieldView.add(element);

        fieldView.add(Omadi.widgets.getSpacerView());
        
        Ti.UI.currentWindow.addEventListener('close', function(){
            var i, j;
            
            for(i = 0; i < instance.elements.length; i ++){
                
                if(instance.elements[i].children.length > 0){
                    for(j = instance.elements[i].children.length -1; j >= 0; j --){
                        instance.elements[i].remove(instance.elements[i].children[j]);
                        instance.elements[i].children[j] = null;
                    }
                }
                
                fieldView.remove(instance.elements[i]);
                instance.elements[i] = null;
            }
            
            instance.fieldView = null;
        });   

        return fieldView;
    },
    getNewElement : function(node, instance, index) {"use strict";

        var settings, widgetView, dbValue, textValue, nodeTypes, possibleValues, options,
            i, query, db, result, wrapper, autocomplete_table, calculatedTop, isHidden,
            vehicleNid, addressLabel;

        dbValue = "";
        textValue = "";
        if ( typeof node[instance.field_name] !== 'undefined') {
            if ( typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined') {
                dbValue = node[instance.field_name].dbValues[index];
            }

            if ( typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[index] !== 'undefined') {
                textValue = node[instance.field_name].textValues[index];
            }
        }

        settings = instance.settings;
        Ti.API.debug("Creating omadi_reference field");

        possibleValues = [];
        nodeTypes = [];

        for (i in instance.settings.reference_types) {
            if (instance.settings.reference_types.hasOwnProperty(i)) {
                nodeTypes.push(instance.settings.reference_types[i]);
            }
        }
        
        // Special case to automatically select the truck the user is in 
        if(nodeTypes.length == 1 && dbValue == "" && instance.isRequired && nodeTypes[0] == 'company_vehicle'){
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
        
        if(dbValue > 0){
            addressLabel.text = Omadi.widgets.omadi_reference.getFirstStreetAddress(dbValue);
        }
        
        if(instance.widget.type == 'omadi_reference_select'){
            
            options = [];
            
            for ( i = 0; i < possibleValues.length; i++) {
                options.push(possibleValues[i].title);
            }
            
            widgetView = Omadi.widgets.getLabelField(instance);
            widgetView.dbValue = dbValue;
            widgetView.textValue = textValue;
            widgetView.options = options;
            widgetView.possibleValues = possibleValues;
            widgetView.top = 1;
            widgetView.bottom = 1;
            widgetView.setText(textValue);
            
            if(instance.can_edit){
                widgetView.addEventListener('click', function(e) {
                    var postDialog = Titanium.UI.createOptionDialog();
                    postDialog.options = e.source.options;
                    postDialog.cancel = -1;
                    postDialog.widgetView = e.source;
                    postDialog.show();
    
                    postDialog.addEventListener('click', function(ev) {
                        var text;
                        
                        if (ev.index >= 0) {
                            
                            if(ev.source.widgetView.possibleValues[ev.index].nid === null){
                                text = '';   
                            }
                            else{
                                text = ev.source.options[ev.index];
                            }
                            ev.source.widgetView.textValue = text;
                            ev.source.widgetView.dbValue = ev.source.widgetView.possibleValues[ev.index].nid;
                            ev.source.widgetView.setText(text);
                        }
                    });
                });
            }
            
            wrapper.add(widgetView);
            
        }
        else{
        
            widgetView = Omadi.widgets.getTextField(instance);
            
            if(typeof instance.settings.hidden_on_form !== 'undefined' && instance.settings.hidden_on_form == 1){
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
                
                wrapper.add(widgetView);
            }
            else{
                widgetView = Omadi.widgets.getTextField(instance);
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
            widgetView.addressLabel = addressLabel;
            
            if(!isHidden){
                widgetView.defaultValueChildFields = Omadi.widgets.omadi_reference.setupParentDefaultFields(instance);
        
                autocomplete_table = Titanium.UI.createTableView({
                    //zIndex : 999,
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
                    
                    e.source.textField.textValue = e.source.textField.value = e.rowData.title;
                    e.source.textField.dbValue = e.rowData.nid;
        
                    e.source.autocomplete_table.setHeight(0);
                    e.source.autocomplete_table.setBorderWidth(0);
                    e.source.autocomplete_table.setVisible(false);
                    
                    street = Omadi.widgets.omadi_reference.getFirstStreetAddress(e.rowData.nid);
                    e.source.textField.addressLabel.text = street;
                    e.source.textField.addressLabel.height = 20;
                    
                    e.source.textField.setColor('#060');
        
                    if (Ti.App.isAndroid) {
                        // Make sure the cursor is at the end of the text
                        e.source.textField.setSelection(e.source.textField.value.length, e.source.textField.value.length);
                    }
        
                    // Pretend like this is just loaded - mainly a fix for android, but makes sense for both
                    //e.source.textField.touched = false;
                    
                    e.source.textField.clickedAutocomplete = true;
        
                    Omadi.widgets.omadi_reference.setChildDefaultValues(e.source.textField);
        
                    if ( typeof e.source.textField.onChangeCallbacks !== 'undefined') {
                        if (e.source.textField.onChangeCallbacks.length > 0) {
                            for ( i = 0; i < e.source.textField.onChangeCallbacks.length; i++) {
                                callback = e.source.textField.onChangeCallbacks[i];
                                callback(e.source.textField.onChangeCallbackArgs[i]);
                            }
                        }
                    }
                });
        
                widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);
        
                if (settings.min_length && settings.min_length != null && settings.min_length != "null") {
                    widgetView.minLength = settings.min_length;
                }
        
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
                    /*global setConditionallyRequiredLabels*/
        
                    var possibleValues, tableData, i, j, regEx, row, upperCaseValue, callback, street;
                    
                    Ti.API.debug("auto: " + e.source.clickedAutocomplete);
                    
                    if(Ti.App.isAndroid && e.source.clickedAutocomplete){
                        e.source.clickedAutocomplete = false;
                        Ti.API.debug("IN clicked auto");
                        return;
                    }
                    
                    if (e.source.touched === true) {
                        //Ti.API.info("changed");
                         
                        e.source.dbValue = null;
                        e.source.textValue = e.source.value;
                        
                        e.source.setColor('#ee0000');
                        
                        e.source.addressLabel.height = 0;
                        
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
                                        Omadi.widgets.omadi_reference.setChildDefaultValues(e.source);
                                        
                                        e.source.autocomplete_table.setHeight(0);
                                        e.source.autocomplete_table.setBorderWidth(0);
                                        e.source.autocomplete_table.setVisible(false);
                                        
                                        street = Omadi.widgets.omadi_reference.getFirstStreetAddress(e.source.dbValue);
                                        e.source.addressLabel.text = street;
                                        e.source.addressLabel.height = 20;
                                        
                                        e.source.setColor('#006600');
                                        
                                        if (e.source.onChangeCallbacks.length > 0) {
                                            for ( j = 0; j < e.source.onChangeCallbacks.length; j++) {
                                                callback = e.source.onChangeCallbacks[j];
                                                callback(e.source.onChangeCallbackArgs[j]);
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
                                Omadi.widgets.omadi_reference.scrollUp(e);
                            }
                        }
                        else {
                            e.source.autocomplete_table.setBorderWidth(0);
                            e.source.autocomplete_table.setHeight(0);
                            e.source.autocomplete_table.setVisible(false);
                        }
                    }
                    e.source.lastValue = e.source.value;
        
                    if (e.source.check_conditional_fields.length > 0) {
                        setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                    }
                });
        
                wrapper.add(widgetView);
                wrapper.add(autocomplete_table);
                wrapper.add(addressLabel);
            }
        }

        return wrapper;
    },
    // scrollUp : function(e) {"use strict";
        // var calculatedTop;
        // /*global scrollView, scrollPositionY*/
        // //Ti.API.debug("hi");
        // //e.source.touched = true;
        // if ( typeof scrollView !== 'undefined') {
            // Ti.API.debug("Scroll view defined");
            // calculatedTop = e.source.convertPointToView({
                // x : 0,
                // y : 0
            // }, scrollView);
            // scrollView.scrollTo(0, calculatedTop.y - 18 + scrollPositionY);
        // }
    // },
    scrollUp : function(e) {"use strict";
        var calculatedTop, amountToScrollUp;
        /*global scrollView, scrollPositionY*/
        if ( typeof scrollView !== 'undefined' && scrollView !== null) {
            calculatedTop = e.source.convertPointToView({
                x : 0,
                y : 0
            }, scrollView);
            
            amountToScrollUp = 187; // (4*38) + 35;
            
            if(calculatedTop.y < 210){ // 187 + 23
                amountToScrollUp -= (210 - calculatedTop.y);
            }
            
            if(amountToScrollUp > 0){
                scrollView.scrollTo(0, scrollPositionY + amountToScrollUp);
            }
        }
    },
    setupParentDefaultFields : function(omadi_reference_instance) {"use strict";
        var instances, field_name, instance, parentFieldName, childFieldNames = [];

        instances = Omadi.data.getFields(Ti.UI.currentWindow.type);

        for (field_name in instances) {
            if (instances.hasOwnProperty(field_name)) {
                instance = instances[field_name];
                if ( typeof instance.settings.parent_form_default_value !== 'undefined') {

                    if ( typeof instance.settings.parent_form_default_value.parent_field !== 'undefined' && instance.settings.parent_form_default_value.parent_field != "") {

                        parentFieldName = instance.settings.parent_form_default_value.parent_field;

                        if (parentFieldName == omadi_reference_instance.field_name) {

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
    },
    setChildDefaultValues : function(widgetView) {"use strict";
        var parentFieldName, defaultValueField, childFieldValues, parentNode, instance, instances, defaultValues, field_name, childFieldName, i, childInstance;
        /*global getFormFieldValues*/
        
        
        
        if (widgetView.dbValue > 0) {
            if (widgetView.defaultValueChildFields.length > 0) {
                
                Ti.API.debug("Setting default values");
                //Ti.API.debug(widgetView.dbValue);
                
                parentNode = Omadi.data.nodeLoad(widgetView.dbValue);
                //Ti.API.debug(parentNode.nid);
                
                for ( i = 0; i < widgetView.defaultValueChildFields.length; i++) {
                    childFieldName = widgetView.defaultValueChildFields[i].childFieldName;
                    defaultValueField = widgetView.defaultValueChildFields[i].defaultValueField;
                    childFieldValues = getFormFieldValues(childFieldName);
                    
                    if ( typeof childFieldValues.dbValues === 'undefined' || childFieldValues.dbValues.length == 0 || childFieldValues.dbValues[0] == null || childFieldValues.dbValues[0] == "") {

                        if ( typeof parentNode[defaultValueField] !== 'undefined') {
                            defaultValues = parentNode[defaultValueField];

                            Ti.API.debug("real defaults: " + JSON.stringify(defaultValues));

                            Omadi.widgets.setValues(childFieldName, defaultValues);
                        }
                    }
                }
            }
        }
    },
    getFirstStreetAddress : function(nid){"use strict";
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
    }
};

