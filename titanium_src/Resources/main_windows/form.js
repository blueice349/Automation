
Ti.include("/lib/widgets.js");

/*global Omadi*/
/*jslint eqeq: true, plusplus: true*/

Ti.API.info("Form Window Opened");

var fieldViews = {};
var instances = {};
var win = Ti.UI.currentWindow;
win.setBackgroundColor("#eee");
win.nodeSaved = false;
var formWrapperView, scrollView, scrollPositionY = 0;
var menu;
var fieldWrappers = {};
var regionViews = {};
var regions = {};
var node;
var cameraAndroid;
var wrapperView;
var isFormWindow = true;

if (Ti.App.isAndroid) {
    cameraAndroid = require('com.omadi.camera');
}


function cancelOpt() {"use strict";
    
    var dialog = Ti.UI.createAlertDialog({
        cancel : 1,
        buttonNames : ['Yes', 'No'],
        message : 'Are you sure you want to cancel and go back?',
        title : 'Cancel'
    });

    dialog.addEventListener('click', function(e) {
        if (e.index == 0) {
            var db_toDeleteImage = Omadi.utils.openMainDatabase();
            db_toDeleteImage.execute("DELETE FROM _photos WHERE nid=0;");
            db_toDeleteImage.close();
            
            Ti.UI.currentWindow.close();
        }
    });

    dialog.show(); 
}

function get_android_menu(menu_exists) {"use strict";
    /*jslint eqeq: true */
   /*global Omadi, save_form_data*/
   
    win.activity.onCreateOptionsMenu = function(e) {
        var db, result, menu_zero, bundle, btn_tt, btn_id, menu_first, menu_second, menu_third;
        btn_tt = [];
        btn_id = [];
    
        menu = e.menu;
        menu.clear();
        
        bundle = Omadi.data.getBundle(Ti.UI.currentWindow.type);
           
        if (bundle.data.form_parts != null && bundle.data.form_parts != "") {
            
            if (bundle.data.form_parts.parts.length >= node.form_part + 2) {
                menu_zero = menu.add({
                    title : "Save + " + bundle.data.form_parts.parts[node.form_part + 1].label,
                    order : 0
                });
                menu_zero.setIcon("/images/drop.png");
                menu_zero.addEventListener("click", function(ev) {
                   
                    save_form_data('next_part');
                });
            }
        }
        
    
        btn_tt.push('Save');
        btn_tt.push('Save as Draft');
        btn_tt.push('Cancel');
    
        menu_first = menu.add({
            title : 'Save',
            order : 1
        });
        menu_first.setIcon("/images/save.png");
    
        menu_second = menu.add({
            title : 'Save as Draft',
            order : 2
        });
        menu_second.setIcon("/images/drafts_android.png");
    
        menu_third = menu.add({
            title : 'Cancel',
            order : 3
        });
        menu_third.setIcon("/images/cancel.png");
    
        //======================================
        // MENU - EVENTS
        //======================================
        menu_first.addEventListener("click", function(e) {
            save_form_data('normal');
        });
    
        menu_second.addEventListener("click", function(e) {
           
            save_form_data('draft');
        });
    
        menu_third.addEventListener("click", function(e) {
            cancelOpt();
        });
    };
}

function getNewNode(){"use strict";

    var node = {};
    
    if(typeof Ti.UI.currentWindow.node !== 'undefined'){
        node = Ti.UI.currentWindow.node;
        Ti.API.debug("node exists in window: " + node.nid);
    }
    else{
        node.created = Omadi.utils.getUTCTimestamp();
        node.author_uid = Omadi.utils.getUid();
        node.form_part = 0;
    }
    
    node.nid = Ti.UI.currentWindow.nid;
    node.type = Ti.UI.currentWindow.type;
    
    node.changed = Omadi.utils.getUTCTimestamp();
    node.changed_uid = Omadi.utils.getUid();
    
    return node;
}


function formToNode(){"use strict";
    /*global fieldViews*/
   
   var field_name, fieldWrapper, instance, node;
   
   node = getNewNode();
   
   node.no_data = "";
   //node.title = "";
   
   try{
       
       Ti.API.info("CONVERTING TO NODE");
       
       for(field_name in fieldWrappers){//} = 0; i < fieldWrappers.length; i ++){
           if(fieldWrappers.hasOwnProperty(field_name)){
               fieldWrapper = fieldWrappers[field_name];
               instance = fieldWrapper.instance;
               
               node[instance.field_name] = {};
               node[instance.field_name].dbValues = Omadi.widgets.getDBValues(fieldWrapper);
               node[instance.field_name].textValues = Omadi.widgets.getTextValues(fieldWrapper);
               
               //Ti.API.debug(JSON.stringify(getDBValues(fieldWrapper)));
           }
       }
   }
   catch(ex){
       Omadi.service.sendErrorReport("Bundling node from form: " + ex);
       alert("There was a problem bundling the submitted data. The cause of the error was sent for analysis.");
   }
   
   return node;
}

function validateMinLength(node, instance){"use strict";
    var minLength, form_errors = [], i;
    
    if (node[instance.field_name].dbValues.length > 0) {
        if (instance.settings.min_length != null) {
            minLength = parseInt(instance.settings.min_length, 10);
            if(minLength >= 0){
                for(i = 0; i < node[instance.field_name].dbValues.length; i ++){
                    if(node[instance.field_name].dbValues[i] !== null && node[instance.field_name].dbValues[i] > ''){
                        if (node[instance.field_name].dbValues[i].length < minLength) {
                            form_errors.push(instance.label + " requires at least " + minLength + " characters");
                        }  
                    }
                }
            }
        }
    }
    
    
    return form_errors;
}

function validateMaxLength(node, instance){"use strict";
    var maxLength, form_errors = [], i;
    
    if (node[instance.field_name].dbValues.length > 0) {
        if (instance.settings.max_length != null) {
            maxLength = parseInt(instance.settings.max_length, 10);
            if(maxLength >= 0){
                for(i = 0; i < node[instance.field_name].dbValues.length; i ++){
                    if (node[instance.field_name].dbValues[i].length > maxLength) {
                        form_errors.push(instance.label + " cannot have more than " + maxLength + " characters.");
                    }  
                }
            }
        }
    }
    
    
    return form_errors;
}

