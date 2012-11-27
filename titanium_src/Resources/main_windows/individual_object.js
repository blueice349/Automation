Ti.include('/lib/functions.js');
Ti.include('/lib/encoder_base_64.js');
Ti.include('/main_windows/create_or_edit_node.js');
Ti.include('/lib/display_functions.js');

/*jslint eqeq:true, plusplus: true*/

var domainName = Ti.App.Properties.getString("domainName");

//Current window's instance
var curWin = Ti.UI.currentWindow;

Omadi.service.setNodeViewed(curWin.nid);

curWin.backgroundColor = "#EEEEEE";
//Sets only portrait mode
curWin.orientationModes = [Titanium.UI.PORTRAIT];
var movement = curWin.movement;

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
curWin.addEventListener('android:back', function() {"use strict";
    Ti.API.info("Back to the step before");
    curWin.close();
});

function form_min(min) {"use strict";
    if (min < 10) {
        return '0' + min;
    }
    return min;
}

var db = Omadi.utils.openMainDatabase();

//The view where the results are presented
var resultView = Ti.UI.createView({
    top : '0',
    height : '100%',
    width : '100%',
    backgroundColor : '#EEEEEE'
});

curWin.add(resultView);

//Header where the selected name is presented
// var header = Ti.UI.createView({
// top: '0',
// height: '35',
// width: '100%',
// backgroundColor: '#585858',
// zIndex: 11
// });
// resultView.add(header);
//
// //Label containing the selected name
// var labelNameContent = Ti.UI.createLabel({
// text: curWin.nameSelected,
// height: 'auto',
// width:  '90%',
// font: {fontSize: 18,  fontWeight: "bold"},
// color: '#000',
// textAlign: 'center',
// touchEnabled: false,
// ellipsize: true,
// wordWrap: false
// });
//
// header.add(labelNameContent);

if (PLATFORM == 'android') {
    var viewContent = Ti.UI.createScrollView({
        contentHeight : 'auto',
        backgroundColor : '#EEEEEE',
        showHorizontalScrollIndicator : false,
        showVerticalScrollIndicator : true,
        opacity : 1,
        layout : 'vertical'
    });
}
else {
    var viewContent = Ti.UI.createScrollView({
        top : "45dp",
        contentHeight : 'auto',
        backgroundColor : '#EEEEEE',
        showHorizontalScrollIndicator : false,
        showVerticalScrollIndicator : true,
        opacity : 1,
        layout : 'vertical',
        bottom : '0'
    });
}

resultView.add(viewContent);

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
    var reg_settings = JSON.parse(result.fieldByName('settings'));

    if (reg_settings != null && parseInt(reg_settings.form_part, 10) > node_form.fieldByName('form_part')) {
        Ti.API.info('Region : ' + result.fieldByName('label') + ' won\'t appear');
    }
    else {
        var region_name = result.fieldByName('region_name');
        regions[region_name] = {};

        //Display region title:
        regions[region_name].label = result.fieldByName('label');
        regions[region_name].settings = result.fieldByName('settings');
        regions[region_name].fields = [];

        //Ti.API.info(' Region_name: ' + result.fieldByName('region_name'));
        //Ti.API.info(' Weight: ' + result.fieldByName('weight'));

        //Organizing every field into result:
        //while (regions_result.isValidRow()){
        // var i;
        // for(i in unsorted_res) {
        //
        // var settings = JSON.parse(unsorted_res[i].settings);
        // Ti.API.info('Field region = ' + settings.region);
        // if(result.fieldByName('region_name') == settings.region) {
        // //Ti.API.info('result match! ');
        // Ti.API.info('Field label: ' + unsorted_res[i].label);
        // Ti.API.info('Field type: ' + unsorted_res[i].type);
        // //Ti.API.info('Field name: ' + unsorted_res[i].field_name);
        //
        // //Ti.API.info('Field settings: ' + unsorted_res[i].settings);
        // //Ti.API.info('Field widget: ' + unsorted_res[i].widget);
        //
        // regions[unsorted_res[i].field_name] = new Array();
        //
        // //Display region title:
        // regions[unsorted_res[i].field_name]['label'] = unsorted_res[i].label;
        // regions[unsorted_res[i].field_name]['type'] = unsorted_res[i].type;
        // regions[unsorted_res[i].field_name]['settings'] = unsorted_res[i].settings;
        // regions[unsorted_res[i].field_name]['widget'] = unsorted_res[i].widget;
        // regions[unsorted_res[i].field_name]['field_name'] = unsorted_res[i].field_name;
        // regions[unsorted_res[i].field_name]['required'] = unsorted_res[i].required;
        // } else {
        // Ti.API.info(' result dont match! ');
        //
        // }
        // }
    }
    result.next();
}

result.close();

var fields_result = db.execute('SELECT label, weight, type, field_name, widget, settings, required FROM fields WHERE bundle = "' + curWin.type + '" ORDER BY weight ASC, id ASC');
var savedValues = [];

var instances = {};

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

    instances[field_desc.field_name] = field_desc;

    Ti.API.info(field_desc.field_name);
    //Ti.API.info(field_desc.settings.region);

    for (region_name in regions) {
        if (regions.hasOwnProperty(region_name) && region_name == field_desc.settings.region) {
            regions[region_name].fields.push(field_desc);
        }
    }

    // if(fields_result.fieldByName('type') == 'file'){
    // unsorted_res.push({
    // field_name :fields_result.fieldByName('field_name')+'___fid',
    // label : fields_result.fieldByName('label'),
    // type : fields_result.fieldByName('type'),
    // settings : fields_result.fieldByName('settings'),
    // widget : fields_result.fieldByName('widget'),
    // required : fields_result.fieldByName('required'),
    // });
    // }
    //unsorted_res.push(field_desc);

    fields_result.next();
}

var results = db.execute('SELECT * FROM ' + curWin.type + ' WHERE  nid = ' + curWin.nid);



function doFieldOutput(fieldObj) {"use strict";
    /*global getCalculationTableView*/
    var i, rowView, valueView, valueLabel, labelView, labelLabel, fieldIsHidden, tableView, fileId, contentImage, field_parts, part;

    if ( typeof node[fieldObj.field_name] !== 'undefined') {
        rowView = Ti.UI.createView({
            width : '100%',
            top : 0,
            height : Ti.UI.SIZE,
            borderWidth : '1dp',
            borderColor : '#ccc'
        });

        labelView = Ti.UI.createView({
            width : "40%",
            height : '40dp',
            top : 0,
            left : 0,
            backgroundColor : '#ddd'
            // backgroundGradient: {
            // type: 'linear',
            // startPoint: { x: '50%', y: '0%' },
            // endPoint: { x: '50%', y: '100%' },
            // colors: [ { color: '#bbb', offset: 0.0}, { color: '#ddd', offset: 1.0 } ]
            // }
        });

        labelLabel = Ti.UI.createLabel({
            text : fieldObj.label,
            right : '5dp',
            top : '10dp',
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            font : {
                fontSize : '16dp',
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

            if (fieldObj.settings.hidden === null || fieldObj.settings.hidden == 0) {
                tableView = getCalculationTableView(node, fieldObj);

                if (tableView.singleValue) {
                    valueView.add(tableView);
                    rowView.add(labelView);
                    rowView.add(valueView);
                }
                else {
                    //labelView.width = '100%';
                    //labelLabel.setTextAlign(Ti.UI.TEXT_ALIGNMENT_CENTER);
                    //labelLabel.setWidth('100%');
                    //labelView.height = '25dp';
                    //labelLabel.top = '2dp';

                    //viewContent.add(labelView);
                    viewContent.add(tableView);
                }
            }
            else {
                fieldIsHidden = true;
            }
        }
        else if (fieldObj.type == 'metadata') {
            valueLabel = Ti.UI.createLabel({
                text : fieldObj.textValue,
                textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                wordWrap : true,
                height : Ti.UI.SIZE,
                width : '100%',
                font : {
                    fontSize : '14dp'
                },
                left : '5dp',
                color : '#666'
            });

            labelView.height = Ti.UI.SIZE;
            labelLabel.top = 0;
            labelLabel.color = '#666';
            labelLabel.font = {
                fontSize : '14dp',
                fontWeight : 'bold'
            };

            valueView.add(valueLabel);
            rowView.add(labelView);
            rowView.add(valueView);
        }
        else {

            if (fieldObj.type === 'image') {
                valueView = Ti.UI.createScrollView({
                    contentWidth : 'auto',
                    contentHeight : 100,
                    arrImages : null,
                    scrollType : "horizontal",
                    layout : 'horizontal',
                    right : 0,
                    width : '60%',
                    height : 100
                });

                for ( i = 0; i < node[fieldObj.field_name].values.length; i += 1) {

                    if (node[fieldObj.field_name].values[i] > 0) {
                        fileId = node[fieldObj.field_name].values[i];
                        contentImage = Ti.UI.createImageView({
                            height : 100,
                            width : 100,
                            left : 0,
                            top : 0,
                            image : '../images/photo-loading.png',
                            borderColor : '#333',
                            borderWidth : '2dp',
                            imageVal : fileId,
                            bigImg : null
                        });

                        contentImage.addEventListener('click', function(e) {
                            Omadi.display.displayLargeImage(e.source, curWin.nid, e.source.imageVal);
                        });
                        valueView.add(contentImage);
                        Omadi.display.setImageViewThumbnail(contentImage, node.nid, fileId);

                    }
                }

                for ( i = 0; i < node[fieldObj.field_name].imageData.length; i += 1) {

                    if (node[fieldObj.field_name].imageData[i] > "") {
                        fileId = node[fieldObj.field_name].values[i];
                        contentImage = Ti.UI.createImageView({
                            height : 100,
                            width : 100,
                            left : 0,
                            top : 0,
                            image : node[fieldObj.field_name].imageData[i],
                            borderColor : '#333',
                            borderWidth : '2dp',
                            bigImg : node[fieldObj.field_name].imageData[i],
                            isImage : true
                        });

                        contentImage.addEventListener('click', function(e) {
                            // //Following method will open camera to capture the image.
                            Omadi.display.displayLargeImage(e.source, curWin.nid, e.source.imageVal);
                        });
                        valueView.add(contentImage);
                    }
                }

                if (valueView.getChildren().length === 0) {
                    valueView.height = 0;
                }
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
                            fontSize : '16dp'
                        },
                        left : '5dp',
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
                            valueLabel.number = node[fieldObj.field_name].textValues[i].replace(/\D/g, '');
                            valueLabel.addEventListener('click', function(e) {
                                //highlightMe(e.source.id);
                                Titanium.Platform.openURL('tel:' + e.source.number);
                            });
                            break;

                        case 'link_field':

                            valueLabel.color = '#369';
                            valueLabel.addEventListener('click', function(e) {
                                Titanium.Platform.openURL(e.source.text);
                            });
                            break;

                        case 'email':
                            valueLabel.color = '#369';
                            valueLabel.addEventListener('click', function(e) {
                                var emailDialog = Titanium.UI.createEmailDialog();
                                emailDialog.subject = node.title;
                                emailDialog.toRecipients = [e.source.text];
                                emailDialog.open();
                            });
                            break;

                        case 'omadi_reference':

                            if ( typeof node[fieldObj.field_name].nodeTypes[i] !== 'undefined') {
                                valueLabel.color = '#369';
                                valueLabel.type = node[fieldObj.field_name].nodeTypes[i];
                                valueLabel.nid = node[fieldObj.field_name].values[i];

                                valueLabel.addEventListener('click', function(e) {
                                    var newWin = Ti.UI.createWindow({
                                        fullscreen : false,
                                        navBarHidden : true,
                                        title : e.source.text,
                                        url : "individual_object.js",
                                        type : e.source.type,
                                        nid : e.source.nid
                                    });

                                    newWin.open();
                                });
                            }

                            break;

                        case 'location':

                            field_parts = fieldObj.field_name.split("___");
                            //var part;
                            valueLabel.text = "";
                            //node[field_parts[0]].values.join(', ');
                          

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

                            break;

                        case 'vehicle_fields':

                            field_parts = fieldObj.field_name.split("___");
                            valueLabel.text = node[field_parts[0]].parts.make.textValue + " " + node[field_parts[0]].parts.model.textValue;

                            break;

                        case 'license_plate':

                            field_parts = fieldObj.field_name.split("___");
                            valueLabel.text = "(" + node[field_parts[0]].parts.state.textValue + ") " + node[field_parts[0]].parts.plate.textValue;

                            break;

                        // case 'rules_field':
                        //
                        // if (c_content[count] != false && c_content[count] != "false" && c_content[count] != 0 && JSON.parse(c_content[count]).length > 0) {
                        // label[count] = Ti.UI.createLabel({
                        // text : c_label[count],
                        // width : "100%",
                        // textAlign : 'left',
                        // left : 5,
                        // touchEnabled : false,
                        // field : true,
                        // top : 0,
                        // height : 40,
                        // wordWrap : false,
                        // ellipsize : true
                        // });
                        // content[count] = Ti.UI.createView({
                        // width : Ti.Platform.displayCaps.platformWidth - 30,
                        // field_type : c_type[count],
                        // field_name : c_field_name[count],
                        // cardinality : settings.cardinality,
                        // reffer_index : count,
                        // settings : settings,
                        // value : JSON.parse(c_content[count]),
                        // layout : 'vertical',
                        // widget : JSON.parse(c_widget[count])
                        // });
                        // count++;
                        // }
                        // break;

                    }

                    valueView.add(valueLabel);
                }
            }

            rowView.add(labelView);
            rowView.add(valueView);
        }

        viewContent.add(rowView);
    }
    else {
        Ti.API.error(fieldObj.field_name + " not found in node!");
    }
}

