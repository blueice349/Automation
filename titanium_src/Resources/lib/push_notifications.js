Omadi.push_notifications = {};

/*jslint eqeq:true*/
/*global dbEsc, alertQueue*/

var Cloud = require('ti.cloud');
//Cloud.debug = true;

Omadi.push_notifications.registeriOS = function() {"use strict";

    Titanium.Network.registerForPushNotifications({
        types : [Titanium.Network.NOTIFICATION_TYPE_BADGE, Titanium.Network.NOTIFICATION_TYPE_ALERT, Titanium.Network.NOTIFICATION_TYPE_SOUND],
        success : function(e) {
            var db, userDeviceToken;

            userDeviceToken = e.deviceToken;

            db = Omadi.utils.openListDatabase();
            db.execute("UPDATE history SET device_token='" + dbEsc(userDeviceToken) + "' WHERE id_hist=1");
            db.close();

            Ti.App.fireEvent('iOSRegistered');
        },
        error : function(e) {

            var dialog = Ti.UI.createAlertDialog({
                message : "There was a problem enabling push notifications."
            });
            
            if ( typeof alertQueue !== 'undefined') {
                alertQueue.push(dialog);
            }
            else {
                dialog.show();
            }
            //alert("There was a problem enabling push notifications.");
            Omadi.service.sendErrorReport('onIOSRegister' + JSON.stringify(e));
        },
        callback : function(e) {
            var sound, dialog;

            sound = Ti.Media.createSound({
                url : Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, "sounds/notificationBeep.wav"),
                volume : 1.0
            });

            sound.play();

            if (e.data.fetchUpdates == 1) {
                Omadi.service.fetchUpdates();
            }

            if (e.data.showAlert == 1) {
                dialog = Ti.UI.createAlertDialog({
                    message : e.data.alert,
                    title : e.data.title
                });

                if ( typeof alertQueue !== 'undefined') {
                    alertQueue.push(dialog);
                }
                else {
                    dialog.show();
                }
            }
        }
    });
};

Omadi.push_notifications.getUserName = function() {"use strict";
    var uid, clientAccount;

    uid = Omadi.utils.getUid();
    clientAccount = Omadi.utils.getClientAccount();

    return clientAccount + '_' + uid;
};

Omadi.push_notifications.getPassword = function() {"use strict";
    var md5 = Ti.Utils.md5HexDigest(Omadi.push_notifications.getUserName() + "OmadiCRMMRCidamO");

    return md5.substring(0, 20);
};

Omadi.push_notifications.logoutUser = function() {"use strict";
    Cloud.Users.logout(function(e) {
        if (e.success) {
            Ti.API.info("ACS User logged out successfully");
        }
        else {
            var dialog = Ti.UI.createAlertDialog({
                message : "There was a problem disabling push notifications. You may still receive push notifications even though you are logged out."
            });
            if ( typeof alertQueue !== 'undefined') {
                alertQueue.push(dialog);
            }
            else {
                dialog.show();
            }

            Omadi.service.sendErrorReport('onACSLogout' + JSON.stringify(e));
        }
    });
};

Omadi.push_notifications.setupACSPush = function() {"use strict";

    var type, userDeviceToken = Omadi.push_notifications.getDeviceToken();

    if (Ti.App.isAndroid) {
        type = 'android';
    }
    else {
        type = 'ios';
    }

    Cloud.PushNotifications.subscribe({
        channel : Omadi.utils.getClientAccount(),
        type : type,
        device_token : userDeviceToken
    }, function(e) {
        if (e.success) {
            Ti.API.info("ACS Push notification subscription successful");
        }
        else {
            var dialog = Ti.UI.createAlertDialog({
                message : 'There was a problem setting up push notifications. Please try again by logging back in.'
            });
            if ( typeof alertQueue !== 'undefined') {
                alertQueue.push(dialog);
            }
            else {
                dialog.show();
            }

            Omadi.service.sendErrorReport('onACSSubscribe' + JSON.stringify(e));
        }
    });
};

