/*jslint node:true */
'use strict';

var Utils = require('lib/Utils');
var AlertQueue = require('lib/AlertQueue');
var DispatchBundle = require('lib/bundles/DispatchBundle');

exports.backgroundGradientBlue = {
    type : 'linear',
    startPoint : {
        x : '50%',
        y : '0%'
    },
    endPoint : {
        x : '50%',
        y : '100%'
    },
    colors : [{
        color : '#2BC4F3',
        offset : 0.0
    }, {
        color : '#00AEEE',
        offset : 0.25
    }, {
        color : '#00AEEE',
        offset : 1.0
    }]
};

exports.backgroundGradientGray = {
    type : 'linear',
    startPoint : {
        x : '50%',
        y : '0%'
    },
    endPoint : {
        x : '50%',
        y : '100%'
    },
    colors : [{
        color : '#A7A9AC',
        offset : 0.0
    }, {
        color : '#6D6E71',
        offset : 0.25
    }, {
        color : '#58595B',
        offset : 1.0
    }]
};

exports.setCurrentWindow = function(currentWindow, name) {
	exports.currentWindow = currentWindow;
	exports.currentWindow.name = name;
};

exports.getFileViewType = function(filename){

    var iOSWebviewExtensions = [], extension, htmlExtensions = [], dotIndex,
        imageExtensions = [], androidDownloadExtensions = [], textExtensions = [], viewType = null;
    
    extension = "none";
    
    if(filename){
        dotIndex = filename.lastIndexOf('.');
        if(dotIndex !== -1 && dotIndex !== filename.length - 1){
            extension = filename.substring(dotIndex + 1).toLowerCase();
        }
    }
    
    textExtensions.push("txt");
    textExtensions.push("xml");
    textExtensions.push("none");
    
    htmlExtensions.push("html");
    htmlExtensions.push("htm");
    
    imageExtensions.push("jpg");
    imageExtensions.push("jpeg");
    imageExtensions.push("gif");
    imageExtensions.push("png");
    imageExtensions.push("bmp");
    
    androidDownloadExtensions.push("tiff");
    androidDownloadExtensions.push("doc");
    androidDownloadExtensions.push("docx");
    androidDownloadExtensions.push("xls");
    androidDownloadExtensions.push("xlsx");
    androidDownloadExtensions.push("csv");
    androidDownloadExtensions.push("tsv");
    androidDownloadExtensions.push("pdf");
    androidDownloadExtensions.push("ppt");
    androidDownloadExtensions.push("pptx");
    androidDownloadExtensions.push("odt");
    androidDownloadExtensions.push("ods");
    androidDownloadExtensions.push("odp");
    androidDownloadExtensions.push("eps");
    androidDownloadExtensions.push("zip");
    androidDownloadExtensions.push("tar");
    androidDownloadExtensions.push("tgz");
    androidDownloadExtensions.push("rtf");
    
    
    iOSWebviewExtensions.push("html");
    iOSWebviewExtensions.push("htm");
    iOSWebviewExtensions.push("doc");
    iOSWebviewExtensions.push("docx");
    iOSWebviewExtensions.push("xls");
    iOSWebviewExtensions.push("xlsx");
    iOSWebviewExtensions.push("csv");
    iOSWebviewExtensions.push("tsv");
    iOSWebviewExtensions.push("ppt");
    iOSWebviewExtensions.push("pptx");
    iOSWebviewExtensions.push("rtf");
    iOSWebviewExtensions.push("pdf");
    iOSWebviewExtensions.push("tiff");
    
    if(imageExtensions.indexOf(extension) !== -1){
        viewType = 'image';
    }
    else if(htmlExtensions.indexOf(extension) !== -1){
        viewType = 'html';
    }
    else if(Ti.App.isIOS && iOSWebviewExtensions.indexOf(extension) !== -1){
        viewType = 'iOSWebview';
    }
    else if(textExtensions.indexOf(extension) !== -1){
        viewType = 'text';
    }
    else if(Ti.App.isAndroid && androidDownloadExtensions.indexOf(extension) !== -1){
        viewType = 'download';
    }
    
    return viewType;
};

