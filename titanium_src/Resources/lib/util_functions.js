/*jslint eqeq:true, plusplus: true*/
/*global PLATFORM*/

var Omadi = Omadi || {};
Omadi.utils = Omadi.utils || {};

Omadi.DOMAIN_NAME = domainName;
Omadi.DB_VERSION = "omadiDb1673";

Omadi.utils.openListDatabase = function() {"use strict";
    var db = Ti.Database.install('/database/db_list.sqlite', Omadi.DB_VERSION + "_list");
    if (PLATFORM !== 'android') {
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
    if (PLATFORM !== 'android') {
        db.file.setRemoteBackup(false);
    }
    return db;
};

Omadi.utils.openGPSDatabase = function() {"use strict";
    var db = Ti.Database.install('/database/gps_coordinates.sqlite', Omadi.DB_VERSION + "_" + Omadi.utils.getMainDBName() + "_GPS");
    if (PLATFORM !== 'android') {
        db.file.setRemoteBackup(false);
    }
    return db;
};

Omadi.utils.getUTCTimestamp = function() {"use strict";
    return Math.round(new Date() / 1000);
};

// Takes a timestamp from the past and returns a string with the amount of time elapsed
Omadi.utils.getTimeAgoStr = function(timestamp) {'use strict';

    var d_lastSync, d_now, timeDiff, days, hours, minutes, seconds, timeStr;

    d_lastSync = new Date(timestamp);
    d_now = new Date();

    timeDiff = d_now - d_lastSync;
    // time difference in ms
    days = parseInt(timeDiff / (1000 * 60 * 60 * 24), 10);
    //get days
    timeDiff = Math.round(timeDiff % (1000 * 60 * 60 * 24));

    hours = parseInt(timeDiff / (1000 * 60 * 60), 10);
    // get hours
    timeDiff = Math.round(timeDiff % (1000 * 60 * 60));

    minutes = parseInt(timeDiff / (1000 * 60), 10);
    // get minutes
    timeDiff = Math.round(timeDiff % (1000 * 60));

    seconds = parseInt(timeDiff / 1000, 10);
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

    return timeStr;
};

Omadi.utils.setCookieHeader = function(http) {"use strict";
    var db, result, cookie;

    db = Omadi.utils.openListDatabase();
    result = db.execute('SELECT * FROM login WHERE rowid=1');
    cookie = result.fieldByName("cookie");
    //Ti.API.info("FOUND COOKIE = " + cookie);
    result.close();
    db.close();


    if (PLATFORM === 'android') {
        http.setRequestHeader("Cookie", cookie);
        // Set cookies
    }
    else {
        cookie = cookie.split(';');
        if (!cookie[0]) {
            cookie[0] = "";
        }
        http.setRequestHeader("Cookie", cookie[0]);
        // Set cookies
    }
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

var dateFormat = function() {"use strict";
    /*jslint vars: true, regexp: true, nomen: true*/
   
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g, timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[\-+]\d{4})?)\b/g, timezoneClip = /[^\-+\dA-Z]/g, pad = function(val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len){
            val = "0" + val;
        }
        return val;
    };

    // Regexes and supporting functions are cached through closure
    return function(timestamp, time) {
        var dF = dateFormat;
        var date = new Date(timestamp * 1000);
        var utc = false;
        var mask = "ddd, mmm dd, yyyy";
        if (time) {
            mask = "ddd, mmm dd, yyyy - h:MM TT";
        }

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date();
        if (isNaN(date)){
            throw new SyntaxError("invalid date");
        }

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get", d = date[_ + "Date"](), D = date[_ + "Day"](), m = date[_ + "Month"](), y = date[_ + "FullYear"](), H = date[_ + "Hours"](), M = date[_ + "Minutes"](), s = date[_ + "Seconds"](), L = date[_ + "Milliseconds"](), o = utc ? 0 : date.getTimezoneOffset(), flags = {
            d : d,
            dd : pad(d),
            ddd : dF.i18n.dayNames[D],
            dddd : dF.i18n.dayNames[D + 7],
            m : m + 1,
            mm : pad(m + 1),
            mmm : dF.i18n.monthNames[m],
            mmmm : dF.i18n.monthNames[m + 12],
            yy : String(y).slice(2),
            yyyy : y,
            h : H % 12 || 12,
            hh : pad(H % 12 || 12),
            H : H,
            HH : pad(H),
            M : M,
            MM : pad(M),
            s : s,
            ss : pad(s),
            l : pad(L, 3),
            L : pad(L > 99 ? Math.round(L / 10) : L),
            t : H < 12 ? "a" : "p",
            tt : H < 12 ? "am" : "pm",
            T : H < 12 ? "A" : "P",
            TT : H < 12 ? "AM" : "PM",
            Z : utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
            o : (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
            S : ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
        };

        return mask.replace(token, function($0) {
            return (flags.hasOwnProperty($0)) ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
};

// Some common format strings
dateFormat.masks = {
    "default" : "ddd mmm dd yyyy HH:MM:ss",
    shortDate : "m/d/yy",
    mediumDate : "mmm d, yyyy",
    longDate : "mmmm d, yyyy",
    fullDate : "dddd, mmmm d, yyyy",
    shortTime : "h:MM TT",
    mediumTime : "h:MM:ss TT",
    longTime : "h:MM:ss TT Z",
    isoDate : "yyyy-mm-dd",
    isoTime : "HH:MM:ss",
    isoDateTime : "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime : "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthNames : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};

// // For convenience...
// Date.prototype.format = function (mask, utc) {
// return dateFormat(this, mask, utc);
// };

Omadi.utils.trimWhiteSpace = function(string) {"use strict";
    return string.replace(/^\s+|\s+$/g, "");
};

Ti.include('/lib/location_functions.js');
Ti.include('/lib/service_functions.js');
