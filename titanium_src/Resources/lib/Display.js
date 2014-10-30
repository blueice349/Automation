/*jslint node:true */
'use strict';

var Utils = require('lib/Utils');

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
    try{
        if(Ti.Network.online){
            if (nid > 0 && fid > 0) {
                if (Ti.App.isIOS) {
                    exports.openWebViewInBrowser(nid);
                } else {
	                exports.loading();
	        
	                var newWin = Titanium.UI.createWindow({
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
    if (nid > 0 && file_id > 0) {
        try {
            var http = Ti.Network.createHTTPClient({
                enableKeepAlive: false,
                validatesSecureCertificate: false,
                timeout: 30000
            });
            
            Ti.API.info(Ti.App.DOMAIN_NAME + '/sync/image/thumbnail/' + nid + '/' + file_id);
            http.open('GET', Ti.App.DOMAIN_NAME + '/sync/image/thumbnail/' + nid + '/' + file_id);

            Utils.setCookieHeader(http);

            http.onload = function() {

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
        if (imageView.bigImg !== null || (typeof imageView.filePath !== 'undefined' && imageView.filePath !== null)) {
            Ti.API.debug("Displaying big image");
            
            exports.loading();
            exports.showBigImage(imageView);
            exports.doneLoading();
        }
        else if (imageView.nid > 0 && imageView.fid > 0) {
            exports.loading();
            
            try {
                var http = Ti.Network.createHTTPClient({
                    enableKeepAlive: false,
                    validatesSecureCertificate: false,
                    timeout: 30000
                });
                
                http.open('GET', Ti.App.DOMAIN_NAME + '/sync/file/' + imageView.nid + '/' + imageView.fid);
    
                Utils.setCookieHeader(http);
    
                http.onload = function() {
                    if(this.responseData !== null){
                        
                        imageView.bigImg = this.responseData;
                       
                        exports.showBigImage(imageView);
                    }
                    else{
                        alert("There was a problem downloading the photo.");
                    }
                    
                    exports.doneLoading();
                };
    
                http.onerror = function() {
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
    var toolbar, back, space, label, webView, imageData, imageFile;
    
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
                exports.largePhotoWindow.addEventListener("android:back", function(){
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
    
                http.onload = function() {
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
    
                http.onerror = function() {
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
    var http, url;

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

            http.onload = function() {
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
	var AlertQueue = require('lib/AlertQueue');
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
    var viewWindow, NodeViewTabs;
    
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
                var url, longitude, latitude;
                
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
	var DispatchBundle = require('lib/bundles/DispatchBundle');

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

/** Dispaly an option dialog to select view, edit, next_part, etc.
 *  The only requirement is that each row has the nid set for the node
 *  so that e.row.nid can be referenced
 *  Also, the row is set to a background color of #fff when going to view or form
 */
exports.showDialogFormOptions = function(e, extraOptions) {
	var Database = require('lib/Database');
	var Node = require('objects/Node');
	var Print = require('lib/Print');
    var result, options, buttonData, to_type, to_bundle, isEditEnabled, 
        form_part, node_type, bundle, hasCustomCopy, postDialog, i,
        extraOptionCallback, extraOptionIndex, dispatchNid;

    if(typeof extraOptions === 'undefined'){
        extraOptions = [];
    }
    
    if (!e.row.nid) {
    	return;
    }
    
    try{
	    isEditEnabled = false;
	    hasCustomCopy = false;
	    options = [];
	    buttonData = [];
	    
        result = Database.query('SELECT table_name, form_part, perm_edit, dispatch_nid FROM node WHERE nid=' + e.row.nid);
    
        if (result.fieldByName('perm_edit', Ti.Database.FIELD_TYPE_INT) === 1) {
            isEditEnabled = true;
        }
    
        form_part = result.fieldByName('form_part', Ti.Database.FIELD_TYPE_INT);
        node_type = result.fieldByName('table_name');
        dispatchNid = result.fieldByName('dispatch_nid', Ti.Database.FIELD_TYPE_INT);
    
        result.close();
    }
    catch(ex){
        alert("The form entry has moved. Please reload this screen.");
        return;
    }
    finally{
        Database.close();
    }
    
    if (node_type == 'route_assignment') {
    	var RouteListener = require('objects/RouteListener');
    	var route = RouteListener.getRoute(e.row.nid);
    	if (route) {
	    	extraOptions.push({
	    		text: 'Start Route',
	    		callback: RouteListener.startRoute,
	    		callbackArgs: route
	    	});
	    }
    }
    
    if(extraOptions.length){
        for(i = 0; i < extraOptions.length; i ++){
            options.push(extraOptions[i].text);
            buttonData.push({
                form_part : '_extra_' + i
            });
        }
    }

    bundle = Node.getBundle(node_type);

    if (isEditEnabled) {
        if (bundle.data.form_parts != null && bundle.data.form_parts != "") {
            if (bundle.data.form_parts.parts.length >= form_part + 2) {

                options.push(bundle.data.form_parts.parts[form_part + 1].label);
                buttonData.push({
                    form_part: (form_part + 1),
                    dispatch_nid : dispatchNid
                });
            }
        }

        options.push('Edit');
        buttonData.push({
            form_part: form_part,
            dispatch_nid : dispatchNid
        });
    }

    options.push('View');
    buttonData.push({
        form_part: '_view',
        dispatch_nid : dispatchNid
    });
    
    if(Print.canPrintReceipt(e.row.nid)){
        options.push('Print');
        buttonData.push({
            form_part: '_print' 
        });
    }

    if ( typeof bundle.data.custom_copy !== 'undefined') {
        for (to_type in bundle.data.custom_copy) {
            if (bundle.data.custom_copy.hasOwnProperty(to_type)) {
                to_bundle = Node.getBundle(to_type);
                if (to_bundle && to_bundle.can_create == 1) {
                    if(typeof bundle.data.custom_copy[to_type] !== 'undefined' && 
                        typeof bundle.data.custom_copy[to_type].conversion_type !== 'undefined' &&
                        bundle.data.custom_copy[to_type].conversion_type == 'change'){
                        
                            options.push("Change to " + to_bundle.label);
                            buttonData.push({
                                form_part : to_type
                            }); 
                    }
                    else{
                        options.push("Copy to " + to_bundle.label);
                        buttonData.push({
                            form_part : to_type
                        });
                    }
                    hasCustomCopy = true;
                }
            }
        }
    }

    if (!isEditEnabled && !hasCustomCopy) {
        e.row.setBackgroundColor('#fff');
        exports.openViewWindow(node_type, e.row.nid);
    }
    else {
        
        options.push('View Online');
        buttonData.push({
            form_part : '_view_online'
        });
        
        options.push('Cancel');
        buttonData.push({
            form_part : '_cancel'
        });

        postDialog = Titanium.UI.createOptionDialog();
        postDialog.options = options;
        postDialog.eventRow = e.row;
        postDialog.cancel = options.length - 1;

        postDialog.addEventListener('click', function(ev) {
            var buttonInfo, form_part;
            
            try{
                if(ev.index >= 0){
                    buttonInfo = buttonData[ev.index];
                    form_part = buttonInfo.form_part;
                    
                    if(typeof form_part !== 'undefined'){
                        if (form_part == '_cancel') {
                            Ti.API.info("Cancelled");
                        }
                        else if(form_part == '_view') {
                            ev.source.eventRow.setBackgroundColor('#fff');
                            exports.openViewWindow(node_type, e.row.nid);
                        }
                        else if(form_part == '_view_online') {
                            ev.source.eventRow.setBackgroundColor('#fff');
                            exports.openWebView(e.row.nid);
                        }
                        else if(form_part == '_print'){
                            Print.printReceipt(e.row.nid);
                        }
                        else if(form_part == '_charge'){
                            Print.chargeCard(e.row.nid);
                        }
                        else if(form_part.toString().indexOf('_extra_') == 0){
                            extraOptionIndex = parseInt(form_part.substring(7), 10);
                            extraOptionCallback = extraOptions[extraOptionIndex].callback;
                            extraOptionCallback(extraOptions[extraOptionIndex].callbackArgs);
                        }
                        else if (!isNaN(parseInt(form_part, 10))){
                            // form+_part is a number, so it is editing the current node
                            if(isEditEnabled === true) {
                                
                                exports.loading();
                                
                                ev.source.eventRow.setBackgroundColor('#fff');
                                Ti.App.fireEvent('openFormWindow', {
                                   node_type: node_type,
                                   nid: e.row.nid,
                                   form_part: form_part
                                });
                                
                                setTimeout(exports.doneLoading, 5000);
                            }
                        }
                        else{
                            exports.loading();
                            
                            // The form part is a string, so it is a copy to function
                            // exports.openFormWindow(node_type, e.row.nid, form_part);
                            Ti.App.fireEvent('openFormWindow', {
                               node_type: node_type,
                               nid: e.row.nid,
                               form_part: form_part
                            });
                            
                            setTimeout(exports.doneLoading, 5000);
                        }
                    }
                }
            }
            catch(ex){
                Utils.sendErrorReport("exception dialog form options: " + ex);
            }
        });
        
        postDialog.show();
    }
};

exports.openWebView = function(nid){
    if (Ti.App.isIOS) {
        exports.openWebViewInBrowser(nid);
    } else {
        exports.openWebViewInApp(nid);
    }
};

exports.openWebViewInApp = function(nid) {
	var url = Ti.App.DOMAIN_NAME + '/node/' + nid;
	var cookie = Utils.getCookie();
    Utils.setCookie(cookie);
    
    var webView = Ti.UI.createWebView({
        url: url 
    });
    
    var webWin = Ti.UI.createWindow();
    
    if(Ti.App.isIOS){
        var backButton = Ti.UI.createButton({
            title : 'Back',
            style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
        });

        backButton.addEventListener('click', function() {
            webWin.close();
        });
        
        // create and add toolbar
        var toolbar = Ti.UI.iOS.createToolbar({
            items : [backButton],
            top : 20,
            borderTop : false,
            borderBottom : false,
            height : 35
        });
        webWin.add(toolbar);
        
        webView.top = 55;
    }
    
    webWin.add(webView);
    webWin.open({
        modal: true
    });
};
