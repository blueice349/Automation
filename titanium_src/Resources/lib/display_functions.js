/*global Omadi*/

Omadi.display = Omadi.display || {};

var Utils = require('lib/Utils');
var Display = require('lib/Display');

Omadi.display.backgroundGradientBlue = Display.backgroundGradientBlue;
Omadi.display.backgroundGradientGray = Display.backgroundGradientGray;

Omadi.display.showBigImage = function(imageView) {"use strict";
    Display.showBigImage(imageView);
};

Omadi.display.iOSBackToolbar = function(actualWindow, label){"use strict";
    var back, space, toolbar;
    
    if(Ti.App.isIOS){
        back = Ti.UI.createButton({
            title : 'Back',
            style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
        });
        
        back.addEventListener('click', function() {
            try{
                actualWindow.close();
            }
            catch(ex){
                Utils.sendErrorReport("exception on back for iosbacktoolbar: " + ex);
            }
        });
    
        space = Titanium.UI.createButton({
            systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
        });
        
        label = Titanium.UI.createButton({
            title : label,
            color : '#fff',
            ellipsize : true,
            wordwrap : false,
            width : 200,
            style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
        });
    
        // create and add toolbar
        toolbar = Ti.UI.iOS.createToolbar({
            items : [back, space, label, space],
            top : 0,
            borderTop : false,
            borderBottom : true
        });
        
        return toolbar;
    }  
    
    return null;
};

function hasNeverUploadImages() {"use strict";
	var db = Omadi.utils.openListDatabase();
    var result = db.execute("SELECT * FROM _files WHERE nid=-1000000 AND type != 'video'");
    
    var retval = result.isValidRow();
    
	result.close();
	db.close();
	
    return retval;
}

function showNeverUploadImagesDialog() {"use strict";
	var dialog = Ti.UI.createAlertDialog({
		title: 'Non-Uploaded Photos',
		message: 'You have photos that were never uploaded to the server. You should manully email them to the office.',
		buttonNames: ['View Photos', 'View Later']
	});
	
	dialog.addEventListener('click', function(event) {
		try {
			if (event.index == 0) {
				// open window
				Omadi.display.openLocalPhotosWindow();
			} else {
				// continue with logout
				Omadi.display.showLogoutDialog(true);
			}
		} catch (error) {
			Utils.sendErrorReport('Error in showNeverUploadImagesDialog click handler: ' + error);
		}
	});
	
	dialog.show();
}

Omadi.display.showLogoutDialog = function(skipToLogout){"use strict";
    var verifyLogout;
    
    if (typeof skipToLogout == 'undefined') {
        skipToLogout = false;
    }
    
    if (!skipToLogout && hasNeverUploadImages()) {
        showNeverUploadImagesDialog();
    } else if (!skipToLogout && Omadi.bundles.timecard.userShouldClockInOut()) {
        Omadi.bundles.timecard.askClockOutLogout();
    } else {
        verifyLogout = Ti.UI.createAlertDialog({
            title : 'Really Logout?',
            buttonNames : ['Logout', 'Cancel']
        });

        verifyLogout.addEventListener('click', function(e) {
            try{
                if (e.index == 0) {
                    Ti.API.info('Logging out from Regular logout dialog');
                    Omadi.service.logout();
                }
            }
            catch(ex){
                Utils.sendErrorReport("exception on really logout verify logout: " + ex);
            }
        });

        verifyLogout.show();
    }
};

Omadi.display.logoutButtonPressed = function(){"use strict";
    if (Omadi.bundles.inspection.userShouldDoInspection()) {
        Omadi.bundles.inspection.askToCreateInspection(true);
    }
    else {
        Omadi.display.showLogoutDialog();
    }
};

Omadi.display.getFileViewType = function(filename){"use strict";
	return Display.getFileViewType(filename);
};

Omadi.display.openNearMeWindow = function(formType, filterQuery) {'use strict';
	var win = Titanium.UI.createWindow({
        navBarHidden : true,
        formType: formType,
        filterQuery: filterQuery,
        url : '/main_windows/nearMe.js',
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
    });
    
    Omadi.display.loading();
    win.addEventListener('open', Omadi.display.doneLoading);
    win.open();
    
    return win;
};

Omadi.display.openListWindow = function(type, show_plus, filterValues, nestedWindows, showFinalResults) {"use strict";
    return Display.openListWindow(type, show_plus, filterValues, nestedWindows, showFinalResults);
};

