
Ti.include('/lib/functions.js');

/*global Omadi*/
/*jslint eqeq:true*/

var Display = require('lib/Display');
var RouteListener = require('objects/RouteListener');
Display.setCurrentWindow(Ti.UI.currentWindow, 'actions');

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

    label = Titanium.UI.createLabel({
        text : 'Actions',
        color : '#333',
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

function addStartRouteButton() {"use strict";
	if (!RouteListener.hasRoutes()) {
		return;
	}
	
	var wrapper, button, textButton;
   
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
    
    button = Ti.UI.createLabel({
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
                color : '#A7A9AC',
                offset : 0.0
            }, {
                color : '#6D6E71',
                offset : 0.33
            }, {
                color : '#58595B',
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
        bottom: 3,
        text: 'Start Route',
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
    });
    
    button.addEventListener('click', function() {
    	RouteListener.askToStartRoute();
    });
    
    // image = Ti.UI.createImageView({
       // image: '/images/settings_color.png',
       // top: 2,
       // left: '3%',
       // width: 48
    // });
//     
    // wrapper.add(image);
    
    textButton.add(button);
    
    wrapper.add(textButton);
    currentWinWrapper.add(wrapper);
    
    addSeparator();
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
        
        button = Ti.UI.createLabel({
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
                    color : '#2BC4F3',
                    offset : 0.0
                }, {
                    color : '#00AEEE',
                    offset : 0.33
                }, {
                    color : '#0095DA',
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
            bottom: 3,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        
        if (Omadi.bundles.timecard.isUserClockedIn()) {
            button.setText("Clock Out");
        }
        else {
            button.setText("Clock In");
        }

        button.addEventListener('click', function() {
            if (Omadi.bundles.timecard.isUserClockedIn()) {
                dialog = Ti.UI.createAlertDialog({
                    title : "Verify Clock Out",
                    buttonNames : ['Clock Out', 'Cancel']
                });

                dialog.addEventListener('click', function(e) {
                    if (e.index == 0) {
	                	if (TimecardGeofenceVerifier.getInstance().canClockOut()) {
							Omadi.bundles.timecard.doClockOut(false);
							button.setText("Clock In");
							text.setText('You are clocked out.');
	                	} else {
	                		alert('Clock out failed: ' + TimecardGeofenceVerifier.getInstance().getError());
	                	}
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
                    	if (TimecardGeofenceVerifier.getInstance().canClockIn()) {
	                		Omadi.bundles.timecard.doClockIn();
	                        button.setText("Clock Out");
	                        text.setText('You are currently clocked in.');
	                	} else {
	                		alert('Clock in failed: ' + TimecardGeofenceVerifier.getInstance().getError());
	                	}
                    }
                });
            }

            dialog.show();
        });
        
        image = Ti.UI.createImageView({
           image: Omadi.display.getIconFile('timecard'),
           top: 9,
           left: '3%',
           width: 48
        });
        
        wrapper.add(image);
        wrapper.add(textButton);
        
        textButton.add(text);
        textButton.add(button);
        
        
        currentWinWrapper.add(wrapper);
        addSeparator();
    }
}

function companyVehicleSelectedDraft(){"use strict";
          
     var vehicle_name = Omadi.bundles.companyVehicle.getCurrentVehicleName();
     if(vehicle_name !== null){
         vehicleButton.setText("Done With Vehicle");
         vehicleText.setText('You are in ' + vehicle_name + '.');
     }
}

function addCompanyVehicle(){"use strict";
    var wrapper, image, textButton, currentVehicle, companyVehicleBundle;
    
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
        
        vehicleButton = Ti.UI.createLabel({
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
                    color : '#2BC4F3',
                    offset : 0.0
                }, {
                    color : '#00AEEE',
                    offset : 0.33
                }, {
                    color : '#0095DA',
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
            bottom: 3,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        
        currentVehicle = Omadi.bundles.companyVehicle.getCurrentVehicleName();
        
        if (currentVehicle === null) {
            vehicleText.setText('You are not in a vehicle.');   
            vehicleButton.setText("Choose Your Vehicle");
        }
        else{
            vehicleText.setText('You are in ' + currentVehicle + '.');
            vehicleButton.setText("Done With Vehicle");
        }

        vehicleButton.addEventListener('click', function() {
            var inVehicle = Omadi.bundles.companyVehicle.getCurrentVehicleName();
            
            if (inVehicle === null) {
                Omadi.bundles.companyVehicle.askAboutVehicle();
            }
            else {
                Omadi.bundles.companyVehicle.exitVehicle();
                vehicleText.setText('You are not in a vehicle.');
                vehicleButton.setText("Choose Your Vehicle");
            }
        });
        
        Ti.App.removeEventListener('companyVehicleSelected', companyVehicleSelectedDraft); 
        Ti.App.addEventListener('companyVehicleSelected', companyVehicleSelectedDraft);
        
        Ti.UI.currentWindow.addEventListener('close', function(){
           Ti.App.removeEventListener('companyVehicleSelected', companyVehicleSelectedDraft); 
        });
        
        image = Ti.UI.createImageView({
           image: Omadi.display.getIconFile('company_vehicle'),
           top: 9,
           left: '3%',
           width: 48
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
    var wrapper, button, image, text, textButton;
    
    
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
        
        button = Ti.UI.createLabel({
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
                    color : '#2BC4F3',
                    offset : 0.0
                }, {
                    color : '#00AEEE',
                    offset : 0.33
                }, {
                    color : '#0095DA',
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
            bottom: 3,
            text: 'View My Drafts',
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });

        button.addEventListener('click', function() {
            Omadi.display.openDraftsWindow();
        });
        
        image = Ti.UI.createImageView({
           image: '/images/drafts_color.png',
           top: 9,
           left: '3%',
           width: 48
        });
        
        wrapper.add(image);
        
        textButton.add(text);
        textButton.add(button);
        
        wrapper.add(textButton);
        currentWinWrapper.add(wrapper);
        addSeparator();
    
}

function addLocalPhotos(){"use strict";
    var wrapper, button, image, text, textButton;
    
    
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
        
        button = Ti.UI.createLabel({
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
                    color : '#2BC4F3',
                    offset : 0.0
                }, {
                    color : '#00AEEE',
                    offset : 0.33
                }, {
                    color : '#0095DA',
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
            bottom: 3,
            text: 'Photos Not Uploaded',
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });

        button.addEventListener('click', function() {
            Omadi.display.openLocalPhotosWindow();
        });
        
        image = Ti.UI.createImageView({
           image: '/images/camera_icon_color.png',
           top: 9,
           left: '3%',
           width: 48
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
    
    button = Ti.UI.createLabel({
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
                color : '#F37E5F',
                offset : 0.0
            }, {
                color : '#EC1C24',
                offset : 0.33
            }, {
                color : '#D12128',
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
        bottom: 3,
        text: 'Reset All Data',
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
    });
    
    button.addEventListener('click', function() {
        dialog = Ti.UI.createAlertDialog({
            cancel : 1,
            buttonNames : ['Delete It', 'Cancel'],
            message : 'This will delete any data not uploaded to the server, and this cannot be undone! Are you sure?',
            title : 'Really Reset Everything?'
        });
    
        dialog.addEventListener('click', function(e) {
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
       image: '/images/delete_all_icon_color.png',
       top: 2,
       left: '3%',
       width: 48
    });
    
    wrapper.add(image);
    
    textButton.add(button);
    
    wrapper.add(textButton);
    currentWinWrapper.add(wrapper);
    addSeparator();

}

function addDebug(){"use strict";
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
    
    button = Ti.UI.createLabel({
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
                color : '#A7A9AC',
                offset : 0.0
            }, {
                color : '#6D6E71',
                offset : 0.33
            }, {
                color : '#58595B',
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
        bottom: 3,
        text: 'Send Debug Data',
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
    });
    
    button.addEventListener('click', function() {
        dialog = Ti.UI.createAlertDialog({
            cancel : 1,
            buttonNames : ['Send Data', 'Cancel'],
            title : 'Really Send Debug Data?'
        });
    
        dialog.addEventListener('click', function(e) {
            if(e.index === 0) {
                Omadi.data.sendDebugData(true);
            }
        });
        
        dialog.show();
    });
    
    image = Ti.UI.createImageView({
       image: '/images/settings_color.png',
       top: 2,
       left: '3%',
       width: 48
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
    var wrapper, button, image, textButton, lastSyncTimestamp;
    
  
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
    
    button = Ti.UI.createLabel({
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
                color : '#A7A9AC',
                offset : 0.0
            }, {
                color : '#6D6E71',
                offset : 0.33
            }, {
                color : '#58595B',
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
        bottom: 3,
        text: 'Refresh / Sync Data',
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
    });
    
    button.addEventListener('click', function() {
        Omadi.display.loading('Refreshing...');
        Omadi.service.checkUpdate();
        
        Ti.App.removeEventListener('omadi:finishedDataSync', refreshCallbackDraft);
        Ti.App.addEventListener('omadi:finishedDataSync', refreshCallbackDraft);
        
        Ti.UI.currentWindow.addEventListener('close', function(){
            Ti.App.removeEventListener('omadi:finishedDataSync', refreshCallbackDraft);
        });
    });
    
    image = Ti.UI.createImageView({
       image: '/images/refresh_light_blue.png',
       top: 10,
       left: '3%',
       width: 48
    });
    
    wrapper.add(image);
    
    textButton.add(refreshText);
    textButton.add(button);
    
    wrapper.add(textButton);
    currentWinWrapper.add(wrapper);
    addSeparator();
}


function addLogout(){"use strict";
    var wrapper, button, image, textButton;
    
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
    
    button = Ti.UI.createLabel({
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
                color : '#A7A9AC',
                offset : 0.0
            }, {
                color : '#6D6E71',
                offset : 0.33
            }, {
                color : '#58595B',
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
        bottom: 3,
        text: 'Logout Now',
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
    });
    
    button.addEventListener('click', function() {
        Omadi.display.logoutButtonPressed();
    });
    
    image = Ti.UI.createImageView({
       image: '/images/logout_icon_color.png',
       top: 2,
       left: '3%',
       width: 48
    });
    
    wrapper.add(image);
    
    textButton.add(button);
    
    wrapper.add(textButton);
    currentWinWrapper.add(wrapper);
    addSeparator();
    
}

function addAbout(){"use strict";
    var wrapper, button, image, textButton;
    
   
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
    
    button = Ti.UI.createLabel({
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
                color : '#A7A9AC',
                offset : 0.0
            }, {
                color : '#6D6E71',
                offset : 0.33
            }, {
                color : '#58595B',
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
        bottom: 3,
        text: 'About',
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
    });
    
    button.addEventListener('click', function() {
        Omadi.display.openAboutWindow();
    });
    
    image = Ti.UI.createImageView({
       image: '/images/about_color.png',
       top: 2,
       left: '3%',
       width: 48
    });
    
    wrapper.add(image);
    
    textButton.add(button);
    
    wrapper.add(textButton);
    currentWinWrapper.add(wrapper);
    
    addSeparator();

}

function addSettings(){"use strict";
    var wrapper, button, image, textButton;
   
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
    
    button = Ti.UI.createLabel({
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
                color : '#A7A9AC',
                offset : 0.0
            }, {
                color : '#6D6E71',
                offset : 0.33
            }, {
                color : '#58595B',
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
        bottom: 3,
        text: 'Settings',
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
    });
    
    button.addEventListener('click', function() {
        Omadi.display.openSettingsWindow();
    });
    
    image = Ti.UI.createImageView({
       image: '/images/settings_color.png',
       top: 2,
       left: '3%',
       width: 48
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
        
        if(Ti.App.isIOS7){
            currentWinWrapper.top = 20;
        }

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
        
        addStartRouteButton();
        
        addRefresh();
        
        addLogout();
        
        addAbout();
        
        addSettings();
        
        addDeleteAll();
        
        addDebug();
   

        curWin.add(currentWinWrapper);
    }());
