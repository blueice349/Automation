/*jslint nomen:true,eqeq:true,plusplus:true*/

var _instances = {};
var Omadi;

var ROLE_ID_ADMIN = 3;
var ROLE_ID_MANAGER = 4;
var ROLE_ID_SALES = 5;
var ROLE_ID_FIELD = 6;
var ROLE_ID_CLIENT = 7;
var ROLE_ID_OMADI_AGENT = 8;

function displayLargeImage(e){"use strict";
    Omadi.display.displayLargeImage(e.source, e.source.nid, e.source.fid);
}

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
    Omadi.display.openViewWindow(e.source.type, e.source.nid);
}

function openFileViewer(e){"use strict";
    Omadi.display.displayFile(e.source.nid, e.source.dbValue, e.source.textValue);
}

function getDrivingDirectionsView(e){"use strict";
    var address = e.source.text.replace("\n", ' ');
    Omadi.display.getDrivingDirectionsTo(address);                                   
}

function displayFullImage(e){"use strict";
    Omadi.display.displayFullImage(e.source);
}


function NodeView(type, nid){"use strict";
    
    this.nid = nid;
    this.type = type;
    
    this.node = Omadi.data.nodeLoad(nid);
    
    this.win = null;
    this.scrollView = null;
    
    this.regionCount = 0;   
    
    this.regions = {};
    this.instances = {};
}

NodeView.prototype.init = function(){"use strict";
    var db, result, reg_settings, region_name, field_desc, unsorted_res, 
        savedValues, settings, i, j, roles, stringifyObj, omadi_session_details;
    
    unsorted_res = [];
    
    db = Omadi.utils.openMainDatabase();
    
    try{
        result = db.execute('SELECT * FROM regions WHERE node_type = "' + this.node.type + '" ORDER BY weight ASC');
    
        while (result.isValidRow()) {
            reg_settings = result.fieldByName('settings');
            
            reg_settings = JSON.parse(reg_settings);
            
        
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
        
        result = db.execute('SELECT label, weight, type, field_name, widget, settings, required FROM fields WHERE bundle = "' + this.node.type + '" AND disabled = 0 ORDER BY weight ASC, id ASC');
        savedValues = [];
        
        omadi_session_details = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
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
                
            if(roles.hasOwnProperty(ROLE_ID_ADMIN) || roles.hasOwnProperty(ROLE_ID_OMADI_AGENT)){
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
        Omadi.service.sendErrorReport("Exception initializing fields/regions in view: " + ex);
    }
    finally{
        try{
            db.close();
        }
        catch(ex1){}
    }
};


NodeView.prototype.addRegion = function(regionObj) {"use strict";

    var i, partsFieldsDone = {}, field_name, field_parts, top;
    
    if(this.regionCount == 0 && Ti.App.isIOS){
        top = 20;   
    }
    else{
        top = 0;
    }
    
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
        top: top
    }));

    if ( typeof regionObj.fields !== 'undefined') {
      

        for ( i = 0; i < regionObj.fields.length; i += 1) {
        
            field_name = regionObj.fields[i].field_name;
            if (field_name.indexOf("___") !== -1) {
                field_parts = field_name.split("___");
                if ( typeof partsFieldsDone[field_parts[0]] === 'undefined') {
                    this.addField(regionObj.fields[i]);
                    partsFieldsDone[field_parts[0]] = true;
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
    /*global getCalculationTableView*/
   
    var i, rowView, valueView, valueLabel, labelView, labelLabel, fieldIsHidden, tableView, fileId, 
        contentImage, field_parts, part, contentWidth, dotIndex, extension, imagePath, degrees, transform,
        animation, rotateDegrees, widget;
    
    
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
                    tableView = widget.getView(Omadi, this.node, fieldObj);
                    
                    //tableView = Omadi.widgets.calculation_field.getTableView(this.node, fieldObj);
    
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
                
                //valueView = Omadi.widgets.rules_field.getNewElement(this.node, fieldObj);
                
                widget = require('ui/widget/RulesField');
                valueView = widget.getView(Omadi, this.node, fieldObj);
                
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
                tableView = widget.getView(Omadi, this.node, fieldObj);
                
                //tableView = Omadi.widgets.extra_price.getTableView(this.node, fieldObj);
                
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
    
                    for ( i = 0; i < this.node[fieldObj.field_name].dbValues.length; i += 1) {
    
                        if (this.node[fieldObj.field_name].dbValues[i] > 0) {
                            fileId = this.node[fieldObj.field_name].dbValues[i];
                            contentImage = Ti.UI.createImageView({
                                height : 100,
                                width : 100,
                                left : 10,
                                top : 0,
                                image : '/images/photo_loading.png',
                                autorotate: true,
                                borderColor : '#333',
                                borderWidth : 2,
                                fid : fileId,
                                bigImg : null,
                                nid: this.node.nid
                            });
    
                            contentImage.addEventListener('click', displayLargeImage);
                            
                            valueView.add(contentImage);
                            Omadi.display.setImageViewThumbnail(contentImage, this.node.nid, fileId);
                            contentWidth += 110;
                        }
                    }
    
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
                                filePath : imagePath,
                                isImage : true
                            });
                            
                            contentImage.addEventListener('click', displayFullImage);
                            
                            valueView.add(contentImage);
                            
                            contentWidth += 110;
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
                else if (fieldObj.type === 'file' && typeof fieldObj.settings !== 'undefined' && fieldObj.settings._display !== 'undefined' && fieldObj.settings._display['default'].type !== 'undefined' && fieldObj.settings._display['default'].type == 'omadi_file_video') {
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
                                widget.openVideoPlayer(Omadi, e.source.instance, e.source);
                            });
                            
                            valueView.add(contentImage);
                            Omadi.display.setImageViewVideoThumbnail(contentImage, this.node.nid, fileId, fieldObj.field_name);
                            contentWidth += 110;
                        }
                    }
    
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
                            case 'text':
                            case 'text_long':
                            case 'list_boolean':
                            case 'user_reference':
                            case 'taxonomy_term_reference':
                            case 'number_integer':
                            case 'number_decimal':
                                break;
    
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
                                
                                if(Omadi.display.getFileViewType(valueLabel.textValue) !== null){
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
                                //var part;
                                valueLabel.text = "";
                                //node[field_parts[0]].dbValues.join(', ');
                              
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

NodeView.prototype.getWindow = function(){"use strict";
    var regionName, i, db, result, usernames, metaDataFields;
    
    if(!this.initialized){
        this.init();
    }
    
    this.win = Ti.UI.createWindow({
        navBarHidden: true,
        backgroundColor:'#0f0',
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

    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT realname, uid FROM user WHERE uid IN (" + this.node.author_uid + "," + this.node.changed_uid + ")");
    usernames = [];

    while (result.isValidRow()) {
        usernames[result.fieldByName("uid")] = result.fieldByName("realname");
        result.next();
    }
    result.close();
    db.close();

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
        textValue : Omadi.utils.formatDate(this.node.created, true),
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
            textValue : Omadi.utils.formatDate(this.node.changed, true),
            can_view: true
        });
    }

    for ( i = 0; i < metaDataFields.length; i++) {
        this.addField(metaDataFields[i]);
    }
    
    // Send a ping to the server that this node was viewed
    Omadi.service.setNodeViewed(this.nid);
    
    this.win.add(this.scrollView);
    
    return this.win;
};

exports.getWindow = function(OmadiObj, type, nid){"use strict";
    Omadi = OmadiObj;
    
    _instances[type] = new NodeView(type, nid);
    return _instances[type].getWindow();
};