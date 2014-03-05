/*jslint eqeq:true*/

function getRegionHeaderView(regionView, region, expanded){"use strict";
    
    var arrow_img, regionHeader, regionHeaderWrapper, collapsedView;
    
    arrow_img = Ti.UI.createImageView({
        image : '/images/light_arrow_left.png',
        width : 29,
        height : 29,
        top: 5,
        right: 5,
        zIndex : 999,
        touchEnabled: false
    });
    
    if(expanded){
        arrow_img.image = '/images/light_arrow_down.png';
    }
    
    regionHeaderWrapper = Ti.UI.createView({
        height: Ti.UI.SIZE,
        width: '100%'
    });

    regionHeader = Ti.UI.createLabel({
        text : region.label.toUpperCase(),
        color : '#ddd',
        font : {
            fontSize : 18,
            fontWeight : 'bold'
        },
        textAlign : 'center',
        width : '100%',
        top: 0,
        height : 40,
        ellipsize : true,
        wordWrap : false,
        zIndex : 998,
        region_name: region.region_name,
        expanded: expanded,
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
                color : '#555',
                offset : 0.0
            }, {
                color : '#666',
                offset : 0.3
            }, {
                color : '#333',
                offset : 1.0
            }]
        }
    });
    
    collapsedView = Ti.UI.createLabel({
        top: 40,
        width: '100%',
        height: Ti.UI.SIZE,
        text: region.label + ' is Collapsed',
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        borderWidth: 1,
        borderColor: '#ccc',
        color: '#666',
        font: {
            fontSize: 13
        },
        backgroundColor: '#ddd'
    });
    
    if(expanded){
        collapsedView.visible = false;
        collapsedView.borderWidth = 0;
    }
    
    regionHeader.arrow = arrow_img;
    regionHeader.collapsedView = collapsedView;
    regionHeader.regionView = regionView;
    
    regionHeader.addEventListener('click', function(e) {
        
        var regionView;
        e.source.expanded = !e.source.expanded;
        regionView = e.source.regionView;
        
        if (e.source.expanded === true) {
            
            e.source.collapsedView.hide();
            e.source.collapsedView.setBorderWidth(0);

            regionView.show();
            //regionView.setHeight(Ti.UI.SIZE);
            
            e.source.arrow.setImage("/images/light_arrow_down.png");
            
            regionView.setHeight(Ti.UI.SIZE);
            
            // For iOS, just make sure the region is expanded as layout doesn't always happen
            if(Ti.App.isIOS){
                setTimeout(function(){
                    regionView.setHeight(Ti.UI.SIZE);
                }, 100);
            }
        }
        else {
          
            e.source.collapsedView.show();
            e.source.collapsedView.setBorderWidth(1);
            
            regionView.hide();
            
            regionView.setHeight(0);
           
            e.source.arrow.setImage("/images/light_arrow_left.png");
        }
    });
    
    regionHeaderWrapper.add(regionHeader);
    regionHeaderWrapper.add(arrow_img);
    regionHeaderWrapper.add(collapsedView);
    
    return regionHeaderWrapper;
}

function loggingOut(){"use strict";
    Ti.UI.currentWindow.close();
}

function photoUploaded(e){"use strict";
    
    var nid, delta, fid, field_name, dbValues;
    
    nid = parseInt(e.nid, 10);
    delta = parseInt(e.delta, 10);
    field_name = e.field_name;
    fid = parseInt(e.fid, 10);
    
    // if(Ti.UI.currentWindow.nid == nid){
        // if(typeof fieldWrappers[field_name] !== 'undefined'){
            // //alert("Just saved delta " + delta);
            // Omadi.widgets.setValueWidgetProperty(field_name, 'dbValue', fid, delta);
            // Omadi.widgets.setValueWidgetProperty(field_name, 'fid', fid, delta);
        // }
    // }
}

function formWindowOnClose(){"use strict";
    var regionWrappers_i, regionView_i, field_i, regionWrapperChild_i;
    
    Ti.App.removeEventListener('loggingOut', loggingOut);
    Ti.App.removeEventListener('photoUploaded', photoUploaded);
    // TODO: finish saveDispatch form
    //Ti.UI.currentWindow.removeEventListener("omadi:saveForm", saveDispatchForm);
}


//+++++++++++++++++++++++++
// Public functions
//+++++++++++++++++++++++++

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

FormModule.prototype.getWindow = function(type, nid, form_part, usingDispatch){
    
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
    Ti.App.removeEventListener('photoUploaded', photoUploaded);
    Ti.App.addEventListener('photoUploaded', photoUploaded);
    
    Ti.App.removeEventListener('loggingOut', loggingOut);
    Ti.App.addEventListener('loggingOut', loggingOut);
    
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
        if(!usingDispatch){
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
    
    self.addEventListener('close', formWindowOnClose);
    
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
                
                // Setup the full region view that will contain the fields
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
                
                // Add the region header that is clickable for expanding, collapsing
                regionWrapperView.add(getRegionHeaderView(regionView, region, expanded));
                // Add a little space below the header
                regionWrapperView.add(Ti.UI.createView({
                    height: 10,
                    width: '100%'
                }));
                  
                regionWrapperView.add(regionView);
                scrollView.add(regionWrapperView);
                
                scrollView.add(Ti.UI.createView({
                    height: 10,
                    width: '100%'
                }));
                 
                Ti.API.debug("Added region " + region_name);
                //this.regionWrappers[region_name] = regionWrapperView;
                //this.regionViews[region_name] = regionView;
            }
        }
    }
    
    wrapperView.add(scrollView);
    
    //scrollView.addEventListener('scroll', function(e){
        //scrollPositionY = e.y;
    //});
    
    self.add(wrapperView);
    
    
    return self;
};

module.exports = FormModule;
