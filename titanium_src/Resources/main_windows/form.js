
Ti.include("/lib/widgets.js");

/*global Omadi, PLATFORM*/
/*jslint eqeq: true, plusplus: true*/


var fieldViews = {};
var instances = {};

var win = Ti.UI.currentWindow;

win.setBackgroundColor("#eee");

var resultView, viewContent;

var menu;



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
            db_toDeleteImage.execute("DELETE FROM file_upload_queue WHERE nid=0;");
            db_toDeleteImage.close();
            
            Ti.UI.currentWindow.close();
        }
    });
    // TODO: uncomment this
    //dialog.show();
    
    Ti.UI.currentWindow.close();
}

function get_android_menu(menu_exists) {"use strict";
    /*jslint vars: true, eqeq: true, nomen: true */
   /*global Omadi, PLATFORM, save_form_data*/
  
   var db_act, json_data, _data, node_form, keep_node_form, menu_zero;
   
    if (menu_exists === true) {
        //======================================
        // MENU - UI
        //======================================

        var btn_tt = [];
        var btn_id = [];

        menu.clear();
        
       

        if (win.nid != null) {
            db_act = Omadi.utils.openMainDatabase();
            json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + win.type + '"');
            _data = JSON.parse(json_data.fieldByName('_data'));

            node_form = win.region_form;

            if (_data.form_parts != null && _data.form_parts != "") {
                Ti.API.info('Form table part = ' + _data.form_parts.parts.length);
                if (_data.form_parts.parts.length >= parseInt(node_form, 10) + 2) {
                    keep_node_form = node_form + 1;

                    Ti.API.info("Title = " + _data.form_parts.parts[keep_node_form].label);

                    menu_zero = menu.add({
                        title : "Save + " + _data.form_parts.parts[keep_node_form].label,
                        order : 0
                    });
                    menu_zero.setIcon("/images/drop.png");
                    menu_zero.addEventListener("click", function(ev) {
                        Ti.API.info('Form node part = ' + keep_node_form);
                        try {
                            save_form_data(keep_node_form, false);
                        }
                        catch(e) {
                            alert('Error Tracking 1: ' + ev);
                            //To catch error to resolve issue #916
                        }

                    });
                }
            }
            json_data.close();
            db_act.close();
        }
        else {
            db_act = Omadi.utils.openMainDatabase();

            json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + win.type + '"');
            _data = JSON.parse(json_data.fieldByName('_data'));

            node_form = 0;
            Ti.API.info('Form node part = ' + node_form);

            if (_data.form_parts != null && _data.form_parts != "") {
                Ti.API.info('Form table part = ' + _data.form_parts.parts.length);
                if (_data.form_parts.parts.length >= parseInt(node_form, 10) + 2) {
                    keep_node_form = node_form + 1;

                    Ti.API.info("<<<<<<<------->>>>>>> Title = " + _data.form_parts.parts[keep_node_form].label);

                    menu_zero = menu.add({
                        title : "Save + " + _data.form_parts.parts[keep_node_form].label,
                        order : 0
                    });
                    menu_zero.setIcon("/images/drop.png");
                    menu_zero.addEventListener("click", function(ev) {
                        Ti.API.info('====>> ' + keep_node_form);
                        try {
                            save_form_data(keep_node_form, false);
                        }
                        catch(e) {
                            alert('Error Tracking 2: ' + ev);
                            //To catch error to resolve issue #916
                        }

                    });
                }
            }
            json_data.close();
            db_act.close();
        }

        btn_tt.push('Save');
        btn_tt.push('Draft');
        btn_tt.push('Cancel');

        var menu_first = menu.add({
            title : 'Save',
            order : 1
        });
        menu_first.setIcon("/images/save.png");

        var menu_second = menu.add({
            title : 'Draft',
            order : 2
        });
        menu_second.setIcon("/images/draft.png");

        var menu_third = menu.add({
            title : 'Cancel',
            order : 3
        });
        menu_third.setIcon("/images/cancel.png");

        //======================================
        // MENU - EVENTS
        //======================================
        menu_first.addEventListener("click", function(e) {
            try {
                save_form_data('normal', false);
            }
            catch(ex) {
                alert('Error Tracking 3: ' + ex);
                //To catch error to resolve issue #916
            }
        });

        menu_second.addEventListener("click", function(e) {
            try {
                save_form_data('draft', false);
            }
            catch(ex) {
                alert('Error Tracking 4: ' + ex);
                //To catch error to resolve issue #916
            }
        });

        menu_third.addEventListener("click", function(e) {
            if (win.mode == 0) {
                Ti.UI.createNotification({
                    message : win.title + ' creation was cancelled !'
                }).show();
            }
            else {
                Ti.UI.createNotification({
                    message : win.title + ' update was cancelled !'
                }).show();
            }

            win.close();

        });
    }
    else {
        var activity = win.activity;
        activity.onCreateOptionsMenu = function(e) {

            //======================================
            // MENU - UI
            //======================================

            var btn_tt = [];
            var btn_id = [];

            menu = e.menu;
            menu.clear();

            if (win.nid != null) {
                db_act = Omadi.utils.openMainDatabase();

                json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + win.type + '"');
                _data = JSON.parse(json_data.fieldByName('_data'));

                node_form = win.region_form;

                if (_data.form_parts != null && _data.form_parts != "") {
                    Ti.API.info('Form table part = ' + _data.form_parts.parts.length);
                    if (_data.form_parts.parts.length >= parseInt(node_form, 10) + 2) {
                        keep_node_form = node_form + 1;

                        Ti.API.info("Title = " + _data.form_parts.parts[keep_node_form].label);

                        menu_zero = menu.add({
                            title : "Save + " + _data.form_parts.parts[keep_node_form].label,
                            order : 0
                        });
                        menu_zero.setIcon("/images/drop.png");
                        menu_zero.addEventListener("click", function(ev) {
                            Ti.API.info('Form node part = ' + keep_node_form);
                            try {
                                save_form_data(keep_node_form, false);
                            }
                            catch(e) {
                                alert('Error Tracking 5: ' + ev);
                                //To catch error to resolve issue #916
                            }

                        });
                    }
                }
                json_data.close();
                db_act.close();
            }
            else {
                db_act = Omadi.utils.openMainDatabase();

                json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + win.type + '"');
                _data = JSON.parse(json_data.fieldByName('_data'));

                node_form = 0;

                Ti.API.info('Form node part = ' + node_form);

                if (_data.form_parts != null && _data.form_parts != "") {
                    Ti.API.info('Form table part = ' + _data.form_parts.parts.length);
                    if (_data.form_parts.parts.length >= parseInt(node_form, 10) + 2) {
                        keep_node_form = node_form + 1;

                        Ti.API.info("<<<<<<<------->>>>>>> Title = " + _data.form_parts.parts[keep_node_form].label);

                        menu_zero = menu.add({
                            title : "Save + " + _data.form_parts.parts[keep_node_form].label,
                            order : 0
                        });
                        menu_zero.setIcon("/images/drop.png");
                        menu_zero.addEventListener("click", function(ev) {
                            Ti.API.info('====>> ' + keep_node_form);
                            try {
                                save_form_data(keep_node_form, false);
                            }
                            catch(e) {
                                alert('Error Tracking 6: ' + ev);
                                //To catch error to resolve issue #916
                            }

                        });
                    }
                }
                json_data.close();
                db_act.close();
            }

            btn_tt.push('Save');
            btn_tt.push('Draft');
            btn_tt.push('Cancel');

            var menu_first = menu.add({
                title : 'Save',
                order : 1
            });
            menu_first.setIcon("/images/save.png");

            var menu_second = menu.add({
                title : 'Draft',
                order : 2
            });
            menu_second.setIcon("/images/draft.png");

            var menu_third = menu.add({
                title : 'Cancel',
                order : 3
            });
            menu_third.setIcon("/images/cancel.png");

            //======================================
            // MENU - EVENTS
            //======================================
            menu_first.addEventListener("click", function(e) {
                try {
                    save_form_data('normal', false);
                }
                catch(ex) {
                    alert('Error Tracking 7: ' + ex);
                    //To catch error to resolve issue #916
                }
            });

            menu_second.addEventListener("click", function(e) {
                try {
                    save_form_data('draft', false);
                }
                catch(ex) {
                    alert('Error Tracking 8: ' + ex);
                    //To catch error to resolve issue #916
                }
            });

            menu_third.addEventListener("click", function(e) {
                if (win.mode == 0) {
                    Ti.UI.createNotification({
                        message : win.title + ' creation was cancelled !'
                    }).show();
                }
                else {
                    Ti.UI.createNotification({
                        message : win.title + ' update was cancelled !'
                    }).show();
                }

                win.close();

            });

        };
    }
}

