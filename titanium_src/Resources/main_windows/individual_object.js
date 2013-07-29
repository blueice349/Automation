
Ti.include("/lib/widgets.js");

/*jslint eqeq:true, plusplus: true*/

var domainName = Ti.App.Properties.getString("domainName");

//Current window's instance
var curWin = Ti.UI.currentWindow;

Omadi.service.setNodeViewed(curWin.nid);

curWin.backgroundColor = "#EEEEEE";
curWin.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]);
var movement = curWin.movement;

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
curWin.addEventListener('android:back', function() {"use strict";
    Ti.API.info("Back to the step before");
    curWin.close();
});

function loggingOutIndividualObject(){"use strict";
    Ti.UI.currentWindow.close();
}

function savedNodeIndividualObject(){"use strict";
    
    if(Ti.App.isAndroid){
        Ti.UI.currentWindow.close();
    }
    else{
        Ti.UI.currentWindow.hide();
        // Close the window after the maximum timeout for a node save
        setTimeout(Ti.UI.currentWindow.close, 65000);
    }
}

Ti.App.addEventListener('loggingOut', loggingOutIndividualObject);
Ti.App.addEventListener("savedNode", savedNodeIndividualObject);

function form_min(min) {"use strict";
    if (min < 10) {
        return '0' + min;
    }
    return min;
}

var db = Omadi.utils.openMainDatabase();

//The view where the results are presented
var formWrapperView = Ti.UI.createView({
    top : '0',
    height : '100%',
    width : '100%',
    backgroundColor : '#EEEEEE'
});

curWin.add(formWrapperView);


if (Ti.App.isAndroid) {
    var scrollView = Ti.UI.createScrollView({
        contentHeight : 'auto',
        backgroundColor : '#EEEEEE',
        showHorizontalScrollIndicator : false,
        showVerticalScrollIndicator : true,
        opacity : 1,
        layout : 'vertical'
    });
}
else {
    var scrollView = Ti.UI.createScrollView({
        top : 45,
        contentHeight : 'auto',
        backgroundColor : '#EEEEEE',
        showHorizontalScrollIndicator : false,
        showVerticalScrollIndicator : true,
        opacity : 1,
        layout : 'vertical',
        bottom : '0'
    });
}

formWrapperView.add(scrollView);

//Populate array with field name and configs
var regions = {};
var unsorted_res = [];
var label = [];
var label_file = [];
var file_id = [];
var x = 0;
var content = [];
var border = [];
var cell = [];
var count = 0;
var file_upload_boolean = true;
var upload_boolean = true;
var data_boolean = true;
var heightValue = 60;
var height_label = 5;
var bug = [];
var node;

var fieldNames = [];

var node_form = db.execute('SELECT form_part, perm_edit FROM node WHERE nid=' + curWin.nid);
var isEditEnabled = (node_form.fieldByName('perm_edit') == 1) ? true : false;

omadi_session_details = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
roles = omadi_session_details.user.roles;

var result = db.execute('SELECT * FROM regions WHERE node_type = "' + curWin.type + '" ORDER BY weight ASC');

while (result.isValidRow()) {
    var reg_settings = result.fieldByName('settings');
    
    reg_settings = JSON.parse(reg_settings);
    

    if (reg_settings != null && parseInt(reg_settings.form_part, 10) > node_form.fieldByName('form_part')) {
        Ti.API.info('Region : ' + result.fieldByName('label') + ' won\'t appear');
    }
    else {
        var region_name = result.fieldByName('region_name');
        regions[region_name] = {};

        
        regions[region_name].label = result.fieldByName('label');
        regions[region_name].settings = result.fieldByName('settings');
        regions[region_name].fields = [];

       
    }
    result.next();
}

result.close();

var fields_result = db.execute('SELECT label, weight, type, field_name, widget, settings, required FROM fields WHERE bundle = "' + curWin.type + '" AND disabled = 0 ORDER BY weight ASC, id ASC');
var savedValues = [];

var instances = {};
var settings, i, j;

var omadi_session_details = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
var roles = omadi_session_details.user.roles;

