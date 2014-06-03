/*jslint eqeq:true,plusplus:true*/

var Widget, Omadi, CalculatedFieldCache;

Widget = {};
CalculatedFieldCache = {};

function CalculationFieldWidget(formObj, instance, fieldViewWrapper){"use strict";
    
    this.formObj = formObj;
    this.instance = instance;
    this.fieldView = null;
    this.node = formObj.node;
    this.dbValues = [];
    this.elements = [];
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

CalculationFieldWidget.prototype.resetCache = function(){"use strict";
  CalculatedFieldCache = {};  
};

CalculationFieldWidget.prototype.getFieldView = function(showCalc){"use strict";
    var i, element, addButton, labelView;
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    if(typeof showCalc === 'undefined'){
        showCalc = false;
    }
    
    labelView = this.formObj.getRegularLabelView(this.instance);
    
    this.fieldView.add(labelView);
    
    // Add the actual fields
    this.elements[0] = this.getNewElement(0, showCalc);
    this.fieldView.add(this.elements[0]);
    this.fieldView.add(this.formObj.getSpacerView());
    
    if(this.instance.settings.hidden == 1){
        labelView.setVisible(false);
        labelView.setHeight(0);
        
        this.fieldView.setVisible(false);
        this.fieldView.setHeight(0);
    }
    
    return this.fieldView;
};

CalculationFieldWidget.prototype.redraw = function(skipFormToNode){"use strict";
    Ti.API.debug("in redraw");
    var origFieldView;
    
    if(typeof skipFormToNode === 'undefined'){
        skipFormToNode = false;
    }
    
    if(!skipFormToNode){
        this.formObj.formToNode(true);
    }
    
    Ti.API.debug("In calculation redraw for " + this.instance.label);
    
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
    
    this.getFieldView(true);
    
    origFieldView.hide();
    
    this.fieldViewWrapper.add(this.fieldView);
    this.fieldViewWrapper.remove(origFieldView);
};

CalculationFieldWidget.prototype.getNewElement = function(index, showCalc){"use strict";
    var widgetView, dbValue, origValue, calculationTableView, recalculateButton;
    
    Ti.API.debug("Creating calculation_field: " + this.instance.label);
    
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
        
        instance: this.instance
    });
    
    if(showCalc){
        calculationTableView = this.getTableView();
    }
    else{
        calculationTableView = Ti.UI.createView({
            width : '100%',
            layout : 'vertical',
            height : Ti.UI.SIZE,
            textValue: origValue,
            dbValue: null
        });
    }
    
    if(calculationTableView){
        widgetView.add(calculationTableView);    
    }
    
    if(this.instance.settings.include_recalculate_button == 1){
        recalculateButton = Ti.UI.createButton({
             title: ' Recalculate ',
             style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
             backgroundGradient: Omadi.display.backgroundGradientGray,
             borderColor: '#999',
             borderWidth: 1,
             right: 15,
             width: Ti.UI.SIZE,
             borderRadius: 10,
             color: '#eee',
             instance: this.instance,
             top: 10
        });
        
        recalculateButton.addEventListener('click', function(e){
            try{
                var instance = e.source.instance;
                
                Widget[e.source.instance.field_name].formObj.unfocusField();
                // Reset the cached values
                CalculatedFieldCache = {};
                Widget[e.source.instance.field_name].redraw(instance);
            }
            catch(ex){
                Omadi.service.sendErrorReport("Exception while clicking recalculate: " + ex);
            }
        });
        
        widgetView.add(recalculateButton);
    }
    
    widgetView.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
    this.formObj.addCheckConditionalFields(widgetView.check_conditional_fields);
    
    return widgetView;
};

