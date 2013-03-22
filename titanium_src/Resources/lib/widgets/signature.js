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
           width: '96%',
           layout: 'vertical'
        });
        
        buttonView = Ti.UI.createView({
            height: Ti.UI.SIZE,
            width: '100%',
            layout: 'horizontal' 
        });
        
        signNowButton = Ti.UI.createButton({
            backgroundImage:'/images/blue_button1.png',
            title:'Sign Now',
            width:90,
            height:35,
            bottom:5,
            top: 5,
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
            width: '96%',
            height: 200,
            left : 5,
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
            parentView : widgetView
        });
        
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
            backgroundColor:'#aaa',
            bottom:70
        });

        thex = Ti.UI.createLabel({
            text:'X',
            textAlign:'center',
            width:'auto',
            height:'auto',
            font:{fontFamily:'Arial',fontSize:24},
            color:'#aaa',
            bottom:75,
            left:20
        });

        imageWrapper.add(sigLine);
        imageWrapper.add(thex);
        imageWrapper.add(imageView);
        
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
            // widgetView.add(Omadi.widgets.image.getImageView(widgetView, numImagesShowing, null, null));
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
            height: Ti.UI.SIZE
        });
        
        outsideWrapper.add(buttonView);
        
        doneButton = Ti.UI.createButton({
            backgroundImage:'/images/blue_button1.png',
            title:'Done',
            width:90,
            height:35,
            right:12,
            bottom:5,
            top: 5,
            font:{
                fontWeight:'bold',
                fontSize:14
            },
            win: win,
            widgetView: widgetView,
            //visible: false
        });
         
        clearButton = Ti.UI.createButton({
            backgroundImage:'/images/black_button1.png',
            title:'Clear',
            width:90,
            height:35,
            left:120,
            bottom:5,
            top: 5,
            font:{
                fontWeight:'bold',
                fontSize:14
            }
        });
         
        buttonView.add(doneButton);
        buttonView.add(clearButton);
         
        cancelButton = Ti.UI.createButton({
            backgroundImage:'/images/black_button1.png',
            title:'Cancel',
            width:90,
            height:35,
            left:12,
            bottom:5,
            top: 5,
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
            backgroundColor:'#aaa',
            bottom:70
        });

        thex = Ti.UI.createLabel({
            text:'X',
            textAlign:'center',
            width:'auto',
            height:'auto',
            font:{fontFamily:'Arial',fontSize:24},
            color:'#aaa',
            bottom:75,
            left:20
        });

        wrapper.add(sigLine);

        wrapper.add(thex);
        
        paintView = Paint.createPaintView({
            width : '100%',
            bottom: 0,
            top: 0,
            instance : instance,
            strokeWidth: 5,
            strokeColor: '#666',
            opacity: 1.0,
            touchEnabled: true
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
        
        doneButton.addEventListener('click',function(e){
            var sigImg = paintView.toImage();
            
            e.source.widgetView.imageView.image = sigImg;
            e.source.widgetView.imageWrapper.visible = true;
            e.source.widgetView.imageWrapper.height = Ti.UI.SIZE;
            
            Omadi.widgets.image.saveImageInDb(e.source.widgetView.imageView, sigImg);
            
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
    }
};

