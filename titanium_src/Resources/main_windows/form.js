
Ti.include("/lib/widgets.js");

/*global Omadi, PLATFORM*/
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

if (PLATFORM === 'android') {
    cameraAndroid = require('com.omadi.camera');
    //camera.addEventListener("successCameraCapture", function(e){openAndroidCamera(e);});
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
   /*global Omadi, PLATFORM, save_form_data*/
   
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
        btn_tt.push('Draft');
        btn_tt.push('Cancel');
    
        menu_first = menu.add({
            title : 'Save',
            order : 1
        });
        menu_first.setIcon("/images/save.png");
    
        menu_second = menu.add({
            title : 'Draft',
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
        Ti.API.error("node exists in window: " + node.nid);
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
    var maxValue, form_errors = [], i;
    
    if (node[instance.field_name].dbValues.length > 0) {
        if (instance.settings.max != null) {
            maxValue = parseFloat(instance.settings.max);
            
            for(i = 0; i < node[instance.field_name].dbValues.length; i ++){
                if (node[instance.field_name].dbValues[i] !== null && node[instance.field_name].dbValues[i] > maxValue) {
                    form_errors.push(instance.label + " cannot be greater than " + maxValue + ".");
                }  
            }
            
        }
    }
    
    
    return form_errors;
}

function validateMinValue(node, instance){"use strict";
    var minValue, form_errors = [], i;
    
    if (node[instance.field_name].dbValues.length > 0) {
        if (instance.settings.min != null) {
            minValue = parseFloat(instance.settings.min);
            
            for(i = 0; i < node[instance.field_name].dbValues.length; i ++){
                if (node[instance.field_name].dbValues[i] !== null && node[instance.field_name].dbValues[i] < minValue) {
                    form_errors.push(instance.label + " cannot be less than " + minValue + ".");
                }  
            }
            
        }
    }
    
    
    return form_errors;
}

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
                    isEmpty = false;
                    break;
                
                default: 
                    Ti.API.error("Missing field type def in validate_form_data");
                    break;
            }
        }
    }
    
    //Ti.API.info(instance.required + '+');
    
    //=========================================
    //---- Check for required fields ----------
    //=========================================
    if (((instance.is_title === true) || (instance.isRequired) || instance.isConditionallyRequired) && instance.can_view == true){
        
        
         // TODO: something with no data checkboxes
         
         if(isEmpty){
             if(instance.partLabel === null){
                 form_errors.push(instance.label + " is required");
             }
             else{
                 form_errors.push(instance.label + " " + instance.partLabel + " is required");
             }
         }
         
         if (instance.field_type == 'image') {
            Ti.API.error("TODO: in image validation");
            // var is_images_query = 'SELECT id FROM _photos WHERE nid=0 ';
            // if (win.nid != null && win.nid != "") {
                // is_images_query += ' OR nid=' + win.nid + ' ';
            // }
            // is_images_query += ' AND field_name="' + field_name + '"';
            // //Ti.API.info(is_images_query);
//     
            // var is_images = db_check_restrictions.execute(is_images_query);
            // var crdnlty = content[x].cardinality;
            // //if cardinality is unlimited or one than only one image can be work for required
            // //But if cardinality is greater than 1 then required that number of images
            // if (win.mode == 1) {
                // if (crdnlty > 1 || crdnlty < 0) {
                    // var arrImages = content[x].arrImages;
                    // var imageOdometer = 0;
                    // for ( i_idx = 0; i_idx < arrImages.length; i_idx++) {
                        // if (arrImages[i_idx].imageVal != defaultImageVal || arrImages[i_idx].bigImg != null || arrImages[i_idx].bigImg != "") {
                            // imageOdometer++;
                        // }
                    // }
                    // if ((crdnlty < 1 && imageOdometer == 0) || (crdnlty > 1 && imageOdometer != is_images.rowCount)) {
                        // string_text += label[content[x].reffer_index].text + "\n";
                        // //count_fields++;
                    // }
                // }
                // else {
                    // if (content[x].imageVal == defaultImageVal && is_images.rowCount == 0) {
                        // string_text += label[content[x].reffer_index].text + "\n";
                        // //count_fields++;
                    // }
                // }
            // }
            // else {
                // if ((crdnlty <= 1 && is_images.rowCount == 0) || (crdnlty > 1 && crdnlty != is_images.rowCount)) {
                    // string_text += label[content[x].reffer_index].text + "\n";
                    // //count_fields++;
                // }
            // }
            // is_images.close();
            // continue;
        }
        //count_fields++;
        
         
            //if(node[field_name].no_data_checkbox == null || node[field_name].no_data_checkbox == "" || node[field_name].no_data_checkbox == false) {
                //Check for image field
               
                
                
                //if (content[x].cardinality > 1) {
                //    string_text += "#" + content[x].private_index + " " + label[content[x].reffer_index].text + "\n";
               // }
               // else {
               ////     string_text += label[content[x].reffer_index].text + "\n";
               // }
           // }
        
    }
    
    return form_errors;
}