CalculationFieldWidget.prototype.getTableView = function() {"use strict";
    var result, row_values, tableView, cal_value, cal_value_str, isNegative, 
        row, row_label, value, idx, dbValue, origValue, onlyShowTotal, showZeroRows;
    
    tableView = null;
    
    try{
        
        this.formObj.formToNode(true);
    
        this.node = this.formObj.node;
        
        dbValue = null;
        origValue = null;
        
        if(typeof this.node[this.instance.field_name] !== 'undefined'){
            if(typeof this.node[this.instance.field_name].dbValues !== 'undefined' && typeof this.node[this.instance.field_name].dbValues[0] !== 'undefined'){
                dbValue = this.node[this.instance.field_name].dbValues[0];
            }
            
            if(typeof this.node[this.instance.field_name].textValues !== 'undefined' && typeof this.node[this.instance.field_name].textValues[0] !== 'undefined'){
                origValue = this.node[this.instance.field_name].textValues[0];
            }
        }
        
        result = this.getRowValues();
        
        row_values = result[0].rows;
    
        tableView = Ti.UI.createView({
            width : '100%',
            layout : 'vertical',
            height : Ti.UI.SIZE,
            textValue: origValue,
            dbValue: null
        });
    
        onlyShowTotal = false;
        if(row_values.length == 1){
            onlyShowTotal = true;
        }
        else if(typeof this.instance.settings.only_show_total !== 'undefined' && this.instance.settings.only_show_total == 1){
            onlyShowTotal = true;
        }
        
        showZeroRows = true;
        if(typeof this.instance.settings.show_only_non_zero_rows !== 'undefined'){
            if(this.instance.settings.show_only_non_zero_rows == 1){
                showZeroRows = false;
            }
        }
        
        if (!onlyShowTotal) {
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
                
                if(cal_value == 0){
                    if(!showZeroRows){
                        // If the setting to skip zero rows is enabled, do not show them
                        continue;
                    }
                }
                
                isNegative = (cal_value < 0) ? true : false;
                // Is negative. And if it is -ve then write in this value in (brackets).
                cal_value_str = Omadi.utils.applyNumberFormat(this.instance, cal_value);
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
                    width : '64.5%',
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
                    width : '35%',
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
            if(!Omadi.utils.isNumber(cal_value)){
                cal_value = 0;
            }
            
            tableView.dbValue = cal_value;
            
            isNegative = (cal_value < 0) ? true : false;
            // Is negative. And if it is -ve then write in this value in (brackets).
            cal_value_str = Omadi.utils.applyNumberFormat(this.instance, cal_value);
            cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
            // Adding brackets over -ve value.
    
            row = Ti.UI.createView({
                height : Ti.UI.SIZE,
                width : '100%',
                backgroundColor : '#ccc'
            });
    
            row_label = Ti.UI.createLabel({
                text : this.instance.label + "  ",
                textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
                width : '64.5%',
                left : 0,
                top : 1,
                bottom: 1,
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
                width : '35%',
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
            
            if(origValue !== null && tableView.dbValue != origValue && this.node.form_part >= this.instance.form_part){
                cal_value = origValue;
                if(typeof (cal_value) == 'string'){
                    cal_value = parseFloat(cal_value);
                } 
                
                isNegative = (cal_value < 0) ? true : false;
                // Is negative. And if it is -ve then write in this value in (brackets).
                cal_value_str = Omadi.utils.applyNumberFormat(this.instance, cal_value);
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
            
            cal_value = 0;
            if(typeof result[0] !== 'undefined' && typeof result[0].final_value !== 'undefined'){
                cal_value = result[0].final_value;
            }
            
            if(typeof (cal_value) == 'string'){
                cal_value = parseFloat(cal_value);
            }
            
            if(!Omadi.utils.isNumber(cal_value)){
                cal_value = 0;
            }
            
            // Set the calculated dbValue for the view
            tableView.dbValue = cal_value;
            
            isNegative = (cal_value < 0) ? true : false;
            // Is negative. And if it is -ve then write in this value in (brackets).
            cal_value_str = Omadi.utils.applyNumberFormat(this.instance, cal_value);
            cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
            // Adding brackets over -ve value.
            
            if(origValue !== null && tableView.dbValue != origValue && this.node.form_part >= this.instance.form_part){
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
                cal_value_str = Omadi.utils.applyNumberFormat(this.instance, cal_value);
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
                    left : '2%',
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
    }
    catch(ex){
        Omadi.service.sendErrorReport("Exception getting calculation field table view: " + ex);
    }

    return tableView;
};

CalculationFieldWidget.prototype.getRowValues = function(instance){"use strict";
    var entity, final_value, row_values, idx, calculation_row, value, field_1_multiplier,
        field_2_multiplier, numeric_multiplier, cached_final_value, instances, required_instance_final_values,
        parent_field, start_timestamp, end_timestamp, difference, at_time, relative_increment_time, day_count, 
        parent_node, zero, criteria_index, field_name, innerFinalValue, priceIdx;
    
    cached_final_value = 0;
    final_value = 0;
    row_values = [];
    
    try{
        
        if(typeof instance === 'undefined'){
            instance = this.instance;
        }
        
        Ti.API.debug("Getting row values for " + instance.label);
        
        this.node = this.formObj.node;
        
        //Ti.API.debug(JSON.stringify(CalculatedFieldCache));
        
        instances = Omadi.data.getFields(this.formObj.type);
        final_value = 0;
        
        if (instance.settings.calculation.items != null && !instance.disabled) {
            
            if (instance.value != null && instance.value != "") {
                cached_final_value = instance.value;
            }
            else {
                cached_final_value = 0;
            }
            
            if(typeof instance.settings.calculation.items !== 'undefined'){
                
                if(Omadi.utils.isArray(instance.settings.calculation.items)){
                    // Only sort if the items is an array
                    // We can still support a key/value object, but sort will not work
                    instance.settings.calculation.items = instance.settings.calculation.items.sort(Omadi.utils.sortByWeight);
                }
            
                for (idx in instance.settings.calculation.items) {
                    if(instance.settings.calculation.items.hasOwnProperty(idx)){
                        calculation_row = instance.settings.calculation.items[idx];
                        value = 0;
                        field_1_multiplier = 0;
                        field_2_multiplier = 0;
                        numeric_multiplier = 0;
    
                        if (typeof calculation_row.field_name_1 !== 'undefined' && 
                            typeof this.node[calculation_row.field_name_1] !== 'undefined' && 
                            typeof instances[calculation_row.field_name_1] !== 'undefined' && 
                            instances[calculation_row.field_name_1].type == 'calculation_field' && 
                            typeof CalculatedFieldCache[calculation_row.field_name_1] === 'undefined') {
                                // Make sure a dependency calculation is made first
                                required_instance_final_values = this.getRowValues(instances[calculation_row.field_name_1]);
                                CalculatedFieldCache[calculation_row.field_name_1] = required_instance_final_values[0].final_value;
                                
                                // TODO: make sure the node is a reference, not just a value, as nested calls to this could result in incorrect calculations
                                if(typeof required_instance_final_values[0].final_value !== 'undefined'){
                                    this.node[calculation_row.field_name_1].dbValues[0] = required_instance_final_values[0].final_value;
                                    this.formObj.node[calculation_row.field_name_1].dbValues[0] = required_instance_final_values[0].final_value;
                                }
                        }
                        
                        if (typeof calculation_row.field_name_2 !== 'undefined' && 
                            typeof this.node[calculation_row.field_name_2] !== 'undefined' && 
                            typeof instances[calculation_row.field_name_2] !== 'undefined' && 
                            instances[calculation_row.field_name_2].type == 'calculation_field' &&
                            typeof CalculatedFieldCache[calculation_row.field_name_2] === 'undefined') {
                                // Make sure a dependency calculation is made first
                                required_instance_final_values = this.getRowValues(instances[calculation_row.field_name_2]);
                                CalculatedFieldCache[calculation_row.field_name_2] = required_instance_final_values[0].final_value;
                                
                                // TODO: make sure the node is a reference, not just a value, as nested calls to this could result in incorrect calculations
                                if(typeof required_instance_final_values[0].final_value !== 'undefined'){
                                    this.node[calculation_row.field_name_2].dbValues[0] = required_instance_final_values[0].final_value;
                                    this.formObj.node[calculation_row.field_name_2].dbValues[0] = required_instance_final_values[0].final_value;
                                }
                        }
                        
                        if (calculation_row.field_name_1 != null && calculation_row.field_name_1 != "") {
                            
                            if (typeof CalculatedFieldCache[calculation_row.field_name_1] !== 'undefined' && CalculatedFieldCache[calculation_row.field_name_1] != null) {
                                field_1_multiplier = CalculatedFieldCache[calculation_row.field_name_1];
                            }
                            else if (calculation_row.type == 'parent_field_value') {
                                parent_field = calculation_row.parent_field;
                                if (this.node[parent_field] != null && this.node[parent_field].dbValues[0] != null) {
                                    parent_node = Omadi.data.nodeLoad(this.node[parent_field].dbValues[0]);
                                    if (parent_node && 
                                        typeof parent_node[calculation_row.field_name_1] !== 'undefined' && 
                                        typeof parent_node[calculation_row.field_name_1].dbValues !== 'undefined' && 
                                        parent_node[calculation_row.field_name_1].dbValues[0] != null) {
                                            field_1_multiplier = parent_node[calculation_row.field_name_1].dbValues[0];
                                    }
                                    else if(typeof calculation_row.default_value !== 'undefined'){
                                        field_1_multiplier = calculation_row.default_value;
                                    }
                                }
                            }
                            else if(typeof instances[calculation_row.field_name_1] !== 'undefined' &&
                                instances[calculation_row.field_name_1] != null &&
                                typeof instances[calculation_row.field_name_1].type !== 'undefined' && 
                                instances[calculation_row.field_name_1].type == 'extra_price'){
                                    
                                    if (this.node[calculation_row.field_name_1] != null && this.node[calculation_row.field_name_1].dbValues != null) {
                                        field_1_multiplier = 0;
                                        for(priceIdx = 0; priceIdx < this.node[calculation_row.field_name_1].dbValues.length; priceIdx ++){
                                            if(!isNaN(parseFloat(this.node[calculation_row.field_name_1].dbValues[priceIdx]))){
                                                field_1_multiplier += parseFloat(this.node[calculation_row.field_name_1].dbValues[priceIdx]);
                                            }
                                        }
                                    }                                  
                            }
                            else if (this.node[calculation_row.field_name_1] != null && this.node[calculation_row.field_name_1].dbValues[0] != null) {
                                field_1_multiplier = this.node[calculation_row.field_name_1].dbValues[0];
                            }
                            
                            // If this is a time calculation, the saved value can be completely 
                            // recalculated to the current value, or if empty according to the current time
                            if (field_1_multiplier > 0 && calculation_row.datestamp_end_field != null && calculation_row.datestamp_end_field != "") {
                                
                                start_timestamp = field_1_multiplier;
                                field_1_multiplier = 0;
                                
                                if (this.node[calculation_row.datestamp_end_field] != null && this.node[calculation_row.datestamp_end_field].dbValues[0] != null) {
                                    end_timestamp = this.node[calculation_row.datestamp_end_field].dbValues[0];
                                }
                                else{
                                    end_timestamp = Omadi.utils.getUTCTimestamp();   
                                }
                                
                               
                                
                                Ti.API.info("end timestamp: " + end_timestamp);
                                
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
                                        relative_increment_time = at_time = Omadi.utils.mktime(0,0,0, Omadi.utils.PHPFormatDate('n', start_timestamp), Omadi.utils.PHPFormatDate('j', start_timestamp), Omadi.utils.PHPFormatDate('Y', start_timestamp));
                                        
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
            
                        if (calculation_row.field_name_2 != null && calculation_row.field_name_2 != "") {
                            
                            if (CalculatedFieldCache[calculation_row.field_name_2] != null) {
                                field_2_multiplier = CalculatedFieldCache[calculation_row.field_name_2];
                            }
                            else if (calculation_row.type == 'parent_field_value') {
                                parent_field = calculation_row.parent_field;
                                
                                if (this.node[parent_field] != null && this.node[parent_field].dbValues[0] != null) {
                                    parent_node = Omadi.data.nodeLoad(this.node[parent_field].dbValues[0]);
                                    
                                    if (parent_node && parent_node[calculation_row.field_name_2].dbValues[0] != null) {
                                        field_2_multiplier = parent_node[calculation_row.field_name_2].dbValues[0];
                                    }
                                }
                            }
                            else if(typeof instances[calculation_row.field_name_2] !== 'undefined' &&
                                instances[calculation_row.field_name_2] != null &&
                                typeof instances[calculation_row.field_name_2].type !== 'undefined' && 
                                instances[calculation_row.field_name_2].type == 'extra_price'){
                                    
                                    if (this.node[calculation_row.field_name_2] != null && this.node[calculation_row.field_name_2].dbValues != null) {
                                        field_2_multiplier = 0;
                                        for(priceIdx = 0; priceIdx < this.node[calculation_row.field_name_2].dbValues.length; priceIdx ++){
                                            if(!isNaN(parseFloat(this.node[calculation_row.field_name_2].dbValues[priceIdx]))){
                                                field_2_multiplier += parseFloat(this.node[calculation_row.field_name_2].dbValues[priceIdx]);
                                            }
                                        }
                                    }                               
                            }
                            else if (this.node[calculation_row.field_name_2] != null && this.node[calculation_row.field_name_2].dbValues[0] != null) {
                                field_2_multiplier = this.node[calculation_row.field_name_2].dbValues[0];
                            }
                        }
            
                        if (calculation_row.numeric_multiplier != null && calculation_row.numeric_multiplier != "") {
                            numeric_multiplier = Number(calculation_row.numeric_multiplier);
                        }
            
                        zero = false;
                        
                        if (calculation_row.criteria != null && calculation_row.criteria.search_criteria != null) {
                            
                            // Make sure any search criteria items are calculated before passing to the matching function
                            for (criteria_index in calculation_row.criteria.search_criteria) {
                                if (calculation_row.criteria.search_criteria.hasOwnProperty(criteria_index)) {
                
                                    field_name = calculation_row.criteria.search_criteria[criteria_index].field_name;
                                    
                                    if(typeof instances[field_name] !== 'undefined'){
                                        if(instances[field_name].type == 'calculation_field'){
                                            
                                            if(typeof CalculatedFieldCache[field_name] !== 'undefined'){
                                                // Use the cached value if available
                                                innerFinalValue = CalculatedFieldCache[field_name];
                                            }
                                            else{
                                                // Calculate the value of the search criteria value
                                                required_instance_final_values = this.getRowValues(instances[field_name]);
                                                innerFinalValue = required_instance_final_values[0].final_value;  
                                                CalculatedFieldCache[field_name] = innerFinalValue;
                                            }
                                            
                                            // TODO: make sure the node is a reference, not just a value, as nested calls to this could result in incorrect calculations
                                            if(typeof this.node[field_name] === 'undefined'){
                                                this.node[field_name] = {};
                                            }
                                            if(typeof this.node[field_name].dbValues === 'undefined'){
                                                this.node[field_name].dbValues = [];
                                            }
                                            
                                            this.node[field_name].dbValues[0] = innerFinalValue; 
                                        }
                                    }
                                }
                            }
                            
                            if (!Omadi.utils.list_search_node_matches_search_criteria(this.node, calculation_row.criteria)) {
                                zero = true;
                            }
                        }
            
                        value = 0;
                        
                        if(typeof calculation_row.field_name_1 !== 'undefined' && !Omadi.utils.isEmpty(calculation_row.field_name_1)){
                            if (!field_1_multiplier) {
                                zero = true;
                            }
                            else if (!value && field_1_multiplier) {
                                value = Number(field_1_multiplier);
                            }
                        }
                        
                        if(typeof calculation_row.field_name_2 !== 'undefined' && !Omadi.utils.isEmpty(calculation_row.field_name_2)){
                            if (!field_2_multiplier) {
                                zero = true;
                            }
                            else if (!value && field_2_multiplier) {
                                value = Number(field_2_multiplier);
                            }
                            else if (value && field_2_multiplier) {
                                value *= Number(field_2_multiplier);
                            }
                        }
            
                        if (!value && numeric_multiplier) {
                            value = Number(numeric_multiplier);
                        }
                        else if (value && numeric_multiplier) {
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
            }
            
            // Round the final value if applicable
            if(typeof instance.settings.rounding !== 'undefined'){
                if(instance.settings.rounding == 'up'){
                    final_value = Math.ceil(final_value);
                }
                else if(instance.settings.rounding == 'down'){
                    final_value = Math.floor(final_value);
                }
                else if(instance.settings.rounding == 'integer'){
                    final_value = Math.round(final_value);
                }
            }
        }
    }
    catch(ex){
        this.formObj.sendError("Exception getting calc row values: " + ex);    
    }
    
    return [{
        cached_final_value : cached_final_value,
        final_value : final_value,
        rows : row_values
    }];
};

CalculationFieldWidget.prototype.cleanUp = function(){"use strict";
    var i, j;
    Ti.API.debug("in calculation widget cleanup");
    
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
        
        Ti.API.debug("At end of calculation widget cleanup");
    }
    catch(ex){
        try{
            Omadi.service.sendErrorReport("Exception cleaning up calculation widget field: " + ex);
        }
        catch(ex1){}
    }
    
    Omadi = null;
};

exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new CalculationFieldWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};


