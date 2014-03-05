/*jslint eqeq:true*/

function FormModule(Omadi) {"use strict";
    this.Omadi = Omadi;
}

FormModule.prototype.getNewNode = function(){"use strict";

    var node = {};
    
    var uid = this.Omadi.utils.getUid();
    
    if(typeof Ti.UI.currentWindow.node !== 'undefined'){
        node = Ti.UI.currentWindow.node;
        Ti.API.debug("node exists in window: " + node.nid);
    }
    else{
        node.created = this.Omadi.utils.getUTCTimestamp();
        node.author_uid = uid;
        node.form_part = 0;
        node.dispatch_nid = 0;
    }
    
    node.nid = Ti.UI.currentWindow.nid;
    node.type = Ti.UI.currentWindow.type;
    
    node.changed = this.Omadi.utils.getUTCTimestamp();
    node.changed_uid = uid;
    node.flag_is_updated = 0;
    
    return node;
};

FormModule.prototype.formWindowOnClose = function(){"use strict";
    var regionWrappers_i, regionView_i, field_i, regionWrapperChild_i;
    
    Ti.App.removeEventListener('loggingOut', loggingOutForm);
    Ti.App.removeEventListener('photoUploaded', photoUploadedForm);
    Ti.UI.currentWindow.removeEventListener("omadi:saveForm", saveDispatchForm);
    
    var field_child_i, j, k;
    var i, j, k;
    
    try{
        
        if(scrollView != null){
           
           if(typeof scrollView.children !== 'undefined' && scrollView.children.length > 0){
               for(i = scrollView.children.length - 1; i >= 0; i --){
                   
                   if(typeof scrollView.children[i].children !== 'undefined'){
                       for(j = scrollView.children[i].children.length - 1; j >= 0; j --){
                           
                           if(typeof scrollView.children[i].children[j].children !== 'undefined'){
                               for(k = scrollView.children[i].children[j].children.length - 1; k >= 0; k --){
                                   
                                    Ti.API.debug("removing k=" + k);
                                    scrollView.children[i].children[j].remove(scrollView.children[i].children[j].children[k]);
                                    scrollView.children[i].children[j].children[k] = null;
                               }
                           }
                           
                           Ti.API.debug("removing j=" + j);
                           scrollView.children[i].remove(scrollView.children[i].children[j]);
                           scrollView.children[i].children[j] = null;
                       }
                   }
                   
                   Ti.API.debug("removing i=" + i);
                   scrollView.remove(scrollView.children[i]);
                   scrollView.children[i] = null;
               }
           }
            
           
        }
    }
    catch(nothing3){
        Ti.API.error("exception cleaning scroll view " + nothing3);
    }
    
    try{
        for(i in regionWrappers){
            if(regionWrappers.hasOwnProperty(i)){
                
                if(typeof regionWrappers[i].children !== 'undefined'){
                    for(j = regionWrappers[i].children.length - 1; j >= 0; j --){
                        Ti.API.debug("removing region wrappers j=" + j);
                        
                        regionWrappers[i].remove(regionWrappers[i].children[j]);
                        regionWrappers[i].children[j] = null;
                    }
                }
                
                Ti.API.debug("Nulling region wrapper i=" + i);
                regionWrappers[i] = null;
            }
        }
        
        for(i in regionViews){
            if(regionViews.hasOwnProperty(i)){
                
                if(typeof regionViews[i].children !== 'undefined'){
                    for(j = regionViews[i].children.length - 1; j >= 0; j --){
                        Ti.API.debug("removing region views j=" + j);
                        
                        regionViews[i].remove(regionViews[i].children[j]);
                        regionViews[i].children[j] = null;
                    }
                }
                
                Ti.API.debug("Nulling region view i=" + i);
                regionViews[i] = null;
            }
        }
    }
    catch(nothing4){
        Ti.API.error("exception cleaning arrays " + nothing4);
    }
    
    try{
        wrapperView.remove(scrollView);
        scrollView = null;
    }
    catch(nothing5){
        Ti.API.error("exception with wrapperview cleanup " + nothing5);
    }
   
};