function validateMaxValue(node, instance){"use strict";
    var maxValue, absoluteMaxValue, form_errors = [], i;
    
    absoluteMaxValue = (instance.type == 'number_integer') ? 2147483647 : 99999999;
    
    if (node[instance.field_name].dbValues.length > 0) {
        if (instance.settings.max != null && instance.settings.max.length > 0) {
            maxValue = parseFloat(instance.settings.max);
            if(maxValue > absoluteMaxValue){
                maxValue = absoluteMaxValue;
            }
        }
        else{
            maxValue = absoluteMaxValue;
        }
        
        Ti.API.debug("Max value : " + maxValue);
        
        for(i = 0; i < node[instance.field_name].dbValues.length; i ++){
            if (node[instance.field_name].dbValues[i] !== null && node[instance.field_name].dbValues[i] > maxValue) {
                form_errors.push(instance.label + " cannot be greater than " + maxValue + ".");
            }  
        }
    }
    
    return form_errors;
}

function validateMinValue(node, instance){"use strict";
    var minValue, absoluteMinValue, form_errors = [], i;
    
    absoluteMinValue = (instance.type == 'number_integer') ? -2147483648 : -99999999;
    
    if (node[instance.field_name].dbValues.length > 0) {
        if (instance.settings.min != null && instance.settings.min.length > 0) {
            minValue = parseFloat(instance.settings.min);
            if(minValue < absoluteMinValue){
                minValue = absoluteMinValue;
            }
        }
        else{
            minValue = absoluteMinValue;
        }
        
        for(i = 0; i < node[instance.field_name].dbValues.length; i ++){
            if (node[instance.field_name].dbValues[i] !== null && node[instance.field_name].dbValues[i] < minValue) {
                form_errors.push(instance.label + " cannot be less than " + minValue + ".");
            }  
        }
    }
    
    return form_errors;
}

function validatePhone(node, instance){"use strict";
    var form_errors = [], i, regExp;
    
   
    
    if (node[instance.field_name].dbValues.length > 0) {
        
        for(i = 0; i < node[instance.field_name].dbValues.length; i ++){
            if (!Omadi.utils.isEmpty(node[instance.field_name].dbValues[i]) && !node[instance.field_name].dbValues[i].match(/\D*(\d*)\D*[2-9][0-8]\d\D*[2-9]\d{2}\D*\d{4}\D*\d*\D*/g)) {
                form_errors.push(instance.label + " is not a valid North American phone number. 10 digits are required.");
            }  
        }
    }
    
    return form_errors;
}

function validateEmail(node, instance){"use strict";
    
    var form_errors = [], i, regExp;
    
    if (node[instance.field_name].dbValues.length > 0) {
        
        for(i = 0; i < node[instance.field_name].dbValues.length; i ++){
            if (!Omadi.utils.isEmpty(node[instance.field_name].dbValues[i]) && !node[instance.field_name].dbValues[i].match(/^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,4}$/i)) {
                form_errors.push(instance.label + " is not a valid email address.");
            }  
        }
    }
    
    return form_errors;
}

// function validateURL(node, instance){"use strict";
    // //TODO: validate URLs
    // var form_errors = [], i, regExp;
//     
    // if (node[instance.field_name].dbValues.length > 0) {
//         
        // for(i = 0; i < node[instance.field_name].dbValues.length; i ++){
            // if (!Omadi.utils.isEmpty(node[instance.field_name].dbValues[i]) && !node[instance.field_name].dbValues[i].match(/^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,4}$/i)) {
                // form_errors.push(instance.label + " is not a valid email address.");
            // }  
        // }
    // }
//     
    // return form_errors;
// }

function validateRequired(node, instance){"use strict";
    var isEmpty, form_errors = [], dbValues = [], i;
    
    isEmpty = true;
            
    if(typeof node[instance.field_name].dbValues !== 'undefined' && node[instance.field_name].dbValues.length > 0){
        dbValues = node[instance.field_name].dbValues;
        for(i = 0; i < dbValues.length; i ++){
            
            
            switch(instance.type){
                case 'text':
                case 'text_long':
                case 'phone':
                case 'email':
                case 'link_field':
                case 'location':
                case 'vehicle_fields':
                case 'license_plate':
                case 'rules_field':
                    if(dbValues[i] > ""){
                        isEmpty = false;
                    }
                    break;
                    
                case 'number_integer':
                case 'number_decimal':
                case 'image':
                case 'datestamp':
                case 'omadi_time':
                    if(!Omadi.utils.isEmpty(dbValues[i])){
                        isEmpty = false;
                    }
                    break;
                
                case 'omadi_reference':
                case 'taxonomy_term_reference':
                case 'user_reference':
                case 'file':
                case 'auto_increment':
                    if(!Omadi.utils.isEmpty(dbValues[i]) && dbValues[i] != 0){
                        isEmpty = false;
                    }
                    break;
                    
                case 'list_boolean': 
                case 'calculation_field':
                    isEmpty = false;
                    break;
                
                default: 
                    Ti.API.error("Missing field type def in validate_form_data for field_name " + instance.field_name);
                    break;
            }
        }
    }
    
    if (((instance.is_title === true) || (instance.isRequired) || instance.isConditionallyRequired) && instance.can_view == true){
        
         if(isEmpty){
             if(instance.partLabel === null){
                 form_errors.push(instance.label + " is required");
             }
             else{
                 form_errors.push(instance.label + " " + instance.partLabel + " is required");
             }
         }
    }
    
    return form_errors;
}

