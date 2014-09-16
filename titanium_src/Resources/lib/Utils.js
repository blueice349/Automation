/*jslint node:true */
'use strict';

var Database = require('lib/Database');
var Node = require('objects/Node');

exports.getUid = function(){
    var loginJson = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
    if(typeof loginJson.user !== 'undefined'){
        return parseInt(loginJson.user.uid, 10);
    }
    return 0;
};

exports.getUTCTimestamp = function(){
    return Math.round(new Date() / 1000);  
};

exports.getCookie = function(fullCookie){
    var db, result, cookie = null;
    
    try{
        cookie = null;
        
        if(typeof fullCookie === 'undefined'){
            fullCookie = false;
        }
        
        result = Database.queryList('SELECT * FROM login WHERE rowid=1');
        if(result.isValidRow()){
            cookie = result.fieldByName("cookie", Ti.Database.FIELD_TYPE_STRING);
        }
        
        result.close();
        Database.close();
        
        if(cookie){
            if (Ti.App.isIOS && !fullCookie) {
                if(cookie.indexOf(';') != -1){
                    cookie = cookie.split(';');
                    cookie = cookie[0];
                }
            }
        }
    }
    catch(ex){
        exports.sendErrorReport("Exception getting cookie: " + ex);
    }
    
    return cookie;
};

exports.setCookieHeader = function(http) {
    Ti.API.debug("before get cookie");
    var cookie = exports.getCookie();
    Ti.API.debug("After get cookie");

    if(cookie != null && cookie > "" && cookie != "null"){
        
        try{
            Ti.API.debug("setting header");
            http.setRequestHeader("Cookie", cookie);
            
            Ti.API.debug("After setting header");
        }
        catch(ex){
            exports.sendErrorReport("Could not set cookie for " + http.location);
        }
    }
    
    Ti.API.debug("End of cookie header");
};

exports.sendErrorReport = function(message){
    var http, uid, domain, appVersion, platform, model, version;
    
    Ti.API.error("ERROR: " + message);
    
    uid = exports.getUid();
    
    domain = Ti.App.DOMAIN_NAME.replace('https://', '').replace('.omadi.com', '');
    appVersion = Ti.App.version;
    model = Ti.Platform.model;
    version = Ti.Platform.version;
    platform = Ti.Platform.name;
    
    http = Ti.Network.createHTTPClient({
        enableKeepAlive: false,
        validatesSecureCertificate: false,
        timeout: 30000
    });
    
    http.onerror = function(){
       Ti.App.fireEvent("errorReportFailed");
    };
    
    http.onload = function(){
       Ti.App.fireEvent("errorReportSuccess");
    };
    
    http.open('POST', Ti.App.DOMAIN_NAME + '/js-sync/error.json');
    
    http.setRequestHeader("Content-Type", "application/json");
    exports.setCookieHeader(http);

    http.send(JSON.stringify({
        domain: domain,
        platform: platform,
        model: model,
        version: version,
        appVersion: appVersion,
        uid: uid,
        message: message
    }));
};

exports.getTimeFormat = function(){
    var format, loginJson = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
    format = 'g:iA';
    
    if(typeof loginJson.user.time_format === 'string'){
        format = loginJson.user.time_format;
    }
    
    return format;
};

exports.PHPFormatDate = function(format, timestamp){
    var jsDate = new Date();
    jsDate.setTime(timestamp * 1000);
    return jsDate.format(format);
};

exports.formatDate = function(timestamp, showTime){
    
    var format = "D, M j, Y";
    if(showTime){
        format += ' - ' + exports.getTimeFormat();
    }
    
    return (new Date(timestamp * 1000)).format(format);
};

exports.formatTime = function(timestamp){
    
    var format = exports.getTimeFormat();
    return (new Date(timestamp * 1000)).format(format);
};

