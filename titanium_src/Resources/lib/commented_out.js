/**
 *  Function Name: (actualWindow, goToWindow )
 * Purpouse: Show button Back at the bottom and close actualWindow and go to goToWindow
 * Parameters:
 *  actualWindow:   The windows where the function was called from.
 *  goToWindow:     The target window (The window where the user is gonna be redirected)
 * Variables:
 *  backView:       The bottom button
 *  label_bottom:   Label "Back"
 */
// function showBottom(actualWindow, goToWindow) {
    // var backView = Titanium.UI.createView({
        // top : '95%',
        // backgroundColor : '#111',
        // height : '6%',
        // width : '100%',
        // opacity : 0.99,
        // borderRadius : 5
    // });
// 
    // var label_bottom = Titanium.UI.createLabel({
        // color : '#FFFFFF',
        // text : 'Back',
        // textAlign : 'center',
        // height : 'auto'
    // });
// 
    // backView.add(label_bottom);
// 
    // backView.addEventListener('click', function() {
        // if (!goToWindow.notOpen) {
            // goToWindow.log = actualWindow.log;
            // goToWindow.result = actualWindow.result;
            // goToWindow.name = actualWindow.name;
        // }
// 
        // if ((actualWindow.returnTo == "individual_contact.js") || (actualWindow.returnTo == "individual_potential.js")) {
            // goToWindow.nid = actualWindow.nidToReturn;
            // goToWindow.nameSelected = actualWindow.nameToReturn;
        // }
// 
        // //Avoiding memory leaking problems:
        // if (!goToWindow.notOpen)
            // goToWindow.open();
// 
        // actualWindow.close();
    // });
    // actualWindow.add(backView);
// };




// function getCookie() {"use strict";
    // var db, result, cookie;
// 
    // db = Omadi.utils.openListDatabase();
    // result = db.execute('SELECT * FROM login WHERE rowid=1');
    // cookie = result.fieldByName("cookie");
    // Ti.API.info("FOUND COOKIE = " + cookie);
// 
    // result.close();
    // db.close();
    // return cookie;
// }




// function Omadi.display.showLoadingIndicatorDelete(inform) {
    // Titanium.App.Properties.setBool("indicatorActive", true);
// 
    // // window container
// 
    // indWin = Titanium.UI.createWindow({
        // title : 'Omadi CRM',
        // modal : true,
        // navBarHidden : true,
        // opacity : 0.9,
        // backgroundColor : '#000000'
    // });
// 
    // // black view
    // var indView = Titanium.UI.createView({
        // height : '32%',
        // width : '70%',
        // backgroundColor : '#000',
        // borderRadius : 10,
        // opacity : 0.9
    // });
// 
    // indWin.add(indView);
// 
    // // loading indicator
    // actIndFun = Titanium.UI.createActivityIndicator({
        // height : '7%',
        // message : "Logging you in",
        // width : '30%'
    // });
// 
    // indWin.add(actIndFun);
// 
    // // message
    // var message = Titanium.UI.createLabel({
        // text : inform,
        // color : '#fff',
        // width : 'auto',
        // height : 'auto',
        // textAlign : 'center',
        // font : {
            // fontFamily : 'Helvetica Neue',
            // fontWeight : 'bold'
        // },
        // top : '67%'
    // });
    // indWin.add(message);
// 
    // indWin.orientationModes = [Titanium.UI.PORTRAIT];
    // indWin.open();
    // actIndFun.show();
// };



// function Omadi.display.hideLoadingIndicatorFistPage() {
    // setInterval(function() {
        // if (Titanium.App.Properties.getBool("isFirstPage")) {
            // actIndFun.hide();
            // Titanium.App.Properties.setBool("indicatorActive", false);
            // indWin.close();
        // }
    // }, 1000);
// };





// To reduce image
// function reduceImageSize(blobImage, maxWidth, maxHeight) {
// try{
// var image1 = Titanium.UI.createImageView({
// image : blobImage,
// width : 'auto',
// height : 'auto'
// });
// var imageBlob = image1.toBlob();
// var multiple;
// if(imageBlob.height / imageBlob.width > maxHeight / maxWidth) {
// multiple = imageBlob.height / maxHeight;
// } else {
// multiple = imageBlob.width / maxWidth;
// }
//
// if(multiple >= 1) {
// image1.height = parseInt(imageBlob.height / multiple);
// image1.width = parseInt(imageBlob.width / multiple);
// image1.image = image1.toImage();
// } else {
//
// }
// return image1;
// }catch(evt){
// Ti.API.error("Error in reduce Image Size");
// }
//
// }



// // Download Image from the server
// function downloadThumnail(file_id, image, win) {
// if(win.nid > 0 && file_id > 0){
// var URL = domainName + DOWNLOAD_URL_THUMBNAIL + win.nid + '/' + file_id;
// Ti.API.info("==== site:: " + URL);
// try {
// var downloadImage = Ti.Network.createHTTPClient();
// downloadImage.setTimeout(30000);
// downloadImage.open('GET', URL);
//
// Omadi.utils.setCookieHeader(downloadImage);
//
//
// downloadImage.onload = function(e) {
// var tempImg = Ti.UI.createImageView({
// height : 'auto',
// width : 'auto',
// image : this.responseData
// });
//
// //Ti.API.info(this.responseData);
//
// if (tempImg.toImage().height > 100 || tempImg.toImage().width > 100) {
// image.setImage(reduceImageSize(tempImg.toImage(), 100, 100).toBlob());
// } else {
// image.setImage(this.responseData);
// }
// image.isImage = true;
// //image = tempImg;
// };
//
// downloadImage.onerror = function(e) {
// Ti.API.error("Error in download image.");
// image.image = '../images/default.png';
// };
//
// downloadImage.send();
// }
// catch(e) {
// Ti.API.info("==== ERROR ===" + e);
// }
// }
// }

// function downloadMainImage(file_id, content, win) {
// var actInd = Ti.UI.createActivityIndicator();
// actInd.font = {
// fontFamily : 'Helvetica Neue',
// fontSize : 15,
// fontWeight : 'bold'
// };
// actInd.color = 'white';
// actInd.message = 'Loading...';
// actInd.show();
// if (content.bigImg != null) {
// showImage(content, actInd);
// return;
// }
//
// //Ti.API.info("==== site:: " + URL);
// try {
// var http = Ti.Network.createHTTPClient();
// http.setTimeout(30000);
// http.open('GET', Omadi.DOMAIN_NAME + '/sync/file/' + win.nid + '/' + file_id);
//
// Omadi.utils.setCookieHeader(http);
//
// http.onload = function(e) {
// //Ti.API.info('=========== Success ========');
// content.bigImg = this.responseData;
// showImage(content, actInd);
// actInd.hide();
// };
//
// http.onerror = function(e) {
// Ti.API.error("Error in download Image 2");
// actInd.hide();
// alert("There was an error retrieving the file.");
// };
//
// http.send();
// }
// catch(e) {
// actInd.hide();
// alert("There was an error retrieving the file.");
// Ti.API.info("==== ERROR ===" + e);
// }
// }

// function showImage(source, actInd) {
// var imageWin = Ti.UI.createWindow({
// backgroundColor : '#00000000'
// });
// imageWin.orientation = [Ti.UI.PORTRAIT];
//
// var tanslucent = Ti.UI.createView({
// backgroundColor : 'black',
// opacity : 0.8,
// top : 0,
// bottom : 0,
// right : 0,
// left : 0
// });
//
// //Header part
// // var header = Ti.UI.createView({
// // backgroundImage : '../images/header.png',
// // height : '40',
// // top : 0
// // });
// // header.top = header.left = header.right = 0
// // var labelDesc = Ti.UI.createLabel({
// // text : source.label,
// // left : 5,
// // height : 30,
// // width : Ti.Platform.displayCaps.platformWidth - 10,
// // color : '#fff',
// // font : {
// // fontFamily : 'Helvetica Neue',
// // fontSize : 18,
// // fontWeight : 'bold',
// //
// // },
// // ellipsize : true,
// // wordWrap : false
// // });
// // var close_btn = Ti.UI.createImageView({
// // height : 30,
// // width : 25,
// // top : 4,
// // right : 5,
// // image : '../images/close.png'
// // });
// //imageWin.add(header);
// //header.add(labelDesc);
// //header.add(close_btn);
//
// var fullImage = Omadi.display.getImageViewFromData(source.bigImg, Ti.Platform.displayCaps.platformWidth, Ti.Platform.displayCaps.platformHeight - 50);
//
// // var imageBaseView = Ti.UI.createView({
// // top : 0,
// // right : 0,
// // left : 0,
// // bottom : 0
// // });
//
// fullImage.addEventListener('click', function(e) {
// imageWin.close();
// });
//
// tanslucent.addEventListener('click', function(e) {
// imageWin.close();
// });
//
// if(!(fullImage==null)){
// tanslucent.add(fullImage);
// }
// imageWin.add(tanslucent);
// //imageWin.add(imageBaseView);
// imageWin.open();
// }


// while (n_bund.isValidRow()) {
                    // var name_table = n_bund.fieldByName("bundle_name");
                    // //try{
                    // if ((json.node) && (json.node[name_table])) {
                        // Ti.API.info('##### Called ' + name_table);
                        // Omadi.data.processNodeJson(json.node, name_table, db_installMe, progress);
                        // //callback = process_object(json.node, name_table, quotes, progress, type_request, db_installMe);
                    // }
                    // //Add it to the main screen
                    // var display = n_bund.fieldByName("display_name").toUpperCase();
                    // var description = n_bund.fieldByName("description");
                    // var flag_display = n_bund.fieldByName("display_on_menu");
                    // var id = n_bund.fieldByName("bid");
                    // var _is_disabled = n_bund.fieldByName("disabled");
                    // var _nd = n_bund.fieldByName("_data");
                    // var show_plus = false;
                    // var app_permissions = {
                        // "can_create" : false,
                        // "can_update" : false,
                        // "all_permissions" : false,
                        // "can_view" : false
                    // }
// 
                    // var node_type_json = JSON.parse(_nd);
// 
                    // if (node_type_json.no_mobile_display != null && node_type_json.no_mobile_display == 1 && node_type_json.no_mobile_display == '1') {
                        // n_bund.next();
                        // continue;
                    // }
// 
                    // if (roles.hasOwnProperty(ROLE_ID_ADMIN)) {
                        // show_plus = true;
                        // app_permissions.can_create = true;
                        // app_permissions.all_permissions = true;
                        // app_permissions.can_update = true;
                        // app_permissions.can_view = true;
// 
                    // }
                    // else {
                        // var _l;
                        // for (_l in node_type_json.permissions) {
                            // for (_k in roles) {
                                // if (_l == _k) {
                                    // var stringifyObj = JSON.stringify(node_type_json.permissions[_l]);
                                    // if (node_type_json.permissions[_l]["can create"] || node_type_json.permissions[_l]["all_permissions"]) {
                                        // show_plus = true;
                                        // app_permissions.can_create = true;
                                    // }
// 
                                    // if (node_type_json.permissions[_l]["all_permissions"]) {
                                        // app_permissions.all_permissions = true;
                                        // app_permissions.can_update = true;
                                        // app_permissions.can_view = true;
                                        // continue;
                                    // }
// 
                                    // if (stringifyObj.indexOf('update') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
                                        // app_permissions.can_update = true;
                                    // }
// 
                                    // if (stringifyObj.indexOf('view') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
                                        // app_permissions.can_view = true;
                                    // }
// 
                                // }
                            // }
                        // }
                    // }
// 
                    // if (flag_display == 'false' && (_is_disabled != 1 && _is_disabled != "1" && _is_disabled != "true" && _is_disabled != true)) {
// 
                        // if (app_permissions.can_view == false && app_permissions.can_create == false) {
                            // n_bund.next();
                            // continue;
                        // }
// 
                        // var row_a = Ti.UI.createTableViewRow({
                            // height : "40dp",
                            // name : display,
                            // display : display,
                            // desc : description,
                            // name_table : name_table,
                            // show_plus : show_plus,
                            // app_permissions : app_permissions,
                            // className : 'menu_row', // this is to optimize the rendering
                            // selectionStyle : app_permissions.can_view ? 1 : 0,
                            // backgroundSelectedColor : app_permissions.can_view ? '#BDBDBD' : '#00000000'
                        // });
// 
                        // var icon = Titanium.UI.createImageView({
                            // width : "32dp",
                            // height : "32dp",
                            // top : "6dp",
                            // left : "5dp",
                            // desc : description,
                            // image : '/images/icons/' + name_table.toLowerCase() + '.png',
                        // });
// 
                        // if (icon.toBlob() == null || icon.toBlob().length == 0) {
                            // icon.image = '/images/icons/settings.png';
                        // }
