// /*
// * This code generates forms for node creation and node edition.
// * The tracked variable is win.mode.
// * node_creation -> win.mode == 0
// * node_edition  -> win.mode == 1
// */
// 
// //Common used functions
// Ti.include('/lib/functions.js');
// Ti.include('/lib/encoder_base_64.js');
// 
// var heightValue = (PLATFORM == 'android') ? DPUnitsToPixels(40) : DPUnitsToPixels(35);
// var heightTextField = DPUnitsToPixels(45);
// var toolActInd = Ti.UI.createActivityIndicator();
// toolActInd.font = {
    // fontFamily : 'Helvetica Neue',
    // fontSize : "15dp",
    // fontWeight : 'bold'
// };
// toolActInd.color = 'white';
// toolActInd.message = 'Loading...';
// var omadi_session_details;
// var roles;
// var fieldFontSize = (PLATFORM == 'android') ? '16dp' : '18dp'
// 
// var months_set = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// 
// //Current window's instance
// var win = Ti.UI.currentWindow;
// var viewContent;
// var title_head;
// var resultView;
// var _lb_color = "#4C5A88";
// var OFF_BY = 5 * 60;
// var db_display;
// var no_data_fieldsArr = [];
// var doneButton = null;
// var menu = null;
// var ONE_MB = 524258;
// //var movement;
// var create_or_edit_node = {};
// 
// create_or_edit_node.getWindow = function() {
// 
    // win = Titanium.UI.createWindow({
        // fullscreen : false,
        // navBarHidden : true,
        // backgroundColor : '#DDDDDD'
    // });
// 
    // //Sets only portrait mode
    // win.orientationModes = [Titanium.UI.PORTRAIT];
// 
    // if (PLATFORM === 'android') {
        // //The view where the results are presented
        // resultView = Ti.UI.createView({
            // top : 0,
            // height : '100%',
            // width : '100%',
            // backgroundColor : '#EEEEEE',
            // opacity : 1
        // });
        // win.add(resultView);
// 
        // viewContent = Ti.UI.createScrollView({
            // bottom : 0,
            // contentHeight : 'auto',
            // backgroundColor : '#EEEEEE',
            // showHorizontalScrollIndicator : false,
            // showVerticalScrollIndicator : true,
            // opacity : 1,
            // scrollType : "vertical",
            // zIndex : 10
        // });
    // }
    // else {
// 
        // //The view where the results are presented
        // resultView = Ti.UI.createView({
            // top : '50dp',
            // height : '100%',
            // width : '100%',
            // bottom : 0,
            // backgroundColor : '#EEEEEE',
            // opacity : 1
        // });
        // win.add(resultView);
// 
        // viewContent = Ti.UI.createScrollView({
            // contentHeight : 'auto',
            // //height : "98%",
            // backgroundColor : '#EEEEEE',
            // showHorizontalScrollIndicator : false,
            // showVerticalScrollIndicator : true,
            // opacity : 1,
            // scrollType : "vertical",
            // zIndex : 10
        // });
    // }
// 
    // resultView.add(viewContent);
// 
    // win.addEventListener('close', function() {
        // if (win.mode == 0) {
            // //Omadi.data.setUpdating(false);
        // }
    // });
// 
    // return win;
// };
// ///////////////////////////
// // Extra Functions
// //////////////////////////
// 
// function get_android_menu(menu_exists) {
    // if (menu_exists === true) {
        // //======================================
        // // MENU - UI
        // //======================================
// 
        // var btn_tt = [];
        // var btn_id = [];
// 
        // menu.clear();
// 
        // if (win.nid != null) {
            // var db_act = Omadi.utils.openMainDatabase();
            // var json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + win.type + '"');
            // var _data = JSON.parse(json_data.fieldByName('_data'));
// 
            // var node_form = win.region_form;
// 
            // if (_data.form_parts != null && _data.form_parts != "") {
                // Ti.API.info('Form table part = ' + _data.form_parts.parts.length);
                // if (_data.form_parts.parts.length >= parseInt(node_form) + 2) {
                    // var keep_node_form = node_form + 1;
// 
                    // Ti.API.info("Title = " + _data.form_parts.parts[keep_node_form].label);
// 
                    // var menu_zero = menu.add({
                        // title : "Save + " + _data.form_parts.parts[keep_node_form].label,
                        // order : 0
                    // });
                    // menu_zero.setIcon("/images/drop.png");
                    // menu_zero.addEventListener("click", function(ev) {
                        // Ti.API.info('Form node part = ' + keep_node_form);
                        // try {
                            // keep_info(keep_node_form, false);
                        // }
                        // catch(e) {
                            // alert('Error Tracking 1: ' + ev);
                            // //To catch error to resolve issue #916
                        // }
// 
                    // });
                // }
            // }
            // json_data.close();
            // db_act.close();
        // }
        // else {
            // var db_act = Omadi.utils.openMainDatabase();
// 
            // var json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + win.type + '"');
            // var _data = JSON.parse(json_data.fieldByName('_data'));
// 
            // var node_form = 0;
            // Ti.API.info('Form node part = ' + node_form);
// 
            // if (_data.form_parts != null && _data.form_parts != "") {
                // Ti.API.info('Form table part = ' + _data.form_parts.parts.length);
                // if (_data.form_parts.parts.length >= parseInt(node_form) + 2) {
                    // var keep_node_form = node_form + 1;
// 
                    // Ti.API.info("<<<<<<<------->>>>>>> Title = " + _data.form_parts.parts[keep_node_form].label);
// 
                    // var menu_zero = menu.add({
                        // title : "Save + " + _data.form_parts.parts[keep_node_form].label,
                        // order : 0
                    // });
                    // menu_zero.setIcon("/images/drop.png");
                    // menu_zero.addEventListener("click", function(ev) {
                        // Ti.API.info('====>> ' + keep_node_form);
                        // try {
                            // keep_info(keep_node_form, false);
                        // }
                        // catch(e) {
                            // alert('Error Tracking 2: ' + ev);
                            // //To catch error to resolve issue #916
                        // }
// 
                    // });
                // }
            // }
            // json_data.close();
            // db_act.close();
        // }
// 
        // btn_tt.push('Save');
        // btn_tt.push('Draft');
        // btn_tt.push('Cancel');
// 
        // var menu_first = menu.add({
            // title : 'Save',
            // order : 1
        // });
        // menu_first.setIcon("/images/save.png");
// 
        // var menu_second = menu.add({
            // title : 'Draft',
            // order : 2
        // });
        // menu_second.setIcon("/images/draft.png");
// 
        // var menu_third = menu.add({
            // title : 'Cancel',
            // order : 3
        // });
        // menu_third.setIcon("/images/cancel.png");
// 
        // //======================================
        // // MENU - EVENTS
        // //======================================
        // menu_first.addEventListener("click", function(e) {
            // try {
                // keep_info('normal', false);
            // }
            // catch(e) {
                // alert('Error Tracking 3: ' + e);
                // //To catch error to resolve issue #916
            // }
        // });
// 
        // menu_second.addEventListener("click", function(e) {
            // try {
                // keep_info('draft', false);
            // }
            // catch(e) {
                // alert('Error Tracking 4: ' + e);
                // //To catch error to resolve issue #916
            // }
        // });
// 
        // menu_third.addEventListener("click", function(e) {
            // if (win.mode == 0) {
                // Ti.UI.createNotification({
                    // message : win.title + ' creation was cancelled !'
                // }).show();
            // }
            // else {
                // Ti.UI.createNotification({
                    // message : win.title + ' update was cancelled !'
                // }).show();
            // }
// 
            // win.close();
// 
        // });
// 
    // }
    // else {
        // var activity = win.activity;
        // activity.onCreateOptionsMenu = function(e) {
// 
            // //======================================
            // // MENU - UI
            // //======================================
// 
            // var btn_tt = [];
            // var btn_id = [];
// 
            // menu = e.menu;
            // menu.clear();
// 
            // if (win.nid != null) {
                // var db_act = Omadi.utils.openMainDatabase();
// 
                // var json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + win.type + '"');
                // var _data = JSON.parse(json_data.fieldByName('_data'));
// 
                // var node_form = win.region_form;
// 
                // if (_data.form_parts != null && _data.form_parts != "") {
                    // Ti.API.info('Form table part = ' + _data.form_parts.parts.length);
                    // if (_data.form_parts.parts.length >= parseInt(node_form) + 2) {
                        // var keep_node_form = node_form + 1;
// 
                        // Ti.API.info("Title = " + _data.form_parts.parts[keep_node_form].label);
// 
                        // var menu_zero = menu.add({
                            // title : "Save + " + _data.form_parts.parts[keep_node_form].label,
                            // order : 0
                        // });
                        // menu_zero.setIcon("/images/drop.png");
                        // menu_zero.addEventListener("click", function(ev) {
                            // Ti.API.info('Form node part = ' + keep_node_form);
                            // try {
                                // keep_info(keep_node_form, false);
                            // }
                            // catch(e) {
                                // alert('Error Tracking 5: ' + ev);
                                // //To catch error to resolve issue #916
                            // }
// 
                        // });
                    // }
                // }
                // json_data.close();
                // db_act.close();
            // }
            // else {
                // var db_act = Omadi.utils.openMainDatabase();
// 
                // var json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + win.type + '"');
                // var _data = JSON.parse(json_data.fieldByName('_data'));
// 
                // var node_form = 0;
// 
                // Ti.API.info('Form node part = ' + node_form);
// 
                // if (_data.form_parts != null && _data.form_parts != "") {
                    // Ti.API.info('Form table part = ' + _data.form_parts.parts.length);
                    // if (_data.form_parts.parts.length >= parseInt(node_form) + 2) {
                        // var keep_node_form = node_form + 1;
// 
                        // Ti.API.info("<<<<<<<------->>>>>>> Title = " + _data.form_parts.parts[keep_node_form].label);
// 
                        // var menu_zero = menu.add({
                            // title : "Save + " + _data.form_parts.parts[keep_node_form].label,
                            // order : 0
                        // });
                        // menu_zero.setIcon("/images/drop.png");
                        // menu_zero.addEventListener("click", function(ev) {
                            // Ti.API.info('====>> ' + keep_node_form);
                            // try {
                                // keep_info(keep_node_form, false);
                            // }
                            // catch(e) {
                                // alert('Error Tracking 6: ' + ev);
                                // //To catch error to resolve issue #916
                            // }
// 
                        // });
                    // }
                // }
                // json_data.close();
                // db_act.close();
            // }
// 
            // btn_tt.push('Save');
            // btn_tt.push('Draft');
            // btn_tt.push('Cancel');
// 
            // var menu_first = menu.add({
                // title : 'Save',
                // order : 1
            // });
            // menu_first.setIcon("/images/save.png");
// 
            // var menu_second = menu.add({
                // title : 'Draft',
                // order : 2
            // });
            // menu_second.setIcon("/images/draft.png");
// 
            // var menu_third = menu.add({
                // title : 'Cancel',
                // order : 3
            // });
            // menu_third.setIcon("/images/cancel.png");
// 
            // //======================================
            // // MENU - EVENTS
            // //======================================
            // menu_first.addEventListener("click", function(e) {
                // try {
                    // keep_info('normal', false);
                // }
                // catch(e) {
                    // alert('Error Tracking 7: ' + e);
                    // //To catch error to resolve issue #916
                // }
            // });
// 
            // menu_second.addEventListener("click", function(e) {
                // try {
                    // keep_info('draft', false);
                // }
                // catch(e) {
                    // alert('Error Tracking 8: ' + e);
                    // //To catch error to resolve issue #916
                // }
            // });
// 
            // menu_third.addEventListener("click", function(e) {
                // if (win.mode == 0) {
                    // Ti.UI.createNotification({
                        // message : win.title + ' creation was cancelled !'
                    // }).show();
                // }
                // else {
                    // Ti.UI.createNotification({
                        // message : win.title + ' update was cancelled !'
                    // }).show();
                // }
// 
                // win.close();
// 
            // });
// 
        // };
    // }
// }
// 
// function adjustView(counter, top) {
// 
    // try {
        // Ti.API.info("Offset = " + viewContent.getContentOffset().y + " count = " + counter + " top = " + top);
        // viewContent.setContentOffset({
            // x : viewContent.getContentOffset().x,
            // y : top
        // }, {
            // animated : true
        // })
        // Ti.API.info("New offset: " + viewContent.getContentOffset().y);
    // }
    // catch(ev) {
    // }
// 
// }
// // 
// // function keep_info(_flag_info, pass_it, new_time) {
// // 
    // // Ti.API.info("--------------------Inside keep_info--------------------");
    // // var a = Titanium.UI.createAlertDialog({
        // // title : 'Omadi',
        // // buttonNames : ['OK']
    // // });
// // 
    // // var string_text = "";
    // // var string_err = "";
    // // var count_fields = 0;
    // // var value_err = 0;
    // // if (pass_it === false) {
        // // var _now = Math.round(new Date().getTime() / 1000);
    // // }
    // // else {
        // // if (new_time != null) {
            // // var _now = new_time;
        // // }
    // // }
    // // //this is used for checking restrictions in db against all nid on this form
    // // var db_check_restrictions = Omadi.utils.openMainDatabase();
// // 
    // // var restrictions = new Array();
// // 
    // // Ti.API.info("--------------------content array length : " + content.length + " --------------------");
// // 
    // // /*
     // // for (var k = 0; k < content.length; k++) {
     // // Ti.API.info(k+" <<<===>>> "+content[k].value);
     // // if (content[k].value && content[k].value != null ){
     // // var __tmp = content[k].value.toString();
     // // __tmp = __tmp.replace(/'/gi, '\'');
     // // content[k].value = __tmp;
     // // Ti.API.info(__tmp+' - '+content[k].value);
     // // }
     // // }
     // // */
    // // var x;
    // // for (x in content) {
// // 
        // // try {
            // // Ti.API.info(label[x].text + ' is required: ' + content[x].required + ' = ' + content[x].value);
        // // }
        // // catch(e) {
            // // Ti.API.info('!!!!! ERROR !!!!! ' + e);
        // // }
        // // //Regular expression for license Plate
        // // if (content[x].field_type == 'license_plate') {
// // 
            // // if (content[x].value != null && content[x].value != "") {
                // // content[x].value = content[x].value.replace(/[^[0-9A-Z]/g, '', content[x].value);
            // // }
        // // }
// // 
        // // if (content[x].field_type == 'number_integer') {
// // 
            // // if (content[x].value != null && content[x].value != "") {
                // // if (content[x].value >= (2147483647)) {
                    // // content[x].value = null;
                    // // alert("The Maximum for this field is 2147483647 ")
                // // }
                // // else if (content[x].value <= (-2147483647)) {
                    // // content[x].value = null;
                    // // alert("The Minimum for this field is 2147483647 ")
                // // }
            // // }
        // // }
// // 
        // // if (content[x].field_type == 'number_integer' || content[x].field_type == 'number_decimal') {
            // // var minRange = (content[x].field_type == 'number_integer') ? -2147483648 : -99999999;
            // // var maxRange = (content[x].field_type == 'number_integer') ? 2147483647 : 99999999;
// // 
            // // if (content[x].value != null && content[x].value != "") {
                // // if (content[x].value >= maxRange) {
                    // // content[x].value = null;
                    // // alert("The Maximum for this field is" + maxRange)
                // // }
                // // else if (content[x].value <= minRange) {
                    // // content[x].value = null;
                    // // alert("The Minimum for this field is " + minRange)
                // // }
            // // }
        // // }
// // 
        // // // Regular expression for phone
        // // if (content[x].field_type == 'phone') {
            // // if (content[x].value != "" && content[x].value != null) {
                // // var str = content[x].value.trim();
                // // var regExp = /\D*(\d*)\D*[2-9][0-8]\d\D*[2-9]\d{2}\D*\d{4}\D*\d*\D*/g
                // // var match = regExp.test(str);
                // // regExp.exec(str)
                // // var matchVal = regExp.exec(str);
                // // if (match == false || (matchVal[1] != '' && matchVal[1] != null)) {
                    // // value_err++;
                    // // string_err += content[x].value + ' is not a valid North American phone number.' + '\nPhone numbers should only contain numbers, +, -, (, ) and spaces and be like 999-999-9999. Please enter a valid ten-digit phone number.';
                // // }
                // // break;
            // // }
        // // }
        // // else if (content[x].field_type == 'omadi_reference') {//for preparing the list of restrictions
            // // Ti.API.info("-------------------- omadi_refrence = " + content[x].value + " ... NID:  " + content[x].nid + "--------------------");
            // // if (content[x].nid != null) {
                // // var d = new Date();
                // // var utcDate = Date.parse(d.toUTCString());
                // // var result = db_check_restrictions.execute('SELECT restriction_license_plate___plate, vin, restrict_entire_account, vehicle___make, vehicle___model, vehicle_color FROM restriction where restriction_account="' + content[x].nid + '" AND ((restriction_start_date < ' + utcDate / 1000 + ' OR restriction_start_date IS NULL) AND (restriction_end_date > ' + utcDate / 1000 + ' OR restriction_end_date IS NULL))');
// // 
                // // while (result.isValidRow()) {
                    // // var restriction = {
                        // // license_plate : result.fieldByName('restriction_license_plate___plate'),
                        // // vehicle_make : result.fieldByName('vehicle___make'),
                        // // vehicle_model : result.fieldByName('vehicle___model'),
                        // // vehicle_color : result.fieldByName('vehicle_color'),
                        // // restrict_entire_account : result.fieldByName('restrict_entire_account'),
                        // // vin : result.fieldByName('vin')
                    // // };
                    // // restrictions.push(restriction);
                    // // result.next();
                // // }
                // // result.close();
            // // }
            // // Ti.API.info("--------------------Restrictions array length : " + restrictions.length + "--------------------");
        // // }
