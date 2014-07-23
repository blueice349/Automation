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
        this.sendError("Exception getting cookie: " + ex);
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












// Return the currently logged in user
exports.getUid = function(){"use strict";
    return getInstance().getUid();
};

exports.getUTCTimestamp = function(){"use strict";
    return getInstance().getUTCTimestamp();
};

exports.sendErrorReport = function(message) {"use strict";
    return getInstance().sendErrorReport();
};

exports.setCookieHeader = function(http){"use strict";
    return getInstance().setCookieHeader(http);
};
