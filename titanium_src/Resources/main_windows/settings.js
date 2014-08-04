Ti.include('/lib/functions.js');

/*jslint eqeq:true, regexp: true*/

/*global  Omadi*/

var scrollView, wrapperView;

function errorCameraPhoto(){"use strict";
    alert("Camera action error");
}

function addPhotoWidgetOptions(){"use strict";
    var photoOptionLabel, currentPhotoOption, photoOptionButton,photoOptions, photoTakeOption, 
        photoChooseOption, currentPhotoOptionString, currentPhotoOptionIndex, chooseSettingsView, 
        deletePhotoOnUploadLabel, deletePhotoOnUploadButton, currentDeleteOption, 
        currentDeleteOptionString, currentDeleteIndex;
        
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
                            var nativeDir, width, height;
                            
                            if(typeof e.media.nativePath !== 'undefined'){
                            
                                Omadi.utils.setPhotoWidget('choose');
                                currentPhotoOptionIndex = 1;
                                
                                nativeDir = e.media.nativePath.replace(/(.+)\/[^\/]+$/, "$1");
                                
                                Ti.App.Properties.setString("photoCameraPath", nativeDir);
                                
                                width = e.media.width;
                                height = e.media.height;
                                
                                if(width > 1280 || height > 1280){
                                
                                    dialog = Ti.UI.createAlertDialog({
                                       title: 'WHOA THERE!',
                                       buttonNames: ['I Understand'],
                                       message: 'Your camera app resolution is set to ' + width + 'x' + height + ', and that is a little too high. \n\nPlease set your camera resolution to a lower setting (ie. 1280x720). \n\nSide effects of very high resolution:\n1. Thumbnails may not show up.\n2. Up to 10x more bandwidth may be used on your data plan.\n3. As much as 10x more time is required to upload photos.\n4. More memory will be used on your phone, so a crash is more likely.'                                
                                    });
                                    dialog.show();
                                }
                                else{
                                    dialog = Ti.UI.createAlertDialog({
                                       title: 'Photo Widget Changed',
                                       buttonNames: ['Ok'],
                                       message: 'You should now take all photos using your regular photo app.'                                
                                    });
                                    dialog.show();
                                }
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
    
    scrollView.add(photoOptionLabel);
    scrollView.add(photoOptionButton);
    scrollView.add(chooseSettingsView);
}

function addiOSToolbarSettings() {"use strict";
    var backButton, space, label, items, toolbar;

    backButton = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });

    backButton.addEventListener('click', function() {
        Ti.UI.currentWindow.close();
    });

    space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });

    label = Titanium.UI.createLabel({
        text : 'Settings',
        color : '#333',
        ellipsize : true,
        wordwrap : false,
        width : Ti.UI.SIZE,
        focusable : false,
        touchEnabled : false,
        style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
    });

    items = [backButton, space, label, space];

    // create and add toolbar
    toolbar = Ti.UI.iOS.createToolbar({
        items : items,
        top : 0,
        borderTop : false,
        borderBottom : false,
        height : Ti.UI.SIZE
    });

    scrollView.add(toolbar);
}

function addVideoSettings(){"use strict";
    var radio, wrapper, label;
    
    radio = Ti.UI.createSwitch({
        value: Ti.App.Properties.getBool('allowVideoMobileNetwork', false),
        top: 5,
        bottom: 5,
        height: Ti.UI.SIZE,
        left: '2%'
    });
    
    radio.addEventListener('change', function(e){
        Ti.App.Properties.setBool('allowVideoMobileNetwork', e.value);
    });
    
    label = Ti.UI.createLabel({
        text: "Allow video uploads on mobile network",
        color: '#999',
        font: {
            fontSize: 15,
            fontWeight: 'bold'
        },
        left: '2%',
        width: '75%'
    });
    
    wrapper = Ti.UI.createView({
        height: Ti.UI.SIZE,
        width: Ti.UI.FILL,
        layout: 'horizontal',
        top: 10
    }); 
    
    wrapper.add(radio);
    wrapper.add(label);
    
    scrollView.add(wrapper);
}

function addPhotoThumbnailOptions(){"use strict";
    var radio, wrapper, label;
    
    radio = Ti.UI.createSwitch({
        value: Ti.App.Properties.getBool('omadi:image:skipThumbnail', false),
        top: 5,
        bottom: 5,
        height: Ti.UI.SIZE,
        left: '2%'
    });
    
    radio.addEventListener('change', function(e){
        Ti.App.Properties.setBool('omadi:image:skipThumbnail', e.value);
    });
    
    label = Ti.UI.createLabel({
        text: "Speed up photos or solve memory problems by not loading thumbnails on forms",
        color: '#999',
        font: {
            fontSize: 15,
            fontWeight: 'bold'
        },
        left: '2%',
        width: '75%'
    });
    
    wrapper = Ti.UI.createView({
        height: Ti.UI.SIZE,
        width: Ti.UI.FILL,
        layout: 'horizontal',
        top: 10
    }); 
    
    wrapper.add(radio);
    wrapper.add(label);
    
    scrollView.add(wrapper);
}

(function(){'use strict';
    
    var topBar;
    
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
    
    scrollView = Ti.UI.createScrollView({
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
