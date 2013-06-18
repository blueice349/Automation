/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField, dbEsc*/

Omadi.widgets.taxonomy_term_reference = {

    getFieldView : function(node, instance) {"use strict";

        instance.elements = [];

        var settings = instance.settings, fieldView, i, j, element, addAnotherItemButton = null;

        fieldView = Ti.UI.createView({
            width : '100%',
            layout : 'vertical',
            height : Ti.UI.SIZE,
            instance : instance
        });

        instance.fieldView = fieldView;

        fieldView.add(Omadi.widgets.label.getRegularLabelView(instance));
        setConditionallyRequiredLabelForInstance(node, instance);

        if ( typeof instance.numVisibleFields === 'undefined') {

            if (settings.cardinality == -1) {

                instance.numVisibleFields = 1;
            }
            else {
                instance.numVisibleFields = settings.cardinality;
            }
        }

        // Add the actual fields
        for ( i = 0; i < instance.numVisibleFields; i++) {

            element = Omadi.widgets.taxonomy_term_reference.getNewElement(node, instance, i);
            instance.elements.push(element);
            fieldView.add(element);
            fieldView.add(Omadi.widgets.getSpacerView());
        }
        
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

        var settings, widgetView, dbValue, textValue, i, options, textOptions, wrapperView, 
            descriptionText, descriptionLabel, isAutocomplete, autocomplete_table, defaultTerm;
        
        /*global labelViews*/
        
        settings = instance.settings;
        
        if (instance.settings.cardinality == -1) {
            dbValue = [];
            textValue = '';
            if ( typeof node[instance.field_name] !== 'undefined') {
                if ( typeof node[instance.field_name].dbValues !== 'undefined') {
                    dbValue = node[instance.field_name].dbValues;
                }

                if ( typeof node[instance.field_name].textValues !== 'undefined') {
                    textValue = node[instance.field_name].textValues;
                    if (textValue.length > 0) {
                        textValue = textValue.join(', ');
                    }
                    else{
                        textValue = "";
                    }
                }
            }
            
            if (dbValue.length == 0 && typeof settings.default_value !== 'undefined') {
                if(parseInt(settings.default_value, 10) > 0){
                    dbValue.push(parseInt(settings.default_value, 10));
                    defaultTerm = Omadi.data.loadTerm(dbValue[0]);
                    textValue = defaultTerm.name;
                }
            }
        }
        else {
            dbValue = null;
            textValue = "";
            if ( typeof node[instance.field_name] !== 'undefined') {
                if ( typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined') {
                    dbValue = node[instance.field_name].dbValues[index];
                }

                if ( typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[index] !== 'undefined') {
                    textValue = node[instance.field_name].textValues[index];
                }
            }
            
            if (dbValue === null && typeof settings.default_value !== 'undefined') {
                if(parseInt(settings.default_value, 10) > 0){
                    dbValue = parseInt(settings.default_value, 10);
                    defaultTerm = Omadi.data.loadTerm(dbValue);
                    textValue = defaultTerm.name;
                }
            }
        }
        
        Ti.API.debug("Creating taxonomy_term_reference field");

        options = Omadi.widgets.taxonomy_term_reference.getOptions(instance);

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

        wrapperView = Ti.UI.createView({
            layout : 'vertical',
            height : Ti.UI.SIZE,
            width : '100%'
        });
        
        isAutocomplete = false;
        if(instance.widget.type == 'taxonomy_autocomplete'){
            isAutocomplete = true;
        }
        
        if(isAutocomplete){
            widgetView = Omadi.widgets.getTextField(instance);
            widgetView.view_title = instance.label;
            widgetView.descriptionLabel = descriptionLabel;
            widgetView.possibleValues = options;
            widgetView.setValue(textValue);
            widgetView.textValue = textValue;
            widgetView.dbValue = dbValue;
            widgetView.lastValue = textValue;
            widgetView.touched = false;
            
            autocomplete_table = Titanium.UI.createTableView({
                zIndex : 999,
                height : 0,
                backgroundColor : '#FFFFFF',
                visible : false,
                borderColor : '#000',
                borderWidth : 0,
                top : 0,
                textField : widgetView
            });
    
            widgetView.autocomplete_table = autocomplete_table;
    
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
            
            widgetView.addEventListener('focus', Omadi.widgets.taxonomy_term_reference.scrollUp);
            widgetView.addEventListener('click', Omadi.widgets.taxonomy_term_reference.scrollUp);
    
            widgetView.addEventListener('blur', function(e) {
                e.source.autocomplete_table.setBorderWidth(0);
                e.source.autocomplete_table.setHeight(0);
                e.source.autocomplete_table.setVisible(false);
                
                if(typeof e.source.instance.settings.restrict_new_autocomplete_terms !== 'undefined' && 
                    e.source.instance.settings.restrict_new_autocomplete_terms == 1 && 
                    e.source.dbValue === null && 
                    e.source.value > ""){
                        
                        alert("The value \"" + e.source.value + "\" will not be saved for the \"" + e.source.instance.label + "\" field because new items have been disabled by the administrator.");
                }
            });
            
            widgetView.addEventListener('change', function(e) {
                /*global setConditionallyRequiredLabels*/
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
            
            descriptionLabel.setHeight(0);
        }
        else{
            
            widgetView = Omadi.widgets.getLabelField(instance);
            widgetView.top = 1;
            widgetView.bottom = 1;
            widgetView.view_title = instance.label;
            widgetView.descriptionLabel = descriptionLabel;
            widgetView.options = options;
            widgetView.setText(textValue);
            widgetView.textValue = textValue;
            widgetView.dbValue = dbValue;
            
            if (instance.can_edit) {
                widgetView.addEventListener('click', function(e) {
                    /*global setConditionallyRequiredLabels*/
                    var i, postDialog, textOptions;
    
                    if (instance.settings.cardinality == -1) {
    
                        Omadi.widgets.getMultipleSelector(e.source);
                    }
                    else {
    
                        textOptions = [];
                        for ( i = 0; i < e.source.options.length; i++) {
                            textOptions.push(e.source.options[i].title);
                        }
                        
                        textOptions.push('- Cancel -');
    
                        postDialog = Titanium.UI.createOptionDialog({
                            title: labelViews[e.source.instance.field_name].text
                        });
                        postDialog.options = textOptions;
                        postDialog.cancel = textOptions.length - 1;
                        postDialog.widgetView = e.source;
                        postDialog.show();
    
                        postDialog.addEventListener('click', function(ev) {
                            
                            if (ev.index >= 0 && ev.index != ev.source.cancel) {
                                var textValue = ev.source.options[ev.index];
    
                                if (textValue == '- None -') {
                                    textValue = "";
                                }
                                ev.source.widgetView.textValue = textValue;
                                ev.source.widgetView.setText(textValue);
                                ev.source.widgetView.value = ev.source.widgetView.dbValue = ev.source.widgetView.options[ev.index].dbValue;
                                
                                if (ev.source.widgetView.check_conditional_fields.length > 0) {
    
                                    setConditionallyRequiredLabels(ev.source.widgetView.instance, ev.source.widgetView.check_conditional_fields);
                                }
                            }
                        });
                    }
                });
            }
        }

        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);

        wrapperView.add(widgetView);
        wrapperView.add(descriptionLabel);
        
        if(isAutocomplete){
            wrapperView.add(autocomplete_table);
        }

        return wrapperView;
    },
    getOptions : function(instance) {"use strict";

        var db, result, vid, options;
        db = Omadi.utils.openMainDatabase();
        
        options = [];

        result = db.execute("SELECT vid FROM vocabulary WHERE machine_name = '" + instance.settings.vocabulary + "'");
        if(result.isValidRow()){
            vid = result.fieldByName('vid');
            result.close();
    
            result = db.execute("SELECT name, tid, description FROM term_data WHERE vid='" + vid + "' GROUP BY name ORDER BY CAST(`weight` AS INTEGER) ASC");
    
           
    
            if (instance.settings.cardinality != -1 && instance.required == 0) {
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
    },
    scrollUp : function(e) {"use strict";
        var calculatedTop;
        /*global scrollView, scrollPositionY*/
        e.source.touched = true;
        if ( typeof scrollView !== 'undefined') {
            calculatedTop = e.source.convertPointToView({
                x : 0,
                y : 0
            }, scrollView);
            scrollView.scrollTo(0, calculatedTop.y - 18 + scrollPositionY);
        }
    },
    addNewTerms: function(node){"use strict";
        var instances, field_name, i;
        
        instances = Omadi.data.getFields(node.type);
        
        for(field_name in instances){
            if(instances.hasOwnProperty(field_name)){
                if(instances[field_name].type == 'taxonomy_term_reference' && instances[field_name].widget.type == 'taxonomy_autocomplete'){
                    
                    if(typeof node[field_name] !== 'undefined' && typeof node[field_name].dbValues !== 'undefined'){
                        for(i = 0; i < node[field_name].dbValues.length; i ++){
                            if(node[field_name].dbValues[i] == -1){
                                node[field_name].dbValues[i] = Omadi.widgets.taxonomy_term_reference.insertNewTerm(instances[field_name].settings.vocabulary, node[field_name].textValues[i]);
                            }
                        }
                    }
                }
            }
        }
        
        return node;
    },
    insertNewTerm: function(machine_name, name){"use strict";
        var db, result, tid = -2, vid = 0, retval = null;
        
        db = Omadi.utils.openMainDatabase();
        result = db.execute("SELECT MIN(tid) FROM term_data");
        if(result.isValidRow()){
            tid = result.field(0, Ti.Database.FIELD_TYPE_INT);
            tid -= 1; 
        }
        result.close();
        
        result = db.execute("SELECT vid FROM vocabulary WHERE machine_name='" + dbEsc(machine_name) + "'");
        if(result.isValidRow()){
            vid = result.fieldByName('vid');
            
            // -2 is the first negative tid to use because -1 is a place holder for a non-set new term
            tid = Math.min(tid, -2);
            
            db.execute("INSERT INTO term_data (tid, vid, name, description, weight, created) VALUES (" + tid + "," + vid + ",'" + dbEsc(name) + "','',0," + Omadi.utils.getUTCTimestamp() + ")");
            Ti.API.debug("tid: " + tid);
            retval = tid;
        }
        result.close();
        
        db.close();
        return retval;
    }
};