while (fields_result.isValidRow()) {
    
    if (fields_result.fieldByName('type') == 'file') {
        unsorted_res.push({
            field_name : fields_result.fieldByName('field_name') + '___filename',
            label : fields_result.fieldByName('label'),
            type : fields_result.fieldByName('type'),
            settings : fields_result.fieldByName('settings'),
            widget : fields_result.fieldByName('widget'),
            required : fields_result.fieldByName('required')
        });
    }

    var field_desc = {
        label : fields_result.fieldByName('label'),
        type : fields_result.fieldByName('type'),
        field_name : fields_result.fieldByName('field_name'),
        settings : JSON.parse(fields_result.fieldByName('settings')),
        widget : JSON.parse(fields_result.fieldByName('widget')),
        required : fields_result.fieldByName('required')
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
                            var stringifyObj = JSON.stringify(settings.permissions[i]);
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

    instances[field_desc.field_name] = field_desc;

   

    for (region_name in regions) {
        if (regions.hasOwnProperty(region_name) && region_name == field_desc.settings.region) {
            regions[region_name].fields.push(field_desc);
        }
    }

   

    fields_result.next();
}

var results = db.execute('SELECT * FROM ' + curWin.type + ' WHERE  nid = ' + curWin.nid);

function displayLargeImage(e){"use strict";
    Omadi.display.displayLargeImage(e.source, curWin.nid, e.source.imageVal);
}

function openTelephone(e){"use strict";
    Ti.Platform.openURL('tel:' + e.source.number);                       
}

function openURL(e){"use strict";
    Ti.Platform.openURL(e.source.text);
}

function openEmailDialog(e){"use strict";
    var emailDialog = Titanium.UI.createEmailDialog();
    emailDialog.subject = node.title;
    emailDialog.toRecipients = [e.source.text];
    emailDialog.open();
}

function openOmadiReferenceWindow(e){"use strict";
    Omadi.display.openViewWindow(e.source.type, e.source.nid);
}

function openFileViewer(e){"use strict";
    Omadi.display.displayFile(curWin.nid, e.source.dbValue, e.source.textValue);
}

function getDrivingDirectionsView(e){"use strict";
    var address = e.source.text.replace("\n", ' ');
    Omadi.display.getDrivingDirectionsTo(address);                                   
}

function doFieldOutput(fieldObj) {"use strict";
    /*global getCalculationTableView*/
    var i, rowView, valueView, valueLabel, labelView, labelLabel, fieldIsHidden, tableView, fileId, 
        contentImage, field_parts, part, contentWidth, dotIndex, extension, imagePath, degrees, transform,
        animation, rotateDegrees;
    
    
    if ( typeof node[fieldObj.field_name] !== 'undefined') {
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
                    tableView = Omadi.widgets.calculation_field.getTableView(node, fieldObj);
    
                    if (tableView.singleValue) {
                        valueView.add(tableView);
                        rowView.add(labelView);
                        rowView.add(valueView);
                    }
                    else {
                      
                        scrollView.add(tableView);
                    }
                }
                else {
                    fieldIsHidden = true;
                }
            }
            else if (fieldObj.type === 'rules_field') {
                rowView.add(labelView);
                
                valueView = Omadi.widgets.rules_field.getNewElement(node, fieldObj);
                valueView.setWidth("59%");
                valueView.setRight(0);
                
                rowView.add(valueView);
                    
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
    
                    for ( i = 0; i < node[fieldObj.field_name].dbValues.length; i += 1) {
    
                        if (node[fieldObj.field_name].dbValues[i] > 0) {
                            fileId = node[fieldObj.field_name].dbValues[i];
                            contentImage = Ti.UI.createImageView({
                                height : 100,
                                width : 100,
                                left : 10,
                                top : 0,
                                image : '/images/photo-loading.png',
                                autorotate: true,
                                borderColor : '#333',
                                borderWidth : 2,
                                imageVal : fileId,
                                bigImg : null
                            });
    
                            contentImage.addEventListener('click', displayLargeImage);
                            
                            valueView.add(contentImage);
                            Omadi.display.setImageViewThumbnail(contentImage, node.nid, fileId);
                            contentWidth += 110;
                        }
                    }
    
                    for ( i = 0; i < node[fieldObj.field_name].imageData.length; i += 1) {
    
                        if (node[fieldObj.field_name].imageData[i] > "") {
                            fileId = node[fieldObj.field_name].dbValues[i];
                            
                            
                            imagePath = node[fieldObj.field_name].imageData[i];
                            
                            //alert(imagePath);
                            
                            degrees = node[fieldObj.field_name].degrees[i];
                            
                            contentImage = Ti.UI.createImageView({
                                height : 100,
                                width : 100,
                                left : 10,
                                top : 0,
                                image : imagePath,
                                autorotate: true,
                                borderColor : '#333',
                                borderWidth : 2,
                                bigImg : imagePath,
                                isImage : true
                            });
                            
                            // if(Ti.App.isAndroid && degrees > 0){
                                // transform = Ti.UI.create2DMatrix();
                                // animation = Ti.UI.createAnimation();
//                                 
                                // rotateDegrees = degrees;
                                // if(rotateDegrees == 270){
                                    // rotateDegrees = 90;
                                // }
                                // else if(rotateDegrees == 90){
                                    // rotateDegrees = 270;
                                // }
//                                 
                                // transform = transform.rotate(rotateDegrees);
                                // animation.transform = transform;
                                // animation.duration = 1;
//                                 
                                // contentImage.animate(animation);
                            // }
    
                            //contentImage.addEventListener('click', displayLargeImage);
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
                    
                    scrollView.add(labelView);
                }
                else {
    
                    fieldIsHidden = false;
    
                    for ( i = 0; i < node[fieldObj.field_name].textValues.length; i += 1) {
    
                        valueLabel = Ti.UI.createLabel({
                            text : node[fieldObj.field_name].textValues[i],
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
                                if(node[fieldObj.field_name].textValues[i] != null){
                                    valueLabel.number = node[fieldObj.field_name].textValues[i].replace(/\D/g, '');
                                }
                                valueLabel.addEventListener('click', openTelephone);
                                break;
    
                            case 'link_field':
    
                                valueLabel.color = '#369';
                                valueLabel.addEventListener('click', openURL);
                                break;
    
                            case 'email':
                                valueLabel.color = '#369';
                                valueLabel.addEventListener('click', openEmailDialog);
                                break;
                                
                            case 'file':
                                
                                valueLabel.height = 40;
                                valueLabel.dbValue = node[fieldObj.field_name].dbValues[i];
                                valueLabel.textValue = node[fieldObj.field_name].textValues[i];
                                
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
    
                                if ( typeof node[fieldObj.field_name].nodeTypes[i] !== 'undefined') {
                                    valueLabel.color = '#369';
                                    valueLabel.type = node[fieldObj.field_name].nodeTypes[i];
                                    valueLabel.nid = node[fieldObj.field_name].dbValues[i];
    
                                    valueLabel.addEventListener('click', openOmadiReferenceWindow);
                                }
    
                                break;
    
                            case 'location':
    
                                field_parts = fieldObj.field_name.split("___");
                                //var part;
                                valueLabel.text = "";
                                //node[field_parts[0]].dbValues.join(', ');
                              
    
                                if (node[field_parts[0]].parts.street.textValue > "") {
                                    valueLabel.text += node[field_parts[0]].parts.street.textValue;
                                }
                                if (valueLabel.text > "") {
                                    valueLabel.text += "\n";
                                }
                                if (node[field_parts[0]].parts.city.textValue > "") {
                                    valueLabel.text += node[field_parts[0]].parts.city.textValue;
                                }
    
                                if (node[field_parts[0]].parts.province.textValue > "") {
                                    if (node[field_parts[0]].parts.city.textValue > "") {
                                        valueLabel.text += ', ';
                                    }
                                    valueLabel.text += node[field_parts[0]].parts.province.textValue;
                                }
    
                                if (node[field_parts[0]].parts.postal_code.textValue > "") {
                                    valueLabel.text += " " + node[field_parts[0]].parts.postal_code.textValue;
                                }
                                
                                // Only show an address with sufficient length to get anywhere
                                if(valueLabel.text.length > 8){
                                    
                                    valueLabel.addEventListener('click', getDrivingDirectionsView);
                                }
    
                                break;
    
                            case 'vehicle_fields':
    
                                field_parts = fieldObj.field_name.split("___");
                                valueLabel.text = node[field_parts[0]].parts.make.textValue + " " + node[field_parts[0]].parts.model.textValue;
                                break;
    
                            case 'license_plate':
    
                                field_parts = fieldObj.field_name.split("___");
                                valueLabel.text = "(" + node[field_parts[0]].parts.state.textValue + ") " + node[field_parts[0]].parts.plate.textValue;
                                break;
                        }
    
                        valueView.add(valueLabel);
                    }
                    
                    rowView.add(labelView);
                    rowView.add(valueView);
                }
            }
            
            if(!fieldIsHidden){
                scrollView.add(rowView);
            }
        }
    }
    else {
        Ti.API.error(fieldObj.field_name + " not found in node!");
    }
}

