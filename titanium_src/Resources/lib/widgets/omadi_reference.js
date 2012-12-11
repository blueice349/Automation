/*jslint eqeq:true, plusplus: true*/
/*global PLATFORM,setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.omadi_reference = {
    
    
    getFieldView: function(node, instance){"use strict";
        //this.base = Omadi.widgets.base.init(in_instance);
        instance.elements = [];
        
        var settings = instance.settings, fieldView, i, j, element, addAnotherItemButton = null, autocomplete_table;
        
        fieldView = Ti.UI.createView({
           width: '100%',
           layout: 'vertical',
           height: Ti.UI.SIZE,
           instance: instance
        });
        
        instance.fieldView = fieldView;
        
        fieldView.add(Omadi.widgets.label.getRegularLabelView(instance));
        setConditionallyRequiredLabelForInstance(node, instance);
       
        instance.numVisibleFields = 1;
        
        // Add the actual fields
        element = Omadi.widgets.omadi_reference.getNewElement(node, instance,  0);
        instance.elements.push(element);
        fieldView.add(element);
        
        //top += (PLATFORM == 'android') ? heightTextField : heightValue;
    
        //regionView.add(content[count].autocomplete_table);
        
        
        
        fieldView.add(Omadi.widgets.getSpacerView());

       
       return fieldView;
    },
    getNewElement: function(node, instance, index){"use strict";
        
        var settings, widgetView, dbValue, textValue, nodeTypes, possibleValues, i, query, db, result, wrapper, autocomplete_table, calculatedTop;
        
        dbValue = "";
        textValue = "";
        if(typeof node[instance.field_name] !== 'undefined'){
            if(typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined'){
                dbValue = node[instance.field_name].dbValues[index];
            }
            
            if(typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[index] !== 'undefined'){
                textValue = node[instance.field_name].textValues[index];
            }
        }
        
        settings = instance.settings;
        Ti.API.debug("Creating omadi_reference field");
        
        possibleValues = [];
        nodeTypes = [];
        
        for (i in instance.settings.reference_types) {
            if(instance.settings.reference_types.hasOwnProperty(i)){
                nodeTypes.push(instance.settings.reference_types[i]);
            }
        }
        
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
        
        
        widgetView = Ti.UI.createTextField({
            autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_WORDS,
            autocorrect: false,
            editable : instance.can_edit,
            enabled : instance.can_edit,
            ellipsize: false,
            keepScreenOn: true,
            suppessReturn: false,
            borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            width : Ti.Platform.displayCaps.platformWidth - 30,
            height: Ti.UI.SIZE,
            color : '#000000',
            font: {
                fontSize: Omadi.widgets.fontSize
            },
            backgroundColor: '#fff',
            borderRadius: 10,
            borderColor: '#999',
            borderWidth: 1,
            returnKeyType : Ti.UI.RETURNKEY_DONE,
            
            instance: instance,
            dbValue: dbValue,
            textValue: textValue,
            value : textValue,
            lastValue: textValue,
            touched: false,
            possibleValues: possibleValues,
            defaultValueChildFields: [],
            onChangeCallbacks: []
        });
        
        widgetView.defaultValueChildFields = Omadi.widgets.omadi_reference.setupParentDefaultFields(instance);
        
        autocomplete_table = Titanium.UI.createTableView({
            zIndex : 999,
            height: 0,
            backgroundColor : '#FFFFFF',
            visible : false,
            borderColor : '#000',
            borderWidth : 0,
            top: 0,
            textField: widgetView
        });
        
        widgetView.autocomplete_table = autocomplete_table;
        
        autocomplete_table.addEventListener('click', function(e) {
       
            e.source.textField.textValue = e.source.textField.value = e.rowData.title;
            e.source.textField.dbValue = e.rowData.nid;
            
            e.source.autocomplete_table.setHeight(0);
            e.source.autocomplete_table.setBorderWidth(0);
            e.source.autocomplete_table.setVisible(false);
            
            Omadi.widgets.omadi_reference.setChildDefaultValues(e.source.textField);
            
            if(typeof e.source.textField.onChangeCallbacks !== 'undefined'){
                if(e.source.textField.onChangeCallbacks.length > 0){
                    for(i = 0; i < e.source.textField.onChangeCallbacks.length; i ++){
                        var callback = e.source.textField.onChangeCallbacks[i];
                        callback(e.source.textField.onChangeCallbackArgs[i]);
                    }
                }
            }
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
            if (PLATFORM == 'android') {
                widgetView.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
            }
        }
    
        if (settings.min_length && settings.min_length != null && settings.min_length != "null") {
            widgetView.minLength = settings.min_length;
        }
        
        widgetView.addEventListener('focus', function(e) {
            var calculatedTop;
            /*global scrollView, scrollPositionY*/
            e.source.touched = true;
            if(typeof scrollView !== 'undefined'){
                calculatedTop = e.source.convertPointToView({x:0,y:0}, scrollView);
                scrollView.scrollTo(0, calculatedTop.y - 18 + scrollPositionY);
            }
        });
        
        widgetView.addEventListener('blur', function(e){
            e.source.autocomplete_table.setBorderWidth(0);
            e.source.autocomplete_table.setHeight(0);
            e.source.autocomplete_table.setVisible(false);
        });
        
        widgetView.addEventListener('change', function(e) {
            /*global setConditionallyRequiredLabels*/
           
            var possibleValues, tableData, i, regEx, row, upperCaseValue, callback;
            
            if (e.source.touched === true) {
                Ti.API.info("changed");
                
                e.source.dbValue = null;
                e.source.textValue = e.source.value;
                
                if (e.source.lastValue != e.source.value && e.source.value != '') {
                    possibleValues = e.source.possibleValues;
                    
                    upperCaseValue = e.source.value.toUpperCase();
                    tableData = [];

                    for (i = 0; i < possibleValues.length; i++) {
                        
                        regEx = new RegExp(e.source.value, 'i');
                        if (possibleValues[i].title.search(regEx) != -1) {
                            //Check match
                            if (upperCaseValue == possibleValues[i].title.toUpperCase()) {
                                e.source.dbValue = possibleValues[i].nid;
                                Omadi.widgets.omadi_reference.setChildDefaultValues(e.source);
                                if(e.source.onChangeCallbacks.length > 0){
                                    for(i = 0; i < e.source.onChangeCallbacks.length; i ++){
                                        callback = e.source.onChangeCallbacks[i];
                                        callback(e.source.onChangeCallbackArgs[i]);
                                    }
                                }
                            }
                            else {
                                e.source.dbValue = null;
                            }

                            //Create partial matching row
                            row = Ti.UI.createTableViewRow({
                                height : 38,
                                title : possibleValues[i].title,
                                nid : possibleValues[i].nid,
                                color : '#000000',
                                autocomplete_table : e.source.autocomplete_table,
                                textField : e.source
                            });
                            
                            // apply rows to data array
                            tableData.push(row);
                            
                            if(tableData.length >= 4){
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
                    else{
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
   
            
            if(e.source.check_conditional_fields.length > 0){
                setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
            }
        });
        
        wrapper = Ti.UI.createView({
           width: '100%',
           height: Ti.UI.SIZE,
           layout: 'vertical'
        });
        
        wrapper.add(widgetView);
        wrapper.add(autocomplete_table);
        
        return wrapper;
    },
    setupParentDefaultFields: function(omadi_reference_instance){"use strict";
        var instances, field_name, instance, parentFieldName, childFieldNames = [];
        
        
        instances = Omadi.data.getFields(Ti.UI.currentWindow.type);
        
        for(field_name in instances){
            if(instances.hasOwnProperty(field_name)){
                instance = instances[field_name];
                if (typeof instance.settings.parent_form_default_value !== 'undefined') {
                    
                    if (typeof instance.settings.parent_form_default_value.parent_field !== 'undefined' && instance.settings.parent_form_default_value.parent_field != "") {
                       
                        parentFieldName = instance.settings.parent_form_default_value.parent_field;
                        
                         
                        if(parentFieldName == omadi_reference_instance.field_name){
                            //Ti.API.info(field_name);
                            childFieldNames.push({
                                childFieldName: field_name,
                                defaultValueField: instance.settings.parent_form_default_value.default_value_field
                            });
                        }
                    }
                }
            }
        }
        
        return childFieldNames;
    },
    setChildDefaultValues: function(widgetView){"use strict";
        var parentFieldName, defaultValueField, childFieldValues, parentNode, instance, instances, defaultValues, field_name, childFieldName, i, childInstance;
        /*global getFormFieldValues, loadNode, setValues*/
        
        //Ti.API.debug(JSON.stringify(widgetView.defaultValueChildFields));
        //Ti.API.debug(widgetView.dbValue);
        
        //instances = Omadi.data.getFields(Ti.UI.currentWindow.type);
        
        Ti.API.debug("Setting default value");
        
        if(widgetView.dbValue > 0){
            if(widgetView.defaultValueChildFields.length > 0){
                parentNode = loadNode(widgetView.dbValue);
                
                for(i = 0; i < widgetView.defaultValueChildFields.length; i ++){
                    childFieldName = widgetView.defaultValueChildFields[i].childFieldName;
                    defaultValueField = widgetView.defaultValueChildFields[i].defaultValueField;
                    
                    childFieldValues = getFormFieldValues(childFieldName); 
                    if(typeof childFieldValues.dbValues === 'undefined' || childFieldValues.dbValues.length == 0 || childFieldValues.dbValues[0] == null || childFieldValues.dbValues[0] == ""){
                        
                        if(typeof parentNode[defaultValueField] !== 'undefined'){
                            defaultValues = parentNode[defaultValueField];
                            
                            //Ti.API.debug("real defaults: " + JSON.stringify(defaultValues));
                            
                            Omadi.widgets.setValues(childFieldName, defaultValues);
                        }
                    }
                }
            }
        }
        
        // for(i = 0; i < widgetView.defaultValueChildFields.length; i ++){
            // parentFieldValues = getFormFieldValues(widgetView.defaultValueChildFields[i]);
//                 
            // if(typeof parentFieldValues.dbValues !== 'undefined'){
                // if(typeof parentFieldValues.dbValues[0] != null){
                    // parentNode = loadNode(parentFieldValues.dbValues[0]);
                    // Ti.API.debug(JSON.stringify(parentNode));
                // }
            // }
        // }
        
        //instances = Omadi.data.getFields(Ti.UI.currentWindow.type);
       // instance = widget.instance;
        

            
        //if (typeof instance.settings.parent_form_default_value !== 'undefined') {
        //    if (typeof instance.settings.parent_form_default_value.parent_field !== 'undefined' && instance.settings.parent_form_default_value.parent_field != "") {
                // parentFieldName = instance.settings.parent_form_default_value.parent_field;
                // defaultValueField = instance.settings.parent_form_default_value.default_value_field;
//                 
                // parentFieldValues = getFormFieldValues(parentFieldName);
//                 
                // if(typeof parentFieldValues.dbValues !== 'undefined'){
                    // if(typeof parentFieldValues.dbValues[0] != null){
                        // parentNode = loadNode(parentFieldValues.dbValues[0]);
                        // Ti.API.debug(JSON.stringify(parentNode));
                    // }
                // }
                // else if(typeof node[parentFieldName].dbValues !== 'undefined'){
                    // if(typeof node[parentFieldName].dbValues[0] != null){
                        // parentNode = loadNode(node[parentFieldName].dbValues[0]);
                        // Ti.API.debug(JSON.stringify(parentNode));
                    // }
                // }
                    
                
                // if ((content[counter].field_type == 'number_decimal' || content[counter].field_type == 'number_integer')) {
                    // content[counter].value = defaultFieldVal + "";
                    // content[counter].nid = e.source.nid;
                // }
                // else {
                    // content[counter].value = defaultFieldVal;
                    // defaultFieldVal = db_display.execute('SELECT name FROM term_data WHERE tid="' + defaultFieldVal + '";');
                    // defaultFieldVal = defaultFieldVal.fieldByName('name');
                    // content[counter].title = defaultFieldVal;
                // }
                
                // if (content[counter].parent_name == e.source.field_name) {
    // 
                    // db_display = Omadi.utils.openMainDatabase();
    // 
                    // var table = db_display.execute('SELECT table_name FROM node WHERE nid = ' + e.source.nid);
                    // table = table.fieldByName('table_name');
    // 
                    // var defaultFieldVal = db_display.execute('SELECT ' + content[counter].defaultField + ' FROM ' + table + ' WHERE nid=' + e.source.nid);
                    // defaultFieldVal = defaultFieldVal.fieldByName(content[counter].defaultField);
    // 
                    // var defaultFieldSetting = db_display.execute('SELECT settings FROM fields WHERE field_name="' + content[counter].defaultField + '" and bundle="' + table + '";');
                    // defaultFieldSetting = JSON.parse(defaultFieldSetting.fieldByName('settings'));
                    // if (content[counter].cardinality == defaultFieldSetting.cardinality && defaultFieldSetting.cardinality == 1) {
                        // if (defaultFieldVal == null || defaultFieldVal == "null" || defaultFieldVal == "" || defaultFieldVal == 7411317618171051229 || defaultFieldVal == "7411317618171051229" || defaultFieldVal == 7411317618171051000 || defaultFieldVal == "7411317618171051000") {
                            // continue;
                        // }
    // 
    //                     
                        // changedContentValue(content[counter]);
    // 
                    // }
                    // else if (content[counter].cardinality == defaultFieldSetting.cardinality && defaultFieldSetting.cardinality > 1) {
    // 
                    // }
                    // db_display.close();
                // }
          //  }
       // }  
        
    }
};


//var reffer_index = count;
// data_terms = new Array();
// aux_nodes = new Array();
// 
// var i;
// for (i in settings.reference_types) {
    // aux_nodes.push(settings.reference_types[i]);
// }
// 
// if (aux_nodes.length > 0) {
    // var secondary = 'SELECT * FROM node WHERE ';
    // var i;
    // for ( i = 0; i < aux_nodes.length; i++) {
        // if (i == aux_nodes.length - 1) {
            // secondary += ' table_name = \'' + aux_nodes[i] + '\' ';
        // }
        // else {
            // secondary += ' table_name = \'' + aux_nodes[i] + '\' OR ';
        // }
    // }
    // Ti.API.info(secondary);
    // var db_bah = Omadi.utils.openMainDatabase();
// 
    // var nodes = db_bah.execute(secondary);
    // Ti.API.info("Num of rows: " + nodes.rowCount);
    // while (nodes.isValidRow()) {
        // Ti.API.info('Title: ' + nodes.fieldByName('title') + ' NID: ' + nodes.fieldByName('nid'));
        // data_terms.push({
            // title : nodes.fieldByName('title'),
            // nid : nodes.fieldByName('nid')
        // });
        // nodes.next();
    // }
// }

//Add fields:
// regionView.add(label[count]);
// 
// 
// 
    // var vl_to_field = field_arr[index_label][index_size].actual_value;
// 
    // var aux_val = {
        // title : "",
        // vl : null
    // };
    // var h;
    // for (h in data_terms) {
        // if (data_terms[h].nid == vl_to_field) {
            // aux_val.title = data_terms[h].title;
            // aux_val.vl = data_terms[h].nid;
        // }
    // }
// 
    // Ti.API.info("-----------------     OMADI REFERENCE : " + aux_val.title + " NID: " + aux_val.vl);
// 
    // content[count] = Titanium.UI.createTextField({
        // hintText : field_arr[index_label][index_size].label + ' ...',
        // borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        // color : '#000000',
        // height : (PLATFORM == 'android') ? heightTextField : heightValue,
        // font : {
            // fontSize : fieldFontSize
        // },
        // width : Ti.Platform.displayCaps.platformWidth - 30,
        // top : top,
        // field_type : field_arr[index_label][index_size].type,
        // field_name : field_arr[index_label][index_size].field_name,
        // terms : data_terms,
        // restrict_new_autocomplete_terms : rest_up,
        // fantasy_name : field_arr[index_label][index_size].label,
        // nid : aux_val.vl,
        // required : field_arr[index_label][index_size].required,
        // is_title : field_arr[index_label][index_size].is_title,
        // composed_obj : false,
        // cardinality : settings.cardinality,
        // value : aux_val.title,
        // //first_time : true,
        // lastValue : aux_val.title,
        // reffer_index : reffer_index,
        // settings : settings,
        // changedFlag : 0,
        // my_index : count,
        // autocorrect : false,
        // returnKeyType : Ti.UI.RETURNKEY_DONE,
        // enabled : can_edit,
        // editable : can_edit,
        // touched : false,
        // regionView : regionView
    // });
    // if (PLATFORM == 'android') {
        // content[count].backgroundImage = '../images/textfield.png'
    // }
    // if (!can_edit) {
        // content[count].backgroundImage = '';
        // content[count].backgroundColor = '#BDBDBD';
        // content[count].borderColor = 'gray';
        // content[count].borderRadius = 10;
        // content[count].color = '#848484';
        // content[count].borderWidth = 1;
        // content[count].paddingLeft = 3;
        // content[count].paddingRight = 3;
        // if (PLATFORM == 'android') {
            // content[count].softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
        // }
    // }
    // //AUTOCOMPLETE TABLE FOR OMADI REFERENCE FIELDS, cardinality = 1
    // var autocomplete_table = Titanium.UI.createTableView({
        // top : top + ((PLATFORM == 'android') ? heightTextField - 10 : heightValue),
        // searchHidden : true,
        // zIndex : 999,
        // height : getScreenHeight() * 0.3,
        // backgroundColor : '#FFFFFF',
        // visible : false,
        // borderColor : '#000',
        // borderWidth : 0
    // });
    // content[count].autocomplete_table = autocomplete_table;
    // top += (PLATFORM == 'android') ? heightTextField : heightValue;
// 
    // regionView.add(content[count].autocomplete_table);
// 
    // //
    // // TABLE EVENTS FOR OMADI REFERENCE FIELDS, cardinality = 1
    // //
    // content[count].autocomplete_table.addEventListener('click', function(e) {
        // if (PLATFORM != 'android') {
            // e.source.textField.value = e.rowData.title;
            // e.source.textField.nid = e.rowData.nid;
        // }
        // else {
            // e.source.setValueF(e.rowData.title, e.rowData.nid);
        // }
// 
        // setTimeout(function() {
            // e.source.autocomplete_table.visible = false;
            // e.source.autocomplete_table.borderWidth = 0;
            // Ti.API.info(e.rowData.title + ' was selected!');
        // }, 80);
// 
    // });
// 
    // content[count].addEventListener('blur', function(e) {
        // e.source.autocomplete_table.visible = false;
        // e.source.autocomplete_table.borderWidth = 0;
        // if ((e.source.nid === null) && (e.source.value != "")) {
            // if (PLATFORM == 'android') {
                // Ti.UI.createNotification({
                    // message : 'The field ' + e.source.fantasy_name + ' does not accept fields creation, select one of the list !',
                    // duration : Ti.UI.NOTIFICATION_DURATION_LONG
                // }).show();
            // }
            // else {
                // alert('The field ' + e.source.fantasy_name + ' does not accept fields creation, select one of the list !');
            // }
        // }
        // else {
            // setDefaultValues(content, e);
            // setRulesField(e.source);
        // }
    // });
// 
    // // content[count].addEventListener('focus', function(e) {
        // // e.source.touched = true;
        // // adjustView(e.source.my_index, e.source.regionView.top + e.source.top - ((PLATFORM == 'android') ? heightTextField : heightValue));
    // // });
// 
    // //
    // // SEARCH EVENTS omadi_reference, cardinality == 1
    // //
    // // content[count].addEventListener('change', function(e) {
        // // if (e.source.touched === true) {
            // // e.source.nid = null;
            // // changedContentValue(e.source);
            // // //Ti.API.info('value: ' + e.source.lastValue + " " + e.source.value);
            // // if (e.source.lastValue != e.source.value) {
                // // var list = e.source.terms;
                // // var func = function setValueF(value_f, nid) {
                    // // e.source.value = value_f;
                    // // e.source.nid = nid;
                    // // //Ti.API.info('Value: ' + value_f + ' NID: ' + nid);
                // // };
// // 
                // // if ((e.value != null) && (e.value != '')) {
                    // // table_data = [];
                    // // e.source.nid = null;
                    // // var i;
                    // // for ( i = 0; i < list.length; i++) {
                        // // var rg = new RegExp(e.source.value, 'i');
                        // // if (list[i].title.search(rg) != -1) {
                            // // //Check match
                            // // if (e.source.value == list[i].title) {
                                // // e.source.nid = list[i].nid;
                            // // }
                            // // else {
                                // // e.source.nid = null;
                            // // }
// // 
                            // // //Create partial matching row
                            // // var row = Ti.UI.createTableViewRow({
                                // // height : getScreenHeight() * 0.10,
                                // // title : list[i].title,
                                // // nid : list[i].nid,
                                // // color : '#000000',
                                // // autocomplete_table : e.source.autocomplete_table,
                                // // setValueF : func,
                                // // textField : e.source
                            // // });
                            // // // apply rows to data array
                            // // table_data.push(row);
                        // // }
                    // // }
                    // // e.source.autocomplete_table.setData(table_data);
                    // // e.source.autocomplete_table.borderWidth = 1;
                    // // e.source.autocomplete_table.height = getScreenHeight() * 0.3;
                    // // if (table_data.length == 0) {
                        // // e.source.autocomplete_table.borderWidth = 0;
                    // // }
                    // // if (table_data.length < 3 && table_data.length > 0) {
                        // // e.source.autocomplete_table.height = (table_data.length == 1) ? getScreenHeight() * 0.1 : getScreenHeight() * 0.2;
                    // // }
                    // // e.source.autocomplete_table.scrollToTop(0, {
                        // // animated : false
                    // // });
                    // // scrollView.scrollTo(0, e.source.regionView.top + e.source.top - ((PLATFORM == 'android') ? heightTextField : heightValue));
                    // // if (table_data.length > 0) {
                        // // e.source.autocomplete_table.visible = true;
                    // // }
                    // // else {
                        // // e.source.autocomplete_table.visible = false;
                    // // }
                // // }
                // // else {
                    // // e.source.autocomplete_table.visible = false;
                    // // e.source.nid = null;
                // // }
// // 
            // // }
            // // //e.source.first_time = false;
        // // }
        // // e.source.lastValue = e.source.value;
    // // });
    // //Add fields:
    // regionView.add(content[count]);
    // count++;
// 
// 
