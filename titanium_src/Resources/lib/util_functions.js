/*jslint eqeq:true,plusplus:true*/

var Omadi = Omadi || {};
Omadi.utils = Omadi.utils || {};

Omadi.DOMAIN_NAME = domainName;
Ti.App.DOMAIN_NAME = domainName;

// IMPORTANT, IMPORTANT, IMPORTANT, IMPORTANT!!!!!
// When changing this version number, also change it in the Database module
Omadi.DB_VERSION = "DB1723";
// IMPORTANT, IMPORTANT, IMPORTANT, IMPORTANT!!!!!

Omadi.utils.checkVolumeLevel = function(){"use strict";
    /*global alertQueue*/
    // var dialog;
//     
    // try{
        // if(Ti.App.isAndroid){
//            
        // }
        // else{
//            
            // // Ti.API.debug("volume: " + Ti.Media.getVolume());
            // // if(Ti.Media.getVolume() < 0.5){
// //                 
                // // dialog = Ti.UI.createAlertDialog({
                   // // message: "The volume is less than 50%, so you may miss some notifications. Please turn up the volume on your device.",
                   // // title: 'Low Volume Alert' 
                // // });
// //                 
                // // if(typeof alertQueue !== 'undefined'){
                    // // alertQueue.push(dialog);
                // // }
                // // else{
                    // // dialog.show();
                // // }
            // // }
        // }
    // }
    // catch(ex){
        // Ti.API.debug("Volume exception: " + ex);
        // // Do nothing right now
    // }
};


Omadi.utils.closeAppWaitingDialogShown = false;

Omadi.utils.closeApp = function(){"use strict";
    var dialog;
    
    if(Ti.App.isAndroid){
        
        Ti.App.closingApp = true;
        
        if(Omadi.service.getLastUploadStartTimestamp() === null && !Omadi.data.isUpdating()){
            Ti.Android.currentActivity.finish();
            Ti.App.fireEvent('closeApp');
        }
        else{
            setTimeout(Omadi.utils.closeApp, 200);
            
            if(!Omadi.utils.closeAppWaitingDialogShown){
                dialog = Ti.UI.createAlertDialog({
                   message: "Waiting for current sync or upload to finish..."
                });
                
                dialog.show();
                
                Omadi.utils.closeAppWaitingDialogShown = true;
            }
        }
    }
};

Omadi.utils.openListDatabase = function() {"use strict";
    var db = Ti.Database.install('/database/db_list.sqlite', Omadi.DB_VERSION + "_list");
    if (Ti.App.isIOS) {
        db.file.setRemoteBackup(false);
    }
    return db;
};

Omadi.utils.getUserDBName = function(clientAccount, username){"use strict";
    return "db_" + clientAccount + '_' + username;
};

Omadi.utils.getMainDBName = function() {"use strict";
    var db, result, dbName;

    db = Omadi.utils.openListDatabase();
    result = db.execute('SELECT db_name FROM history WHERE id_hist=1');
    dbName = result.fieldByName('db_name');
    result.close();
    db.close();
    return dbName;
};

Omadi.utils.openMainDatabaseFromUser = function(clientAccount, username){"use strict";
    var db = Ti.Database.install('/database/db.sqlite', Omadi.DB_VERSION + "_" + Omadi.utils.getUserDBName(clientAccount, username));
    if (Ti.App.isIOS) {
        db.file.setRemoteBackup(false);
    }
    return db;
};

Omadi.utils.openMainDatabase = function() {"use strict";
    var db = Ti.Database.install('/database/db.sqlite', Omadi.DB_VERSION + "_" + Omadi.utils.getMainDBName());
    if (Ti.App.isIOS) {
        db.file.setRemoteBackup(false);
    }
    return db;
};

Omadi.utils.openSharedDatabase = function() {"use strict";
    var db = Ti.Database.install('/database/shared.sqlite', Omadi.DB_VERSION + "_shared");
    if (Ti.App.isIOS) {
        db.file.setRemoteBackup(false);
    }
    return db;
};

