
Ti.include("/lib/functions.js");

/*global Omadi*/

var curWin = Ti.UI.currentWindow;
curWin.setLayout('vertical');

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
        curWin.add(toolbar);
    }
}

(function(){"use strict";
    var webview;
    
    Omadi.display.loading("Downloading...");
    
    webview = Titanium.UI.createWebView({
        url: Omadi.DOMAIN_NAME + '/sync/file/' + curWin.nid + '/' + curWin.fid,
        height: Ti.UI.FILL,
        width: '100%'
    });
    
    webview.addEventListener("load", function(e){
       Omadi.display.doneLoading(); 
    });
    
    addIOSToolbar();
    
    curWin.add(webview);
    
}());
