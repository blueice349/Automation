var win_about = Ti.UI.currentWindow;
win_about.orientationModes = [Titanium.UI.PORTRAIT];

var logo = Ti.UI.createImageView({
	image:'/images/logo.png',
	top: 20
});

win_about.add(logo);

var versionLbl = Ti.UI.createLabel({
	width: 'auto',
	height: 'auto',
	top: 150,
	left: 10,
	text: 'Application version : ' + Ti.App.version
});

win_about.add(versionLbl);

var ls = Titanium.App.Properties.getDouble("lastSynced");
var lastSyncText;
if(ls != null){
	var d = new Date(ls);
	lastSyncText = 'Last synced on : ' + d.toString();
}else{
	lastSyncText = 'Last synced on : NA';
}
var syncLbl = Ti.UI.createLabel({
	width: 'auto',
	height: 'auto',
	top: 190,
	left: 10,
	text: lastSyncText
});

win_about.add(syncLbl);

// Ti.include('/lib/functions.js');
// var db_updated = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );
// var update = db_updated.execute('SELECT timestamp, updating FROM updated');
// 
// if(update != null && update.isValidRow()){
	// var timestamp = update.getFieldByName('timestamp');
	// var updating = update.getFieldByName('updating');
// 	
	// if(updating != null && updating == 1){
		// syncLbl.text = 'Last synced on : Syncing now...';
	// }else{
		// if(timestamp != null){
			// var d = new Date(timestamp*1000);
			// syncLbl.text = 'Last synced on : ' + d.toLocaleString();
		// }else{
			// syncLbl.text = 'Last synced on : NA';
		// }
	// }
// 	
	// update.close();	
// }
// db_updated.close();