FormModule.prototype.getWindow = function(type, nid, form_part){"use strict";
    
    var self = Ti.UI.createWindow({
        navBarHidden: true,
        backgroundColor:'#eee'
    });
    
    var continuous_nid = null;
    var node;
    var tempNid;
    var tempFormPart;

    //self.addEventListener("android:back", cancelOpt);
    
    // Do not let the app log this user out while on the form screen
    // Allow again when the node is saved
    Ti.App.allowBackgroundLogout = false;
    
    if(nid == 'new'){
        node = this.getNewNode();
        nid = 'new';
        continuous_nid = 0;
    }
    else{
        node = this.Omadi.data.nodeLoad(nid);
        // Make sure the window nid is updated to the real nid, as it could have changed in nodeLoad
        Ti.API.debug("continous 1: " + node.continuous_nid);
        Ti.API.debug("nid 1: " + node.nid);
        
        if(node.continuous_nid != null && node.continuous_nid != 0){
            tempNid = node.nid;
            node.nid = node.continuous_nid;
            node.continuous_nid = tempNid;
        }
        
        nid = node.nid;
        continuous_nid = node.continuous_nid;
        
        Ti.API.debug("continuous nid: " + continuous_nid);
        Ti.API.debug("window nid: " + nid);
    }
    
    if(typeof form_part !== 'undefined'){
        tempFormPart = parseInt(form_part, 10);
        if(form_part == tempFormPart){
            node.form_part = form_part;
        }
        else{
            // This is a copy to form, the form_part passed in is which type to copy to
            Ti.API.info("This is a custom copy to " + form_part);
            node = loadCustomCopyNode(node, type, form_part);
            
            origNid = node.origNid;
            node.custom_copy_orig_nid = node.origNid;
            
            type = node.type;
            nid = 'new';
            form_part = 0;
            
            // Ti.App.removeEventListener("formFullyLoaded", formFullyLoadedForm);
            // Ti.App.addEventListener("formFullyLoaded", formFullyLoadedForm);
//             
            // Ti.UI.currentWindow.addEventListener('close', function(){
                // Ti.App.removeEventListener("formFullyLoaded", formFullyLoadedForm);
            // });
        }
    }
//     
    // if(typeof node.custom_copy_orig_nid === 'undefined'){
        // node.custom_copy_orig_nid = 0;
    // }
//     
    // Ti.UI.currentWindow.node = node;
    
    // Ti.API.debug("LOADED NODE: " + JSON.stringify(node));
//     
    // if(win.nid < 0){
        // Ti.API.error("WIN NID: " + win.nid);
//         
        // Ti.App.removeEventListener('switchedItUp', switchedNodeIdForm);
        // Ti.App.addEventListener('switchedItUp', switchedNodeIdForm);
//         
        // Ti.UI.currentWindow.addEventListener('close', function(){
           // Ti.App.removeEventListener('switchedItUp', switchedNodeIdForm); 
        // });
    // }
//     
    // Ti.App.removeEventListener('photoUploaded', photoUploadedForm);
    // Ti.App.addEventListener('photoUploaded', photoUploadedForm);
//     
    // Ti.App.removeEventListener('loggingOut', loggingOutForm);
    // Ti.App.addEventListener('loggingOut', loggingOutForm);
//     
    // if(Ti.UI.currentWindow.nid != "new" && Ti.UI.currentWindow.nid > 0){
        // Omadi.service.setNodeViewed(Ti.UI.currentWindow.nid);
    // }
//     

    
    
    var wrapperView = Ti.UI.createView({
       layout: 'vertical',
       bottom: 0,
       top: 0,
       right: 0,
       left: 0 
    });
    
    if(Ti.App.isIOS7){
        if(!Ti.UI.currentWindow.usingDispatch){
            wrapperView.top = 20;   
        }
    }
    
   
        if (Ti.App.isAndroid) {
            //get_android_menu();
        }
        else {
            //addiOSToolbar();
        }
    
    
    var scrollView = Ti.UI.createScrollView({
        contentHeight : 'auto',
        showHorizontalScrollIndicator : false,
        showVerticalScrollIndicator : true,
        scrollType : 'vertical',
        layout: 'vertical',
        height: Ti.UI.FILL,
        width: '100%'
    });
    
    
    var instances = this.Omadi.data.getFields(type);
        
    var regions = this.Omadi.data.getRegions(type);
    
    
    
    var region;
    var region_name;
    var region_form_part = 0;
    var hasViolationField = false;
    var regionView = null;
    var regionWrapperView = null;
    
    for(region_name in regions){
        if(regions.hasOwnProperty(region_name)){
            Ti.API.debug(region_name);
        }
    }
    
    wrapperView.add(scrollView);
    
    //scrollView.addEventListener('scroll', function(e){
        //scrollPositionY = e.y;
    //});
    
    self.add(wrapperView);
    self.addEventListener('close', this.formWindowOnClose);
    
    
    
    for(region_name in regions){
        if(regions.hasOwnProperty(region_name)){
            region = regions[region_name];
            
            if(typeof region.settings !== 'undefined' && region.settings != null && typeof region.settings.form_part !== 'undefined'){
                region_form_part = parseInt(region.settings.form_part, 10);
            }
            else{
                region_form_part = 0;
            }
           
            if(region_form_part <= node.form_part || (node.form_part == -1 && region_form_part == 0)){
                
                var expanded = true;
                if(typeof region.settings !== 'undefined' && 
                    region.settings != null &&
                    typeof region.settings.always_expanded !== 'undefined' && 
                    region.settings.always_expanded == 1){
                        
                        expanded = true;
                }
                else if(typeof region.settings !== 'undefined' && 
                    region.settings != null &&
                    typeof region.settings.always_collapsed !== 'undefined' && 
                    region.settings.always_collapsed == 1){
                        
                        expanded = false;
                }
                else if(region_form_part < node.form_part){
                    expanded = false;
                }
                
                regionWrapperView = Ti.UI.createView({
                    height: Ti.UI.SIZE,
                    width: '100%',
                    layout: 'vertical'
                });
                
                regionWrapperView.add(getRegionHeaderView(region, expanded));
                regionWrapperView.add(Ti.UI.createView({
                    height: 10,
                    width: '100%'
                }));
                 
                regionView = Ti.UI.createView({
                    width : '100%',
                    backgroundColor : '#eee',
                    height: Ti.UI.SIZE,
                    layout: 'vertical'
                });
                
                if(expanded === false){
                    regionView.visible = false;
                    regionView.height = 5;
                }
//                 
                // regionWrapperView.add(regionView);
                //scrollView.add(regionWrapperView);
                
                scrollView.add(Ti.UI.createView({
                    height: 10,
                    width: '100%'
                }));
                 
                this.regionWrappers[region_name] = regionWrapperView;
                this.regionViews[region_name] = regionView;
            }
        }
    }
    
    return self;
};

module.exports = FormModule;
