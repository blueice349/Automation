/*jslint eqeq:true,plusplus:true,nomen:true*/

var Omadi, _instance = null;

var NodeView = require('ui/NodeView');
var CommentList = null;

function NodeViewTabs(type, nid){"use strict";
    var tempFormPart, origNid;
    
    //create module instance
    
    this.type = type;
    this.nid = nid;
    
    this.dispatchNode = null;
    this.workNode = null;
    
    this.workTab = null;
    this.dispatchTab = null;
    this.commentsTab = null;
    
    this.tabGroup = null;
    
    this.dispatchWindow = null;
    this.workWindow = null;
}

function getInstance(){"use strict";
    if(_instance === null){
        _instance = new NodeViewTabs();
    }   
    
    return _instance;
}

// NodeViewTabs.prototype.showActionsOptions = function(e){"use strict";
    // var bundle, btn_tt, btn_id, postDialog, windowFormPart;
//     
    // bundle = Omadi.data.getBundle(Dispatch.workObj.type);
    // btn_tt = [];
    // btn_id = [];
// 
    // btn_tt.push('Save');
    // btn_id.push('normal');
//   
    // btn_tt.push('Cancel');
    // btn_id.push('cancel');
// 
    // postDialog = Titanium.UI.createOptionDialog();
    // postDialog.options = btn_tt;
    // postDialog.cancel = btn_tt.length - 1;
    // postDialog.show();
// 
    // postDialog.addEventListener('click', function(ev) {
        // var form_errors, dialog, i;
        // try{
            // if(ev.index >= 0 && ev.index != ev.source.cancel){
                // if(Dispatch.workObj.nodeSaved === false){
//                     
                    // Dispatch.workObj.formToNode();
                    // Dispatch.dispatchObj.formToNode();
//                     
                    // Dispatch.workObj.validate_form_data(btn_id[ev.index]);
                    // Dispatch.dispatchObj.validate_form_data(btn_id[ev.index]);
//                     
                    // form_errors = Dispatch.workObj.form_errors;
                    // for(i = 0; i < Dispatch.dispatchObj.form_errors.length; i ++){
                        // form_errors.push(Dispatch.dispatchObj.form_errors[i] + " (dispatch Tab)");
                    // }
//                     
                    // if(form_errors.length > 0){
                        // dialog = Titanium.UI.createAlertDialog({
                            // title : 'Dispatch Validation',
                            // buttonNames : ['OK'],
                            // message: form_errors.join("\n")
                        // });
//                         
                        // dialog.show();
                    // }
                    // else{
//                     
                        // // if(btn_id[ev.index] == 'next'){
                            // // ActiveFormObj.saveForm('next_part');
                        // // }
                        // // else if(btn_id[ev.index] == 'draft'){
                            // // ActiveFormObj.saveForm('draft');
                        // // }
                        // // else if(btn_id[ev.index] == 'new'){
                            // // ActiveFormObj.saveForm('new');
                        // // }
                        // // else if(btn_id[ev.index] == 'normal'){
                            // // ActiveFormObj.saveForm('normal');
                        // // }
//                         
                        // Dispatch.dispatchObj.saveForm('normal');
                        // Dispatch.workObj.saveForm('normal');
                    // }
                // }
                // else{
                    // alert("The form data was saved correctly, but this screen didn't close for some reason. You can exit safely.");
                // }
            // }
        // }
        // catch(ex){
            // Omadi.service.sendErrorReport("Exception in dispatch form dispatch post dialog click: " + ex);
        // }
    // });
// };

function incrementCommentTab(e){"use strict";
    var count, title;
    count = _instance.commentsTab.commentCount + 1;
    title = count + ' Comment' + (count == 1 ? '' : 's');
    _instance.commentsTab.setTitle(title);
    _instance.commentsTab.commentCount = count;  
};