Omadi.push_notifications.loginUser = function() {"use strict";

    Cloud.Users.login({
        login : Omadi.push_notifications.getUserName(),
        password : Omadi.push_notifications.getPassword()
    }, function(e) {
        if (e.success) {
            Ti.API.info("User logged into ACS successfully");
            Omadi.push_notifications.setupACSPush();

            if (Omadi.push_notifications.needToLinkUser()) {
                Omadi.push_notifications.linkACSUserId();
            }
        }
        else {
            if (e.code == 401) {
                Omadi.push_notifications.createUser();
            }
            else {
                var dialog = Ti.UI.createAlertDialog({
                    message : 'There was a problem setting up push notifications. Please try again by logging back in.'
                });
                if ( typeof alertQueue !== 'undefined') {
                    alertQueue.push(dialog);
                }
                else {
                    dialog.show();
                }

                Omadi.service.sendErrorReport('onACSLoginUser' + JSON.stringify(e));
            }
        }
    });
};

Omadi.push_notifications.createUser = function() {"use strict";

    Cloud.Users.create({
        username : Omadi.push_notifications.getUserName(),
        password : Omadi.push_notifications.getPassword(),
        password_confirmation : Omadi.push_notifications.getPassword()
    }, function(e) {

        if (e.success) {
            Ti.API.info("ACS User created successfully");
            Omadi.push_notifications.setupACSPush();
            Omadi.push_notifications.linkACSUserId();
        }
        else {
            var dialog = Ti.UI.createAlertDialog({
                message : 'There was a problem setting up push notifications. Please try again by logging back in.'
            });
            if ( typeof alertQueue !== 'undefined') {
                alertQueue.push(dialog);
            }
            else {
                dialog.show();
            }
            Omadi.service.sendErrorReport('onACSCreateUser' + JSON.stringify(e));
        }
    });
};

Omadi.push_notifications.init = function() {"use strict";

    if (Ti.App.isIOS) {
        Omadi.push_notifications.registeriOS();
        Ti.App.addEventListener('iOSRegistered', function() {
            Omadi.push_notifications.loginUser();
        });
    }
};

Omadi.push_notifications.needToLinkUser = function() {"use strict";
    var loginJson = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
    if ( typeof loginJson.user.acs_user_id !== 'undefined' && loginJson.user.acs_user_id > '') {
        return false;
    }
    return true;
};

Omadi.push_notifications.linkACSUserId = function() {"use strict";

    Cloud.Users.showMe(function(e) {

        //alert(JSON.stringify(e));
        if (e.success) {
            if ( typeof e.users !== 'undefined' && typeof e.users[0] !== 'undefined' && typeof e.users[0].id !== 'undefined') {
                Omadi.push_notifications.sendACSUserId(e.users[0].id);
            }
        }
        else {
            var dialog = Ti.UI.createAlertDialog({
                message : 'There was a problem setting up push notifications. Please try again by logging back in.'
            });
            if ( typeof alertQueue !== 'undefined') {
                alertQueue.push(dialog);
            }
            else {
                dialog.show();
            }
            Omadi.service.sendErrorReport('onACSShowMe' + JSON.stringify(e));
        }
    });
};

Omadi.push_notifications.sendACSUserId = function(acsUserID) {"use strict";

    var http = Ti.Network.createHTTPClient();
    http.setTimeout(15000);
    http.open('POST', Omadi.DOMAIN_NAME + '/js-notifications/push_notifications.json');

    http.setRequestHeader("Content-Type", "application/json");
    Omadi.utils.setCookieHeader(http);

    http.onload = function(e) {

    };

    http.onerror = function(e) {
        var dialog = Ti.UI.createAlertDialog({
            message : 'There was a problem setting up push notifications. Please try again by logging back in.'
        });
        if ( typeof alertQueue !== 'undefined') {
            alertQueue.push(dialog);
        }
        else {
            dialog.show();
        }
        Omadi.service.sendErrorReport('onACSSLink' + JSON.stringify(e));
    };

    http.send(JSON.stringify({
        acs_user_id : acsUserID
    }));
};

