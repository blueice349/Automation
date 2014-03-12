/*jslint eqeq:true, plusplus: true*/ 
/*global Omadi */

Ti.include('/lib/functions.js');

Ti.include("/lib/widgets.js");

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
    label = Titanium.UI.createLabel({
        text : 'Dispatched Jobs',
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

function refreshJobsTable(firstTimeThrough){"use strict";
    var newJobsSection, currentUserJobsSection, newJobs, backgroundColor, row, textView,
        i, rowImg, titleLabel, currentUserJobs, dispatchBundle, newJobsHeader, 
        currentJobsHeader, discontinuedView, discontinuedLabel, isDiscontinued;
    
    dispatchBundle = Omadi.data.getBundle('dispatch');
    newJobs = Omadi.bundles.dispatch.getNewJobs();
    currentUserJobs = Omadi.bundles.dispatch.getCurrentUserJobs();
    
    newJobsHeader = Ti.UI.createLabel({
        text: 'New Jobs',
        color : '#ddd',
        font : {
            fontSize : 20,
            fontWeight : 'bold'
        },
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        width : '100%',
        touchEnabled : false,
        height : 30,
        backgroundGradient : {
            type : 'linear',
            startPoint : {
                x : '50%',
                y : '0%'
            },
            endPoint : {
                x : '50%',
                y : '100%'
            },
            colors : [{
                color : '#666',
                offset : 0.0
            }, {
                color : '#777',
                offset : 0.3
            }, {
                color : '#444',
                offset : 1.0
            }]
        },
        ellipsize : true,
        wordWrap : false
    });
    
    newJobsSection = Ti.UI.createTableViewSection({
        headerView: newJobsHeader
    });
    
    currentJobsHeader = Ti.UI.createLabel({
        text: 'My Open Jobs',
        color : '#ddd',
        font : {
            fontSize : 20,
            fontWeight : 'bold'
        },
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        width : '100%',
        touchEnabled : false,
        height : 30,
        backgroundGradient : {
            type : 'linear',
            startPoint : {
                x : '50%',
                y : '0%'
            },
            endPoint : {
                x : '50%',
                y : '100%'
            },
            colors : [{
                color : '#666',
                offset : 0.0
            }, {
                color : '#777',
                offset : 0.3
            }, {
                color : '#444',
                offset : 1.0
            }]
        },
        ellipsize : true,
        wordWrap : false
    });
    
    currentUserJobsSection = Ti.UI.createTableViewSection({
        headerView: currentJobsHeader
    });
    
    if(newJobs.length){
        
        for(i = 0; i < newJobs.length; i ++){
            
            backgroundColor = '#eee';
            if(newJobs[i].viewed > 0){
                backgroundColor = '#fff';
            }
            
            row = Ti.UI.createTableViewRow({
                width: '100%',
                height: Ti.UI.SIZE,
                nid: newJobs[i].nid,
                backgroundColor: backgroundColor,
                searchValue: newJobs[i].title,
                type: 'newJob'
            });
            
            textView = Ti.UI.createView({
                right: 1,
                left: 50,
                top: 0,
                height: Ti.UI.SIZE,
                layout: 'vertical'
            });            
            
            rowImg = Ti.UI.createImageView({
                image: Omadi.display.getIconFile(newJobs[i].type),
                top: 5,
                left: 5,
                width: 35,
                height: 35,
                bottom: 5
            });
            
            titleLabel = Ti.UI.createLabel({
                width: '100%',
                text: newJobs[i].title,
                textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 16
                },
                color: '#000'
            });
            
            row.add(rowImg);
            textView.add(titleLabel);
            
            //textView.add(timeLabel);
            row.add(textView);
            
            if(newJobs[i].isDiscontinued){
                
                discontinuedView = Ti.UI.createView({
                    top: 0,
                    height: 45,
                    left: 0,
                    right: 0,
                    width: '100%',
                    backgroundColor: '#fed',
                    opacity: 0.7,
                    zIndex: 5,
                    bubbleParent: false
                });
                
                discontinuedLabel = Ti.UI.createLabel({
                    text: 'DISCONTINUED',
                    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
                    color: '#900',
                    font: {
                        fontWeight: 'bold',
                        fontSize: 20
                    },
                    touchEnabled: false,
                    bubbleParent: false
                });
                
                discontinuedView.addEventListener('click', function(e){
                    e.cancelBubble = true; 
                });
            
                discontinuedView.add(discontinuedLabel);
                row.add(discontinuedView);
            }
            
            newJobsSection.add(row);
        }
    }
    else{
        
        newJobsSection.add(Ti.UI.createTableViewRow({
            title: 'No new jobs available',
            color: '#000'
        }));
    }
    
    if(currentUserJobs.length){
        
        for(i = 0; i < currentUserJobs.length; i ++){
            
            backgroundColor = '#eee';
            if(currentUserJobs[i].viewed > 0){
                backgroundColor = '#fff';
            }
            
            row = Ti.UI.createTableViewRow({
                width: '100%',
                height: Ti.UI.SIZE,
                nid: currentUserJobs[i].nid,
                backgroundColor: backgroundColor,
                searchValue: currentUserJobs[i].title,
                type: 'currentUserJob'
            });
            
            textView = Ti.UI.createView({
                right: 1,
                left: 50,
                top: 0,
                height: Ti.UI.SIZE,
                layout: 'vertical'
            });            
            
            rowImg = Ti.UI.createImageView({
                image: Omadi.display.getIconFile(currentUserJobs[i].type),
                top: 5,
                left: 5,
                bottom: 5,
                width: 35,
                height: 35
            });
            
            titleLabel = Ti.UI.createLabel({
                width: '100%',
                text: currentUserJobs[i].title,
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
            
            if(currentUserJobs[i].isDiscontinued){
                
                discontinuedView = Ti.UI.createView({
                    top: 0,
                    height: 45,
                    left: 0,
                    right: 0,
                    width: '100%',
                    backgroundColor: '#fed',
                    opacity: 0.7,
                    zIndex: 5,
                    bubbleParent: false
                });
                
                discontinuedLabel = Ti.UI.createLabel({
                    text: 'DISCONTINUED',
                    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
                    color: '#900',
                    font: {
                        fontWeight: 'bold',
                        fontSize: 20
                    },
                    touchEnabled: false,
                    bubbleParent: false
                });
                
                discontinuedView.addEventListener('click', function(e){
                    e.cancelBubble = true; 
                });
            
                discontinuedView.add(discontinuedLabel);
                row.add(discontinuedView);
            }
            
            currentUserJobsSection.add(row);
        }
    }
    else{
        
        currentUserJobsSection.add(Ti.UI.createTableViewRow({
            title: 'You have no open jobs',
            color: '#000'
        }));
    }
    
    tableView.setData([]);
    tableView.setData([newJobsSection, currentUserJobsSection]);
}

function savedNodeJobs(){"use strict";
        
    Ti.UI.currentWindow.close();
}

function finishedDataSyncJobs(){"use strict";
    
     refreshJobsTable(false);
}

function loggingOutJobs(){"use strict";
    Ti.UI.currentWindow.close();
}
    

(function(){"use strict";
    var newJobs, data, i, row, textView, rowImg, titleLabel, backgroundColor, 
        newJobsSection, sections, currentUserJobsSection, currentUserJobs, 
        dispatchBundle, separator, whiteSpaceTest, validJobs;
    
    Ti.App.removeEventListener("savedNode", savedNodeJobs);
    Ti.App.addEventListener("savedNode", savedNodeJobs);
    
    Ti.App.removeEventListener('omadi:finishedDataSync', finishedDataSyncJobs);
    Ti.App.addEventListener('omadi:finishedDataSync', finishedDataSyncJobs);
    
    Ti.App.removeEventListener('loggingOut', loggingOutJobs);
    Ti.App.addEventListener('loggingOut', loggingOutJobs);
    
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
        if(Ti.App.isIOS7){
            wrapperView.top = 20;
        }
    }
    
    tableView = Ti.UI.createTableView({
        separatorColor : '#ccc',
        backgroundColor : '#eee',
        scrollable: true
    });
    
    refreshJobsTable(true);
    
    tableView.addEventListener('click', function(e) {
        try{
            if(e.row.type == 'newJob'){
                Omadi.display.showDialogFormOptions(e, [{
                    text: 'Accept Job',
                    callback: Omadi.bundles.dispatch.acceptJob,
                    callbackArgs: [e.row.nid]
                },{
                    text: 'Driving Directions',
                    callback: Omadi.bundles.dispatch.getDrivingDirections,
                    callbackArgs: [e.row.nid]
                }]);
            }
            else{
                Omadi.display.showDialogFormOptions(e, [{
                    text: 'Update Status',
                    callback: Omadi.bundles.dispatch.showUpdateStatusDialog,
                    callbackArgs: [e.row.nid]
                },{
                    text: 'Driving Directions',
                    callback: Omadi.bundles.dispatch.getDrivingDirections,
                    callbackArgs: [e.row.nid]
                }]);
            }
        }
        catch(ex){
            Omadi.service.sendErrorReport("Exception with jobs tableview click: " + ex);
        }
    });
    
    wrapperView.add(tableView);
   
    curWin.add(wrapperView);
    
    Ti.UI.currentWindow.addEventListener('close', function(){
        Ti.App.removeEventListener("savedNode", savedNodeJobs);
        Ti.App.removeEventListener('omadi:finishedDataSync', finishedDataSyncJobs);
        Ti.App.removeEventListener('loggingOut', loggingOutJobs);
        
        // Clean up memory
        Ti.UI.currentWindow.remove(wrapperView);
        wrapperView = null;
        curWin = null;
    });
    
}());


