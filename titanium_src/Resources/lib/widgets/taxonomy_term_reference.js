/*jslint eqeq:true, plusplus: true*/
/*global PLATFORM,setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.taxonomy_term_reference = {
    
    // TODO: add autocomplete widget
    // TODO: add parent default value
    
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
       
        if(typeof instance.numVisibleFields === 'undefined'){
            
            if(settings.cardinality == -1){

                instance.numVisibleFields = 1;
            }
            else{
                instance.numVisibleFields = settings.cardinality;
            }
        }
        
        // Add the actual fields
        for(i = 0; i < instance.numVisibleFields; i ++){
            //widgetView = this._getUIComponent(instance); 
            element = Omadi.widgets.taxonomy_term_reference.getNewElement(node, instance,  i);
            instance.elements.push(element);
            fieldView.add(element);
            fieldView.add(Omadi.widgets.getSpacerView());
        }
       
       return fieldView;
    },
    getNewElement: function(node, instance, index){"use strict";
        
        var settings, widgetView, dbValue, textValue, i, options, textOptions;
        
        if(instance.settings.cardinality == -1){
            dbValue = [];
            textValue = '';
            if(typeof node[instance.field_name] !== 'undefined'){
                if(typeof node[instance.field_name].dbValues !== 'undefined'){
                    dbValue = node[instance.field_name].dbValues;
                }
                
                if(typeof node[instance.field_name].textValues !== 'undefined'){
                    textValue = node[instance.field_name].textValues;
                    if(textValue.length > 0){
                        textValue = textValue.join(', ');
                    }
                }
            }
        }
        else{
            dbValue = null;
            textValue = "";
            if(typeof node[instance.field_name] !== 'undefined'){
                if(typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined'){
                    dbValue = node[instance.field_name].dbValues[index];
                }
                
                if(typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[index] !== 'undefined'){
                    textValue = node[instance.field_name].textValues[index];
                }
            }
        }
        
        settings = instance.settings;
        Ti.API.debug("Creating taxonomy_term_reference field");
        
        options = Omadi.widgets.taxonomy_term_reference.getOptions(instance);
        
        widgetView = Titanium.UI.createButton({
            //borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            width : Ti.Platform.displayCaps.platformWidth - 30,
            options : options,
            title : textValue,
            height: 35,
            font : {
                fontSize : Omadi.widgets.fontSize
            },
            color : '#000000',
            selectionIndicator : true,
            backgroundGradient : {
                type : 'linear',
                startPoint : {
                    x : '50%',
                    y : '0%'
                },
                endPoint : {
                    x : '50%',
                    y : '100%'
                },
                colors : [{
                    color : '#f3f3f3',
                    offset : 0.0
                }, {
                    color : '#f9f9f9',
                    offset : 0.4
                }, {
                    color : '#bbb',
                    offset : 1.0
                }]
            },
            borderColor: '#999',
            borderRadius: 5,
            
            instance: instance,
            dbValue: dbValue,
            textValue: textValue,
            value : textValue,
            
            view_title : instance.label
        });
        
        if(instance.numVisibleFields > 1){
            widgetView.hintText = '#' + (index + 1) + " " + instance.label;
        }
        
        if(instance.can_edit){
            widgetView.addEventListener('click', function(e) {
                /*global setConditionallyRequiredLabels*/
                var i, postDialog, textOptions;
                
                if(instance.settings.cardinality == -1){
                    

                        //for (jsa in e.source.itens) {
                        //    Ti.API.info(jsa + ' = ' + e.source.itens[jsa].title);
                        //}
                        //if (e.source.itens.length == 0) {
                        //    var dt = new Date(e.source.violation_time);
                        //    alert("No violations should be enforced at " + e.source.omadi_reference_title + " at " + date(omadi_time_format, dt) + " on " + weekday[dt.getDay()]);
                         //   return;
                        //}
                        Omadi.widgets.getMultipleSelector(e.source);
                        //changedContentValue(e.source);
                        //noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                   
                }
                else{
                    //Ti.API.info('USPS: '+e.row.usps);
                    //e.source.value = e.row.usps;
                    textOptions = [];
        
                    for(i = 0; i < e.source.options.length; i ++){
                        textOptions.push(e.source.options[i].title);
                    }
                    
                    postDialog = Titanium.UI.createOptionDialog();
                    postDialog.options = textOptions;
                    postDialog.cancel = -1;
                    postDialog.widgetView = e.source;
                    postDialog.show();
        
                    postDialog.addEventListener('click', function(ev) {
                        if (ev.index >= 0) {
                            var textValue = ev.source.options[ev.index];
                            
                            if(textValue == '- None -'){
                                textValue = "";
                            }
                            ev.source.widgetView.textValue = textValue;
                            ev.source.widgetView.setTitle(textValue);
                            ev.source.widgetView.value = ev.source.widgetView.dbValue = ev.source.widgetView.options[ev.index].dbValue;
                        }
                        
                        if(ev.source.widgetView.check_conditional_fields.length > 0){
                
                            setConditionallyRequiredLabels(ev.source.widgetView.instance, ev.source.widgetView.check_conditional_fields);
                        }
                        //changedContentValue(e.source);
                        //noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                    });
                }
            });
        }
        

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
        
        return widgetView;

    },
    getOptions: function(instance){"use strict";
        var db, result, vid, options;
        db = Omadi.utils.openMainDatabase();
        
        result = db.execute("SELECT vid FROM vocabulary WHERE machine_name = '" + instance.settings.vocabulary + "'");
        vid = result.fieldByName('vid');
        result.close();
        
        result = db.execute("SELECT * FROM term_data WHERE vid='" + vid + "' GROUP BY name ORDER BY CAST(`weight` AS INTEGER) ASC");

        options = [];
        
        if(instance.settings.cardinality != -1 && instance.required == 0){
            options.push({
               title: '- None -',
               dbValue: null 
            });
        }
        
        while (result.isValidRow()) {
            options.push({
                title : result.fieldByName('name'),
                dbValue : result.fieldByName('tid')
            });
            result.next();
        }
        result.close();
        db.close();
        
        return options;
    }
};


    

