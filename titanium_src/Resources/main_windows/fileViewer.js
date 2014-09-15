
Ti.include("/lib/functions.js");

/*global Omadi*/

var curWin = Ti.UI.currentWindow;
var wrapper;
var webview;

curWin.setBackgroundColor("#fff");

var Display = require('lib/Display');
Display.setCurrentWindow(Ti.UI.currentWindow, 'fileViewer');

var Utils = require('lib/Utils');

function addIOSToolbar(){"use strict";
    var backButton, space, aboutLabel, toolbar;
    
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
            title : curWin.title,
            color : '#fff',
            ellipsize : true,
            wordwrap : false,
            width : Ti.UI.FILL,
            style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
        });
    
        // create and add toolbar
        toolbar = Titanium.UI.iOS.createToolbar({
            items : [backButton, space, aboutLabel, space],
            borderTop : false,
            borderBottom : false,
            height: Ti.UI.SIZE,
            width: '100%'
        });
        
        wrapper.add(toolbar);
    }
}

function openAndroidFile(filePath, mimeType){"use strict";
    try{
        var intent = Ti.Android.createIntent({
            action: Ti.Android.ACTION_VIEW,
            type: mimeType,
            data: filePath
        });
        try {
            Ti.Android.currentActivity.startActivity(intent);
        } 
        catch(e) {
            Ti.API.debug(e);
            alert('No apps are installed to open the file!');
        }
    }
    catch(ex){
        Utils.sendErrorReport("exception in openandroid file: " + ex);
    }
}

function deleteAndroidFile(filePath){"use strict";
    try{
        var file = Ti.Filesystem.getFile(filePath);
        
        if(file.isFile()){
            Omadi.display.loading("Deleting...");
            file.deleteFile();
            Omadi.display.doneLoading();
        }
    }
    catch(ex){
        Utils.sendErrorReport("exception in delete android file: " + ex);
    }
}

function cookieIsSet(webview) {"use strict";
	var cookies = webview.evalJS('document.cookie;');
	return cookies.indexOf('SSESS') != -1 || cookies.indexOf('NREUM') != -1;
}

