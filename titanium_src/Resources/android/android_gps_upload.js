
Ti.include("/lib/functions.js");

if(false && (Ti.App.Properties.getBool('stopGPS', false) || !Omadi.utils.isLoggedIn())){
	try{
		Titanium.Android.currentService.stop();
		//setTimeout(Omadi.display.removeNotifications, 1000);
	}
	catch(ex){
		Ti.API.error("Error stopping gps upload service: " + ex);
	}
}
else{

	Omadi.location.uploadGPSCoordinates();
}


