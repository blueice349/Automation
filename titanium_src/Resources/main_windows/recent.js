/*jslint eqeq:true, plusplus: true*/ 
/*global Omadi */

Ti.include('/lib/functions.js');

var curWin = Ti.UI.currentWindow;
var tabGroup;
var tableView;
var tableData = {};
var currentOrderField = 'changed';
var wrapperView;
var search;


curWin.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]);
curWin.setBackgroundColor('#eee');

wrapperView = Ti.UI.createView({
   layout: 'vertical',
   bottom: 0,
   top: 0,
   right: 0,
   left: 0 
});

function getRecentNodeData(orderField){"use strict";
    var db, result, nodes = [], sql;
    
    db = Omadi.utils.openMainDatabase();
    sql = "SELECT title, table_name, nid, viewed, changed FROM node ";
   
    // Don't allow any drafts to be seen right now because it messes up some of the action options
    sql += " WHERE flag_is_updated IN (0,1) ";
    
    if(orderField == 'viewed'){
        sql += " AND viewed > 0 ";
    }
   
    sql += " ORDER BY " + orderField + " DESC LIMIT 40";
    result = db.execute(sql);
    
    while(result.isValidRow()){
        
        nodes.push({
           title: result.fieldByName('title'),
           type: result.fieldByName('table_name'),
           nid: result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT),
           changed: result.fieldByName('changed', Ti.Database.FIELD_TYPE_INT),
           viewed: result.fieldByName('viewed', Ti.Database.FIELD_TYPE_INT),
           timestamp: result.fieldByName(orderField, Ti.Database.FIELD_TYPE_INT)
        });
        
        result.next();
    }
    db.close();
    
    return nodes;
}


function getTableViewData(orderField){"use strict";
    var i, nodeData, row, titleLabel, rowImg, imageView, timeLabel, backgroundColor, textView;
    
    if(typeof tableData[orderField] === 'undefined'){
        
        tableData[orderField] = [];
        
        nodeData = getRecentNodeData(orderField);
        
        for(i = 0; i < nodeData.length; i ++){
            backgroundColor = '#eee';
            if(nodeData[i].viewed > 0){
                backgroundColor = '#fff';
            }
            
            row = Ti.UI.createTableViewRow({
                width: '100%',
                height: Ti.UI.SIZE,
                nid: nodeData[i].nid,
                backgroundColor: backgroundColor,
                searchValue: nodeData[i].title
            });
            
            textView = Ti.UI.createView({
                right: 1,
                left: 50,
                top: 0,
                height: Ti.UI.SIZE,
                layout: 'vertical'
            });            
            
            rowImg = Ti.UI.createImageView({
                image: Omadi.display.getNodeTypeImagePath(nodeData[i].type),
                top: 5,
                left: 5,
                width: 35,
                height: 35,
                bottom: 5
            });
            
            titleLabel = Ti.UI.createLabel({
                width: '100%',
                text: nodeData[i].title,
                textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 16
                },
                color: '#000'
            });
            
            timeLabel = Ti.UI.createLabel({
                text: (orderField == 'viewed' ? 'Viewed ' : 'Saved ') + Omadi.utils.getTimeAgoStr(nodeData[i].timestamp),
                height: Ti.UI.SIZE,
                width: '100%',
                textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
                color: '#999',
                font: {
                    fontSize: 14
                }
            });
            
            row.add(rowImg);
            textView.add(titleLabel);
            textView.add(timeLabel);
            row.add(textView);
            
            tableData[orderField].push(row);
        }
    }
    
    return tableData[orderField];
}

function createiOSToolbar(){"use strict";
    var back, space, toolbar, items, buttonBar;
    
    if(Ti.App.isIOS){
        
        back = Ti.UI.createButton({
            title : 'Back',
            style : Ti.UI.iPhone.SystemButtonStyle.BORDERED
        });
        
        back.addEventListener('click', function() {
            curWin.close();
            //tabGroup.close();
        });
        
        space = Ti.UI.createButton({
            systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
        });
        
        buttonBar = Titanium.UI.iOS.createTabbedBar({
            labels: ['Recently Saved', 'Recently Viewed'],
            backgroundColor: '#336699',
            style: Titanium.UI.iPhone.SystemButtonStyle.BAR,
            height: Ti.UI.SIZE,
            width: Ti.UI.SIZE,
            index: 0
        });
        
        buttonBar.addEventListener('click', function(e){
            if(e.index == 0){
                currentOrderField = 'changed';
            }
            else{
                currentOrderField = 'viewed';
            }
            
            tableView.setData(getTableViewData(currentOrderField));  
            
            tableView.scrollToIndex(0);
            search.setValue('');
        });
        
        items = [back, space, buttonBar, space];
        
        // create and add toolbar
        toolbar = Ti.UI.iOS.createToolbar({
            items: items,
            top: 0,
            borderTop: false,
            borderBottom: false,
            zIndex: 1
        });
        
        wrapperView.add(toolbar);
    }
}

