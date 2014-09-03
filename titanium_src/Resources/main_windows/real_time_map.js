/*global addPhotoThumbnailOptions,addPhotoWidgetOptions,addiOSToolbarSettings,addVideoSettings */
Ti.include('/lib/functions.js');

var wrapperView;
var Map = require('ti.map');
var mapView = null;

(function(){'use strict';
    
    var topBar;
    
    mapView = Map.createView({mapType:Map.NORMAL_TYPE});
    
    Ti.UI.currentWindow.backgroundColor = '#eee';
    
    wrapperView = Ti.UI.createView({
       layout: 'vertical',
       bottom: 0,
       top: 0,
       right: 0,
       left: 0 
    });
    
    if(Ti.App.isIOS7){
        wrapperView.top = 20;
    }
    
    Ti.UI.currentWindow.add(wrapperView);
    
    Ti.App.addEventListener('loggingOut', function(){
        Ti.UI.currentWindow.close();
    });
    
    var scrollView = Ti.UI.createScrollView({
        scrollType: 'vertical',
        height: Ti.UI.FILL,
        width: '100%',
        layout: 'vertical'
    });
    
    wrapperView.add(scrollView);
    
    if(Ti.App.isAndroid){
        topBar = Ti.UI.createLabel({
           backgroundColor: '#666',
           color: '#fff',
           font: {
               fontSize: 14,
               fontWeight: 'bold'
           },
           text: 'Settings',
           left: 0,
           right: 0,
           textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        
        scrollView.add(topBar);
        addPhotoThumbnailOptions();
        addPhotoWidgetOptions();
    }
    else{
        addiOSToolbarSettings();
        addVideoSettings();
    }
    
}());
