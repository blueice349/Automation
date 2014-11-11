/*jslint eqeq:true, plusplus:true, regexp:true, vars:true, node:true */
'use strict';

var ImageFactory = null;
var Utils = require('lib/Utils');
var Database = require('lib/Database');
var Display = require('lib/Display');
var Location = require('lib/Location');

if(Ti.App.isIOS){
    ImageFactory = require('ti.imagefactory');
}

function ImageWidget(formObj, instance, fieldViewWrapper){
    this.formObj = formObj || {};
    this.instance = instance;
    this.fieldView = null;
    this.node = this.formObj.node || {};
    this.dbValues = [];
    this.textValues = [];
    this.nodeElement = null;
    this.numVisibleFields = 1;
    this.fieldViewWrapper = fieldViewWrapper;
    this.elements = [];
    
    if(Ti.App.isAndroid){
        this.cameraAndroid = require('com.omadi.newcamera');
    }
    
    if(typeof this.node[this.instance.field_name] !== 'undefined'){
        this.nodeElement = this.node[this.instance.field_name];
        
        if(typeof this.nodeElement.dbValues !== 'undefined' && this.nodeElement.dbValues != null){
            this.dbValues = this.nodeElement.dbValues;   
        }
        
        if(typeof this.nodeElement.textValues !== 'undefined' && this.nodeElement.textValues != null){
            this.textValues = this.nodeElement.textValues;
        }
    }
    
    if(this.instance.settings.cardinality == -1){
        if(Utils.isArray(this.dbValues)){
            this.numVisibleFields = this.dbValues.length;
        }
    }
    else{
        this.numVisibleFields = this.instance.settings.cardinality;
    }
}

ImageWidget.prototype.getFieldView = function(){
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    this.fieldView.add(this.formObj.getRegularLabelView(this.instance));
    
    // Add the actual fields
    this.elements[0] = this.getNewElement();
    this.fieldView.add(this.elements[0]);
    this.fieldView.add(this.formObj.getSpacerView());
  
    return this.fieldView;
};

ImageWidget.prototype.redraw = function(){
    Ti.API.debug("in redraw");
    var origFieldView;
    
    this.formObj.formToNode();
    
    this.node = this.formObj.node;
    if(typeof this.node[this.instance.field_name] !== 'undefined'){
        this.nodeElement = this.node[this.instance.field_name];
        
        if(typeof this.nodeElement.dbValues !== 'undefined' && this.nodeElement.dbValues != null){
            this.dbValues = this.nodeElement.dbValues;   
        }
        
        if(typeof this.nodeElement.textValues !== 'undefined' && this.nodeElement.textValues != null){
            this.textValues = this.nodeElement.textValues;
        }
    }
    
    origFieldView = this.fieldView;
    
    this.getFieldView();
    
    origFieldView.hide();
    
    this.fieldViewWrapper.add(this.fieldView);
    this.fieldViewWrapper.remove(origFieldView);
};

ImageWidget.prototype.getImageNid = function() {
	var imageNid = this.formObj.nid;
    if(typeof this.formObj.origNid !== 'undefined'){
        imageNid = this.formObj.origNid;
    }
    return imageNid;
};