function validateRestrictions(node){"use strict";
    var instances, query, db, result, timestamp, field_name, vin, license_plate, nid, restrictions, form_errors, i, account;
    
    restrictions = [];
    form_errors = [];
    
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
                        }
                    }
                }
            }
        }
    }
    catch(ex){
        //alert("This alert should NOT have an effect on your data saving. Please report the following: " + ex);
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
    //regionHeader.viewContainer = regionView;
    
    
    regionHeader.addEventListener('click', function(e) {
        
        var regionView;
        
        e.source.expanded = !e.source.expanded;
        
        if (e.source.expanded === true) {
            //e.source.viewContainer.height = e.source.viewContainer.calculatedHeight;
            //top = 0;
            
            
            regionView = regionViews[e.source.region_name];
            regionView.startLayout();
            regionView.show();
            regionView.setHeight(Ti.UI.SIZE);
            
            e.source.arrow.setImage("/images/light_arrow_down.png");
            
            regionView.finishLayout();
            
            // for ( i = 0; i < scrollView.getChildren().length; i++) {
                // v = scrollView.getChildren()[i];
                // isLabel = false;
                // if (PLATFORM == 'android') {
                    // if ( v instanceof Ti.UI.Label) {
                        // isLabel = true;
                    // }
                // }
                // else {
                    // if (v == '[object TiUILabel]') {
                        // isLabel = true;
                    // }
                // }
                // if (isLabel) {
                    // //v.top = top;
                    // //v.arrow.top = top + 5;
                    // if (v.viewContainer.expanded === true) {
                        // v.arrow.image = "/images/light_arrow_down.png";
                    // }
                    // else {
                        // v.arrow.image = "/images/light_arrow_left.png";
                    // }
                    // //top = top + 40;
                    // //v.viewContainer.top = top;
                    // //top = top + v.viewContainer.height + 10;
                    // //e.source.viewContainer.show();
                // }
            // }
        }
        else {
            
            regionView = regionViews[e.source.region_name];
            regionView.startLayout();
            regionView.hide();
            regionView.setHeight(5);
            
            e.source.arrow.setImage("/images/light_arrow_left.png");
            
            regionView.finishLayout();
            //e.source.viewContainer.height = 0;
            //e.source.viewContainer.hide();
            
            // for ( i = 0; i < scrollView.getChildren().length; i++) {
                // v = scrollView.getChildren()[i];
                // isLabel = false;
                // if (PLATFORM == 'android') {
                    // if ( v instanceof Ti.UI.Label) {
                        // isLabel = true;
                    // }
                // }
                // else {
                    // if (v == '[object TiUILabel]') {
                        // isLabel = true;
                    // }
                // }
                // if (isLabel) {
                    // //v.top = top;
                    // //v.arrow.top = top + 5;
                    // if (v.viewContainer.expanded === true) {
                        // v.arrow.image = "/images/light_arrow_down.png";
                    // }
                    // else {
                        // v.arrow.image = "/images/light_arrow_left.png";
                    // }
                    // //top = top + 40;
                    // //v.viewContainer.top = top;
                    // //top = top + v.viewContainer.height + 10;
                // }
            // }
        }

        // if (scrollView.getChildren() != null) {
// 
            // for ( i = scrollView.getChildren().length - 1; i >= 0; i--) {
                // v = scrollView.getChildren()[i];
                // isLabel = false;
                // if (PLATFORM == 'android') {
                    // if ( v instanceof Ti.UI.Label) {
                        // isLabel = true;
                    // }
                // }
                // else {
                    // if (v == '[object TiUILabel]') {
                        // isLabel = true;
                    // }
                // }
// 
                // if (isLabel == true && v.viewContainer.expanded == true) {
                    // //v.viewContainer.height = v.viewContainer.height + 30;
                    // //(getScreenHeight() * 0.3);
                    // break;
                // }
                // else if (isLabel == true && v.viewContainer.expanded == false) {
                    // break;
                // }
            // }
        // }
    });
    
    regionHeaderWrapper.add(regionHeader);
    regionHeaderWrapper.add(arrow_img);
    
    return regionHeaderWrapper;
}