// // 
        // // if (((content[x].is_title === true) || (content[x].required == 'true') || (content[x].required === true) || (content[x].required == '1') || (content[x].required == 1) ) && ((content[x].value == '') || (content[x].value == null)) && (content[x].no_data_checkbox == null || content[x].no_data_checkbox == "" || content[x].no_data_checkbox == false) && content[x].enabled == true) {
            // // //Check for image field
            // // if (content[x].field_type == 'image') {
                // // var is_images_query = 'SELECT id FROM _photos WHERE nid=0 ';
                // // if (win.nid != null && win.nid != "") {
                    // // is_images_query += ' OR nid=' + win.nid + ' ';
                // // }
                // // is_images_query += ' AND field_name="' + content[x].field_name + '";';
                // // Ti.API.info(is_images_query);
// // 
                // // var is_images = db_check_restrictions.execute(is_images_query);
                // // var crdnlty = content[x].cardinality;
                // // //if cardinality is unlimited or one than only one image can be work for required
                // // //But if cardinality is greater than 1 then required that number of images
                // // if (win.mode == 1) {
                    // // if (crdnlty > 1 || crdnlty < 0) {
                        // // var arrImages = content[x].arrImages;
                        // // var imageOdometer = 0;
                        // // for ( i_idx = 0; i_idx < arrImages.length; i_idx++) {
                            // // if (arrImages[i_idx].imageVal != defaultImageVal || arrImages[i_idx].bigImg != null || arrImages[i_idx].bigImg != "") {
                                // // imageOdometer++;
                            // // }
                        // // }
                        // // if ((crdnlty < 1 && imageOdometer == 0) || (crdnlty > 1 && imageOdometer != is_images.rowCount)) {
                            // // string_text += label[content[x].reffer_index].text + "\n";
                            // // count_fields++;
                        // // }
                    // // }
                    // // else {
                        // // if (content[x].imageVal == defaultImageVal && is_images.rowCount == 0) {
                            // // string_text += label[content[x].reffer_index].text + "\n";
                            // // count_fields++;
                        // // }
                    // // }
                // // }
                // // else {
                    // // if ((crdnlty <= 1 && is_images.rowCount == 0) || (crdnlty > 1 && crdnlty != is_images.rowCount)) {
                        // // string_text += label[content[x].reffer_index].text + "\n";
                        // // count_fields++;
                    // // }
                // // }
                // // is_images.close();
                // // continue;
            // // }
            // // count_fields++;
            // // if (content[x].cardinality > 1) {
                // // string_text += "#" + content[x].private_index + " " + label[content[x].reffer_index].text + "\n";
            // // }
            // // else {
                // // string_text += label[content[x].reffer_index].text + "\n";
            // // }
        // // }
    // // }
// // 
    // // var k;
    // // for ( k = 0; k <= content.length; k++) {
        // // if (!content[k]) {
            // // continue;
        // // }
// // 
        // // if ((win.mode == 0 || _flag_info == 'draft')) {
            // // //validating license plate and vin value entered by user against restritions
            // // var r;
            // // for (r in restrictions) {
                // // var accountRestricted = restrictions[r].restrict_entire_account;
                // // if (content[k].field_name == 'license_plate___plate') {
                    // // if (accountRestricted != null && accountRestricted == "1" && accountRestricted != "") {
                        // // a.message = "The selected account is restricted from any parking enforcement activity.";
                        // // a.show();
                        // // return;
                    // // }
                    // // else {
                        // // var license_plate = content[k].value;
                        // // var restricted_license_plate = restrictions[r].license_plate;
                        // // if (license_plate != null && restricted_license_plate != null && license_plate != "" && restricted_license_plate != "") {
                            // // license_plate = license_plate.toLowerCase().replace(/o/g, '0');
                            // // restricted_license_plate = restricted_license_plate.toLowerCase().replace(/o/g, '0');
                            // // Ti.API.info('1 License Plate: ' + license_plate + ' ---- Restriction License Plate: ' + restricted_license_plate);
                            // // if (license_plate.toString() == restricted_license_plate.toString()) {
                                // // var colorName = "";
                                // // var resMsg = "";
                                // // if (restrictions[r].vehicle_color != null && restrictions[r].vehicle_color != "") {
                                    // // var term_data = db_check_restrictions.execute("SELECT name FROM term_data WHERE tid = " + restrictions[r].vehicle_color);
                                    // // colorName = term_data.getFieldByName('name');
                                    // // term_data.close();
                                // // }
                                // // resMsg = colorName + " " + restrictions[r].vehicle_make + " " + restrictions[r].vehicle_model;
                                // // resMsg += ((resMsg.trim() != "") ? " - " : "");
                                // // resMsg += restrictions[r].license_plate + " is currently restricted for the account entered.";
// // 
                                // // a.message = resMsg;
                                // // a.show();
                                // // return;
                            // // }
                        // // }
                    // // }
// // 
                // // }
// // 
                // // if (content[k].field_name == 'vin') {
                    // // if (accountRestricted != null && accountRestricted == "1") {
                        // // a.message = "Do not enforce any violations on this property. It is restricted by management.";
                        // // a.show();
                        // // return;
                    // // }
                    // // else {
                        // // var vin = content[k].value;
                        // // var restricted_vin = restrictions[r].vin;
                        // // if (vin != null && vin != "" && restricted_vin != null && restricted_vin != "") {
                            // // Ti.API.info('VIN: ' + vin + ' RS_VIN: ' + restricted_vin);
                            // // if (vin == restricted_vin) {
                                // // var colorName = "";
                                // // var resMsg = "";
                                // // if (restrictions[r].vehicle_color != null && restrictions[r].vehicle_color != "") {
                                    // // var term_data = db_check_restrictions.execute("SELECT name FROM term_data WHERE tid = " + restrictions[r].vehicle_color);
                                    // // colorName = term_data.getFieldByName('name');
                                    // // term_data.close();
                                // // }
                                // // resMsg = colorName + " " + restrictions[r].vehicle_make + " " + restrictions[r].vehicle_model;
                                // // resMsg += ((resMsg.trim() != "") ? " - " : "");
                                // // resMsg += restrictions[r].vin + " is currently restricted for the account entered.";
// // 
                                // // a.message = resMsg;
                                // // a.show();
                                // // return;
                            // // }
                        // // }
                    // // }
// // 
                // // }
            // // }
        // // }
// // 
    // // }
// // 
    // // db_check_restrictions.close();
// // 
    // // if ((count_fields > 0) && (_flag_info != "draft")) {
        // // if (count_fields == 1) {
            // // if (win.mode == 0) {
                // // a.message = 'The field "' + string_text + '" is empty, please fill it out in order to save this node';
            // // }
            // // else {
                // // a.message = 'The field "' + string_text + '" is empty, please fill it out in order to update this node';
            // // }
        // // }
        // // else {
            // // a.message = 'The following fields are required and are empty:\n' + string_text;
        // // }
        // // a.show();
    // // }
    // // else if (value_err > 0) {
        // // a.message = string_err;
        // // a.show();
    // // }
    // // //TODO: fix the below
    // // /*else if (pass_it === false && Ti.App.Properties.getString("timestamp_offset") > OFF_BY) {
// // 
        // // var actual_time = Math.round(new Date().getTime() / 1000);
        // // actual_time = parseInt(actual_time) + parseInt(Ti.App.Properties.getString("timestamp_offset"));
// // 
        // // var server_time = new Date(actual_time);
// // 
        // // var _a = Titanium.UI.createAlertDialog({
            // // title : 'Omadi',
            // // buttonNames : ['Yes', 'No'],
            // // message : 'Your device\'s clock is off a little bit. Please adjust your clock to ' + timeConverter(server_time, "1") + '. Do you want to save this form now using the correct time?',
            // // cancel : 1
        // // });
        // // _a.show();
// // 
        // // _a.addEventListener('click', function(e) {
            // // if (e.index != e.cancel) {
                // // var _i;
                // // for (_i in content) {
                    // // Ti.API.info("Field: " + content[_i].field_type);
                    // // if (content[_i].field_type == "datestamp" || content[_i].field_type == "omadi_time") {
                        // // var tp = content[_i].value;
                        // // content[_i].value = parseInt(content[_i].value) + parseInt(Ti.App.Properties.getString("timestamp_offset") * 1000);
                        // // alert(tp + '  =  ' + content[_i].value);
                        // // Ti.API.info(tp + '  =  ' + content[_i].value);
                    // // }
                // // }
                // // try {
                    // // keep_info(_flag_info, true, actual_time);
                // // }
                // // catch(e) {
                    // // alert('Error Tracking 9: ' + e);
                    // // //To catch error to resolve issue #916
                // // }
            // // }
            // // else {
                // // try {
                    // // keep_info(_flag_info, true, null);
                // // }
                // // catch(e) {
                    // // alert('Error Tracking 10: ' + e);
                    // // //To catch error to resolve issue #916
                // // }
            // // }
        // // });
// // 
    // // }*/
    // // else {
        // // var mode_msg = '';
        // // var no_data_fields = [];
        // // if (_flag_info == "draft") {
            // // mode_msg = 'Saving draft';
        // // }
        // // else if (win.mode == 0) {
            // // mode_msg = 'Saving ' + win.title;
        // // }
        // // else {
            // // mode_msg = 'Updating ' + win.title;
        // // }
// //         
        // // Ti.API.debug("showing indicator");
// //         
        // // Omadi.display.showLoadingIndicator(mode_msg);
        // // var db_put = Omadi.utils.openMainDatabase();
// // 
        // // //
        // // //Retrieve objects that need quotes:
        // // //
        // // var need_at = db_put.execute("SELECT field_name FROM fields WHERE bundle = '" + win.type + "' AND ( type='number_integer' OR type='number_decimal' ) ");
        // // var quotes = [];
        // // while (need_at.isValidRow()) {
            // // quotes[need_at.fieldByName('field_name')] = true;
            // // need_at.next();
        // // }
        // // need_at.close();
// //         
        // // var nid;
        // // var new_nid;
// //         
        // // if (win.mode == 0) {
            // // //Get smallest nid
            // // nid = db_put.execute("SELECT nid FROM node ORDER BY nid ASC ");
// // 
            // // if (nid.fieldByName('nid') >= 0) {
                // // new_nid = -1;
            // // }
            // // else {
                // // new_nid = nid.fieldByName('nid') - 1;
            // // }
        // // }
// // 
        // // var query = "INSERT OR REPLACE INTO " + win.type + " ( 'nid', ";
// // 
        // // var _array_value = [];
        // // var x_j;
        // // for (x_j in content) {
            // // if ((content[x_j].composed_obj === true) && (content[x_j].cardinality > 1)) {
// // 
                // // if ((content[x_j].field_type == 'omadi_time') || (content[x_j].field_type == 'datestamp')) {
                    // // if (content[x_j].value != null) {
                        // // var _vlr = Math.round(content[x_j].value / 1000);
                    // // }
                    // // else {
                        // // var _vlr = null;
                    // // }
                // // }
                // // else if ((content[x_j].field_type == 'number_integer') || (content[x_j].field_type == 'number_decimal')) {
                    // // if ((content[x_j].value == null) || (content[x_j].value == "") || (content[x_j].value == " ")) {
                        // // var _vlr = null;
                    // // }
                    // // else {
                        // // var _vlr = content[x_j].value;
                    // // }
                // // }
                // // else {
                    // // var _vlr = content[x_j].value;
                // // }
// // 
                // // if (_array_value[content[x_j].field_name]) {
                    // // _array_value[content[x_j].field_name].push(_vlr);
// //                  
                // // }
                // // else {
                    // // _array_value[content[x_j].field_name] = [];
                    // // _array_value[content[x_j].field_name].push(_vlr);
// //                   
                // // }
            // // }
        // // }
// // 
        // // //field names
        // // var j_y;
        // // for ( j_y = 0; j_y < content.length; j_y++) {
            // // Ti.API.info('INDEX: ' + j_y);
// // 
            // // //Is different of a region
            // // if (!content[j_y]) {
                // // continue;
            // // }
// // 
            // // //Point the last field
            // // if (content[j_y + 1]) {
                // // while (content[j_y].field_name == content[j_y + 1].field_name) {
                    // // j_y++;
                    // // if (content[j_y + 1]) {
                        // // //Go on
                    // // }
                    // // else {
                        // // //Finish, we found the point
                        // // break;
                    // // }
                // // }
            // // }
// // 
            // // if (j_y == content.length - 1) {
                // // query += "'" + content[j_y].field_name + "' ) ";
            // // }
            // // else {
                // // query += "'" + content[j_y].field_name + "', ";
            // // }
        // // }
// // 
        // // if (win.mode == 1) {
            // // query += ' VALUES ( ' + win.nid + ', ';
        // // }
        // // else {
            // // query += ' VALUES ( ' + new_nid + ', ';
        // // }
// // 
        // // //Values
        // // var title_to_node = "";
        // // var j;
        // // for ( j = 0; j <= content.length; j++) {
            // // if (!content[j]) {
                // // continue;
            // // }
// // 
            // // if (content[j].is_title === true) {
                // // if (title_to_node.charAt(0) == "") {
                    // // if (content[j].cardinality == -1) {
                        // // var tit_aux = content[j].value;
                        // // if (tit_aux == null)
                            // // tit_aux = "";
                        // // else
                            // // tit_aux = tit_aux[0].title;
                        // // title_to_node = tit_aux;
                    // // }
                    // // else {
                        // // if (content[j].value == null) {
                            // // title_to_node = "";
                        // // }
                        // // else {
                            // // title_to_node = content[j].value;
                        // // }
                    // // }
                // // }
                // // else {
                    // // if (content[j].cardinality == -1) {
                        // // var tit_aux = content[j].value;
                        // // if (tit_aux == null)
                            // // tit_aux = "";
                        // // else
                            // // tit_aux = " - " + tit_aux[0].title;
                        // // title_to_node += tit_aux;
                    // // }
                    // // else {
                        // // if (content[j].value == null) {
                            // // title_to_node = "";
                        // // }
                        // // else {
                            // // title_to_node += " - " + content[j].value;
                        // // }
                    // // }
                // // }
            // // }
// // 
            // // Ti.API.info(content[j].field_type + ' is the field');
// // 
            // // if (quotes[content[j].field_name] === true) {
                // // var mark = "";
            // // }
            // // else {
                // // var mark = '"';
            // // }
// // 
            // // if (content[j].value === null) {
                // // mark = "";
            // // }
// // 
            // // var value_to_insert = '';
            // // var is_no_data = false;
            // // //INSERTING NO DATA FIEDLS IN ARRAY
            // // if (content[j].no_data_checkbox != null && content[j].no_data_checkbox != "" && content[j].no_data_checkbox) {
                // // is_no_data = true;
                // // if (content[j].noDataView != null) {
                    // // var fieldName = content[j].field_name;
                    // // if (content[j].partsArr != null && content[j].partsArr.length > 0) {
                        // // fieldName = fieldName.split('___');
                        // // fieldName = fieldName[0];
                    // // }
                    // // no_data_fields.push(fieldName);
                // // }
            // // }
// // 
            // // //If it is a composed field, just insert the number
            // // //Build cardinality for fields
            // // if ((content[j].composed_obj === true) && (content[j].cardinality > 1)) {
                // // //Point the last field
                // // if (content[j + 1]) {
                    // // while (content[j].field_name == content[j + 1].field_name) {
                        // // j++;
                        // // if (content[j + 1]) {
                            // // //Go on
                        // // }
                        // // else {
                            // // //Finish, we found the point
                            // // break;
                        // // }
                    // // }
                // // }
                // // if (!is_no_data) {
// // 
                    // // //Treat the array
                    // // content_s = treatArray(_array_value[content[j].field_name], 6);
                    // // Ti.API.info('About to insert ' + _array_value[content[j].field_name]);
                    // // // table structure:
                    // // // incremental, node_id, field_name, value
                    // // if (win.mode == 0) {
                        // // Ti.API.info('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + new_nid + ', \'' + content[j].field_name + '\',  \'' + content_s + '\' )');
                        // // db_put.execute("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + new_nid + ", \"" + content[j].field_name + "\",  \"" + content_s + "\" )");
                    // // }
                    // // else {
                        // // Ti.API.info("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + win.nid + ", \"" + content[j].field_name + "\",  \"" + content_s + "\" )");
                        // // db_put.execute("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + win.nid + ", \"" + content[j].field_name + "\",  \"" + content_s + "\" )");
                    // // }
// // 
                    // // // Code must to be a number since this database field accepts only integers numbers
                    // // // Token to indentify array of numbers is 7411317618171051229
                    // // value_to_insert = 7411317618171051229;
                // // }
            // // }
            // // else if (!is_no_data) {
// // 
                // // if ((content[j].field_type == 'number_decimal') || (content[j].field_type == 'number_integer')) {
                    // // if ((content[j].value == '') || (content[j].value == null)) {
                        // // value_to_insert = 'null';
                        // // mark = '"';
                    // // }
                    // // else {
                        // // value_to_insert = content[j].value;
                        // // mark = '';
                    // // }
                // // }
                // // else if (content[j].field_type == 'user_reference') {
                    // // if (content[j].value == null) {
                        // // value_to_insert = ''
                        // // mark = '\"';
                    // // }
                    // // else {
                        // // value_to_insert = content[j].value;
                        // // mark = '';
                    // // }
                // // }
                // // else if (content[j].field_type == 'taxonomy_term_reference') {
                    // // if (content[j].widget == 'options_select') {
                        // // if (content[j].cardinality != -1) {
                            // // if (content[j].value == null) {
                                // // value_to_insert = ''
                                // // mark = '\"';
                            // // }
                            // // else {
                                // // value_to_insert = content[j].value;
                                // // mark = '';
                            // // }
                        // // }
                        // // else {
