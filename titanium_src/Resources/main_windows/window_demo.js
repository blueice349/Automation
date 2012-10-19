Ti.include('/lib/functions.js');
var window = Ti.UI.currentWindow;
if (Titanium.Platform.name == 'android') {
	try {
		var downloadingFileUrl = "https://downtown_test.omadi.com/sync/file/3580/515"
		var filename = 'test.pdf';
		Titanium.API.log(Ti.Filesystem.isExternalStoragePresent());
		if (Ti.Filesystem.isExternalStoragePresent()) {
			Titanium.API.log('demo1')
			var fileSavingPath = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, filename);
		}
		else {
			Titanium.API.log('demo2')
			var fileSavingPath = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
		}
		Titanium.API.log(fileSavingPath)
		var myHttpClient = Ti.Network.createHTTPClient();
		//On success of downloading
		myHttpClient.onload = function() {
			//alert(1);
			//Write the file to the desired path
			//alert(myHttpClient.responseData);
			fileSavingPath.write(this.responseData);
			Titanium.API.log(fileSavingPath.nativePath)
           var intent = Ti.Android.createIntent({
            action: Ti.Android.ACTION_VIEW,
            type: "application/pdf",
            data: fileSavingPath.nativePath
        });

        try {
            Ti.Android.currentActivity.startActivity(intent);
        } catch(e) {
            Ti.API.debug(e);
            alert('No apps PDF apps installed!');
        }		
        };
		myHttpClient.onerror = function(e) {
			Ti.API.debug(e.error);
			alert('error');
		},
		myHttpClient.open("GET", downloadingFileUrl);
		//Send request
		myHttpClient.send();
		Titanium.API.log('demo3')
	} catch(e) {
}
} else {
	var webview = Titanium.UI.createWebView({
		url : "https://downtown_test.omadi.com/sync/file/3580/515",
		scalesPageToFit : true,
		width : 'auto',
		height : Titanium.Platform.displayCaps.platformHeight,
	});
	window.add(webview);
}

window.open({
	modal : true
});
//"https://downtown_test.omadi.com/sync/file/3580/515"