Ti.include('/lib/functions.js');

/*global Omadi*/
/*jslint eqeq:true*/

var curWin;
var currentWinWrapper;
var refreshText;
var vehicleText;
var vehicleButton;

curWin = Ti.UI.currentWindow;

function createIOSToolbar() {"use strict";
    var backButton, space, label, items, toolbar;

    backButton = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });

    backButton.addEventListener('click', function() {
        curWin.close();
    });

    space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });

    label = Titanium.UI.createButton({
        title : 'Actions',
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

function addSeparator(){"use strict";
    var wrapper, line;
    
    wrapper = Ti.UI.createView({
        height: 15,
        width: '100%',
        layout: 'vertical'   
    });
    
    line = Ti.UI.createView({
        height: 1,
        width: '95%',
        backgroundColor: '#ccc',
        top: 10
    });
    
    wrapper.add(line);
    
    currentWinWrapper.add(wrapper);
}

function addClockInClockOut() {"use strict";
    var wrapper, button, dialog, image, text, textButton;
    
    if (Omadi.bundles.timecard.userShouldClockInOut()) {
        
        wrapper = Ti.UI.createView({
           height: Ti.UI.SIZE,
           width: Ti.UI.FILL
        });
        
        textButton = Ti.UI.createView({
            layout: 'vertical',
            height: Ti.UI.SIZE,
            left: 48,
            right: 0
        });
        
        text = Ti.UI.createLabel({
           color: '#666',
           font: {
               fontSize: 14
           },
           height: Ti.UI.SIZE,
           width: Ti.UI.SIZE
        });
        
        if (Omadi.bundles.timecard.isUserClockedIn()) {
            text.setText('You are currently clocked in.');   
        }
        else{
            text.setText('You are clocked out.');
        }
        
        button = Ti.UI.createButton({
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
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
                    color : '#246',
                    offset : 0.0
                }, {
                    color : '#468',
                    offset : 0.33
                }, {
                    color : '#024',
                    offset : 1.0
                }]
            },
            color: '#fff',
            borderRadius: 7,
            width: 200,
            height: 35,
            font: {
                fontWeight: 'bold',
                fontSize: 16
            },
            borderColor: '#333',
            borderWidth: 1,
            top: 3
        });
        
        if (Omadi.bundles.timecard.isUserClockedIn()) {
            button.setTitle("Clock Out");
        }
        else {
            button.setTitle("Clock In");
        }

        button.addEventListener('click', function(e) {
            if (Omadi.bundles.timecard.isUserClockedIn()) {
                dialog = Ti.UI.createAlertDialog({
                    title : "Verify Clock Out",
                    buttonNames : ['Clock Out', 'Cancel']
                });

                dialog.addEventListener('click', function(e) {
                    if (e.index == 0) {
                        Omadi.bundles.timecard.doClockOut(false);
                        button.setTitle("Clock In");
                        text.setText('You are clocked out.');
                    }
                });
            }
            else {
                dialog = Ti.UI.createAlertDialog({
                    title : "Verify Clock In",
                    buttonNames : ['Clock In', 'Cancel']
                });

                dialog.addEventListener('click', function(e) {
                    if (e.index == 0) {
                        Omadi.bundles.timecard.doClockIn();
                        button.setTitle("Clock Out");
                        text.setText('You are currently clocked in.');
                    }
                });
            }

            dialog.show();
        });
        
        image = Ti.UI.createImageView({
           image: Omadi.display.getNodeTypeImagePath('timecard'),
           top: 9,
           left: '3%',
           height: Ti.UI.SIZE,
           width: Ti.UI.SIZE
        });
        
        wrapper.add(image);
        wrapper.add(textButton);
        
        textButton.add(text);
        textButton.add(button);
        
        
        currentWinWrapper.add(wrapper);
        addSeparator();
    }
}

function companyVehicleSelectedDraft(e){"use strict";
          
     var vehicle_name = Omadi.bundles.companyVehicle.getCurrentVehicleName();
     if(vehicle_name !== null){
         vehicleButton.setTitle("Done With Vehicle");
         vehicleText.setText('You are in ' + vehicle_name + '.');
     }
}

