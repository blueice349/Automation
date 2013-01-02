/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.calculation_field = {
    calculated_field_cache: [],
    getFieldView: function(node, instance){"use strict";
        instance.elements = [];
        
        var settings = instance.settings, fieldView, i, j, element, addAnotherItemButton = null, labelView;
        
        fieldView = Ti.UI.createView({
           width: '100%',
           layout: 'vertical',
           height: Ti.UI.SIZE,
           instance: instance
        });
        
        instance.fieldView = fieldView;
        labelView = Omadi.widgets.label.getRegularLabelView(instance);
        
        if(settings.hidden == 1){
            labelView.setVisible(false);
            labelView.setHeight(0);
            
            fieldView.setVisible(false);
            fieldView.setHeight(0);
        }
        
        fieldView.add(labelView);
        
        setConditionallyRequiredLabelForInstance(node, instance);
        
        instance.numVisibleFields = 1;
               
        element = Omadi.widgets.calculation_field.getNewElement(node, instance);
        instance.elements.push(element);
        fieldView.add(element);
        fieldView.add(Omadi.widgets.getSpacerView());
        
        return fieldView;
    },
    getNewElement: function(node, instance){"use strict";
        
        var settings, widgetView, dbValue, origValue, calculationTableView, index, recalculateButton;
        
        index = 0;
        
        settings = instance.settings;
        Ti.API.debug("Creating calculation_field: " + instance.label);
        
        widgetView = Ti.UI.createView({
            ellipsize: false,
            keepScreenOn: true,
            suppessReturn: false,
            borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            width : '100%',
            color : '#000000',
            height: Ti.UI.SIZE,
            layout: 'vertical',
            
            instance: instance
        });
        
        //Ti.API.debug('before table');
        calculationTableView = Omadi.widgets.calculation_field.getTableView(node, instance);
        //Ti.API.debug('after table');
        widgetView.add(calculationTableView);
        
        if(settings.include_recalculate_button == 1){
            recalculateButton = Ti.UI.createButton({
                 title: 'Recalculate',
                 style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
                 backgroundColor: '#ccc',
                 borderColor: '#999',
                 borderWidth: 1,
                 right: 15,
                 width: 150,
                 borderRadius: 10,
                 color: '#444',
                 instance: instance
            });
            
            recalculateButton.addEventListener('click', function(e){
                var instance = e.source.instance;
                Omadi.widgets.shared.redraw(instance);
            });
            
            widgetView.add(recalculateButton);
        }
        
        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);
        
        return widgetView;
    },
    getRowValues: function(node, instance){"use strict";
        var entity, final_value, row_values, idx, calculation_row, value, field_1_multiplier,
            field_2_multiplier, numeric_multiplier, cached_final_value, instances, required_instance_final_values,
            parent_field, start_timestamp, end_timestamp, difference, at_time, relative_increment_time, day_count, 
            parent_node, zero;
        
        /*global list_search_node_matches_search_criteria,mktime*/
        
        instances = Omadi.data.getFields(node.type);
        final_value = 0;
        
        if (instance.settings.calculation.items != null && !instance.disabled) {
            row_values = [];
            if (instance.value != null && instance.value != "") {
                cached_final_value = instance.value;
            }
            else {
                cached_final_value = 0;
            }
    
            instance.settings.calculation.items = instance.settings.calculation.items.sort(Omadi.utils.sortByWeight);

            for (idx in instance.settings.calculation.items) {
                if(instance.settings.calculation.items.hasOwnProperty(idx)){
                    calculation_row = instance.settings.calculation.items[idx];
                    value = 0;
                    field_1_multiplier = 0;
                    field_2_multiplier = 0;
                    numeric_multiplier = 0;

                    
                    if (calculation_row.field_name_1 != null && node[calculation_row.field_name_1] != null && instances[calculation_row.field_name_1] != null && instances[calculation_row.field_name_1].type == 'calculation_field') {
                        // Make sure a dependency calculation is made first
                        required_instance_final_values = Omadi.widgets.calculation_field.getRowValues(node, instances[calculation_row.field_name_1]);
                        Omadi.widgets.calculation_field.calculated_field_cache[calculation_row.field_name_1] = required_instance_final_values[0].final_value;
                    }
        
                    if (calculation_row.field_name_1 != null && calculation_row.field_name_1 != "") {
                        
                        if (Omadi.widgets.calculation_field.calculated_field_cache[calculation_row.field_name_1] != null) {
                            
                            field_1_multiplier = Omadi.widgets.calculation_field.calculated_field_cache[calculation_row.field_name_1];
                        }
                        else if (calculation_row.type == 'parent_field_value') {
                            parent_field = calculation_row.parent_field;
                            if (node[parent_field] != null && node[parent_field].dbValues[0] != null) {
                                parent_node = Omadi.data.nodeLoad(node[parent_field].dbValues[0]);
                                if (parent_node && parent_node[calculation_row.field_name_1].dbValues[0] != null) {
                                    field_1_multiplier = parent_node[calculation_row.field_name_1].dbValues[0];
                                }
                            }
                        }
                        else if (node[calculation_row.field_name_1] != null && node[calculation_row.field_name_1].dbValues[0] != null) {
                            field_1_multiplier = node[calculation_row.field_name_1].dbValues[0];
                        }
                        if (calculation_row.datestamp_end_field != null && calculation_row.datestamp_end_field != "") {

                            start_timestamp = field_1_multiplier;
                            field_1_multiplier = 0;
                            
                            if (node[calculation_row.datestamp_end_field] != null && node[calculation_row.datestamp_end_field].dbValues[0] != null) {
                                
                                end_timestamp = node[calculation_row.datestamp_end_field].dbValues[0];
                                if (calculation_row.type == 'time-only') {
                                    if (end_timestamp < start_timestamp) {
                                        end_timestamp += (24 * 3600);
                                    }
                                }
        
                                difference = end_timestamp - start_timestamp;
        
                                switch(calculation_row.datestamp_interval) {
                                    case 'minute':
                                        field_1_multiplier = difference / 60;
                                        break;
                                    case 'hour':
                                        field_1_multiplier = difference / 3600;
                                        break;
                                    case 'day':
                                        field_1_multiplier = difference / (3600 * 24);
                                        break;
                                    case 'week':
                                        field_1_multiplier = difference / (3600 * 24 * 7);
                                        break;
                                }
                                if (calculation_row.type == 'time') {

                                    if (calculation_row.interval_rounding == 'up') {
                                        field_1_multiplier = Math.ceil(field_1_multiplier);
                                    }
                                    else if (calculation_row.interval_rounding == 'down') {
                                        field_1_multiplier = Math.floor(field_1_multiplier);
                                    }
                                    else if (calculation_row.interval_rounding == 'integer') {
                                        field_1_multiplier = Math.round(field_1_multiplier);
                                    }
                                    else if (calculation_row.interval_rounding == 'increment-at-time') {
                                        
                                        at_time = calculation_row.increment_at_time;
                                        start_timestamp = Number(start_timestamp);
                                        relative_increment_time = at_time = mktime(0,0,0, Omadi.utils.PHPFormatDate('n', start_timestamp), Omadi.utils.PHPFormatDate('j', start_timestamp), Omadi.utils.PHPFormatDate('Y', start_timestamp));
                                        
                                        day_count = 0;
                                        if (relative_increment_time < start_timestamp) {
                                            relative_increment_time += (3600 * 24);
                                        }
        
                                        while (relative_increment_time <= end_timestamp) {
                                            day_count++;
                                            relative_increment_time += (3600 * 24);
                                        }
        
                                        field_1_multiplier = day_count;
                                    }
                                }
                            }
                        }
                    
                    }
        
                    if (calculation_row.field_name_2 != null && calculation_row.field_name_2 != "") {
                        
                        if (Omadi.widgets.calculation_field.calculated_field_cache[calculation_row.field_name_1] != null) {
                            field_2_multiplier = Omadi.widgets.calculation_field.calculated_field_cache[calculation_row.field_name_2];
                        }
                        else if (calculation_row.type == 'parent_field_value') {
                            parent_field = calculation_row.parent_field;
                            
                            if (node[parent_field] != null && node[parent_field].dbValues[0] != null) {
                                parent_node = Omadi.data.nodeLoad(node[parent_field].dbValues[0]);
                                
                                if (parent_node && parent_node[calculation_row.field_name_2].dbValues[0] != null) {
                                    field_2_multiplier = parent_node[calculation_row.field_name_2].dbValues[0];
                                }
                            }
                        }
                        else if (node[calculation_row.field_name_2] != null && node[calculation_row.field_name_2].dbValues[0] != null) {
                            field_2_multiplier = node[calculation_row.field_name_2].dbValues[0];
                        }
                    }
        
                    if (calculation_row.numeric_multiplier != null && calculation_row.numeric_multiplier != "") {
                        numeric_multiplier = Number(calculation_row.numeric_multiplier);
                    }
        
                    zero = false;
        
                    if (calculation_row.criteria != null && calculation_row.criteria.search_criteria != null) {
                        
                        if (!list_search_node_matches_search_criteria(node, calculation_row.criteria)) {
                            zero = true;
                        }
                    }
        
                    value = 0;
                    if (field_1_multiplier == 0 && calculation_row.field_name_1 != null && calculation_row.field_name_1 != "") {
                        zero = true;
                    }
                    else if (value == 0 && field_1_multiplier != 0) {
                        value = field_1_multiplier;
                    }
        
                    if (field_2_multiplier == 0 && calculation_row.field_name_2 != null && calculation_row.field_name_2 != "") {
                        zero = true;
                    }
                    else if (value == 0 && field_2_multiplier != 0) {
                        value = Number(field_2_multiplier);
                    }
                    else if (value != 0 && field_2_multiplier != 0) {
                        value *= Number(field_2_multiplier);
                    }
        
                    if (value == 0 && numeric_multiplier != 0) {
                        value = Number(numeric_multiplier);
                    }
                    else if (value != 0 && numeric_multiplier != 0) {
                        value *= Number(numeric_multiplier);
                    }
        
                    if (zero) {
                        value = 0;
                    }
        
                    row_values.push({
                        'row_label' : (calculation_row.row_label != null && calculation_row.row_label != "") ? calculation_row.row_label : '',
                        'value' : value
                    });
                   
                    final_value += Number(value);
                }
            }
            
            return [{
                'cached_final_value' : cached_final_value,
                'final_value' : final_value,
                'rows' : row_values
            }];
    
        }
        return [];

    },
    getTableView: function(node, instance) {"use strict";
        var result, row_values, tableView, cal_value, cal_value_str, isNegative, row, row_label, value, idx, dbValue, origValue;
        /*global isNumber*/
        
        dbValue = null;
        origValue = null;
        
        if(typeof node[instance.field_name] !== 'undefined'){
            if(typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[0] !== 'undefined'){
                dbValue = node[instance.field_name].dbValues[0];
            }
            
            if(typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[0] !== 'undefined'){
                origValue = node[instance.field_name].textValues[0];
            }
        }
        
        
        result = Omadi.widgets.calculation_field.getRowValues(node, instance);
        row_values = result[0].rows;
    
        tableView = Ti.UI.createView({
            width : '100%',
            layout : 'vertical',
            height : Ti.UI.SIZE,
            textValue: origValue,
            dbValue: null
        });
    
        if (row_values.length > 1) {
            cal_value = 0;
            cal_value_str = "";
            isNegative = false;
    
            for ( idx = 0; idx < row_values.length; idx++) {
                cal_value = row_values[idx].value;
                
                if(cal_value === null){
                    cal_value = 0;
                }
                else if(typeof cal_value === 'string'){
                    cal_value = parseFloat(cal_value);
                }
                
                isNegative = (cal_value < 0) ? true : false;
                // Is negative. And if it is -ve then write in this value in (brackets).
                cal_value_str = Omadi.utils.applyNumberFormat(instance, cal_value);
                cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
    
                row = Ti.UI.createView({
                    height : Ti.UI.SIZE,
                    width : '100%',
                    top : 0,
                    backgroundColor : '#ccc'
                });
    
                row_label = Ti.UI.createLabel({
                    text : row_values[idx].row_label + "  ",
                    textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
                    width : '59.5%',
                    font : {
                        fontSize : 15
                    },
                    left : 0,
                    top : 1,
                    color : '#545454',
                    wordWrap : false,
                    ellipsize : true,
                    backgroundColor : '#f3f3f3'
                });
    
                value = Ti.UI.createLabel({
                    text : "  " + cal_value_str,
                    textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                    width : '40%',
                    font : {
                        fontFamily : 'Helvetica Neue',
                        fontSize : 15
                    },
                    top : 1,
                    right : 0,
                    color : '#424242',
                    wordWrap : false,
                    ellipsize : true,
                    backgroundColor : '#fff'
                });
    
                row.add(row_label);
                row.add(value);
                tableView.add(row);
            }
    
            cal_value = result[0].final_value;
            if(typeof (cal_value) == 'string'){
                cal_value = parseFloat(cal_value);
            } 
            
            // Set the calculated dbValue for the view
            if(!isNumber(cal_value)){
                cal_value = 0;
            }
            
            tableView.dbValue = cal_value;
            
            isNegative = (cal_value < 0) ? true : false;
            // Is negative. And if it is -ve then write in this value in (brackets).
            cal_value_str = Omadi.utils.applyNumberFormat(instance, cal_value);
            cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
            // Adding brackets over -ve value.
    
            row = Ti.UI.createView({
                height : Ti.UI.SIZE,
                width : '100%',
                backgroundColor : '#ccc'
            });
    
            row_label = Ti.UI.createLabel({
                text : instance.label + "  ",
                textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
                width : '59.5%',
                left : 0,
                top : 1,
                font : {
                    fontSize : 16,
                    fontWeight : 'bold'
                },
                color : '#246',
                backgroundColor : '#ddd',
                height : 30
            });
    
            value = Ti.UI.createLabel({
                text : "  " + cal_value_str,
                textAlign : 'left',
                width : '40%',
                right : 0,
                top : 1,
                font : {
                    fontSize : 16,
                    fontWeight : 'bold'
                },
                color : '#424242',
                wordWrap : false,
                ellipsize : true,
                backgroundColor : '#eee',
                height : 30
            });
            
            
            row.add(row_label);
            row.add(value);
            tableView.add(row);
            
            
            if(origValue !== null && tableView.dbValue != origValue && node.form_part >= instance.form_part){
                cal_value = origValue;
                if(typeof (cal_value) == 'string'){
                    cal_value = parseFloat(cal_value);
                } 
                
                isNegative = (cal_value < 0) ? true : false;
                // Is negative. And if it is -ve then write in this value in (brackets).
                cal_value_str = Omadi.utils.applyNumberFormat(instance, cal_value);
                cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
                
                row = Ti.UI.createView({
                    height : Ti.UI.SIZE,
                    width : '100%',
                    backgroundColor : '#ccc'
                });
        
                row_label = Ti.UI.createLabel({
                    text : "*Currently Saved  ",
                    textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
                    width : '59.5%',
                    left : 0,
                    top : 1,
                    font : {
                        fontSize : 16,
                        fontWeight : 'bold'
                    },
                    color : '#900',
                    backgroundColor : '#ddd',
                    height : 30
                });
        
                value = Ti.UI.createLabel({
                    text : "  " + cal_value_str,
                    textAlign : 'left',
                    width : '40%',
                    right : 0,
                    top : 1,
                    font : {
                        fontSize : 16,
                        fontWeight : 'bold'
                    },
                    color : '#424242',
                    wordWrap : false,
                    ellipsize : true,
                    backgroundColor : '#eee',
                    height : 30
                });
                
                row.add(row_label);
                row.add(value);
                tableView.add(row);
            }
            
            tableView.singleValue = false;
        }
        else {
    
            //Ti.API.info(row_values.length + " rows");
            cal_value = (row_values.length == 1) ? result[0].final_value : 0;
            if(typeof (cal_value) == 'string'){
                cal_value = parseFloat(cal_value);
            }
            if(!isNumber(cal_value)){
                cal_value = 0;
            }
            
            // Set the calculated dbValue for the view
            tableView.dbValue = cal_value;
            
            isNegative = (cal_value < 0) ? true : false;
            // Is negative. And if it is -ve then write in this value in (brackets).
            cal_value_str = Omadi.utils.applyNumberFormat(instance, cal_value);
            cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
            // Adding brackets over -ve value.
            
            if(origValue !== null && tableView.dbValue != origValue && node.form_part >= instance.form_part){
                value = Ti.UI.createView({
                    layout: 'vertical',
                    height: Ti.UI.SIZE,
                    width: '100%'
                });
                
                value.add(Ti.UI.createLabel({
                    text : "  New Value: " + cal_value_str,
                    textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                    left : 0,
                    font : {
                        fontSize : 16
                    },
                    color : '#666',
                    height : Ti.UI.SIZE,
                    wordWrap : false,
                    ellipsize : true
                }));
                
                cal_value = origValue;
                if(typeof (cal_value) == 'string'){
                    cal_value = parseFloat(cal_value);
                } 
                
                isNegative = (cal_value < 0) ? true : false;
                // Is negative. And if it is -ve then write in this value in (brackets).
                cal_value_str = Omadi.utils.applyNumberFormat(instance, cal_value);
                cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
                
                value.add(Ti.UI.createLabel({
                    text : "  *Saved Value: " + cal_value_str,
                    textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                    left : 0,
                    font : {
                        fontSize : 16,
                        fontWeight: 'bold'
                    },
                    color : '#900',
                    height : Ti.UI.SIZE,
                    wordWrap : false,
                    ellipsize : true
                }));
                
                tableView.add(value);
            }
            else{
            
                value = Ti.UI.createLabel({
                    text : "  " + cal_value_str,
                    textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                    left : 0,
                    font : {
                        fontSize : 16
                    },
                    color : '#666',
                    height : Ti.UI.SIZE,
                    wordWrap : false,
                    ellipsize : true
                });
        
                tableView.add(value);
            }
            tableView.singleValue = true;
        }
    
        return tableView;
    }
};

