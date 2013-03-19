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
        title : 'Dispatched Jobs',
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

function refreshJobsTable(){"use strict";
    var newJobsSection, currentUserJobsSection, sections, newJobs, backgroundColor, row, textView,
        i, rowImg, titleLabel, currentUserJobs, dispatchBundle;
    
    dispatchBundle = Omadi.data.getBundle('dispatch');
    newJobs = Omadi.bundles.dispatch.getNewJobs();
    currentUserJobs = Omadi.bundles.dispatch.getCurrentUserJobs();
    sections = [];
    
    newJobsSection = Ti.UI.createTableViewSection({
        headerView: Ti.UI.createLabel({
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
        })
    });
    
    currentUserJobsSection = Ti.UI.createTableViewSection({
        headerView: Ti.UI.createLabel({
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
        })
    });
    
    sections.push(newJobsSection);
    sections.push(currentUserJobsSection);
    
    // separator = ' - ';
    // if ( typeof dispatchBundle.data.title_fields !== 'undefined' && typeof dispatchBundle.data.title_fields.separator !== 'undefined') {
        // separator = dispatchBundle.data.title_fields.separator;
    // }
//     
    // whiteSpaceTest = Omadi.utils.trimWhiteSpace(separator);

    
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
                left: 45,
                top: 0,
                height: Ti.UI.SIZE,
                layout: 'vertical'
            });            
            
            rowImg = Ti.UI.createImageView({
                image: Omadi.display.getNodeTypeImagePath(newJobs[i].type),
                top: 5,
                left: 1,
                width: 35,
                height: 35
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
                left: 45,
                top: 0,
                height: Ti.UI.SIZE,
                layout: 'vertical'
            });            
            
            rowImg = Ti.UI.createImageView({
                image: Omadi.display.getNodeTypeImagePath(currentUserJobs[i].type),
                top: 5,
                left: 1,
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
            //textView.add(timeLabel);
            row.add(textView);
            
            currentUserJobsSection.add(row);
        }
    }
    else{
        currentUserJobsSection.add(Ti.UI.createTableViewRow({
            title: 'You have no open jobs',
            color: '#000'
        }));
    }
    
    tableView.setData(sections);
}


(function(){"use strict";
    var newJobs, data, i, row, textView, rowImg, titleLabel, backgroundColor, 
        newJobsSection, sections, currentUserJobsSection, currentUserJobs, 
        dispatchBundle, separator, whiteSpaceTest;
    
    Ti.App.addEventListener("savedNode", function(){
        
        if(Ti.App.isAndroid){
            Ti.UI.currentWindow.close();
        }
        else{
            Ti.UI.currentWindow.hide();
            // Close the window after the maximum timeout for a node save
            setTimeout(Ti.UI.currentWindow.close, 65000);
        }
    });
    
    Ti.App.addEventListener('finishedDataSync', function(){
        refreshJobsTable();
    });
    
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
    
    tableView = Ti.UI.createTableView({
        separatorColor : '#ccc',
        backgroundColor : '#eee',
        scrollable: true
    });
    
    refreshJobsTable();
    
    tableView.addEventListener('click', function(e) {
        if(e.row.type == 'newJob'){
            Omadi.display.showDialogFormOptions(e, [{
                text: 'Accept Job',
                callback: Omadi.bundles.dispatch.acceptJob,
                callbackArgs: [e.row.nid]
            }]);
        }
        else{
            Omadi.display.showDialogFormOptions(e, [{
                text: 'Update Status',
                callback: Omadi.bundles.dispatch.showUpdateStatusDialog,
                callbackArgs: [e.row.nid]
            }]);
        }
    });
    
    wrapperView.add(tableView);
   
    curWin.add(wrapperView);
    
}());


