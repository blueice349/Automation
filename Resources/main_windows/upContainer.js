//Current window's instance
var updateWin = Ti.UI.currentWindow;

//Common used functions
Ti.include('../lib/functions.js');

var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

var updatedTime = db.execute('SELECT timestamp FROM updated WHERE rowid=1');

Ti.API.info("Timestamp: "+ updatedTime.fieldByName('timestamp'));	
var time = updatedTime.fieldByName('timestamp');
updatedTime.close();

var pageIndex = 0;

//call function to install updates
// installMe(pageIndex, win, timeIndex)
Titanium.App.Properties.setBool("indicatorActive", true);
installMe(pageIndex, updateWin, time, "settings");

setInterval(function(){
	if (!Titanium.App.Properties.getBool("indicatorActive")){
		var winSettings = Ti.UI.createWindow({
			url: "settings.js",
			fullscreen: true
		});

		winSettings.open();
		updateWin.close();
	}
}, 1000);