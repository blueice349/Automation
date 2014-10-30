var Omadi = Omadi || {};
Omadi.utils = Omadi.utils || {};

var Utils = require('lib/Utils');

// IMPORTANT, IMPORTANT, IMPORTANT, IMPORTANT!!!!!
// When changing this version number, also change it in the Database module
Omadi.DB_VERSION = "DB1725";
// IMPORTANT, IMPORTANT, IMPORTANT, IMPORTANT!!!!!

Omadi.utils.closeApp = function(){"use strict";
	Utils.closeApp();
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
    return Utils.getUTCTimestamp();
};

Omadi.utils.getUTCTimestampServerCorrected = function(){"use strict";
    return Utils.getUTCTimestampServerCorrected();
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
    return Utils.getRealname(uid);
};

Omadi.utils.getUsername = function(uid){"use strict";
    return Utils.getUsername(uid);
};

Omadi.utils.formatCurrency = function(amount){"use strict";
    return Utils.formatCurrency(amount);
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
	return Utils.getTimeAgoStr(unix_timestamp);
};

Omadi.utils.setCookieHeader = function(http) {"use strict";
    var cookie = Omadi.utils.getCookie();

    if(cookie != null && cookie > "" && cookie != "null"){
        
        try{
            http.setRequestHeader("Cookie", cookie);
        }
        catch(ex){
            Utils.sendErrorReport("Could not set cookie for " + http.location + ": " + ex);
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
    return Utils.isLoggedIn();
};

Omadi.utils.formatDate = function(timestamp, showTime){"use strict";
    return Utils.formatDate(timestamp, showTime);
};

Omadi.utils.formatTime = function(timestamp){"use strict";
    var format = Omadi.utils.getTimeFormat();
    return (new Date(timestamp * 1000)).format(format);
};

Omadi.utils.secondsToString = function(seconds) {"use strict";
    return Utils.secondsToString(seconds);
};

Omadi.utils.fileSortByModified = function (a, b){ "use strict";
    return Utils.fileSortByModified(a, b);
};

Omadi.utils.getParsedJSON = function(str){"use strict";
    return Utils.getParsedJSON(str);
};

Omadi.utils.isEmpty = function(number){"use strict";
    return Utils.isEmpty(number);
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
    return Utils.sortByWeight(a, b);
};

Omadi.utils.count = function(obj){"use strict";
    return Utils.count(obj);
};

Omadi.utils.joinAsSentence = function(arr){"use strict";
	return Utils.joinAsSentence(arr);
};

Omadi.utils.isNumber = function(n) {"use strict";
    return Utils.isNumber(n);
};

Omadi.utils.inArray = function(val, haystack) {"use strict";
    return Utils.inArray(val, haystack);
};

Omadi.utils.list_search_node_matches_search_criteria = function(node, criteria) {"use strict";
	return Utils.listSearchNodeMatchesSearchCriteria(node, criteria);
};

Omadi.utils.list_search_set_datestamp_value_from_relative = function(relative_string){"use strict";
    return Utils.listSearchSetDatestampValueFromRelative(relative_string);
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
                             if (!Utils.isArray(search_value)) {

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
                             Ti.API.INFO('autocomplete');
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
	return Utils.applyNumberFormat(instance, value);
};

Omadi.utils.setPhotoWidget = function(photoWidget){"use strict";
    Ti.App.Properties.setString("photoWidget", photoWidget);
};

Omadi.utils.getPhotoWidget = function(){"use strict";
    return Utils.getPhotoWidget();
};

Omadi.utils.sqlEscape = function(str) {"use strict";
	return Utils.sqlEscape(str);
};

Omadi.utils.sqlEscapeAll = function(arr) {"use strict";
	var result = [];
	var i;
	for (i = 0; i < arr.length; i++) {
		result[i] = Omadi.utils.sqlEscape(arr[i]);
	}
	return result;
};

Omadi.utils.regExpEscape = function(str) {"use strict";
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

Omadi.utils.regExpEscapeAll = function(arr) {"use strict";
	var result = [];
	var i;
	for (i = 0; i < arr.length; i++) {
		result[i] = Omadi.utils.regExpEscape(arr[i]);
	}
	return result;
};

Ti.include('/lib/location_functions.js');
Ti.include('/lib/service_functions.js');
