/*jslint eqeq:true, plusplus: true*/ 

Ti.include('/lib/functions.js');

var curWin = Ti.UI.currentWindow;
var tabGroup;

function createiOSToolbar(){"use strict";
    var back, space, toolbar, items, titleLabel;
    
    if(Ti.App.isIOS){
        
        back = Ti.UI.createButton({
            title : 'Back',
            style : Ti.UI.iPhone.SystemButtonStyle.BORDERED
        });
        
        back.addEventListener('click', function() {
            curWin.close();
            tabGroup.close();
        });
        
        space = Ti.UI.createButton({
            systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
        });
        
        titleLabel = Ti.UI.createLabel({
            text: 'Recent Items',
            color: '#666',
            font: {
                fontSize: 16,
                fontWeight: 'bold'
            }
        });
        
        items = [back, space, titleLabel, space];
        
        // create and add toolbar
        toolbar = Ti.UI.iOS.createToolbar({
            items: items,
            top: 0,
            borderTop: false,
            borderBottom: false,
            zIndex: 1,
            height: 45
        });
        curWin.add(toolbar);
    }
}

(function(){"use strict";
    var tableView, recentlySavedTab, recentlySavedWindow, recentlyViewedTab, recentlyViewedWindow;
    
    curWin.addEventListener("android:back", function(){
       curWin.close(); 
    });
    
    Ti.App.addEventListener('loggingOut', function(){
        Ti.UI.currentWindow.close();
    });
    
    Ti.App.addEventListener("savedNode", function(){
        if(Ti.App.isAndroid){
            Ti.UI.currentWindow.close();
        }
        else{
            Ti.UI.currentWindow.hide();
            // Close the window after the maximum timeout for a node save
            setTimeout(Ti.UI.currentWindow.close, 65000);
        }
    });
    
    createiOSToolbar();
    
    recentlySavedWindow = Ti.UI.createWindow({
       url: 'recentTable.js',
       orderField: 'changed' 
    });
    
    recentlySavedTab = Ti.UI.createTab({
        window: recentlySavedWindow,
        title: 'Recently Saved',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    });
    
    recentlyViewedWindow = Ti.UI.createWindow({
       url: 'recentTable.js',
       orderField: 'viewed' 
    });
    
    recentlyViewedTab = Ti.UI.createTab({
        //window: recentlySavedWindow,
        title: 'Recently Viewed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    });
    
    tabGroup = Ti.UI.createTabGroup({
       top: 0,
       bottom: 0,
       left: 0,
       right: 0,
       width: '100%'
    });
    
    tabGroup.addTab(recentlySavedTab);
    tabGroup.addTab(recentlyViewedTab);
    
    tabGroup.open();
    //curWin.add(tabGroup);
    
}());