function addCompanyVehicle(){"use strict";
    var wrapper, dialog, image, textButton, currentVehicle, companyVehicleBundle;
    
    companyVehicleBundle = Omadi.data.getBundle('company_vehicle');
    
    if (companyVehicleBundle && Omadi.bundles.inspection.userDrivesATruck()) {
        
        wrapper = Ti.UI.createView({
           height: Ti.UI.SIZE,
           width: Ti.UI.FILL
        });
        
        textButton = Ti.UI.createView({
            layout: 'vertical',
            height: Ti.UI.SIZE,
            left: 48,
            right: 0
        });
        
        vehicleText = Ti.UI.createLabel({
           color: '#666',
           font: {
               fontSize: 14
           },
           height: Ti.UI.SIZE,
           width: Ti.UI.SIZE
        });
        
        vehicleButton = Ti.UI.createButton({
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
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
                    color : '#246',
                    offset : 0.0
                }, {
                    color : '#468',
                    offset : 0.33
                }, {
                    color : '#024',
                    offset : 1.0
                }]
            },
            color: '#fff',
            borderRadius: 7,
            width: 200,
            height: 35,
            font: {
                fontWeight: 'bold',
                fontSize: 16
            },
            borderColor: '#333',
            borderWidth: 1,
            top: 3
        });
        
        currentVehicle = Omadi.bundles.companyVehicle.getCurrentVehicleName();
        
        if (currentVehicle === null) {
            vehicleText.setText('You are not in a vehicle.');   
            vehicleButton.setTitle("Choose Your Vehicle");
        }
        else{
            vehicleText.setText('You are in ' + currentVehicle + '.');
            vehicleButton.setTitle("Done With Vehicle");
        }

        vehicleButton.addEventListener('click', function(e) {
            var inVehicle = Omadi.bundles.companyVehicle.getCurrentVehicleName();
            
            if (inVehicle === null) {
                Omadi.bundles.companyVehicle.askAboutVehicle();
            }
            else {
                Omadi.bundles.companyVehicle.exitVehicle();
                vehicleText.setText('You are not in a vehicle.');
                vehicleButton.setTitle("Choose Your Vehicle");
            }
        });
        
        Ti.App.removeEventListener('companyVehicleSelected', companyVehicleSelectedDraft); 
        Ti.App.addEventListener('companyVehicleSelected', companyVehicleSelectedDraft);
        
        Ti.UI.currentWindow.addEventListener('close', function(){
           Ti.App.removeEventListener('companyVehicleSelected', companyVehicleSelectedDraft); 
        });
        
        image = Ti.UI.createImageView({
           image: Omadi.display.getNodeTypeImagePath('company_vehicle'),
           top: 9,
           left: '3%',
           height: Ti.UI.SIZE,
           width: Ti.UI.SIZE
        });
        
        wrapper.add(image);
        
        textButton.add(vehicleText);
        textButton.add(vehicleButton);
        
        wrapper.add(textButton);
        currentWinWrapper.add(wrapper);
        addSeparator();
    }
}

function addDrafts(){"use strict";
    var wrapper, button, dialog, image, text, textButton, currentVehicle, companyVehicleBundle;
    
    
        wrapper = Ti.UI.createView({
           height: Ti.UI.SIZE,
           width: Ti.UI.FILL
        });
        
        textButton = Ti.UI.createView({
            layout: 'vertical',
            height: Ti.UI.SIZE,
            left: 48,
            right: 0
        });
        
        text = Ti.UI.createLabel({
           color: '#666',
           font: {
               fontSize: 14
           },
           height: Ti.UI.SIZE,
           width: Ti.UI.SIZE
        });
        
        button = Ti.UI.createButton({
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
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
                    color : '#246',
                    offset : 0.0
                }, {
                    color : '#468',
                    offset : 0.33
                }, {
                    color : '#024',
                    offset : 1.0
                }]
            },
            color: '#fff',
            borderRadius: 7,
            width: 200,
            height: 35,
            font: {
                fontWeight: 'bold',
                fontSize: 16
            },
            borderColor: '#333',
            borderWidth: 1,
            top: 3,
            title: 'View My Drafts'
        });

        button.addEventListener('click', function(e) {
            Omadi.display.openDraftsWindow();
        });
        
        image = Ti.UI.createImageView({
           image: '/images/drafts.png',
           top: 9,
           left: '3%',
           height: Ti.UI.SIZE,
           width: Ti.UI.SIZE
        });
        
        wrapper.add(image);
        
        textButton.add(text);
        textButton.add(button);
        
        wrapper.add(textButton);
        currentWinWrapper.add(wrapper);
        addSeparator();
    
}