function validateRestrictions(node){"use strict";
    var instances, query, db, result, timestamp, field_name, vin, license_plate, nid, restrictions, form_errors, i, account;
    
    restrictions = [];
    form_errors = [];
    
    // Only check on creation
    if(node.nid === 'new'){
    
        nid = null;
        vin = null;
        account = null;
        license_plate = null;
        
        if(typeof node.vin !== 'undefined' && typeof node.vin.dbValues !== 'undefined' && node.vin.dbValues.length > 0 && node.vin.dbValues[0] != null && node.vin.dbValues[0] != ""){
            vin = node.vin.dbValues[0].toUpperCase();
        }
        
        if(typeof node.license_plate___plate !== 'undefined' && typeof node.license_plate___plate.dbValues !== 'undefined' && node.license_plate___plate.dbValues.length > 0 && node.license_plate___plate.dbValues[0] != null && node.license_plate___plate.dbValues[0] != ""){
            license_plate = node.license_plate___plate.dbValues[0].toUpperCase();
        }
        
        if(typeof node.enforcement_account !== 'undefined' && typeof node.enforcement_account.dbValues !== 'undefined' && node.enforcement_account.dbValues.length > 0 && node.enforcement_account.dbValues[0] != null){
            nid = node.enforcement_account.dbValues[0];
            account = node.enforcement_account.textValues[0];
        }
        
        if(nid !== null && nid > 0){
            timestamp = Omadi.utils.getUTCTimestamp();
            
            query = 'SELECT restriction_license_plate___plate, vin, restrict_entire_account, restriction_start_date, restriction_end_date ';
            query += ' FROM restriction WHERE restriction_account="' + nid + '"';
            query += ' AND ((restriction_start_date < ' + timestamp + ' OR restriction_start_date IS NULL) ';
            query += ' AND (restriction_end_date > ' + timestamp + ' OR restriction_end_date IS NULL))';
            
            //Ti.API.error(query);
            
            db = Omadi.utils.openMainDatabase();
            result = db.execute(query);
        
            while (result.isValidRow()) {
                
                restrictions.push({
                    license_plate : result.fieldByName('restriction_license_plate___plate'),
                    restrict_entire_account : result.fieldByName('restrict_entire_account'),
                    startTime: result.fieldByName('restriction_start_date'),
                    endTime: result.fieldByName('restriction_end_date'),
                    vin : result.fieldByName('vin')
                });
                result.next();
            }
            result.close();
                
            for(i = 0; i < restrictions.length; i ++){
              // Ti.API.info(JSON.stringify(restrictions[i]));
                if(restrictions[i].restrict_entire_account == 1){
                    form_errors.push("No parking enforcement is allowed for \"" + account + "\" right now due to a restriction.");
                }
                else if(restrictions[i].license_plate != null && license_plate == restrictions[i].license_plate.toUpperCase()){
                    form_errors.push("The license plate \"" + license_plate + "\" is currently restricted for \"" + account + "\".");
                }
                else if(restrictions[i].vin != null && vin == restrictions[i].vin.toUpperCase()){
                    form_errors.push("The VIN \"" + vin + "\" is currently restricted for \"" + account + "\".");
                }
            }
            db.close();
        }
    }
    
    return form_errors;
}




function validate_form_data(node){"use strict";
    
    var field_name, instance, values, form_errors, isEmpty, i, region_name;
    
    form_errors = [];
    
    try{
        
        form_errors = form_errors.concat(validateRestrictions(node));
        // Only show restriction error if one exists
        if(form_errors.length == 0){
            
            for(field_name in instances){
                if(instances.hasOwnProperty(field_name)){
                    
                    instance = instances[field_name];
                    
                    region_name = instance.region;
                    
                    if(instance.disabled == 0 && typeof regionViews[region_name] !== 'undefined'){                
                        if(typeof node[field_name] !== 'undefined'){
                        
                            /*** REQUIRED FIELD VALIDATION / CONDITIONALLY REQUIRED ***/
                            form_errors = form_errors.concat(validateRequired(node, instance));
                            
                            /*** MIN_LENGTH VALIDATION ***/
                            switch(instance.type){
                                case 'text_long':
                                case 'text':
                                    form_errors = form_errors.concat(validateMinLength(node, instance));
                                    break;
                            }
                            
                            /*** MAX_LENGTH VALIDATION ***/
                            switch(instance.type){
                                case 'text':
                                    form_errors = form_errors.concat(validateMaxLength(node, instance));
                                    break;
                            }
                            
                            /*** MIN/MAX VALUE VALIDATION ***/
                            switch(instance.type){
                                case 'number_integer':
                                case 'number_decimal':
                                    form_errors = form_errors.concat(validateMinValue(node, instance));
                                    form_errors = form_errors.concat(validateMaxValue(node, instance));
                                    break;
                            }
                            
                            if(instance.type === 'phone'){
                                form_errors = form_errors.concat(validatePhone(node, instance));
                            }
                            
                            if(instance.type === 'email'){
                                form_errors = form_errors.concat(validateEmail(node, instance));
                            }
                        }
                    }
                }
            }
        }
    }
    catch(ex){
        Omadi.service.sendErrorReport("Exception in form validation: " + ex);
    }
    
    return form_errors;
}


function getRegionHeaderView(region, expanded){"use strict";
    
    var arrow_img, regionHeader, regionHeaderWrapper;
    
    arrow_img = Ti.UI.createImageView({
        image : '/images/light_arrow_left.png',
        width : 29,
        height : 29,
        top: 5,
        right: 5,
        zIndex : 999
    });
    
    if(expanded){
        arrow_img.image = '/images/light_arrow_down.png';
    }
    
    regionHeaderWrapper = Ti.UI.createView({
        height: Ti.UI.SIZE,
        width: '100%'
    });

    regionHeader = Ti.UI.createLabel({
        text : region.label.toUpperCase(),
        color : '#ddd',
        font : {
            fontSize : 18,
            fontWeight : 'bold'
        },
        textAlign : 'center',
        width : '100%',
        top: 0,
        height : 40,
        ellipsize : true,
        wordWrap : false,
        zIndex : 998,
        region_name: region.region_name,
        expanded: expanded,
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
                color : '#555',
                offset : 0.0
            }, {
                color : '#666',
                offset : 0.3
            }, {
                color : '#333',
                offset : 1.0
            }]
        }
    });
    
    regionHeader.arrow = arrow_img;
    
    regionHeader.addEventListener('click', function(e) {
        
        var regionView;
        
        e.source.expanded = !e.source.expanded;
        
        if (e.source.expanded === true) {
            
            regionView = regionViews[e.source.region_name];
            regionView.startLayout();
            regionView.show();
            regionView.setHeight(Ti.UI.SIZE);
            
            e.source.arrow.setImage("/images/light_arrow_down.png");
            
            regionView.finishLayout();
        }
        else {
            
            regionView = regionViews[e.source.region_name];
            regionView.startLayout();
            regionView.hide();
            regionView.setHeight(5);
            
            e.source.arrow.setImage("/images/light_arrow_left.png");
            
            regionView.finishLayout();
        }
    });
    
    regionHeaderWrapper.add(regionHeader);
    regionHeaderWrapper.add(arrow_img);
    
    return regionHeaderWrapper;
}


function save_form_data(saveType) {"use strict";
    /*jslint nomen: true*/
    var node, form_errors, string_text, string_err, count_fields, value_err, now, field_name, dialog,
        oldVal, file_upload_nid, has_bug, no_data_fields_content, instance, insertValues, mode_msg, 
        no_data_fields, db_put, need_at, quotes, nid, new_nid, query, _array_value, x_j, 
        title_to_node, j, field_names, content_s, value_to_insert, formWin;
    
    node = formToNode();
    
    Ti.API.debug("Saving with type " + saveType);
    
    if(saveType == 'draft'){
        node._isDraft = true;
    }
    else{
        node._isDraft = false;
    }
    
    node.viewed = Omadi.utils.getUTCTimestamp();
    
    form_errors = [];
    
    if(node._isDraft === false){
        form_errors = validate_form_data(node);
    }
    
    if(form_errors.length > 0){
        dialog = Titanium.UI.createAlertDialog({
            title : 'Form Validation',
            buttonNames : ['OK'],
            message: form_errors.join("\n")
        });
        
        dialog.show();
        //alert(form_errors.join("\n"));
    }
    else{
        //return;
        
        try{

            //TODO: fix the below
            /*else if (pass_it === false && Ti.App.Properties.getString("timestamp_offset") > OFF_BY) {
        
                var actual_time = Math.round(new Date().getTime() / 1000);
                actual_time = parseInt(actual_time) + parseInt(Ti.App.Properties.getString("timestamp_offset"));
        
                var server_time = new Date(actual_time);
        
            }*/
            
            Omadi.data.trySaveNode(node, saveType);
        }
        catch(ex){
            alert("Saving to mobile database: " + ex);
        }
        
        Omadi.display.doneLoading();
    }
}




