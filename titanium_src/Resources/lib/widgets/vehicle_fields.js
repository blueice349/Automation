
/*jslint eqeq:true, plusplus:true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.vehicle_fields = {

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

        instance.numVisibleFields = 1;

        element = Omadi.widgets.vehicle_fields.getNewElement(node, instance, 0);
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
            instance = null;
        });  

        return fieldView;
    },
    getNewElement : function(node, instance, index) {"use strict";

        var settings, widgetView, dbValue, textValue, part, nameParts, wrapper, autocomplete_table, possibleValues, db, result, makeValue, real_field_name;

        nameParts = instance.field_name.split('___');

        if (nameParts[1]) {
            part = nameParts[1];
            real_field_name = nameParts[0];
        }
        else {
            Ti.API.error("There should be parts to this vehicle field!!!");
        }

        dbValue = "";
        textValue = "";
        if ( typeof node[real_field_name] !== 'undefined') {
            if ( typeof node[real_field_name].parts[part].textValue !== 'undefined') {
                dbValue = textValue = node[real_field_name].parts[part].textValue;
            }
        }

        settings = instance.settings;
        Ti.API.debug("Creating vehicle_fields " + part + " field");

        //var vl_to_field = field_arr[index_label][index_size].actual_value;
        possibleValues = [];

        db = Omadi.utils.openMainDatabase();

        if (part == "make") {
            result = db.execute("SELECT DISTINCT make FROM _vehicles");
            //var keep_from_make = vl_to_field;

            while (result.isValidRow()) {
                possibleValues.push(result.fieldByName("make"));
                result.next();
            }
            result.close();
        }

        db.close();


        widgetView = Omadi.widgets.getTextField(instance);

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

        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);

        if (!instance.can_edit) {
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

        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);

        if (!instance.can_edit) {
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

        if (settings.min_length && settings.min_length != null && settings.min_length != "null") {
            widgetView.minLength = settings.min_length;
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
            try{
                e.source.autocomplete_table.setBorderWidth(0);
                e.source.autocomplete_table.setHeight(0);
                e.source.autocomplete_table.setVisible(false);
                e.source.blurred = true;
            }
            catch(ex){
                try{
                    Omadi.service.sendErrorReport("exception in vehicle fields blur: " + ex);
                }catch(ex1){}
            }
        });

        widgetView.addEventListener('change', function(e) {
            /*global setConditionallyRequiredLabels, getFormFieldValues*/

            var possibleValues, tableData, i, regEx, row, db, result, makeValues;
            
            if(Ti.App.isAndroid && e.source.clickedAutocomplete){
                e.source.clickedAutocomplete = false;
                Ti.API.debug("IN clicked auto");
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

                        makeValues = getFormFieldValues(e.source.real_field_name + '___make');

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
                        Omadi.widgets.vehicle_fields.scrollUp(e);
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

    },
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
    }
};