(function(){"use strict";
    var http, viewType, dialog, contentType, url;
    
    curWin.addEventListener("android:back", function(){
        curWin.close(); 
    });
    
    url = Ti.App.DOMAIN_NAME + '/sync/file/' + curWin.nid + '/' + curWin.fid;
    
    wrapper = Ti.UI.createScrollView({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        layout: 'vertical'
    });
    
    if(Ti.App.isIOS7){
        wrapper.top = 20;
    }
    
    Omadi.display.loading("Downloading...");
    
    viewType = Omadi.display.getFileViewType(curWin.title.toString());
    
    addIOSToolbar();
    
    if(viewType === 'text'){
        // Open a label view
        
        try {
            http = Ti.Network.createHTTPClient({
                enableKeepAlive: false,
                validatesSecureCertificate: false
            });
            http.setTimeout(30000);
            http.open('GET', url);
    
            Omadi.utils.setCookieHeader(http);
    
            http.onload = function(e) {
                
                var scrollView = Ti.UI.createScrollView({
                   top: 0,
                   bottom: 0,
                   left: 0,
                   right: 0,
                   layout: 'vertical'
                });
                
                var labelView = Ti.UI.createLabel({
                    text: this.responseData,
                    width: '96%',
                    wordWrap: true,
                    ellipsize: false ,
                    textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
                    font: {
                        fontSize: 16
                    },
                    color: '#000'
                });
                
                scrollView.add(labelView);
                wrapper.add(scrollView);
                 
                Omadi.display.doneLoading();
            };
    
            http.onerror = function(e) {
                Ti.API.error("Error in download File 1: " + e);
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
    else if (Ti.App.isAndroid && viewType === 'download') {
        if (Ti.Filesystem.isExternalStoragePresent()) {
            
            try {
                http = Ti.Network.createHTTPClient({
                    enableKeepAlive: false,
                    validatesSecureCertificate: false
                });
                http.setTimeout(30000);
                http.open('GET', url);
        
                Omadi.utils.setCookieHeader(http);
        
                http.onload = function(e) {
                    var filename, fileDir, fileFile, openFileButton, nativePath, contentType, deleteFileButton;
                    
                    filename = curWin.title;
                    contentType = this.getResponseHeader('Content-Type');

                    fileDir = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, 'downloads');
                    if (! fileDir.exists()) {
                        fileDir.createDirectory();
                    }
        
                    // .resolve() provides the resolved native path for the directory.
                    fileFile = Ti.Filesystem.getFile(fileDir.resolve(), filename);
                    nativePath = fileFile.resolve();
                    
                    Omadi.display.doneLoading();
                    
                    Ti.API.info("fileFile path is: " + nativePath);

                    if (fileFile.write(this.responseData)) {
                        
                        wrapper.setBackgroundColor('#eee');
                        
                        wrapper.add(Ti.UI.createLabel({
                            text: curWin.title,
                            font: {
                                fontWeight: 'bold',
                                fontSize: 20
                            },
                            color: '#fff',
                            width: '100%',
                            height: Ti.UI.SIZE,
                            backgroundColor: '#666',
                            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
                        }));
                        
                        wrapper.add(Ti.UI.createLabel({
                            text: nativePath,
                            color: "#666",
                            font: {
                                fontSize: 16,
                                fontWeight: 'bold'
                            },
                            wordWrap: true,
                            ellipsize: false,
                            width: '90%',
                            top: 10,
                            textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT
                        }));
                        
                        openFileButton = Ti.UI.createButton({
                            title: 'Open File Now',
                            color: '#fff',
                            height: 45,
                            width: Ti.UI.SIZE,
                            top: 20,
                            backgroundGradient : {
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
                                    color : '#777',
                                    offset : 0.0
                                }, {
                                    color : '#999',
                                    offset : 0.3
                                }, {
                                    color : '#555',
                                    offset : 1.0
                                }]
                            },
                            font : {
                                fontWeight : 'bold',
                                fontSize : 20
                            },
                            borderRadius : 10
                        });
                        
                        openFileButton.addEventListener('click', function(){
                            openAndroidFile(nativePath, contentType);
                        });
                        
                        wrapper.add(openFileButton);
                        
                        wrapper.add(Ti.UI.createLabel({
                            text: "If you don't need to view this file again, you can save space on your device by deleting it after you're done with it.",
                            color: "#666",
                            font: {
                                fontSize: 16
                            },
                            wordWrap: true,
                            width: '90%',
                            top: 25,
                            textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT
                        }));
                        
                        deleteFileButton = Ti.UI.createButton({
                            title: 'Delete File From This Device',
                            color: '#fff',
                            height: 45,
                            width: Ti.UI.SIZE,
                            top: 20,
                            bottom: 20,
                            backgroundGradient : {
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
                                    color : '#777',
                                    offset : 0.0
                                }, {
                                    color : '#999',
                                    offset : 0.3
                                }, {
                                    color : '#555',
                                    offset : 1.0
                                }]
                            },
                            font : {
                                fontWeight : 'bold',
                                fontSize : 20
                            },
                            borderRadius : 10
                        });
                        
                        deleteFileButton.addEventListener('click', function(){
                            deleteAndroidFile(nativePath);
                            curWin.close();
                        });
                        
                        wrapper.add(deleteFileButton);
                    }
                    else {
                        
                        dialog = Titanium.UI.createAlertDialog({
                            title : 'Problem Saving File',
                            message : "There was a problem saving the downloaded file. Please make sure you have a good Internet connection and you have enough storage space on your SD card.",
                            buttonNames : ['OK']
                        });
                        dialog.show();
                    }
                    
                    // dispose of file handles
                    fileFile = null;
                    fileDir = null;
                };
        
                http.onerror = function(e) {
                    Ti.API.error("Error in download File 2: " + JSON.stringify(e));
                    Omadi.display.doneLoading();
                    alert("There was an error retrieving the file.");
                };
        
                http.send();
            }
            catch(exc) {
                Omadi.display.doneLoading();
                alert("There was an error retrieving the file.");
                Ti.API.info("==== ERROR ===" + exc);
            }
        }
        else {
            Omadi.display.doneLoading();
            
            dialog = Titanium.UI.createAlertDialog({
                title : 'Insert SD Card',
                message : "You must insert an SD card to download this file.",
                buttonNames : ['OK']
            });

            dialog.addEventListener('click', function(e) {
                Ti.UI.currentWindow.close();
            });
            dialog.show();
        }
    }
    else if(viewType === 'image' || viewType === 'iOSWebview' || viewType === 'html'){
        // Open a web browser view
        webview = Titanium.UI.createWebView({
            height: Ti.UI.FILL,
            width: '100%',
            url: url
        });
        
        var cookie = Omadi.utils.getCookie();
        Utils.setCookie(cookie);
        
        webview.addEventListener("load", function(e){
            Omadi.display.doneLoading();
            if (!cookieIsSet(webview)) {
                alert('Login credentials not found. Please login to view this file.');
                Omadi.display.openWebView(curWin.nid);
            }
        });
        
        webview.addEventListener('error', function(e){
            alert("There was a problem loading the file.");
            Omadi.display.doneLoading();
        });
        
        wrapper.add(webview);
    }
    else{
        Omadi.display.doneLoading(); 
        
        dialog = Ti.UI.createAlertDialog({
            message: "The file cannot be opened on this device.",
            buttonNames: ['OK'] 
        });
        
        dialog.addEventListener("click", function(){
            curWin.close();
        });
        
        dialog.show();
    }
    
    curWin.add(wrapper);
    
}());