function addiOSToolbar() {"use strict";
    /*jslint eqeq: true, vars: true*/
   /*global Omadi*/
    
    try {
        
        var back = Ti.UI.createButton({
            title : 'Back',
            style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
        });
        back.addEventListener('click', function() {
            cancelOpt();
        });

        var space = Titanium.UI.createButton({
            systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
        });
        
        var icon = Ti.UI.createImageView({
            image: Omadi.display.getNodeTypeImagePath(win.type),
            height: 30,
            width: 30
        });
        
        var bundle = Omadi.data.getBundle(node.type);
        
        var labelScrollView = Ti.UI.createScrollView({
            layout: 'horizontal',
            width: Ti.UI.FILL,
            height: Ti.UI.SIZE
        });
        
        var label = Titanium.UI.createButton({
            title : (node.nid == 'new' ? 'New ' : 'Update ') + bundle.label,
            right: 5,
            font: {
                fontWeight: 'bold'
            },
           //width : 200,
            style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
        });
        
        
        labelScrollView.add(label);
        labelScrollView.add(icon);
        
        if(Ti.Platform.osname == 'ipad'){
            label.color = '#666';
        }
        else{
            label.color = '#fff';   
        }

        var actions = Ti.UI.createButton({
            title : 'Actions',
            style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
        });

        actions.addEventListener('click', function(e) {
            var bundle;
            
            if(typeof Omadi.widgets.currentlyFocusedField !== 'undefined'){
                Omadi.widgets.currentlyFocusedField.blur();
            }
            
            bundle = Omadi.data.getBundle(node.type);
            var btn_tt = [];
            var btn_id = [];

            btn_tt.push('Save');

            //Ti.API.info('BUNDLE: ' + JSON.stringify(node));

            if (bundle.data.form_parts != null && bundle.data.form_parts != "") {
                //Ti.API.info('Form table part = ' + bundle.data.form_parts.parts.length);
                if (bundle.data.form_parts.parts.length >= node.form_part + 2) {
                    //Ti.API.info("<<<<<<<------->>>>>>> Title = " + bundle.data.form_parts.parts[node.form_part + 1].label);
                    btn_tt.push("Save + " + bundle.data.form_parts.parts[node.form_part + 1].label);
                    btn_id.push(node.form_part + 1);
                }
            }
           
            btn_tt.push('Save as Draft');
            btn_tt.push('Cancel');

            var postDialog = Titanium.UI.createOptionDialog();
            postDialog.options = btn_tt;
            postDialog.show();

            postDialog.addEventListener('click', function(ev) {
                
                if(Ti.UI.currentWindow.nodeSaved === false){
                    if (btn_tt.length == 4) {
                        if (ev.index == 1) {
                            save_form_data('next_part');
                        }
                        else if (ev.index == 0) {
                            save_form_data('normal');
                        }
                        else if (ev.index == 2) {
                            save_form_data('draft');
                        }
                    }
                    else {
                        if (ev.index == 0) {
                            save_form_data('normal');
                        }
                        else if (ev.index == 1) {
                            save_form_data('draft');
                        }
                    }
                }
                else{
                    alert("The form data was saved correctly, but this screen didn't close for some reason. You can exit safely. Please report what you did to get this screen.");
                }
            });
        });

        // create and add toolbar
        var toolbar = Ti.UI.iOS.createToolbar({
            items : [back, space, labelScrollView, space, actions],
            top : 0,
            borderTop : false,
            borderBottom : false,
            height: Ti.UI.SIZE
        });
        
        wrapperView.add(toolbar);
        
    }
    catch(evt) {
        Ti.API.error("TOP BAR ERROR = " + evt);
    }
}

