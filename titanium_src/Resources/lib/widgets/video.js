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
        var imageView, transform, rotateDegrees, image, widgetType, isFilePath;
        
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
                image = '/images/choose-video.png';
            }
            else{
                image = '/images/take-video.png';
            }   
        }
        else if(typeof fid === 'number'){
            image = '/images/thumbnail-loading.png';
        }
        else{
            image = fid;
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
        }
        else if ( typeof fid === 'number') {
            Ti.API.error("add thumbnail to video");
            //Omadi.display.setImageViewThumbnail(imageView, nid, fid);
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
        var videoFile, player, toolbar, back, space, label, http;
        
        Omadi.widgets.video.videoWin = Titanium.UI.createWindow({
            backgroundColor : '#000',
            navBarHidden: true,
            layout: 'vertical'
        });
        
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
        
        if(typeof imageView.filePath !== 'undefined'){
            
            videoFile = Ti.Filesystem.getFile(imageView.filePath);
            
            Omadi.widgets.video.videoPlayer = Ti.Media.createVideoPlayer({
                allowsAirPlay: true,
                autoplay: true,
                backgroundColor: 'Transparent',
                fullscreen: false,
                height: Ti.UI.FILL,
                width: Ti.UI.FILL,
                media: videoFile,
                top: 0
            });
            
            Omadi.widgets.video.videoWin.add(Omadi.widgets.video.videoPlayer);
            Omadi.widgets.video.videoWin.open();
        }
        else{
            
            http = Ti.Network.createHTTPClient();
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
            
            http.open('GET', Omadi.DOMAIN_NAME + '/js-file/s3/' + imageView.nid + '/' + imageView.fid + '/' + imageView.instance.field_name + '.json');
            http.setTimeout(30000);

            http.setRequestHeader("Content-Type", "application/json");
            Omadi.utils.setCookieHeader(http);
            
            http.send();
        }
    },
    openVideoChooser : function(imageView){"use strict";
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
                var newImageView, takeNextPhotoView, filePath, videoFile;
                
                Ti.API.info("Media length: " + event.media.length + " bytes");
                
                filePath = Ti.Filesystem.applicationDataDirectory + "v_" + Omadi.utils.getUTCTimestamp() + '.mp4';
                videoFile = Ti.Filesystem.getFile(filePath);
                
                videoFile.write(event.media);
                videoFile.setRemoteBackup(false);
                
                Omadi.widgets.image.saveFileInfo(imageView, filePath, '', 0, event.media.length, 'video');
                        
                // Save a draft of this image in case a crash happens soon
                if(Ti.UI.currentWindow.saveContinually && typeof save_form_data !== 'undefined'){
                    save_form_data('continuous');
                }
                
                if (imageView.instance.settings.cardinality == -1 || (imageView.imageIndex + 1) < imageView.instance.settings.cardinality) {
                            
                    newImageView = Omadi.widgets.video.getImageView(imageView.parentView, imageView.imageIndex, null, filePath, 0);
                    takeNextPhotoView = Omadi.widgets.video.getImageView(imageView.parentView, imageView.imageIndex + 1, null, null, 0);
                    
                    newImageView.setImage("/images/video-selected.png");
                    
                    imageView.parentView.add(newImageView);
                    imageView.parentView.add(takeNextPhotoView);
                    
                    imageView.parentView.setContentWidth(imageView.parentView.getContentWidth() + 110);
                    imageView.parentView.remove(imageView);
                    imageView = null;
                }
                else{
                    
                    newImageView = Omadi.widgets.video.getImageView(imageView.parentView, imageView.imageIndex, null, filePath, 0);
                    newImageView.setImage("/images/video-selected.png");
                    
                    imageView.parentView.add(newImageView);
                    imageView.parentView.remove(imageView);
                    imageView = null;
                    
                    Omadi.display.doneLoading();
                }
            }
        });
    },
    openCamera : function(){"use strict";
        
    }
};