// 
                        // var title_a = Titanium.UI.createLabel({
                            // text : display,
                            // font : {
                                // fontSize : "20dp"
                            // },
                            // width : '82%',
                            // textAlign : 'left',
                            // left : "42dp",
                            // height : 'auto',
                            // desc : description,
                            // color : '#000'
                        // });
// 
                        // var plus_a = Titanium.UI.createButton({
                            // backgroundImage : '/images/plus_btn.png',
                            // backgroundSelectedImage : '/images/plus_btn_selected.png',
                            // width : "54dp",
                            // height : "38dp",
                            // right : "1dp",
                            // is_plus : true
                        // });
                        // if (show_plus === false) {
                            // plus_a.hide();
                        // }
// 
                        // row_a.add(icon);
                        // row_a.add(title_a);
                        // row_a.add(plus_a);
// 
                        // if (PLATFORM == 'android') {
                            // row_a.addEventListener('longclick', function(e) {
                                // if (e.source.desc != null && e.source.desc != "") {
                                    // alert(e.source.desc)
                                // }
                            // });
                        // }
                        // else {
                            // row_a.addEventListener('longpress', function(e) {
                                // if (e.source.desc != null && e.source.desc != "") {
                                    // alert(e.source.desc)
                                // }
                            // });
                        // }
// 
                        // //menu.appendRow(row_a);
                        // data_rows.push(row_a);
                        // data_rows.sort(sortTableView);
                        // menu.setData(data_rows);
                        // db_installMe.execute('UPDATE bundles SET display_on_menu =\'true\' WHERE bid=' + id);
                    // }
                   // n_bund.next();
                    //  }
                    //catch(evt){
                    //}

               // }
               // n_bund.close();
                /*********** Users *************/

// //Fields:
                // if (json.fields) {
//                     
// 
                    // if (json.fields.update) {
                        // Ti.API.info("################################ Fields update found! #################################");
                        // //Array of objects
                        // if (json.fields.update.length) {
                            // var i;
                            // for ( i = 0; i < json.fields.update.length; i++) {
                                // if (progress != null) {
                                    // //Increment Progress Bar
                                    // progress.set();
                                // }
// 
                                // //Encode:
                                // var var_widget = JSON.stringify(json.fields.update[i].widget);
                                // var var_settings = JSON.stringify(json.fields.update[i].settings);
// 
                                // var fid = json.fields.update[i].fid;
// 
                                // if (json.fields.update[i].type != null)
                                    // var type = json.fields.update[i].type.replace(/'/gi, '"');
                                // else
                                    // var type = null;
// 
                                // if (json.fields.update[i].field_name != null)
                                    // var field_name = json.fields.update[i].field_name.replace(/'/gi, '"');
                                // else
                                    // var field_name = null;
// 
                                // if (json.fields.update[i].label != null)
                                    // var label = json.fields.update[i].label.replace(/'/gi, '"');
                                // else
                                    // var label = null;
// 
                                // if (json.fields.update[i].description != null)
                                    // var description = json.fields.update[i].description.replace(/'/gi, '"');
                                // else
                                    // var description = null;
// 
                                // if (json.fields.update[i].bundle != null)
                                    // var bundle = json.fields.update[i].bundle.replace(/'/gi, '"');
                                // else
                                    // var bundle = null;
// 
                                // if (json.fields.update[i].weight != null)
                                    // var weight = json.fields.update[i].weight;
                                // else
                                    // var weight = null;
// 
                                // if (json.fields.update[i].required != null)
                                    // var required = json.fields.update[i].required;
                                // else
                                    // var required = null;
// 
                                // if (json.fields.update[i].disabled != null)
                                    // var disabled = json.fields.update[i].disabled;
                                // else
                                    // var disabled = 0;
// 
                                // if (var_widget != null)
                                    // var widget = var_widget.replace(/'/gi, '"');
                                // else
                                    // var widget = null;
// 
                                // if (var_settings != null) {
                                    // var settings = var_settings.replace(/'/gi, '"');
                                    // var s = JSON.parse(settings);
                                    // var region = s.region;
                                // }
                                // else {
                                    // var settings = null;
                                    // var region = null;
                                // }
// 
                                // var tables = db_installMe.execute('SELECT * FROM fields WHERE fid = ' + fid);
// 
                                // var fi_array = {
                                    // //We might have many (of the same) fid for the same row
                                    // fid : tables.fieldByName('fid'),
                                    // //Settings never changes when there is duplicity
                                    // settings : tables.fieldByName('settings'),
                                    // //Variables
                                    // fi_obj : new Array()
                                // }
// 
                                // var count_fi_database = 0;
// 
                                // while (tables.isValidRow()) {
                                    // //ID is primary key
                                    // fi_array.fi_obj[count_fi_database] = new Array();
                                    // fi_array.fi_obj[count_fi_database]['id'] = tables.fieldByName('id');
                                    // fi_array.fi_obj[count_fi_database]['field_name'] = tables.fieldByName('field_name');
                                    // count_fi_database++;
                                    // tables.next();
                                // }
// 
                                // if (count_fi_database == 0) {
                                    // //This field is not present in database, let's include it:
                                    // //Shouldn't happen within an update but if it does, it will be treated
                                    // //Multiple parts
                                    // if (json.fields.update[i].settings.parts) {
                                        // var f_value_i;
                                        // for (f_value_i in json.fields.update[i].settings.parts ) {
                                            // perform[perform.length] = "INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "___" + f_value_i + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "' ,  '" + disabled + "' , '" + widget + "','" + settings + "' )";
                                            // //Ti.API.info('Field not presented in the database, creating field_name = '+field_name+"___"+f_value_i);
                                        // }
                                    // }
                                    // //Normal field
                                    // else {
                                        // perform[perform.length] = "INSERT OR REPLACE  INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ",'" + required + "','" + disabled + "','" + widget + "','" + settings + "' )";
                                        // //Ti.API.info('Field not presented in the database, creating field_name = '+field_name);
                                    // }
// 
                                    // var type = "";
// 
                                    // switch(json.fields.update[i].type) {
                                        // case "taxonomy_term_reference":
                                        // case "term_reference":
                                        // case "datestamp":
                                        // case "number_integer":
                                            // (PLATFORM == 'android') ? type = "INTEGER" : type = 'TEXT'
                                            // break;
// 
                                        // case "number_decimal":
                                            // type = "REAL"
                                            // break;
// 
                                        // default:
                                            // type = "TEXT";
                                            // break;
                                    // }
// 
                                    // //Check if it is a valid bundle (automatically updated throught the API):
                                    // var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "' + bundle + '"');
                                    // if (q_bund.isValidRow()) {
                                        // if (json.fields.update[i].settings.parts) {
                                            // var f_value_i;
                                            // for (f_value_i in json.fields.update[i].settings.parts ) {
                                                // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___' + f_value_i + '\' ' + type;
                                                // Ti.API.info("Updated: " + field_name + "___" + f_value_i + " to be used in " + bundle);
                                            // }
                                        // }
                                        // else {
                                            // if (json.fields.update[i].type == 'image') {
                                                // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___file_id' + '\' ' + type;
                                                // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___status' + '\' ' + type;
                                            // }
                                            // if (json.fields.update[i].type == 'file') {
                                                // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___fid' + '\' ' + type;
                                                // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___filename' + '\' ' + type;
                                            // }
                                            // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '\' ' + type;
                                            // Ti.API.info("Updated: " + field_name + " to be used in " + bundle);
                                        // }
                                    // }
                                    // else {
                                        // Ti.API.info('=====================>>>>> Avoiding fields creation for table: ' + bundle);
                                    // }
                                    // q_bund.close();
                                // }
                                // else {
                                    // //Real update
                                    // //This field is present in database, let's update it:
// 
                                    // //Multiple parts need to be inserted
                                    // if (fi_array.fi_obj.length > 1) {
                                        // //Filter fields from database
                                        // var missing_update = new Array();
                                        // var match_base = new Array();
                                        // var f_base;
                                        // for (f_base in json.fields.update[i].settings.parts) {
                                            // missing_update[f_base] = true;
                                        // }
// 
                                        // for (f_base in fi_array.fi_obj) {
                                            // var i_obj = {
                                                // match : false,
                                                // id : fi_array.fi_obj[f_base]['id'],
                                                // field_name : fi_array.fi_obj[f_base]['field_name']
                                            // };
                                            // match_base[fi_array.fi_obj[f_base]['field_name']] = i_obj;
// 
                                            // Ti.API.info('***************** INSERTED ' + fi_array.fi_obj[f_base]['field_name']);
                                        // }
// 
                                        // //Deletions
                                        // //Fields in database and in JSON update
                                        // var parts = json.fields.update[i].settings.parts;
// 
                                        // for (f_base in fi_array.fi_obj) {
                                            // var indField;
                                            // for (indField in parts) {
                                                // if (field_name + "___" + indField == fi_array.fi_obj[f_base]['field_name']) {
                                                    // Ti.API.info('IS in database : ' + fi_array.fi_obj[f_base]['field_name']);
                                                    // //Turn update flag off
                                                    // match_base[fi_array.fi_obj[f_base]['field_name']].match = true;
                                                // }
                                            // }
                                        // }
                                        // //Delete missing fields at the database
                                        // var i_x;
                                        // for (i_x in match_base) {
                                            // if (match_base[i_x].match === false) {
                                                // perform[perform.length] = "DELETE FROM fields WHERE id=" + match_base[i_x].id;
                                            // }
                                        // }
// 
                                        // //UPDATES:
                                        // //First off, update the fields:
                                        // var indField;
                                        // for (indField in json.fields.update[i].settings.parts) {
                                            // var f_base;
                                            // for (f_base in fi_array.fi_obj) {
                                                // if (field_name + "___" + indField == fi_array.fi_obj[f_base]['field_name']) {
                                                    // Ti.API.info(field_name + '___' + indField);
                                                    // Ti.API.info(fi_array.fi_obj[f_base]['field_name']);
// 
                                                    // //Run update script
                                                    // Ti.API.info('Updated field_name = ' + field_name + "___" + indField);
// 
                                                    // perform[perform.length] = "UPDATE fields SET type='" + type + "', label='" + label + "', description='" + description + "', bundle='" + bundle + "', region='" + region + "', weight=" + weight + ", required='" + required + "', disabled='" + disabled + "', widget='" + widget + "', settings='" + settings + "'  WHERE id=" + fi_array.fi_obj[f_base]['id'];
// 
                                                    // //Turn update flag off
                                                    // missing_update[indField] = false;
                                                // }
                                            // }
                                        // }
// 
                                        // //Now we have the new properties, let's add them
                                        // var index;
                                        // for (index in missing_update) {
                                            // if (missing_update[index] === true) {
                                                // perform[perform.length] = "INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "___" + index + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "' ,  '" + disabled + "' , '" + widget + "','" + settings + "' )";
                                                // Ti.API.info('Created a new field because of a new part, field_name = ' + field_name + "___" + index);
// 
                                                // var type = "";
// 
                                                // switch(json.fields.update[i].type) {
                                                    // case "taxonomy_term_reference":
                                                    // case "term_reference":
                                                    // case "datestamp":
                                                    // case "number_integer":
                                                        // (PLATFORM == 'android') ? type = "INTEGER" : type = 'TEXT';
                                                        // break;
// 
                                                    // case "number_decimal":
                                                        // type = "REAL"
                                                        // break;
// 
                                                    // default:
                                                        // type = "TEXT";
                                                        // break;
                                                // }
// 
                                                // var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "' + bundle + '"');
                                                // if (q_bund.isValidRow()) {
                                                    // var db_tester = db_installMe.execute('SELECT ' + field_name + '___' + index + ' FROM ' + bundle);
                                                    // if (db_tester.isValidRow()) {
                                                        // Ti.API.info('Field recovered!');
                                                    // }
                                                    // else {
                                                        // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + "___" + index + '\' ' + type;
                                                    // }
                                                    // db_tester.close();
                                                    // Ti.API.info("Updated: " + field_name + "___" + index + " to be used in " + bundle);
                                                // }
                                                // else {
                                                    // Ti.API.info('=====================>>>>> Avoiding fields creation for table: ' + bundle);
                                                // }
                                                // q_bund.close();
                                            // }
                                        // }
                                    // }
                                    // //Single insert
                                    // else
                                    // if (fi_array.fi_obj.length == 1) {
                                        // //Run update script
                                        // Ti.API.info('Single updated for single part, fid = ' + fid);
                                        // perform[perform.length] = "UPDATE fields SET type='" + type + "', label='" + label + "', description='" + description + "', bundle='" + bundle + "', region='" + region + "', weight=" + weight + ", required='" + required + "', disabled='" + disabled + "', widget='" + widget + "', settings='" + settings + "'  WHERE id=" + fi_array.fi_obj[0]['id'];
                                    // }
                                    // //Length == 0 has count_fi_database == 0, so it should not end here.
                                    // else {
                                        // Ti.API.info('#################################### @Developer, take a look, fields update should not end here ####################################');
                                    // }
                                // }
                            // }
                        // }
                        // //Single object
                        // else {
                            // if (progress != null) {
                                // //Increment Progress Bar
                                // progress.set();
                            // }
