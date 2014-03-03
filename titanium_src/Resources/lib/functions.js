/*jslint eqeq:true,plusplus:true */
/*global Omadi,dbEsc*/

var domainName = Ti.App.Properties.getString("domainName");

Ti.App.isAndroid = (Ti.Platform.name === 'android');
Ti.App.isIOS = !Ti.App.isAndroid;
Ti.App.isIOS7 = false;
if(Ti.App.isIOS){
    var version = Ti.Platform.version.split(".");
    var major = parseInt(version[0]);
    if(major >= 7){
        Ti.App.isIOS7 = true;
    }
}

Ti.include('/lib/encoder_base_64.js');
Ti.include('/lib/util_functions.js');
Ti.include('/lib/data_functions.js');
Ti.include('/lib/display_functions.js');
Ti.include('/lib/bundle_functions.js');
Ti.include('/lib/print_functions.js');

if(Ti.App.isAndroid){
    Ti.include('/lib/android/background.js');
}

Ti.include('/lib/push_notifications.js');

var ROLE_ID_ADMIN = 3;
var ROLE_ID_MANAGER = 4;
var ROLE_ID_SALES = 5;
var ROLE_ID_FIELD = 6;
var ROLE_ID_CLIENT = 7;
var ROLE_ID_OMADI_AGENT = 8;

var app_timestamp = 0;

var newNotificationCount = 0;
var newNotificationNid = 0;

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
        time = Omadi.utils.getUTCTimestamp();
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
        zIndex : -1000,
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
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

function strpos(haystack, needle, offset) {"use strict";
    var i = (haystack + ''.toString()).indexOf(needle, (offset || 0));
    return i === -1 ? false : i;
}