Omadi.utils.openGPSDatabase = function() {"use strict";
    var db = Ti.Database.install('/database/gps_coordinates.sqlite', Omadi.DB_VERSION + "_" + Omadi.utils.getMainDBName() + "_GPS");
    if (Ti.App.isIOS) {
        db.file.setRemoteBackup(false);
    }
    return db;
};

Omadi.utils.getUTCTimestamp = function() {"use strict";
    return Math.round(new Date() / 1000);
};

Omadi.utils.getUTCTimestampServerCorrected = function(){"use strict";
    var nowServerCorrected, serverOffset;
        
    nowServerCorrected = Math.round(new Date() / 1000);
    
    serverOffset = Ti.App.Properties.getDouble("service:serverTimestampOffset", 0);
    
    // Add the server offset to get a more accurate timestamp += about 5 seconds
    if(serverOffset != 0){
        nowServerCorrected += serverOffset;
    }
    
    return nowServerCorrected;
};



Omadi.utils.getUid = function(){"use strict";
    var loginJson = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
    return parseInt(loginJson.user.uid, 10);
};

Omadi.utils.getClientAccount = function(){"use strict";
    var db, result, clientAccount = null;
    
    db = Omadi.utils.openListDatabase();
    result = db.execute("SELECT client_account FROM history LIMIT 1");
    if(result.isValidRow()){
        clientAccount = result.fieldByName('client_account');
    }
    db.close();
    
    return clientAccount;
};

Omadi.utils.getRealname = function(uid){"use strict";
    var db, result, realname;
    
    realname = "";
    
    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT username, realname FROM user WHERE uid = " + uid);
    if(result.isValidRow()){
        realname = result.fieldByName('realname');
        if(realname.length == 0){
            realname = result.fieldByName('username');
        }
    }
    result.close();
    db.close();
    
    return realname;
};

Omadi.utils.getUsername = function(uid){"use strict";
    var db, result, username;
    
    username = "Anonymous";
    
    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT username FROM user WHERE uid = " + uid);
    if(result.isValidRow()){
        username = result.fieldByName('username');
    }
    result.close();
    db.close();
    
    return username;
};

Omadi.utils.formatCurrency = function(amount){"use strict";
    var price = "";
    if(amount != ""){
        if(!isNaN(parseFloat(amount))){
            price = '$' + parseFloat(Math.round(amount * 100) / 100).toFixed(2);
        }
    }  
    return price;
};

Omadi.utils.formatMegaBytes = function(bytes){"use strict";
    var mb = bytes / 1048576;
    return Math.round(mb * 10) / 10;
};

Omadi.utils.getTimeFormat = function(){"use strict";
    var format, loginJson = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
    format = 'g:iA';
    
    if(typeof loginJson.user.time_format === 'string'){
        format = loginJson.user.time_format;
    }
    
    return format;
};

// Takes a timestamp from the past and returns a string with the amount of time elapsed
Omadi.utils.getTimeAgoStr = function(unix_timestamp) {'use strict';

    var d_lastSync, d_now, timeDiff, days, hours, minutes, seconds, timeStr;

    d_now = (new Date()).getTime() / 1000;

    timeDiff = d_now - parseInt(unix_timestamp, 10);
    
    if(timeDiff === 0){
        return '0 seconds ago';
    }
    
    // time difference in ms
    days = Math.floor(timeDiff / (3600 * 24));
    //get days
    timeDiff = Math.round(timeDiff % (3600 * 24));

    hours = Math.floor(timeDiff / 3600);
    // get hours
    timeDiff = Math.round(timeDiff % (3600));

    minutes = Math.floor(timeDiff / 60);
    // get minutes
    timeDiff = Math.round(timeDiff % (60));

    seconds = Math.floor(timeDiff);
    // get seconds

    timeStr = "";
    
    if (days !== 0) {
        timeStr += days + ' day';
        if (days > 1) {
            timeStr += 's';
        }
        timeStr += ' ';
    }

    if (hours !== 0) {
        timeStr += hours + ' hour';
        if (hours > 1) {
            timeStr += 's';
        }
        timeStr += ' ';
    }

    if (minutes !== 0 && days === 0) {
        timeStr += minutes + ' minute';
        if (minutes > 1) {
            timeStr += 's';
        }
        timeStr += ' ';
    }

    if (seconds !== 0 && hours === 0) {
        timeStr += seconds + ' second';
        if (seconds > 1) {
            timeStr += 's';
        }
        timeStr += ' ';
    }

    if (timeStr !== '') {
        timeStr += 'ago';
    }
    else{
        timeStr = "Just Now";
    }

    return timeStr;
};

