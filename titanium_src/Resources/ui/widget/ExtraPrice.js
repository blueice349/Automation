/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;
Widget = {};

function ExtraPriceWidget(formObj, instance, fieldViewWrapper){"use strict";
    this.formObj = formObj;
    this.instance = instance;
    this.fieldView = null;
    this.node = formObj.node;
    this.dbValues = [];
    this.textValues = [];
    this.elements = [];
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
    
    if ( typeof this.node[this.instance.field_name] !== 'undefined' &&
        typeof this.node[this.instance.field_name].dbValues !== 'undefined') {
            
        if(Omadi.utils.isArray(this.node[this.instance.field_name].dbValues)){
            this.numVisibleFields = this.node[this.instance.field_name].dbValues.length;
            
            if(this.numVisibleFields == 0){
                this.numVisibleFields = 1;
            }
        }
    }
}

ExtraPriceWidget.prototype.getFieldView = function(){"use strict";
    
    var i, element, addButton;
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    this.fieldView.add(this.formObj.getRegularLabelView(this.instance));
    
    // Add the actual fields
    for(i = 0; i < this.numVisibleFields; i ++){
        this.elements[i] = this.getNewElement(i);
        this.fieldView.add(this.elements[i]);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    if(this.instance.can_edit){
        
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
            try{
                Widget[e.source.fieldName].numVisibleFields ++;
                Widget[e.source.fieldName].formObj.unfocusField();
                Widget[e.source.fieldName].redraw();
            }
            catch(ex){
                Omadi.service.sendErrorReport("Exception adding one to extra price: " + ex);
            }
        });
        
        this.fieldView.add(addButton);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    return this.fieldView;
};

