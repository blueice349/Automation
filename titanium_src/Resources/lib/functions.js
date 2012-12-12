/*jslint eqeq: true, plusplus: true */
/*global Omadi*/

var domainName = Ti.App.Properties.getString("domainName");

Ti.include('/lib/encoder_base_64.js');
Ti.include('/lib/util_functions.js');
Ti.include('/lib/data_functions.js');
Ti.include('/lib/display_functions.js');

var PLATFORM = Ti.Platform.name;
var ROLE_ID_ADMIN = 3;
var app_timestamp = 0;
var omadi_time_format = Ti.App.Properties.getString("Omadi_time_format", 'g:iA');

var newNotificationCount = 0;
var newNotificationNid = 0;

var weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

function PixelsToDPUnits(ThePixels) {"use strict";
    return (ThePixels / (Titanium.Platform.displayCaps.dpi / 160));
}

function DPUnitsToPixels(TheDPUnits) {"use strict";
    return (TheDPUnits * (Titanium.Platform.displayCaps.dpi / 160));
}

function createNotification(message) {

    if (PLATFORM === 'android') {
        var mainIntent = Titanium.Android.createIntent({
            className : 'org.appcelerator.titanium.TiActivity',
            packageName : 'com.omadi.crm',
            flags : Titanium.Android.FLAG_ACTIVITY_CLEAR_TOP | Titanium.Android.FLAG_ACTIVITY_SINGLE_TOP
        });

        var pending = Titanium.Android.createPendingIntent({
            activity : Titanium.Android.currentActivity,
            intent : mainIntent,
            type : Titanium.Android.PENDING_INTENT_FOR_ACTIVITY,
            flags : Titanium.Android.FLAG_UPDATE_CURRENT
        });

        var notification = Titanium.Android.createNotification({
            icon : 0x7f020000,
            contentTitle : 'Omadi CRM',
            contentText : message,
            tickerText : 'Omadi GPS Service',
            contentIntent : pending,
            flags : Titanium.Android.FLAG_ONGOING_EVENT | Titanium.Android.FLAG_NO_CLEAR
        });
        Titanium.Android.NotificationManager.notify(42, notification);
    }
}

function notifyIOS(msg, update_time) {
    if (update_time === true) {
        var time = Math.round(new Date().getTime() / 1000);
        Ti.App.Properties.setString("last_alert_popup", time);
    }

    var slide_it_top = Titanium.UI.createAnimation();
    slide_it_top.top = 0;
    // to put it back to the left side of the window
    slide_it_top.duration = 400;
    var win = Titanium.UI.createWindow({
        height : 50,
        width : "100%",
        top : -50,
        navBarHidden : true,
        zIndex : -1000
    });

    var view = Titanium.UI.createView({
        backgroundColor : '#000',
        opacity : 0.8,
        height : "100%",
        zIndex : -1000
    });

    var label = Titanium.UI.createLabel({
        color : '#fff',
        font : {
            fontSize : 13
        },
        textAlign : 'center',
        width : '100%',
        height : '100%'
    });
    win.add(view);
    win.add(label);

    label.text = msg;
    win.open(slide_it_top);

    setTimeout(function() {
        var slide_it_out = Titanium.UI.createAnimation();
        slide_it_out.top = -50;
        // to put it back to the left side of the window
        slide_it_out.duration = 400;
        win.close(slide_it_out);
    }, 2500);

}



//
//Check type at field table
// Return values
// 0 => It is a number
// 1 => It is text
//