// function setRulesField(select_content) {
    // if (select_content.rulesFieldArr != null && select_content.rulesFieldArr != "") {
        // var rulesFieldArr = select_content.rulesFieldArr;
        // if (rulesFieldArr.length > 0) {
            // var rulesFieldIdx;
            // for (rulesFieldIdx in rulesFieldArr) {
                // var rulesFieldContent = content[rulesFieldArr[rulesFieldIdx]];
                // setParticularRulesField(rulesFieldContent);
            // }
        // }
    // }
// }
// 
// function setParticularRulesField(rulesFieldContent) {
    // // Fatch violation list from database...
    // // var violations_terms = [];
    // // var descripitons = [];
    // // var fromViolationRules = false;
    // // var machine_name = rulesFieldContent['settings'].vocabulary;
    // // var omadi_reference_title = "";
    // // var violation_time = "";
    // // db_display = Omadi.utils.openMainDatabase();
// // 
    // // var violations_vocabulary = db_display.execute('SELECT vid from vocabulary WHERE machine_name="' + machine_name + '";');
    // // var violations_terms_rslt = db_display.execute('SELECT tid,name from term_data WHERE vid=' + violations_vocabulary.fieldByName('vid'));
    // // while (violations_terms_rslt.isValidRow()) {
        // // if (violations_terms[violations_terms_rslt.fieldByName('tid')] == null) {
            // // violations_terms[violations_terms_rslt.fieldByName('tid')] = new Array();
        // // }
        // // violations_terms[violations_terms_rslt.fieldByName('tid')].push({
            // // title : violations_terms_rslt.fieldByName('name'),
            // // tid : violations_terms_rslt.fieldByName('tid')
        // // });
        // // violations_terms_rslt.next();
    // // }
