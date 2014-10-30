/*jslint nomen:true,eqeq:true,plusplus:true*/

var Print = require('lib/Print');
var Utils = require('lib/Utils');
var Node = require('objects/Node');
var Display = require('lib/Display');
var ImageWidget = require('ui/widget/Image');
var _instances = {};
var ActiveObj = null;

var RoleId = {
	ADMIN: 3,
	MANAGER: 4,
	SALES: 5,
	FIELD: 6,
	CLIENT: 7,
	OMADI_AGENT: 8
};

function openTelephone(e){"use strict";
    Ti.Platform.openURL('tel:' + e.source.number);                       
}

function openURL(e){"use strict";
    Ti.Platform.openURL(e.source.text);
}

function openEmailDialog(e){"use strict";
    var emailDialog = Titanium.UI.createEmailDialog();
    emailDialog.subject = e.source.nodeTitle;
    emailDialog.toRecipients = [e.source.text];
    emailDialog.open();
}

function openOmadiReferenceWindow(e){"use strict";
    Display.openViewWindow(e.source.type, e.source.nid);
}

function openFileViewer(e){"use strict";
    Display.displayFile(e.source.nid, e.source.dbValue, e.source.textValue);
}

function getDrivingDirectionsView(e){"use strict";
    var address = e.source.text.replace("\n", ' ');
    Display.getDrivingDirectionsTo(address);                                   
}

function NodeView(type, nid){"use strict";
    
    this.nid = nid;
    this.type = type;
    
    this.node = Node.load(nid);
    
    this.win = null;
    this.scrollView = null;
    
    this.regionCount = 0;   
    
    this.regions = {};
    this.instances = {};
    
    this.nodeViewTabsObj = null; 
}

NodeView.prototype.getActionOptions = function() {"use strict";
	var node = ActiveObj.nodeViewTabsObj.workNode;
	var bundle = Node.getBundle(node.type);
	var options = [];
	
	try {
		if (node.perm_edit) {
			// next part
			if (bundle.data.form_parts > node.form_part + 1) {
				options.push(bundle.data.form_parts.parts[node.form_part + 1].label);
			}
			
			// edit
			options.push('Edit');
		}
		
		// print
		if(Print.canPrintReceipt(node.nid)){
			options.push('Print');
	    }
		
		// change / copy to
		var toType;
		for (toType in bundle.data.custom_copy) {
            if(bundle.data.custom_copy.hasOwnProperty(toType)){
                var toBundle = Node.getBundle(toType);
                if (toBundle && toBundle.can_create == 1) {
                    options.push((bundle.data.custom_copy[toType].conversion_type == 'change' ? 'Change to ' : 'Copy to ') + toBundle.label);
                }
            }
		}
		
		// cancel
		options.push('Cancel');
	} catch (e) {
		Utils.sendErrorReport('Error in getActionOptions: ' + e);
	}
	
	return options;
};

