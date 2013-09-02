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
	scrollView,
	termsOfServiceLabel,
	portalLabel;

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
		top : 0,
		width : 280,
		height : 280
	});
	
	scrollView.add(logo);
	
	versionLbl = Ti.UI.createLabel({
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		top : 10,
		text : 'App Version ' + Ti.App.version,
		color : '#666',
		font: {
		    fontSize: 14
		}
	});
	
	portalLabel = Ti.UI.createLabel({
	   text: 'Signed into ' + Omadi.utils.getClientAccount() + ' as ' + Omadi.utils.getUsername(Omadi.utils.getUid()),
	   width : Ti.UI.SIZE,
       height : Ti.UI.SIZE,
       top : 10,
       color : '#666',
       font: {
           fontSize: 14
       }
	});
	
	termsOfServiceLabel = Ti.UI.createLabel({
        text : ' Terms of Service',
        color : '#495A8B',
        font : {
            fontSize : 14
        },
        top: 20,
        width : Ti.UI.SIZE
    });
    
    termsOfServiceLabel.addEventListener('click', Omadi.display.openTermsOfService);
	
	scrollView.add(versionLbl);
	
	lastSyncTimestamp = Omadi.data.getLastUpdateTimestamp(); 
	//Ti.API.error(lastSyncTimestamp);
	lastSyncText = "Synced ";
	
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
		text : lastSyncText,
		color : '#666',
        font: {
            fontSize: 14
        }
	});
	
	scrollView.add(portalLabel);
	scrollView.add(syncLabel);
	
	scrollView.add(termsOfServiceLabel);

}());
