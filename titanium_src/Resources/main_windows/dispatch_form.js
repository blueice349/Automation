
/*global Omadi*/
/*jslint eqeq:true,plusplus:true*/

Ti.include("/lib/functions.js");
Ti.include("/lib/form_functions.js");

var tabs, dispatchTab, workTab;
var currentTab = 'dispatch';
var dispatchNode, workNode;
var dispatchWindow, workWindow;
var dispatchWindowOpen, workWindowOpen;
var iOSTabbedBar;
var NO_JOB_TYPE_LABEL = "- No Job Type -";

function createiOSToolbar(workNodeTypeLabel, openDispatch){"use strict";
    var back, space, toolbar, items, buttonBar, actions;
    
    if(Ti.App.isIOS){
        
        back = Ti.UI.createButton({
            title : 'Back',
            style : Ti.UI.iPhone.SystemButtonStyle.BORDERED
        });
        
        back.addEventListener('click', function() {
            var dialog, photoNids;
    
            dialog = Ti.UI.createAlertDialog({
                cancel : 1,
                buttonNames : ['Exit', 'Cancel'],
                title : 'Really Exit Form?',
                message: 'Any unsaved changes will be lost.'
            });
        
            dialog.addEventListener('click', function(e) {
                var db, result, numPhotos, secondDialog, negativeNid, query, continuousId, 
                    photoNids, types, dialogTitle, dialogMessage, messageParts, windowNid;
                
                if (e.index == 0) {
                    
                    windowNid = parseInt(Ti.UI.currentWindow.nid, 10);
                    if(isNaN(windowNid)){
                      windowNid = 0;   
                    }
                    
                    if(dispatchWindowOpen){
                        Omadi.form.adjustFileTable(dispatchNode, dispatchNode.nid);
                    }
                    
                    if(workWindowOpen){
                        Omadi.form.adjustFileTable(workNode, workNode.nid);
                    }
                }
            });
        
            dialog.show(); 
        });
        
        space = Ti.UI.createButton({
            systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
        });
        
        iOSTabbedBar = Titanium.UI.iOS.createTabbedBar({
            labels: ['Dispatch', workNodeTypeLabel],
            backgroundColor: '#336699',
            style: Titanium.UI.iPhone.SystemButtonStyle.BAR,
            height: Ti.UI.SIZE,
            width: Ti.UI.SIZE,
            index: (openDispatch ? 0 : 1)
        });
        
        iOSTabbedBar.addEventListener('click', function(e){
            var workLabel = e.source.labels[1];
            
            if(e.index == 0){
                if(!dispatchWindowOpen){
                    dispatchWindowOpen = true;
                    dispatchWindow.open();
                }
                else{
                    
                    dispatchWindow.show();
                    if(workWindowOpen){
                        workWindow.hide();
                    }
                }
            }
            else{
                
                if(workLabel == NO_JOB_TYPE_LABEL){
                    e.source.setIndex(0);
                }
                else{
                    if(!workWindowOpen){
                        workWindowOpen = true;
                        workWindow.open();
                    }
                    else{
                        
                        workWindow.show();
                        if(dispatchWindowOpen){    
                            dispatchWindow.hide();
                        }
                    }   
                }
            }
        });
        
        actions = Ti.UI.createButton({
            title : 'Actions',
            style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
        });
    
        actions.addEventListener('click', function(e) {
            var bundle, btn_tt, btn_id, postDialog;
            
            bundle = Omadi.data.getBundle(workNode.type);
            btn_tt = [];
            btn_id = [];
    
            btn_tt.push('Save');
            btn_id.push('normal');
    
            if (bundle.data.form_parts != null && bundle.data.form_parts != "") {
    
                if (bundle.data.form_parts.parts.length >= workNode.form_part + 2) {
    
                    btn_tt.push("Save + " + bundle.data.form_parts.parts[workNode.form_part + 1].label);
                    btn_id.push('next');
                }
            }
            
            btn_tt.push('Save as Draft');
            btn_id.push('draft');
            
            btn_tt.push('Cancel');
            btn_id.push('cancel');
    
            postDialog = Titanium.UI.createOptionDialog();
            postDialog.options = btn_tt;
            postDialog.show();
    
            postDialog.addEventListener('click', function(ev) {
                
                //if(Ti.UI.currentWindow.nodeSaved === false){
                    if(ev.index != -1){
                        if(btn_id[ev.index] == 'next'){
                            if(workWindowOpen){
                                workWindow.fireEvent("omadi:saveForm", {saveType: "next_part"});
                            }
                            if(dispatchWindowOpen){
                                dispatchWindow.fireEvent("omadi:saveForm", {saveType: "normal"});
                            }
                        }
                        else if(btn_id[ev.index] == 'draft'){
                            if(workWindowOpen){
                                workWindow.fireEvent("omadi:saveForm", {saveType: "draft"});
                            }
                            if(dispatchWindowOpen){
                                dispatchWindow.fireEvent("omadi:saveForm", {saveType: "draft"});
                            }
                        }
                        else if(btn_id[ev.index] == 'normal'){
                            if(workWindowOpen){
                                workWindow.fireEvent("omadi:saveForm", {saveType: "normal"});
                            }
                            if(dispatchWindowOpen){
                                dispatchWindow.fireEvent("omadi:saveForm", {saveType: "normal"});
                            }
                        }
                    }
                //}
                //else{
                //    alert("The form data was saved correctly, but this screen didn't close for some reason. You can exit safely. Please report what you did to get this screen.");
                //}
            });
        });
        
        items = [back, space, iOSTabbedBar, space, actions];
        
        // create and add toolbar
        toolbar = Ti.UI.iOS.createToolbar({
            items: items,
            top: 0,
            borderTop: false,
            borderBottom: false,
            zIndex: 1
        });
        
        Ti.UI.currentWindow.add(toolbar);
    }
}