// // 
                            // // var vital_info = [];
// // 
                            // // if (content[j].value == null) {
                                // // vital_info.push("null");
                            // // }
                            // // else {
                                // // var v_info_tax;
                                // // for (v_info_tax in content[j].value ) {
                                    // // vital_info.push(content[j].value[v_info_tax].v_info.toString());
                                // // }
                            // // }
// // 
                            // // //Treat the array
                            // // content_s = treatArray(vital_info, 6);
                            // // Ti.API.info('About to insert ' + content[j].field_name);
                            // // // table structure:
                            // // // incremental, node_id, field_name, value
                            // // if (win.mode == 0) {
                                // // Ti.API.info("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + new_nid + ", \"" + content[j].field_name + "\",  \"" + content_s + "\" )");
                                // // db_put.execute("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + new_nid + ", \"" + content[j].field_name + "\",  \"" + content_s + "\" )");
                            // // }
                            // // else {
                                // // Ti.API.info("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + win.nid + ", \"" + content[j].field_name + "\",  \"" + content_s + "\" )");
                                // // db_put.execute("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + win.nid + ", \"" + content[j].field_name + "\",  \"" + content_s + "\" )");
                            // // }
                            // // // Code must to be a number since this database field accepts only integers numbers
                            // // // Token to indentify array of numbers is 7411317618171051229
                            // // value_to_insert = 7411317618171051229;
                            // // mark = '';
                        // // }
                    // // }
                    // // else if (content[j].widget == 'taxonomy_autocomplete') {
                        // // if ((content[j].tid == null) && (content[j].value == "")) {
                            // // value_to_insert = '';
                            // // mark = '\"';
                        // // }
                        // // else if ((win.mode == 0) && (content[j].tid == null) && (content[j].value != "")) {
                            // // if (content[j].restrict_new_autocomplete_terms != 1) {
                                // // mark = '';
                                // // //Get smallest tid
                                // // var tid = db_put.execute("SELECT tid FROM term_data ORDER BY tid ASC ");
// // 
                                // // if (tid.fieldByName('tid') >= 0) {
                                    // // var new_tid = -1;
                                // // }
                                // // else {
                                    // // var new_tid = tid.fieldByName('tid') - 1;
                                // // }
                                // // var date_created = Math.round(+new Date() / 1000);
                                // // db_put.execute("INSERT INTO term_data (tid, vid, name, description, weight, created) VALUES (" + new_tid + ", " + content[j].vid + ", '" + content[j].value + "', '', '', '" + date_created + "'  )");
                                // // value_to_insert = new_tid;
// // 
                                // // Ti.API.info('First tid is: ' + new_tid + ' and tid ' + content[j].tid + ' and value ' + content[j].value);
                                // // tid.close();
                            // // }
                            // // else {
                                // // value_to_insert = '';
                            // // }
// // 
                        // // }
                        // // else if ((content[j].tid != null)) {
                            // // mark = '';
                            // // value_to_insert = content[j].tid;
                        // // }
                    // // }
                // // }
                // // else if (content[j].field_type == 'omadi_reference') {
                    // // if (content[j].nid === null) {
                        // // value_to_insert = '';
                        // // mark = '\"';
                    // // }
                    // // else {
                        // // mark = '';
                        // // value_to_insert = content[j].nid;
                    // // }
                // // }
                // // else if (content[j].field_type == 'list_boolean') {
                    // // if (content[j].value === true) {
                        // // value_to_insert = 1;
                    // // }
                    // // else {
                        // // value_to_insert = 0;
                    // // }
                // // }
                // // else if (content[j].field_type == 'rules_field') {
                    // // if (content[j].value === false || content[j].value === 0 || content[j].value === 'false') {
                        // // value_to_insert = 'false';
                    // // }
                    // // else {
                        // // value_to_insert = JSON.stringify(content[j].value).replace(/"/gi, "\"\"");
                    // // }
                // // }
                // // else if ((content[j].field_type == 'omadi_time') || (content[j].field_type == 'datestamp')) {
                    // // if (content[j].update_it === true) {
                        // // value_to_insert = Math.round(content[j].value / 1000);
                    // // }
                    // // else {
                        // // mark = "\"";
                        // // value_to_insert = '';
                    // // }
                // // }
                // // else {
                    // // value_to_insert = content[j].value;
                // // }
            // // }
            // // if (value_to_insert == '') {
                // // mark = '\"';
            // // }
// // 
            // // if (j == content.length - 1) {
                // // query += mark + "" + value_to_insert + "" + mark + " )";
            // // }
            // // else {
                // // query += mark + "" + value_to_insert + "" + mark + ", ";
            // // }
            // // Ti.API.info(content[j].field_type + ' has value to insert ' + value_to_insert);
        // // }
// // 
        // // var has_bug = false;
        // // try {
            // // Ti.API.info('Title: ' + title_to_node);
            // // if (title_to_node == "") {
                // // title_to_node = "No title";
            // // }
// // 
            // // //No data fields JSON
            // // var no_data_fields_content = '';
            // // for ( idx_k = 0; idx_k < no_data_fields.length; idx_k++) {
                // // if (idx_k == no_data_fields.length - 1) {
                    // // no_data_fields_content += '\"' + no_data_fields[idx_k] + '\" : \"' + no_data_fields[idx_k] + '\"';
                // // }
                // // else {
                    // // no_data_fields_content += '\"' + no_data_fields[idx_k] + '\" : \"' + no_data_fields[idx_k] + '\",';
                // // }
            // // }
            // // if (no_data_fields_content != null && no_data_fields_content != '') {
                // // no_data_fields_content = "{" + no_data_fields_content + "}"
            // // }
// // 
            // // // var nodeObj = {};
// // //             
            // // // nodeObj.nid = 0;
            // // // nodeObj.perm_edit = 0;
            // // // nodeObj.perm_delete = 0;
// // //             
            // // // nodeObj.changed = 0;
            // // // nodeObj.title = '';
            // // // nodeObj.author_uid = 0;
            // // // nodeObj.flag_is_updated = 0;
            // // // nodeObj.table_name = 0;
            // // // nodeObj.form_part = 0;
            // // // nodeObj.changed_uid = 0;
            // // // nodeObj.no_data_fields = ';'
            // // // nodeObj.viewed = "1";
// // //                
// // //             
            // // // nodeObj.created = 0;
// //         
            // // //Insert into node table
            // // if (_flag_info == "draft") {
                // // if (win.mode == 1) {
                   // // // Ti.API.info('UPDATE node SET changed="' + _now + '", title="' + title_to_node + '" , flag_is_updated=3, table_name="' + win.type + '", form_part =' + win.region_form + ', no_data_fields=\'' + no_data_fields_content + '\' WHERE nid=' + win.nid);
                    // // db_put.execute('UPDATE node SET changed="' + _now + '", title="' + title_to_node + '" , flag_is_updated=3, table_name="' + win.type + '", form_part =' + win.region_form + ', no_data_fields=\'' + no_data_fields_content + '\', viewed=\'1\' WHERE nid=' + win.nid);
                // // }
                // // else {
                    // // //Ti.API.info('INSERT OR REPLACE INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name, form_part, no_data_fields ) VALUES (' + new_nid + ', ' + _now + ', 0, "' + title_to_node + '" , ' + win.uid + ', 3 , "' + win.type + '" , ' + win.region_form + ', \'' + no_data_fields_content + '\')');
                    // // db_put.execute('INSERT INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name , form_part, no_data_fields, viewed ) VALUES (' + new_nid + ', ' + _now + ', 0, "' + title_to_node + '" , ' + win.uid + ', 3 , "' + win.type + '", ' + win.region_form + ', \'' + no_data_fields_content + '\', \'1\')');
// // 
                // // }
            // // }
            // // else if (win.mode == 1) {
               // // // Ti.API.info('UPDATE node SET changed="' + _now + '", title="' + title_to_node + '" , flag_is_updated=1, table_name="' + win.type + '", form_part =' + win.region_form + ', no_data_fields=\'' + no_data_fields_content + '\' WHERE nid=' + win.nid);
                // // db_put.execute('UPDATE node SET changed="' + _now + '", title="' + title_to_node + '" , flag_is_updated=1, table_name="' + win.type + '", form_part =' + win.region_form + ', no_data_fields=\'' + no_data_fields_content + '\', viewed=\'1\' WHERE nid=' + win.nid);
            // // }
            // // else {
                // // //Ti.API.info('INSERT OR REPLACE INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name, form_part, no_data_fields ) VALUES (' + new_nid + ', ' + _now + ', 0, "' + title_to_node + '" , ' + win.uid + ', 1 , "' + win.type + '", ' + win.region_form + ', \'' + no_data_fields_content + '\')');
                // // db_put.execute('INSERT OR REPLACE INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name, form_part, no_data_fields, viewed) VALUES (' + new_nid + ', ' + _now + ', 0, "' + title_to_node + '" , ' + win.uid + ', 1 , "' + win.type + '"  , ' + win.region_form + ', \'' + no_data_fields_content + '\', \'1\')');
            // // }
// // 
            // // //Insert into table
            // // Ti.API.info("=====Query=== " + query);
            // // if (win.mode == 1) {
                // // var oldVal = db_put.execute('SELECT * FROM ' + win.type + ' WHERE nid=' + win.nid);
            // // }
            // // db_put.execute(query);
// // 
            // // //If Images captured and not yet uploaded then store in file_uploaded_queue
            // // if (win.mode == 1) {
                // // file_upload_nid = win.nid;
            // // }
            // // else {
                // // file_upload_nid = new_nid;
            // // }
            // // db_put.execute('UPDATE _photos SET nid=' + file_upload_nid + ' WHERE nid=0;');
// // 
            // // //If Images captured and not yet uploaded then store in file_uploaded_queue
            // // var j;
            // // for ( j = 0; j <= content.length; j++) {
                // // if (!content[j]) {
                    // // continue;
                // // }
                // // if (content[j].field_type == 'image' && win.mode == 1) {
                    // // db_put.execute('UPDATE ' + win.type + ' SET ' + content[j].field_name + '="' + oldVal.fieldByName(content[j].field_name) + '", ' + content[j].field_name + '___file_id="' + oldVal.fieldByName(content[j].field_name + '___file_id') + '", ' + content[j].field_name + '___status="' + oldVal.fieldByName(content[j].field_name + '___status') + '" WHERE nid=' + file_upload_nid + ';');
                // // }
            // // }
// // 
            // // Ti.API.info("New Nid = " + file_upload_nid);
            // // /*for (var j = 0; j <= content.length; j++) {
             // // if (!content[j]) {
             // // continue;
             // // }
// // 
             // // var file_upload_nid;
// // 
             // // if (win.mode == 1) {
             // // file_upload_nid = win.nid;
             // // } else {
             // // file_upload_nid = new_nid;
             // // }
// // 
             // // if (content[j].field_type == 'image' && (content[j].cardinality > 1 || content[j].cardinality < 0) && !content[j].no_data_checkbox) {
             // // var arrImages = content[j].arrImages;
             // // for ( k = 0; k < arrImages.length; k++) {
             // // if (arrImages[k].isImage != false && arrImages[k].mimeType != null) {
             // // var encodeImage = Ti.Utils.base64encode(arrImages[k].bigImg);
             // // var mime = arrImages[k].mimeType;
             // // var imageName = 'image.' + mime.substring(mime.indexOf('/') + 1, mime.length);
             // // var is_exists = db_put.execute('SELECT delta, nid FROM _photos WHERE nid=' + file_upload_nid + ' and delta=' + arrImages[k].private_index + ' and field_name="' + content[j].field_name + '";');
             // // if (is_exists.rowCount > 0) {
             // // db_put.execute('UPDATE _photos SET nid="' + file_upload_nid + '", file_data="' + encodeImage + '", field_name="' + content[j].field_name + '", file_name="' + imageName + '", delta=' + arrImages[k].private_index + ' WHERE nid=' + file_upload_nid + ' and delta=' + arrImages[k].private_index + ' and field_name="' + content[j].field_name + '";');
             // // continue;
             // // }
// // 
             // // db_put.execute('INSERT INTO _photos (nid , file_data , field_name, file_name, delta) VALUES (' + file_upload_nid + ', "' + encodeImage + '", "' + content[j].field_name + '", "' + imageName + '", ' + arrImages[k].private_index + ')');
             // // Ti.API.info('Filse Saved' + arrImages[k].private_index);
             // // }
             // // }
             // // } else if (content[j].field_type == 'image'  && !content[j].no_data_checkbox) {
             // // if (content[j].isImage != false && content[j].mimeType != null) {
             // // var encodeImage = Ti.Utils.base64encode(content[j].bigImg);
             // // var mime = content[j].mimeType;
             // // var imageName = 'image.' + mime.substring(mime.indexOf('/') + 1, mime.length);
// // 
             // // var is_exists = db_put.execute('SELECT delta, nid FROM _photos WHERE nid=' + file_upload_nid + ' and delta=' + content[j].private_index + ' and field_name="' + content[j].field_name + '";');
// // 
             // // if (is_exists.rowCount > 0) {
             // // db_put.execute('UPDATE _photos SET nid="' + file_upload_nid + '", file_data="' + encodeImage + '", field_name="' + content[j].field_name + '", file_name="' + imageName + '", delta=' + content[j].private_index + ' WHERE nid=' + file_upload_nid + ' and delta=' + content[j].private_index + ' and field_name="' + content[j].field_name + '";');
             // // continue;
             // // }
             // // db_put.execute('INSERT INTO _photos (nid , file_data , field_name, file_name, delta) VALUES (' + file_upload_nid + ', "' + encodeImage + '", "' + content[j].field_name + '", "' + imageName + '","' + content[j].private_index + '")');
             // // }
             // // }
// // 
             // // if (content[j].field_type == 'image' && win.mode == 1) {
             // // db_put.execute('UPDATE ' + win.type + ' SET ' + content[j].field_name + '="' + oldVal.fieldByName(content[j].field_name) + '", ' + content[j].field_name + '___file_id="' + oldVal.fieldByName(content[j].field_name + '___file_id') + '", ' + content[j].field_name + '___status="' + oldVal.fieldByName(content[j].field_name + '___status') + '" WHERE nid=' + file_upload_nid + ';');
             // // }
             // // }*/
// // 
// //          
            // // has_bug = false;
        // // }
        // // catch(e) {
            // // Ti.API.info("Error----------" + e);
// // 
            // // if (_flag_info == 'draft') {
// //                 
                // // alert('An error has occurred when we tried to save this node as a draft, please try again');
            // // }
            // // else if (win.mode == 1) {
// //                 
               // // alert('An error has occurred when we tried to update this new node, please try again');
            // // }
            // // else {
// //                 
                // // alert('An error has occurred when we tried to create this new node, please try again');
            // // }
            // // has_bug = true;
        // // }
        // // finally{
            // // db_put.close();
        // // }
// // 
        // // Ti.API.info('========= Updating new info running ========= ' + _flag_info);
// //         
        // // var alertMessage = "";
        // // if(has_bug){
            // // alert("There was a problem saving your data. Please try again. If this error continues, please report the problem.");
        // // }
        // // else if(_flag_info == 'draft'){
            // // alert('The ' + win.title + ' was saved as a draft.');
            // // close_me();
        // // }
        // // else if(Ti.Network.online){
            // // if (_flag_info == "normal") {
                // // Ti.API.info('Submitting, mode=' + win.mode);
                // // //Omadi.service.sendUpdates();
                // // update_node(win.mode, close_me, win.type.toUpperCase());
            // // }
            // // else {
                // // Ti.API.info('Submitting and preparing next part reload');
                // // //Omadi.service.sendUpdates();
                // // // TODO: send the user to the next form part
                // // update_node(win.mode, reload_me, win.type.toUpperCase(), _flag_info);
            // // }
        // // }
        // // else{
// //            
            // // alert('Alert management of this ' + win.title + ' immediately. You do not have an Internet connection right now.  Your data was saved and will be synched when you connect to the Internet.');
            // // close_me_delay();
        // // }
// //         
        // // // if ((Titanium.Network.online) && (has_bug === false) && (_flag_info != 'draft')) {
// // //             
        // // // }
        // // // else if (has_bug === true) {
            // // // Ti.API.info('Error');
            // // // close_me_delay();
        // // // }
        // // // else if (!(Titanium.Network.online) || (_flag_info == 'draft')) {
            // // // if (_flag_info == 'draft') {
// // //                
// // //                 
            // // // }
            // // // else if (win.mode == 1) {
// // //                 
                // // // alert('Alert management of this updated ' + win.title + ' immediately. Your device failed to connect to the Internet.');
// // //                 
            // // // }
            // // // else {
// // //                 
                // // // alert('Alert management of this new ' + win.title + ' immediately. Your device failed to connect to the Internet.');
            // // // }
// // //             
        // // // }
    // // }
// // }
// 
// function close_me_delay() {
    // setTimeout(function() {
        // Omadi.display.hideLoadingIndicator();
        // //win.close();
    // }, 3000);
// }
// 
// function close_me(isError) {
    // Omadi.display.hideLoadingIndicator();
    // if (isError == false) {
        // win.close();
    // }
// }
// 
// function reload_me(part) {
    // var new_node = Titanium.App.Properties.getString("new_node_id");
    // if (new_node != null) {
        // win.nid = new_node;
    // }
