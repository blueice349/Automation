
Ti.include("/lib/widgets.js");
/*global Omadi*/
/*jslint eqeq:true,plusplus:true*/

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

Ti.UI.currentWindow.saveContinually = true;
Ti.UI.currentWindow.saveInterval = null;

if (Ti.App.isAndroid) {
    cameraAndroid = require('com.omadi.newcamera');
}


function cancelOpt() {"use strict";
    var dialog, photoNids;
    
    dialog = Ti.UI.createAlertDialog({
        cancel : 1,
        buttonNames : ['Yes', 'No'],
        message : 'Are you sure you want to cancel and go back?',
        title : 'Cancel'
    });

    dialog.addEventListener('click', function(e) {
        var db, result, numPhotos, secondDialog, negativeNid, query, continuousId, 
            photoNids, types, dialogTitle, dialogMessage, messageParts;
        
        if (e.index == 0) {
            
            
            if(node.flag_is_updated == 3){
                // The original node is a draft
                if(!isNaN(parseInt(Ti.UI.currentWindow.nid, 10))){
                    // Add any newly created/removed photos to the draft so they aren't lost
                    photoNids = [0];
                    if(typeof Ti.UI.currentWindow.continuous_nid !== 'undefined'){
                        continuousId = parseInt(Ti.UI.currentWindow.continuous_nid, 10);
                        if(!isNaN(continuousId) && continuousId != 0){
                            photoNids.push(continuousId);
                        }
                    }
                    
                    db = Omadi.utils.openMainDatabase();
                    db.execute("UPDATE _files SET nid = " + Ti.UI.currentWindow.nid + " WHERE nid IN (" + photoNids.join(",") + ")");
                    db.close();
                }
                
                Omadi.data.deleteContinuousNodes();
                Ti.UI.currentWindow.close();
            }
            else if(Omadi.utils.getPhotoWidget() == 'choose'){
                // This is not a draft, and we don't care about the taken photos
                // Nothing to delete with the choose widget
                // Photos should be managed externally except when uploaded successfully
                
                Omadi.data.deleteContinuousNodes();
                Ti.UI.currentWindow.close();
            }
            else{
                // Regular save with photos being taken inside the app
                
                photoNids = [0];
                if(typeof Ti.UI.currentWindow.continuous_nid !== 'undefined'){
                    continuousId = parseInt(Ti.UI.currentWindow.continuous_nid, 10);
                    if(!isNaN(continuousId) && continuousId < 0){
                        // Don't do anything with the photos with a positive nid
                        photoNids.push(continuousId);
                    }
                }
                
                query = "SELECT COUNT(*) FROM _files WHERE nid IN (" + photoNids.join(',') + ")";
                // if(Ti.UI.currentWindow.nid < 0){
                    // query += " OR nid = " + Ti.UI.currentWindow.nid;
                // }
                
                numPhotos = 0;
        
                db = Omadi.utils.openMainDatabase();
                
                result = db.execute(query);
                if(result.isValidRow()){
                    numPhotos = result.field(0, Ti.Database.FIELD_TYPE_INT);
                }
                result.close();
                
                types = {};
                
                if(numPhotos > 0){
                    result = db.execute("SELECT type FROM _files WHERE nid IN (" + photoNids.join(',') + ")");
                    while(result.isValidRow()){
                        
                        if(typeof types[result.fieldByName('type')] === 'undefined'){
                            types[result.fieldByName('type')] = 1;
                        }
                        else{
                            types[result.fieldByName('type')] ++;
                        }
                        
                        result.next();
                    }
                    result.close();
                    
                    if(Omadi.utils.count(types) > 1){
                        dialogTitle = 'Delete ' + numPhotos + ' Files';
                        dialogMessage = 'Do you want to delete the ';
                        messageParts = [];
                        
                        if(typeof types.image !== 'undefined'){
                            if(types.image == 1){
                                messageParts.push('photo');
                            }
                            else{
                                messageParts.push(types.image + ' photos');
                            }
                        }
                        if(typeof types.video !== 'undefined'){
                            if(types.video == 1){
                                messageParts.push('video');
                            }
                            else{
                                messageParts.push(types.video + ' videos');
                            }
                        }
                        if(typeof types.signature !== 'undefined'){
                            if(types.signature == 1){
                                messageParts.push('signature');
                            }
                            else{
                                messageParts.push(types.signature + ' signature');
                            }
                        }
                        if(typeof types.file !== 'undefined'){
                            if(types.file == 1){
                                messageParts.push('1 file');
                            }
                            else{
                                messageParts.push(types.file + ' files');
                            }
                        }
                        
                        dialogMessage += messageParts.join(' and ') + "?";
                    }
                    else{
                        if(numPhotos == 1){
                            dialogTitle = 'Delete 1 ';
                            dialogMessage = 'Do you want to delete the ';
                            if(typeof types.image !== 'undefined'){
                                dialogTitle += 'Photo';
                                dialogMessage += 'photo you just took?';
                            }
                            else if(typeof types.video !== 'undefined'){
                                dialogTitle += 'Video';
                                dialogMessage += 'video you just attached?';
                            }
                            else if(typeof types.signature !== 'undefined'){
                                dialogTitle += 'Signature';
                                dialogMessage += 'signature?';
                            }
                            else{
                                dialogTitle += 'File';
                                dialogMessage += 'file just selected?';
                            }
                        }
                        else{
                            dialogTitle = 'Delete ' + numPhotos + ' ';
                            dialogMessage = 'Do you want to delete the ' + numPhotos + ' ';
                            if(typeof types.image !== 'undefined'){
                                dialogTitle += 'Photos';
                                dialogMessage += 'photos you just took?';
                            }
                            else if(typeof types.video !== 'undefined'){
                                dialogTitle += 'Videos';
                                dialogMessage += 'videos you just attached?';
                            }
                            else if(typeof types.signature !== 'undefined'){
                                dialogTitle += 'Signatures';
                                dialogMessage += 'signatures?';
                            }
                            else{
                                dialogTitle += 'Files';
                                dialogMessage += 'files just selected?';
                            }
                        }
                    }
                }
                    
                db.close();
                
                if(numPhotos > 0){
                    secondDialog = Ti.UI.createAlertDialog({
                        cancel : 1,
                        buttonNames : ['Delete', 'Keep', 'Cancel'],
                        message : dialogMessage,
                        title : dialogTitle
                    });
                    
                    secondDialog.addEventListener('click', function(e) {
                        var db_toDeleteImage, deleteResult, file, photoNids, continuousId;
                        
                        photoNids = [0];
                        if(typeof Ti.UI.currentWindow.continuous_nid !== 'undefined'){
                            continuousId = parseInt(Ti.UI.currentWindow.continuous_nid, 10);
                            if(!isNaN(continuousId) && continuousId != 0){
                                photoNids.push(continuousId);
                            }
                        }
                        
                        if(e.index === 0 || e.index === 1){
                            
                            db_toDeleteImage = Omadi.utils.openMainDatabase();
                            
                            if (e.index === 0) {
                                
                                deleteResult = db_toDeleteImage.execute("SELECT file_path FROM _files WHERE nid IN (" + photoNids.join(',') + ")");
                                
                                while(deleteResult.isValidRow()){
                                    
                                    file = Ti.Filesystem.getFile(deleteResult.fieldByName("file_path"));
                                    
                                    if(file.exists()){
                                        file.deleteFile();
                                    }
                                    
                                    deleteResult.next();
                                }
                                
                                deleteResult.close();
                                
                                db_toDeleteImage.execute("DELETE FROM _files WHERE nid IN (" + photoNids.join(",") + ")");
                                
                            }
                            else if(e.index === 1){
                                // Set the nid of the photos to save to -1000000, so they won't be deleted by deletion of other photos, 
                                // and so it isn't automatically used by other new nodes
                                db_toDeleteImage.execute("UPDATE _files SET nid = -1000000 WHERE nid IN (" + photoNids.join(",") + ")");
                            }
                            
                            db_toDeleteImage.close();
                            
                            Omadi.data.deleteContinuousNodes();
                            Ti.UI.currentWindow.close();
                        }
                    });
                    
                    secondDialog.show();
                }
                else{
                    
                    Omadi.data.deleteContinuousNodes();
                    Ti.UI.currentWindow.close();
                }
            }
        }
    });

    dialog.show(); 
}

