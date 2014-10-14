/*jslint eqeq:true, plusplus: true, vars:true,nomen:true*/

var Utils = require('lib/Utils');
var Display = require('lib/Display');
var Database = require('lib/Database');

function ExtraPriceWidget(formObj, instance, fieldViewWrapper){"use strict";

    var hasDBValue = false;
    
    this.formObj = formObj;
    this.instance = instance;
    this.fieldView = null;
    this.node = formObj.node;
    this.dbValues = [];
    this.textValues = [];
    this.elements = [];
    
    this.descFields = [];
    this.detailsFields = [];
    this.priceFields = [];
    this.quantityFields = [];
    this.totalFields = [];
    
    this.autocompleteTables = [];
    
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
            
        if(Utils.isArray(this.node[this.instance.field_name].dbValues)){
            this.numVisibleFields = this.node[this.instance.field_name].dbValues.length;
            
            if(this.numVisibleFields == 0){
                this.numVisibleFields = 1;
            }
        }
    }
    
    this.isAutofill = false;
    if(typeof this.instance.settings.description_type !== 'undefined' && this.instance.settings.description_type == 'autofill'){
        this.isAutofill = true;
    }
}

ExtraPriceWidget.prototype.getFieldView = function(){"use strict";
    
    var i, element, addButton;
    var self = this;
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    this.fieldView.add(this.formObj.getRegularLabelView(this.instance));
    
    this.possibleValues = this.getOptions();
    
    if(this.isAutofill){
        this.numVisibleFields = this.possibleValues.length;
    }
    
    // Add the actual fields
    for(i = 0; i < this.numVisibleFields; i ++){
        this.elements[i] = this.getNewElement(i);
        this.fieldView.add(this.elements[i]);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    // Don't show the button for autofill widgets
    if(this.instance.can_edit && !this.isAutofill){
        
        addButton = Ti.UI.createButton({
            title: ' Add another item ',
            right: 15,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            backgroundGradient: Display.backgroundGradientGray,
            borderColor: '#999',
            borderWidth: 1,
            width: Ti.UI.SIZE,
            borderRadius: 10,
            color: '#eee',
            top: 10,
            height: Ti.UI.SIZE,
            horizontalWrap: false,
            fieldName: this.instance.field_name
        });
        
        addButton.addEventListener('click', function(e){
            try{
                self.numVisibleFields ++;
                self.formObj.unfocusField();
                self.redraw();
            }
            catch(ex){
                Utils.sendErrorReport("Exception adding one to extra price: " + ex);
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
        detailsView, description, details, jsonValue, quantity, total, price, 
        useQuantity, quantityWrapper, quantityField, totalField, i;
    var self = this;
        
    try{
        dbValue = "";
        description = "";
        details = "";
        textValue = null;
        jsonValue = [];
        
        quantity = 0;
        total = 0;
        price = 0;
        
        dataRow = [];
        
        if ( typeof this.node[this.instance.field_name] !== 'undefined') {
            
            if ( typeof this.node[this.instance.field_name].dbValues !== 'undefined' && typeof this.node[this.instance.field_name].dbValues[index] !== 'undefined') {
                dbValue = this.node[this.instance.field_name].dbValues[index];
                
                if ( typeof this.node[this.instance.field_name].textValues !== 'undefined' && typeof this.node[this.instance.field_name].textValues[index] !== 'undefined') {
                    textValue = this.node[this.instance.field_name].textValues[index];
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
            jsonValue = {};
        }
        else{
            try{
                jsonValue = JSON.parse(textValue);
                if(typeof jsonValue.desc !== 'undefined'){
                    description = jsonValue.desc;
                }
                
                if(typeof jsonValue.details !== 'undefined'){
                    details = jsonValue.details;
                }
                
                if(typeof jsonValue.quantity !== 'undefined'){
                    quantity = jsonValue.quantity;
                }
                
                if(typeof jsonValue.total !== 'undefined'){
                    total = jsonValue.total;
                }
                
                if(typeof jsonValue.price !== 'undefined'){
                    price = jsonValue.price;
                }
            }
            catch(ex){
                jsonValue = {};
            }
        }
        
        useQuantity = false;
        if(typeof this.instance.settings.use_quantity !== 'undefined' && this.instance.settings.use_quantity == 1){
            useQuantity = true;
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
        
        // dbValue is the total value 
        // If we're using a quantity, make sure the price per unit is set as the price value
        if(useQuantity && jsonValue.price){
            priceValue = jsonValue.price;
        }
        
        if(priceValue != ""){
            if(!isNaN(parseFloat(dbValue))){
                priceValue = parseFloat(Math.round(priceValue * 100) / 100).toFixed(2);
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
        priceView.setValue(priceValue);
        priceView.setKeyboardType(Ti.UI.KEYBOARD_DEFAULT);
        priceView.width = '25%';
        priceView.left = 2;
        priceView.right = 0;
        priceView.delta = index;
        
        if(!useQuantity){
            // We con only save a dbValue for one field.
            // If we have a quantity field, that has to be the total amount field
            priceView.dbValue = dbValue;    
        }
        
        priceView.addEventListener('change', function(e){
            var widget, descView, jsonValue;
            
            widget = self;
            descView = widget.descFields[e.source.delta];
            
            jsonValue = descView.jsonValue;
                       
            if(jsonValue == null){
                jsonValue = {};
            }
            
            jsonValue.price = e.source.value;
            
            descView.jsonValue = jsonValue;
            descView.textValue = JSON.stringify(jsonValue);
            
            // Update the total amount
            widget.setTotalDelta(e.source.delta);
        });
        
        this.priceFields[index] = priceView;
        
        if(this.instance.field_name == 'total_amount_paid' || this.instance.field_name == 'total_credits'){
            priceView.hintText = 'Amt';
        }
        else{
            priceView.hintText = 'Price';    
        }
        
        priceView.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
        this.formObj.addCheckConditionalFields(priceView.check_conditional_fields);
        
        description_type = 'select';
        if(typeof this.instance.settings.description_type !== 'undefined'){
            description_type = this.instance.settings.description_type;
        }
        
        if(description_type == 'autocomplete'){
            
            descView = this.formObj.getTextField(this.instance);
            descView.textValue = textValue;
            descView.jsonValue = jsonValue;
            descView.setValue(description);
            descView.setKeyboardType(Ti.UI.KEYBOARD_DEFAULT);
            descView.width = '60%';
            descView.possibleValues = this.possibleValues;
            descView.touched = false;
            descView.blurred = true;
            descView.hintText = 'Item';
            descView.delta = index;
            
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
                delta: index,
                instance: this.instance
            });
            
            this.autocompleteTables[index] = null;
            this.autocompleteTables[index] = autocomplete_table;
            
            descView.addEventListener('focus', function(e){
               descView.touched = true; 
            });
            
            descView.addEventListener('click', function(e){
               descView.touched = true; 
            });
            
            descView.addEventListener('blur', function(e) {
                var widget, autocompleteTable;
                try{
                    if (self.autocompleteTables && self.autocompleteTables[e.source.delta]) {
	                    autocompleteTable = self.autocompleteTables[e.source.delta];
	                    
	                    autocompleteTable.setBorderWidth(0);
	                    autocompleteTable.setHeight(0);
	                    autocompleteTable.setVisible(false);
                    }
                    descView.blurred = true;
                }
                catch(ex){
                    try{
                        Utils.sendErrorReport("exception in extra price blur: " + ex);
                    }catch(ex1){}
                }
            });
            
            autocomplete_table.addEventListener('click', function(e) {
                var jsonValue, descView, widget, autocompleteTable, optionsIndex;
                try{
                    widget = self;
                    descView = widget.descFields[e.source.delta];
                    
                    descView.value = e.rowData.title;
                    
                    jsonValue = descView.jsonValue;
                               
                    if(jsonValue == null){
                        jsonValue = {};
                    }
                    
                    optionsIndex = e.rowData.optionsIndex;
                    
                    jsonValue = widget.changeQuantityField(jsonValue, optionsIndex, e.source.delta, true);
                    
                    jsonValue.desc = e.rowData.title;
                    descView.jsonValue = jsonValue;
                    descView.textValue = JSON.stringify(jsonValue);
                    
                    autocompleteTable = widget.autocompleteTables[e.source.delta];
                    autocompleteTable.setHeight(0);
                    autocompleteTable.setBorderWidth(0);
                    autocompleteTable.setVisible(false);
        
                    e.source.lastValue = e.rowData.title;
                    
                    if (Ti.App.isAndroid) {
                        // Make sure the cursor is at the end of the text
                        descView.setSelection(descView.value.length, descView.value.length);
                    }
                    
                    // Pretend like this is just loaded - mainly a fix for android, but makes sense for both
                    descView.touched = false;
                }
                catch(ex){
                    Utils.sendErrorReport("Exception touching autocomplete in extra price: " + ex);
                }
            });
    
            descView.addEventListener('change', function(e) {
                /*global setConditionallyRequiredLabels*/
                var upperCaseValue, tableData, possibleValues, i, regEx, row, jsonValue, sanitized, 
                    autocompleteTable, widget, noQty, quantityValue, quantityField;
                
                try{
                    if (e.source.touched === true) {
                        
                        widget = self;
                        autocompleteTable = widget.autocompleteTables[e.source.delta];
                        
                        // Must compare as strings since 4. and 4 would need to be different, but wouldn't be for a number
                        if ((e.source.lastValue + "".toString()) != (e.source.value + "".toString())) {
                                  
                            possibleValues = widget.possibleValues;
                
                            upperCaseValue = e.source.value.toUpperCase();
                            tableData = [];
                            
                            Ti.API.debug("Possible values: " + JSON.stringify(possibleValues));
                            
                            for ( i = 0; i < possibleValues.length; i++) {
                                
                                if(possibleValues[i].title == '' || e.source.value.length == 0){
                                    // Don't show emtpy entries
                                    continue;
                                }
                                
                                sanitized = "".toString() + e.source.value;
                                sanitized = sanitized.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                                
                                regEx = new RegExp(sanitized, 'i');
                                if (possibleValues[i].title.search(regEx) != -1) {
                                    //Check match
                                    if (upperCaseValue == possibleValues[i].title.toUpperCase()) {
                                        
                                        jsonValue = e.source.jsonValue;
                               
                                        if(jsonValue == null){
                                            jsonValue = {};
                                        }
                                      
                                        jsonValue.desc = possibleValues[i].textValue;
                                        jsonValue = widget.changeQuantityField(jsonValue, i, e.source.delta, true);
                                        
                                        e.source.jsonValue = jsonValue;
                                        e.source.textValue = JSON.stringify(jsonValue);
                                    }
            
                                    //Create partial matching row
                                    row = Ti.UI.createTableViewRow({
                                        height : 38,
                                        title : possibleValues[i].title,
                                        priceValue : possibleValues[i].dbValue,
                                        color : '#000000',
                                        delta: e.source.delta,
                                        instance: e.source.instance,
                                        optionsIndex: i
                                    });
            
                                    // apply rows to data array
                                    tableData.push(row);
            
                                    if (tableData.length >= 4) {
                                        break;
                                    }
                                }
                            }
                            
                            Ti.API.debug("Data length: " + tableData.length);
                            
                            autocompleteTable.setData(tableData);
            
                            if (tableData.length == 0) {
                                autocompleteTable.setBorderWidth(0);
                                autocompleteTable.setHeight(0);
                                autocompleteTable.setVisible(false);
                            }
                            else {
                                autocompleteTable.setBorderWidth(1);
                                autocompleteTable.setHeight(38 * tableData.length);
                                autocompleteTable.setVisible(true);
                            }
                            
                            if(e.source.blurred){
                                e.source.blurred = false;
                                widget.formObj.scrollToField(e);
                            }
                        }
                        else {
                            autocompleteTable.setBorderWidth(0);
                            autocompleteTable.setHeight(0);
                            autocompleteTable.setVisible(false);
                        }
                    }
                    
                    if(e.source.check_conditional_fields.length > 0){
                        if(typeof e.source.lastValue === 'undefined' || typeof e.source.value === 'undefined' || 
                                  e.source.lastValue == "" || e.source.value == ""){
                            Ti.API.debug("Checking conditionally required");
                            self.formObj.setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                        }
                    }
                    
                    // must come after the conditional checking
                    e.source.lastValue = e.source.value;
                }
                catch(ex){
                    Utils.sendErrorReport("Exception in extra price autocomplete change: " + ex);
                }
            });
        }
        else{ 
            
            // The default select list widget
            descView = this.formObj.getLabelField(this.instance);
            descView.textValue = textValue;
            descView.jsonValue = jsonValue;
            descView.setText(description);
            descView.width = '60%';
            descView.top = 1;
            descView.bottom = 1;
            descView.possibleValues = this.possibleValues;
            descView.delta = index;
            
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
                        delta: e.source.delta,
                        instance: e.source.instance
                    });
                    
                    dialog.addEventListener('click', function(ev){
                        var widget, jsonValue, descView, optionsIndex;
                        
                        try{
                            if(ev.index !== null && ev.index != ev.source.cancel){
                                
                                if(typeof ev.source.options[ev.index] !== 'undefined'){
                                    
                                    widget = self;
                                    
                                    descView = widget.descFields[e.source.delta];
                                    quantityField = widget.quantityFields[e.source.delta];
                                    jsonValue = descView.jsonValue;
                                   
                                    if(jsonValue == null){
                                        jsonValue = {};
                                    }
                                    
                                    jsonValue.desc = ev.source.options[ev.index];
                                    
                                    
                                    descView.setText(ev.source.options[ev.index]);
                                    
                                    optionsIndex = -1;
                                    
                                    for(i = 0; i < widget.possibleValues.length; i ++){
                                        if(widget.possibleValues[i].title == ev.source.options[ev.index]){
                                            optionsIndex = i;
                                            break;
                                        }
                                    }
                                    
                                    if(optionsIndex > -1){
                                        jsonValue = widget.changeQuantityField(jsonValue, optionsIndex, e.source.delta, true);
                                    }
                                    
                                    descView.jsonValue = jsonValue;
                                    descView.textValue = JSON.stringify(jsonValue);
                                    
                                    widget.itemChangeDelta(e.source.delta);
                                    
                                    if(descView.check_conditional_fields.length > 0){
                                        Ti.API.debug("Checking conditionally required in amounts field");
                                        widget.formObj.setConditionallyRequiredLabels(e.source.instance, descView.check_conditional_fields);
                                    }
                                }
                            }
                        }
                        catch(ex){
                            Utils.sendErrorReport("Exception with desc view dialog click: " + ex);
                        }
                    });
                    
                    dialog.show();
                }
                catch(ex){
                    Utils.sendErrorReport("Exception desc view click in extra price: " + ex);
                }
            });
        }
        
        priceView.addEventListener('change', function(e) {
            var tempValue, useQuantity;
            /*jslint regexp: true*/
           Ti.API.debug("price view change to " + e.source.value);
           
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
                
                useQuantity = false;
                if(typeof e.source.instance.settings.use_quantity !== 'undefined' && e.source.instance.settings.use_quantity == 1){
                    useQuantity = true;
                }
                
                // Only set the dbValue for the price if the total field does not exist
                if(!useQuantity){
                    if (e.source.value != null && typeof e.source.value.length !== 'undefined' && e.source.value.length > 0) {
                        e.source.dbValue = parseFloat(e.source.value);
                    }
                    else {
                        e.source.dbValue = null;
                    }
                }
    
                if(e.source.check_conditional_fields.length > 0){
                    if(typeof e.source.lastValue === 'undefined' || typeof e.source.value === 'undefined' || 
                              e.source.lastValue == "" || e.source.value == ""){
                        Ti.API.debug("Checking conditionally required");
                        self.formObj.setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                    }
                }
                
                e.source.lastValue = e.source.value;
            }
        });
        
        this.descFields[index] = descView;
        
        detailsView = this.formObj.getTextField(this.instance);
        detailsView.setValue(details);
        detailsView.setKeyboardType(Ti.UI.KEYBOARD_DEFAULT);
        detailsView.width = '60%';
        detailsView.top = 2;
        detailsView.hintText = 'Details';
        detailsView.visible = false;
        detailsView.height = 0;
        detailsView.delta = index;
        detailsView.instance = this.instance;
        
        this.detailsFields[index] = detailsView;
        
        if(typeof this.instance.settings.use_details !== 'undefined' && this.instance.settings.use_details == 1){
            detailsView.visible = true;
            detailsView.height = Ti.UI.SIZE;
        }
        
        detailsView.addEventListener('change', function(e){
            var widget, descView;
            
            widget = self;
            descView = widget.descFields[e.source.delta];
            
            jsonValue = descView.jsonValue;
                           
            if(jsonValue == null){
                jsonValue = {};
            }
            
            jsonValue.details = e.source.value;
            descView.jsonValue = jsonValue;
            descView.textValue = JSON.stringify(jsonValue);
        });
        
        if(useQuantity){

            quantityWrapper = Ti.UI.createView({
                width: '92%',
                left: '4%',
                layout: 'horizontal',
                height: Ti.UI.SIZE,
                top: 3
            });
            
            quantityField = this.formObj.getTextField(this.instance);
            quantityField.hintText = 'Qty';
            quantityField.width = '20%';
            quantityField.left = '2%';
            quantityField.instance = this.instance;
            quantityField.delta = index;
            
            if(typeof jsonValue.quantity !== 'undefined'){
                quantityField.value = jsonValue.quantity;
            }
            
            quantityField.addEventListener('change', function(e){
                var widget, descView, jsonValue;
                
                widget = self;
                descView = widget.descFields[e.source.delta];
                
                jsonValue = descView.jsonValue;
                           
                if(jsonValue == null){
                    jsonValue = {};
                }
                
                jsonValue.quantity = parseFloat(e.source.value);
                if(isNaN(jsonValue.quantity)){
                    jsonValue.quantity = 1;
                }
                
                descView.jsonValue = jsonValue;
                descView.textValue = JSON.stringify(jsonValue);
                
                // Update the total amount
                widget.setTotalDelta(e.source.delta);
            });
            
            this.quantityFields[index] = quantityField;
            
            
            Ti.API.debug("Description: " + description);
            // Make sure the quantity field is correctly grayed out
            if(description && description.length > 0){
                for(i = 0; i < this.possibleValues.length; i ++){
                    if(description == this.possibleValues[i].title){
                        this.changeQuantityField(jsonValue, i, index, false);   
                        break;        
                    }
                }
            }
            
            totalField = this.formObj.getTextField(this.instance);
            totalField.hintText = 'Total';
            totalField.width = '37%';
            totalField.left = '2%';
            totalField.backgroundColor = '#ccc';
            totalField.touchEnabled = false;
            
            if(typeof jsonValue.total !== 'undefined'){
                totalField.value = jsonValue.total;
            }
            
            totalField.addEventListener('focus', function(e){
               e.source.blur(); 
            });
            
            // Make sure no other dbValues are stored on any other field
            totalField.dbValue = dbValue;
            
            this.totalFields[index] = totalField;
            
            priceView.width = '30%';
            priceView.left = 0;
            
            dollarView.width = '4%';
            descView.width = '92%';
            
            quantityWrapper.add(dollarView);
            quantityWrapper.add(priceView);
            quantityWrapper.add(quantityField);
            quantityWrapper.add(totalField);
            
            outsideWrapper.add(descView);
            outsideWrapper.add(quantityWrapper);
        }
        else{
            wrapper.add(descView);
            wrapper.add(dollarView);
            wrapper.add(priceView);  
            outsideWrapper.add(wrapper);  
        }
        
        outsideWrapper.add(detailsView);
        
        if(description_type == 'autocomplete'){
            outsideWrapper.add(autocomplete_table);
        }
        
        // Populate the autofill
        if(this.isAutofill){
            
            // Disable the field on creation and edit
            this.descFields[index].backgroundColor = '#ccc';
            this.descFields[index].backgroundGradient = null;
            this.descFields[index].touchEnabled = false;
            
            if(typeof this.possibleValues[index] !== 'undefined'){
                if(typeof this.possibleValues[index].title !== 'undefined'){    
                    description = this.possibleValues[index].title;
                    
                    if(typeof jsonValue.desc === 'undefined'){
                    
                        jsonValue = {
                            desc: description,
                            quantity: 1
                        };
                        
                        this.descFields[index].jsonValue = jsonValue;
                        this.descFields[index].textValue = JSON.stringify(jsonValue);
                        
                        // Set text and value for the textfield and the label field
                        this.descFields[index].text = description;
                        this.descFields[index].value = description;
                        
                        this.itemChangeDelta(index);
                        
                        if(typeof this.quantityFields[index] !== 'undefined'){
                            jsonValue = this.changeQuantityField(jsonValue, index, index, true);
                            
                            this.setTotalDelta(index);
                        }
                        
                        // Make sure the data updates in the widget view in this init stage so other fields can use it properly
                        this.priceFields[index].fireEvent('change');
                    }
                }
            }
        }
    }
    catch(ex1){
        Utils.sendErrorReport("Exception creating an extra price field: " + ex1);
    }
    
    return outsideWrapper;
};

ExtraPriceWidget.prototype.changeQuantityField = function(jsonValue, optionsIndex, delta, reset){"use strict";
    var noQty, quantityField, quantityValue, option;
    
    Ti.API.debug("In change quantity Field: " + optionsIndex + " " + delta);
    
    try{
        if(typeof this.quantityFields[delta] !== 'undefined'){
            quantityField = this.quantityFields[delta];
            
            noQty = false;
            option = this.possibleValues[optionsIndex];
            
            if(typeof option.description !== 'undefined'){
                if(typeof option.description.options !== 'undefined'){
                    if(typeof option.description.options.force_quantity_to_1 !== 'undefined'){
                        if(option.description.options.force_quantity_to_1 == 1){
                            noQty = true;
                        }
                    }
                }
            }
            
            if(noQty){
                quantityField.setBackgroundColor('#ccc');
                quantityField.setTouchEnabled(false);
                quantityValue = parseFloat(quantityField.getValue());
                
                if(isNaN(quantityValue) || quantityValue < 1 || reset){
                    quantityField.setValue(1);
                    jsonValue.quantity = 1;
                }
            }
            else{
                quantityField.setBackgroundColor('#fff');
                quantityField.setTouchEnabled(true);
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in changeQuantityField: " + ex);
    }
    
    return jsonValue;
};

ExtraPriceWidget.prototype.setTotal = function(){"use strict";
    var i;
    
    try{
        Ti.API.debug("Changing total for all deltas");
        
        for(i = 0; i < this.elements.length; i ++){
            this.setTotalDelta(i);
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in setTotal: " + ex);
    }
};

ExtraPriceWidget.prototype.setTotalDelta = function(delta){"use strict";
    var price, quantity, total, jsonValue, totalStr;
    
    try{
        
        if(typeof this.totalFields[delta] !== 'undefined'){
            Ti.API.debug("Changing total for delta " + delta);
            
            jsonValue = this.descFields[delta].jsonValue;
            
            Ti.API.debug("Current value before total is " + JSON.stringify(jsonValue));
            if(typeof jsonValue.price !== 'undefined'){
                price = parseFloat(jsonValue.price);
                if(isNaN(price)){
                    price = 0;
                }
            }
            else{
                price = 0;
            }
            
            if(typeof jsonValue.quantity !== 'undefined'){
                quantity = parseFloat(jsonValue.quantity);
                if(isNaN(quantity)){
                    quantity = 1;
                }
            }
            else{
                quantity = 1;
            }
            
            total = price * quantity;
            totalStr = parseFloat(Math.round(total * 100) / 100).toFixed(2);
            
            jsonValue.quantity = quantity;
            jsonValue.price = price;
            jsonValue.total = totalStr;
            
            this.descFields[delta].jsonValue = jsonValue;
            this.descFields[delta].textValue = JSON.stringify(jsonValue);
            
            this.totalFields[delta].setValue(totalStr);
            this.totalFields[delta].dbValue = total;
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in setTotalDelta: " + delta + " " + ex);
    }
};

ExtraPriceWidget.prototype.itemChange = function(){"use strict";
    var i;
    
    try{
        Ti.API.debug("Changing price for all deltas");
        
        for(i = 0; i < this.elements.length; i ++){
            this.itemChangeDelta(i);
        }    
    }
    catch(ex){
        Utils.sendErrorReport("Exception in itemChange: " + ex);
    }
};

ExtraPriceWidget.prototype.itemChangeDelta = function(delta){"use strict";
    var jsonValue, prices, foundPrice, price, priceFloat, inputItem, quantityItem, 
        quantity, categoryFieldName, categoryVal, floatVal, index;
    
    try{
        Ti.API.debug("Changing price for delta " + delta);
        foundPrice = false;
        
        // Setup the node object
        this.formObj.formToNode();
        this.node = this.formObj.node;
        
        jsonValue = this.descFields[delta].jsonValue;
        
        Ti.API.debug("Current value before item change is " + JSON.stringify(jsonValue));
        if(jsonValue != null){
           
            prices = this.getPrices(jsonValue.desc);
            Ti.API.debug("Prices: " + JSON.stringify(prices));
            
            if(prices){
                // Get the default category price
                
                if(typeof this.instance.settings.reference_field_name !== 'undefined'){
                    if(this.instance.settings.reference_field_name > ''){
                        if(typeof prices.references !== 'undefined'){
                            
                            var referenceFieldName = this.instance.settings.reference_field_name;
                            var referenceVal = null;
                            if(typeof this.node[referenceFieldName] !== 'undefined'){
                                if(typeof this.node[referenceFieldName].dbValues !== 'undefined'){
                                    if(typeof this.node[referenceFieldName].dbValues[0] !== 'undefined'){
                                        referenceVal = this.node[referenceFieldName].dbValues[0];
                                    }
                                }
                            }
                            
                            if(referenceVal && referenceVal !== ''){
                                
                                // If we're using a taxonomy field, make sure we prefix the value with t
                                if(typeof this.formObj.instances[referenceFieldName] !== 'undefined'){
                                    if(this.formObj.instances[referenceFieldName].type == 'taxonomy_term_reference'){
                                        referenceVal = "t" + referenceVal;
                                    }
                                }
                                
                                if(typeof prices.references[referenceVal] !== 'undefined'){
                                    
                                    // Look in the reference modifier first
                                    if(typeof this.instance.settings.modifier_field_name !== 'undefined'){
                                        if(this.instance.settings.modifier_field_name > ''){
                                            
                                            if(typeof prices.references[referenceVal]._modifiers !== 'undefined'){
                                                var modifierFieldName = this.instance.settings.modifier_field_name;
                                                var modifierVal = null;
                                                if(typeof this.node[modifierFieldName] !== 'undefined'){
                                                    if(typeof this.node[modifierFieldName].dbValues !== 'undefined'){
                                                        if(typeof this.node[modifierFieldName].dbValues[0] !== 'undefined'){
                                                            modifierVal = this.node[modifierFieldName].dbValues[0];
                                                        }
                                                    }
                                                }
                                                
                                                if(modifierVal && modifierVal !== ''){
                                                    
                                                    // If we're using a taxonomy field, make sure we prefix the value with t
                                                    if(typeof this.formObj.instances[modifierFieldName] !== 'undefined'){
                                                        if(this.formObj.instances[modifierFieldName].type == 'taxonomy_term_reference'){
                                                            modifierVal = "t" + modifierVal;
                                                        }
                                                    }
                                                    
                                                    if(typeof prices.references[referenceVal]._modifiers[modifierVal] !== 'undefined'){
                                                        
                                                        // Get the default reference modifier and category price
                                                        if(!foundPrice && typeof this.instance.settings.category_field_name !== 'undefined'){
                                                            if(this.instance.settings.category_field_name > ''){
                                                                
                                                                categoryFieldName = this.instance.settings.category_field_name;
                                                                categoryVal = null;
                                                                if(typeof this.node[categoryFieldName] !== 'undefined'){
                                                                    if(typeof this.node[categoryFieldName].dbValues !== 'undefined'){
                                                                        if(typeof this.node[categoryFieldName].dbValues[0] !== 'undefined'){
                                                                            categoryVal = this.node[categoryFieldName].dbValues[0];
                                                                        }
                                                                    }
                                                                }
                                                                
                                                                if(categoryVal && categoryVal !== ''){
                                                                    index = 't' + categoryVal;
                                                                    
                                                                    if(typeof prices.references[referenceVal]._modifiers[modifierVal][index] !== 'undefined'){
                                                                        floatVal = parseFloat(prices.references[referenceVal]._modifiers[modifierVal][index]);
                                                                        if(!isNaN(floatVal) || prices.references[referenceVal]._modifiers[modifierVal][index] === ''){
                                                                            price = prices.references[referenceVal]._modifiers[modifierVal][index];
                                                                            foundPrice = true;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        
                                                        // Get the default reference modifier price
                                                        if(!foundPrice && typeof prices.references[referenceVal]._modifiers[modifierVal]['default'] !== 'undefined'){
                                                            floatVal = parseFloat(prices.references[referenceVal]._modifiers[modifierVal]['default']);
                                                            if(!isNaN(floatVal) || prices.references[referenceVal]._modifiers[modifierVal]['default'] === ''){
                                                                price = prices.references[referenceVal]._modifiers[modifierVal]['default'];
                                                                foundPrice = true;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    
                                    // Get the default reference and category price
                                    if(!foundPrice && typeof this.instance.settings.category_field_name !== 'undefined'){
                                        if(this.instance.settings.category_field_name > ''){
                                            
                                            categoryFieldName = this.instance.settings.category_field_name;
                                            categoryVal = null;
                                            if(typeof this.node[categoryFieldName] !== 'undefined'){
                                                if(typeof this.node[categoryFieldName].dbValues !== 'undefined'){
                                                    if(typeof this.node[categoryFieldName].dbValues[0] !== 'undefined'){
                                                        categoryVal = this.node[categoryFieldName].dbValues[0];
                                                    }
                                                }
                                            }
                                            
                                            if(categoryVal && categoryVal !== ''){
                                                index = 't' + categoryVal;
                                                
                                                if(typeof prices.references[referenceVal][index] !== 'undefined'){
                                                    floatVal = parseFloat(prices.references[referenceVal][index]);
                                                    if(!isNaN(floatVal) || prices.references[referenceVal][index] === ''){
                                                        price = prices.references[referenceVal][index];
                                                        foundPrice = true;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    
                                    // Get the default reference price
                                    if(!foundPrice && typeof prices.references[referenceVal]['default'] !== 'undefined'){
                                        floatVal = parseFloat(prices.references[referenceVal]['default']);
                                        if(!isNaN(floatVal) || prices.references[referenceVal]['default'] === ''){
                                            price = prices.references[referenceVal]['default'];
                                            foundPrice = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                if(!foundPrice && typeof prices.defaults !== 'undefined'){
                    if(typeof this.instance.settings.category_field_name !== 'undefined'){
                        if(this.instance.settings.category_field_name > ''){
                            
                            categoryFieldName = this.instance.settings.category_field_name;
                            categoryVal = null;
                            if(typeof this.node[categoryFieldName] !== 'undefined'){
                                if(typeof this.node[categoryFieldName].dbValues !== 'undefined'){
                                    if(typeof this.node[categoryFieldName].dbValues[0] !== 'undefined'){
                                        categoryVal = this.node[categoryFieldName].dbValues[0];
                                    }
                                }
                            }
                            
                            Ti.API.debug("Using category val: " + categoryVal);
                            
                            if(categoryVal && categoryVal !== ''){
                                index = 't' + categoryVal;
                                
                                
                                if(typeof prices.defaults[index] !== 'undefined'){
                                    floatVal = parseFloat(prices.defaults[index]);
                                    if(!isNaN(floatVal) || prices.defaults[index] === ''){
                                        price = prices.defaults[index];
                                        foundPrice = true;
                                    }
                                }
                            }
                        }
                    }
                    
                    if(!foundPrice){
                        if(typeof prices.defaults !== 'undefined'){
                            if(typeof prices.defaults['default'] !== 'undefined'){
                                price = prices.defaults['default'];
                                foundPrice = true;
                            }
                        }
                    }
                }
            }
            
            // Don't change anything if a price was not found
            if(foundPrice){
                
                priceFloat = parseFloat(price);
                if(isNaN(priceFloat) || priceFloat == 0){
                    price = '';
                }
                
                jsonValue.price = price;
                this.descFields[delta].jsonValue = jsonValue;
                this.descFields[delta].textValue = JSON.stringify(jsonValue);
                
                this.priceFields[delta].setValue(price);
            }
            
        }
        
    }
    catch(ex){
        Utils.sendErrorReport("Exception in itemChangeDelta: " + delta + " " + ex);
    }
};

ExtraPriceWidget.prototype.getPrices = function(descValue){"use strict";
    var i, prices;
    prices = null;
    
    try{
        for(i = 0; i < this.possibleValues.length; i ++){
            if(this.possibleValues[i].title == descValue){
                if(typeof this.possibleValues[i].description !== 'undefined'){
                    if(typeof this.possibleValues[i].description.prices !== 'undefined'){
                        prices = this.possibleValues[i].description.prices;
                    }
                }
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in getPrices: " + ex);
    }
    
    return prices;
};

ExtraPriceWidget.prototype.getOptions = function() {"use strict";
    var db, result, vid, options, description;
    
    options = [];

    result = Database.query("SELECT vid FROM vocabulary WHERE machine_name = '" + this.instance.settings.vocabulary + "'");
    if(result.isValidRow()){
        vid = result.fieldByName('vid');
        result.close();

        result = Database.query("SELECT name, tid, description FROM term_data WHERE vid='" + vid + "' GROUP BY name ORDER BY CAST(`weight` AS INTEGER) ASC");

        while (result.isValidRow()) {
            description = result.fieldByName('description');
            
            try{
                description = JSON.parse(description);
            }
            catch(ex){
                description = null;
            }
            
            options.push({
                title : result.fieldByName('name'),
                dbValue : result.fieldByName('tid'),
                description : description
            });
            result.next();
        }
        result.close();
    }
    
    Database.close();

    return options;
};

ExtraPriceWidget.prototype.cleanUp = function(){"use strict";
    var i, j;
    Ti.API.debug("in amounts widget cleanup");
    
    try{
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
        
        for(j = 0; j < this.descFields.length; j ++){
            this.descFields[j] = null;
        }
        
        for(j = 0; j < this.priceFields.length; j ++){
            this.priceFields[j] = null;
        }
        
        for(j = 0; j < this.quantityFields.length; j ++){
            this.quantityFields[j] = null;
        }
        
        for(j = 0; j < this.totalFields.length; j ++){
            this.totalFields[j] = null;
        }
        
        for(j = 0; j < this.detailsFields.length; j ++){
            this.detailsFields[j] = null;
        }
        
        for(j = 0; j < this.autocompleteTables.length; j ++){
            this.autocompleteTables[j] = null;
        }
        
        Ti.API.debug("At end of amounts widget cleanup");
    }
    catch(ex){
        try{
            Utils.sendErrorReport("Exception cleaning up amounts widget field: " + ex);
        }
        catch(ex1){}
    }
};



exports.getFieldObject = function(FormObj, instance, fieldViewWrapper){"use strict";
    return new ExtraPriceWidget(FormObj, instance, fieldViewWrapper);
};

exports.getView = function(node, instance){"use strict";
    var wrapper, row, i, numRows, desc, price, dataRow, descView, priceView, descLabel, 
        priceLabel, totalPrice, details, jsonValue;
    
    numRows = 0;
    totalPrice = 0;
    
    wrapper = Ti.UI.createView({
        layout: 'vertical',
        width: '100%',
        height: Ti.UI.SIZE
    });
    
    if ( typeof node[instance.field_name] !== 'undefined') {
        
        if (typeof node[instance.field_name].dbValues !== 'undefined') {
                    
            if(Utils.isArray(node[instance.field_name].dbValues)){
                numRows = node[instance.field_name].dbValues.length;
            }
        
            for(i = 0; i < numRows; i ++){
                
                desc = "";
                details = "";
                
                var textValue = node[instance.field_name].textValues[i];
                if(textValue){
                   
                    jsonValue = Utils.getParsedJSON(textValue);
                  
                    if(jsonValue.desc){
                        desc = jsonValue.desc;
                    }
                    
                    if(jsonValue.details){
                        desc += ' - ' + jsonValue.details;
                    }
                }
                
                price = "";
                if(typeof node[instance.field_name].dbValues[i] !== 'undefined'){
                    price = node[instance.field_name].dbValues[i];
                    if(!isNaN(parseFloat(price))){
                        totalPrice += parseFloat(price);
                    }
                }
                
                price = Utils.formatCurrency(price);
                
                row = Ti.UI.createView({
                    width: '100%',
                    height: Ti.UI.SIZE,
                    backgroundColor : '#ccc'
                });
                
                descView = Ti.UI.createView({
                    width: '75%', 
                    height: Ti.UI.SIZE,
                    backgroundColor : '#f3f3f3',
                    top : 1,
                    left: 0
                });
                
                descLabel = Ti.UI.createLabel({
                    height: Ti.UI.SIZE,
                    wordWrap: true,
                    text: desc,
                    font: {
                        fontSize: 14
                    },
                    ellipsize : true,
                    backgroundColor : '#f3f3f3',
                    textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
                    right: 5,
                    color: '#666'
                });
                
                priceView = Ti.UI.createView({
                    width: '25%', 
                    height: Ti.UI.SIZE,
                    backgroundColor : '#fff',
                    top : 1,
                    right: 0
                });
                
                priceLabel = Ti.UI.createLabel({
                    width: Ti.UI.SIZE, 
                    height: Ti.UI.SIZE,
                    wordWrap: true,
                    text: price,
                    font: {
                        fontSize: 14
                    },
                    right: 5,
                    ellipsize : true,
                    backgroundColor : '#fff',
                    textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
                    color: '#000'
                });
                
                descView.add(descLabel);
                priceView.add(priceLabel);
                
                row.add(descView);
                row.add(priceView);
                wrapper.add(row);
            }
        }
    }
    
    wrapper.numRows = numRows;
    
    if(numRows > 1){
        row = Ti.UI.createView({
            width: '100%',
            height: Ti.UI.SIZE,
            backgroundColor : '#ccc'
        });
        
        descView = Ti.UI.createView({
            width: '75%', 
            height: Ti.UI.SIZE,
            backgroundColor : '#ccc',
            top : 1,
            left: 0,
            bottom: 1
        });
        
        descLabel = Ti.UI.createLabel({
            height: Ti.UI.SIZE,
            wordWrap: true,
            text: instance.label,
            font: {
                fontSize: 14,
                fontWeight: 'bold'
            },
            ellipsize : true,
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            right: 5,
            color: '#000'
        });
        
        priceView = Ti.UI.createView({
            width: '25%', 
            height: Ti.UI.SIZE,
            backgroundColor : '#ddd',
            top : 1,
            right: 0,
            bottom: 1
        });
        
        totalPrice = parseFloat(Math.round(totalPrice * 100) / 100).toFixed(2);
        
        priceLabel = Ti.UI.createLabel({
            width: Ti.UI.SIZE, 
            height: Ti.UI.SIZE,
            wordWrap: true,
            text: '$' + totalPrice,
            font: {
                fontSize: 14,
                fontWeight: 'bold'
            },
            right: 5,
            ellipsize : true,
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            color: '#000'
        });
        
        descView.add(descLabel);
        priceView.add(priceLabel);
        
        row.add(descView);
        row.add(priceView);
        wrapper.add(row);
    }
    
    return wrapper;
};