NodeView.prototype.actionsEventHandler = function() {"use strict";
	var bundle, btn_tt, btn_id, form_part, postDialog, to_type, to_bundle, nodeViewTabsObj;
        
    try{
        nodeViewTabsObj = ActiveObj.nodeViewTabsObj;
        
        bundle = Node.getBundle(nodeViewTabsObj.workNode.type);
        
        form_part = nodeViewTabsObj.workNode.form_part;
        
        Ti.API.debug("The node: " + JSON.stringify(nodeViewTabsObj.workNode));
        
        Ti.API.debug("The form part: " + form_part);
        
        
        btn_tt = [];
        btn_id = [];
        
        if (nodeViewTabsObj.workNode.perm_edit) {
	        if (bundle.data.form_parts != null && bundle.data.form_parts != "") {
	            if (bundle.data.form_parts.parts.length >= form_part + 2) {
	                btn_tt.push(bundle.data.form_parts.parts[form_part + 1].label);
	                btn_id.push(form_part + 1);
	            }
	        }
	
	        btn_tt.push('Edit');
	        btn_id.push(form_part);
        }
        
        if(Print.canPrintReceipt(nodeViewTabsObj.workNode.nid)){
            
            btn_tt.push('Print');
            btn_id.push('_print');
        }

        if(typeof bundle.data.custom_copy !== 'undefined'){
            for(to_type in bundle.data.custom_copy){
                if(bundle.data.custom_copy.hasOwnProperty(to_type)){
                    to_bundle = Node.getBundle(to_type);
                    if(to_bundle && to_bundle.can_create == 1){
                        
                        if(typeof bundle.data.custom_copy[to_type] !== 'undefined' && 
                            typeof bundle.data.custom_copy[to_type].conversion_type !== 'undefined' &&
                            bundle.data.custom_copy[to_type].conversion_type == 'change'){
                            
                                btn_tt.push("Change to " + to_bundle.label);
                                btn_id.push(to_type); 
                        }
                        else{
                            btn_tt.push("Copy to " + to_bundle.label);
                            btn_id.push(to_type);
                        }
                    }
                }
            }
        }
        
        btn_tt.push('Cancel');

        postDialog = Titanium.UI.createOptionDialog();
        postDialog.options = btn_tt;
        postDialog.cancel = btn_tt.length - 1;
        postDialog.show();

        postDialog.addEventListener('click', function(ev) {
            var formPart, nodeViewTabsObj;
            
            try{
                nodeViewTabsObj = ActiveObj.nodeViewTabsObj;
                
                if (ev.index == ev.source.cancel) {
                    Ti.API.info("Fix this logic");
                }
                else if (ev.index != -1) {
                    
                    formPart = btn_id[ev.index];
                    
                    if(formPart == '_print'){
                        Print.printReceipt(nodeViewTabsObj.workNode.nid);
                    }
                    else{
                        
                        Ti.App.fireEvent('openFormWindow', {
                            node_type: nodeViewTabsObj.workNode.type,
                            nid: nodeViewTabsObj.workNode.nid,
                            form_part: formPart 
                        });
                    }
                }
            }
            catch(ex){
                Utils.sendErrorReport("Exception with action click on view 2: " + ex);
            }
        });
    }
    catch(ex){
        Utils.sendErrorReport("Exception with viewing actions on view 2: " + ex);
    }
};

NodeView.prototype.addIOSToolbar = function(allowActions){"use strict";
    var back, space, label, edit, arr, toolbar;
    
    back = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });
    
    back.addEventListener('click', function() {
        try{
            ActiveObj.nodeViewTabsObj.close();
        }
        catch(ex){
            Utils.sendErrorReport("Exception closing iOS back node view: " + ex);
        }
    });

    space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    
    label = Titanium.UI.createButton({
        title : 'View',
        color : '#fff',
        ellipsize : true,
        wordwrap : false,
        width : 200,
        style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
    });

    edit = Ti.UI.createButton({
        title : 'Actions',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });

    edit.addEventListener('click', this.actionsEventHandler);
    
    arr = (this.getActionOptions().length > 1 && allowActions) ? [back, space, label, space, edit] : ((Ti.Platform.osname == 'ipad') ? [back, space, label, space] : [back, label, space]);
    
    // create and add toolbar
    toolbar = Ti.UI.iOS.createToolbar({
        items : arr,
        top : 20,
        borderTop : false,
        borderBottom : true,
        height: Ti.UI.SIZE
    });
    
    this.win.add(toolbar);
};