Omadi.utils.setCookieHeader = function(http) {"use strict";
    var cookie = Omadi.utils.getCookie();

    if(cookie != null && cookie > "" && cookie != "null"){
        
        try{
            http.setRequestHeader("Cookie", cookie);
        }
        catch(ex){
            Ti.API.error("Could not set http cookie header");
            Ti.API.error(cookie);
            Omadi.service.sendErrorReport("Could not set cookie for " + http.location);
        }
    }
};

Omadi.utils.getCookie = function(fullCookie){"use strict";
    var db, result, cookie;
    
    cookie = null;
    
    if(typeof fullCookie === 'undefined'){
        fullCookie = false;
    }
    
    db = Omadi.utils.openListDatabase();
    result = db.execute('SELECT * FROM login WHERE rowid=1');
    if(result.isValidRow()){
        cookie = result.fieldByName("cookie", Ti.Database.FIELD_TYPE_STRING);
    }
    
    result.close();
    db.close();
    
   if(cookie){
        if (Ti.App.isIOS && !fullCookie) {
            if(cookie.indexOf(';') != -1){
                cookie = cookie.split(';');
                cookie = cookie[0];
            }
        }
    }
    
    return cookie;
};

/* Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

Omadi.utils.isLoggedIn = function() {"use strict";
    var mainDB, result, lastLoggedTimestamp, timestamp, is_logged_in, now;
    
    mainDB = Omadi.utils.openListDatabase();

    result = mainDB.execute('SELECT * FROM login WHERE "id_log"=1');
    is_logged_in = result.fieldByName('is_logged', Ti.Database.FIELD_TYPE_STRING);
    timestamp = result.fieldByName('logged_time');
    //Ti.API.info("TIME FROM DB = " + _l_timestamp);

    now = Omadi.utils.getUTCTimestamp();
    if (timestamp == "null" || timestamp == null || timestamp == "0") {
        timestamp = 0;
    }

    lastLoggedTimestamp = now - timestamp;

    result.close();
    mainDB.close();
    
    //Ti.API.info("********************   IS LOGGED: " + logged);
    if (is_logged_in === "false") {
        return false;
    }
    
    if (lastLoggedTimestamp >= (60 * 60 * 24 * 7)) {//Seven days
        //else if ( last_logged_timestamp >= (60*5) ){ //Five minutes ----> testing
        //Ti.API.info("SESSION IS NO LONGER VALID! " + last_logged_timestamp);
        Ti.App.Properties.setString('logStatus', "Please login");
        return false;
    }
    
    return true;
};

Omadi.utils.PHPFormatDate = function(format, timestamp){"use strict";
    var jsDate = new Date();
    jsDate.setTime(timestamp * 1000);
    return jsDate.format(format);
};

Omadi.utils.formatDate = function(timestamp, showTime){"use strict";
    
    var format = "D, M j, Y";
    if(showTime){
        format += ' - ' + Omadi.utils.getTimeFormat();
    }
    
    return (new Date(timestamp * 1000)).format(format);
};

Omadi.utils.formatTime = function(timestamp){"use strict";
    
    var format = Omadi.utils.getTimeFormat();
    return (new Date(timestamp * 1000)).format(format);
};

Omadi.utils.secondsToString = function(seconds) {"use strict";
    var format, am_pm, hours, hours_str, minutes, time_string, new_hours;
    
    format = Omadi.utils.getTimeFormat();
    Ti.API.error(format);

    am_pm = (format.indexOf('H') === -1);

    hours = Math.floor(seconds / 3600);

    hours_str = hours;

    minutes = Math.floor((seconds - (hours * 3600)) / 60);
    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    if (am_pm) {
        if (hours == 0) {
            time_string = '12:' + minutes + ' AM';
        }
        else if (hours == 12) {
            time_string = '12:' + minutes + ' PM';
        }
        else if (hours > 12) {
            new_hours = hours - 12;
            hours_str = new_hours;
            time_string = hours_str + ':' + minutes + ' PM';
        }
        else {
            time_string = hours_str + ':' + minutes + ' AM';
        }
    }
    else {
        time_string = hours_str + ':' + minutes;
    }

    return time_string;
};

Omadi.utils.isArray = function(input) {"use strict";
    return typeof (input) == 'object' && ( input instanceof Array);
};

Omadi.utils.fileSortByModified = function (a, b){ "use strict";
    return ((a.modifiedTimestamp < b.modifiedTimestamp) ? 1 : -1);
};

Omadi.utils.getParsedJSON = function(str){"use strict";
    var retval;
    
    if (str == "" || str == null) {
        return str;
    }
   
    try {
        retval = JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    
    return retval;
};

Omadi.utils.isEmpty = function(number){"use strict";
    if(typeof number === 'undefined'){
        return true;
    }
    
    if(number === null){
        return true;
    }
    
    if(number === ""){
        return true;
    }
    
    if(number === "null"){
        return true;
    }
    
    if(number.toString() == "NaN"){
        return true;
    }
    
    return false;
};

Date.prototype.format = function(format) {"use strict";
    
    var i, returnStr, replace, curChar;
    
    returnStr = '';
    replace = Date.replaceChars;
    for (i = 0; i < format.length; i++) {       
        curChar = format.charAt(i);         
        if (i - 1 >= 0 && format.charAt(i - 1) == "\\") {
            returnStr += curChar;
        }
        else if (replace[curChar]) {
            returnStr += replace[curChar].call(this);
        } else if (curChar != "\\"){
            returnStr += curChar;
        }
    }
    return returnStr;
};


Date.replaceChars = {
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

    // Day
    d: function() { "use strict"; return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
    D: function() { "use strict"; return Date.replaceChars.shortDays[this.getDay()]; },
    j: function() { "use strict"; return this.getDate(); },
    l: function() { "use strict"; return Date.replaceChars.longDays[this.getDay()]; },
    N: function() { "use strict"; return this.getDay() + 1; },
    S: function() { "use strict"; return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
    w: function() { "use strict"; return this.getDay(); },
    z: function() { "use strict"; var d = new Date(this.getFullYear(),0,1); return Math.ceil((this - d) / 86400000); }, // Fixed now
    // Week
    W: function() { "use strict"; var d = new Date(this.getFullYear(), 0, 1); return Math.ceil((((this - d) / 86400000) + d.getDay() + 1) / 7); }, // Fixed now
    // Month
    F: function() { "use strict"; return Date.replaceChars.longMonths[this.getMonth()]; },
    m: function() { "use strict"; return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
    M: function() { "use strict"; return Date.replaceChars.shortMonths[this.getMonth()]; },
    n: function() { "use strict"; return this.getMonth() + 1; },
    t: function() { "use strict"; var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 0).getDate(); }, // Fixed now, gets #days of date
    // Year
    L: function() { "use strict"; var year = this.getFullYear(); return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)); },   // Fixed now
    o: function() { "use strict"; var d  = new Date(this.valueOf());  d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3); return d.getFullYear();}, //Fixed now
    Y: function() { "use strict"; return this.getFullYear(); },
    y: function() { "use strict"; return (''.toString() + this.getFullYear()).substr(2); },
    // Time
    a: function() { "use strict"; return this.getHours() < 12 ? 'am' : 'pm'; },
    A: function() { "use strict"; return this.getHours() < 12 ? 'AM' : 'PM'; },
    B: function() { "use strict"; return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24); }, // Fixed now
    g: function() { "use strict"; return this.getHours() % 12 || 12; },
    G: function() { "use strict"; return this.getHours(); },
    h: function() { "use strict"; return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
    H: function() { "use strict"; return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
    i: function() { "use strict"; return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
    s: function() { "use strict"; return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
    u: function() { "use strict"; var m = this.getMilliseconds(); return (m < 10 ? '00' : (m < 100 ? '0' : '')) + m; },
    // Timezone
    e: function() { "use strict"; return "Not Yet Supported"; },
    I: function() { "use strict"; return "Not Yet Supported"; },
    O: function() { "use strict"; return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
    P: function() { "use strict"; return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':00'; }, // Fixed now
    T: function() { "use strict"; /*jslint regexp:true*/ var m, result; m = this.getMonth(); this.setMonth(0); result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
    Z: function() { "use strict"; return -this.getTimezoneOffset() * 60; },
    // Full Date/Time
    c: function() { "use strict"; return this.format("Y-m-d\\TH:i:sP"); }, // Fixed now
    r: function() { "use strict"; return this.toString(); },
    U: function() { "use strict"; return this.getTime() / 1000; }
};

