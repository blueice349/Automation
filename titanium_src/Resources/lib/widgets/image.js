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
        
        Ti.UI.currentWindow.addEventListener('close', function(){
            var i, j;
            
            for(i = 0; i < instance.elements.length; i ++){
                
                if(instance.elements[i].children.length > 0){
                    for(j = instance.elements[i].children.length -1; j >= 0; j --){
                        instance.elements[i].remove(instance.elements[i].children[j]);
                        instance.elements[i].children[j] = null;
                    }
                }
                
                fieldView.remove(instance.elements[i]);
                instance.elements[i] = null;
            }
            
            instance.fieldView = null;
        });  

        return fieldView;
    },
    getNewElement : function(node, instance) {"use strict";
        var settings, widgetView, dbValue, imageData, degreeData, i, numImagesShowing = 0, contentWidth, imageNid;

        dbValue = [];
        imageData = [];
        degreeData = [];

        if ( typeof node[instance.field_name] !== 'undefined') {
            if ( typeof node[instance.field_name].dbValues !== 'undefined') {
                dbValue = node[instance.field_name].dbValues;
            }
            if ( typeof node[instance.field_name].imageData !== 'undefined') {
                imageData = node[instance.field_name].imageData;
                degreeData = node[instance.field_name].degrees;
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
                     
                    widgetView.add(Omadi.widgets.image.getImageView(widgetView, i, imageNid, dbValue[i], 0));
                }
            }
            numImagesShowing = dbValue.length;
        }

        if (Omadi.utils.isArray(imageData)) {

            for ( i = 0; i < imageData.length; i++) {
                widgetView.add(Omadi.widgets.image.getImageView(widgetView, numImagesShowing + i, imageNid, imageData[i], degreeData[i]));
            }
            numImagesShowing += imageData.length;
        }

        contentWidth = numImagesShowing * 110;

        if (instance.can_edit && (instance.settings.cardinality == -1 || (numImagesShowing < instance.settings.cardinality))) {
            
            widgetView.add(Omadi.widgets.image.getImageView(widgetView, numImagesShowing, null, null, 0));

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
    getImageView : function(widgetView, index, nid, fid, degrees) {"use strict";
        var imageView, fidIsData = false, transform, animation, rotateDegrees, image, widgetType;

        if (fid !== null && typeof fid !== 'number') {
            fidIsData = true;
            
            if(Ti.App.isAndroid){
                fid = "file://" + fid;
            }
        }
        
        widgetType = Ti.App.Properties.getString("photoWidget", 'take');
        if(widgetType == 'choose'){
            // Make sure the path is correct
            if(Omadi.widgets.image.getPhotoChooserDir() === null){
                widgetType = 'take';
            }
        }
        
        if(fid === null){
            if(widgetType == 'choose'){
                image = '/images/choose-a-photo.png';
            }
            else{
                image = '/images/take-a-photo.png';
            }   
        }
        else if(typeof fid === 'number'){
            image = '/images/photo-loading.png';
        }
        else{
            image = fid;
        }

        imageView = Ti.UI.createImageView({
            left : 5,
            height : 100,
            width : 100,
            image : image,
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
                           
            if(Ti.App.isAndroid && degrees > 0){
                transform = Ti.UI.create2DMatrix();
                animation = Ti.UI.createAnimation();
                
                rotateDegrees = degrees;
                if(rotateDegrees == 270){
                    rotateDegrees = 90;
                }
                else if(rotateDegrees == 90){
                    rotateDegrees = 270;
                }
                
                transform = transform.rotate(rotateDegrees);
                animation.transform = transform;
                animation.duration = 1;
                
                imageView.animate(animation);
            }
    
        }
        else if ( typeof fid === 'number') {
            Omadi.display.setImageViewThumbnail(imageView, nid, fid);
        }
        
        if(!fidIsData){
            if(widgetType == 'choose'){
                imageView.addEventListener('click', function(e) {
                    
                    if(e.source.fid === null){
                         Omadi.widgets.image.openPictureChooser(e.source);
                    }
                    else{
                        Omadi.display.displayLargeImage(e.source, e.source.nid, e.source.fid);
                    }
                });
            }
            else{
                imageView.addEventListener('click', function(e) {
        
                    if (e.source.fid === null) {
                        Omadi.widgets.image.openCamera(e.source);
                    }
                    else {
                        Omadi.display.displayLargeImage(e.source, e.source.nid, e.source.fid);
                    }
                });
            }
        }

        return imageView;
    },
    getPhotoChooserDir : function(){"use strict";
        var photoCameraPath, retval = null;
        
        photoCameraPath = Ti.App.Properties.getString("photoCameraPath", "");
        
        if(photoCameraPath != ""){
       
            retval = Ti.Filesystem.getFile(photoCameraPath);
            
            if(!retval.isDirectory()){
                retval = null;
            }
        }
        return retval;
    },
    openPictureChooser : function(imageView){"use strict";
        var pictureWindow, table, photoDir, imageStrings, i, recentFiles, tempFile, now,
            earliestTimestamp, rows, modified, row, image, extension, checkbox, refreshButton, 
            topBar, titleLabel, buttons, useButton, cancelButton;
        
        pictureWindow = Ti.UI.createView({
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#fff'
        });
        
        photoDir = Omadi.widgets.image.getPhotoChooserDir();
        
        if(photoDir !== null){
        
            recentFiles = [];
            
            now = Omadi.utils.getUTCTimestamp();
            // Last hour
            earliestTimestamp = (now - 3600) * 1000;
            
            if(photoDir.isDirectory()){
                
                rows = [];
                
                topBar = Ti.UI.createLabel({
                   top: 0,
                   backgroundColor: '#666',
                   height: 40,
                   width: '100%',
                   text: imageView.instance.label,
                   color: '#fff',
                   font: {
                        fontSize: 15,
                        fontWeight: 'bold'
                   },
                   textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
                });
                
                buttons = Ti.UI.createView({
                    width: '100%',
                    bottom: 0,
                    height: 50
                });
                
                useButton = Ti.UI.createButton({
                    title: 'Use Photos', 
                    width: '50%',
                    left: 0 
                });
                
                useButton.addEventListener('click', function(){
                    var i, file, localImageView, newImageView, copiedFile, dbPath;
                    
                    localImageView = imageView;
                    
                    for(i = 0; i < rows.length; i ++){
                        
                        if(rows[i].isChecked){
                            file = rows[i].photoFile;
                            
                            //copiedFile = Ti.Filesystem.getFile();
                            
                            Ti.API.debug(file.getNativePath());
                            dbPath = file.getNativePath();
                            
                            if(Ti.App.isAndroid){
                                dbPath = dbPath.replace(/^file:\/\//, '');
                            }
                            
                            Omadi.widgets.image.saveFileInfo(localImageView, dbPath, 0);
                            
                            localImageView.setImage(rows[i].photoFile);
                            
                            if (localImageView.instance.settings.cardinality == -1 || (localImageView.imageIndex + 1) < localImageView.instance.settings.cardinality) {
                                newImageView = Omadi.widgets.image.getImageView(localImageView.parentView, localImageView.imageIndex + 1, null, null, 0);
                                localImageView.parentView.setContentWidth(localImageView.parentView.getContentWidth() + 110);
                                localImageView.parentView.add(newImageView);
                                
                                localImageView = newImageView;
                            }
                        }
                    }
                    
                    pictureWindow.hide(); 
                    
                    // Clean up some memory
                    for(i = 0; i < rows.length; i ++){
                        table.remove(rows[i]);
                        rows[i] = null;
                    }
                    rows = null;
                    pictureWindow.remove(table);
                    table = null;
                    
                    pictureWindow = null;
                });
                
                cancelButton = Ti.UI.createButton({
                    title: 'Cancel',
                    width: '50%',
                    right: 0 
                });
                
                cancelButton.addEventListener('click', function(){
                    var i;
                    
                    pictureWindow.hide(); 
                    
                   // Clean up some memory
                    for(i = 0; i < rows.length; i ++){
                        table.remove(rows[i]);
                        rows[i] = null;
                    }
                    rows = null;
                    pictureWindow.remove(table);
                    table = null;
                    
                    pictureWindow = null;
                });
                
                buttons.add(useButton);
                buttons.add(cancelButton);
            
                imageStrings = photoDir.getDirectoryListing();
                
                Ti.API.debug("num files: " + imageStrings.length);
                
                table = Ti.UI.createScrollView({
                    top: 40,
                    bottom: 50,
                    left: 0,
                    right: 0,
                    layout: 'vertical',
                    contentHeight: 'auto'
                });
                
                for(i = 0; i < imageStrings.length; i ++){
                    
                    Ti.API.debug(imageStrings[i]);
                    tempFile = Ti.Filesystem.getFile(photoDir.getNativePath(), imageStrings[i]);
                    modified = tempFile.modificationTimestamp();
                    extension = tempFile.extension();
                    
                    if(extension !== null){
                        
                        extension = extension.toLowerCase();
                        if((extension == 'jpg' || extension == 'jpeg') && modified > earliestTimestamp){
                            
                            tempFile.modifiedTimestamp = modified;
                            recentFiles.push(tempFile);
                        }
                    }
                }
                
                if(recentFiles.length > 0){
                    recentFiles = recentFiles.sort(Omadi.utils.fileSortByModified);
                    
                    for(i = 0; i < recentFiles.length; i ++){
                        row = Ti.UI.createView({
                            height: 50,
                            width: '100%',
                            isChecked: false,
                            photoFile: recentFiles[i]
                        });
                        
                        row.add(Ti.UI.createImageView({
                            image: recentFiles[i],
                            height: 45,
                            width: 45,
                            autorotate: true,  // only with TI 3.x
                            left: 10,
                            touchEnabled: false
                        }));
                        
                        row.add(Ti.UI.createLabel({
                            text: Omadi.utils.getTimeAgoStr(recentFiles[i].modifiedTimestamp / 1000),
                            left: 60,
                            touchEnabled: false,
                            ellipsize: true
                        }));
                        
                        checkbox = Ti.UI.createView({
                            width : 35,
                            height : 35,
                            borderRadius : 4,
                            borderColor : '#333',
                            borderWidth : 1,
                            backgroundColor : '#FFF',
                            enabled : true,
                            right: 10,
                            parentRow: row,
                            touchEnabled: false
                        });
                        
                        row.checkbox = checkbox;
                        
                        row.add(checkbox);
                        rows.push(row);
                        
                        row.addEventListener('click', Omadi.widgets.image.imageRowClicked);
                        
                        table.add(row);
                    }
                }
                else{
                    row = Ti.UI.createLabel({
                        height: 50,
                        width: '100%',
                        isChecked: false,
                        text: '- No photos taken in the past hour -',
                        font: {
                            fontSize: 14
                        },
                        color: '#999',
                        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
                    });
                    
                    table.add(row);
                }
                
                pictureWindow.add(topBar);
                pictureWindow.add(table);
                pictureWindow.add(buttons);
            }
            else{
                alert("Could not find the photo directory.");     
            } 
            
            Ti.UI.Android.hideSoftKeyboard();
            
            Ti.UI.currentWindow.add(pictureWindow);
        }
        else{
            alert("Error: Could not open photo chooser.");
            Omadi.service.sendErrorReport("Could not open photo chooser");
        }
        //pictureWindow.open();
    },
    imageRowClicked: function(e){"use strict";
    
        if(e.source.isChecked){
            e.source.checkbox.setBackgroundImage(null);
            e.source.checkbox.setBorderWidth(1);
            e.source.setBackgroundColor('#fff');
        }
        else{
            e.source.checkbox.setBackgroundImage('/images/selected_test.png');
            e.source.checkbox.setBorderWidth(2);
            e.source.setBackgroundColor('#eee');
        }
        e.source.isChecked = !e.source.isChecked;
    },
    openCamera : function(imageView) {"use strict";
        /*global cameraAndroid*/
        var blankOverlay, storageDirectory, storageDirectoryFile,
         overlayView, captureButton, doneButton, flexible, flashMode, flashButton, navBar;
        
        if (Ti.App.isAndroid) {
            if (Ti.Media.isCameraSupported) {
               
                blankOverlay = Ti.UI.createView();
                
                //storageDirectory = Ti.Filesystem.getExternalStorageDirectory();
                storageDirectoryFile = Ti.Filesystem.getFile(Ti.Filesystem.getExternalStorageDirectory());
                storageDirectory = storageDirectoryFile.getNativePath();
                
                //alert(storageDirectory);
                
                cameraAndroid.showCamera({
                    
                    finished : function(event){
                        var newImageView, tmpImageView, blob, maxDiff, newHeight, newWidth,
                            uploadImageView, filePath, file, degrees, transform, animation, rotateDegrees;
                        
                        Omadi.display.loading("Saving Photo...");
                        
                        filePath = event.filePath;
                        degrees = event.degrees;
                        
                        
                        imageView.setImage("file://" + filePath);
                        
                        if(degrees > 0){
                            transform = Ti.UI.create2DMatrix();
                            animation = Ti.UI.createAnimation();
                            
                            rotateDegrees = degrees;
                            if(rotateDegrees == 270){
                                rotateDegrees = 90;
                            }
                            else if(rotateDegrees == 90){
                                rotateDegrees = 270;
                            }
                            
                            transform = transform.rotate(rotateDegrees);
                            animation.transform = transform;
                            animation.duration = 1;
                            
                            imageView.animate(animation);
                        }
                        
                        imageView.fullImageLoaded = true;
                        
                        
                        Omadi.widgets.image.saveFileInfo(imageView, filePath, degrees);
                        
                        if (imageView.instance.settings.cardinality == -1 || (imageView.imageIndex + 1) < imageView.instance.settings.cardinality) {
                            newImageView = Omadi.widgets.image.getImageView(imageView.parentView, imageView.imageIndex + 1, null, null, 0);
                            imageView.parentView.setContentWidth(imageView.parentView.getContentWidth() + 110);
                            imageView.parentView.add(newImageView);
                            
                            // Allow the newImageView time to show up, and then click it
                            setTimeout(function(){
                                 newImageView.fireEvent('click');
                                 Omadi.display.doneLoading();
                            }, 100);
                        }
                        else{
                            Omadi.display.doneLoading();
                        }
                        
                        
                        //Omadi.widgets.image.saveImageInDb(imageView, blob);
                        
                        
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
                    // Currently, an overlay must exist to not show the default camera
                    overlay : blankOverlay,
                    storageDirectory : storageDirectory
                });
            }
            else {
                alert('No Camera in device');
            }
        }
        else {
            try {

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
                    backgroundImage : (flashMode == Ti.Media.CAMERA_FLASH_ON) ? '/images/flashOn.png' : '/images/flashOff.png'
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
                        evt.source.backgroundImage = "/images/flashOff.png";
                        Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_OFF;
                    }
                    else {
                        Ti.App.Properties.setInt("flashMode", Ti.Media.CAMERA_FLASH_ON);
                        evt.source.backgroundImage = "/images/flashOn.png";
                        Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_ON;
                    }
                });

                Ti.Media.showCamera({

                    success : function(event) {
                        var newImageView, tmpImageView, blob, maxDiff, newHeight, newWidth, imageFile, filePath;

                        Omadi.display.loading("Saving Photo...");
                        
                        imageView.image = event.media;

                        imageView.bigImg = imageView.image;
                        imageView.mimeType = event.media.mimeType;
                        imageView.fullImageLoaded = true;

                        filePath = Ti.Filesystem.applicationDataDirectory + "p_" + Omadi.utils.getUTCTimestamp() + '.jpg';
                        
                        imageFile = Ti.Filesystem.getFile(filePath);
                        
                        imageFile.write(event.media);
                        imageFile.setRemoteBackup(false);
                                
                            Omadi.widgets.image.saveFileInfo(imageView, filePath, 0);
                           
                            
                            if (imageView.instance.settings.cardinality == -1 || (imageView.imageIndex + 1) < imageView.instance.settings.cardinality) {
                                newImageView = Omadi.widgets.image.getImageView(imageView.parentView, imageView.imageIndex + 1, null, null, 0);
                                imageView.parentView.setContentWidth(imageView.parentView.getContentWidth() + 110);
                                imageView.parentView.add(newImageView);
                                
                                // Allow the newImageView time to show up, and then click it
                                setTimeout(function(){
                                     newImageView.fireEvent('click');
                                     Omadi.display.doneLoading();
                                }, 100);
                            }
                            else{
                                Omadi.display.doneLoading();
                            }
                        // }
                        // else{
                            // alert("An error occurred saving the photo.");
                            // Omadi.service.sendErrorReport("Could not save iOS photo");
                        // }
                        
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
    saveFileInfo : function(imageView, filePath, degrees) {"use strict";
        var nid, db, encodedImage, mime, imageName, timestamp, fieldName, imageIndex, location;

        try {
            nid = 0;
            // Ti.API.debug('before encoded');
            // encodedImage = Ti.Utils.base64encode(blob);
            // Ti.API.debug('after encoded');
            
            mime = imageView.mimeType;
            imageName = 'image.jpg';//filePath;
            imageView.dbValue = '-1';
            
            timestamp = Omadi.utils.getUTCTimestamp();
            fieldName = imageView.instance.field_name;
            imageIndex = imageView.imageIndex;
            
            location = Omadi.location.getLastLocation();

            db = Omadi.utils.openMainDatabase();
            db.execute("INSERT INTO _photos (nid, timestamp, file_data, field_name, file_name, delta, latitude, longitude, accuracy, degrees) VALUES ('0','" + timestamp + "','" + filePath + "','" + fieldName + "','" + imageName + "'," + imageIndex + ",'" + location.latitude + "','" + location.longitude + "'," + location.accuracy + "," + degrees + ")");
            db.close();
        }
        catch(ex) {
            alert("Problem saving the photo to the database: " + ex);
        }
    }
};

