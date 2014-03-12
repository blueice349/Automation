/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;
Widget = {};

function SignatureWidget(formObj, instance, fieldViewWrapper){"use strict";
    this.formObj = formObj;
    this.instance = instance;
    this.fieldView = null;
    this.node = formObj.node;
    this.dbValues = [];
    this.textValues = [];
    this.nodeElement = null;
    this.numVisibleFields = 1;
    this.fieldViewWrapper = fieldViewWrapper;
    
    this.Paint = require('ti.paint');
    
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
        if(Omadi.utils.isArray(this.dbValues)){
            this.numVisibleFields = this.dbValues.length;
        }
    }
    else{
        this.numVisibleFields = this.instance.settings.cardinality;
    }
}

SignatureWidget.prototype.getFieldView = function(){"use strict";
    
    var i, element, addButton;
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    this.fieldView.add(this.formObj.getRegularLabelView(this.instance));
    
    // Add the actual fields
    for(i = 0; i < this.numVisibleFields; i ++){
        element = this.getNewElement(i);
        this.fieldView.add(element);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    if(this.instance.settings.cardinality == -1){
        
        addButton = Ti.UI.createButton({
            title: 'Add another item',
            right: 15,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            backgroundGradient: Omadi.display.backgroundGradientGray,
            borderColor: '#999',
            borderWidth: 1,
            width: 150,
            borderRadius: 10,
            color: '#eee',
            top: 10,
            height: Ti.UI.SIZE,
            fieldName: this.instance.field_name
        });
            
        addButton.addEventListener('click', function(e){
            Widget[e.source.fieldName].numVisibleFields ++;
            Widget[e.source.fieldName].formObj.unfocusField();
            Widget[e.source.fieldName].redraw();
        });
        
        this.fieldView.add(addButton);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    
    //this.formObj.setConditionallyRequiredLabelForInstance(this.instance);
    
    return this.fieldView;
};

SignatureWidget.prototype.redraw = function(){"use strict";
    Ti.API.debug("in redraw");
    var origFieldView;
    
    this.formObj.formToNode();
        
    //Ti.API.debug(JSON.stringify(this.formObj.node));
    
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

SignatureWidget.prototype.getNewElement = function(index){"use strict";
    var widgetView, dbValue, imageData, i, numImagesShowing = 0, 
        signNowButton, imageNid, imageView, eraseButton, buttonView, imageWrapper, sigLine, thex, isSigned;

    dbValue = null;
    imageData = [];
    
    if ( typeof this.node[this.instance.field_name] !== 'undefined') {
        if ( typeof this.node[this.instance.field_name].dbValues !== 'undefined' && typeof this.node[this.instance.field_name].dbValues[0] !== 'undefined') {
            dbValue = this.node[this.instance.field_name].dbValues[0];
        }
        
        if ( typeof this.node[this.instance.field_name].imageData !== 'undefined') {
            imageData = this.node[this.instance.field_name].imageData;
        }
    }
    
    Ti.API.error("Signature element");
    Ti.API.error(JSON.stringify(this.node));
    
    imageNid = this.formObj.nid;
    if(typeof this.formObj.origNid !== 'undefined'){
        imageNid = this.formObj.origNid;
    }
    
    Ti.API.debug("Creating signature field: " + this.instance.label);
    
    widgetView = Ti.UI.createView({
       height: Ti.UI.SIZE,
       width: '92%',
       layout: 'vertical'
    });
    
    buttonView = Ti.UI.createView({
        height: Ti.UI.SIZE,
        width: '100%',
        layout: 'horizontal',
        instance: this.instance
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
        },
        instance: this.instance
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
        instance : this.instance,
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
        Omadi.display.displayLargeImage(imageView, imageNid, dbValue, true);
    }
    else{
        imageWrapper.height = 0;
        buttonView.add(signNowButton);
    }
    
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
    
    buttonView.addEventListener('click', function(e){
        Widget[e.source.instance.field_name].openSignatureView(widgetView);
    });
    
    numImagesShowing = 1;
    
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

SignatureWidget.prototype.openSignatureView = function(widgetView){"use strict";
    
    var win, thex, sigLine, screenShadow, wrapper, outsideWrapper, wrapperShadow, 
        doneButton, clearButton, cancelButton, paintView, buttonView, 
        scrollView, textView, textLabel, overlayButton, overlayLabel, hasText;
    
    win = Ti.UI.createWindow({  
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT],
        modal: true,
        navBarHidden: true
    });
    
    hasText = false;
    
    if(typeof this.instance.settings.signature_text !== 'undefined' && 
        this.instance.settings.signature_text.length != null && 
        this.instance.settings.signature_text.length != ""){
        
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
        instance: this.instance
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
    
    paintView = this.Paint.createPaintView({
        width : '100%',
        bottom: 0,
        top: 0,
        instance : this.instance,
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
            text: this.instance.settings.signature_text,
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
            
            Widget[e.source.instance.field_name].removePreviousSignature();
            
            e.source.widgetView.imageView.setImage(blob);
            e.source.widgetView.imageWrapper.setVisible(true);
            e.source.widgetView.imageWrapper.setHeight(Ti.UI.SIZE);
            
            // This waiting is really only for the Android devices, but it's not a hugely back thing
            // To leave for a possibly slow iOS device

            setTimeout(function(){
                Widget[e.source.instance.field_name].saveSignature(e.source);
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
    });
    
    win.add(screenShadow);
    win.add(scrollView);
    
    win.open();
};

SignatureWidget.prototype.saveSignature = function(doneButton){"use strict";
    var filePath, file, blob;

    Ti.API.debug("SAVING SIGNATURE");

    file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "s_" + Omadi.utils.getUTCTimestamp() + '.bmp');
    
    filePath = file.getNativePath();
    
    doneButton.widgetView.imageView.filePath = filePath;

    if(file){

        blob = doneButton.widgetView.imageView.toBlob();
        file.write(blob);

        this.saveFileInfo(doneButton.widgetView.imageView, filePath, '', 0, blob.length, 'signature');
    }
    else{

        Omadi.service.sendErrorReport("File is not available for signature.");
        alert("There was a problem saving the signature.");
    }
};

SignatureWidget.prototype.removePreviousSignature = function(){"use strict";
    var nid, db;
    /*global dbEsc*/
    
    if(typeof this.formObj.nid !== 'undefined'){
        nid = this.formObj.nid;
        
        db = Omadi.utils.openListDatabase();
        db.execute("DELETE FROM _files WHERE nid = 0 AND field_name = '" + dbEsc(this.instance.field_name) + "'");
        db.close();
    }
};

SignatureWidget.prototype.saveFileInfo = function(imageView, filePath, thumbPath, degrees, filesize, type) {"use strict";
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
        
        timestamp = Omadi.utils.getUTCTimestamp();
        fieldName = imageView.instance.field_name;
        imageIndex = imageView.imageIndex;
        
        Ti.API.debug("Saved Path: " + filePath);
        
        location = Omadi.location.getLastLocation();
        
        uid = Omadi.utils.getUid();
        clientAccount = Omadi.utils.getClientAccount();

        db = Omadi.utils.openListDatabase();
        db.execute("INSERT INTO _files (nid, timestamp, file_path, field_name, file_name, delta, latitude, longitude, accuracy, degrees, thumb_path, filesize, bytes_uploaded, type, uid, client_account) VALUES ('0','" + timestamp + "','" + filePath + "','" + fieldName + "','" + imageName + "'," + imageIndex + ",'" + location.latitude + "','" + location.longitude + "'," + location.accuracy + "," + degrees + ",'" + thumbPath + "'," + filesize + ",0,'" + type + "'," + uid + ",'" + clientAccount + "')");
        db.close();
    }
    catch(ex) {
        alert("Problem saving the photo to the database: " + ex);
    }
};

exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new SignatureWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};