function changeViolationFieldOptions(violation_field_name){"use strict";
    var db, result, options, textOptions, i, j, violation_instance, parentNid, parentNidDBValues, reference_field_name, 
        rules_parent_field_name, parentNodeType, rulesData, dataRow, node_type, tids, used_tids, all_others_row,
        rules_violation_time_field_name, violationTimestampValues, violation_timestamp, violationTerms, violation_term, 
        descriptions, violationDBValues, isViolationValid, textValues, violationTextValues;
    
    /*global rules_field_passed_time_check*/
    
    node_type = Ti.UI.currentWindow.type;
    
    violation_instance = instances[violation_field_name];
    
    options = Omadi.widgets.taxonomy_term_reference.getOptions(violation_instance);
    
    violationTerms = [];
    for(i = 0; i < options.length; i ++){
        violationTerms[options[i].dbValue] = options[i];
    }

    db = Omadi.utils.openMainDatabase();
    
    reference_field_name = violation_instance.widget.rules_field_name;
    rules_parent_field_name = violation_instance.widget.rules_parent_field_name;
    rules_violation_time_field_name = violation_instance.widget.rules_violation_time_field_name;
    
    parentNidDBValues = Omadi.widgets.getDBValues(fieldWrappers[reference_field_name]);
    
    violationTimestampValues = Omadi.widgets.getDBValues(fieldWrappers[rules_violation_time_field_name]);
    
    violation_timestamp = null;
    if(violationTimestampValues.length > 0){
        violation_timestamp = violationTimestampValues[0];
    }
    
    descriptions = [];
    //Ti.API.error(violation_timestamp);
    
    if(parentNidDBValues.length > 0){
        parentNid = parentNidDBValues[0];
        if(parentNid > 0){
            result = db.execute('SELECT table_name FROM node WHERE nid = ' + parentNid);
            parentNodeType = result.fieldByName('table_name');
            result.close();
            
            result = db.execute('SELECT ' + rules_parent_field_name + ' FROM ' + parentNodeType + ' WHERE nid = ' + parentNid);
            rulesData = result.fieldByName(rules_parent_field_name);
            rulesData = JSON.parse(rulesData);
            
            //Ti.API.debug(JSON.stringify(rulesData));
            
            if (rulesData != false && rulesData != null && rulesData != "" && rulesData.length > 0) {
                tids = {};
                used_tids = [];
                all_others_row = [];
        
                for (i in rulesData) {
                    if(rulesData.hasOwnProperty(i)){
                        dataRow = rulesData[i];
                        
                        if (!isNaN(dataRow.tid)) {
                            if (dataRow.node_types[node_type] != null && dataRow.node_types[node_type] != "") {
                                if (rules_field_passed_time_check(dataRow.time_rules, violation_timestamp)) {
            
                                    //if (tids[dataRow.tid] == null) {
                                        tids[dataRow.tid] = true;
                                   // }
                                   //Ti.API.debug(dataRow.tid);
                                    //tids[dataRow.tid].push(violationTerms[dataRow.tid][0]);
                                }
                            }
                            //if (used_tids[dataRow.tid] == null) {
                                used_tids[dataRow.tid] = true;
                            //}
                            //used_tids[dataRow.tid].push(dataRow.tid);
                        }
                        else if (dataRow.tid == 'ALL') {
                            all_others_row.push(dataRow);
                        }
                        
                        if (dataRow.description != null) {
                            descriptions[dataRow.tid] = dataRow.description;
                        }
                        
                    }
                }
        
                if (all_others_row.length > 0) {
                    if (all_others_row[0].node_types[node_type] != null && all_others_row[0].node_types[node_type] != "") {
                        if (rules_field_passed_time_check(all_others_row[0].time_rules, violation_timestamp)) {
                            for (i in violationTerms) {
                                if(violationTerms.hasOwnProperty(i)){
                                    violation_term = violationTerms[i].dbValue;
                                    if (typeof used_tids[violation_term] === 'undefined') {
                                        //if (tids[violation_term] == null) {
                                            tids[violation_term] = true;
                                        //}
                                        //tids[violation_term].push(violationTerms[i][0]);
                                    }
                                }
                            }
                        }
                    }
                }
                
                options = [];
                
                for(i in tids){
                    if(tids.hasOwnProperty(i)){
                        if(typeof descriptions[i] !== 'undefined'){
                            violationTerms[i].description = descriptions[i];
                        }
                        
                        //Ti.API.info(descriptions);
                        options.push(violationTerms[i]);
                        //Ti.API.error(JSON.stringify(violationTerms[i]));
                    }
                }  
                
                /**** START SETTING CURRENT FORM DEFAULT VALUES *****/
                
                violationDBValues = Omadi.widgets.getDBValues(fieldWrappers[violation_field_name]);
                //violationTextValues = Omadi.widgets.getTextValues(fieldWrappers[violation_field_name]);
                //Ti.API.debug(violationDBValues);
                violationTextValues = [];
                for(i = 0; i < violationDBValues.length; i ++){
                    for(j in violationTerms){
                        if(violationTerms.hasOwnProperty(j)){
                            
                            if(violationTerms[j].dbValue == violationDBValues[i]){
                                violationTextValues[i] = violationTerms[j].title;
                            }
                        }
                    }
                }
                
                
                // Get rid of any violations that don't apply to this property
                if(violationDBValues.length > 0){
                    for(i = violationDBValues.length - 1; i >= 0; i --){
                        isViolationValid = false;
                        for(j = 0; j < options.length; j ++){
                            if(violationDBValues[i] == options[j].dbValue){
                                isViolationValid = true;
                                break;
                            }
                        }
                        if(!isViolationValid){
                            violationDBValues.splice(i, 1);
                            violationTextValues.splice(i, 1);
                        }
                    }
                }
                
                // Set the violations to possibly fewer violations
                Omadi.widgets.setValueWidgetProperty(violation_field_name, ['dbValue'], violationDBValues);
                
                // Set the textValues for the widget
                violationTextValues = violationTextValues.join(', ');
                Omadi.widgets.setValueWidgetProperty(violation_field_name, ['textValue'], violationTextValues);
                Omadi.widgets.setValueWidgetProperty(violation_field_name, ['text'], violationTextValues);
                
                
                // Set the description for the selected violation if one exists
                if(violationDBValues.length == 1){
                    if(typeof violationTerms[violationDBValues[0]].description !== 'undefined'){
                        Omadi.widgets.setValueWidgetProperty(violation_field_name, ['descriptionLabel', 'text'], violationTerms[violationDBValues[0]].description);
                    }
                }
                else{
                    Omadi.widgets.setValueWidgetProperty(violation_field_name, ['descriptionLabel', 'text'], "");
                }
                
                /**** END SETTING CURRENT FORM DEFAULT VALUES *****/
            }
        }
    }
    
    db.close();
    
    /*** FINALLY SET THE ALLOWABLE VIOLATION OPTIONS FOR THE WIDGET ***/
    Omadi.widgets.setValueWidgetProperty(violation_field_name, ['options'], options);
}



function setupViolationField(){"use strict";
    
    var instances, field_name, instance, valueWidget, widget, referenceWidget, datestampWidget;
    // NOTE: this will not work with time fields with multiple cardinality
    
    instances = Omadi.data.getFields(Ti.UI.currentWindow.type);
    
    for(field_name in instances){
        if(instances.hasOwnProperty(field_name)){
            instance = instances[field_name];
            if(typeof instance.widget !== 'undefined' && instance.widget.type == 'violation_select'){
                
                widget = instance.widget;
                
                if(typeof fieldWrappers[field_name] !== 'undefined'){
                    //valueWidget = Omadi.widgets.getValueWidget(field_name);
                    
                    if (widget.rules_field_name != null && widget.rules_field_name != "") {
                       
                        Omadi.widgets.setValueWidgetProperty(widget.rules_field_name, 'onChangeCallbacks', [changeViolationFieldOptions]);
                        Omadi.widgets.setValueWidgetProperty(widget.rules_field_name, 'onChangeCallbackArgs', [[field_name]]);
                        
                        if (widget.rules_violation_time_field_name != null && widget.rules_violation_time_field_name != "") {
                            
                            Omadi.widgets.setValueWidgetProperty(widget.rules_violation_time_field_name, 'onChangeCallbacks', [changeViolationFieldOptions]);
                            Omadi.widgets.setValueWidgetProperty(widget.rules_violation_time_field_name, 'onChangeCallbackArgs', [[field_name]]);
                        }
                    }
                    
                    // Initialize the field for default values
                    changeViolationFieldOptions(field_name);
                }
            }
        }
    }
}


