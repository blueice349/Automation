/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;
Widget = {};

function TaxonomyTermReferenceWidget(formObj, instance, fieldViewWrapper){"use strict";
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
    
    // Unlimited cardinality will only use 1 widget
    if(this.instance.settings.cardinality > 1){
        this.numVisibleFields = this.instance.settings.cardinality;
    }
}

TaxonomyTermReferenceWidget.prototype.getFieldView = function(){"use strict";
    
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
    
    return this.fieldView;
};

TaxonomyTermReferenceWidget.prototype.redraw = function(){"use strict";
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

TaxonomyTermReferenceWidget.prototype.getNewElement = function(index){"use strict";
    var dbValue, textValue, element, options, descriptionText, descriptionLabel, wrapper, i, 
        defaultTerm, isAutocomplete, autocomplete_table;
    
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
    
    if (this.instance.settings.cardinality == -1) {
        dbValue = [];
        textValue = '';
        if(this.nodeElement){
            
            dbValue = this.dbValues;
            textValue = this.textValues;
            
            if (textValue.length > 0) {
                textValue = textValue.join(', ');
            }
            else {
                textValue = "";
            }
        }
        
        if (dbValue.length == 0 && typeof this.instance.settings.default_value !== 'undefined') {
            if(parseInt(this.instance.settings.default_value, 10) > 0){
                dbValue.push(parseInt(this.instance.settings.default_value, 10));
                defaultTerm = Omadi.data.loadTerm(dbValue[0]);
                textValue = defaultTerm.name;
            }
        }
    }
    else{
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
        
        if (dbValue === null && typeof this.instance.settings.default_value !== 'undefined') {
            if(parseInt(this.instance.settings.default_value, 10) > 0){
                dbValue = parseInt(this.instance.settings.default_value, 10);
                defaultTerm = Omadi.data.loadTerm(dbValue);
                textValue = defaultTerm.name;
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
    
    isAutocomplete = false;
    if(this.instance.widget.type == 'taxonomy_autocomplete'){
        isAutocomplete = true;
    }
    
    if(isAutocomplete){
        element = this.formObj.getTextField(this.instance);
        element.view_title = this.instance.label;
        element.descriptionLabel = descriptionLabel;
        element.possibleValues = options;
        element.setValue(textValue);
        element.textValue = textValue;
        element.dbValue = dbValue;
        element.lastValue = textValue;
        element.touched = false;
        element.blurred = true;
        
        element.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
        this.formObj.addCheckConditionalFields(element.check_conditional_fields);
        
        autocomplete_table = Titanium.UI.createTableView({
            zIndex : 999,
            height : 0,
            backgroundColor : '#FFFFFF',
            visible : false,
            borderColor : '#000',
            borderWidth : 0,
            top : 0,
            textField : element
        });

        element.autocomplete_table = autocomplete_table;

        autocomplete_table.addEventListener('click', function(e) {

            e.source.textField.textValue = e.source.textField.value = e.rowData.title;
            e.source.textField.dbValue = e.rowData.dbValue;

            e.source.autocomplete_table.setHeight(0);
            e.source.autocomplete_table.setBorderWidth(0);
            e.source.autocomplete_table.setVisible(false);

            if (Ti.App.isAndroid) {
                // Make sure the cursor is at the end of the text
                e.source.textField.setSelection(e.source.textField.value.length, e.source.textField.value.length);
            }

            // Pretend like this is just loaded - mainly a fix for android, but makes sense for both
            e.source.textField.touched = false;
        });
        
        element.addEventListener('focus', function(e){
           e.source.touched = true; 
        });
        
        element.addEventListener('click', function(e){
           e.source.touched = true; 
        });
        
        element.addEventListener('blur', function(e) {
            e.source.autocomplete_table.setBorderWidth(0);
            e.source.autocomplete_table.setHeight(0);
            e.source.autocomplete_table.setVisible(false);
            e.source.blurred = true;
            
            if(typeof e.source.instance.settings.restrict_new_autocomplete_terms !== 'undefined' && 
                e.source.instance.settings.restrict_new_autocomplete_terms == 1 && 
                e.source.dbValue === null && 
                e.source.value > ""){
                    
                    alert("The value \"" + e.source.value + "\" will not be saved for the \"" + e.source.instance.label + "\" field because new items have been disabled by the administrator.");
            }
        });
        
        element.addEventListener('change', function(e) {
            var possibleValues, tableData, i, regEx, row, upperCaseValue, callback;

            if (e.source.touched === true) {

                e.source.dbValue = null;
                e.source.textValue = e.source.value;

                if (e.source.lastValue != e.source.value && e.source.value != '') {
                    possibleValues = e.source.possibleValues;

                    upperCaseValue = e.source.value.toUpperCase();
                    tableData = [];
                    
                    if(typeof e.source.instance.settings.restrict_new_autocomplete_terms !== 'undefined' && e.source.instance.settings.restrict_new_autocomplete_terms == 1){
                        e.source.dbValue = null;
                    }
                    else{
                        e.source.dbValue = -1;
                    }
                    
                    for ( i = 0; i < possibleValues.length; i++) {

                        regEx = new RegExp(e.source.value, 'i');
                        if (possibleValues[i].title.search(regEx) != -1) {
                            //Check match
                            if (upperCaseValue == possibleValues[i].title.toUpperCase()) {
                                e.source.dbValue = possibleValues[i].dbValue;
                            }

                            //Create partial matching row
                            row = Ti.UI.createTableViewRow({
                                height : 38,
                                title : possibleValues[i].title,
                                dbValue : possibleValues[i].dbValue,
                                color : '#000000',
                                autocomplete_table : e.source.autocomplete_table,
                                textField : e.source
                            });

                            // apply rows to data array
                            tableData.push(row);

                            if (tableData.length >= 4) {
                                break;
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
            e.source.lastValue = e.source.value;

            if (e.source.check_conditional_fields.length > 0) {
                Widget[e.source.instance.field_name].formObj.setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
            }
        });
        
        descriptionLabel.setHeight(0);
    }
    else{
        element = this.formObj.getLabelField(this.instance);
        element.top = 1;
        element.bottom = 1;
        element.view_title = this.instance.label;
        element.descriptionLabel = descriptionLabel;
        element.options = options;
        element.setText(textValue);
        element.textValue = textValue;
        element.dbValue = dbValue;
        
        element.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
        this.formObj.addCheckConditionalFields(element.check_conditional_fields);
        
        if (this.instance.can_edit) {
            element.addEventListener('click', function(e) {
                var i, postDialog, textOptions;
                
                try{
                    if (e.source.instance.settings.cardinality == -1) {
                        Widget[e.source.instance.field_name].formObj.getMultipleSelector(e.source);
                    }
                    else {
                        textOptions = [];
                        for ( i = 0; i < e.source.options.length; i++) {
                            textOptions.push(e.source.options[i].title);
                        }
                        
                        textOptions.push('- Cancel -');
    
                        postDialog = Titanium.UI.createOptionDialog({
                            title: Widget[e.source.instance.field_name].formObj.labelViews[e.source.instance.field_name].text
                        });
                        
                        postDialog.options = textOptions;
                        postDialog.cancel = textOptions.length - 1;
                        postDialog.element = e.source;
                        postDialog.show();
    
                        postDialog.addEventListener('click', function(ev) {
                            
                            if (ev.index >= 0 && ev.index != ev.source.cancel) {
                                var textValue = ev.source.options[ev.index];
    
                                if (textValue == '- None -') {
                                    textValue = "";
                                }
                                ev.source.element.textValue = textValue;
                                ev.source.element.setText(textValue);
                                ev.source.element.value = ev.source.element.dbValue = ev.source.element.options[ev.index].dbValue;
                                
                                if (ev.source.element.check_conditional_fields.length > 0) {
                                    Widget[ev.source.element.instance.field_name].formObj.setConditionallyRequiredLabels(ev.source.element.instance, ev.source.element.check_conditional_fields);
                                }
                            }
                        });
                    }
                }
                catch(ex){
                    Widget[e.source.instance.field_name].formObj.sendError("could not open taxonomy term select box: " + e.source.instance.label + " " + ex);
                }
            });
        }
    }
    
    wrapper = Ti.UI.createView({
        layout : 'vertical',
        height : Ti.UI.SIZE,
        width : '100%'
    });
    
    wrapper.add(element);
    wrapper.add(descriptionLabel);
    
    if(isAutocomplete){
        wrapper.add(autocomplete_table);
    }
    
    return wrapper;
};

TaxonomyTermReferenceWidget.prototype.getOptions = function(useNone) {"use strict";
    var db, result, vid, options;
    
    if(typeof useNone === 'undefined'){
        useNone = true;
    }
    
    db = Omadi.utils.openMainDatabase();
    
    options = [];

    result = db.execute("SELECT vid FROM vocabulary WHERE machine_name = '" + this.instance.settings.vocabulary + "'");
    if(result.isValidRow()){
        vid = result.fieldByName('vid');
        result.close();

        result = db.execute("SELECT name, tid, description FROM term_data WHERE vid='" + vid + "' GROUP BY name ORDER BY CAST(`weight` AS INTEGER) ASC");

        if (this.instance.settings.cardinality != -1 && this.instance.required == 0 && useNone) {
            options.push({
                title : '- None -',
                dbValue : null
            });
        }

        while (result.isValidRow()) {
            options.push({
                title : result.fieldByName('name'),
                dbValue : result.fieldByName('tid'),
                description : result.fieldByName('description')
            });
            result.next();
        }
        result.close();
    }
    
    db.close();

    return options;
};

exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new TaxonomyTermReferenceWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};
