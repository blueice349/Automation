/*jslint eqeq:true,nomen:true*/

var _instance = null;

var Database = require('lib/Database');

function Utils(){"use strict";
    
}

function getInstance(){"use strict";
    if(_instance === null){
        _instance = new Utils();
    }
    
    return _instance;
}

Utils.prototype.getUid = function(){"use strict";
    var loginJson = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
    return parseInt(loginJson.user.uid, 10);
};

Utils.prototype.getUTCTimestamp = function(){"use strict";
    return Math.round(new Date() / 1000);  
};

Utils.prototype.getCookie = function(fullCookie){"use strict";
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
        this.sendErrorReport("Exception getting cookie: " + ex);
    }
    
    return cookie;
};

Utils.prototype.setCookieHeader = function(http) {"use strict";
    Ti.API.debug("before get cookie");
    var cookie = this.getCookie();
    Ti.API.debug("After get cookie");

    if(cookie != null && cookie > "" && cookie != "null"){
        
        try{
            Ti.API.debug("setting header");
            http.setRequestHeader("Cookie", cookie);
            
            Ti.API.debug("After setting header");
        }
        catch(ex){
            Ti.API.error("Could not set http cookie header");
            Ti.API.error(cookie);
            this.sendErrorReport("Could not set cookie for " + http.location);
        }
    }
    
    Ti.API.debug("End of cookie header");
};

Utils.prototype.sendErrorReport = function(message){"use strict";
    var http, uid, domain, appVersion, platform, model, version;
    
    Ti.API.error("ERROR: " + message);
    
    uid = this.getUid();
    
    domain = Ti.App.DOMAIN_NAME.replace('https://', '').replace('.omadi.com', '');
    appVersion = Ti.App.version;
    model = Ti.Platform.model;
    version = Ti.Platform.version;
    platform = Ti.Platform.name;
    
    http = Ti.Network.createHTTPClient({
        enableKeepAlive: false,
        validatesSecureCertificate: false
    });
    http.setTimeout(30000);
    
    http.onerror = function(){
       Ti.App.fireEvent("errorReportFailed");
    };
    
    http.onload = function(){
       Ti.App.fireEvent("errorReportSuccess");
    };
    
    http.open('POST', Ti.App.DOMAIN_NAME + '/js-sync/error.json');
    
    http.setRequestHeader("Content-Type", "application/json");
    this.setCookieHeader(http);

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

Utils.prototype.getTimeFormat = function(){"use strict";
    var format, loginJson = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
    format = 'g:iA';
    
    if(typeof loginJson.user.time_format === 'string'){
        format = loginJson.user.time_format;
    }
    
    return format;
};





exports.PHPFormatDate = function(format, timestamp){"use strict";
    var jsDate = new Date();
    jsDate.setTime(timestamp * 1000);
    return jsDate.format(format);
};

exports.formatDate = function(timestamp, showTime){"use strict";
    
    var format = "D, M j, Y";
    if(showTime){
        format += ' - ' + getInstance().getTimeFormat();
    }
    
    return (new Date(timestamp * 1000)).format(format);
};

exports.formatTime = function(timestamp){"use strict";
    
    var format = getInstance().getTimeFormat();
    return (new Date(timestamp * 1000)).format(format);
};

exports.getTimeFormat = function(){"use strict";
    getInstance().getTimeFormat();
};

exports.secondsToString = function(seconds) {"use strict";
    var format, am_pm, hours, hours_str, minutes, time_string, new_hours;
    
    format = getInstance().getTimeFormat();
    //Ti.API.error(format);

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

exports.getParsedJSON = function(str){"use strict";
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

exports.isEmpty = function(number){"use strict";
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

exports.isArray = function(input) {"use strict";
    return typeof (input) == 'object' && ( input instanceof Array);
};

// Return the currently logged in user
exports.getUid = function(){"use strict";
    return getInstance().getUid();
};

exports.getUTCTimestamp = function(){"use strict";
    return getInstance().getUTCTimestamp();
};

exports.sendErrorReport = function(message) {"use strict";
    return getInstance().sendErrorReport(message);
};

exports.setCookieHeader = function(http){"use strict";
    return getInstance().setCookieHeader(http);
};

exports.trimWhiteSpace = function(string) {"use strict";
    
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