// 
    // if (rulesFieldContent['widgetObj']['rules_field_name'] != null && rulesFieldContent['widgetObj']['rules_violation_time_field_name'] != null && rulesFieldContent['widgetObj']['rules_field_name'] != "" && rulesFieldContent['widgetObj']['rules_violation_time_field_name'] != "") {
// 
        // //Fatch content object of rules_field_name & rules_violation_time_field_name
        // var entityArr = createEntityMultiple();
        // var rules_field_name = content[entityArr[rulesFieldContent['widgetObj']['rules_field_name']][0].reffer_index];
        // var rules_violation_time_field_name = content[entityArr[rulesFieldContent['widgetObj']['rules_violation_time_field_name']][0].reffer_index];
// 
        // if (rules_field_name.nid != null && rules_violation_time_field_name.value != null) {
            // omadi_reference_title = rules_field_name.value;
            // var table = db_display.execute('SELECT table_name FROM node WHERE nid = ' + rules_field_name.nid);
            // table = table.fieldByName('table_name');
// 
            // var data = db_display.execute('SELECT ' + rulesFieldContent['widgetObj']['rules_parent_field_name'] + ' FROM ' + table + ' WHERE nid=' + rules_field_name.nid);
            // data = data.fieldByName(rulesFieldContent['widgetObj']['rules_parent_field_name']);
            // data = JSON.parse(data);
            // var violation_timestamp = rules_violation_time_field_name.value;
            // violation_time = violation_timestamp;
            // var node_type = win.type;
// 
            // if (data != false && data != null && data != "" && data.length > 0) {
                // var tids = [];
                // var used_tids = [];
                // var all_others_row = [];
// 
                // var data_idx;
                // for (data_idx in data) {
                    // var data_row = data[data_idx];
                    // if (!isNaN(data_row['tid'])) {
                        // if (data_row['node_types'][node_type] != null && data_row['node_types'][node_type] != "") {
                            // if (rules_field_passed_time_check(data_row['time_rules'], violation_timestamp)) {
// 
                                // if (tids[data_row['tid']] == null) {
                                    // tids[data_row['tid']] = new Array();
                                // }
                                // tids[data_row['tid']].push(violations_terms[data_row['tid']][0]);
                            // }
                        // }
                        // if (used_tids[data_row['tid']] == null) {
                            // used_tids[data_row['tid']] = new Array();
                        // }
                        // used_tids[data_row['tid']].push(data_row['tid']);
                    // }
                    // else if (data_row['tid'] == 'ALL') {
                        // all_others_row.push(data_row);
                    // }
                    // if (descripitons[data_row['tid']] == null) {
                        // descripitons[data_row['tid']] = new Array();
                    // }
                    // descripitons[data_row['tid']].push(data_row['description']);
                // }
// 
                // if (all_others_row.length > 0) {
                    // if (all_others_row[0]['node_types'][node_type] != null && all_others_row[0]['node_types'][node_type] != "") {
                        // if (rules_field_passed_time_check(all_others_row[0]['time_rules'], violation_timestamp)) {
                            // var violations_term_idx;
                            // for (violations_terms_idx in violations_terms) {
                                // var violation_term = violations_terms[violations_terms_idx][0].tid;
                                // if (used_tids[violation_term] == null || used_tids[violation_term] == "") {
                                    // if (tids[violation_term] == null) {
                                        // tids[violation_term] = new Array();
                                    // }
                                    // tids[violation_term].push(violations_terms[violations_terms_idx][0]);
                                // }
                            // }
                        // }
                    // }
                // }
                // violations_terms = tids;
                // fromViolationRules = true;
            // }
        // }