ExtraPriceWidget.prototype.redraw = function(){"use strict";
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

ExtraPriceWidget.prototype.getNewElement = function(index){"use strict";
    var settings, descView, priceView, dbValue, wrapper, dollarView, dataRow, 
            textValue, priceValue, autocomplete_table, outsideWrapper, description_type, 
            detailsView, description, details, jsonValue;

    dbValue = "";
    description = "";
    details = "";
    textValue = null;
    jsonValue = [];
    
    dataRow = [];
    
    if ( typeof this.node[this.instance.field_name] !== 'undefined') {
        
        if ( typeof this.node[this.instance.field_name].dbValues !== 'undefined' && typeof this.node[this.instance.field_name].dbValues[index] !== 'undefined') {
            dbValue = this.node[this.instance.field_name].dbValues[index];
            
            if ( typeof this.node[this.instance.field_name].textValues !== 'undefined' && typeof this.node[this.instance.field_name].textValues[index] !== 'undefined') {
                textValue = this.node[this.instance.field_name].textValues[index];
                
                jsonValue = textValue;
                
                if(jsonValue != null){
                    if(typeof jsonValue.desc !== 'undefined'){
                        description = jsonValue.desc;
                    }
                    if(typeof jsonValue.details !== 'undefined'){
                        details = jsonValue.details;
                    }
                }
            }
        }
    }
    
    if(description == null){
        description = "";
    }
    
    if(details == null){
        details = "";
    }
    
    // This one is purposefully different
    if(textValue == ""){
        textValue = null;
    }
    
    Ti.API.debug("Creating extra_price field: " + this.instance.label);
    
    outsideWrapper = Ti.UI.createView({
        width: '100%',
        height: Ti.UI.SIZE,
        layout: 'vertical'
    });
    
    wrapper = Ti.UI.createView({
       width: '100%',
       height: Ti.UI.SIZE,
       layout: 'horizontal'
    });
    
    dollarView = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        text: '$',
        height: Ti.UI.SIZE,
        left: 7
    });
    
    priceValue = dbValue;
    if(priceValue != ""){
        if(!isNaN(parseFloat(dbValue))){
            priceValue = parseFloat(Math.round(dbValue * 100) / 100).toFixed(2);
        }
        else{
            priceValue = "";
        }
    }
    
    // We only want to show blank instead of 0.00 or 0
    if(priceValue == 0){
        priceValue = "";
    }
    
    priceView = this.formObj.getTextField(this.instance);
    priceView.dbValue = dbValue;
    priceView.setValue(priceValue);
    priceView.setKeyboardType(Ti.UI.KEYBOARD_DEFAULT);
    priceView.width = '25%';
    priceView.left = 2;
    priceView.right = 0;
    
    priceView.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
    this.formObj.addCheckConditionalFields(priceView.check_conditional_fields);
    
    description_type = 'select';
    if(typeof this.instance.settings.description_type !== 'undefined'){
        description_type = this.instance.settings.description_type;
    }
    
    if(description_type == 'autocomplete'){
        
        descView = this.formObj.getTextField(this.instance);
        descView.textValue = textValue;
        descView.setValue(description);
        descView.setKeyboardType(Ti.UI.KEYBOARD_DEFAULT);
        descView.width = '60%';
        descView.possibleValues = this.getOptions();
        descView.touched = false;
        descView.blurred = true;
        
        descView.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
        this.formObj.addCheckConditionalFields(descView.check_conditional_fields);
    
        autocomplete_table = Titanium.UI.createTableView({
            zIndex : 999,
            height : 0,
            backgroundColor : '#FFFFFF',
            visible : false,
            borderColor : '#000',
            borderWidth : 0,
            top : 0,
            textField : descView
        });

        descView.autocomplete_table = autocomplete_table;
        
        descView.addEventListener('focus', function(e){
           e.source.touched = true; 
        });
        
        descView.addEventListener('click', function(e){
           e.source.touched = true; 
        });
        
        descView.addEventListener('blur', function(e) {
            try{
                e.source.autocomplete_table.setBorderWidth(0);
                e.source.autocomplete_table.setHeight(0);
                e.source.autocomplete_table.setVisible(false);
                e.source.blurred = true;
            }
            catch(ex){
                try{
                    Omadi.service.sendErrorReport("exception in extra price blur: " + ex);
                }catch(ex1){}
            }
        });
        
        autocomplete_table.addEventListener('click', function(e) {
            var jsonValue;
            try{
                e.source.textField.value = e.rowData.title;
                
                jsonValue = e.source.textValue;
                           
                if(jsonValue == null){
                    jsonValue = {};
                }
                
                jsonValue.desc = e.rowData.title;
                e.source.textField.textValue = jsonValue;
    
                e.source.autocomplete_table.setHeight(0);
                e.source.autocomplete_table.setBorderWidth(0);
                e.source.autocomplete_table.setVisible(false);
    
                e.source.lastValue = e.rowData.title;
                
                if (Ti.App.isAndroid) {
                    // Make sure the cursor is at the end of the text
                    e.source.textField.setSelection(e.source.textField.value.length, e.source.textField.value.length);
                }
                
                // Pretend like this is just loaded - mainly a fix for android, but makes sense for both
                e.source.textField.touched = false;
            }
            catch(ex){
                Omadi.service.sendErrorReport("Exception touching autocomplete in extra price: " + ex);
            }
        });

        descView.addEventListener('change', function(e) {
            /*global setConditionallyRequiredLabels*/
            var upperCaseValue, tableData, possibleValues, i, regEx, row, jsonValue;
            
            if (e.source.touched === true) {
                
                // Must compare as strings since 4. and 4 would need to be different, but wouldn't be for a number
                if ((e.source.lastValue + "".toString()) != (e.source.value + "".toString())) {
                    
                    jsonValue = e.source.textValue;
                       
                    if(jsonValue == null){
                        jsonValue = {};
                    }
                    
                    jsonValue.desc = e.source.value;
                    e.source.textValue = jsonValue;
                                
                    possibleValues = e.source.possibleValues;
        
                    upperCaseValue = e.source.value.toUpperCase();
                    tableData = [];
                    
                    for ( i = 0; i < possibleValues.length; i++) {
                        
                        if(possibleValues[i].title == '' || e.source.value.length == 0){
                            // Don't show emtpy entries
                            continue;
                        }
                        
                        regEx = new RegExp(e.source.value, 'i');
                        if (possibleValues[i].title.search(regEx) != -1) {
                            //Check match
                            if (upperCaseValue == possibleValues[i].title.toUpperCase()) {
                                
                                jsonValue = e.source.textValue;
                       
                                if(jsonValue == null){
                                    jsonValue = {};
                                }
                                
                                jsonValue.desc = possibleValues[i].textValue;
                                e.source.textValue = jsonValue;
                            }
    
                            //Create partial matching row
                            row = Ti.UI.createTableViewRow({
                                height : 38,
                                title : possibleValues[i].title,
                                priceValue : possibleValues[i].dbValue,
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
            
            if(e.source.check_conditional_fields.length > 0){
                if(typeof e.source.lastValue === 'undefined' || typeof e.source.value === 'undefined' || 
                          e.source.lastValue == "" || e.source.value == ""){
                    Ti.API.debug("Checking conditionally required");
                    Widget[e.source.instance.field_name].formObj.setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                }
            }
            
            // must come after the conditional checking
            e.source.lastValue = e.source.value;
        });
    }
    else{ 
        // The default select list widget
        descView = this.formObj.getLabelField(this.instance);
        descView.textValue = textValue;
        descView.setText(description);
        descView.width = '60%';
        descView.top = 1;
        descView.bottom = 1;
        descView.possibleValues = this.getOptions();
        
        descView.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
        this.formObj.addCheckConditionalFields(descView.check_conditional_fields);
        
        descView.addEventListener('click', function(e){
            var dialog, options, i;
            
            try{
                options = [];
                for(i = 0; i < e.source.possibleValues.length; i ++){
                    options.push(e.source.possibleValues[i].title);
                }
                
                options.push('Cancel');
                
                dialog = Ti.UI.createOptionDialog({
                    title: 'Description',
                    options: options,
                    cancel: options.length - 1,
                    descView: e.source
                });
                
                dialog.addEventListener('click', function(ev){
                    try{
                        if(ev.index !== null && ev.index != ev.source.cancel){
                            
                            if(typeof ev.source.options[ev.index] !== 'undefined'){
                                
                                jsonValue = ev.source.descView.textValue;
                               
                                if(jsonValue == null){
                                    jsonValue = {};
                                }
                                
                                jsonValue.desc = ev.source.options[ev.index];
                                
                                ev.source.descView.textValue = jsonValue;
                                ev.source.descView.setText(ev.source.options[ev.index]);
                                
                                if(e.source.check_conditional_fields.length > 0){
                                    Ti.API.debug("Checking conditionally required");
                                    Widget[e.source.descView.instance.field_name].formObj.setConditionallyRequiredLabels(e.source.descView.instance, e.source.descView.check_conditional_fields);
                                }
                            }
                        }
                    }
                    catch(ex){
                        Omadi.service.sendErrorReport("Exception with desc view dialog click: " + ex);
                    }
                });
                
                dialog.show();
            }
            catch(ex){
                Omadi.service.sendErrorReport("Exception desc view click in extra price: " + ex);
            }
        });
    }
    
    priceView.addEventListener('change', function(e) {
        var tempValue;
        /*jslint regexp: true*/
       
        // Must compare as strings since 4. and 4 would need to be different, but wouldn't be for a number
        if ((e.source.lastValue + "".toString()) != (e.source.value + "".toString())) {
            tempValue = "";
            if(e.source.value !== null){
                if((e.source.value + "".toString()).match(/^-?\d*\.?\d?\d?$/)){
                    tempValue = e.source.value;
                }
                else{
                    tempValue = e.source.lastValue;
                }
            }
            
            if (tempValue != e.source.value) {
                e.source.value = tempValue;
                if (Ti.App.isAndroid && e.source.value != null && typeof e.source.value.length !== 'undefined') {
                    e.source.setSelection(e.source.value.length, e.source.value.length);
                }
            }

            if (e.source.value != null && typeof e.source.value.length !== 'undefined' && e.source.value.length > 0) {
                e.source.dbValue = parseFloat(e.source.value);
            }
            else {
                e.source.dbValue = null;
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
    });
    
    detailsView = this.formObj.getTextField(this.instance);
    detailsView.setValue(details);
    detailsView.setKeyboardType(Ti.UI.KEYBOARD_DEFAULT);
    detailsView.width = '60%';
    detailsView.top = 2;
    detailsView.hintText = 'Details';
    detailsView.visible = false;
    detailsView.height = 0;
    detailsView.descView = descView;
    
    if(typeof this.instance.settings.use_details !== 'undefined' && this.instance.settings.use_details == 1){
        detailsView.visible = true;
        detailsView.height = Ti.UI.SIZE;
        
        if(description_type == 'autocomplete'){
            descView.hintText = 'Description';   
        }
    }
    
    detailsView.addEventListener('change', function(e){
        jsonValue = e.source.descView.textValue;
                       
        if(jsonValue == null){
            jsonValue = {};
        }
        
        jsonValue.details = e.source.value;
        e.source.descView.textValue = jsonValue;
    });
    
    wrapper.add(descView);
    wrapper.add(dollarView);
    wrapper.add(priceView);
    
    outsideWrapper.add(wrapper);
    outsideWrapper.add(detailsView);
    
    if(description_type == 'autocomplete'){
        outsideWrapper.add(autocomplete_table);
    }
    
    return outsideWrapper;
};

ExtraPriceWidget.prototype.getOptions = function() {"use strict";
    var db, result, vid, options;
    
    db = Omadi.utils.openMainDatabase();
    
    options = [];

    result = db.execute("SELECT vid FROM vocabulary WHERE machine_name = '" + this.instance.settings.vocabulary + "'");
    if(result.isValidRow()){
        vid = result.fieldByName('vid');
        result.close();

        result = db.execute("SELECT name, tid, description FROM term_data WHERE vid='" + vid + "' GROUP BY name ORDER BY CAST(`weight` AS INTEGER) ASC");

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

ExtraPriceWidget.prototype.cleanUp = function(){"use strict";
    var i, j;
    Ti.API.debug("in amounts widget cleanup");
    
    try{
        Widget[this.instance.field_name] = null;
        
        for(j = 0; j < this.elements.length; j ++){
            this.fieldView.remove(this.elements[j]);
            this.elements[j] = null;
        }
        
        this.fieldView = null;
        this.fieldViewWrapper = null;
        this.formObj = null;
        this.node = null;
        this.dbValues = null;
        this.textValues = null;
        this.nodeElement = null;
        this.instance = null;
        
        Ti.API.debug("At end of amounts widget cleanup");
    }
    catch(ex){
        try{
            Omadi.service.sendErrorReport("Exception cleaning up amounts widget field: " + ex);
        }
        catch(ex1){}
    }
    
    Omadi = null;
};

exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new ExtraPriceWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};