// 
    // Ti.API.info('Part is: ' + part);
    // Ti.API.info(win.title + ' - ' + win.type + ' - ' + win.uid + ' - ' + win.nameSelected + ' - ' + win.nid);
    // Omadi.display.hideLoadingIndicator();
    // win.remove(resultView);
// 
    // if (PLATFORM == 'android') {
        // //The view where the results are presented
        // resultView = Ti.UI.createView({
            // top : 0,
            // height : '100%',
            // width : '100%',
            // backgroundColor : '#EEEEEE',
            // opacity : 1
        // });
        // win.add(resultView);
// 
        // viewContent = Ti.UI.createScrollView({
            // bottom : 0,
            // contentHeight : 'auto',
            // //top : "11%",
            // backgroundColor : '#EEEEEE',
            // showHorizontalScrollIndicator : false,
            // showVerticalScrollIndicator : true,
            // opacity : 1,
            // scrollType : "vertical",
            // zIndex : 10
        // });
    // }
    // else {
// 
        // //The view where the results are presented
        // resultView = Ti.UI.createView({
            // top : "8%",
            // height : '92%',
            // width : '100%',
            // bottom : 0,
            // backgroundColor : '#EEEEEE',
            // opacity : 1
        // });
        // win.add(resultView);
// 
        // viewContent = Ti.UI.createScrollView({
            // contentHeight : 'auto',
            // //height : "98%",
            // backgroundColor : '#EEEEEE',
            // showHorizontalScrollIndicator : false,
            // showVerticalScrollIndicator : true,
            // opacity : 1,
            // scrollType : "vertical",
            // zIndex : 10
        // });
    // }
// 
    // resultView.add(viewContent);
// 
    // win.mode = 1;
    // /*
     // Ti.API.info('###############>>>>>>>>      Before increment : '+win.region_form);
     // var db_nod_i = Omadi.utils.openMainDatabase();
     // db_nod_i.execute('UPDATE node SET form_part='+parseInt(part)+'  WHERE nid=' + win.nid);
     // db_nod_i.close();
     // */
    // win.region_form = parseInt(part);
// 
    // Ti.API.info('###############>>>>>>>>      After increment : ' + win.region_form);
    // setTimeout(function() {
        // create_or_edit_node.loadUI();
        // get_android_menu(true);
    // }, 100);
// 
// }
// 
// //Return models based on a certain "make" if "make" is not present returns the whole database set
// function get_models(make) {
    // var db_for_veh = Omadi.utils.openMainDatabase();
// 
    // var _aux_dt = db_for_veh.execute("SELECT DISTINCT model FROM _vehicles WHERE make LIKE '%" + make + "%'");
    // var _set_result = [];
    // if (_aux_dt.rowCount > 0) {
        // while (_aux_dt.isValidRow()) {
            // _set_result.push(_aux_dt.fieldByName('model'));
            // _aux_dt.next();
        // }
    // }
    // else {
        // var _aux_dt = db_for_veh.execute("SELECT DISTINCT model FROM _vehicles");
        // while (_aux_dt.isValidRow()) {
            // _set_result.push(_aux_dt.fieldByName('model'));
            // _aux_dt.next();
        // }
    // }
    // db_for_veh.close();
    // return _set_result;
// }
// 
// function config_label(label) {
    // label.color = "#FFFFFF";
    // label.textAlign = 'left';
    // label.left = '3%';
    // label.touchEnabled = false;
    // label.height = 40;
// }
// 
// function config_content(content) {
    // content.color = "#000000";
    // content.textAlign = 'left';
    // content.left = "3%";
    // content.height = 40;
// }
// 
// function form_min(min) {
    // if (min < 10) {
        // return '0' + min;
    // }
    // return min;
// }
// 
// function display_widget(obj) {
    // if (PLATFORM == 'android') {
        // Ti.UI.Android.hideSoftKeyboard();
        // Ti.API.debug("hid keyboard in display_widget");
    // };
    // var win_wid = Ti.UI.createWindow({
        // backgroundColor : "#000",
        // navBarHidden : true,
        // opacity : 0.9
    // });
// 
    // var widget = obj.widget;
    // var settings = obj.settings
    // Ti.API.info('====>> Widget settings = ' + widget.settings['time']);
// 
    // var tit_picker = Ti.UI.createLabel({
        // top : 0,
        // width : '100%',
        // height : '10%',
        // backgroundColor : '#FFF',
        // color : '#000',
        // textAlign : 'center',
        // font : {
            // fontWeight : 'bold'
        // },
        // text : obj.title_picker
    // });
    // win_wid.add(tit_picker);
// 
    // // call function display_widget
    // if (widget.settings['time'] != "1") {
// 
        // //Get current
        // var currentDate = obj.currentDate;
        // var day = currentDate.getDate();
        // var month = currentDate.getMonth();
        // var year = currentDate.getFullYear();
// 
        // //Min
        // var minDate = new Date();
        // minDate.setFullYear(year - 5);
        // minDate.setMonth(0);
        // minDate.setDate(1);
// 
        // //Max
        // var maxDate = new Date();
        // maxDate.setFullYear(year + 5);
        // maxDate.setMonth(11);
        // maxDate.setDate(31);
// 
        // //Current
        // var value_date = new Date();
        // value_date.setFullYear(year);
        // value_date.setMonth(month);
        // value_date.setDate(day);
// 
        // obj.update_it = true;
        // obj.value = Math.round(obj.currentDate.getTime());
// 
        // var date_picker = Titanium.UI.createPicker({
            // borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            // value : obj.currentDate,
            // font : {
                // fontSize : 18
            // },
            // type : Ti.UI.PICKER_TYPE_DATE,
            // minDate : minDate,
            // maxDate : maxDate,
            // report : obj.currentDate,
            // color : '#000000'
        // });
        // date_picker.selectionIndicator = true;
// 
        // Ti.API.info('Value: ' + obj.value);
// 
        // date_picker.addEventListener('change', function(e) {
            // e.source.report = e.value;
        // });
        // //Add fields:
        // win_wid.add(date_picker);
// 
        // var done = Ti.UI.createButton({
            // title : 'Done',
            // bottom : 10,
            // width : '35%',
            // left : '10%',
            // height : '10%'
        // });
// 
        // var cancel = Ti.UI.createButton({
            // title : 'Cancel',
            // bottom : 10,
            // width : '35%',
            // left : '55%',
            // height : '10%'
        // });
// 
        // win_wid.add(done);
        // win_wid.add(cancel);
// 
        // done.addEventListener('click', function() {
            // obj.currentDate = date_picker.report;
            // obj.value = Math.round(obj.currentDate.getTime());
// 
            // var f_date = obj.currentDate.getDate();
            // var f_month = months_set[obj.currentDate.getMonth()];
            // var f_year = obj.currentDate.getFullYear();
// 
            // obj.text = f_month + " / " + f_date + " / " + f_year;
            // changedContentValue(obj);
            // setRulesField(obj);
            // noDataChecboxEnableDisable(obj, obj.reffer_index);
            // win_wid.close();
        // });
// 
        // cancel.addEventListener('click', function() {
            // if (obj.value == null) {
                // obj.update_it = false;
            // }
            // win_wid.close();
        // });
    // }
    // else {
        // //Composed field
        // // Date picker
        // // Time picker
        // // For current Titanium Studio version (1.8), Android doesn't supply such pre build API. Here we create it
// 
        // obj.update_it = true;
        // //Get current
        // var currentDate = obj.currentDate;
        // var year = currentDate.getFullYear();
        // var changedDate = obj.currentDate;
        // var changedTime = obj.currentDate;
        // var iOSDateCal = obj.currentDate;
        // var date_picker;
// 
        // //Min
        // var minDate = new Date();
        // minDate.setFullYear(year - 5);
        // minDate.setMonth(0);
        // minDate.setDate(1);
// 
        // //Max
        // var maxDate = new Date();
        // maxDate.setFullYear(year + 5);
        // maxDate.setMonth(11);
        // maxDate.setDate(31);
// 
        // var date_picker = Titanium.UI.createPicker({
            // useSpinner : true,
            // borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            // value : obj.currentDate,
            // font : {
                // fontSize : 18
            // },
            // type : Ti.UI.PICKER_TYPE_DATE,
            // minDate : minDate,
            // maxDate : maxDate,
            // color : '#000000',
            // top : '12%'
        // });
        // date_picker.selectionIndicator = true;
// 
        // /*
         // * Time picker
         // */
        // var time_picker = Titanium.UI.createPicker({
            // useSpinner : true,
            // borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            // value : obj.currentDate,
            // font : {
                // fontSize : 18
            // },
            // type : Ti.UI.PICKER_TYPE_TIME,
            // color : '#000000',
            // top : '50%',
            // timezone : null,
            // format24 : (omadi_time_format == 'g:iA' ? false : true)
        // });
        // time_picker.selectionIndicator = true;
        // time_picker.date_picker = date_picker;
        // date_picker.time_picker = time_picker;
// 
        // date_picker.addEventListener('change', function(e) {
            // e.source.time_picker.value = e.value;
            // changedDate = e.value;
            // iOSDateCal = e.value;
        // });
// 
        // //Add field:
        // win_wid.add(date_picker);
// 
        // time_picker.addEventListener('change', function(e) {
            // e.source.date_picker.value = e.value;
            // changedTime = e.value;
            // iOSDateCal = e.value;
        // });
        // //Add field:
        // win_wid.add(time_picker);
        // var done = Ti.UI.createButton({
            // title : 'Done',
            // bottom : 10,
            // width : '35%',
            // left : '10%',
            // height : '10%'
        // });
// 
        // var cancel = Ti.UI.createButton({
            // title : 'Cancel',
            // bottom : 10,
            // width : '35%',
            // left : '55%',
            // height : '10%'
        // });
// 
        // win_wid.add(done);
        // win_wid.add(cancel);
// 
        // done.addEventListener('click', function() {
            // if (PLATFORM == "android") {
                // obj.currentDate.setDate(changedDate.getDate());
                // obj.currentDate.setMonth(changedDate.getMonth());
                // obj.currentDate.setFullYear(changedDate.getFullYear());
                // obj.currentDate.setHours(changedTime.getHours());
                // obj.currentDate.setMinutes(changedTime.getMinutes());
                // obj.currentDate.setSeconds(changedTime.getSeconds());
            // }
            // else {
                // obj.currentDate = iOSDateCal;
            // }
// 
            // obj.value = obj.currentDate.getTime();
// 
            // var f_minute = obj.currentDate.getMinutes();
            // var f_hour = obj.currentDate.getHours();
            // var f_date = obj.currentDate.getDate();
            // var f_month = months_set[obj.currentDate.getMonth()];
            // var f_year = obj.currentDate.getFullYear();
// 
            // obj.text = date(omadi_time_format, obj.currentDate) + " - " + f_month + " / " + f_date + " / " + f_year;
            // changedContentValue(obj);
            // setRulesField(obj);
            // win_wid.close();
        // });
// 
        // cancel.addEventListener('click', function() {
            // if (obj.value == null) {
                // obj.update_it = false;
            // }
            // win_wid.close();
        // });
    // }
// 
    // win_wid.open();
// 
// }
// 
// function display_omadi_time(obj) {
    // if (PLATFORM == 'android') {
        // Ti.UI.Android.hideSoftKeyboard();
        // Ti.API.debug("hide keyboard in display_omadi_time");
    // };
    // var win_wid = Ti.UI.createWindow({
        // //modal: true,
        // navBarHidden : true,
        // backgroundColor : "#000",
        // opacity : 0.9
    // });
// 
    // var widget = obj.widget;
    // var settings = obj.settings;
// 
    // var tit_picker = Ti.UI.createLabel({
        // top : 0,
        // width : '100%',
        // height : '10%',
        // backgroundColor : '#FFF',
        // color : '#000',
        // textAlign : 'center',
        // font : {
            // fontWeight : 'bold'
        // },
        // text : obj.title_picker
    // });
    // win_wid.add(tit_picker);
// 
    // obj.update_it = true;
    // //Refresh GMT value
    // obj.value = Math.round(obj.currentDate.getTime());
// 
    // var date_picker = Titanium.UI.createPicker({
        // borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        // value : obj.currentDate,
        // font : {
            // fontSize : 18
        // },
        // report : obj.currentDate,
        // type : Ti.UI.PICKER_TYPE_TIME,
        // color : '#000000',
        // format24 : (omadi_time_format == 'g:iA' ? false : true)
    // });
    // date_picker.selectionIndicator = true;
// 
    // Ti.API.info('Value: ' + obj.value);
// 
    // date_picker.addEventListener('change', function(e) {
        // e.source.report = e.value;
    // });
    // //Add fields:
    // win_wid.add(date_picker);
// 
    // var done = Ti.UI.createButton({
        // title : 'Done',
        // bottom : 10,
        // width : '35%',
        // left : '10%',
        // height : '10%'
    // });
// 
    // var cancel = Ti.UI.createButton({
        // title : 'Cancel',
        // bottom : 10,
        // width : '35%',
        // left : '55%',
        // height : '10%'
    // });
// 
    // win_wid.add(done);
    // win_wid.add(cancel);
// 
    // done.addEventListener('click', function() {
        // obj.currentDate = date_picker.report;
        // obj.value = Math.round(obj.currentDate.getTime());
        // Ti.API.info('Date : ' + obj.currentDate);
        // Ti.API.info('Value: ' + obj.value);
// 
        // var hours = obj.currentDate.getHours();
        // var min = obj.currentDate.getMinutes();
// 
        // //obj.text = hours + ":" + form_min(min);
        // obj.text = date(omadi_time_format, obj.currentDate);
        // changedContentValue(obj);
        // noDataChecboxEnableDisable(obj, obj.reffer_index);
        // win_wid.close();
    // });
// 
    // cancel.addEventListener('click', function() {
        // if (obj.value == null) {
            // obj.update_it = false;
        // }
        // win_wid.close();
    // });
// 
    // win_wid.open();
// }
// 
// function open_mult_selector(obj) {
    // if (PLATFORM == 'android') {
        // Ti.UI.Android.hideSoftKeyboard();
        // Ti.API.debug("hide keyboard in open_mult_selector");
    // };
    // var win_wid = Ti.UI.createWindow({
        // //	modal: true,
        // navBarHidden : true,
        // opacity : 1
    // });
    // var opacView = Ti.UI.createView({
        // left : 0,
        // right : 0,
        // top : 0,
        // bottom : 0,
        // backgroundColor : '#000000',
        // opacity : 0.5
    // });
    // var coItemSelected = 0;
    // win_wid.add(opacView);
// 
    // var win_view = Ti.UI.createView({
        // backgroundColor : '#FFFFFF',
        // top : '6%',
        // left : '6%',
        // right : '6%',
        // bottom : '6%',
        // borderRadius : 10,
        // borderWidth : 2,
        // borderColor : '#FFFFFF',
        // opacity : 1
    // });
    // win_wid.add(win_view);
// 
    // var header_sel = Ti.UI.createView({
        // top : 0,
        // height : '15%',
        // backgroundColor : '#333'
    // });
    // win_view.add(header_sel);
// 
    // var ico_sel = Ti.UI.createImageView({
        // image : '/images/drop.png',
        // width : "31dp",
        // height : "31dp",
        // left : "10dp"
    // });
    // header_sel.add(ico_sel);
// 
    // var label_sel = Ti.UI.createLabel({
        // text : obj.view_title,
        // color : '#FFF',
        // font : {
            // fontSize : '18dp',
            // fontWeight : 'bold'
        // },
        // left : '51dp',
        // wordWrap : false,
        // ellipsize : true
    // });
    // header_sel.add(label_sel);
// 
    // var listView = Titanium.UI.createTableView({
        // data : [],
        // top : '15%',
        // height : '73%',
        // scrollable : true
    // });
// 
    // var desLabel = Titanium.UI.createLabel({
        // bottom : '12.5%',
        // left : 5,
        // right : 5,
        // ellipsize : true,
        // wordWrap : false,
        // visible : false,
        // font : {
            // fontsize : 10
        // },
        // color : 'black',
        // height : '7%'
    // });
    // win_view.add(desLabel);
// 
    // var elements_to_insert = [];
    // var v_iten;
    // for (v_iten in obj.itens) {
        // Ti.API.info(v_iten);
        // elements_to_insert.push({
            // title : obj.itens[v_iten].title,
            // v_info : obj.itens[v_iten].v_info,
            // desc : obj.itens[v_iten].desc,
            // is_set : obj.itens[v_iten].is_set
        // });
    // }
    // var color_set = "#A8A8A8";
    // var color_unset = "#FFFFFF";
// 
    // var count_sel = 0;
    // while (count_sel < elements_to_insert.length) {
// 
        // var row_t = Ti.UI.createTableViewRow({
            // height : 'auto',
            // display : elements_to_insert[count_sel].title,
            // selected : elements_to_insert[count_sel].is_set,
            // v_info : elements_to_insert[count_sel].v_info,
            // desc : elements_to_insert[count_sel].desc,
            // backgroundColor : elements_to_insert[count_sel].is_set ? color_set : color_unset,
            // className : 'menu_row' //optimize rendering
        // });
// 
        // var title = Titanium.UI.createLabel({
            // text : elements_to_insert[count_sel].title,
            // //width:'83%',
            // textAlign : 'left',
            // left : '10',
            // right : '0',
            // color : '#000',
            // height : 'auto',
            // wordWrap : false,
            // ellipsize : true
        // });
        // row_t.add(title);
        // if (elements_to_insert[count_sel].is_set) {
            // coItemSelected++;
        // }
        // listView.appendRow(row_t);
        // ++count_sel;
// 
    // }
    // win_view.add(listView);