function recalculateCalculationFields(){"use strict";
    var field_name;
    
    for(field_name in instances){
        if(instances.hasOwnProperty(field_name)){
            if(instances[field_name].type == 'calculation_field'){
                if(typeof fieldWrappers[field_name] !== 'undefined'){
                    Omadi.widgets.shared.redraw(instances[field_name]);
                }
            }
        }
    }
}


function loadCustomCopyNode(originalNode, from_type, to_type){"use strict";
    var fromBundle, newNode, to_field_name, from_field_name;
    
    fromBundle = Omadi.data.getBundle(from_type);
    
    newNode = {
        created : Omadi.utils.getUTCTimestamp(),
        author_uid: Omadi.utils.getUid(),
        form_part: 0,
        nid: 'new',
        type: to_type,
        changed: Omadi.utils.getUTCTimestamp(),
        changed_uid: Omadi.utils.getUid(),
        origNid: originalNode.nid
    };
    
    if(originalNode){
        if(typeof fromBundle.data.custom_copy !== 'undefined'){
            if(typeof fromBundle.data.custom_copy[to_type] !== 'undefined'){
                for(to_field_name in fromBundle.data.custom_copy[to_type]){
                    if(fromBundle.data.custom_copy[to_type].hasOwnProperty(to_field_name)){
                        from_field_name = fromBundle.data.custom_copy[to_type][to_field_name];
                        if(typeof originalNode[from_field_name] !== 'undefined'){
                            newNode[to_field_name] = originalNode[from_field_name];
                        }
                    }
                }
            }
        }
    }
    
    return newNode;
}

var field_name;
    var instance;
    var i, j;
    var region_name;
    var regionHeaderView;
    var regionView;
    var tempFormPart;
    var widgetView;
    




function getFormFieldValues(field_name){"use strict";
    var retval = {};
    
    if(typeof fieldWrappers[field_name] !== 'undefined'){
        retval.dbValues = Omadi.widgets.getDBValues(fieldWrappers[field_name]);
        retval.textValues = Omadi.widgets.getTextValues(fieldWrappers[field_name]);
    }
    
    return retval;
}



function affectsAnotherConditionalField(check_instance){"use strict";
    
    var node, search_criteria, affectedFields, field_name, i, affectsAField, instance;
    
    affectedFields = [];
    
    for(field_name in instances){
        if(instances.hasOwnProperty(field_name)){
            instance = instances[field_name];
            if(instance.disabled == 0){
                if(typeof instance.settings.criteria !== 'undefined' && typeof instance.settings.criteria.search_criteria !== 'undefined'){
                    search_criteria = instance.settings.criteria.search_criteria;
                    
                    for (i in search_criteria) {
                        if(search_criteria.hasOwnProperty(i)){
                            
                            
                            if(check_instance.field_name == search_criteria[i].field_name){
                                Ti.API.debug(search_criteria[i].field_name + " -> " + field_name);
                                affectedFields.push(field_name);
                            }
                        }
                    }
                }
            }
        }
    }
    
    //Ti.API.debug("Affecting fields: " + JSON.stringify(affectedFields));
    
    return affectedFields;
}


function setConditionallyRequiredLabels(check_instance, check_fields){"use strict";
    /*global setConditionallyRequiredLabelForInstance*/
    var node, search_criteria, affectedFields, field_name, i, instance;
    
    if(typeof check_fields !== 'undefined'){
        affectedFields = check_fields;
    }
    else{
        affectedFields = affectsAnotherConditionalField(check_instance);
    }
    
    //Ti.API.debug("Affecting fields: " + JSON.stringify(affectedFields));
    
    if(affectedFields.length > 0){
        node = formToNode();
        for(i = 0; i < affectedFields.length; i ++){
            setConditionallyRequiredLabelForInstance(node, instances[affectedFields[i]]);
        }
    }
}

// function fieldAffectsAnotherConditionallyRequired(instance){
//     
// }

function sort_by_weight(a, b) {"use strict";
    if (a.weight != null && a.weight != "" && b.weight != null && b.weight != "") {
        return a.weight > b.weight;
    }
    return 0;
}