function save_form_data(saveType) {"use strict";
    /*jslint nomen: true*/
   /*global treatArray, update_node, close_me, reload_me, close_me_delay*/
    var node, form_errors, string_text, string_err, count_fields, value_err, now, field_name, dialog,
        oldVal, file_upload_nid, has_bug, no_data_fields_content, instance, insertValues, mode_msg, 
        no_data_fields, db_put, need_at, quotes, nid, new_nid, query, _array_value, x_j, 
        title_to_node, j, field_names, content_s, value_to_insert, formWin;
    
    node = formToNode();
    
    //Ti.API.debug("FULL FORM NODE: " + JSON.stringify(node));
    
    Ti.API.debug("Saving with type " + saveType);
    
    if(saveType == 'draft'){
        node._isDraft = true;
    }
    else{
        node._isDraft = false;
    }
    
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
        Omadi.display.loading("Saving...");
        try{
            
            //Ti.API.info("--------------------Inside save_form_data--------------------");
            //dialog = Titanium.UI.createAlertDialog({
            //    title : 'Omadi',
            //    buttonNames : ['OK']
            //});
        
            // string_text = "";
            // string_err = "";
            // count_fields = 0;
            // value_err = 0;
//             
            // if (pass_it === false) {
                // now = Math.round(new Date().getTime() / 1000);
            // }
            // else {
                // if (new_time != null) {
                    // now = new_time;
                // }
            // }
//             
            //this is used for checking restrictions in db against all nid on this form
            // TODO: Check for restrictions and other field-specific values
            // var db_check_restrictions = Omadi.utils.openMainDatabase();
    //     
            // var restrictions = new Array();
    //     
            // Ti.API.info("--------------------content array length : " + content.length + " --------------------");
    //     
            // /*
             // for (var k = 0; k < content.length; k++) {
             // Ti.API.info(k+" <<<===>>> "+content[k].value);
             // if (content[k].value && content[k].value != null ){
             // var __tmp = content[k].value.toString();
             // __tmp = __tmp.replace(/'/gi, '\'');
             // content[k].value = __tmp;
             // Ti.API.info(__tmp+' - '+content[k].value);
             // }
             // }
             // */
            // var x;
            // for (x in content) {
    //     
                // try {
                    // Ti.API.info(label[x].text + ' is required: ' + content[x].required + ' = ' + content[x].value);
                // }
                // catch(e) {
                    // Ti.API.info('!!!!! ERROR !!!!! ' + e);
                // }
                // //Regular expression for license Plate
                // if (content[x].field_type == 'license_plate') {
    //     
                    // if (content[x].value != null && content[x].value != "") {
                        // content[x].value = content[x].value.replace(/[^[0-9A-Z]/g, '', content[x].value);
                    // }
                // }
    //     
                // if (content[x].field_type == 'number_integer') {
    //     
                    // if (content[x].value != null && content[x].value != "") {
                        // if (content[x].value >= (2147483647)) {
                            // content[x].value = null;
                            // alert("The Maximum for this field is 2147483647 ")
                        // }
                        // else if (content[x].value <= (-2147483647)) {
                            // content[x].value = null;
                            // alert("The Minimum for this field is 2147483647 ")
                        // }
                    // }
                // }
    //     
                // if (content[x].field_type == 'number_integer' || content[x].field_type == 'number_decimal') {
                    // var minRange = (content[x].field_type == 'number_integer') ? -2147483648 : -99999999;
                    // var maxRange = (content[x].field_type == 'number_integer') ? 2147483647 : 99999999;
    //     
                    // if (content[x].value != null && content[x].value != "") {
                        // if (content[x].value >= maxRange) {
                            // content[x].value = null;
                            // alert("The Maximum for this field is" + maxRange)
                        // }
                        // else if (content[x].value <= minRange) {
                            // content[x].value = null;
                            // alert("The Minimum for this field is " + minRange)
                        // }
                    // }
                // }
    //     
                // // Regular expression for phone
                // if (content[x].field_type == 'phone') {
                    // if (content[x].value != "" && content[x].value != null) {
                        // var str = content[x].value.trim();
                        // var regExp = /\D*(\d*)\D*[2-9][0-8]\d\D*[2-9]\d{2}\D*\d{4}\D*\d*\D*/g
                        // var match = regExp.test(str);
                        // regExp.exec(str)
                        // var matchVal = regExp.exec(str);
                        // if (match == false || (matchVal[1] != '' && matchVal[1] != null)) {
                            // value_err++;
                            // string_err += content[x].value + ' is not a valid North American phone number.' + '\nPhone numbers should only contain numbers, +, -, (, ) and spaces and be like 999-999-9999. Please enter a valid ten-digit phone number.';
                        // }
                        // break;
                    // }
                // }
                // else if (content[x].field_type == 'omadi_reference') {//for preparing the list of restrictions
                    // Ti.API.info("-------------------- omadi_refrence = " + content[x].value + " ... NID:  " + content[x].nid + "--------------------");
                    // if (content[x].nid != null) {
                        // var d = new Date();
                        // var utcDate = Date.parse(d.toUTCString());
                        // var result = db_check_restrictions.execute('SELECT restriction_license_plate___plate, vin, restrict_entire_account, vehicle___make, vehicle___model, vehicle_color FROM restriction where restriction_account="' + content[x].nid + '" AND ((restriction_start_date < ' + utcDate / 1000 + ' OR restriction_start_date IS NULL) AND (restriction_end_date > ' + utcDate / 1000 + ' OR restriction_end_date IS NULL))');
    //     
                        // while (result.isValidRow()) {
                            // var restriction = {
                                // license_plate : result.fieldByName('restriction_license_plate___plate'),
                                // vehicle_make : result.fieldByName('vehicle___make'),
                                // vehicle_model : result.fieldByName('vehicle___model'),
                                // vehicle_color : result.fieldByName('vehicle_color'),
                                // restrict_entire_account : result.fieldByName('restrict_entire_account'),
                                // vin : result.fieldByName('vin')
                            // };
                            // restrictions.push(restriction);
                            // result.next();
                        // }
                        // result.close();
                    // }
                    // Ti.API.info("--------------------Restrictions array length : " + restrictions.length + "--------------------");
                // }
        
                // if (((content[x].is_title === true) || (content[x].required == 'true') || (content[x].required === true) || (content[x].required == '1') || (content[x].required == 1) ) && ((content[x].value == '') || (content[x].value == null)) && (content[x].no_data_checkbox == null || content[x].no_data_checkbox == "" || content[x].no_data_checkbox == false) && content[x].enabled == true) {
                    // //Check for image field
                    // if (content[x].field_type == 'image') {
                        // var is_images_query = 'SELECT id FROM _photos WHERE nid=0 ';
                        // if (win.nid != null && win.nid != "") {
                            // is_images_query += ' OR nid=' + win.nid + ' ';
                        // }
                        // is_images_query += ' AND field_name="' + content[x].field_name + '";';
                        // Ti.API.info(is_images_query);
    //     
                        // var is_images = db_check_restrictions.execute(is_images_query);
                        // var crdnlty = content[x].cardinality;
                        // //if cardinality is unlimited or one than only one image can be work for required
                        // //But if cardinality is greater than 1 then required that number of images
                        // if (win.mode == 1) {
                            // if (crdnlty > 1 || crdnlty < 0) {
                                // var arrImages = content[x].arrImages;
                                // var imageOdometer = 0;
                                // for ( i_idx = 0; i_idx < arrImages.length; i_idx++) {
                                    // if (arrImages[i_idx].imageVal != defaultImageVal || arrImages[i_idx].bigImg != null || arrImages[i_idx].bigImg != "") {
                                        // imageOdometer++;
                                    // }
                                // }
                                // if ((crdnlty < 1 && imageOdometer == 0) || (crdnlty > 1 && imageOdometer != is_images.rowCount)) {
                                    // string_text += label[content[x].reffer_index].text + "\n";
                                    // count_fields++;
                                // }
                            // }
                            // else {
                                // if (content[x].imageVal == defaultImageVal && is_images.rowCount == 0) {
                                    // string_text += label[content[x].reffer_index].text + "\n";
                                    // count_fields++;
                                // }
                            // }
                        // }
                        // else {
                            // if ((crdnlty <= 1 && is_images.rowCount == 0) || (crdnlty > 1 && crdnlty != is_images.rowCount)) {
                                // string_text += label[content[x].reffer_index].text + "\n";
                                // count_fields++;
                            // }
                        // }
                        // is_images.close();
                        // continue;
                    // }
                    // count_fields++;
                    // if (content[x].cardinality > 1) {
                        // string_text += "#" + content[x].private_index + " " + label[content[x].reffer_index].text + "\n";
                    // }
                    // else {
                        // string_text += label[content[x].reffer_index].text + "\n";
                    // }
                // }
            //}
        
            // var k;
            // for ( k = 0; k <= content.length; k++) {
                // if (!content[k]) {
                    // continue;
                // }
    //     
                // if ((win.mode == 0 || _flag_info == 'draft')) {
                    // //validating license plate and vin value entered by user against restritions
                    // var r;
                    // for (r in restrictions) {
                        // var accountRestricted = restrictions[r].restrict_entire_account;
                        // if (content[k].field_name == 'license_plate___plate') {
                            // if (accountRestricted != null && accountRestricted == "1" && accountRestricted != "") {
                                // a.message = "The selected account is restricted from any parking enforcement activity.";
                                // a.show();
                                // return;
                            // }
                            // else {
                                // var license_plate = content[k].value;
                                // var restricted_license_plate = restrictions[r].license_plate;
                                // if (license_plate != null && restricted_license_plate != null && license_plate != "" && restricted_license_plate != "") {
                                    // license_plate = license_plate.toLowerCase().replace(/o/g, '0');
                                    // restricted_license_plate = restricted_license_plate.toLowerCase().replace(/o/g, '0');
                                    // Ti.API.info('1 License Plate: ' + license_plate + ' ---- Restriction License Plate: ' + restricted_license_plate);
                                    // if (license_plate.toString() == restricted_license_plate.toString()) {
                                        // var colorName = "";
                                        // var resMsg = "";
                                        // if (restrictions[r].vehicle_color != null && restrictions[r].vehicle_color != "") {
                                            // var term_data = db_check_restrictions.execute("SELECT name FROM term_data WHERE tid = " + restrictions[r].vehicle_color);
                                            // colorName = term_data.getFieldByName('name');
                                            // term_data.close();
                                        // }
                                        // resMsg = colorName + " " + restrictions[r].vehicle_make + " " + restrictions[r].vehicle_model;
                                        // resMsg += ((resMsg.trim() != "") ? " - " : "");
                                        // resMsg += restrictions[r].license_plate + " is currently restricted for the account entered.";
    //     
                                        // a.message = resMsg;
                                        // a.show();
                                        // return;
                                    // }
                                // }
                            // }
    //     
                        // }
    //     
                        // if (content[k].field_name == 'vin') {
                            // if (accountRestricted != null && accountRestricted == "1") {
                                // a.message = "Do not enforce any violations on this property. It is restricted by management.";
                                // a.show();
                                // return;
                            // }
                            // else {
                                // var vin = content[k].value;
                                // var restricted_vin = restrictions[r].vin;
                                // if (vin != null && vin != "" && restricted_vin != null && restricted_vin != "") {
                                    // Ti.API.info('VIN: ' + vin + ' RS_VIN: ' + restricted_vin);
                                    // if (vin == restricted_vin) {
                                        // var colorName = "";
                                        // var resMsg = "";
                                        // if (restrictions[r].vehicle_color != null && restrictions[r].vehicle_color != "") {
                                            // var term_data = db_check_restrictions.execute("SELECT name FROM term_data WHERE tid = " + restrictions[r].vehicle_color);
                                            // colorName = term_data.getFieldByName('name');
                                            // term_data.close();
                                        // }
                                        // resMsg = colorName + " " + restrictions[r].vehicle_make + " " + restrictions[r].vehicle_model;
                                        // resMsg += ((resMsg.trim() != "") ? " - " : "");
                                        // resMsg += restrictions[r].vin + " is currently restricted for the account entered.";
    //     
                                        // a.message = resMsg;
                                        // a.show();
                                        // return;
                                    // }
                                // }
                            // }
    //     
                        // }
                    // }
                // }
    //     
            // }
        
            //db_check_restrictions.close();
            
           
            
            // if ((count_fields > 0) && (_flag_info != "draft")) {
                // if (count_fields == 1) {
                    // if (win.mode == 0) {
                        // dialog.message = 'The field "' + string_text + '" is empty, please fill it out in order to save this node';
                    // }
                    // else {
                        // dialog.message = 'The field "' + string_text + '" is empty, please fill it out in order to update this node';
                    // }
                // }
                // else {
                    // dialog.message = 'The following fields are required and are empty:\n' + string_text;
                // }
                // dialog.show();
            // }
            // else if (value_err > 0) {
                // dialog.message = string_err;
                // dialog.show();
            // }
            
            //TODO: fix the below
            /*else if (pass_it === false && Ti.App.Properties.getString("timestamp_offset") > OFF_BY) {
        
                var actual_time = Math.round(new Date().getTime() / 1000);
                actual_time = parseInt(actual_time) + parseInt(Ti.App.Properties.getString("timestamp_offset"));
        
                var server_time = new Date(actual_time);
        
                var _a = Titanium.UI.createAlertDialog({
                    title : 'Omadi',
                    buttonNames : ['Yes', 'No'],
                    message : 'Your device\'s clock is off a little bit. Please adjust your clock to ' + timeConverter(server_time, "1") + '. Do you want to save this form now using the correct time?',
                    cancel : 1
                });
                _a.show();
        
                _a.addEventListener('click', function(e) {
                    if (e.index != e.cancel) {
                        var _i;
                        for (_i in content) {
                            Ti.API.info("Field: " + content[_i].field_type);
                            if (content[_i].field_type == "datestamp" || content[_i].field_type == "omadi_time") {
                                var tp = content[_i].value;
                                content[_i].value = parseInt(content[_i].value) + parseInt(Ti.App.Properties.getString("timestamp_offset") * 1000);
                                alert(tp + '  =  ' + content[_i].value);
                                Ti.API.info(tp + '  =  ' + content[_i].value);
                            }
                        }
                        try {
                            save_form_data(_flag_info, true, actual_time);
                        }
                        catch(e) {
                            alert('Error Tracking 9: ' + e);
                            //To catch error to resolve issue #916
                        }
                    }
                    else {
                        try {
                            save_form_data(_flag_info, true, null);
                        }
                        catch(e) {
                            alert('Error Tracking 10: ' + e);
                            //To catch error to resolve issue #916
                        }
                    }
                });
        
            }*/
            //else {
               
                
                mode_msg = '';
                no_data_fields = [];
                
               
                
                //Ti.API.debug("showing indicator");
                
                //Omadi.display.showLoadingIndicator(mode_msg);
                
                
                //
                //Retrieve objects that need quotes:
                //
                // need_at = db_put.execute("SELECT field_name FROM fields WHERE bundle = '" + win.type + "' AND ( type='number_integer' OR type='number_decimal' ) ");
                // quotes = [];
                // while (need_at.isValidRow()) {
                    // quotes[need_at.fieldByName('field_name')] = true;
                    // need_at.next();
                // }
                // need_at.close();
                
                //var saved = false;
                
                node = Omadi.data.saveNode(node);
                
                if(node._saved === true){
                    Ti.UI.currentWindow.nodeSaved = true;
                }
                
                // Setup the current node and nid in the window so a duplicate won't be made for this window
                Ti.UI.currentWindow.node = node;
                Ti.UI.currentWindow.nid = node.nid;
                
                
                //has_bug = false;
                //try {
                    //Ti.API.info('Title: ' + title_to_node);
                    
        
                    //If Images captured and not yet uploaded then store in file_uploaded_queue
                    
                    // TODO: restore image functionality
                    // for ( j = 0; j <= content.length; j++) {
                        // if (!content[j]) {
                            // continue;
                        // }
                        // if (content[j].field_type == 'image' && win.mode == 1) {
                            // db_put.execute('UPDATE ' + win.type + ' SET ' + content[j].field_name + '="' + oldVal.fieldByName(content[j].field_name) + '", ' + content[j].field_name + '___file_id="' + oldVal.fieldByName(content[j].field_name + '___file_id') + '", ' + content[j].field_name + '___status="' + oldVal.fieldByName(content[j].field_name + '___status') + '" WHERE nid=' + file_upload_nid + ';');
                        // }
                    // }
        
                   
        
                 
                   
                // }
                // catch(e) {
                    // Ti.API.error("Error----------" + e);
//         
                    // if (_flag_info == 'draft') {
//                         
                        // alert('An error has occurred when we tried to save this node as a draft, please try again');
                    // }
                    // else if (win.mode == 1) {
//                         
                       // alert('An error has occurred when we tried to update this new node, please try again');
                    // }
                    // else {
//                         
                        // alert('An error has occurred when we tried to create this new node, please try again');
                    // }
//                    
                // }

        
                //Ti.API.info('========= Updating new info running ========= ' + _flag_info);
                
                //var alertMessage = "";
                // if(has_bug){
                    // alert("There was a problem saving your data. Please try again. If this error continues, please report the problem.");
                // }
                // else if(_flag_info == 'draft'){
                    // alert('The ' + win.title + ' was saved as a draft.');
                    // close_me();
                // }
                
                if(node._saved === true){
                    if(Ti.Network.online){
                       
                       if (saveType === "next_part") {
                            Omadi.display.openFormWindow(win.type, node.nid, node.form_part + 1);                            
                        }
                        
                        // Send a clone of the object so the window will close after the network returns a response
                        Omadi.service.sendUpdates();
                        
                        if(PLATFORM === 'android'){
                            //Ti.UI.currentWindow.close();
                            //Ti.UI.currentWindow.setOpacity(0);
                            Ti.UI.currentWindow.close();
                        }
                        else{
                            Ti.UI.currentWindow.hide();
                        }
                    }
                    else{
                        dialog = Titanium.UI.createAlertDialog({
                            title : 'Form Validation',
                            buttonNames : ['OK'],
                            message: 'Alert management of this ' + node.type.toUpperCase() + ' immediately. You do not have an Internet connection right now.  Your data was saved and will be synched when you connect to the Internet.'
                        });
                        
                        dialog.show();
                        
                        dialog.addEventListener('click', function(ev) {
                            
                            
                            if (saveType === "next_part") {
                                Omadi.display.openFormWindow(win.type, node.nid, node.form_part + 1);
                            }
                            
                            Ti.UI.currentWindow.close();
                        });
                    }
                    
                    
                }
        }
        catch(ex){
            alert("Saving to mobile database: " + ex);
        }
    }
}