// 
                            // //Encode:
                            // var var_widget = JSON.stringify(json.fields.update.widget);
                            // var var_settings = JSON.stringify(json.fields.update.settings);
// 
                            // var fid = json.fields.update.fid;
// 
                            // if (json.fields.update.type != null)
                                // var type = json.fields.update.type.replace(/'/gi, '"');
                            // else
                                // var type = null;
// 
                            // if (json.fields.update.field_name != null)
                                // var field_name = json.fields.update.field_name.replace(/'/gi, '"');
                            // else
                                // var field_name = null;
// 
                            // if (json.fields.update.label != null)
                                // var label = json.fields.update.label.replace(/'/gi, '"');
                            // else
                                // var label = null;
// 
                            // if (json.fields.update.description != null)
                                // var description = json.fields.update.description.replace(/'/gi, '"');
                            // else
                                // var description = null;
// 
                            // if (json.fields.update.bundle != null)
                                // var bundle = json.fields.update.bundle.replace(/'/gi, '"');
                            // else
                                // var bundle = null;
// 
                            // if (json.fields.update.weight != null)
                                // var weight = json.fields.update.weight;
                            // else
                                // var weight = null;
// 
                            // if (json.fields.update.required != null)
                                // var required = json.fields.update.required;
                            // else
                                // var required = null;
// 
                            // if (json.fields.update.disabled != null)
                                // var disabled = json.fields.update.disabled;
                            // else
                                // var disabled = null;
// 
                            // if (var_widget != null)
                                // var widget = var_widget.replace(/'/gi, '"');
                            // else
                                // var widget = null;
// 
                            // if (var_settings != null) {
                                // var settings = var_settings.replace(/'/gi, '"');
                                // var s = JSON.parse(settings);
                                // var region = s.region;
                            // }
                            // else {
                                // var settings = null;
                                // var region = null;
                            // }
// 
                            // var tables = db_installMe.execute('SELECT * FROM fields WHERE fid = ' + fid);
// 
                            // var fi_array = {
                                // //We might have various (of the same) fid for the same row
                                // fid : tables.fieldByName('fid'),
                                // //Settings never changes when there is duplicity
                                // settings : tables.fieldByName('settings'),
                                // //Variables
                                // fi_obj : new Array()
                            // }
// 
                            // var count_fi_database = 0;
// 
                            // while (tables.isValidRow()) {
                                // //ID is primary key
                                // fi_array.fi_obj[count_fi_database] = new Array();
                                // fi_array.fi_obj[count_fi_database]['id'] = tables.fieldByName('id');
                                // fi_array.fi_obj[count_fi_database]['field_name'] = tables.fieldByName('field_name');
                                // count_fi_database++;
                                // tables.next();
                            // }
// 
                            // if (count_fi_database == 0) {
                                // //This field is not present in database, let's include it:
                                // //Shouldn't happen within an update but if it does, it will be treated
                                // //Multiple parts
                                // if (json.fields.update.settings.parts) {
                                    // var f_value_i;
                                    // for (f_value_i in json.fields.update.settings.parts ) {
                                        // perform[perform.length] = "INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "___" + f_value_i + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "' ,  '" + disabled + "' , '" + widget + "','" + settings + "' )";
                                        // Ti.API.info('Field not presented in the database, creating field_name = ' + field_name + "___" + f_value_i);
                                    // }
                                // }
                                // //Normal field
                                // else {
                                    // perform[perform.length] = "INSERT OR REPLACE  INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ",'" + required + "','" + disabled + "','" + widget + "','" + settings + "' )";
                                    // Ti.API.info('Field not presented in the database, creating field_name = ' + field_name);
                                // }
// 
                                // var type = "";
// 
                                // switch(json.fields.update.type) {
                                    // case "taxonomy_term_reference":
                                    // case "term_reference":
                                    // case "datestamp":
                                    // case "number_integer":
                                        // (PLATFORM == 'android') ? type = "INTEGER" : type = 'TEXT'
                                        // break;
// 
                                    // case "number_decimal":
                                        // type = "REAL"
                                        // break;
// 
                                    // default:
                                        // type = "TEXT";
                                        // break;
                                // }
// 
                                // //Check if it is a valid bundle (automatically updated throught the API):
                                // var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "' + bundle + '"');
                                // if (q_bund.isValidRow()) {
                                    // if (json.fields.update.settings.parts) {
                                        // var f_value_i;
                                        // for (f_value_i in json.fields.update.settings.parts ) {
                                            // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___' + f_value_i + '\' ' + type;
                                            // Ti.API.info("Updated: " + field_name + "___" + f_value_i + " to be used in " + bundle);
                                        // }
                                    // }
                                    // else {
                                        // if (json.fields.update[i].type == 'image') {
                                            // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___file_id' + '\' ' + type;
                                            // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___status' + '\' ' + type;
                                        // }
                                        // if (json.fields.update[i].type == 'file') {
                                            // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___fid' + '\' ' + type;
                                            // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___filename' + '\' ' + type;
                                        // }
// 
                                        // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '\' ' + type;
                                        // Ti.API.info("Updated: " + field_name + " to be used in " + bundle);
                                    // }
                                // }
                                // else {
                                    // Ti.API.info('=====================>>>>> Avoiding fields creation for table: ' + bundle);
                                // }
                                // q_bund.close();
                            // }
                            // else {
                                // //Real update
                                // //This field is present in database, let's update it:
// 
                                // //Multiple parts need to be inserted
                                // if (fi_array.fi_obj.length > 1) {
                                    // //Filter fields from database
                                    // var missing_update = new Array();
                                    // var match_base = new Array();
                                    // var f_base;
                                    // for (f_base in json.fields.update.settings.parts) {
                                        // missing_update[f_base] = true;
                                    // }
// 
                                    // for (f_base in fi_array.fi_obj) {
                                        // var i_obj = {
                                            // match : false,
                                            // id : fi_array.fi_obj[f_base]['id'],
                                            // field_name : fi_array.fi_obj[f_base]['field_name']
                                        // };
                                        // match_base[fi_array.fi_obj[f_base]['field_name']] = i_obj;
// 
                                        // Ti.API.info('***************** INSERTED ' + fi_array.fi_obj[f_base]['field_name']);
                                    // }
// 
                                    // //Deletions
                                    // //Fields in database and in JSON update
                                    // var parts = json.fields.update.settings.parts;
// 
                                    // for (f_base in fi_array.fi_obj) {
                                        // var indField;
                                        // for (indField in parts) {
                                            // if (field_name + "___" + indField == fi_array.fi_obj[f_base]['field_name']) {
                                                // Ti.API.info('IS in database : ' + fi_array.fi_obj[f_base]['field_name']);
                                                // //Turn update flag off
                                                // match_base[fi_array.fi_obj[f_base]['field_name']].match = true;
                                            // }
                                        // }
                                    // }
                                    // //Delete missing fields at the database
                                    // var i_x;
                                    // for (i_x in match_base) {
                                        // if (match_base[i_x].match === false) {
                                            // perform[perform.length] = "DELETE FROM fields WHERE id=" + match_base[i_x].id;
                                        // }
                                    // }
// 
                                    // //UPDATES:
                                    // //First off, update the fields:
                                    // var indField;
                                    // for (indField in json.fields.update.settings.parts) {
                                        // var f_base;
                                        // for (f_base in fi_array.fi_obj) {
                                            // if (field_name + "___" + indField == fi_array.fi_obj[f_base]['field_name']) {
                                                // Ti.API.info(field_name + '___' + indField);
                                                // Ti.API.info(fi_array.fi_obj[f_base]['field_name']);
// 
                                                // //Run update script
                                                // Ti.API.info('Updated field_name = ' + field_name + "___" + indField);
// 
                                                // perform[perform.length] = "UPDATE fields SET type='" + type + "', label='" + label + "', description='" + description + "', bundle='" + bundle + "', region='" + region + "', weight=" + weight + ", required='" + required + "', disabled='" + disabled + "', widget='" + widget + "', settings='" + settings + "'  WHERE id=" + fi_array.fi_obj[f_base]['id'];
// 
                                                // //Turn update flag off
                                                // missing_update[indField] = false;
                                            // }
                                        // }
                                    // }
// 
                                    // //Now we have the new properties, let's add them
                                    // var index;
                                    // for (index in missing_update) {
                                        // if (missing_update[index] === true) {
                                            // perform[perform.length] = "INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "___" + index + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "' ,  '" + disabled + "' , '" + widget + "','" + settings + "' )";
                                            // Ti.API.info('Created a new field because of a new part, field_name = ' + field_name + "___" + index);
// 
                                            // var type = "";
// 
                                            // switch(json.fields.update.type) {
                                                // case "taxonomy_term_reference":
                                                // case "term_reference":
                                                // case "datestamp":
                                                // case "number_integer":
                                                    // (PLATFORM == 'android') ? type = "INTEGER" : type = 'TEXT'
                                                    // break;
// 
                                                // case "number_decimal":
                                                    // type = "REAL"
                                                    // break;
// 
                                                // default:
                                                    // type = "TEXT";
                                                    // break;
                                            // }
// 
                                            // var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "' + bundle + '"');
                                            // if (q_bund.isValidRow()) {
                                                // var db_tester = db_installMe.execute('SELECT ' + field_name + '___' + index + ' FROM ' + bundle);
                                                // if (db_tester.isValidRow()) {
                                                    // Ti.API.info('Field recovered!');
                                                // }
                                                // else {
                                                    // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + "___" + index + '\' ' + type;
                                                // }
                                                // db_tester.close();
                                                // Ti.API.info("Updated: " + field_name + "___" + index + " to be used in " + bundle);
                                            // }
                                            // else {
                                                // Ti.API.info('=====================>>>>> Avoiding fields creation for table: ' + bundle);
                                            // }
                                            // q_bund.close();
                                        // }
                                    // }
                                // }
                                // //Single insert
                                // else
                                // if (fi_array.fi_obj.length == 1) {
                                    // //Run update script
                                    // Ti.API.info('Single updated for single part, fid = ' + fid);
                                    // perform[perform.length] = "UPDATE fields SET type='" + type + "', label='" + label + "', description='" + description + "', bundle='" + bundle + "', region='" + region + "', weight=" + weight + ", required='" + required + "', disabled='" + disabled + "', widget='" + widget + "', settings='" + settings + "'  WHERE id=" + fi_array.fi_obj[0]['id'];
                                // }
                                // //Length == 0 has count_fi_database == 0, so it should not end here.
                                // else {
                                    // Ti.API.info('#################################### @Developer, take a look, fields update should not end here ####################################');
                                // }
                            // }
                        // }
                    // }
                    // /*
                     // * Delete fields from fields table
                     // */
// 
                    // if (json.fields["delete"]) {
                        // if (json.fields["delete"].length) {
                            // var i;
                            // for ( i = 0; i < json.fields["delete"].length; i++) {
                                // Ti.API.info('FID: ' + json.fields["delete"][i].fid + ' was deleted');
                                // //Deletes rows from terms
                                // perform[perform.length] = 'DELETE FROM fields WHERE "fid"=' + json.fields["delete"][i].fid;
                            // }
                        // }
                        // else {
                            // Ti.API.info('FID: ' + json.fields["delete"].fid + ' was deleted');
                            // perform[perform.length] = 'DELETE FROM fields WHERE "fid"=' + json.fields["delete"].fid;
                        // }
                    // }
// 
                    // if (perform) {
                        // var iPerform = 0;
                        // var iStart = Math.round(new Date().getTime() / 1000);
                        // Ti.API.info("Fields started at : " + iStart);
// 
                        // db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
                        // while (iPerform <= perform.length - 1) {
                            // //Ti.API.info("Field -------  "+perform[iPerform]);
                            // db_installMe.execute(perform[iPerform]);
                            // iPerform++;
                        // }
                        // db_installMe.execute("COMMIT TRANSACTION");
// 
                        // var iEnd = Math.round(new Date().getTime() / 1000);
                        // Ti.API.info("Fields finishes at : " + iEnd);
// 
                        // var iResult = iEnd - iStart;
                        // Ti.API.info('Fields seconds: ' + iResult);
                        // Ti.API.info("Success for fields, it was inserted / updated!");
                    // }
                // }