function setConditionallyRequiredLabelForInstance(node, instance) {"use strict";
    
   
    /*jslint nomen: true*/
    /*global search_criteria_search_order, labelViews*/
   
    //var entityArr = createEntityMultiple();
    
    var search_criteria, row_matches, row_idx, criteria_row, field_name, 
        search_operator, search_value, search_values, values, i, makeRequired,
        and_groups, and_group_index, and_group, and_group_match, j, or_match;
    
    try{
    
        row_matches = [];
        
        //instance = instances[check_field_name];
       // Ti.API.debug("In Conditional for " + instance.field_name);
        
        if (instance.settings.criteria != null && instance.settings.criteria.search_criteria != null) {
            //instance.settings.criteria.search_criteria.sort(search_criteria_search_order);
            search_criteria = instance.settings.criteria.search_criteria;
            search_criteria.sort(sort_by_weight);
            
            //Ti.API.debug(JSON.stringify(search_criteria));
            
            for (row_idx in search_criteria) {
                if(search_criteria.hasOwnProperty(row_idx)){
                    criteria_row = search_criteria[row_idx];
                    
                    row_matches[row_idx] = false;
                    
                    field_name = criteria_row.field_name;
                    search_operator = criteria_row.operator;
                    search_value = criteria_row.value;
                    values = [];
                    
                    //Ti.API.debug(field_name);
                    
                    if(typeof node[field_name] !== 'undefined'){
                       values = node[field_name].dbValues;
                    }
                    
                    //Ti.API.debug(JSON.stringify(values));
              
        
                    switch(instances[field_name].type) {
                        case 'text':
                        case 'text_long':
                        case 'link_field':
                        case 'phone':
                        case 'license_plate':
                        case 'location':
                        case 'vehicle_fields':
                        case 'number_integer':
                        case 'number_decimal':
                        case 'email':
                        case 'datestamp':
                        case 'omadi_reference':
                        case 'omadi_time':
                        case 'calculation_field':
                        

                            if (search_operator == '__filled') {
                                for (i = 0; i < values.length; i++) {
                                    if (values[i] != null && values[i] != "") {
                                        row_matches[row_idx] = true;
                                    }
    
                                }
                            }
                            else {
                                if (values.length == 0) {
                                    row_matches[row_idx] = true;
                                }
                                else {
                                    for (i = 0; i < values.length; i ++){
                                        if (values[i] == null || values[i] == "") {
                                            row_matches[row_idx] = true;
                                        }
                                    }
                                }
                            }
                            break;
                            
                        case 'taxonomy_term_reference':
                        case 'user_reference':
    
                            search_values = [];
                            if (!Omadi.utils.isArray(search_value)) {
                                for (i in search_value) {
                                    if (search_value.hasOwnProperty(i)) {
                                        search_values.push(i);
                                    }
                                }
                                search_value = search_values;
                            }
                            else {
                                if (search_value.length == 0) {
                                    row_matches[row_idx] = true;
                                    break;
                                }
                            }
                            
                            
                            if (search_operator == '__blank') {
                                row_matches[row_idx] = true;
                                if(values.length > 0){
                                    for(i = 0; i < values.length; i ++){
                                        if(values[i] > 0){
                                            row_matches[row_idx] = false;
                                        }
                                    }
                                }
                            }
                            else if (search_operator == '__filled') {
                                row_matches[row_idx] = false;
                                if(values.length > 0){
                                    for(i = 0; i < values.length; i ++){
                                        if(values[i] > 0){
                                            row_matches[row_idx] = true;
                                        }
                                    }
                                }
                            }
                            else if (search_operator == '!=') {
                                row_matches[row_idx] = true;
                                if (search_value.__null == '__null' && (values.length === 0 || values[0] == null)) {
                                    row_matches[row_idx] = false;
                                }
                                else {
                                    for (i = 0; i < search_value.length; i ++){
                                        if(values.indexOf(search_value[i]) !== -1){
                                            row_matches[row_idx] = false;
                                        }
                                    }
    
                                }
                            }
                            else if (search_operator == '=') {
                                
                                if (search_value.indexOf('__null') !== -1 && (values.length === 0 || values[0] == null)) {
                                    row_matches[row_idx] = true;
                                }
                                else {
                                    for (i = 0; i < search_value.length; i ++){
                                        for(j = 0; j < values.length; j ++){
                                            if (values[j] == search_value[i]){
                                                row_matches[row_idx] = true;
                                            }   
                                        }
                                    }
                                }
                            }
    
                            break;
    
                        case 'list_boolean':
                           
                            if (search_operator == '__filled') {
                                for (i = 0; i < values.length; i++) {
                                    if (values[i] != null && values[i] == "1") {
                                        row_matches[row_idx] = true;
                                    }
                                }
                            }
                            else {
                                if (values.length == 0) {
                                    row_matches[row_idx] = true;
                                }
                                else {
                                    for (i = 0; i < values.length; i ++){
                                        if (values[i] == null || values[i] == "0") {
                                            row_matches[row_idx] = true;
                                        }
                                    }
                                }
                            }
                            break;
                    }
                }
            }
    
            makeRequired = true;
            
            //Ti.API.error(JSON.stringify(row_matches));
            
            if (row_matches.length == 1) {
                makeRequired = row_matches[0];
            }
            else {
                // Group each criteria row into groups of ors with the matching result of each or
                and_groups = [];
                and_group_index = 0;
                and_groups[and_group_index] = [];
                //print_r($criteria['search_criteria']);
                for (i in search_criteria) {
                    if(search_criteria.hasOwnProperty(i)){
                        criteria_row = search_criteria[i];
                        if (i == 0) {
                            and_groups[and_group_index][0] = row_matches[i];
                        }
                        else {
                            if (criteria_row.row_operator == null || criteria_row.row_operator != 'or') {
                                and_group_index++;
                                and_groups[and_group_index] = [];
                            }
                            and_groups[and_group_index][0] = row_matches[i];
                        }
                    }
                }
    
                // Get the final result, making sure each and group is TRUE
                for (i in and_groups) {
                    if(and_groups.hasOwnProperty(i)){
                        and_group = and_groups[i];
                        and_group_match = false;
                        for (j in and_group) {
                            if(and_group.hasOwnProperty(j)){
                                // Make sure at least one item in an and group is true (or the only item is true)
                                if (and_group[j]) {
                                    and_group_match = true;
                                    break;
                                }
                            }
                        }
        
                        // If one and group doesn't match the whole return value of this function is false
                        if (!and_group_match) {
                            makeRequired = false;
                            break;
                        }
                    }
                }
                
                //Ti.API.error(JSON.stringify(and_groups));
            }
            
            if(typeof labelViews[instance.field_name] !== 'undefined'){
            
                if (makeRequired) {
                    if (!instance.isConditionallyRequired) {
                        labelViews[instance.field_name].text = '*' + labelViews[instance.field_name].text;
                        labelViews[instance.field_name].color = 'red';
                        //instance.required = true;
                    }
                    instance.isConditionallyRequired = true;
                }
                else {
                    if (instance.isConditionallyRequired) {
                        labelViews[instance.field_name].text = labelViews[instance.field_name].text.substring(1, labelViews[instance.field_name].text.length);
                        labelViews[instance.field_name].color = Omadi.widgets.label.color;
                        ///instance.required = false;
                    }
                    instance.isConditionallyRequired = false;
                }
            }
        }
    }
    catch(ex){
        alert("Changing conditional value: " + ex);
    }
}


(function(){"use strict";
    var field_name;
    
    /*jslint vars: true, eqeq: true*/
   /*global Omadi*/
   
    if(win.nid == 'new'){
        node = getNewNode();
    }
    else{
        node = Omadi.data.nodeLoad(win.nid);
    }
    
    Ti.API.debug("LOADED NODE: " + JSON.stringify(node));
   
    win.addEventListener("android:back", cancelOpt);
   
    if(win.nid < 0){
        //Ti.API.error("WIN NID: " + win.nid);
        
        Ti.App.addEventListener('switchedItUp', function(e){
           //alert("it switched"); 
           //Ti.API.error(JSON.stringify(e));
       
           if(Ti.UI.currentWindow.nid == e.negativeNid){
               
               Ti.UI.currentWindow.nid = e.positiveNid;
               Ti.UI.currentWindow.node.nid = e.positiveNid;
               //Ti.API.error("new nid: " + Ti.UI.currentWindow.nid);
           }
        });
    }
    
    Ti.App.addEventListener('photoUploaded', function(e){
        var nid, delta, fid, field_name, dbValues;
        
        nid = parseInt(e.nid, 10);
        delta = parseInt(e.delta, 10);
        field_name = e.field_name;
        fid = parseInt(e.fid, 10);
        
        if(Ti.UI.currentWindow.nid == nid){
            if(typeof fieldWrappers[field_name] !== 'undefined'){
                //alert("Just saved delta " + delta);
                Omadi.widgets.setValueWidgetProperty(field_name, 'dbValue', fid, delta);
                Omadi.widgets.setValueWidgetProperty(field_name, 'fid', fid, delta);
            }
        }
    });
    
    Ti.App.addEventListener('loggingOut', function(){
        Ti.UI.currentWindow.close();
    });
    
    
    if(win.nid != "new" && win.nid > 0){
        Omadi.service.setNodeViewed(win.nid);
    }
    
    win.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]);
    wrapperView = Ti.UI.createView({
       layout: 'vertical',
       bottom: 0,
       top: 0,
       right: 0,
       left: 0 
    });
    
    
    if (Ti.App.isAndroid) {
        get_android_menu();
    }
    else {
        addiOSToolbar();
    }
    
    // if (Ti.App.isAndroid) {
        // //The view where the results are presented
        // formWrapperView = Ti.UI.createView({
            // top : 0,
            // height : '100%',
            // width : '100%',
            // backgroundColor : '#EEEEEE',
            // opacity : 1
        // });
        // win.add(formWrapperView);
