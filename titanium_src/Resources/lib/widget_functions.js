 
 Omadi.widget = Omadi.widget || {};
 
 
 
 
 
 
 
 
 
// 
// Omadi.widget.taxonomy_term_reference = function(label, instance, defaultValue){"use strict";
//     
    // /*jslint vars: true, eqeq:true, nomen: true*/
//    
    // var widget = instance.widget;
    // var settings = instance.settings;
    // var can_view = false;
    // var can_edit = false;
    // var i, j;
    // var roles = Ti.App.Properties.getObject('userRoles', {});
    // var isRequired = instance.required;
//     
    // var _lb_color = '#246';
    // var fieldFontSize = '15dp';
//     
    // var count = label.length;
//     
    // if (settings.enforce_permissions != null && settings.enforce_permissions == 1) {
        // for (i in settings.permissions) {
            // if(settings.permissions.hasOwnProperty(i)){
                // for (j in roles) {
                    // if(roles.hasOwnProperty(j)){
                        // if (i == j) {
                            // var stringifyObj = JSON.stringify(settings.permissions[i]);
                            // if (stringifyObj.indexOf('update') >= 0 || settings.permissions[i].all_permissions) {
                                // can_edit = true;
                            // }
//                 
                            // if (stringifyObj.indexOf('view') >= 0 || settings.permissions[i].all_permissions) {
                                // can_view = true;
                            // }
                        // }
                    // }
                // }
            // }
        // }
    // }
    // else {
        // can_view = can_edit = true;
    // }
//     
    // if (!can_view) {
        // return;
    // }
//     
//     
    // var hasParent = false;
    // var parent_name = "";
    // var defaultField = "";
    // if (settings.parent_form_default_value) {
        // if (settings.parent_form_default_value.parent_field != null && settings.parent_form_default_value.parent_field != "") {
            // hasParent = true;
            // parent_name = settings.parent_form_default_value.parent_field;
            // defaultField = settings.parent_form_default_value.default_value_field;
        // }
    // }
//     
    // //Create picker list
    // if (widget.type == 'options_select' || widget.type == 'violation_select') {
//     
    // label[count] = Ti.UI.createLabel({
        // text : ( isRequired ? '*' : '') + instance.label,
        // color : isRequired ? 'red' : _lb_color,
        // font : {
            // fontSize : fieldFontSize,
            // fontWeight : 'bold'
        // },
        // textAlign : 'left',
        // width : Ti.Platform.displayCaps.platformWidth - 30,
        // touchEnabled : false,
        // height : heightValue,
        // top : top
    // });
//     
    // top += heightValue;
    // var reffer_index = count;
//     
    // var vocabulary = db_display.execute("SELECT vid FROM vocabulary WHERE machine_name = '" + settings.vocabulary + "'");
    // var terms = db_display.execute("SELECT * FROM term_data WHERE vid='" + vocabulary.fieldByName('vid') + "'GROUP BY name ORDER BY CAST(`weight` AS INTEGER) ASC");
//     
    // var data_terms = [];
    // if (settings.cardinality != -1) {
        // // data_terms.push({
        // // title : field_arr[index_label][index_size].label,
        // // tid : null
        // // });
    // }
//     
    // while (terms.isValidRow()) {
        // data_terms.push({
            // title : terms.fieldByName('name'),
            // tid : terms.fieldByName('tid')
        // });
        // terms.next();
    // }
    // terms.close();
    // vocabulary.close();
//     
    // //Add fields:
    // regionView.add(label[count]);
//     
    // Ti.API.info('===> ' + settings.cardinality);
//     
    // if (settings.cardinality > 1) {
        // if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
            // var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');
//     
            // //Decode the stored array:
            // var decoded = array_cont.fieldByName('encoded_array');
            // decoded = Base64.decode(decoded);
            // Ti.API.info('Decoded array is equals to: ' + decoded);
            // decoded = decoded.toString();
//     
            // // Token that splits each element contained into the array: 'j8Oc2s1E'
            // var decoded_values = decoded.split("j8Oc2s1E");
        // }
        // else {
            // var decoded_values = new Array();
            // decoded_values[0] = field_arr[index_label][index_size].actual_value;
        // }
//     
        // var o_index;
        // for ( o_index = 0; o_index < settings.cardinality; o_index++) {
//     
            // if ((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
                // var vl_to_field = decoded_values[o_index];
            // }
            // else {
                // var vl_to_field = "";
            // }
