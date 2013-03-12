/*jslint eqeq:true, plusplus: true*/ 
/*global Omadi */

Ti.include('/lib/functions.js');

var curWin = Ti.UI.currentWindow;
var wrapperView;

var tableView;

function addiOSToolbar() {"use strict";
    var back, space, label, toolbar;
    
    back = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });

    back.addEventListener('click', function() {
        //Omadi.data.setUpdating(false);
        curWin.close();
    });

    space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    label = Titanium.UI.createButton({
        title : 'Expired Tags',
        color : '#fff',
        ellipsize : true,
        wordwrap : false,
        width : Ti.UI.SIZE,
        style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
    });

    // create and add toolbar
    toolbar = Titanium.UI.iOS.createToolbar({
        items : [back, space, label, space],
        top : 0,
        borderTop : false,
        borderBottom : false,
        height: Ti.UI.SIZE
    });
    wrapperView.add(toolbar);
}


(function(){"use strict";
    var expiredTags, data, i, row, textView, rowImg, titleLabel, backgroundColor;
    
    expiredTags = Omadi.bundles.tag.getExpiredTags();
    
    data = [];
    
    for(i = 0; i < expiredTags.length; i ++){
        
        backgroundColor = '#eee';
        if(expiredTags[i].viewed > 0){
            backgroundColor = '#fff';
        }
        
        row = Ti.UI.createTableViewRow({
            width: '100%',
            height: Ti.UI.SIZE,
            nid: expiredTags[i].nid,
            backgroundColor: backgroundColor,
            searchValue: expiredTags[i].title
        });
        
        textView = Ti.UI.createView({
            right: 1,
            left: 45,
            top: 0,
            height: Ti.UI.SIZE,
            layout: 'vertical'
        });            
        
        rowImg = Ti.UI.createImageView({
            image: Omadi.display.getNodeTypeImagePath('tag'),
            top: 5,
            left: 1,
            width: 35,
            height: 35
        });
        
        titleLabel = Ti.UI.createLabel({
            width: '100%',
            text: expiredTags[i].title,
            textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
            height: Ti.UI.SIZE,
            font: {
                fontSize: 16
            },
            color: '#000'
        });
        
        // timeLabel = Ti.UI.createLabel({
            // text: (orderField == 'viewed' ? 'Viewed ' : 'Saved ') + Omadi.utils.getTimeAgoStr(nodeData[i].timestamp),
            // height: Ti.UI.SIZE,
            // width: '100%',
            // textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
            // color: '#999',
            // font: {
                // fontSize: 14
            // }
        // });
        
        row.add(rowImg);
        textView.add(titleLabel);
        //textView.add(timeLabel);
        row.add(textView);
        
        data.push(row);
    }
    
    wrapperView = Ti.UI.createView({
        layout: 'vertical',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0    
    });
    
    if(Ti.App.isAndroid){
        Ti.API.error("Add android menu");
    }
    else{
        addiOSToolbar();
    }
    
    if(data.length){
        tableView = Ti.UI.createTableView({
            separatorColor : '#ccc',
            data : data,
            backgroundColor : '#eee',
            scrollable: true,
            
        });
        
        tableView.addEventListener('click', function(e) {
            Omadi.display.showDialogFormOptions(e);
        });
        
        wrapperView.add(tableView);
    }
    else{
        wrapperView.add(Ti.UI.createLabel({
            text: 'No tags are ready for you',
            font: {
                fontSize: 20,
                fontWeight: 'bold'
            },
            color: '#999',
            height: Ti.UI.FILL,
            width: Ti.UI.FILL,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
            backgroundColor: '#eee'
        }));
    }
    
    curWin.add(wrapperView);
}());
