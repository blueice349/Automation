/*jslint eqeq:true,plusplus:true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.video = {
    getNewElement : function(node, instance) {"use strict";
        var settings, widgetView, dbValue, imageData, degreeData, i, numImagesShowing = 0, contentWidth, imageNid;

        dbValue = [];
        imageData = [];
        degreeData = [];
        
        Ti.API.debug(node);

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
        Ti.API.debug("Creating video field");

        widgetView = Ti.UI.createScrollView({
            width : '92%',
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
                    Ti.API.debug("Adding video to scroll view");
                     
                    widgetView.add(Omadi.widgets.video.getImageView(widgetView, i, imageNid, dbValue[i], 0));
                }
            }
            numImagesShowing = dbValue.length;
        }

        if (Omadi.utils.isArray(imageData)) {

            for ( i = 0; i < imageData.length; i++) {
                widgetView.add(Omadi.widgets.video.getImageView(widgetView, numImagesShowing + i, imageNid, imageData[i], degreeData[i]));
            }
            numImagesShowing += imageData.length;
        }

        contentWidth = numImagesShowing * 110;

        if (instance.can_edit && (instance.settings.cardinality == -1 || (numImagesShowing < instance.settings.cardinality))) {
            
            widgetView.add(Omadi.widgets.video.getImageView(widgetView, numImagesShowing, null, null, 0));

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
        var imageView, transform, rotateDegrees, image, widgetType, isFilePath, thumbVideo, videoFile;
        
        isFilePath = false;
        
        if (fid !== null && typeof fid !== 'number') {
            
            isFilePath = true;
        }
        
        // widgetType = Ti.App.Properties.getString("videoWidget", 'take');
        // if(widgetType == 'choose'){
            // // Make sure the path is correct
            // //if(Omadi.widgets.image.getPhotoChooserDir() === null){
                // widgetType = 'take';
           // // }
        // }
        
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
            Omadi.display.setImageViewVideoThumbnail(imageView, nid, fid, imageView.instance.field_name);
        }
     
        imageView.addEventListener('click', function(e) {
            var dialog;
            
            if(e.source.fid === null){
                e.source.setTouchEnabled(false);
                Omadi.display.loading();
                Omadi.widgets.video.openVideoChooser(e.source);
                Omadi.display.doneLoading();
                
                // Allow the imageView to be touched again after waiting a little bit
                setTimeout(function(){
                    imageView.setTouchEnabled(true);
                }, 1000);
            }
            else{
                
                Omadi.widgets.video.openVideoPlayer(e.source);
                
                
                //Omadi.widgets.image.showPhotoOptions(e.source);
            }
        });
   
        return imageView;
    },
    openVideoPlayer : function(imageView){"use strict";
        try{
            var videoFile, player, toolbar, back, space, label, http, s3URL;
            
            Omadi.widgets.video.videoWin = Titanium.UI.createWindow({
                backgroundColor : '#000',
                navBarHidden: true,
                layout: 'vertical',
                orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
            });
            
            if(Ti.App.isIOS){
                
                back = Ti.UI.createButton({
                    title : 'Back',
                    style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
                });
                
                back.addEventListener('click', function() {
                    Omadi.widgets.video.videoPlayer.stop();
                    Omadi.widgets.video.videoPlayer = null;
                    
                    Omadi.widgets.video.videoWin.close();
                    Omadi.widgets.video.videoWin = null;
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
                
                Omadi.widgets.video.videoWin.add(toolbar);
            }
            
            if(typeof imageView.filePath !== 'undefined'){
                
                videoFile = Ti.Filesystem.getFile(imageView.filePath);
                
                if(videoFile.exists() && videoFile.isFile()){
                
                    Ti.API.debug("Video URL: " + imageView.filePath);
                    if(Ti.App.isAndroid){
                        Ti.API.debug("Video filesize: " + videoFile.getSize());
                    }
                    
                    Omadi.widgets.video.videoPlayer = Ti.Media.createVideoPlayer({
                        allowsAirPlay: true,
                        autoplay: true,
                        backgroundColor: 'Transparent',
                        fullscreen: false,
                        height: Ti.UI.FILL,
                        width: Ti.UI.FILL,
                        
                        url: imageView.filePath,
                        top: 0
                    });
                    
                    Omadi.widgets.video.videoWin.add(Omadi.widgets.video.videoPlayer);
                    Omadi.widgets.video.videoWin.open();
                }
                else{
                    alert("The video file was not found.");
                }
            }
            else{
                
                http = Ti.Network.createHTTPClient({
                    enableKeepAlive: false,
                    validatesSecureCertificate: false
                });
                http.onload = function(e){
                    /*global isJsonString*/
                   
                    var json;
                    Ti.API.debug(this.responseText);
                    
                    if(this.responseText != null && isJsonString(this.responseText)){
                        json = JSON.parse(this.responseText);
                        
                        if(json.success == true){
                        
                            Omadi.widgets.video.videoPlayer = Ti.Media.createVideoPlayer({
                                allowsAirPlay: true,
                                autoplay: true,
                                backgroundColor: 'Transparent',
                                fullscreen: false,
                                height: Ti.UI.FILL,
                                width: Ti.UI.FILL,
                                url: json.url,
                                top: 0
                            });
                            
                            Omadi.widgets.video.videoWin.add(Omadi.widgets.video.videoPlayer);
                            Omadi.widgets.video.videoWin.open();
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
                
                s3URL = Omadi.DOMAIN_NAME + '/js-file/s3/' + imageView.nid + '/' + imageView.fid + '/' + imageView.instance.field_name + '.json';
                
                Ti.API.info("S3: " + s3URL);
                
                http.open('GET', s3URL);
                http.setTimeout(30000);
    
                http.setRequestHeader("Content-Type", "application/json");
                Omadi.utils.setCookieHeader(http);
                
                http.send();
            }
        }
        catch(ex){
            Omadi.service.sendErrorReport("Exception showing video player: " + ex);
        }
    },
    openVideoChooser : function(imageView){"use strict";
        try{
            if(Ti.App.isAndroid){
                var intent = Titanium.Android.createIntent({
                    action : Ti.Android.ACTION_PICK,
                    type : "video/*"
                });
                //android.media.action.VIDEO_CAPTURE
                intent.addCategory(Ti.Android.CATEGORY_DEFAULT);
                
                Ti.UI.currentWindow.activity.startActivityForResult(intent, function(e) {
                    var filePath, source, movieFile, newImageView, takeNextPhotoView;
                    /*global save_form_data*/
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
                            
                            Omadi.display.loading("Please Wait...");
                            
                            if(Ti.Filesystem.isExternalStoragePresent()){
                                movieFile = Titanium.Filesystem.getFile(Titanium.Filesystem.externalStorageDirectory, "v_" + Omadi.utils.getUTCTimestamp() + '.mp4');
                            }
                            else{
                                movieFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "v_" + Omadi.utils.getUTCTimestamp() + '.mp4');    
                            }
                            
                            source.copy(movieFile.nativePath);
                            filePath = movieFile.nativePath;
                            
                            Ti.API.debug(filePath);
                            
                            Ti.API.debug("filesize: " + movieFile.getSize());
                            Ti.API.debug("Is external: " + Ti.Filesystem.isExternalStoragePresent());
                            
                            Omadi.widgets.image.saveFileInfo(imageView, filePath, '', 0, movieFile.getSize(), 'video');
                            
                            // Save a draft of this image in case a crash happens soon
                            if(Ti.UI.currentWindow.saveContinually && typeof save_form_data !== 'undefined'){
                                save_form_data('continuous');
                            }
                            
                            if (imageView.instance.settings.cardinality == -1 || (imageView.imageIndex + 1) < imageView.instance.settings.cardinality) {
                                        
                                newImageView = Omadi.widgets.video.getImageView(imageView.parentView, imageView.imageIndex, null, filePath, 0);
                                takeNextPhotoView = Omadi.widgets.video.getImageView(imageView.parentView, imageView.imageIndex + 1, null, null, 0);
                                
                                //newImageView.setImage("/images/video-selected.png");
                               
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
                                
                                newImageView = Omadi.widgets.video.getImageView(imageView.parentView, imageView.imageIndex, null, filePath, 0);
                               
                                
                                newImageView.image = '/images/video_selected.png';
                                newImageView.height = 100;
                                newImageView.width = 100;
                                
                                
                                imageView.parentView.add(newImageView);
                                imageView.parentView.remove(imageView);
                                imageView = null;
                            }
                            
                            Omadi.display.doneLoading();
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
                
                //Omadi.display.loading("")
                
                Ti.Media.openPhotoGallery({
                    allowEditing: false,
                    animated: true,
                    autohide: true,
                    cancel: function(e){
                        //alert("cancel");
                        //Ti.API.debug(JSON.stringify(e));
                    },
                    error: function (e){
                        alert("There was a problem inserting the video.");
                        Omadi.service.sendErrorReport("Video insert: " + JSON.stringify(e));
                        Ti.API.debug(JSON.stringify(e));
                    },
                    mediaTypes: [Ti.Media.MEDIA_TYPE_VIDEO],
                    popoverView: imageView,
                    success: function(event){
                        /*global save_form_data*/
                        var newImageView, takeNextPhotoView, filePath, videoFile, thumbVideo, saved;
                        
                        Ti.API.info("Media length: " + event.media.length + " bytes");
                        Ti.API.info("media type: " + event.mediaType);
                        
                        Omadi.display.loading("Please Wait...");
                        
                        videoFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "v_" + Omadi.utils.getUTCTimestamp() + '.mp4');
                        
                        saved = videoFile.write(event.media);
                        
                        Ti.API.debug("SAved video: " + saved);
                        
                        // Get rid of the custom stream wrapper
                        filePath = videoFile.nativePath;
                        
                        if(Ti.App.isIOS){
                            videoFile.setRemoteBackup(false);
                        }
                        
                        Omadi.widgets.image.saveFileInfo(imageView, filePath, '', 0, event.media.length, 'video');
                                
                        // Save a draft of this image in case a crash happens soon
                        if(Ti.UI.currentWindow.saveContinually && typeof save_form_data !== 'undefined'){
                            save_form_data('continuous');
                        }
                        
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
                            
                            takeNextPhotoView = Omadi.widgets.video.getImageView(imageView.parentView, imageView.imageIndex + 1, null, null, 0);
                            imageView.image = thumbVideo.thumbnailImageAtTime(0, Ti.Media.VIDEO_TIME_OPTION_NEAREST_KEYFRAME);
                            imageView.parentView.add(takeNextPhotoView);
                            imageView.parentView.setContentWidth(imageView.parentView.getContentWidth() + 110);
                                
                            // newImageView = Omadi.widgets.video.getImageView(imageView.parentView, imageView.imageIndex, null, filePath, 0);
                            // takeNextPhotoView = Omadi.widgets.video.getImageView(imageView.parentView, imageView.imageIndex + 1, null, null, 0);
    //                          
                            // newImageView.image = thumbVideo.thumbnailImageAtTime(0, Ti.Media.VIDEO_TIME_OPTION_NEAREST_KEYFRAME);
    //                        
                            // imageView.parentView.add(newImageView);
                            // imageView.parentView.add(takeNextPhotoView);
    //                         
                            // imageView.parentView.setContentWidth(imageView.parentView.getContentWidth() + 110);
                            // imageView.parentView.remove(imageView);
                            // imageView = null;
                        }
                        else{
                            imageView.image = thumbVideo.thumbnailImageAtTime(0, Ti.Media.VIDEO_TIME_OPTION_NEAREST_KEYFRAME);
                        }
                        
                        Omadi.display.doneLoading();
                    }
                });
            }
        }
        catch(ex){
            Omadi.service.sendErrorReport("Exception getting video chooser: " + ex);
        }
        
    },
    openCamera : function(){"use strict";
        
    }
};