// 
    // listView.addEventListener('click', function(e) {
        // if (listView.data[0].rows[e.index].selected === false) {
            // listView.data[0].rows[e.index].selected = true;
            // listView.data[0].rows[e.index].backgroundColor = color_set;
            // coItemSelected++;
        // }
        // else {
            // listView.data[0].rows[e.index].selected = false;
            // listView.data[0].rows[e.index].backgroundColor = color_unset;
            // coItemSelected--;
        // }
// 
        // if (coItemSelected == 1) {
            // if (obj.from_cond_vs != null && obj.from_cond_vs == true) {
                // listView.height = '66.5%';
                // desLabel.visible = true;
                // var i_sel;
                // for ( i_sel = 0; i_sel < listView.data[0].rows.length; i_sel++) {
                    // if (listView.data[0].rows[i_sel].selected == true) {
                        // desLabel.text = (listView.data[0].rows[i_sel].desc != null && listView.data[0].rows[i_sel].desc != "") ? listView.data[0].rows[i_sel].desc : 'No Description'
                        // break;
                    // }
                // }
            // }
        // }
        // else if (coItemSelected > 1) {
            // if (obj.from_cond_vs != null && obj.from_cond_vs == true) {
                // listView.height = '66.5%';
                // desLabel.visible = true;
                // desLabel.text = 'Multiple violations selected'
            // }
        // }
        // else if (coItemSelected == 0) {
            // if (obj.from_cond_vs != null && obj.from_cond_vs == true) {
                // listView.height = '73%';
                // desLabel.visible = false;
                // desLabel.text = ''
            // }
        // }
// 
        // Ti.API.info('Field set to ' + listView.data[0].rows[e.index].selected);
    // });
    // var bottom_sel = Ti.UI.createView({
        // bottom : 0,
        // height : '12%',
        // width : '100%',
        // backgroundColor : '#AAA'
    // });
    // win_view.add(bottom_sel);
// 
    // var selected_ok = Ti.UI.createButton({
        // title : 'OK',
        // width : '40%',
        // top : '3',
        // bottom : '5',
        // left : '6%'
    // });
    // bottom_sel.add(selected_ok);
    // selected_ok.addEventListener('click', function() {
        // var aux_ret = new Array();
        // var valid_return = new Array();
        // var i_sel;
        // for ( i_sel = 0; i_sel < listView.data[0].rows.length; i_sel++) {
            // if (listView.data[0].rows[i_sel].selected == true) {
                // aux_ret.push({
                    // title : listView.data[0].rows[i_sel].display,
                    // v_info : listView.data[0].rows[i_sel].v_info,
                    // desc : listView.data[0].rows[i_sel].desc,
                    // is_set : true
                // });
// 
                // valid_return.push({
                    // title : listView.data[0].rows[i_sel].display,
                    // v_info : listView.data[0].rows[i_sel].v_info,
                    // desc : listView.data[0].rows[i_sel].desc,
                // });
            // }
            // else {
                // aux_ret.push({
                    // title : listView.data[0].rows[i_sel].display,
                    // v_info : listView.data[0].rows[i_sel].v_info,
                    // desc : listView.data[0].rows[i_sel].desc,
                    // is_set : false
                // });
            // }
        // }
// 
        // if (valid_return.length == 0) {
            // obj.value = null
            // obj.text = "";
        // }
        // else {
            // obj.value = valid_return;
            // if (valid_return.length == 1) {
                // obj.text = valid_return[0].title;
                // if (obj.from_cond_vs != null && obj.from_cond_vs == true) {
                    // obj.desLabel.visible = true;
                    // obj.desLabel.text = (valid_return[0].desc != null && valid_return[0].desc != "") ? valid_return[0].desc : 'No Description'
                // }
// 
            // }
            // else {
                // obj.text = obj.view_title + " [" + valid_return.length + "]";
                // if (obj.from_cond_vs != null && obj.from_cond_vs == true) {
                    // obj.desLabel.visible = true;
                    // obj.desLabel.text = 'Multiple violations selected'
                // }
            // }
        // }
// 
        // obj.itens = aux_ret;
        // win_wid.close();
// 
    // });
// 
    // var selected_cancel = Ti.UI.createButton({
        // title : 'Cancel',
        // width : '40%',
        // top : '3',
        // bottom : '5',
        // right : '6%'
    // });
    // bottom_sel.add(selected_cancel);
    // selected_cancel.addEventListener('click', function() {
        // win_wid.close();
    // });
// 
    // win_wid.open();
// }
// 
// //Populate array with field name and configs
// var field_arr = new Array();
// var unsorted_res = new Array();
// var label = new Array();
// var content = new Array();
// var border = new Array();
// var values_query = new Array();
// 
// var regions;
// var fields_result;
// var bundle_titles;
// var content_fields;
// 
// var count = 0;
// var title = 0;
// var defaultImageVal = '/images/take-a-photo.png';
// 
// 
// // a field view is the complete view for a field
// // indexed by field_name
// // contains fieldLabel property, which points to the label view
// 
// var fieldViews = {};
// 
// 
// create_or_edit_node.loadUI = function() {"use strict";
//     
    // /*jslint vars: true, eqeq: true*/
//    
//    
   // if (Ti.Platform.name == 'android') {
        // get_android_menu();
    // }
    // else {
        // bottomButtons(win);
    // }
//    
   // //viewContent is the parent container
//    
    // var instances = Omadi.data.getFields(win.type);
    // var field_name;
    // var instance;
    // var i, j;
//     
    // var omadi_session_details = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
    // var roles = omadi_session_details.user.roles;
    // //db_display = Omadi.utils.openMainDatabase();
//     
    // // regions = db_display.execute('SELECT * FROM regions WHERE node_type = "' + win.type + '" ORDER BY weight ASC');
    // // if (win.mode == 1) {
        // // var node_table = db_display.execute('SELECT * FROM node WHERE nid=' + win.nid);
        // // if (node_table.rowCount > 0) {
            // // var no_data_fields = node_table.fieldByName('no_data_fields');
            // // if (no_data_fields != null && no_data_fields != "") {
                // // no_data_fields = JSON.parse(no_data_fields);
                // // var key;
                // // for (key in no_data_fields) {
                    // // if (no_data_fields.hasOwnProperty(key)) {
                        // // no_data_fieldsArr.push(key);
                    // // }
                // // }
            // // }
        // // }
    // // }
//     
    // for(field_name in instances){
        // if(instances.hasOwnProperty(field_name)){
//             
            // instance = instances[field_name];        
//             
            // var settings = instance.settings;
            // var can_view = false;
            // var can_edit = false;
            // var isRequired = instance.required;
            // var labelColor = "#246";
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
                // break;
            // }
//             
            // var fieldView = Ti.UI.createView({
               // width: '100%',
               // layout: 'vertical',
               // height: Ti.UI.SIZE
            // });
//             
            // viewContent.add(fieldView);
//             
//             
            // switch(instance.type){
                // case 'text_long':
//                 
                    // var labelView = Ti.UI.createLabel({
                        // text : ( isRequired ? '*' : '') + instance.label,
                        // color : isRequired ? 'red' : labelColor,
                        // font : {
                            // fontSize : fieldFontSize,
                            // fontWeight : 'bold'
                        // },
                        // textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                        // width : Ti.Platform.displayCaps.platformWidth - 30,
                        // touchEnabled : false,
                        // height : Ti.UI.SIZE
                    // });
//                     
                    // fieldView.add(labelView);
// 
                    // //Add fields:
                    // //regionView.add(label[count]);
                    // var reffer_index = count;
                    // var _min = null;
                    // var _max = null;
// 
                    // if (settings.min_length && settings.min_length != null && settings.min_length != "null") {
                        // _min = settings.min_length
                    // }
// 
                    // if (settings.max_length && settings.max_length != null && settings.max_length != "null") {
                        // _max = settings.max_length
                    // }
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
                            // content[count] = Ti.UI.createTextField({
                                // hintText : "#" + o_index + " " + field_arr[index_label][index_size].label,
                                // private_index : o_index,
                                // borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                // textAlign : 'left',
                                // width : Ti.Platform.displayCaps.platformWidth - 30,
                                // height : (PLATFORM == 'android') ? 2 * heightTextField : 100,
                                // color : '#000000',
                                // top : top,
                                // field_type : field_arr[index_label][index_size].type,
                                // field_name : field_arr[index_label][index_size].field_name,
                                // required : field_arr[index_label][index_size].required,
                                // is_title : field_arr[index_label][index_size].is_title,
                                // composed_obj : true,
                                // cardinality : settings.cardinality,
                                // value : vl_to_field,
                                // reffer_index : reffer_index,
                                // settings : settings,
                                // changedFlag : 0,
                                // my_min : _min,
                                // my_max : _max,
                                // real_ind : count,
                                // returnKeyType : Ti.UI.RETURNKEY_DONE,
                                // enabled : can_edit,
                                // editable : can_edit
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
// 
                            // if (_max != null) {
                                // content[count].maxLength = _max;
                            // }
                            // top += (PLATFORM == 'android') ? 2 * heightTextField : 100;
// 
                            // regionView.add(content[count]);
                            // content[count].addEventListener('change', function(e) {
                                // if (e.source.my_max != null && e.source.my_max != "" && e.source.value.length >= e.source.my_max) {
                                    // //e.source.value = e.source.value.substr(0, e.source.my_max);
                                    // //e.source.blur();
                                    // e.source.value = e.source.value.substr(0, e.source.my_max);
                                    // e.source.setSelection(e.source.my_max, e.source.my_max);
                                    // //e.source.blur();
                                    // //Ti.UI.Android.hideSoftKeyboard();
                                // }
                                // changedContentValue(e.source);
                                // noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                            // });
// 
                            // content[count].addEventListener('blur', function(e) {
                                // Ti.API.info(e.source.value.length + ' or ' + e.value.length + ' Field number ==> min: ' + e.source.my_min + ' max: ' + e.source.my_max);
                                // if (e.source.value != null && e.source.value != "") {
                                    // if (e.source.my_max != null && e.source.my_min != null) {
                                        // if (parseFloat(e.source.value.length) < parseFloat(e.source.my_min)) {
                                            // var _a = Titanium.UI.createAlertDialog({
                                                // title : 'Omadi',
                                                // message : 'The minimum for this field is ' + e.source.my_min,
                                                // buttonNames : ['OK']
                                            // });
// 
                                            // _a.show();
// 
                                            // _a.addEventListener('click', function(evt) {
                                                // content[e.source.real_ind].focus();
                                            // });
// 
                                        // }
                                        // else if (parseFloat(e.source.value.length) > parseFloat(e.source.my_max)) {
                                            // var _a = Titanium.UI.createAlertDialog({
                                                // title : 'Omadi',
                                                // message : "The maximum for this field is " + e.source.my_max,
                                                // buttonNames : ['OK']
                                            // });
// 
                                            // _a.show();
// 
                                            // _a.addEventListener('click', function(evt) {
                                                // content[e.source.real_ind].focus();
                                            // });
                                        // }
                                        // else {
                                            // //value is ok
                                        // }
                                    // }
                                    // else if (e.source.my_max != null) {
                                        // if (parseFloat(e.source.value.length) > parseFloat(e.source.my_max)) {
                                            // var _a = Titanium.UI.createAlertDialog({
                                                // title : 'Omadi',
                                                // message : "The maximum for this field is " + e.source.my_max,
                                                // buttonNames : ['OK']
                                            // });
// 
                                            // _a.show();
// 
                                            // _a.addEventListener('click', function(evt) {
                                                // content[e.source.real_ind].focus();
                                            // });
                                        // }
                                        // else {
                                            // //value is ok
                                        // }
                                    // }
                                    // else if (e.source.my_min != null) {
                                        // if (parseFloat(e.source.value.length) < parseFloat(e.source.my_min)) {
                                            // var _a = Titanium.UI.createAlertDialog({
                                                // title : 'Omadi',
                                                // message : 'The minimum for this field is ' + e.source.my_min,
                                                // buttonNames : ['OK']
                                            // });
// 
                                            // _a.show();
// 
                                            // _a.addEventListener('click', function(evt) {
                                                // content[e.source.real_ind].focus();
                                            // });
                                        // }
                                        // else {
                                            // //value is ok
                                        // }
                                    // }
                                    // else {
                                        // //No min or max sets
                                    // }
                                // }
                            // });
                            // count++;
                        // }
                    // }
                    // else {
//                         
                        // var widgetView = Ti.UI.createTextArea({
                            // autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
                            // autocorrect: true,
                            // editable : can_edit,
                            // enabled : can_edit,
                            // ellipsize: false,
                            // hintText : instance.label,
                            // keepScreenOn: true,
                            // suppessReturn: false,
                            // borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                            // textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                            // width : Ti.Platform.displayCaps.platformWidth - 30,
                            // height : (PLATFORM == 'android') ? 2 * heightTextField : 100,
                            // color : '#000000'
                            // //value : instance.actual_value,
//                             
                            // // returnKeyType : Ti.UI.RETURNKEY_DONE,
// //                             
                            // // field_type : instance.type,
                            // // field_name : instance.field_name,
                            // // required : instance.required,
                            // // is_title : instance.is_title,
                            // // composed_obj : false,
                            // // cardinality : settings.cardinality,
                            // // reffer_index : reffer_index,
                            // // settings : settings,
                            // // changedFlag : 0,
                            // // my_min : _min,
                            // // my_max : _max,
                            // // real_ind : count
                        // });
//                         
                        // if (PLATFORM == 'android') {
                            // widgetView.backgroundImage = '/images/textfield.png'
                        // }
//                         
                        // if (!can_edit) {
                            // widgetView.backgroundImage = '';
                            // widgetView.backgroundColor = '#BDBDBD';
                            // widgetView.borderColor = 'gray';
                            // widgetView.borderRadius = 10;
                            // widgetView.color = '#848484';
                            // widgetView.paddingLeft = 3;
                            // widgetView.paddingRight = 3;
                            // if (PLATFORM == 'android') {
                                // widgetView.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
                            // }
                        // }
                        // if (_max != null) {
                            // widgetView.maxLength = _max;
                        // }
// 
                        // //top += (PLATFORM == 'android') ? 2 * heightTextField : 100;
// 
                        // //regionView.add(content[count]);
//                         
                        // fieldView.add(widgetView);
//                         
                        // widgetView.addEventListener('change', function(e) {
                            // // if (e.source.my_max != null && e.source.my_max != "" && e.source.value.length >= e.source.my_max) {
                                // // //e.source.value = e.source.value.substr(0, e.source.my_max);
                                // // //e.source.blur();
                                // // e.source.value = e.source.value.substr(0, e.source.my_max);
                                // // e.source.setSelection(e.source.my_max, e.source.my_max);
                                // // //e.source.setSoftKeyboardOnFocus(Ti.UI.Android.SOFT_KEYBOARD_DEFAULT_ON_FOCUS);
                                // // //e.source.blur();
                                // // //Ti.UI.Android.hideSoftKeyboard();
                            // // }
                            // // changedContentValue(e.source);
                            // // noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                        // });
// 
                        // widgetView.addEventListener('blur', function(e) {
                            // // Ti.API.info(e.source.value.length + ' or ' + e.value.length + ' Field number ==> min: ' + e.source.my_min + ' max: ' + e.source.my_max);
                            // // if (e.source.value != null && e.source.value != "") {
                                // // if (e.source.my_max != null && e.source.my_min != null) {
                                    // // if (parseFloat(e.source.value.length) < parseFloat(e.source.my_min)) {
                                        // // var _a = Titanium.UI.createAlertDialog({
                                            // // title : 'Omadi',
                                            // // message : 'The minimum for this field is ' + e.source.my_min,
                                            // // buttonNames : ['OK']
                                        // // });
// // 
                                        // // _a.show();
// // 
                                        // // _a.addEventListener('click', function(evt) {
                                            // // content[e.source.real_ind].focus();
                                        // // });
// // 
                                    // // }
                                    // // else if (parseFloat(e.source.value.length) > parseFloat(e.source.my_max)) {
                                        // // var _a = Titanium.UI.createAlertDialog({
                                            // // title : 'Omadi',
                                            // // message : "The maximum for this field is " + e.source.my_max,
                                            // // buttonNames : ['OK']
                                        // // });
// // 
                                        // // _a.show();
// // 
                                        // // _a.addEventListener('click', function(evt) {
                                            // // content[e.source.real_ind].focus();
                                        // // });
                                    // // }
                                    // // else {
                                        // // //value is ok
                                    // // }
                                // // }
                                // // else if (e.source.my_max != null) {
                                    // // if (parseFloat(e.source.value.length) > parseFloat(e.source.my_max)) {
                                        // // var _a = Titanium.UI.createAlertDialog({
                                            // // title : 'Omadi',
                                            // // message : "The maximum for this field is " + e.source.my_max,
                                            // // buttonNames : ['OK']
                                        // // });
// // 
                                        // // _a.show();
// // 
                                        // // _a.addEventListener('click', function(evt) {
                                            // // content[e.source.real_ind].focus();
                                        // // });
                                    // // }
                                    // // else {
                                        // // //value is ok
                                    // // }
                                // // }
                                // // else if (e.source.my_min != null) {
                                    // // if (parseFloat(e.source.value.length) < parseFloat(e.source.my_min)) {
                                        // // var _a = Titanium.UI.createAlertDialog({
                                            // // title : 'Omadi',
                                            // // message : 'The minimum for this field is ' + e.source.my_min,
                                            // // buttonNames : ['OK']
                                        // // });
// // 
                                        // // _a.show();
// // 
                                        // // _a.addEventListener('click', function(evt) {
                                            // // content[e.source.real_ind].focus();
                                        // // });
                                    // // }
                                    // // else {
                                        // // //value is ok
                                    // // }
                                // // }
                                // // else {
                                    // // //No min or max sets
                                // // }
                            // // }
                        // });
                    // }
