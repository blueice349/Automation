Ti.include('/lib/functions.js');

/*global  Omadi*/

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
	dialog;
	
	
	curWin = Ti.UI.currentWindow;
	curWin.backgroundColor = '#EEEEEE';
	curWin.orientationModes = [Titanium.UI.PORTRAIT];
	
	
	Ti.App.addEventListener('loggingOut', function(){
        Ti.UI.currentWindow.close();
    });
	
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
		top : 50,
		width : 200,
		height : 114
	});
	
	curWin.add(logo);
	
	versionLbl = Ti.UI.createLabel({
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		top : 180,
		left : 10,
		text : 'Application version : ' + Ti.App.version,
		color : '#000'
	});
	
	curWin.add(versionLbl);
	
	lastSyncTimestamp = Omadi.data.getLastUpdateTimestamp(); 
	//Ti.API.error(lastSyncTimestamp);
	lastSyncText = "Last synched: ";
	
	if(lastSyncTimestamp !== 0){
		lastSyncText += Omadi.utils.getTimeAgoStr(lastSyncTimestamp);
	} 
	else{
		lastSyncText += 'NA';
	}
	
	syncLabel = Ti.UI.createLabel({
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		top : 220,
		left : 10,
		text : lastSyncText,
		color : '#000'
	});
	
	curWin.add(syncLabel);
	
	buttonView = Ti.UI.createView({
		top : 280,
		width : 285,
		height : 50
	});
	
	updateButton = Ti.UI.createButton({
		left : 0,
		width : 122,
		height : 50,
		title : 'Sync Data'
	});
	updateButton.addEventListener('click', function() {
		Ti.App.fireEvent('normal_update_from_menu');
		curWin.close();
	});
	
	buttonView.add(updateButton);
	
	reinitializeBtn = Ti.UI.createButton({
		left : 130,
		width : 153,
		height : 50,
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
				if (!Omadi.data.isUpdating()){
					
					Ti.App.fireEvent('full_update_from_menu');
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
