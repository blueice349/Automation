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
Titanium.App.Properties.setBool("indicatorActive", true);
installMe(pageIndex, updateWin, time, "settings");

/*
var time_c = setInterval(function(){
	if (!Titanium.App.Properties.getBool("indicatorActive")){
		//updateWin.close();
		Ti.API.info('Loop');
	}
}, 1000);

updateWin.addEventListener('close', function(){
	Ti.API.info("Closed window for time interval");
	clearInterval(time_c);	
});
*/