NodeView.prototype.init = function(){"use strict";
    var result, reg_settings, region_name, field_desc, unsorted_res, 
        savedValues, settings, i, j, roles, stringifyObj, omadi_session_details;
    
    unsorted_res = [];
    
    try{
        result = Database.query('SELECT * FROM regions WHERE node_type = "' + this.node.type + '" ORDER BY weight ASC');
    
        while (result.isValidRow()) {
            reg_settings = result.fieldByName('settings');
            
            reg_settings = Utils.getParsedJSON(reg_settings);
            
        
            if (reg_settings != null && parseInt(reg_settings.form_part, 10) > this.node.form_part && this.node.form_part != -1) {
                Ti.API.info('Region : ' + result.fieldByName('label') + ' won\'t appear');
            }
            else {
                region_name = result.fieldByName('region_name');
                this.regions[region_name] = {};
        
                
                this.regions[region_name].label = result.fieldByName('label');
                this.regions[region_name].settings = result.fieldByName('settings');
                this.regions[region_name].fields = [];
            }
            result.next();
        }
        
        result.close();
        
        result = Database.query('SELECT label, weight, type, field_name, widget, settings, required FROM fields WHERE bundle = "' + this.node.type + '" AND disabled = 0 ORDER BY weight ASC, id ASC');
        savedValues = [];
        
        omadi_session_details = Utils.getParsedJSON(Ti.App.Properties.getString('Omadi_session_details'));
        roles = omadi_session_details.user.roles;
        
        while (result.isValidRow()) {
            
            if (result.fieldByName('type') == 'file') {
                unsorted_res.push({
                    field_name : result.fieldByName('field_name') + '___filename',
                    label : result.fieldByName('label'),
                    type : result.fieldByName('type'),
                    settings : result.fieldByName('settings'),
                    widget : result.fieldByName('widget'),
                    required : result.fieldByName('required')
                });
            }
        
            field_desc = {
                label : result.fieldByName('label'),
                type : result.fieldByName('type'),
                field_name : result.fieldByName('field_name'),
                settings : JSON.parse(result.fieldByName('settings')),
                widget : JSON.parse(result.fieldByName('widget')),
                required : result.fieldByName('required')
            };
            
            
            settings = field_desc.settings;
            
            field_desc.can_view = false;
            field_desc.can_edit = false;
                
            if(roles.hasOwnProperty(RoleId.ADMIN) || roles.hasOwnProperty(RoleId.OMADI_AGENT)){
                // Give all admin accounts permissions
                field_desc.can_view = field_desc.can_edit = true;
            }
            else if (settings.enforce_permissions != null && settings.enforce_permissions == 1) {
                for (i in settings.permissions) {
                    if(settings.permissions.hasOwnProperty(i)){
                        for (j in roles) {
                            if(roles.hasOwnProperty(j)){
                                if (i == j) {
                                    stringifyObj = JSON.stringify(settings.permissions[i]);
                                    if (stringifyObj.indexOf('update') >= 0 || settings.permissions[i].all_permissions) {
                                        field_desc.can_edit = true;
                                    }
        
                                    if (stringifyObj.indexOf('view') >= 0 || settings.permissions[i].all_permissions) {
                                        field_desc.can_view = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else {
                // No permissions are being enforced, so give access
                field_desc.can_view = field_desc.can_edit = true;
            }
        
            this.instances[field_desc.field_name] = field_desc;   
        
            for (region_name in this.regions) {
                if (this.regions.hasOwnProperty(region_name) && region_name == field_desc.settings.region) {
                    this.regions[region_name].fields.push(field_desc);
                }
            }
        
            result.next();
        }
        
        result.close();
    }
    catch(ex){
        Utils.sendErrorReport("Exception initializing fields/regions in view: " + ex);
    }
    finally{
        try{
            Database.close();
        }
        catch(ex1){}
    }
};


NodeView.prototype.addRegion = function(regionObj) {"use strict";
    this.scrollView.add(Ti.UI.createLabel({
        text : regionObj.label.toUpperCase(),
        color : '#ddd',
        font : {
            fontSize : 20,
            fontWeight : 'bold'
        },
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        width : '100%',
        touchEnabled : false,
        height : 40,
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
                color : '#666',
                offset : 0.0
            }, {
                color : '#777',
                offset : 0.3
            }, {
                color : '#444',
                offset : 1.0
            }]
        },
        ellipsize : true,
        wordWrap : false,
        top: 0
    }));

	var partsFieldsDone = {};
    if (regionObj.fields) {
        var i;
        for (i = 0; i < regionObj.fields.length; i++) {
            var fieldName = regionObj.fields[i].field_name;
            if (fieldName.indexOf("___") !== -1) {
                var fieldParts = fieldName.split("___");
                if (!partsFieldsDone[fieldParts[0]]) {
                    this.addField(regionObj.fields[i]);
                    partsFieldsDone[fieldParts[0]] = true;
                }
            }
            else {
                this.addField(regionObj.fields[i]);
            }
        }
    }
    
    this.regionCount ++;
};

NodeView.prototype.addField = function(fieldObj) {"use strict";
    var i, rowView, valueView, valueLabel, labelView, labelLabel, fieldIsHidden, tableView, fileId, 
        contentImage, field_parts, contentWidth, imagePath, degrees, widget;
    
    fieldObj.can_edit = false;
    if ( typeof this.node[fieldObj.field_name] !== 'undefined') {
        if(fieldObj.can_view){
            rowView = Ti.UI.createView({
                width : '100%',
                top : 0,
                height : Ti.UI.SIZE,
                borderWidth : 1,
                borderColor : '#ccc'
            });
    
            labelView = Ti.UI.createView({
                width : "40%",
                height : 40,
                top : 0,
                left : 0,
                backgroundColor : '#ddd'
               
            });
    
            labelLabel = Ti.UI.createLabel({
                text : fieldObj.label,
                right : '3%',
                top : 10,
                width: '97%',
                textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
                font : {
                    fontSize : 16,
                    fontWeight : 'bold'
                },
                ellipsize : true,
                wordWrap : false,
                color : "#246"
            });
    
            labelView.add(labelLabel);
    
            valueView = Ti.UI.createView({
                width : "59%",
                right : 0,
                height : Ti.UI.SIZE,
                layout : 'vertical'
            });
    
            fieldIsHidden = false;
    
            if (fieldObj.type === 'calculation_field') {
    
                if (fieldObj.settings.hidden == 0) {
                    
                    widget = require('ui/widget/CalculationField');
                    tableView = widget.getView(this.node, fieldObj);
    
                    if (tableView.singleValue) {
                        valueView.add(tableView);
                        rowView.add(labelView);
                        rowView.add(valueView);
                    }
                    else {
                      
                        this.scrollView.add(tableView);
                    }
                }
                else {
                    fieldIsHidden = true;
                }
            }
            else if (fieldObj.type === 'rules_field') {
                rowView.add(labelView);
                
                widget = require('ui/widget/RulesField');
                valueView = widget.getView(this.node, fieldObj);
                
                valueView.setWidth("59%");
                valueView.setRight(0);
                
                rowView.add(valueView);
                    
            }
            else if (fieldObj.type === 'extra_price') {
                labelView.height = Ti.UI.SIZE;
                labelView.width = '100%';
                labelLabel.textAlign = Ti.UI.TEXT_ALIGNMENT_LEFT;
                labelLabel.left = '2%';
                
                this.scrollView.add(labelView);
                widget = require('ui/widget/ExtraPrice');
                tableView = widget.getView(this.node, fieldObj);
                
                this.scrollView.add(tableView);
                this.scrollView.add(Ti.UI.createView({
                    width: '100%',
                    height: 10
                }));
            }
            else if (fieldObj.type == 'metadata') {
                valueLabel = Ti.UI.createLabel({
                    text : fieldObj.textValue,
                    textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                    wordWrap : true,
                    height : Ti.UI.SIZE,
                    width : '100%',
                    font : {
                        fontSize : 14
                    },
                    left : 5,
                    color : '#666'
                });
    
                labelView.height = Ti.UI.SIZE;
                labelLabel.top = 0;
                labelLabel.color = '#666';
                labelLabel.font = {
                    fontSize : 14,
                    fontWeight : 'bold'
                };
    
                valueView.add(valueLabel);
                rowView.add(labelView);
                rowView.add(valueView);
            }
            else {
    
                if (fieldObj.type === 'image') {
                    valueView = Ti.UI.createScrollView({
                        contentHeight : 100,
                        arrImages : null,
                        scrollType : "horizontal",
                        layout : 'horizontal',
                        right : 0,
                        width : '100%',
                        height : 100
                    });
                    
                    contentWidth = 0;
    
					try {
						var formObj = {node: this.node, nid: this.node.nid};
                        var imageObject = ImageWidget.getFieldObject(formObj, fieldObj, null);
                        imageObject.addImageViewsToWidgetView(this.node[fieldObj.field_name].dbValues, valueView);
					} catch(e) {
						Utils.sendErrorReport('Error adding image views to widget view (A): ' + e);
					}
                    
                    valueView.setContentWidth(110 * this.node[fieldObj.field_name].dbValues.length);
    
                    if (valueView.getChildren().length === 0) {
                        valueView.height = 0;
                    }
                    else{
                        labelView.setWidth('100%');
                        labelLabel.setTextAlign(Ti.UI.TEXT_ALIGNMENT_LEFT);
                        labelLabel.setLeft(5);
                    }
                    
                    rowView.add(valueView);
                    
                    this.scrollView.add(labelView);
                }
                else if (fieldObj.type === 'file' && 
                    fieldObj.settings &&
                    fieldObj.settings._display &&
                    fieldObj.settings._display['default'] &&
                    fieldObj.settings._display['default'].type == 'omadi_file_video') {
	
                    valueView = Ti.UI.createScrollView({
                        contentHeight : 100,
                        arrImages : null,
                        scrollType : "horizontal",
                        layout : 'horizontal',
                        right : 0,
                        width : '100%',
                        height : 100
                    });
                    
                    contentWidth = 0;
				
                    for ( i = 0; i < this.node[fieldObj.field_name].dbValues.length; i += 1) {
                        if (this.node[fieldObj.field_name].dbValues[i] > 0) {
                            
                            fileId = this.node[fieldObj.field_name].dbValues[i];
                            contentImage = Ti.UI.createImageView({
                                height : 100,
                                width : 100,
                                left : 10,
                                top : 0,
                                image : '/images/video_loading.png',
                                autorotate: true,
                                borderColor : '#333',
                                borderWidth : 2,
                                imageVal : fileId,
                                fid : fileId,
                                nid : this.node.nid,
                                node_type: this.node.type,
                                instance : fieldObj
                            });
    
                            contentImage.addEventListener('click', function(e){
                                var widget = require('ui/widget/Video');
                                widget.openVideoPlayer(e.source.instance, e.source);
                            });
                            
                            valueView.add(contentImage);
                            Display.setImageViewVideoThumbnail(contentImage, this.node.nid, fileId, fieldObj.field_name);
                            contentWidth += 110;
                        }
                    }

                    if (this.node[fieldObj.field_name].imageData) {
	                    for ( i = 0; i < this.node[fieldObj.field_name].imageData.length; i += 1) {
	                        if (this.node[fieldObj.field_name].imageData[i] > "") {
	                            fileId = this.node[fieldObj.field_name].dbValues[i];
	                            
	                            imagePath = this.node[fieldObj.field_name].imageData[i];
	                            degrees = this.node[fieldObj.field_name].degrees[i];
	                            
	                            contentImage = Ti.UI.createImageView({
	                                height : 100,
	                                width : 100,
	                                left : 10,
	                                top : 0,
	                                image : imagePath,
	                                autorotate: true,
	                                borderColor : '#333',
	                                borderWidth : 2,
	                                isImage : true,
	                                filePath : imagePath
	                            });
	                            
	                            valueView.add(contentImage);
	                            
	                            contentWidth += 110;
	                        }
	                    }
					}
                    
                    valueView.setContentWidth(contentWidth);
    
                    if (valueView.getChildren().length === 0) {
                        valueView.height = 0;
                    }
                    else{
                        labelView.setWidth('100%');
                        labelLabel.setTextAlign(Ti.UI.TEXT_ALIGNMENT_LEFT);
                        labelLabel.setLeft(5);
                    }
                    
                    rowView.add(valueView);
                    
                    this.scrollView.add(labelView);
                }
                else {
    
                    fieldIsHidden = false;
    
                    for ( i = 0; i < this.node[fieldObj.field_name].textValues.length; i += 1) {
    
                        valueLabel = Ti.UI.createLabel({
                            text : this.node[fieldObj.field_name].textValues[i],
                            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                            wordWrap : true,
                            height : Ti.UI.SIZE,
                            width : '100%',
                            font : {
                                fontSize : 16
                            },
                            left : 5,
                            color : '#666'
                        });
    
                        switch(fieldObj.type) {
                            case 'phone':
                                valueLabel.color = '#369';
                                if(this.node[fieldObj.field_name].textValues[i] != null){
                                    valueLabel.number = this.node[fieldObj.field_name].textValues[i].replace(/\D/g, '');
                                }
                                valueLabel.addEventListener('click', openTelephone);
                                break;
    
                            case 'link_field':
    
                                valueLabel.color = '#369';
                                valueLabel.addEventListener('click', openURL);
                                break;
    
                            case 'email':
                                valueLabel.color = '#369';
                                valueLabel.nodeTitle = this.node.title;
                                valueLabel.addEventListener('click', openEmailDialog);
                                break;
                                
                            case 'file':
                                
                                valueLabel.height = 40;
                                valueLabel.dbValue = this.node[fieldObj.field_name].dbValues[i];
                                valueLabel.nid = this.node.nid;
                                valueLabel.textValue = this.node[fieldObj.field_name].textValues[i];
                                
                                if(Display.getFileViewType(valueLabel.textValue) !== null){
                                    valueLabel.addEventListener('click', openFileViewer);
                                    valueLabel.color = '#369';
                                }
                                else{
                                    valueLabel.color = '#999';
                                }
                                
                                valueLabel.wordWrap = false;
                                valueLabel.ellipsize = true;
                                break;
    
                            case 'omadi_reference':
    
                                if ( typeof this.node[fieldObj.field_name].nodeTypes[i] !== 'undefined') {
                                    valueLabel.color = '#369';
                                    valueLabel.type = this.node[fieldObj.field_name].nodeTypes[i];
                                    valueLabel.nid = this.node[fieldObj.field_name].dbValues[i];
    
                                    valueLabel.addEventListener('click', openOmadiReferenceWindow);
                                }
    
                                break;
    
                            case 'location':
    
                                field_parts = fieldObj.field_name.split("___");
                                valueLabel.text = "";
                              
                                if(typeof this.node[field_parts[0]].parts !== 'undefined'){
                                    if (this.node[field_parts[0]].parts.street.textValue > "") {
                                        valueLabel.text += this.node[field_parts[0]].parts.street.textValue;
                                    }
                                    if (valueLabel.text > "") {
                                        valueLabel.text += "\n";
                                    }
                                    if (this.node[field_parts[0]].parts.city.textValue > "") {
                                        valueLabel.text += this.node[field_parts[0]].parts.city.textValue;
                                    }
        
                                    if (this.node[field_parts[0]].parts.province.textValue > "") {
                                        if (this.node[field_parts[0]].parts.city.textValue > "") {
                                            valueLabel.text += ', ';
                                        }
                                        valueLabel.text += this.node[field_parts[0]].parts.province.textValue;
                                    }
        
                                    if (this.node[field_parts[0]].parts.postal_code.textValue > "") {
                                        valueLabel.text += " " + this.node[field_parts[0]].parts.postal_code.textValue;
                                    }
                                    
                                    // Only show an address with sufficient length to get anywhere
                                    if(valueLabel.text.length > 8){
                                        
                                        valueLabel.addEventListener('click', getDrivingDirectionsView);
                                    }
                                }
    
                                break;
    
                            case 'vehicle_fields':
    
                                field_parts = fieldObj.field_name.split("___");
                                valueLabel.text = this.node[field_parts[0]].parts.make.textValue + " " + this.node[field_parts[0]].parts.model.textValue;
                                break;
    
                            case 'license_plate':
    
                                field_parts = fieldObj.field_name.split("___");
                                valueLabel.text = "(" + this.node[field_parts[0]].parts.state.textValue + ") " + this.node[field_parts[0]].parts.plate.textValue;
                                break;
                        }
    
                        valueView.add(valueLabel);
                    }
                    
                    rowView.add(labelView);
                    rowView.add(valueView);
                }
            }
            
            if(!fieldIsHidden){
                this.scrollView.add(rowView);
            }
        }
    }
    else {
        Ti.API.error(fieldObj.field_name + " not found in node!");
    }
};

NodeView.prototype.getWindow = function(allowActions){"use strict";
    var regionName, i, result, usernames, metaDataFields;
    
    if (typeof allowActions == 'undefined') {
        allowActions = true;
    }
    
    if(!this.initialized){
        this.init();
    }
    
    this.win = Ti.UI.createWindow({
        navBarHidden: true,
        backgroundColor:'#eee',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0
    });
    
    this.scrollView = Ti.UI.createScrollView({
        contentHeight : 'auto',
        backgroundColor : '#eee',
        showHorizontalScrollIndicator : false,
        showVerticalScrollIndicator : true,
        layout : 'vertical'
    });
    
    if(Ti.App.isIOS){
        this.addIOSToolbar(allowActions);
        this.scrollView.top = 60;
    } else {
        var actionsButton = Ti.UI.createLabel({
	        text : 'Actions',
            color : '#fff',
	        width : Ti.UI.FILL,
	        height : 35,
            backgroundGradient : Display.backgroundGradientBlue,
            borderRadius : 5,
            top: 5,
            left: 5,
            right: 5,
            bottom: 5,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
            font: {
                fontSize: 16,
                fontWeight: 'bold'
            }
	    });
	    actionsButton.addEventListener('click', this.actionsEventHandler);
	    if (this.getActionOptions().length > 1 && allowActions) {
            this.scrollView.add(actionsButton);
	    }
    }
    
    for (regionName in this.regions) {
        if (this.regions.hasOwnProperty(regionName)) {
            this.addRegion(this.regions[regionName]);
        }
    }
    
    this.scrollView.add(Ti.UI.createLabel({
        text : 'METADATA',
        color : '#ddd',
        font : {
            fontSize : 16,
            fontWeight : 'bold'
        },
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        width : '100%',
        touchEnabled : false,
        height : 25,
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
                color : '#888',
                offset : 0.0
            }, {
                color : '#999',
                offset : 0.3
            }, {
                color : '#666',
                offset : 1.0
            }]
        },
        ellipsize : true,
        wordWrap : false
    }));

    result = Database.query("SELECT realname, uid FROM user WHERE uid IN (" + this.node.author_uid + "," + this.node.changed_uid + ")");
    usernames = [];

    while (result.isValidRow()) {
        usernames[result.fieldByName("uid")] = result.fieldByName("realname");
        result.next();
    }
    result.close();
    database.close();

    metaDataFields = [];

    metaDataFields.push({
        type : 'metadata',
        label : 'Created By',
        field_name : 'author_uid',
        textValue : usernames[this.node.author_uid],
        can_view: true
    });
    metaDataFields.push({
        type : 'metadata',
        label : 'Created Time',
        field_name : 'created',
        textValue : Utils.formatDate(this.node.created, true),
        can_view: true
    });

    if (this.node.created !== this.node.changed) {
        metaDataFields.push({
            type : 'metadata',
            label : 'Last Updated By',
            field_name : 'author_uid',
            textValue : usernames[this.node.author_uid],
            can_view: true
        });
        metaDataFields.push({
            type : 'metadata',
            label : 'Last Updated Time',
            field_name : 'changed',
            textValue : Utils.formatDate(this.node.changed, true),
            can_view: true
        });
    }

    for ( i = 0; i < metaDataFields.length; i++) {
        this.addField(metaDataFields[i]);
    }
    
    // Send a ping to the server that this node was viewed
    Node.setViewed(this.nid);
    
    this.win.add(this.scrollView);
    
    return this.win;
};

exports.getWindow = function(nodeViewTabsObj, type, nid, allowActions){"use strict";
    if (typeof allowActions == 'undefined') {
        allowActions = true;
    }
    
    _instances[type] = new NodeView(type, nid);
    _instances[type].nodeViewTabsObj = nodeViewTabsObj;
    
    ActiveObj = _instances[type];
    
    return _instances[type].getWindow(allowActions);
};