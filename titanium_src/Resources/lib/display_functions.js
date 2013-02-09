Omadi.display = Omadi.display || {};

/*jslint eqeq:true*/

Omadi.display.showBigImage = function(imageView) {"use strict";

    var imageWin, fullImage, background;

    imageWin = Ti.UI.createWindow({
        backgroundColor : '#00000000'
    });

    imageWin.setOrientationModes([Ti.UI.PORTRAIT]);

    background = Ti.UI.createView({
        backgroundColor : 'black',
        opacity : 0.8,
        top : 0,
        bottom : 0,
        right : 0,
        left : 0
    });

    fullImage = Omadi.display.getImageViewFromData(imageView.bigImg, Ti.Platform.displayCaps.platformWidth, Ti.Platform.displayCaps.platformHeight - 50);

    if (fullImage !== null) {

        fullImage.opacity = 1;
        fullImage.addEventListener('click', function(e) {
            imageWin.close();
        });

        background.addEventListener('click', function(e) {
            imageWin.close();
        });

        background.add(fullImage);
        imageWin.add(background);
        imageWin.open();
    }
};

Omadi.display.showLogoutDialog = function(){"use strict";
    var verifyLogout;

    if (Omadi.bundles.timecard.userShouldClockInOut()) {

        Omadi.bundles.timecard.askClockOutLogout();
    }
    else {

        verifyLogout = Ti.UI.createAlertDialog({
            title : 'Logout?',
            message : 'Are you sure you want to logout?',
            buttonNames : ['Yes', 'No']
        });

        verifyLogout.addEventListener('click', function(e) {
            if (e.index == 0) {
                Ti.API.info('Logging out from Regular logout dialog');
                Omadi.service.logout();
            }
        });

        verifyLogout.show();
    }
};

Omadi.display.logoutButtonPressed = function(){"use strict";
    if (Omadi.bundles.inspection.userShouldDoInspection()) {
        Omadi.bundles.inspection.askToCreateInspection();
    }
    else {
        Omadi.display.showLogoutDialog();
    }
};

