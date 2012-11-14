Ti.include('/lib/functions.js');

/*global isUpdating, getTimeAgoStr, PLATFORM, Omadi*/

(function(){
	'use strict';
	
	var curWin, 
	backButton, 
	space, 
	aboutLabel, 
	toolbar, 
	logo, 
	versionLbl, 
	lastSyncTimestamp, 
	lastSyncText, 
	syncLabel,
	buttonView,
	updateButton,
	reinitializeBtn,
	dialog, 
	db;
	
	
	curWin = Ti.UI.currentWindow;
	curWin.backgroundColor = '#EEEEEE';
	curWin.orientationModes = [Titanium.UI.PORTRAIT];
	
	if(Titanium.Platform.name !== 'android') {
		backButton = Ti.UI.createButton({
			title : 'Back',
			style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
		});
		
		backButton.addEventListener('click', function() {
			curWin.close();
		});
		
		space = Titanium.UI.createButton({
			systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
		});
		
		aboutLabel = Titanium.UI.createButton({
			title : 'About',
			color : '#fff',
			ellipsize : true,
			wordwrap : false,
			width : 200,
			style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
		});
	
		// create and add toolbar
		toolbar = Titanium.UI.iOS.createToolbar({
			items : [backButton, aboutLabel, space],
			top : 0,
			borderTop : false,
			borderBottom : true
		});
		curWin.add(toolbar);
	}
	
	logo = Ti.UI.createImageView({
		image : '/images/logo.png',
		top : "50dp",
		width : "200dp",
		height : "114dp"
	});
	
	curWin.add(logo);
	
	versionLbl = Ti.UI.createLabel({
		width : 'auto',
		height : 'auto',
		top : "180dp",
		left : "10dp",
		text : 'Application version : ' + Ti.App.version,
		color : '#000'
	});
	
	curWin.add(versionLbl);
	
	lastSyncTimestamp = Titanium.App.Properties.getDouble("lastSynced", 0);
	lastSyncText = "Last synched: ";
	
	if(lastSyncTimestamp !== 0){
		lastSyncText += getTimeAgoStr(lastSyncTimestamp);
	} 
	else{
		lastSyncText += 'NA';
	}
	
	syncLabel = Ti.UI.createLabel({
		width : 'auto',
		height : 'auto',
		top : "220dp",
		left : "10dp",
		text : lastSyncText,
		color : '#000'
	});
	
	curWin.add(syncLabel);
	
	buttonView = Ti.UI.createView({
		top : "280dp",
		width : "285dp",
		height : "50dp"
	});
	
	updateButton = Ti.UI.createButton({
		left : "0dp",
		width : "122dp",
		height : "50dp",
		title : 'Sync Data'
	});
	updateButton.addEventListener('click', function() {
		Ti.App.fireEvent('normal_update_from_menu');
		curWin.close();
	});
	
	buttonView.add(updateButton);
	
	reinitializeBtn = Ti.UI.createButton({
		left : "130dp",
		width : "153dp",
		height : "50dp",
		title : 'Reset All Data'
	});
	
	reinitializeBtn.addEventListener('click', function() {
		dialog = Ti.UI.createAlertDialog({
			cancel : 1,
			buttonNames : ['Yes', 'No'],
			message : 'Are you sure you want to reset the database?',
			title : 'Re-initialize Alert!'
		});
	
		dialog.addEventListener('click', function(e) {
			if(e.index === 0) {
				if (!isUpdating()){
					
					//If delete_all is present, delete all contents:
					db = Omadi.utils.openMainDatabase();
					
					if(PLATFORM === "android") {
						//Remove the database
						db.remove();
						db.close();
					} else {
						var db_file = db.getFile();
						db.close();
						//phisically removes the file
						db_file.deleteFile();
					}
					
					// Install database with an empty version
					db = Omadi.utils.openMainDatabase();
					db.close();
					
					// Clear out the GPS database alerts
					db = Omadi.utils.openGPSDatabase();
					db.execute('DELETE FROM alerts');
					db.close();
					
					Ti.App.fireEvent('update_from_menu');
					dialog.hide(); 
					curWin.close();
				} 
			}
		});
		
		dialog.show();
	});
	
	buttonView.add(reinitializeBtn);
	
	curWin.add(buttonView);

}());