//     
            // var arr_picker = new Array();
            // var arr_opt = new Array();
            // arr_picker.push({
                // title : '-- NONE --',
                // uid : null
            // });
            // arr_opt.push('-- NONE --');
//     
            // var aux_val = {
                // title : '-- NONE --',
                // vl : null,
                // cnt : 0
            // };
//     
            // var counter_loop = 0;
            // var i_data_terms;
            // for (i_data_terms in data_terms) {
                // if (vl_to_field == data_terms[i_data_terms].tid) {
                    // aux_val.title = data_terms[i_data_terms].title;
                    // aux_val.vl = data_terms[i_data_terms].tid;
                    // aux_val.cnt = counter_loop;
                // }
                // arr_picker.push({
                    // title : data_terms[i_data_terms].title,
                    // tid : data_terms[i_data_terms].tid
                // });
                // arr_opt.push(data_terms[i_data_terms].title);
                // counter_loop++;
            // }
//     
            // content[count] = Titanium.UI.createButton({
                // borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                // private_index : o_index,
                // width : Ti.Platform.displayCaps.platformWidth - 30,
                // height : heightValue,
                // arr_opt : arr_opt,
                // arr_picker : arr_picker,
                // title : aux_val.title,
                // font : {
                    // fontSize : fieldFontSize
                // },
                // color : '#000000',
                // top : top,
                // selectionIndicator : true,
                // field_type : field_arr[index_label][index_size].type,
                // field_name : field_arr[index_label][index_size].field_name,
                // machine_name : vocabulary.fieldByName('machine_name'),
                // widget : 'options_select',
                // widgetObj : widget,
                // required : field_arr[index_label][index_size].required,
                // is_title : field_arr[index_label][index_size].is_title,
                // value : aux_val.vl,
                // composed_obj : true,
                // cardinality : settings.cardinality,
                // reffer_index : reffer_index,
                // hasParent : hasParent,
                // parent_name : parent_name,
                // defaultField : defaultField,
                // settings : settings,
                // changedFlag : 0,
                // enabled : can_edit
            // });
            // var desLabel = Ti.UI.createLabel({
                // top : (top + heightValue),
                // width : Ti.Platform.displayCaps.platformWidth - 30,
                // ellipsize : true,
                // wordWrap : false,
                // visible : false,
                // font : {
                    // fontsize : 10
                // },
                // color : 'black',
                // height : 20
//     
            // });
            // content[count].desLabel = desLabel;
            // desLabel.addEventListener('click', function(e) {
                // openBigText(e.source.text);
            // });
            // if (PLATFORM == 'android') {
                // content[count].backgroundImage = '';
                // content[count].backgroundColor = 'white';
                // content[count].backgroundSelectedColor = '#2E64FE';
                // content[count].borderColor = 'gray';
                // content[count].borderRadius = 10;
                // content[count].color = 'black';
                // content[count].borderWidth = 1;
            // }
            // if (!can_edit) {
                // content[count].backgroundImage = '';
                // content[count].backgroundColor = '#BDBDBD';
                // content[count].borderColor = 'gray';
                // content[count].borderRadius = 10;
                // content[count].color = '#848484';
                // content[count].borderWidth = 1;
            // }
            // content[count].addEventListener('click', function(e) {
                // //Ti.API.info('TID: '+e.row.tid);
                // //e.source.value = e.row.tid;
                // if (e.source.arr_opt.length == 1) {
                    // var dt = new Date(e.source.violation_time);
                    // alert("No violations should be enforced at " + e.source.omadi_reference_title + " at " + date(omadi_time_format, dt) + " on " + weekday[dt.getDay()]);
                    // return;
                // }
                // var postDialog = Titanium.UI.createOptionDialog();
                // postDialog.options = e.source.arr_opt;
                // postDialog.cancel = -1;
                // postDialog.show();
//     
                // postDialog.addEventListener('click', function(ev) {
                    // if (ev.index >= 0) {
                        // e.source.title = e.source.arr_opt[ev.index];
                        // e.source.value = e.source.arr_picker[ev.index].tid;
                    // }
                    // changedContentValue(e.source);
                    // noDataChecboxEnableDisable(e.source, e.source.reffer_index);
//     
                // });
            // });
//     
            // top += heightValue;
//     
            // //Add fields:
            // regionView.add(desLabel);
            // regionView.add(content[count]);
            // count++;
        // }
    // }
    // else if (settings.cardinality == 1) {