function bottomButtons() {"use strict";
    /*jslint eqeq: true, vars: true*/
   /*global Omadi, PLATFORM*/
    
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
        var label = Titanium.UI.createButton({
            title : node.title,
            color : Omadi.widgets.label.color,
            ellipsize : true,
            wordwrap : false,
            width : 200,
            style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
        });

        var actions = Ti.UI.createButton({
            title : 'Actions',
            style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
        });

        actions.addEventListener('click', function() {
            var bundle;
    
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
           
            btn_tt.push('Draft');
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
            items : [back, space, label, space, actions],
            top : 0,
            borderTop : false,
            borderBottom : true
        });
        Ti.UI.currentWindow.add(toolbar);
        
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
                
                //Ti.API.debug(violationTextValues);
                
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
                Ti.API.error(JSON.stringify(widget));
                
                if(typeof fieldWrappers[field_name] !== 'undefined'){
                    //valueWidget = Omadi.widgets.getValueWidget(field_name);
                    
                    
                    if (widget.rules_field_name != null && widget.rules_field_name != "") {
                        Ti.API.error(JSON.stringify(widget.rules_field_name));
                        
                        Omadi.widgets.setValueWidgetProperty(widget.rules_field_name, 'onChangeCallbacks', [changeViolationFieldOptions]);
                        Omadi.widgets.setValueWidgetProperty(widget.rules_field_name, 'onChangeCallbackArgs', [[field_name]]);
                        
                        //referenceWidget.onChangeCallbacks.push(changeViolationFieldOptions);
                        
                        //var _reffer_index = entityArr[content_widget['rules_field_name']][0]['reffer_index'];
                        //var _rulesFieldArr;
                        //if (content[_reffer_index].rulesFieldArr == null) {
                        //    _rulesFieldArr = [];
                        //    content[_reffer_index].rulesFieldArr = _rulesFieldArr;
                        //}
                        //_rulesFieldArr = content[_reffer_index].rulesFieldArr;
                        //_rulesFieldArr.push(content[j].reffer_index);
                        //content[_reffer_index].rulesFieldArr = _rulesFieldArr;
                        
                        if (widget.rules_violation_time_field_name != null && widget.rules_violation_time_field_name != "") {
                            Ti.API.error(JSON.stringify(widget.rules_violation_time_field_name));
                            
                            Omadi.widgets.setValueWidgetProperty(widget.rules_violation_time_field_name, 'onChangeCallbacks', [changeViolationFieldOptions]);
                            Omadi.widgets.setValueWidgetProperty(widget.rules_violation_time_field_name, 'onChangeCallbackArgs', [[field_name]]);
                            
                            //referenceWidget.onChangeCallbacks.push(changeViolationFieldOptions);
                            
                            //var _reffer_index = entityArr[content_widget['rules_field_name']][0]['reffer_index'];
                            //var _rulesFieldArr;
                            //if (content[_reffer_index].rulesFieldArr == null) {
                            //    _rulesFieldArr = [];
                            //    content[_reffer_index].rulesFieldArr = _rulesFieldArr;
                            //}
                            //_rulesFieldArr = content[_reffer_index].rulesFieldArr;
                            //_rulesFieldArr.push(content[j].reffer_index);
                            //content[_reffer_index].rulesFieldArr = _rulesFieldArr;
                        }
                    }
                    
                    // Initialize the field for default values
                    changeViolationFieldOptions(field_name);
                }
            }
        }
    }
    
    // return;
    // if (content[j].widgetObj != null && content[j].widgetObj.type == 'violation_select') {
        // var content_widget = content[j].widgetObj;
        // // if (content_widget['rules_field_name'] != null && content_widget['rules_field_name'] != "") {
            // // var _reffer_index = entityArr[content_widget['rules_field_name']][0]['reffer_index'];
            // // var _rulesFieldArr;
            // // if (content[_reffer_index].rulesFieldArr == null) {
                // // _rulesFieldArr = [];
                // // content[_reffer_index].rulesFieldArr = _rulesFieldArr;
            // // }
            // // _rulesFieldArr = content[_reffer_index].rulesFieldArr;
            // // _rulesFieldArr.push(content[j].reffer_index);
            // // content[_reffer_index].rulesFieldArr = _rulesFieldArr;
        // // }