//                     
                    // //No data checkbox functionality
                    // //noDataCheckbox(reffer_index, regionView, top);
                    // //if (content[reffer_index].noDataView != null) {
                    // //    top += 40;
                   // // }
//                 
//                 
                // break;
            // }
//             
        // }
    // }   
// };
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// var camera;
// if (PLATFORM == 'android') {
    // camera = require('com.omadi.camera');
    // //camera.addEventListener("successCameraCapture", function(e){openAndroidCamera(e);});
// }
// 
// function saveImageInDb(currentImageView, field_name) {
    // var file_upload_nid = 0;
    // var db_toSaveImage = Omadi.utils.openMainDatabase();
// 
    // var encodeImage = Ti.Utils.base64encode(currentImageView.bigImg);
    // var mime = currentImageView.mimeType;
    // var imageName = 'image.' + mime.substring(mime.indexOf('/') + 1, mime.length);
    // var currentDate = new Date();
    // var vl_to_field = currentDate.getTime();
    // var is_exists = db_toSaveImage.execute('SELECT delta, nid FROM _photos WHERE nid=' + file_upload_nid + ' and delta=' + currentImageView.private_index + ' and field_name="' + field_name + '";');
    // if (is_exists.rowCount > 0) {
        // db_toSaveImage.execute('UPDATE _photos SET nid="' + file_upload_nid + '",timestamp="' + vl_to_field + '",file_data="' + encodeImage + '", field_name="' + field_name + '", file_name="' + imageName + '", delta=' + currentImageView.private_index + ' WHERE nid=' + file_upload_nid + ' and delta=' + currentImageView.private_index + ' and field_name="' + field_name + '";');
    // }
    // else {
        // db_toSaveImage.execute('INSERT INTO _photos (nid ,timestamp, file_data , field_name, file_name, delta) VALUES (' + file_upload_nid + ',"' + vl_to_field + '", "' + encodeImage + '", "' + field_name + '", "' + imageName + '", ' + currentImageView.private_index + ')');
    // }
// 
    // db_toSaveImage.close();
// }
// 
// function openAndroidCamera(e) {
    // setTimeout(function(evt) {
        // var actInd = Ti.UI.createActivityIndicator();
        // try {
            // actInd.font = {
                // fontFamily : 'Helvetica Neue',
                // fontSize : 15,
                // fontWeight : 'bold'
            // };
            // actInd.color = 'white';
            // actInd.message = 'Please wait...';
            // actInd.show();
            // var imagescr = Ti.Utils.base64decode(e.media);
            // e.source.image = imagescr;
            // e.source.isImage = true;
            // e.source.bigImg = imagescr;
            // e.source.mimeType = "/jpeg";
            // if (e.source.cardinality > 1 || e.source.cardinality < 0) {
                // if (e.source.cardinality < 1) {
                    // arrImages = createImage(e.source.scrollView.addButton.o_index, e.source.scrollView.arrImages, defaultImageVal, e.source.scrollView, false);
                    // e.source.scrollView.arrImages = arrImages;
                    // e.source.scrollView.addButton.o_index += 1;
                    // newSource = arrImages.length - 1;
                // }
                // else {
                    // if (e.source.private_index == e.source.cardinality - 1) {
                        // return;
                    // }
                    // newSource = (e.source.private_index == e.source.cardinality - 1) ? 0 : e.source.private_index + 1;
                // }
                // saveImageInDb(e.source, e.source.scrollView.field_name);
                // e.source = e.source.scrollView.arrImages[newSource];
                // actInd.hide();
                // openCamera(e)
            // }
            // else {
                // actInd.hide();
                // saveImageInDb(e.source, e.source.field_name);
            // }
// 
        // }
        // catch(eve) {
            // actInd.hide();
        // }
    // }, 200);
// }
// 
// // To open camera
// function openCamera(e) {
    // if (PLATFORM == 'android') {
        // if (Ti.Media.isCameraSupported) {
            // camera.openCamera({
                // "event" : e.source,
                // "callbackFnc" : function(e) {
                    // openAndroidCamera(e);
                // }
            // });
        // }
        // else {
            // alert('No Camera in device');
        // }
// 
    // }
    // else {
        // try {
            // var overlayView;
// 
            // var actInd = Ti.UI.createActivityIndicator();
            // actInd.font = {
                // fontFamily : 'Helvetica Neue',
                // fontSize : 15,
                // fontWeight : 'bold'
            // };
            // actInd.color = 'white';
            // actInd.message = 'Please wait...';
// 
            // overlayView = Ti.UI.createView();
            // var captureBtn = Ti.UI.createButton({
                // systemButton : Ti.UI.iPhone.SystemButton.CAMERA,
            // });
            // var doneBtn = Ti.UI.createButton({
                // systemButton : Ti.UI.iPhone.SystemButton.DONE,
            // });
            // var flexible = Ti.UI.createButton({
                // systemButton : Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE,
            // });
// 
            // var flashMode = Ti.App.Properties.getInt("flashMode", Ti.Media.CAMERA_FLASH_OFF);
// 
            // var flashBtn = Ti.UI.createButton({
                // top : 5,
                // right : 5,
                // height : 34,
                // width : 68,
                // backgroundImage : (flashMode == Ti.Media.CAMERA_FLASH_ON) ? '../images/flashOn.png' : '../images/flashOff.png'
            // });
// 
            // if (Ti.App.Properties.getBool('deviceHasFlash')) {
                // overlayView.add(flashBtn);
            // }
            // var navbar = Ti.UI.iOS.createToolbar({
                // left : 0,
                // right : 0,
                // bottom : 0,
                // height : 50,
                // items : [doneBtn, flexible, captureBtn, flexible]
            // });
            // overlayView.add(navbar);
// 
            // captureBtn.addEventListener('click', function(evt) {
                // Ti.Media.takePicture();
            // });
            // doneBtn.addEventListener('click', function(evt) {
                // Ti.Media.hideCamera();
            // });
// 
            // flashBtn.addEventListener('click', function(evt) {
                // if (Ti.Media.cameraFlashMode == Ti.Media.CAMERA_FLASH_ON) {
                    // Ti.App.Properties.setInt("flashMode", Ti.Media.CAMERA_FLASH_OFF);
                    // evt.source.backgroundImage = "../images/flashOff.png";
                    // Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_OFF;
                // }
                // else {
                    // Ti.App.Properties.setInt("flashMode", Ti.Media.CAMERA_FLASH_ON);
                    // evt.source.backgroundImage = "../images/flashOn.png";
                    // Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_ON;
                // }
            // });
// 
            // Ti.Media.showCamera({
// 
                // success : function(event) {
                    // actInd.show();
// 
                    // Ti.API.info("MIME TYPE: " + event.media.mimeType);
                    // // If image size greater than 1MB we will reduce th image else take as it is.
                    // if (event.media.length > ONE_MB) {
                        // e.source.isImage = Omadi.display.getImageViewFromData(event.media, 500, 700).image;
                    // }
                    // else {
                        // e.source.isImage = event.media;
                    // }
                    // e.source.image = e.source.isImage;
                    // e.source.bigImg = e.source.isImage;
                    // e.source.mimeType = event.media.mimeType;
// 
                    // if (e.source.cardinality > 1 || e.source.cardinality < 0) {
                        // if (e.source.cardinality < 1) {
                            // arrImages = createImage(e.source.scrollView.addButton.o_index, e.source.scrollView.arrImages, defaultImageVal, e.source.scrollView, false);
                            // e.source.scrollView.arrImages = arrImages;
                            // e.source.scrollView.addButton.o_index += 1;
                            // newSource = arrImages.length - 1;
                        // }
                        // else {
                            // if (e.source.private_index == e.source.cardinality - 1) {
                                // return;
                            // }
                            // newSource = (e.source.private_index == e.source.cardinality - 1) ? 0 : e.source.private_index + 1;
                        // }
                        // saveImageInDb(e.source, e.source.scrollView.field_name);
                        // e.source = e.source.scrollView.arrImages[newSource];
                        // actInd.hide();
                        // Ti.Media.hideCamera();
                        // openCamera(e);
                    // }
                    // else {
                        // actInd.hide();
                        // Ti.Media.hideCamera();
                        // saveImageInDb(e.source, e.source.field_name);
                    // }
                // },
                // error : function(error) {
                    // actInd.hide();
                    // Ti.API.info('Captured Image - Error: ' + error.code + " :: " + error.message);
                    // if (error.code == Titanium.Media.NO_CAMERA) {
                        // alert('No Camera in device');
                    // }
                // },
                // saveToPhotoGallery : false,
                // showControls : false,
                // overlay : overlayView,
                // autohide : true,
                // allowEditing : false,
                // mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
            // });
            // try {
                // if (Ti.App.Properties.getBool('deviceHasFlash')) {
                    // Ti.Media.cameraFlashMode = flashMode;
                // }
// 
            // }
            // catch(ex) {
                // Ti.API.error(ex);
            // }
        // }
        // catch(ex) {
            // Ti.API.error(ex);
        // }
// 
    // }
// }
// 
// function createImage(o_index, arrImages, data, scrollView, updated) {
    // contentImage = Ti.UI.createImageView({
        // private_index : o_index,
        // left : '5',
        // height : 80,
        // width : 80,
        // size : {
            // height : '80',
            // width : '80'
        // },
        // image : defaultImageVal,
        // imageVal : data,
        // isImage : false,
        // bigImg : null,
        // mimeType : null,
        // label : scrollView.label,
        // isUpdated : updated,
        // scrollView : scrollView,
        // cardinality : scrollView.cardinality
    // });
// 
    // if (updated == true) {
        // contentImage.image = data;
        // contentImage.bigImg = data;
        // contentImage.isImage = true;
    // }
    // contentImage.addEventListener('click', function(e) {
        // //Following method will open camera to capture the image.
        // Ti.API.info("clicked image");
        // if (e.source.isImage != false) {
            // Ti.API.info("is image");
            // var postDialog = Titanium.UI.createOptionDialog();
            // postDialog.options = ['Capture Image', 'Show Image', 'cancel'];
            // postDialog.cancel = 2;
            // postDialog.show();
// 
            // postDialog.addEventListener('click', function(ev) {
                // if (ev.index == 0) {
                    // openCamera(e);
                // }
                // else if (ev.index == 1) {
                    // //downloadMainImage(e.source.imageVal, e.source, win);
                    // Omadi.display.displayLargeImage(e.source, win.nid, e.source.imageVal);
                // }
            // });
            // return;
        // }
        // Ti.API.info("open camera");
        // openCamera(e);
    // });
    // scrollView.add(contentImage);
    // arrImages.push(contentImage);
    // contentImage.scrollView.arrImages = arrImages;
    // return arrImages;
// }
// 
// // function bottomButtons(actualWindow) {
    // // try {
        // // if (actualWindow != null) {
            // // var back = Ti.UI.createButton({
                // // title : 'Back',
                // // style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
            // // });
            // // back.addEventListener('click', function() {
                // // cancelOpt();
            // // });
// // 
            // // var space = Titanium.UI.createButton({
                // // systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
            // // });
            // // var label = Titanium.UI.createButton({
                // // title : actualWindow.title,
                // // color : _lb_color,
                // // ellipsize : true,
                // // wordwrap : false,
                // // width : 200,
                // // style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
            // // });
// // 
            // // var actions = Ti.UI.createButton({
                // // title : 'Actions',
                // // style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
            // // });
// // 
            // // actions.addEventListener('click', function() {
// // 
                // // var btn_tt = [];
                // // var btn_id = [];
// // 
                // // btn_tt.push('Save');
// // 
                // // if (win.nid != null) {
                    // // var db_act = Omadi.utils.openMainDatabase();
// // 
                    // // var json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + win.type + '"');
                    // // var _data = JSON.parse(json_data.fieldByName('_data'));
// // 
                    // // var node_form = win.region_form;
// // 
                    // // Ti.API.info('Form node part = ' + node_form);
// // 
                    // // if (_data.form_parts != null && _data.form_parts != "") {
                        // // Ti.API.info('Form table part = ' + _data.form_parts.parts.length);
                        // // if (_data.form_parts.parts.length >= parseInt(node_form) + 2) {
                            // // Ti.API.info("<<<<<<<------->>>>>>> Title = " + _data.form_parts.parts[parseInt(node_form) + 1].label);
                            // // btn_tt.push("Save + " + _data.form_parts.parts[node_form + 1].label);
                            // // btn_id.push(node_form + 1);
                        // // }
                    // // }
                    // // json_data.close();
                    // // db_act.close();
                // // }
                // // else {
                    // // var db_act = Omadi.utils.openMainDatabase();
// // 
                    // // var json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + win.type + '"');
                    // // var _data = JSON.parse(json_data.fieldByName('_data'));
// // 
                    // // var node_form = 0;
// // 
                    // // Ti.API.info('Form node part = ' + node_form);
// // 
                    // // if (_data.form_parts != null && _data.form_parts != "") {
                        // // Ti.API.info('Form table part = ' + _data.form_parts.parts.length);
                        // // if (_data.form_parts.parts.length >= parseInt(node_form) + 2) {
                            // // Ti.API.info("<<<<<<<------->>>>>>> Title = " + _data.form_parts.parts[node_form + 1].label);
                            // // btn_tt.push("Save + " + _data.form_parts.parts[node_form + 1].label);
                            // // btn_id.push(node_form + 1);
                        // // }
                    // // }
                    // // json_data.close();
                    // // db_act.close();
                // // }
// // 
                // // btn_tt.push('Draft');
                // // btn_tt.push('Cancel');
// // 
                // // var postDialog = Titanium.UI.createOptionDialog();
                // // postDialog.options = btn_tt;
                // // postDialog.show();
// // 
                // // postDialog.addEventListener('click', function(ev) {
                    // // if (btn_tt.length == 4) {
                        // // if (ev.index == 1) {
                            // // //openEditScreen(btn_id[0]);
                            // // Ti.API.info('=======> ' + btn_id[0]);
                            // // try {
                                // // keep_info(btn_id[0], false);
                            // // }
                            // // catch(e) {
                                // // alert('Error Tracking 11: ' + e);
                                // // //To catch error to resolve issue #916
                            // // }
                        // // }
                        // // else if (ev.index == 0) {
                            // // try {
                                // // keep_info('normal', false);
                            // // }
                            // // catch(e) {
                                // // alert('Error Tracking 12: ' + e);
                                // // //To catch error to resolve issue #916
                            // // }
                        // // }
                        // // else if (ev.index == 2) {
                            // // try {
                                // // keep_info('draft', false);
                            // // }
                            // // catch(e) {
                                // // alert('Error Tracking 13: ' + e);
                                // // //To catch error to resolve issue #916
                            // // }
                        // // }
                    // // }
                    // // else {
                        // // if (ev.index == 0) {
                            // // try {
                                // // keep_info('normal', false);
                            // // }
                            // // catch(e) {
                                // // alert('Error Tracking 14: ' + e);
                                // // //To catch error to resolve issue #916
                            // // }
                        // // }
                        // // else if (ev.index == 1) {
                            // // try {
                                // // keep_info('draft', false);
                            // // }
                            // // catch(e) {
                                // // alert('Error Tracking 15: ' + e);
                                // // //To catch error to resolve issue #916
                            // // }
                        // // }
                    // // }
                // // });
            // // });
// // 
            // // // create and add toolbar
            // // var toolbar = Ti.UI.iOS.createToolbar({
                // // items : [back, space, label, space, actions],
                // // top : 0,
                // // borderTop : false,
                // // borderBottom : true
            // // });
            // // actualWindow.add(toolbar);
        // // }
    // // }
    // // catch(evt) {
        // // Ti.API.info("TOP BAR ERROR = " + evt);
    // // }
// // };
// 
// function cancelOpt() {
    // var dialog = Ti.UI.createAlertDialog({
        // cancel : 1,
        // buttonNames : ['Yes', 'No'],
        // message : 'Are you sure you want to cancel and go back?',
        // title : 'Cancel'
    // });
// 
    // dialog.addEventListener('click', function(e) {
        // if (e.index == 0) {
            // if (win.mode == 0) {
                // if (PLATFORM == 'android') {
                    // Ti.UI.createNotification({
                        // message : win.title + ' creation was cancelled !'
                    // }).show();
                // }
                // else {
                    // //alert(win.title + ' creation was cancelled !');
                // }
            // }
            // else {
                // if (PLATFORM == 'android') {
                    // Ti.UI.createNotification({
                        // message : win.title + ' update was cancelled !'
                    // }).show();
                // }
                // else {
                    // //alert(win.title + ' update was cancelled !');
                // }
            // }
            // var db_toDeleteImage = Omadi.utils.openMainDatabase();
// 
            // db_toDeleteImage.execute("DELETE FROM _photos WHERE nid=0;");
            // db_toDeleteImage.close();
            // win.close();
        // }
    // });
// 
    // dialog.show();
// }
// 
// function setDefaultValues(content, e) {
    // try {
        // for ( counter = 0; counter < content.length; counter++) {
            // if (!content[counter]) {
                // continue;
            // }
            // if ((content[counter].field_type == 'number_decimal' || content[counter].field_type == 'number_integer' || content[counter].field_type == 'taxonomy_term_reference') && content[counter].hasParent) {
                // if (content[counter].value != null && content[counter].value != "") {
                    // continue;
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
                        // changedContentValue(content[counter]);
// 
                    // }
                    // else if (content[counter].cardinality == defaultFieldSetting.cardinality && defaultFieldSetting.cardinality > 1) {
// 
                    // }
                    // db_display.close();
                // }
