var win_about = Ti.UI.currentWindow;
win_about.backgroundColor = '#EEEEEE';
win_about.orientationModes = [Titanium.UI.PORTRAIT];
Ti.include('/lib/functions.js');

if(Titanium.Platform.name == 'android') {

} else {
	var back = Ti.UI.createButton({
		title : 'Back',
		style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	back.addEventListener('click', function() {
		win_about.close();
	});
	var space = Titanium.UI.createButton({
		systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});
	var label = Titanium.UI.createButton({
		title : 'About',
		color : '#fff',
		ellipsize : true,
		wordwrap : false,
		width : 200,
		style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});

	// create and add toolbar
	var toolbar = Titanium.UI.iOS.createToolbar({
		items : [back, label, space],
		top : 0,
		borderTop : false,
		borderBottom : true
	});
	win_about.add(toolbar);
}

var logo = Ti.UI.createImageView({
	image : '/images/logo.png',
	top : 50,
	width : 200,
	height : 114
});

win_about.add(logo);

var versionLbl = Ti.UI.createLabel({
	width : 'auto',
	height : 'auto',
	top : 180,
	left : 10,
	text : 'Application version : ' + Ti.App.version,
	color : '#000'
});

win_about.add(versionLbl);

var ls = Titanium.App.Properties.getDouble("lastSynced");
var lastSyncText;
if(ls != null) {
	var timeStr = '';
	var d = new Date(ls);
	var cd = new Date();
	
	var timeDiff = cd - d;// time difference in ms
	var days = parseInt(timeDiff/(1000*60*60*24));//get days
	timeDiff = Math.round(timeDiff%(1000*60*60*24));
	
	var hours = parseInt(timeDiff/(1000*60*60))// get hours
	timeDiff = Math.round(timeDiff%(1000*60*60));
	
	var minutes = parseInt(timeDiff/(1000*60))// get minutes
	timeDiff = Math.round(timeDiff%(1000*60));
	
	var seconds = parseInt(timeDiff/1000) // get seconds
	
	if(days!=0){
		timeStr += days + ' day';
		if(days>1){
			timeStr += 's';
		} 
		timeStr += ' ';
	}
	
	if(hours!=0){
		timeStr += hours + ' hour';
		if(hours>1){
			timeStr += 's';
		} 
		timeStr += ' ';
	}
	
	if(minutes!=0 && days==0){
		timeStr += minutes + ' minute';
		if(minutes>1){
			timeStr += 's';
		} 
		timeStr += ' ';
	}
	
	if(seconds!=0 && hours==0){
		timeStr += seconds + ' second';
		if(seconds>1){
			timeStr += 's';
		} 
		timeStr += ' ';
	}
	
	if(timeStr != ''){
		timeStr += 'ago';
	}
	
	lastSyncText = 'Last synched : ' + timeStr;
} else {
	lastSyncText = 'Last synched : NA';
}
var syncLbl = Ti.UI.createLabel({
	width : 'auto',
	height : 'auto',
	top : 220,
	left : 10,
	text : lastSyncText,
	color : '#000'
});

win_about.add(syncLbl);

var buttonView = Ti.UI.createView({
	top : 280,
	width : 285,
	height : 50
});

var updateBtn = Ti.UI.createButton({
	left : 0,
	width : 122,
	height : 50,
	title : 'Sync Data'
});
updateBtn.addEventListener('click', function() {
	Ti.App.fireEvent('normal_update_from_menu');
	win_about.close();
});

buttonView.add(updateBtn);

var reinitializeBtn = Ti.UI.createButton({
	left : 130,
	width : 153,
	height : 50,
	title : 'Reset All Data'
});
reinitializeBtn.addEventListener('click', function() {
	var dialog = Ti.UI.createAlertDialog({
		cancel : 1,
		buttonNames : ['Yes', 'No'],
		message : 'Are you sure you want to reset the database?',
		title : 'Re-initialize Alert!'
	});

	dialog.addEventListener('click', function(e) {
		if(e.index == 0) {
			if (isUpdating() === true){
				
			}
			else{
				
				//If delete_all is present, delete all contents:
				db_installMe = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
				if(PLATFORM == "android") {
					//Remove the database
					db_installMe.remove();
					db_installMe.close();
				} else {
					var db_file = db_installMe.getFile();
					db_installMe.close();
					//phisically removes the file
					db_file.deleteFile();
				}
				db_installMe = null;
				db_installMe = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
				
				var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName()+"_GPS");
				db_coord.execute('DELETE FROM alerts');
				db_coord.close();
				Ti.App.fireEvent('update_from_menu');
				dialog.hide(); 
				win_about.close();
			} 
		}
	});

	dialog.show(); 	
			
});

buttonView.add(reinitializeBtn);

win_about.add(buttonView);