// function bottomBack(actualWindow, text, method, unset) {
    // var backView = Titanium.UI.createView({
        // top : '95%',
        // backgroundColor : '#111',
        // height : '6%',
        // width : '100%',
        // opacity : 0.99,
        // borderRadius : 5
    // });
// 
    // if (text) {
        // var label_bottom = Titanium.UI.createLabel({
            // color : '#FFFFFF',
            // text : text,
            // textAlign : 'center',
            // height : 'auto'
        // });
    // }
    // else {
        // var label_bottom = Titanium.UI.createLabel({
            // color : '#FFFFFF',
            // text : 'Back',
            // textAlign : 'center',
            // height : 'auto'
        // });
    // }
    // backView.add(label_bottom);
// 
    // backView.addEventListener('click', function() {
        // if (unset === true) {
// 
            // //Omadi.data.setUpdating(false)
        // }
        // actualWindow.close();
    // });
    // actualWindow.add(backView);
// };

// function bottomBack_release(actualWindow, text, method) {
    // var backView = Titanium.UI.createView({
        // top : '95%',
        // backgroundColor : '#111',
        // height : '6%',
        // width : '100%',
        // opacity : 0.99,
        // borderRadius : 5
    // });
// 
    // if (text) {
        // var label_bottom = Titanium.UI.createLabel({
            // color : '#FFFFFF',
            // text : text,
            // textAlign : 'center',
            // height : 'auto'
        // });
    // }
    // else {
        // var label_bottom = Titanium.UI.createLabel({
            // color : '#FFFFFF',
            // text : 'Back',
            // textAlign : 'center',
            // height : 'auto'
        // });
    // }
    // backView.add(label_bottom);
// 
    // backView.addEventListener('click', function() {
        // Omadi.data.setUpdating(false)
        // actualWindow.close();
    // });
    // actualWindow.add(backView);
// };




// // function process_object(json, obj, f_marks, progress, type_request, db_process_object) {
    // // var deploy = db_process_object.execute('SELECT field_name, type FROM fields WHERE bundle = "' + obj + '"');
    // // var col_titles = [];
    // // var col_type = [];
    // // var ind_column = 0;
    // // while (deploy.isValidRow()) {
        // // col_titles[ind_column] = deploy.fieldByName('field_name');
        // // col_type[ind_column] = deploy.fieldByName('type');
        // // if (deploy.fieldByName('type') == 'file') {
            // // ind_column++;
            // // col_titles[ind_column] = deploy.fieldByName('field_name') + '___fid';
            // // col_type[ind_column] = deploy.fieldByName('type');
            // // ind_column++;
            // // col_titles[ind_column] = deploy.fieldByName('field_name') + '___filename';
            // // col_type[ind_column] = deploy.fieldByName('type');
        // // }
        // // ind_column++;
        // // deploy.next();
    // // }
    // // deploy.close();
// // 
    // // var process_obj = [];
// // 
    // // //Insert
    // // if (json[obj].insert) {
// // 
        // // if (type_request == 'POST') {
            // // if (json[obj].insert.length) {
                // // Titanium.App.Properties.setString("new_node_id", json[obj].insert[0].nid);
            // // }
            // // else {
                // // Titanium.App.Properties.setString("new_node_id", json[obj].insert.nid);
            // // }
        // // }
        // // //Multiple objects
        // // if (json[obj].insert.length) {
            // // var i;
            // // for ( i = 0; i < json[obj].insert.length; i++) {
                // // if (progress != null) {
                    // // //Increments Progress Bar
                    // // progress.set();
                // // }
                // // // Original query
                // // var aux_column = ind_column;
                // // var query = "";
// // 
                // // //Insert into node table
                // // if ((json[obj].insert[i].title === null) || (json[obj].insert[i].title == 'undefined') || (json[obj].insert[i].title === false))
                    // // json[obj].insert[i].title = "No Title";
// // 
                // // //'update' is a flag to decide whether the node needs to be synced to the server or not
                // // var no_data = '';
                // // if (!(json[obj].insert[i].no_data_fields instanceof Array)) {
                    // // no_data = JSON.stringify(json[obj].insert[i].no_data_fields);
                // // }
// // 
                // // process_obj[process_obj.length] = getNodeTableInsertStatement({
                    // // nid : json[obj].insert[i].nid,
                    // // perm_edit : json[obj].insert[i].perm_edit,
                    // // perm_delete : json[obj].insert[i].perm_delete,
                    // // created : json[obj].insert[i].created,
                    // // changed : json[obj].insert[i].changed,
                    // // title : json[obj].insert[i].title.replace(/"/gi, "'"),
                    // // author_uid : json[obj].insert[i].author_uid,
                    // // flag_is_updated : 0,
                    // // table_name : obj,
                    // // form_part : json[obj].insert[i].form_part,
                    // // changed_uid : json[obj].insert[i].changed_uid,
                    // // no_data_fields : no_data,
                    // // viewed : json[obj].insert[i].viewed
                // // });
// // 
                // // //'INSERT OR REPLACE INTO node (nid , perm_edit, perm_delete, created , changed , title , author_uid , flag_is_updated, table_name, form_part, changed_uid, no_data_fields, viewed ) VALUES ( ' +
                // // //json[obj].insert[i].nid + ', '+ json[obj].insert[i].perm_edit + ', '+ json[obj].insert[i].perm_delete + ', ' +
                // // //json[obj].insert[i].created + ' , ' + json[obj].insert[i].changed + ', "' + json[obj].insert[i].title.replace(/"/gi, "'") + '" , ' +
                // // //json[obj].insert[i].author_uid + ' , 0 , "' + obj + '", ' + json[obj].insert[i].form_part + ',' + json[obj].insert[i].changed_uid + ',\'' + no_data + '\', \'' + json[obj].insert[i].viewed + '\') ';
// // 
                // // if (aux_column > 0) {
                    // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (\'nid\', ';
                // // }
                // // //This would happen only if table has no columns, shouldn't happen
                // // else {
                    // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (nid) VALUES (' + json[obj].insert[i].nid + ')';
                // // }
// // 
                // // while (aux_column > 0) {
                    // // if (aux_column == 1) {
                        // // query += ' \'' + col_titles[aux_column - 1] + '\') VALUES (' + json[obj].insert[i].nid + ', ';
                    // // }
                    // // else {
                        // // query += ' \'' + col_titles[aux_column - 1] + '\', ';
                    // // }
                    // // aux_column--;
                // // }
// // 
                // // aux_column = ind_column;
                // // var mark = '';
                // // while (aux_column > 0) {
                    // // var parse_api = col_titles[aux_column - 1];
                    // // mark = '"';
                    // // var i_index;
                    // // for (i_index in f_marks) {
                        // // if (i_index == parse_api) {
                            // // var j_index;
                            // // for (j_index in f_marks[i_index]) {
                                // // if (j_index == obj) {
                                    // // mark = '';
                                // // }
                            // // }
                        // // }
                    // // }
                    // // if (aux_column == 1) {
                        // // if ((json[obj].insert[i][parse_api] == null ) || (json[obj].insert[i][parse_api] == "undefined" )) {
                            // // query += ' null )';
                        // // }
                        // // else {
                            // // if (mark == '') {
                                // // var num_to_insert = json[obj].insert[i][parse_api];
// // 
                                // // if (isNumber(num_to_insert)) {
                                    // // query += ' ' + num_to_insert + ' )';
                                // // }
                                // // else
                                // // if ( num_to_insert instanceof Array) {
                                    // // content_s = treatArray(num_to_insert, 1);
// // 
                                    // // // table structure:
                                    // // // incremental, node_id, field_name, value
                                    // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                    // // //Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');
// // 
                                    // // // Code must to be a number since this database field accepts only integers numbers
                                    // // // Token to indentify array of numbers is 7411176117105122
                                    // // query += ' 7411317618171051229 )';
                                // // }
                                // // else {
                                    // // //Ti.API.info('Null ==> The value '+num_to_insert+' is a number? '+isNumber(num_to_insert) );
                                    // // query += ' null )';
                                // // }
                            // // }
                            // // else {
                                // // if (json[obj].insert[i][parse_api] instanceof Array) {
                                    // // if (col_type[aux_column - 1] == 'rules_field') {
                                        // // query += ' "' + JSON.stringify(json[obj].insert[i][parse_api]).replace(/"/gi, "\"\"") + '" )';
                                    // // }
                                    // // else {
                                        // // content_s = treatArray(json[obj].insert[i][parse_api], 2);
// // 
                                        // // // table structure:
                                        // // // incremental, node_id, field_name, value
                                        // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                        // // //Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');
// // 
                                        // // // Code must to be a number since this database field accepts only integers numbers
                                        // // // Token to indentify array of numbers is 7411176117105122
                                        // // query += ' ' + mark + '7411317618171051229' + mark + ' )';
// // 
                                    // // }
                                // // }
                                // // else {
                                    // // query += ' ' + mark + '' + json[obj].insert[i][parse_api].toString().replace(/"/gi, "'") + '' + mark + ' )';
                                // // }
                            // // }
                        // // }
                    // // }
                    // // else {
                        // // if ((json[obj].insert[i][parse_api] == null ) || (json[obj].insert[i][parse_api] == "undefined" )) {
                            // // query += ' null ,';
                        // // }
                        // // else {
                            // // if (mark == '') {
                                // // var num_to_insert = json[obj].insert[i][parse_api];
// // 
                                // // if (isNumber(num_to_insert)) {
                                    // // query += ' ' + num_to_insert + ' ,';
                                // // }
                                // // else
                                // // if ( num_to_insert instanceof Array) {
                                    // // //If we have only one object in array we don't need another table to help us out
                                    // // content_s = treatArray(num_to_insert, 3);
// // 
                                    // // // table structure:
                                    // // // incremental, node_id, field_name, value
                                    // // process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                    // // //Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');
// // 
                                    // // // Code must to be a number since this database field accepts only integers numbers
                                    // // // Token to indentify array of numbers is 7411176117105122
                                    // // query += ' 7411317618171051229 ,';
                                // // }
                                // // else {
                                    // // query += ' null ,';
                                // // }
                            // // }
                            // // else {
                                // // if (json[obj].insert[i][parse_api] instanceof Array) {
                                    // // if (col_type[aux_column - 1] == 'rules_field') {
                                        // // query += ' "' + JSON.stringify(json[obj].insert[i][parse_api]).replace(/"/gi, "\"\"") + '" ,';
                                    // // }
                                    // // else {
                                        // // content_s = treatArray(json[obj].insert[i][parse_api], 4);
// // 
                                        // // // table structure:
                                        // // // incremental, node_id, field_name, value
                                        // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                        // // //Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');
// // 
                                        // // // Code must to be a number since this database field accepts only integers numbers
                                        // // // Token to indentify array of numbers is 7411176117105122
                                        // // query += ' ' + mark + '7411317618171051229' + mark + ' ,';
                                    // // }
                                // // }
                                // // else {
                                    // // query += ' ' + mark + '' + json[obj].insert[i][parse_api].toString().replace(/"/gi, "'") + '' + mark + ' ,';
                                // // }
                            // // }
                        // // }
                    // // }
                    // // aux_column--;
                // // }
                // // //Inserts into object table
                // // process_obj[process_obj.length] = query;
                // // if (type_request == 'POST') {
                    // // process_obj[process_obj.length] = 'DELETE FROM ' + obj + ' WHERE nid=' + json[obj].insert[i].__negative_nid;
                    // // process_obj[process_obj.length] = 'DELETE FROM node WHERE nid=' + json[obj].insert[i].__negative_nid;
                // // }
// // 
            // // }
// // 
        // // }
        // // //Only one object
        // // else {
            // // if (progress != null) {
                // // //Increments Progress Bar
                // // progress.set();
            // // }
            // // // Original query
            // // var aux_column = ind_column;
            // // var query = "";
// // 
            // // //Insert into node table
            // // if ((json[obj].insert.title === null) || (json[obj].insert.title == 'undefined') || (json[obj].insert.title === false))
                // // json[obj].insert.title = "No Title";
// // 
            // // //'update' is a flag to decide whether the node needs to be synced to the server or not
            // // var no_data = '';
            // // if (!(json[obj].insert.no_data_fields instanceof Array)) {
                // // no_data = JSON.stringify(json[obj].insert.no_data_fields);
            // // }
// // 
            // // process_obj[process_obj.length] = getNodeTableInsertStatement({
                // // nid : json[obj].insert.nid,
                // // perm_edit : json[obj].insert.perm_edit,
                // // perm_delete : json[obj].insert.perm_delete,
                // // created : json[obj].insert.created,
                // // changed : json[obj].insert.changed,
                // // title : json[obj].insert.title,
                // // author_uid : json[obj].insert.author_uid,
                // // flag_is_updated : 0,
                // // table_name : obj,
                // // form_part : json[obj].insert.form_part,
                // // changed_uid : json[obj].insert.changed_uid,
                // // no_data_fields : no_data,
                // // viewed : json[obj].insert.viewed
            // // });
