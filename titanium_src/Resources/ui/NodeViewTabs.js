/*jslint eqeq:true,plusplus:true,nomen:true,bitwise:true*/

var Omadi, _instance = null;

var NodeView = require('ui/NodeView');
var Utils = require('lib/Utils');

var CommentList = null;

var androidMenuItemData = [];


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
    
    this.currentWorkFormPart = 0;
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
            // Utils.sendErrorReport("Exception in dispatch form dispatch post dialog click: " + ex);
        // }
    // });
// };

function incrementCommentTab(e){"use strict";
    var count, title;
    try{
        count = _instance.commentsTab.commentCount + 1;
        title = count + ' Comment' + (count == 1 ? '' : 's');
        _instance.commentsTab.setTitle(title);
        _instance.commentsTab.commentCount = count; 
    }
    catch(ex){
        Utils.sendErrorReport("Exception incrementing comment count in view tab: " + ex);
    } 
}

function openAndroidMenuItemNodeView(e){"use strict";
    var itemIndex, itemData;
    
    itemIndex = e.source.getOrder();
    itemData = androidMenuItemData[itemIndex];
    
    Ti.App.fireEvent('openFormWindow', {
        node_type: itemData.type,
        nid: itemData.nid,
        form_part: itemData.form_part 
    });
}

NodeViewTabs.prototype.addActions = function(){"use strict";
    var isEditEnabled, db1, result, actionBar;
    
    if(this.workNode !== null){
            
        if (Ti.App.isAndroid) {
            
            try{
                // actionBar = getInstance().tabGroup.activity.actionBar;
                // actionBar.setHomeAsUp = true;
                // actionBar.onHomeIconItemSelected = function(){
                    // getInstance().close();  
                // };
//                 
                // if(this.dispatchTab === null && this.commentsTab === null){
                    // // When only the work tab is visible, do not show any tabs
                    // actionBar.navigationMode = Ti.Android.NAVIGATION_MODE_STANDARD;
                // }
            }
            catch(ex){
                Utils.sendErrorReport("Exception setting up action bar in view: " + ex);
            }
            
            this.tabGroup.activity.onCreateOptionsMenu = function(e) {
                var db, result, bundle, menu_zero, menu_edit, 
                    customCopy, to_type, to_bundle, order, iconFile, menu_print, 
                    menu_charge, node;
                
                node = getInstance().workNode;
                
                order = 0;
                bundle = Omadi.data.getBundle(node.type);
                    
                if(node.perm_edit == true){
                    
                    menu_edit = e.menu.add({
                        title : 'Edit',
                        order : order,
                        icon: "/images/edit_white.png",
                        showAsAction : (Ti.Android.SHOW_AS_ACTION_ALWAYS | Ti.Android.SHOW_AS_ACTION_WITH_TEXT)
                    });
                    
                    androidMenuItemData[order] = {
                        type: node.type,
                        nid: node.nid,
                        form_part: getInstance().currentWorkFormPart
                    };
                    
                    menu_edit.addEventListener("click", openAndroidMenuItemNodeView);
                    
                    order++;
                }
                
                if(Omadi.print.canPrintReceipt(node.nid)){
                    menu_print = e.menu.add({
                        title : 'Print',
                        order : order,
                        icon: "/images/printer_white.png",
                        showAsAction : (Ti.Android.SHOW_AS_ACTION_ALWAYS | Ti.Android.SHOW_AS_ACTION_WITH_TEXT)
                    });
                    
                    menu_print.addEventListener('click', function(){
                        Omadi.print.printReceipt(node.nid);
                    });
                    
                    order ++;
                    
                    // menu_charge = e.menu.add({
                        // title : 'Charge',
                        // order : order 
                    // });
        //             
                    // //menu_charge.setIcon("/images/printer_white.png");
        //             
                    // menu_charge.addEventListener('click', function(){
                        // Omadi.print.chargeCard(curWin.nid);
                    // });
        //             
                    // order ++;
                }
                
                if(typeof bundle.data.custom_copy !== 'undefined'){
                    for(to_type in bundle.data.custom_copy){
                        if(bundle.data.custom_copy.hasOwnProperty(to_type)){
                            to_bundle = Omadi.data.getBundle(to_type);
                            if(to_bundle && to_bundle.can_create == 1){
                                
                                
                                if(typeof bundle.data.custom_copy[to_type] !== 'undefined' && 
                                    typeof bundle.data.custom_copy[to_type].conversion_type !== 'undefined' &&
                                    bundle.data.custom_copy[to_type].conversion_type == 'change'){
                                    
                                        customCopy = e.menu.add({
                                            title : "Change to " + to_bundle.label,
                                            order : order,
                                            showAsAction : (Ti.Android.SHOW_AS_ACTION_NEVER | Ti.Android.SHOW_AS_ACTION_WITH_TEXT)
                                        }); 
                                }
                                else{
                                    customCopy = e.menu.add({
                                        title : "Copy to " + to_bundle.label,
                                        order : order,
                                        showAsAction : (Ti.Android.SHOW_AS_ACTION_NEVER | Ti.Android.SHOW_AS_ACTION_WITH_TEXT)
                                    });
                                }
                                
                                
                                androidMenuItemData[order] = {
                                    type: node.type,
                                    nid: node.nid,
                                    form_part: to_type 
                                };
                    
                                customCopy.addEventListener("click", openAndroidMenuItemNodeView);
                                
                                order ++;
                            }
                        }
                    }
                }
            };
        }
    }
};



