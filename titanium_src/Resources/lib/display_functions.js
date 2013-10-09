

/*jslint eqeq:true,plusplus:true*/

Omadi.display = Omadi.display || {};

Omadi.display.largePhotoWindow = null;

Omadi.display.showBigImage = function(imageView) {"use strict";

    var fullImage, background, transform, rotateDegrees, 
        orientation, screenWidth, screenHeight, picWidth, picHeight, 
        scrollView, picBlob, toolbar, isRotated, back, space, label;
    
    if(Omadi.display.largePhotoWindow === null){
    
        Omadi.display.largePhotoWindow = Ti.UI.createWindow({
            backgroundColor : 'black',
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
        
        // scrollView = Ti.UI.createScrollView({
            // width: Ti.UI.FILL,
            // height: Ti.UI.FILL,
            // contentWidth: 'auto',
            // contentHeight: 'auto',
            // top: 0,
            // scrollType: 'horizontal'
        // });
        
        if(Ti.App.isAndroid){
            Omadi.display.largePhotoWindow.addEventListener("android:back", function(e){
                
                //Ti.Gesture.removeEventListener('orientationchange', Omadi.display.largePhotoResize);
                Omadi.display.largePhotoWindow.close(); 
                Omadi.display.largePhotoWindow = null;
            });
        }
        else{
            
            
            back = Ti.UI.createButton({
                title : 'Back',
                style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
            });
            
            back.addEventListener('click', function() {
                Omadi.display.largePhotoWindow.close();
                Omadi.display.largePhotoWindow = null;
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
                top : 0,
                left: 0,
                borderTop : false,
                borderBottom : true,
                zIndex: 100
            });
            
            Omadi.display.largePhotoWindow.add(toolbar);
        }
        
        // orientation = Ti.Gesture.getOrientation();
    //     
        // screenWidth = Ti.Platform.displayCaps.platformWidth;
        // screenHeight = Ti.Platform.displayCaps.platformHeight;
    //     
        // if(orientation == Ti.UI.PORTRAIT || orientation == Ti.UI.UPSIDE_PORTRAIT){
    //         
        // }
        // else{
    //         
        // }
        
        if(typeof imageView.filePath !== 'undefined' && imageView.filePath !== null){
            Ti.API.debug("DISPLAYING FULL IMAGE FROM FILE PATH");
            fullImage = Ti.UI.createImageView({
               image: imageView.filePath,
               autorotate: true,
               height: '100%'
            });
            
            imageView.bigImg = fullImage.toImage();
        }
        else if(imageView.bigImg !== null){ 
            //fullImage = Omadi.display.getImageViewFromData(imageView.bigImg, Ti.Platform.displayCaps.platformWidth, Ti.Platform.displayCaps.platformHeight - 50);    
            Ti.API.debug("DISPLAYING FULL IMAGE FROM BLOB");
            fullImage = Ti.UI.createImageView({
               image: imageView.bigImg,
               autorotate: true,
               height: '100%'
            });
        }
        else{
            alert("Could not display large photo.");
            return;
        }
        
        isRotated = false;
        Ti.API.debug("before dim");
        
        picWidth = imageView.bigImg.width;
        picHeight = imageView.bigImg.height;
        
        Ti.API.debug("dimensions: " + picWidth + "x" + picHeight);
        
        if(Omadi.utils.getPhotoWidget() == 'choose'){
            // For the photo chooser, we don't know about any degrees saved
            // No zooming will be allowed for now
            picWidth = 1;
            picHeight = 1;
        }
        else if(Ti.App.isAndroid && (imageView.degrees == 270 || imageView.degrees == 90)){    
            isRotated = true;
            
            picWidth = imageView.bigImg.height;
            picHeight = imageView.bigImg.width;
        }
       
        if (typeof fullImage !== 'undefined' && fullImage != null) {
            
            Ti.API.debug("Full Image");
            
            Omadi.display.largePhotoWindow.add(fullImage);

            if(picWidth > 150 && picHeight > 150){
                // Pinch zoom is enabled as baseWidth is defined
                fullImage.baseHeight = picHeight;
                fullImage.baseWidth = picWidth;
                fullImage.height = picHeight;
                fullImage.width = picWidth;
                
                imageView.baseHeight = picHeight;
                imageView.baseWidth = picWidth;
            }
            else if(typeof imageView.baseHeight !== 'undefined' && imageView.baseHeight > 1){
                // Had to add in this condition because the second time coming into the same photo
                // it would have a picHeight and picWidth of 1, so zooming wouldn't be possible
                fullImage.baseHeight = imageView.baseHeight;
                fullImage.baseWidth = imageView.baseWidth;
                fullImage.height = imageView.baseHeight;
                fullImage.width = imageView.baseWidth;
            }
            else{
                
                fullImage.height = Ti.UI.SIZE;
                fullImage.width = Ti.UI.SIZE;
            }
            
            fullImage.addEventListener('touchstart', function(e){
                e.source.baseHeight = e.source.height;
                e.source.baseWidth = e.source.width; 
            });
            
            fullImage.addEventListener('pinch', function(e){
                if(e.source.baseWidth > 0){
                    e.source.height = e.source.baseHeight * e.scale;
                    e.source.width = e.source.baseWidth * e.scale; 
                }
            });
            
            fullImage.addEventListener('postlayout', function(e){
                Ti.API.debug("Rect: " + e.source.rect.width + "x" + e.source.rect.height);
                e.source.width = e.source.rect.width;
                e.source.height = e.source.rect.height;
            });
            
            Omadi.display.largePhotoWindow.fullImage = fullImage;
            
            Omadi.display.largePhotoWindow.open();
        }
        else{
            alert("Could not open the photo.");
            Omadi.display.largePhotoWindow = null;
        }
    }
};

Omadi.display.iOSBackToolbar = function(actualWindow, label){"use strict";
    var back, space, toolbar;
    
    if(Ti.App.isIOS){
        back = Ti.UI.createButton({
            title : 'Back',
            style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
        });
        
        back.addEventListener('click', function() {
            actualWindow.close();
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

Omadi.display.showLogoutDialog = function(){"use strict";
    var verifyLogout;

    if (Omadi.bundles.timecard.userShouldClockInOut()) {

        Omadi.bundles.timecard.askClockOutLogout();
    }
    else {

        verifyLogout = Ti.UI.createAlertDialog({
            title : 'Really Logout?',
            buttonNames : ['Logout', 'Cancel']
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
    
    // try{
        // var intent = Ti.Android.createIntent({
            // action: Ti.Android.ACTION_MAIN,
            // flags: Ti.Android.FLAG_ACTIVITY_CLEAR_TOP,
            // packageName: 'com.omadi.crm',
            // className: 'OmadiActivity'
        // });
        // intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
        // Ti.Android.currentActivity.startActivity(intent);
//         
        // Omadi.utils.closeApp();
//     
    // }
    // catch(ex){
        // alert(ex);
    // }
//     
    // return;
    if (Omadi.bundles.inspection.userShouldDoInspection()) {
        Omadi.bundles.inspection.askToCreateInspection(true);
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
        url : '/main_windows/objects.js',
        type : type,
        show_plus : show_plus,
        filterValues : filterValues,
        nestedWindows : nestedWindows,
        showFinalResults : showFinalResults,
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
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
    var draftsWindow = Titanium.UI.createWindow({
        title : 'Drafts',
        navBarHidden : true,
        url : '/main_windows/drafts.js',
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
    });

    Omadi.display.loading();
    draftsWindow.addEventListener('open', Omadi.display.doneLoading);

    draftsWindow.open();

    return draftsWindow;
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

Omadi.display.openJobsWindow = function() {"use strict";

    if(Omadi.bundles.dispatch.showJobsScreen()){
        
        var jobsWindow = Titanium.UI.createWindow({
            title : 'Jobs',
            navBarHidden : true,
            url : '/main_windows/jobs.js',
            orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
        });
    
        Omadi.display.loading();
        jobsWindow.addEventListener('open', Omadi.display.doneLoading);
    
        jobsWindow.open();
    
        return jobsWindow;
    }
    
    return null;
};

Omadi.display.openViewWindow = function(type, nid) {"use strict";
    var viewWindow = Titanium.UI.createWindow({
        navBarHidden : true,
        type : type,
        url : '/main_windows/individual_object.js',
        nid : nid,
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
    });

    viewWindow.addEventListener('open', Omadi.display.doneLoading);
    Omadi.display.loading();

    viewWindow.open();

    return viewWindow;
};

Omadi.display.openFormWindow = function(type, nid, form_part) {"use strict";
    var db, result, formWindow, intNid, isDispatch, dispatchNid, bundle;
    
    isDispatch = false;
    
    if(type == 'dispatch'){
        isDispatch = true;
    }
    else{
        intNid = parseInt(nid, 10);
        if(!isNaN(intNid)){
            db = Omadi.utils.openMainDatabase();
            result = db.execute("SELECT dispatch_nid FROM node where nid = " + intNid);
            if(result.isValidRow()){
                dispatchNid = result.field(0, Ti.Database.FIELD_TYPE_INT);
                if(dispatchNid != 0){
                    isDispatch = true;
                }
            }
            result.close();
            db.close();   
        }
        else{
            // This is a new node from plus button
            bundle = Omadi.data.getBundle(type);
            if(typeof bundle.data.dispatch !== 'undefined' && typeof bundle.data.dispatch.force_dispatch !== 'undefined' && bundle.data.dispatch.force_dispatch == 1){
                // Do not allow a force dispatch to create its own node without a dispatch node
                isDispatch = true;
            }
        }
    }
    
    if(isDispatch){
        formWindow = Ti.UI.createWindow({
            navBarHidden : true,
            url : '/main_windows/dispatch_form.js',
            type : type,
            nid : nid,
            form_part : form_part,
            orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
        });
    }
    else{
        formWindow = Ti.UI.createWindow({
            navBarHidden : true,
            url : '/main_windows/form.js',
            type : type,
            nid : nid,
            form_part : form_part,
            usingDispatch : false,
            orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
        });
    }
    
    formWindow.addEventListener('close', Omadi.display.showNewNotificationDialog);
    formWindow.addEventListener('open', Omadi.display.doneLoading);
    Omadi.display.loading();

    formWindow.open();

    return formWindow;
};

Omadi.display.openLocalPhotosWindow = function() {"use strict";

    var localPhotosWindow = Ti.UI.createWindow({
        navBarHidden : true,
        url : '/main_windows/localPhotos.js',
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
    });
    
    localPhotosWindow.addEventListener('close', Omadi.display.showNewNotificationDialog);
    localPhotosWindow.addEventListener('open', Omadi.display.doneLoading);
    Omadi.display.loading();

    localPhotosWindow.open();

    return localPhotosWindow;
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
    var newNotifications, dialog, inspectionAlertShowing, newWin;
    
    /*global alertQueue, useAlertQueue*/
    
    newNotifications = Ti.App.Properties.getObject('newNotifications', {
        count : 0,
        nid : 0
    });
    
    //inspectionAlertShowing = Ti.App.Properties.getBool("inspectionAlertShowing", false);
    //Ti.API.debug("inspection: " + inspectionAlertShowing);
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
    }
};

/** Dispaly an option dialog to select view, edit, next_part, etc.
 *  The only requirement is that each row has the nid set for the node
 *  so that e.row.nid can be referenced
 *  Also, the row is set to a background color of #fff when going to view or form
 */
Omadi.display.showDialogFormOptions = function(e, extraOptions) {"use strict";
    var db, result, options, buttonData, to_type, to_bundle, isEditEnabled, 
        form_part, node_type, bundle, hasCustomCopy, postDialog, i,
        extraOptionCallback, extraOptionIndex, dispatchNid;

    if(typeof extraOptions === 'undefined'){
        extraOptions = [];
    }
    
    if(e.row.nid){
        db = Omadi.utils.openMainDatabase();
        try{
            result = db.execute('SELECT table_name, form_part, perm_edit, dispatch_nid FROM node WHERE nid=' + e.row.nid);
            
            isEditEnabled = false;
            hasCustomCopy = false;
            options = [];
            buttonData = [];
            
            if(extraOptions.length){
                for(i = 0; i < extraOptions.length; i ++){
                    options.push(extraOptions[i].text);
                    buttonData.push({
                        form_part : '_extra_' + i
                    });
                }
            }
        
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
            db.close();
        }
    
        bundle = Omadi.data.getBundle(node_type);
    
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
    
        if ( typeof bundle.data.custom_copy !== 'undefined') {
            for (to_type in bundle.data.custom_copy) {
                if (bundle.data.custom_copy.hasOwnProperty(to_type)) {
                    to_bundle = Omadi.data.getBundle(to_type);
                    if (to_bundle && to_bundle.can_create == 1) {
                        options.push("Copy to " + to_bundle.label);
                        buttonData.push({
                            form_part : to_type
                        });
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
            buttonData.push({
                form_part : '_cancel'
            });
    
            postDialog = Titanium.UI.createOptionDialog();
            postDialog.options = options;
            postDialog.eventRow = e.row;
            postDialog.show();
    
            postDialog.addEventListener('click', function(ev) {
                var buttonInfo, form_part;
                
                if(ev.index >= 0){
                    buttonInfo = buttonData[ev.index];
                    form_part = buttonInfo.form_part;
                    
                    if(typeof form_part !== 'undefined'){
                        if (form_part == '_cancel') {
                            Ti.API.info("Cancelled");
                        }
                        else if (form_part == '_view') {
                            ev.source.eventRow.setBackgroundColor('#fff');
                            Omadi.display.openViewWindow(node_type, e.row.nid);
                        }
                        else if(form_part.toString().indexOf('_extra_') == 0){
                            extraOptionIndex = parseInt(form_part.substring(7), 10);
                            extraOptionCallback = extraOptions[extraOptionIndex].callback;
                            extraOptionCallback(extraOptions[extraOptionIndex].callbackArgs);
                        }
                        else if (!isNaN(parseInt(form_part, 10))){
                            // form+_part is a number, so it is editing the current node
                            if(isEditEnabled === true) {
                                ev.source.eventRow.setBackgroundColor('#fff');
                                Omadi.display.openFormWindow(node_type, e.row.nid, form_part);   
                            }
                        }
                        else{
                            // The form part is a string, so it is a copy to function
                            Omadi.display.openFormWindow(node_type, e.row.nid, form_part);
                        }
                    }
                }
            });
        }
    }
};

/**
 * Fetch the icon image from the server
 * Optionally pass in an imageView to update once the image comes through
 */
Omadi.display.insertBundleIcon = function(type, imageView){"use strict";
    var http;
    
    http = Ti.Network.createHTTPClient();
    http.setTimeout(45000);
    http.cache = false;
    http.enableKeepAlive = false;
    http.open('GET', Omadi.DOMAIN_NAME + '/custom_forms/icon/' + type);

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
    
    http.onerror = function(e){
      Ti.API.error("Error downloading icon image for " + type);  
    };
    
    http.send();
};

Omadi.display.getDrivingDirectionsTo = function(addressString){"use strict";
    
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
    
    if(imageFile.exists()){
        return imageFile;
    }
    return null;
    
    return Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'images/icon_default.png');
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
    var http, webview, newWin;
    
    if(Ti.Network.online){
        if (nid > 0 && fid > 0) {
            Omadi.display.loading();
    
            newWin = Titanium.UI.createWindow({
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
    else{
        alert("You are not connected to the Internet, so the file cannot be downloaded.");
    }
};

Omadi.display.displayFullImage = function(imageView) {"use strict";

    var http, db, result;
    
    if (imageView.bigImg !== null || (typeof imageView.filePath !== 'undefined' && imageView.filePath !== null)) {
        Ti.API.debug("Displaying big image");
        
        Omadi.display.loading();
        Omadi.display.showBigImage(imageView);
        Omadi.display.doneLoading();
    }
    else if (imageView.nid > 0 && imageView.fid > 0) {
        
        Omadi.display.loading();
        
        try {
            http = Ti.Network.createHTTPClient();
            http.setTimeout(30000);
            http.open('GET', Omadi.DOMAIN_NAME + '/sync/file/' + imageView.nid + '/' + imageView.fid);

            Omadi.utils.setCookieHeader(http);

            http.onload = function(e) {
                //Ti.API.info('=========== Success ========');
                
                if(this.responseData !== null){
                    
                    imageView.bigImg = this.responseData;
                   
                    Omadi.display.showBigImage(imageView);
                }
                else{
                    alert("There was a problem downloading the photo.");
                }
                
                Omadi.display.doneLoading();
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
    else{
        alert("The photo could not be displayed.");
    }
};

Omadi.display.displayLargeImage = function(imageView, nid, file_id, showInImageView) {"use strict";

    var http;
    
    if(typeof showInImageView === 'undefined'){
        showInImageView = false;
    }

    if (imageView.bigImg !== null) {
        Ti.API.debug("Displaying big image");
        Omadi.display.showBigImage(imageView);
        return;
    }

    if (nid > 0 && file_id > 0) {
        
        if(!showInImageView){
            Omadi.display.loading();
        }
        
        try {
            http = Ti.Network.createHTTPClient();
            http.setTimeout(30000);
            http.open('GET', Omadi.DOMAIN_NAME + '/sync/file/' + nid + '/' + file_id);

            Omadi.utils.setCookieHeader(http);

            http.onload = function(e) {
                //Ti.API.info('=========== Success ========');
                imageView.bigImg = this.responseData;
                
                if(showInImageView){
                    imageView.image = this.responseData;
                }
                else{
                    Omadi.display.showBigImage(imageView);
                    Omadi.display.doneLoading();
                }
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
            height : 'auto',
            opacity : 1.0
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
        navBarHidden: true,
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
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
                imageView.height = null;
                imageView.width = null;
                imageView.isImage = true;
                imageView.thumbnailLoaded = true;
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

// Download Image from the server
Omadi.display.setImageViewVideoThumbnail = function(imageView, nid, file_id, field_name) {"use strict";

    var http, tempImg, url;

    if (nid > 0 && file_id > 0) {
        try {
            http = Ti.Network.createHTTPClient();
            http.setTimeout(30000);
            
            url = Omadi.DOMAIN_NAME + '/sync/video_file/video_thumbnail/' + nid + '/' + file_id + '/' + field_name;
            
            Ti.API.info(url);
            http.open('GET', url);

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
    
    indicator.addEventListener('click', function(e) {
        e.source.hide();
    });
    
    Ti.UI.currentWindow.addEventListener('close', function(){
        if(indicator){
            indicator.hide();
            Ti.UI.currentWindow.remove(indicator);
            indicator = null; 
        }
    });
    
    if(indicator !== null){
        Ti.UI.currentWindow.add(indicator);
    }
};

Omadi.display.doneLoading = function() {"use strict";
    
    if (indicator !== null) {
        indicator.hide();
        Ti.UI.currentWindow.remove(indicator);
        indicator = null;
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
        top : 0, //-1 * Ti.Platform.displayCaps.platformHeight * 0.14
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

