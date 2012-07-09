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
	if(d.getHours()!=0){
		timeStr += d.getHours() + ' hour';
		if(d.getHours()>1){
			timeStr += 's';
		} 
		timeStr += ' ';
	}
	
	if(d.getMinutes()!=0){
		timeStr += d.getMinutes() + ' minute';
		if(d.getMinutes()>1){
			timeStr += 's';
		} 
		timeStr += ' ';
	}
	
	if(d.getSeconds()!=0 && d.getHours()==0){
		timeStr += d.getSeconds() + ' second';
		if(d.getSeconds()>1){
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
	title : 'Sync Data'
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
