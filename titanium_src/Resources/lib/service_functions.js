/*global Omadi,dbEsc,isJsonString,AndroidSysUtil*/
/*jslint eqeq:true,plusplus:true*/

var Comments = require('services/Comments');
var Utils = require('lib/Utils');
var Service = require('lib/Service');
var GeofenceServices = require('services/GeofenceServices');

Omadi.service = Omadi.service || {};


Omadi.service.refreshSession = function() {"use strict";
    var http;

    if (Ti.App.isIOS) {
        // The cookie only needs to be refreshed for iOS right now.
        // Android has a little less security when setting cookies
        // This was implemented solely for the purpose of using the webview in the fileViewer.js file
        // Without getting a Set-Cookie header in a response at some point, iOS will not allow an unknown cookie to be sent
        // Therefore, this needed to be added

        if (Ti.Network.online && !Ti.App.Properties.getBool("sessionRefreshed", false)) {
            if (!Omadi.data.isUpdating()) {
                
                Omadi.data.setUpdating(true);

                http = Ti.Network.createHTTPClient({
                    enableKeepAlive: false,
                    validatesSecureCertificate: false,
                    timeout: 10000
                });
                
                http.open('POST', Ti.App.DOMAIN_NAME + '/js-sync/sync/refreshSession.json');

                Omadi.utils.setCookieHeader(http);
                http.setRequestHeader("Content-Type", "application/json");

                http.onload = function(e) {
                    var db_list, cookie, list_result;

                    db_list = Omadi.utils.openListDatabase();

                    cookie = this.getResponseHeader('Set-Cookie');
                    Utils.setCookie(cookie);

                    list_result = db_list.execute('SELECT COUNT(*) AS count FROM login WHERE id_log=1');
                    if (list_result.fieldByName('count') > 0) {
                        db_list.execute("BEGIN IMMEDIATE TRANSACTION");
                        db_list.execute("UPDATE login SET is_logged = 'true', cookie = '" + dbEsc(cookie) + "' WHERE id_log=1");
                        db_list.execute("COMMIT TRANSACTION");
                    }
                    
                    list_result.close();

                    db_list.close();

                    Omadi.data.setUpdating(false);

                    Ti.App.Properties.setBool("sessionRefreshed", true);
                };

                http.onerror = function(e) {
                    var dialog;

                    Omadi.data.setUpdating(false);

                    if (this.status == 403) {
                        
                        // Do not allow a logout when a background logout is disabled
                        // Currently, this should only be when the user is filling out a form
                        if(Ti.App.allowBackgroundLogout){
                            dialog = Titanium.UI.createAlertDialog({
                                title : 'Omadi',
                                buttonNames : ['OK'],
                                message : "You were logged out while refreshing your session. Please log back in."
                            });
    
                            dialog.addEventListener('click', function(e) {
                                try{
                                    var db_func = Omadi.utils.openListDatabase();
                                    db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                                    db_func.close();
                                }
                                catch(ex){
                                    Utils.sendErrorReport("exception in logged out 403: " + ex);
                                }
                            });
    
                            Omadi.service.logout();
                            dialog.show();
                        }
                    }
                    else if (this.status == 401) {
                        
                        // Do not allow a logout when a background logout is disabled
                        // Currently, this should only be when the user is filling out a form
                        if(Ti.App.allowBackgroundLogout){
                            dialog = Titanium.UI.createAlertDialog({
                                title : 'Omadi',
                                buttonNames : ['OK'],
                                message : "Your session is no longer valid, and it could not be refreshed. Please log back in."
                            });
    
                            dialog.addEventListener('click', function(e) {
                                try{
                                    var db_func = Omadi.utils.openListDatabase();
                                    db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                                    db_func.close();
                                }
                                catch(ex){
                                    Utils.sendErrorReport("exception in logged out 401: " + ex);
                                }
                            });
    
                            dialog.show();
                            Omadi.service.logout();
                        }
                        
                    }
                    else {
                        setTimeout(Omadi.service.refreshSession, 40000);
                    }
                };

                http.send();
            }
            else {
                setTimeout(Omadi.service.refreshSession, 10000);
            }
        }
        else {

            Ti.Network.addEventListener('change', function(e) {
                var isOnline = e.online;
                if (isOnline && !Ti.App.Properties.getBool("sessionRefreshed", false)) {
                    Omadi.service.refreshSession();
                }
            });
        }
    }
};

Omadi.service.setNodeViewed = function(nid) {"use strict";
    Node.setViewed(nid);
};

Omadi.service.fetchUpdates = function(useProgressBar, userInitiated) {"use strict";
	Service.fetchUpdates(useProgressBar, userInitiated);
};

Omadi.service.setSendingData = function(isSendingData){"use strict";
    Service.setSendingData(isSendingData);
};

Omadi.service.logout = function() {"use strict";
	Service.logout();
};

Omadi.service.uploadBackgroundFile = function(){"use strict";
    Service.uploadBackgroundFile();
};

Omadi.service.abortFileUpload = function(){"use strict";
    Service.abortFileUpload();
};

Omadi.service.checkUpdate = function(useProgressBar, userInitiated){"use strict";
    Service.checkUpdate(useProgressBar, userInitiated);
};