Omadi.display.openActionsWindow = function() {"use strict";
    var actionsWindow = Ti.UI.createWindow({
        title : 'Actions',
        navBarHidden : true,
        url : '/main_windows/actions.js',
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
    });

    Omadi.display.loading();
    actionsWindow.addEventListener('open', Omadi.display.doneLoading);
    actionsWindow.open();

    return actionsWindow;
};

Omadi.display.openAboutWindow = function() {"use strict";
    var aboutWindow = Ti.UI.createWindow({
        title : 'About',
        navBarHidden : true,
        url : '/main_windows/about.js',
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
    });

    Omadi.display.loading();
    aboutWindow.addEventListener('open', Omadi.display.doneLoading);
    aboutWindow.open();

    return aboutWindow;
};

Omadi.display.openDraftsWindow = function() {"use strict";
    return Display.openDraftsWindow();
};

Omadi.display.openSettingsWindow = function() {"use strict";
    var settingsWindow = Titanium.UI.createWindow({
        title : 'Settings',
        navBarHidden : true,
        url : '/main_windows/settings.js',
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
    });

    Omadi.display.loading();
    settingsWindow.addEventListener('open', Omadi.display.doneLoading);

    settingsWindow.open();

    return settingsWindow;
};

Omadi.display.currentJobsWindow = null;
Omadi.display.openJobsWindow = function() {"use strict";

    if(Omadi.bundles.dispatch.showJobsScreen()){
        
        if(Omadi.display.currentJobsWindow === null){
            Omadi.display.currentJobsWindow = Titanium.UI.createWindow({
                title : 'Jobs',
                navBarHidden : true,
                url : '/main_windows/jobs.js',
                orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
            });
        
            Omadi.display.loading();
            
            Omadi.display.currentJobsWindow.addEventListener('open', Omadi.display.doneLoading);
            Omadi.display.currentJobsWindow.addEventListener('close', function(){
                Omadi.display.currentJobsWindow = null;
            });
        
            Omadi.display.currentJobsWindow.open();
        }
    
        return Omadi.display.currentJobsWindow;
    }
    
    return null;
};



Omadi.display.openWebView = function(nid){"use strict";
    Display.openWebView(nid);
};

Omadi.display.openWebViewInApp = function(nid) {"use strict";
	Display.openWebViewInApp(nid);
};

Omadi.display.openWebViewInBrowser = function(nid) {"use strict";
	Display.openWebViewInBrowser(nid);
};

Omadi.display.openViewWindow = function(type, nid, allowActions) {"use strict";
    return Display.openViewWindow(type, nid, allowActions);
};

