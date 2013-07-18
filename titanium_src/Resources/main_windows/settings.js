Ti.include('/lib/functions.js');

/*jslint eqeq:true, regexp: true*/

/*global  Omadi*/

// This window is currently only used on Android


function errorCameraPhoto(){"use strict";
    alert("Camera action error");
}

(function(){
    'use strict';
    
    var curWin, wrapperView, scrollView, photoOptionLabel, currentPhotoOption, photoOptionButton,
        photoOptions, photoTakeOption, photoChooseOption, currentPhotoOptionString, topBar, 
        currentPhotoOptionIndex, chooseSettingsView, deletePhotoOnUploadLabel, deletePhotoOnUploadButton,
        currentDeleteOption, currentDeleteOptionString, currentDeleteIndex;
    
    Ti.UI.currentWindow.backgroundColor = '#eee';
    Ti.UI.currentWindow.setOrientationModes([Titanium.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]);
    
    wrapperView = Ti.UI.createView({
       layout: 'vertical',
       bottom: 0,
       top: 0,
       right: 0,
       left: 0 
    });
    
    Ti.UI.currentWindow.add(wrapperView);
    
    Ti.App.addEventListener('loggingOut', function(){
        Ti.UI.currentWindow.close();
    });
    
    scrollView = Ti.UI.createScrollView({
        scrollType: 'vertical',
        height: Ti.UI.FILL,
        width: '100%',
        layout: 'vertical'
    });
    
    topBar = Ti.UI.createLabel({
       backgroundColor: '#666',
       color: '#fff',
       font: {
           fontSize: 14,
           fontWeight: 'bold'
       },
       text: 'Personal Settings',
       left: 0,
       right: 0,
       textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
    });
    
    wrapperView.add(scrollView);
    
    photoOptionLabel = Ti.UI.createLabel({
       text: 'Photo Widget',
       font: {
           fontSize: 14,
           fontWeight: 'bold'
       },
       color: '#666',
       textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
       top: 10,
       width: '90%',
       left: 15
    });
    
    chooseSettingsView = Ti.UI.createView({
       layout: 'vertical',
       visible: false 
    });
    
    currentPhotoOption = Omadi.utils.getPhotoWidget();
    currentPhotoOptionString = 'Take photos in the app';
    currentPhotoOptionIndex = 0;
    if(currentPhotoOption == 'choose'){
        currentPhotoOptionString = 'Choose photos from gallery';
        currentPhotoOptionIndex = 1;
        chooseSettingsView.setVisible(true);
    }
    
    currentDeleteOption = Ti.App.Properties.getString("deleteOnUpload", 'false');
    currentDeleteOptionString = 'Leave photo on device';
    currentDeleteIndex = 0;
    if(currentDeleteOption == 'true'){
        currentDeleteOptionString = 'Delete photo from device';
        currentDeleteIndex = 1;
    }
    
    
    deletePhotoOnUploadLabel = Ti.UI.createLabel({
        text: 'When Photo Uploads...',
        font: {
            fontSize: 14,
            fontWeight: 'bold'
        },
        color: '#666',
        textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
        top: 10,
        width: '90%',
        left: 15
    });
    
    deletePhotoOnUploadButton = Titanium.UI.createLabel({
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
                color : '#f3f3f3',
                offset : 0.0
            }, {
                color : '#f9f9f9',
                offset : 0.4
            }, {
                color : '#bbb',
                offset : 1.0
            }]
        },
        borderRadius : 10,
        borderColor : '#999',
        borderWidth : 1,
        color : '#000',
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        font : {
            fontSize : 14
        },
        left: '2%',
        height: 35,
        width: '92%',
        
        // Android options
        ellipsize : true,
        wordWrap : false,
        
        text: currentDeleteOptionString
    });
    
    deletePhotoOnUploadButton.addEventListener('click', function(e){
        var dialog;
        
        dialog = Ti.UI.createOptionDialog({
            title: 'When Photo Uploads...',
            options: ['Leave photo on device', 'Delete photo from device', 'Cancel']  ,
            cancel: 2,
            button: e.source,
            selectedIndex: currentDeleteIndex
        });
        dialog.show();
        
        dialog.addEventListener('click', function(ev){
            
            if(ev.index == 0){
                Ti.App.Properties.setString("deleteOnUpload", 'false'); 
                ev.source.button.setText("Leave photo on device");
                currentDeleteIndex = 0;
            }
            else if(ev.index == 1){
                
                Ti.App.Properties.setString("deleteOnUpload", 'true');
                ev.source.button.setText("Delete photo from device");
                currentDeleteIndex = 1;
            }
        });
    });
    
    
    chooseSettingsView.add(deletePhotoOnUploadLabel);
    chooseSettingsView.add(deletePhotoOnUploadButton);
    
    photoOptionButton = Titanium.UI.createLabel({
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
                color : '#f3f3f3',
                offset : 0.0
            }, {
                color : '#f9f9f9',
                offset : 0.4
            }, {
                color : '#bbb',
                offset : 1.0
            }]
        },
        borderRadius : 10,
        borderColor : '#999',
        borderWidth : 1,
        color : '#000',
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        font : {
            fontSize : 14
        },
        left: '2%',
        height: 35,
        width: '92%',
        
        // Android options
        ellipsize : true,
        wordWrap : false,
        
        text: currentPhotoOptionString
    });
    
    photoOptionButton.addEventListener('click', function(e){
        var dialog;
       
        dialog = Ti.UI.createOptionDialog({
            title: 'Photo Widget',
            options: ['Take photos in the app', 'Choose photos from gallery', 'Cancel']  ,
            cancel: 2,
            button: e.source,
            selectedIndex: currentPhotoOptionIndex
        });
        dialog.show();
        
        dialog.addEventListener('click', function(ev){
            var cameraDialog;
            
            if(ev.index == 0){
                Omadi.utils.setPhotoWidget('take'); 
                ev.source.button.setText("Take photos in the app");
                chooseSettingsView.setVisible(false);
                currentPhotoOptionIndex = 0;
            }
            else if(ev.index == 1){
                
                ev.source.button.setText("Choose photos from gallery");
                chooseSettingsView.setVisible(true);
                
                cameraDialog = Ti.UI.createAlertDialog({
                   title: 'Take a Photo',
                   message: 'Please take a photo now so the app will know where to find your photos.',
                   buttonNames: ['Open Camera'] 
                }); 
                
                cameraDialog.addEventListener('click', function(){
                    Ti.Media.showCamera({
                        autohide: true,
                        cancel: function(e){
                            alert("Camera action cancelled. In-app photos will be used.");
                            Omadi.utils.setPhotoWidget('take');
                            ev.source.button.setText("Take photos in the app");
                            chooseSettingsView.setVisible(false);
                            currentPhotoOptionIndex = 0;
                        },
                        error: function(e){
                            alert("A camera error occurred. In-app photos will be used.");
                            Omadi.utils.setPhotoWidget('take');
                            ev.source.button.setText("Take photos in the app");
                            chooseSettingsView.setVisible(false);
                            currentPhotoOptionIndex = 0;
                        },
                        saveToPhotoGallery: true,
                        success: function(e){
                            var nativeDir;
                            
                            if(typeof e.media.nativePath !== 'undefined'){
                            
                                Omadi.utils.setPhotoWidget('choose');
                                currentPhotoOptionIndex = 1;
                                
                                nativeDir = e.media.nativePath.replace(/(.+)\/[^\/]+$/, "$1");
                                
                                Ti.App.Properties.setString("photoCameraPath", nativeDir);
                                
                                dialog = Ti.UI.createAlertDialog({
                                   title: 'READ THIS MESSAGE',
                                   buttonNames: ['I Understand'],
                                   message: 'Be sure to set the resolution of your camera app to one of the lower settings (ie. 800x480).'                                
                                });
                                dialog.show();
                            }
                            else{
                                Omadi.service.sendErrorReport("No native path from camera");
                                alert("There was a problem getting the save location. In-app photos will be used.");
                                Omadi.utils.setPhotoWidget('take');
                                ev.source.button.setText("Take photos in the app");
                                chooseSettingsView.setVisible(false);
                                currentPhotoOptionIndex = 0;
                            }
                        }
                    });
                });
                
                cameraDialog.show();
            }
        });
    });
    
    scrollView.add(topBar);
    scrollView.add(photoOptionLabel);
    scrollView.add(photoOptionButton);
    scrollView.add(chooseSettingsView);
}());
