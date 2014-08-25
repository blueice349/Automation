/*jslint eqeq:true, plusplus: true*/ 
/*global Omadi */

Ti.include('/lib/functions.js');

var curWin = Ti.UI.currentWindow;
var wrapperView;
var tableView;
var specificTagsWindow = null;

function addiOSToolbar() {"use strict";
    var back, space, label, toolbar;
    
    back = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });

    back.addEventListener('click', function() {
        curWin.close();
    });

    space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    label = Titanium.UI.createLabel({
        text : 'Expired Tags',
        color : '#333',
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

function savedNodeTagsReady(){"use strict";
    Ti.UI.currentWindow.close();
}

function loggingOutTagsReady(){"use strict";
    Ti.UI.currentWindow.close();
}

function showSpecificTags(tags, title){"use strict";
    var i, row, backgroundColor, data, titleLabel, textView, rowImg, wrapper, table;
    
    specificTagsWindow = Ti.UI.createWindow({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        navBarHidden: false,
        title: 'Expired Tags - ' + title
    });
    
    data = [];
    
    Ti.API.debug(JSON.stringify(tags));
    
    for(i = 0; i < tags.length; i ++){
        
        backgroundColor = '#eee';
        if(tags[i].viewed > 0){
            backgroundColor = '#fff';
        }
            
        row = Ti.UI.createTableViewRow({
            width: '100%',
            height: Ti.UI.SIZE,
            nid: tags[i].nid,
            backgroundColor: backgroundColor,
            searchValue: tags[i].title
        });
            
        textView = Ti.UI.createView({
            right: 1,
            left: 50,
            top: 0,
            height: Ti.UI.SIZE,
            layout: 'vertical'
        });            
            
        rowImg = Ti.UI.createImageView({
            image: Omadi.display.getIconFile('tag'),
            top: 5,
            left: 5,
            bottom: 5,
            width: 35,
            height: 35
        });
            
        titleLabel = Ti.UI.createLabel({
            width: '100%',
            text: tags[i].title,
            textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
            height: Ti.UI.SIZE,
            font: {
                fontSize: 16
            },
            color: '#000'
        });
            
        row.add(rowImg);
        textView.add(titleLabel);
        row.add(textView);
        
        data.push(row);
    }
    
    wrapper = Ti.UI.createView({
        layout: 'vertical',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0    
    });
    
    if(Ti.App.isIOS7){
        wrapper.top = 20;
    }
    
    if(Ti.App.isIOS){
        var back, space, label, toolbar;
    
        back = Ti.UI.createButton({
            title : 'Back',
            style : Ti.UI.iPhone.SystemButtonStyle.BORDERED
        });
    
        back.addEventListener('click', function() {
            specificTagsWindow.close();
            specificTagsWindow = null;
        });
    
        space = Ti.UI.createButton({
            systemButton : Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
        });
        label = Ti.UI.createLabel({
            text : 'Expired Tags',
            color : '#333',
            ellipsize : true,
            wordwrap : false,
            width : Ti.UI.SIZE,
            style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
        });
    
        // create and add toolbar
        toolbar = Ti.UI.iOS.createToolbar({
            items : [back, space, label, space],
            top : 0,
            borderTop : false,
            borderBottom : false,
            height: Ti.UI.SIZE
        });
        wrapper.add(toolbar);
    }
    
    if(data.length){
        table = Ti.UI.createTableView({
            separatorColor : '#ccc',
            data : data,
            backgroundColor : '#eee',
            scrollable: true
        });
        
        table.addEventListener('click', function(e) {
            Omadi.display.showDialogFormOptions(e);
        });
        
        wrapper.add(table);
    }
    else{
        wrapper.add(Ti.UI.createLabel({
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
    
    
    
    specificTagsWindow.add(wrapper);
    
    specificTagsWindow.addEventListener('android:back', function(){
        specificTagsWindow.close();
        specificTagsWindow = null;
    });
    
    specificTagsWindow.open();
    
}

(function(){"use strict";
    var expiredTags, data, i, row, textView, rowImg, titleLabel, backgroundColor, 
        currentAccountName, tableSection, accountTags, accountTagsArray;
    
    Ti.App.removeEventListener("savedNode", savedNodeTagsReady);
    Ti.App.addEventListener("savedNode", savedNodeTagsReady);
    
    Ti.App.removeEventListener("loggingOut", loggingOutTagsReady);
    Ti.App.addEventListener("loggingOut", loggingOutTagsReady);
    
    expiredTags = Omadi.bundles.tag.getExpiredTags();
    
    accountTags = {};
    for(i in expiredTags){
        if(expiredTags.hasOwnProperty(i)){
            if(expiredTags[i] !== null){
                
                if(typeof accountTags[expiredTags[i].account_name] === 'undefined'){
                    accountTags[expiredTags[i].account_name] = [];
                }  
                
                accountTags[expiredTags[i].account_name].push(expiredTags[i]);
            }
        }
    }
    
    data = [];
    accountTagsArray = [];
    for(i in accountTags){
        if(accountTags.hasOwnProperty(i)){
            accountTagsArray.push(accountTags[i]);
        }
    }
    
    accountTagsArray = accountTagsArray.sort(function(a, b){return (a[0].account_name < b[0].account_name) ? -1 : 1; });
    
    for(i = 0; i < accountTagsArray.length; i ++){
        row = Ti.UI.createTableViewRow({
            width: '100%',
            height: 40,
            tags: accountTagsArray[i],
            title: accountTagsArray[i][0].account_name + " (" + accountTagsArray[i].length + ")",
            color: '#000',
            font: {
                fontSize: 18,
                fontWeight: 'bold'
            }
        });
        
        data.push(row);
    }
    
    wrapperView = Ti.UI.createView({
        layout: 'vertical',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0    
    });
    
    if(Ti.App.isIOS7){
        wrapperView.top = 20;
    }
    
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
            scrollable: true
        });
        
        tableView.addEventListener('click', function(e) {
            
            showSpecificTags(e.row.tags, e.row.title);
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
    
    Ti.UI.currentWindow.addEventListener('close', function(){
        Ti.App.removeEventListener("savedNode", savedNodeTagsReady);
        Ti.App.removeEventListener("loggingOut", loggingOutTagsReady); 
        
        // Release memory
        
        Ti.UI.currentWindow.remove(wrapperView);
        wrapperView = null;
        curWin = null;
    });
    
}());