// // 
            // // //process_obj[process_obj.length] = 'INSERT OR REPLACE INTO node (nid , perm_edit, perm_delete, created , changed , title , author_uid , flag_is_updated, table_name, form_part, changed_uid, no_data_fields, viewed ) VALUES ( ' +
            // // //json[obj].insert.nid + ', ' + json[obj].insert.perm_edit + ', '+ json[obj].insert.perm_delete + ', '+ json[obj].insert.created + ' , ' +
            // // //json[obj].insert.changed + ', "' + json[obj].insert.title.replace(/"/gi, "'") + '" , ' +
            // // //json[obj].insert.author_uid + ' , 0 , "' + obj + '", ' + json[obj].insert.form_part + ',' + json[obj].insert.changed_uid + ',\'' +
            // // //no_data + '\', \'' + json[obj].insert.viewed + '\') ';
// // 
            // // if (aux_column > 0) {
                // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (\'nid\', ';
            // // }
            // // //This would happen only if table has no columns, shouldn't happen
            // // else {
                // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (nid) VALUES (' + json[obj].insert.nid + ')';
            // // }
// // 
            // // while (aux_column > 0) {
                // // if (aux_column == 1) {
                    // // query += ' \'' + col_titles[aux_column - 1] + '\') VALUES (' + json[obj].insert.nid + ', ';
                // // }
                // // else {
                    // // query += ' \'' + col_titles[aux_column - 1] + '\', ';
                // // }
                // // aux_column--;
            // // }
// // 
            // // aux_column = ind_column;
            // // var mark = '';
            // // while (aux_column > 0) {
                // // var parse_api = col_titles[aux_column - 1];
                // // mark = '"';
                // // var i_index;
                // // for (i_index in f_marks) {
                    // // if (i_index == parse_api) {
                        // // var j_index;
                        // // for (j_index in f_marks[i_index]) {
                            // // if (j_index == obj) {
                                // // mark = '';
                            // // }
                        // // }
                    // // }
                // // }
                // // if (aux_column == 1) {
                    // // if ((json[obj].insert[parse_api] == null ) || (json[obj].insert[parse_api] == "undefined" )) {
                        // // query += ' null )';
                    // // }
                    // // else {
                        // // if (mark == '') {
                            // // var num_to_insert = json[obj].insert[parse_api];
// // 
                            // // if (isNumber(num_to_insert)) {
                                // // query += ' ' + num_to_insert + ' )';
                            // // }
                            // // else
                            // // if ( num_to_insert instanceof Array) {
                                // // content_s = treatArray(num_to_insert, 1);
// // 
                                // // // table structure:
                                // // // incremental, node_id, field_name, value
                                // // process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                // // //Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert.nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');
// // 
                                // // // Code must to be a number since this database field accepts only integers numbers
                                // // // Token to indentify array of numbers is 7411176117105122
                                // // query += ' 7411317618171051229 )';
                            // // }
                            // // else {
                                // // //Ti.API.info('Null ==> The value '+num_to_insert+' is a number? '+isNumber(num_to_insert) );
                                // // query += ' null )';
                            // // }
                        // // }
                        // // else {
                            // // if (json[obj].insert[parse_api] instanceof Array) {
                                // // if (col_type[aux_column - 1] == 'rules_field') {
                                    // // query += ' "' + JSON.stringify(json[obj].insert[parse_api]).replace(/"/gi, "\"\"") + '" )';
                                // // }
                                // // else {
                                    // // content_s = treatArray(json[obj].insert[parse_api], 2);
// // 
                                    // // // table structure:
                                    // // // incremental, node_id, field_name, value
                                    // // process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                    // // // Code must to be a number since this database field accepts only integers numbers
                                    // // // Token to indentify array of numbers is 7411176117105122
                                    // // query += ' ' + mark + '7411317618171051229' + mark + ' )';
                                // // }
                            // // }
                            // // else {
                                // // query += ' ' + mark + '' + json[obj].insert[parse_api].toString().replace(/"/gi, "'") + '' + mark + ' )';
                            // // }
                        // // }
                    // // }
                // // }
                // // else {
                    // // if ((json[obj].insert[parse_api] == null ) || (json[obj].insert[parse_api] == "undefined" )) {
                        // // query += ' null ,';
                    // // }
                    // // else {
                        // // if (mark == '') {
                            // // var num_to_insert = json[obj].insert[parse_api];
// // 
                            // // if (isNumber(num_to_insert)) {
                                // // query += ' ' + num_to_insert + ' ,';
                            // // }
                            // // else
                            // // if ( num_to_insert instanceof Array) {
                                // // content_s = treatArray(num_to_insert, 3);
// // 
                                // // // table structure:
                                // // // incremental, node_id, field_name, value
                                // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                // // //Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert.nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');
// // 
                                // // // Code must to be a number since this database field accepts only integers numbers
                                // // // Token to indentify array of numbers is 7411176117105122
                                // // query += ' 7411317618171051229 ,';
                            // // }
                            // // else {
                                // // query += ' null ,';
                            // // }
                        // // }
                        // // else {
                            // // if (json[obj].insert[parse_api] instanceof Array) {
                                // // if (col_type[aux_column - 1] == 'rules_field') {
                                    // // query += ' "' + JSON.stringify(json[obj].insert[parse_api]).replace(/"/gi, "\"\"") + '" ,';
                                // // }
                                // // else {
// // 
                                    // // content_s = treatArray(json[obj].insert[parse_api], 4);
// // 
                                    // // // table structure:
                                    // // // incremental, node_id, field_name, value
                                    // // process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                    // // //Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert.nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');
// // 
                                    // // // Code must to be a number since this database field accepts only integers numbers
                                    // // // Token to indentify array of numbers is 7411176117105122
                                    // // query += ' ' + mark + '7411317618171051229' + mark + ' ,';
                                // // }
                            // // }
                            // // else {
                                // // query += ' ' + mark + '' + json[obj].insert[parse_api].toString().replace(/"/gi, "'") + '' + mark + ' ,';
                            // // }
                        // // }
                    // // }
                // // }
                // // aux_column--;
            // // }
            // // //Inserts into object table
            // // process_obj[process_obj.length] = query;
            // // if (type_request == 'POST') {
                // // process_obj[process_obj.length] = 'DELETE FROM ' + obj + ' WHERE nid=' + json[obj].insert.__negative_nid;
                // // process_obj[process_obj.length] = 'DELETE FROM node WHERE nid=' + json[obj].insert.__negative_nid;
            // // }
        // // }
        // // //Ti.API.info("Inserted object [" + obj + "] sucefully!");
    // // }
// // 
    // // //Update Object
    // // //We use 'insert or replace' for updates in order to reuse the logic for inserts
    // // //If an updated field doesn't exists, the app is gonna create it avoiding errors returns
    // // //It will never freezes if a field that needs update isn't found in the database yet
// // 
    // // if (json[obj].update) {
        // // if (json[obj].update.length) {
            // // var i;
            // // for ( i = 0; i < json[obj].update.length; i++) {
                // // if (progress != null) {
                    // // //Increments Progress Bar
                    // // progress.set();
                // // }
                // // // Original query
                // // var aux_column = ind_column;
                // // var query = "";
// // 
                // // //Insert into node table
                // // if ((json[obj].update[i].title === null) || (json[obj].update[i].title == 'undefined') || (json[obj].update[i].title === false))
                    // // json[obj].update[i].title = "No Title";
// // 
                // // var no_data = '';
                // // if (!(json[obj].update[i].no_data_fields instanceof Array)) {
                    // // no_data = JSON.stringify(json[obj].update[i].no_data_fields);
                // // }
                // // //'update' is a flag to decide whether the node needs to be synced to the server or not
// // 
                // // process_obj[process_obj.length] = getNodeTableInsertStatement({
                    // // nid : json[obj].update[i].nid,
                    // // perm_edit : json[obj].update[i].perm_edit,
                    // // perm_delete : json[obj].update[i].perm_delete,
                    // // created : json[obj].update[i].created,
                    // // changed : json[obj].update[i].changed,
                    // // title : json[obj].update[i].title,
                    // // author_uid : json[obj].update[i].author_uid,
                    // // flag_is_updated : 0,
                    // // table_name : obj,
                    // // form_part : json[obj].update[i].form_part,
                    // // changed_uid : json[obj].update[i].changed_uid,
                    // // no_data_fields : no_data,
                    // // viewed : json[obj].update[i].viewed
                // // });
// // 
                // // //process_obj[process_obj.length] = 'INSERT OR REPLACE INTO node (nid , perm_edit, perm_delete, created , changed , title , author_uid ,
                // // //bj].update[i].form_part + ', ' + json[obj].update[i].changed_uid + ',\'' + no_data + '\') ';
// // 
                // // if (aux_column > 0) {
                    // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (\'nid\', ';
                // // }
                // // //This would happen only if table has no columns, shouldn't happen
                // // else {
                    // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (nid) VALUES (' + json[obj].update[i].nid + ')';
                // // }
// // 
                // // while (aux_column > 0) {
                    // // if (aux_column == 1) {
                        // // query += ' \'' + col_titles[aux_column - 1] + '\') VALUES (' + json[obj].update[i].nid + ', ';
                    // // }
                    // // else {
                        // // query += ' \'' + col_titles[aux_column - 1] + '\', ';
                    // // }
                    // // aux_column--;
                // // }
// // 
                // // aux_column = ind_column;
                // // var mark = '';
                // // while (aux_column > 0) {
                    // // var parse_api = col_titles[aux_column - 1];
                    // // mark = '"';
                    // // var i_index;
                    // // for (i_index in f_marks) {
                        // // if (i_index == parse_api) {
                            // // var j_index;
                            // // for (j_index in f_marks[i_index]) {
                                // // if (j_index == obj) {
                                    // // mark = '';
                                // // }
                            // // }
                        // // }
                    // // }
                    // // if (aux_column == 1) {
                        // // if ((json[obj].update[i][parse_api] == null ) || (json[obj].update[i][parse_api] == "undefined" )) {
                            // // query += ' null )';
                        // // }
                        // // else {
                            // // if (mark == '') {
                                // // var num_to_insert = json[obj].update[i][parse_api];
// // 
                                // // if (isNumber(num_to_insert)) {
                                    // // query += ' ' + num_to_insert + ' )';
                                // // }
                                // // else
                                // // if ( num_to_insert instanceof Array) {
                                    // // content_s = treatArray(num_to_insert, 1);
// // 
                                    // // var array_cont = db_process_object.execute('SELECT * FROM array_base WHERE node_id = ' + json[obj].update[i].nid + ' AND field_name=\'' + col_titles[aux_column - 1] + '\'');
                                    // // if ((array_cont.rowCount > 0) || (array_cont.isValidRow())) {
                                        // // // table structure:
                                        // // // incremental, node_id, field_name, value
                                        // // process_obj[process_obj.length] = 'UPDATE array_base SET encoded_array = \'' + content_s + '\' WHERE node_id=' + json[obj].update[i].nid + ' AND field_name=\'' + col_titles[aux_column - 1] + '\' ';
// // 
                                        // // // Code must to be a number since this database field accepts only integers numbers
                                        // // // Token to indentify array of numbers is 7411176117105122
                                        // // query += ' 7411317618171051229 )';
                                    // // }
                                    // // else {
                                        // // // table structure:
                                        // // // incremental, node_id, field_name, value
                                        // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                        // // // Code must to be a number since this database field accepts only integers numbers
                                        // // // Token to indentify array of numbers is 7411176117105122
                                        // // query += ' 7411317618171051229 )';
                                    // // }
// // 
                                    // // array_cont.close();
                                // // }
                                // // else {
                                    // // Ti.API.info('Null ==> The value ' + num_to_insert + ' is a number? ' + isNumber(num_to_insert));
                                    // // query += ' null )';
                                // // }
                            // // }
                            // // else {
                                // // if (json[obj].update[i][parse_api] instanceof Array) {
                                    // // if (col_type[aux_column - 1] == 'rules_field') {
                                        // // query += ' "' + JSON.stringify(json[obj].update[i][parse_api]).replace(/"/gi, "\"\"") + '" )';
                                    // // }
                                    // // else {
                                        // // content_s = treatArray(json[obj].update[i][parse_api], 2);
                                        // // var array_cont = db_process_object.execute('SELECT * FROM array_base WHERE node_id = ' + json[obj].update[i].nid + ' AND field_name="' + col_titles[aux_column - 1] + '"');
                                        // // if ((array_cont.rowCount > 0) || (array_cont.isValidRow())) {
                                            // // // table structure:
                                            // // // incremental, node_id, field_name, value
                                            // // process_obj[process_obj.length] = 'UPDATE array_base SET encoded_array = \'' + content_s + '\' WHERE node_id=' + json[obj].update[i].nid + ' AND field_name=\'' + col_titles[aux_column - 1] + '\' ';