function check_type(name, object) {
    var db_type = Omadi.utils.openMainDatabase();

    var qRes = db_type.execute("SELECT DISTINCT type FROM fields WHERE field_name=? AND bundle=?", name, object);

    if (qRes.isValidRow()) {
        switch(qRes.fieldByName("type")) {
            case "number_integer":
                type = 0
                break;

            case "number_decimal":
                type = 0;
                break;

            default:
                type = 1;
                break;
        }
    }
    else {
        Ti.API.info("Field type not found!!");
        //Treat as text!
        type = 1;
    }
    qRes.close();
    db_type.close();

    return type;
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function treatArray(num_to_insert, call_id) {

    // Insert array in a better way?
    // Optimization matters!
    // data separator

    var separator = 'j8Oc2s1E';
    var content_s = '';
    var array_size = num_to_insert.length;

    var test1 = 0;
    var test2 = 0;
    var count_a = 0;

    if (array_size == 0) {
        //Pack everything
        var content_s = Base64.encode("null");
        return content_s;
    }

    if (array_size == 1) {
        //Pack everything
        //Ti.API.info(num_to_insert[0]);
        if (num_to_insert[0] != null) {
            var content_s = Base64.encode(num_to_insert[0]);
        }
        else {
            var content_s = Base64.encode("null");
        }
        return content_s;
    }

    var key;
    for (key in num_to_insert) {
        count_a++;
        if (count_a < array_size) {
            content_s += num_to_insert[key] + '' + separator;
            test1++;
        }
        else if (count_a == array_size) {
            content_s += num_to_insert[key] + '';
            test2++;
        }
    }

    //Checking test:
    if ((test1 < 1) || (test2 != 1)) {
        Ti.API.info('@Developer, check arrays insertion! _' + call_id);
        var blah = num_to_insert instanceof Array;
        Ti.API.info('This is the original array-size: ' + num_to_insert.length + ' is this an array? ' + blah);
        var key;
        for (key in num_to_insert) {
            Ti.API.info('For value ' + key + ' in array we got ' + num_to_insert[key]);
        }
    }

    //Pack everything
    content_s = Base64.encode(content_s);

    return content_s;
}

//
// Function's signature : process_object(json,obj)
// Purpouse: Insert, update and delete objects such as contact, potential, account and lead
// Parameters:
//		json: Receveid answer from API's request.
//		obj: Name of the object (contact/potential/account/lead)
// Returns: An empty return to callback the parent's action.
//

function getNodeTableInsertStatement(node) {"use strict";

    var sql = 'INSERT OR REPLACE INTO node (nid, perm_edit, perm_delete, created, changed, title, author_uid, flag_is_updated, table_name, form_part, changed_uid, no_data_fields, viewed) VALUES (';

    sql += node.nid;
    sql += ',' + node.perm_edit;
    sql += ',' + node.perm_delete;
    sql += ',' + node.created;
    sql += ',' + node.changed;
    sql += ',"' + node.title.replace(/"/g, "'") + '"';
    sql += ',' + node.author_uid;
    sql += ',' + node.flag_is_updated;
    sql += ',"' + node.table_name + '"';
    sql += ',' + node.form_part;
    sql += ',' + node.changed_uid;
    sql += ',\'' + node.no_data_fields + '\'';
    sql += ',\'' + node.viewed + '\'';

    sql += ')';

    if (node.table_name == 'notification' && node.viewed == 0) {
        newNotificationCount++;
        newNotificationNid = node.nid;
    }

    return sql;
    //json[obj].insert[i].nid + ', '+ json[obj].insert[i].perm_edit + ', '+ json[obj].insert[i].perm_delete + ', ' +
    //json[obj].insert[i].created + ' , ' + json[obj].insert[i].changed + ', "' + json[obj].insert[i].title.replace(/"/gi, "'") + '" , ' +
    //json[obj].insert[i].author_uid + ' , 0 , "' + obj + '", ' + json[obj].insert[i].form_part + ',' + json[obj].insert[i].changed_uid + ',\'' + no_data + '\', \'' + json[obj].insert[i].viewed + '\') ';
}

function isJsonString(str) {
    if (str == "" || str == null) {
        return false;
    }
    else {
        try {
            JSON.parse(str);
        }
        catch (e) {
            return false;
        }
    }
    return true;
}


// 
// function update_node(mode, _node_name, flag_next_part) {"use strict";
    // var db, latest_nid, result, formWin;
    // //Omadi.display.showLoadingIndicator("Saving data to the web...");
// 
    // Omadi.service.sendUpdates(mode, _node_name);//, function(error) {
// 
        // // //Omadi.display.hideLoadingIndicator();
        // // Ti.API.info('Closing create or edit node');
        // // if ( typeof error !== 'undefined') {
            // // alert(error);
        // // }
// // 
        // if (flag_next_part != null) {
//             
            // //reload_me(flag_next_part);
            // db = Omadi.utils.openMainDatabase();
            // result = db.execute("SELECT min(nid) FROM node");
            // latest_nid = result.field(0);
            // result.close();
            // db.close();
//             
            // formWin = Ti.UI.createWindow({
                // navBarHidden: true,
                // url: '/main_windows/form.js',
                // title: bundle.label
            // });//create_or_edit_node.getWindow();
//             
            // formWin.type = curWin.type;
            // formWin.nid = latest_nid;
            // formWin.mode = 1;
            // formWin.open();
        // }
        // // else {
            // // close_me(false);
        // // }
    // // });
// 
    // // installMe(curWin, null, curWin.listView, null, 'POST', mode, function(isError) {
    // // Ti.API.info('Closing create or edit node');
    // // if (flag_next_part != null) {
    // // close_parent(flag_next_part);
    // // }
    // // else {
    // // close_parent(isError);
    // // }
    // // }, _node_name);
// }

//Function Opens a new window to display descAux [Description?].
//The window closes when it receives a click event
function openBigText(descAux) {
    if (PLATFORM == 'android') {
        Ti.UI.Android.hideSoftKeyboard();
        Ti.API.debug("Hid keyboard in openBigText");
    };
    var descWin = Ti.UI.createWindow({
        navBarHidden : true,
        backgroundColor : '#00000000'
    });
    var tanslucent = Ti.UI.createView({
        backgroundColor : 'black',
        opacity : 0.5
    });
    tanslucent.top = tanslucent.bottom = tanslucent.right = tanslucent.left = 0;
    var baseView = Ti.UI.createView({
        backgroundColor : '#424242',
        left : 5,
        right : 5,
        height : '250'
    });
    descWin.add(tanslucent);
    descWin.add(baseView);

    //Header where the selected name is presented
    var descHeader = Ti.UI.createView({
        backgroundImage : '../images/header.png',
        top : '1',
        height : '38',
        left : 1,
        right : 1
    });
    var labelDescContent = Ti.UI.createLabel({
        text : 'Desciption',
        left : 5,
        height : 30,
        width : Ti.Platform.displayCaps.platformWidth - 10,
        color : '#fff',
        font : {
            fontFamily : 'Helvetica Neue',
            fontSize : 18,
            fontWeight : 'bold',

        },
        ellipsize : true,
        wordWrap : false
    });
    var close_btn = Ti.UI.createImageView({
        height : 30,
        width : 25,
        top : 4,
        right : 5,
        image : '../images/close.png'
    });
    baseView.add(descHeader);
    descHeader.add(labelDescContent);
    descHeader.add(close_btn);

    var textDesc = Ti.UI.createTextArea({
        top : 40,
        bottom : 1,
        left : 1,
        right : 1,
        value : descAux,
        color : "blue",
        editable : false,
        backgroundColor : '#fff',
        backgroundImage : '',
        font : {
            fontSize : 12
        }
    });

    baseView.add(textDesc);

    descWin.open();

    close_btn.addEventListener('click', function() {
        descWin.close();
    });
    tanslucent.addEventListener('click', function() {
        descWin.close();
    });
}

function verify_UTC(date_original) {
    //discover if is GMT+ or GMT-
    if ((date_original.getFullYear() - date_original.getUTCFullYear()) < 0) {
        Ti.API.info('Timezone is negative');
        return -1;
    }
    else if ((date_original.getFullYear() - date_original.getUTCFullYear()) < 0) {
        Ti.API.info('Timezone is positive');
        return 1;
    }
    else {
        if ((date_original.getMonth() - date_original.getUTCMonth()) < 0) {
            Ti.API.info('Timezone is negative');
            return -1;
        }
        else if ((date_original.getMonth() - date_original.getUTCMonth()) < 0) {
            Ti.API.info('Timezone is positive');
            return 1;
        }
        else {
            if ((date_original.getDate() - date_original.getUTCDate()) < 0) {
                Ti.API.info('Timezone is negative');
                return -1;
            }
            else if ((date_original.getDate() - date_original.getUTCDate()) < 0) {
                Ti.API.info('Timezone is positive');
                return 1;
            }
            else {
                if ((date_original.getHours() - date_original.getUTCHours()) < 0) {
                    Ti.API.info('Timezone is negative');
                    return -1;
                }
                else {
                    Ti.API.info('Timezone is positive');
                    return 1;
                }
            }
        }
    }
}

function timeConverter(UNIX_timestamp, type) {
    var a = new Date(UNIX_timestamp * 1000);

    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();

    if (min < 10) {
        min = '0' + min;
    }

    if (type != "1") {
        var time = month + " " + date + ", " + year;
        return time;
    }
    else {
        var time = month + " " + date + ", " + year + " - " + display_omadi_time01(UNIX_timestamp);
        return time;
    }

}

function display_omadi_time01(timestamp) {
    var time = timestamp * 1000;

    var got_time = new Date(time);

    var hours = got_time.getHours();
    var min = got_time.getMinutes();

    //return hours + ":" + form_min(min);
    return date(omadi_time_format, got_time);
}

function getDeviceTypeIndentifier() {
    if (Ti.Platform.osname == 'android') {
        return 'android';
    }
    else {
        if (Ti.Platform.osname == 'ipad') {
            return 'ipad';
        }
        else {
            if (getScreenWidth() > 320) {
                return 'iphone4';
            }
            else {
                return 'iphone3';
            }
        }
    }
}

function getOSIdentifier() {
    switch(Ti.Platform.osname) {
        case "android":
            return "android";
            break;
        case "ipad":
        case "iphone":
            return "ios";
            break;
        case "mobileweb":
            return "mobileweb";
            break;
        default:
            return "ios";
            break;
    }
}

function getOrientation() {
    var o = Ti.UI.currentWindow.orientation;
    if (o == Ti.UI.PORTRAIT || o == Ti.UI.UPSIDE_PORTRAIT) {
        return 'portrait';
    }
    else {
        return 'landscape';
    }
}

function getScreenWidth() {
    var o = getOrientation();
    var ret = 0;
    switch(o) {
        case 'portrait':
            ret = Ti.Platform.displayCaps.platformWidth;
            break;
        case 'landscape':
            ret = Ti.Platform.displayCaps.platformHeight;
            break;
    }
    return ret;
}

function getScreenHeight() {
    var o = getOrientation();
    var ret = 0;
    switch(o) {
        case 'portrait':
            ret = Ti.Platform.displayCaps.platformHeight;
            break;
        case 'landscape':
            ret = Ti.Platform.displayCaps.platformWidth;
            break;
    }
    return ret;
}

function clearCache() {
    var path = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDirectory).getParent();
    var cookies = Ti.Filesystem.getFile(path + '/Library/Cookies', 'Cookies.binarycookies');
    if (cookies.exists()) {
        cookies.deleteFile();
    }

}

function node_load(db_display, nid) {

    var parent_node = new Array();
    var table = db_display.execute('SELECT table_name FROM node WHERE nid = ' + nid);
    table = table.fieldByName('table_name');
    var node_data = db_display.execute('SELECT * FROM ' + table + ' WHERE nid=' + nid);
    return node_data;
}

function _calculation_field_sort_on_weight(a, b) {
    if (a['weight'] != null && a['weight'] != "" && b['weight'] != null && b['weight'] != "") {
        return a['weight'] > b['weight'];
    }
    return 0;
}

function _calculation_field_get_values(win, db_display, instance, entity, content) {
    //Ti.API.info('here--------0.1' + instance.field_name + ", mode: " + win.mode);
    var calculated_field_cache = [];
    var final_value = 0;
    if (instance.settings.calculation.items != null && !instance.disabled) {
        var row_values = [];
        if (instance.value != null && instance.value != "") {
            cached_final_value = instance.value;
        }
        else {
            cached_final_value = 0;
        }

        usort(instance['settings']['calculation']['items'], '_calculation_field_sort_on_weight');

        var idx;
        for (idx in instance.settings.calculation.items) {
            var calculation_row = instance.settings.calculation.items[idx];
            var value = 0;
            var field_1_multiplier = 0;
            var field_2_multiplier = 0;
            var numeric_multiplier = 0;
            calculated_field_cache = new Array();
            if (calculation_row.field_name_1 != null && entity[calculation_row.field_name_1] != null && entity[calculation_row.field_name_1][0]['field_type'] == 'calculation_field') {
                // Make sure a dependency calculation is made first
                // TODO: Statically cache these values for future use by other calculation fields
                // TODO: Make sure an infinite loop doesn't occur
                //Ti.API.info('here--------0.2');
                required_instance_final_values = _calculation_field_get_values(win, db_display, content[entity[calculation_row.field_name_1][0]['reffer_index']], entity, content);
                //Ti.API.info('here--------0.3' + required_instance_final_values[0].final_value);
                calculated_field_cache[calculation_row.field_name_1] = required_instance_final_values[0].final_value;
            }

            if (calculation_row.field_name_1 != null && calculation_row.field_name_1 != "") {
                //Ti.API.info('here--------0.4' + calculation_row.field_name_1 + "," + calculated_field_cache[calculation_row.field_name_1]);
                if (calculated_field_cache[calculation_row.field_name_1] != null) {
                    //Ti.API.info('here--------0.5' + calculated_field_cache[calculation_row.field_name_1]);
                    field_1_multiplier = calculated_field_cache[calculation_row.field_name_1];
                }
                else if (calculation_row.type == 'parent_field_value') {
                    //Ti.API.info('here--------0.6' + calculation_row.parent_field);
                    parent_field = calculation_row.parent_field;
                    if (entity[parent_field] != null && entity[parent_field][0]['nid'] != null) {
                        parent_node = node_load(db_display, entity[parent_field][0]['nid']);
                        if (parent_node.rowCount > 0 && parent_node.fieldByName(calculation_row.field_name_1) != null) {
                            field_1_multiplier = parent_node.fieldByName(calculation_row.field_name_1);
                            //Ti.API.info('here--------0.7' + field_1_multiplier);
                        }
                    }
                }
                else if (entity[calculation_row.field_name_1] != null && entity[calculation_row.field_name_1][0]['value'] != null) {
                    field_1_multiplier = entity[calculation_row.field_name_1][0]['value'];
                    //Ti.API.info('here--------0.8' + field_1_multiplier);
                }
                if (calculation_row.datestamp_end_field != null && calculation_row.datestamp_end_field != "") {
                    //Ti.API.info('here--------0.9' + field_1_multiplier);
                    start_timestamp = field_1_multiplier;
                    // Set this end value to 0 in case the terminating datestamp field is empty
                    field_1_multiplier = 0;
                    if (entity[calculation_row.datestamp_end_field] != null && entity[calculation_row.datestamp_end_field][0]['value'] != null) {
                        end_timestamp = entity[calculation_row.datestamp_end_field][0]['value'];
                        //Ti.API.info('here--------0.10' + end_timestamp);
                        if (calculation_row.type == 'time-only') {
                            //Ti.API.info('here--------0.11' + calculation_row.type);
                            if (end_timestamp < start_timestamp) {
                                //Ti.API.info('here--------0.12' + start_timestamp);
                                end_timestamp += (24 * 3600);
                            }
                        }

                        difference = end_timestamp - start_timestamp;

                        switch(calculation_row.datestamp_interval) {
                            case 'minute':
                                field_1_multiplier = difference / 60;
                                //Ti.API.info('here--------0.13' + field_1_multiplier);
                                break;
                            case 'hour':
                                field_1_multiplier = difference / 3600;
                                //Ti.API.info('here--------0.14' + field_1_multiplier);
                                break;
                            case 'day':
                                field_1_multiplier = difference / (3600 * 24);
                                //Ti.API.info('here--------0.15' + field_1_multiplier);
                                break;
                            case 'week':
                                field_1_multiplier = difference / (3600 * 24 * 7);
                                //Ti.API.info('here--------0.16' + field_1_multiplier);
                                break;
                        }
                        if (calculation_row.type == 'time') {
                            //Ti.API.info('here--------0.17' + calculation_row.type);
                            if (calculation_row.interval_rounding == 'up') {
                                field_1_multiplier = Math.ceil(field_1_multiplier);
                                //Ti.API.info('here--------0.18' + field_1_multiplier);
                            }
                            else if (calculation_row.interval_rounding == 'down') {
                                field_1_multiplier = Math.floor(field_1_multiplier);
                                //Ti.API.info('here--------0.19' + field_1_multiplier);
                            }
                            else if (calculation_row.interval_rounding == 'integer') {
                                field_1_multiplier = Math.round(field_1_multiplier);
                                //Ti.API.info('here--------0.20' + field_1_multiplier);
                            }
                            else if (calculation_row.interval_rounding == 'increment-at-time') {
                                //Ti.API.info('here--------0.21' + calculation_row.increment_at_time);
                                at_time = calculation_row.increment_at_time;
                                start_timestamp = Number(start_timestamp);
                                relative_increment_time = at_time = mktime(0, 0, 0, date('n', start_timestamp), date('j', start_timestamp), date('Y', start_timestamp));
                                //Ti.API.info('here--------0.22' + relative_increment_time + "," + end_timestamp);
                                day_count = 0;
                                if (relative_increment_time < start_timestamp) {
                                    relative_increment_time += (3600 * 24);
                                    //Ti.API.info('here--------0.23' + relative_increment_time);
                                }

                                while (relative_increment_time <= end_timestamp) {
                                    day_count++;
                                    relative_increment_time += (3600 * 24);
                                    //	Ti.API.info('here--------0.24' + relative_increment_time );
                                }

                                field_1_multiplier = day_count;
                            }
                        }
                    }
                }

            }

            if (calculation_row.field_name_2 != null && calculation_row.field_name_2 != "") {
                //Ti.API.info('here--------1' + calculation_row.field_name_2);
                if (calculated_field_cache[calculation_row.field_name_1] != null) {
                    field_2_multiplier = calculated_field_cache[calculation_row.field_name_2];
                    //Ti.API.info('here--------2' + field_2_multiplier);
                }
                else if (calculation_row.type == 'parent_field_value') {
                    parent_field = calculation_row.parent_field;
                    //Ti.API.info('here--------3' + parent_field);
                    if (entity[parent_field] != null && entity[parent_field][0]['nid'] != null) {
                        parent_node = node_load(db_display, entity[parent_field][0]['nid']);
                        //Ti.API.info('here--------4' + parent_field);
                        if (parent_node.rowCount > 0 && parent_node.fieldByName(calculation_row.field_name_2) != null) {
                            field_2_multiplier = parent_node.fieldByName(calculation_row.field_name_2);
                            //Ti.API.info('here--------5' + field_2_multiplier);
                        }
                    }
                }
                else if (entity[calculation_row.field_name_2] != null && entity[calculation_row.field_name_2][0]['value'] != null) {
                    field_2_multiplier = entity[calculation_row.field_name_2][0]['value'];
                    //Ti.API.info('here--------6' + field_2_multiplier);
                }
            }

            if (calculation_row.numeric_multiplier != null && calculation_row.numeric_multiplier != "") {
                numeric_multiplier = Number(calculation_row.numeric_multiplier);
                //Ti.API.info('here--------7' + numeric_multiplier);
            }

            var zero = false;

            if (calculation_row.criteria != null && calculation_row.criteria.search_criteria != null) {
                //Ti.API.info('here--------8' + calculation_row.criteria);
                if (!list_search_node_matches_search_criteria(win, db_display, entity, calculation_row.criteria, content)) {
                    //Ti.API.info('here--------9');
                    zero = true;
                }
            }

            var value = 0;
            if (field_1_multiplier == 0 && calculation_row.field_name_1 != null && calculation_row.field_name_1 != "") {
                //Ti.API.info('here--------10');
                zero = true;
            }
            else if (value == 0 && field_1_multiplier != 0) {
                //Ti.API.info('here--------11');
                value = field_1_multiplier;
            }

            if (field_2_multiplier == 0 && calculation_row.field_name_2 != null && calculation_row.field_name_2 != "") {
                //Ti.API.info('here--------12');
                zero = true;
            }
            else if (value == 0 && field_2_multiplier != 0) {
                //Ti.API.info('here--------13');
                value = Number(field_2_multiplier);
            }
            else if (value != 0 && field_2_multiplier != 0) {
                //Ti.API.info('here--------14');
                value *= Number(field_2_multiplier);
            }

            if (value == 0 && numeric_multiplier != 0) {
                //Ti.API.info('here--------15');
                value = Number(numeric_multiplier);
            }
            else if (value != 0 && numeric_multiplier != 0) {
                //Ti.API.info('here--------16');
                value *= Number(numeric_multiplier);
            }

            // if(calculation_row.type!=null && calculation_row.type=='static'){
            // Ti.API.info('here--------17' );
            // zero = false;
            // }
            if (zero) {
                //Ti.API.info('here--------18');
                value = 0;
            }

            row_values.push({
                'row_label' : (calculation_row.row_label != null && calculation_row.row_label != "") ? calculation_row.row_label : '',
                'value' : value
            });
            //alert('field_1_multiplier : ' + field_1_multiplier);
            //alert('field_2_multiplier : ' + field_2_multiplier);
            //alert('numeric_multiplier : ' + numeric_multiplier);
            //alert('Value : ' + value);
            final_value += Number(value);
            //Ti.API.info('here--------19' + final_value);
        }
        //	alert("final value: " + final_value);
        return [{
            'cached_final_value' : cached_final_value,
            'final_value' : final_value,
            'rows' : row_values,
        }];

    }
    return [];
}

function omadi_fields_get_fields(win, db_display) {
    try {
        var fields = new Array();
        var unsorted_res = new Array();
        var regions = db_display.execute('SELECT * FROM regions WHERE node_type = "' + win.type + '" ORDER BY weight ASC');
        var fields_result = db_display.execute('SELECT * FROM fields WHERE bundle = "' + win.type + '" ORDER BY weight ASC');

        while (fields_result.isValidRow()) {
            unsorted_res.push({
                label : fields_result.fieldByName('label'),
                type : fields_result.fieldByName('type'),
                field_name : fields_result.fieldByName('field_name'),
                settings : fields_result.fieldByName('settings'),
                widget : fields_result.fieldByName('widget')
            });
            fields_result.next();
        }

        while (regions.isValidRow()) {

            var reg_settings = JSON.parse(regions.fieldByName('settings'));

            if (reg_settings != null && reg_settings.display_disabled) {
                Ti.API.info('Region : ' + regions.fieldByName('label') + ' won\'t appear');
            }
            else {
                fields[regions.fieldByName('region_name')] = new Array();
                fields[regions.fieldByName('region_name')]['label'] = regions.fieldByName('label');
                fields[regions.fieldByName('region_name')]['type'] = 'region_separator_mode';
                fields[regions.fieldByName('region_name')]['settings'] = regions.fieldByName('settings');
                var i;
                for (i in unsorted_res) {
                    var settings = JSON.parse(unsorted_res[i].settings);
                    if (regions.fieldByName('region_name') == settings.region) {
                        fields[unsorted_res[i].field_name] = new Array();
                        fields[unsorted_res[i].field_name]['label'] = unsorted_res[i].label;
                        fields[unsorted_res[i].field_name]['type'] = unsorted_res[i].type;
                        fields[unsorted_res[i].field_name]['settings'] = unsorted_res[i].settings;
                        fields[unsorted_res[i].field_name]['widget'] = unsorted_res[i].widget;
                        fields[unsorted_res[i].field_name]['field_name'] = unsorted_res[i].field_name;
                    }
                }
            }
            regions.next();
        }
        return fields;
    }
    catch(evt) {
        return null;
    }
}

// PHP equivelent function in javaScript----START
function mktime() {
    var no, ma = 0, mb = 0, i = 0, d = new Date(), argv = arguments, argc = argv.length;

    if (argc > 0) {
        d.setHours(0, 0, 0);
        d.setDate(1);
        d.setMonth(1);
        d.setYear(1972);
    }

    var dateManip = {
        0 : function(tt) {
            return d.setHours(tt);
        },
        1 : function(tt) {
            return d.setMinutes(tt);
        },
        2 : function(tt) {
            var set = d.setSeconds(tt);
            mb = d.getDate() - 1;
            return set;
        },
        3 : function(tt) {
            var set = d.setMonth(parseInt(tt) - 1);
            ma = d.getFullYear() - 1972;
            return set;
        },
        4 : function(tt) {
            return d.setDate(tt + mb);
        },
        5 : function(tt) {
            return d.setYear(tt + ma);
        }
    };

    for ( i = 0; i < argc; i++) {
        no = parseInt(argv[i] * 1);
        if (isNaN(no)) {
            return false;
        }
        else {
            // arg is number, let's manipulate date object
            if (!dateManip[i](no)) {
                // failed
                return false;
            }
        }
    }

    return Math.floor(d.getTime() / 1000);
}


function date(format, timestamp) {

    var a, jsdate = (( typeof (timestamp) == 'undefined') ? new Date() : ( typeof (timestamp) == 'number') ? new Date(timestamp * 1000) : new Date(timestamp)
    );
    var pad = function(n, c) {
        if (( n = n + "").length < c) {
            return new Array(++c - n.length).join("0") + n;
        }
        else {
            return n;
        }
    };
    var txt_weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var txt_ordin = {
        1 : "st",
        2 : "nd",
        3 : "rd",
        21 : "st",
        22 : "nd",
        23 : "rd",
        31 : "st"
    };
    var txt_months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var f = {
        // Day
        d : function() {
            return pad(f.j(), 2);
        },
        D : function() {
            var t = f.l();
            return t.substr(0, 3);
        },
        j : function() {
            return jsdate.getDate();
        },
        l : function() {
            return txt_weekdays[f.w()];
        },
        N : function() {
            return f.w() + 1;
        },
        S : function() {
            return txt_ordin[f.j()] ? txt_ordin[f.j()] : 'th';
        },
        w : function() {
            return jsdate.getDay();
        },
        z : function() {
            return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0;
        },

        // Week
        W : function() {
            var a = f.z(), b = 364 + f.L() - a;
            var nd2, nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;

            if (b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b) {
                return 1;
            }
            else {

                if (a <= 2 && nd >= 4 && a >= (6 - nd)) {
                    nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
                    return date("W", Math.round(nd2.getTime() / 1000));
                }
                else {
                    return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
                }
            }
        },

        // Month
        F : function() {
            return txt_months[f.n()];
        },
        m : function() {
            return pad(f.n(), 2);
        },
        M : function() {
            t = f.F();
            return t.substr(0, 3);
        },
        n : function() {
            return jsdate.getMonth() + 1;
        },
        t : function() {
            var n;
            if (( n = jsdate.getMonth() + 1) == 2) {
                return 28 + f.L();
            }
            else {
                if (n & 1 && n < 8 || !(n & 1) && n > 7) {
                    return 31;
                }
                else {
                    return 30;
                }
            }
        },

        // Year
        L : function() {
            var y = f.Y();
            return (!(y & 3) && (y % 1e2 || !(y % 4e2))) ? 1 : 0;
        },
        o : function() {
            if (f.n() === 12 && f.W() === 1) {
                return jsdate.getFullYear() + 1;
            }
            if (f.n() === 1 && f.W() >= 52) {
                return jsdate.getFullYear() - 1;
            }
            return jsdate.getFullYear();
        },
        Y : function() {
            return jsdate.getFullYear();
        },
        y : function() {
            return (jsdate.getFullYear() + "").slice(2);
        },

        // Time
        a : function() {
            return jsdate.getHours() > 11 ? "pm" : "am";
        },
        A : function() {
            return f.a().toUpperCase();
        },
        B : function() {
            // peter paul koch:
            var off = (jsdate.getTimezoneOffset() + 60) * 60;
            var theSeconds = (jsdate.getHours() * 3600) + (jsdate.getMinutes() * 60) + jsdate.getSeconds() + off;
            var beat = Math.floor(theSeconds / 86.4);
            if (beat > 1000)
                beat -= 1000;
            if (beat < 0)
                beat += 1000;
            if ((String(beat)).length == 1)
                beat = "00" + beat;
            if ((String(beat)).length == 2)
                beat = "0" + beat;
            return beat;
        },
        g : function() {
            return jsdate.getHours() % 12 || 12;
        },
        G : function() {
            return jsdate.getHours();
        },
        h : function() {
            return pad(f.g(), 2);
        },
        H : function() {
            return pad(jsdate.getHours(), 2);
        },
        i : function() {
            return pad(jsdate.getMinutes(), 2);
        },
        s : function() {
            return pad(jsdate.getSeconds(), 2);
        },
        u : function() {
            return pad(jsdate.getMilliseconds() * 1000, 6);
        },

        // Timezone
        //e not supported yet
        I : function() {
            var DST = (new Date(jsdate.getFullYear(), 6, 1, 0, 0, 0));
            DST = DST.getHours() - DST.getUTCHours();
            var ref = jsdate.getHours() - jsdate.getUTCHours();
            return ref != DST ? 1 : 0;
        },
        O : function() {
            var t = pad(Math.abs(jsdate.getTimezoneOffset() / 60 * 100), 4);
            if (jsdate.getTimezoneOffset() > 0)
                t = "-" + t;
            else
                t = "+" + t;
            return t;
        },
        P : function() {
            var O = f.O();
            return (O.substr(0, 3) + ":" + O.substr(3, 2));
        },
        //T not supported yet
        Z : function() {
            var t = -jsdate.getTimezoneOffset() * 60;
            return t;
        },

        // Full Date/Time
        c : function() {
            return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P();
        },
        r : function() {
            return f.D() + ', ' + f.d() + ' ' + f.M() + ' ' + f.Y() + ' ' + f.H() + ':' + f.i() + ':' + f.s() + ' ' + f.O();
        },
        U : function() {
            return Math.round(jsdate.getTime() / 1000);
        }
    };

    return format.replace(/[\\]?([a-zA-Z])/g, function(t, s) {
        if (t != s) {
            // escaped
            ret = s;
        }
        else if (f[s]) {
            // a date function exists
            ret = f[s]();
        }
        else {
            // nothing special
            ret = s;
        }

        return ret;
    });
}

Number.prototype.toCurrency = function($O) {// extending Number prototype

    String.prototype.separate_thousands = function() {// Thousands separation
        $val = this;
        var rx = new RegExp('(-?[0-9]+)([0-9]{3})');
        while (rx.test($val)) {
            $val = $val.replace(rx, '$1' + $O.thousands_separator + '$2');
        }
        return $val;
    };

    Number.prototype.toFixed = function() {// Rounding
        var m = Math.pow(10, $O.use_fractions.fractions);
        return Math.round(this * m, 0) / m;
    };

    String.prototype.times = function(by) {// String multiplication
        by = (by >> 0);
        var t = (by > 1 ? this.times(by / 2) : '' );
        return t + (by % 2 ? t + this : t);
    };
    var $A = this;

    /* I like to keep all options, as the name would sugesst, **optional** :) so, let me make tham as such */
    $O ? null : $O = new Object;
    /* If no thousands_separator is present default to "," */
    $O.thousands_separator ? null : $O.thousands_separator = ",";
    /* If no currency_symbol is present default to "$" */
    $O.currency_symbol ? null : $O.currency_symbol = "";

    // Fractions use is separated, just in case you don't want them
    if ($O.use_fractions) {
        $O.use_fractions.fractions ? null : $O.use_fractions.fractions = 2;
        $O.use_fractions.fraction_separator ? null : $O.use_fractions.fraction_separator = ".";
    }
    else {
        $O.use_fractions = new Object;
        $O.use_fractions.fractions = 0;
        $O.use_fractions.fraction_separator = " ";
    }
    // We round this number
    $A.round = $A.toFixed();

    // We convert rounded Number to String and split it to integrer and fractions
    $A.arr = ($A.round + "").split(".");
    // First part is an integrer
    $A._int = $A.arr[0].separate_thousands();
    // Second part, if exists, are rounded decimals
    $A.arr[1] == undefined ? $A._dec = $O.use_fractions.fraction_separator + "0".times($O.use_fractions.fractions) : $A._dec = $O.use_fractions.fraction_separator + $A.arr[1] + "0".times($O.use_fractions.fractions - ($A.arr[1] + "").length);

    /* If no symbol_position is present, default to "front" */
    $O.symbol_position ? null : $O.symbol_position = "front";
    $O.symbol_position == "front" ? $A.ret = $O.currency_symbol + $A._int + $A._dec : $A.ret = $A._int + $A._dec + " " + $O.currency_symbol;
    return $A.ret;
};

var in_array = function(p_val, haystack) {
    var i;
    for ( i = 0, l = haystack.length; i < l; i++) {
        if (haystack[i] == p_val) {
            return true;
        }
    }
    return false;
};

function isArray(input) {"use strict";
    return typeof (input) == 'object' && ( input instanceof Array);
}

function strpos(haystack, needle, offset) {
    var i = (haystack + '').indexOf(needle, (offset || 0));
    return i === -1 ? false : i;
}

function count_arr_obj(mixed_var, mode) {
    if (mixed_var === null || typeof mixed_var === 'undefined') {
        return 0;
    }
    else if (mixed_var.constructor !== Array && mixed_var.constructor !== Object) {
        return 1;
    }

    if (mode === 'COUNT_RECURSIVE') {
        mode = 1;
    }
    if (mode != 1) {
        mode = 0;
    }
    var cnt = 0;
    for (key in mixed_var) {
        if (mixed_var.hasOwnProperty(key)) {
            cnt++;
            if (mode == 1 && mixed_var[key] && (mixed_var[key].constructor === Array || mixed_var[key].constructor === Object)) {
                cnt += this.count(mixed_var[key], 1);
            }
        }
    }

    return cnt;
}

function usort(inputArr, sorter) {
    var valArr = [], k = '', i = 0, strictForIn = false, populateArr = {};
    if ( typeof sorter === 'string') {
        sorter = this[sorter];
    }
    else if (Object.prototype.toString.call(sorter) === '[object Array]') {
        sorter = this[sorter[0]][sorter[1]];
    }
    // BEGIN REDUNDANT
    this.php_js = this.php_js || {};
    this.php_js.ini = this.php_js.ini || {};
    // END REDUNDANT
    strictForIn = this.php_js.ini['phpjs.strictForIn'] && this.php_js.ini['phpjs.strictForIn'].local_value && this.php_js.ini['phpjs.strictForIn'].local_value !== 'off';
    populateArr = strictForIn ? inputArr : populateArr;

    for (k in inputArr) {// Get key and value arrays
        if (inputArr.hasOwnProperty(k)) {
            valArr.push(inputArr[k]);
            if (strictForIn) {
                delete inputArr[k];
            }
        }
    }
    try {
        valArr.sort(sorter);
    }
    catch (e) {
        return false;
    }
    for ( i = 0; i < valArr.length; i++) {// Repopulate the old array
        populateArr[i] = valArr[i];
    }
    return strictForIn || populateArr;
}

// PHP equivelent function in javaScript-----END

function search_criteria_sort_order(a, b) {"use strict";
    if (a.weight != null && a.weight != "" && b.weight != null && b.weight != "") {
        return a.weight > b.weight;
    }
    return 0;
}

function list_search_node_matches_search_criteria(node, criteria) {"use strict";

    var user, row_matches, instances, i, j, criteria_index, criteria_row, field_name, search_field, search_value, search_operator, search_time_value,
        compare_times, value_index, nodeDBValues, nodeTextValues, search_time_value2, compare_times2, node_value, weekdays, 
        reference_types, db, result, query, possibleValues, searchValues, chosen_value, retval, and_groups, and_group, and_group_index,
        and_group_match;
    
    /*jslint nomen: true*/
   
    try {
      
        row_matches = [];
        if (typeof criteria.search_criteria !== 'undefined' && criteria.search_criteria != "") {
            
            instances = Omadi.data.getFields(node.type);
            
            //criteria.search_criteria.sort(search_criteria_search_order);
            
            for (criteria_index in criteria.search_criteria) {
                if(criteria.search_criteria.hasOwnProperty(criteria_index)){
                    //Ti.API.info('here--------A.3' + criteria.search_criteria[criteria_index]);
                    criteria_row = criteria.search_criteria[criteria_index];
                    row_matches[criteria_index] = false;
                    field_name = criteria_row.field_name;
                    nodeDBValues = node[field_name].dbValues;
                    nodeTextValues = node[field_name].textValues;
                    
                    //Ti.API.info('here--------A.4' + field_name);
                    
                    if (instances[field_name] != null) {
                        search_field = instances[field_name];
                        //Ti.API.info('here--------A.5' + search_field['type']);

                        if (search_field.type == 'datestamp') {
                            //Ti.API.info('here--------A.6' + search_field['type']);
                            // if ((field_name == 'uid' || field_name == 'created' || field_name == 'changed_uid') && win.nid != null & win.nid != "") {
                                // var node = db_display.execute('SELECT ' + field_name + ' from node WHERE nid="' + win.nid + '";');
                                // if (field_name == 'uid') {
                                    // field_name = 'author_uid';
                                // }
                                // node_values.push(node.fieldByName(field_name));
                            // }
                            // else {
                                // //Ti.API.info('here--------A.7');
                                // if (entity[field_name] != null) {
                                    // //Ti.API.info('here--------A.8');
                                    // for (idx in entity[field_name]) {
                                        // //Ti.API.info('here--------A.9' + entity[field_name][idx]);
                                        // var elements = entity[field_name][idx];
                                        // if (elements['value'] != null && elements['value'] != "") {
                                            // //Ti.API.info('here--------A.10' + elements['value']);
                                            // node_values.push(elements['value']);
                                        // }
                                    // }
                                // }
                                // else {
                                    // // No match, so move on
                                    // continue;
                                // }
                            // }
    
                            search_value = criteria_row.value;
                            search_operator = criteria_row.operator + "".toString();
                            //Ti.API.info('here--------A.11' + search_value + "," + search_operator);
    
                            if (['after-time', 'before-time', 'between-time'].indexOf(search_operator) != -1) {
                                //Ti.API.info('here--------A.12');
                                search_time_value = Number(search_value.time);
                                //Ti.API.info('here--------A.12' + search_time_value);
                                compare_times = [];
                                
                                for (i = 0; i < nodeDBValues.length; i ++) {
                                    compare_times[i] = search_time_value + mktime(0, 0, 0, date('n', Number(nodeDBValues[i])), date('j', Number(nodeDBValues[i])), date('Y', Number(nodeDBValues[i])));
                                    //Ti.API.info('here--------A.13' + compare_times[value_index] + "," + node_values[value_index]);
                                }
    
                                if (search_operator == 'after-time') {
                                    //Ti.API.info('here--------A.14' + search_operator);
                                   
                                    for (i = 0; i < nodeDBValues.length; i++) {
                                        //Ti.API.info('here--------A.15' + node_values[value_index] + "," + compare_times[value_index]);
                                        if (nodeDBValues[i] > compare_times[i]) {
                                            //Ti.API.info('here--------A.16');
                                            row_matches[criteria_index] = true;
                                        }
                                    }
                                }
                                else if (search_operator == 'before-time') {
                                    //Ti.API.info('here--------A.17');
                                    
                                    for (i = 0; i < nodeDBValues.length; i++) {
                                        //Ti.API.info('here--------A.18');
                                        if (nodeDBValues[i] < compare_times[i]) {
                                            //Ti.API.info('here--------A.19');
                                            row_matches[criteria_index] = true;
                                        }
                                    }
                                }
                                else if (search_operator == 'between-time') {
                                    //Ti.API.info('here--------A.20');
                                    search_time_value2 = search_value.time2;
                                    //Ti.API.info('here--------A.21');
                                    compare_times2 = [];
                                    
                                    for (i = 0; i < nodeDBValues.length; i++) {
    
                                        compare_times2[i] = search_time_value2 + mktime(0, 0, 0, date('n', Number(nodeDBValues[i])), date('j', Number(nodeDBValues[i])), date('Y', Number(nodeDBValues[i])));
                                        //Ti.API.info('here--------A.22' + compare_times2[value_index] + "," + node_values[value_index]);
                                    }
    
                                    if (search_time_value < search_time_value2) {
                                        //Ti.API.info('here--------A.23');
                                        // Like between 5:00PM - 8:00PM

                                        for (i = 0; i < nodeDBValues.length; i++) {
                                            //Ti.API.info('here--------A.24');
                                            if (nodeDBValues[i] >= compare_times[i] && nodeDBValues[i] < compare_times2[i]) {
                                                //Ti.API.info('here--------A.25');
                                                row_matches[criteria_index] = true;
                                            }
                                        }
                                    }
                                    else {
                                        //Ti.API.info('here--------A.25----1');
                                        // Like between 8:00PM - 4:00AM

                                        for (i = 0; i < nodeDBValues.length; i++) {
                                            //Ti.API.info('here--------A.26');
                                            if (nodeDBValues[i] >= compare_times[i] || nodeDBValues[i] < compare_times2[i]) {
                                                //Ti.API.info('here--------A.26---1');
                                                row_matches[criteria_index] = true;
                                            }
                                        }
                                    }
                                }
                            }
                            else if (search_operator == '__blank') {
                                //Ti.API.info('here--------A.26---2');
                                row_matches[criteria_index] = true;
                               
                                for (i = 0; i < nodeDBValues.length; i++) {
                                    //Ti.API.info('here--------A.26---3');
                                    node_value = nodeDBValues[i];
                                    if (node_value != null && node_value != "") {
                                        //Ti.API.info('here--------A.26---4');
                                        row_matches[criteria_index] = false;
                                    }
    
                                }
                            }
                            else if (search_operator == '__filled') {
                                //Ti.API.info('here--------A.26---5');
                                
                                for (i = 0; i < nodeDBValues.length; i++) {
                                    //Ti.API.info('here--------A.26---6');
                                    node_value = nodeDBValues[i];
                                    if (node_value != null && node_value != "") {
                                        //Ti.API.info('here--------A.26---7');
                                        row_matches[criteria_index] = true;
                                    }
    
                                }
                            }
                            else if (search_operator == 'weekday') {
                                //Ti.API.info('here--------A.27' + search_value.weekday);
                                weekdays = search_value.weekday;
                                if (!isArray(search_value.weekday)) {
                                    //Ti.API.info('here--------A.28' + search_value.weekday);
                                    weekdays = [];
                                   
                                    for (i in search_value.weekday) {
                                        if(search_value.weekday.hasOwnProperty(i)){
                                            //Ti.API.info('here--------A.30' + key);
                                            weekdays.push(i);
                                        }
                                    }
                                }
    
                                
                                for (i = 0; i < nodeDBValues.length; i++) {
                                    //Ti.API.info('here--------A.31' + node_values[value_index] + ", " + date('w', Number(node_values[value_index])), weekdays);
                                    if (in_array(date('w', Number(nodeDBValues[i])), weekdays)) {
                                        //Ti.API.info('here--------A.32' + date('w', Number(node_values[value_index])), weekdays);
                                        row_matches[criteria_index] = true;
                                    }
                                }
                            }
                        }
    
                        /* TODO ---- In Future
    
                        else
    
                         if(search_field['settings']['parts'] != null) {
    
                         if(search_field['type'] == 'location') {
                         for(part in search_field['settings']['parts']) {
                         search_value = isset($form_state['values']['search'][$search_field['field_name']][$part]) ? $form_state['values']['search'][$search_field['field_name']][$part] : $form_state['values']['search']['more_fields'][$search_field['field_name']][$part];
                         $query->condition('l_' . $search_field['field_name'] . '.' . $part, '%' . $search_value . '%', 'LIKE');
                         $search_fields[$search_key][$part]['default_value'] = $search_value;
                         }
                         object_lists_add_location_column($query, FALSE, $search_field, $id, $node_table);
                         } else {
                         for(part in search_field['settings']['parts']) {
                         $search_value = isset($form_state['values']['search'][$search_field['field_name']][$part]) ? $form_state['values']['search'][$search_field['field_name']][$part] : $form_state['values']['search']['more_fields'][$search_field['field_name']][$part];
                         $query->condition($search_field['field_name'] . '.' . $search_field['field_name'] . '_' . $part, '%' . $search_value . '%', 'LIKE');
                         $search_fields[$search_key][$part]['default_value'] = $search_value;
                         }
                         object_lists_add_parts_column($query, FALSE, $search_field, $id, $node_table);
                         }
    
                         }
                         */
    
                        else {
                            //Ti.API.info('here--------A.33');
                            // if(entity[field_name] == null) {
                            // entity[field_name] = null;
                            // }
                            search_value = criteria_row.value != null && criteria_row.value != "" ? criteria_row.value : null;
                            search_operator = criteria_row.operator;
                            //Ti.API.info('here--------A.34' + search_value + "," + search_operator);
                            switch(search_field.type) {
                                case 'text':
                                case 'text_long':
                                case 'email':
                                case 'link_field':
                                case 'phone':
                                    // for (idx in entity[field_name]) {
                                        // var elements = entity[field_name][idx];
                                        // if (elements['value'] != null && elements['value'] != "") {
                                            // node_values.push(elements['value']);
                                        // }
                                    // }
                                   
                                    for (i = 0; i < nodeDBValues.length; i++) {
                                        node_value = nodeDBValues[i];
                                        switch(search_operator) {
                                            case 'not like':
                                                if (strpos(node_value, search_value) === false) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
    
                                            case 'starts with':
                                                if (strpos(node_value, search_value) === 0) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
    
                                            case 'ends with':
                                                if (strpos(node_value, search_value) === node_value.length - search_value.length) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
    
                                            case 'not starts with':
                                                if (strpos(node_value, search_value) !== 0) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
    
                                            case 'not ends with':
                                                if (strpos(node_value, search_value) !== node_value.length - search_value.length) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
    
                                            default:
                                                if (strpos(node_value, search_value) !== false) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
                                        }
                                    }
    
                                    break;
                                case 'list_boolean':
                                    // for (idx in entity[field_name]) {
                                        // var elements = entity[field_name][idx];
                                        // node_values.push(elements['value']);
                                    // }
    
                                    if (search_operator == '__filled') {
                                       
                                        for (i = 0; i < nodeDBValues.length; i++) {
                                            node_value = nodeDBValues[i];
                                            if (node_value != 0) {
                                                row_matches[criteria_index] = true;
                                            }
                                        }
                                    }
                                    else {
                                        if (nodeDBValues.length == 0 || nodeDBValues[0] == null || nodeDBValues[0] == 0) {
                                            row_matches[criteria_index] = true;
                                        }
                                        else {
                                            for (i = 0; i < nodeDBValues.length; i++) {
                                                node_value = nodeDBValues[i];
                                                if (node_value == 0) {
                                                    row_matches[criteria_index] = true;
                                                }
                                            }
                                        }
                                    }
    
                                    break;
                                case 'calculation_field':
                                    //Ti.API.info('here--------A.35---1');
                                    //calculation_values = _calculation_field_get_values(win, db_display, content[entity[field_name][0]['reffer_index']], entity);
                                    //Ti.API.info('here--------A.35' + calculation_values);
                                    
                                    
                                    //node_values.push(calculation_values[0].final_value);
    
                                    
                                    for (i = 0; i < nodeDBValues.length; i++) {
                                        node_value = nodeDBValues[i];
                                        //Ti.API.info('here--------A.36' + node_value);
                                        switch(search_operator) {
    
                                            case '>':
                                                //Ti.API.info('here--------A.37' + node_value + "," + search_value);
                                                if (node_value > search_value) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
                                            case '>=':
                                                //Ti.API.info('here--------A.38' + node_value + "," + search_value);
                                                if (node_value >= search_value) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
                                            case '!=':
                                                //Ti.API.info('here--------A.39' + node_value + "," + search_value);
                                                if (node_value != search_value) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
                                            case '<':
                                                //Ti.API.info('here--------A.40' + node_value + "," + search_value);
                                                if (node_value < search_value) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
                                            case '<=':
                                                //Ti.API.info('here--------A.41' + node_value + "," + search_value);
                                                if (node_value <= search_value) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
                                            default:
                                                //Ti.API.info('here--------A.42' + node_value + "," + search_value);
                                                if (node_value == search_value) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
                                        }
                                    }
                                    break;
                                case 'number_integer':
                                case 'number_decimal':
                                case 'auto_increment':
                                    // for (idx in entity[field_name]) {
                                        // var elements = entity[field_name][idx];
                                        // if (elements['value'] != null && elements['value'] != "") {
                                            // node_values.push(elements['value']);
                                        // }
                                    // }
    
                                    for (i = 0; i < nodeDBValues.length; i++) {
                                        node_value = nodeDBValues[i];
                                        switch(search_operator) {
    
                                            case '>':
                                                if (node_value > search_value) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
                                            case '>=':
                                                if (node_value >= search_value) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
                                            case '!=':
                                                if (node_value != search_value) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
                                            case '<':
                                                if (node_value < search_value) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
                                            case '<=':
                                                if (node_value <= search_value) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
    
                                            default:
                                                if (node_value == search_value) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
                                        }
                                    }
    
                                    break;
    
                                case 'omadi_reference':
                                    // for (idx in entity[field_name]) {
                                        // var elements = entity[field_name][idx];
                                        // if (elements['nid'] != null && elements['nid'] != "") {
                                            // node_values.push(elements['nid']);
                                        // }
                                    // }
    
                                    reference_types = [];
                                    
                                    for (i in search_field.settings.reference_types) {
                                        if(search_field.settings.reference_types.hasOwnProperty(i)){
                                            reference_types.push(search_field.settings.reference_types[i]);
                                        }
                                    }
    

                                    query = 'SELECT nid from node WHERE table_name IN (' + reference_types.join(',') + ')';
                                    switch(search_operator) {
                                        case 'starts with':
                                        case 'not starts with':
                                            query += ' AND title LIKE "%' + search_value + '%"';
                                            break;
                                        case 'ends with':
                                        case 'not ends with':
                                            query += ' AND title LIKE "%' + search_value + '"';
                                            break;
                                        default:
                                            query += ' AND title LIKE "%' + search_value + '%"';
                                            break;
                                    }
                                    
                                    db = Omadi.utils.openMainDatabase();
                                    result = db.execute(query);
                                    
                                    possibleValues = [];
                                    while (result.isValidRow()) {
                                        possibleValues.push(result.fieldByName('nid'));
                                        result.next();
                                    }
                                    result.close();
                                    db.close();
    
                                    switch(search_operator) {
                                        case 'not starts with':
                                        case 'not ends with':
                                        case 'not like':
                                            if (nodeDBValues[0] == 0) {
                                                row_matches[criteria_index] = true;
                                            }
                                            else {
                                                row_matches[criteria_index] = true;
                                                for (i = 0; i < nodeDBValues.length; i++) {
                                                    node_value = nodeDBValues[i];
                                                    if (in_array(node_value, possibleValues)) {
                                                        row_matches[criteria_index] = false;
                                                    }
                                                }
                                            }
                                            break;
                                        default:
                                            for (i = 0; i < nodeDBValues.length; i++) {
                                                node_value = nodeDBValues[i];
                                                if (in_array(node_value, possibleValues)) {
                                                    row_matches[criteria_index] = true;
                                                }
                                            }
                                            break;
                                    }
    
                                    break;
                                    
                                case 'user_reference':
                                    //Ti.API.info('here--------A.43');
                                    // if ((field_name == 'uid' || field_name == 'created' || field_name == 'changed_uid') && win.nid != null & win.nid != "") {
                                        // var node = db_display.execute('SELECT ' + field_name + ' from node WHERE nid="' + win.nid + '";');
                                        // if (field_name == 'uid') {
                                            // field_name = 'author_uid';
                                        // }
                                        // node_values.push(node.fieldByName(field_name));
                                    // }
                                    // else {
                                        // //Ti.API.info('here--------A.44');
                                        // for (idx in entity[field_name]) {
                                            // var elements = entity[field_name][idx];
                                            // //Ti.API.info('here--------A.45' + elements);
                                            // if (elements['uid'] != null && elements['uid'] != "") {
                                                // //Ti.API.info('here--------A.43' + elements['uid']);
                                                // node_values.push(elements['value']);
                                            // }
                                        // }
//     
                                    // }
                                    if (search_value == 'current_user') {
                                        search_value = Omadi.utils.getUid();
                                    }
                                    // Make sure the search value is an array
                                    searchValues = [];
                                    if (!isArray(search_value)) {
                                        //Ti.API.info('here--------A.44' + search_value);
                                        for (i in search_value) {
                                            if (search_value.hasOwnProperty(i)) {
                                                //Ti.API.info('here--------A.46' + key);
                                                searchValues[i] = i;
                                            }
                                        }
                                        search_value = searchValues;
                                    }
    
                                    if (search_operator != null && search_operator == '!=') {
                                        //Ti.API.info('here--------A.47' + search_value['__null']);
                                        row_matches[criteria_index] = true;
                                        if (search_value.__null == '__null' && (nodeDBValues.length == 0 || nodeDBValues[0] == null || nodeDBValues[0] == 0)) {
                                            //Ti.API.info('here--------A.48');
                                            row_matches[criteria_index] = false;
                                        }
                                        else {
                                            //Ti.API.info('here--------A.49');
                                            for (i = 0; i < search_value.length; i++) {
                                                //Ti.API.info('here--------A.50' + search_value[idx] + row_matches[criteria_index] + criteria_index);
                                                chosen_value = search_value[i];
                                                if (in_array(chosen_value, nodeDBValues)) {
                                                    //Ti.API.info('here--------A.51' + chosen_value);
                                                    row_matches[criteria_index] = false;
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        //Ti.API.info('here--------A.52');
                                        if (search_value.__null == '__null' && (nodeDBValues.length == 0 || nodeDBValues[0] == null || nodeDBValues[0] == 0)) {
                                            //Ti.API.info('here--------A.53');
                                            row_matches[criteria_index] = true;
                                        }
                                        else {
                                            //Ti.API.info('here--------A.54');
                                            for (i = 0; i < search_value.length; i++) {
                                                //Ti.API.info('here--------A.55' + search_value[idx]);
                                                chosen_value = search_value[i];
                                                if (in_array(chosen_value, nodeDBValues)) {
                                                    //Ti.API.info('here--------A.56' + chosen_value);
                                                    row_matches[criteria_index] = true;
                                                }
                                            }
                                        }
                                    }
                                    break;
                                    
                                case 'taxonomy_term_reference':
    
                                    // for (idx in entity[field_name]) {
                                        // elements = entity[field_name][idx];
                                        // if (elements['tid'] == 0) {
                                            // node_values.push(elements['tid']);
                                        // }
                                    // }
    
                                    if (search_field.widget.type == 'options_select' || search_field.widget.type == 'violation_select') {
                                        // Make sure the search value is an array
                                        searchValues = [];
                                        if (!isArray(search_value)) {
                                            //Ti.API.info('here--------A.44' + search_value);
                                            for (i in search_value) {
                                                if (search_value.hasOwnProperty(i)) {
                                                    //Ti.API.info('here--------A.46' + key);
                                                    searchValues[i] = i;
                                                }
                                            }
                                            search_value = searchValues;
                                        }
    
                                        if (search_operator != null && search_operator == '!=') {
    
                                            row_matches[criteria_index] = true;
                                            if (search_value.__null == '__null' && (nodeDBValues.length == 0 || nodeDBValues[0] == null || nodeDBValues[0] == 0)) {
                                                row_matches[criteria_index] = false;
                                            }
                                            else {
                                                for (i = 0; i < search_value.length; i++) {
                                                    chosen_value = search_value[i];
                                                    if (in_array(chosen_value, nodeDBValues)) {
                                                        row_matches[criteria_index] = false;
                                                    }
                                                }
    
                                            }
                                        }
                                        else {
                                            if (search_value.__null == '__null' && (nodeDBValues.length == 0 || nodeDBValues[0] == null || nodeDBValues[0] == 0)) {
                                                row_matches[criteria_index] = true;
                                            }
                                            else {
                                                for (i = 0; i < search_value.length; i++) {
                                                    chosen_value = search_value[i];
                                                    if (in_array(chosen_value, nodeDBValues)) {
                                                        row_matches[criteria_index] = true;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        
                                        db = Omadi.utils.openMainDatabase();
                                        result = db.execute('SELECT vid from vocabulary WHERE machine_name="' + search_field.settings.vocabulary + '";');
                                        
                                        
                                        query = 'SELECT tid from term_data WHERE vid=' + result.fieldByName('vid');
                                        switch(search_operator) {
                                            case 'starts with':
                                            case 'not starts with':
                                                query += ' AND name LIKE "' + search_value + '%"';
                                                break;
    
                                            case 'ends with':
                                            case 'not ends with':
                                                query += ' AND name LIKE "%' + search_value + '"';
                                                break;
    
                                            default:
                                                query += ' AND name LIKE "%' + search_value + '%"';
                                                break;
                                        }
                                        
                                        result.close();
                                        
                                        //Ti.API.info(query);
                                        result = db.execute(query);
                                        possibleValues = [];
                                        while (result.isValidRow()) {
                                            possibleValues.push(result.fieldByName('tid'));
                                            result.next();
                                        }
                                        result.close();
                                        db.close();
    
                                        switch(search_operator) {
                                            case 'not starts with':
                                            case 'not ends with':
                                            case 'not like':
                                                if (nodeDBValues[0] == 0) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                else {
                                                    row_matches[criteria_index] = true;
                                                    for (i = 0; i < nodeDBValues.length; i ++) {
                                                        node_value = nodeDBValues[i];
                                                        if (in_array(node_value, possibleValues)) {
                                                            row_matches[criteria_index] = false;
                                                        }
                                                    }
                                                }
                                                break;
    
                                            default:
                                                for (i = 0; i < nodeDBValues.length; i ++) {
                                                    node_value = nodeDBValues[i];
                                                    if (in_array(node_value, possibleValues)) {
                                                        row_matches[criteria_index] = true;
                                                    }
                                                }
                                                break;
                                        }
                                    }
    
                                    break;
    
                                case 'omadi_time':
                                    // TODO: Add the omadi_time field here
                                    break;
    
                                case 'image':
                                    // Do nothing
                                    break;
    
                            }
    
                        }
    
                    }
                }
            }

            if (count_arr_obj(criteria.search_criteria) == 1) {
                //Ti.API.info('here--------A.57' + row_matches[criteria_index]);
                retval = row_matches[criteria_index];
            }
            else {
                //Ti.API.info('here--------A.58');
                // Group each criteria row into groups of ors with the matching result of each or
                and_groups = [];
                and_group_index = 0;
                and_groups[and_group_index] = [];
                //print_r($criteria['search_criteria']);
                for (criteria_index in criteria.search_criteria) {
                    if(criteria.search_criteria.hasOwnProperty(criteria_index)){
                        //Ti.API.info('here--------A.59' + criteria_index);
                        criteria_row = criteria.search_criteria[criteria_index];
                        if (criteria_index == 0) {
                            //Ti.API.info('here--------A.60' + row_matches[criteria_index]);
                            //and_groups[and_group_index][0] = row_matches[criteria_index];
                            and_groups[and_group_index].push(row_matches[criteria_index]);
                        }
                        else {
                            //Ti.API.info('here--------A.61');
                            if (criteria_row.row_operator == null || criteria_row.row_operator != 'or') {
                                //Ti.API.info('here--------A.62');
                                and_group_index++;
                                and_groups[and_group_index] = [];
                            }
                            //Ti.API.info('here--------A.63' + row_matches[criteria_index]);
                            and_groups[and_group_index].push(row_matches[criteria_index]);
                            //and_groups[and_group_index][0] = row_matches[criteria_index];
                        }
                    }
                }

                // Get the final result, making sure each and group is TRUE
                retval = true;
                //Ti.API.info('here--------A.64' + and_groups.length);
                for (i = 0; i < and_groups.length; i ++) {
                    //Ti.API.info('here--------A.65');
                    and_group = and_groups[i];
                    and_group_match = false;
                    for (j = 0; j < and_group.length; j ++) {
                        //Ti.API.info('here--------A.66' + and_group[idx1]);
                       
                        // Make sure at least one item in an and group is true (or the only item is true)
                        if (and_group[j]) {
                            //Ti.API.info('here--------A.67');
                            and_group_match = true;
                            break;
                        }
                    }

                    // If one and group doesn't match the whole return value of this function is false
                    if (!and_group_match) {
                        //Ti.API.info('here--------A.68');
                        retval = false;
                        break;
                    }
                }
            }
            //Ti.API.info('here--------A.69' + retval);
            return retval;
        }

        // No conditions exist, so the row matches

    }
    catch(e) {
    }
    return true;
}

// function list_search_node_matches_search_criteria(win, db_display, entity, criteria, content) {
    // try {
        // var user;
        // var row_matches = [];
        // if (criteria.search_criteria != null && criteria.search_criteria != "") {
            // //Ti.API.info('here--------A.1');
            // var instances = omadi_fields_get_fields(win, db_display);
            // //Ti.API.info('here--------A.2');
            // criteria.search_criteria.sort(search_criteria_search_order);
            // var criteria_index;
            // for (criteria_index in criteria.search_criteria) {
                // //Ti.API.info('here--------A.3' + criteria.search_criteria[criteria_index]);
                // var criteria_row = criteria.search_criteria[criteria_index];
                // row_matches[criteria_index] = false;
                // var field_name = criteria_row.field_name;
                // //Ti.API.info('here--------A.4' + field_name);
                // if (instances[field_name] != null) {
                    // var search_field = instances[field_name];
                    // //Ti.API.info('here--------A.5' + search_field['type']);
                    // var node_values = [];
                    // if (search_field['type'] == 'datestamp') {
                        // //Ti.API.info('here--------A.6' + search_field['type']);
                        // if ((field_name == 'uid' || field_name == 'created' || field_name == 'changed_uid') && win.nid != null & win.nid != "") {
                            // var node = db_display.execute('SELECT ' + field_name + ' from node WHERE nid="' + win.nid + '";');
                            // if (field_name == 'uid') {
                                // field_name = 'author_uid';
                            // }
                            // node_values.push(node.fieldByName(field_name));
                        // }
                        // else {
                            // //Ti.API.info('here--------A.7');
                            // if (entity[field_name] != null) {
                                // //Ti.API.info('here--------A.8');
                                // for (idx in entity[field_name]) {
                                    // //Ti.API.info('here--------A.9' + entity[field_name][idx]);
                                    // var elements = entity[field_name][idx];
                                    // if (elements['value'] != null && elements['value'] != "") {
                                        // //Ti.API.info('here--------A.10' + elements['value']);
                                        // node_values.push(elements['value']);
                                    // }
                                // }
                            // }
                            // else {
                                // // No match, so move on
                                // continue;
                            // }
                        // }
// 
                        // var search_value = criteria_row.value;
                        // var search_operator = criteria_row.operator;
                        // //Ti.API.info('here--------A.11' + search_value + "," + search_operator);
// 
                        // if (in_array(search_operator, Array('after-time', 'before-time', 'between-time'))) {
                            // //Ti.API.info('here--------A.12');
                            // var search_time_value = Number(search_value.time);
                            // //Ti.API.info('here--------A.12' + search_time_value);
                            // var compare_times = new Array();
                            // var value_index;
                            // for (value_index in node_values) {
                                // compare_times[value_index] = search_time_value + mktime(0, 0, 0, date('n', Number(node_values[value_index])), date('j', Number(node_values[value_index])), date('Y', Number(node_values[value_index])));
                                // //Ti.API.info('here--------A.13' + compare_times[value_index] + "," + node_values[value_index]);
                            // }
// 
                            // if (search_operator == 'after-time') {
                                // //Ti.API.info('here--------A.14' + search_operator);
                                // var value_index;
                                // for (value_index in node_values) {
                                    // //Ti.API.info('here--------A.15' + node_values[value_index] + "," + compare_times[value_index]);
                                    // if (node_values[value_index] > compare_times[value_index]) {
                                        // //Ti.API.info('here--------A.16');
                                        // row_matches[criteria_index] = true;
                                    // }
                                // }
                            // }
                            // else if (search_operator == 'before-time') {
                                // //Ti.API.info('here--------A.17');
                                // var value_index;
                                // for (value_index in node_values) {
                                    // //Ti.API.info('here--------A.18');
                                    // if (node_values[value_index] < compare_times[value_index]) {
                                        // //Ti.API.info('here--------A.19');
                                        // row_matches[criteria_index] = true;
                                    // }
                                // }
                            // }
                            // else if (search_operator == 'between-time') {
                                // //Ti.API.info('here--------A.20');
                                // var search_time_value2 = search_value.time2;
                                // //Ti.API.info('here--------A.21');
                                // var compare_times2 = new Array();
                                // var value_index;
                                // for (value_index in node_values) {
// 
                                    // compare_times2[value_index] = search_time_value2 + mktime(0, 0, 0, date('n', Number(node_values[value_index])), date('j', Number(node_values[value_index])), date('Y', Number(node_values[value_index])));
                                    // //Ti.API.info('here--------A.22' + compare_times2[value_index] + "," + node_values[value_index]);
                                // }
// 
                                // if (search_time_value < search_time_value2) {
                                    // //Ti.API.info('here--------A.23');
                                    // // Like between 5:00PM - 8:00PM
                                    // var value_index;
                                    // for (value_index in node_values) {
                                        // //Ti.API.info('here--------A.24');
                                        // if (node_values[value_index] >= compare_times[value_index] && node_values[value_index] < compare_times2[value_index]) {
                                            // //Ti.API.info('here--------A.25');
                                            // row_matches[criteria_index] = true;
                                        // }
                                    // }
                                // }
                                // else {
                                    // //Ti.API.info('here--------A.25----1');
                                    // // Like between 8:00PM - 4:00AM
                                    // var value_index;
                                    // for (value_index in node_values) {
                                        // //Ti.API.info('here--------A.26');
                                        // if (node_values[value_index] >= compare_times[value_index] || node_values[value_index] < compare_times2[value_index]) {
                                            // //Ti.API.info('here--------A.26---1');
                                            // row_matches[criteria_index] = true;
                                        // }
                                    // }
                                // }
                            // }
                        // }
                        // else if (search_operator == '__blank') {
                            // //Ti.API.info('here--------A.26---2');
                            // row_matches[criteria_index] = true;
                            // var value_index;
                            // for (value_index in node_values) {
                                // //Ti.API.info('here--------A.26---3');
                                // node_value = node_values[value_index];
                                // if (node_value != null && node_value != "") {
                                    // //Ti.API.info('here--------A.26---4');
                                    // row_matches[criteria_index] = false;
                                // }
// 
                            // }
                        // }
                        // else if (search_operator == '__filled') {
                            // //Ti.API.info('here--------A.26---5');
                            // var value_index;
                            // for (value_index in node_values) {
                                // //Ti.API.info('here--------A.26---6');
                                // node_value = node_values[value_index];
                                // if (node_value != null && node_value != "") {
                                    // //Ti.API.info('here--------A.26---7');
                                    // row_matches[criteria_index] = true;
                                // }
// 
                            // }
                        // }
                        // else if (search_operator == 'weekday') {
                            // //Ti.API.info('here--------A.27' + search_value.weekday);
                            // var weekdays = search_value.weekday;
                            // if (!isArray(search_value.weekday)) {
                                // //Ti.API.info('here--------A.28' + search_value.weekday);
                                // weekdays = [];
                                // var key;
                                // for (key in search_value.weekday) {
                                    // //Ti.API.info('here--------A.29' + search_value.weekday);
                                    // if (search_value.weekday.hasOwnProperty(key)) {
                                        // //Ti.API.info('here--------A.30' + key);
                                        // weekdays.push(key);
                                    // }
                                // }
                            // }
// 
                            // var value_index;
                            // for (value_index in node_values) {
                                // //Ti.API.info('here--------A.31' + node_values[value_index] + ", " + date('w', Number(node_values[value_index])), weekdays);
                                // if (in_array(date('w', Number(node_values[value_index])), weekdays)) {
                                    // //Ti.API.info('here--------A.32' + date('w', Number(node_values[value_index])), weekdays);
                                    // row_matches[criteria_index] = true;
                                // }
                            // }
                        // }
                    // }
// 
                    // /* TODO ---- In Future
// 
                    // else
// 
                     // if(search_field['settings']['parts'] != null) {
// 
                     // if(search_field['type'] == 'location') {
                     // for(part in search_field['settings']['parts']) {
                     // search_value = isset($form_state['values']['search'][$search_field['field_name']][$part]) ? $form_state['values']['search'][$search_field['field_name']][$part] : $form_state['values']['search']['more_fields'][$search_field['field_name']][$part];
                     // $query->condition('l_' . $search_field['field_name'] . '.' . $part, '%' . $search_value . '%', 'LIKE');
                     // $search_fields[$search_key][$part]['default_value'] = $search_value;
                     // }
                     // object_lists_add_location_column($query, FALSE, $search_field, $id, $node_table);
                     // } else {
                     // for(part in search_field['settings']['parts']) {
                     // $search_value = isset($form_state['values']['search'][$search_field['field_name']][$part]) ? $form_state['values']['search'][$search_field['field_name']][$part] : $form_state['values']['search']['more_fields'][$search_field['field_name']][$part];
                     // $query->condition($search_field['field_name'] . '.' . $search_field['field_name'] . '_' . $part, '%' . $search_value . '%', 'LIKE');
                     // $search_fields[$search_key][$part]['default_value'] = $search_value;
                     // }
                     // object_lists_add_parts_column($query, FALSE, $search_field, $id, $node_table);
                     // }
// 
                     // }
                     // */
// 
                    // else {
                        // //Ti.API.info('here--------A.33');
                        // // if(entity[field_name] == null) {
                        // // entity[field_name] = null;
                        // // }
                        // search_value = criteria_row.value != null && criteria_row.value != "" ? criteria_row.value : null;
                        // search_operator = criteria_row.operator;
                        // //Ti.API.info('here--------A.34' + search_value + "," + search_operator);
                        // switch(search_field['type']) {
                            // case 'text':
                            // case 'text_long':
                            // case 'email':
                            // case 'link_field':
                            // case 'phone':
                                // for (idx in entity[field_name]) {
                                    // var elements = entity[field_name][idx];
                                    // if (elements['value'] != null && elements['value'] != "") {
                                        // node_values.push(elements['value']);
                                    // }
                                // }
                                // var value_index;
                                // for (value_index in node_values) {
                                    // node_value = node_values[value_index];
                                    // switch(search_operator) {
                                        // case 'not like':
                                            // if (strpos(node_value, search_value) === false) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
// 
                                        // case 'starts with':
                                            // if (strpos(node_value, search_value) === 0) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
// 
                                        // case 'ends with':
                                            // if (strpos(node_value, search_value) === node_value.length - search_value.length) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
// 
                                        // case 'not starts with':
                                            // if (strpos(node_value, search_value) !== 0) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
// 
                                        // case 'not ends with':
                                            // if (strpos(node_value, search_value) !== node_value.length - search_value.length) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
// 
                                        // default:
                                            // if (strpos(node_value, search_value) !== false) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
                                    // }
                                // }
// 
                                // break;
                            // case 'list_boolean':
                                // for (idx in entity[field_name]) {
                                    // var elements = entity[field_name][idx];
                                    // node_values.push(elements['value']);
                                // }
// 
                                // if (search_operator == '__filled') {
                                    // var value_index;
                                    // for (value_index in node_values) {
                                        // node_value = node_values[value_index];
                                        // if (node_value != 0) {
                                            // row_matches[criteria_index] = true;
                                        // }
// 
                                    // }
                                // }
                                // else {
                                    // if (node_values == null && node_values == "") {
                                        // row_matches[criteria_index] = true;
                                    // }
                                    // else {
                                        // var value_index;
                                        // for (value_index in node_values) {
                                            // node_value = node_values[value_index];
                                            // if (node_value == 0) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                        // }
                                    // }
                                // }
// 
                                // break;
                            // case 'calculation_field':
                                // //Ti.API.info('here--------A.35---1');
                                // var calculation_values = _calculation_field_get_values(win, db_display, content[entity[field_name][0]['reffer_index']], entity);
                                // //Ti.API.info('here--------A.35' + calculation_values);
                                // node_values.push(calculation_values[0].final_value);
// 
                                // var value_index;
                                // for (value_index in node_values) {
                                    // node_value = node_values[value_index];
                                    // //Ti.API.info('here--------A.36' + node_value);
                                    // switch(search_operator) {
// 
                                        // case '>':
                                            // //Ti.API.info('here--------A.37' + node_value + "," + search_value);
                                            // if (node_value > search_value) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
                                        // case '>=':
                                            // //Ti.API.info('here--------A.38' + node_value + "," + search_value);
                                            // if (node_value >= search_value) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
                                        // case '!=':
                                            // //Ti.API.info('here--------A.39' + node_value + "," + search_value);
                                            // if (node_value != search_value) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
                                        // case '<':
                                            // //Ti.API.info('here--------A.40' + node_value + "," + search_value);
                                            // if (node_value < search_value) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
                                        // case '<=':
                                            // //Ti.API.info('here--------A.41' + node_value + "," + search_value);
                                            // if (node_value <= search_value) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
                                        // default:
                                            // //Ti.API.info('here--------A.42' + node_value + "," + search_value);
                                            // if (node_value == search_value) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
                                    // }
                                // }
                                // break;
                            // case 'number_integer':
                            // case 'number_decimal':
                            // case 'auto_increment':
                                // for (idx in entity[field_name]) {
                                    // var elements = entity[field_name][idx];
                                    // if (elements['value'] != null && elements['value'] != "") {
                                        // node_values.push(elements['value']);
                                    // }
                                // }
// 
                                // var value_index;
                                // for (value_index in node_values) {
                                    // node_value = node_values[value_index];
                                    // switch(search_operator) {
// 
                                        // case '>':
                                            // if (node_value > search_value) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
                                        // case '>=':
                                            // if (node_value >= search_value) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
                                        // case '!=':
                                            // if (node_value != search_value) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
                                        // case '<':
                                            // if (node_value < search_value) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
                                        // case '<=':
                                            // if (node_value <= search_value) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
// 
                                        // default:
                                            // if (node_value == search_value) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // break;
                                    // }
                                // }
// 
                                // break;
// 
                            // case 'omadi_reference':
                                // for (idx in entity[field_name]) {
                                    // var elements = entity[field_name][idx];
                                    // if (elements['nid'] != null && elements['nid'] != "") {
                                        // node_values.push(elements['nid']);
                                    // }
                                // }
// 
                                // var reference_types = JSON.parse(search_field['settings'])['reference_types'];
                                // var array_filter = '';
                                // var reference_types_arr = [];
                                // var key;
                                // for (key in reference_types) {
                                    // reference_types_arr.push(reference_types[key]);
                                // }
// 
                                // var reference_types_idx;
                                // for ( reference_types_idx = 0; reference_types_idx < reference_types_arr.length; reference_types_idx++) {
                                    // if (reference_types_idx == reference_types_arr.length - 1) {
                                        // array_filter += '\'' + reference_types_arr[reference_types_idx] + '\'';
                                    // }
                                    // else {
                                        // array_filter += '\'' + reference_types_arr[reference_types_idx] + '\',';
                                    // }
                                // }
                                // var query = 'SELECT nid from node WHERE table_name IN (' + array_filter + ')';
                                // switch(search_operator) {
                                    // case 'starts with':
                                    // case 'not starts with':
                                        // query += ' AND title LIKE "%' + search_value + '%";'
                                        // break;
                                    // case 'ends with':
                                    // case 'not ends with':
                                        // query += ' AND title LIKE "%' + search_value + '";'
                                        // break;
                                    // default:
                                        // query += ' AND title LIKE "%' + search_value + '%";'
                                        // break;
                                // }
// 
                                // var possible_nids = db_display.execute(query);
                                // var possible_nids_arr = [];
                                // while (possible_nids.isValidRow()) {
                                    // possible_nids_arr.push(possible_nids.fieldByName('nid'));
                                    // possible_nids.next();
                                // }
// 
                                // switch(search_operator) {
                                    // case 'not starts with':
                                    // case 'not ends with':
                                    // case 'not like':
                                        // if (node_values[0] == 0) {
                                            // row_matches[criteria_index] = true;
                                        // }
                                        // else {
                                            // row_matches[criteria_index] = true;
                                            // for (idx in node_values) {
                                                // node_value = node_values[idx];
                                                // if (in_array(node_value, possible_nids_arr)) {
                                                    // row_matches[criteria_index] = false;
                                                // }
                                            // }
                                        // }
                                        // break;
                                    // default:
                                        // for (idx in node_values) {
                                            // node_value = node_values[idx];
                                            // if (in_array(node_value, possible_nids_arr)) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                        // }
                                        // break;
                                // }
// 
                                // break;
                            // case 'user_reference':
                                // //Ti.API.info('here--------A.43');
                                // if ((field_name == 'uid' || field_name == 'created' || field_name == 'changed_uid') && win.nid != null & win.nid != "") {
                                    // var node = db_display.execute('SELECT ' + field_name + ' from node WHERE nid="' + win.nid + '";');
                                    // if (field_name == 'uid') {
                                        // field_name = 'author_uid';
                                    // }
                                    // node_values.push(node.fieldByName(field_name));
                                // }
                                // else {
                                    // //Ti.API.info('here--------A.44');
                                    // for (idx in entity[field_name]) {
                                        // var elements = entity[field_name][idx];
                                        // //Ti.API.info('here--------A.45' + elements);
                                        // if (elements['uid'] != null && elements['uid'] != "") {
                                            // //Ti.API.info('here--------A.43' + elements['uid']);
                                            // node_values.push(elements['value']);
                                        // }
                                    // }
// 
                                // }
                                // if (search_value == 'current_user') {
                                    // search_value = win.uid;
                                // }
                                // // Make sure the search value is an array
                                // var search_value_arr = [];
                                // if (!isArray(search_value)) {
                                    // //Ti.API.info('here--------A.44' + search_value);
                                    // var key;
                                    // for (key in search_value) {
                                        // //Ti.API.info('here--------A.45' + key);
                                        // if (search_value.hasOwnProperty(key)) {
                                            // //Ti.API.info('here--------A.46' + key);
                                            // search_value_arr[key] = key;
                                        // }
                                    // }
                                    // search_value = search_value_arr;
                                // }
// 
                                // if (search_operator != null && search_operator == '!=') {
                                    // //Ti.API.info('here--------A.47' + search_value['__null']);
                                    // row_matches[criteria_index] = true;
                                    // if (search_value['__null'] == '__null' && (node_values == null || node_values[0] == null)) {
                                        // //Ti.API.info('here--------A.48');
                                        // row_matches[criteria_index] = false;
                                    // }
                                    // else {
                                        // //Ti.API.info('here--------A.49');
                                        // for (idx in search_value) {
                                            // //Ti.API.info('here--------A.50' + search_value[idx] + row_matches[criteria_index] + criteria_index);
                                            // chosen_value = search_value[idx];
                                            // if (in_array(chosen_value, node_values)) {
                                                // //Ti.API.info('here--------A.51' + chosen_value);
                                                // row_matches[criteria_index] = false;
                                            // }
                                        // }
                                    // }
                                // }
                                // else {
                                    // //Ti.API.info('here--------A.52');
                                    // if (search_value['__null'] == '__null' && (node_values == null || node_values[0] == null)) {
                                        // //Ti.API.info('here--------A.53');
                                        // row_matches[criteria_index] = true;
                                    // }
                                    // else {
                                        // //Ti.API.info('here--------A.54');
                                        // for (idx in search_value) {
                                            // //Ti.API.info('here--------A.55' + search_value[idx]);
                                            // chosen_value = search_value[idx];
                                            // if (in_array(chosen_value, node_values)) {
                                                // //Ti.API.info('here--------A.56' + chosen_value);
                                                // row_matches[criteria_index] = true;
                                            // }
                                        // }
                                    // }
                                // }
                                // break;
                            // case 'taxonomy_term_reference':
// 
                                // for (idx in entity[field_name]) {
                                    // elements = entity[field_name][idx];
                                    // if (elements['tid'] == 0) {
                                        // node_values.push(elements['tid']);
                                    // }
                                // }
// 
                                // if (JSON.parse(search_field['widget']).type == 'options_select' || JSON.parse(search_field['widget']).type == 'violation_select') {
                                    // // Make sure the search value is an array
                                    // var search_value_arr = [];
                                    // if (!isArray(search_value)) {
                                        // var key;
                                        // for (key in search_value) {
                                            // if (search_value.hasOwnProperty(key)) {
                                                // search_value_arr[key] = key;
                                            // }
                                        // }
                                        // search_value = search_value_arr;
                                    // }
// 
                                    // if (search_operator != null && search_operator == '!=') {
// 
                                        // row_matches[criteria_index] = true;
                                        // if (search_value['__null'] == '__null' && (node_values == null || node_values[0] == null)) {
                                            // row_matches[criteria_index] = false;
                                        // }
                                        // else {
                                            // for (idx in search_value) {
                                                // chosen_value = search_value[idx];
                                                // if (in_array(chosen_value, node_values)) {
                                                    // row_matches[criteria_index] = false;
                                                // }
                                            // }
// 
                                        // }
                                    // }
                                    // else {
                                        // if (search_value['__null'] == '__null' && (node_values == null || node_values[0] == null)) {
                                            // row_matches[criteria_index] = true;
                                        // }
                                        // else {
                                            // for (idx in search_value) {
                                                // chosen_value = search_value[idx];
                                                // if (in_array(chosen_value, node_values)) {
                                                    // row_matches[criteria_index] = true;
                                                // }
                                            // }
                                        // }
                                    // }
                                // }
                                // else {
                                    // var machine_name = JSON.parse(search_field['settings']).vocabulary;
                                    // var vocabulary = db_display.execute('SELECT vid from vocabulary WHERE machine_name="' + machine_name + '";');
                                    // var query = 'SELECT tid from term_data WHERE vid=' + vocabulary.fieldByName('vid');
                                    // switch(search_operator) {
                                        // case 'starts with':
                                        // case 'not starts with':
                                            // query += ' AND name LIKE "' + search_value + '%";'
                                            // break;
// 
                                        // case 'ends with':
                                        // case 'not ends with':
                                            // query += ' AND name LIKE "%' + search_value + '";'
                                            // break;
// 
                                        // default:
                                            // query += ' AND name LIKE "%' + search_value + '%";'
                                            // break;
                                    // }
                                    // //Ti.API.info(query);
                                    // var possible_tids = db_display.execute(query);
                                    // var possible_tids_arr = [];
                                    // while (possible_tids.isValidRow()) {
                                        // possible_tids_arr.push(possible_tids.fieldByName('tid'));
                                        // possible_tids.next();
                                    // }
// 
                                    // switch(search_operator) {
                                        // case 'not starts with':
                                        // case 'not ends with':
                                        // case 'not like':
                                            // if (node_values[0] == 0) {
                                                // row_matches[criteria_index] = true;
                                            // }
                                            // else {
                                                // row_matches[criteria_index] = true;
                                                // for (idx in node_values) {
                                                    // node_value = node_values[idx];
                                                    // if (in_array(node_value, possible_tids_arr)) {
                                                        // row_matches[criteria_index] = false;
                                                    // }
                                                // }
                                            // }
                                            // break;
// 
                                        // default:
                                            // for (idx in node_values) {
                                                // node_value = node_values[idx];
                                                // if (in_array(node_value, possible_tids_arr)) {
                                                    // row_matches[criteria_index] = true;
                                                // }
                                            // }
                                            // break;
                                    // }
                                // }
// 
                                // break;
// 
                            // case 'omadi_time':
                                // // TODO: Add the omadi_time field here
                                // break;
// 
                            // case 'image':
                                // // Do nothing
                                // break;
// 
                        // }
// 
                    // }
// 
                // }
            // }
// 
            // if (count_arr_obj(criteria['search_criteria']) == 1) {
                // //Ti.API.info('here--------A.57' + row_matches[criteria_index]);
                // var retval = row_matches[criteria_index];
            // }
            // else {
                // //Ti.API.info('here--------A.58');
                // // Group each criteria row into groups of ors with the matching result of each or
                // var and_groups = new Array();
                // var and_group_index = 0;
                // and_groups[and_group_index] = new Array();
                // //print_r($criteria['search_criteria']);
                // for (criteria_index in criteria['search_criteria']) {
                    // //Ti.API.info('here--------A.59' + criteria_index);
                    // criteria_row = criteria['search_criteria'][criteria_index];
                    // if (criteria_index == 0) {
                        // //Ti.API.info('here--------A.60' + row_matches[criteria_index]);
                        // //and_groups[and_group_index][0] = row_matches[criteria_index];
                        // and_groups[and_group_index].push(row_matches[criteria_index]);
                    // }
                    // else {
                        // //Ti.API.info('here--------A.61');
                        // if (criteria_row['row_operator'] == null || criteria_row['row_operator'] != 'or') {
                            // //Ti.API.info('here--------A.62');
                            // and_group_index++;
                            // and_groups[and_group_index] = new Array();
                        // }
                        // //Ti.API.info('here--------A.63' + row_matches[criteria_index]);
                        // and_groups[and_group_index].push(row_matches[criteria_index]);
                        // //and_groups[and_group_index][0] = row_matches[criteria_index];
                    // }
                // }
// 
                // // Get the final result, making sure each and group is TRUE
                // retval = true;
                // //Ti.API.info('here--------A.64' + and_groups.length);
                // for (idx in and_groups) {
                    // //Ti.API.info('here--------A.65');
                    // and_group = and_groups[idx];
                    // and_group_match = false;
                    // for (idx1 in and_group) {
                        // //Ti.API.info('here--------A.66' + and_group[idx1]);
                        // or_match = and_group[idx1];
                        // // Make sure at least one item in an and group is true (or the only item is true)
                        // if (or_match) {
                            // //Ti.API.info('here--------A.67');
                            // and_group_match = true;
                            // break;
                        // }
                    // }
// 
                    // // If one and group doesn't match the whole return value of this function is false
                    // if (!and_group_match) {
                        // //Ti.API.info('here--------A.68');
                        // retval = false;
                        // break;
                    // }
                // }
            // }
            // //Ti.API.info('here--------A.69' + retval);
            // return retval;
        // }
// 
        // // No conditions exist, so the row matches
// 
    // }
    // catch(e) {
    // }
    // return true;
// }


function omadi_time_seconds_to_string(seconds, format) {
    var am_pm = (strpos(format, 'H') === false);

    var hours = Math.floor(seconds / 3600);

    var hours_str = hours;
    if (hours_str < 10) {
        hours_str = '0' + hours_str;
    }

    var minutes = Math.floor((seconds - (hours * 3600)) / 60);
    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    var time_string = "";
    if (am_pm) {
        if (hours == 0) {
            time_string = '12:' + minutes + 'AM';
        }
        else if (hours == 12) {
            time_string = '12:' + minutes + 'PM';
        }
        else if (hours > 12) {
            var new_hours = hours - 12;
            hours_str = new_hours;
            if (new_hours < 10) {
                hours_str = '0' + new_hours;
            }
            time_string = hours_str + ':' + minutes + 'PM';
        }
        else {
            time_string = hours_str + ':' + minutes + 'AM';
        }
    }
    else {
        time_string = hours_str + ':' + minutes;
    }

    return time_string;
}

function rules_field_passed_time_check(time_rule, timestamp) {"use strict";
    
    var retval, timestamp_day, timestamp_midnight, days, day_rule, values, start_time, end_time;
    
    retval = false;
    
    timestamp_day = Number(date('w', Number(timestamp)));
    
    Ti.API.debug(timestamp_day);

    if (time_rule != '' && time_rule != null) {

        timestamp_midnight = mktime(0, 0, 0, date('n', Number(timestamp)), date('j', Number(timestamp)), date('Y', Number(timestamp)));

        days = time_rule.split(';');

        day_rule = days[timestamp_day];

        values = day_rule.split('|');

        if (values[0] == '1' || values[0] == 1) {
            if (values[1] == '1' || values[1] == 1) {
                retval = true;
            }
            else {
                start_time = Number(timestamp_midnight) + Number(values[2]);
                end_time = Number(timestamp_midnight) + Number(values[3]) + Number(59);

                // For times like 8:00PM - 5:00AM
                if (start_time > end_time) {
                    end_time = Number(end_time) + Number((3600 * 24));
                }

                if (Number(timestamp) >= Number(start_time) && Number(timestamp) <= Number(end_time)) {
                    retval = true;
                }
            }
        }

        if (retval == false) {
            if (timestamp_day == 0) {
                timestamp_day = 6;
            }
            else {
                timestamp_day--;
            }
            day_rule = days[timestamp_day];

            values = day_rule.split('|');
            if (values[0] == '1' && values[0] == 1) {
                if (values[1] == '1' && values[1] == 1) {
                    // Do nothing, since we're not on this previous day
                    // Do not return true
                    Ti.API.debug("");
                }
                else {
                    start_time = Number(timestamp_midnight) + Number(values[2]);
                    end_time = Number(timestamp_midnight) + Number(values[3]) + Number(59);
                    // For times like 8:00PM - 5:00AM
                    if (start_time > end_time) {
                        start_time = Number(start_time) - (3600 * 24);
                        // Only do the check if we're in a multi-day time span since we moved to the day before
                        if (Number(timestamp) >= Number(start_time) && Number(timestamp) <= Number(end_time)) {
                            retval = true;
                        }
                    }
                }
            }
        }
    }
    else {
        retval = true;
    }
    return retval;
}

