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
    for(i = 0; i < this.numVisibleFields; i ++){
        element = this.getNewElement(i);
        this.fieldView.add(element);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    if(this.instance.settings.cardinality == -1){
        
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
            Widget[e.source.fieldName].numVisibleFields ++;
            Widget[e.source.fieldName].formObj.unfocusField();
            Widget[e.source.fieldName].redraw();
        });
        
        this.fieldView.add(addButton);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
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
    var settings, widgetView, dbValue, textValue, part, nameParts, wrapper, autocomplete_table, possibleValues, db, result, makeValue, real_field_name;

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

    widgetView = this.formObj.getTextField(this.instance);

    widgetView.dbValue = dbValue;
    widgetView.textValue = textValue;
    widgetView.setValue(textValue);
    widgetView.setAutocapitalization(Ti.UI.TEXT_AUTOCAPITALIZATION_WORDS);
    widgetView.real_field_name = real_field_name;
    widgetView.possibleValues = possibleValues;
    widgetView.lastValue = textValue;
    widgetView.clickedAutocomplete = false;
    widgetView.touched = false;
    widgetView.blurred = true;

    if (part == 'make') {
        widgetView.maxLength = 18;
    }
    else {
        widgetView.maxLength = 38;
    }

    widgetView.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
    this.formObj.addCheckConditionalFields(widgetView.check_conditional_fields);

    if (!this.instance.can_edit) {
        widgetView.backgroundImage = '';
        widgetView.backgroundColor = '#BDBDBD';
        widgetView.borderColor = 'gray';
        widgetView.borderRadius = 10;
        widgetView.color = '#848484';
        widgetView.paddingLeft = 3;
        widgetView.paddingRight = 3;
        if (Ti.App.isAndroid) {
            widgetView.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
        }
    }

    autocomplete_table = Titanium.UI.createTableView({
        zIndex : 999,
        height : 0,
        backgroundColor : '#FFFFFF',
        visible : false,
        borderColor : '#000',
        borderWidth : 0,
        top : 0,
        width: '92%',
        textField : widgetView
    });

    widgetView.autocomplete_table = autocomplete_table;

    autocomplete_table.addEventListener('click', function(e) {

        e.source.textField.textValue = e.source.textField.value = e.source.textField.dbValue = e.rowData.title;

        if (Ti.App.isAndroid) {
            // Make sure the cursor is at the end of the text
            e.source.textField.setSelection(e.source.textField.value.length, e.source.textField.value.length);
        }

        // Pretend like this is just loaded - mainly a fix for android, but makes sense for both
        //e.source.textField.touched = false;
        e.source.textField.clickedAutocomplete = true;

        e.source.autocomplete_table.setHeight(0);
        e.source.autocomplete_table.setBorderWidth(0);
        e.source.autocomplete_table.setVisible(false);
    });

    if (!this.instance.can_edit) {
        widgetView.backgroundImage = '';
        widgetView.backgroundColor = '#BDBDBD';
        widgetView.borderColor = 'gray';
        widgetView.borderRadius = 10;
        widgetView.color = '#848484';
        widgetView.paddingLeft = 3;
        widgetView.paddingRight = 3;
        if (Ti.App.isAndroid) {
            widgetView.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
        }
    }

    if (this.instance.settings.min_length && this.instance.settings.min_length != null && this.instance.settings.min_length != "null") {
        widgetView.minLength = this.instance.settings.min_length;
    }

     widgetView.addEventListener('focus', function(e){
       //Ti.API.debug("focused");
       e.source.touched = true; 
    });
    
    widgetView.addEventListener('click', function(e){
        //Ti.API.debug("Clicked");
       e.source.touched = true; 
    });

    widgetView.addEventListener('blur', function(e) {
        e.source.autocomplete_table.setBorderWidth(0);
        e.source.autocomplete_table.setHeight(0);
        e.source.autocomplete_table.setVisible(false);
        e.source.blurred = true;
    });

    widgetView.addEventListener('change', function(e) {
        var possibleValues, tableData, i, regEx, row, db, result, makeValues;
        
        if(Ti.App.isAndroid && e.source.clickedAutocomplete){
            e.source.clickedAutocomplete = false;
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

                    makeValues = Widget[e.source.instance.field_name].formObj.getFormFieldValues(e.source.real_field_name + '___make');

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

                    regEx = new RegExp(e.source.value, 'i');
                    if (possibleValues[i].search(regEx) != -1) {
                        //Check match

                        //Create partial matching row
                        row = Ti.UI.createTableViewRow({
                            height : 38,
                            title : possibleValues[i],
                            color : '#000000',
                            autocomplete_table : e.source.autocomplete_table,
                            //setValueF : func,
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

        if(e.source.check_conditional_fields.length > 0){
            if(typeof e.source.lastValue === 'undefined' || typeof e.source.value === 'undefined' || 
                      e.source.lastValue == "" || e.source.value == ""){
                Ti.API.debug("Checking conditionally required");
                Widget[e.source.instance.field_name].formObj.setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
            }
        }
        
        e.source.lastValue = e.source.value;

    });

    wrapper = Ti.UI.createView({
        width : '100%',
        height : Ti.UI.SIZE,
        layout : 'vertical',
        widgetView : widgetView,
        autocomplete_table : autocomplete_table
    });

    wrapper.add(widgetView);
    wrapper.add(autocomplete_table);

    return wrapper;
};


exports.getFieldView = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new VehicleFieldsWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name].getFieldView();
};