function get_android_menu(menu_exists) {"use strict";
    /*jslint eqeq: true */
   /*global Omadi, save_form_data*/
   
    win.activity.onCreateOptionsMenu = function(e) {
        var db, result, menu_zero, bundle, btn_tt, btn_id, menu_first, menu_second, menu_third, menu_save_new;
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
        
        menu_save_new = menu.add({
            title : 'Save + New',
            order : 2
        });
        menu_save_new.setIcon(Omadi.display.getNodeTypeImagePath(Ti.UI.currentWindow.type));
    
        menu_second = menu.add({
            title : 'Save as Draft',
            order : 3
        });
        menu_second.setIcon("/images/drafts_android.png");
    
        menu_third = menu.add({
            title : 'Cancel',
            order : 4
        });
        menu_third.setIcon("/images/cancel.png");
    
        //======================================
        // MENU - EVENTS
        //======================================
        menu_first.addEventListener("click", function(e) {
            save_form_data('normal');
        });
        
        menu_save_new.addEventListener("click", function(e) {
            Ti.API.debug("SAVING + NEW");
            save_form_data('new');
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
    node.flag_is_updated = 0;
    
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
       
       //Ti.API.debug(node);
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
            if(maxLength > 0){
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
                case 'list_text':
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
             if(instance.type == 'location'){
                 
                 if(instance.part == 'postal_code'){
                     if(typeof instance.settings.require_zip !== 'undefined' && instance.settings.require_zip == 1){
                         form_errors.push(instance.label + " " + instance.partLabel + " is required");
                     }
                 }
                 else{
                     form_errors.push(instance.label + " " + instance.partLabel + " is required");
                 }
             }
             else{
                        
                 if(instance.partLabel === null){
                     form_errors.push(instance.label + " is required");
                 }
                 else{
                     form_errors.push(instance.label + " " + instance.partLabel + " is required");
                 }
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
    
    var arrow_img, regionHeader, regionHeaderWrapper, collapsedView;
    
    arrow_img = Ti.UI.createImageView({
        image : '/images/light_arrow_left.png',
        width : 29,
        height : 29,
        top: 5,
        right: 5,
        zIndex : 999,
        touchEnabled: false
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
    
    collapsedView = Ti.UI.createLabel({
        top: 40,
        width: '100%',
        height: Ti.UI.SIZE,
        text: region.label + ' is Collapsed',
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        borderWidth: 1,
        borderColor: '#ccc',
        color: '#666',
        font: {
            fontSize: 13
        },
        backgroundColor: '#ddd'
    });
    
    if(expanded){
        collapsedView.visible = false;
        collapsedView.borderWidth = 0;
    }
    
    regionHeader.arrow = arrow_img;
    regionHeader.collapsedView = collapsedView;
    
    regionHeader.addEventListener('click', function(e) {
        
        var regionView;
        e.source.expanded = !e.source.expanded;
        
        if (e.source.expanded === true) {
            
            regionView = regionViews[e.source.region_name];
            regionView.startLayout();
            
            e.source.collapsedView.hide();
            e.source.collapsedView.setBorderWidth(0);

            regionView.show();
            //regionView.setHeight(Ti.UI.SIZE);
            
            e.source.arrow.setImage("/images/light_arrow_down.png");
            
            regionView.finishLayout();
            regionView.setHeight(Ti.UI.SIZE);
            
            // For iOS, just make sure the region is expanded as layout doesn't always happen
            if(Ti.App.isIOS){
                setTimeout(function(){
                    regionView.setHeight(Ti.UI.SIZE);
                }, 100);
            }
        }
        else {
            
            regionView = regionViews[e.source.region_name];
            regionView.startLayout();
            
            e.source.collapsedView.show();
            e.source.collapsedView.setBorderWidth(1);
            
            regionView.hide();
            
            regionView.setHeight(0);
           
            e.source.arrow.setImage("/images/light_arrow_left.png");
            
            regionView.finishLayout();
        }
    });
    
    regionHeaderWrapper.add(regionHeader);
    regionHeaderWrapper.add(arrow_img);
    regionHeaderWrapper.add(collapsedView);
    
    return regionHeaderWrapper;
}


function save_form_data(saveType) {"use strict";
    /*jslint nomen: true*/
    var node, form_errors, string_text, string_err, count_fields, value_err, now, field_name, dialog,
        oldVal, file_upload_nid, has_bug, no_data_fields_content, instance, insertValues, mode_msg, 
        no_data_fields, db_put, need_at, quotes, nid, new_nid, query, _array_value, x_j, 
        title_to_node, j, field_names, content_s, value_to_insert, formWin;
    
    Ti.API.info("Save_form_data");
    
    node = formToNode();
    
    Ti.API.debug("Saving with type " + saveType);
    
    if(saveType == 'draft'){
        node._isDraft = true;
    }
    else{
        node._isDraft = false;
    }
    
    if(saveType == 'continuous'){
        node._isContinuous = true;
    }
    else{
        node._isContinuous = false;
    }
    
    node.viewed = Omadi.utils.getUTCTimestamp();
    
    form_errors = [];
    
    if(node._isDraft === false && node._isContinuous === false){
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
            btn_id.push('normal');

            //Ti.API.info('BUNDLE: ' + JSON.stringify(bundle));
            if(bundle.can_create == 1){
                btn_tt.push("Save + New");
                btn_id.push("new");
            }
            
            if (bundle.data.form_parts != null && bundle.data.form_parts != "") {

                if (bundle.data.form_parts.parts.length >= node.form_part + 2) {

                    btn_tt.push("Save + " + bundle.data.form_parts.parts[node.form_part + 1].label);
                    btn_id.push('next');
                }
            }
            
            btn_tt.push('Save as Draft');
            btn_id.push('draft');
            
            btn_tt.push('Cancel');
            btn_id.push('cancel');

            var postDialog = Titanium.UI.createOptionDialog();
            postDialog.options = btn_tt;
            postDialog.show();

            postDialog.addEventListener('click', function(ev) {
                
                if(Ti.UI.currentWindow.nodeSaved === false){
                    if(ev.index != -1){
                        if(btn_id[ev.index] == 'next'){
                            save_form_data('next_part');
                        }
                        else if(btn_id[ev.index] == 'draft'){
                            save_form_data('draft');
                        }
                        else if(btn_id[ev.index] == 'new'){
                            save_form_data('new');
                        }
                        else if(btn_id[ev.index] == 'normal'){
                            save_form_data('normal');
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
    
    //Ti.API.info("hello");
    // Ti.API.info(JSON.stringify(violation_instance.widget));
    
    reference_field_name = violation_instance.widget.rules_field_name;
    rules_parent_field_name = violation_instance.widget.rules_parent_field_name;
    rules_violation_time_field_name = violation_instance.widget.rules_violation_time_field_name;
    
    parentNidDBValues = Omadi.widgets.getDBValues(fieldWrappers[reference_field_name]);
    
    //Ti.API.info(JSON.stringify(parentNidDBValues));
    
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
    var fromBundle, newNode, to_field_name, from_field_name, index;
    
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
    
    if(fromBundle){
        if(originalNode){
            if(typeof fromBundle.data !== 'undefined'){
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
        }
        
        // If there is also a child/parent relationship with the forms, add the parent reference to the child node
        if(typeof fromBundle.child_forms !== 'undefined' && fromBundle.child_forms.length){
            for(index in fromBundle.child_forms){
                if(fromBundle.child_forms.hasOwnProperty(index)){
                    
                    if(fromBundle.child_forms[index].child_node_type == to_type){
                        
                        newNode[fromBundle.child_forms[index].child_field_name] = {};
                        newNode[fromBundle.child_forms[index].child_field_name].dbValues = [];
                        newNode[fromBundle.child_forms[index].child_field_name].textValues = [];
                        newNode[fromBundle.child_forms[index].child_field_name].dbValues.push(originalNode.nid);
                        newNode[fromBundle.child_forms[index].child_field_name].textValues.push(originalNode.title);
                        break;
                    }
                }
            }
        }
    }
    else{
        Ti.API.error("No bundle found for " + from_type);
        Omadi.service.sendErrorReport("No bundle found for " + from_type);
    }
    
    return newNode;
}

var field_name;
    var instance;
    var i, j;
    var region_name;
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
    
    Ti.API.debug("Affecting fields: " + JSON.stringify(affectedFields));
    
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
    
    try {
    
        row_matches = [];
        
        // instance = instances[check_field_name];
         //Ti.API.debug("In Conditional for " + instance.field_name);
         //Ti.API.debug(instance);
        
        if (instance.settings.criteria != null && instance.settings.criteria.search_criteria != null) {
            //instance.settings.criteria.search_criteria.sort(search_criteria_search_order);
            
            search_criteria = instance.settings.criteria.search_criteria;
            search_criteria.sort(sort_by_weight);
            
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
                    
                    if(typeof instances[field_name] !== 'undefined' && typeof instances[field_name].type !== 'undefined'){
                    
                        //Ti.API.debug(JSON.stringify(values));
                        switch(instances[field_name].type) {
                            case 'text':
                            case 'text_long':
                            case 'link_field':
                            case 'phone':
                            case 'license_plate':
                            case 'vehicle_fields':
                            case 'number_integer':
                            case 'number_decimal':
                            case 'email':
                            case 'datestamp':
                            case 'omadi_reference':
                            case 'omadi_time':
                            case 'calculation_field':
                            case 'location':
                            
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
                                
                            //case 'location':
                                
                                // Ti.API.debug(instances[field_name]);
                                
                                // if (search_operator == '__filled') {
                                    // for (i = 0; i < values.length; i++) {
                                        // if (values[i] != null && values[i] != "") {
                                            // row_matches[row_idx] = true;
                                        // }
                                    // }
                                // }
                                // else {
                                    // if (values.length == 0) {
                                        // row_matches[row_idx] = true;
                                    // }
                                    // else {
                                        // for (i = 0; i < values.length; i ++){
                                            // if (values[i] == null || values[i] == "") {
                                                // row_matches[row_idx] = true;
                                            // }
                                        // }
                                    // }
                                // }
                                //break;
                                
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
            }
            
            if(typeof labelViews[instance.field_name] !== 'undefined'){
            
                if (makeRequired) {
                    if (!instance.isConditionallyRequired) {
                        if(labelViews[instance.field_name].text.substring(0,1) != '*'){
                            labelViews[instance.field_name].text = '*' + labelViews[instance.field_name].text;
                        }
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
        Omadi.service.sendErrorReport("Changing conditional value: " + ex);
    }
}

function photoUploadedForm(e){"use strict";
    
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
}

function loggingOutForm(){"use strict";
    Ti.UI.currentWindow.close();
}

function formFullyLoadedForm(){"use strict";
    var field_name;
    
    Ti.UI.currentWindow.fireEvent("customCopy");
    
    for(field_name in instances){
        if(instances.hasOwnProperty(field_name)){
            widgetView = Omadi.widgets.getValueWidget(field_name);
            
            if(widgetView && typeof widgetView.check_conditional_fields !== 'undefined'){
                setConditionallyRequiredLabels(instances[field_name], widgetView.check_conditional_fields);
            }
        }
    }
}

function switchedNodeIdForm(e){"use strict";
  
    Ti.API.error(JSON.stringify(e));
   
    if(Ti.UI.currentWindow.nid == e.negativeNid){   
       Ti.UI.currentWindow.nid = e.positiveNid;
       Ti.UI.currentWindow.node.nid = e.positiveNid;
       Ti.API.error("new nid: " + Ti.UI.currentWindow.nid);
   }
}

function continuousSave(){
    if(Ti.UI.currentWindow.saveContinually){
        save_form_data('continuous');
    }
    else{
        clearInterval(Ti.UI.currentWindow.saveInterval);
    }
}
    

(function(){"use strict";
    var field_name, tempNid;
    
    /*jslint vars: true, eqeq: true*/
    /*global Omadi*/
    
    Ti.UI.currentWindow.addEventListener("android:back", cancelOpt);
    
    // Do not let the app log this user out while on the form screen
    // Allow again when the node is saved
    Ti.App.allowBackgroundLogout = false;
    
    if(Ti.UI.currentWindow.nid == 'new'){
        node = getNewNode();
        Ti.UI.currentWindow.nid = 'new';
        Ti.UI.currentWindow.continuous_nid = 0;
    }
    else{
        node = Omadi.data.nodeLoad(win.nid);
        // Make sure the window nid is updated to the real nid, as it could have changed in nodeLoad
        Ti.API.debug("continous 1: " + node.continuous_nid);
        Ti.API.debug("nid 1: " + node.nid);
        
        if(node.continuous_nid != null && node.continuous_nid != 0){
            tempNid = node.nid;
            node.nid = node.continuous_nid;
            node.continuous_nid = tempNid;
        }
        
        Ti.UI.currentWindow.nid = win.nid = node.nid;
        Ti.UI.currentWindow.continuous_nid = node.continuous_nid;
        
        Ti.API.debug("continuous nid: " + Ti.UI.currentWindow.continuous_nid);
        Ti.API.debug("window nid: " + Ti.UI.currentWindow.nid);
    }
    
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
            
            Ti.App.addEventListener("formFullyLoaded", formFullyLoadedForm);
            
            Ti.UI.currentWindow.addEventListener('close', function(){
                Ti.App.removeEventListener("formFullyLoaded", formFullyLoadedForm);
            });
        }
    }
    
    Ti.UI.currentWindow.node = node;
    
    Ti.API.debug("LOADED NODE: " + JSON.stringify(node));
    
    if(win.nid < 0){
        Ti.API.error("WIN NID: " + win.nid);
        
        Ti.App.addEventListener('switchedItUp', switchedNodeIdForm);
        
        Ti.UI.currentWindow.addEventListener('close', function(){
           Ti.App.removeEventListener('switchedItUp', switchedNodeIdForm); 
        });
    }
    
    Ti.App.addEventListener('photoUploaded', photoUploadedForm);
    Ti.App.addEventListener('loggingOut', loggingOutForm);
    
    if(Ti.UI.currentWindow.nid != "new" && Ti.UI.currentWindow.nid > 0){
        Omadi.service.setNodeViewed(Ti.UI.currentWindow.nid);
    }
    
    Ti.UI.currentWindow.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]);
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
           
            if(region_form_part <= node.form_part || (node.form_part == -1 && region_form_part == 0)){
                
                var expanded = true;
                if(typeof region.settings !== 'undefined' && 
                    region.settings != null &&
                    typeof region.settings.always_expanded !== 'undefined' && 
                    region.settings.always_expanded == 1){
                        
                        expanded = true;
                }
                else if(region_form_part < node.form_part){
                    expanded = false;
                }
                
                regionWrapperView = Ti.UI.createView({
                    height: Ti.UI.SIZE,
                    width: '100%',
                    layout: 'vertical'
                });
                
                regionWrapperView.add(getRegionHeaderView(region, expanded));
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
            var labelColor = "#246";
            
            if(node.form_part == -1){
                instance.isRequired = false;
            }
            else if(instance.required == 1){
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
                regionWrappers[region_name] = null;
            }
        }
    }
    
    Ti.App.fireEvent("formFullyLoaded");
    
    recalculateCalculationFields();
    
    if(hasViolationField){
        setupViolationField();
    }
    
    Ti.UI.currentWindow.addEventListener('close', function(){
        var regionWrappers_i, regionView_i, regionWrapperChild_i;
        
        Ti.App.removeEventListener('loggingOut', loggingOutForm);
        Ti.App.removeEventListener('photoUploaded', photoUploadedForm);
        
        // Remove region views from memory
        for(regionWrappers_i in regionWrappers){
            if(regionWrappers.hasOwnProperty(regionWrappers_i)){
                
                for(regionView_i in regionViews){
                    if(regionViews.hasOwnProperty(regionView_i)){
                        regionViews[regionView_i] = null;
                    }
                }
                
                if(regionWrappers[regionWrappers_i].children.length > 0){
                    for(regionWrapperChild_i in regionWrappers[regionWrappers_i].children){
                        if(regionWrappers[regionWrappers_i].children.hasOwnProperty(regionWrapperChild_i)){
                            regionWrappers[regionWrappers_i].remove(regionWrappers[regionWrappers_i].children[regionWrapperChild_i]);
                            regionWrappers[regionWrappers_i].children[regionWrapperChild_i] = null;
                        }
                    }
                }
                
                scrollView.remove(regionWrappers[regionWrappers_i]);
                regionWrappers[regionWrappers_i] = null;
            }
        }
        
        
        
        wrapperView.remove(scrollView);
        scrollView = null;
        
        //win.remove(wrapperView);
        wrapperView = null;
        

        fieldViews = null;
        instances = null;
        formWrapperView = null;
        menu = null;
        fieldWrappers = null;
        regionWrappers = null;
        regionViews = null;
        regions = null;
        node = null;
        win = null;
        regionWrapperView = null;
    });
    
    Ti.UI.currentWindow.saveInterval = setInterval(continuousSave, 15000);
    
}());

