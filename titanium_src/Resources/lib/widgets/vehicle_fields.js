/*jslint eqeq:true, plusplus: true*/
/*global PLATFORM,setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.vehicle_fields = {
    
    getFieldView: function(node, instance){"use strict";
        //this.base = Omadi.widgets.base.init(in_instance);
        instance.elements = [];
        
        var settings = instance.settings, fieldView, i, j, element, addAnotherItemButton = null;
        
        fieldView = Ti.UI.createView({
           width: '100%',
           layout: 'vertical',
           height: Ti.UI.SIZE,
           instance: instance
        });
        
        instance.fieldView = fieldView;
        
        fieldView.add(Omadi.widgets.label.getRegularLabelView(instance));
        setConditionallyRequiredLabelForInstance(node, instance);
       
        //Add fields:
        //regionView.add(label[count]);
        //var reffer_index = count;
        Ti.API.debug(instance.numVisibleFields);
        
       
        instance.numVisibleFields = 1;
              
        element = Omadi.widgets.vehicle_fields.getNewElement(node, instance,  0);
        instance.elements.push(element);
        fieldView.add(element);
        fieldView.add(Omadi.widgets.getSpacerView());

        
        //No data checkbox functionality
        //noDataCheckbox(reffer_index, regionView, top);
        //if (content[reffer_index].noDataView != null) {
        //    top += 40;
       // }
       
       //fieldViews[this.instance.field_name] = this.fieldView;
       
       //this.fieldView = fieldView;
       //this.initialized = true;
       
       return fieldView;
    },
    getNewElement: function(node, instance, index){"use strict";
        
        var settings, widgetView, dbValue, textValue, part, nameParts, wrapper, autocomplete_table, possibleValues, db, result, makeValue, real_field_name;
        
        nameParts = instance.field_name.split('___');
        
        if (nameParts[1]) {
            part = nameParts[1];
            real_field_name = nameParts[0];
        }
        else {
            Ti.API.error("There should be parts to this vehicle field!!!");
        }
        
        //i_name = i_name.charAt(0).toUpperCase() + i_name.slice(1);
        
        //if (part == "make") {
            //var _make_ref = reffer_index;
        //}
        
        //label[count].text += (' ' + i_name);
        
        
        dbValue = "";
        textValue = "";
        if(typeof node[real_field_name] !== 'undefined'){
            if(typeof node[real_field_name].parts[part].textValue !== 'undefined'){
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
        //else {// model part
            
            
            //dataItems = get_models(keep_from_make);
        //}
        
        db.close();
        
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
            color : '#000000',
            font: {
                fontSize: Omadi.widgets.fontSize
            },
            returnKeyType : Ti.UI.RETURNKEY_DONE,
            
            instance: instance,
            dbValue: dbValue,
            textValue: textValue,
            value : textValue,
            possibleValues : possibleValues,
            real_field_name: real_field_name
                        
            // field_type : instance.type,
            // field_name : instance.field_name,
            // required : instance.required,
            // is_title : instance.is_title,
            // composed_obj : false,
            // cardinality : settings.cardinality,
            // reffer_index : reffer_index,
            // settings : settings,
            // changedFlag : 0,
            // real_ind : count
        });
        
        
        //widgetView.hintText = '(000) 000-0000 x0000';
        
        
        //hintText : instance.label,
        
        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);
        
        if (PLATFORM == 'android') {
            widgetView.backgroundImage = '/images/textfield.png';
        }
        
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
       
            e.source.textField.textValue = e.source.textField.value = e.source.textField.dbValue = e.rowData.title;
            
            e.source.autocomplete_table.setHeight(0);
            e.source.autocomplete_table.setBorderWidth(0);
            e.source.autocomplete_table.setVisible(false);
        });        
        
        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);
        
        if (PLATFORM == 'android') {
            widgetView.backgroundImage = '/images/textfield.png';
        }
        
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
            e.source.touched = true;
            //adjustView(e.source.my_index, e.source.regionView.top + e.source.top - ((PLATFORM == 'android') ? heightTextField : heightValue));
        });
        
        widgetView.addEventListener('blur', function(e){
            e.source.autocomplete_table.setBorderWidth(0);
            e.source.autocomplete_table.setHeight(0);
            e.source.autocomplete_table.setVisible(false);
        });
        
        widgetView.addEventListener('change', function(e) {
            /*global setConditionallyRequiredLabels, getFormFieldValues*/
           
            var possibleValues, tableData, i, regEx, row, db, result, makeValues;
            
            if (e.source.touched === true) {
                
                e.source.textValue = e.source.dbValue = e.source.value;
                
                //changedContentValue(e.source);
                //Ti.API.info('value: ' + e.source.lastValue + " " + e.source.value);
                if (e.source.lastValue != e.source.value && e.source.value != '') {
                    
                    if(part == 'make'){
                        possibleValues = e.source.possibleValues;
                    }
                    else{
                        possibleValues = [];
                        //makeValue = 
                        makeValues = getFormFieldValues(e.source.real_field_name + '___make');
                        
                        if(typeof makeValues.dbValues !== 'undefined'){
                            
                            if(makeValues.dbValues[0] != ""){
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
                    
                    //var func = function setValueF(value_f, nid) {
                    //    e.source.value = value_f;
                    //    e.source.nid = nid;
                        //Ti.API.info('Value: ' + value_f + ' NID: ' + nid);
                    //};
    
                  
                    tableData = [];

                    for (i = 0; i < possibleValues.length; i++) {
                        
                        regEx = new RegExp(e.source.value, 'i');
                        if (possibleValues[i].search(regEx) != -1) {
                            //Check match
                            
                            //Create partial matching row
                            row = Ti.UI.createTableViewRow({
                                height : 40,
                                title : possibleValues[i],
                                color : '#000000',
                                autocomplete_table : e.source.autocomplete_table,
                                //setValueF : func,
                                textField : e.source
                            });
                            
                            // apply rows to data array
                            tableData.push(row);
                            //Ti.API.debug(tableData.length);
                            if(tableData.length >= 4){
                                break;
                            }
                        }
                    }
                    
                    e.source.autocomplete_table.setData(tableData);
                    //e.source.autocomplete_table.borderWidth = 1;
                    
                    
                    if (tableData.length == 0) {
                        e.source.autocomplete_table.setBorderWidth(0);
                        e.source.autocomplete_table.setHeight(0);
                        e.source.autocomplete_table.setVisible(false);
                    }
                    else{
                        e.source.autocomplete_table.setBorderWidth(1);
                        e.source.autocomplete_table.setHeight(40 * tableData.length);
                        e.source.autocomplete_table.setVisible(true);
                    }
                    
                    //e.source.autocomplete_table.scrollToTop(0, {
                    //    animated : false
                    //});
                    
                    //viewContent.scrollTo(0, e.source.regionView.top + e.source.top - ((PLATFORM == 'android') ? heightTextField : heightValue));
    
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
            // changedContentValue(e.source);
            // noDataChecboxEnableDisable(e.source, e.source.reffer_index);
        });
        
        wrapper = Ti.UI.createView({
           width: '100%',
           height: Ti.UI.SIZE,
           layout: 'vertical'
        });
        
        wrapper.add(widgetView);
        wrapper.add(autocomplete_table);
        
        return wrapper;

    }
};





//var reffer_index = count;
// var fi_name = field_arr[index_label][index_size].field_name;
// fi_name = fi_name.split('___');
// if (fi_name[1]) {
    // var i_name = fi_name[1];
// }
// else {
    // var i_name = fi_name[0];
// }
// i_name = i_name.charAt(0).toUpperCase() + i_name.slice(1);
// 
// if (i_name == "Make") {
    // var _make_ref = reffer_index;
// }
// label[count].text += (' ' + i_name);
//Add fields:
//regionView.add(label[count]);


//else {
    // var vl_to_field = field_arr[index_label][index_size].actual_value;
    // var data_terms = new Array();
// 
    // if (i_name == "Make") {
        // var aux_dt = db_display.execute("SELECT DISTINCT make FROM _vehicles");
        // var keep_from_make = vl_to_field;
// 
        // while (aux_dt.isValidRow()) {
            // data_terms.push(aux_dt.fieldByName("make"));
            // aux_dt.next();
        // }
    // }
    // else {
        // data_terms = get_models(keep_from_make);
    // }

    // content[count] = Ti.UI.createTextField({
        // hintText : field_arr[index_label][index_size].label + " " + i_name,
        // fantasy_name : i_name,
        // borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        // textAlign : 'left',
        // width : Ti.Platform.displayCaps.platformWidth - 30,
        // height : (PLATFORM == 'android') ? heightTextField : heightValue,
        // font : {
            // fontSize : fieldFontSize
        // },
        // color : '#000000',
        // top : top,
        // field_type : field_arr[index_label][index_size].type,
        // field_name : field_arr[index_label][index_size].field_name,
        // required : field_arr[index_label][index_size].required,
        // is_title : field_arr[index_label][index_size].is_title,
        // composed_obj : false,
        // cardinality : settings.cardinality,
        // value : vl_to_field,
        // reffer_index : reffer_index,
        // make_ind : _make_ref,
        // terms : data_terms,
        // //first_time : true,
        // lastValue : vl_to_field,
        // _make : keep_from_make,
        // settings : settings,
        // changedFlag : 0,
        // i_name : i_name,
        // my_index : count,
        // autocorrect : false,
        // returnKeyType : Ti.UI.RETURNKEY_DONE,
        // enabled : can_edit,
        // editable : can_edit,
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
    // //AUTOCOMPLETE TABLE FOR vehicle_fields fields
    // var autocomplete_table = Titanium.UI.createTableView({
        // top : top + ((PLATFORM == 'android') ? heightTextField - 10 : heightValue),
        // searchHidden : true,
        // zIndex : 15,
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
    // // TABLE EVENTS for vehicle_fields fields, cardinality == 1
    // //
    // content[count].autocomplete_table.addEventListener('click', function(e) {
        // if (PLATFORM != 'android') {
            // e.source.textField.value = e.rowData.title;
        // }
        // else {
            // e.source.setValueF(e.rowData.title);
        // }
// 
        // setTimeout(function() {
            // e.source.autocomplete_table.visible = false;
            // e.source.autocomplete_table.borderWidth = 0;
            // Ti.API.info(e.rowData.title + ' was selected!');
        // }, 80);
    // });
// 
    // content[count].addEventListener('blur', function(e) {
        // e.source.autocomplete_table.visible = false;
        // e.source.autocomplete_table.borderWidth = 0;
    // });
// 
    // content[count].addEventListener('focus', function(e) {
        // adjustView(e.source.my_index, e.source.regionView.top + e.source.top - ((PLATFORM == 'android') ? heightTextField : heightValue));
        // if (e.source.fantasy_name == "Model") {
            // Ti.API.info(content[e.source.make_ind].value);
// 
            // if (content[e.source.make_ind].value == e.source._make) {
                // Ti.API.info('User didn\'t change make');
            // }
            // else {
                // Ti.API.info('Make changed, reloading list')
                // e.source._make = content[e.source.make_ind].value;
                // e.source.terms = get_models(content[e.source.make_ind].value);
                // e.source.value = null;
                // //e.source.first_time = true;
            // }
        // }
    // });
    // //
    // // SEARCH EVENTS vehicle_fields, cardinality == 1
    // //
    // content[count].addEventListener('change', function(e) {
        // if (e.source.i_name == 'Make') {
            // if (e.source.value.length > 18) {
                // e.source.value = e.source.value.substr(0, 18);
            // }
        // }
        // else if (e.source.i_name == 'Model') {
            // if (e.source.value.length > 38) {
                // e.source.value = e.source.value.substr(0, 38);
            // }
        // }
        // changedContentValue(e.source);
        // noDataChecboxEnableDisable(e.source, e.source.reffer_index);
// 
        // if (e.source.lastValue != e.source.value) {
            // var list = e.source.terms;
            // var func = function setValueF(value_f) {
                // e.source.value = value_f;
                // Ti.API.info('Value: ' + value_f);
            // };
// 
            // if ((e.value != null) && (e.value != '')) {
                // table_data = [];
                // var i;
                // for ( i = 0; i < list.length; i++) {
                    // var rg = new RegExp(e.source.value, 'i');
                    // if (list[i].search(rg) != -1) {
// 
                        // //Create partial matching row
                        // var row = Ti.UI.createTableViewRow({
                            // height : getScreenHeight() * 0.10,
                            // title : list[i],
                            // color : '#000000',
                            // autocomplete_table : e.source.autocomplete_table,
                            // setValueF : func,
                            // textField : e.source
                        // });
                        // // apply rows to data array
                        // table_data.push(row);
                    // }
                // }
                // e.source.autocomplete_table.setData(table_data);
                // e.source.autocomplete_table.height = getScreenHeight() * 0.3;
                // e.source.autocomplete_table.borderWidth = 1;
                // if (table_data.lenth == 0) {
                    // e.source.autocomplete_table.borderWidth = 0;
                // }
                // if (table_data.length < 3 && table_data.length > 0) {
                    // e.source.autocomplete_table.height = (table_data.length == 1) ? getScreenHeight() * 0.1 : getScreenHeight() * 0.2;
                // }
                // e.source.autocomplete_table.scrollToTop(0, {
                    // animated : false
                // });
                // viewContent.scrollTo(0, (e.source.regionView.top + e.source.top - ((PLATFORM == 'android') ? heightTextField : heightValue)));
                // if (table_data.length > 0) {
                    // e.source.autocomplete_table.visible = true;
                // }
                // else {
                    // e.source.autocomplete_table.visible = false;
                // }
            // }
            // else {
                // e.source.autocomplete_table.visible = false;
            // }
        // }
// 
        // //e.source.first_time = false;
        // e.source.lastValue = e.source.value;
    // });
    // //Add fields:
    // regionView.add(content[count]);
    // count++;
// 
// //}
// //No data checkbox functionality
// // if (settings.parts != null && settings.parts != "") {
    // // partsArr.push(reffer_index);
    // // if (partsArr.length == 2) {
        // // content[reffer_index].partsArr = partsArr;
        // // partsArr = [];
        // // noDataCheckbox(reffer_index, regionView, top);
        // // if (content[reffer_index].noDataView != null) {
            // // top += 40;
        // // }
    // // }
// // }
// // 
// // break;
// 
//                             
//                             
//                             
