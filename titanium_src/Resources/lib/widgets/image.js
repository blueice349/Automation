/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Ti.include('/lib/widgets/signature.js');

var IMAGE_MAX_BYTES = 524258;

Omadi.widgets.image = {

    getFieldView : function(node, instance) {"use strict";
        instance.elements = [];

        var settings = instance.settings, fieldView, i, j, element, addAnotherItemButton = null;

        fieldView = Ti.UI.createView({
            width : '100%',
            layout : 'vertical',
            height : Ti.UI.SIZE,
            instance : instance
        });

        instance.fieldView = fieldView;

        fieldView.add(Omadi.widgets.label.getRegularLabelView(instance));
        setConditionallyRequiredLabelForInstance(node, instance);

        instance.numVisibleFields = 1;
        //Ti.API.debug(instance);
        
        if(instance.widget.type == 'omadi_image_signature'){
            element = Omadi.widgets.signature.getNewElement(node, instance);   
        }
        else{
            element = Omadi.widgets.image.getNewElement(node, instance);
        }
        instance.elements.push(element);
        fieldView.add(element);
        fieldView.add(Omadi.widgets.getSpacerView());

        return fieldView;
    },
    getNewElement : function(node, instance) {"use strict";
        var settings, widgetView, dbValue, imageData, i, numImagesShowing = 0, contentWidth, imageNid;

        dbValue = [];
        imageData = [];

        if ( typeof node[instance.field_name] !== 'undefined') {
            if ( typeof node[instance.field_name].dbValues !== 'undefined') {
                dbValue = node[instance.field_name].dbValues;
            }
            if ( typeof node[instance.field_name].imageData !== 'undefined') {
                imageData = node[instance.field_name].imageData;
            }
        }

        settings = instance.settings;
        Ti.API.debug("Creating image field");

        widgetView = Ti.UI.createScrollView({
            width : '96%',
            //***** Don't set contentWidth to anything here.  It is set further down ******/
            //contentWidth : 'auto',
            contentHeight : 100,
            height : 100,
            arrImages : null,
            scrollType : 'horizontal',
            layout : 'horizontal',

            instance : instance
        });
        
        imageNid = Ti.UI.currentWindow.nid;
        if(typeof Ti.UI.currentWindow.origNid !== 'undefined'){
            imageNid = Ti.UI.currentWindow.origNid;
        }

        if (Omadi.utils.isArray(dbValue)) {
            for ( i = 0; i < dbValue.length; i++) {
                if (dbValue[i] > 0) {
                    Ti.API.debug("Adding image to scroll view");
                     
                    widgetView.add(Omadi.widgets.image.getImageView(widgetView, i, imageNid, dbValue[i]));
                }
            }
            numImagesShowing = dbValue.length;
        }

        if (Omadi.utils.isArray(imageData)) {

            for ( i = 0; i < imageData.length; i++) {
                widgetView.add(Omadi.widgets.image.getImageView(widgetView, numImagesShowing + i, imageNid, imageData[i]));
            }
            numImagesShowing += imageData.length;
        }

        contentWidth = numImagesShowing * 110;

        if (instance.can_edit && (instance.settings.cardinality == -1 || (numImagesShowing < instance.settings.cardinality))) {
            
            widgetView.add(Omadi.widgets.image.getImageView(widgetView, numImagesShowing, null, null));

            contentWidth += 110;
        }

        widgetView.contentWidth = contentWidth;

        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);

        if (!instance.can_edit) {
            widgetView.backgroundImage = '';
            widgetView.backgroundColor = '#BDBDBD';
            widgetView.borderColor = 'gray';
            widgetView.borderRadius = 10;
            widgetView.color = '#848484';
            widgetView.paddingLeft = 3;
            widgetView.paddingRight = 3;
            if (Ti.App.isAndroid) {
                widgetView.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
            }
        }

        return widgetView;
    },
    getImageView : function(widgetView, index, nid, fid) {"use strict";
        var imageView, fidIsData = false;

        if (fid !== null && typeof fid !== 'number') {
            fidIsData = true;
        }

        imageView = Ti.UI.createImageView({
            left : 5,
            height : 100,
            width : 100,
            image : (fid === null ? '/images/take-a-photo.png' : ( typeof fid === 'number' ? '/images/photo-loading.png' : fid)),
            thumbnailLoaded : false,
            fullImageLoaded : false,
            isImageData : false,
            bigImg : null,
            nid : nid,
            fid : fid,
            widgetView : widgetView,
            imageIndex : index,
            dbValue : fid,
            instance : widgetView.instance,
            parentView : widgetView
        });

        if (fidIsData) {
            imageView.bigImg = fid;
            imageView.fullImageLoaded = true;
            imageView.isImageData = true;
            imageView.dbValue = -1;
        }
        else if ( typeof fid === 'number') {
            Omadi.display.setImageViewThumbnail(imageView, nid, fid);
        }

        imageView.addEventListener('click', function(e) {

            if (e.source.fid === null && e.source.bigImg === null) {
                Omadi.widgets.image.openCamera(e.source);
            }
            else {
                Omadi.display.displayLargeImage(e.source, e.source.nid, e.source.fid);
            }
        });

        return imageView;
    },
    openCamera : function(imageView) {"use strict";
        /*global cameraAndroid*/

        if (Ti.App.isAndroid) {
            if (Ti.Media.isCameraSupported) {
                var overlayView, doneButton, captureButton;

                overlayView = Ti.UI.createView();
                doneButton = Ti.UI.createButton({
                    title: 'Done',
                    bottom: 0,
                    left: 0
                });
                
                doneButton.addEventListener('click', function(e){
                    var activity = Ti.Android.currentActivity;
                    activity.finish();
                    //alert("hi");
                });
                
                captureButton = Ti.UI.createButton({
                    title: 'Capture',
                    bottom: 0,
                    right: 0
                });
                
                captureButton.addEventListener('click', function(e){
                    cameraAndroid.takePicture(); 
                });
                
                //overlayView.add(doneButton);
                overlayView.add(captureButton);
                
                cameraAndroid.showCamera({
                    
                    finished : function(event){
                        var newImageView, tmpImageView, blob, maxDiff, newHeight, newWidth,
                            uploadImageView, filePath, file;
                        
                        Omadi.display.loading("Resizing Photo...");
                        
                        //blob = Omadi.widgets.image.resizeImage(event.media, 1500);
                        
                        
                        // uploadImageView = Ti.UI.createImageView({
                           // image: event.media,
                           // width: 1000,
                           // height: 700
                        // });
                        
                        
                        //blob = Ti.Utils.base64decode(event.media);//event.media;
                        //imageView.image = Ti.Utils.base64decode(event.media);
                        //uploadImageView.toImage().media;
                        
                        filePath = "file://" + event.filePath;
                        //blob = event.media;
                        
                        alert(filePath);
                        
                        //file = Ti.Filesystem.getFile(filePath);
                        
                        imageView.setImage(filePath);
                        
                        blob = imageView.toImage().media;

                        //imageView.image = blob;//uploadImageView.image;

                        //imageView.bigImg = imageView.image;
                        //imageView.mimeType = event.media.mimeType;
                        imageView.fullImageLoaded = true;
                        
                        Omadi.display.doneLoading();
                        Omadi.display.loading("Saving Photo...");
                        
                        if (imageView.instance.settings.cardinality == -1 || (imageView.imageIndex + 1) < imageView.instance.settings.cardinality) {
                            newImageView = Omadi.widgets.image.getImageView(imageView.parentView, imageView.imageIndex + 1, null, null);
                            imageView.parentView.setContentWidth(imageView.parentView.getContentWidth() + 110);
                            imageView.parentView.add(newImageView);
                            newImageView.fireEvent('click');
                        }
                        
                        Omadi.widgets.image.saveImageInDb(imageView, blob);
                        
                        Omadi.display.doneLoading();
                    },
                    success : function(event) {
                        Ti.API.info('CAMERA SUCCESS');
                    },
                    error : function(error) {
                        Omadi.service.sendErrorReport("Error capturing a photo" + JSON.stringify(error));
                        
                        Ti.API.info('Captured Image - Error: ' + error.code + " :: " + error.message);
                        if (error.code == Titanium.Media.NO_CAMERA) {
                            alert('No Camera in device');
                        }
                    },
                    overlay : overlayView
                });
                
                // cameraAndroid.openCamera({
                    // "event" : imageView,
                    // "callbackFnc" : function(event) {
                        // //Omadi.display.loading();
// 
                        // var newImageView, tmpImageView, blob, maxDiff, newHeight, newWidth;
// 
                        // imageView.image = Ti.Utils.base64decode(event.media);
// 
                        // imageView.bigImg = imageView.image;
                        // imageView.mimeType = event.media.mimeType;
                        // imageView.fullImageLoaded = true;
// 
                        // Ti.API.debug("index: " + imageView.imageIndex);
// 
                        // if (imageView.instance.settings.cardinality == -1 || (imageView.imageIndex + 1) < imageView.instance.settings.cardinality) {
                            // newImageView = Omadi.widgets.image.getImageView(imageView.parentView, imageView.imageIndex + 1, null, null);
                            // imageView.parentView.setContentWidth(imageView.parentView.getContentWidth() + 110);
                            // imageView.parentView.add(newImageView);
                            // newImageView.fireEvent('click');
                        // }
// 
                        // blob = imageView.image;
// 
                        // Omadi.widgets.image.saveImageInDb(imageView, blob);
// 
                        // //Omadi.display.doneLoading();
                    // }
                // });
            }
            else {
                alert('No Camera in device');
            }
        }
        else {
            try {
                var overlayView, captureButton, doneButton, flexible, flashMode, flashButton, navBar;

                overlayView = Ti.UI.createView();
                captureButton = Ti.UI.createButton({
                    systemButton : Ti.UI.iPhone.SystemButton.CAMERA
                });
                doneButton = Ti.UI.createButton({
                    systemButton : Ti.UI.iPhone.SystemButton.DONE
                });
                flexible = Ti.UI.createButton({
                    systemButton : Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
                });

                flashMode = Ti.App.Properties.getInt("flashMode", Ti.Media.CAMERA_FLASH_OFF);

                flashButton = Ti.UI.createButton({
                    top : 5,
                    right : 5,
                    height : 34,
                    width : 68,
                    backgroundImage : (flashMode == Ti.Media.CAMERA_FLASH_ON) ? '../images/flashOn.png' : '../images/flashOff.png'
                });

                if (Ti.App.Properties.getBool('deviceHasFlash')) {
                    overlayView.add(flashButton);
                }

                navBar = Ti.UI.iOS.createToolbar({
                    left : 0,
                    right : 0,
                    bottom : 0,
                    height : 50,
                    items : [doneButton, flexible, captureButton, flexible]
                });
                overlayView.add(navBar);

                captureButton.addEventListener('click', function(evt) {
                    Ti.Media.takePicture();
                });
                doneButton.addEventListener('click', function(evt) {
                    Ti.Media.hideCamera();
                });

                flashButton.addEventListener('click', function(evt) {
                    if (Ti.Media.cameraFlashMode == Ti.Media.CAMERA_FLASH_ON) {
                        Ti.App.Properties.setInt("flashMode", Ti.Media.CAMERA_FLASH_OFF);
                        evt.source.backgroundImage = "../images/flashOff.png";
                        Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_OFF;
                    }
                    else {
                        Ti.App.Properties.setInt("flashMode", Ti.Media.CAMERA_FLASH_ON);
                        evt.source.backgroundImage = "../images/flashOn.png";
                        Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_ON;
                    }
                });

                Ti.Media.showCamera({

                    success : function(event) {
                        var newImageView, tmpImageView, blob, maxDiff, newHeight, newWidth;

                        imageView.image = event.media;

                        imageView.bigImg = imageView.image;
                        imageView.mimeType = event.media.mimeType;
                        imageView.fullImageLoaded = true;

                        if (imageView.instance.settings.cardinality == -1 || (imageView.imageIndex + 1) < imageView.instance.settings.cardinality) {
                            newImageView = Omadi.widgets.image.getImageView(imageView.parentView, imageView.imageIndex + 1, null, null);
                            imageView.parentView.setContentWidth(imageView.parentView.getContentWidth() + 110);
                            imageView.parentView.add(newImageView);
                            newImageView.fireEvent('click');
                        }

                        blob = imageView.image;

                        try {
                            if (blob.getLength() > IMAGE_MAX_BYTES) {

                                //var ratio
                                if (blob.height > 1000 || blob.width > 1000) {

                                    maxDiff = blob.height - 1000;
                                    if (blob.width - 1000 > maxDiff) {
                                        // Width is bigger
                                        newWidth = 1000;
                                        newHeight = (1000 / blob.width) * blob.height;
                                    }
                                    else {
                                        // Height is bigger
                                        newHeight = 1000;
                                        newWidth = (1000 / blob.height) * blob.width;
                                    }

                                    blob = blob.imageAsResized(newWidth, newHeight);
                                }
                            }
                        }
                        catch(ex) {
                            alert("Error resizing the photo: " + ex);
                        }

                        Omadi.widgets.image.saveImageInDb(imageView, blob);
                    },
                    error : function(error) {
                        Ti.API.info('Captured Image - Error: ' + error.code + " :: " + error.message);
                        if (error.code == Titanium.Media.NO_CAMERA) {
                            alert('No Camera in device');
                        }
                    },
                    saveToPhotoGallery : false,
                    showControls : false,
                    overlay : overlayView,
                    autohide : true,
                    allowEditing : false,
                    mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
                    imageView : imageView
                });

                try {
                    if (Ti.App.Properties.getBool('deviceHasFlash')) {
                        Ti.Media.cameraFlashMode = flashMode;
                    }
                }
                catch(ex) {
                    Ti.API.error("Flash: " + ex);
                }
            }
            catch(wrapperEx) {
                Ti.API.error("Wrapper: " + wrapperEx);
            }
        }
    },
    saveImageInDb : function(imageView, blob) {"use strict";
        var nid, db, encodedImage, mime, imageName, timestamp, fieldName, imageIndex, location;

        try {
            nid = 0;
            Ti.API.debug('before encoded');
            encodedImage = Ti.Utils.base64encode(blob);
            Ti.API.debug('after encoded');
            
            mime = imageView.mimeType;
            imageName = 'image.jpg';
            imageView.dbValue = '-1';
            
            timestamp = Omadi.utils.getUTCTimestamp();
            fieldName = imageView.instance.field_name;
            imageIndex = imageView.imageIndex;
            
            location = Omadi.location.getLastLocation();

            db = Omadi.utils.openMainDatabase();
            db.execute("INSERT INTO _photos (nid, timestamp, file_data , field_name, file_name, delta, latitude, longitude, accuracy) VALUES ('0','" + timestamp + "','" + encodedImage + "','" + fieldName + "','" + imageName + "'," + imageIndex + ",'" + location.latitude + "','" + location.longitude + "'," + location.accuracy + ")");
            db.close();
        }
        catch(ex) {
            alert("Problem saving the photo to the database: " + ex);
        }
    },
    resizeImage : function(blob, maxWidth){"use strict";
        var tmpImage, tmp, wid, ht, reduction, newImage;
        
        tmpImage = Ti.UI.createImageView({
           image: blob,
           width: Ti.UI.SIZE,
           height: Ti.UI.SIZE
        });
        
        tmp = tmpImage.toImage();
        wid = tmp.width;
        ht = tmp.height;
        
        Ti.API.debug(wid);
        Ti.API.debug(ht);
        
        if(wid > ht) {
            reduction = maxWidth / wid;
            wid = maxWidth;
            ht = Math.round(ht * reduction);
        }
        else {
            reduction = maxWidth / ht;
            ht = maxWidth;
            wid = Math.round(wid * reduction);
        }
        
        newImage = Ti.UI.createImageView({
            image: blob,
            width: 1000,
            height: 1000
        });
        return newImage.toBlob();
    }
    
};