function bottomButtons(actualWindow) {"use strict";
    /*jslint eqeq: true, vars: true, nomen: true*/
   /*global Omadi, PLATFORM*/
  
  var db_act, json_data, _data, node_form, keep_node_form;
  
    try {
        if (actualWindow != null) {
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
                title : actualWindow.title,
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

                var btn_tt = [];
                var btn_id = [];

                btn_tt.push('Save');

                if (win.nid != null) {
                    db_act = Omadi.utils.openMainDatabase();

                    json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + win.type + '"');
                    _data = JSON.parse(json_data.fieldByName('_data'));

                    node_form = win.region_form;

                    Ti.API.info('Form node part = ' + node_form);

                    if (_data.form_parts != null && _data.form_parts != "") {
                        Ti.API.info('Form table part = ' + _data.form_parts.parts.length);
                        if (_data.form_parts.parts.length >= parseInt(node_form, 10) + 2) {
                            Ti.API.info("<<<<<<<------->>>>>>> Title = " + _data.form_parts.parts[parseInt(node_form, 10) + 1].label);
                            btn_tt.push("Save + " + _data.form_parts.parts[node_form + 1].label);
                            btn_id.push(node_form + 1);
                        }
                    }
                    json_data.close();
                    db_act.close();
                }
                else {
                    db_act = Omadi.utils.openMainDatabase();

                    json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + win.type + '"');
                    _data = JSON.parse(json_data.fieldByName('_data'));

                    node_form = 0;

                    Ti.API.info('Form node part = ' + node_form);

                    if (_data.form_parts != null && _data.form_parts != "") {
                        Ti.API.info('Form table part = ' + _data.form_parts.parts.length);
                        if (_data.form_parts.parts.length >= parseInt(node_form, 10) + 2) {
                            Ti.API.info("<<<<<<<------->>>>>>> Title = " + _data.form_parts.parts[node_form + 1].label);
                            btn_tt.push("Save + " + _data.form_parts.parts[node_form + 1].label);
                            btn_id.push(node_form + 1);
                        }
                    }
                    json_data.close();
                    db_act.close();
                }

                btn_tt.push('Draft');
                btn_tt.push('Cancel');

                var postDialog = Titanium.UI.createOptionDialog();
                postDialog.options = btn_tt;
                postDialog.show();

                postDialog.addEventListener('click', function(ev) {
                    
                    if (btn_tt.length == 4) {
                        if (ev.index == 1) {
                            //openEditScreen(btn_id[0]);
                            Ti.API.info('=======> ' + btn_id[0]);
                            try {
                                save_form_data(btn_id[0], false);
                            }
                            catch(exc) {
                                alert('Error Tracking 11: ' + exc);
                                //To catch error to resolve issue #916
                            }
                        }
                        else if (ev.index == 0) {
                            try {
                                save_form_data('normal', false);
                            }
                            catch(exce) {
                                alert('Error Tracking 12: ' + exce);
                                //To catch error to resolve issue #916
                            }
                        }
                        else if (ev.index == 2) {
                            try {
                                save_form_data('draft', false);
                            }
                            catch(ex) {
                                alert('Error Tracking 13: ' + ex);
                                //To catch error to resolve issue #916
                            }
                        }
                    }
                    else {
                        if (ev.index == 0) {
                            try {
                                save_form_data('normal', false);
                            }
                            catch(except) {
                                alert('Error Tracking 14: ' + except);
                                //To catch error to resolve issue #916
                            }
                        }
                        else if (ev.index == 1) {
                            try {
                                save_form_data('draft', false);
                            }
                            catch(excep) {
                                alert('Error Tracking 15: ' + excep);
                                //To catch error to resolve issue #916
                            }
                        }
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
            actualWindow.add(toolbar);
        }
    }
    catch(evt) {
        Ti.API.error("TOP BAR ERROR = " + evt);
    }
}





var fieldWrappers = {};
var regionViews = {};

var regions = {};


(function(){"use strict";
    
    
    /*jslint vars: true, eqeq: true*/
   /*global Omadi,PLATFORM, loadNode */
   
   
   // win = Titanium.UI.createWindow({
        // fullscreen : false,
        // navBarHidden : true,
        // backgroundColor : '#DDDDDD'
    // });

    //Sets only portrait mode
    //win.orientationModes = [Titanium.UI.PORTRAIT];
    
    win.setOrientationModes([Ti.UI.PORTRAIT]);

    if (PLATFORM === 'android') {
        //The view where the results are presented
        resultView = Ti.UI.createView({
            top : 0,
            height : '100%',
            width : '100%',
            backgroundColor : '#EEEEEE',
            opacity : 1
        });
        win.add(resultView);

        viewContent = Ti.UI.createScrollView({
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
        resultView = Ti.UI.createView({
            top : '50dp',
            height : Ti.UI.SIZE,
            width : '100%',
            bottom : 0,
            backgroundColor : '#EEEEEE',
            opacity : 1
        });
        win.add(resultView);

        viewContent = Ti.UI.createScrollView({
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

    resultView.add(viewContent);

   
    if (Ti.Platform.name == 'android') {
        get_android_menu();
    }
    else {
        bottomButtons(win);
    }
   
   //viewContent is the parent container
   
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
    var node = {
        form_part: 0
    };
    var region_name;
    var regionHeaderView;
    var regionView;
    
    if(win.mode == 1){
        node = loadNode(win.nid);
    }
    
    regions = Omadi.data.getRegions(win.type);
    var region;
    var form_part = 0;
    
    for(region_name in regions){
        if(regions.hasOwnProperty(region_name)){
            region = regions[region_name];
            
            if(typeof region.settings.form_part !== 'undefined'){
                form_part = parseInt(region.settings.form_part, 10);
            }
            else{
                form_part = 0;
            }
            
            Ti.API.debug("formpart: " + form_part);
            
            if(form_part <= node.form_part){
                regionHeaderView = getRegionHeaderView(region);
                
                viewContent.add(regionHeaderView);
                viewContent.add(Ti.UI.createView({
                    height: 10,
                    width: '100%'
                }));
                regionView = Ti.UI.createView({
                    width : '100%',
                    backgroundColor : '#EEEEEE',
                    height: Ti.UI.SIZE,
                    layout: 'vertical'
                });
                
                regionViews[region_name] = regionView;
                
                viewContent.add(regionView);
            }
        }
    }
    
    for(field_name in instances){
        if(instances.hasOwnProperty(field_name)){
            
            instance = instances[field_name];        
            
            var settings = instance.settings;
            var isRequired = instance.required;
            var labelColor = "#246";
            
            instance.can_view = false;
            instance.can_edit = false;
                
            var omadi_session_details = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
            var roles = omadi_session_details.user.roles;
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
                    }
                    else{
                        Ti.API.error("Could not add field type " + instance.type);
                    }
                }
            }
        }
    }   
}());


function formToNode(){"use strict";
    /*global fieldViews*/
   
   var field_name, fieldWrapper, instance, node;
   
   node = {};
   
   node.type = Ti.UI.currentWindow.type;
   
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
       alert("Bundling Data: " + ex);
   }
   
   return node;
}

function getFormFieldValues(field_name){"use strict";
    var retval = {};
    
    
    if(typeof fieldWrappers[field_name] !== 'undefined'){
        retval.dbValues = Omadi.widgets.getDBValues(fieldWrappers[field_name]);
        retval.textValues = Omadi.widgets.getTextValues(fieldWrappers[field_name]);
    }
    
    return retval;
}


function validateMinLength(node, instance){"use strict";
    var minLength, form_errors = [], i;
    
    if (node[instance.field_name].dbValues.length > 0) {
        if (instance.settings.min_length != null) {
            minLength = parseInt(instance.settings.min_length, 10);
            if(minLength >= 0){
                for(i = 0; i < node[instance.field_name].dbValues.length; i ++){
                    if (node[instance.field_name].dbValues[i].length < minLength) {
                        form_errors.push(instance.label + " requires at least " + minLength + " characters");
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
                        form_errors.push(instance.label + " cannot have more than " + maxLength + " characters");
                    }  
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
                    if(dbValues[i] != null){
                        isEmpty = false;
                    }
                    break;
                
                case 'omadi_reference':
                case 'taxonomy_term_reference':
                case 'user_reference':
                case 'file':
                case 'auto_increment':
                    if(dbValues[i] != 0){
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
            // var is_images_query = 'SELECT id FROM file_upload_queue WHERE nid=0 ';
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

function validate_form_data(node){"use strict";
    
    var field_name, instance, values, form_errors, isEmpty, i;
    
    form_errors = [];
    
    try{
        for(field_name in instances){
            if(instances.hasOwnProperty(field_name)){
                
                instance = instances[field_name];
                
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
                }
            }
        }
    }
    catch(ex){
        alert("Validating form: " + ex);
    }
    
    return form_errors;
}


function affectsAnotherConditionalField(check_instance){"use strict";
    
    var node, search_criteria, affectedFields, field_name, i, affectsAField, instance;
    
    affectedFields = [];
    
    for(field_name in instances){
        if(instances.hasOwnProperty(field_name)){
            instance = instances[field_name];
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
    /*global search_criteria_search_order, isArray, labelViews*/
   
    //var entityArr = createEntityMultiple();
    
    var search_criteria, row_matches, row_idx, criteria_row, field_name, 
        search_operator, search_value, search_values, values, i, makeRequired,
        and_groups, and_group_index, and_group, and_group_match, j, or_match;
    
    try{
    
        row_matches = [];
        
        //instance = instances[check_field_name];
        Ti.API.debug("In Conditional");
        
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
                    
                    if(typeof node[field_name] !== 'undefined'){
                       values = node[field_name].dbValues;
                    }
                    
                    //Ti.API.debug(JSON.stringify(values));
              
        
                    switch(instance.type) {
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
                        
                            // for (i = 0; i < node[field_name].dbValues.length; i++){
                                // var elements = entityArr[field_name][idx1];
                                // if (elements['value'] != null && elements['value'] != "") {
                                    // node_values.push(elements['value']);
                                // }
                            // }
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
                            // for (idx1 in entityArr[field_name]) {
                                // elements = entityArr[field_name][idx1];
                                // if (elements['value'] != null && elements['value'] != "") {
                                    // node_values.push(elements['value']);
                                // }
                            // }
                            
                            
    
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
                                //Ti.API.debug("search: " + JSON.stringify(search_values));
                                //Ti.API.debug("values: " + JSON.stringify(values));
                                
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
                            //TODO: finish this
                            Ti.API.error("no list_boolean in conditional");
                            // for (idx1 in entityArr[field_name]) {
                                // var elements = entityArr[field_name][idx1];
                                // node_values.push(elements['value']);
                            // }
//     
                            // if (search_operator == '__filled') {
                                // var value_index;
                                // for (value_index in node_values) {
                                    // node_value = node_values[value_index];
                                    // if (node_value != 0) {
                                        // row_matches[row_idx] = true;
                                    // }
//     
                                // }
                            // }
                            // else {
                                // if (node_values == null || node_values == "" || node_values.length == 0) {
                                    // row_matches[row_idx] = true;
                                // }
                                // else {
                                    // var value_index;
                                    // for (value_index in node_values) {
                                        // node_value = node_values[value_index];
                                        // if (node_value == 0) {
                                            // row_matches[row_idx] = true;
                                        // }
//     
                                    // }
                                // }
                            // }
                            break;
    
                        case 'calculation_field':
                        //TODO: finish this
                            Ti.API.error("no calculation_field in conditional");
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
                            break;
    
                    }
                }
            }
    
            makeRequired = true;
            
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
                                or_match = and_group[j];
                                // Make sure at least one item in an and group is true (or the only item is true)
                                if (or_match) {
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


function getRegionHeaderView(region){"use strict";
    
    var arrow_img, regionHeader, expanded;
    
    arrow_img = Ti.UI.createImageView({
        image : '/images/light_arrow_left.png',
        width : 29,
        height : 29,
        top: 5,
        right: 5,
        zIndex : 999
    });
    
    expanded = true;
    
    if(expanded){
        arrow_img.image = '/images/light_arrow_down.png';
    }

    regionHeader = Ti.UI.createLabel({
        text : region.label.toUpperCase(),
        color : '#ddd',
        font : {
            fontSize : "18dp",
            fontWeight : 'bold'
        },
        textAlign : 'center',
        width : '100%',
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
            
            // for ( i = 0; i < viewContent.getChildren().length; i++) {
                // v = viewContent.getChildren()[i];
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
            
            // for ( i = 0; i < viewContent.getChildren().length; i++) {
                // v = viewContent.getChildren()[i];
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

        // if (viewContent.getChildren() != null) {
// 
            // for ( i = viewContent.getChildren().length - 1; i >= 0; i--) {
                // v = viewContent.getChildren()[i];
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
    
    regionHeader.add(arrow_img);
    
    return regionHeader;
}



function save_form_data(_flag_info, pass_it, new_time) {"use strict";
    /*jslint nomen: true*/
   /*global treatArray, update_node, close_me, reload_me, close_me_delay*/
    var node, form_errors, dialog, string_text, string_err, count_fields, value_err, now, field_name, dialog;
    
    node = formToNode();
    
    form_errors = validate_form_data(node);
    
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
            
            Ti.API.info("--------------------Inside save_form_data--------------------");
            dialog = Titanium.UI.createAlertDialog({
                title : 'Omadi',
                buttonNames : ['OK']
            });
        
            string_text = "";
            string_err = "";
            count_fields = 0;
            value_err = 0;
            
            if (pass_it === false) {
                now = Math.round(new Date().getTime() / 1000);
            }
            else {
                if (new_time != null) {
                    now = new_time;
                }
            }
            
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
                        // var is_images_query = 'SELECT id FROM file_upload_queue WHERE nid=0 ';
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
            
           
            
            if ((count_fields > 0) && (_flag_info != "draft")) {
                if (count_fields == 1) {
                    if (win.mode == 0) {
                        dialog.message = 'The field "' + string_text + '" is empty, please fill it out in order to save this node';
                    }
                    else {
                        dialog.message = 'The field "' + string_text + '" is empty, please fill it out in order to update this node';
                    }
                }
                else {
                    dialog.message = 'The following fields are required and are empty:\n' + string_text;
                }
                dialog.show();
            }
            else if (value_err > 0) {
                dialog.message = string_err;
                dialog.show();
            }
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
            else {
                var oldVal, file_upload_nid, has_bug, no_data_fields_content, instance, insertValues, mode_msg, no_data_fields, db_put, need_at, quotes, nid, new_nid, query, _array_value, x_j, title_to_node, j, field_names, content_s, value_to_insert;
                
                mode_msg = '';
                no_data_fields = [];
                if (_flag_info == "draft") {
                    mode_msg = 'Saving draft';
                }
                else if (win.mode == 0) {
                    mode_msg = 'Saving ' + win.title;
                }
                else {
                    mode_msg = 'Updating ' + win.title;
                }
                
                Ti.API.debug("showing indicator");
                
                Omadi.display.showLoadingIndicator(mode_msg);
                db_put = Omadi.utils.openMainDatabase();
        
                //
                //Retrieve objects that need quotes:
                //
                need_at = db_put.execute("SELECT field_name FROM fields WHERE bundle = '" + win.type + "' AND ( type='number_integer' OR type='number_decimal' ) ");
                quotes = [];
                while (need_at.isValidRow()) {
                    quotes[need_at.fieldByName('field_name')] = true;
                    need_at.next();
                }
                need_at.close();
                
                if (win.mode == 0) {
                    //Get smallest nid
                    nid = db_put.execute("SELECT nid FROM node ORDER BY nid ASC ");
        
                    if (nid.fieldByName('nid') >= 0) {
                        new_nid = -1;
                    }
                    else {
                        new_nid = nid.fieldByName('nid') - 1;
                    }
                }
        
                query = "INSERT OR REPLACE INTO " + win.type + " (nid, ";
        
                // _array_value = [];
    // 
                // for (x_j in content) {
                    // if ((content[x_j].composed_obj === true) && (content[x_j].cardinality > 1)) {
    //     
                        // if ((content[x_j].field_type == 'omadi_time') || (content[x_j].field_type == 'datestamp')) {
                            // if (content[x_j].value != null) {
                                // var _vlr = Math.round(content[x_j].value / 1000);
                            // }
                            // else {
                                // var _vlr = null;
                            // }
                        // }
                        // else if ((content[x_j].field_type == 'number_integer') || (content[x_j].field_type == 'number_decimal')) {
                            // if ((content[x_j].value == null) || (content[x_j].value == "") || (content[x_j].value == " ")) {
                                // var _vlr = null;
                            // }
                            // else {
                                // var _vlr = content[x_j].value;
                            // }
                        // }
                        // else {
                            // var _vlr = content[x_j].value;
                        // }
    //     
                        // if (_array_value[content[x_j].field_name]) {
                            // _array_value[content[x_j].field_name].push(_vlr);
    //                      
                        // }
                        // else {
                            // _array_value[content[x_j].field_name] = [];
                            // _array_value[content[x_j].field_name].push(_vlr);
    //                       
                        // }
                    // }
                // }
        
                //field names
                
                field_names = [];
       
                for (field_name in instances){
                    if(instances.hasOwnProperty(field_name)){
                        //Ti.API.info('INDEX: ' + j_y);
            
                        //Is different of a region
                        //if (!content[j_y]) {
                        //    continue;
                        //}
                        
                        //if(node[field_name].dbValues.length > 0){
                            //Point the last field
                            // if (content[j_y + 1]) {
                                // while (content[j_y].field_name == content[j_y + 1].field_name) {
                                    // j_y++;
                                    // if (content[j_y + 1]) {
                                        // //Go on
                                    // }
                                    // else {
                                        // //Finish, we found the point
                                        // break;
                                    // }
                                // }
                            // }
                            if(field_name != null && typeof instances[field_name] !== 'undefined'){
                                Ti.API.debug(field_name);
                                field_names.push(field_name);
                            }
                            
                            
                            
                            // if (j_y == content.length - 1) {
                                // query += "'" + content[j_y].field_name + "' ) ";
                            // }
                            // else {
                                // query += "'" + content[j_y].field_name + "', ";
                            // }
                       // }
                    }
                }
        
                query += field_names.join(',');
                if (win.mode == 0) {
                    query += ') VALUES (' + new_nid + ',';
                }
                else{
                    query += ') VALUES (' + win.nid + ',';
                }
        
                //Values
                title_to_node = "";
                
                insertValues = [];
                
                for ( j = 0; j <= field_names.length; j++) {
                    field_name = field_names[j];
                    
                    if(instances[field_names[j]] != null){
                        instance = instances[field_name];
                        Ti.API.debug(JSON.stringify(instance));
                        // if (content[j].is_title === true) {
                            // if (title_to_node.charAt(0) == "") {
                                // if (content[j].cardinality == -1) {
                                    // var tit_aux = content[j].value;
                                    // if (tit_aux == null)
                                        // tit_aux = "";
                                    // else
                                        // tit_aux = tit_aux[0].title;
                                    // title_to_node = tit_aux;
                                // }
                                // else {
                                    // if (content[j].value == null) {
                                        // title_to_node = "";
                                    // }
                                    // else {
                                        // title_to_node = content[j].value;
                                    // }
                                // }
                            // }
                            // else {
                                // if (content[j].cardinality == -1) {
                                    // var tit_aux = content[j].value;
                                    // if (tit_aux == null)
                                        // tit_aux = "";
                                    // else
                                        // tit_aux = " - " + tit_aux[0].title;
                                    // title_to_node += tit_aux;
                                // }
                                // else {
                                    // if (content[j].value == null) {
                                        // title_to_node = "";
                                    // }
                                    // else {
                                        // title_to_node += " - " + content[j].value;
                                    // }
                                // }
                            // }
                        // }
        //     
                        // Ti.API.info(content[j].field_type + ' is the field');
            
                        // if (quotes[content[j].field_name] === true) {
                            // var mark = "";
                        // }
                        // else {
                            // var mark = '"';
                        // }
            
                        // if (content[j].value === null) {
                            // mark = "";
                        // }
            
                        value_to_insert = null;
                        //var is_no_data = false;
                        //INSERTING NO DATA FIEDLS IN ARRAY
                        // if (content[j].no_data_checkbox != null && content[j].no_data_checkbox != "" && content[j].no_data_checkbox) {
                            // is_no_data = true;
                            // if (content[j].noDataView != null) {
                                // var fieldName = content[j].field_name;
                                // if (content[j].partsArr != null && content[j].partsArr.length > 0) {
                                    // fieldName = fieldName.split('___');
                                    // fieldName = fieldName[0];
                                // }
                                // no_data_fields.push(fieldName);
                            // }
                        // }
            
                        //If it is a composed field, just insert the number
                        
                        
                        if(typeof node[field_name] !== 'undefined'){
                        
                            //Build cardinality for fields
                            if (instance.settings.cardinality == -1 || instance.settings.cardinality > 1) {
                                //Point the last field
                                // if (content[j + 1]) {
                                    // while (content[j].field_name == content[j + 1].field_name) {
                                        // j++;
                                        // if (content[j + 1]) {
                                            // //Go on
                                        // }
                                        // else {
                                            // //Finish, we found the point
                                            // break;
                                        // }
                                    // }
                                // }
                                //if (!is_no_data) {
                                var has_data = false;
                                var k;
                                
                                for(k = 0; k < node[field_name].dbValues.length; k ++){
                                    if(node[field_name].dbValues[k] > ""){
                                        has_data = true;
                                    }
                                }
                                
                                if(has_data){
                                    //Treat the array
                                    content_s = treatArray(node[field_name].dbValues, 6);
                                    
                                    //Ti.API.info('About to insert ' + _array_value[content[j].field_name]);
                                    // table structure:
                                    // incremental, node_id, field_name, value
                                    if(win.mode == 0){
                                       // Ti.API.info('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + new_nid + ', \'' + content[j].field_name + '\',  \'' + content_s + '\' )');
                                        db_put.execute("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + new_nid + ", \"" + field_name + "\",  \"" + content_s + "\" )");
                                    }
                                    else {
                                        //Ti.API.info("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + win.nid + ", \"" + content[j].field_name + "\",  \"" + content_s + "\" )");
                                        db_put.execute("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + win.nid + ", \"" + field_name + "\",  \"" + content_s + "\" )");
                                    }
                
                                    // Code must to be a number since this database field accepts only integers numbers
                                    // Token to indentify array of numbers is 7411317618171051229
                                    value_to_insert = '7411317618171051229';
                                }
                                //}
                            }
                            else{ //} if (!is_no_data) {
                                Ti.API.info("value: " + JSON.stringify(node[field_name].dbValues));
                                if(node[field_name].dbValues.length == 1){
                                    
                                    value_to_insert = node[field_name].dbValues.pop();
                                }
                                // if ((content[j].field_type == 'number_decimal') || (content[j].field_type == 'number_integer')) {
                                    // if ((content[j].value == '') || (content[j].value == null)) {
                                        // value_to_insert = 'null';
                                        // mark = '"';
                                    // }
                                    // else {
                                        // value_to_insert = content[j].value;
                                        // mark = '';
                                    // }
                                // }
                                // else if (content[j].field_type == 'user_reference') {
                                    // if (content[j].value == null) {
                                        // value_to_insert = ''
                                        // mark = '\"';
                                    // }
                                    // else {
                                        // value_to_insert = content[j].value;
                                        // mark = '';
                                    // }
                                // }
                                // else if (content[j].field_type == 'taxonomy_term_reference') {
                                    // if (content[j].widget == 'options_select') {
                                        // if (content[j].cardinality != -1) {
                                            // if (content[j].value == null) {
                                                // value_to_insert = ''
                                                // mark = '\"';
                                            // }
                                            // else {
                                                // value_to_insert = content[j].value;
                                                // mark = '';
                                            // }
                                        // }
                                        // else {
            //     
                                            // var vital_info = [];
            //     
                                            // if (content[j].value == null) {
                                                // vital_info.push("null");
                                            // }
                                            // else {
                                                // var v_info_tax;
                                                // for (v_info_tax in content[j].value ) {
                                                    // vital_info.push(content[j].value[v_info_tax].v_info.toString());
                                                // }
                                            // }
            //     
                                            // //Treat the array
                                            // content_s = treatArray(vital_info, 6);
                                            // Ti.API.info('About to insert ' + content[j].field_name);
                                            // // table structure:
                                            // // incremental, node_id, field_name, value
                                            // if (win.mode == 0) {
                                                // Ti.API.info("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + new_nid + ", \"" + content[j].field_name + "\",  \"" + content_s + "\" )");
                                                // db_put.execute("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + new_nid + ", \"" + content[j].field_name + "\",  \"" + content_s + "\" )");
                                            // }
                                            // else {
                                                // Ti.API.info("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + win.nid + ", \"" + content[j].field_name + "\",  \"" + content_s + "\" )");
                                                // db_put.execute("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + win.nid + ", \"" + content[j].field_name + "\",  \"" + content_s + "\" )");
                                            // }
                                            // // Code must to be a number since this database field accepts only integers numbers
                                            // // Token to indentify array of numbers is 7411317618171051229
                                            // value_to_insert = 7411317618171051229;
                                            // mark = '';
                                        // }
                                    // }
                                    // else if (content[j].widget == 'taxonomy_autocomplete') {
                                        // // TODO: add in new terms
                                        // if ((content[j].tid == null) && (content[j].value == "")) {
                                            // value_to_insert = '';
                                            // mark = '\"';
                                        // }
                                        // else if ((win.mode == 0) && (content[j].tid == null) && (content[j].value != "")) {
                                            // if (content[j].restrict_new_autocomplete_terms != 1) {
                                                // mark = '';
                                                // //Get smallest tid
                                                // var tid = db_put.execute("SELECT tid FROM term_data ORDER BY tid ASC ");
            //     
                                                // if (tid.fieldByName('tid') >= 0) {
                                                    // var new_tid = -1;
                                                // }
                                                // else {
                                                    // var new_tid = tid.fieldByName('tid') - 1;
                                                // }
                                                // var date_created = Math.round(+new Date() / 1000);
                                                // db_put.execute("INSERT INTO term_data (tid, vid, name, description, weight, created) VALUES (" + new_tid + ", " + content[j].vid + ", '" + content[j].value + "', '', '', '" + date_created + "'  )");
                                                // value_to_insert = new_tid;
            //     
                                                // Ti.API.info('First tid is: ' + new_tid + ' and tid ' + content[j].tid + ' and value ' + content[j].value);
                                                // tid.close();
                                            // }
                                            // else {
                                                // value_to_insert = '';
                                            // }
            //     
                                        // }
                                        // else if ((content[j].tid != null)) {
                                            // mark = '';
                                            // value_to_insert = content[j].tid;
                                        // }
                                    // }
                                // }
                                // else if (content[j].field_type == 'omadi_reference') {
                                    // if (content[j].nid === null) {
                                        // value_to_insert = '';
                                        // mark = '\"';
                                    // }
                                    // else {
                                        // mark = '';
                                        // value_to_insert = content[j].nid;
                                    // }
                                // }
                                // else if (content[j].field_type == 'list_boolean') {
                                    // if (content[j].value === true) {
                                        // value_to_insert = 1;
                                    // }
                                    // else {
                                        // value_to_insert = 0;
                                    // }
                                // }
                                // else if (content[j].field_type == 'rules_field') {
                                    // if (content[j].value === false || content[j].value === 0 || content[j].value === 'false') {
                                        // value_to_insert = 'false';
                                    // }
                                    // else {
                                        // value_to_insert = JSON.stringify(content[j].value).replace(/"/gi, "\"\"");
                                    // }
                                // }
                                // else if ((content[j].field_type == 'omadi_time') || (content[j].field_type == 'datestamp')) {
                                    // if (content[j].update_it === true) {
                                        // value_to_insert = Math.round(content[j].value / 1000);
                                    // }
                                    // else {
                                        // mark = "\"";
                                        // value_to_insert = '';
                                    // }
                                // }
                                // else {
                                    // value_to_insert = content[j].value;
                                // }
                            // }
                            // if (value_to_insert == '') {
                                // mark = '\"';
                            // }
            //     
                            // if (j == content.length - 1) {
                                // query += mark + "" + value_to_insert + "" + mark + " )";
                            // }
                            // else {
                                // query += mark + "" + value_to_insert + "" + mark + ", ";
                            // }
                            // Ti.API.info(content[j].field_type + ' has value to insert ' + value_to_insert);
                            }
                        }
                        
                        if(value_to_insert === null){
                            insertValues.push('null');
                        }
                        else{
                            //Ti.API.debug(value_to_insert);
                            switch(instance.type){
                                case 'number_decimal':
                                case 'number_integer':
                                case 'user_reference':
                                case 'taxonomy_term_reference':
                                case 'omadi_reference':
                                case 'datestamp':
                                case 'omadi_time':
                                case 'auto_increment':
                                case 'list_boolean':
                                case 'image':
                                    
                                    if(Omadi.utils.isEmpty(value_to_insert)){
                                        value_to_insert = "null";
                                    }
                                    
                                    insertValues.push(value_to_insert);
                                    break;    
                                    
                                default:
                                
                                    insertValues.push('"' + value_to_insert.replace('"', "'") + '"');
                                    break;
                            }
                        }
                    }
                }
                
                Ti.API.debug(JSON.stringify(node));
                
                query += insertValues.join(',');
                query += ")";
        
                has_bug = false;
                try {
                    //Ti.API.info('Title: ' + title_to_node);
                    if (title_to_node == "") {
                        title_to_node = "No title";
                    }
        
                    //No data fields JSON
                    no_data_fields_content = '';
                    
                    // for ( idx_k = 0; idx_k < no_data_fields.length; idx_k++) {
                        // if (idx_k == no_data_fields.length - 1) {
                            // no_data_fields_content += '\"' + no_data_fields[idx_k] + '\" : \"' + no_data_fields[idx_k] + '\"';
                        // }
                        // else {
                            // no_data_fields_content += '\"' + no_data_fields[idx_k] + '\" : \"' + no_data_fields[idx_k] + '\",';
                        // }
                    // }
                    // if (no_data_fields_content != null && no_data_fields_content != '') {
                        // no_data_fields_content = "{" + no_data_fields_content + "}"
                    // }
        
                    // var nodeObj = {};
        //             
                    // nodeObj.nid = 0;
                    // nodeObj.perm_edit = 0;
                    // nodeObj.perm_delete = 0;
        //             
                    // nodeObj.changed = 0;
                    // nodeObj.title = '';
                    // nodeObj.author_uid = 0;
                    // nodeObj.flag_is_updated = 0;
                    // nodeObj.table_name = 0;
                    // nodeObj.form_part = 0;
                    // nodeObj.changed_uid = 0;
                    // nodeObj.no_data_fields = ';'
                    // nodeObj.viewed = "1";
        //                
        //             
                    // nodeObj.created = 0;
                
                    //Insert into node table
                    if (_flag_info == "draft") {
                        if (win.mode == 1) {
                           // Ti.API.info('UPDATE node SET changed="' + _now + '", title="' + title_to_node + '" , flag_is_updated=3, table_name="' + win.type + '", form_part =' + win.region_form + ', no_data_fields=\'' + no_data_fields_content + '\' WHERE nid=' + win.nid);
                            db_put.execute('UPDATE node SET changed="' + now + '", title="' + title_to_node + '" , flag_is_updated=3, table_name="' + win.type + '", form_part =' + win.region_form + ', no_data_fields=\'' + no_data_fields_content + '\', viewed=\'1\' WHERE nid=' + win.nid);
                        }
                        else {
                            //Ti.API.info('INSERT OR REPLACE INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name, form_part, no_data_fields ) VALUES (' + new_nid + ', ' + _now + ', 0, "' + title_to_node + '" , ' + win.uid + ', 3 , "' + win.type + '" , ' + win.region_form + ', \'' + no_data_fields_content + '\')');
                            db_put.execute('INSERT INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name , form_part, no_data_fields, viewed ) VALUES (' + new_nid + ', ' + now + ', 0, "' + title_to_node + '" , ' + win.uid + ', 3 , "' + win.type + '", ' + win.region_form + ', \'' + no_data_fields_content + '\', \'1\')');
        
                        }
                    }
                    else if (win.mode == 1) {
                       // Ti.API.info('UPDATE node SET changed="' + _now + '", title="' + title_to_node + '" , flag_is_updated=1, table_name="' + win.type + '", form_part =' + win.region_form + ', no_data_fields=\'' + no_data_fields_content + '\' WHERE nid=' + win.nid);
                        db_put.execute('UPDATE node SET changed="' + now + '", title="' + title_to_node + '" , flag_is_updated=1, table_name="' + win.type + '", form_part =' + win.region_form + ', no_data_fields=\'' + no_data_fields_content + '\', viewed=\'1\' WHERE nid=' + win.nid);
                    }
                    else {
                        //Ti.API.info('INSERT OR REPLACE INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name, form_part, no_data_fields ) VALUES (' + new_nid + ', ' + _now + ', 0, "' + title_to_node + '" , ' + win.uid + ', 1 , "' + win.type + '", ' + win.region_form + ', \'' + no_data_fields_content + '\')');
                        db_put.execute('INSERT OR REPLACE INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name, form_part, no_data_fields, viewed) VALUES (' + new_nid + ', ' + now + ', 0, "' + title_to_node + '" , ' + win.uid + ', 1 , "' + win.type + '"  , ' + win.region_form + ', \'' + no_data_fields_content + '\', \'1\')');
                    }
        
                    //Insert into table
                    Ti.API.info("=====Query=== " + query);
                    if (win.mode == 1) {
                        oldVal = db_put.execute('SELECT * FROM ' + win.type + ' WHERE nid=' + win.nid);
                    }
                    db_put.execute(query);
        
                    //If Images captured and not yet uploaded then store in file_uploaded_queue
                    if (win.mode == 1) {
                        file_upload_nid = win.nid;
                    }
                    else {
                        file_upload_nid = new_nid;
                    }
                    db_put.execute('UPDATE file_upload_queue SET nid=' + file_upload_nid + ' WHERE nid=0;');
        
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
        
                    Ti.API.info("New Nid = " + file_upload_nid);
                    /*for (var j = 0; j <= content.length; j++) {
                     if (!content[j]) {
                     continue;
                     }
        
                     var file_upload_nid;
        
                     if (win.mode == 1) {
                     file_upload_nid = win.nid;
                     } else {
                     file_upload_nid = new_nid;
                     }
        
                     if (content[j].field_type == 'image' && (content[j].cardinality > 1 || content[j].cardinality < 0) && !content[j].no_data_checkbox) {
                     var arrImages = content[j].arrImages;
                     for ( k = 0; k < arrImages.length; k++) {
                     if (arrImages[k].isImage != false && arrImages[k].mimeType != null) {
                     var encodeImage = Ti.Utils.base64encode(arrImages[k].bigImg);
                     var mime = arrImages[k].mimeType;
                     var imageName = 'image.' + mime.substring(mime.indexOf('/') + 1, mime.length);
                     var is_exists = db_put.execute('SELECT delta, nid FROM file_upload_queue WHERE nid=' + file_upload_nid + ' and delta=' + arrImages[k].private_index + ' and field_name="' + content[j].field_name + '";');
                     if (is_exists.rowCount > 0) {
                     db_put.execute('UPDATE file_upload_queue SET nid="' + file_upload_nid + '", file_data="' + encodeImage + '", field_name="' + content[j].field_name + '", file_name="' + imageName + '", delta=' + arrImages[k].private_index + ' WHERE nid=' + file_upload_nid + ' and delta=' + arrImages[k].private_index + ' and field_name="' + content[j].field_name + '";');
                     continue;
                     }
        
                     db_put.execute('INSERT INTO file_upload_queue (nid , file_data , field_name, file_name, delta) VALUES (' + file_upload_nid + ', "' + encodeImage + '", "' + content[j].field_name + '", "' + imageName + '", ' + arrImages[k].private_index + ')');
                     Ti.API.info('Filse Saved' + arrImages[k].private_index);
                     }
                     }
                     } else if (content[j].field_type == 'image'  && !content[j].no_data_checkbox) {
                     if (content[j].isImage != false && content[j].mimeType != null) {
                     var encodeImage = Ti.Utils.base64encode(content[j].bigImg);
                     var mime = content[j].mimeType;
                     var imageName = 'image.' + mime.substring(mime.indexOf('/') + 1, mime.length);
        
                     var is_exists = db_put.execute('SELECT delta, nid FROM file_upload_queue WHERE nid=' + file_upload_nid + ' and delta=' + content[j].private_index + ' and field_name="' + content[j].field_name + '";');
        
                     if (is_exists.rowCount > 0) {
                     db_put.execute('UPDATE file_upload_queue SET nid="' + file_upload_nid + '", file_data="' + encodeImage + '", field_name="' + content[j].field_name + '", file_name="' + imageName + '", delta=' + content[j].private_index + ' WHERE nid=' + file_upload_nid + ' and delta=' + content[j].private_index + ' and field_name="' + content[j].field_name + '";');
                     continue;
                     }
                     db_put.execute('INSERT INTO file_upload_queue (nid , file_data , field_name, file_name, delta) VALUES (' + file_upload_nid + ', "' + encodeImage + '", "' + content[j].field_name + '", "' + imageName + '","' + content[j].private_index + '")');
                     }
                     }
        
                     if (content[j].field_type == 'image' && win.mode == 1) {
                     db_put.execute('UPDATE ' + win.type + ' SET ' + content[j].field_name + '="' + oldVal.fieldByName(content[j].field_name) + '", ' + content[j].field_name + '___file_id="' + oldVal.fieldByName(content[j].field_name + '___file_id') + '", ' + content[j].field_name + '___status="' + oldVal.fieldByName(content[j].field_name + '___status') + '" WHERE nid=' + file_upload_nid + ';');
                     }
                     }*/
        
                 
                    has_bug = false;
                }
                catch(e) {
                    Ti.API.info("Error----------" + e);
        
                    if (_flag_info == 'draft') {
                        
                        alert('An error has occurred when we tried to save this node as a draft, please try again');
                    }
                    else if (win.mode == 1) {
                        
                       alert('An error has occurred when we tried to update this new node, please try again');
                    }
                    else {
                        
                        alert('An error has occurred when we tried to create this new node, please try again');
                    }
                    has_bug = true;
                }
                finally{
                    db_put.close();
                }
        
                Ti.API.info('========= Updating new info running ========= ' + _flag_info);
                
                //var alertMessage = "";
                if(has_bug){
                    alert("There was a problem saving your data. Please try again. If this error continues, please report the problem.");
                }
                else if(_flag_info == 'draft'){
                    alert('The ' + win.title + ' was saved as a draft.');
                    close_me();
                }
                else if(Ti.Network.online){
                    if (_flag_info == "normal") {
                        Ti.API.info('Submitting, mode=' + win.mode);
                        //Omadi.service.sendUpdates();
                        update_node(win.mode, win.type.toUpperCase());
                    }
                    else {
                        Ti.API.info('Submitting and preparing next part reload');
                        //Omadi.service.sendUpdates();
                        // TODO: send the user to the next form part
                        update_node(win.mode, win.type.toUpperCase(), _flag_info);
                    }
                }
                else{
                    alert('Alert management of this ' + win.title + ' immediately. You do not have an Internet connection right now.  Your data was saved and will be synched when you connect to the Internet.');
                    close_me_delay();
                }
                
                // if ((Titanium.Network.online) && (has_bug === false) && (_flag_info != 'draft')) {
        //             
                // }
                // else if (has_bug === true) {
                    // Ti.API.info('Error');
                    // close_me_delay();
                // }
                // else if (!(Titanium.Network.online) || (_flag_info == 'draft')) {
                    // if (_flag_info == 'draft') {
        //                
        //                 
                    // }
                    // else if (win.mode == 1) {
        //                 
                        // alert('Alert management of this updated ' + win.title + ' immediately. Your device failed to connect to the Internet.');
        //                 
                    // }
                    // else {
        //                 
                        // alert('Alert management of this new ' + win.title + ' immediately. Your device failed to connect to the Internet.');
                    // }
        //             
                // }
            }
        }
        catch(ex){
            alert("Saving to mobile database: " + ex);
        }
    }
}
