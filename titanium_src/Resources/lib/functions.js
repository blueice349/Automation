/*jslint eqeq: true, plusplus: true */
/*global Omadi, dbEsc*/

var domainName = Ti.App.Properties.getString("domainName");

Ti.App.isAndroid = (Ti.Platform.name === 'android');
Ti.App.isIOS = !Ti.App.isAndroid;

Ti.include('/lib/encoder_base_64.js');
Ti.include('/lib/util_functions.js');
Ti.include('/lib/data_functions.js');
Ti.include('/lib/display_functions.js');

var ROLE_ID_ADMIN = 3;
var app_timestamp = 0;

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

function createNotification(message) {"use strict";
    var mainIntent, pending, notification;
    /*jslint bitwise: true*/
    try {
        if (Omadi.utils.isLoggedIn() && !Ti.App.Properties.getBool('stopGPS', false)) {
            if (Ti.App.isAndroid) {
                mainIntent = Titanium.Android.createIntent({
                    className : 'org.appcelerator.titanium.TiActivity',
                    packageName : 'com.omadi.crm',
                    flags : Titanium.Android.FLAG_ACTIVITY_CLEAR_TOP | Titanium.Android.FLAG_ACTIVITY_SINGLE_TOP
                });

                pending = Titanium.Android.createPendingIntent({
                    activity : Titanium.Android.currentActivity,
                    intent : mainIntent,
                    type : Titanium.Android.PENDING_INTENT_FOR_ACTIVITY,
                    flags : Titanium.Android.FLAG_UPDATE_CURRENT
                });

                notification = Titanium.Android.createNotification({
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
    }
    catch(nothing) {

    }
}

function notifyIOS(msg, update_time) {"use strict";
    var time, slide_it_top, win, view, label, slide_it_out;
    
    if (update_time === true) {
        time = Math.round(new Date().getTime() / 1000);
        Ti.App.Properties.setString("last_alert_popup", time);
    }

    slide_it_top = Titanium.UI.createAnimation();
    slide_it_top.top = 0;
    // to put it back to the left side of the window
    slide_it_top.duration = 400;
    win = Titanium.UI.createWindow({
        height : 50,
        width : "100%",
        top : -50,
        navBarHidden : true,
        zIndex : -1000
    });

    view = Titanium.UI.createView({
        backgroundColor : '#000',
        opacity : 0.8,
        height : "100%",
        zIndex : -1000
    });

    label = Titanium.UI.createLabel({
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
        slide_it_out = Titanium.UI.createAnimation();
        slide_it_out.top = -50;
        // to put it back to the left side of the window
        slide_it_out.duration = 400;
        win.close(slide_it_out);
    }, 2000);
}

function isNumber(n) {"use strict";
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function treatArray(num_to_insert, call_id) {"use strict";

    var separator, content_s, array_size, test1, test2, count_a, key, blah;
    
    /*global Base64*/
    
    // Insert array in a better way?
    // Optimization matters!
    // data separator

    separator = 'j8Oc2s1E';
    content_s = '';
    array_size = num_to_insert.length;

    test1 = 0;
    test2 = 0;
    count_a = 0;

    if (array_size == 0) {
        //Pack everything
        content_s = Base64.encode("null");
        return content_s;
    }

    if (array_size == 1) {
        //Pack everything
        //Ti.API.info(num_to_insert[0]);
        if (num_to_insert[0] != null) {
            content_s = Base64.encode(num_to_insert[0]);
        }
        else {
            content_s = Base64.encode("null");
        }
        return content_s;
    }

    for (key in num_to_insert) {
        if(num_to_insert.hasOwnProperty(key)){
            count_a++;
            if (count_a < array_size) {
                content_s += num_to_insert[key] + separator;
                test1++;
            }
            else if (count_a == array_size) {
                content_s += num_to_insert[key] + ''.toString();
                test2++;
            }
        }
    }

    if ((test1 < 1) || (test2 != 1)) {
        Ti.API.error('@Developer, check arrays insertion! _' + call_id);
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
}

function isJsonString(str) {"use strict";
    if (str == "" || str == null) {
        return false;
    }
   
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    
    return true;
}

function clearCache() {"use strict";
    var path, cookies;
    
    path = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDirectory).getParent();
    cookies = Ti.Filesystem.getFile(path + '/Library/Cookies', 'Cookies.binarycookies');
    if (cookies.exists()) {
        cookies.deleteFile();
    }

}

// PHP equivelent function in javaScript----START
function mktime() {"use strict";
    var no, ma = 0, mb = 0, i = 0, d = new Date(), argv = arguments, argc = argv.length, dateManip, set;

    if (argc > 0) {
        d.setHours(0, 0, 0);
        d.setDate(1);
        d.setMonth(1);
        d.setYear(1972);
    }

    dateManip = {
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
            set = d.setMonth(parseInt(tt, 10) - 1);
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
        no = parseInt(argv[i], 10);
        if (isNaN(no)) {
            return false;
        }
        
        // arg is number, let's manipulate date object
        if (!dateManip[i](no)) {
            // failed
            return false;
        }
        
    }

    return Math.floor(d.getTime() / 1000);
}

// function date(format, timestamp) {"use strict";
    // var a, jsdate, pad, txt_weekdays, txt_ordin, txt_months, f;
//     
    // /*jslint bitwise: true*/
//     
    // jsdate = (( typeof (timestamp) == 'undefined') ? new Date() : ( typeof (timestamp) == 'number') ? new Date(timestamp * 1000) : new Date(timestamp));
//     
    // pad = function(n, c) {
        // if (( n = n + "".toString()).length < c) {
            // return [++c - n.length].join("0") + n;
        // }
//         
        // return n;
//         
    // };
    // txt_weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // txt_ordin = {
        // 1 : "st",
        // 2 : "nd",
        // 3 : "rd",
        // 21 : "st",
        // 22 : "nd",
        // 23 : "rd",
        // 31 : "st"
    // };
//     
    // txt_months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// 
    // f = {
        // // Day
        // d : function() {
            // return pad(f.j(), 2);
        // },
        // D : function() {
            // var t = f.l();
            // return t.substr(0, 3);
        // },
        // j : function() {
            // return jsdate.getDate();
        // },
        // l : function() {
            // return txt_weekdays[f.w()];
        // },
        // N : function() {
            // return f.w() + 1;
        // },
        // S : function() {
            // return txt_ordin[f.j()] || 'th';
        // },
        // w : function() {
            // return jsdate.getDay();
        // },
        // z : function() {
            // return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0;
        // },
// 
        // // Week
        // W : function() {
            // var a = f.z(), b = 364 + f.L() - a, nd2, nd;
            // nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;
// 
            // if (b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b) {
                // return 1;
            // }
//             
// 
            // if (a <= 2 && nd >= 4 && a >= (6 - nd)) {
                // nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
                // return date("W", Math.round(nd2.getTime() / 1000));
            // }
//             
            // return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
        // },
// 
        // // Month
        // F : function() {
            // return txt_months[f.n()];
        // },
        // m : function() {
            // return pad(f.n(), 2);
        // },
        // M : function() {
            // var t = f.F();
            // return t.substr(0, 3);
        // },
        // n : function() {
            // return jsdate.getMonth() + 1;
        // },
        // t : function() {
            // var n;
            // /*jslint bitwise: true*/
            // if (( n = jsdate.getMonth() + 1) == 2) {
                // return 28 + f.L();
            // }
//             
                // if (n & 1 && n < 8 || !(n & 1) && n > 7) {
                    // return 31;
                // }
//                
                    // return 30;
//                
        // },
// 
        // // Year
        // L : function() {
            // var y = f.Y();
            // return (!(y & 3) && (y % 1e2 || !(y % 4e2))) ? 1 : 0;
        // },
        // o : function() {
            // if (f.n() === 12 && f.W() === 1) {
                // return jsdate.getFullYear() + 1;
            // }
            // if (f.n() === 1 && f.W() >= 52) {
                // return jsdate.getFullYear() - 1;
            // }
            // return jsdate.getFullYear();
        // },
        // Y : function() {
            // return jsdate.getFullYear();
        // },
        // y : function() {
            // return (jsdate.getFullYear() + "").slice(2);
        // },
// 
        // // Time
        // a : function() {
            // return jsdate.getHours() > 11 ? "pm" : "am";
        // },
        // A : function() {
            // return f.a().toUpperCase();
        // },
        // B : function() {
            // // peter paul koch:
            // var off = (jsdate.getTimezoneOffset() + 60) * 60;
            // var theSeconds = (jsdate.getHours() * 3600) + (jsdate.getMinutes() * 60) + jsdate.getSeconds() + off;
            // var beat = Math.floor(theSeconds / 86.4);
            // if (beat > 1000)
                // beat -= 1000;
            // if (beat < 0)
                // beat += 1000;
            // if ((String(beat)).length == 1)
                // beat = "00" + beat;
            // if ((String(beat)).length == 2)
                // beat = "0" + beat;
            // return beat;
        // },
        // g : function() {
            // return jsdate.getHours() % 12 || 12;
        // },
        // G : function() {
            // return jsdate.getHours();
        // },
        // h : function() {
            // return pad(f.g(), 2);
        // },
        // H : function() {
            // return pad(jsdate.getHours(), 2);
        // },
        // i : function() {
            // return pad(jsdate.getMinutes(), 2);
        // },
        // s : function() {
            // return pad(jsdate.getSeconds(), 2);
        // },
        // u : function() {
            // return pad(jsdate.getMilliseconds() * 1000, 6);
        // },
// 
        // // Timezone
        // //e not supported yet
        // I : function() {
            // var DST = (new Date(jsdate.getFullYear(), 6, 1, 0, 0, 0));
            // DST = DST.getHours() - DST.getUTCHours();
            // var ref = jsdate.getHours() - jsdate.getUTCHours();
            // return ref != DST ? 1 : 0;
        // },
        // O : function() {
            // var t = pad(Math.abs(jsdate.getTimezoneOffset() / 60 * 100), 4);
            // if (jsdate.getTimezoneOffset() > 0)
                // t = "-" + t;
            // else
                // t = "+" + t;
            // return t;
        // },
        // P : function() {
            // var O = f.O();
            // return (O.substr(0, 3) + ":" + O.substr(3, 2));
        // },
        // //T not supported yet
        // Z : function() {
            // var t = -jsdate.getTimezoneOffset() * 60;
            // return t;
        // },
// 
        // // Full Date/Time
        // c : function() {
            // return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P();
        // },
        // r : function() {
            // return f.D() + ', ' + f.d() + ' ' + f.M() + ' ' + f.Y() + ' ' + f.H() + ':' + f.i() + ':' + f.s() + ' ' + f.O();
        // },
        // U : function() {
            // return Math.round(jsdate.getTime() / 1000);
        // }
    // };
// 
    // return format.replace(/[\\]?([a-zA-Z])/g, function(t, s) {
        // if (t != s) {
            // // escaped
            // ret = s;
        // }
        // else if (f[s]) {
            // // a date function exists
            // ret = f[s]();
        // }
        // else {
            // // nothing special
            // ret = s;
        // }
// 
        // return ret;
    // });
// }

Number.prototype.toCurrency = function(str) {"use strict";// extending Number prototype
    /*jslint nomen: true*/
   
    String.prototype.separate_thousands = function() {// Thousands separation
        var val, rx;
        val = this;
        rx = new RegExp('(-?[0-9]+)([0-9]{3})');
        while (rx.test(val)) {
            val = val.replace(rx, '$1' + str.thousands_separator + '$2');
        }
        return val;
    };

    Number.prototype.toFixed = function() {// Rounding
        var m = Math.pow(10, str.use_fractions.fractions);
        return Math.round(this * m, 0) / m;
    };

    String.prototype.times = function(by) {// String multiplication
        /*jslint bitwise: true*/
        by = (by >> 0);
        var t = (by > 1 ? this.times(by / 2) : '' );
        return t + (by % 2 ? t + this : t);
    };
   
    if(!str){
       str = {}; 
    } 
    if(!str.thousands_separator){
        str.thousands_separator = ",";
    }
    if(!str.currency_symbol){
        str.currency_symbol = "";
    }

    // Fractions use is separated, just in case you don't want them
    if (str.use_fractions) {
        if(!str.use_fractions.fractions){
            str.use_fractions.fractions = 2;
        }
        if(!str.use_fractions.fraction_separator){
            str.use_fractions.fraction_separator = ".";
        }
    }
    else {
        str.use_fractions = {};
        str.use_fractions.fractions = 0;
        str.use_fractions.fraction_separator = " ";
    }
    // We round this number
    this.round = this.toFixed();

    // We convert rounded Number to String and split it to integrer and fractions
    this.arr = (this.round + "".toString()).split(".");
    // First part is an integrer
    this._int = this.arr[0].separate_thousands();
    // Second part, if exists, are rounded decimals
    if(this.arr[1] == undefined){
        this._dec = str.use_fractions.fraction_separator + "0".times(str.use_fractions.fractions);
    }
    else{
        this._dec = str.use_fractions.fraction_separator + this.arr[1] + "0".times(str.use_fractions.fractions - (this.arr[1] + "".toString()).length);
    }

    /* If no symbol_position is present, default to "front" */
    if(!str.symbol_position){
        str.symbol_position = "front";
    }
    
    if(str.symbol_position == "front"){
        this.ret = str.currency_symbol + this._int + this._dec;
    }
    else{
        this.ret = this._int + this._dec + " " + str.currency_symbol;
    }
    return this.ret;
};

var in_array = function(p_val, haystack) {"use strict";
    var i;
    for (i = 0; i < haystack.length; i++) {
        if (haystack[i] == p_val) {
            return true;
        }
    }
    return false;
};

function isArray(input) {"use strict";
    return typeof (input) == 'object' && ( input instanceof Array);
}

function strpos(haystack, needle, offset) {"use strict";
    var i = (haystack + ''.toString()).indexOf(needle, (offset || 0));
    return i === -1 ? false : i;
}

function list_search_node_matches_search_criteria(node, criteria) {"use strict";

    var user, row_matches, instances, i, j, criteria_index, criteria_row, field_name, search_field, search_value, search_operator, search_time_value, compare_times, value_index, nodeDBValues, nodeTextValues, search_time_value2, compare_times2, node_value, weekdays, reference_types, db, result, query, possibleValues, searchValues, chosen_value, retval, and_groups, and_group, and_group_index, and_group_match;

    /*jslint nomen: true*/

    try {

        row_matches = [];
        if ( typeof criteria.search_criteria !== 'undefined' && criteria.search_criteria != "") {

            instances = Omadi.data.getFields(node.type);

            for (criteria_index in criteria.search_criteria) {
                if (criteria.search_criteria.hasOwnProperty(criteria_index)) {

                    criteria_row = criteria.search_criteria[criteria_index];
                    row_matches[criteria_index] = false;
                    field_name = criteria_row.field_name;
                    nodeDBValues = node[field_name].dbValues;
                    nodeTextValues = node[field_name].textValues;

                    if (instances[field_name] != null) {
                        search_field = instances[field_name];

                        if (search_field.type == 'datestamp') {

                            search_value = criteria_row.value;
                            search_operator = criteria_row.operator + "".toString();

                            if (['after-time', 'before-time', 'between-time'].indexOf(search_operator) != -1) {

                                search_time_value = Number(search_value.time);
                                compare_times = [];

                                for ( i = 0; i < nodeDBValues.length; i++) {
                                    compare_times[i] = search_time_value + mktime(0, 0, 0, Omadi.utils.PHPFormatDate('n', Number(nodeDBValues[i])), Omadi.utils.PHPFormatDate('j', Number(nodeDBValues[i])), Omadi.utils.PHPFormatDate('Y', Number(nodeDBValues[i])));
                                }

                                if (search_operator == 'after-time') {

                                    for ( i = 0; i < nodeDBValues.length; i++) {

                                        if (nodeDBValues[i] > compare_times[i]) {

                                            row_matches[criteria_index] = true;
                                        }
                                    }
                                }
                                else if (search_operator == 'before-time') {

                                    for ( i = 0; i < nodeDBValues.length; i++) {

                                        if (nodeDBValues[i] < compare_times[i]) {

                                            row_matches[criteria_index] = true;
                                        }
                                    }
                                }
                                else if (search_operator == 'between-time') {

                                    search_time_value2 = search_value.time2;

                                    compare_times2 = [];

                                    for ( i = 0; i < nodeDBValues.length; i++) {

                                        compare_times2[i] = search_time_value2 + mktime(0, 0, 0, Omadi.utils.PHPFormatDate('n', Number(nodeDBValues[i])), Omadi.utils.PHPFormatDate('j', Number(nodeDBValues[i])), Omadi.utils.PHPFormatDate('Y', Number(nodeDBValues[i])));

                                    }

                                    if (search_time_value < search_time_value2) {

                                        // Like between 5:00PM - 8:00PM

                                        for ( i = 0; i < nodeDBValues.length; i++) {

                                            if (nodeDBValues[i] >= compare_times[i] && nodeDBValues[i] < compare_times2[i]) {

                                                row_matches[criteria_index] = true;
                                            }
                                        }
                                    }
                                    else {

                                        // Like between 8:00PM - 4:00AM

                                        for ( i = 0; i < nodeDBValues.length; i++) {

                                            if (nodeDBValues[i] >= compare_times[i] || nodeDBValues[i] < compare_times2[i]) {

                                                row_matches[criteria_index] = true;
                                            }
                                        }
                                    }
                                }
                            }
                            else if (search_operator == '__blank') {

                                row_matches[criteria_index] = true;

                                for ( i = 0; i < nodeDBValues.length; i++) {

                                    node_value = nodeDBValues[i];
                                    if (node_value != null && node_value != "") {

                                        row_matches[criteria_index] = false;
                                    }

                                }
                            }
                            else if (search_operator == '__filled') {

                                for ( i = 0; i < nodeDBValues.length; i++) {

                                    node_value = nodeDBValues[i];
                                    if (node_value != null && node_value != "") {

                                        row_matches[criteria_index] = true;
                                    }

                                }
                            }
                            else if (search_operator == 'weekday') {

                                weekdays = search_value.weekday;
                                if (!isArray(search_value.weekday)) {

                                    weekdays = [];

                                    for (i in search_value.weekday) {
                                        if (search_value.weekday.hasOwnProperty(i)) {

                                            weekdays.push(i);
                                        }
                                    }
                                }

                                for ( i = 0; i < nodeDBValues.length; i++) {

                                    if (in_array(Omadi.utils.PHPFormatDate('w', Number(nodeDBValues[i])))) {

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

                            search_value = criteria_row.value != null && criteria_row.value != "" ? criteria_row.value : null;
                            search_operator = criteria_row.operator;

                            switch(search_field.type) {
                                case 'text':
                                case 'text_long':
                                case 'phone':
                                case 'email':
                                case 'link_field':

                                    // Check for empty values
                                    if (nodeDBValues.length === 0) {
                                        if (Omadi.utils.isEmpty(search_value) && search_operator === '=') {
                                            row_matches[criteria_index] = true;
                                        }
                                    }

                                    for ( i = 0; i < nodeDBValues.length; i++) {
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

                                            case '=':
                                                if (node_value == search_value) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;

                                            case '!=':
                                                if (node_value != search_value) {
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

                                    if (search_operator == '__filled') {

                                        for ( i = 0; i < nodeDBValues.length; i++) {
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
                                            for ( i = 0; i < nodeDBValues.length; i++) {
                                                node_value = nodeDBValues[i];
                                                if (node_value == 0) {
                                                    row_matches[criteria_index] = true;
                                                }
                                            }
                                        }
                                    }

                                    break;

                                case 'calculation_field':

                                    for ( i = 0; i < nodeDBValues.length; i++) {
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
                                case 'number_integer':
                                case 'number_decimal':
                                case 'auto_increment':

                                    for ( i = 0; i < nodeDBValues.length; i++) {
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

                                    reference_types = [];

                                    for (i in search_field.settings.reference_types) {
                                        if (search_field.settings.reference_types.hasOwnProperty(i)) {
                                            reference_types.push(search_field.settings.reference_types[i]);
                                        }
                                    }

                                    query = 'SELECT nid from node WHERE table_name IN (' + reference_types.join(',') + ')';
                                    switch(search_operator) {
                                        case 'starts with':
                                        case 'not starts with':
                                            query += " AND title LIKE '%" + dbEsc(search_value) + "%'";
                                            break;
                                        case 'ends with':
                                        case 'not ends with':
                                            query += " AND title LIKE '%" + dbEsc(search_value) + "'";
                                            break;
                                        case '=':
                                        case '!=':
                                            query += " AND title='" + dbEsc(search_value) + "'";
                                            break;
                                        default:
                                            query += " AND title LIKE '%" + dbEsc(search_value) + "'%";
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
                                    
                                    if(nodeDBValues.length == 0){
                                        if(Omadi.utils.isEmpty(search_value) && search_operator === '='){
                                            row_matches[criteria_index] = true;
                                        }
                                    }

                                    switch(search_operator) {
                                        case 'not starts with':
                                        case 'not ends with':
                                        case 'not like':
                                        case '!=':
                                            if (nodeDBValues[0] == 0) {
                                                row_matches[criteria_index] = true;
                                            }
                                            else {
                                                row_matches[criteria_index] = true;
                                                for ( i = 0; i < nodeDBValues.length; i++) {
                                                    node_value = nodeDBValues[i];
                                                    if (in_array(node_value, possibleValues)) {
                                                        row_matches[criteria_index] = false;
                                                    }
                                                }
                                            }
                                            break;
                                        default:
                                            for ( i = 0; i < nodeDBValues.length; i++) {
                                                node_value = nodeDBValues[i];
                                                if (in_array(node_value, possibleValues)) {
                                                    row_matches[criteria_index] = true;
                                                }
                                            }
                                            break;
                                    }

                                    break;

                                case 'user_reference':

                                    if (search_value == 'current_user') {
                                        search_value = Omadi.utils.getUid();
                                    }
                                    // Make sure the search value is an array
                                    searchValues = [];
                                    if (!isArray(search_value)) {

                                        for (i in search_value) {
                                            if (search_value.hasOwnProperty(i)) {

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

                                            for ( i = 0; i < search_value.length; i++) {

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

                                            for ( i = 0; i < search_value.length; i++) {

                                                chosen_value = search_value[i];
                                                if (in_array(chosen_value, nodeDBValues)) {

                                                    row_matches[criteria_index] = true;
                                                }
                                            }
                                        }
                                    }
                                    break;

                                case 'taxonomy_term_reference':

                                    if (search_field.widget.type == 'options_select' || search_field.widget.type == 'violation_select') {
                                        // Make sure the search value is an array
                                        searchValues = [];
                                        if (!isArray(search_value)) {

                                            for (i in search_value) {
                                                if (search_value.hasOwnProperty(i)) {

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
                                                for ( i = 0; i < search_value.length; i++) {
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
                                                for ( i = 0; i < search_value.length; i++) {
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
                                                query += " AND name LIKE '" + dbEsc(search_value) + "%'";
                                                break;

                                            case 'ends with':
                                            case 'not ends with':
                                                query += " AND name LIKE '%" + dbEsc(search_value) + "'";
                                                break;

                                            default:
                                                query += " AND name LIKE '%" + dbEsc(search_value) + "%'";
                                                break;
                                        }

                                        result.close();

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
                                                    for ( i = 0; i < nodeDBValues.length; i++) {
                                                        node_value = nodeDBValues[i];
                                                        if (in_array(node_value, possibleValues)) {
                                                            row_matches[criteria_index] = false;
                                                        }
                                                    }
                                                }
                                                break;

                                            default:
                                                for ( i = 0; i < nodeDBValues.length; i++) {
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

            if (criteria.search_criteria.length == 1) {

                retval = row_matches[criteria_index];
            }
            else {

                // Group each criteria row into groups of ors with the matching result of each or
                and_groups = [];
                and_group_index = 0;
                and_groups[and_group_index] = [];

                for (criteria_index in criteria.search_criteria) {
                    if (criteria.search_criteria.hasOwnProperty(criteria_index)) {

                        criteria_row = criteria.search_criteria[criteria_index];
                        if (criteria_index == 0) {

                            and_groups[and_group_index].push(row_matches[criteria_index]);
                        }
                        else {

                            if (criteria_row.row_operator == null || criteria_row.row_operator != 'or') {

                                and_group_index++;
                                and_groups[and_group_index] = [];
                            }

                            and_groups[and_group_index].push(row_matches[criteria_index]);

                        }
                    }
                }

                // Get the final result, making sure each and group is TRUE
                retval = true;

                for ( i = 0; i < and_groups.length; i++) {

                    and_group = and_groups[i];
                    and_group_match = false;
                    for ( j = 0; j < and_group.length; j++) {

                        // Make sure at least one item in an and group is true (or the only item is true)
                        if (and_group[j]) {

                            and_group_match = true;
                            break;
                        }
                    }

                    // If one and group doesn't match the whole return value of this function is false
                    if (!and_group_match) {

                        retval = false;
                        break;
                    }
                }
            }

            return retval;
        }

        // No conditions exist, so the row matches

    }
    catch(e) {
    }
    return true;
}

function rules_field_passed_time_check(time_rule, timestamp) {"use strict";

    var retval, timestamp_day, timestamp_midnight, days, day_rule, values, start_time, end_time;

    retval = false;

    timestamp_day = Number(Omadi.utils.PHPFormatDate('w', Number(timestamp)));

    Ti.API.debug(timestamp_day);

    if (time_rule != '' && time_rule != null) {

        timestamp_midnight = mktime(0, 0, 0, Omadi.utils.PHPFormatDate('n', Number(timestamp)), Omadi.utils.PHPFormatDate('j', Number(timestamp)), Omadi.utils.PHPFormatDate('Y', Number(timestamp)));

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