// 
        // scrollView = Ti.UI.createScrollView({
            // bottom : 0,
            // contentHeight : 'auto',
            // backgroundColor : '#EEEEEE',
            // showHorizontalScrollIndicator : false,
            // showVerticalScrollIndicator : true,
            // opacity : 1,
            // scrollType : "vertical",
            // zIndex : 10,
            // layout: 'vertical',
            // height: Ti.UI.SIZE,
            // top: 0
        // });
    // }
    // else {
// 
        // //The view where the results are presented
        // formWrapperView = Ti.UI.createView({
            // top : 45,
            // height : Ti.UI.FILL,
            // width : '100%'
        // });
        // //win.add(formWrapperView);

        scrollView = Ti.UI.createScrollView({
            contentHeight : 'auto',
            showHorizontalScrollIndicator : false,
            showVerticalScrollIndicator : true,
            scrollType : 'vertical',
            layout: 'vertical',
            height: Ti.UI.FILL,
            width: '100%'
        });
        
        wrapperView.add(scrollView);
        
        
   // }
    
    win.add(wrapperView);
    
    scrollView.addEventListener('scroll', function(e){
        scrollPositionY = e.y;
    });


    if(typeof win.form_part !== 'undefined'){
        tempFormPart = parseInt(win.form_part, 10);
        if(win.form_part == tempFormPart){
            node.form_part = win.form_part;
        }
        else{
            // This is a copy to form, the form_part passed in is which type to copy to
            Ti.API.info("This is a custom copy to " + win.form_part);
            node = loadCustomCopyNode(node, win.type, win.form_part);
            
            win.origNid = node.origNid; 
            win.type = node.type;
            win.nid = 'new';
            win.form_part = 0;    
            
            Ti.App.addEventListener("formFullyLoaded", function(){
                var field_name;
                
                Ti.App.fireEvent("customCopy");
                
                for(field_name in instances){
                    if(instances.hasOwnProperty(field_name)){
                        widgetView = Omadi.widgets.getValueWidget(field_name);
                        
                        if(widgetView && typeof widgetView.check_conditional_fields !== 'undefined'){
                            setConditionallyRequiredLabels(instances[field_name], widgetView.check_conditional_fields);
                        }
                    }
                }
            });
        }
    }
    
    win.node = node;
    instances = Omadi.data.getFields(win.type);
    
    
    
    regions = Omadi.data.getRegions(win.type);
    var region;
    var region_name;
    var region_form_part = 0;
    var hasViolationField = false;
    var regionWrapperView;
    var regionWrappers = {};
    
    for(region_name in regions){
        if(regions.hasOwnProperty(region_name)){
            region = regions[region_name];
            
            if(typeof region.settings !== 'undefined' && region.settings != null && typeof region.settings.form_part !== 'undefined'){
                region_form_part = parseInt(region.settings.form_part, 10);
            }
            else{
                region_form_part = 0;
            }
           
            if(region_form_part <= node.form_part){
                
                var expanded = true;
                if(typeof region.settings.always_expanded && region.settings.always_expanded == 1){
                    expanded = true;
                }
                else if(region_form_part < node.form_part){
                    expanded = false;
                }
                
                regionHeaderView = getRegionHeaderView(region, expanded);
                
                regionWrapperView = Ti.UI.createView({
                    height: Ti.UI.SIZE,
                    width: '100%',
                    layout: 'vertical'
                });
                
                regionWrapperView.add(regionHeaderView);
                regionWrapperView.add(Ti.UI.createView({
                    height: 10,
                    width: '100%'
                }));
                
                regionView = Ti.UI.createView({
                    width : '100%',
                    backgroundColor : '#eee',
                    height: Ti.UI.SIZE,
                    layout: 'vertical'
                });
                
                if(expanded === false){
                    regionView.visible = false;
                    regionView.height = 5;
                }
                
                regionViews[region_name] = regionView;
                
                regionWrapperView.add(regionView);
                
                regionWrappers[region_name] = regionWrapperView;
                
                scrollView.add(regionWrapperView);
            }
        }
    }
    
    var omadi_session_details = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
    var roles = omadi_session_details.user.roles;
    //var field_name;
    
    for(field_name in instances){
        if(instances.hasOwnProperty(field_name)){
            
            instance = instances[field_name];        
            
            var settings = instance.settings;
            var isRequired = instance.required;
            var labelColor = "#246";
            
            if(instance.required == 1){
                instance.isRequired = true;
            }
            else{
                instance.isRequired = false;
            }
            
            region_name = instance.region;
            
            // Make sure the region is visible
            if(typeof regionViews[region_name] !== 'undefined'){
                
                if (instance.disabled == 0 && instance.can_view) {
                    
                    var fieldWrapper = Ti.UI.createView({
                       width: '100%',
                       height: Ti.UI.SIZE, 
                       instance: instance
                    });
                    
                    var fieldView = Omadi.widgets.getFieldView(node, instance);
                    if(fieldView !== null){
                        fieldView.wrapper = fieldWrapper;
                           
                        fieldWrapper.add(fieldView);
                        fieldWrappers[instance.field_name] = fieldWrapper;
                        regionViews[region_name].add(fieldWrapper);
                        
                        if(instance.widget.type == 'violation_select'){
                            hasViolationField = true;
                        }
                    }
                    else{
                        Ti.API.error("Could not add field type " + instance.type);
                    }
                }
            }
        }
    }   
    
    // Remove empty regions
    for(region_name in regionViews){
        if(regionViews.hasOwnProperty(region_name)){
            if(regionViews[region_name].getChildren().length == 0){
                scrollView.remove(regionWrappers[region_name]);
            }
        }
    }
    
    Ti.App.fireEvent("formFullyLoaded");
    
    setTimeout(function(){
        
        scrollView.scrollTo(0, 0);
        
       // Omadi.widgets.blurFields();
    }, 1000);
    
    recalculateCalculationFields();
    
    if(hasViolationField){
        setupViolationField();
    }
    
}());