// 
        // if (content_widget['rules_violation_time_field_name'] != null && content_widget['rules_violation_time_field_name'] != "") {
            // var _reffer_index = entityArr[content_widget['rules_violation_time_field_name']][0]['reffer_index'];
            // var _rulesFieldArr;
            // if (content[_reffer_index].rulesFieldArr == null) {
                // _rulesFieldArr = [];
                // content[_reffer_index].rulesFieldArr = _rulesFieldArr;
            // }
            // _rulesFieldArr = content[_reffer_index].rulesFieldArr;
            // _rulesFieldArr.push(content[j].reffer_index);
            // content[_reffer_index].rulesFieldArr = _rulesFieldArr;
        // }
// 
        // if (win.mode == 1) {
            // if (content_widget['rules_field_name'] != null && content_widget['rules_violation_time_field_name'] != null && content_widget['rules_field_name'] != "" && content_widget['rules_violation_time_field_name'] != "") {
                // var title = '';
                // var value = content[j].value;
                // if (content[j].settings.cardinality > 1 || content[j].settings.cardinality == 1) {
                    // title = content[j].title;
                // }
                // else if (content[j].settings.cardinality == -1) {
                    // title = content[j].text;
                // }
                // setParticularRulesField(content[j]);
                // content[j].value = value;
                // if (content[j].settings.cardinality > 1 || content[j].settings.cardinality == 1) {
                    // content[j].title = title;
                // }
                // else if (content[j].settings.cardinality == -1) {
                    // content[j].text = title;
                    // //for(var itens_idx =0; itens_idx<content[j].itens.length; itens_idx++){
                    // //for(var value_idx=0; value_idx < content[j].value.length ; value_idx++){
                    // //alert(content[j].itens[itens_idx][0].v_into);
                    // //alert(content[j].value[value_idx][0].v_into);
                    // //if(content[j].itens[itens_idx].v_into == content[j].value[value_idx].v_into){
                    // //content[j].itens[itens_idx].is_set = true;
                    // //}
                    // //}
                    // //}
                    // var itens = content[j].itens;
                    // var value = content[j].value;
                    // var itens_idx;
                    // for (itens_idx in itens) {
                        // var value_idx;
                        // for (value_idx in value) {
                            // if (itens[itens_idx].v_info == value[value_idx].v_info) {
                                // itens[itens_idx].is_set = true;
                            // }
                        // }
                    // }
                    // content[j].itens = itens;
                // }
