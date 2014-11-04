
(function() {"use strict";
	var version, major;
	Ti.App.isAndroid = (Ti.Platform.name === 'android');
	Ti.App.isIOS = !Ti.App.isAndroid;
	Ti.App.isIOS7 = false;
	if(Ti.App.isIOS){
	    version = Ti.Platform.version.split(".");
	    major = parseInt(version[0], 10);
	    if(major >= 7){
	        Ti.App.isIOS7 = true;
	    }
	}
	Ti.App.isIPad = Ti.Platform.osname == 'ipad';
	Ti.App.isAndroid3OrBelow = false;
	if (Ti.App.isAndroid) {
		version = Ti.Platform.version.split(".");
	    major = parseInt(version[0], 10);
	    if (major <= 3) {
	        Ti.App.isAndroid3OrBelow = true;
	    }
	}
	
	Ti.include('/lib/util_functions.js');
	Ti.include('/lib/data_functions.js');
	Ti.include('/lib/display_functions.js');
	Ti.include('/lib/bundle_functions.js');
	
	if(Ti.App.isAndroid){
	    Ti.include('/lib/android/background.js');
	}
	
	Ti.include('/lib/push_notifications.js');
})();

