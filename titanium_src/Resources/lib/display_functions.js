Omadi.display = Omadi.display || {};

Omadi.display.showBigImage = function(imageView) {
	"use strict";
	
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
	
	if(fullImage !== null){
		
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

Omadi.display.newAppAvailable = function(message){"use strict";
    var dialog, now = Omadi.utils.getUTCTimestamp();
    
    if(now - Ti.App.Properties.getDouble("lastAppUpdateNotification", 0) > 3600){
        dialog = Ti.UI.createAlertDialog({
            message : message,
            ok : 'OK',
            title : 'Updated App'
        }).show();
        
        Ti.App.Properties.setDouble("lastAppUpdateNotification", now);
    }
};

Omadi.display.openListWindow = function(type, show_plus, filterValues, nestedWindows, showFinalResults){"use strict";
    var listWindow = Titanium.UI.createWindow({
        navBarHidden : true,
        url : 'objects.js',
        type : type,
        show_plus : show_plus,
        filterValues: filterValues,
        nestedWindows: nestedWindows,
        showFinalResults: showFinalResults
    });
    
    Omadi.display.loading();
    listWindow.addEventListener('open', Omadi.display.doneLoading);

    listWindow.open();
    
    return listWindow;
};

Omadi.display.openAboutWindow = function(){"use strict";
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

Omadi.display.openDraftsWindow = function(){"use strict";
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

Omadi.display.openViewWindow = function(type, nid){"use strict";
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

Omadi.display.openFormWindow = function(type, nid, form_part){"use strict";

    var formWindow = Ti.UI.createWindow({
        navBarHidden: true,
        url: '/main_windows/form.js',
        type: type,
        nid: nid,
        form_part: form_part
    });
    
    formWindow.addEventListener('open', Omadi.display.doneLoading);
    Omadi.display.loading();
        
    formWindow.open();
    
    return formWindow;
};

Omadi.display.openMainMenuWindow = function(){"use strict";
    var mainMenuWindow = Titanium.UI.createWindow({
        url : '/main_windows/mainMenu.js',
        navBarHidden : true
    });
    
    mainMenuWindow.addEventListener('open', Omadi.display.doneLoading);
    Omadi.display.loading();
    
    mainMenuWindow.open();  
    return mainMenuWindow;
};


Omadi.display.displayLargeImage = function(imageView, nid, file_id) {
	"use strict";
	
	var http, loading;
	
	if (imageView.bigImg !== null) {
        Omadi.display.showBigImage(imageView);
        return;
    }

	if(nid > 0 && file_id > 0){
		loading = Ti.UI.createActivityIndicator();
		loading.font = {
			fontFamily : 'Helvetica Neue',
			fontSize : 15,
			fontWeight : 'bold'
		};
		loading.color = 'white';
		loading.message = 'Loading...';
		loading.show();
		
		try {
			http = Ti.Network.createHTTPClient();
			http.setTimeout(30000);
			http.open('GET', Omadi.DOMAIN_NAME + '/sync/file/' + nid + '/' + file_id);
			
			Omadi.utils.setCookieHeader(http);
			
			http.onload = function(e) {
				//Ti.API.info('=========== Success ========');
				imageView.bigImg = this.responseData;
				Omadi.display.showBigImage(imageView);
				loading.hide();
				imageView.fullImageLoaded = true;
			};
	
			http.onerror = function(e) {
				Ti.API.error("Error in download Image 2");
				loading.hide();
				alert("There was an error retrieving the file.");
			};
			
			http.send();
		} 
		catch(e) {
			loading.hide();
			alert("There was an error retrieving the file.");
			Ti.API.info("==== ERROR ===" + e);
		}
	}
};


Omadi.display.getImageViewFromData = function(blobImage, maxWidth, maxHeight) {
	"use strict";
	var imageView, multiple;
	try{
		imageView = Titanium.UI.createImageView({
			image : blobImage,
			width : 'auto',
			height : 'auto'
		});
		
		blobImage = imageView.toBlob();

		if(blobImage.height / blobImage.width > maxHeight / maxWidth) {
			multiple = blobImage.height / maxHeight;
		} 
		else {
			multiple = blobImage.width / maxWidth;
		}

		if(multiple >= 1) {
			imageView.height = parseInt(blobImage.height / multiple, 10);
			imageView.width = parseInt(blobImage.width / multiple, 10);
			imageView.image = imageView.toImage();
		} 
		
		return imageView;
	}
	catch(evt){
		Ti.API.error("Error in reduce Image Size");
	}
	
};

// Download Image from the server
Omadi.display.setImageViewThumbnail = function(imageView, nid, file_id) {
	"use strict";
	
	var http, tempImg;
	
	if(nid > 0 && file_id > 0){
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


Omadi.display.removeNotifications = function() { "use strict";
    
    if(Ti.App.isAndroid){
        try{
            Ti.Android.NotificationManager.cancel(42);
        }
        catch(nothing){
            
        }
    }
};


var loadingIndicatorWindow, loadingActivityIndicator, 
indicator = null;

Omadi.display.hideLoadingIndicator = function() { "use strict";
    Ti.API.info("hiding indicator");
    
    //if(typeof loadingActivityIndicator !== 'undefined'){
        loadingActivityIndicator.hide();
        loadingIndicatorWindow.close();
   // }
};

Omadi.display.loading = function(message){"use strict";
    
    if(typeof message === 'undefined'){
        message = 'Loading...';
    }
    
    // if(Ti.App.isAndroid){
        // indicator = Titanium.UI.createActivityIndicator({
            // height : Ti.UI.SIZE,
            // message : message,
            // width : Ti.UI.SIZE,
            // color : '#fff'
        // });
//         
        // indicator.show();
//         
        // Ti.App.addEventListener('displayDoneLoading', function(){
            // indicator.hide();
        // });
    // }
    // else{
        indicator = Ti.UI.createLabel({
           top: 0,
           bottom: 0,
           left: 0,
           right: 0,
           opacity: 0.85,
           backgroundColor: '#fff',
           zIndex: 1000,
           color: '#666',
           text: message,
           font: {
               fontWeight: 'bold',
               fontSize: 35
           },
           textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        
        Ti.UI.currentWindow.add(indicator);
        
        indicator.addEventListener('longpress', function(e){
           //e.source.hide(); 
        });
    //}
};

Omadi.display.doneLoading = function(){"use strict";
    
    if(indicator !== null){
        indicator.hide();
        
        //Ti.App.fireEvent("displayDoneLoading");
    }
};

Omadi.display.showLoadingIndicator = function(show, timeout) {"use strict";
   
    var indView, message;
    
    if(typeof timeout === 'undefined'){
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
    
    setTimeout(function(){
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
        top : 0,//-1 * Ti.Platform.displayCaps.platformHeight * 0.14
        zIndex: 100
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
        this.current ++;

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