function setFormWindowTop(){"use strict";
    var top;
    
    top = 45;
    
    dispatchWindow.top = top;
    workWindow.top = top;
}

(function(){"use strict";
   var workBundle, openDispatch, workLabel;
   
   dispatchWindowOpen = false;
   workWindowOpen = false;
   
   Ti.App.addEventListener("omadi:dispatch:towTypeChanged", function(e){
       var newNodeType, newBundle;
       
       newNodeType = e.dbValue;
       
       newBundle = Omadi.data.getBundle(newNodeType);
       if(newBundle){
            iOSTabbedBar.setLabels(["Dispatch", newBundle.label]);
            
            workNode = {
                type : newNodeType,
                nid : 'new',
                form_part : -1  
            };
            
            if(workWindowOpen){
                workWindow.close();
            }
            
            workWindow = Ti.UI.createWindow({
                navBarHidden : true,
                url : '/main_windows/form.js',
                type : workNode.type,
                nid : workNode.nid,
                form_part : -1,
                bottom: 0,
                right: 0,
                left: 0,
                zIndex: 1,
                usingDispatch : true
            });
            
            workWindowOpen = false;
            
            setFormWindowTop();
       }
       else{
           alert("There was a problem with the " + newNodeType + " selection. Please select a different option.");
       }
   });
   
   if(Ti.UI.currentWindow.nid == 'new'){
       workNode = {
            type : null,
            nid : 'new',
            form_part : 0  
       };
       
       dispatchNode = {
            type : "dispatch",
            nid : 'new',
            form_part : 0  
       };
       
       openDispatch = true;
   }
   else{
       workNode = Omadi.data.nodeLoad(Ti.UI.currentWindow.nid);
    
       if(workNode.type == 'dispatch'){
           dispatchNode = workNode;
           workNode = Omadi.data.nodeLoad(dispatchNode.dispatch_nid);
           openDispatch = true;
       }
       else{
           dispatchNode = Omadi.data.nodeLoad(workNode.dispatch_nid);
           openDispatch = false;
       }
   }
   
   workBundle = Omadi.data.getBundle(workNode.type);
   
   workLabel = NO_JOB_TYPE_LABEL;
   if(workBundle){
       workLabel = workBundle.label;
   }
   
   createiOSToolbar(workLabel, openDispatch);
   
   dispatchWindow = Ti.UI.createWindow({
        navBarHidden : true,
        url : '/main_windows/form.js',
        type : 'dispatch',
        nid : dispatchNode.nid,
        form_part : 0,
        bottom: 0,
        right: 0,
        left: 0,
        zIndex: 1,
        usingDispatch : true
    });
    
    workWindow = Ti.UI.createWindow({
        navBarHidden : true,
        url : '/main_windows/form.js',
        type : workNode.type,
        nid : workNode.nid,
        form_part : Ti.UI.currentWindow.form_part,
        bottom: 0,
        right: 0,
        left: 0,
        zIndex: 1,
        usingDispatch : true
    });
    
    setFormWindowTop();

    if(openDispatch){
        dispatchWindowOpen = true;
        dispatchWindow.open();
    }
    else{
        workWindowOpen = true;
        workWindow.open();
    }
    
}());
