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

    formWindow.addEventListener('open', Omadi.display.doneLoading);
    Omadi.display.loading();

    formWindow.open();

    return formWindow;
};

Omadi.display.openMainMenuWindow = function() {"use strict";
    var mainMenuWindow = Titanium.UI.createWindow({
        url : '/main_windows/mainMenu.js',
        navBarHidden : true
    });

    mainMenuWindow.addEventListener('open', Omadi.display.doneLoading);
    Omadi.display.loading();

    mainMenuWindow.open();
    return mainMenuWindow;
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

            return '/images/icons/' + type + ".png";

        default:
            return '/images/icons/settings.png';
    }
};

Omadi.display.displayFile = function(nid, fid, title) {"use strict";
    var http, webview, newWin;

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

//
// The progress bar for every install/update
//
// 1st param : sets the first value of the progress bar (instance of this object)
// 2nd param : Maximum the progress bar can reach
//

Omadi.display.ProgressBar = function(current, max) {"use strict";
    /*jslint plusplus: true*/

    this.current = current;
    this.max = max;

    //var progressView, pb_download, pb_install;

    //var a1 = Titanium.UI.createAnimation();
    //a1.top = -1 * Ti.Platform.displayCaps.platformHeight * 0.14;
    //a1.duration = 1000;

    //var a2 = Titanium.UI.createAnimation();
    //a2.top = 0;
    //a2.duration = 1000;

    // black view
    this.progressView = Titanium.UI.createView({
        height : 45,
        width : '100%',
        backgroundColor : '#111',
        opacity : 1,
        top : 0, //-1 * Ti.Platform.displayCaps.platformHeight * 0.14
        zIndex : 100
    });

    Ti.UI.currentWindow.add(this.progressView);

    //If bar is not hiding change this to be incorporated at mainMenu.js
    //loggedView.animate(a1);

    //setTimeout(function() {
    //    indView.animate(a2);
    //}, 500);

    this.pb_download = Titanium.UI.createProgressBar({
        width : "70%",
        min : 0,
        max : 1,
        top : '5%',
        value : 0,
        color : '#fff',
        message : 'Downloading ...',
        style : (Ti.App.isIOS) ? Titanium.UI.iPhone.ProgressBarStyle.PLAIN : ''
    });

    this.pb_install = Titanium.UI.createProgressBar({
        width : "70%",
        min : 0,
        max : 100,
        top : '5%',
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
        //Ti.API.info("Changed max");
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
        //indView.animate(a1);
        //setTimeout(function() {
        //    Ti.UI.currentWindow.remove(indView);
        //    loggedView.animate(a2);
        //}, 700);
    };
};