Omadi.display.getFileViewType = function(filename){"use strict";

    var iOSWebviewExtensions = [], extension, htmlExtensions = [], dotIndex,
        imageExtensions = [], androidDownloadExtensions = [], textExtensions = [], viewType = null;
    
    dotIndex = filename.lastIndexOf('.');
    extension = "";
    if(dotIndex !== -1 && dotIndex !== filename.length - 1){
        extension = filename.substring(dotIndex + 1).toLowerCase();
    }
    
    textExtensions.push("txt");
    textExtensions.push("xml");
    
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

Omadi.display.newAppAvailable = function(message) {"use strict";
    var dialog, now = Omadi.utils.getUTCTimestamp();

    if (now - Ti.App.Properties.getDouble("lastAppUpdateNotification", 0) > 3600) {
        dialog = Ti.UI.createAlertDialog({
            message : message,
            ok : 'OK',
            title : 'Updated App'
        }).show();

        Ti.App.Properties.setDouble("lastAppUpdateNotification", now);
    }
};

Omadi.display.openListWindow = function(type, show_plus, filterValues, nestedWindows, showFinalResults) {"use strict";
    var listWindow = Titanium.UI.createWindow({
        navBarHidden : true,
        url : 'objects.js',
        type : type,
        show_plus : show_plus,
        filterValues : filterValues,
        nestedWindows : nestedWindows,
        showFinalResults : showFinalResults
    });

    Omadi.display.loading();
    listWindow.addEventListener('open', Omadi.display.doneLoading);

    listWindow.open();

    return listWindow;
};

Omadi.display.openActionsWindow = function() {"use strict";
    var actionsWindow = Ti.UI.createWindow({
        title : 'Actions',
        navBarHidden : true,
        url : 'actions.js'
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
        url : 'about.js'
    });

    Omadi.display.loading();
    aboutWindow.addEventListener('open', Omadi.display.doneLoading);
    aboutWindow.open();

    return aboutWindow;
};

Omadi.display.openDraftsWindow = function() {"use strict";
    var draftsWindow = Titanium.UI.createWindow({
        title : 'Drafts',
        navBarHidden : true,
        url : 'drafts.js'
    });

    Omadi.display.loading();
    draftsWindow.addEventListener('open', Omadi.display.doneLoading);

    draftsWindow.open();

    return draftsWindow;
};

Omadi.display.openViewWindow = function(type, nid) {"use strict";
    var viewWindow = Titanium.UI.createWindow({
        navBarHidden : true,
        type : type,
        url : 'individual_object.js',
        nid : nid
    });

    viewWindow.addEventListener('open', Omadi.display.doneLoading);
    Omadi.display.loading();

    viewWindow.open();

    return viewWindow;
};

Omadi.display.openFormWindow = function(type, nid, form_part) {"use strict";

    var formWindow = Ti.UI.createWindow({
        navBarHidden : true,
        url : '/main_windows/form.js',
        type : type,
        nid : nid,
        form_part : form_part
    });
    
    formWindow.addEventListener('close', Omadi.display.showNewNotificationDialog);
    formWindow.addEventListener('open', Omadi.display.doneLoading);
    Omadi.display.loading();

    formWindow.open();

    return formWindow;
};

Omadi.display.openMainMenuWindow = function(options) {"use strict";
    var mainMenuWindow, i;
    
    mainMenuWindow = Titanium.UI.createWindow({
        url : '/main_windows/mainMenu.js',
        navBarHidden : true
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
    var newNotifications, dialog, inspectionAlertShowing, newWin;
    
    /*global alertQueue, useAlertQueue*/
    
    newNotifications = Ti.App.Properties.getObject('newNotifications', {
        count : 0,
        nid : 0
    });
    
    //inspectionAlertShowing = Ti.App.Properties.getBool("inspectionAlertShowing", false);
    //Ti.API.debug("inspection: " + inspectionAlertShowing);
    
    if (newNotifications.count > 0 && !inspectionAlertShowing) {

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
                if (e.index !== e.source.cancel) {
                    newWin = Omadi.display.openListWindow('notification', false, [], [], true);
                    if(typeof alertQueue !== 'undefined'){
                        newWin.addEventListener('close', function(){
                            Ti.App.fireEvent('showNextAlertInQueue');
                        });
                   }
                }
                else{
                    if(typeof alertQueue !== 'undefined'){
                        Ti.App.fireEvent('showNextAlertInQueue');
                    }
                }
            });
            
            if(typeof alertQueue !== 'undefined' && useAlertQueue){
                alertQueue.push(dialog);
            }
            else{
                dialog.show();
            }
        }
        else {
            dialog = Titanium.UI.createAlertDialog({
                title : 'New Notification',
                message : 'Read the notification now?',
                buttonNames : ['Read Now', 'Read Later'],
                cancel : 1
            });

            dialog.addEventListener('click', function(e) {
                if (e.index !== e.source.cancel) {
                    newWin = Omadi.display.openViewWindow('notification', newNotifications.nid);
                    if(typeof alertQueue !== 'undefined'){
                        newWin.addEventListener('close', function(){
                            Ti.App.fireEvent('showNextAlertInQueue');
                        });
                    }
                }
                else{
                    if(typeof alertQueue !== 'undefined'){
                        Ti.App.fireEvent('showNextAlertInQueue');
                    }
                }
            });
            
            if(typeof alertQueue !== 'undefined' && useAlertQueue){
                alertQueue.push(dialog);
            }
            else{
                dialog.show();
            }
        }
    }
};

/** Dispaly an option dialog to select view, edit, next_part, etc.
 *  The only requirement is that each row has the nid set for the node
 *  so that e.row.nid can be referenced
 *  Also, the row is set to a background color of #fff when going to view or form
 */
Omadi.display.showDialogFormOptions = function(e) {"use strict";
    var db, result, options, form_parts, to_type, to_bundle, isEditEnabled, form_part, node_type, bundle, hasCustomCopy, postDialog;

    db = Omadi.utils.openMainDatabase();
    result = db.execute('SELECT table_name, form_part, perm_edit FROM node WHERE nid=' + e.row.nid);

    isEditEnabled = false;
    hasCustomCopy = false;
    options = [];
    form_parts = [];

    if (result.fieldByName('perm_edit', Ti.Database.FIELD_TYPE_INT) === 1) {
        isEditEnabled = true;
    }

    form_part = result.fieldByName('form_part', Ti.Database.FIELD_TYPE_INT);
    node_type = result.fieldByName('table_name');

    result.close();
    db.close();

    bundle = Omadi.data.getBundle(node_type);

    if (isEditEnabled) {
        if (bundle.data.form_parts != null && bundle.data.form_parts != "") {
            if (bundle.data.form_parts.parts.length >= form_part + 2) {

                options.push(bundle.data.form_parts.parts[form_part + 1].label);
                form_parts.push(form_part + 1);
            }
        }

        options.push('Edit');
        form_parts.push(form_part);
    }

    options.push('View');
    form_parts.push('_view');

    if ( typeof bundle.data.custom_copy !== 'undefined') {
        for (to_type in bundle.data.custom_copy) {
            if (bundle.data.custom_copy.hasOwnProperty(to_type)) {
                to_bundle = Omadi.data.getBundle(to_type);
                if (to_bundle && to_bundle.can_create == 1) {
                    options.push("Copy to " + to_bundle.label);
                    form_parts.push(to_type);
                    hasCustomCopy = true;
                }
            }
        }
    }

    if (!isEditEnabled && !hasCustomCopy) {
        e.row.setBackgroundColor('#fff');
        Omadi.display.openViewWindow(node_type, e.row.nid);
    }
    else {

        options.push('Cancel');
        form_parts.push('_cancel');

        postDialog = Titanium.UI.createOptionDialog();
        postDialog.options = options;
        postDialog.eventRow = e.row;
        postDialog.show();

        postDialog.addEventListener('click', function(ev) {
            var form_part = form_parts[ev.index];

            if (form_part == '_cancel') {
                Ti.API.info("Cancelled");
            }
            else if (form_part == '_view') {
                ev.source.eventRow.setBackgroundColor('#fff');
                Omadi.display.openViewWindow(node_type, e.row.nid);
            }
            else if (ev.index !== -1 && isEditEnabled === true) {
                ev.source.eventRow.setBackgroundColor('#fff');
                Omadi.display.openFormWindow(node_type, e.row.nid, form_part);
            }
        });
    }
};

