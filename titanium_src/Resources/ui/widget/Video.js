/*jslint eqeq:true,plusplus:true,vars:true*/

var Utils = require('lib/Utils');
var Display = require('lib/Display');
var Database = require('lib/Database');
var Location = require('lib/Location');

function VideoWidget(formObj, instance, fieldViewWrapper){"use strict";
    this.formObj = formObj;
    this.instance = instance;
    this.fieldView = null;
    this.node = formObj.node;
    this.dbValues = [];
    this.textValues = [];
    this.elements = [];
    this.nodeElement = null;
    this.numVisibleFields = 1;
    this.fieldViewWrapper = fieldViewWrapper;
    
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

VideoWidget.prototype.getFieldView = function(){"use strict";
    
    var i, element, addButton;
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    this.fieldView.add(this.formObj.getRegularLabelView(this.instance));
    
    // Add the actual fields
    this.elements[0] = this.getNewElement(0);
    this.fieldView.add(this.elements[0]);
    this.fieldView.add(this.formObj.getSpacerView());
    
    return this.fieldView;
};

VideoWidget.prototype.redraw = function(){"use strict";
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

VideoWidget.prototype.getNewElement = function(index){"use strict";
    var widgetView, dbValues, imageData, degreeData, i, j, localDelta, imageNid, deltaData, thumbData;

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

    Ti.API.debug("Creating video field: " + this.instance.label);

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

    this.addVideoViewsToWidgetView(dbValues, widgetView);

    var contentWidth = 110 * dbValues.length;
    if (this.instance.can_edit && (this.instance.settings.cardinality == -1 || (dbValues.length < this.instance.settings.cardinality))) {
        widgetView.add(this.getChooseVideoButtonView(widgetView));
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

VideoWidget.prototype.getChooseVideoButtonView = function(widgetView) {"use strict";
    var self = this;
    
    var chooseVideoView = Ti.UI.createImageView({
        left : 5,
        height : 100,
        width : 100,
        image : '/images/choose_a_video.png',
        autorotate: true,
        thumbnailLoaded : false,
        fullImageLoaded : false,
        isImageData : false,
        bigImg : null,
        touchEnabled: true,
        imageIndex : 0,
        instance : this.instance,
        parentView : widgetView
    });
    
    chooseVideoView.addEventListener('click', function(e) {
 
        e.source.setTouchEnabled(false);
        Display.loading();
        self.openVideoChooser(e.source);
        Display.doneLoading();
        
        // Allow the imageView to be touched again after waiting a little bit
        setTimeout(function(){
            chooseVideoView.setTouchEnabled(true);
        }, 1000);
    });
    
    return chooseVideoView;
};

VideoWidget.prototype.getImageNid = function() {"use strict";
    var imageNid = this.formObj.nid;
    if(typeof this.formObj.origNid !== 'undefined'){
        imageNid = this.formObj.origNid;
    }
    return imageNid;
};

VideoWidget.prototype.addVideoViewsToWidgetView = function(fids, widgetView) {"use strict";
    try {
		var localImages = this.getNonUploadedVideos();
		var i,j;
		var self = this;
		var showPhotoOptions = function(e){
		    self.showPhotoOptions(e.source);
		};
		var localImageMismatch = false;
		
		for (i = 0, j = 0; i < fids.length; i++) {
			var imageView = null; 
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
		
		if (localImageMismatch) {
			var expected = 0;
			for (i = 0; i < fids.length; i++) {
				expected += (fids[i] === -1) ? 1 : 0;
			}
			
			Utils.sendErrorReport('Exception in addVideoViewsToWidgetView: Expected ' + expected + ' unuploaded videos for but only found ' + j);
		}
    } catch (e) {
        Utils.sendErrorReport('Error in addVideoViewsToWidgetView: ' + e);
    }
};

VideoWidget.prototype.getLocalImageView = function(fid, imageData, index) {"use strict";
    var image = '/images/video_selected.png';
    var self = this;
    
    if(Ti.App.isIOS){
        var videoFile = Ti.Filesystem.getFile(imageData.filePath);
        
        if(videoFile.exists()){
            Ti.API.debug("Video file exists...");
            try{
                var thumbVideo = Ti.Media.createVideoPlayer({
                    width: 100,
                    height: 100,
                    autoplay: false,
                    media: videoFile
                });
                
                image = thumbVideo.thumbnailImageAtTime(0, Ti.Media.VIDEO_TIME_OPTION_NEAREST_KEYFRAME);
            }
            catch(ex){
                Ti.API.error("Could not show the local video thumbnail.");
                image = '/images/video_selected.png';
            }
        }
    }
    
    var imageView = Ti.UI.createImageView({
        left : 5,
        height : 100,
        width : 100,
        image : image,
        autorotate: true,
        thumbnailLoaded : false,
        fullImageLoaded : true,
        isImageData : true,
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
    
    imageView.addEventListener('click', function(e){
        self.openVideoPlayer(e.source); 
    });
    
    return imageView;
};

VideoWidget.prototype.getRemoteImageView = function(fid, index) {"use strict";
	var self = this;
    var imageView = Ti.UI.createImageView({
        left : 5,
        height : 100,
        width : 100,
        image : '/images/video_loading.png',
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
        instance : this.instance,
        parentView : this.elements[0]
    });
    
    Display.setImageViewVideoThumbnail(imageView, this.getImageNid(), fid, this.instance.field_name);
    
    imageView.addEventListener('click', function(e){
        self.openVideoPlayer(e.source); 
    });
    
    return imageView;
};

VideoWidget.prototype.getNonUploadedVideos = function() {"use strict";
    var localImages = {0: []};
    try {
        var result = Database.queryList('SELECT file_path, fid, degrees, thumb_path FROM _files WHERE nid IN (' + this.getImageNid() + ', ' + (this.node.continuous_nid || 0) + ', 0) AND finished = 0 AND field_name="' + this.instance.field_name + '" ORDER BY timestamp ASC');
        
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
        Utils.sendErrorReport('Error in getNonUploadedVideos: ' + e);
    }
    
    return localImages;
};

VideoWidget.prototype.getImageView = function(widgetView, index, nid, fid, degrees) {"use strict";
    var imageView, transform, rotateDegrees, image, widgetType, isFilePath, thumbVideo, videoFile;
    var self = this;
    
    isFilePath = false;
    
    if (fid !== null && typeof fid !== 'number') {
        isFilePath = true;
    }
    
    widgetType = 'choose';
    
    if(fid === null){
        if(widgetType == 'choose'){
            image = '/images/choose_a_video.png';
        }
        else{
            image = '/images/take_video.png';
        }   
    }
    else if(typeof fid === 'number'){
        image = '/images/video_loading.png';
    }
    else{
        image = fid;
    }

    imageView = Ti.UI.createImageView({
        left : 5,
        width: 100,
        height: 100,
        image : image,
        autorotate: true,
        thumbnailLoaded : false,
        fullImageLoaded : false,
        isImageData : false,
        bigImg : null,
        touchEnabled: true,
        nid : nid,
        fid : fid,
        widgetView : widgetView,
        imageIndex : index,
        dbValue : fid,
        instance : widgetView.instance,
        parentView : widgetView,
        degrees: degrees
    });

    if (isFilePath) {
        imageView.fullImageLoaded = true;
        imageView.isImageData = true;
        imageView.dbValue = -1;
        imageView.filePath = fid;
        
        videoFile = Ti.Filesystem.getFile(imageView.filePath);
        
        if(Ti.App.isIOS){
            thumbVideo = Ti.Media.createVideoPlayer({
                width: 100,
                height: 100,
                autoplay: false,
                media: videoFile
            });
        
            imageView.image = thumbVideo.thumbnailImageAtTime(0, Ti.Media.VIDEO_TIME_OPTION_NEAREST_KEYFRAME);
        }
        else{
            imageView.image = '/images/video_selected.png';
            imageView.height = 100;
            imageView.width = 100;
        }
    }
    else if ( typeof fid === 'number') {
        Display.setImageViewVideoThumbnail(imageView, nid, fid, imageView.instance.field_name);
    }
 
    imageView.addEventListener('click', function(e) {
        var dialog;
        try{
            if(e.source.fid === null){
                e.source.setTouchEnabled(false);
                Display.loading();
                self.openVideoChooser(e.source);
                Display.doneLoading();
                
                // Allow the imageView to be touched again after waiting a little bit
                setTimeout(function(){
                    imageView.setTouchEnabled(true);
                }, 1000);
            }
            else{
                self.openVideoPlayer(e.source);
            }
        }
        catch(ex){
            Utils.sendErrorReport("Exception in video image view click: " + ex);
        }
    });
   
    return imageView;
};

VideoWidget.prototype.openVideoPlayer = function(imageView){"use strict";
    var videoFile, player, toolbar, back, space, label, http, s3URL;
    var self = this;
    
    this.videoWin = Titanium.UI.createWindow({
        backgroundColor : '#eee',
        navBarHidden: true,
        layout: 'vertical',
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
    });
    
    if(Ti.App.isIOS){
        
        back = Ti.UI.createButton({
            title : 'Back',
            style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
            instance : this.instance
        });
        
        back.addEventListener('click', function(e) {
            try{
                self.videoPlayer.stop();
                self.videoPlayer = null;
                
                self.videoWin.close();
                self.videoWin = null;
            }
            catch(ex){
                Utils.sendErrorReport("Exception in video back button pressed: " + ex);
            }
        });
    
        space = Titanium.UI.createButton({
            systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
        });
        
        label = Titanium.UI.createButton({
            title : 'Video Playback',
            color : '#fff',
            ellipsize : true,
            wordwrap : false,
            width : 200,
            style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
        });
    
        // create and add toolbar
        toolbar = Ti.UI.iOS.createToolbar({
            items : [back, space, label, space],
            top : 0,
            left: 0,
            borderTop : false,
            borderBottom : true,
            zIndex: 100
        });
        
        if(Ti.App.isIOS7){
            toolbar.top = 20;
        }
        
        this.videoWin.add(toolbar);
    }
    
    if(typeof imageView.filePath !== 'undefined'){
        
        videoFile = Ti.Filesystem.getFile(imageView.filePath);
        
        if(videoFile.exists() && videoFile.isFile()){
        
            Ti.API.debug("Video URL: " + imageView.filePath);
            if(Ti.App.isAndroid){
                Ti.API.debug("Video filesize: " + videoFile.getSize());
            }
            
            this.videoPlayer = Ti.Media.createVideoPlayer({
                allowsAirPlay: true,
                autoplay: true,
                backgroundColor: 'Transparent',
                fullscreen: false,
                height: Ti.UI.FILL,
                width: Ti.UI.FILL,
                
                url: imageView.filePath,
                top: 0
            });
            
            this.videoWin.add(this.videoPlayer);
            this.videoWin.open();
        }
        else{
            alert("The video file was not found.");
        }
    }
    else{
        
        http = Ti.Network.createHTTPClient({
            enableKeepAlive: false,
            validatesSecureCertificate: false,
            instance: this.instance,
            timeout: 30000
        });
        http.onload = function(e){
            /*global isJsonString*/
           
            var json;
            
            if(this.responseText != null && isJsonString(this.responseText)){
                json = JSON.parse(this.responseText);
                
                if(json.success == true){
                    Ti.API.debug("S3 URL: " + json.url);
                    
                    self.videoPlayer = Ti.Media.createVideoPlayer({
                        allowsAirPlay: true,
                        autoplay: true,
                        backgroundColor: 'Transparent',
                        fullscreen: false,
                        height: Ti.UI.FILL,
                        width: Ti.UI.FILL,
                        url: json.url,
                        top: 0
                    });
                    
                    self.videoWin.add(self.videoPlayer);
                    self.videoWin.open();
                }
                else{
                    alert("An error occurred retrieving the file: " + json.error);
                }
            }
            else{
                alert("An error occurred finding the file.");
            }
        };
        
        http.onerror = function(e){
            alert("Could not load the video: " + e.error);
        };
        
        s3URL = Ti.App.DOMAIN_NAME + '/js-file/s3/' + imageView.nid + '/' + imageView.fid + '/' + imageView.instance.field_name + '.json';
        
        Ti.API.info("S3: " + s3URL);
        
        http.open('GET', s3URL);

        http.setRequestHeader("Content-Type", "application/json");
        Utils.setCookieHeader(http);
        
        http.send();
    }
};

VideoWidget.prototype.openVideoChooser = function(imageView){"use strict";
	var self = this;

    if(Ti.App.isAndroid){
        var intent = Titanium.Android.createIntent({
            action : Ti.Android.ACTION_PICK,
            type : "video/*"
        });
        
        intent.addCategory(Ti.Android.CATEGORY_DEFAULT);
        
        Ti.Android.currentActivity.startActivityForResult(intent, function(e) {
            var filePath, source, movieFile, newImageView, takeNextPhotoView;
            
            if (e.error) {
                Ti.UI.createNotification({
                    duration : Ti.UI.NOTIFICATION_DURATION_SHORT,
                    message : 'Error: ' + e.error
                }).show();
            } 
            else {
                if (e.resultCode === Titanium.Android.RESULT_OK) {
                    filePath = e.intent.data;
                    source = Ti.Filesystem.getFile(filePath);
                    
                    Display.loading("Please Wait...");
                    
                    if(Ti.Filesystem.isExternalStoragePresent()){
                        movieFile = Titanium.Filesystem.getFile(Titanium.Filesystem.externalStorageDirectory, "v_" + Utils.getUTCTimestamp() + '.mp4');
                    }
                    else{
                        movieFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "v_" + Utils.getUTCTimestamp() + '.mp4');    
                    }
                    
                    source.copy(movieFile.nativePath);
                    filePath = movieFile.nativePath;
                    
                    Ti.API.debug(filePath);
                    Ti.API.debug("filesize: " + movieFile.getSize());
                    Ti.API.debug("Is external: " + Ti.Filesystem.isExternalStoragePresent());
                    
                    self.saveFileInfo(imageView, filePath, '', 0, movieFile.getSize(), 'video');
                    
                    if (imageView.instance.settings.cardinality == -1 || (imageView.imageIndex + 1) < imageView.instance.settings.cardinality) {
                                
                        newImageView = self.getImageView(imageView.parentView, imageView.imageIndex, null, filePath, 0);
                        takeNextPhotoView = self.getImageView(imageView.parentView, imageView.imageIndex + 1, null, null, 0);
                       
                        newImageView.image = '/images/video_selected.png';
                        newImageView.height = 100;
                        newImageView.width = 100;
                        
                        
                        imageView.parentView.add(newImageView);
                        imageView.parentView.add(takeNextPhotoView);
                        
                        imageView.parentView.setContentWidth(imageView.parentView.getContentWidth() + 110);
                        imageView.parentView.remove(imageView);
                        imageView = null;
                    }
                    else{
                        
                        newImageView = self.getImageView(imageView.parentView, imageView.imageIndex, null, filePath, 0);
                       
                        newImageView.image = '/images/video_selected.png';
                        newImageView.height = 100;
                        newImageView.width = 100;
                        
                        imageView.parentView.add(newImageView);
                        imageView.parentView.remove(imageView);
                        imageView = null;
                    }
                    
                    Display.doneLoading();
                } 
                else {
                    Ti.UI.createNotification({
                        duration : Ti.UI.NOTIFICATION_DURATION_SHORT,
                        message : 'Canceled!'
                    }).show();
                }
            }
        });
    }
    else{ // is IOS
        
        Ti.Media.openPhotoGallery({
            allowEditing: false,
            animated: true,
            autohide: true,
            cancel: function(e){},
            error: function (e){
                alert("There was a problem inserting the video.");
                Utils.sendErrorReport("Video insert: " + JSON.stringify(e));
                Ti.API.debug(JSON.stringify(e));
            },
            mediaTypes: [Ti.Media.MEDIA_TYPE_VIDEO],
            popoverView: imageView,
            success: function(event){
                /*global save_form_data*/
                var newImageView, takeNextPhotoView, filePath, videoFile, thumbVideo, saved;
                
                Ti.API.info("Media length: " + event.media.length + " bytes");
                Ti.API.info("media type: " + event.mediaType);
                
                Display.loading("Please Wait...");
                
                videoFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "v_" + Utils.getUTCTimestamp() + '.mp4');
                
                saved = videoFile.write(event.media);
                
                Ti.API.debug("SAved video: " + saved);
                
                // Get rid of the custom stream wrapper
                filePath = videoFile.nativePath;
                
                if(Ti.App.isIOS){
                    videoFile.setRemoteBackup(false);
                }
                
                self.saveFileInfo(imageView, filePath, '', 0, event.media.length, 'video');
                
                videoFile = Ti.Filesystem.getFile(imageView.filePath);
                
                if(Ti.App.isIOS){
                    thumbVideo = Ti.Media.createVideoPlayer({
                        width: 100,
                        height: 100,
                        autoplay: false,
                        media: videoFile
                    });
                }
                
                if (imageView.instance.settings.cardinality == -1 || (imageView.imageIndex + 1) < imageView.instance.settings.cardinality) {
                    
                    takeNextPhotoView = self.getImageView(imageView.parentView, imageView.imageIndex + 1, null, null, 0);
                    imageView.image = thumbVideo.thumbnailImageAtTime(0, Ti.Media.VIDEO_TIME_OPTION_NEAREST_KEYFRAME);
                    imageView.parentView.add(takeNextPhotoView);
                    imageView.parentView.setContentWidth(imageView.parentView.getContentWidth() + 110);
                }
                else{
                    imageView.image = thumbVideo.thumbnailImageAtTime(0, Ti.Media.VIDEO_TIME_OPTION_NEAREST_KEYFRAME);
                }
                
                // Make sure we never lose a video reference due to a crash
                self.formObj.saveForm('continuous');
                Display.doneLoading();
            }
        });
    }
    
};

VideoWidget.prototype.openCamera = function(){"use strict";
    
};

VideoWidget.prototype.saveFileInfo = function(imageView, filePath, thumbPath, degrees, filesize, type) {"use strict";
    /*jslint regexp:true*/
    var nid, db, encodedImage, mime, imageName, timestamp, fieldName, 
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
        Utils.sendErrorReport("Problem saving the video to the database: " + ex);
        alert("Problem saving the video to the database: " + ex);
    }
};

VideoWidget.prototype.setFid = function(i, fid) {"use strict";
    if (typeof this.dbValues[i] === 'undefined') {
        return;
    }
    
    this.dbValues[i] = fid;
    
    var imageView = this.elements[0].getChildren()[i];
    imageView.fid = fid;
    imageView.dbValue = fid;
};

VideoWidget.prototype.updateFidsOfNewFiles = function(newFids) {"use strict"; 
    var i, j;   
    for (i = 0, j = 0; i < this.dbValues.length && j < newFids.length; i++) {
        if (this.dbValues[i] == -1) {
            this.setFid(i, newFids[j++]);
        }
    }
};

VideoWidget.prototype.cleanUp = function(){"use strict";
    var i, j;
    Ti.API.debug("in video widget cleanup");
    
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
        
        Ti.API.debug("At end of video widget cleanup");
    }
    catch(ex){
        try{
            Utils.sendErrorReport("Exception cleaning up video widget field: " + ex);
        }
        catch(ex1){}
    }
};

exports.getFieldObject = function(FormObj, instance, fieldViewWrapper){"use strict";
    return new VideoWidget(FormObj, instance, fieldViewWrapper);
};

exports.openVideoPlayer = function(instance, imageView){"use strict";
    var widget, formObj;
    formObj = {};
    formObj.node = {};
    
    widget = new VideoWidget(formObj, instance, null);
    
    widget.openVideoPlayer(imageView);
    
};