function doRegionOutput(regionObj) {"use strict";
    var i, partsFieldsDone = {}, field_name, field_parts;

    viewContent.add(Ti.UI.createLabel({
        text : regionObj.label.toUpperCase(),
        color : '#ddd',
        font : {
            fontSize : '20dp',
            fontWeight : 'bold'
        },
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        width : '100%',
        touchEnabled : false,
        height : '40dp',
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
        // Ti.API.info(regionObj.fields.length);
        // for(i in regionObj.fields){
        // Ti.API.info(i);
        // }
        

        for ( i = 0; i < regionObj.fields.length; i += 1) {
            //Ti.API.info(regionObj.fields[i].field_name + " is here baby: " + i);
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


        node = loadNode(curWin.nid);

        Ti.API.debug("node: " + curWin.nid);
        Ti.API.debug(node.author_uid);

        var regionName;

        for (regionName in regions) {
            if (regions.hasOwnProperty(regionName)) {
                doRegionOutput(regions[regionName]);
            }
        }

        viewContent.add(Ti.UI.createLabel({
            text : 'METADATA',
            color : '#ddd',
            font : {
                fontSize : '16dp',
                fontWeight : 'bold'
            },
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
            width : '100%',
            touchEnabled : false,
            height : '25dp',
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
            textValue : usernames[node.author_uid]
        });
        metaDataFields.push({
            type : 'metadata',
            label : 'Created Time',
            field_name : 'created',
            textValue : Omadi.utils.formatDate(node.created, true)
        });

        if (node.created !== node.changed) {
            metaDataFields.push({
                type : 'metadata',
                label : 'Last Updated By',
                field_name : 'author_uid',
                textValue : usernames[node.author_uid]
            });
            metaDataFields.push({
                type : 'metadata',
                label : 'Last Updated Time',
                field_name : 'changed',
                textValue : Omadi.utils.formatDate(node.changed, true)
            });
        }

        var i;
        for ( i = 0; i < metaDataFields.length; i++) {
            doFieldOutput(metaDataFields[i]);
        }

    }());

// function thisNeedsToBeDoneAwayWith() {
// if (true) {
// var c_type = [];
// var c_label = [];
// var c_content = [];
// var c_settings = [];
// var c_widget = [];
// var c_field_name = [];
// var is_array = false;
// var field_definer = 0;
// var show_region = new Array();
//
// var f_name_f;
// for (f_name_f in fields ) {
// var fieldVal = null;
// try {
// //Check is coloum exist in table or not
// fieldVal = results.fieldByName(f_name_f);
//
// } catch(e) {
// if (fields[f_name_f]['type'] != 'region_separator_mode') {
// Ti.API.info(" !!!!!!!!!!   >>>>>>>>ERROR<<<<<<<<< !!!!!!!!!!! " + e + " - Error found, there is no such column " + f_name_f);
// Ti.API.info(fields[f_name_f]['type']);
// continue;
// }
// }
//
// if ((fieldVal != null && fieldVal != "") || (fields[f_name_f]['type'] == 'region_separator_mode') || (fields[f_name_f]['type'] == 'image') || (fields[f_name_f]['type'] == 'calculation_field')) {
//
// //fields from Fields table that match with current object
// c_type[count] = fields[f_name_f]['type'];
// c_label[count] = fields[f_name_f]['label'];
// c_settings[count] = fields[f_name_f]['settings'];
// c_widget[count] = fields[f_name_f]['widget'];
// c_field_name[count] = fields[f_name_f]['field_name'];
//
// if (c_settings[count] != null && c_settings[count] != "" && c_settings[count] != 'null' && c_type[count] != 'region_separator_mode') {
// var can_view = false;
// var per_settings = JSON.parse(c_settings[count]);
// if (per_settings['enforce_permissions'] != null && per_settings['enforce_permissions'] == 1) {
// var _l;
// for (_l in per_settings.permissions) {
// for (_k in roles) {
// if (_l == _k) {
// var stringifyObj = JSON.stringify(per_settings.permissions[_l]);
// if (stringifyObj.indexOf('view') >= 0 || per_settings.permissions[_l]["all_permissions"]) {
// can_view = true;
// }
//
// }
// }
// }
// } else {
//
// can_view = true;
// }
//
// if (!can_view) {
// continue;
// }
// }
//
// //Content
// c_content[count] = fieldVal;
// var node_table = db.execute('SELECT * FROM node WHERE nid=' + curWin.nid);
// if (node_table.rowCount > 0) {
// var no_data_fields = node_table.fieldByName('no_data_fields');
// if (isJsonString()) {
// no_data_fields = JSON.parse(no_data_fields);
// var key;
// for (key in no_data_fields) {
// if (no_data_fields.hasOwnProperty(key)) {
// no_data_fieldsArr.push(key);
// }
// }
// } else {
// no_data_fieldsArr.push(key);
// }
// }
//
// if (in_array(c_field_name[count], no_data_fieldsArr) && c_settings[count].required_no_data_checkbox != null && c_settings[count].required_no_data_checkbox == 1) {
// if (fields[f_name_f]['required']) {
// c_content[count] = 'No Data'
// } else {
// c_content[count] = 'Not Applicable'
// }
//
// }
// var loop_times = 1;
// is_array = false;
// //Check if it is an array, token = 7411317618171051229
// // if (((c_content[count] == 7411317618171051229) || (c_content[count] == '7411317618171051229')) && c_type[count] != 'image' && c_type[count] != 'user_reference') {
// // //var array_cont = db.execute('SELECT encoded_array FROM array_base WHERE node_id = '+curWin.nid+' AND field_name = \''+f_name_f+'\' ');
// // var array_cont = db.execute('SELECT encoded_array,field_name FROM array_base WHERE node_id = ' + curWin.nid + ' AND field_name = \'' + f_name_f + '\'  ');
// //
// // Ti.API.info(array_cont.rowCount);
// // Ti.API.info('SELECT encoded_array,field_name FROM array_base WHERE node_id = ' + curWin.nid + ' AND field_name = \'' + f_name_f + '\' ');
// //
// // while (array_cont.isValidRow()) {
// // var decoded = array_cont.fieldByName('encoded_array');
// // var field_name = array_cont.fieldByName('field_name');
// //
// // Ti.API.info('-------------------------------------------------------------------------------------->>>> Decoded array is equals to: ' + decoded);
// // if (decoded != null && decoded != 'undefined' && decoded != '') {
// // //Decode the stored array:
// // decoded = Base64.decode(decoded);
// // Ti.API.info('1-------------------------------------------------------------------------------------->>>> Decoded array is equals to: ' + decoded);
// // }
// // array_cont.next();
// // }
// // decoded = decoded.toString();
// // // Token that splits each element contained into the array: 'j8Oc2s1E'
// // var decoded_values = decoded.split("j8Oc2s1E");
// // loop_times = decoded_values.length;
// // is_array = true;
// // keep_type = c_type[count];
// // keep_label = c_label[count];
// // keep_sett = c_settings[count];
// // keep_widget = c_widget[count];
// // keep_name = c_field_name[count];
// //
// // //Test echo
// // //for(var tili in decoded_values) {
// // //Ti.API.info(tili + ' value is equals to: ' + decoded_values[tili]);
// // //}
// // }
//
// while (loop_times >= 1) {
// if (is_array) {
// c_content[count] = decoded_values[loop_times - 1];
// c_type[count] = keep_type;
// c_label[count] = keep_label;
// c_settings[count] = keep_sett;
// c_widget[count] = keep_widget;
// c_field_name[count] = keep_name;
//
// Ti.API.info('For type: ' + c_type[count] + ' is associated ' + c_content[count] + 'having label' + c_label[count]);
// }
//
// loop_times--;
//
// if (c_type[count] != 'region_separator_mode' && c_type[count] != 'calculation_field') {
// if (((c_content[count] == "") || (c_content[count] == "null") || (c_content[count] == null) )) {
// continue;
// }
// }
//
// //Treat regions
// if ((c_settings[count] != null) && (c_settings[count] != 'null') && (c_settings[count] != undefined) && (c_settings[count] != 'undefined') && (c_settings[count] != '')) {
// Ti.API.info('Settings: ' + c_settings[count]);
// var settings = JSON.parse(c_settings[count]);
// if (show_region[settings.region]) {
// show_region[settings.region] = true;
// Ti.API.info('Region added : ' + settings.region);
// } else {
// show_region[settings.region] = new Array();
// }
// }
//
// Ti.API.info('**FIELD: ' + c_type[count] + ' VALUE: ' + c_content[count]);
//
// switch(c_type[count]) {
// //Treatment follows the same for text or text_long
// // case 'text':
// // case 'location':
// // case 'text_long':
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "33%",
// // left : 5,
// // textAlign : 'left',
// // touchEnabled : false,
// // field : true
// // });
// // if (c_type[count] == 'location') {
// // var locVal = c_field_name[count];
// // locVal = (locVal.lastIndexOf('___') != -1) ? locVal.substr(locVal.lastIndexOf('___') + 3, locVal.length) : '';
// // locVal = (locVal != '') ? locVal.charAt(0).toUpperCase() + locVal.slice(1) : ''
// // label[count].text = c_label[count] + " " + locVal;
// // }
// //
// // var openDescWin = false;
// // var aux_text_desc = c_content[count];
// //
// // if (c_content[count].length > 45) {
// // c_content[count] = c_content[count].substring(0, 45);
// // c_content[count] = c_content[count] + "...";
// // openDescWin = true;
// // }
// //
// // content[count] = Ti.UI.createLabel({
// // text : "" + c_content[count],
// // width : "60%",
// // height : "100%",
// // textAlign : 'left',
// // left : "40%",
// // id : count,
// // open : openDescWin,
// // w_content : aux_text_desc
// // });
// //
// // content[count].addEventListener('click', function(e) {
// // highlightMe(e.source.id);
// // if (e.source.open) {
// // openBigText(e.source.w_content);
// // }
// // });
// // count++;
// // break;
// //
// // //Phone
// // case 'phone':
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "33%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true
// // });
// //
// // content[count] = Ti.UI.createLabel({
// // text : "" + c_content[count],
// // width : "60%",
// // height : "100%",
// // textAlign : 'left',
// // left : "40%",
// // id : count,
// // number : c_content[count].replace(/\D/g, '')
// // });
// //
// // content[count].addEventListener('click', function(e) {
// // highlightMe(e.source.id);
// // Titanium.Platform.openURL('tel:' + e.source.number);
// // });
// //
// // content[count].text = "" + c_content[count];
// // count++;
// // break;
//
// //Refers to some object:
// // case 'omadi_reference':
// // // Ti.API.info("Contains: " + c_content[count] + " for nid " + curWin.nid);
// // // Ti.API.info('SETTINGS: ' + c_settings[count]);
// // // var json = JSON.parse(c_settings[count]);
// //
// // //Define available tables:
// // // var tables_array = new Array();
// // // for(var i in json.reference_types) {
// // // tables_array.push(json.reference_types[i]);
// // // }
// // //
// // // var count_tables = 0;
// // // var tables_query = "";
// // // for(var i in tables_array) {
// // // if(tables_array.length - 1 == count_tables) {
// // // tables_query += tables_array[i];
// // // } else {
// // // tables_query += tables_array[i] + ", ";
// // // }
// // // }
// // //Ti.API.info('TABLES: ' + tables_query);
// // try {
// //
// // // var auxA = db.execute('SELECT * FROM ' + tables_query + ' WHERE nid=' + c_content[count]);
// // // if(auxA.rowCount === 0) {
// // // bug[bug.length] = c_content[count];
// // // } else {
// // var auxRes = db.execute('SELECT DISTINCT node.title, node.table_name FROM node INNER JOIN account ON node.nid=' + c_content[count]);
// // ref_name = auxRes.fieldByName("title");
// // var tableName = auxRes.fieldByName("table_name");
// // auxRes.close();
// //
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "33%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true
// // });
// //
// // content[count] = Ti.UI.createLabel({
// // text : "" + ref_name,
// // width : "60%",
// // height : "100%",
// // textAlign : 'left',
// // left : "40%",
// // id : count,
// // nid : c_content[count],
// // type : tableName
// // });
// //
// // // When account is clicked opens a modal window to show off the content of the specific touched
// // // object.
// //
// // content[count].addEventListener('click', function(e) {
// // highlightMe(e.source.id);
// // var newWin = Ti.UI.createWindow({
// // fullscreen : false,
// // navBarHidden : true,
// // title : 'Account',
// // url : "individual_object.js"
// // });
// //
// // newWin.nameSelected = e.source.text;
// // newWin.type = e.source.type;
// // newWin.nid = e.source.nid;
// // newWin.open();
// // });
// // count++;
// // //}
// // } catch(e) {
// // Ti.API.info('!! ERROR !! ' + e);
// // bug[bug.length] = c_content[count];
// // }
// // break;
//
// //Must open browser if clicked
// // case 'link_field':
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "100%",
// // height : "100%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true
// // });
// //
// // content[count] = Ti.UI.createLabel({
// // text : "" + c_content[count],
// // width : "60%",
// // height : "100%",
// // textAlign : 'left',
// // left : "40%",
// // address : c_content[count].replace("http://", ""),
// // id : count
// // });
// //
// // content[count].addEventListener('click', function(e) {
// // highlightMe(e.source.id);
// // //website = website.replace("http://","");
// // Ti.API.info('LINK PRESSED FOR URL ' + e.source.address);
// // Titanium.Platform.openURL('http://' + e.source.address);
// // });
// // count++;
// // break;
//
// //Must open mail client if clicked - Not supported by Android yet
// // case 'email':
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "33%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true
// // });
// //
// // content[count] = Ti.UI.createLabel({
// // text : "" + c_content[count],
// // width : "60%",
// // height : "100%",
// // textAlign : 'left',
// // left : "40%",
// // id : count,
// // email : c_content[count]
// // });
// //
// // content[count].addEventListener('click', function(e) {
// // highlightMe(e.source.id);
// // var emailDialog = Titanium.UI.createEmailDialog();
// // emailDialog.subject = "Omadi CRM";
// // emailDialog.toRecipients = e.source.email;
// // emailDialog.open();
// // });
// // count++;
// //
// // break;
//
// //Link to taxonomy table:
// // case 'taxonomy_term_reference':
// //
// // Ti.API.info('Contains: ' + c_content[count]);
// // if (c_content[count] == null || c_content[count] == 'undefined' || c_content[count] == '') {
// // break;
// // }
// // var ref_name = "";
// // if (c_content[count]) {
// // var auxRes = db.execute('SELECT * FROM term_data WHERE tid=' + c_content[count]);
// // Ti.API.info('We got : ' + auxRes.rowCount + ' lines');
// // if (auxRes.rowCount == 0) {
// // ref_name = "Invalid term";
// // } else {
// // ref_name = auxRes.fieldByName("name");
// // }
// // auxRes.close();
// // }
// //
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "30%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true
// // });
// //
// // content[count] = Ti.UI.createLabel({
// // text : "" + ref_name,
// // width : "60%",
// // height : "100%",
// // textAlign : 'left',
// // left : "40%",
// // id : count
// // });
// //
// // content[count].addEventListener('click', function(e) {
// // highlightMe(e.source.id);
// // });
// // count++;
// //
// // break;
//
// //Just prints the user_reference .. If references table user, link to it
// // case 'user_reference':
// //
// // var array_cont = db.execute('SELECT encoded_array,field_name FROM array_base WHERE node_id = ' + curWin.nid + ' AND field_name = \'' + f_name_f + '\'  ');
// //
// // //Ti.API.info(array_cont.rowCount);
// // //Ti.API.info('SELECT encoded_array,field_name FROM array_base WHERE node_id = ' + curWin.nid + ' AND field_name = \'' + f_name_f + '\' ');
// // var view = Ti.UI.createView({
// // // text : "" + ref_name,
// // width : "60%",
// // height : "100%",
// // textAlign : 'left',
// // left : "40%",
// // id : count,
// // layout: 'vertical'
// // });
// //
// // var labels = [];
// // while (array_cont.isValidRow()) {
// // var decoded = array_cont.fieldByName('encoded_array');
// // var field_name = array_cont.fieldByName('field_name');
// //
// // Ti.API.info('-------------------------------------------------------------------------------------->>>> Decoded array is equals to: ' + decoded);
// // if (decoded != null && decoded != 'undefined' && decoded != '') {
// // //Decode the stored array:
// // decoded = Base64.decode(decoded);
// // Ti.API.info('1-------------------------------------------------------------------------------------->>>> Decoded array is equals to: ' + decoded);
// // }
// //
// // array_cont.next();
// // }
// // decoded = decoded.toString();
// // // Token that splits each element contained into the array: 'j8Oc2s1E'
// // var decoded_values = decoded.split("j8Oc2s1E");
// // //loop_times = decoded_values.length;
// // is_array = true;
// // keep_type = c_type[count];
// // keep_label = c_label[count];
// // keep_sett = c_settings[count];
// // keep_widget = c_widget[count];
// // keep_name = c_field_name[count];
// //
// //
// // var auxRes = db.execute('SELECT uid, realname FROM user WHERE uid IN(' + decoded_values.join(',') + ')');
// // var ref_name = "";
// // while (auxRes.isValidRow()){
// // ref_name = auxRes.fieldByName("realname");
// //
// // view.add(Ti.UI.createLabel({
// // text : ref_name + "",
// // textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
// // width: '100%'
// // }));
// //
// // auxRes.next();
// // }
// //
// // view.height = (21 * decoded_values.length + 40) + 'dp';
// //
// // auxRes.close();
// //
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "33%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true
// // });
// //
// //
// // // content[count] = Ti.UI.createLabel({
// // // text : "" + ref_name,
// // // width : "60%",
// // // height : "100%",
// // // textAlign : 'left',
// // // left : "40%",
// // // id : count
// // // });
// //
// //
// //
// // content[count] = view;
// //
// //
// // content[count].addEventListener('click', function(e) {
// // Ti.API.info("X = " + e.source.id);
// // highlightMe(e.source.id);
// // });
// // count++;
// //
// // break;
//
// //Formats as decimal
// // case 'location':
// // case 'number_decimal':
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "33%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true
// // });
// //
// // content[count] = Ti.UI.createLabel({
// // text : "" + c_content[count],
// // width : "60%",
// // height : "100%",
// // textAlign : 'left',
// // left : "40%",
// // id : count
// // });
// //
// // content[count].addEventListener('click', function(e) {
// // highlightMe(e.source.id);
// // });
// // count++;
// //
// // break;
//
// // case 'auto_increment':
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "33%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true
// // });
// //
// // var settings = JSON.parse(c_settings[count]);
// // //alert(c_settings[count]);
// // var prefix = "";
// // if (settings.prefix) {
// // prefix = settings.prefix;
// // }
// //
// // content[count] = Ti.UI.createLabel({
// // text : prefix + "" + c_content[count],
// // width : "60%",
// // height : "100%",
// // textAlign : 'left',
// // left : "40%",
// // id : count
// // });
// //
// // content[count].addEventListener('click', function(e) {
// // highlightMe(e.source.id);
// // });
// // count++;
// // break;
// //
// // //Formats as integer
// // case 'number_integer':
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "33%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true
// // });
// //
// // content[count] = Ti.UI.createLabel({
// // text : "" + c_content[count],
// // width : "60%",
// // height : "100%",
// // textAlign : 'left',
// // left : "40%",
// // id : count
// // });
// //
// // content[count].addEventListener('click', function(e) {
// // highlightMe(e.source.id);
// // });
// // count++;
// // break;
//
// //Shows up date (check how it is exhibited):
// // case 'omadi_time':
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "33%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true
// // });
// //
// // content[count] = Ti.UI.createLabel({
// // text : "" + display_omadi_time01(c_content[count]),
// // width : "60%",
// // height : "100%",
// // textAlign : 'left',
// // left : "40%",
// // id : count
// // });
// //
// // content[count].addEventListener('click', function(e) {
// // highlightMe(e.source.id);
// // });
// // count++;
// // break;
// //
// // case 'datestamp':
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "33%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true
// // });
// //
// // var widget = JSON.parse(c_widget[count]);
// //
// // content[count] = Ti.UI.createLabel({
// // text : "" + timeConverter(c_content[count], widget.settings['time']),
// // width : "60%",
// // height : "100%",
// // textAlign : 'left',
// // left : "40%",
// // id : count
// // });
// //
// // content[count].addEventListener('click', function(e) {
// // highlightMe(e.source.id);
// // });
// // count++;
// // break;
//
// // //Shows the on and off button?
// // case 'list_boolean':
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "33%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true
// // });
// //
// // content[count] = Ti.UI.createLabel({
// // text : (c_content[count] == 0 || c_content[count] == "0" || c_content[count] == false || c_content[count] == "false") ? "No" : "Yes",
// // width : "60%",
// // height : "100%",
// // textAlign : 'left',
// // left : "40%",
// // id : count
// // });
// //
// // content[count].addEventListener('click', function(e) {
// // highlightMe(e.source.id);
// // });
// // count++;
// //
// // break;
// //
// // //Prints out content
// // case 'license_plate':
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "33%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true
// // });
// //
// // content[count] = Ti.UI.createLabel({
// // text : "" + c_content[count],
// // width : "60%",
// // height : "100%",
// // textAlign : 'left',
// // left : "40%",
// // id : count
// // });
// //
// // content[count].addEventListener('click', function(e) {
// // highlightMe(e.source.id);
// // });
// // count++;
// // break;
// //
// // case 'vehicle_fields':
// // var fi_name = c_field_name[count]
// // fi_name = fi_name.split('___');
// // if (fi_name[1]) {
// // var i_name = fi_name[1];
// // } else {
// // var i_name = fi_name[0];
// // }
// // i_name = i_name.charAt(0).toUpperCase() + i_name.slice(1);
// //
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count] + " " + i_name,
// // width : "33%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true
// // });
// //
// // content[count] = Ti.UI.createLabel({
// // text : "" + c_content[count],
// // width : "60%",
// // height : "100%",
// // textAlign : 'left',
// // left : "40%",
// // id : count
// // });
// //
// // content[count].addEventListener('click', function(e) {
// // highlightMe(e.source.id);
// // });
// // count++;
// // break;
// //
// // case 'region_separator_mode':
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count].toUpperCase(),
// // color : '#ddd',
// // font : {
// // fontSize : '22dp',
// // fontWeight : 'bold'
// // },
// // textAlign : 'center',
// // width : '100%',
// // touchEnabled : false,
// // height : '100%',
// // is_region : true,
// // ref : f_name_f,
// // field : false,
// // backgroundGradient: {
// // type: 'linear',
// // startPoint: { x: '50%', y: '0%' },
// // endPoint: { x: '50%', y: '100%' },
// // colors: [ { color: '#555', offset: 0.0}, { color: '#666', offset: 0.3 }, { color: '#333', offset: 1.0 } ],
// // },
// // ellipsize: true,
// // wordWrap: false
// // });
// // count++;
// // break;
//
// case 'file':
//
// if (file_upload_boolean == true) {
// if (c_label[count] == 'File Upload') {
// file_upload_boolean = false;
// array_cont = db.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + curWin.nid + ' AND field_name = "file_upload___fid"');
// //Decode the stored array:
// var decoded = array_cont.fieldByName('encoded_array');
//
// decoded = Base64.decode(decoded);
// decoded = decoded.toString();
// decodedValues = decoded.split("j8Oc2s1E");
//
// for ( i = (decodedValues.length) - 1; i >= 0; i--) {
// file_id.push(decodedValues[i]);
// }
//
// }
// }
// if (upload_boolean == true) {
// if (c_label[count] == 'Upload #2') {
// upload_boolean = false;
// array_cont = db.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + curWin.nid + ' AND field_name = "upload___fid"');
// //Decode the stored array:
// var decoded = array_cont.fieldByName('encoded_array');
// decoded = Base64.decode(decoded);
// decoded = decoded.toString().replace("(", "");
// decodedValues = decoded.split("j8Oc2s1E");
// //alert(decodedValues.length)
// for ( i = (decodedValues.length) - 1; i >= 0; i--) {
// file_id.push(decodedValues[i]);
// }
//
// }
// }
// if (data_boolean == true) {
// if (c_label[count] == 'Data File Upload') {
// data_boolean = false;
// array_cont = db.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + curWin.nid + ' AND field_name = "data_file_upload___fid"');
// //Decode the stored array:
// var decoded = array_cont.fieldByName('encoded_array');
// decoded = Base64.decode(decoded);
// decoded = decoded.toString().replace("(", "");
// decodedValues = decoded.split("j8Oc2s1E");
// for ( i = (decodedValues.length) - 1; i >= 0; i--) {
// file_id.push(decodedValues[i]);
// }
//
// }
// }
//
// if (field_name == 'data_file_upload___fid' || field_name == 'file_upload___fid' || field_name == 'upload___fid') {
//
// } else {
//
// if (c_label[count - 1] == 'File Upload' && c_label[count] == 'File Upload') {
// height_label = label_file[i - 1].top + 25 + 5
// label_file[i] = Ti.UI.createLabel({
// text : "" + c_content[count],
// width : "70%",
// height : 25,
// font : {
// fontSize : 18,
// fontWeight : "bold"
// },
// color : 'blue',
// top : height_label,
// textAlign : 'left',
// left : "05%",
// id : count,
// upload_id : file_id[x]
//
// });
//
// content[count - 1].add(label_file[i]);
// content[count - 1].height = label_file[i].height + label_file[i].top;
// if (PLATFORM == 'android') {
//
// } else {
// label_file[i].addEventListener('click', function(e) {
//
// var win = Ti.UI.createWindow();
// var web_view = Ti.UI.createWebView({
// url : domainName + '/sync/file/' + curWin.nid + '/' + e.source.upload_id
// })
// var back = Ti.UI.createButton({
// title : 'Back',
// bottom : 0,
// right : 0,
// style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
// });
// back.addEventListener('click', function() {
// win.close();
// });
// web_view.add(back);
// win.add(web_view);
// win.open();
// });
// }
// i++;
// x++;
//
// } else if (c_label[count - 1] == 'Upload #2' && c_label[count] == 'Upload #2') {
//
// height_label = label_file[i - 1].top + 25 + 5
// label_file[i] = Ti.UI.createLabel({
// text : "" + c_content[count],
// width : "70%",
// height : 25,
// font : {
// fontSize : 18,
// fontWeight : "bold"
// },
// color : 'blue',
// top : height_label,
// textAlign : 'left',
// left : "05%",
// id : count,
// upload_id : file_id[x]
//
// });
//
// content[count - 1].add(label_file[i]);
// content[count - 1].height = label_file[i].height + label_file[i].top;
// if (PLATFORM == 'android') {
//
// } else {
// label_file[i].addEventListener('click', function(e) {
// //alert(e.source.upload_id)
// var win = Ti.UI.createWindow();
//
// var web_view = Ti.UI.createWebView({
// url : domainName + '/sync/file/' + curWin.nid + '/' + e.source.upload_id
// })
//
// var back = Ti.UI.createButton({
// title : 'Back',
// bottom : 0,
// right : 0,
// style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
// });
// back.addEventListener('click', function() {
// win.close();
// });
// web_view.add(back);
// win.add(web_view);
// win.open();
// });
// }
// i++;
// x++;
//
// } else if (c_label[count - 1] == 'Data File Upload' && c_label[count] == 'Data File Upload') {
//
// height_label = label_file[i - 1].top + 25 + 5
// label_file[i] = Ti.UI.createLabel({
// text : "" + c_content[count],
// width : "70%",
// height : 25,
// top : height_label,
// color : 'blue',
// font : {
// fontSize : 18,
// fontWeight : "bold"
// },
// textAlign : 'left',
// left : "05%",
// id : count,
// upload_id : file_id[x]
// });
//
// content[count - 1].add(label_file[i]);
// if (PLATFORM == 'android') {
//
// } else {
//
// label_file[i].addEventListener('click', function(e) {
// //alert(e.source.upload_id)
// var win = Ti.UI.createWindow();
//
// var web_view = Ti.UI.createWebView({
// url : domainName + '/sync/file/' + curWin.nid + '/' + e.source.upload_id
// })
//
// var back = Ti.UI.createButton({
// title : 'Back',
// bottom : 0,
// right : 0,
// style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
// });
// back.addEventListener('click', function() {
// win.close();
// });
// web_view.add(back);
// win.add(web_view);
// win.open();
// });
// }
// i++;
// x++;
//
// } else {
//
// label[count] = Ti.UI.createLabel({
// text : c_label[count],
// width : "33%",
// textAlign : 'left',
// left : 3,
// touchEnabled : false,
// field : true
// });
// content[count] = Ti.UI.createView({
// width : "100%",
// height : 30,
// textAlign : 'left',
// left : "40%",
// id : count
// });
// label_file[i] = Ti.UI.createLabel({
// text : "" + c_content[count],
// width : "70%",
// height : 25,
// color : 'blue',
// font : {
// fontSize : 18,
// fontWeight : "bold"
// },
//
// top : height_label,
// textAlign : 'left',
// left : "05%",
// id : count,
// upload_id : file_id[x]
//
// });
// label_file[i].top = 5;
// content[count].add(label_file[i]);
// //Not yet developed for android devices
// //one can not view files on web view
// //Because viewing files are not supported in android devices.
// if (PLATFORM == 'android') {
//
// } else {
// label_file[i].addEventListener('click', function(e) {
// //alert(e.source.upload_id)
// var win = Ti.UI.createWindow();
//
// var web_view = Ti.UI.createWebView({
// url : domainName + '/sync/file/' + curWin.nid + '/' + e.source.upload_id
// })
//
// var back = Ti.UI.createButton({
// title : 'Back',
// bottom : 0,
// right : 0,
// style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
// });
// back.addEventListener('click', function() {
// win.close();
// });
// web_view.add(back);
// win.add(web_view);
// win.open();
// });
// }
// i++;
// x++;
// count++;
// }
// }
// break;
//
// // case 'image':
// // var settings = JSON.parse(c_settings[count]);
// // if (settings.cardinality > 1 || settings.cardinality < 0) {
// // isUpdated = [];
// // content[count] = Ti.UI.createScrollView({
// // field_name : c_label[count],
// // contentWidth : 'auto',
// // contentHeight : 100,
// // arrImages : null,
// // scrollType : "horizontal",
// // layout : 'horizontal',
// // left : '33%',
// // cardinality : settings.cardinality
// // });
// // var decodedValues = [];
// // var array_cont;
// //
// // if (results.fieldByName(c_field_name[count] + '___file_id') == '7411317618171051229' || results.fieldByName(c_field_name[count] + '___file_id') == 7411317618171051229) {
// // array_cont = db.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + curWin.nid + ' AND field_name = \'' + c_field_name[count] + '___file_id\'');
// //
// // } else {
// //
// // array_cont = db.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + curWin.nid + ' AND field_name = \'' + c_field_name[count] + '\'');
// // }
// // if (array_cont.rowCount > 0) {
// //
// // //Decode the stored array:
// // var decoded = array_cont.fieldByName('encoded_array');
// // decoded = Base64.decode(decoded);
// // decoded = decoded.toString();
// // decodedValues = decoded.split("j8Oc2s1E");
// // }
// // val = db.execute('SELECT * FROM file_upload_queue WHERE nid=' + curWin.nid + ' AND field_name ="' + c_field_name[count] + '";');
// //
// // if (val.rowCount > 0) {
// // while (val.isValidRow()) {
// // isUpdated[val.fieldByName('delta')] = true;
// // decodedValues[val.fieldByName('delta')] = Ti.Utils.base64decode(val.fieldByName('file_data'));
// // val.next();
// // }
// // }
// // var arrImages = [];
// // for ( img = 0; img < decodedValues.length; img++) {
// // var updated = false
// // if ((img < decodedValues.length) && (decodedValues[img] != "") && (decodedValues[img] != null) && decodedValues[img] != 'null' && decodedValues[img] != 'undefined') {
// // var vl_to_field = decodedValues[img];
// // if (isUpdated[img] == true) {
// // updated = isUpdated[img];
// // }
// // } else {
// // continue;
// // }
// // arrImages = createImage1(arrImages, vl_to_field, content[count], updated);
// // }
// // content[count].arrImages = arrImages;
// // } else {
// // isUpdated = false;
// // if (results.rowCount > 0) {
// // val = results.fieldByName(c_field_name[count] + '___file_id');
// // if (val == 'null' || val == null || val == 'undefined' || val == '') {
// // val = results.fieldByName(c_field_name[count]);
// // }
// // }
// // valUp = db.execute('SELECT * FROM file_upload_queue WHERE nid=' + curWin.nid + ' AND field_name ="' + c_field_name[count] + '";');
// //
// // if (valUp.rowCount > 0) {
// // isUpdated = true;
// // val = Ti.Utils.base64decode(valUp.fieldByName('file_data'));
// // }
// // if ((val == 'null' || val == 'undefined' || val == '') && valUp.rowCount == 0) {
// // break;
// // }
// //
// // content[count] = Ti.UI.createImageView({
// // label : c_label[count],
// // height : '100',
// // width : '100',
// // top : 5,
// // bottom : 5,
// // size : {
// // height : '100',
// // width : '100'
// // },
// // defaultImage : '../images/photo-loading.png',
// // imageVal : val,
// // bigImg : null,
// // mimeType : null,
// // cardinality : settings.cardinality,
// // isUpdated : isUpdated
// // });
// //
// // if (isUpdated == true) {
// // content[count].image = val;
// // content[count].bigImg = val;
// // contentImage.isImage = true;
// // }
// // content[count].addEventListener('click', function(e) {
// // downloadMainImage(e.source.imageVal, e.source, curWin);
// // });
// // }
// //
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "33%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true
// // });
// // count++;
// // break;
//
// // case 'calculation_field':
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "100%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true,
// // top : 0,
// // height : 40,
// // wordWrap : false,
// // ellipsize : true
// // });
// //
// // var settings = JSON.parse(c_settings[count]);
// // content[count] = Ti.UI.createView({
// // left : '3%',
// // right : '3%',
// // field_type : c_type[count],
// // field_name : c_field_name[count],
// // cardinality : settings.cardinality,
// // reffer_index : count,
// // settings : settings,
// // layout : 'vertical'
// // });
// // count++;
// // break;
// // case 'rules_field':
// //
// // if (c_content[count] != false && c_content[count] != "false" && c_content[count] != 0 && JSON.parse(c_content[count]).length > 0) {
// // label[count] = Ti.UI.createLabel({
// // text : c_label[count],
// // width : "100%",
// // textAlign : 'left',
// // left : 5,
// // touchEnabled : false,
// // field : true,
// // top : 0,
// // height : 40,
// // wordWrap : false,
// // ellipsize : true
// // });
// // content[count] = Ti.UI.createView({
// // width : Ti.Platform.displayCaps.platformWidth - 30,
// // field_type : c_type[count],
// // field_name : c_field_name[count],
// // cardinality : settings.cardinality,
// // reffer_index : count,
// // settings : settings,
// // value : JSON.parse(c_content[count]),
// // layout : 'vertical',
// // widget : JSON.parse(c_widget[count])
// // });
// // count++;
// // }
// // break;
//
// }
// }
// }
// }
//
// if (bug.length === 0) {
// var index_fields = 0;
// var i;
// for ( i = 0; i < count; i++) {
// //Normal fields
// //alert(label[i].text+'  '+label[i].is_region+'  '+label[i].field)
// if ((label[i].is_region !== true) && (label[i].field === true)) {
// //alert(label[i].text+'  '+label[i].is_region+'  '+label[i].field)
// cell[i] = Ti.UI.createView({
// height : heightValue,
// //	top : (heightValue+2)*index_fields,
// width : '100%'
// });
//
// label[i].color = "#4C5A88";
// content[i].color = "#000";
//
// cell[i].add(label[i]);
// if (c_type[i] == 'image') {
// if (content[i].cardinality > 1 || content[i].cardinality < 0) {
// if (content[i].arrImages.length == 0) {
// continue;
// }
// }
// cell[i].height = '110';
// } else if (c_type[i] == 'file') {
// if (!(content[i].height < heightValue)) {
// cell[i].layout = 'vertical';
// cell[i].height = content[i].height + heightValue;
//
// } else {
// label[i].width = '33%';
// label[i].height = '60'
// content[i].left = '40%'
// }
//
// }
// // else if(c_type[i]=='calculation_field'){
// // if(content[i].settings.hidden!=null && content[i].settings.hidden==1){
// // continue;
// // }
// // createCalculationTableFormat(content[i] , db, content);
// // if (!(content[i].height < heightValue)){
// // cell[i].layout = 'vertical';
// // cell[i].height = content[i].height;
// // }else{
// // label[i].width = '33%';
// // label[i].height = '60'
// // content[i].left = '40%'
// // }
// //
// // }
// // else if(c_type[i]=='user_reference'){
// //
// // if (!(content[i].height < heightValue)){
// // cell[i].layout = 'vertical';
// // cell[i].height = content[i].height;
// // }else{
// // label[i].width = '33%';
// // label[i].height = '60'
// // content[i].left = '40%'
// // }
// //
// // }
// else if (c_type[i] == 'rules_field') {
// cell[i].layout = 'vertical';
// showRulesRow(content[i], db, curWin);
// cell[i].height = content[i].height + heightValue;
// }
// cell[i].add(content[i]);
//
// viewContent.add(cell[i]);
//
// border[i] = Ti.UI.createView({
// backgroundColor : "#C8C9C9",
// height : 2,
// });
// viewContent.add(border[i]);
// index_fields++;
// }
// //Regions
// else {
// var cnd = 0;
// var j;
// for (j in show_region) {
// if (j == label[i].ref) {
// cnd++;
//
// cell[i] = Ti.UI.createView({
// height : heightValue,
// width : '100%'
// });
//
// cell[i].add(label[i]);
// viewContent.add(cell[i]);
//
// border[i] = Ti.UI.createView({
// backgroundColor : "#000",
// height : 2,
// });
//
// if (i > 1) {
// if (border[i - 1]) {
// border[i - 1].backgroundColor = "#000";
// }
// }
//
// viewContent.add(border[i]);
// Ti.API.info('Added region: ' + label[i].ref);
// index_fields++;
// }
// }
// if (cnd == 0) {
// Ti.API.info('No content for region: ' + label[i].ref)
// }
// }
// }
//
// // var i;
// // for(i = 0; i < count; i++) {
// // if(c_type[i] == 'image') {
// // if(content[i].cardinality > 1 || content[i].cardinality < 0) {
// // var arrImages = content[i].arrImages;
// // for( i_idx = 0; i_idx < arrImages.length; i_idx++) {
// // if(arrImages[i_idx].isUpdated == false) {
// // downloadThumnail(arrImages[i_idx].imageVal, arrImages[i_idx], curWin);
// // }
// // }
// // } else {
// // if(content[i].isUpdated == false) {
// // downloadThumnail(content[i].imageVal, content[i], curWin);
// // }
// // }
// //
// // }
// // }
//
// } else {
// var cell = Ti.UI.createLabel({
// height : 'auto',
// top : '30%',
// textAlign : 'center',
// width : '80%',
// text : 'Well, this is embarrassing but it seems that you\'ve found a bug, please submit it to us, here are some things you should inform:\n    NID = ' + curWin.nid + '\n   	Omadi_reference = ' + bug[0] + ' \nWe will fix it as soon as possible'
// });
//
// viewContent.add(cell);
// }
// }
// }



//======================================
// MENU
//======================================
if (PLATFORM === 'android' && isEditEnabled == true) {
    var activity = curWin.activity;
    activity.onCreateOptionsMenu = function(e) {
        //======================================
        // MENU - UI
        //======================================

        var menu = e.menu;
        var db_act = Omadi.utils.openMainDatabase();

        var json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + curWin.type + '"');
        var _data = JSON.parse(json_data.fieldByName('_data'));

        var node_form = db_act.execute('SELECT form_part FROM node WHERE nid=' + curWin.nid);

        Ti.API.info('Form node part = ' + node_form.fieldByName('form_part'));
        //Ti.API.info('Form table part = ' + _data.form_parts.parts.length);

        if (_data.form_parts != null && _data.form_parts != "" && (_data.form_parts.parts.length >= parseInt(node_form.fieldByName('form_part')) + 2)) {
            Ti.API.info("Title = " + _data.form_parts.parts[node_form.fieldByName('form_part') + 1].label);

            var menu_zero = menu.add({
                title : _data.form_parts.parts[node_form.fieldByName('form_part') + 1].label,
                order : 0
            });

            menu_zero.setIcon("/images/drop.png");

            //======================================
            // MENU - EVENTS
            //======================================

            menu_zero.addEventListener("click", function(e) {
                //Next window to be opened
                var win_new = Ti.UI.createWindow();//create_or_edit_node.getWindow();
                win_new.title = curWin.title;
                win_new.type = curWin.type;
                win_new.listView = curWin.listView;
                win_new.up_node = curWin.up_node;
                win_new.uid = curWin.uid;
                win_new.region_form = node_form.fieldByName('form_part') + 1;
                win_new.url = "/main_windows/form.js";

                //Passing parameters
                win_new.nid = curWin.nid;
                win_new.nameSelected = curWin.nameSelected;

                //Sets a mode to fields edition
                win_new.mode = 1;

                win_new.open();
                //setTimeout(function() {
                //    create_or_edit_node.loadUI();
                //}, 100);
                curWin.close();
            });
        }

        var menu_edit = menu.add({
            title : 'Edit',
            order : 1
        });

        menu_edit.setIcon("/images/edit.png");

        //======================================
        // MENU - EVENTS
        //======================================

        var _aux_node_part = node_form.fieldByName('form_part');
        menu_edit.addEventListener("click", function(e) {
            openEditScreen(_aux_node_part);
        });

        json_data.close();
        db_act.close();

    }
}

results.close();
fields_result.close();
db.close();

if (PLATFORM !== 'android') {
    bottomButtons1(curWin);
}

// function createImage1(arrImages, data, scrollView, updated) {
// contentImage = Ti.UI.createImageView({
// height			: '100',
// width			: '100',
// left			: 5,
// size: {
// height		: '100',
// width		: '100'
// },
// top				:5,
// bottom			:5,
// image			: '../images/photo-loading.png',
// imageVal		: data,
// bigImg 			: null,
// mimeType		: null,
// label			: scrollView.field_name,
// isUpdated		: updated
// });
//
//
// if(updated == true) {
// contentImage.image = data;
// contentImage.bigImg = data;
// contentImage.isImage = true;
// }
// contentImage.addEventListener('click', function(e) {
// //Following method will open camera to capture the image.
// Omadi.display.displayLargeImage(e.source, curWin.nid, e.source.imageVal);
// });
// scrollView.add(contentImage);
// arrImages.push(contentImage)
// return arrImages;
// }

function openEditScreen(part) {
    //Next window to be opened
    var win_new = Ti.UI.createWindow();//create_or_edit_node.getWindow();
    win_new.title = (PLATFORM == 'android') ? curWin.title + '-' + curWin.nameSelected : curWin.title;
    win_new.type = curWin.type;
    win_new.listView = curWin.listView;
    win_new.up_node = curWin.up_node;
    win_new.uid = curWin.uid;
    win_new.region_form = part;
    win_new.movement = curWin.movement;
    win_new.url = "/main_windows/form.js";

    //Passing parameters
    win_new.nid = curWin.nid;
    win_new.nameSelected = curWin.nameSelected;

    //Sets a mode to fields edition
    win_new.mode = 1;

    win_new.open();
    //setTimeout(function() {
    //    create_or_edit_node.loadUI();
    //}, 100);
    (PLATFORM == 'android') ? curWin.close() : curWin.hide();
}

function createEntity() {

    var entity = [];

    for ( idx = 0; idx < content.length; idx++) {
        if (!content[idx]) {
            continue;
        }
        var private_index = 0;
        if (entity[c_field_name[idx]] == null) {
            entity[c_field_name[idx]] = new Array();
        }
        else {
            private_index = entity[c_field_name[idx]].length;
        }

        entity[c_field_name[idx]][private_index] = new Array();

        entity[c_field_name[idx]][private_index]['value'] = c_content[idx];
        entity[c_field_name[idx]][private_index]['nid'] = c_content[idx];
        entity[c_field_name[idx]][private_index]['uid'] = c_content[idx];
        entity[c_field_name[idx]][private_index]['tid'] = c_content[idx];
        entity[c_field_name[idx]][private_index]['field_name'] = c_field_name[idx];
        entity[c_field_name[idx]][private_index]['field_type'] = c_type[idx];
        entity[c_field_name[idx]][private_index]['reffer_index'] = idx;
    }

    return entity;
}

function calculationFieldGetValues(node, instance) {
    //Ti.API.info('here--------0.1' + instance.field_name + ", mode: " + win.mode);
    var entity;
    var calculated_field_cache = [];
    var final_value = 0;
    if (instance.settings.calculation.items != null && !instance.disabled) {
        var row_values = [];
        if (instance.value != null && instance.value != "") {
            cached_final_value = instance.value;
        }
        else {
            cached_final_value = 0;
        }

        usort(instance.settings.calculation.items, '_calculation_field_sort_on_weight');

        var idx;
        for (idx in instance.settings.calculation.items) {
            var calculation_row = instance.settings.calculation.items[idx];
            var value = 0;
            var field_1_multiplier = 0;
            var field_2_multiplier = 0;
            var numeric_multiplier = 0;
            calculated_field_cache = new Array();
            if (calculation_row.field_name_1 != null && node[calculation_row.field_name_1] != null && instances[calculation_row.field_name_1] != null && instances[calculation_row.field_name_1].type == 'calculation_field') {
                // Make sure a dependency calculation is made first
                // TODO: Statically cache these values for future use by other calculation fields
                // TODO: Make sure an infinite loop doesn't occur
                //Ti.API.info('here--------0.2');
                required_instance_final_values = calculationFieldGetValues(node, instances[calculation_row.field_name_1]);
                //content[entity[calculation_row.field_name_1][0]['reffer_index']], node, content);
                //Ti.API.info('here--------0.3' + required_instance_final_values[0].final_value);
                calculated_field_cache[calculation_row.field_name_1] = required_instance_final_values[0].final_value;
            }

            if (calculation_row.field_name_1 != null && calculation_row.field_name_1 != "") {
                //Ti.API.info('here--------0.4' + calculation_row.field_name_1 + "," + calculated_field_cache[calculation_row.field_name_1]);
                if (calculated_field_cache[calculation_row.field_name_1] != null) {
                    //Ti.API.info('here--------0.5' + calculated_field_cache[calculation_row.field_name_1]);
                    field_1_multiplier = calculated_field_cache[calculation_row.field_name_1];
                }
                else if (calculation_row.type == 'parent_field_value') {
                    //Ti.API.info('here--------0.6' + calculation_row.parent_field);
                    parent_field = calculation_row.parent_field;
                    if (node[parent_field] != null && node[parent_field].values[0] != null) {
                        parent_node = loadNode(node[parent_field].values[0]);
                        if (parent_node && parent_node[calculation_row.field_name_1].values[0] != null) {
                            field_1_multiplier = parent_node[calculation_row.field_name_1].values[0];
                            //Ti.API.info('here--------0.7' + field_1_multiplier);
                        }
                    }
                }
                else if (node[calculation_row.field_name_1] != null && node[calculation_row.field_name_1].values[0] != null) {
                    field_1_multiplier = node[calculation_row.field_name_1].values[0];
                    //Ti.API.info('here--------0.8' + field_1_multiplier);
                }
                if (calculation_row.datestamp_end_field != null && calculation_row.datestamp_end_field != "") {
                    //Ti.API.info('here--------0.9' + field_1_multiplier);
                    start_timestamp = field_1_multiplier;
                    // Set this end value to 0 in case the terminating datestamp field is empty
                    field_1_multiplier = 0;
                    if (node[calculation_row.datestamp_end_field] != null && node[calculation_row.datestamp_end_field].values[0] != null) {
                        end_timestamp = node[calculation_row.datestamp_end_field].values[0];
                        //Ti.API.info('here--------0.10' + end_timestamp);
                        if (calculation_row.type == 'time-only') {
                            //Ti.API.info('here--------0.11' + calculation_row.type);
                            if (end_timestamp < start_timestamp) {
                                //Ti.API.info('here--------0.12' + start_timestamp);
                                end_timestamp += (24 * 3600);
                            }
                        }

                        difference = end_timestamp - start_timestamp;

                        switch(calculation_row.datestamp_interval) {
                            case 'minute':
                                field_1_multiplier = difference / 60;
                                //Ti.API.info('here--------0.13' + field_1_multiplier);
                                break;
                            case 'hour':
                                field_1_multiplier = difference / 3600;
                                //Ti.API.info('here--------0.14' + field_1_multiplier);
                                break;
                            case 'day':
                                field_1_multiplier = difference / (3600 * 24);
                                //Ti.API.info('here--------0.15' + field_1_multiplier);
                                break;
                            case 'week':
                                field_1_multiplier = difference / (3600 * 24 * 7);
                                //Ti.API.info('here--------0.16' + field_1_multiplier);
                                break;
                        }
                        if (calculation_row.type == 'time') {
                            //Ti.API.info('here--------0.17' + calculation_row.type);
                            if (calculation_row.interval_rounding == 'up') {
                                field_1_multiplier = Math.ceil(field_1_multiplier);
                                //Ti.API.info('here--------0.18' + field_1_multiplier);
                            }
                            else if (calculation_row.interval_rounding == 'down') {
                                field_1_multiplier = Math.floor(field_1_multiplier);
                                //Ti.API.info('here--------0.19' + field_1_multiplier);
                            }
                            else if (calculation_row.interval_rounding == 'integer') {
                                field_1_multiplier = Math.round(field_1_multiplier);
                                //Ti.API.info('here--------0.20' + field_1_multiplier);
                            }
                            else if (calculation_row.interval_rounding == 'increment-at-time') {
                                //Ti.API.info('here--------0.21' + calculation_row.increment_at_time);
                                at_time = calculation_row.increment_at_time;
                                start_timestamp = Number(start_timestamp);
                                relative_increment_time = at_time = mktime(0, 0, 0, date('n', start_timestamp), date('j', start_timestamp), date('Y', start_timestamp));
                                //Ti.API.info('here--------0.22' + relative_increment_time + "," + end_timestamp);
                                day_count = 0;
                                if (relative_increment_time < start_timestamp) {
                                    relative_increment_time += (3600 * 24);
                                    //Ti.API.info('here--------0.23' + relative_increment_time);
                                }

                                while (relative_increment_time <= end_timestamp) {
                                    day_count++;
                                    relative_increment_time += (3600 * 24);
                                    //	Ti.API.info('here--------0.24' + relative_increment_time );
                                }

                                field_1_multiplier = day_count;
                            }
                        }
                    }
                }

            }

            if (calculation_row.field_name_2 != null && calculation_row.field_name_2 != "") {
                //Ti.API.info('here--------1' + calculation_row.field_name_2);
                if (calculated_field_cache[calculation_row.field_name_1] != null) {
                    field_2_multiplier = calculated_field_cache[calculation_row.field_name_2];
                    //Ti.API.info('here--------2' + field_2_multiplier);
                }
                else if (calculation_row.type == 'parent_field_value') {
                    parent_field = calculation_row.parent_field;
                    //Ti.API.info('here--------3' + parent_field);
                    if (node[parent_field] != null && node[parent_field].values[0] != null) {
                        parent_node = loadNode(node[parent_field].values[0]);
                        //Ti.API.info('here--------4' + parent_field);
                        if (parent_node && parent_node[calculation_row.field_name_2].values[0] != null) {
                            field_2_multiplier = parent_node[calculation_row.field_name_2].values[0];
                            //Ti.API.info('here--------5' + field_2_multiplier);
                        }
                    }
                }
                else if (node[calculation_row.field_name_2] != null && node[calculation_row.field_name_2].values[0] != null) {
                    field_2_multiplier = node[calculation_row.field_name_2].values[0];
                    //Ti.API.info('here--------6' + field_2_multiplier);
                }
            }

            if (calculation_row.numeric_multiplier != null && calculation_row.numeric_multiplier != "") {
                numeric_multiplier = Number(calculation_row.numeric_multiplier);
                //Ti.API.info('here--------7' + numeric_multiplier);
            }

            var zero = false;

            if (calculation_row.criteria != null && calculation_row.criteria.search_criteria != null) {
                //Ti.API.info('here--------8' + calculation_row.criteria);
                //if (!list_search_node_matches_search_criteria(win, db_display, entity, calculation_row.criteria, content)) {
                //Ti.API.info('here--------9');
                //zero = true;
                //}
            }

            var value = 0;
            if (field_1_multiplier == 0 && calculation_row.field_name_1 != null && calculation_row.field_name_1 != "") {
                //Ti.API.info('here--------10');
                zero = true;
            }
            else if (value == 0 && field_1_multiplier != 0) {
                //Ti.API.info('here--------11');
                value = field_1_multiplier;
            }

            if (field_2_multiplier == 0 && calculation_row.field_name_2 != null && calculation_row.field_name_2 != "") {
                //Ti.API.info('here--------12');
                zero = true;
            }
            else if (value == 0 && field_2_multiplier != 0) {
                //Ti.API.info('here--------13');
                value = Number(field_2_multiplier);
            }
            else if (value != 0 && field_2_multiplier != 0) {
                //Ti.API.info('here--------14');
                value *= Number(field_2_multiplier);
            }

            if (value == 0 && numeric_multiplier != 0) {
                //Ti.API.info('here--------15');
                value = Number(numeric_multiplier);
            }
            else if (value != 0 && numeric_multiplier != 0) {
                //Ti.API.info('here--------16');
                value *= Number(numeric_multiplier);
            }

            // if(calculation_row.type!=null && calculation_row.type=='static'){
            // Ti.API.info('here--------17' );
            // zero = false;
            // }
            if (zero) {
                //Ti.API.info('here--------18');
                value = 0;
            }

            row_values.push({
                'row_label' : (calculation_row.row_label != null && calculation_row.row_label != "") ? calculation_row.row_label : '',
                'value' : value
            });
            //alert('field_1_multiplier : ' + field_1_multiplier);
            //alert('field_2_multiplier : ' + field_2_multiplier);
            //alert('numeric_multiplier : ' + numeric_multiplier);
            //alert('Value : ' + value);
            final_value += Number(value);
            //Ti.API.info('here--------19' + final_value);
        }
        //	alert("final value: " + final_value);
        return [{
            'cached_final_value' : cached_final_value,
            'final_value' : final_value,
            'rows' : row_values,
        }];

    }
    return [];
}

function getCalculationTableView(node, instance) {
    //var entity = createEntity();
    //var instance = instances[field_name];
    var result = calculationFieldGetValues(node, instance);
    var row_values = result[0].rows;
    //var heightView = 0;

    //var widthCellView = Ti.Platform.displayCaps.platformWidth;
    //var content;

    var tableView = Ti.UI.createView({
        width : '100%',
        layout : 'vertical',
        height : Ti.UI.SIZE
    });

    if (row_values.length > 1) {
        var cal_value = 0;
        var cal_value_str = "";
        var isNegative = false;

        for ( idx = 0; idx < row_values.length; idx++) {
            cal_value = row_values[idx].value;
            typeof (cal_value) == 'number' ? null : typeof (cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null;
            //Check type of the data
            isNegative = (cal_value < 0) ? true : false;
            // Is negative. And if it is -ve then write in this value in (brackets).
            cal_value_str = applyNumberFormat(instance, cal_value);
            cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
            // Adding brackets over -ve value.

            var row = Ti.UI.createView({
                height : Ti.UI.SIZE,
                width : '100%',
                top : 0,
                backgroundColor : '#ccc'
            });

            var row_label = Ti.UI.createLabel({
                text : row_values[idx].row_label + "  ",
                textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
                width : '59.5%',
                font : {
                    fontSize : '15dp'
                },
                left : 0,
                top : '1dp',
                color : '#545454',
                wordWrap : false,
                ellipsize : true,
                backgroundColor : '#f3f3f3'
            });

            var value = Ti.UI.createLabel({
                text : "  " + cal_value_str,
                textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                width : '40%',
                font : {
                    fontFamily : 'Helvetica Neue',
                    fontSize : '15dp'
                },
                top : '1dp',
                right : 0,
                color : '#424242',
                wordWrap : false,
                ellipsize : true,
                backgroundColor : '#fff'
            });

            row.add(row_label);
            row.add(value);
            tableView.add(row);
        }

        cal_value = result[0].final_value;
        typeof (cal_value) == 'number' ? null : typeof (cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null;
        isNegative = (cal_value < 0) ? true : false;
        // Is negative. And if it is -ve then write in this value in (brackets).
        cal_value_str = applyNumberFormat(instance, cal_value);
        cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
        // Adding brackets over -ve value.

        var row = Ti.UI.createView({
            height : Ti.UI.SIZE,
            width : '100%',
            backgroundColor : '#ccc'
        });

        var row_label = Ti.UI.createLabel({
            text : instance.label + "  ",
            textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
            width : '59.5%',
            left : 0,
            top : '1dp',
            font : {
                fontSize : '16dp',
                fontWeight : 'bold'
            },
            color : '#246',
            backgroundColor : '#ddd',
            height : '30dp'
        });

        var value = Ti.UI.createLabel({
            text : "  " + cal_value_str,
            textAlign : 'left',
            width : '40%',
            right : 0,
            top : '1dp',
            font : {
                fontSize : '16dp',
                fontWeight : 'bold'
            },
            color : '#424242',
            wordWrap : false,
            ellipsize : true,
            backgroundColor : '#eee',
            height : '30dp'
        });
        row.add(row_label);
        row.add(value);
        tableView.add(row);
        tableView.singleValue = false;
    }
    else {

        Ti.API.info(row_values.length + " rows");
        cal_value = (row_values.length == 1) ? result[0].final_value : 0;
        typeof (cal_value) == 'number' ? null : typeof (cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null;
        isNegative = (cal_value < 0) ? true : false;
        // Is negative. And if it is -ve then write in this value in (brackets).
        cal_value_str = applyNumberFormat(instance, cal_value);
        cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
        // Adding brackets over -ve value.

        var value = Ti.UI.createLabel({
            text : "  " + cal_value_str,
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            left : 0,
            font : {
                fontSize : '16dp'
            },
            color : '#666',
            height : Ti.UI.SIZE,
            wordWrap : false,
            ellipsize : true
        });

        tableView.add(value);
        tableView.singleValue = true;
        //heightView += heightCellView;
    }
    //content.height = heightView;

    return tableView;
}

function createCalculationTableFormat(content, db, contentArr) {
    var entity = createEntity();
    var result = _calculation_field_get_values(curWin, db, content, entity, contentArr);
    var row_values = result[0].rows;
    var heightView = 0;
    var heightCellView = 40;
    var widthCellView = Ti.Platform.displayCaps.platformWidth - 30
    if (row_values.length > 1) {
        var cal_value = 0;
        var cal_value_str = "";
        var isNegative = false;
        for ( idx = 0; idx < row_values.length; idx++) {
            cal_value = row_values[idx].value;
            typeof (cal_value) == 'number' ? null : typeof (cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null;
            //Check type of the data
            isNegative = (cal_value < 0) ? true : false;
            // Is negative. And if it is -ve then write in this value in (brackets).
            cal_value_str = applyNumberFormat(content, cal_value);
            cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
            // Adding brackets over -ve value.

            var row = Ti.UI.createView({
                layout : 'horizontal',
                height : heightCellView,
                width : widthCellView,
                top : 1
            });
            var row_label = Ti.UI.createLabel({
                text : row_values[idx].row_label + ":  ",
                textAlign : 'right',
                width : widthCellView / 2 - 1,
                font : {
                    fontFamily : 'Helvetica Neue',
                    fontSize : 14
                },
                color : '#545454',
                height : heightCellView,
                wordWrap : false,
                ellipsize : true,
                backgroundColor : '#FFF'

            });
            var value = Ti.UI.createLabel({
                text : "  " + cal_value_str,
                textAlign : 'left',
                width : widthCellView / 2,
                left : 1,
                font : {
                    fontFamily : 'Helvetica Neue',
                    fontSize : 14
                },
                color : '#424242',
                height : heightCellView,
                wordWrap : false,
                ellipsize : true,
                backgroundColor : '#FFF'
            });
            row.add(row_label);
            row.add(value);
            content.add(row);
            heightView += heightCellView + 1;
        }

        cal_value = result[0].final_value;
        typeof (cal_value) == 'number' ? null : typeof (cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null;
        isNegative = (cal_value < 0) ? true : false;
        // Is negative. And if it is -ve then write in this value in (brackets).
        cal_value_str = applyNumberFormat(content, cal_value);
        cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
        // Adding brackets over -ve value.

        var row = Ti.UI.createView({
            layout : 'horizontal',
            height : heightCellView,
            width : widthCellView,
            top : 1
        });
        var row_label = Ti.UI.createLabel({
            text : "Total: ",
            textAlign : 'right',
            width : widthCellView / 2 - 1,
            top : 0,
            color : 'white',
            font : {
                fontFamily : 'Helvetica Neue',
                fontSize : 14
            },
            color : '#545454',
            height : heightCellView,
            backgroundColor : '#FFF'
        });
        var value = Ti.UI.createLabel({
            text : "  " + cal_value_str,
            textAlign : 'left',
            width : widthCellView / 2,
            top : 0,
            left : 1,
            color : 'white',
            font : {
                fontFamily : 'Helvetica Neue',
                fontSize : 14,
                fontWeight : 'bold'
            },
            color : '#424242',
            height : heightCellView,
            wordWrap : false,
            ellipsize : true,
            backgroundColor : '#FFF'
        });
        //	row.add(row_label);
        //row.add(value);
        //	content.add(row);
        heightView += heightCellView + 1;

    }
    else {
        cal_value = (row_values.length == 1) ? result[0].final_value : 0;
        typeof (cal_value) == 'number' ? null : typeof (cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null;
        isNegative = (cal_value < 0) ? true : false;
        // Is negative. And if it is -ve then write in this value in (brackets).
        cal_value_str = applyNumberFormat(content, cal_value);
        cal_value_str = (isNegative) ? "(" + cal_value_str + ")" : cal_value_str;
        // Adding brackets over -ve value.
        var value = Ti.UI.createLabel({
            text : "  " + cal_value_str,
            textAlign : 'left',
            width : widthCellView / 2,
            top : 0,
            left : 1,
            color : 'white',
            font : {
                fontFamily : 'Helvetica Neue',
                fontSize : 14,
            },
            color : '#000',
            height : heightCellView,
            wordWrap : false,
            ellipsize : true,
        });
        content.add(value);
        heightView += heightCellView;
    }
    content.height = heightView;
}

function bottomButtons1(actualWindow) {"use strict";
    var back, space, label, edit;
    
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
        var db_act = Omadi.utils.openMainDatabase();

        var json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + curWin.type + '"');
        var _data = JSON.parse(json_data.fieldByName('_data'));

        var node_form = db_act.execute('SELECT form_part FROM node WHERE nid=' + curWin.nid);

        Ti.API.info('Form node part = ' + node_form.fieldByName('form_part'));

        var btn_tt = [];
        var btn_id = [];
        if (_data.form_parts != null && _data.form_parts != "") {
            Ti.API.info('Form table part = ' + _data.form_parts.parts.length);
            if (_data.form_parts.parts.length >= parseInt(node_form.fieldByName('form_part')) + 2) {
                Ti.API.info("Title = " + _data.form_parts.parts[node_form.fieldByName('form_part') + 1].label);
                btn_tt.push(_data.form_parts.parts[node_form.fieldByName('form_part') + 1].label);
                btn_id.push(node_form.fieldByName('form_part') + 1);
            }
        }

        btn_tt.push('Edit');
        btn_id.push(node_form.fieldByName('form_part'));
        json_data.close();
        db_act.close();
        btn_tt.push('Cancel');

        var postDialog = Titanium.UI.createOptionDialog();
        postDialog.options = btn_tt;
        postDialog.show();

        postDialog.addEventListener('click', function(ev) {
            if (ev.index == btn_tt.length - 1) {

            }
            else if (ev.index != -1) {
                openEditScreen(btn_id[ev.index]);
            }
        });

    });

    //Check is node editable or not
    var arr = (isEditEnabled == true) ? [back, space, label, space, edit] : ((Ti.Platform.osname == 'ipad') ? [back, space, label, space] : [back, label, space])

    // create and add toolbar
    var toolbar = Ti.UI.iOS.createToolbar({
        items : arr,
        top : 0,
        borderTop : false,
        borderBottom : true
    });
    curWin.add(toolbar);

};