function list_search_node_matches_search_criteria(node, criteria) {"use strict";

    var user, row_matches, instances, i, j, criteria_index, criteria_row, field_name, 
    search_field, search_value, search_operator, search_time_value, compare_times, 
    value_index, nodeDBValues, nodeTextValues, search_time_value2, compare_times2, 
    node_value, weekdays, reference_types, db, result, query, possibleValues, 
    searchValues, chosen_value, retval, and_groups, and_group, and_group_index, 
    and_group_match, useNids;

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
                                if (!Omadi.utils.isArray(search_value.weekday)) {

                                    weekdays = [];

                                    for (i in search_value.weekday) {
                                        if (search_value.weekday.hasOwnProperty(i)) {

                                            weekdays.push(i);
                                        }
                                    }
                                }

                                for ( i = 0; i < nodeDBValues.length; i++) {

                                    if (Omadi.utils.inArray(Omadi.utils.PHPFormatDate('w', Number(nodeDBValues[i])), weekdays)) {

                                        row_matches[criteria_index] = true;
                                        Ti.API.debug("IS WEEKDAY MATCH");
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

                                    if (search_operator == '__blank') {
                                        row_matches[criteria_index] = true;
                                    }

                                    for ( i = 0; i < nodeDBValues.length; i++) {
                                        node_value = nodeDBValues[i];
                                        switch(search_operator) {
                                            case '__filled':
                                                if (node_value !== null && node_value > '') {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
                                            case '__blank':
                                                if (nodeDBValues[i] !== null && nodeDBValues[i] > '') {
                                                    row_matches[criteria_index] = false;
                                                }
                                                break;
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
                                    
                                    if (search_operator == '__blank') {
                                        row_matches[criteria_index] = true;
                                    }
                                    
                                    for ( i = 0; i < nodeDBValues.length; i++) {
                                        node_value = nodeDBValues[i];
                                        switch(search_operator) {
                                            case '__filled':
                                                if (node_value !== null && node_value > '') {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
                                            case '__blank':
                                                if (nodeDBValues[i] !== null && nodeDBValues[i] > '') {
                                                    row_matches[criteria_index] = false;
                                                }
                                                break;
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
                                    
                                case 'extra_price':
                                    
                                    if (search_operator == '__blank') {
                                        row_matches[criteria_index] = true;
                                    }
                                    
                                    for ( i = 0; i < nodeDBValues.length; i++) {
                                        node_value = nodeDBValues[i];
                                        switch(search_operator) {
                                            case '__filled':
                                                if (node_value != 0) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;
                                                
                                            case '__blank':
                                                if (nodeDBValues[i] != 0) {
                                                    row_matches[criteria_index] = false;
                                                }
                                                break;
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

                                    if (search_operator == '__blank') {
                                        row_matches[criteria_index] = true;
                                        if (nodeDBValues.length > 0) {
                                            for ( i = 0; i < nodeDBValues.length; i++) {
                                                if (nodeDBValues[i] !== null && nodeDBValues[i] > '') {
                                                    row_matches[criteria_index] = false;
                                                }
                                            }
                                        }
                                    }
                                    else if (search_operator == '__filled') {
                                        if (nodeDBValues.length > 0) {
                                            for ( i = 0; i < nodeDBValues.length; i++) {
                                                if (nodeDBValues[i] !== null && nodeDBValues[i] > '') {
                                                    row_matches[criteria_index] = true;
                                                }
                                            }
                                        }
                                    }
                                    else{
                                        reference_types = [];
    
                                        for (i in search_field.settings.reference_types) {
                                            if (search_field.settings.reference_types.hasOwnProperty(i)) {
                                                reference_types.push(search_field.settings.reference_types[i]);
                                            }
                                        }
    
                                        query = "SELECT nid, title FROM node WHERE table_name IN ('" + reference_types.join("','") + "')";
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
                                                
                                                if(typeof search_field.widget.type !== 'undefined' && search_field.widget.type == 'omadi_reference_select'){
                                                    // Make sure the search value is an array
                                                    searchValues = [];
                                                    if (!Omadi.utils.isArray(search_value)) {

                                                        for (i in search_value) {
                                                            if (search_value.hasOwnProperty(i)) {
                
                                                                searchValues.push(i);
                                                            }
                                                        }
                                                        search_value = searchValues;
                                                    }
                                                    
                                                    useNids = true;
                                                    for(i in search_value){
                                                        if(search_value.hasOwnProperty(i)){
                                                            if(isNaN(parseInt(search_value[i], 10))){
                                                                useNids = false;
                                                                break;
                                                            }   
                                                        }
                                                    }
                                                    
                                                    
                                                    if(useNids){
                                                        query += " AND nid IN (" + dbEsc(search_value.join(",")) + ")";
                                                    }
                                                    else{
                                                        query += " AND title='" + dbEsc(search_value[0]) + "'";
                                                    }
                                                }
                                                else{
                                                    query += " AND title='" + dbEsc(search_value) + "'";
                                                }
                                                
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
    
                                        if (nodeDBValues.length == 0) {
                                            if (Omadi.utils.isEmpty(search_value) && search_operator === '=') {
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
                                                        if (Omadi.utils.inArray(node_value, possibleValues)) {
                                                            row_matches[criteria_index] = false;
                                                        }
                                                    }
                                                }
                                                
                                                Ti.API.info("!= " + row_matches[criteria_index]);
                                                break;
                                            default:
                                                for ( i = 0; i < nodeDBValues.length; i++) {
                                                    node_value = nodeDBValues[i];
                                                    if (Omadi.utils.inArray(node_value, possibleValues)) {
                                                        row_matches[criteria_index] = true;
                                                    }
                                                }
                                                
                                                Ti.API.info("equal " + row_matches[criteria_index]);
                                                break;
                                        }
                                    }

                                    break;

                                case 'user_reference':

                                    if (search_value == 'current_user') {
                                        search_value = Omadi.utils.getUid();
                                    }
                                    // Make sure the search value is an array
                                    searchValues = [];
                                    if (!Omadi.utils.isArray(search_value)) {

                                        for (i in search_value) {
                                            if (search_value.hasOwnProperty(i)) {

                                                searchValues.push(i);
                                            }
                                        }
                                        search_value = searchValues;
                                    }
                                    
                                    
                                    if (search_operator == '__blank') {
                                        row_matches[criteria_index] = true;
                                        if (nodeDBValues.length > 0) {
                                            for ( i = 0; i < nodeDBValues.length; i++) {
                                                if (nodeDBValues[i] !== null && nodeDBValues[i] > '') {
                                                    row_matches[criteria_index] = false;
                                                }
                                            }
                                        }
                                    }
                                    else if (search_operator == '__filled') {
                                        if (nodeDBValues.length > 0) {
                                            for ( i = 0; i < nodeDBValues.length; i++) {
                                                if (nodeDBValues[i] !== null && nodeDBValues[i] > '') {
                                                    row_matches[criteria_index] = true;
                                                }
                                            }
                                        }
                                    }
                                    else if (search_operator == '!=') {

                                        row_matches[criteria_index] = true;

                                        if (search_value.indexOf('__null') !== -1 && (nodeDBValues.length == 0 || nodeDBValues[0] == null || nodeDBValues[0] == 0)) {

                                            row_matches[criteria_index] = false;
                                        }
                                        else {
                                            for ( i = 0; i < search_value.length; i++) {
                                                chosen_value = search_value[i];
                                                if (Omadi.utils.inArray(chosen_value, nodeDBValues)) {
                                                    row_matches[criteria_index] = false;
                                                }
                                            }
                                        }
                                    }
                                    else {

                                        if (search_value.indexOf('__null') !== -1 && (nodeDBValues.length == 0 || nodeDBValues[0] == null || nodeDBValues[0] == 0)) {

                                            row_matches[criteria_index] = true;
                                        }
                                        else {

                                            for ( i = 0; i < search_value.length; i++) {

                                                chosen_value = search_value[i];
                                                if (Omadi.utils.inArray(chosen_value, nodeDBValues)) {

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
                                        if (!Omadi.utils.isArray(search_value)) {

                                            for (i in search_value) {
                                                if (search_value.hasOwnProperty(i)) {

                                                    searchValues.push(i);
                                                }
                                            }
                                            search_value = searchValues;
                                        }

                                        if (search_operator == '__blank') {
                                            row_matches[criteria_index] = true;
                                            if (nodeDBValues.length > 0) {
                                                for ( i = 0; i < nodeDBValues.length; i++) {
                                                    if (nodeDBValues[i] !== null && nodeDBValues[i] > '') {
                                                        row_matches[criteria_index] = false;
                                                    }
                                                }
                                            }
                                        }
                                        else if (search_operator == '__filled') {
                                            if (nodeDBValues.length > 0) {
                                                for ( i = 0; i < nodeDBValues.length; i++) {
                                                    if (nodeDBValues[i] !== null && nodeDBValues[i] > '') {
                                                        row_matches[criteria_index] = true;
                                                    }
                                                }
                                            }
                                        }
                                        else if (search_operator == '!=') {

                                            row_matches[criteria_index] = true;
                                            if (search_value.indexOf('__null') !== -1 && (nodeDBValues.length == 0 || nodeDBValues[0] == null || nodeDBValues[0] == 0)) {
                                                row_matches[criteria_index] = false;
                                            }
                                            else {
                                                for ( i = 0; i < search_value.length; i++) {
                                                    chosen_value = search_value[i];
                                                    if (Omadi.utils.inArray(chosen_value, nodeDBValues)) {
                                                        row_matches[criteria_index] = false;
                                                    }
                                                }

                                            }
                                        }
                                        else {
                                            if (search_value.indexOf('__null') !== -1 && (nodeDBValues.length == 0 || nodeDBValues[0] == null || nodeDBValues[0] == 0)) {
                                                row_matches[criteria_index] = true;
                                            }
                                            else {
                                                for ( i = 0; i < search_value.length; i++) {
                                                    chosen_value = search_value[i];
                                                    if (Omadi.utils.inArray(chosen_value, nodeDBValues)) {
                                                        row_matches[criteria_index] = true;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        
                                        if (search_operator == '__blank') {
                                            row_matches[criteria_index] = true;
                                            if (nodeDBValues.length > 0) {
                                                for ( i = 0; i < nodeDBValues.length; i++) {
                                                    if (nodeDBValues[i] !== null && nodeDBValues[i] > '') {
                                                        row_matches[criteria_index] = false;
                                                    }
                                                }
                                            }
                                        }
                                        else if (search_operator == '__filled') {
                                            if (nodeDBValues.length > 0) {
                                                for ( i = 0; i < nodeDBValues.length; i++) {
                                                    if (nodeDBValues[i] !== null && nodeDBValues[i] > '') {
                                                        row_matches[criteria_index] = true;
                                                    }
                                                }
                                            }
                                        }
                                        else{
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
                                                            if (Omadi.utils.inArray(node_value, possibleValues)) {
                                                                row_matches[criteria_index] = false;
                                                            }
                                                        }
                                                    }
                                                    break;
    
                                                default:
                                                    for ( i = 0; i < nodeDBValues.length; i++) {
                                                        node_value = nodeDBValues[i];
                                                        if (Omadi.utils.inArray(node_value, possibleValues)) {
                                                            row_matches[criteria_index] = true;
                                                        }
                                                    }
                                                    break;
                                            }
                                        }
                                    }

                                    break;

                                case 'omadi_time':
                                    // TODO: Add the omadi_time field here - not done on web yet either
                                    break;

                                case 'image':
                                case 'file':
                                    // Do nothing
                                    break;

                            }

                        }

                    }
                }
            }

            if (Omadi.utils.count(criteria.search_criteria) == 1) {

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