// 
    // }
    // if (rulesFieldContent.settings.cardinality > 1) {
        // var o_index;
        // for ( o_index = 0; o_index < rulesFieldContent.settings.cardinality; o_index++) {
            // var arr_picker = new Array();
            // var arr_opt = new Array();
            // arr_picker.push({
                // title : '-- NONE --',
                // tid : null
            // });
            // arr_opt.push('-- NONE --');
            // var aux_val = {
                // title : '-- NONE --',
                // vl : null,
                // cnt : 0
            // };
// 
            // var i_data_terms;
            // for (i_data_terms in violations_terms) {
                // arr_picker.push({
                    // title : violations_terms[i_data_terms][0].title,
                    // tid : violations_terms[i_data_terms][0].tid,
                    // desc : description[violations_terms[i_data_terms][0].tid],
                // });
                // arr_opt.push(violations_terms[i_data_terms][0].title);
            // }
            // content[rulesFieldContent.reffer_index + o_index].arr_picker = arr_picker;
            // content[rulesFieldContent.reffer_index + o_index].arr_opt = arr_opt;
            // content[rulesFieldContent.reffer_index + o_index].title = aux_val.title;
            // content[rulesFieldContent.reffer_index + o_index].value = aux_val.value;
            // content[rulesFieldContent.reffer_index + o_index].omadi_reference_title = (arr_opt.length == 1) ? omadi_reference_title : "";
            // content[rulesFieldContent.reffer_index + o_index].violation_time = (arr_opt.length == 1) ? violation_time : "";
        // }
    // }
    // else if (rulesFieldContent.settings.cardinality == 1) {
        // var arr_picker = new Array();
        // var arr_opt = new Array();
        // arr_picker.push({
            // title : '-- NONE --',
            // tid : null
        // });
        // arr_opt.push('-- NONE --');
        // var aux_val = {
            // title : '-- NONE --',
            // vl : null,
            // cnt : 0
        // };
// 
        // var i_data_terms;
        // for (i_data_terms in violations_terms) {
            // arr_picker.push({
                // title : violations_terms[i_data_terms][0].title,
                // tid : violations_terms[i_data_terms][0].tid,
                // desc : description[violations_terms[i_data_terms][0].tid],
            // });
            // arr_opt.push(violations_terms[i_data_terms][0].title);
        // }
        // content[rulesFieldContent.reffer_index].arr_picker = arr_picker;
        // content[rulesFieldContent.reffer_index].arr_opt = arr_opt;
        // content[rulesFieldContent.reffer_index].title = aux_val.title;
        // content[rulesFieldContent.reffer_index].value = aux_val.value;
        // content[rulesFieldContent.reffer_index].omadi_reference_title = (arr_opt.length == 1) ? omadi_reference_title : "";
        // content[rulesFieldContent.reffer_index].violation_time = (arr_opt.length == 1) ? violation_time : "";
// 
    // }
    // else if (rulesFieldContent.settings.cardinality == -1) {
        // var sel_text = "";
        // var _val_itens = [];
        // var _itens = null;
        // var j_ind;
        // for (j_ind in violations_terms) {
            // _val_itens.push({
                // title : violations_terms[j_ind][0].title,
                // v_info : violations_terms[j_ind][0].tid,
                // desc : (descripitons[violations_terms[j_ind][0].tid] != null) ? descripitons[violations_terms[j_ind][0].tid][0] : null,
                // is_set : false
            // });
        // }
        // content[rulesFieldContent.reffer_index].text = sel_text;
        // content[rulesFieldContent.reffer_index].value = _itens;
        // content[rulesFieldContent.reffer_index].itens = _val_itens;
        // content[rulesFieldContent.reffer_index].desLabel.text = sel_text;
        // content[rulesFieldContent.reffer_index].from_cond_vs = fromViolationRules;
        // content[rulesFieldContent.reffer_index].omadi_reference_title = (_itens == null) ? omadi_reference_title : "";
        // content[rulesFieldContent.reffer_index].violation_time = (_itens == null) ? violation_time : "";
    // }
    // db_display.close();
// }
// 
// 
//                           
