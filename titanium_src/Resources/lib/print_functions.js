/*jslint eqeq:true,plusplus:true*/
/*global CreditCardTrackData*/

Ti.include('/lib/CC_functions.js');

var Utils = require('lib/Utils');
var Print = require('lib/Print');

Omadi.print = {};
Omadi.print.StarMicronics = null;
Omadi.print.printNid = null;

Omadi.print.commands = {};

Omadi.print.init = function(){"use strict";
    if(Omadi.print.StarMicronics === null){
        Omadi.print.StarMicronics = require('com.omadi.starmicronics');
    }
};

Omadi.print.canPrintReceipt = function(nid){"use strict";
    return Print.canPrintReceipt(nid);
};

Omadi.print.onLogoutPrint = function(){"use strict";
    // Clear the saved port Name 
    Ti.App.Properties.setString("omadi:printerPortName", "");
};

(function(){"use strict";
    
    Ti.App.removeEventListener('loggingOut', Omadi.print.onLogoutPrint);
    Ti.App.addEventListener('loggingOut', Omadi.print.onLogoutPrint);
}());

Omadi.print.doCharge = function(e){"use strict";
    /*global CreditCartTrackData*/
    alert("Successful card read.");
    Ti.API.debug(e.cardData);
    
    var trackData;
    
    try{
        trackData = new CreditCardTrackData(e.cardData);
        
        Ti.API.debug(JSON.stringify(trackData));
        
        if(trackData.is_card_valid()){
            alert("Now send to CMS");
        }
        else{
            alert("Card is not valid");
        }
    }
    catch(ex){
        Ti.API.error("Problem with card: " + ex);
        alert("A problem occurred with the card: " + ex);
    }
};

Omadi.print.cancelCharge = function(e){"use strict";
    
    Omadi.display.loading("Cancelling...");
    Omadi.print.StarMicronics.mcrCancel({
        success: function(e){
            Omadi.display.doneLoading();
            Ti.API.debug("Charge successfully cancelled.");
        },
        error: function(e){
            Omadi.display.doneLoading();
            Ti.API.debug("Error cancelling: " + e.error);
        }
    });  
};

Omadi.print.startMCRMode = function(portName){"use strict";
    
    Omadi.display.loading("Connecting...");
    
    Omadi.print.StarMicronics.mcrMode({
        success: function(e){
            
            Omadi.display.doneLoading();
            
            var dialog = Ti.UI.createAlertDialog({
                title: 'Swipe Card',
                message: 'Press done after card was read successfully.',
                buttonNames: ['Done', 'Cancel'],
                cancel: 1
            });
            
            dialog.addEventListener('click', function(e){
                try{
                     if(e.index === 0){
                         Omadi.print.StarMicronics.readPort({
                            success: Omadi.print.doCharge,
                            error: function(e){
                                alert("Error reading card data: " + e.error);
                            }
                         });
                     }
                     else{
                         Omadi.print.cancelCharge();
                     }
                }
                catch(ex){
                    Utils.sendErrorReport("exception with swipe card click: " + ex);
                }
            });
            dialog.show();
        },
        error: function(e){
            Omadi.display.doneLoading();
            
            alert("Error enabling Card Reader: " + e.error);
        },
        portName: portName
    });  
};

Omadi.print.chargeCard = function(nid){"use strict";
    var portName, commands;
    
    Omadi.print.printNid = nid;
    
    if(Ti.App.isAndroid){
    
        Omadi.print.init();
        
        portName = Ti.App.Properties.getString("omadi:printerPortName", "");
        
        if(portName == ""){
        
            Omadi.print.StarMicronics.getBluetoothDeviceList({
               success: function(e){
                   var i, dialog, portNames;
                  
                   portNames = [];
                   for(i = 0; i < e.portNames.length; i ++){
                       portNames.push(e.portNames[i].replace("BT:", ""));
                   }
                   portNames.push("- Cancel -");
                   
                   dialog = Ti.UI.createOptionDialog({
                      options: portNames,
                      title: 'Select Printer',
                      cancel: portNames.length - 1,
                      origPortNames: e.portNames
                   });
                   
                   dialog.addEventListener('click', function(e){
                       var portName, commands;
                       try{
                           if(e.index >= 0 && e.index != dialog.cancel){
                                portName = dialog.origPortNames[e.index];
                                
                                Ti.App.Properties.setString("omadi:printerPortName", portName);
                                
                                Omadi.print.startMCRMode(portName);
                            }
                        }
                        catch(ex){
                            Utils.sendErrorReport("exception selecting a printer for mcr: " + ex);
                        }
                   });
                   
                   dialog.show();
               },
               error: function(e){
                   Ti.API.error("Error selecting a printer: " + e.error);
                   alert("Error selecting a printer: " + e.error);
               }
            });  
        }
        else{                  
            Omadi.print.startMCRMode(portName);
        }
    }
};

Omadi.print.printImages = [];

Omadi.print.printReceipt = function(nid){"use strict";
	Print.printReceipt(nid);
};

Omadi.print.openConnection = function(portName){"use strict";

    Ti.API.info("Connecting to Printer: " + portName);
    
    Omadi.print.StarMicronics.openPort({
       portName: portName,
       success: function(e){
           alert("success opening port");
           
           
           Omadi.print.sendPrintCommands();
       },
       error: function(e){
           alert("Could not connect to printer: " + e.error);
       }
    });
};

Omadi.print.closeConnection = function(){"use strict";

    Ti.API.info("Closing connection to Printer");
    
    Omadi.print.StarMicronics.releasePort({
       success: function(e){
           alert("success closing port");
       },
       error: function(e){
           alert("Could not disconnect from printer: " + e.error);
       }
    });  
};

