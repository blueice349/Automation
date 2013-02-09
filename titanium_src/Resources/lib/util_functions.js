/*jslint eqeq:true, plusplus: true*/

var Omadi = Omadi || {};
Omadi.utils = Omadi.utils || {};

Omadi.DOMAIN_NAME = domainName;
Omadi.DB_VERSION = "omadiDb1686";

Omadi.utils.openListDatabase = function() {"use strict";
    var db = Ti.Database.install('/database/db_list.sqlite', Omadi.DB_VERSION + "_list");
    if (Ti.App.isIOS) {
        db.file.setRemoteBackup(false);
    }
    return db;
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

Omadi.utils.openMainDatabase = function() {"use strict";
    var db = Ti.Database.install('/database/db.sqlite', Omadi.DB_VERSION + "_" + Omadi.utils.getMainDBName());
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

    if(cookie > ""){
        http.setRequestHeader("Cookie", cookie);
    }
};

Omadi.utils.getCookie = function(fullCookie){"use strict";
    var db, result, cookie;

    if(typeof fullCookie === 'undefined'){
        fullCookie = false;
    }
    
    db = Omadi.utils.openListDatabase();
    result = db.execute('SELECT * FROM login WHERE rowid=1');
    cookie = result.fieldByName("cookie", Ti.Database.FIELD_TYPE_STRING);
    //Ti.API.info("FOUND COOKIE = " + cookie);
    result.close();
    db.close();
    
    if (Ti.App.isIOS && !fullCookie) {
        if(cookie.indexOf(';') != -1){
            cookie = cookie.split(';');
            cookie = cookie[0];
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

Omadi.utils.isArray = function(input) {"use strict";
    return typeof (input) == 'object' && ( input instanceof Array);
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

Omadi.utils.inArray = function(val, haystack) {"use strict";
    var i;
    for (i = 0; i < haystack.length; i++) {
        if (haystack[i] == val) {
            return true;
        }
    }
    return false;
};

Omadi.utils.applyNumberFormat = function(instance, value) {"use strict";
    
    var value_str = '';
    
    if (instance.settings != null && instance.settings.number_format != null && instance.settings.number_format != "") {
        switch (instance.settings.number_format) {
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
    }
    else {
        value_str = (Math.round(Math.abs(value) * 100) / 100).toFixed(2);
    }
    return value_str;
};



Ti.include('/lib/location_functions.js');
Ti.include('/lib/service_functions.js');
