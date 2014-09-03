/*jslint eqeq:true,plusplus:true */
/*global Omadi,dbEsc*/

var domainName = Ti.App.Properties.getString("domainName");

Ti.App.isAndroid = (Ti.Platform.name === 'android');
Ti.App.isIOS = !Ti.App.isAndroid;
Ti.App.isIOS7 = false;
if(Ti.App.isIOS){
    var version = Ti.Platform.version.split(".");
    var major = parseInt(version[0], 10);
    if(major >= 7){
        Ti.App.isIOS7 = true;
    }
}
Ti.App.isIPad = Ti.Platform.osname == 'ipad';
Ti.App.isAndroid3OrBelow = false;
if (Ti.App.isAndroid) {
	var version = Ti.Platform.version.split(".");
    var major = parseInt(version[0], 10);
    if (major <= 3) {
        Ti.App.isAndroid3OrBelow = true;
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

function getNodeTableInsertStatement(node) {"use strict";

    var sql = 'INSERT OR REPLACE INTO node (nid, perm_edit, perm_delete, created, changed, title, author_uid, flag_is_updated, table_name, form_part, changed_uid, no_data_fields, viewed) VALUES (';
    
    if(typeof node.viewed === 'undefined'){
        node.viewed = 0;
    }
    
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