Omadi.display.FormTabs = null;
Omadi.display.openFormWindow = function(type, nid, form_part) {"use strict";
    var formWindow, isDispatch, node, 
        tempFormPart, fromBundle, to_type, newIsDispatch, isChangeTo, initNewDispatch;
    
    try{
        Ti.API.debug("opening form window");
        
        isDispatch = Omadi.bundles.dispatch.isDispatch(type, nid);
        
        // Make sure to init a new dispatch screen if the dispatch node is new
        // Do not check dispatch create permissions.  If the form isDispatch and new, let them dispatch
        // Allowing forced dispatches even without a dispatch create allows more more variations in permissions
        initNewDispatch = (isDispatch && nid == 'new');
        
        Ti.API.debug("IS DISPATCH: " + isDispatch);
        Ti.API.debug("Type: " + type + ", nid: " + nid + ", form_part: " + form_part);
        
        try{
            tempFormPart = parseInt(form_part, 10);
            if(form_part != tempFormPart){
                Ti.API.info("This is a custom copy from " + type + " to " + form_part);
                
                to_type = form_part;
                
                newIsDispatch = Omadi.bundles.dispatch.isDispatch(to_type, 'new');
                fromBundle = Omadi.data.getBundle(type);
                
                isChangeTo = false;
                if(fromBundle){
                    if(typeof fromBundle.data !== 'undefined'){
                        if(typeof fromBundle.data.custom_copy !== 'undefined'){
                            if(typeof fromBundle.data.custom_copy[to_type] !== 'undefined'){
                                
                                if(typeof fromBundle.data.custom_copy[to_type].conversion_type !== 'undefined' && 
                                    fromBundle.data.custom_copy[to_type].conversion_type == 'change'){
                                       isChangeTo = true; 
                                }        
                            }
                        }
                    }                    
                }

                if(isDispatch){
                    
                    if(isChangeTo){
                        // Always keep current dispatches dispatched for change conversions
                        // isDispatch = true; // nothing changed
                        // Example: Dispatched PPI to drop fee
                        // Keep original dispatch node
                        Ti.API.info('isChangeTo');
                    }
                    else{
                        if(!newIsDispatch){
                            // For copy to a type that doesn't have a forced dispatch, do not add a dispatch to it
                            // Example: Dispatched PPI to Restriction - we don't want a dispatch connected to it
                            isDispatch = false;
                        }
                        else{
                            // no change as we're copying a dispatch to a new dispatch
                            // But a new dispatch must be created in the screen later on
                            // Example: dispatched tag to a dispatched PPI
                            // A new dispatch node must be created
                            initNewDispatch = true;
                        }
                    }
                }
                else{
                    if(newIsDispatch){
                        // Need to create a dispatch for this copy to
                        // Example: Regular tag to dispatched PPI - if the PPI is force dispatched
                        // A new dispatch node must be created
                        isDispatch = true;
                        initNewDispatch = true;
                    }
                }                 
            }
        }
        catch(copyEx){
            Utils.sendErrorReport("Exception with custom copy in dispatch: " + copyEx);
        }
        
        Omadi.display.loading();
        
        Omadi.display.FormTabs = require('ui/FormTabs');
        formWindow = Omadi.display.FormTabs.getWindow(Omadi, type, nid, form_part, initNewDispatch);
        
        if(formWindow){
            formWindow.addEventListener('open', Omadi.display.doneLoading);
            formWindow.open();
            
            // Must be called after getWindow
            node = Omadi.display.FormTabs.getNode();
        }
        else{
            Utils.sendErrorReport("Could not open dispatch form window");
            Omadi.display.doneLoading();
        }
        
        // Set node as viewed if it hasn't yet been viewed and it's been saved to the server
        if(nid != "new" && nid > 0 && (typeof node == 'undefined' || typeof node.viewed == 'undefined' || node.viewed == 0)){
            Omadi.service.setNodeViewed(nid);
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception opening form: " + ex);
    }
    return formWindow;
};

Omadi.display.openLocalPhotosWindow = function() {"use strict";
	return Display.openLocalPhotosWindow();
};

Omadi.display.openMainMenuWindow = function(options) {"use strict";
    var mainMenuWindow, i;
    
    mainMenuWindow = Titanium.UI.createWindow({
        url : '/main_windows/mainMenu.js',
        navBarHidden : true,
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
    });
    
    if(typeof options !== 'undefined'){
        for(i in options){
            if(options.hasOwnProperty(i)){
                mainMenuWindow[i] = options[i];
            }
        }
    }
    
    mainMenuWindow.addEventListener('open', Omadi.display.doneLoading);
    
    Omadi.display.loading();

    mainMenuWindow.open();
    return mainMenuWindow;
};

Omadi.display.showNewNotificationDialog = function(){"use strict";
	Display.showNewNotificationDialog();
};

/** Dispaly an option dialog to select view, edit, next_part, etc.
 *  The only requirement is that each row has the nid set for the node
 *  so that e.row.nid can be referenced
 *  Also, the row is set to a background color of #fff when going to view or form
 */
Omadi.display.showDialogFormOptions = function(e, extraOptions) {"use strict";
    Display.showDialogFormOptions(e, extraOptions);
};

/**
 * Fetch the icon image from the server
 * Optionally pass in an imageView to update once the image comes through
 */
Omadi.display.insertBundleIcon = function(type, imageView){"use strict";
    var http;
    
    http = Ti.Network.createHTTPClient({
        enableKeepAlive: false,
        validatesSecureCertificate: false,
        timeout: 45000,
        cache: false
    });

    http.open('GET', Ti.App.DOMAIN_NAME + '/custom_forms/icon/' + type);

    Ti.API.debug("Getting icon for " + type);

    http.onload = function(e) {
        var iconFile, written, iconFile2, path;
        
        if(e.success){
            
            path = Omadi.display.getNodeTypeImagePath(type);
            iconFile = Ti.Filesystem.getFile(path);
            
            Ti.API.info("downloaded icon for " + type);
            
            if(iconFile){
               
                written = iconFile.write(this.responseData);
            
                if(!written){
                    iconFile.move(iconFile.nativePath + ".png");
                    Ti.API.debug("not written 1");
                    
                    iconFile2 = Ti.Filesystem.getFile(Omadi.display.getNodeTypeImagePath(type));
                    written = iconFile2.write(this.responseData);
                    
                    if(written){
                        if(Ti.App.isIOS){
                            iconFile2.remoteBackup = false;
                        }
                    }
                }
                else{
                    if(Ti.App.isIOS){
                        iconFile.remoteBackup = false;
                    }
                }
                Ti.API.debug("FILESIZE: " + this.responseData.length);
                
                iconFile = null;
                iconFile2 = null;
                
                Ti.API.debug("written icon: " + written);
                
                
                if(typeof imageView !== 'undefined'){
                    iconFile = Omadi.display.getIconFile(type);
            
                    if(iconFile && iconFile.exists() && iconFile.isFile()){
                        imageView.image = iconFile;
                    }
                }
            }
        }
    };
    
    http.onerror = function(){
      Ti.API.error("Error downloading icon image for " + type);  
    };
    
    http.send();
};

Omadi.display.getDrivingDirectionsTo = function(addressString){"use strict";
    Display.getDrivingDirectionsTo(addressString);
};

Omadi.display.getNodeTypeImagePath = function(type) {"use strict";
    var bundle, color, imageFile;
    
    bundle = Omadi.data.getBundle(type);
    
    color = 'gray';
    if(bundle && typeof bundle.data !== 'undefined' && typeof bundle.data.color !== 'undefined'){
        color = bundle.data.color;
    }
    
    imageFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'icon_' + type + '_' + color + '.png');
    
    return imageFile.nativePath;
};