Omadi.utils.trimWhiteSpace = function(string) {"use strict";
    
    
    if(typeof string === 'undefined'){
        return null;
    }
    
    if(typeof string === 'number'){
        return string;
    }
    
    if(string === null){
        return null;
    }
    
    string += "".toString();
    
    return string.replace(/^\s+|\s+$/g, "");
};


Omadi.utils.sortByName = function(a, b) {"use strict";
    if (a.name < b.name){
        return -1;
    }
    if (a.name > b.name){
        return 1;
    }
    // a must be equal to b
    return 0;
};

Omadi.utils.sortByWeight = function(a, b) {"use strict";
    if (parseInt(a.weight, 10) < parseInt(b.weight, 10)){
        return -1;
    }
    if (parseInt(a.weight, 10) > parseInt(b.weight, 10)){
        return 1;
    }
    // a must be equal to b
    return 0;
};

Omadi.utils.count = function(obj){"use strict";
    var count = 0, i;
    
    if(typeof obj === 'object'){
        for(i in obj){
            if(obj.hasOwnProperty(i)){
                count ++;
            }
        }
    }
    
    return count;
};

Omadi.utils.isNumber = function(n) {"use strict";
    return !isNaN(parseFloat(n)) && isFinite(n);
};

Omadi.utils.inArray = function(val, haystack) {"use strict";
    var i;
    for (i = 0; i < haystack.length; i++) {
        if (haystack[i] == val) {
            return true;
        }
    }
    return false;
};