ImageWidget.prototype.getNewElement = function(){
    var widgetView, dbValues, imageData, degreeData, deltaData, imageDataAdded, thumbData;

    dbValues = [];
    imageData = [];
    degreeData = [];
    deltaData = [];
    thumbData = [];

    if ( typeof this.node[this.instance.field_name] !== 'undefined') {
        if ( typeof this.node[this.instance.field_name].dbValues !== 'undefined') {
            dbValues = this.node[this.instance.field_name].dbValues;
        }
    }

    Ti.API.debug("Creating image field: " + this.instance.label);

    widgetView = Ti.UI.createScrollView({
        width : '92%',
        //***** Don't set contentWidth to anything here.  It is set further down ******/
        //contentWidth : 'auto',
        contentHeight : 100,
        height : 100,
        arrImages : null,
        scrollType : 'horizontal',
        layout : 'horizontal',
        instance : this.instance
    });
    
    imageDataAdded = [];

	this.addImageViewsToWidgetView(dbValues, widgetView);

	var contentWidth = 110 * dbValues.length;
	if (this.instance.can_edit && (this.instance.settings.cardinality == -1 || (dbValues.length < this.instance.settings.cardinality))) {
        widgetView.add(this.getTakePhotoButtonView());
		contentWidth += 110;
	}
	
	widgetView.contentWidth = contentWidth;

    widgetView.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
    this.formObj.addCheckConditionalFields(widgetView.check_conditional_fields);

    if (!this.instance.can_edit) {
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
};

ImageWidget.prototype.addImageViewsToWidgetView = function(fids, widgetView) {
	try {
		var localImages = this.getLocalImages();
		var i,j;
		var self = this;
		var showPhotoOptions = function(e){
		    self.showPhotoOptions(e.source);
		};
		var localImageMismatch = false;
		var imageView = null; 
		
		for (i = 0, j = 0; i < fids.length; i++) {
			if (fids[i] === -1) {
				var localImage = localImages[0][j++];
				if (localImage) {
					imageView = this.getLocalImageView(fids[i], localImage, i);
				} else {
					localImageMismatch = true;
					continue;
				}
			} else if (localImages[fids[i]]) {
				imageView = this.getLocalImageView(fids[i], localImages[fids[i]], i);
			} else {
				imageView = this.getRemoteImageView(fids[i], i);
			}
			
			imageView.addEventListener('click', showPhotoOptions);
			
			widgetView.add(imageView);
		}
		
		if(localImages[0] && j < localImages[0].length){
		    for(j; j < localImages[0].length; j ++){
		        imageView = this.getLocalImageView(-1, localImages[0][j], i++);
		        imageView.addEventListener('click', showPhotoOptions);
                widgetView.add(imageView);
                
                // Make sure the dbValues is up to date so the next photo icon will be shown
                this.dbValues.push(-1);
		    }
		}
		
		if (localImageMismatch) {
			var expected = 0;
			for (i = 0; i < fids.length; i++) {
				expected += (fids[i] === -1) ? 1 : 0;
			}
			
			Utils.sendErrorReport('Exception in addImageViewsToWidgetView: Expected ' + expected + ' unuploaded images for but only found ' + j);
		}
	} catch (e) {
		Utils.sendErrorReport('Error in addImageViewsToWidgetView: ' + e);
	}
};

ImageWidget.prototype.getLocalImages = function() {
	var localImages = {0: []};
	try {
	    var imageNids = [0, this.getImageNid()];
	    
	    if(this.node.continuous_nid){
	        imageNids.push(this.node.continuous_nid);
	    }
	    
		var result = Database.queryList('SELECT file_path, fid, degrees, thumb_path, nid FROM _files WHERE nid IN (' + imageNids.join(',')  + ') AND field_name="' + this.instance.field_name + '" ORDER BY timestamp ASC');
		
		while(result.isValidRow()) {
			var localImage = {
				filePath: result.fieldByName('file_path'),
				thumbPath: result.fieldByName('thumb_path'),
				degrees: result.fieldByName('degrees')
			};
			
			if (result.fieldByName('fid') == '0') {
				localImages[0].push(localImage);
			} else {
				localImages[parseInt(result.fieldByName('fid'), 10)] = localImage;
			}
			result.next();
		}
		
		result.close();
		Database.close();
	} catch (e) {
		Utils.sendErrorReport('Error in getLocalImages: ' + e);
	}
	
	return localImages;
};

ImageWidget.prototype.getLocalImageView = function(fid, imageData, index) {
	var image = '';
	if (Ti.App.Properties.getBool('omadi:image:skipThumbnail', false)) {
        image = '/images/video_selected.png';
    } else {
        image = imageData.thumbPath || imageData.filePath;
    }
	var imageView = Ti.UI.createImageView({
        left : 5,
        height : 100,
        width : 100,
        image : image,
        autorotate: true,
        thumbnailLoaded : false,
        fullImageLoaded : false,
        isImageData : false,
        bigImg : null,
        touchEnabled: true,
        nid : this.getImageNid(),
        fid : fid,
        imageIndex : index,
        dbValue : fid,
        instance : this.instance,
        degrees: imageData.degrees,
        filePath : imageData.filePath
    });
    
    return imageView;
};

ImageWidget.prototype.getRemoteImageView = function(fid, index) {
	var imageView = Ti.UI.createImageView({
        left : 5,
        height : 100,
        width : 100,
        image : '/images/photo_loading.png',
        autorotate: true,
        thumbnailLoaded : false,
        fullImageLoaded : false,
        isImageData : false,
        bigImg : null,
        touchEnabled: true,
        fid : fid,
        nid : this.getImageNid(),
        imageIndex : index,
        dbValue : fid,
        instance : this.instance
    });
    
    Display.setImageViewThumbnail(imageView, this.getImageNid(), fid);
    
    return imageView;
};

ImageWidget.prototype.getTakePhotoButtonView = function() {
	var self = this;
	
	var widgetType = Ti.App.Properties.getString("photoWidget", 'take');
    if(widgetType == 'choose' && this.getPhotoChooserDir() === null){
        widgetType = 'take';
    }
    
	var takePhotoView = Ti.UI.createImageView({
        left : 5,
        height : 100,
        width : 100,
        image : widgetType == 'choose' ? '/images/choose-a-photo.png' : '/images/take_photo.png',
        autorotate: true,
        thumbnailLoaded : false,
        fullImageLoaded : false,
        isImageData : false,
        bigImg : null,
        touchEnabled: true,
        imageIndex : 0,
        instance : this.instance
    });
    
	takePhotoView.addEventListener('click', function(e) {
		e.source.setTouchEnabled(false);
		
		if (widgetType == 'choose') {
			self.openPictureChooser(e.source);
		} else {
			Display.loading();
			self.openCamera(e.source);
			Display.doneLoading();
		}
		
		setTimeout(function(){
            takePhotoView.setTouchEnabled(true);
        }, 1000);
	});
    
    return takePhotoView;
};

ImageWidget.prototype.setFid = function(i, fid) {
	try {
		if (typeof this.dbValues[i] === 'undefined' || typeof this.elements[0].getChildren()[i] === 'undefined') {
			return;
		}
		
		this.dbValues[i] = fid;
		
		var imageView = this.elements[0].getChildren()[i];
		imageView.fid = fid;
		imageView.dbValue = fid;
	} catch (error) {
		Utils.sendErrorReport('Error in ImageWidget.prototype.setFid: ' + error);
	}
};

ImageWidget.prototype.updateFidsOfNewFiles = function(newFids) {
	try {
	    var i,j;
		for (i = 0, j = 0; i < this.dbValues.length && j < newFids.length; i++) {
			if (this.dbValues[i] == -1) {
				this.setFid(i, newFids[j++]);
			}
		}
	} catch(error) {
		Utils.sendErrorReport('Error in ImageWidget.prototype.updateFidsOfNewFiles: ' + error);
	}
};

ImageWidget.prototype.getImageView = function(widgetView, index, nid, fid, filePath, thumbPath, degrees) {
    var imageView, image, widgetType;
    var self = this;
    
    widgetType = Ti.App.Properties.getString("photoWidget", 'take');
    if(widgetType == 'choose'){
        // Make sure the path is correct
        if(this.getPhotoChooserDir() === null){
            widgetType = 'take';
        }
    }
    
    if(fid === null && filePath == null){
        if(widgetType == 'choose'){
            image = '/images/choose-a-photo.png';
        }
        else{
            image = '/images/take_photo.png';
        }   
    }
    else if(typeof fid === 'number'){
        image = '/images/photo_loading.png';
    }
    else if(filePath !== null){
        
        if(Ti.App.Properties.getBool('omadi:image:skipThumbnail', false)){
            image = '/images/video_selected.png';
        }
        else{
            if(thumbPath === null || thumbPath == ''){
                image = filePath;
            }
            else{
                image = thumbPath;
            }
        }
    }
    else{
        Utils.sendErrorReport("Error in creating imageview, fid = " + fid);
    }

    imageView = Ti.UI.createImageView({
        left : 5,
        height : 100,
        width : 100,
        image : image,
        autorotate: true,
        thumbnailLoaded : false,
        fullImageLoaded : false,
        isImageData : false,
        bigImg : null,
        touchEnabled: true,
        nid : nid,
        fid : fid,
        imageIndex : index,
        dbValue : fid,
        instance : this.instance,
        degrees: degrees,
        filePath : filePath
    });

    if (filePath !== null) {
        imageView.fullImageLoaded = true;
        imageView.isImageData = true;
        imageView.dbValue = -1;
    }
    else if ( typeof fid === 'number') {
        Display.setImageViewThumbnail(imageView, nid, fid);
    }
    
    if(widgetType == 'choose'){
        imageView.addEventListener('click', function(e) {
            Ti.API.debug("In choose click");
            try{
                if(e.source.fid === null && e.source.filePath === null){
                    e.source.setTouchEnabled(false);
                    
                    self.openPictureChooser(e.source);
                    
                    // Allow the imageView to be touched again after waiting a little bit
                    setTimeout(function(){
                        imageView.setTouchEnabled(true);
                    }, 1000);
                }
                else{
                    self.showPhotoOptions(e.source);
                }
            }
            catch(ex){
                Utils.sendErrorReport("Exception imageview clicked: " + ex);
            }
        });
    }
    else{
        imageView.addEventListener('click', function(e) {
            try{
                if (e.source.fid === null && e.source.filePath === null) {
                    e.source.setTouchEnabled(false);
                    Display.loading();
                    self.openCamera(e.source);
                    Display.doneLoading();
                    
                    // Allow the imageView to be touched again after waiting a little bit
                    setTimeout(function(){
                       e.source.setTouchEnabled(true);
                    }, 1000);
                }
                else {
                    
                    self.showPhotoOptions(e.source);
                }
            }
            catch(ex){
                Utils.sendErrorReport("Exception in imageview click 2: " + ex);
            }
        });
    }

    return imageView;
};

ImageWidget.prototype.showPhotoOptions = function(imageView){
    var dialog, isDeletePhoto, options;
    var self = this;
    
    if (!this.instance.can_edit) {
        Display.displayFullImage(imageView);
        return;
    }
    
    options = ['View Photo'];
    
    if(imageView.dbValue <= 0 && Utils.getPhotoWidget() == 'take'){
        isDeletePhoto = true;
        options.push('Delete Photo');
    }
    else{
        isDeletePhoto = false;
        options.push('Remove Photo');
    }
    
    dialog = Ti.UI.createOptionDialog({
        options: options,
        title: 'Photo Options',
        imageView: imageView,
        isDeletePhoto: isDeletePhoto
    });
    
    dialog.addEventListener('click', function(event) {
		self.clickedPhotoOption(event);
    });
    dialog.show();
};

ImageWidget.prototype.clickedPhotoOption = function(e){
    var dialog, message, title;
    var self = this;
    try{
        if(e.index === 0){
            Display.displayFullImage(e.source.imageView);
        }
        else if(e.index === 1){
            
            if(e.source.isDeletePhoto){
                message = "The photo will be deleted.";
                title = "Delete Photo";
            }
            else{
                message = "The photo will be removed.";
                title = "Remove Photo";
            }
            
            dialog = Ti.UI.createAlertDialog({
                buttonNames: ['OK', 'Cancel'],
                title: title,
                message: message,
                imageView: e.source.imageView,
                isDeletePhoto: e.source.isDeletePhoto
            });
            
            dialog.addEventListener('click', function(e2){  
                var filePath = null, imageViews, newPhotoView, parentView;
                try{
                    if(e2.index === 0){
                        
                        if(typeof e2.source.imageView.filePath !== 'undefined' && e2.source.imageView.filePath != null){
                            filePath = e2.source.imageView.filePath;   
                        }
                        
                        parentView = self.elements[0];
                        imageViews = parentView.children;
                        
                        if(imageViews.length > 1){
                            newPhotoView = imageViews[imageViews.length - 1];
                            if(newPhotoView.nid === null && newPhotoView.fid === null){
                                Ti.API.debug("Moving the new photo delta down one");
                                newPhotoView.imageIndex --;
                            }
                        }
                        
                        // Remove the image from the scroll view before the file reference or data is deleted
                        
                        parentView.remove(e2.source.imageView);
                        
                        if (e.source.isDeletePhoto) {
	                        if(filePath !== null){
	                            Ti.API.debug("Removing file reference in DB: " + filePath + " " + e2.source.isDeletePhoto);
	                            // Do the removal for an image stored on the phone
	                            ImageWidget.deletePhotoUploadByPath(filePath, e2.source.isDeletePhoto); 
	                        }
	                        else{
	                            Utils.sendErrorReport("Trying to delete image, filepath is null");
                            }
                        }
                    }
                }
                catch(ex){
                    Utils.sendErrorReport("in clicked photo option dialog: " + ex);
                }
            });
            dialog.show();
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in clicked photo option: " + ex);
    }
};

ImageWidget.prototype.getPhotoChooserDir = function(){
    var photoCameraPath, retval = null;
    
    photoCameraPath = Ti.App.Properties.getString("photoCameraPath", "");
    
    if(photoCameraPath != ""){
   
        retval = Ti.Filesystem.getFile(photoCameraPath);
        
        if(!retval.isDirectory()){
            retval = null;
        }
    }
    return retval;
};

ImageWidget.prototype.openPictureChooser = function(imageView){
    var pictureWindow, table, photoDir, imageStrings, i, recentFiles, tempFile, now,
        earliestTimestamp, rows, modified, row, extension, checkbox, 
        topBar, buttons, useButton, cancelButton, parentView, allImageViews, 
        filename, allUsedFileNames;
    var self = this;
    
    try{
        parentView = self.elements[0];
        
        allImageViews = parentView.getChildren();
        allUsedFileNames = [];
        
        for(i = 0; i < allImageViews.length; i ++){
            if(typeof allImageViews[i].filePath !== 'undefined' && allImageViews[i].filePath !== null && allImageViews[i].filePath.length > 0){
                filename = allImageViews[i].filePath.replace(/^.*[\\\/]/, '');
                allUsedFileNames.push(filename);
                Ti.API.debug("used: " + filename);
            }       
        }
        
        pictureWindow = Ti.UI.createView({
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#fff'
        });
        
        photoDir = this.getPhotoChooserDir();
        
        if(photoDir !== null){
        
            recentFiles = [];
            
            now = Utils.getUTCTimestampServerCorrected();
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
                    height: 75
                });
                
                useButton = Ti.UI.createButton({
                    title: 'Use Photos', 
                    width: '50%',
                    left: 0,
                    bottom: 0,
                    disabled: true,
                    imageView: imageView,
                    instance: this.instance,
		            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		            backgroundGradient: Display.backgroundGradientGray,
		            borderColor: '#999',
		            borderWidth: 1,
		            borderRadius: 10,
		            color: '#eee'
                });
                
                useButton.addEventListener('click', function(e){
                    var i, file, localImageView, newImageView, chooseNextImageView, dbPath, parentView;
                    try{
                        localImageView = e.source.imageView;
                        parentView = self.elements[0];
                        
                        for(i = 0; i < rows.length; i ++){
                            
                            if(rows[i].isChecked){
                                file = rows[i].photoFile;
                                
                                Ti.API.debug(file.getNativePath());
                                dbPath = file.getNativePath();
                                
                                self.saveFileInfo(localImageView, dbPath, "", 0, file.getSize(), 'image');
                                
                                localImageView.filePath = dbPath;
                                
                                if (localImageView.instance.settings.cardinality == -1 || (localImageView.imageIndex + 1) < localImageView.instance.settings.cardinality) {
                                    newImageView = self.getImageView(parentView, localImageView.imageIndex, null, null, dbPath, null, 0);
                                    chooseNextImageView = self.getTakePhotoButtonView();
                                    
                                    parentView.add(newImageView);
                                    parentView.add(chooseNextImageView);
                                    
                                    parentView.setContentWidth(parentView.getContentWidth() + 110);
                                    parentView.remove(localImageView);
                                    imageView = null;
                                    
                                    localImageView = chooseNextImageView;
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
                    }
                    catch(ex){
                        Utils.sendErrorReport("Exception in image use button: " + ex);
                    }
                });
                
                cancelButton = Ti.UI.createButton({
                    title: 'Cancel',
                    width: '50%',
                    right: 0,
                    style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		            backgroundGradient: Display.backgroundGradientGray,
		            borderColor: '#999',
		            borderWidth: 1,
		            borderRadius: 10,
		            color: '#eee',
                    bottom: 0
                });
                
                cancelButton.addEventListener('click', function(){
                    var i;
                    try{
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
                    }
                    catch(ex){
                        Utils.sendErrorReport("Exception with cancel button in image: " + ex);
                    }
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
                    // Get the filename from the path
                    filename = imageStrings[i].replace(/^.*[\\\/]/, '');
                	
                    if(allUsedFileNames.indexOf(filename) == -1){
                    
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
                }
                
                if(recentFiles.length > 0){
                    recentFiles = recentFiles.sort(Utils.fileSortByModified);
                    
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
                            text: Utils.getTimeAgoStr(recentFiles[i].modifiedTimestamp / 1000),
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
                        
                        row.addEventListener('click', this.imageRowClicked);
                        
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
            
            this.formObj.win.add(pictureWindow);
        }
        else{
            alert("Error: Could not open photo chooser.");
            Utils.sendErrorReport("Could not open photo chooser: " + this.instance.label);
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in Android photo chooser window open: " + ex);
    }
};

ImageWidget.prototype.imageRowClicked = function(e){
    try{
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
    }
    catch(ex){
        Utils.sendErrorReport("Exception in imagerowclicked: " + ex);
    }
};

ImageWidget.prototype.openCamera = function(imageView) {
    var blankOverlay, storageDirectory, storageDirectoryFile,
        overlayView, captureButton, doneButton, flexible, 
        flashMode, flashButton, navBar, maxPhotos, cardinality;
    var self = this;
    
    if (Ti.App.isAndroid) {
        if (Ti.Media.isCameraSupported) {
           
            blankOverlay = Ti.UI.createView();
            
            storageDirectoryFile = Ti.Filesystem.getFile(Ti.Filesystem.getExternalStorageDirectory());
            storageDirectory = storageDirectoryFile.getNativePath();
            
            maxPhotos = -1;
            if(typeof imageView.instance.settings.cardinality !== 'undefined'){
                cardinality = parseInt(imageView.instance.settings.cardinality, 10);
                if(!isNaN(cardinality) && cardinality > 0){
                    maxPhotos = cardinality - imageView.imageIndex;
                }
            }
            
            var close = function() {
                var newImageView, i, addedPhoto, takeNextPhotoView, lastIndex, cardinality, parentView;
                 try{
                     if(typeof imageView.addedPhotos !== 'undefined'){
                        
                        imageView.hide();
                        imageView.setWidth(0);
                        imageView.setLeft(0);
                        
                        lastIndex = 0;
                        
                        parentView = self.elements[0];
                         
						var missingFiles = [];
                        for(i = 0; i < imageView.addedPhotos.length; i ++){
                            addedPhoto = imageView.addedPhotos[i];
                            
                            var file = Ti.Filesystem.getFile(addedPhoto.filePath);
                            if (!file.exists()) {
                                missingFiles.push = [addedPhoto];
                                continue;
                            }
                            
                            newImageView = self.getImageView(parentView, addedPhoto.imageIndex, null, null, addedPhoto.filePath, "", addedPhoto.degrees);
                            parentView.add(newImageView);
                            lastIndex = addedPhoto.imageIndex;  
                        }
                        
                        if (missingFiles.length > 0) {
                            Utils.sendErrorReport(missingFiles.length + ' of ' + imageView.addedPhotos.length + ' images missing on camera callback: ' + JSON.stringify({
                                missing: missingFiles,
                                added: imageView.addedPhotos
                            }));
                            if (imageView.addedPhotos.length > 1) {
                                alert(missingFiles.length + ' of the photos you just took ' + (missingFiles.length > 1 ? 'were' : 'was') + ' not saved properly. Please try again.');
                            } else {
                                alert('The photo you just took was not saved properly. Please try again.');
                            }
                        }
                        
                        cardinality = -1;
                        if(typeof imageView.instance.settings.cardinality !== 'undefined'){
                            cardinality = parseInt(imageView.instance.settings.cardinality, 10);
                            if(isNaN(cardinality)){
                                cardinality = -1;
                            }
                        }
                        
                        // Make sure we never lose a photo due to a crash
                        self.formObj.saveForm('continuous');
                        
                        Ti.API.debug("Cardinality: " + cardinality);
                        Ti.API.debug("last Index: " + lastIndex);
                        
                        if(cardinality == -1 || (lastIndex + 1) < cardinality){
                            takeNextPhotoView = self.getTakePhotoButtonView();
                            parentView.add(takeNextPhotoView);
                        }
                        
                        parentView.setContentWidth(parentView.getContentWidth() + ((imageView.addedPhotos.length - missingFiles.length) * 110));
                        
                        // Remove the original imageView from the parent
                        setTimeout(function(){
                            try{
                                parentView.remove(imageView);
                            }
                            catch(ex2){
                                Utils.sendErrorReport("Exception removing image view 1 " + ex2);
                            }
                        }, 1000);                           
                     }
                 }
                 catch(ex){
                     Utils.sendErrorReport("Exception in Android saving image: " + ex);
                 }
            };
            
            this.cameraAndroid.showCamera({
                maxPhotos : maxPhotos,
                sendError : function(event){
                    if(typeof event.message !== 'undefined'){
                        Utils.sendErrorReport(event.message);
                    }
                },
                addedPhoto : function(event){
                    
                   var filePath, file, degrees, 
                        thumbPath, startIndex, index, photoIndex;
                    
                    filePath = event.filePath;
                    thumbPath = '';
                    degrees = event.degrees;
                    
                    startIndex = imageView.imageIndex;
                    photoIndex = event.photoIndex;
                    
                    index = startIndex + photoIndex;
                    
                    imageView.filePath = filePath;
                    file = Ti.Filesystem.getFile(filePath);
                    // Allow the imageView to be touched again with an event
                    imageView.setTouchEnabled(true);
                    
                    if (!file.exists()) {
                        Utils.sendErrorReport('Image didn\'t save properly after capture');
                        alert('There was an error saving the image. Please try again.');
                        return;
                    }
                    
                    if(typeof imageView.addedPhotos === 'undefined'){
                        imageView.addedPhotos = [];
                    }
                    
                    imageView.addedPhotos.push({
                        filePath: filePath,
                        degrees: degrees,
                        imageIndex: index
                    });
                    
                    Ti.API.debug("File: " + filePath);
                    Ti.API.debug("Saving to delta: " + index);
                    
                    self.saveAndroidFileInfo(imageView.instance.field_name, index, filePath, thumbPath, degrees, file.getSize(), 'image');
                    
                },
                success : function() {
                    Ti.API.info('Photo complete success in JS');
                    close();
                },
                error : function(error) {
                    Utils.sendErrorReport("Error capturing a photo" + JSON.stringify(error));
         
                    Ti.API.info('Captured Image - Error: ' + error.code + " :: " + error.message);
                    if (typeof error.code == Titanium.Media.NO_CAMERA) {
                        alert('No Camera in device');
                    }
                    else{
                        alert(error.message);
                        Utils.sendErrorReport("Photo error: " + error.code + ": " + error.message);
                    }
                    close();
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
    else { // this is iOS
        try {
            
            overlayView = Ti.UI.createView({
                zIndex: 100    
            });
            
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

            captureButton.addEventListener('click', function() {
                try{
                    Ti.Media.takePicture();
                }
                catch(ex){
                    Utils.sendErrorReport("Exception in capture button click: " + ex);
                }
            });
            doneButton.addEventListener('click', function() {
                try{
                    Ti.Media.hideCamera();
                }
                catch(ex){
                    Utils.sendErrorReport("Exception in donebutton click for photo: " + ex);
                }
            });

            flashButton.addEventListener('click', function(evt) {
                try{
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
                }
                catch(ex){
                    Utils.sendErrorReport("Exception in flash button click: " + ex);
                }
            });

            Ti.Media.showCamera({

                success : function(event) {
                    var newImageView, imageFile, filePath, thumbPath, thumbFile, thumbBlob, takeNextPhotoView, parentView;
                    
                    try{
                        Display.loading("Saving Photo...", self.formObj.win);
                        
                        imageView.mimeType = event.media.mimeType;
                        
                        filePath = Ti.Filesystem.applicationDataDirectory + "p_" + Utils.getUTCTimestamp() + '.jpg';
                        imageFile = Ti.Filesystem.getFile(filePath);
                        
                        imageFile.write(event.media);
                        imageFile.setRemoteBackup(false);
                        
                        Display.doneLoading();
                        Display.loading("Creating Thumbnail...", self.formObj.win);
                        
                        thumbPath = Ti.Filesystem.applicationDataDirectory + "p_" + Utils.getUTCTimestamp() + '_thumb.jpg';
                        thumbFile = Ti.Filesystem.getFile(thumbPath);
                        
                        thumbBlob = ImageFactory.imageAsThumbnail(event.media, {
                            size: 100, 
                            borderSize: 0, 
                            cornerRadius: 0, 
                            quality: ImageFactory.QUALITY_HIGH 
                        });
                        
                        thumbFile.write(thumbBlob);
                        thumbFile.setRemoteBackup(false);
                                
                        self.saveFileInfo(imageView, filePath, thumbPath, 0, event.media.length, 'image');
                        
                        try{
                            parentView = self.elements[0];
                            
                            if (imageView.instance.settings.cardinality == -1 || (imageView.imageIndex + 1) < imageView.instance.settings.cardinality) {
                                
                                newImageView = self.getImageView(parentView, imageView.imageIndex, null, null, filePath, thumbPath, 0);
                                takeNextPhotoView = self.getTakePhotoButtonView();
                                
                                parentView.add(newImageView);
                                parentView.add(takeNextPhotoView);
                                
                                parentView.setContentWidth(parentView.getContentWidth() + 110);
                                parentView.remove(imageView);
                                imageView = null;
                                
                                // Allow the newImageView time to show up, and then click it
                                setTimeout(function(){
                                     takeNextPhotoView.fireEvent('click');
                                     Display.doneLoading();
                                }, 100);
                            }
                            else{
                                
                                newImageView = self.getImageView(parentView, imageView.imageIndex, null, null, filePath, thumbPath, 0);
                                
                                parentView.add(newImageView);
                                parentView.remove(imageView);
                                imageView = null;
                                
                                Display.doneLoading();
                            }
                        }
                        catch(ex1){
                            Utils.sendErrorReport("Exception setting up another imageview in iOS: " + ex1);
                        }
                        
                        // Make sure we never lose a photo due to a crash
                        self.formObj.saveForm('continuous');
                    }
                    catch(ex){
                        Utils.sendErrorReport("Exception saving iOS photo: " + ex);
                    }
                },
                error : function(error) {
                    
                    Utils.sendErrorReport("Problem opening iOS camera: " + JSON.stringify(error));
                    
                    Ti.API.error('Captured Image - Error: ' + error.code + " :: " + error.message);
                    if (error.code == Titanium.Media.NO_CAMERA) {
                        alert('No Camera in device');
                    }
                    else{
                        alert("Problem opening camera: " + error.message);
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
                Utils.sendErrorReport("iOS flash error: " + ex);
            }
        }
        catch(wrapperEx) {
            Utils.sendErrorReport("iOS camera error: " + wrapperEx);
        }
    }
};

ImageWidget.prototype.saveFileInfo = function(imageView, filePath, thumbPath, degrees, filesize, type) {
    var nid, mime, imageName, timestamp, fieldName, 
        imageIndex, location, uid, clientAccount;

    try {
        nid = 0;
        
        mime = imageView.mimeType;
        imageName = filePath.replace(/^.*[\\\/]/, '');
        imageView.dbValue = -1;
        imageView.fid = -1;
        imageView.degrees = degrees;
        imageView.filePath = filePath;   
        imageView.thumbPath = thumbPath;
        
        timestamp = Utils.getUTCTimestampServerCorrected();
        fieldName = imageView.instance.field_name;
        imageIndex = imageView.imageIndex;
        
        Ti.API.debug("Saved Path: " + filePath);
        
        location = Location.getLastLocation();
        
        uid = Utils.getUid();
        clientAccount = Utils.getClientAccount();

        Database.queryList("INSERT INTO _files (nid, timestamp, file_path, field_name, file_name, delta, latitude, longitude, accuracy, degrees, thumb_path, filesize, bytes_uploaded, type, uid, client_account) VALUES ('0','" + timestamp + "','" + filePath + "','" + fieldName + "','" + imageName + "'," + imageIndex + ",'" + location.latitude + "','" + location.longitude + "'," + location.accuracy + "," + degrees + ",'" + thumbPath + "'," + filesize + ",0,'" + type + "'," + uid + ",'" + clientAccount + "')");
        Database.close();
    }
    catch(ex) {
		Utils.sendErrorReport("Problem saving the photo to the database in saveFileInfo: " + ex);
        alert("Problem saving the photo to the database: " + ex);
    }
};

ImageWidget.prototype.saveAndroidFileInfo = function(fieldName, imageIndex, filePath, thumbPath, degrees, filesize) {
    var nid, imageName, timestamp, location, uid, clientAccount, sql;

    try {
        nid = 0;
        
        imageName = filePath.replace(/^.*[\\\/]/, '');
        timestamp = Utils.getUTCTimestampServerCorrected();
        
        Ti.API.debug("Saved Android Path: " + filePath);
        
        location = Location.getLastLocation();
        
        // TODO: check for a location that has a lat and lng of 0, and grab a new GPS coordinate now to save now or before the photo is uploaded
        
        uid = Utils.getUid();
        clientAccount = Utils.getClientAccount();
        sql = "INSERT INTO _files (nid, timestamp, file_path, field_name, file_name, delta, latitude, longitude, accuracy, degrees, thumb_path, filesize, bytes_uploaded, type, uid, client_account) VALUES ('0','" + timestamp + "','" + filePath + "','" + fieldName + "','" + imageName + "'," + imageIndex + ",'" + location.latitude + "','" + location.longitude + "'," + location.accuracy + "," + degrees + ",'" + thumbPath + "'," + filesize + ",0,'" + 'image' + "'," + uid + ",'" + clientAccount + "')";
        
        Database.queryList(sql);
        Database.close();
    }
    catch(ex) {
        Utils.sendErrorReport("Problem saving the photo to the database in saveAndroidFileInfo: " + ex);
        alert("Problem saving the photo to the database: " + ex);
    }
};

ImageWidget.prototype.cleanUp = function(){
    var j;
    Ti.API.debug("in image widget cleanup");
    
    try{
        for(j = 0; j < this.elements.length; j ++){
            this.fieldView.remove(this.elements[j]);
            this.elements[j] = null;
        }
        
        this.fieldView = null;
        this.fieldViewWrapper = null;
        this.formObj = null;
        this.node = null;
        this.dbValues = null;
        this.textValues = null;
        this.nodeElement = null;
        this.instance = null;
        
        Ti.API.debug("At end of image widget cleanup");
    }
    catch(ex){
        try{
            Utils.sendErrorReport("Exception cleaning up image widget field: " + ex);
        }
        catch(ex1){}
    }
};

ImageWidget.deletePhotoUploadByPath = function(filePath, deleteFile){
    var result, id, nid, delta;
    
    id = null;
    result = Database.queryList("SELECT id, nid, delta FROM _files WHERE file_path = '" + Utils.dbEsc(filePath) + "'");
    if(result.isValidRow()){
        id = result.fieldByName('id', Ti.Database.FIELD_TYPE_INT);
        nid = result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT);
        delta = result.fieldByName('delta', Ti.Database.FIELD_TYPE_INT);
        
        // Move over the other photos still in the queue for uploads
        Database.queryList("UPDATE _files SET delta = (delta - 1) WHERE nid = " + nid + " AND delta > " + delta);
    }
    else{
        Utils.sendErrorReport("Could not find filepath in database: " + filePath);
    }
    
    result.close();
    Database.close();
    
    if(id !== null){
        Ti.API.debug("Photo ID to delete: " + id);
        ImageWidget.deletePhotoUpload(id, deleteFile);
    }
};

ImageWidget.deletePhotoUpload = function(id, deleteFile) {
    var file, result, filePath = null, thumbPath = null, thumbFile;
    
    if(typeof deleteFile !== 'undefined' && deleteFile == true){
        result = Database.queryList("SELECT file_path, thumb_path FROM _files WHERE id = " + id);
        if(result.isValidRow()){
            filePath = result.fieldByName('file_path');
            thumbPath = result.fieldByName('thumb_path');
        }
    }
    else{
        deleteFile = false;
    }
    
    Database.queryList("DELETE FROM _files WHERE id = " + id);
    Database.close();
    
    if(filePath !== null){
        file = Ti.Filesystem.getFile(filePath);
        if(file.exists() && file.isFile()){
            file.deleteFile();
        }
        
        if(thumbPath != null && thumbPath.length > 10){
            thumbFile = Ti.Filesystem.getFile(thumbPath);
            if(thumbFile.exists() && thumbFile.isFile()){
                thumbFile.deleteFile();
            }
        }
    }
};


ImageWidget.getFieldObject = function(FormObj, instance, fieldViewWrapper){
    return new ImageWidget(FormObj, instance, fieldViewWrapper);
};

module.exports = ImageWidget;