Omadi.display.getNodeTypeImagePath = function(type) {"use strict";

    switch(type) {
        case 'lead':
        case 'contact':
        case 'account':
        case 'boot':
        case 'tow':
        case 'drop_fee':
        case 'incident_report':
        case 'notification':
        case 'pd':
        case 'potential':
        case 'restriction':
        case 'service':
        case 'tag':
        case 'task':
        case 'cod':
        case 'cash_call':
        case 'hourly':
        case 'repo':
        case 'ticket':
        case 'inspection':
        case 'timecard':
        case 'permit_request':
        case 'company_vehicle':

            return '/images/icons/' + type + ".png";

        default:
            return '/images/icons/settings.png';
    }
};

Omadi.display.displayFile = function(nid, fid, title) {"use strict";
    var http, webview, newWin;
    
    if(Ti.Network.online){
        if (nid > 0 && fid > 0) {
            Omadi.display.loading();
    
            newWin = Titanium.UI.createWindow({
                navBarHidden: true,
                nid: nid,
                fid: fid,
                title: title,
                url: '/main_windows/fileViewer.js'
            });
            
            newWin.addEventListener('open', function(){
               Omadi.display.doneLoading(); 
            });
            
            newWin.open();
        }
    }
    else{
        alert("You are not connected to the Internet, so the file cannot be downloaded.");
    }
};

Omadi.display.displayLargeImage = function(imageView, nid, file_id) {"use strict";

    var http;

    if (imageView.bigImg !== null) {
        Omadi.display.showBigImage(imageView);
        return;
    }

    if (nid > 0 && file_id > 0) {
        Omadi.display.loading();

        try {
            http = Ti.Network.createHTTPClient();
            http.setTimeout(30000);
            http.open('GET', Omadi.DOMAIN_NAME + '/sync/file/' + nid + '/' + file_id);

            Omadi.utils.setCookieHeader(http);

            http.onload = function(e) {
                //Ti.API.info('=========== Success ========');
                imageView.bigImg = this.responseData;
                Omadi.display.showBigImage(imageView);
                Omadi.display.doneLoading();
                imageView.fullImageLoaded = true;
            };

            http.onerror = function(e) {
                Ti.API.error("Error in download Image 2");
                Omadi.display.doneLoading();
                alert("There was an error retrieving the file.");
            };

            http.send();
        }
        catch(e) {
            Omadi.display.doneLoading();
            alert("There was an error retrieving the file.");
            Ti.API.info("==== ERROR ===" + e);
        }
    }
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
            imageView.image = imageView.toImage();
        }

        return imageView;
    }
    catch(evt) {
        Ti.API.error("Error in reduce Image Size");
    }

};