// 
            // }
        // }
// 
    // }
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

//Ti.API.error("WIN NID: " + win.nid);

(function(){"use strict";
    
    /*jslint vars: true, eqeq: true*/
   /*global Omadi,PLATFORM, loadNode */
   
   
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
    
    win.setOrientationModes([Ti.UI.PORTRAIT]);

    if (PLATFORM === 'android') {
        //The view where the results are presented
        formWrapperView = Ti.UI.createView({
            top : 0,
            height : '100%',
            width : '100%',
            backgroundColor : '#EEEEEE',
            opacity : 1
        });
        win.add(formWrapperView);

        scrollView = Ti.UI.createScrollView({
            bottom : 0,
            contentHeight : 'auto',
            backgroundColor : '#EEEEEE',
            showHorizontalScrollIndicator : false,
            showVerticalScrollIndicator : true,
            opacity : 1,
            scrollType : "vertical",
            zIndex : 10,
            layout: 'vertical',
            height: Ti.UI.SIZE,
            top: 0
        });
    }
    else {

        //The view where the results are presented
        formWrapperView = Ti.UI.createView({
            top : 45,
            height : Ti.UI.SIZE,
            width : '100%',
            bottom : 0,
            backgroundColor : '#EEEEEE',
            opacity : 1
        });
        win.add(formWrapperView);

        scrollView = Ti.UI.createScrollView({
            contentHeight : 'auto',
            backgroundColor : '#EEEEEE',
            showHorizontalScrollIndicator : false,
            showVerticalScrollIndicator : true,
            opacity : 1,
            scrollType : "vertical",
            zIndex : 10,
            layout: 'vertical',
            height: Ti.UI.SIZE,
            top: 0
        });
    }
    
    scrollView.addEventListener('scroll', function(e){
        scrollPositionY = e.y;
    });

    formWrapperView.add(scrollView);

   //scrollView is the parent container
   
    instances = Omadi.data.getFields(win.type);
    var field_name;
    var instance;
    var i, j;
    
    
    //db_display = Omadi.utils.openMainDatabase();
    
    // regions = db_display.execute('SELECT * FROM regions WHERE node_type = "' + win.type + '" ORDER BY weight ASC');
    // if (win.mode == 1) {
        // var node_table = db_display.execute('SELECT * FROM node WHERE nid=' + win.nid);
        // if (node_table.rowCount > 0) {
            // var no_data_fields = node_table.fieldByName('no_data_fields');
            // if (no_data_fields != null && no_data_fields != "") {
                // no_data_fields = JSON.parse(no_data_fields);
                // var key;
                // for (key in no_data_fields) {
                    // if (no_data_fields.hasOwnProperty(key)) {
                        // no_data_fieldsArr.push(key);
                    // }
                // }
            // }
        // }
    // }

    var region_name;
    var regionHeaderView;
    var regionView;
    
    if(win.nid == 'new'){
        node = getNewNode();
    }
    else{
        node = loadNode(win.nid);
    }
    
    Ti.API.debug("LOADED NODE: " + JSON.stringify(node));
    
    if(typeof win.form_part !== 'undefined'){
        node.form_part = win.form_part;
    }
    
    win.node = node;
    
    if (PLATFORM === 'android') {
        get_android_menu();
    }
    else {
        bottomButtons();
    }
    
    regions = Omadi.data.getRegions(win.type);
    var region;
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
                if(region_form_part < node.form_part){
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
    
    for(field_name in instances){
        if(instances.hasOwnProperty(field_name)){
            
            instance = instances[field_name];        
            
            var settings = instance.settings;
            var isRequired = instance.required;
            var labelColor = "#246";
            
            instance.can_view = false;
            instance.can_edit = false;
                
            if (settings.enforce_permissions != null && settings.enforce_permissions == 1) {
                for (i in settings.permissions) {
                    if(settings.permissions.hasOwnProperty(i)){
                        for (j in roles) {
                            if(roles.hasOwnProperty(j)){
                                if (i == j) {
                                    var stringifyObj = JSON.stringify(settings.permissions[i]);
                                    if (stringifyObj.indexOf('update') >= 0 || settings.permissions[i].all_permissions) {
                                        instance.can_edit = true;
                                    }
        
                                    if (stringifyObj.indexOf('view') >= 0 || settings.permissions[i].all_permissions) {
                                        instance.can_view = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else {
                instance.can_view = instance.can_edit = true;
            }
            
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
    /*global search_criteria_search_order, isArray, labelViews*/
   
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
                    
                    Ti.API.debug(field_name);
                    
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
                            if (!isArray(search_value)) {
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
                            
                            
                            if (search_operator != null && search_operator == '!=') {
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
    
                        // case 'calculation_field':
                        // //TODO: finish this
                            // Ti.API.error("no calculation_field in conditional");
                            // for (idx1 in entityArr[field_name]) {
                                // var elements = entityArr[field_name][idx1];
                                // node_values.push(elements['value']);
                            // }
                            // node_value = node_values[0];
                            // switch(search_operator) {
//     
                                // case '>':
                                    // if (node_value > search_value) {
                                        // row_matches[row_idx] = true;
                                    // }
                                    // break;
                                // case '>=':
                                    // if (node_value >= search_value) {
                                        // row_matches[row_idx] = true;
                                    // }
                                    // break;
                                // case '!=':
                                    // if (node_value != search_value) {
                                        // row_matches[row_idx] = true;
                                    // }
                                    // break;
                                // case '<':
                                    // if (node_value < search_value) {
                                        // row_matches[row_idx] = true;
                                    // }
                                    // break;
                                // case '<=':
                                    // if (node_value <= search_value) {
                                        // row_matches[row_idx] = true;
                                    // }
                                    // break;
//     
                                // default:
                                    // if (node_value == search_value) {
                                        // row_matches[row_idx] = true;
                                    // }
                                    // break;
                            // }
//     
                          //  break;
    
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
    catch(ex){
        alert("Changing conditional value: " + ex);
    }
}