// // 
                                            // // // Code must to be a number since this database field accepts only integers numbers
                                            // // // Token to indentify array of numbers is 7411176117105122
                                            // // query += ' ' + mark + '7411317618171051229' + mark + ' )';
                                        // // }
                                        // // else {
                                            // // // table structure:
                                            // // // incremental, node_id, field_name, value
                                            // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                            // // // Code must to be a number since this database field accepts only integers numbers
                                            // // // Token to indentify array of numbers is 7411176117105122
                                            // // query += ' ' + mark + '7411317618171051229' + mark + ' )';
                                        // // }
                                        // // array_cont.close();
                                    // // }
                                // // }
                                // // else {
                                    // // query += ' ' + mark + '' + json[obj].update[i][parse_api].toString().replace(/"/gi, "'") + '' + mark + ' )';
                                // // }
                            // // }
                        // // }
                    // // }
                    // // else {
                        // // if ((json[obj].update[i][parse_api] == null ) || (json[obj].update[i][parse_api] == "undefined" )) {
                            // // query += ' null ,';
                        // // }
                        // // else {
                            // // if (mark == '') {
                                // // var num_to_insert = json[obj].update[i][parse_api];
// // 
                                // // if (isNumber(num_to_insert)) {
                                    // // query += ' ' + num_to_insert + ' ,';
                                // // }
                                // // else
                                // // if ( num_to_insert instanceof Array) {
                                    // // content_s = treatArray(num_to_insert, 3);
// // 
                                    // // var array_cont = db_process_object.execute('SELECT * FROM array_base WHERE node_id = ' + json[obj].update[i].nid + ' AND field_name="' + col_titles[aux_column - 1] + '"');
                                    // // if ((array_cont.rowCount > 0) || (array_cont.isValidRow())) {
                                        // // // table structure:
                                        // // // incremental, node_id, field_name, value
                                        // // process_obj[process_obj.length] = 'UPDATE array_base SET encoded_array = \'' + content_s + '\' WHERE node_id=' + json[obj].update[i].nid + ' AND field_name=\'' + col_titles[aux_column - 1] + '\' ';
// // 
                                        // // // Code must to be a number since this database field accepts only integers numbers
                                        // // // Token to indentify array of numbers is 7411176117105122
                                        // // query += ' 7411317618171051229 ,';
                                    // // }
                                    // // else {
                                        // // // table structure:
                                        // // // incremental, node_id, field_name, value
                                        // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                        // // // Code must to be a number since this database field accepts only integers numbers
                                        // // // Token to indentify array of numbers is 7411176117105122
                                        // // query += ' 7411317618171051229 ,';
                                    // // }
                                    // // array_cont.close();
                                // // }
                                // // else {
                                    // // query += ' null ,';
                                // // }
                            // // }
                            // // else {
                                // // if (json[obj].update[i][parse_api] instanceof Array) {
                                    // // if (col_type[aux_column - 1] == 'rules_field') {
                                        // // query += ' "' + JSON.stringify(json[obj].update[i][parse_api]).replace(/"/gi, "\"\"") + '" ,';
                                    // // }
                                    // // else {
                                        // // content_s = treatArray(json[obj].update[i][parse_api], 4);
// // 
                                        // // var array_cont = db_process_object.execute('SELECT * FROM array_base WHERE node_id = ' + json[obj].update[i].nid + ' AND field_name="' + col_titles[aux_column - 1] + '"');
                                        // // if ((array_cont.rowCount > 0) || (array_cont.isValidRow())) {
// // 
                                            // // // table structure:
                                            // // // incremental, node_id, field_name, value
                                            // // process_obj[process_obj.length] = 'UPDATE array_base SET encoded_array = \'' + content_s + '\' WHERE node_id=' + json[obj].update[i].nid + ' AND field_name=\'' + col_titles[aux_column - 1] + '\' ';
// // 
                                            // // // Code must to be a number since this database field accepts only integers numbers
                                            // // // Token to indentify array of numbers is 7411176117105122
                                            // // query += ' ' + mark + '7411317618171051229' + mark + ' ,';
                                        // // }
                                        // // else {
                                            // // // table structure:
                                            // // // incremental, node_id, field_name, value
                                            // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                            // // // Code must to be a number since this database field accepts only integers numbers
                                            // // // Token to indentify array of numbers is 7411176117105122
                                            // // query += ' ' + mark + '7411317618171051229' + mark + ' ,';
                                        // // }
                                        // // array_cont.close();
                                    // // }
                                // // }
                                // // else {
                                    // // query += ' ' + mark + '' + json[obj].update[i][parse_api].toString().replace(/"/gi, "'") + '' + mark + ' ,';
                                // // }
                            // // }
                        // // }
                    // // }
                    // // aux_column--;
                // // }
                // // //Inserts into object table
                // // process_obj[process_obj.length] = query;
            // // }
        // // }
        // // //Only one object
        // // else {
            // // if (progress != null) {
                // // //Increments Progress Bar
                // // progress.set();
            // // }
            // // // Original query
            // // var aux_column = ind_column;
            // // var query = "";
            // // //Insert into node table
            // // if ((json[obj].update.title === null) || (json[obj].update.title == 'undefined') || (json[obj].update.title === false))
                // // json[obj].update.title = "No Title";
// // 
            // // var no_data = '';
            // // if (!(json[obj].update.no_data_fields instanceof Array)) {
                // // no_data = JSON.stringify(json[obj].update.no_data_fields);
            // // }
            // // //'update' is a flag to decide whether the node needs to be synced to the server or not
            // // process_obj[process_obj.length] = getNodeTableInsertStatement({
                // // nid : json[obj].update.nid,
                // // perm_edit : json[obj].update.perm_edit,
                // // perm_delete : json[obj].update.perm_delete,
                // // created : json[obj].update.created,
                // // changed : json[obj].update.changed,
                // // title : json[obj].update.title,
                // // author_uid : json[obj].update.author_uid,
                // // flag_is_updated : 0,
                // // table_name : obj,
                // // form_part : json[obj].update.form_part,
                // // changed_uid : json[obj].update.changed_uid,
                // // no_data_fields : no_data,
                // // viewed : json[obj].update.viewed
            // // });
// // 
            // // //process_obj[process_obj.length] = 'INSERT OR REPLACE INTO node (nid , perm_edit, perm_delete, created , changed , title ,
            // // // author_uid , flag_is_updated, table_name, form_part, changed_uid, no_data_fields ) VALUES ( ' +
            // // // json[obj].update.nid + ', ' + json[obj].update.perm_edit + ', '+ json[obj].update.perm_delete + ', '+
            // // // json[obj].update.created + ' , ' + json[obj].update.changed + ', "' + json[obj].update.title.replace(/"/gi, "'") + '" , ' +
            // // // json[obj].update.author_uid + ' , 0 , "' + obj + '", ' + json[obj].update.form_part + ', ' + json[obj].update.changed_uid + ',\'' +
            // // // no_data + '\') ';
// // 
            // // if (aux_column > 0) {
                // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (\'nid\', ';
            // // }
            // // //This would happen only if table has no columns, shouldn't happen
            // // else {
                // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (nid) VALUES (' + json[obj].update.nid + ')';
            // // }
// // 
            // // while (aux_column > 0) {
                // // if (aux_column == 1) {
                    // // query += ' \'' + col_titles[aux_column - 1] + '\') VALUES (' + json[obj].update.nid + ', ';
                // // }
                // // else {
                    // // query += ' \'' + col_titles[aux_column - 1] + '\', ';
                // // }
                // // aux_column--;
            // // }
// // 
            // // aux_column = ind_column;
            // // var mark = '';
            // // while (aux_column > 0) {
                // // var parse_api = col_titles[aux_column - 1];
                // // mark = '"';
                // // var i_index;
                // // for (i_index in f_marks) {
                    // // if (i_index == parse_api) {
                        // // var j_index;
                        // // for (j_index in f_marks[i_index]) {
                            // // if (j_index == obj) {
                                // // mark = '';
                            // // }
                        // // }
                    // // }
                // // }
                // // if (aux_column == 1) {
                    // // if ((json[obj].update[parse_api] == null ) || (json[obj].update[parse_api] == "undefined" )) {
                        // // query += ' null )';
                    // // }
                    // // else {
                        // // if (mark == '') {
                            // // var num_to_insert = json[obj].update[parse_api];
// // 
                            // // if (isNumber(num_to_insert)) {
                                // // query += ' ' + num_to_insert + ' )';
                            // // }
                            // // else
                            // // if ( num_to_insert instanceof Array) {
                                // // content_s = treatArray(num_to_insert, 1);
// // 
                                // // // table structure:
                                // // // incremental, node_id, field_name, value
                                // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                // // // Code must to be a number since this database field accepts only integers numbers
                                // // // Token to indentify array of numbers is 7411176117105122
                                // // query += ' 7411317618171051229 )';
// // 
                            // // }
                            // // else {
                                // // Ti.API.info('Null ==> The value ' + num_to_insert + ' is a number? ' + isNumber(num_to_insert));
                                // // query += ' null )';
                            // // }
                        // // }
                        // // else {
                            // // if (json[obj].update[parse_api] instanceof Array) {
                                // // if (col_type[aux_column - 1] == 'rules_field') {
                                    // // query += ' "' + JSON.stringify(json[obj].update[parse_api]).replace(/"/gi, "\"\"") + '" )';
                                // // }
                                // // else {
                                    // // content_s = treatArray(json[obj].update[parse_api], 2);
// // 
                                    // // // table structure:
                                    // // // incremental, node_id, field_name, value
                                    // // process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                    // // // Code must to be a number since this database field accepts only integers numbers
                                    // // // Token to indentify array of numbers is 7411176117105122
                                    // // query += ' ' + mark + '7411317618171051229' + mark + ' )';
                                // // }
                            // // }
                            // // else {
                                // // query += ' ' + mark + '' + json[obj].update[parse_api].toString().replace(/"/gi, "'") + '' + mark + ' )';
                            // // }
                        // // }
                    // // }
                // // }
                // // else {
                    // // if ((json[obj].update[parse_api] == null ) || (json[obj].update[parse_api] == "undefined" )) {
                        // // query += ' null ,';
                    // // }
                    // // else {
                        // // if (mark == '') {
                            // // var num_to_insert = json[obj].update[parse_api];
// // 
                            // // if (isNumber(num_to_insert)) {
                                // // query += ' ' + num_to_insert + ' ,';
                            // // }
                            // // else
                            // // if ( num_to_insert instanceof Array) {
                                // // content_s = treatArray(num_to_insert, 3);
// // 
                                // // // table structure:
                                // // // incremental, node_id, field_name, value
                                // // process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                // // // Code must to be a number since this database field accepts only integers numbers
                                // // // Token to indentify array of numbers is 7411176117105122
                                // // query += ' 7411317618171051229 ,';
                            // // }
                            // // else {
                                // // query += ' null ,';
                            // // }
                        // // }
                        // // else {
                            // // if (json[obj].update[parse_api] instanceof Array) {
                                // // if (col_type[aux_column - 1] == 'rules_field') {
                                    // // query += ' "' + JSON.stringify(json[obj].update[parse_api]).replace(/"/gi, "\"\"") + '" ,';
                                // // }
                                // // else {
                                    // // content_s = treatArray(json[obj].update[parse_api], 4);
// // 
                                    // // // table structure:
                                    // // // incremental, node_id, field_name, value
                                    // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                    // // // Code must to be a number since this database field accepts only integers numbers
                                    // // // Token to indentify array of numbers is 7411176117105122
                                    // // query += ' ' + mark + '7411317618171051229' + mark + ' ,';
                                // // }
                            // // }
                            // // else {
                                // // query += ' ' + mark + '' + json[obj].update[parse_api].toString().replace(/"/gi, "'") + '' + mark + ' ,';
                            // // }
                        // // }
                    // // }
                // // }
                // // aux_column--;
            // // }
            // // //Inserts into object table
            // // process_obj[process_obj.length] = query;
        // // }
        // // //Ti.API.info("Updated object [" + obj + "] sucefully!");
    // // }