Omadi.display.openTermsOfService = function(){"use strict";

    var win, webView, toolbar, space, titleLabel, backButton;

    win = Ti.UI.createWindow({
        layout: 'vertical',
        navBarHidden: true
    });
    
    webView = Ti.UI.createWebView({
        url : 'https://omadi.com/terms.txt',
        height : Ti.UI.FILL
    });
    
    if(Ti.App.isAndroid){
        win.addEventListener("android:back", function(e){
            win.close();
        });
    }
    else{
        backButton = Ti.UI.createButton({
            title : 'Back',
            style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
        });
        
        backButton.addEventListener('click', function() {
            win.close();
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
    
};

// Download Image from the server
Omadi.display.setImageViewThumbnail = function(imageView, nid, file_id) {"use strict";

    var http, tempImg;

    if (nid > 0 && file_id > 0) {
        try {
            http = Ti.Network.createHTTPClient();
            http.setTimeout(30000);
            Ti.API.info(Omadi.DOMAIN_NAME + '/sync/image/thumbnail/' + nid + '/' + file_id);
            http.open('GET', Omadi.DOMAIN_NAME + '/sync/image/thumbnail/' + nid + '/' + file_id);

            Omadi.utils.setCookieHeader(http);

            http.onload = function(e) {
                tempImg = Ti.UI.createImageView({
                    height : 'auto',
                    width : 'auto',
                    image : this.responseData
                });

                if (tempImg.toImage().height > 100 || tempImg.toImage().width > 100) {
                    imageView.setImage(Omadi.display.getImageViewFromData(tempImg.toImage(), 100, 100).toBlob());
                }
                else {
                    imageView.setImage(this.responseData);
                }
                imageView.isImage = true;
                imageView.thumbnailLoaded = true;
            };

            http.onerror = function(e) {
                Ti.API.error("Error in download image: " + e.status + " " + e.error + " " + nid + " " + file_id);
                imageView.image = '../images/default.png';
            };

            http.send();
        }
        catch(e) {
            Ti.API.info("==== ERROR ===" + e);
        }
    }
};

Omadi.display.removeNotifications = function() {"use strict";

    if (Ti.App.isAndroid) {
        try {
            Ti.Android.NotificationManager.cancel(42);
        }
        catch(nothing) {

        }
    }
};

var loadingIndicatorWindow, loadingActivityIndicator, indicator = null;

Omadi.display.hideLoadingIndicator = function() {"use strict";
    Ti.API.info("hiding indicator");

    //if(typeof loadingActivityIndicator !== 'undefined'){
    loadingActivityIndicator.hide();
    loadingIndicatorWindow.close();
    // }
};

// Omadi.display.currentOrientaion = 0;
//
// Ti.Gesture.addEventListener('orientationchange', function(e) {"use strict";
// Omadi.display.currentOrientaion = e.orientation;
// });

Omadi.display.loading = function(message) {"use strict";
    var height, width;

    if ( typeof message === 'undefined') {
        message = 'Loading...';
    }

    // Ti.Gesture.fireEvent('orientationchange');
    //
    // if(Omadi.display.currentOrientation == Ti.UI.PORTRAIT || Omadi.display.currentOrientation == Ti.UI.UPSIDE_PORTRAIT){
    // height = Math.max(Ti.Platform.displayCaps.getPlatformHeight(), Ti.Platform.displayCaps.getPlatformWidth());
    // width = Math.min(Ti.Platform.displayCaps.getPlatformHeight(), Ti.Platform.displayCaps.getPlatformWidth());
    // }
    // else{
    // height = Math.min(Ti.Platform.displayCaps.getPlatformHeight(), Ti.Platform.displayCaps.getPlatformWidth());
    // width = Math.max(Ti.Platform.displayCaps.getPlatformHeight(), Ti.Platform.displayCaps.getPlatformWidth());
    // }

    indicator = Ti.UI.createLabel({
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
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER
    });

    Ti.UI.currentWindow.add(indicator);

    indicator.addEventListener('longpress', function(e) {
        //e.source.hide();
    });
};

Omadi.display.doneLoading = function() {"use strict";

    if (indicator !== null) {
        indicator.hide();

        //Ti.App.fireEvent("displayDoneLoading");
    }
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
        backgroundColor : '#000'
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
        top : 0, //-1 * Ti.Platform.displayCaps.platformHeight * 0.14
        zIndex : 100
    });

    Ti.UI.currentWindow.add(this.progressView);

    this.pb_download = Titanium.UI.createProgressBar({
        width : "96%",
        min : 0,
        max : 1,
        top : 0,
        value : 0,
        color : '#fff',
        message : 'Downloading ...',
        style : (Ti.App.isIOS) ? Titanium.UI.iPhone.ProgressBarStyle.PLAIN : ''
    });

    this.pb_install = Titanium.UI.createProgressBar({
        width : "96%",
        min : 0,
        max : 100,
        top : 0,
        value : 0,
        color : '#fff',
        message : 'Installing ...',
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

    this.set_download = function(value) {
        this.pb_download.value = value;
    };

    this.close = function() {
        Ti.UI.currentWindow.remove(this.progressView);
    };
};