// 
            // }
        // }
// 
    // }
    // catch(evt) {
        // Ti.API.info('ERROR=====' + evt);
    // }
// 
// }
// 
// function createEntityMultiple() {
// 
    // var entity = new Array();
// 
    // for ( idx = 0; idx < content.length; idx++) {
        // if (!content[idx]) {
            // continue;
        // }
        // if (entity[content[idx].field_name] == null) {
            // entity[content[idx].field_name] = new Array();
        // }
        // var private_index = 0;
        // if (content[idx].private_index != null && content[idx].private_index != "") {
            // private_index = content[idx].private_index;
        // }
        // entity[content[idx].field_name][private_index] = new Array();
// 
        // entity[content[idx].field_name][private_index]['value'] = content[idx].value;
        // if (content[idx].field_type == 'datestamp') {
            // entity[content[idx].field_name][private_index]['value'] = content[idx].value / 1000;
        // }
        // else if (content[idx].field_type == 'list_boolean') {
            // entity[content[idx].field_name][private_index]['value'] = (content[idx].value) ? 1 : 0;
        // }
        // else {
            // entity[content[idx].field_name][private_index]['value'] = content[idx].value;
        // }
// 
        // entity[content[idx].field_name][private_index]['nid'] = content[idx].nid;
// 
        // if (content[idx].field_type == 'taxonomy_term_reference') {
            // if (content[idx].widget == 'options_select') {
                // entity[content[idx].field_name][private_index]['tid'] = content[idx].value;
            // }
            // else {
                // entity[content[idx].field_name][private_index]['tid'] = content[idx].tid;
            // }
        // }
        // else if (content[idx].field_type == 'user_reference') {
            // entity[content[idx].field_name][private_index]['uid'] = content[idx].value;
        // }
// 
        // entity[content[idx].field_name][private_index]['field_name'] = content[idx].field_name;
        // entity[content[idx].field_name][private_index]['field_type'] = content[idx].field_type;
        // entity[content[idx].field_name][private_index]['reffer_index'] = idx;
    // }
// 
    // return entity;
// }
// 
// function createCalFieldTableFormat(single_content, db_display, contentArr) {
    // var entity = createEntityMultiple();
    // var result = _calculation_field_get_values(win, db_display, single_content, entity, contentArr);
    // var row_values = result[0].rows;
    // var heightView = 0;
    // var heightCellView = 40;
    // var widthCellView = Ti.Platform.displayCaps.platformWidth - 30;
// 
    // if (row_values.length > 1) {
        // var cal_value = 0;
        // var total_rows = [];
        // var row = "";
        // var data = {};
// 
        // for ( idx = 0; idx < row_values.length; idx++) {
            // data = {
                // "value" : row_values[idx].value,
                // "label" : row_values[idx].row_label,
                // "weight_label" : "",
                // "weight_value" : "",
                // "color_label" : "#545454",
                // "color_value" : "#424242"
            // };
            // row = createCalculationRow(single_content, heightCellView, widthCellView, data);
            // single_content.add(row);
            // total_rows.push(row);
            // heightView += heightCellView + 1;
        // }
// 
        // data = {
            // "value" : result[0].final_value,
            // "label" : "Total:",
            // "weight_label" : "",
            // "weight_value" : "bold",
            // "color_label" : "#545454",
            // "color_value" : "#424242"
        // };
        // row = createCalculationRow(single_content, heightCellView, widthCellView, data);
        // single_content.add(row);
        // total_rows.push(row);
        // heightView += heightCellView + 1;
// 
        // data = {
            // "value" : (single_content.actual_value == null || single_content.actual_value == "") ? 0 : single_content.actual_value,
            // "label" : '*Currently Saved Total:',
            // "weight_label" : "bold",
            // "weight_value" : "bold",
            // "color_label" : "#B40404",
            // "color_value" : "#B40404"
        // };
        // row = createCalculationRow(single_content, heightCellView, widthCellView, data);
        // single_content.add(row);
        // total_rows.push(row);
        // heightView += heightCellView + 1;
// 
        // //RECALCLATE BUTTON
        // if (single_content.settings.include_recalculate_button != null && single_content.settings.include_recalculate_button == 1) {
            // row = Ti.UI.createView({
                // layout : 'horizontal',
                // height : heightCellView,
                // width : '100%',
                // top : 5
            // });
            // row.calculateBtn = Ti.UI.createButton({
                // title : "Recalculate",
                // width : '100dp',
                // color : '#000',
                // font : {
                    // fontFamily : 'Helvetica Neue',
                    // fontSize : '14dp'
                // },
                // idx : single_content.reffer_index,
                // backgroundGradient : {
                    // type : 'linear',
                    // startPoint : {
                        // x : '50%',
                        // y : '0%'
                    // },
                    // endPoint : {
                        // x : '50%',
                        // y : '100%'
                    // },
                    // colors : [{
                        // color : '#ccc',
                        // offset : 0.0
                    // }, {
                        // color : '#ddd',
                        // offset : 0.25
                    // }, {
                        // color : '#aaa',
                        // offset : 1.0
                    // }],
                // },
                // borderRadius : '5dp',
                // style : (PLATFORM == 'android' ? '' : Ti.UI.iPhone.SystemButtonStyle.PLAIN)
            // });
            // row.add(row.calculateBtn);
            // single_content.add(row);
            // heightView += heightCellView + 5;
            // row.calculateBtn.addEventListener('click', function(e) {
                // reCalculate(content[e.source.idx]);
            // });
        // }
        // single_content.total_rows = total_rows;
        // single_content.value = result[0].final_value;
// 
    // }
    // else if (row_values.length == 1) {
        // cal_value = result[0].final_value;
        // typeof (cal_value) == 'number' ? null : typeof (cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null;
        // isNegative = (cal_value < 0) ? true : false;
        // var cal_value_str = applyNumberFormat(single_content, cal_value);
        // cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
        // label[single_content.reffer_index].text = single_content.label + ": " + cal_value_str;
// 
        // //RECALCLATE BUTTON
        // if (single_content.settings.include_recalculate_button != null && single_content.settings.include_recalculate_button == 1) {
            // var row = Ti.UI.createView({
                // layout : 'horizontal',
                // height : heightCellView,
                // width : '100%',
                // top : 5
            // });
            // row.calculateBtn = Ti.UI.createButton({
                // title : "Recalculate",
                // width : '100dp',
                // color : '#000',
                // font : {
                    // fontFamily : 'Helvetica Neue',
                    // fontSize : '14dp'
                // },
                // idx : single_content.reffer_index,
                // backgroundGradient : {
                    // type : 'linear',
                    // startPoint : {
                        // x : '50%',
                        // y : '0%'
                    // },
                    // endPoint : {
                        // x : '50%',
                        // y : '100%'
                    // },
                    // colors : [{
                        // color : '#ccc',
                        // offset : 0.0
                    // }, {
                        // color : '#ddd',
                        // offset : 0.25
                    // }, {
                        // color : '#aaa',
                        // offset : 1.0
                    // }],
                // },
                // borderRadius : '5dp',
                // style : (PLATFORM == 'android' ? '' : Ti.UI.iPhone.SystemButtonStyle.PLAIN)
// 
            // });
// 
            // row.add(row.calculateBtn);
            // single_content.add(row);
            // heightView += heightCellView + 5;
            // row.calculateBtn.addEventListener('click', function(e) {
                // reCalculate(content[e.source.idx]);
            // });
        // }
        // single_content.total_rows = total_rows;
        // single_content.value = result[0].final_value;
// 
    // }
    // single_content.height = heightView;
// }
// 
// function addDoneButtonInKB(content) {
    // if (PLATFORM != 'android') {
        // if (doneButton == null) {
            // var doneButton = Ti.UI.createButton({
                // systemButton : Ti.UI.iPhone.SystemButton.DONE,
                // right : 0,
                // field : content
            // });
        // }
        // doneButton.addEventListener('click', function(e) {
            // e.source.field.blur();
        // });
        // content.keyboardToolbar = [doneButton];
        // content.addEventListener('focus', function(e) {
            // //e.source.keyboardToolbar = [doneButton];
            // //doneButton.field = e.source;
        // });
    // }
// }
// 
// function reCalculate(singel_content) {
    // try {
        // db_display = Omadi.utils.openMainDatabase();
// 
        // var entity = createEntityMultiple();
        // var result = _calculation_field_get_values(win, db_display, singel_content, entity, content);
        // var row_values = result[0].rows;
        // var total_rows = singel_content.total_rows;
        // var cal_value = 0;
        // var cal_value_str = "";
        // if (row_values.length > 1) {
            // var isNegative = false;
            // for ( idx = 0; idx < row_values.length; idx++) {
                // cal_value = row_values[idx].value;
                // typeof (cal_value) == 'number' ? null : typeof (cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null;
                // //Check type of the data
                // isNegative = (cal_value < 0) ? true : false;
                // // Is negative. And if it is -ve then write in this value in (brackets).
                // cal_value_str = applyNumberFormat(singel_content, cal_value);
                // cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
                // // Adding brackets over -ve value.
// 
                // var row = total_rows[idx];
                // row.row_label.text = row_values[idx].row_label + ":  ";
                // row.value.text = "  " + cal_value_str;
            // }
// 
            // cal_value = result[0].final_value;
            // typeof (cal_value) == 'number' ? null : typeof (cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null;
            // isNegative = (cal_value < 0) ? true : false;
            // cal_value_str = applyNumberFormat(singel_content, cal_value);
            // cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
// 
            // var row = total_rows[row_values.length];
            // row.row_label.text = "Total: ";
            // row.value.text = "  " + cal_value_str;
            // singel_content.value = result[0].final_value;
// 
            // var currently_saved_value = db_display.execute('SELECT ' + singel_content.field_name + ' FROM ' + win.type + ' WHERE nid = "' + win.nid + '" ');
            // if (currently_saved_value.rowCount > 0) {
                // cal_value = currently_saved_value.fieldByName(singel_content.field_name);
                // cal_value = (cal_value == null || cal_value == "") ? 0 : Number(cal_value);
                // typeof (cal_value) == 'number' ? null : typeof (cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null;
                // isNegative = (cal_value < 0) ? true : false;
                // cal_value_str = applyNumberFormat(singel_content, cal_value);
                // cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
// 
                // var row = total_rows[row_values.length + 1];
                // row.row_label.text = "*Currently Saved Total: ";
                // row.value.text = "  " + cal_value_str;
            // }
// 
        // }
        // else if (row_values.length == 1) {
            // cal_value = result[0].final_value;
            // typeof (cal_value) == 'number' ? null : typeof (cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null;
            // isNegative = (cal_value < 0) ? true : false;
            // var cal_value_str = applyNumberFormat(singel_content, cal_value);
            // cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
            // label[singel_content.reffer_index].text = singel_content.label + ": " + cal_value_str;
            // ;
// 
            // var currently_saved_value = db_display.execute('SELECT ' + singel_content.field_name + ' FROM ' + win.type + ' WHERE nid = "' + win.nid + '" ');
            // if (currently_saved_value.rowCount > 0) {
                // if (Number(cal_value) != Number(currently_saved_value.fieldByName(singel_content.field_name))) {
                    // cal_value = currently_saved_value.fieldByName(singel_content.field_name);
                    // cal_value = (cal_value == null || cal_value == "") ? 0 : Number(cal_value);
                    // typeof (cal_value) == 'number' ? null : typeof (cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null;
                    // isNegative = (cal_value < 0) ? true : false;
                    // cal_value_str = applyNumberFormat(singel_content, cal_value);
                    // cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
// 
                    // label[singel_content.reffer_index].text += "; Orig: " + cal_value_str;
                // }
// 
            // }
// 
        // }
    // }
    // catch(e) {
    // }
    // db_display.close();
// 
// }
// 
// function changedContentValue(changed_content) {
    // if (changed_content['condDependedFields'] != null) {
        // var isTextField = false;
        // if (PLATFORM == 'android') {
            // if ( changed_content instanceof Ti.UI.TextField) {
                // isTextField = true;
            // }
        // }
        // else {
            // if (changed_content == '[object TiUITextField]') {
                // isTextField = true;
            // }
        // }
// 
        // if (isTextField) {
            // if ((changed_content['changedFlag'] == 1) && (changed_content['value'] == null || changed_content['value'] == "")) {
                // changed_content['changedFlag'] = 0;
            // }
            // else if ((changed_content['changedFlag'] == 0) && (changed_content['value'] != null) && (changed_content['value'] != "")) {
                // changed_content['changedFlag'] = 1;
            // }
            // else {
                // return;
            // }
        // }
// 
        // for (idx in changed_content['condDependedFields']) {
            // if (!content[changed_content['condDependedFields'][idx]]) {
                // continue;
            // }
            // conditionalSetRequiredField(changed_content['condDependedFields'][idx]);
        // }
// 
    // }
// 
// }
// 
// 
// 
// function noDataCheckbox(reffer_index, baseView, top) {
    // if (content[reffer_index].settings != null && content[reffer_index].settings != "") {
        // if (content[reffer_index].settings.required_no_data_checkbox != null && content[reffer_index].settings.required_no_data_checkbox == 1) {
            // var fieldName = content[reffer_index].field_name;
            // if (content[reffer_index].partsArr != null && content[reffer_index].partsArr.length > 0) {
                // fieldName = fieldName.split('___');
                // fieldName = fieldName[0];
            // }
            // var doCheck = in_array(fieldName, no_data_fieldsArr);
            // var isRequired = false;
// 
            // //TODO WHAT ??????? Please, specify !
            // if (content[reffer_index].required == true || content[reffer_index].required == 'true' || content[reffer_index].required == 1 || content[reffer_index].required == '1') {
                // isRequired = true;
            // }
            // content[reffer_index].noDataView = Ti.UI.createView({
                // height : "30dp",
                // width : Ti.Platform.displayCaps.platformWidth - 30,
                // layout : 'horizontal',
                // top : top + 2,
            // });
// 
            // content[reffer_index].noDataView.checkbox = Ti.UI.createButton({
                // top : "7dp",
                // height : "16dp",
                // width : "16dp",
                // backgroundImage : '../images/unchecked.png',
                // value : false
            // });
            // content[reffer_index].noDataView.text = Ti.UI.createLabel({
                // height : "30dp",
                // text : (isRequired) ? 'No Data Available' : 'Not Applicable',
                // left : "5dp",
                // width : "200dp",
                // color : '#000',
                // font : {
                    // fontSize : "10dp"
                // }
            // });
            // content[reffer_index].noDataView.checkbox.addEventListener('click', function(e) {
                // e.source.value = (e.source.value) ? false : true;
                // e.source.backgroundImage = (e.source.value) ? '../images/checked.png' : '../images/unchecked.png';
// 
                // if (content[reffer_index].partsArr != null && content[reffer_index].partsArr.length > 0) {
                    // for ( idx_i = 0; idx_i < content[reffer_index].partsArr.length; idx_i++) {
                        // var part_idx = content[reffer_index].partsArr[idx_i];
                        // if (content[part_idx].settings.cardinality > 1) {
                            // for ( idx = 0; idx < content[part_idx].settings.cardinality; idx++) {
                                // content[part_idx + idx].no_data_checkbox = (e.source.value) ? true : false;
                            // }
                        // }
                        // else {
                            // content[part_idx].no_data_checkbox = (e.source.value) ? true : false;
                        // }
                    // }
                // }
                // else {
                    // if (content[reffer_index].settings.cardinality > 1) {
                        // for ( idx = 0; idx < content[reffer_index].settings.cardinality; idx++) {
                            // content[reffer_index + idx].no_data_checkbox = (e.source.value) ? true : false;
                        // }
                    // }
                    // else {
                        // content[reffer_index].no_data_checkbox = (e.source.value) ? true : false;
                    // }
                // }
// 
            // })
// 
            // content[reffer_index].noDataView.add(content[reffer_index].noDataView.checkbox);
            // content[reffer_index].noDataView.add(content[reffer_index].noDataView.text);
            // baseView.add(content[reffer_index].noDataView);
            // if (doCheck == true) {
                // content[reffer_index].noDataView.checkbox.backgroundImage = '../images/checked.png';
                // content[reffer_index].noDataView.checkbox.value = true;
// 
                // if (content[reffer_index].partsArr != null && content[reffer_index].partsArr.length > 0) {
                    // for ( idx_i = 0; idx_i < content[reffer_index].partsArr.length; idx_i++) {
                        // var part_idx = content[reffer_index].partsArr[idx_i];
                        // if (content[part_idx].settings.cardinality > 1) {
                            // for ( idx = 0; idx < content[part_idx].settings.cardinality; idx++) {
                                // content[part_idx + idx].no_data_checkbox = true;
                            // }
                        // }
                        // else {
                            // content[part_idx].no_data_checkbox = true;
                        // }
                    // }
                // }
                // else {
                    // if (content[reffer_index].settings.cardinality > 1) {
                        // for ( idx = 0; idx < content[reffer_index].settings.cardinality; idx++) {
                            // content[reffer_index + idx].no_data_checkbox = true;
                        // }
                    // }
                    // else {
                        // content[reffer_index].no_data_checkbox = true;
                    // }
                // }
// 
            // }
            // else {
                // if (content[reffer_index]['value'] != null && content[reffer_index]['value'] != "") {
                    // content[reffer_index].noDataView.checkbox.enabled = false;
                    // content[reffer_index].noDataView.checkbox.backgroundImage = '../images/unchecked_disabled.png';
                // }
            // }
        // }
    // }
