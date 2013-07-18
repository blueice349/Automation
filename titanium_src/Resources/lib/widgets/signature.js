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
            backgroundColor:'#000',
            bottom:70,
            opacity: 0.5
        });

        thex = Ti.UI.createLabel({
            text:'X',
            textAlign:'center',
            width:'auto',
            height:'auto',
            font:{fontFamily:'Arial',fontSize:24},
            color:'#000',
            bottom:75,
            left:20,
            opacity: 0.5
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
        
        // eraseButton.addEventListener('click', function(e){
//             
            // e.source.imageView.dbValue = null;
            // e.source.imageView.image = null;
        // });
        
        // imageNid = Ti.UI.currentWindow.nid;
        // if(typeof Ti.UI.currentWindow.origNid !== 'undefined'){
            // imageNid = Ti.UI.currentWindow.origNid;
        // }
        
        numImagesShowing = 1;
        
        
        // if (instance.can_edit && (instance.settings.cardinality == -1 || (numImagesShowing < instance.settings.cardinality))) {
//             
            // widgetView.add(Omadi.widgets.image.getImageView(widgetView, numImagesShowing, null, null, 0));
//         
            // contentWidth += 110;
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
            if (Ti.App.isAndroid) {
                widgetView.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
            }
        }
        
        return widgetView;
    },
    openSignatureView : function(node, instance, widgetView){"use strict";
    
        var win, thex, sigLine, screenShadow, wrapper, outsideWrapper, wrapperShadow, 
            doneButton, clearButton, cancelButton, paintView, buttonView;
        
        win = Ti.UI.createWindow({  
            
        });
        
        screenShadow = Ti.UI.createView({
           top: 0,
           bottom: 0,
           left: 0,
           right: 0,
           backgroundColor: '#ddd',
           opacity: 0.8 
        });
        
        win.add(screenShadow);
        
        outsideWrapper = Ti.UI.createView({
           width: '95%',
           height: Ti.UI.SIZE,
           layout: 'vertical',
           opacity: 1.0
        });
        
        wrapper = Ti.UI.createView({
            width:'100%',
            height: 250,
            borderColor:'#aaa',
            borderWidth:2,
            backgroundColor:'#fff',
            opacity: 1.0
        });
        
        screenShadow.add(outsideWrapper);
        outsideWrapper.add(wrapper);
        
        buttonView = Ti.UI.createView({
            backgroundColor: '#666',
            height: 50
        });
        
        outsideWrapper.add(buttonView);
        
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
         
        buttonView.add(doneButton);
        buttonView.add(clearButton);
         
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
         
        buttonView.add(cancelButton);
        
        sigLine = Ti.UI.createView({
            width:'90%',
            height:2,
            backgroundColor:'#000',
            bottom:70,
            opacity: 0.5
        });

        thex = Ti.UI.createLabel({
            text:'X',
            textAlign:'center',
            width:'auto',
            height:'auto',
            font:{fontFamily:'Arial',fontSize:24},
            color:'#000',
            bottom:75,
            left:20,
            opacity: 0.5
        });
        
        paintView = Paint.createPaintView({
            width : '100%',
            bottom: 0,
            top: 0,
            instance : instance,
            strokeWidth: 4,
            strokeColor: '#666',
            opacity: 1.0,
            touchEnabled: true,
            backgroundColor: '#fff'
        });
        
        // paintView.addEventListener('touchmove', function(){
           // //alert("paint move");
           // Ti.API.info('move'); 
        // });
//         
        // paintView.addEventListener('touchstart', function(){
            // Ti.API.info('start');
           // alert("paint start"); 
        // });
        // paintView.addEventListener('touchesended',function(){
            // alert('paint end');
            // doneButton.show();
        // });
//         
        // paintView.addEventListener('mouseup',function(){
            // alert('mouse end');
            // doneButton.show();
        // });
// 
        // paintView.addEventListener('click', function(){
           // alert('paint click') ;
        // });
        
        wrapper.add(paintView);
        
        wrapper.add(sigLine);

        wrapper.add(thex);
        
        doneButton.addEventListener('click',function(e){
            var blob = paintView.toImage();
            
            Omadi.widgets.signature.removePreviousSignature(instance);
            
            e.source.widgetView.imageView.setImage(blob);
            e.source.widgetView.imageWrapper.setVisible(true);
            e.source.widgetView.imageWrapper.setHeight(Ti.UI.SIZE);
            
            // This waiting is really only for the Android devices, but it's not a hugely back thing
            // To leave for a possibly slow iOS device
            setTimeout(function(){
                Omadi.widgets.signature.saveSignature(e.source);
            }, 1000);
            
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
            
            db = Omadi.utils.openMainDatabase();
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