//     
        // var arr_picker = new Array();
        // var arr_opt = new Array();
        // arr_picker.push({
            // title : '-- NONE --',
            // uid : null
        // });
        // arr_opt.push('-- NONE --');
//     
        // var aux_val = {
            // title : '-- NONE --',
            // vl : null,
            // cnt : 0
        // };
//     
        // var counter_loop = 0;
        // var i_data_terms;
        // for (i_data_terms in data_terms) {
            // if (field_arr[index_label][index_size].actual_value == data_terms[i_data_terms].tid) {
                // aux_val.title = data_terms[i_data_terms].title;
                // aux_val.vl = data_terms[i_data_terms].tid;
                // aux_val.cnt = counter_loop;
            // }
            // arr_picker.push({
                // title : data_terms[i_data_terms].title,
                // tid : data_terms[i_data_terms].tid
            // });
            // arr_opt.push(data_terms[i_data_terms].title);
            // counter_loop++;
        // }
//     
        // content[count] = Titanium.UI.createButton({
            // borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            // width : Ti.Platform.displayCaps.platformWidth - 30,
            // height : heightValue,
            // arr_opt : arr_opt,
            // arr_picker : arr_picker,
            // title : aux_val.title,
            // font : {
                // fontSize : fieldFontSize
            // },
            // color : '#000000',
            // top : top,
            // selectionIndicator : true,
            // field_type : field_arr[index_label][index_size].type,
            // field_name : field_arr[index_label][index_size].field_name,
            // machine_name : vocabulary.fieldByName('machine_name'),
            // widget : 'options_select',
            // widgetObj : widget,
            // required : field_arr[index_label][index_size].required,
            // is_title : field_arr[index_label][index_size].is_title,
            // composed_obj : false,
            // cardinality : settings.cardinality,
            // value : aux_val.vl,
            // reffer_index : reffer_index,
            // hasParent : hasParent,
            // parent_name : parent_name,
            // defaultField : defaultField,
            // settings : settings,
            // changedFlag : 0,
            // enabled : can_edit
        // });
        // var desLabel = Ti.UI.createLabel({
            // top : (top + heightValue),
            // width : Ti.Platform.displayCaps.platformWidth - 30,
            // ellipsize : true,
            // wordWrap : false,
            // visible : false,
            // font : {
                // fontsize : 10
            // },
            // color : 'black',
            // height : 20
//     
        // });
        // content[count].desLabel = desLabel;
        // desLabel.addEventListener('click', function(e) {
            // openBigText(e.source.text);
        // });
        // if (PLATFORM == 'android') {
            // content[count].backgroundImage = '';
            // content[count].backgroundColor = 'white';
            // content[count].backgroundSelectedColor = '#2E64FE';
            // content[count].borderColor = 'gray';
            // content[count].borderRadius = 10;
            // content[count].color = 'black';
            // content[count].borderWidth = 1;
        // }
        // if (!can_edit) {
            // content[count].backgroundImage = '';
            // content[count].backgroundColor = '#BDBDBD';
            // content[count].borderColor = 'gray';
            // content[count].borderRadius = 10;
            // content[count].color = '#848484';
            // content[count].borderWidth = 1;
        // }
//     
        // content[count].addEventListener('click', function(e) {
            // //Ti.API.info('TID: '+e.row.tid);
            // //e.source.value = e.row.tid;
            // if (e.source.arr_opt.length == 1) {
                // var dt = new Date(e.source.violation_time);
                // alert("No violations should be enforced at " + e.source.omadi_reference_title + " at " + date(omadi_time_format, dt) + " on " + weekday[dt.getDay()]);
                // return;
            // }
//     
            // var postDialog = Titanium.UI.createOptionDialog();
            // postDialog.options = e.source.arr_opt;
            // postDialog.cancel = -1;
            // postDialog.show();
//     
            // postDialog.addEventListener('click', function(ev) {
                // if (ev.index >= 0) {
                    // e.source.title = e.source.arr_opt[ev.index];
                    // e.source.value = e.source.arr_picker[ev.index].tid;
                // }
                // changedContentValue(e.source);
                // noDataChecboxEnableDisable(e.source, e.source.reffer_index);
//     
            // });
        // });
        // top += heightValue;
//     
        // //Add fields:
        // regionView.add(desLabel);
        // regionView.add(content[count]);
        // count++;
    // }
    // else if (settings.cardinality == -1) {
        // var sel_text = "";
        // var _val_itens = [];
        // var _itens = "";
        // var _exist = [];
//     
        // if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
            // var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');