NodeViewTabs.prototype.getTabs = function(){"use strict";
    var dispatchWin, workWin, allowRecover, openDispatch, workBundle, db, result, 
        tempDispatchNid, iconFile, tempFormPart, origNid, copyToBundle, commentsCount;
    
    try{
        openDispatch = false;
        
        this.tabGroup = Ti.UI.createTabGroup({
            navBarHidden: true,
            tabsBackgroundImage: '/images/black_button1.png',
            activeTabBackgroundImage: '/images/blue_button1.png',
            tabsTintColor: '#fff',
            activeTabIconTint: '#fff'
        });
        
        this.workNode = Omadi.data.nodeLoad(this.nid);
        this.dispatchNode = null;
        
        if(this.workNode){
            
            this.currentWorkFormPart = this.workNode.form_part;
        
            if (this.workNode.type == 'dispatch') {
                this.dispatchNode = this.workNode;
                this.workNode = Omadi.data.nodeLoad(this.dispatchNode.dispatch_nid);
                if(this.workNode){
                    this.currentWorkFormPart = this.workNode.form_part;
                }
                else{
                    alert("A problem occurred with opening this dispatch, which may be due to permissions settings.");
                    return null;
                }
                
                openDispatch = true;
            }
            else {
                
                if(this.nid < 0 && this.workNode.dispatch_nid > 0){
                    // Load the corresponding negative id for the dispatch
                    Ti.API.debug("Loading the corresponding negative id for the dispatch: " + JSON.stringify(this.workNode));
                    
                    try{
                        db = Omadi.utils.openMainDatabase();
                        // This is used only for recovering from a dispatch that was continuously saved and a crash happened
                        // This will bring up the correctly saved dispatch node
                        // The continuous_nid is the original nid of the already server-saved node, which will match up 
                        //  with the dispatch_nid of the node, which will never change - and it may be duplicated since there is 
                        //  a regular copy for the server-saved node, and a temporary copy for the continuous node
                        result = db.execute("SELECT nid FROM node WHERE continuous_nid = " + this.workNode.dispatch_nid);
                        tempDispatchNid = 0;
                        if(result.isValidRow()){
                            tempDispatchNid = result.field(0);
                        }
                        result.close();
                        db.close();
                        
                        this.dispatchNode = Omadi.data.nodeLoad(tempDispatchNid);
                        openDispatch = false;
                    }
                    catch(exDB){
                        Ti.API.debug("exception when loading a continuously saved disaptch: " + exDB);
                    }
                }
                else{
                    this.dispatchNode = Omadi.data.nodeLoad(this.workNode.dispatch_nid);
                    openDispatch = false;
                }
            }
            
            this.workNode.form_part = this.form_part;

        }
        else{
            alert("A problem occurred loading this dispatch. Omadi support has been notified about this issue.");
            Omadi.service.sendErrorReport("The work node passed into the dispatch form is invalid: " + this.nid);   
        }
        
        //create app tabs
        //this.dispatchObj = NodeViewTabs.getDispatchObject(Omadi, 'dispatch', this.dispatchNode.nid, 0, this);
        
        if(this.dispatchNode){
        
            this.dispatchWindow = NodeView.getWindow(Omadi, 'dispatch', this.dispatchNode.nid);
            this.dispatchTab = Ti.UI.createTab({
                title: 'Dispatch',
                window: this.dispatchWindow,
                icon: '/images/icon_dispatch_white.png'
            });
        }
        
        //this.dispatchObj.win.dispatchTabGroup = this.tabGroup;
        
        if(this.workNode && this.workNode.type !== null){
             
            //this.workObj = this.FormModule.getDispatchObject(Omadi, this.workNode.type, this.workNode.nid, this.workNode.form_part, this);
            
            //this.workNode = this.workObj.node;
            
            workBundle = Omadi.data.getBundle(this.workNode.type);
            
            this.workWindow = NodeView.getWindow(Omadi, this.workNode.type, this.workNode.nid);
            
            this.workTab = Ti.UI.createTab({
                title: workBundle.label,
                window: this.workWindow,
                icon: '/images/icon_truck_white.png'
            });
            
            //this.workObj.win.dispatchTabGroup = this.tabGroup;
        }
         
        if(openDispatch && this.dispatchNode){
            this.tabGroup.addTab(this.dispatchTab);
            if(this.workTab){
                this.tabGroup.addTab(this.workTab);
            }
        }
        else{
           if(this.workTab){
               this.tabGroup.addTab(this.workTab);
           }
           this.tabGroup.addTab(this.dispatchTab);
        }
        
        if(this.workTab && this.workNode && this.workNode.nid && this.workNode.nid > 0){
            // The node is already saved and on the server
            try{
                CommentList = require('ui/CommentList');
                
                CommentList.init(Omadi, this.workNode.nid);
                commentsCount = CommentList.getCommentCount();
                
                this.commentsTab = Ti.UI.createTab({
                    title: commentsCount + ' Comment' + (commentsCount == 1 ? '' : 's'),
                    window: CommentList.getListWindow(),
                    commentCount: commentsCount
                });
                
                Ti.App.removeEventListener('incrementCommentTab', incrementCommentTab);
                Ti.App.addEventListener('incrementCommentTab', incrementCommentTab);
                
                this.tabGroup.addTab(this.commentsTab);
            }
            catch(commentEx){
                this.sendError("Exception with comments: " + commentEx);
            }
        }
        
        //this.tabGroup.addEventListener("android:back", this.exitForm);
        
        if(Ti.App.isAndroid){
            this.tabGroup.addEventListener("open", function(e) {
                _instance.tabGroup.activity.onCreateOptionsMenu = function(e) {
                    var menuItem = e.menu.add({
                        title : "Save",
                        icon : "/images/save_light_blue.png"
                    });
                    menuItem.addEventListener("click", _instance.doDispatchSave);
                };
            });
        }
    }
    catch(ex){
        Omadi.service.sendErrorReport("Could not open dispatch window: " + ex);
        alert("There was a problem loading this dispatch. Please contact support.");
    }

    Ti.App.removeEventListener('loggingOut', _instance.loggingOut);
    Ti.App.addEventListener('loggingOut', _instance.loggingOut);

    Ti.App.removeEventListener("savedNode", _instance.savedNode);
    Ti.App.addEventListener("savedNode", _instance.savedNode);
  
    return this.tabGroup;
};

NodeViewTabs.prototype.savedNode = function(){"use strict";
    this.close();
};

NodeViewTabs.prototype.loggingOut = function(){"use strict";
    this.close();
};

NodeViewTabs.close = function(){"use strict";
    try{
        if(this.dispatchWindow !== null){
            this.dispatchWindow.close();
        }
        
        if(this.workWindow !== null){
            this.workWindow.close();
        }
    }
    catch(ex){}
    
    try{
        if(this.tabGroup !== null){
            this.tabGroup.close();
        }
    }
    catch(ex1){}
};

NodeViewTabs.prototype.sendError = function(message){"use strict";
    message += JSON.stringify(this.node);
    Ti.API.error(message);
    Omadi.service.sendErrorReport(message);
};




exports.getTabs = function(OmadiObj, type, nid){"use strict";
    Omadi = OmadiObj;
    
    _instance = new NodeViewTabs(type, nid);
    return _instance.getTabs();
};