Omadi.display.getIconFile = function(type){"use strict";
    var iconFile, path;
    
    path = Omadi.display.getNodeTypeImagePath(type);
    
    iconFile = Ti.Filesystem.getFile(path);
    
    if(!iconFile || !iconFile.exists()){
        iconFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'images/icon_default.png');
        iconFile.imageNotLoaded = true;
    }
    
    return iconFile;
};

Omadi.display.displayFile = function(nid, fid, title) {"use strict";
    try{
        if(Ti.Network.online){
            if (nid > 0 && fid > 0) {
                if (Ti.App.isIOS) {
                    Omadi.display.openWebViewInBrowser(nid);
                } else {
	                Omadi.display.loading();
	        
	                var newWin = Titanium.UI.createWindow({
	                    navBarHidden: true,
	                    nid: nid,
	                    fid: fid,
	                    title: title,
	                    url: '/main_windows/fileViewer.js',
	                    orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
	                });
	                
	                newWin.addEventListener('open', function(){
	                   Omadi.display.doneLoading(); 
	                });
	                
	                newWin.open();
               }
            }
        }
        else{
            alert("You are not connected to the Internet, so the file cannot be downloaded.");
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in display file: " + ex);
    }
};

Omadi.display.displayFullImage = function(imageView) {"use strict";
	Display.displayFullImage(imageView);
};

Omadi.display.displayLargeImage = function(imageView, nid, file_id, showInImageView) {"use strict";
	Display.displayLargeImage(imageView, nid, file_id, showInImageView);
};

Omadi.display.getImageViewFromData = function(blobImage, maxWidth, maxHeight) {"use strict";
    var imageView, multiple;
    try {
        imageView = Titanium.UI.createImageView({
            image : blobImage,
            width : 'auto',
            height : 'auto'
        });

        blobImage = imageView.toBlob();

        if (blobImage.height / blobImage.width > maxHeight / maxWidth) {
            multiple = blobImage.height / maxHeight;
        }
        else {
            multiple = blobImage.width / maxWidth;
        }

        if (multiple >= 1) {
            imageView.height = parseInt(blobImage.height / multiple, 10);
            imageView.width = parseInt(blobImage.width / multiple, 10);
            
            try{
                imageView.image = imageView.toImage();   
            }
            catch(ex){
                Utils.sendErrorReport("Exception setting image in Omadi.display.getImageViewFromData: " + ex);
            }
        }

        return imageView;
    }
    catch(evt) {
        Ti.API.error("Error in reduce Image Size");
    }

};

Omadi.display.openTermsOfService = function(){"use strict";

    var win, webView, toolbar, space, titleLabel, backButton;
    try{
        win = Ti.UI.createWindow({
            layout: 'vertical',
            navBarHidden: true,
            orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT],
            title: 'Omadi Terms of Service'
        });
        
        webView = Ti.UI.createWebView({
            url : 'https://omadi.com/terms.txt',
            height : Ti.UI.FILL
        });
        
        if(Ti.App.isAndroid){
            win.addEventListener("android:back", function(){
                win.close();
            });
        }
        else{
            backButton = Ti.UI.createButton({
                title : 'Back',
                style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
            });
            
            backButton.addEventListener('click', function() {
                try{
                    win.close();
                }
                catch(ex){
                    Utils.sendErrorReport("exception with back button for open terms of service: " + ex);
                }
            });
            
            space = Titanium.UI.createButton({
                systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
            });
            
            titleLabel = Titanium.UI.createButton({
                title : "Terms of Service",
                color : '#fff',
                ellipsize : true,
                wordwrap : false,
                width : Ti.UI.SIZE,
                focusable : false,
                touchEnabled : false,
                style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
            });
        
            toolbar = Titanium.UI.iOS.createToolbar({
                items : [backButton, space, titleLabel, space],
                top : 0,
                borderTop : false,
                borderBottom : false
            });
            win.add(toolbar);
        }
        
        win.add(webView);
        win.open();
    }
    catch(ex){
        Utils.sendErrorReport("Exception opening terms of service: " + ex);
    }
};