// PHP equivelent function in javaScript----START
Omadi.utils.mktime = function() {"use strict";
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
};

Omadi.utils.list_search_node_matches_search_criteria = function(node, criteria) {"use strict";
    var user, row_matches, instances, i, j, criteria_index, criteria_row, field_name, 
    search_field, search_value, search_operator, search_time_value, compare_times, 
    value_index, nodeDBValues, nodeTextValues, search_time_value2, compare_times2, 
    node_value, weekdays, reference_types, db, result, query, possibleValues, 
    searchValues, chosen_value, retval, and_groups, and_group, and_group_index, 
    and_group_match, useNids, jsonValues, nodeDescNames, tids, search_datestamp_value, 
    search_datestamp_operator, search_value2, search_datestamp_operator2, search_datestamp_value2;
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
                    nodeDBValues = [];
                    nodeTextValues = [];
                    
                    if(typeof node[field_name] !== 'undefined' && node[field_name] !== null){
                        if(typeof node[field_name].dbValues !== 'undefined'){
                            nodeDBValues = node[field_name].dbValues;    
                        }
                        if(typeof node[field_name].textValues !== 'undefined'){
                            nodeTextValues = node[field_name].textValues;    
                        }
                    }

                    if (instances[field_name] != null) {
                        search_field = instances[field_name];

                        if (search_field.type == 'datestamp') {

                            search_value = criteria_row.value;
                            search_operator = criteria_row.operator + "".toString();

                            if (['after-time', 'before-time', 'between-time'].indexOf(search_operator) != -1) {

                                search_time_value = Number(search_value.time);
                                compare_times = [];

                                for ( i = 0; i < nodeDBValues.length; i++) {
                                    compare_times[i] = search_time_value + Omadi.utils.mktime(0, 0, 0, Omadi.utils.PHPFormatDate('n', Number(nodeDBValues[i])), Omadi.utils.PHPFormatDate('j', Number(nodeDBValues[i])), Omadi.utils.PHPFormatDate('Y', Number(nodeDBValues[i])));
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

                                        compare_times2[i] = search_time_value2 + Omadi.utils.mktime(0, 0, 0, Omadi.utils.PHPFormatDate('n', Number(nodeDBValues[i])), Omadi.utils.PHPFormatDate('j', Number(nodeDBValues[i])), Omadi.utils.PHPFormatDate('Y', Number(nodeDBValues[i])));

                                    }
                                    
                                    Ti.API.debug("nodeDBValues[0]: " + nodeDBValues[0]);
                                    Ti.API.debug("search_time_value: " + search_time_value);
                                    Ti.API.debug("search_time_value2: " + search_time_value2);
                                    Ti.API.debug("compare_times[0]: " + compare_times[0]);
                                    Ti.API.debug("compare_times2[0]: " + compare_times2[0]);

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
                                    
                                    Ti.API.debug("Checking between time: " + row_matches[criteria_index]);
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
                            else{
                        
                                search_datestamp_value = search_value.timestamp;
                                search_datestamp_operator = search_value.operator;
            
                                if(search_datestamp_operator != 'user-defined'){
                                    search_datestamp_value = Omadi.utils.list_search_set_datestamp_value_from_relative(search_datestamp_operator);
                                }
                                
                                if(search_operator == 'between'){
                                    
                                    search_value2 = null;
                                    if(typeof criteria_row.value2 !== 'undefined'){
                                        search_value2 = criteria_row.value2;
                                    }
                                    
                                    search_datestamp_value2 = search_value2.timestamp;
                                    search_datestamp_operator2 = search_value2.operator;
                                    
                                    if(search_datestamp_operator2 != 'user-defined'){
                                        search_datestamp_value2 = Omadi.utils.list_search_set_datestamp_value_from_relative(search_datestamp_operator2);
                                    }
            
                                    if(search_datestamp_value < search_datestamp_value2){
                                        // Make sure the value is less than the end value
                                        for ( i = 0; i < nodeDBValues.length; i++) {
                                            node_value = nodeDBValues[i];
                                            if (node_value != null && node_value >= search_datestamp_value && node_value < search_datestamp_value2) {
                                                row_matches[criteria_index] = true;
                                            }
                                        }
                                    }
                                }
                                else if(search_operator == 'before'){
                                    for ( i = 0; i < nodeDBValues.length; i++) {
                                        node_value = nodeDBValues[i];
                                        if (node_value != null && node_value < search_datestamp_value) {
                                            row_matches[criteria_index] = true;
                                        }
                                    }
                                }
                                else if(search_operator == 'after'){
                                    for ( i = 0; i < nodeDBValues.length; i++) {
                                        node_value = nodeDBValues[i];
                                        if (node_value != null && node_value > search_datestamp_value) {
                                            row_matches[criteria_index] = true;
                                        }
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
                                    
                                    if(search_operator == 'desc='){
                                        row_matches[criteria_index] = false;
                                        jsonValues = [];
                                        
                                        Ti.API.error("search values: " + JSON.stringify(search_value));
                                        
                                        if(search_value){
                                            if(typeof node[field_name] !== 'undefined'){
                                                if(typeof node[field_name].textValues !== 'undefined'){
                                                    for(i = 0; i < node[field_name].textValues.length; i ++){
                                                        jsonValues.push(JSON.parse(node[field_name].textValues[i]));
                                                    }
                                                }
                                            }
                                            
                                            Ti.API.error("json values: " + JSON.stringify(jsonValues));
                                            
                                            tids = [];
                                            nodeDescNames = {};
                                            
                                            for(i = 0; i < jsonValues.length; i ++){
                                                if(jsonValues[i] && typeof jsonValues[i].desc !== 'undefined'){
                                                    nodeDescNames[jsonValues[i].desc] = jsonValues[i].desc;
                                                }
                                            }
                                            
                                            Ti.API.error("desc: " + JSON.stringify(nodeDescNames));
                                            
                                            db = Omadi.utils.openMainDatabase();
                                            
                                            result = db.execute("SELECT vid from vocabulary WHERE machine_name='" + search_field.settings.vocabulary + "'");
    
                                            query = 'SELECT tid, name from term_data WHERE vid=' + result.fieldByName('vid');
                                            
                                            result.close();
    
                                            result = db.execute(query);
                                            while (result.isValidRow()) {
                                                if(typeof nodeDescNames[result.fieldByName('name')] !== 'undefined'){
                                                    tids.push(result.fieldByName('tid'));
                                                }
                                                result.next();
                                            }
                                            result.close();
                                            db.close();
                                            
                                            Ti.API.error("tids: " + JSON.stringify(tids));
                                            
                                            if(tids.length > 0){
                                                // Make sure the search value is an array
                                                // This will convert an object to an array or a string to an array
                                                searchValues = [];
                                                if (!Omadi.utils.isArray(search_value)) {

                                                    for (i in search_value) {
                                                        if (search_value.hasOwnProperty(i)) {
            
                                                            searchValues.push(i);
                                                        }
                                                    }
                                                    search_value = searchValues;
                                                }
                                                
                                                for(i = 0; i < search_value.length; i ++){
                                                    for(j = 0; j < tids.length; j ++){
                                                        if(tids[j] == search_value[i]){
                                                            row_matches[criteria_index] = true;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                            
                                            Ti.API.error("matches: " + row_matches[criteria_index]);
                                        }
                                    }
                                    else{
                                        
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

                Ti.API.debug("AND GROUP RESULT: " + JSON.stringify(and_groups));

                for ( i = 0; i < and_groups.length; i++) {

                    and_group = and_groups[i];
                    and_group_match = false;
                    if(and_group.length > 0){
                        for ( j = 0; j < and_group.length; j++) {
    
                            // Make sure at least one item in an and group is true (or the only item is true)
                            if (and_group[j]) {
    
                                and_group_match = true;
                                break;
                            }
                        }
                    }
                    else{
                        // If by chance an and group gets created as empty
                        and_group_match = true;
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
        Omadi.service.sendErrorReport("Exception in matching search criteria: " + e);
    }

    return true;
};

Omadi.utils.list_search_set_datestamp_value_from_relative = function(relative_string){"use strict";
    var retval = null, now;
    now = Omadi.utils.getUTCTimestamp();

    switch(relative_string){
        case 'now':
            retval = now; break;
        case '+1day':
            retval = now + (24 * 3600); break;
        case '24-hours':
            retval = now - (24 * 3600); break;
        case '2-days':
            retval = now - (2 * 24 * 3600); break;
        case '3-days':
            retval = now - (3 * 24 * 3600); break;
        case '1-week':
            retval = now - (7 * 24 * 3600); break;
        case '2-weeks':
            retval = now - (2 * 7 * 24 * 3600); break;
        case '4-weeks':
            retval = now - (4 * 7 * 24 * 3600); break;
        case '8-weeks':
            retval = now - (8 * 7 * 24 * 3600); break;
        case '3-months':
            retval = now - (13 * 7 * 24 * 3600); break;
        case '6-months':
            retval = now - (26 * 7 * 24 * 3600); break;
        case '1-year':
            retval = now - (52 * 7 * 24 * 3600); break;
        case '2-years':
            retval = now - (2 * 52 * 7 * 24 * 3600); break;
    }

    return retval;
};

Omadi.utils.list_search_get_search_sql = function(nodeType, criteria){"use strict";
    var instances, criteria_index, criteria_row, field_name, instance, ANDs, innerSQL, operator, search_value, searchValues, i;
    
    ANDs = [];
    
    if ( typeof criteria.search_criteria !== 'undefined' && criteria.search_criteria != "") {
        instances = Omadi.data.getFields(nodeType);

        for (criteria_index in criteria.search_criteria) {
            if (criteria.search_criteria.hasOwnProperty(criteria_index)) {

                criteria_row = criteria.search_criteria[criteria_index];
                field_name = criteria_row.field_name;
                operator = criteria_row.operator + "".toString();
                search_value = criteria_row.value != null && criteria_row.value != "" ? criteria_row.value : null;

                if (instances[field_name] != null) {
                    instance = instances[field_name];
                    innerSQL = '';
                    
                    switch(instance.type){
                       case 'taxonomy_term_reference':
                         
                         if (instance.widget.type == 'options_select' || instance.widget.type == 'violation_select') {
                             searchValues = [];
                             if (!Omadi.utils.isArray(search_value)) {

                                for (i in search_value) {
                                    if (search_value.hasOwnProperty(i)) {

                                        searchValues.push(i);
                                    }
                                }
                                search_value = searchValues;
                             }
                             
                             if(operator == '__blank'){
                                 innerSQL += field_name + ' IS NULL OR ' + field_name + " = ''";
                             }
                             else if(operator == '__filled'){
                                 innerSQL += field_name + ' IS NOT NULL AND ' + field_name + " != ''";
                             }
                             else if(operator == '!='){
                                 innerSQL += field_name + ' NOT IN (' + search_value.join(',') + ')';
                                 innerSQL += ' AND ' + field_name + ' IS NOT NULL';
                                 innerSQL += ' AND ' + field_name + " != ''";
                             }
                             // TODO: fill in other options
                             else{
                                 // Equal to
                                 innerSQL += field_name + ' IN (' + search_value.join(',') + ')';
                             }
                         }
                         else{
                             // TODO: fill this in for autocomplete fields
                         }
                       break; 
                    }
                    
                    ANDs.push(innerSQL);
                }
            }
        }
    }
    
    return ANDs.join(' AND ');
};

Omadi.utils.applyNumberFormat = function(instance, value) {"use strict";
    var value_str = '', format;
    
    if(isNaN(value)){
        value = 0;
    }
    
    if (instance.settings != null && instance.settings.number_format != null && instance.settings.number_format != "") {
        format = instance.settings.number_format;    
    }
    else if(instance.type == 'number_integer'){
        format = 'integer';
    }
    else if(instance.type == 'number_decimal'){
        format = 'two decimal';
    }
    else if(instance.type == 'calculation_field'){
        format = 'currency';
    }
    
    switch (format) {
        case 'currency':
            value_str = '$' + (Math.round(Math.abs(value) * 100) / 100).toFixed(2);
            break;
            
        case 'integer':
            value_str = Math.round(Math.abs(value)).toFixed(0);
            break;
            
        case 'one decimal':
            value_str = (Math.round(Math.abs(value) * 10) / 10).toFixed(1);
            break;
            
        case 'two decimal':
            value_str = (Math.round(Math.abs(value) * 100) / 100).toFixed(2);
            break;
            
        case 'three decimal':
            value_str = (Math.round(Math.abs(value) * 1000) / 1000).toFixed(3);
            break;
            
        default:
            value_str = (Math.round(Math.abs(value) * 100) / 100).toFixed(2);
            break;
    }
    
    return value_str;
};

Omadi.utils.setPhotoWidget = function(photoWidget){"use strict";
    Ti.App.Properties.setString("photoWidget", photoWidget);
};

Omadi.utils.getPhotoWidget = function(){"use strict";
    return Ti.App.Properties.getString("photoWidget", 'take');
};

Ti.include('/lib/location_functions.js');
Ti.include('/lib/service_functions.js');
