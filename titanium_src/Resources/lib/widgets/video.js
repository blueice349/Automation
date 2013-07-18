/*jslint eqeq:true,plusplus:true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.video = {
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
            alert("add this");
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
                alert("fill in");
                //Omadi.widgets.image.showPhotoOptions(e.source);
            }
        });
   
        return imageView;
    },
    openVideoChooser : function(imageView){"use strict";
        Ti.Media.openPhotoGallery({
            allowEditing: false,
            animated: true,
            autohide: true,
            cancel: function(e){
                alert("cancel");
                Ti.API.debug(JSON.stringify(e));
            },
            error: function (e){
                alert("error");
                Ti.API.debug(JSON.stringify(e));
            },
            mediaTypes: [Ti.Media.MEDIA_TYPE_VIDEO],
            popoverView: imageView,
            success: function(e){
                
                alert(e.media.length + " bytes");
            }
        });
    },
    openCamera : function(){"use strict";
        
    }
};