// // 
    // // //Delete
    // // if (json[obj]["delete"]) {
        // // if (json[obj]["delete"].length) {
            // // var i;
            // // for ( i = 0; i < json[obj]["delete"].length; i++) {
                // // if (progress != null) {
                    // // //Increments Progress Bar
                    // // progress.set();
                // // }
                // // //Deletes from object's table
                // // process_obj[process_obj.length] = 'DELETE FROM ' + obj + ' WHERE "nid"=' + json[obj]["delete"][i].nid;
                // // //Deletes from node table
                // // process_obj[process_obj.length] = 'DELETE FROM node WHERE "nid"=' + json[obj]["delete"][i].nid;
            // // }
        // // }
        // // else {
            // // if (progress != null) {
                // // //Increments Progress Bar
                // // progress.set();
            // // }
            // // //Deletes from object's table
            // // process_obj[process_obj.length] = 'DELETE FROM ' + obj + ' WHERE "nid"=' + json[obj]["delete"].nid;
// // 
            // // //Deletes from node table
            // // process_obj[process_obj.length] = 'DELETE FROM node WHERE "nid"=' + json[obj]["delete"].nid;
        // // }
        // // //Ti.API.info("Deleted object [" + obj + "] sucefully!");
    // // }
// // 
    // // //Ti.API.info('########## CRITICAL STEP ##########');
// // 
    // // var iObj = 0;
    // // var iStart = Math.round(new Date().getTime() / 1000);
    // // Ti.API.info("Objects started at : " + iStart);
// // 
    // // db_process_object.execute("BEGIN IMMEDIATE TRANSACTION");
    // // while (iObj <= process_obj.length - 1) {
        // // db_process_object.execute(process_obj[iObj]);
        // // iObj++;
    // // }
    // // db_process_object.execute("COMMIT TRANSACTION");
// // 
    // // var iEnd = Math.round(new Date().getTime() / 1000);
    // // Ti.API.info("Object finishes at : " + iEnd);
// // 
    // // var iResult = iEnd - iStart;
    // // Ti.API.info('Object seconds: ' + iResult);
    // // //db_process_object.close();
    // // return;
// // }
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
// 
// 
// 
// 
// 
// 
// 
// 
// 
 // if (json.node_type) {
        // var node_db = [];
        // //Node type inserts
        // if (json.node_type.insert) {
            // //Multiple nodes inserts
            // if (json.node_type.insert.length) {
                // var i;
                // for ( i = 0; i < json.node_type.insert.length; i++) {
                    // var type = json.node_type.insert[i].type;
//                     
                    // if (type != 'user') {
                        // //Increment the progress bar
                        // if (progress != null) {
                            // progress.set();
                        // }
                        // node_db[node_db.length] = "CREATE TABLE " + type + " ('nid' INTEGER PRIMARY KEY NOT NULL UNIQUE )";
// 
//                    
                        // var title_fields = json.node_type.insert[i].data.title_fields;
                        // var title_fields_string = JSON.stringify(title_fields);
//                         
                        // var data = json.node_type.insert[i].data;
                        // var data_string = JSON.stringify(data);
//                         
                         // //Add it to the main screen
                        // var display = json.node_type.insert[i].name.toUpperCase();//n_bund.fieldByName("display_name").toUpperCase();
                        // var description = json.node_type.insert[i].description;//n_bund.fieldByName("description");
                        // var flag_display = true;//n_bund.fieldByName("display_on_menu");
                        // //var id = n_bund.fieldByName("bid");
                        // var display_on_menu = false;
//                         
//                         
                        // var disabled = json.node_type.insert[i].disabled;
                        // var is_disabled = (disabled == 1 ? true : false); //n_bund.fieldByName("disabled");
                        // //var _nd = n_bund.fieldByName("_data");
                        // var show_plus = false;
                        // var app_permissions = {
                            // can_create : false,
                            // can_update : false,
                            // all_permissions : false,
                            // can_view : false
                        // }
//     
                        // //var node_type_json = JSON.parse(_nd);
//     
                        // if (data.no_mobile_display != null && data.no_mobile_display == 1) {
                            // //n_bund.next();
                            // //continue;
                            // is_disabled = true;
                        // }
//                         
                        // var user = Ti.App.Properties.getObject("user", {});
                        // var roles = user.roles;
//                         
                        // if (roles.hasOwnProperty(ROLE_ID_ADMIN)) {
                            // show_plus = true;
                            // app_permissions.can_create = true;
                            // app_permissions.all_permissions = true;
                            // app_permissions.can_update = true;
                            // app_permissions.can_view = true;
//     
                        // }
                        // else {
                            // var _l;
                            // for (_l in data.permissions) {
                                // for (_k in roles) {
                                    // if (_l == _k) {
                                        // var stringifyObj = JSON.stringify(data.permissions[_l]);
                                        // if (data.permissions[_l]["can create"] || data.permissions[_l]["all_permissions"]) {
                                            // show_plus = true;
                                            // app_permissions.can_create = true;
                                        // }
//     
                                        // if (data.permissions[_l]["all_permissions"]) {
                                            // app_permissions.all_permissions = true;
                                            // app_permissions.can_update = true;
                                            // app_permissions.can_view = true;
                                            // continue;
                                        // }
//     
                                        // if (stringifyObj.indexOf('update') >= 0 || data.permissions[_l]["all_permissions"]) {
                                            // app_permissions.can_update = true;
                                        // }
//     
                                        // if (stringifyObj.indexOf('view') >= 0 || data.permissions[_l]["all_permissions"]) {
                                            // app_permissions.can_view = true;
                                        // }
//     
                                    // }
                                // }
                            // }
                        // }
//                         
                        // if(!is_disabled && (app_permissions.can_view || app_permissions.can_create)){
                            // display_on_menu = true;
                        // }
//                         
                        // // if ((_is_disabled != 1 && _is_disabled != "1" && _is_disabled != "true" && _is_disabled != true)) {
// //                 
                            // // if (app_permissions.can_view || app_permissions.can_create) {
                                // // display_on_menu = true;
                            // // }
//     
                            // // var row_a = Ti.UI.createTableViewRow({
                                // // height : "40dp",
                                // // name : display,
                                // // display : display,
                                // // desc : description,
                                // // name_table : name_table,
                                // // show_plus : show_plus,
                                // // app_permissions : app_permissions,
                                // // className : 'menu_row', // this is to optimize the rendering
                                // // selectionStyle : app_permissions.can_view ? 1 : 0,
                                // // backgroundSelectedColor : app_permissions.can_view ? '#BDBDBD' : '#00000000'
                            // // });
// //                 
                            // // var icon = Titanium.UI.createImageView({
                                // // width : "32dp",
                                // // height : "32dp",
                                // // top : "6dp",
                                // // left : "5dp",
                                // // desc : description,
                                // // image : '/images/icons/' + name_table.toLowerCase() + '.png',
                            // // });
// //                 
                            // // if (icon.toBlob() == null || icon.toBlob().length == 0) {
                                // // icon.image = '/images/icons/settings.png';
                            // // }
// //                 
                            // // var title_a = Titanium.UI.createLabel({
                                // // text : display,
                                // // font : {
                                    // // fontSize : "20dp"
                                // // },
                                // // width : '82%',
                                // // textAlign : 'left',
                                // // left : "42dp",
                                // // height : 'auto',
                                // // desc : description,
                                // // color : '#000'
                            // // });
// //                 
                            // // var plus_a = Titanium.UI.createButton({
                                // // backgroundImage : '/images/plus_btn.png',
                                // // backgroundSelectedImage : '/images/plus_btn_selected.png',
                                // // width : "54dp",
                                // // height : "38dp",
                                // // right : "1dp",
                                // // is_plus : true
                            // // });
                            // // if (show_plus === false) {
                                // // plus_a.hide();
                            // // }
// //                 
                            // // row_a.add(icon);
                            // // row_a.add(title_a);
                            // // row_a.add(plus_a);
// //                 
                            // // if (PLATFORM == 'android') {
                                // // row_a.addEventListener('longclick', function(e) {
                                    // // if (e.source.desc != null && e.source.desc != "") {
                                        // // alert(e.source.desc)
                                    // // }
                                // // });
                            // // }
                            // // else {
                                // // row_a.addEventListener('longpress', function(e) {
                                    // // if (e.source.desc != null && e.source.desc != "") {
                                        // // alert(e.source.desc)
                                    // // }
                                // // });
                            // // }
//     
                            // //menu.appendRow(row_a);
                            // // data_rows.push(row_a);
                            // // data_rows.sort(sortTableView);
                            // // menu.setData(data_rows);
                            // //db_installMe.execute('UPDATE bundles SET display_on_menu =\'true\' WHERE bid=' + id);
                       // //}                                    
//                         
//                         
                        // node_db[node_db.length] = "INSERT OR REPLACE INTO bundles (bundle_name, display_name, description, title_fields, _data , disabled, display_on_menu) VALUES ('" + type + "', '" + display + "' , '" + description + "', '" + title_fields_string + "', '" + data_string + "', '" + disabled + "', '" + display_on_menu + "' )";
                        // //Ti.API.info('Node type : ' + json.node_type.insert[i].type + ' has been created');
                        // //Ti.API.info("DISABLED ? " + json.node_type.insert[i].disabled);
                    // }
                // }
            // }
            // //Unique node insert
            // // else {
                // // if (json.node_type.insert.type != 'user') {
                    // // if (progress != null) {
                        // // progress.set();
                    // // }
                    // // node_db[node_db.length] = "CREATE TABLE " + json.node_type.insert.type + " ('nid' INTEGER PRIMARY KEY NOT NULL  UNIQUE )";
// // 
                    // // var get_title = JSON.stringify(json.node_type.insert.data.title_fields);
                    // // var _get_data = JSON.stringify(json.node_type.insert.data);
// // 
                    // // node_db[node_db.length] = "INSERT OR REPLACE INTO bundles (bundle_name, display_name, description, title_fields, _data  , disabled) VALUES ('" + json.node_type.insert.type + "', '" + json.node_type.insert.name + "' , '" + json.node_type.insert.description + "' , '" + get_title + "', '" + _get_data + "',  '" + json.node_type.insert.disabled + "' )";
                    // // Ti.API.info('Node type : ' + json.node_type.insert.type + ' has been created');
                    // // Ti.API.info("DISABLED ? " + json.node_type.insert.disabled);
                // // }
            // // }
        // }
// 
        // // //Doesn't make sense to update it at this moment because we create an empty table
        // // //The only thing to consideer is deletion.
        // // //Node type updates - Not implemented yet (API's side)
        // // else
        // // if (json.node_type.update) {
            // // //Multiple nodes updates
// // 
            // // if (json.node_type.update.length) {
                // // var data_rows = [];
                // // var i;
                // // for ( i = 0; i < json.node_type.update.length; i++) {
                    // // //Increment the progress bar
                    // // if (progress != null) {
                        // // progress.set();
                    // // }
// // 
                    // // var get_title = JSON.stringify(json.node_type.update[i].data.title_fields);
// // 
                    // // var _get_data = JSON.stringify(json.node_type.update[i].data);
                    // // var node_type_json = json.node_type.update[i].data;
                    // // var no_mob_display = true;
// // 
                    // // if ((node_type_json.no_mobile_display != null && (node_type_json.no_mobile_display == 1 || node_type_json.no_mobile_display == '1')) || json.node_type.update[i].disabled == 1 || json.node_type.update[i].disabled == '1' || json.node_type.update[i].disabled == 'true' || json.node_type.update[i].disabled == true) {
                        // // no_mob_display = false;
                    // // }
// // 
                    // // db_installMe.execute("UPDATE bundles SET bundle_name='" + json.node_type.update[i].type + "', display_on_menu='" + no_mob_display + "', display_name='" + json.node_type.update[i].name + "', description='" + json.node_type.update[i].description + "', title_fields='" + get_title + "', _data='" + _get_data + "', disabled='" + json.node_type.update[i].disabled + "' WHERE bundle_name='" + json.node_type.update[i].type + "'");
// // 
                    // // var n_bund = db_installMe.execute('SELECT * FROM bundles');
                    // // data_rows = new Array();
                    // // while (n_bund.isValidRow()) {
                        // // var name_table = n_bund.fieldByName("bundle_name");
                        // // var display = n_bund.fieldByName("display_name").toUpperCase();
                        // // var description = n_bund.fieldByName("description");
                        // // var flag_display = n_bund.fieldByName("display_on_menu");
                        // // var _is_disabled = n_bund.fieldByName("disabled");
                        // // var _nd = n_bund.fieldByName("_data");
                        // // var show_plus = false;
                        // // var app_permissions = {
                            // // "can_create" : false,
                            // // "can_update" : false,
                            // // "all_permissions" : false,
                            // // "can_view" : false
                        // // }
// // 
                        // // var node_type_json = JSON.parse(_nd);
// // 
                        // // if (node_type_json.no_mobile_display != null && node_type_json.no_mobile_display == 1 && node_type_json.no_mobile_display == '1') {
                            // // n_bund.next();
                            // // continue;
                        // // }