function doRegionOutput(regionObj) {"use strict";
    var i, partsFieldsDone = {}, field_name, field_parts;

    scrollView.add(Ti.UI.createLabel({
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
        wordWrap : false
    }));

    if ( typeof regionObj.fields !== 'undefined') {
      

        for ( i = 0; i < regionObj.fields.length; i += 1) {
        
            field_name = regionObj.fields[i].field_name;
            if (field_name.indexOf("___") !== -1) {
                field_parts = field_name.split("___");
                if ( typeof partsFieldsDone[field_parts[0]] === 'undefined') {
                    doFieldOutput(regionObj.fields[i]);
                    partsFieldsDone[field_parts[0]] = true;
                }
            }
            else {
                doFieldOutput(regionObj.fields[i]);
            }
        }
    }
}

( function() {"use strict";
        /*jslint vars: true */

        node = Omadi.data.nodeLoad(curWin.nid);

        var regionName;

        for (regionName in regions) {
            if (regions.hasOwnProperty(regionName)) {
                doRegionOutput(regions[regionName]);
            }
        }

        scrollView.add(Ti.UI.createLabel({
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

        var db = Omadi.utils.openMainDatabase();
        var result = db.execute("SELECT realname, uid FROM user WHERE uid IN (" + node.author_uid + "," + node.changed_uid + ")");
        var usernames = [];

        while (result.isValidRow()) {
            usernames[result.fieldByName("uid")] = result.fieldByName("realname");
            result.next();
        }
        result.close();
        db.close();

        var metaDataFields = [];

        metaDataFields.push({
            type : 'metadata',
            label : 'Created By',
            field_name : 'author_uid',
            textValue : usernames[node.author_uid],
            can_view: true
        });
        metaDataFields.push({
            type : 'metadata',
            label : 'Created Time',
            field_name : 'created',
            textValue : Omadi.utils.formatDate(node.created, true),
            can_view: true
        });

        if (node.created !== node.changed) {
            metaDataFields.push({
                type : 'metadata',
                label : 'Last Updated By',
                field_name : 'author_uid',
                textValue : usernames[node.author_uid],
                can_view: true
            });
            metaDataFields.push({
                type : 'metadata',
                label : 'Last Updated Time',
                field_name : 'changed',
                textValue : Omadi.utils.formatDate(node.changed, true),
                can_view: true
            });
        }

        var i;
        for ( i = 0; i < metaDataFields.length; i++) {
            doFieldOutput(metaDataFields[i]);
        }
        
        Ti.UI.currentWindow.addEventListener('close', function(){
            Ti.App.removeEventListener('loggingOut', loggingOutIndividualObject);
            Ti.App.removeEventListener("savedNode", savedNodeIndividualObject);
            
            // Clean up memory in the window
            Ti.UI.currentWindow.remove(formWrapperView);
            formWrapperView = null; 
        });

    }());


var androidMenuItemData = [];

function openAndroidMenuItem(e){"use strict";
    var itemIndex, itemData;
    
    itemIndex = e.source.getOrder();
    itemData = androidMenuItemData[itemIndex];
    
    Omadi.display.openFormWindow(itemData.type, itemData.nid, itemData.form_part);
}

if (Ti.App.isAndroid) {
    var activity = curWin.activity;
    activity.onCreateOptionsMenu = function(e) {"use strict";
        var db, result, bundle, menu_zero, form_part, menu_edit, customCopy, to_type, to_bundle, order;
        
        order = 0;
        bundle = Omadi.data.getBundle(curWin.type);
            
        if(isEditEnabled == true){
            
            db = Omadi.utils.openMainDatabase();

            result = db.execute('SELECT form_part FROM node WHERE nid=' + curWin.nid);
            form_part = result.fieldByName('form_part', Ti.Database.FIELD_TYPE_INT);
            
            result.close();
            db.close();
        
            if (bundle.data.form_parts != null && bundle.data.form_parts != "" && (bundle.data.form_parts.parts.length >= form_part + 2)) {
    
                menu_zero = e.menu.add({
                    title : bundle.data.form_parts.parts[form_part + 1].label,
                    order : order
                });
                
                androidMenuItemData[order] = {
                    type: curWin.type,
                    nid: curWin.nid,
                    form_part: form_part + 1  
                };
    
                menu_zero.setIcon("/images/drop.png");
                menu_zero.addEventListener("click", openAndroidMenuItem);
                
                order++;
            }
    
            menu_edit = e.menu.add({
                title : 'Edit',
                order : order
            });
            
            androidMenuItemData[order] = {
                type: curWin.type,
                nid: curWin.nid,
                form_part: form_part
            };
            
            menu_edit.setIcon("/images/edit.png");
            menu_edit.addEventListener("click", openAndroidMenuItem);
            
            order++;
        }
        
        if(typeof bundle.data.custom_copy !== 'undefined'){
            for(to_type in bundle.data.custom_copy){
                if(bundle.data.custom_copy.hasOwnProperty(to_type)){
                    to_bundle = Omadi.data.getBundle(to_type);
                    if(to_bundle && to_bundle.can_create == 1){
                        customCopy = e.menu.add({
                            title : "Copy to " + to_bundle.label,
                            order : order
                        });
                        customCopy.setIcon(Omadi.display.getNodeTypeImagePath(to_type));
                        
                        androidMenuItemData[order] = {
                            type: curWin.type,
                            nid: curWin.nid,
                            form_part: to_type 
                        };
            
                        customCopy.addEventListener("click", openAndroidMenuItem);
                        
                        order ++;
                    }
                }
            }
        }
    };
}

results.close();
fields_result.close();
db.close();

if (Ti.App.isIOS) {
    iOSActionMenu(curWin);
}

function iOSActionMenu(actualWindow) {"use strict";
    var back, space, label, edit, arr, toolbar;
    
    back = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });
    back.addEventListener('click', function() {
        actualWindow.close();
    });

    space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    
    label = Titanium.UI.createButton({
        title : curWin.nameSelected,
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

    edit.addEventListener('click', function() {
        var db, result, bundle, btn_tt, btn_id, form_part, postDialog, to_type, to_bundle;
        
        bundle = Omadi.data.getBundle(curWin.type);
        
        db = Omadi.utils.openMainDatabase();
        result = db.execute('SELECT form_part FROM node WHERE nid=' + curWin.nid);
        form_part = result.fieldByName('form_part', Ti.Database.FIELD_TYPE_INT);
        result.close();
        db.close();


        btn_tt = [];
        btn_id = [];
        
        if (bundle.data.form_parts != null && bundle.data.form_parts != "") {

            if (bundle.data.form_parts.parts.length >= form_part + 2) {
               
                btn_tt.push(bundle.data.form_parts.parts[form_part + 1].label);
                btn_id.push(form_part + 1);
            }
        }

        btn_tt.push('Edit');
        btn_id.push(form_part);


        if(typeof bundle.data.custom_copy !== 'undefined'){
            for(to_type in bundle.data.custom_copy){
                if(bundle.data.custom_copy.hasOwnProperty(to_type)){
                    to_bundle = Omadi.data.getBundle(to_type);
                    if(to_bundle){
                        btn_tt.push("Copy to " + to_bundle.label);
                        btn_id.push(to_type);
                    }
                }
            }
        }
        

        btn_tt.push('Cancel');

        postDialog = Titanium.UI.createOptionDialog();
        postDialog.options = btn_tt;
        postDialog.show();

        postDialog.addEventListener('click', function(ev) {
            if (ev.index == btn_tt.length - 1) {
                Ti.API.info("Fix this logic");
            }
            else if (ev.index != -1) {
                Omadi.display.openFormWindow(curWin.type, curWin.nid, btn_id[ev.index]);
            }
        });

    });

    //Check is node editable or not
    arr = (isEditEnabled == true) ? [back, space, label, space, edit] : ((Ti.Platform.osname == 'ipad') ? [back, space, label, space] : [back, label, space]);

    // create and add toolbar
    toolbar = Ti.UI.iOS.createToolbar({
        items : arr,
        top : 0,
        borderTop : false,
        borderBottom : true
    });
    curWin.add(toolbar);

}

