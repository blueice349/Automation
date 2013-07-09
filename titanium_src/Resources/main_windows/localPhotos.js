/*jslint eqeq:true, plusplus: true*/ 
/*global Omadi */

Ti.include('/lib/functions.js');

var currentWinWrapper;
var buttons;
var viewButton;
var emailButton;
var deleteButton;
var uploadButton;

function addIOSToolbarLocalPhotos() {"use strict";
    var backButton, space, label, items, toolbar;

    backButton = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });

    backButton.addEventListener('click', function() {
        Ti.UI.currentWindow.close();
    });

    space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });

    label = Titanium.UI.createButton({
        title : 'Photos Not Uploaded',
        color : '#fff',
        ellipsize : true,
        wordwrap : false,
        width : Ti.UI.SIZE,
        focusable : false,
        touchEnabled : false,
        style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
    });

    items = [backButton, space, label, space];

    // create and add toolbar
    toolbar = Ti.UI.iOS.createToolbar({
        items : items,
        top : 0,
        borderTop : false,
        borderBottom : false,
        height : Ti.UI.SIZE
    });

    currentWinWrapper.add(toolbar);
}

function galleryItemClicked(e){"use strict";
    if(e.source.isChecked){
        e.source.setBorderWidth(0);
        e.source.setBackgroundColor('#fff');
        e.source.setBorderColor('#ccc');
    }
    else{
        e.source.setBorderWidth(2);
        e.source.setBackgroundColor('#ccc');
        e.source.setBorderColor('#333');
    }
    e.source.isChecked = !e.source.isChecked;
}

function showButtons(){"use strict";
    var buttons, viewButton;
    
    buttons = Ti.UI.createView({
        width: '100%',
        bottom: 0,
        height: 50,
        visible: false
    });
    
    viewButton = Ti.UI.createButton({
        title: 'View Photo', 
        width: '50%',
        left: 0 
    });
    
    buttons.add(viewButton);
    
    currentWinWrapper.add(buttons);
}

(function(){"use strict";

    var gallery, images, i, recentFiles, tempFile, now,
        earliestTimestamp, items, modified, item, image, checkbox, refreshButton, 
        topBar, titleLabel, buttons, useButton, cancelButton, galleryWrapper, transform, 
        rotateDegrees, imageView;
    
    Ti.UI.currentWindow.setBackgroundColor('#eee');
        
    currentWinWrapper = Ti.UI.createView({
        top : 0,
        left : 0,
        bottom : 0,
        right : 0
    });
    
    items = [];
    recentFiles = [];
    
    images = Omadi.data.getPhotosNotUploaded();
    
    Ti.API.debug("num files: " + images.length);
    
    galleryWrapper = Ti.UI.createScrollView({
        top: 50,
        bottom: 50,
        left: 0,
        right: 0,
        horizontalWrap: true,
        contentHeight: 'auto',
        width: '100%',
        scrollType: 'vertical',
        layout: 'vertical'
    });
    
    gallery = Ti.UI.createView({
        width: '100%',
        height: Ti.UI.SIZE,
        layout: 'horizontal'
    });
    
    galleryWrapper.add(gallery);
    
    for(i = 0; i < images.length; i ++){
        
        //Ti.API.debug(imageStrings[i]);
        tempFile = Ti.Filesystem.getFile(images[i].filePath);
        
        if(tempFile.exists()){
            modified = tempFile.modificationTimestamp();
           
            tempFile.modifiedTimestamp = modified;
            recentFiles.push({
                file: tempFile,
                degrees: images[i].degrees
            });
        }
    }
    
    if(recentFiles.length > 0){
        recentFiles = recentFiles.sort(Omadi.utils.fileSortByModified);
        
        for(i = 0; i < recentFiles.length; i ++){
            item = Ti.UI.createView({
                height: 120,
                width: 120,
                isChecked: false,
                photoFile: recentFiles[i].file,
                left: 5,
                top: 5,
                borderWidth: 0,
                borderColor: '#ccc',
                backgroundColor: '#fff'
            });
            
            imageView = Ti.UI.createImageView({
                image: recentFiles[i].file,
                height: 100,
                width: 100,
                top: 10,
                left: 10,
                autorotate: true,
                touchEnabled: false,
                borderWidth: 1,
                borderColor: '#666'
            });
            
            if(Ti.App.isAndroid && recentFiles[i].degrees > 0){
                transform = Ti.UI.create2DMatrix();
             
                rotateDegrees = recentFiles[i].degrees;
                if(rotateDegrees == 270){
                    rotateDegrees = 90;
                }
                else if(rotateDegrees == 90){
                    rotateDegrees = 270;
                }
                
                transform = transform.rotate(rotateDegrees);
                
                imageView.setTransform(transform);
            }
            
            item.add(imageView);
            
            // row.add(Ti.UI.createLabel({
                // text: Omadi.utils.getTimeAgoStr(recentFiles[i].modifiedTimestamp / 1000),
                // left: 60,
                // touchEnabled: false,
                // ellipsize: true
            // }));
//             
            // checkbox = Ti.UI.createView({
                // width : 35,
                // height : 35,
                // borderRadius : 4,
                // borderColor : '#333',
                // borderWidth : 1,
                // backgroundColor : '#FFF',
                // enabled : true,
                // right: 10,
                // parentRow: row,
                // touchEnabled: false
            // });
//             
            // row.checkbox = checkbox;
//             
            // row.add(checkbox);
            items.push(item);
            
            item.addEventListener('click', galleryItemClicked);
            
            gallery.add(item);
        }
    }
    else{
        item = Ti.UI.createLabel({
            height: 50,
            width: '100%',
            isChecked: false,
            text: '- All photos have been uploaded -',
            font: {
                fontSize: 14
            },
            color: '#999',
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        
        gallery.add(item);
    }
    
    if(Ti.App.isAndroid){
        topBar = Ti.UI.createLabel({
           top: 0,
           backgroundColor: '#666',
           height: 40,
           width: '100%',
           text: 'Photos Not Uploaded',
           color: '#fff',
           font: {
                fontSize: 15,
                fontWeight: 'bold'
           },
           textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        currentWinWrapper.add(topBar);
    }
    else{
        addIOSToolbarLocalPhotos();
    }
    
    
    currentWinWrapper.add(galleryWrapper);
    
    
    Ti.UI.currentWindow.setBackgroundColor("#fff");
    Ti.UI.currentWindow.add(currentWinWrapper);
    
}());