// // 
                        // // if (roles.hasOwnProperty(ROLE_ID_ADMIN)) {
                            // // show_plus = true;
                            // // app_permissions.can_create = true;
                            // // app_permissions.all_permissions = true;
                            // // app_permissions.can_update = true;
                            // // app_permissions.can_view = true;
// // 
                        // // }
                        // // else {
                            // // var _l;
                            // // for (_l in node_type_json.permissions) {
                                // // for (_k in roles) {
                                    // // if (_l == _k) {
                                        // // var stringifyObj = JSON.stringify(node_type_json.permissions[_l]);
                                        // // if (node_type_json.permissions[_l]["can create"] || node_type_json.permissions[_l]["all_permissions"]) {
                                            // // show_plus = true;
                                            // // app_permissions.can_create = true;
                                        // // }
// // 
                                        // // if (node_type_json.permissions[_l]["all_permissions"]) {
                                            // // app_permissions.all_permissions = true;
                                            // // app_permissions.can_update = true;
                                            // // app_permissions.can_view = true;
                                            // // continue;
                                        // // }
// // 
                                        // // if (stringifyObj.indexOf('update') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
                                            // // app_permissions.can_update = true;
                                        // // }
// // 
                                        // // if (stringifyObj.indexOf('view') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
                                            // // app_permissions.can_view = true;
                                        // // }
// // 
                                    // // }
                                // // }
                            // // }
                        // // }
// // 
                        // // if (flag_display == 'true' && (_is_disabled != 1 && _is_disabled != "1" && _is_disabled != "true" && _is_disabled != true)) {
                            // // if (app_permissions.can_view == false && app_permissions.can_create == false) {
                                // // n_bund.next();
                                // // continue;
                            // // }
                            // // var row_a = Ti.UI.createTableViewRow({
                                // // height : "40dp",
                                // // name : display,
                                // // display : display,
                                // // desc : description,
                                // // name_table : name_table,
                                // // show_plus : show_plus,
                                // // app_permissions : app_permissions,
                                // // className : 'menu_row', // this is to optimize the rendering
                                // // selectionStyle : app_permissions.can_view ? 1 : 0,
                                // // backgroundSelectedColor : app_permissions.can_view ? '#BDBDBD' : '#00000000'
                            // // });
// // 
                            // // var icon = Titanium.UI.createImageView({
                                // // width : "32dp",
                                // // height : "32dp",
                                // // top : "6dp",
                                // // left : "5dp",
                                // // desc : description,
                                // // image : '/images/icons/' + name_table.toLowerCase() + '.png',
                            // // });
// // 
                            // // if (icon.toBlob() == null || icon.toBlob().length == 0) {
                                // // icon.image = '/images/icons/settings.png';
                            // // }
// // 
                            // // var title_a = Titanium.UI.createLabel({
                                // // text : display,
                                // // font : {
                                    // // fontSize : "20dp"
                                // // },
                                // // width : '82%',
                                // // textAlign : 'left',
                                // // left : "42dp",
                                // // height : 'auto',
                                // // desc : description,
                                // // color : '#000'
                            // // });
// // 
                            // // var plus_a = Titanium.UI.createButton({
                                // // backgroundImage : '/images/plus_btn.png',
                                // // backgroundSelectedImage : '/images/plus_btn_selected.png',
                                // // width : "54dp",
                                // // height : "38dp",
                                // // right : "1dp",
                                // // is_plus : true
                            // // });
                            // // if (show_plus === false) {
                                // // plus_a.hide();
                            // // }
// // 
                            // // row_a.add(icon);
                            // // row_a.add(title_a);
                            // // row_a.add(plus_a);
// // 
                            // // if (PLATFORM == 'android') {
                                // // row_a.addEventListener('longclick', function(e) {
                                    // // if (e.source.desc != null && e.source.desc != "") {
                                        // // alert(e.source.desc)
                                    // // }
                                // // });
                            // // }
                            // // else {
                                // // row_a.addEventListener('longpress', function(e) {
                                    // // if (e.source.desc != null && e.source.desc != "") {
                                        // // alert(e.source.desc)
                                    // // }
                                // // });
                            // // }
                            // // data_rows.push(row_a);
                            // // data_rows.sort(sortTableView);
                        // // }
// // 
                        // // n_bund.next();
                    // // }
                    // // n_bund.close();
                // // }
                // // if (data_rows.length > 0) {
                    // // menu.setData(data_rows);
                // // }
// // 
            // // }
            // // //Unique node update
            // // else {
                // // //Increment the progress bar
                // // if (progress != null) {
                    // // progress.set();
                // // }
// // 
                // // var get_title = JSON.stringify(json.node_type.update.data.title_fields);
// // 
                // // var _get_data = JSON.stringify(json.node_type.update.data);
                // // var node_type_json = json.node_type.update.data;
                // // var no_mob_display = true;
// // 
                // // if ((node_type_json.no_mobile_display != null && (node_type_json.no_mobile_display == 1 || node_type_json.no_mobile_display == '1')) || json.node_type.update.disabled == 1 || json.node_type.update.disabled == '1' || json.node_type.update.disabled == 'true' || json.node_type.update.disabled == true) {
                    // // no_mob_display = false;
                // // }
// // 
                // // db_installMe.execute("UPDATE bundles SET bundle_name='" + json.node_type.update.type + "', display_on_menu='" + no_mob_display + "', display_name='" + json.node_type.update.name + "', description='" + json.node_type.update.description + "', title_fields='" + get_title + "', _data='" + _get_data + "', disabled='" + json.node_type.update.disabled + "' WHERE bundle_name='" + json.node_type.update.type + "'");
// // 
                // // var n_bund = db_installMe.execute('SELECT * FROM bundles');
                // // var data_rows = new Array();
                // // while (n_bund.isValidRow()) {
                    // // var name_table = n_bund.fieldByName("bundle_name");
                    // // var display = n_bund.fieldByName("display_name").toUpperCase();
                    // // var description = n_bund.fieldByName("description");
                    // // var flag_display = n_bund.fieldByName("display_on_menu");
                    // // var _is_disabled = n_bund.fieldByName("disabled");
                    // // var _nd = n_bund.fieldByName("_data");
                    // // var show_plus = false;
                    // // var app_permissions = {
                        // // "can_create" : false,
                        // // "can_update" : false,
                        // // "all_permissions" : false,
                        // // "can_view" : false
                    // // }
// // 
                    // // var node_type_json = JSON.parse(_nd);
// // 
                    // // if (node_type_json.no_mobile_display != null && node_type_json.no_mobile_display == 1 && node_type_json.no_mobile_display == '1') {
                        // // n_bund.next();
                        // // continue;
                    // // }
// // 
                    // // if (roles.hasOwnProperty(ROLE_ID_ADMIN)) {
                        // // show_plus = true;
                        // // app_permissions.can_create = true;
                        // // app_permissions.all_permissions = true;
                        // // app_permissions.can_update = true;
                        // // app_permissions.can_view = true;
// // 
                    // // }
                    // // else {
                        // // var _l;
                        // // for (_l in node_type_json.permissions) {
                            // // for (_k in roles) {
                                // // if (_l == _k) {
                                    // // var stringifyObj = JSON.stringify(node_type_json.permissions[_l]);
                                    // // if (node_type_json.permissions[_l]["can create"] || node_type_json.permissions[_l]["all_permissions"]) {
                                        // // show_plus = true;
                                        // // app_permissions.can_create = true;
                                    // // }
// // 
                                    // // if (node_type_json.permissions[_l]["all_permissions"]) {
                                        // // app_permissions.all_permissions = true;
                                        // // app_permissions.can_update = true;
                                        // // app_permissions.can_view = true;
                                        // // continue;
                                    // // }
// // 
                                    // // if (stringifyObj.indexOf('update') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
                                        // // app_permissions.can_update = true;
                                    // // }
// // 
                                    // // if (stringifyObj.indexOf('view') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
                                        // // app_permissions.can_view = true;
                                    // // }
// // 
                                // // }
                            // // }
                        // // }
                    // // }
// // 
                    // // if (flag_display == 'true' && (_is_disabled != 1 && _is_disabled != "1" && _is_disabled != "true" && _is_disabled != true)) {
                        // // if (app_permissions.can_view == false && app_permissions.can_create == false) {
                            // // n_bund.next();
                            // // continue;
                        // // }
                        // // var row_a = Ti.UI.createTableViewRow({
                            // // height : "40dp",
                            // // name : display,
                            // // display : display,
                            // // desc : description,
                            // // name_table : name_table,
                            // // show_plus : show_plus,
                            // // app_permissions : app_permissions,
                            // // className : 'menu_row', // this is to optimize the rendering
                            // // selectionStyle : app_permissions.can_view ? 1 : 0,
                            // // backgroundSelectedColor : app_permissions.can_view ? '#BDBDBD' : '#00000000'
                        // // });
// // 
                        // // var icon = Titanium.UI.createImageView({
                            // // width : "32dp",
                            // // height : "32dp",
                            // // top : "6dp",
                            // // left : "5dp",
                            // // desc : description,
                            // // image : '/images/icons/' + name_table.toLowerCase() + '.png',
                        // // });
// // 
                        // // if (icon.toBlob() == null || icon.toBlob().length == 0) {
                            // // icon.image = '/images/icons/settings.png';
                        // // }
// // 
                        // // var title_a = Titanium.UI.createLabel({
                            // // text : display,
                            // // font : {
                                // // fontSize : "20dp"
                            // // },
                            // // width : '82%',
                            // // textAlign : 'left',
                            // // left : "42dp",
                            // // height : 'auto',
                            // // desc : description,
                            // // color : '#000'
                        // // });
// // 
                        // // var plus_a = Titanium.UI.createButton({
                            // // backgroundImage : '/images/plus_btn.png',
                            // // backgroundSelectedImage : '/images/plus_btn_selected.png',
                            // // width : "54dp",
                            // // height : "38dp",
                            // // right : "1dp",
                            // // is_plus : true
                        // // });
                        // // if (show_plus === false) {
                            // // plus_a.hide();
                        // // }
// // 
                        // // row_a.add(icon);
                        // // row_a.add(title_a);
                        // // row_a.add(plus_a);
// // 
                        // // if (PLATFORM == 'android') {
                            // // row_a.addEventListener('longclick', function(e) {
                                // // if (e.source.desc != null && e.source.desc != "") {
                                    // // alert(e.source.desc)
                                // // }
                            // // });
                        // // }
                        // // else {
                            // // row_a.addEventListener('longpress', function(e) {
                                // // if (e.source.desc != null && e.source.desc != "") {
                                    // // alert(e.source.desc)
                                // // }
                            // // });
                        // // }
                        // // data_rows.push(row_a);
                        // // data_rows.sort(sortTableView);
                        // // menu.setData(data_rows);
                    // // }
// // 
                    // // n_bund.next();
                // // }
                // // n_bund.close();
            // // }
        // // }
// 
        // //Node type deletion - Not implemented yet (API's side)
        // else
        // if (json.node_type['delete']) {
            // //Multiple node type deletions
            // if (json.node_type['delete'].length) {
                // var i;
                // for ( i = 0; i < json.node_type['delete'].length; i++) {
                    // //Increment the progress bar
                    // if (progress != null) {
                        // progress.set();
                    // }
                    // node_db[node_db.length] = "DROP TABLE " + json.node_type.insert[i].type;
                    // node_db[node_db.length] = "DELETE FROM bundles WHERE bundle_name = '" + json.node_type.insert[i].type + "'";
                    // node_db[node_db.length] = "DELETE FROM node WHERE table_name = '" + json.node_type.insert[i].type + "'";
// 
                // }
            // }
            // //Unique node deletion
            // else {
                // if (progress != null) {
                    // progress.set();
                // }
                // node_db[node_db.length] = "DROP TABLE " + json.node_type.insert.type;
                // node_db[node_db.length] = "DELETE FROM bundles WHERE bundle_name = '" + json.node_type.insert.type + "'";
                // node_db[node_db.length] = "DELETE FROM node WHERE table_name = '" + json.node_type.insert.type + "'";
            // }
        // }
// 
        // //DB operations
        // var iPerform = 0;
        // var iStart = Math.round(new Date().getTime() / 1000);
        // Ti.API.info("Node_type started at : " + iStart);
// 
        // db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
        // while (iPerform <= node_db.length - 1) {
            // db_installMe.execute(node_db[iPerform]);
            // iPerform++;
        // }
        // db_installMe.execute("COMMIT TRANSACTION");
// 
        // var iEnd = Math.round(new Date().getTime() / 1000);
        // Ti.API.info("Node_type finishes at : " + iEnd);
// 
        // var iResult = iEnd - iStart;
        // Ti.API.info('Node_type seconds: ' + iResult);
        // Ti.API.info("Success for node_types, db operations ran smoothly!");
    // }