function addLocalPhotos(){"use strict";
    var wrapper, button, dialog, image, text, textButton, currentVehicle, companyVehicleBundle;
    
    
        wrapper = Ti.UI.createView({
           height: Ti.UI.SIZE,
           width: Ti.UI.FILL
        });
        
        textButton = Ti.UI.createView({
            layout: 'vertical',
            height: Ti.UI.SIZE,
            left: 48,
            right: 0
        });
        
        text = Ti.UI.createLabel({
           color: '#666',
           font: {
               fontSize: 14
           },
           height: Ti.UI.SIZE,
           width: Ti.UI.SIZE
        });
        
        button = Ti.UI.createButton({
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
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
                    color : '#246',
                    offset : 0.0
                }, {
                    color : '#468',
                    offset : 0.33
                }, {
                    color : '#024',
                    offset : 1.0
                }]
            },
            color: '#fff',
            borderRadius: 7,
            width: 200,
            height: 35,
            font: {
                fontWeight: 'bold',
                fontSize: 16
            },
            borderColor: '#333',
            borderWidth: 1,
            top: 3,
            title: 'Photos Not Uploaded'
        });

        button.addEventListener('click', function(e) {
            Omadi.display.openLocalPhotosWindow();
        });
        
        image = Ti.UI.createImageView({
           image: '/images/drafts.png',
           top: 9,
           left: '3%',
           height: Ti.UI.SIZE,
           width: Ti.UI.SIZE
        });
        
        wrapper.add(image);
        
        textButton.add(text);
        textButton.add(button);
        
        wrapper.add(textButton);
        currentWinWrapper.add(wrapper);
        addSeparator();
    
}

function addDeleteAll(){"use strict";
    var wrapper, button, dialog, image, textButton;
    
   
    wrapper = Ti.UI.createView({
       height: Ti.UI.SIZE,
       width: Ti.UI.FILL
    });
    
    textButton = Ti.UI.createView({
        layout: 'vertical',
        height: Ti.UI.SIZE,
        left: 48,
        right: 0
    });
    
    button = Ti.UI.createButton({
        style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
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
                color : '#800',
                offset : 0.0
            }, {
                color : '#a00',
                offset : 0.33
            }, {
                color : '#600',
                offset : 1.0
            }]
        },
        color: '#fff',
        borderRadius: 7,
        width: 200,
        height: 35,
        font: {
            fontWeight: 'bold',
            fontSize: 16
        },
        borderColor: '#333',
        borderWidth: 1,
        top: 3,
        title: 'Reset All Data'
    });
    
    button.addEventListener('click', function(e) {
        dialog = Ti.UI.createAlertDialog({
            cancel : 1,
            buttonNames : ['Yes', 'No'],
            message : 'This will delete any data not uploaded to the server, and this cannot be undone! Are you sure?',
            title : 'Reset All Data'
        });
    
        dialog.addEventListener('click', function(e) {
            var db, result;
            
            if(e.index === 0) {
                if (!Omadi.data.isUpdating()){
                    
                    dialog.hide(); 
                    curWin.close();
                    
                    Ti.App.fireEvent('full_update_from_menu');
                } 
            }
        });
        
        dialog.show();
    });
    
    image = Ti.UI.createImageView({
       image: '/images/delete_all_icon.png',
       top: 2,
       left: '3%',
       height: Ti.UI.SIZE,
       width: Ti.UI.SIZE
    });
    
    wrapper.add(image);
    
    textButton.add(button);
    
    wrapper.add(textButton);
    currentWinWrapper.add(wrapper);
    addSeparator();

}

function refreshCallbackDraft(){"use strict";
   var lastSyncTimestamp;
   
   Omadi.display.doneLoading(); 
   lastSyncTimestamp = Omadi.data.getLastUpdateTimestamp();

    if(lastSyncTimestamp !== 0){
        refreshText.setText("Synced " + Omadi.utils.getTimeAgoStr(lastSyncTimestamp));
    } 
    else{
        refreshText.setText('Never Synced');
    } 
}