exports.displayFile = function(nid, fid, title) {
    var http, webview, newWin;
    try{
        if(Ti.Network.online){
            if (nid > 0 && fid > 0) {
                if (Ti.App.isIOS) {
                    exports.openWebViewInBrowser(nid);
                } else {
	                exports.loading();
	        
	                newWin = Titanium.UI.createWindow({
	                    navBarHidden: true,
	                    nid: nid,
	                    fid: fid,
	                    title: title,
	                    url: '/main_windows/fileViewer.js',
	                    orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
	                });
	                
	                newWin.addEventListener('open', function(){
	                   exports.doneLoading(); 
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

exports.openWebViewInBrowser = function(nid) {
	Ti.Platform.openURL(Ti.App.DOMAIN_NAME + '/node/' + nid);
};

exports.loading = function(message, win) {
    var height, width;
    
    if (exports.indicator) {
		return;
    }
    
    try{
        if ( typeof message === 'undefined') {
            message = 'Loading...';
        }
        
        if(typeof win === 'undefined'){
            win = exports.currentWindow;
            
            if(!exports.currentWindow) {
				Utils.sendErrorReport('Error in Display.loading: Current window not set');
				return;
		    }
        }
    
        exports.indicator = Ti.UI.createLabel({
            top : 0,
            bottom : 0,
            left : 0,
            right : 0,
            opacity : 0.85,
            backgroundColor : '#fff',
            zIndex : 1000,
            color : '#666',
            text : message,
            font : {
                fontWeight : 'bold',
                fontSize : 35
            },
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
            win : win
        });
        
        exports.indicator.addEventListener('click', exports.doneLoading);
        exports.currentWindow.addEventListener('close', exports.doneLoading);
        
        if(exports.indicator){
            win.add(exports.indicator);
        }
    }
    catch(nothing2){}
};

exports.doneLoading = function() {
    try{
        if (exports.indicator) {
            exports.indicator.hide();
            exports.indicator.win.remove(exports.indicator);
            exports.indicator = null;
        }
    }
    catch(ex){
        Utils.sendErrorReport("doneLoading: " + ex);
    }
};

exports.setImageViewThumbnail = function(imageView, nid, file_id) {

    var http, tempImg;

    if (nid > 0 && file_id > 0) {
        try {
            http = Ti.Network.createHTTPClient({
                enableKeepAlive: false,
                validatesSecureCertificate: false,
                timeout: 30000
            });
            
            Ti.API.info(Ti.App.DOMAIN_NAME + '/sync/image/thumbnail/' + nid + '/' + file_id);
            http.open('GET', Ti.App.DOMAIN_NAME + '/sync/image/thumbnail/' + nid + '/' + file_id);

            Utils.setCookieHeader(http);

            http.onload = function(e) {

                try{
                    imageView.setImage(this.responseData);
                }
                catch(ex){
                    Utils.sendErrorReport("Exception displaying image thumbnail in Display.setImageViewThumbnail: " + ex);
                }
                
                imageView.height = null;
                imageView.width = null;
                imageView.isImage = true;
                imageView.thumbnailLoaded = true;
                imageView.bigImg = null;
            };

            http.onerror = function(e) {
                Ti.API.error("Error in download image: " + e.status + " " + e.error + " " + nid + " " + file_id);
                imageView.image = '/images/default.png';
            };

            http.send();
        }
        catch(e) {
            Ti.API.info("==== ERROR ===" + e);
        }
    }
};

exports.displayFullImage = function(imageView) {
    try{
        var http, db, result;
        
        if (imageView.bigImg !== null || (typeof imageView.filePath !== 'undefined' && imageView.filePath !== null)) {
            Ti.API.debug("Displaying big image");
            
            exports.loading();
            exports.showBigImage(imageView);
            exports.doneLoading();
        }
        else if (imageView.nid > 0 && imageView.fid > 0) {
            exports.loading();
            
            try {
                http = Ti.Network.createHTTPClient({
                    enableKeepAlive: false,
                    validatesSecureCertificate: false,
                    timeout: 30000
                });
                
                http.open('GET', Ti.App.DOMAIN_NAME + '/sync/file/' + imageView.nid + '/' + imageView.fid);
    
                Utils.setCookieHeader(http);
    
                http.onload = function(e) {
                    if(this.responseData !== null){
                        
                        imageView.bigImg = this.responseData;
                       
                        exports.showBigImage(imageView);
                    }
                    else{
                        alert("There was a problem downloading the photo.");
                    }
                    
                    exports.doneLoading();
                };
    
                http.onerror = function(e) {
                    Ti.API.error("Error in download Image 2");
                    exports.doneLoading();
                    alert("There was an error retrieving the file.");
                };
    
                http.send();
            }
            catch(e) {
                exports.doneLoading();
                alert("There was an error retrieving the file.");
                Utils.sendErrorReport("Exception showing full photo file: " + e);
            }
        }
        else{
            alert("The photo could not be displayed.");
            Utils.sendErrorReport("Could not show full photo file. nid: " + imageView.nid + ', imageView.fid: ' + imageView.fid);
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception showing full photo: " + ex);
    }
};

exports.showBigImage = function(imageView) {
    var fullImage, background, transform, rotateDegrees, 
        orientation, screenWidth, screenHeight, picWidth, picHeight, 
        scrollView, picBlob, toolbar, isRotated, back, space, label, 
        timestamp, webView, imageData, imageFile;
    
    if(!exports.largePhotoWindow){
        
        try{
            exports.largePhotoWindow = Ti.UI.createWindow({
                backgroundColor : Ti.App.isIOS7 ? '#fff' : '#000',
                top : 0,
                bottom : 0,
                right : 0,
                left : 0,
                modal: true,
                width: Ti.UI.FILL,
                height: Ti.UI.FILL,
                orientationModes: [Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT],
                modalStyle: Ti.UI.iPhone.MODAL_PRESENTATION_FORMSHEET,
                navBarHidden: true
            });
            
            if(Ti.App.isAndroid){
                exports.largePhotoWindow.addEventListener("android:back", function(e){
                    exports.largePhotoWindow.close(); 
                    exports.largePhotoWindow = null;
                });
            }
            else{
                
                back = Ti.UI.createButton({
                    title : 'Back',
                    style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
                });
                
                back.addEventListener('click', function() {
                    try{
                        exports.largePhotoWindow.close();
                        exports.largePhotoWindow = null;
                    }
                    catch(ex){
                        Utils.sendErrorReport("exception on back button with show big image: " + ex);
                    }
                });
            
                space = Titanium.UI.createButton({
                    systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
                });
                
                label = Titanium.UI.createButton({
                    title : 'View Photo',
                    color : '#fff',
                    ellipsize : true,
                    wordwrap : false,
                    width : 200,
                    style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
                });
            
                // create and add toolbar
                toolbar = Ti.UI.iOS.createToolbar({
                    items : [back, space, label, space],
                    top : 20,
                    left: 0,
                    borderTop : false,
                    borderBottom : true,
                    zIndex: 100
                });
                
                exports.largePhotoWindow.add(toolbar);
            }
            
            imageData = null;
            
            if(typeof imageView.filePath !== 'undefined' && imageView.filePath !== null){
                Ti.API.debug("DISPLAYING FULL IMAGE FROM FILE PATH");
                
                try{
                    imageFile = Ti.Filesystem.getFile(imageView.filePath);
                    
                    if(imageFile.exists()){
                        imageData = imageFile.read();
                    }
                }
                catch(ex){
                    Utils.sendErrorReport("Exception setting bigImg: " + ex);
                    alert("A Problem occurred opening the file.");
                    return;
                }
            }
            else if(imageView.bigImg !== null){
                Ti.API.debug("DISPLAYING FULL IMAGE FROM BLOB");
                imageData = imageView.bigImg;
                
                
                Ti.API.debug("Image data size: " + imageData.length);
            }
            
            if(imageData === null){
            
                alert("Could not display large photo.");
            }
            else{
                
                if (Ti.App.isAndroid3OrBelow) {
                // WebViews are scalable but they render as junk text on older android phones
                webView = Ti.UI.createImageView({
	                    image: imageData
	                });
                } else {
	                webView = Ti.UI.createWebView({
                        top: Ti.App.isIOS7 ? 60 : 0,
	                    data: imageData
	                });
                }
                    
                exports.largePhotoWindow.add(webView);
                
                exports.largePhotoWindow.open();
                
                Ti.API.debug("large photo window showing...");
            }
        }
        catch(ex1){
            Utils.sendErrorReport("Exception showing large photo: " + ex1);
        }
    }
};

exports.displayLargeImage = function(imageView, nid, file_id, showInImageView) {
    try{
        var http, url;
        
        if(typeof showInImageView === 'undefined'){
            showInImageView = false;
        }
    
        if (imageView.bigImg !== null) {
            Ti.API.debug("Displaying big image - already loaded.");
            exports.showBigImage(imageView);
            return;
        }
    
        if (nid > 0 && file_id > 0) {
            
            if(!showInImageView){
                exports.loading();
            }
            
            try {
                http = Ti.Network.createHTTPClient({
                    enableKeepAlive: false,
                    validatesSecureCertificate: false,
                    timeout: 30000
                });
                
                url = Ti.App.DOMAIN_NAME + '/sync/file/' + nid + '/' + file_id;
                Ti.API.debug("Requesting " + url);
                
                http.open('GET', url);
    
                Utils.setCookieHeader(http);
    
                http.onload = function(e) {
                    try{
                        Ti.API.info('Download Success');
                        
                        imageView.bigImg = this.responseData;
                        
                        Ti.API.info("image size: " + this.responseData.length);
                        
                        if(showInImageView){
                            imageView.image = this.responseData;
                        }
                        else{
                            exports.showBigImage(imageView);
                            exports.doneLoading();
                        }
                        
                        imageView.fullImageLoaded = true;
                    }
                    catch(ex){
                        Utils.sendErrorReport("Exception downloading image: " + ex);
                    }
                };
    
                http.onerror = function(e) {
                    Ti.API.error("Error in download Image 2");
                    exports.doneLoading();
                    alert("There was an error retrieving the file.");
                };
    
                http.send();
            }
            catch(e) {
                exports.doneLoading();
                alert("There was an error retrieving the file.");
                Utils.sendErrorReport("exception in retrieving large image file: " + e);
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("exception in retrieving large image: " + ex);
    }
};

exports.setImageViewVideoThumbnail = function(imageView, nid, file_id, field_name) {

    var http, tempImg, url;

    if (nid > 0 && file_id > 0) {
        try {
            http = Ti.Network.createHTTPClient({
                enableKeepAlive: false,
                validatesSecureCertificate: false,
                timeout: 30000
            });
            
            url = Ti.App.DOMAIN_NAME + '/sync/video_file/video_thumbnail/' + nid + '/' + file_id + '/' + field_name;
            
            Ti.API.info(url);
            http.open('GET', url);

            Utils.setCookieHeader(http);

            http.onload = function(e) {
                
                try{
                    imageView.setImage(this.responseData);
                }
                catch(ex){
                    imageView.setImage('/images/video_loading.png');
                }
                
                imageView.height = null;
                imageView.width = null;
                imageView.isImage = true;
                imageView.thumbnailLoaded = true;
            };

            http.onerror = function(e) {
                Ti.API.error("Error in download video thumbnail: " + e.status + " " + e.error + " " + nid + " " + file_id + " " + field_name);
                imageView.image = '/images/default.png';
            };

            http.send();
        }
        catch(e) {
            Ti.API.info("==== ERROR ===" + e);
        }
    }
};

exports.removeNotifications = function() {

    if (Ti.App.isAndroid) {
        try {
            Ti.Android.NotificationManager.cancel(42);
        }
        catch(nothing) {

        }
    }
};

exports.openLocalPhotosWindow = function() {

    var localPhotosWindow = Ti.UI.createWindow({
        navBarHidden : true,
        url : '/main_windows/localPhotos.js',
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
    });
    
    localPhotosWindow.addEventListener('close', exports.showNewNotificationDialog);
    localPhotosWindow.addEventListener('open', exports.doneLoading);
    exports.loading();

    localPhotosWindow.open();

    return localPhotosWindow;
};

exports.showNewNotificationDialog = function() {
    var newNotifications, dialog, inspectionAlertShowing, newWin;
    
    newNotifications = Ti.App.Properties.getObject('newNotifications', {
        count : 0,
        nid : 0
    });
    
    if(typeof newNotifications !== 'undefined'){
        
        if (newNotifications.count > 0 && !inspectionAlertShowing) {
            
            // Clear the newNotifications object 
            Ti.App.Properties.setObject('newNotifications', {
                count : 0,
                nid : 0
            });
    
            if (newNotifications.count > 1) {
                dialog = Titanium.UI.createAlertDialog({
                    title : '(' + newNotifications.count + ') New Notifications',
                    message : 'View the notification list?',
                    buttonNames : ['Take Me There', 'View Later'],
                    cancel : 1
                });
    
                dialog.addEventListener('click', function(e) {
                    try{
                        if (e.index !== dialog.cancel) {
                            newWin = exports.openListWindow('notification', false, [], [], true);
                            newWin.addEventListener('close', function(){
                                AlertQueue.showNextAlertInQueue();
                            });
                        }
                        else{
                            AlertQueue.showNextAlertInQueue();
                        }
                    }
                    catch(ex){
                        Utils.sendErrorReport("exception view the notification list?: " + ex);
                    }
                });
                
                AlertQueue.enqueue(dialog);
            }
            else {
                dialog = Titanium.UI.createAlertDialog({
                    title : 'New Notification',
                    message : 'Read the notification now?',
                    buttonNames : ['Read Now', 'Read Later'],
                    cancel : 1
                });
    
                dialog.addEventListener('click', function(e) {
                    try{
                        if (e.index !== dialog.cancel) {
                            newWin = exports.openViewWindow('notification', newNotifications.nid);
                            newWin.addEventListener('close', function(){
                                AlertQueue.showNextAlertInQueue();
                            });
                        }
                        else{
                            AlertQueue.showNextAlertInQueue();
                        }
                    }
                    catch(ex){
                        Utils.sendErrorReport("exception read the notification now?: " + ex);
                    }
                });
                
                AlertQueue.enqueue(dialog);
            }
        }
    }
};

exports.openViewWindow = function(type, nid, allowActions) {
    var isDispatch, viewWindow, NodeViewTabs;
    
    if (typeof allowActions == 'undefined') {
        allowActions = true;
    }
    
    exports.loading();
            
    NodeViewTabs = require('ui/NodeViewTabs');
    viewWindow = NodeViewTabs.getTabs(type, nid, allowActions);
    
    if(viewWindow){
        viewWindow.addEventListener('open', exports.doneLoading);
        viewWindow.open();
    }
    else{
        Utils.sendErrorReport("Could not open dispatch view window");
        alert("Could not open the view.");
        exports.doneLoading();
    }

    return viewWindow;
};

exports.openListWindow = function(type, show_plus, filterValues, nestedWindows, showFinalResults) {
    var listWindow = Titanium.UI.createWindow({
        navBarHidden : true,
        url : '/main_windows/objects.js',
        type : type,
        show_plus : show_plus,
        filterValues : filterValues,
        nestedWindows : nestedWindows,
        showFinalResults : showFinalResults,
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
    });

    exports.loading();
    listWindow.addEventListener('open', exports.doneLoading);
    listWindow.open();

    return listWindow;
};

exports.openDraftsWindow = function() {
    var draftsWindow = Titanium.UI.createWindow({
        title : 'Drafts',
        navBarHidden : true,
        url : '/main_windows/drafts.js',
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
    });

    exports.loading();
    
    draftsWindow.addEventListener('open', exports.doneLoading);

    draftsWindow.open();

    return draftsWindow;
};

exports.newAppAvailable = function(message) {
    var dialog, now, sixHours;
    
    now = Utils.getUTCTimestamp();
    sixHours = now + (3600 * 12);
    
    // Only allow new app update dialog boxes to popup every 6 hours
    if (now - Ti.App.Properties.getDouble("lastAppUpdateNotification", 0) > sixHours) {
        dialog = Ti.UI.createAlertDialog({
            message : message,
            ok : 'OK',
            title : 'Updated App'
        }).show();

        Ti.App.Properties.setDouble("lastAppUpdateNotification", now);
    }
};

exports.getDrivingDirectionsTo = function(addressString) {
    try{
        if(addressString){
            
            Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
            Titanium.Geolocation.distanceFilter = 10;
            Titanium.Geolocation.getCurrentPosition(function(e){
                var url, longitude, latitude, intent;
                
                if (e.error){
                    alert("There was a problem getting directions: " + e.error);
                    return;
                }
                
                longitude = e.coords.longitude;
                latitude = e.coords.latitude;
               
                addressString = addressString.replace(/ /g, '+');
                
                if(Ti.App.isAndroid){
                    url = "http://maps.google.com/maps?mode=driving&t=m&saddr="; 
                    url += latitude + "," + longitude;
                    url += "&daddr=" + addressString;
                }
                else{
                    url = "http://maps.apple.com/maps?mode=driving&t=m&saddr="; 
                    url += latitude + "," + longitude;
                    url += "&daddr=" + addressString;
                }
                  
                Ti.Platform.openURL(url);
            });
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception getting driving directions: " + ex);
    }
};

exports.currentJobsWindow = null;
exports.openJobsWindow = function() {

    if(DispatchBundle.showJobsScreen()){
        
        if(exports.currentJobsWindow === null){
            exports.currentJobsWindow = Titanium.UI.createWindow({
                title : 'Jobs',
                navBarHidden : true,
                url : '/main_windows/jobs.js',
                orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
            });
        
            exports.loading();
            
            exports.currentJobsWindow.addEventListener('open', exports.doneLoading);
            exports.currentJobsWindow.addEventListener('close', function(){
                exports.currentJobsWindow = null;
            });
        
            exports.currentJobsWindow.open();
        }
    
        return exports.currentJobsWindow;
    }
    
    return null;
};