// Download Image from the server
Omadi.display.setImageViewThumbnail = function(imageView, nid, file_id) {"use strict";
	Display.setImageViewThumbnail(imageView, nid, file_id);
};

// Download Image from the server
Omadi.display.setImageViewVideoThumbnail = function(imageView, nid, file_id, field_name) {"use strict";
	Display.setImageViewVideoThumbnail(imageView, nid, file_id, field_name);
};

Omadi.display.removeNotifications = function() {"use strict";
	Display.removeNotifications();
};

var loadingIndicatorWindow, loadingActivityIndicator;

Omadi.display.hideLoadingIndicator = function() {"use strict";
    Ti.API.info("hiding indicator");

    loadingActivityIndicator.hide();
    loadingIndicatorWindow.close();
};

Omadi.display.showActivityIndicator = function(){"use strict";
    var style, activityIndicator;
    
    if (Ti.App.isIOS){
      style = Ti.UI.iPhone.ActivityIndicatorStyle.DARK;
    }
    else {
      style = Ti.UI.ActivityIndicatorStyle.DARK;
    }
    
    activityIndicator = Ti.UI.createActivityIndicator({
      color: 'black',
      font: {fontFamily:'Arial', fontSize: 26, fontWeight:'bold'},
      message: 'Loading...',
      style:style,
      top:10,
      left:10,
      height:Ti.UI.SIZE,
      width:Ti.UI.SIZE
    });
    
    Ti.UI.currentWindow.add(activityIndicator);
};

Omadi.display.loading = function(message, win) {"use strict";
    Display.loading(message, win);
};

Omadi.display.doneLoading = function() {"use strict";
    Display.doneLoading();
};

Omadi.display.showLoadingIndicator = function(show, timeout) {"use strict";

    var indView, message;

    if ( typeof timeout === 'undefined') {
        timeout = 15000;
    }

    loadingIndicatorWindow = Titanium.UI.createWindow({
        title : 'Omadi CRM',
        fullscreen : false,
        navBarHidden : true,
        backgroundColor : '#000',
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
    });

    // black view
    indView = Titanium.UI.createView({
        height : '32%',
        width : '70%',
        backgroundColor : '#000',
        borderRadius : 10,
        opacity : 0.9
    });

    loadingIndicatorWindow.add(indView);

    // loading indicator
    loadingActivityIndicator = Titanium.UI.createActivityIndicator({
        height : '7%',
        message : (Ti.App.isAndroid) ? show : '',
        width : '30%',
        color : '#fff'
    });

    loadingIndicatorWindow.add(loadingActivityIndicator);
    // message
    message = Titanium.UI.createLabel({
        text : 'Communicating with' + '\n' + 'the server...',
        color : '#fff',
        width : 'auto',
        height : 'auto',
        textAlign : 'center',
        font : {
            fontFamily : 'Helvetica Neue',
            fontWeight : 'bold'
        },
        top : '67%'
    });

    loadingIndicatorWindow.add(message);

    loadingIndicatorWindow.orientationModes = [Titanium.UI.PORTRAIT];
    loadingIndicatorWindow.open();

    loadingActivityIndicator.show();

    setTimeout(function() {
        loadingActivityIndicator.hide();
        loadingIndicatorWindow.close();
    }, timeout);
};

