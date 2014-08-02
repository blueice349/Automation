/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

var Paint = require('ti.paint');

Omadi.widgets.signature = {
    getNewElement: function(node, instance){"use strict";
      
        var settings, widgetView, dbValue, imageData, i, numImagesShowing = 0, 
            signNowButton, imageNid, imageView, eraseButton, buttonView, imageWrapper, sigLine, thex, isSigned;

        dbValue = null;
        imageData = [];
        
        if ( typeof node[instance.field_name] !== 'undefined') {
            if ( typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[0] !== 'undefined') {
                dbValue = node[instance.field_name].dbValues[0];
            }
            
            if ( typeof node[instance.field_name].imageData !== 'undefined') {
                imageData = node[instance.field_name].imageData;
            }
        }
        
        imageNid = Ti.UI.currentWindow.nid;
        if(typeof Ti.UI.currentWindow.origNid !== 'undefined'){
            imageNid = Ti.UI.currentWindow.origNid;
        }
        
        settings = instance.settings;
        Ti.API.debug("Creating signature field");
        
        widgetView = Ti.UI.createView({
           height: Ti.UI.SIZE,
           width: '92%',
           layout: 'vertical'
        });
        
        buttonView = Ti.UI.createView({
            height: Ti.UI.SIZE,
            width: '100%',
            layout: 'horizontal' 
        });
        
        signNowButton = Ti.UI.createLabel({
            backgroundImage:'/images/blue_button2.png',
            color: '#fff',
            text:'Sign Now',
            width:86,
            height:35,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
            font:{
                fontWeight:'bold',
                fontSize:14
            }
        });
        
        imageWrapper = Ti.UI.createView({
            height: 0,
            width: '100%',
            visible: false
        });
        
        isSigned = (typeof dbValue === 'number');
        
        imageView = Ti.UI.createImageView({
            width: '100%',
            height: 200,
            image : (isSigned ? '/images/signature-loading.png' : dbValue),
            thumbnailLoaded : false,
            fullImageLoaded : false,
            isImageData : false,
            bigImg : null,
            nid : imageNid,
            fid : dbValue,
            widgetView : widgetView,
            imageIndex : 0,
            dbValue : dbValue,
            instance : instance,
            parentView : widgetView,
            borderColor: '#ccc',
            borderWidth: 2
        });
        
        if (Omadi.utils.isArray(imageData)) {
            if(typeof imageData[0] !== 'undefined'){
                imageView.image = imageData[0];
            }
        }
        
        if(isSigned){
            imageWrapper.visible = true;
            imageWrapper.height = Ti.UI.SIZE;
            //Omadi.display.setImageViewThumbnail(imageView, imageNid, dbValue);
            Omadi.display.displayLargeImage(imageView, imageNid, dbValue, true);
        }
        else{
            imageWrapper.height = 0;
            buttonView.add(signNowButton);
        }
        //buttonView.add(eraseButton);
        
        sigLine = Ti.UI.createView({
            width:'90%',
            height:2,
            backgroundColor:'#999',
            bottom:70
        });

        thex = Ti.UI.createLabel({
            text:'X',
            textAlign:'center',
            width:'auto',
            height:'auto',
            font:{fontFamily:'Arial',fontSize:24},
            color:'#999',
            bottom:75,
            left:20
        });

        
        imageWrapper.add(imageView);
        imageWrapper.add(sigLine);
        imageWrapper.add(thex);
        imageWrapper.imageView = imageView;
        
        widgetView.add(imageWrapper);
        widgetView.add(buttonView);
        
        widgetView.imageWrapper = imageWrapper;
        widgetView.imageView = imageView;
        widgetView.eraseButton = eraseButton;
        widgetView.signNowButton = signNowButton;
        
       // eraseButton.imageView = imageView;
        
        buttonView.addEventListener('click', function(){
            Omadi.widgets.signature.openSignatureView(node, instance, widgetView);
        });
        
        numImagesShowing = 1;
        
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
    openSignatureView : function(node, instance, widgetView){"use strict";
    
        var win, thex, sigLine, screenShadow, wrapper, outsideWrapper, wrapperShadow, 
            doneButton, clearButton, cancelButton, paintView, buttonView, 
            scrollView, textView, textLabel, overlayButton, overlayLabel, hasText;
        
        win = Ti.UI.createWindow({  
            orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT],
            modal: true,
            navBarHidden: true
        });
        
        hasText = false;
        
        if(typeof instance.settings.signature_text !== 'undefined' && 
            instance.settings.signature_text.length != null && 
            instance.settings.signature_text.length != ""){
            
            hasText = true;
            
            scrollView = Ti.UI.createScrollView({
                contentHeight: 'auto',
                contentWidth: '100%',
                height: Ti.UI.FILL,
                width: Ti.UI.FILL,
                scrollType: 'vertical',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                scrollingEnabled: true
            });
        }
        else{
            
            // The scrollview must be initialized with scrollingenabled = false
            // It seems there is a bug in the Titanium code
            // This and the above scroll view should be identical except for scrollingEnabled
            
            scrollView = Ti.UI.createScrollView({
                contentHeight: 'auto',
                contentWidth: '100%',
                height: Ti.UI.FILL,
                width: Ti.UI.FILL,
                scrollType: 'vertical',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                scrollingEnabled: false
            });
        }
        
        screenShadow = Ti.UI.createView({
           top: 0,
           bottom: 0,
           left: 0,
           right: 0
        });
        
        outsideWrapper = Ti.UI.createView({
           width: '95%',
           height: Ti.UI.SIZE,
           layout: 'vertical'
        });
        
        wrapper = Ti.UI.createView({
            width:'100%',
            height: 220,
            borderColor: '#aaa',
            borderWidth: 2,
            backgroundColor: '#fff'
        });
        
        buttonView = Ti.UI.createView({
            backgroundColor: '#666',
            height: 50
        });
        
        doneButton = Ti.UI.createLabel({
            backgroundImage:'/images/blue_button2.png',
            color: '#fff',
            text:'Done',
            width:86,
            height:35,
            right:12,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
            font:{
                fontWeight:'bold',
                fontSize:14
            },
            win: win,
            widgetView: widgetView,
            instance: instance
        });
         
        clearButton = Ti.UI.createLabel({
            backgroundImage:'/images/black_button2.png',
            color: '#fff',
            text:'Clear',
            width:86,
            height:35,
            left:100,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
            font:{
                fontWeight:'bold',
                fontSize:14
            }
        });
         
        cancelButton = Ti.UI.createLabel({
            backgroundImage:'/images/black_button2.png',
            color: '#fff',
            text:'Cancel',
            width:86,
            height:35,
            left:12,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
            font:{
                fontWeight:'bold',
                fontSize:14
            },
            win: win
        });
         
        sigLine = Ti.UI.createView({
            width:'90%',
            height:2,
            backgroundColor:'#999',
            bottom:70
        });

        thex = Ti.UI.createLabel({
            text:'X',
            textAlign:'center',
            width:'auto',
            height:'auto',
            font:{fontFamily:'Arial',fontSize:24},
            color:'#999',
            bottom:75,
            left:20
        });
        
        paintView = Paint.createPaintView({
            width : '100%',
            bottom: 0,
            top: 0,
            instance : instance,
            strokeWidth: 4,
            strokeColor: '#666',
            touchEnabled: true,
            backgroundColor: '#fff'
        });
        
        if(hasText){
            
            textView = Ti.UI.createView({
                height: Ti.UI.SIZE,
                width: '100%',
                backgroundColor: '#fff',
                borderWidth: 2,
                borderColor: '#ccc',
                scrollView: scrollView
            });
            
            textLabel = Ti.UI.createLabel({
                text: instance.settings.signature_text,
                wordWrap: true,
                width: '96%',
                height: Ti.UI.SIZE,
                top: 12,
                bottom: 12,
                touchEnabled: false,
                color: '#333',
                font: {
                    fontSize: 16
                }
            });
            
            overlayButton = Ti.UI.createView({
                width: '100%',
                bottom: 0,
                top: 0,
                backgroundColor: '#999',
                wrapper: wrapper,
                scrollView: scrollView
            });
            
            overlayLabel = Ti.UI.createLabel({
                text: 'Touch to Sign',
                color: '#fff',
                font: {
                    fontSize: 26,
                    fontWeight: 'bold'
                },
                touchEnabled: false
            });
            
            textView.overlayButton = overlayButton;
            
            textView.addEventListener('click', function(e){
                if(!e.source.scrollView.scrollingEnabled){
                    e.source.scrollView.scrollingEnabled = true;
                    e.source.scrollView.scrollTo(0, 0);
                    e.source.overlayButton.height = Ti.UI.FILL;
                    e.source.overlayButton.width = '100%';
                }
            });
            
            textView.add(textLabel);
            outsideWrapper.add(textView);
            
            overlayButton.add(overlayLabel);
            overlayButton.addEventListener('click', function(e){
               e.source.width = 0;
               e.source.height = 0; 
               e.source.scrollView.scrollToBottom();
               e.source.scrollView.scrollingEnabled = false;
            });
        }
        
        scrollView.add(outsideWrapper);
        outsideWrapper.add(wrapper);
        outsideWrapper.add(buttonView);
        buttonView.add(doneButton);
        buttonView.add(clearButton);
        buttonView.add(cancelButton);
        
        wrapper.add(paintView);
        
        wrapper.add(sigLine);

        wrapper.add(thex);
        
        if(hasText){
            wrapper.add(overlayButton);
        }
        
        doneButton.addEventListener('click',function(e){
            var blob;
            
            try{
                blob = paintView.toImage();
                
                Omadi.widgets.signature.removePreviousSignature(instance);
                
                e.source.widgetView.imageView.setImage(blob);
                e.source.widgetView.imageWrapper.setVisible(true);
                e.source.widgetView.imageWrapper.setHeight(Ti.UI.SIZE);
                
                // This waiting is really only for the Android devices, but it's not a hugely back thing
                // To leave for a possibly slow iOS device

                setTimeout(function(){
                    Omadi.widgets.signature.saveSignature(e.source);
                }, 1000);
            }
            catch(ex){
                Omadi.service.sendErrorReport("Exception getting signature image: " + ex);
            }
            
            e.source.win.close();
        });
        
        cancelButton.addEventListener('click',function(e){
            e.source.win.close();
        });
        
        clearButton.addEventListener('click',function(){
            // clear the canvas
            paintView.clear();
            //doneButton.hide();
        });
        
        win.add(screenShadow);
        win.add(scrollView);
        
        win.open();
    },
    saveSignature : function(doneButton){"use strict";
        var filePath, file, blob;

        Ti.API.debug("SAVING SIGNATURE");

        file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "s_" + Omadi.utils.getUTCTimestamp() + '.bmp');
        
        filePath = file.getNativePath();
        
        doneButton.widgetView.imageView.filePath = filePath;

        if(file){

            blob = doneButton.widgetView.imageView.toBlob();
            file.write(blob);

            Omadi.widgets.image.saveFileInfo(doneButton.widgetView.imageView, filePath, '', 0, blob.length, 'signature');
        }
        else{

            Omadi.service.sendErrorReport("File is not available for signature.");
            alert("There was a problem saving the signature.");
        }
    },
    removePreviousSignature : function(instance){"use strict";
        var nid, db;
        /*global dbEsc*/
        
        if(typeof Ti.UI.currentWindow.nid !== 'undefined'){
            nid = Ti.UI.currentWindow.nid;
            
            db = Omadi.utils.openListDatabase();
            db.execute("DELETE FROM _files WHERE nid = 0 AND field_name = '" + dbEsc(instance.field_name) + "'");
            db.close();
        }
    }
};

function getObjectClass(obj) {"use strict";
    if (obj && obj.constructor && obj.constructor.toString) {
        var arr = obj.constructor.toString().match(
            /function\s*(\w+)/);

        if (arr && arr.length == 2) {
            return arr[1];
        }
    }

    return undefined;
}