function createAndroidTabs(){"use strict";

    var savedTab, viewedTab, tabs;
    
    if(Ti.App.isAndroid){
        
        savedTab = Ti.UI.createLabel({
           text: 'Recently Saved',
           textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
           font: {
               fontSize: 16,
               fontWeight: 'bold'               
           },
           backgroundColor: '#444',
           color: '#fff',
           width: '49%',
           height: 40,
           borderColor: '#444',
           borderWidth: 1,
           borderRadius: 3,
           left: 0,
           top: 0
        });
        
        savedTab.addEventListener('click', function(e){
            if(currentOrderField != 'changed'){
                currentOrderField = 'changed';
                savedTab.setBackgroundColor('#444');
                viewedTab.setBackgroundColor('#777');
                tableView.setData(getTableViewData(currentOrderField));
            }  
            
            tableView.scrollToIndex(0);
            search.setValue('');
        });
        
        viewedTab = Ti.UI.createLabel({
           text: 'Recently Viewed',
           textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
           font: {
               fontSize: 16,
               fontWeight: 'bold'               
           },
           backgroundColor: '#777',
           color: '#fff',
           width: '49%',
           height: 40,
           borderColor: '#444',
           borderWidth: 1,
           borderRadius: 3,
           right: 0,
           top: 0
        });
        
        viewedTab.addEventListener('click', function(e){
            if(currentOrderField != 'viewed'){
                currentOrderField = 'viewed';
                viewedTab.setBackgroundColor('#444');
                savedTab.setBackgroundColor('#777');
                tableView.setData(getTableViewData(currentOrderField));
            }  
            tableView.scrollToIndex(0);
            search.setValue('');
        });
        
        // create and add toolbar
        tabs = Ti.UI.createView({
            width: '100%',
            height: 40,
            backgroundColor: '#000'
        });
        
        tabs.add(savedTab);
        tabs.add(viewedTab);
        
        wrapperView.add(tabs);
    }
}

function loggingOutRecent(){"use strict";
    Ti.UI.currentWindow.close();
}

function savedNodeRecent(){"use strict";
    Ti.UI.currentWindow.close();
}

(function(){"use strict";
    var recentlySavedTab, recentlySavedWindow, recentlyViewedTab, recentlyViewedWindow;
    
    curWin.addEventListener("android:back", function(){
       curWin.close(); 
    });
    
    Ti.App.removeEventListener('loggingOut', loggingOutRecent);
    Ti.App.addEventListener('loggingOut', loggingOutRecent);
    
    Ti.App.removeEventListener("savedNode", savedNodeRecent);
    Ti.App.addEventListener("savedNode", savedNodeRecent);
    
    if(Ti.App.isAndroid){
        createAndroidTabs();
    }
    else{
        createiOSToolbar();
    }
    
    search = Ti.UI.createSearchBar({
        hintText : 'Search...',
        autocorrect : false,
        barColor : '#666',
        showCancel: true,
        height : 35,
        color: '#000',
        backgroundColor: '#666'
    });
    
    if(Ti.App.isAndroid){
        search.height = 45;
    }
    else{
        search.height = 35;
    }
    
    search.addEventListener('change', function(e){
        var v, i, regex, filterData = [];
        v = e.source.value;
        v = v.replace(/([\(\)\[\]\:\-\?\.\^\$\\\*\+\|\{\}])/g, "\\" + "$1");
        
        regex = new RegExp(v, 'i');
        
        for(i = 0; i < tableData[currentOrderField].length; i ++){
            
            if(tableData[currentOrderField][i].searchValue.search(regex) != -1) {
                filterData.push(tableData[currentOrderField][i]);
            }
        }
        
        tableView.setData(filterData);
    });
    
    search.addEventListener('cancel', function(e){
        tableView.setData(tableData[currentOrderField]);
        e.source.setValue('');
        e.source.blur();
    });
    
    search.addEventListener('return', function(e){
        e.source.blur();
    });
    
    search.addEventListener('touchcancel', function(e){
        e.source.blur();
    });
    
    wrapperView.add(search);
    
    tableView = Ti.UI.createTableView({
        width: '100%',
        bottom: 0,
        scrollable: true,
        top: 0,
        separatorColor : '#ccc'
    });
    
    tableView.addEventListener('touchstart', function(){
        search.blur(); 
    });
    
    tableView.addEventListener('scroll', function(e) {
        search.blur();
    });
    
    tableView.addEventListener('click', function(e) {
        Omadi.display.showDialogFormOptions(e);
    });
        
    tableView.setData(getTableViewData('changed'));  
    wrapperView.add(tableView);
    
    curWin.add(wrapperView);
    
    Ti.UI.currentWindow.addEventListener('close', function(){
        Ti.App.removeEventListener('loggingOut', loggingOutRecent);        
        Ti.App.removeEventListener("savedNode", savedNodeRecent);
        
        // Clean up memory
        //Ti.UI.currentWindow.remove(wrapperView);
        wrapperView = null;
        curWin = null;
    });
    
}());


