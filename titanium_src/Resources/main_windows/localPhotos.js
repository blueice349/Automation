
/*jslint eqeq:true, plusplus: true*/ 
/*global Omadi */

var Display = require('lib/Display');
Display.setCurrentWindow(Ti.UI.currentWindow, 'localPhotos');

Ti.include('/lib/functions.js');

var Utils = require('lib/Utils');

var currentWinWrapper;
var buttons;
var viewButton;
var emailButton;
var deleteButton;
var uploadButton;
var gallery;
var galleryWrapper;
var Gallery = {};

Gallery.addIOSToolbar = function() {"use strict";
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

    label = Ti.UI.createButton({
        title : 'Photos Not Uploaded',
        color : '#fff',
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

    currentWinWrapper.add(toolbar);
};

Gallery.savedToPhotoGallery = function(e){"use strict";
    var dialog = Ti.UI.createAlertDialog({
       title: "Photo Saved Successfully",
       message: 'The photo was saved to your photo gallery.',
       buttonNames: ['OK'] 
    });
    dialog.show();
};

Gallery.failedSaveToPhotoGallery = function(e){"use strict";
    var dialog = Ti.UI.createAlertDialog({
       title: "Error Saving Photo",
       message: 'An error occurred while saving. Please try again.',
       buttonNames: ['OK'] 
    });
    dialog.show();
};

Gallery.deleteOptionSelected = function(e){"use strict";
    try{
        if(e.index === 1){
            
            Omadi.display.loading();
            Omadi.data.deletePhotoUpload(e.source.imageView.photoId, true);
            
            Gallery.remove(e.source.imageView);
            Omadi.display.doneLoading();
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in deleteoption selected in gallery: " + ex);
    }
};

Gallery.emailComplete = function(e){"use strict";
                            
    if(e.success == true){
        
        // Only ask if the result is sent.  Do not ask if cancelled or saved the email
        // Android doesn't give reliable return codes in the result. 
        // Currently, pressing the back button will return a SENT result, so do not ask to delete on Android right now
        if(e.result == e.source.SENT && Ti.App.isIOS){
            // Ask if the successfully emailed photo should be deleted
            var alertDialog;
            
            alertDialog = Ti.UI.createAlertDialog({
                buttonNames: ['Keep', 'Delete'],
                title: 'Your Email was Sent',
                message: 'Do you want to delete the photo from this device?',
                imageView: e.source.imageView
            });
            
            alertDialog.addEventListener('click', Gallery.deleteOptionSelected);
            
            alertDialog.show();
         }
    }
    else if(e.success == false){
        alert("Your email failed to send. Details: " + e.error);
    }
};

Gallery.confirmDeleteOptionSelected = function(e){"use strict";
    try{
        if(e.index === 0){
            
            Omadi.display.loading();
            
            Omadi.data.deletePhotoUpload(e.source.imageView.photoId, true);
            
            Gallery.remove(e.source.imageView);
            
            Omadi.display.doneLoading();
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception confirming delete option: " + ex);
    }
};

Gallery.imageOptionClicked = function(e){"use strict";
    var alertDialog, emailDialog, imageFile;
    try{
        if(e.index >= 0){
            
            if(e.source.options[e.index] == "View Photo"){
                // View photo
                Omadi.display.displayFullImage(e.source.imageView);
            }
            else if(e.source.options[e.index] == "Email Photo"){
                // Email Photo
    
                imageFile = Ti.Filesystem.getFile(e.source.imageView.filePath);
                if(imageFile.exists()){
                    
                    emailDialog = Ti.UI.createEmailDialog({
                        subject: "Photo",
                        messageBody: "See the attached photo",
                        imageView: e.source.imageView
                    });
                    
                    if(emailDialog.isSupported()){
                        
                        if(Ti.Network.online){
                            
                            emailDialog.addAttachment(imageFile);
                            emailDialog.addEventListener('complete', Gallery.emailComplete);
                            emailDialog.open();
                        }
                        else{
                            alert("You do not have an Internet connection.");
                        }
                    }
                    else{
                        alert("Email support is not enabled for this device.");
                    }
                }
                else{
                    alert("The photo could not be found probably because it was just uploaded.");
                }
            }
            else if(e.source.options[e.index] == "Delete Photo"){
                
                // Delete Photo
                alertDialog = Ti.UI.createAlertDialog({
                    title: 'Really Delete Photo?',
                    buttonNames: ['Delete', 'Cancel'],
                    cancel: 1,
                    imageView: e.source.imageView
                });
                
                alertDialog.addEventListener('click', Gallery.confirmDeleteOptionSelected);
                alertDialog.show();
            }
            else if(e.source.options[e.index] == "Save to Photo Gallery"){
                
                // Save to Photo Gallery
                imageFile = Ti.Filesystem.getFile(e.source.imageView.filePath);
                if(imageFile.exists()){
                    Ti.Media.saveToPhotoGallery(imageFile, {
                        success: Gallery.savedToPhotoGallery,
                        error: Gallery.failedSaveToPhotoGallery
                    });
                }
                else{
                    alert("The photo could not be found probably because it was just uploaded.");
                }
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in imageoption clicked in local photos: " + ex);
    }
};

Gallery.imageClicked = function(e){"use strict";

    var dialog, options;
    try{
        options = [];
        options.push('View Photo');
        options.push('Email Photo');
        
        if(Ti.App.isIOS){
            options.push("Save to Photo Gallery");
        }
        
        options.push('Delete Photo');
        options.push('Cancel');
        
        
        dialog = Ti.UI.createOptionDialog({
            title: 'Photo Options',
            options: options,
            imageView: e.source,
            cancel: (options.length - 1)
        });
        
        dialog.addEventListener('click', Gallery.imageOptionClicked);
        
        dialog.show();
    }
    catch(ex){
        Utils.sendErrorReport("Exception with imageClicked in local photos: " + ex);
    }
};

Gallery.remove = function(imageView){"use strict";

    gallery.remove(imageView.parentItem); 
    imageView.parentItem = null;
};

Gallery.update = function(){"use strict";
    
    var recentFiles, images, item, imageView, modified, items, tempFile, thumbFile, 
        imageFile, printedCurrentBar, printedDraftBar, printedNeverBar, file;
    
    items = [];
    recentFiles = [];
    
    printedCurrentBar = false;
    printedDraftBar = false;
    printedNeverBar = false;
    
    images = Omadi.data.getPhotosNotUploaded();
    
    Ti.API.debug("num files: " + images.length);
    
    gallery = Ti.UI.createView({
        width: '100%',
        height: Ti.UI.SIZE,
        layout: 'horizontal'
    });
    
    galleryWrapper.add(gallery);
    
    var i;
    for(i = 0; i < images.length; i++){
        tempFile = Ti.Filesystem.getFile(images[i].filePath);
        thumbFile = Ti.Filesystem.getFile(images[i].thumbPath || images[i].filePath);
        
        if(tempFile.exists()){
            modified = tempFile.modificationTimestamp();
           
            tempFile.modifiedTimestamp = modified;
            recentFiles.push({
                file: tempFile,
                thumbFile: thumbFile,
                degrees: images[i].degrees,
                filePath: images[i].filePath,
                thumbPath: images[i].thumbPath,
                photoId: images[i].photoId,
                nid: images[i].nid
            });
        }
    }
    if(recentFiles.length > 0){
        recentFiles = recentFiles.sort(Omadi.utils.fileSortByModified);
        
        for(i = 0; i < recentFiles.length; i++){

            
            file = recentFiles[i];
            
            if(file.nid > 0){
                
                if(!printedCurrentBar){
                
                    gallery.add(Ti.UI.createLabel({
                        text: 'Photos Currently Uploading',
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
                                color : '#2BC4F3',
                                offset : 0.0
                            }, {
                                color : '#00AEEE',
                                offset : 0.33
                            }, {
                                color : '#0095DA',
                                offset : 1.0
                            }]
                        },
                        color: '#fff',
                        height: 35,
                        width: '100%',
                        font: {
                            fontSize: 16,
                            fontWeight: 'bold'
                        },
                        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
                    }));
                    printedCurrentBar = true;
                }
            }
            else if(file.nid == -1000000){
                if(!printedNeverBar){
                    gallery.add(Ti.UI.createLabel({
                        text: 'Photos Never Going to Upload',
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
                                color : '#F37E5F',
                                offset : 0.0
                            }, {
                                color : '#EC1C24',
                                offset : 0.33
                            }, {
                                color : '#D12128',
                                offset : 1.0
                            }]
                        },
                        color: '#fff',
                        height: 35,
                        width: '100%',
                        font: {
                            fontSize: 16,
                            fontWeight: 'bold'
                        },
                        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
                    }));
                    printedNeverBar = true;
                }
            }
            else{
                if(!printedDraftBar){
                    gallery.add(Ti.UI.createLabel({
                        text: 'Photos in Drafts',
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
                                color : '#2BC4F3',
                                offset : 0.0
                            }, {
                                color : '#00AEEE',
                                offset : 0.33
                            }, {
                                color : '#0095DA',
                                offset : 1.0
                            }]
                        },
                        color: '#fff',
                        height: 35,
                        width: '100%',
                        font: {
                            fontSize: 16,
                            fontWeight: 'bold'
                        },
                        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
                    }));
                    printedDraftBar = true;
                }
            }
            
            item = Ti.UI.createView({
                height: 120,
                width: 120,
                isChecked: false,
                photoFile: file.file,
                left: 5,
                top: 5,
                borderWidth: 0,
                borderColor: '#ccc',
                backgroundColor: '#fff',
                photoId: file.photoId
            });
            
            imageFile = file.thumbFile;
            if(!imageFile.exists() || !imageFile.isFile()){
                imageFile = file.file;
            }
            
            imageView = Ti.UI.createImageView({
                image: imageFile,
                height: 100,
                width: 100,
                top: 10,
                left: 10,
                autorotate: true,
                touchEnabled: true,
                borderWidth: 1,
                borderColor: '#666',
                filePath: file.filePath,
                photoId: file.photoId,
                bigImg: null,
                parentItem: item
            });
            
            item.add(imageView);
            
            imageView.addEventListener('click', Gallery.imageClicked);
            
            gallery.add(item);
        }
    }
    else{
        item = Ti.UI.createLabel({
            height: 50,
            width: '100%',
            isChecked: false,
            text: '- All photos have been uploaded -',
            font: {
                fontSize: 14
            },
            color: '#999',
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        
        gallery.add(item);
    }
};

(function(){"use strict";

    var tempFile, now,
        earliestTimestamp, items, modified, image, checkbox, refreshButton, 
        topBar, titleLabel, buttons, useButton, cancelButton, transform, 
        rotateDegrees;
    
    Ti.UI.currentWindow.setBackgroundColor('#eee');
        
    currentWinWrapper = Ti.UI.createView({
        top : Ti.App.isIOS7 ? 20 : 0,
        left : 0,
        bottom : 0,
        right : 0
    });
    
    galleryWrapper = Ti.UI.createScrollView({
        top: 40,
        bottom: 0,
        left: 0,
        right: 0,
        horizontalWrap: true,
        contentHeight: 'auto',
        width: '100%',
        scrollType: 'vertical',
        layout: 'vertical'
    });
    
    Gallery.update();
    
    if(Ti.App.isAndroid){
        topBar = Ti.UI.createLabel({
           top: 0,
           backgroundColor: '#666',
           height: 40,
           width: '100%',
           text: 'Photos Not Uploaded',
           color: '#fff',
           font: {
                fontSize: 15,
                fontWeight: 'bold'
           },
           textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        currentWinWrapper.add(topBar);
    }
    else{
        Gallery.addIOSToolbar();
        currentWinWrapper.top = 20;
    }
    
    currentWinWrapper.add(galleryWrapper);
    
    Ti.UI.currentWindow.setBackgroundColor("#fff");
    Ti.UI.currentWindow.add(currentWinWrapper);
    
    Ti.App.addEventListener('photoUploaded', function(e){
        var photoId, i;
        
        if(typeof e.id !== 'undefined' && gallery.children){
            photoId = e.id;
            
            for(i = 0; i < gallery.children.length; i ++){
                if(typeof gallery.children[i].photoId !== 'undefined'){
                    if(gallery.children[i].photoId == photoId){
                        gallery.remove(gallery.children[i]);
                        gallery.children[i] = null;
                        break;
                    }
                }
            }
        }
    });
    
}());

