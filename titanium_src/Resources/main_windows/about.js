Ti.include('/lib/functions.js');

/*global  Omadi*/

(function(){
	'use strict';
	
	var curWin,
	wrapperView, 
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
	scrollView;
	
	
	curWin = Ti.UI.currentWindow;
	curWin.backgroundColor = '#eee';
	curWin.setOrientationModes([Titanium.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]);
	
	wrapperView = Ti.UI.createView({
	   layout: 'vertical',
	   bottom: 0,
	   top: 0,
	   right: 0,
	   left: 0 
	});
	
	curWin.add(wrapperView);
	
	Ti.App.addEventListener('loggingOut', function(){
        Ti.UI.currentWindow.close();
    });
	
	if(Ti.App.isIOS) {
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
			items : [backButton, space, aboutLabel, space],
			top : 0,
			borderTop : false,
			borderBottom : true
		});
		wrapperView.add(toolbar);
	}
	
	scrollView = Ti.UI.createScrollView({
	    scrollType: 'vertical',
	    height: Ti.UI.FILL,
	    width: '100%',
	    layout: 'vertical'
	});
	
	wrapperView.add(scrollView);
	
	logo = Ti.UI.createImageView({
		image : '/images/logo.png',
		top : 10,
		width : 200,
		height : 114
	});
	
	scrollView.add(logo);
	
	versionLbl = Ti.UI.createLabel({
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		top : 10,
		left : 10,
		text : 'Application version : ' + Ti.App.version,
		color : '#000'
	});
	
	scrollView.add(versionLbl);
	
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
		top : 5,
		left : 10,
		text : lastSyncText,
		color : '#000'
	});
	
	scrollView.add(syncLabel);
	
	buttonView = Ti.UI.createView({
		top : 10,
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
	
	scrollView.add(buttonView);

}());