Date.prototype.format = function(format) {
    
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
    d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
    D: function() { return Date.replaceChars.shortDays[this.getDay()]; },
    j: function() { return this.getDate(); },
    l: function() { return Date.replaceChars.longDays[this.getDay()]; },
    N: function() { return this.getDay() + 1; },
    S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
    w: function() { return this.getDay(); },
    z: function() { var d = new Date(this.getFullYear(),0,1); return Math.ceil((this - d) / 86400000); }, // Fixed now
    // Week
    W: function() { var d = new Date(this.getFullYear(), 0, 1); return Math.ceil((((this - d) / 86400000) + d.getDay() + 1) / 7); }, // Fixed now
    // Month
    F: function() { return Date.replaceChars.longMonths[this.getMonth()]; },
    m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
    M: function() { return Date.replaceChars.shortMonths[this.getMonth()]; },
    n: function() { return this.getMonth() + 1; },
    t: function() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 0).getDate(); }, // Fixed now, gets #days of date
    // Year
    L: function() { var year = this.getFullYear(); return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)); },   // Fixed now
    o: function() { var d  = new Date(this.valueOf());  d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3); return d.getFullYear();}, //Fixed now
    Y: function() { return this.getFullYear(); },
    y: function() { return (''.toString() + this.getFullYear()).substr(2); },
    // Time
    a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
    A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
    B: function() { return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24); }, // Fixed now
    g: function() { return this.getHours() % 12 || 12; },
    G: function() { return this.getHours(); },
    h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
    H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
    i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
    s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
    u: function() { var m = this.getMilliseconds(); return (m < 10 ? '00' : (m < 100 ? '0' : '')) + m; },
    // Timezone
    e: function() { return "Not Yet Supported"; },
    I: function() { return "Not Yet Supported"; },
    O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
    P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':00'; }, // Fixed now
    T: function() { /*jslint regexp:true*/ var m, result; m = this.getMonth(); this.setMonth(0); result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
    Z: function() { return -this.getTimezoneOffset() * 60; },
    // Full Date/Time
    c: function() { return this.format("Y-m-d\\TH:i:sP"); }, // Fixed now
    r: function() { return this.toString(); },
    U: function() { return this.getTime() / 1000; }
};