NodeViewTabs.prototype.getTabs = function(){"use strict";
    var dispatchWin, workWin, allowRecover, openDispatch, workBundle, db, result, 
        tempDispatchNid, iconFile, tempFormPart, origNid, copyToBundle, commentsCount;
    
    try{
        openDispatch = false;
        
        this.tabGroup = Ti.UI.createTabGroup({
            tabsBackgroundImage: '/images/black_button1.png',
            activeTabBackgroundImage: '/images/blue_button1.png',
            tabsTintColor: '#fff',
            activeTabIconTint: '#fff',
            title: 'View',
            navBarHidden: true     // IMPORTANT!!!: regardless of what the docs say, if this property does not exist, our autocompletes crash in 2.3.x
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
            
            if(typeof this.form_part !== 'undefined'){
                this.workNode.form_part = this.form_part;    
            }
            else{
                this.form_part = this.workNode.form_part;
            }
        }
        else{
            alert("A problem occurred loading this dispatch. Omadi support has been notified about this issue.");
            Utils.sendErrorReport("The work node passed into the dispatch form is invalid: " + this.nid);   
        }
        
        
        
        //create app tabs
        //this.dispatchObj = NodeViewTabs.getDispatchObject(Omadi, 'dispatch', this.dispatchNode.nid, 0, this);
        
        if(this.dispatchNode){
        
            this.dispatchWindow = NodeView.getWindow(Omadi, this, 'dispatch', this.dispatchNode.nid);
            this.dispatchTab = Ti.UI.createTab({
                title: 'Dispatch',
                window: this.dispatchWindow,
                icon: '/images/icon_dispatch_white.png'
            });
            
            if(Ti.App.isIOS){
                this.dispatchWindow.addEventListener('closeNodeView', function(){
                    getInstance().close();
                });
            }
        }
        
        //this.dispatchObj.win.dispatchTabGroup = this.tabGroup;
        
        if(this.workNode && this.workNode.type !== null){
             
            //this.workObj = this.FormModule.getDispatchObject(Omadi, this.workNode.type, this.workNode.nid, this.workNode.form_part, this);
            
            //this.workNode = this.workObj.node;
            
            workBundle = Omadi.data.getBundle(this.workNode.type);
            
            this.workWindow = NodeView.getWindow(Omadi, this, this.workNode.type, this.workNode.nid);
            
            this.workTab = Ti.UI.createTab({
                title: workBundle.label,
                window: this.workWindow,
                icon: '/images/icon_truck_white.png'
            });
            
            if(Ti.App.isIOS){
                this.workWindow.addEventListener('closeNodeView', function(){
                    getInstance().close();
                });
            }
            
            //this.workObj.win.dispatchTabGroup = this.tabGroup;
        }
         
        if(openDispatch && this.dispatchNode){
            if(this.dispatchTab){
                this.tabGroup.addTab(this.dispatchTab);
            }
            
            if(this.workTab){
                this.tabGroup.addTab(this.workTab);
            }
        }
        else{
           if(this.workTab){
               this.tabGroup.addTab(this.workTab);
           }
           
           if(this.dispatchTab){
               this.tabGroup.addTab(this.dispatchTab);
           }
        }
        
        Ti.API.debug("Added first tabs");
        
        if(this.workTab && this.workNode && this.workNode.nid && this.workNode.nid > 0){
            // The node is already saved and on the server
            try{
                CommentList = require('ui/CommentList');
                
                CommentList.init(Omadi, this.workNode.nid);
                commentsCount = CommentList.getCommentCount();
                
                this.commentsTab = Ti.UI.createTab({
                    title: commentsCount + ' Comment' + (commentsCount == 1 ? '' : 's'),
                    window: CommentList.getListWindow(this),
                    commentCount: commentsCount,
                    icon: '/images/icon_comments_white.png'
                });
                
                Ti.App.removeEventListener('incrementCommentTab', incrementCommentTab);
                Ti.App.addEventListener('incrementCommentTab', incrementCommentTab);
                
                this.tabGroup.addTab(this.commentsTab);
            }
            catch(commentEx){
                this.sendError("Exception with comments: " + commentEx);
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Could not open view window: " + ex);
        alert("There was a problem loading this view. Please contact support.");
    }

    Ti.App.removeEventListener('loggingOut', this.loggingOut);
    Ti.App.addEventListener('loggingOut', this.loggingOut);

    Ti.App.removeEventListener("savedNode", this.savedNode);
    Ti.App.addEventListener("savedNode", this.savedNode);
    
    if(Ti.App.isAndroid){
        this.tabGroup.addEventListener('open', function(){
            
            try{
                // Add actions after the work node has been fully loaded
                getInstance().addActions();
                
            }
            catch(ex){}
        });
    }
    
    return this.tabGroup;
};

NodeViewTabs.prototype.savedNode = function(){"use strict";
    _instance.close();
};

NodeViewTabs.prototype.loggingOut = function(){"use strict";
    _instance.close();
};

NodeViewTabs.prototype.close = function(){"use strict";
    try{
        if(this.dispatchWindow !== null){
            this.dispatchWindow.close();
            this.dispatchWindow = null;
        }
        
        if(this.workWindow !== null){
            this.workWindow.close();
            this.workWindow = null;
        }
    }
    catch(ex){}
    
    try{
        if(this.tabGroup !== null){
            this.tabGroup.close();
            this.tabGroup = null;
        }
    }
    catch(ex1){}
};

NodeViewTabs.prototype.sendError = function(message){"use strict";
    message += JSON.stringify(this.node);
    Ti.API.error(message);
    Utils.sendErrorReport(message);
};


exports.getTabs = function(OmadiObj, type, nid){"use strict";
    Omadi = OmadiObj;
    
    _instance = new NodeViewTabs(type, nid);
    return _instance.getTabs();
};