/*jslint eqeq:true*/
var Dispatch, Omadi;


function DispatchForm(type, nid, form_part){"use strict";
    //create module instance
    
    this.type = type;
    this.nid = nid;
    this.form_part = form_part;
    
    this.dispatchNode = null;
    this.workNode = null;
    
    this.workTab = null;
    this.dispatchTab = null;
    
    this.tabGroup = null;
    
    this.FormModule = null;
    this.dispatchObj = null;
    this.workObj = null;
}

DispatchForm.prototype.getWindow = function(){"use strict";
    var dispatchWin, workWin, allowRecover, openDispatch, workBundle;
    
    try{
        this.tabGroup = Ti.UI.createTabGroup({
            navBarHidden: true
        });
        
        this.FormModule = require('ui/FormModule');
        this.FormModule.reset();
        
        Ti.API.error("hello");
        Ti.API.error(this.nid);
        
        if (this.nid == 'new') {
    
            if (this.type != 'dispatch') {
                this.workNode = {
                    type : this.type,
                    nid : 'new',
                    form_part : -1
                };
            }
            else {
                this.workNode = {
                    type : null,
                    nid : 'new',
                    form_part : -1
                };
            }
    
            this.dispatchNode = {
                type : "dispatch",
                nid : 'new',
                form_part : 0
            };
    
            this.form_part = -1;
    
            openDispatch = true;
        }
        else {
            this.workNode = Omadi.data.nodeLoad(this.nid);
            allowRecover = true;
            if(this.workNode){
                if(this.workNode.nid > 0){
                    allowRecover = false;
                }
            
                if (this.workNode.type == 'dispatch') {
                    this.dispatchNode = this.workNode;
                    this.workNode = Omadi.data.nodeLoad(this.dispatchNode.dispatch_nid);
                    openDispatch = true;
                }
                else {
                    this.dispatchNode = Omadi.data.nodeLoad(this.workNode.dispatch_nid);
                    openDispatch = false;
                }
                
                // Recover from a crash with the correct work node if the work node was never looked at
                if(allowRecover){   
                    if((this.workNode === null || typeof this.workNode.nid === 'undefined') && 
                        typeof this.dispatchNode.field_tow_type !== 'undefined' &&
                        typeof this.dispatchNode.field_tow_type.dbValues !== 'undefined' && 
                        typeof this.dispatchNode.field_tow_type.dbValues[0] !== 'undefined'){
                            this.workNode = {
                                type: this.dispatchNode.field_tow_type.dbValues[0],
                                nid: 'new',
                                form_part: -1
                            };
                    }
                }
            }
            else{
                alert("A problem occurred loading this dispatch. Please contact support.");
                Omadi.service.sendErrorReport("The work node passed into the dispatch form is invalid: " + this.nid);   
            }
        }
        
        //create app tabs
        this.dispatchObj = this.FormModule.getDispatchObject(Omadi, 'dispatch', this.dispatchNode.nid, 0, true);
        this.dispatchTab = Ti.UI.createTab({
            title: 'Dispatch',
            window: this.dispatchObj.win
        });
        
        if(this.workNode.type !== null){
            this.workObj = this.FormModule.getDispatchObject(Omadi, this.workNode.type, this.workNode.nid, this.workNode.formPart, true);
        }
        this.tabGroup.addTab(this.dispatchTab);
        
        if(this.workNode.type !== null){
            workBundle = Omadi.data.getBundle(this.workNode.type);
            this.workTab = Ti.UI.createTab({
                title: workBundle.name,
                window: this.workObj.win
            });
        
            this.tabGroup.addTab(this.workTab);
        }
        
        Ti.App.removeEventListener("omadi:dispatch:towTypeChanged", this.towTypeChanged);
        Ti.App.addEventListener("omadi:dispatch:towTypeChanged", this.towTypeChanged);
        
        this.tabGroup.addEventListener("android:back", this.exitForm);
    }
    catch(ex){
        Omadi.service.sendErrorReport("Could not open dispatch window: " + ex);
        alert("There was a problem loading this dispatch. Please contact support.");
    }
    
    return this.tabGroup;
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
            
            if(Dispatch.dispatchObj !== null){
                Dispatch.dispatchObj.closeWindow();
            }
            
            if(Dispatch.workObj !== null){
                Dispatch.workObj.closeWindow();
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
            
            Dispatch.tabGroup.close();
        }
    });

    dialog.show();
};

DispatchForm.prototype.towTypeChanged = function(e) {"use strict";
    var newNodeType, newBundle, windowTop, workNode;
    
    try{
        newNodeType = e.dbValue;
    
        newBundle = Omadi.data.getBundle(newNodeType);
        
        if (newBundle) {
            
            Ti.API.error("Type changed");
            
            if(typeof Dispatch.workTab !== 'undefined' && Dispatch.workTab !== null){
                Dispatch.workTab.window.close();
            }
            
            // Make sure the old form is removed completely
            Dispatch.FormModule.resetAllButDispatch();         
                
            Dispatch.workObj = Dispatch.FormModule.getDispatchObject(Omadi, newNodeType, 'new', 0, true);
            
            if(typeof Dispatch.workTab !== 'undefined' && Dispatch.workTab !== null){
                Dispatch.tabGroup.removeTab(Dispatch.workTab);
                Dispatch.workTab = null;
            }
            
            Dispatch.workTab = Ti.UI.createTab({
                title: newBundle.name,
                window: Dispatch.workObj.win
            });
            
            Dispatch.workObj.win.containingTab = Dispatch.workTab;
            
            Dispatch.tabGroup.add(Dispatch.workTab);
                
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
            Dispatch.sendError("There was a problem with the " + newNodeType + " selection. Please select a different option.");
            alert("There was a problem with the " + newNodeType + " selection. Please select a different option.");
        }
    }
    catch(ex){
        Dispatch.sendError("There was an exception with the " + newNodeType + " dispatch selection.");
        alert("An error occurred with your selection. Please contact support.");
    }
};

DispatchForm.prototype.sendError = function(message){"use strict";
    message += JSON.stringify(this.node);
    Ti.API.error(message);
    Omadi.service.sendErrorReport(message);
};


exports.getWindow = function(OmadiObj, type, nid, form_part){"use strict";
    Omadi = OmadiObj;
    
    Dispatch = new DispatchForm(type, nid, form_part);
    
    return Dispatch.getWindow();
};