exports.secondsToString = function(seconds) {
    var format, am_pm, hours, hours_str, minutes, time_string, new_hours;
    
    format = exports.getTimeFormat();

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

exports.formatDuration = function(timestamp) {
	var millisPerSecond = 1000;
	var millisPerMinute = millisPerSecond * 60;
	var millisPerHour = millisPerMinute * 60;
	var millisPerDay = millisPerHour * 24;

	var days = Math.round(timestamp / millisPerDay);
	var hours = Math.round(timestamp / millisPerHour) % 24;
	var minutes = Math.round(timestamp / millisPerMinute) % 60;
	var seconds = Math.round(timestamp / millisPerSecond) % 60;
	
	var stringParts = [];
	if (days) { stringParts.push(days + ' day' + (days > 1 ? 's' : '')); }
	if (hours) { stringParts.push(hours + ' hour' + (hours > 1 ? 's' : '')); }
	if (minutes) { stringParts.push(minutes + ' minute' + (minutes > 1 ? 's' : '')); }
	if (seconds) { stringParts.push(seconds + ' second' + (seconds > 1 ? 's' : '')); }
	
	var string;
	if (stringParts.length > 2) {
		string = stringParts.join(', ');
	} else {
		string = stringParts.join(' ');
	}
	return string;
};

exports.getParsedJSON = function(str){
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

exports.isEmpty = function(number){
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

exports.isArray = function(input) {
    return typeof (input) == 'object' && ( input instanceof Array);
};

exports.trimWhiteSpace = function(string) {
    
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

exports.setCookie = function(cookie) {
    /*jslint regexp:true*/
	try{
        if(cookie != null && cookie > "" && cookie != "null"){
            var matches = cookie.match(/^(.+?)=(.+?);/);
            
            var name = matches[1] || '';
            var value = matches[2] || '';
            
            var setCookie = Ti.Network.createCookie({
                domain: Ti.App.DOMAIN_NAME.replace('https://', '.'),
                path: '/',
                secure: true,
                httponly: true,
                name: name,
                value: value
            });
            
            Ti.Network.addSystemCookie(setCookie);
            
            return true;
        }
    }
    catch(ex){
		if (Ti.App.isAndroid) {
			exports.sendErrorReport("Exception setting cookies for web view: " + ex);
		}
    }
    return false;
};

exports.getUTCTimestampServerCorrected = function(){
    var nowServerCorrected, serverOffset;
        
    nowServerCorrected = Math.round(new Date() / 1000);
    
    serverOffset = Ti.App.Properties.getDouble("service:serverTimestampOffset", 0);
    
    // Add the server offset to get a more accurate timestamp += about 5 seconds
    if(serverOffset != 0){
        nowServerCorrected += serverOffset;
    }
    
    return nowServerCorrected;
};

exports.applyNumberFormat = function(instance, value) {
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

exports.isNumber = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

exports.sortByWeight = function(a, b) {
    if (parseInt(a.weight, 10) < parseInt(b.weight, 10)){
        return -1;
    }
    if (parseInt(a.weight, 10) > parseInt(b.weight, 10)){
        return 1;
    }
    // a must be equal to b
    return 0;
};

exports.mktime = function() {
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

exports.listSearchSetDatestampValueFromRelative = function(relativeString){
    var retval = null, now;
    now = exports.getUTCTimestamp();

    switch(relativeString){
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

exports.listSearchNodeMatchesSearchCriteria = function(node, criteria) {
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

            instances = Node.getFields(node.type);

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
                                    compare_times[i] = search_time_value + exports.mktime(0, 0, 0, exports.PHPFormatDate('n', Number(nodeDBValues[i])), exports.PHPFormatDate('j', Number(nodeDBValues[i])), exports.PHPFormatDate('Y', Number(nodeDBValues[i])));
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

                                        compare_times2[i] = search_time_value2 + exports.mktime(0, 0, 0, exports.PHPFormatDate('n', Number(nodeDBValues[i])), exports.PHPFormatDate('j', Number(nodeDBValues[i])), exports.PHPFormatDate('Y', Number(nodeDBValues[i])));

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
                                if (!exports.isArray(search_value.weekday)) {

                                    weekdays = [];

                                    for (i in search_value.weekday) {
                                        if (search_value.weekday.hasOwnProperty(i)) {

                                            weekdays.push(i);
                                        }
                                    }
                                }

                                for ( i = 0; i < nodeDBValues.length; i++) {

                                    if (exports.inArray(exports.PHPFormatDate('w', Number(nodeDBValues[i])), weekdays)) {

                                        row_matches[criteria_index] = true;
                                        Ti.API.debug("IS WEEKDAY MATCH");
                                    }
                                }
                            }
                            else{
                        
                                search_datestamp_value = search_value.timestamp;
                                search_datestamp_operator = search_value.operator;
            
                                if(search_datestamp_operator != 'user-defined'){
                                    search_datestamp_value = exports.list_search_set_datestamp_value_from_relative(search_datestamp_operator);
                                }
                                
                                if(search_operator == 'between'){
                                    
                                    search_value2 = null;
                                    if(typeof criteria_row.value2 !== 'undefined'){
                                        search_value2 = criteria_row.value2;
                                    }
                                    
                                    search_datestamp_value2 = search_value2.timestamp;
                                    search_datestamp_operator2 = search_value2.operator;
                                    
                                    if(search_datestamp_operator2 != 'user-defined'){
                                        search_datestamp_value2 = exports.listSearchSetDatestampValueFromRelative(search_datestamp_operator2);
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
                                        if (exports.isEmpty(search_value) && search_operator === '=') {
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
                                                if (exports.strpos(node_value, search_value) === false) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;

                                            case 'starts with':
                                                if (exports.strpos(node_value, search_value) === 0) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;

                                            case 'ends with':
                                                if (exports.strpos(node_value, search_value) === node_value.length - search_value.length) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;

                                            case 'not starts with':
                                                if (exports.strpos(node_value, search_value) !== 0) {
                                                    row_matches[criteria_index] = true;
                                                }
                                                break;

                                            case 'not ends with':
                                                if (exports.strpos(node_value, search_value) !== node_value.length - search_value.length) {
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
                                                if (exports.strpos(node_value, search_value) !== false) {
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
                                        
                                        Ti.API.info("search values: " + JSON.stringify(search_value));
                                        
                                        if(search_value){
                                            if(typeof node[field_name] !== 'undefined'){
                                                if(typeof node[field_name].textValues !== 'undefined'){
                                                    for(i = 0; i < node[field_name].textValues.length; i ++){
                                                        jsonValues.push(JSON.parse(node[field_name].textValues[i]));
                                                    }
                                                }
                                            }
                                            
                                            Ti.API.info("json values: " + JSON.stringify(jsonValues));
                                            
                                            tids = [];
                                            nodeDescNames = {};
                                            
                                            for(i = 0; i < jsonValues.length; i ++){
                                                if(jsonValues[i] && typeof jsonValues[i].desc !== 'undefined'){
                                                    nodeDescNames[jsonValues[i].desc] = jsonValues[i].desc;
                                                }
                                            }
                                            
                                            Ti.API.info("desc: " + JSON.stringify(nodeDescNames));
                                            
                                            result = Database.query("SELECT vid from vocabulary WHERE machine_name='" + search_field.settings.vocabulary + "'");
    
                                            query = 'SELECT tid, name from term_data WHERE vid=' + result.fieldByName('vid');
                                            
                                            result.close();
    
                                            result = Database.query(query);
                                            while (result.isValidRow()) {
                                                if(typeof nodeDescNames[result.fieldByName('name')] !== 'undefined'){
                                                    tids.push(result.fieldByName('tid'));
                                                }
                                                result.next();
                                            }
                                            result.close();
                                            Database.close();
                                            
                                            Ti.API.info("tids: " + JSON.stringify(tids));
                                            
                                            if(tids.length > 0){
                                                // Make sure the search value is an array
                                                // This will convert an object to an array or a string to an array
                                                searchValues = [];
                                                if (!exports.isArray(search_value)) {

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
                                            
                                            Ti.API.info("matches: " + row_matches[criteria_index]);
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
                                                query += " AND title LIKE '%" + exports.sqlEscape(search_value) + "%'";
                                                break;
                                            case 'ends with':
                                            case 'not ends with':
                                                query += " AND title LIKE '%" + exports.sqlEscape(search_value) + "'";
                                                break;
                                            case '=':
                                            case '!=':
                                                
                                                if(typeof search_field.widget.type !== 'undefined' && search_field.widget.type == 'omadi_reference_select'){
                                                    // Make sure the search value is an array
                                                    searchValues = [];
                                                    if (!exports.isArray(search_value)) {

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
                                                        query += " AND nid IN (" + exports.dbEsc(search_value.join(",")) + ")";
                                                    }
                                                    else{
                                                        query += " AND title='" + exports.dbEsc(search_value[0]) + "'";
                                                    }
                                                }
                                                else{
                                                    query += " AND title='" + exports.dbEsc(search_value) + "'";
                                                }
                                                
                                                break;
                                            default:
                                                query += " AND title LIKE '%" + exports.sqlEscape(search_value) + "'%";
                                                break;
                                        }
    
                                        result = Database.query(query);
    
                                        possibleValues = [];
                                        while (result.isValidRow()) {
                                            possibleValues.push(result.fieldByName('nid'));
                                            result.next();
                                        }
                                        result.close();
                                        Database.close();
    
                                        if (nodeDBValues.length == 0) {
                                            if (exports.isEmpty(search_value) && search_operator === '=') {
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
                                                        if (exports.inArray(node_value, possibleValues)) {
                                                            row_matches[criteria_index] = false;
                                                        }
                                                    }
                                                }
                                                
                                                Ti.API.info("!= " + row_matches[criteria_index]);
                                                break;
                                            default:
                                                for ( i = 0; i < nodeDBValues.length; i++) {
                                                    node_value = nodeDBValues[i];
                                                    if (exports.inArray(node_value, possibleValues)) {
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
                                        search_value = exports.getUid();
                                    }
                                    // Make sure the search value is an array
                                    searchValues = [];
                                    if (!exports.isArray(search_value)) {

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
                                                if (exports.inArray(chosen_value, nodeDBValues)) {
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
                                                if (exports.inArray(chosen_value, nodeDBValues)) {

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
                                        if (!exports.isArray(search_value)) {

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
                                                    if (exports.inArray(chosen_value, nodeDBValues)) {
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
                                                    if (exports.inArray(chosen_value, nodeDBValues)) {
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
                                            result = Database.query('SELECT vid from vocabulary WHERE machine_name="' + search_field.settings.vocabulary + '";');
    
                                            query = 'SELECT tid from term_data WHERE vid=' + result.fieldByName('vid');
                                            switch(search_operator) {
                                                case 'starts with':
                                                case 'not starts with':
                                                    query += " AND name LIKE '" + exports.sqlEscape(search_value) + "%'";
                                                    break;
    
                                                case 'ends with':
                                                case 'not ends with':
                                                    query += " AND name LIKE '%" + exports.sqlEscape(search_value) + "'";
                                                    break;
    
                                                default:
                                                    query += " AND name LIKE '%" + exports.sqlEscape(search_value) + "%'";
                                                    break;
                                            }
    
                                            result.close();
    
                                            result = Database.query(query);
                                            possibleValues = [];
                                            while (result.isValidRow()) {
                                                possibleValues.push(result.fieldByName('tid'));
                                                result.next();
                                            }
                                            result.close();
                                            Database.close();
    
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
                                                            if (exports.inArray(node_value, possibleValues)) {
                                                                row_matches[criteria_index] = false;
                                                            }
                                                        }
                                                    }
                                                    break;
    
                                                default:
                                                    for ( i = 0; i < nodeDBValues.length; i++) {
                                                        node_value = nodeDBValues[i];
                                                        if (exports.inArray(node_value, possibleValues)) {
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

            if (exports.count(criteria.search_criteria) == 1) {

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
        exports.sendErrorReport("Exception in matching search criteria: " + e);
    }

    return true;
};

exports.sqlEscape = function(str) {
	str = str || '';
	var result = str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
		switch (char) {
			case "\0":
				return "\\0";
			case "\x08":
				return "\\b";
			case "\x09":
				return "\\t";
			case "\x1a":
				return "\\z";
			case "\n":
				return "\\n";
			case "\r":
				return "\\r";
			case "\"":
			case "'":
			case "\\":
			case "%":
				return "\\"+char; // prepends a backslash to backslash, percent,
			                      // and double/single quotes
	    }
	});
	return result;
};

exports.inArray = function(val, haystack) {
    var i;
    for (i = 0; i < haystack.length; i++) {
        if (haystack[i] == val) {
            return true;
        }
    }
    return false;
};

exports.count = function(obj){
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

exports.formatCurrency = function(amount){
    var price = "";
    if(amount != ""){
        if(!isNaN(parseFloat(amount))){
            price = '$' + parseFloat(Math.round(amount * 100) / 100).toFixed(2);
        }
    }  
    return price;
};

exports.getPhotoWidget = function(){
    return Ti.App.Properties.getString("photoWidget", 'take');
};

exports.strpos = function(haystack, needle, offset) {
    var i = (haystack + ''.toString()).indexOf(needle, (offset || 0));
    return i === -1 ? false : i;
};

exports.dbEsc = function(string) {
    if (typeof string === 'undefined' || string === null || string === false) {
        return '';
    }

    string += "".toString();
    return string.replace(/[']/g, "''");
};

exports.fileSortByModified = function (a, b){
    return ((a.modifiedTimestamp < b.modifiedTimestamp) ? 1 : -1);
};

exports.getTimeAgoStr = function(unix_timestamp) {

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

exports.getClientAccount = function(){
    var result, clientAccount = null;
    
    result = Database.queryList("SELECT client_account FROM history LIMIT 1");
    if(result.isValidRow()){
        clientAccount = result.fieldByName('client_account');
    }
    Database.close();
    
    return clientAccount;
};

exports.getCurrentVehicleNid = function(){
    var result, nid;
    
    nid = 0;
    
    try {
	    result = Database.queryList("SELECT in_vehicle_nid FROM history WHERE id_hist=1");
	    if(result.isValidRow()){
	        nid = result.field(0, Ti.Database.FIELD_TYPE_INT);
	    }
    } catch (error) {
		exports.sendErrorReport('Error in getCurrentVehicleNid: ' + error);
    }
    result.close();
    Database.close();
    
    return nid;
};

exports.getCurrentVehicleName = function(){
    var result, nid, name;
    
    nid = exports.getCurrentVehicleNid();
    name = null;
    
    try {
	    if(nid > 0){
	        result = Database.query("SELECT title FROM node WHERE nid = " + nid);
	        if(result.isValidRow()){
	            name = result.field(0);
	        }
	        result.close();
	    }
    } catch (error) {
		exports.sendErrorReport('Error in getCurrentVehicleName: ' + error);
    }
    
    Database.close();
    
    return name;
};

exports.getRealname = function(uid){
    var db, result, realname;
    
    if (typeof uid == 'undefined') {
		uid = exports.getUid();
    }
    
    realname = '';
    
    result = Database.query("SELECT username, realname FROM user WHERE uid = " + uid);
    if(result.isValidRow()){
        realname = result.fieldByName('realname');
        if(realname.length == 0){
            realname = result.fieldByName('username');
        }
    }
    result.close();
    Database.close();
    
    return realname;
};