function addRefresh(){"use strict";
    var wrapper, button, dialog, image, textButton, lastSyncTimestamp;
    
  
    wrapper = Ti.UI.createView({
       height: Ti.UI.SIZE,
       width: Ti.UI.FILL
    });
    
    textButton = Ti.UI.createView({
        layout: 'vertical',
        height: Ti.UI.SIZE,
        left: 48,
        right: 0
    });
    
    refreshText = Ti.UI.createLabel({
       color: '#666',
       font: {
           fontSize: 14
       },
       height: Ti.UI.SIZE,
       width: Ti.UI.SIZE
    });
    
    lastSyncTimestamp = Omadi.data.getLastUpdateTimestamp();
    
    if(lastSyncTimestamp !== 0){
        refreshText.setText("Synced " + Omadi.utils.getTimeAgoStr(lastSyncTimestamp));
    } 
    else{
        refreshText.setText('Never Synced');
    }
    
    button = Ti.UI.createButton({
        style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
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
                color : '#777',
                offset : 0.0
            }, {
                color : '#999',
                offset : 0.33
            }, {
                color : '#666',
                offset : 1.0
            }]
        },
        color: '#fff',
        borderRadius: 7,
        width: 200,
        height: 35,
        font: {
            fontWeight: 'bold',
            fontSize: 16
        },
        borderColor: '#333',
        borderWidth: 1,
        top: 3,
        title: 'Refresh / Sync Data'
    });
    
    button.addEventListener('click', function(e) {
        Omadi.display.loading('Refreshing...');
        Omadi.service.checkUpdate();
        
        Ti.App.removeEventListener('finishedDataSync', refreshCallbackDraft);
        
        Ti.App.addEventListener('finishedDataSync', refreshCallbackDraft);
        
        Ti.UI.currentWindow.addEventListener('close', function(){
            Ti.App.removeEventListener('finishedDataSync', refreshCallbackDraft);
        });
    });
    
    image = Ti.UI.createImageView({
       image: '/images/refresh.png',
       top: 10,
       left: '3%',
       height: Ti.UI.SIZE,
       width: Ti.UI.SIZE
    });
    
    wrapper.add(image);
    
    textButton.add(refreshText);
    textButton.add(button);
    
    wrapper.add(textButton);
    currentWinWrapper.add(wrapper);
    addSeparator();
}


function addLogout(){"use strict";
    var wrapper, button, dialog, image, textButton;
    
    wrapper = Ti.UI.createView({
       height: Ti.UI.SIZE,
       width: Ti.UI.FILL
    });
    
    textButton = Ti.UI.createView({
        layout: 'vertical',
        height: Ti.UI.SIZE,
        left: 48,
        right: 0
    });
    
    button = Ti.UI.createButton({
        style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
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
                color : '#777',
                offset : 0.0
            }, {
                color : '#999',
                offset : 0.33
            }, {
                color : '#666',
                offset : 1.0
            }]
        },
        color: '#fff',
        borderRadius: 7,
        width: 200,
        height: 35,
        font: {
            fontWeight: 'bold',
            fontSize: 16
        },
        borderColor: '#333',
        borderWidth: 1,
        top: 3,
        title: 'Logout Now'
    });
    
    button.addEventListener('click', function(e) {
        Omadi.display.logoutButtonPressed();
    });
    
    image = Ti.UI.createImageView({
       image: '/images/logout_icon.png',
       top: 2,
       left: '3%',
       height: Ti.UI.SIZE,
       width: Ti.UI.SIZE
    });
    
    wrapper.add(image);
    
    textButton.add(button);
    
    wrapper.add(textButton);
    currentWinWrapper.add(wrapper);
    addSeparator();
    
}

function addAbout(){"use strict";
    var wrapper, button, dialog, image, textButton;
    
   
    wrapper = Ti.UI.createView({
       height: Ti.UI.SIZE,
       width: Ti.UI.FILL
    });
    
    textButton = Ti.UI.createView({
        layout: 'vertical',
        height: Ti.UI.SIZE,
        left: 48,
        right: 0
    });
    
    button = Ti.UI.createButton({
        style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
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
                color : '#777',
                offset : 0.0
            }, {
                color : '#999',
                offset : 0.33
            }, {
                color : '#666',
                offset : 1.0
            }]
        },
        color: '#fff',
        borderRadius: 7,
        width: 200,
        height: 35,
        font: {
            fontWeight: 'bold',
            fontSize: 16
        },
        borderColor: '#333',
        borderWidth: 1,
        top: 3,
        title: 'About'
    });
    
    button.addEventListener('click', function(e) {
        Omadi.display.openAboutWindow();
    });
    
    image = Ti.UI.createImageView({
       image: '/images/info_icon.png',
       top: 2,
       left: '3%',
       height: Ti.UI.SIZE,
       width: Ti.UI.SIZE
    });
    
    wrapper.add(image);
    
    textButton.add(button);
    
    wrapper.add(textButton);
    currentWinWrapper.add(wrapper);
    
    addSeparator();

}

( function() {"use strict";

        curWin.setBackgroundColor('#eee');
        
        currentWinWrapper = Ti.UI.createScrollView({
            layout : 'vertical',
            top : 0,
            left : 0,
            bottom : 0,
            right : 0
        });

        if (Ti.App.isAndroid) {
            curWin.addEventListener('android:back', function() {
                curWin.close();
            });
        }
        else {
            createIOSToolbar();
        }

        addSeparator();
        
        addClockInClockOut();
        
        addCompanyVehicle();
        
        addDrafts();
        
        addLocalPhotos();
        
        addRefresh();
        
        addLogout();
        
        addAbout();
        
        addDeleteAll();
   

        curWin.add(currentWinWrapper);
    }());