Omadi.display.ProgressBar = function(current, max) {"use strict";
    /*jslint plusplus: true*/

    this.current = current;
    this.max = max;

    this.progressView = Titanium.UI.createView({
        height : 45,
        width : '100%',
        backgroundColor : '#111',
        opacity : 1,
        top : 0,
        zIndex : 100
    });
    
    if(Ti.App.isIOS7){
        this.progressView.top += 20;
    }

    Ti.UI.currentWindow.add(this.progressView);

    this.pb_download = Titanium.UI.createProgressBar({
        width : "96%",
        min : 0,
        max : 1,
        top : 2,
        value : 0,
        color : '#fff',
        message : 'Downloading ...',
        font: {
          fontSize: 14  
        },
        style : (Ti.App.isIOS) ? Titanium.UI.iPhone.ProgressBarStyle.PLAIN : ''
    });

    this.pb_install = Titanium.UI.createProgressBar({
        width : "96%",
        min : 0,
        max : 100,
        top : 2,
        value : 0,
        color : '#fff',
        message : 'Installing ...',
        font: {
          fontSize: 14  
        },
        style : (Ti.App.isIOS) ? Titanium.UI.iPhone.ProgressBarStyle.PLAIN : ''
    });

    this.progressView.add(this.pb_download);
    this.pb_download.show();

    this.pb_download.value = 0;
    this.pb_install.value = this.current;

    this.set_max = function(value) {
        this.progressView.remove(this.pb_download);
        this.progressView.add(this.pb_install);
        this.pb_install.show();
        this.max = value;
    };
    
    this.setMessage = function(message){
      this.pb_download.setMessage(message);
    };

    this.set = function() {
        this.current++;

        if (this.max <= 0) {
            this.pb_install.value = 100;
        }
        else {
            //Only one page case
            if ((this.current === 0) && (this.max === 1)) {
                this.pb_install.value = 50;
            }
            else {
                var perc = parseInt((this.current * 100) / this.max, 10);
                this.pb_install.value = perc;
            }
        }
    };
    
    this.increment = function() {
        this.current++;

        if (this.max <= 0) {
            this.pb_install.value = 100;
        }
        else {
            //Only one page case
            if ((this.current === 0) && (this.max === 1)) {
                this.pb_install.value = 50;
            }
            else {
                var perc = parseInt((this.current * 100) / this.max, 10);
                this.pb_install.value = perc;
            }
        }
    };
    
    this.add = function(amount){
        this.current += amount;
        this.pb_install.value = parseInt((this.current * 100) / this.max, 10);
    };

    this.set_download = function(value) {
        this.pb_download.value = value;
    };

    this.close = function() {
        Ti.UI.currentWindow.remove(this.progressView);
    };
};


Omadi.display.DefaultProgressBar = function(max, message) {"use strict";
    /*jslint plusplus: true*/
        
    this.current = 1;
    this.max = max;

    this.progressView = Titanium.UI.createView({
        height : 45,
        width : '100%',
        backgroundColor : '#111',
        opacity : 1,
        top : 0,
        zIndex : 100
    });
    
    if(Ti.App.isIOS7){
        this.progressView.top += 20;
    }

    Ti.UI.currentWindow.add(this.progressView);

    this.bar = Titanium.UI.createProgressBar({
        width : "96%",
        min : 0,
        max : max,
        top : 2,
        value : 1,
        color : '#fff',
        message : message,
        font: {
          fontSize: 14  
        },
        style : (Ti.App.isIOS) ? Titanium.UI.iPhone.ProgressBarStyle.PLAIN : ''
    });

    this.progressView.add(this.bar);
    this.bar.show();

    this.bar.setValue(this.current);
    
    this.increment = function() {
        this.current ++;
        this.bar.setValue(this.current);       
    };
    
    this.add = function(amount){
        this.current += amount;
        this.bar.setValue(this.current);
    };
    
    this.set = function(current){
        this.current = current;
        this.bar.setValue(this.current);
    };

    this.close = function() {
        Ti.UI.currentWindow.remove(this.progressView);
    };
};

