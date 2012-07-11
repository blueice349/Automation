var win_about = Ti.UI.currentWindow;
win_about.orientationModes = [Titanium.UI.PORTRAIT];

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
	color : 'white'
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
	
	lastSyncText = 'Last synced on : ' + timeStr;
} else {
	lastSyncText = 'Last synced on : NA';
}
var syncLbl = Ti.UI.createLabel({
	width : 'auto',
	height : 'auto',
	top : 220,
	left : 10,
	text : lastSyncText,
	color : 'white'
});

win_about.add(syncLbl);

var buttonView = Ti.UI.createView({
	top : 280,
	width : 210,
	height : 50
});

var updateBtn = Ti.UI.createButton({
	left : 0,
	width : 100,
	height : 50,
	title : 'Update'
});
updateBtn.addEventListener('click', function() {
	win_about.close();
	win_about.updateFunction();
});

buttonView.add(updateBtn);

var reinitializeBtn = Ti.UI.createButton({
	left : 110,
	width : 100,
	height : 50,
	title : 'Re-Initialize'
});
reinitializeBtn.addEventListener('click', function() {
	win_about.close();
	var d = new Date();
	Titanium.App.Properties.setString("databaseVersion", Titanium.App.Properties.getString("databaseVersion") + "_" + d.getTime());
	win_about.updateFunction();
});

buttonView.add(reinitializeBtn);

win_about.add(buttonView);
