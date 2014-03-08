/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.extra_price = {

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
            
            instance.numVisibleFields = 1;
            if ( typeof node[instance.field_name] !== 'undefined' &&
                typeof node[instance.field_name].dbValues !== 'undefined') {
                    
                    if(Omadi.utils.isArray(node[instance.field_name].dbValues)){
                        instance.numVisibleFields = node[instance.field_name].dbValues.length;
                    }
            }
        }
        
        if(instance.numVisibleFields == 0){
            instance.numVisibleFields = 1;
        }

        // Add the actual fields
        for ( i = 0; i < instance.numVisibleFields; i++) {
            element = this.getNewElement(node, instance, i);
            instance.elements.push(element);
            fieldView.add(element);
            fieldView.add(Omadi.widgets.getSpacerView());
        }

        if (instance.can_edit) {
            addAnotherItemButton = Ti.UI.createButton({
                title : 'Add another item',
                style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
                 backgroundGradient: Omadi.display.backgroundGradientGray,
                 borderColor: '#999',
                 borderWidth: 1,
                 right: 15,
                 width: 150,
                 borderRadius: 10,
                 color: '#eee',
                 instance: instance
            });

            addAnotherItemButton.addEventListener('click', function(e) {
                var instance = e.source.instance;
                instance.numVisibleFields++;
                Omadi.widgets.unfocusField();
                Omadi.widgets.shared.redraw(instance);
            });

            fieldView.add(addAnotherItemButton);
            fieldView.add(Omadi.widgets.getSpacerView());
        }
        
        Ti.UI.currentWindow.addEventListener('close', function(){
            var i;
            
            for(i = 0; i < instance.elements.length; i ++){
                fieldView.remove(instance.elements[i]);
                instance.elements[i] = null;
            }
            
            instance.fieldView = null;
        });

        return fieldView;
    },
    getNewElement : function(node, instance, index) {"use strict";

        var settings, descView, priceView, dbValue, wrapper, dollarView, dataRow, 
            textValue, priceValue, autocomplete_table, outsideWrapper, description_type, 
            detailsView, description, details, jsonValue;

        dbValue = "";
        description = "";
        details = "";
        textValue = null;
        jsonValue = [];
        
        dataRow = [];
        
        if ( typeof node[instance.field_name] !== 'undefined') {
            
            if ( typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined') {
                dbValue = node[instance.field_name].dbValues[index];
                
                if ( typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[index] !== 'undefined') {
                    textValue = node[instance.field_name].textValues[index];
                    
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
        
        settings = instance.settings;
        Ti.API.debug("Creating extra_price field");
        
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
        
        //Ti.API.error(descView.possibleValues);
        
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
        
        priceView = Omadi.widgets.getTextField(instance);
        priceView.dbValue = dbValue;
        priceView.setValue(priceValue);
        priceView.setKeyboardType(Ti.UI.KEYBOARD_DEFAULT);
        priceView.check_conditional_fields = affectsAnotherConditionalField(instance);
        priceView.width = '25%';
        priceView.left = 2;
        priceView.right = 0;
        
        description_type = 'select';
        if(typeof instance.settings.description_type !== 'undefined'){
            description_type = instance.settings.description_type;
        }
        
        if(description_type == 'autocomplete'){
            
            descView = Omadi.widgets.getTextField(instance);
            descView.textValue = textValue;
            descView.setValue(description);
            descView.setKeyboardType(Ti.UI.KEYBOARD_DEFAULT);
            descView.check_conditional_fields = affectsAnotherConditionalField(instance);
            descView.width = '60%';
            descView.possibleValues = Omadi.widgets.taxonomy_term_reference.getOptions(instance, false);
            descView.touched = false;
        
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
            
            descView.addEventListener('focus', Omadi.widgets.extra_price.scrollUp);
            descView.addEventListener('click', Omadi.widgets.extra_price.scrollUp);
    
            autocomplete_table.addEventListener('click', function(e) {
                var jsonValue;
                
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
            });
    
            descView.addEventListener('change', function(e) {
                /*global setConditionallyRequiredLabels*/
                var upperCaseValue, tableData, possibleValues, i, regEx, row, jsonValue;
                
                if (e.source.touched === true) {
                    
                    // Must compare as strings since 4. and 4 would need to be different, but wouldn't be for a number
                    if ((e.source.lastValue + "".toString()) != (e.source.value + "".toString())) {
                        
                        //e.source.textValue = e.source.value;
                        
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
                                    
                                    //e.source.textValue = possibleValues[i].textValue;
                                    
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
        }
        else{ 
            // The default select list widget
            descView = Omadi.widgets.getLabelField(instance);
            descView.textValue = textValue;
            descView.setText(description);
            descView.check_conditional_fields = affectsAnotherConditionalField(instance);
            descView.width = '60%';
            descView.top = 1;
            descView.bottom = 1;
            descView.possibleValues = Omadi.widgets.taxonomy_term_reference.getOptions(instance, false);
            
            descView.addEventListener('click', function(e){
                var dialog, options, i;
                
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
                    
                    if(ev.index !== null && ev.index != ev.source.cancel){
                        
                        if(typeof ev.source.options[ev.index] !== 'undefined'){
                            
                            jsonValue = ev.source.descView.textValue;
                           
                            if(jsonValue == null){
                                jsonValue = {};
                            }
                            
                            jsonValue.desc = ev.source.options[ev.index];
                            
                            ev.source.descView.textValue = jsonValue;
                            ev.source.descView.setText(ev.source.options[ev.index]);
                        }
                    }
                });
                
                dialog.show();
            });
        }
        
        priceView.addEventListener('change', function(e) {
            var tempValue;
            /*global setConditionallyRequiredLabels*/
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

                if (e.source.check_conditional_fields.length > 0) {
                    setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                }
                e.source.lastValue = e.source.value;
            }
        });
        
        detailsView = Omadi.widgets.getTextField(instance);
        detailsView.setValue(details);
        detailsView.setKeyboardType(Ti.UI.KEYBOARD_DEFAULT);
        detailsView.width = '60%';
        detailsView.top = 2;
        detailsView.hintText = 'Details';
        detailsView.visible = false;
        detailsView.height = 0;
        detailsView.descView = descView;
        
        if(typeof instance.settings.use_details !== 'undefined' && instance.settings.use_details == 1){
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
    },
    getTableView : function(node, instance){"use strict";
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
                        
                if(Omadi.utils.isArray(node[instance.field_name].dbValues)){
                    numRows = node[instance.field_name].dbValues.length;
                }
            
                for(i = 0; i < numRows; i ++){
                    
                    desc = "";
                    details = "";
                    if(typeof node[instance.field_name].textValues[i] !== 'undefined'){
                       
                        jsonValue = node[instance.field_name].textValues[i];
                      
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
                    
                    price = Omadi.utils.formatCurrency(price);
                    
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
    },
    scrollUp : function(e) {"use strict";
        var calculatedTop;
        /*global scrollView, scrollPositionY*/
        e.source.touched = true;
        if (typeof scrollView !== 'undefined' && scrollView !== null) {
            calculatedTop = e.source.convertPointToView({
                x : 0,
                y : 0
            }, scrollView);
            scrollView.scrollTo(0, calculatedTop.y - 18 + scrollPositionY);
        }
    }
};
