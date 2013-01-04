
Ti.include("/lib/functions.js");

/*global Omadi*/

var curWin = Ti.UI.currentWindow;
var wrapper;
var webview;

curWin.setBackgroundColor("#fff");
curWin.setOrientationModes([Titanium.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]);

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

(function(){"use strict";
    var http;
    
    curWin.addEventListener("android:back", function(){
        curWin.close(); 
    });
    
    wrapper = Ti.UI.createView({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        layout: 'vertical'
    });
    
    Omadi.display.loading("Downloading...");
    
    webview = Titanium.UI.createWebView({
        height: Ti.UI.FILL,
        width: '100%',
        url: Omadi.DOMAIN_NAME + '/sync/file/' + curWin.nid + '/' + curWin.fid
    });
    
    webview.addEventListener("load", function(){
        Omadi.display.doneLoading(); 
    });
    
    webview.addEventListener("beforeload", function(e){
        var cookie = Omadi.utils.getCookie();
        Ti.API.debug(cookie);
        webview.evalJS("document.cookie='" + cookie + "';"); 
    });
    
    
    // try {
        // http = Ti.Network.createHTTPClient();
        // http.setTimeout(30000);
        // http.open('GET', Omadi.DOMAIN_NAME + '/sync/file/' + curWin.nid + '/' + curWin.fid);
// 
        // Omadi.utils.setCookieHeader(http);
// 
        // http.onload = function(e) {
            // Omadi.display.doneLoading();
            // webview.setData(this.responseData);
        // };
// 
        // http.onerror = function(e) {
            // Ti.API.error("Error in download File");
            // Omadi.display.doneLoading();
            // alert("There was an error retrieving the file.");
        // };
// 
        // http.send();
    // }
    // catch(e) {
        // Omadi.display.doneLoading();
        // alert("There was an error retrieving the file.");
        // Ti.API.info("==== ERROR ===" + e);
    // }
    
    addIOSToolbar();
    
    wrapper.add(webview);
    
    curWin.add(wrapper);
    
}());
