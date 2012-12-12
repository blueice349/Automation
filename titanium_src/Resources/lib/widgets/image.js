
/*jslint eqeq:true, plusplus: true*/
/*global PLATFORM,setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/



var IMAGE_MAX_BYTES = 524258;

Omadi.widgets.image = {
    
    //TODO: write a validation function for images
    
    getFieldView: function(node, instance){"use strict";
        //this.base = Omadi.widgets.base.init(in_instance);
        instance.elements = [];
        
        var settings = instance.settings, fieldView, i, j, element, addAnotherItemButton = null;
        
        fieldView = Ti.UI.createView({
           width: '100%',
           layout: 'vertical',
           height: Ti.UI.SIZE,
           instance: instance
        });
        
        instance.fieldView = fieldView;
        
        fieldView.add(Omadi.widgets.label.getRegularLabelView(instance));
        setConditionallyRequiredLabelForInstance(node, instance);

    
        instance.numVisibleFields = 1;
               
        element = Omadi.widgets.image.getNewElement(node, instance);
        instance.elements.push(element);
        fieldView.add(element);
        fieldView.add(Omadi.widgets.getSpacerView());

        
        // if(settings.cardinality == -1){
            // // addAnotherItemButton = Ti.UI.createButton({
               // // title: 'Add another item',
               // // right: 15,
               // // instance: instance
            // // });
// //             
            // // addAnotherItemButton.addEventListener('click', function(e){
                // // var instance = e.source.instance;
                // // instance.numVisibleFields ++;
                // // Omadi.widgets.shared.redraw(instance);
            // // });
// //         
            // // fieldView.add(addAnotherItemButton);
            // // fieldView.add(Omadi.widgets.getSpacerView());
            // Ti.API.error("ADD IN THIS");
        // }

        
        //No data checkbox functionality
        //noDataCheckbox(reffer_index, regionView, top);
        //if (content[reffer_index].noDataView != null) {
        //    top += 40;
       // }
       
       //fieldViews[this.instance.field_name] = this.fieldView;
       
       //this.fieldView = fieldView;
       //this.initialized = true;
       
       return fieldView;
    },
    getNewElement: function(node, instance){"use strict";
        /*global isArray*/
       
        var settings, widgetView, dbValue, imageData, i, numImagesShowing = 0, contentWidth;
        
        dbValue = [];
        imageData = [];

        if(typeof node[instance.field_name] !== 'undefined'){
            if(typeof node[instance.field_name].dbValues !== 'undefined'){
                dbValue = node[instance.field_name].dbValues;
            }
            if(typeof node[instance.field_name].imageData !== 'undefined'){
                imageData = node[instance.field_name].imageData;
            }
        }
        
        settings = instance.settings;
        Ti.API.debug("Creating image field");
        
        widgetView = Ti.UI.createScrollView({
            width : Ti.Platform.displayCaps.platformWidth - 30,
            //contentWidth : 'auto',// Don't set contentWidth to anything here.  It is set further down
            contentHeight : 100,
            height : 100,
            arrImages : null,
            scrollType : 'horizontal',
            layout : 'horizontal',

            instance: instance
        });
        
        //Ti.API.debug("IMAGE DBVALUES: " + JSON.stringify(dbValue));
        
        if(isArray(dbValue)){
            for (i = 0; i < dbValue.length; i++) {
                if(dbValue[i] > 0){
                    Ti.API.debug("Adding image to scroll view");
                    widgetView.add(Omadi.widgets.image.getImageView(widgetView, i, Ti.UI.currentWindow.nid, dbValue[i]));
                }
                // //var updated = false
                // if ((img < decodedValues.length) && (decodedValues[img] != "") && (decodedValues[img] != null) && decodedValues[img] != 'null' && decodedValues[img] != 'undefined') {
                    // var vl_to_field = decodedValues[img];
                    // if (isUpdated[img] == true) {
                        // updated = isUpdated[img];
                    // }
                // }
                // else {
                    // continue;
                // }
                // arrImages = createImage(o_index, arrImages, vl_to_field, content[count], updated);
                // //o_index += 1;
            }
            
            numImagesShowing = dbValue.length;
        }
        
       
        if(isArray(imageData)){
            
            for (i = 0; i < imageData.length; i++) {
                 widgetView.add(Omadi.widgets.image.getImageView(widgetView, numImagesShowing + i, Ti.UI.currentWindow.nid, imageData[i]));
            }
            numImagesShowing += imageData.length;
        }
        
        contentWidth = numImagesShowing * 110;
        
        
        if(instance.settings.cardinality == -1 || (numImagesShowing < instance.settings.cardinality)){
            Ti.API.debug("Adding blank image");
            widgetView.add(Omadi.widgets.image.getImageView(widgetView, numImagesShowing, null, null));
            
            contentWidth += 110;
        }
        
        widgetView.contentWidth = contentWidth;
        // else{
            // for(i = numImagesShowing; i < instance.settings.cardinality; i ++){
                // widgetView.add(Omadi.widgets.image.getImageView(widgetView, i, null, null));
            // }
        // }
        
        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);
        
        if (!instance.can_edit) {
            widgetView.backgroundImage = '';
            widgetView.backgroundColor = '#BDBDBD';
            widgetView.borderColor = 'gray';
            widgetView.borderRadius = 10;
            widgetView.color = '#848484';
            widgetView.paddingLeft = 3;
            widgetView.paddingRight = 3;
            if (PLATFORM == 'android') {
                widgetView.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
            }
        }
        
        return widgetView;
    },
    getImageView: function(widgetView, index, nid, fid){"use strict";
        //function createImage(o_index, arrImages, data, scrollView, updated) {
        var imageView, fidIsData = false;
        
        //Ti.API.debug("IMAGE FID: " + fid);
        
        if(fid !== null && typeof fid !== 'number'){
            fidIsData = true;
        }
        
        imageView = Ti.UI.createImageView({
            left : 5,
            height : 100,
            width : 100,
            image: (fid === null ? '/images/take-a-photo.png' : (typeof fid === 'number' ? '/images/photo-loading.png' : fid)),
            //image : defaultImageVal,
            //imageVal : data,
            thumbnailLoaded: false,
            fullImageLoaded: false,
            isImageData: false,
            bigImg: null,
            nid: nid, 
            fid: fid,
            widgetView: widgetView,
            imageIndex: index,
            dbValue: fid,
            instance: widgetView.instance,
            parentView: widgetView
        });
        
        if(fidIsData){
            imageView.bigImg = fid;
            imageView.fullImageLoaded = true;
            imageView.isImageData = true;
        }
        else if(typeof fid === 'number'){
            Omadi.display.setImageViewThumbnail(imageView, nid, fid);
        }
        // if (updated == true) {
            // contentImage.image = data;
            // contentImage.bigImg = data;
            // contentImage.isImage = true;
        // }
        imageView.addEventListener('click', function(e) {
            
            if(e.source.fid === null && e.source.bigImg === null){
                Omadi.widgets.image.openCamera(e.source);
            }
            else{
                Omadi.display.displayLargeImage(e.source, e.source.nid, e.source.fid);
            }
            //Following method will open camera to capture the image.
            //Ti.API.info("clicked image");
            // if (e.source.isImage != false) {
                // Ti.API.info("is image");
                // var postDialog = Titanium.UI.createOptionDialog();
                // postDialog.options = ['Capture Image', 'Show Image', 'cancel'];
                // postDialog.cancel = 2;
                // postDialog.show();
//     
                // postDialog.addEventListener('click', function(ev) {
                    // if (ev.index == 0) {
                        // openCamera(e);
                    // }
                    // else if (ev.index == 1) {
                        // //downloadMainImage(e.source.imageVal, e.source, win);
                        // Omadi.display.displayLargeImage(e.source, win.nid, e.source.imageVal);
                    // }
                // });
                // return;
            // }
            // Ti.API.info("open camera");
            //Omadi.widgets.image.openCamera(e);
        });
        //scrollView.add(contentImage);
        //arrImages.push(contentImage);
        //contentImage.scrollView.arrImages = arrImages;
        //return arrImages;
        
        return imageView;
    },
    openCamera: function(imageView){"use strict";
        // // To open camera
        /*global cameraAndroid*/
       
        if (PLATFORM === 'android') {
            if (Ti.Media.isCameraSupported) {
                
                
                cameraAndroid.openCamera({
                    "event" : imageView,
                    "callbackFnc" : function(event) {
                        Omadi.display.loading();
                        // setTimeout(function(evt) {
                            // var actInd, imagescr;
//                             
                            // actInd = Ti.UI.createActivityIndicator();
                            // try {
                                // actInd.font = {
                                    // fontFamily : 'Helvetica Neue',
                                    // fontSize : 15,
                                    // fontWeight : 'bold'
                                // };
                                // actInd.color = 'white';
                                // actInd.message = 'Please wait...';
                                // actInd.show();
                                // imagescr = Ti.Utils.base64decode(e.media);
//                                 
                                // e.source.image = imagescr;
                                // e.source.isImage = true;
                                // e.source.bigImg = imagescr;
                                // e.source.mimeType = "/jpeg";
                                // if (e.source.cardinality > 1 || e.source.cardinality < 0) {
                                    // if (e.source.cardinality < 1) {
                                        // arrImages = createImage(e.source.scrollView.addButton.o_index, e.source.scrollView.arrImages, defaultImageVal, e.source.scrollView, false);
                                        // e.source.scrollView.arrImages = arrImages;
                                        // e.source.scrollView.addButton.o_index += 1;
                                        // newSource = arrImages.length - 1;
                                    // }
                                    // else {
                                        // if (e.source.private_index == e.source.cardinality - 1) {
                                            // return;
                                        // }
                                        // newSource = (e.source.private_index == e.source.cardinality - 1) ? 0 : e.source.private_index + 1;
                                    // }
                                    // saveImageInDb(e.source, e.source.scrollView.field_name);
                                    // e.source = e.source.scrollView.arrImages[newSource];
                                    // actInd.hide();
                                    // openCamera(e)
                                // }
                                // else {
                                    // actInd.hide();
                                    // saveImageInDb(e.source, e.source.field_name);
                                // }
//                     
                            // }
                            // catch(eve) {
                                // actInd.hide();
                            // }
                        // }, 200);
                        
                        var newImageView, tmpImageView, blob, maxDiff, newHeight, newWidth;
    
                        //Ti.API.info("MIME TYPE: " + event.media.mimeType);
                        // If image size greater than 1MB we will reduce th image else take as it is.
                        //if (event.media.length > IMAGE_MAX_BYTES) {
                        //    imageView.image = Omadi.display.getImageViewFromData(event.media, 500, 700).image;
                       // }
                       // else {
                            imageView.image = Ti.Utils.base64decode(event.media);
                       // }
                        
                        imageView.bigImg = imageView.image;
                        imageView.mimeType = event.media.mimeType;
                        imageView.fullImageLoaded = true;
                        
                        Ti.API.debug("index: " + imageView.imageIndex);
    
                        if (imageView.instance.settings.cardinality == -1 || (imageView.imageIndex + 1) < imageView.instance.settings.cardinality) {
                            newImageView = Omadi.widgets.image.getImageView(imageView.parentView, imageView.imageIndex + 1, null, null);
                            imageView.parentView.setContentWidth(imageView.parentView.getContentWidth() + 110);
                            imageView.parentView.add(newImageView);
                            newImageView.fireEvent('click');   
                        }
                       
                            // if (e.source.cardinality < 1) {
                                // arrImages = createImage(e.source.scrollView.addButton.o_index, e.source.scrollView.arrImages, defaultImageVal, e.source.scrollView, false);
                                // e.source.scrollView.arrImages = arrImages;
                                // e.source.scrollView.addButton.o_index += 1;
                                // newSource = arrImages.length - 1;
                            // }
                            // else {
                                // if (e.source.private_index == e.source.cardinality - 1) {
                                    // return;
                                // }
                                // newSource = (e.source.private_index == e.source.cardinality - 1) ? 0 : e.source.private_index + 1;
                            // }
                            // saveImageInDb(e.source, e.source.scrollView.field_name);
                            // e.source = e.source.scrollView.arrImages[newSource];
                            // actInd.hide();
                            // Ti.Media.hideCamera();
                            // openCamera(e);
                        // }
                        // else {
                            // actInd.hide();
                            
                       //alert("success");
                       //Ti.Media.hideCamera();
                       
                       
                       blob = imageView.image;
                       
                       /*
                       try{
                           
                           if (blob.getLength() > IMAGE_MAX_BYTES) {
                            //imageView.image = Omadi.display.getImageViewFromData(event.media, 1200, 800).image;
                               
                                //var ratio
                                if(blob.height > 1000 || blob.width > 1000) {
                                    
                                    maxDiff = blob.height - 1000;
                                    if(blob.width - 1000 > maxDiff){
                                        // Width is bigger
                                        newWidth = 1000;
                                        newHeight = (1000 / blob.width) * blob.height;
                                    }
                                    else{
                                        // Height is bigger
                                        newHeight = 1000;
                                        newWidth = (1000 / blob.height) * blob.width;
                                    }
                                    
                                    blob = blob.imageAsResized(newWidth, newHeight);
                                } 
                            }
                        }
                        catch(ex){
                            alert("Error resizing the photo: " + ex);
                        }*/
                       
                        
                       
                        Omadi.widgets.image.saveImageInDb(imageView, blob);
                        
                        Omadi.display.doneLoading();
                    }
                });
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
    
                        //Ti.API.info("MIME TYPE: " + event.media.mimeType);
                        // If image size greater than 1MB we will reduce th image else take as it is.
                        //if (event.media.length > IMAGE_MAX_BYTES) {
                        //    imageView.image = Omadi.display.getImageViewFromData(event.media, 500, 700).image;
                       // }
                       // else {
                            imageView.image = event.media;
                       // }
                        
                        imageView.bigImg = imageView.image;
                        imageView.mimeType = event.media.mimeType;
                        imageView.fullImageLoaded = true;
    
                        if (imageView.instance.settings.cardinality == -1 || (imageView.imageIndex + 1) < imageView.instance.settings.cardinality) {
                            newImageView = Omadi.widgets.image.getImageView(imageView.parentView, imageView.imageIndex + 1, null, null);
                            imageView.parentView.setContentWidth(imageView.parentView.getContentWidth() + 110);
                            imageView.parentView.add(newImageView);
                            newImageView.fireEvent('click');   
                        }
                       
                            // if (e.source.cardinality < 1) {
                                // arrImages = createImage(e.source.scrollView.addButton.o_index, e.source.scrollView.arrImages, defaultImageVal, e.source.scrollView, false);
                                // e.source.scrollView.arrImages = arrImages;
                                // e.source.scrollView.addButton.o_index += 1;
                                // newSource = arrImages.length - 1;
                            // }
                            // else {
                                // if (e.source.private_index == e.source.cardinality - 1) {
                                    // return;
                                // }
                                // newSource = (e.source.private_index == e.source.cardinality - 1) ? 0 : e.source.private_index + 1;
                            // }
                            // saveImageInDb(e.source, e.source.scrollView.field_name);
                            // e.source = e.source.scrollView.arrImages[newSource];
                            // actInd.hide();
                            // Ti.Media.hideCamera();
                            // openCamera(e);
                        // }
                        // else {
                            // actInd.hide();
                            
                       //alert("success");
                       //Ti.Media.hideCamera();
                       
                       blob = imageView.image;
                       
                       try{
                           
                           if (blob.getLength() > IMAGE_MAX_BYTES) {
                            //imageView.image = Omadi.display.getImageViewFromData(event.media, 1200, 800).image;
                               
                                //var ratio
                                if(blob.height > 1000 || blob.width > 1000) {
                                    
                                    maxDiff = blob.height - 1000;
                                    if(blob.width - 1000 > maxDiff){
                                        // Width is bigger
                                        newWidth = 1000;
                                        newHeight = (1000 / blob.width) * blob.height;
                                    }
                                    else{
                                        // Height is bigger
                                        newHeight = 1000;
                                        newWidth = (1000 / blob.height) * blob.width;
                                    }
                                    
                                    blob = blob.imageAsResized(newWidth, newHeight);
                                } 
                            }
                        }
                        catch(ex){
                            alert("Error resizing the photo: " + ex);
                        }
                       
                        
                       
                        Omadi.widgets.image.saveImageInDb(imageView, blob);
                        
                    },
                    error : function(error) {
                        //actInd.hide();
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
                    imageView: imageView
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
    saveImageInDb: function(imageView, blob) {"use strict";
        var nid, db, encodedImage, mime, imageName;
        
        try{
            nid = 0;
            
            encodedImage = Ti.Utils.base64encode(blob);
            //encodedImage = imageView.bigImg;
            mime = imageView.mimeType;
            
            imageName = 'image.jpg';//' + mime.substring(mime.indexOf('/') + 1, mime.length);
            
            //var is_exists = db_toSaveImage.execute('SELECT delta, nid FROM _photos WHERE nid=' + file_upload_nid + ' and delta=' + currentImageView.private_index + ' and field_name="' + field_name + '";');
            // if (is_exists.rowCount > 0) {
                // db_toSaveImage.execute('UPDATE _photos SET nid="' + file_upload_nid + '",timestamp="' + vl_to_field + '",file_data="' + encodeImage + '", field_name="' + field_name + '", file_name="' + imageName + '", delta=' + currentImageView.private_index + ' WHERE nid=' + file_upload_nid + ' and delta=' + currentImageView.private_index + ' and field_name="' + field_name + '";');
            // }
            // else {
                
            imageView.dbValue = '-1';
            
            db = Omadi.utils.openMainDatabase();
            db.execute('INSERT INTO _photos (nid, timestamp, file_data , field_name, file_name, delta) VALUES ("0","' + Omadi.utils.getUTCTimestamp() + '", "' + encodedImage + '", "' + imageView.instance.field_name + '", "' + imageName + '", ' + imageView.imageIndex + ')');
            //}
        
            db.close();
        }
        catch(ex){
            alert("Problem saving the photo to the database: " + ex);
        }
    }
};













                                // regionView.add(content[count]);
                                // var decodedValues = [];
                                // if (win.mode == 1) {
                                    // var val = db_display.execute('SELECT * FROM ' + win.type + ' WHERE nid=' + win.nid + ';');
                                    // if (val.fieldByName(field_arr[index_label][index_size].field_name + '___file_id') == '7411317618171051229' || val.fieldByName(field_arr[index_label][index_size].field_name + '___file_id') == 7411317618171051229) {
                                        // array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '___file_id\'');
                                    // }
                                    // else {
                                        // array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');
                                    // }
                                    // if (array_cont.rowCount > 0) {
                                        // //Decode the stored array:
                                        // var decoded = array_cont.fieldByName('encoded_array');
                                        // decoded = Base64.decode(decoded);
                                        // decoded = decoded.toString();
                                        // decodedValues = decoded.split("j8Oc2s1E");
                                    // }
                                    // val = db_display.execute('SELECT * FROM _photos WHERE nid=' + win.nid + ' AND field_name ="' + field_arr[index_label][index_size].field_name + '";');
                                    // if (val.rowCount > 0) {
                                        // while (val.isValidRow()) {
                                            // isUpdated[val.fieldByName('delta')] = true;
                                            // decodedValues[val.fieldByName('delta')] = Ti.Utils.base64decode(val.fieldByName('file_data'));
                                            // val.next();
                                        // }
                                    // }
                                // }
                                // var arrImages = [];

                                // if (settings.cardinality < 0) {
                                    // o_index = 0;
                                    
                                    
                                    
                                    
                                    
                                    // for ( img = 0; img < decodedValues.length; img++) {
                                        // var updated = false
                                        // if ((img < decodedValues.length) && (decodedValues[img] != "") && (decodedValues[img] != null) && decodedValues[img] != 'null' && decodedValues[img] != 'undefined') {
                                            // var vl_to_field = decodedValues[img];
                                            // if (isUpdated[img] == true) {
                                                // updated = isUpdated[img];
                                            // }
                                        // }
                                        // else {
                                            // continue;
                                        // }
                                        // arrImages = createImage(o_index, arrImages, vl_to_field, content[count], updated);
                                        // o_index += 1;
                                    // }
                                    // if (decodedValues.length == 0 || o_index == 0) {
                                        // arrImages = createImage(o_index, arrImages, defaultImageVal, content[count], false);
                                        // o_index += 1;
                                    // }
// 
                                    // //--------- Add Button
                                    // addButton = Ti.UI.createButton({
                                        // right : '5',
                                        // title : '+',
                                        // top : reserveTop,
                                        // height : 40,
                                        // width : 40,
                                        // scrollView : content[count],
                                        // o_index : o_index
                                    // });
                                    // regionView.add(addButton);
                                    // addButton.addEventListener('click', function(e) {
                                        // arrImages = createImage(e.source.o_index, arrImages, defaultImageVal, e.source.scrollView, false);
                                        // e.source.scrollView.arrImages = arrImages
                                        // e.source.o_index += 1;
                                    // });
                                    // content[count].addButton = addButton;
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                // }
                                // else {
                                    // var o_index;
                                    // for ( o_index = 0; o_index < settings.cardinality; o_index++) {
                                        // var updated = false;
                                        // if ((o_index < decodedValues.length) && (decodedValues[o_index] != "") && (decodedValues[o_index] != null) && decodedValues[o_index] != 'null' && decodedValues[o_index] != 'undefined') {
                                            // var vl_to_field = decodedValues[o_index];
                                            // if (isUpdated[o_index] == true) {
                                                // updated = isUpdated[o_index];
                                            // }
                                        // }
                                        // else {
                                            // var vl_to_field = defaultImageVal;
                                        // }
                                        // arrImages = createImage(o_index, arrImages, vl_to_field, content[count], updated);
                                    // }
                                // }
                                // content[count].arrImages = arrImages;