// }
// 
// function noDataChecboxEnableDisable(changed_content, reffer_index) {
    // var isTextField = false;
    // if (PLATFORM == 'android') {
        // if ( changed_content instanceof Ti.UI.TextField) {
            // isTextField = true;
        // }
    // }
    // else {
        // if (changed_content == '[object TiUITextField]') {
            // isTextField = true;
        // }
    // }
// 
    // if (isTextField) {
        // if ((changed_content['changedFlag'] == 1) && (changed_content['value'] == null || changed_content['value'] == "")) {
            // changed_content['changedFlag'] = 0;
        // }
        // else if ((changed_content['changedFlag'] == 0) && (changed_content['value'] != null) && (changed_content['value'] != "")) {
            // changed_content['changedFlag'] = 1;
        // }
        // else {
            // return;
        // }
    // }
    // if (changed_content.noDataView != null) {
        // if (changed_content['value'] != null && changed_content['value'] != "") {
            // changed_content.noDataView.checkbox.enabled = false;
            // changed_content.noDataView.checkbox.backgroundImage = '../images/unchecked_disabled.png';
        // }
        // else {
            // changed_content.noDataView.checkbox.enabled = true;
            // changed_content.noDataView.checkbox.backgroundImage = '../images/unchecked.png';
        // }
        // changed_content.noDataView.checkbox.value = false;
// 
        // if (content[reffer_index].partsArr != null && content[reffer_index].partsArr.length > 0) {
            // for ( idx_i = 0; idx_i < content[reffer_index].partsArr.length; idx_i++) {
                // var part_idx = content[reffer_index].partsArr[idx_i];
                // if (content[part_idx].settings.cardinality > 1) {
                    // for ( idx = 0; idx < content[part_idx].settings.cardinality; idx++) {
                        // content[part_idx + idx].no_data_checkbox = false;
                    // }
                // }
                // else {
                    // content[part_idx].no_data_checkbox = false;
                // }
            // }
        // }
        // else {
            // if (content[reffer_index].settings.cardinality > 1) {
                // for ( idx = 0; idx < content[reffer_index].settings.cardinality; idx++) {
                    // content[reffer_index + idx].no_data_checkbox = false;
                // }
            // }
            // else {
                // content[reffer_index].no_data_checkbox = false;
            // }
        // }
    // }
// }
// 
// function applyNumberFormat(single_content, cal_value) {
    // var cal_value_str = '';
    // if (single_content.settings != null && single_content.settings.number_format != null && single_content.settings.number_format != "") {
        // switch (single_content.settings.number_format) {
            // case NUMBER_FORMAT_CURRENCY:
                // cal_value_str = Math.abs(cal_value).toCurrency({
                    // "thousands_separator" : ",",
                    // "currency_symbol" : "$",
                    // "symbol_position" : "front",
                    // "use_fractions" : {
                        // "fractions" : 2,
                        // "fraction_separator" : "."
                    // }
                // });
                // break;
            // case NUMBER_FORMAT_INTEGER:
                // cal_value_str = Math.abs(cal_value).toCurrency({
                    // "thousands_separator" : ",",
                    // "currency_symbol" : "",
                    // "symbol_position" : "front",
                    // "use_fractions" : {
                        // "fractions" : 0,
                        // "fraction_separator" : "."
                    // }
                // });
                // break;
            // case NUMBER_FORMAT_DECIMAL_0:
                // cal_value_str = Math.abs(cal_value).toCurrency({
                    // "thousands_separator" : ",",
                    // "currency_symbol" : "",
                    // "symbol_position" : "front",
                    // "use_fractions" : {
                        // "fractions" : 1,
                        // "fraction_separator" : "."
                    // }
                // });
                // break;
            // case NUMBER_FORMAT_DECIMAL_00:
                // cal_value_str = Math.abs(cal_value).toCurrency({
                    // "thousands_separator" : ",",
                    // "currency_symbol" : "",
                    // "symbol_position" : "front",
                    // "use_fractions" : {
                        // "fractions" : 2,
                        // "fraction_separator" : "."
                    // }
                // });
                // break;
            // case NUMBER_FORMAT_DECIMAL_000:
                // cal_value_str = Math.abs(cal_value).toCurrency({
                    // "thousands_separator" : ",",
                    // "currency_symbol" : "",
                    // "symbol_position" : "front",
                    // "use_fractions" : {
                        // "fractions" : 3,
                        // "fraction_separator" : "."
                    // }
                // });
                // break;
            // default:
                // cal_value_str = Math.abs(cal_value).toCurrency({
                    // "thousands_separator" : ",",
                    // "currency_symbol" : "",
                    // "symbol_position" : "front",
                    // "use_fractions" : {
                        // "fractions" : 2,
                        // "fraction_separator" : "."
                    // }
                // });
// 
        // }
    // }
    // else {
        // cal_value_str = Math.abs(cal_value).toCurrency({
            // "thousands_separator" : ",",
            // "currency_symbol" : "",
            // "symbol_position" : "front",
            // "use_fractions" : {
                // "fractions" : 2,
                // "fraction_separator" : "."
            // }
        // });
    // }
    // return cal_value_str;
// 
// }
// 
// function createCalculationRow(single_content, heightCellView, widthCellView, data) {
    // //alert(text);
    // var isNegative = false;
    // var cal_value = data.value;
    // typeof (cal_value) == 'number' ? null : typeof (cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null;
    // //Check type of the data
    // isNegative = (cal_value < 0) ? true : false;
    // // Is negative. And if it is -ve then write in this value in (brackets).
    // var cal_value_str = applyNumberFormat(single_content, cal_value);
    // cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
    // // Adding brackets over -ve value.
// 
    // var row = Ti.UI.createView({
        // layout : 'horizontal',
        // height : heightCellView,
        // width : widthCellView,
        // top : 1
    // });
    // row.row_label = Ti.UI.createLabel({
        // text : data.label,
        // textAlign : 'right',
        // width : (widthCellView * 3 / 5) - 1,
        // top : 0,
        // color : 'white',
        // font : {
            // fontFamily : 'Helvetica Neue',
            // fontSize : '14dp',
            // fontWeight : data.weight_label
        // },
        // color : data.color_label,
        // height : heightCellView,
        // backgroundColor : '#FFF',
        // wordWrap : false,
        // ellipsize : true,
    // });
    // row.value = Ti.UI.createLabel({
        // text : "  " + cal_value_str,
        // textAlign : 'left',
        // width : (widthCellView * 2 / 5),
        // top : 0,
        // left : 1,
        // color : 'white',
        // font : {
            // fontFamily : 'Helvetica Neue',
            // fontSize : '14dp',
            // fontWeight : data.weight_value
        // },
        // color : data.color_value,
        // height : heightCellView,
        // wordWrap : false,
        // ellipsize : true,
        // backgroundColor : '#FFF'
    // });
// 
    // row.add(row.row_label);
    // row.add(row.value);
    // return row;
// }
// 
// function showRulesRow(current_content, db_display, current_window) {
// 
    // var widget = current_content.widget;
    // var settings = current_content.settings;
    // var contentVal = current_content.value;
    // var heightView = 0;
    // var heightCellView = 35;
    // var widthCellView = Ti.Platform.displayCaps.platformWidth - 30
    // switch(widget.type) {
        // case 'rules_field_violations':
            // if ( contentVal instanceof Array) {
                // if (contentVal.length > 0) {
                    // var idx;
                    // for ( idx = 0; idx < contentVal.length; idx++) {
                        // var violation_name = '- ALL OTHER VIOLATIONS -';
                        // if (!isNaN(contentVal[idx].tid)) {
                            // var db_violation_name = db_display.execute('SELECT name FROM term_data WHERE tid=' + contentVal[idx].tid);
                            // violation_name = db_violation_name.fieldByName('name');
                            // db_violation_name.close();
                        // }
// 
                        // var formsArr = [];
                        // if (!isArray(contentVal[idx].node_types)) {
                            // var key;
                            // for (key in contentVal[idx].node_types) {
                                // if (contentVal[idx].node_types.hasOwnProperty(key)) {
                                    // var display_name = db_display.execute('SELECT display_name FROM bundles WHERE bundle_name="' + key + '"');
                                    // display_name = display_name.fieldByName('display_name');
                                    // formsArr.push(display_name);
                                // }
                            // }
                        // }
// 
                        // var row = Ti.UI.createView({
                            // layout : 'horizontal',
                            // height : heightCellView,
                            // width : widthCellView
                        // });
                        // row.image = Ti.UI.createImageView({
                            // image : '../images/arrow.png',
                            // height : '23',
                            // width : '23',
                            // details : contentVal[idx],
                            // formsArr : formsArr,
                            // text : violation_name,
                            // top : 4
                        // });
                        // row.label = Ti.UI.createLabel({
                            // text : violation_name,
                            // height : 35,
                            // width : widthCellView - 30,
                            // left : 5,
                            // color : '#000',
                            // font : {
                                // fontSize : 15,
                                // fontFamily : 'Helvetica Neue',
                            // },
                            // ellipsize : true,
                            // wordWrap : false,
                            // details : contentVal[idx],
                            // formsArr : formsArr
                        // });
// 
                        // row.add(row.image);
                        // row.add(row.label);
                        // heightView += heightCellView + 1;
                        // row.addEventListener('click', function(e) {
                            // if (PLATFORM == 'android') {
                                // Ti.UI.Android.hideSoftKeyboard();
                                // Ti.API.info("hide keyboard in row click listener");
                            // };
                            // var detail_popup = Ti.UI.createView({
                                // backgroundColor : '#00000000'
                            // });
                            // detail_popup.left = detail_popup.right = detail_popup.top = detail_popup.bottom = 0;
// 
                            // var translucent = Ti.UI.createView({
                                // opacity : 0.5,
                                // backgroundColor : '#000'
                            // });
                            // translucent.left = translucent.right = translucent.top = translucent.bottom = 0;
                            // detail_popup.add(translucent);
// 
                            // var table_format_bg = Ti.UI.createView({
                                // backgroundColor : '#FFF',
                                // borderColor : '#424242',
                                // borderWidth : 1,
                                // left : 4,
                                // right : 4,
                                // height : '250',
                                // //layout: 'vertical'
                            // });
                            // detail_popup.add(table_format_bg);
// 
                            // var headerRow0 = Ti.UI.createView({
                                // top : 0,
                                // height : 30,
                                // width : Ti.Platform.displayCaps.platformWidth - 8,
                                // layout : 'horizontal',
                                // backgroundImage : '../images/header.png',
                            // });
                            // var headerRowLabel = Ti.UI.createLabel({
                                // text : e.source.text,
                                // left : 5,
                                // height : 30,
                                // width : Ti.Platform.displayCaps.platformWidth - 40,
                                // color : '#fff',
                                // font : {
                                    // fontFamily : 'Helvetica Neue',
                                    // fontSize : 15,
                                    // fontWeight : 'bold',
// 
                                // },
                                // ellipsize : true,
                                // wordWrap : false
                            // });
                            // var close_btn = Ti.UI.createImageView({
                                // height : 30,
                                // width : 25,
                                // top : 0,
                                // image : '../images/close.png'
                            // });
                            // table_format_bg.add(headerRow0);
                            // headerRow0.add(headerRowLabel);
                            // headerRow0.add(close_btn);
                            // close_btn.addEventListener('click', function(ent) {
                                // current_window.remove(detail_popup);
                            // });
// 
                            // var headerRow = Ti.UI.createView({
                                // top : 33,
                                // height : 42,
                                // width : Ti.Platform.displayCaps.platformWidth - 16,
                                // layout : 'horizontal'
                            // });
                            // table_format_bg.add(headerRow);
// 
                            // var forms = Ti.UI.createLabel({
                                // text : 'Forms',
                                // height : 38,
                                // width : (Ti.Platform.displayCaps.platformWidth - 20) / 3,
                                // backgroundImage : '../images/header.png',
                                // font : {
                                    // fontFamily : 'Helvetica Neue',
                                    // fontSize : 13,
                                    // fontWeight : 'bold'
                                // },
                                // color : '#fff',
                                // textAlign : 'center'
                            // });
                            // headerRow.add(forms);
// 
                            // var dttm = Ti.UI.createLabel({
                                // text : 'Date/Time Rules',
                                // height : 38,
                                // width : (Ti.Platform.displayCaps.platformWidth - 20) / 3,
                                // backgroundImage : '../images/header.png',
                                // font : {
                                    // fontFamily : 'Helvetica Neue',
                                    // fontSize : 13,
                                    // fontWeight : 'bold'
                                // },
                                // left : 1,
                                // color : '#fff',
                                // textAlign : 'center'
                            // });
                            // headerRow.add(dttm);
// 
                            // var desc = Ti.UI.createLabel({
                                // text : 'Description',
                                // height : 38,
                                // width : (Ti.Platform.displayCaps.platformWidth - 20) / 3,
                                // backgroundImage : '../images/header.png',
                                // font : {
                                    // fontFamily : 'Helvetica Neue',
                                    // fontSize : 13,
                                    // fontWeight : 'bold'
                                // },
                                // left : 1.5,
                                // color : '#fff',
                                // textAlign : 'center'
                            // });
                            // headerRow.add(desc);
// 
                            // var detail_row = Ti.UI.createView({
                                // width : Ti.Platform.displayCaps.platformWidth - 16,
                                // top : 75,
                                // height : '175',
                                // layout : 'horizontal',
                            // });
                            // table_format_bg.add(detail_row);
// 
                            // var formsView = Ti.UI.createScrollView({
                                // height : '175',
                                // contentHeight : 'auto',
                                // scrollType : 'vertical',
                                // showVerticalScrollIndicator : true,
                                // width : (Ti.Platform.displayCaps.platformWidth - 20) / 3,
                            // });
                            // detail_row.add(formsView);
                            // var formsViewLabel = Ti.UI.createLabel({
                                // top : 0,
                                // height : 'auto',
                                // width : (Ti.Platform.displayCaps.platformWidth - 20) / 3,
                                // color : '#1c1c1c',
                                // font : {
                                    // fontFamily : 'Helvetica Neue',
                                    // fontSize : 13
                                // },
                                // textAlign : 'left'
                            // });
                            // formsView.add(formsViewLabel);
// 
                            // var formsArr = e.source.formsArr;
                            // var detailsVal = e.source.details
                            // var forms_str = '- All -';
                            // if (formsArr.length < 4 && formsArr.length > 0) {
                                // forms_str = '';
                                // var form_idx;
                                // for ( form_idx = 0; form_idx < formsArr.length; form_idx++) {
                                    // forms_str += formsArr[form_idx] + ((form_idx == formsArr.length - 1) ? "" : ", ");
                                // }
                            // }
                            // else if (formsArr.length == 0) {
                                // forms_str = '- NONE -';
// 
                            // }
                            // formsViewLabel.text = forms_str;
// 
                            // var dttmView = Ti.UI.createScrollView({
                                // height : '170',
                                // contentHeight : 'auto',
                                // scrollType : 'vertical',
                                // showVerticalScrollIndicator : true,
                                // width : (Ti.Platform.displayCaps.platformWidth - 20) / 3,
                                // left : 1
                            // });
                            // detail_row.add(dttmView);
                            // var dttmViewLabel = Ti.UI.createLabel({
                                // top : 0,
                                // text : rules_field_format_readable_time_rules(detailsVal.time_rules),
                                // height : 'auto',
                                // width : (Ti.Platform.displayCaps.platformWidth - 20) / 3,
                                // color : '#1c1c1c',
                                // font : {
                                    // fontFamily : 'Helvetica Neue',
                                    // fontSize : 13
                                // },
                                // textAlign : 'left'
                            // });
                            // dttmView.add(dttmViewLabel);
// 
                            // var descView = Ti.UI.createScrollView({
                                // height : '175',
                                // contentHeight : 'auto',
                                // scrollType : 'vertical',
                                // showVerticalScrollIndicator : true,
                                // left : 2,
                                // width : (Ti.Platform.displayCaps.platformWidth - 20) / 3,
                            // });
                            // detail_row.add(descView);
                            // var descViewLabel = Ti.UI.createLabel({
                                // top : 0,
                                // text : detailsVal.description,
                                // height : 'auto',
                                // width : (Ti.Platform.displayCaps.platformWidth - 20) / 3,
                                // color : '#1c1c1c',
                                // font : {
                                    // fontFamily : 'Helvetica Neue',
                                    // fontSize : 13
                                // },
                                // textAlign : 'left'
                            // });
                            // descView.add(descViewLabel);
// 
                            // current_window.add(detail_popup);
                            // translucent.addEventListener('click', function(ent) {
                                // current_window.remove(detail_popup);
                            // });
// 
                        // });
                        // current_content.add(row);
                    // }
                // }
            // }
            // current_content.height = heightView;
            // break;
    // }
// }
// 
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
    // var violations_terms = [];
    // var descripitons = [];
    // var fromViolationRules = false;
    // var machine_name = rulesFieldContent['settings'].vocabulary;
    // var omadi_reference_title = "";
    // var violation_time = "";
    // db_display = Omadi.utils.openMainDatabase();
// 
    // var violations_vocabulary = db_display.execute('SELECT vid from vocabulary WHERE machine_name="' + machine_name + '";');
    // var violations_terms_rslt = db_display.execute('SELECT tid,name from term_data WHERE vid=' + violations_vocabulary.fieldByName('vid'));
    // while (violations_terms_rslt.isValidRow()) {
        // if (violations_terms[violations_terms_rslt.fieldByName('tid')] == null) {
            // violations_terms[violations_terms_rslt.fieldByName('tid')] = new Array();
        // }
        // violations_terms[violations_terms_rslt.fieldByName('tid')].push({
            // title : violations_terms_rslt.fieldByName('name'),
            // tid : violations_terms_rslt.fieldByName('tid')
        // });
        // violations_terms_rslt.next();
    // }
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