//     
            // //Decode the stored array:
            // var decoded = array_cont.fieldByName('encoded_array');
            // decoded = Base64.decode(decoded);
            // Ti.API.info('Decoded array is equals to: ' + decoded);
            // decoded = decoded.toString();
//     
            // // Token that splits each element contained into the array: 'j8Oc2s1E'
            // var decoded_values = decoded.split("j8Oc2s1E");
        // }
        // else {
            // var decoded_values = new Array();
            // decoded_values[0] = field_arr[index_label][index_size].actual_value;
        // }
//     
        // var j_ind;
        // for (j_ind in data_terms) {
            // Ti.API.info(data_terms[j_ind].tid + ' = ' + decoded_values.indexOf(data_terms[j_ind].tid.toString()));
//     
            // if (decoded_values.indexOf(data_terms[j_ind].tid.toString()) != -1) {
                // sel_text = data_terms[j_ind].title;
                // _val_itens.push({
                    // title : data_terms[j_ind].title,
                    // v_info : data_terms[j_ind].tid,
                    // is_set : true
                // });
//     
                // _exist.push({
                    // title : data_terms[j_ind].title,
                    // v_info : data_terms[j_ind].tid
                // });
//     
            // }
            // else {
                // _val_itens.push({
                    // title : data_terms[j_ind].title,
                    // v_info : data_terms[j_ind].tid,
                    // is_set : false
                // });
            // }
//     
        // }
//     
        // if (_exist.length > 1) {
            // sel_text = field_arr[index_label][index_size].label + " [" + _exist.length + "]"
        // }
        // _itens = _exist;
//     
        // if (_exist.length == 0) {
            // _itens = null;
        // }
//     
        // Ti.API.info("==>> " + _val_itens);
        // Ti.API.info("==>> " + _itens);
//     
        // content[count] = Titanium.UI.createLabel({
            // width : Ti.Platform.displayCaps.platformWidth - 30,
            // text : sel_text,
            // backgroundColor : "#FFF",
            // textAlign : "center",
            // height : heightValue,
            // font : {
                // fontSize : fieldFontSize
            // },
            // color : '#000000',
            // top : top,
            // field_type : field_arr[index_label][index_size].type,
            // field_name : field_arr[index_label][index_size].field_name,
            // machine_name : vocabulary.fieldByName('machine_name'),
            // widget : 'options_select',
            // widgetObj : widget,
            // required : field_arr[index_label][index_size].required,
            // is_title : field_arr[index_label][index_size].is_title,
            // composed_obj : false,
            // cardinality : settings.cardinality,
            // value : _itens,
            // itens : _val_itens,
            // view_title : field_arr[index_label][index_size].label,
            // reffer_index : reffer_index,
            // settings : settings,
            // changedFlag : 0,
            // can_edit : can_edit,
            // enabled : can_edit,
        // });
//     
        // var desLabel = Ti.UI.createLabel({
            // top : (top + heightValue),
            // width : Ti.Platform.displayCaps.platformWidth - 30,
            // ellipsize : true,
            // wordWrap : false,
            // visible : false,
            // font : {
                // fontsize : 10
            // },
            // color : 'black',
            // height : 20
//     
        // });
        // content[count].desLabel = desLabel;
        // desLabel.addEventListener('click', function(e) {
            // openBigText(e.source.text);
        // });
        // if (!can_edit) {
            // content[count].backgroundImage = '';
            // content[count].backgroundColor = '#BDBDBD';
            // content[count].borderColor = 'gray';
            // content[count].color = '#848484';
            // content[count].borderWidth = 1
        // }
//     
        // content[count].addEventListener('click', function(e) {
            // if (e.source.can_edit) {
                // var jsa;
                // for (jsa in e.source.itens) {
                    // Ti.API.info(jsa + ' = ' + e.source.itens[jsa].title);
                // }
                // if (e.source.itens.length == 0) {
                    // var dt = new Date(e.source.violation_time);
                    // alert("No violations should be enforced at " + e.source.omadi_reference_title + " at " + date(omadi_time_format, dt) + " on " + weekday[dt.getDay()]);
                    // return;
                // }
                // open_mult_selector(e.source);
                // changedContentValue(e.source);
                // noDataChecboxEnableDisable(e.source, e.source.reffer_index);
            // }
        // });
//     
        // top += heightValue + 20;
//     
        // //Add fields:
        // regionView.add(desLabel);
        // regionView.add(content[count]);
        // count++;
    // }
// };    
// 
// 
// 
