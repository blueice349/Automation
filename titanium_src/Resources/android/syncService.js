
Ti.include("/lib/functions.js");
/*global Omadi*/

Ti.API.info("Starting Android Sync Service");

var interval;

function stopUpdates(){"use strict";
    clearInterval(interval);
    
    Ti.API.info("TRYING TO STOP Sync Updates NOW!!!");
    try {
        Titanium.Android.currentService.stop();
    }
    catch(ex) {
        Ti.API.error("Stopping sync update service: " + ex);
    }
}

(function(){"use strict";
    interval = setInterval(Omadi.service.checkUpdate, 30000);
    
    Ti.App.addEventListener("stopUpdates", stopUpdates);
}());

