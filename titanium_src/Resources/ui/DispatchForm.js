/*jslint eqeq:true*/

var Dispatch, FormModule, Omadi, dispatchObj, workObj, dispatchTab, workTab;

function DispatchForm(){"use strict";
    //create module instance
    
}

DispatchForm.prototype.getWindow = function(){"use strict";
    var self, dispatchWin, workWin;
    
    self = Ti.UI.createTabGroup({
        navBarHidden: true
    });
    
    FormModule = require('ui/FormModule');
    
    FormModule.reset();
    //create app tabs
    dispatchObj = FormModule.getDispatchObject(Omadi, 'dispatch', 'new', 0, true);
    workObj = FormModule.getDispatchObject(Omadi, 'tow', 'new', 0, true);
    
    dispatchWin = dispatchObj.win;
    workWin = workObj.win;
    
    dispatchTab = Ti.UI.createTab({
        title: 'Dispatch',
        window: dispatchWin
    });
    dispatchWin.containingTab = dispatchTab;

    workTab = Ti.UI.createTab({
        title: 'Work Node',
        window: workWin
    });
    workWin.containingTab = workTab;

    self.addTab(dispatchTab);
    self.addTab(workTab);
    
    Ti.App.removeEventListener("omadi:dispatch:towTypeChanged", this.towTypeChanged);
    Ti.App.addEventListener("omadi:dispatch:towTypeChanged", this.towTypeChanged);
    
    self.addEventListener("android:back", this.exitForm);
    
    this.win = self;
    
    return self;
};

DispatchForm.prototype.exitForm = function(){"use strict";
    var dialog, photoNids;

    dialog = Ti.UI.createAlertDialog({
        cancel : 1,
        buttonNames : ['Exit', 'Cancel'],
        title : 'Really Exit Form?',
        message : 'All changes will be lost.'
    });

    dialog.addEventListener('click', function(e) {
        var db, result, numPhotos, secondDialog, negativeNid, query, continuousId, photoNids, types, dialogTitle, dialogMessage, messageParts, windowNid;

        if (e.index == 0) {
            
            Ti.App.removeEventListener("omadi:dispatch:towTypeChanged", Dispatch.towTypeChanged);
            // TODO: uncomment
            //Ti.App.removeEventListener("omadi:dispatch:savedDispatchNode", savedDispatchNode);
            
            windowNid = parseInt(Ti.UI.currentWindow.nid, 10);
            if (isNaN(windowNid)) {
                windowNid = 0;
            }
            
            if(dispatchObj !== null){
                dispatchObj.closeWindow();
            }
            
            if(workObj !== null){
                workObj.closeWindow();
            }
            
            // Remove any fully-saved nodes that may not have been linked
            db = Omadi.utils.openMainDatabase();
            db.execute("BEGIN IMMEDIATE TRANSACTION");
            db.execute("DELETE FROM node WHERE flag_is_updated = 5");
            db.execute("COMMIT TRANSACTION");
            db.close();
            
            // TODO: uncomment the below
            //if(setSendingData){
                // This screen set sending data to true, so free it up in case it's still set
                // which would be the case for one node validating and the other not validating
                //Omadi.service.setSendingData(false);
            //}
            
            Dispatch.win.close();
        }
    });

    dialog.show();
};

DispatchForm.prototype.towTypeChanged = function(e) {"use strict";
    var newNodeType, newBundle, windowTop, workNode;

    newNodeType = e.dbValue;

    newBundle = Omadi.data.getBundle(newNodeType);
    
    if (newBundle) {
        
        workTab.setTitle(newBundle.label);
        workTab.window.close();
        
        Ti.API.error("Type changed");
            
        // Make sure the old form is removed completely
        FormModule.resetAllButDispatch();         
            
        workObj = FormModule.getDispatchObject(Omadi, newNodeType, 'new', 0, true);
        
        workTab.setWindow(workObj.win);
        workObj.win.containingTab = workTab;
            
        // workNode = {
            // type : newNodeType,
            // nid : 'new',
            // form_part : -1
        // };
        
        // TODO: look at this
        // if (workWindowOpen) {
            // workWindow.close();
        // }
        
        //windowTop = getWindowTopPixels();

        // workWindow = Ti.UI.createWindow({
            // url : '/main_windows/form.js',
            // type : workNode.type,
            // nid : workNode.nid,
            // form_part : -1,
            // bottom : 0,
            // right : 0,
            // left : 0,
            // top: windowTop,
            // zIndex : 1,
            // usingDispatch : true,
            // orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
        // });
// 
        // workWindowOpen = false;
    }
    else {
        this.sendError("There was a problem with the " + newNodeType + " selection. Please select a different option.");
        alert("There was a problem with the " + newNodeType + " selection. Please select a different option.");
    }
};

DispatchForm.prototype.sendError = function(message){"use strict";
    message += JSON.stringify(this.node);
    Ti.API.error(message);
    Omadi.service.sendErrorReport(message);
};


exports.getWindow = function(OmadiObj){"use strict";
    Omadi = OmadiObj;
    
    Dispatch = new DispatchForm();
    
    return Dispatch.getWindow();
};
