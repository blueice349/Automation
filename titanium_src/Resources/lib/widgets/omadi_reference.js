var widget = JSON.parse(field_arr[index_label][index_size].widget);
var settings = JSON.parse(field_arr[index_label][index_size].settings);
var can_view = false;
var can_edit = false;

if (settings['enforce_permissions'] != null && settings['enforce_permissions'] == 1) {
    var _l;
    for (_l in settings.permissions) {
        for (_k in roles) {
            if (_l == _k) {
                var stringifyObj = JSON.stringify(settings.permissions[_l]);
                if (stringifyObj.indexOf('update') >= 0 || settings.permissions[_l]["all_permissions"]) {
                    can_edit = true;
                }

                if (stringifyObj.indexOf('view') >= 0 || settings.permissions[_l]["all_permissions"]) {
                    can_view = true;
                }

            }
        }
    }
}
else {
    can_view = can_edit = true;
}

if (!can_view) {
    break;
}

label[count] = Ti.UI.createLabel({
    text : ( isRequired ? '*' : '') + field_arr[index_label][index_size].label,
    color : isRequired ? 'red' : _lb_color,
    font : {
        fontSize : fieldFontSize,
        fontWeight : 'bold'
    },
    textAlign : 'left',
    width : Ti.Platform.displayCaps.platformWidth - 30,
    touchEnabled : false,
    height : heightValue,
    top : top
});
top += heightValue;

var reffer_index = count;
data_terms = new Array();
aux_nodes = new Array();

var i;
for (i in settings.reference_types) {
    aux_nodes.push(settings.reference_types[i]);
}

if (aux_nodes.length > 0) {
    var secondary = 'SELECT * FROM node WHERE ';
    var i;
    for ( i = 0; i < aux_nodes.length; i++) {
        if (i == aux_nodes.length - 1) {
            secondary += ' table_name = \'' + aux_nodes[i] + '\' ';
        }
        else {
            secondary += ' table_name = \'' + aux_nodes[i] + '\' OR ';
        }
    }
    Ti.API.info(secondary);
    var db_bah = Omadi.utils.openMainDatabase();

    var nodes = db_bah.execute(secondary);
    Ti.API.info("Num of rows: " + nodes.rowCount);
    while (nodes.isValidRow()) {
        Ti.API.info('Title: ' + nodes.fieldByName('title') + ' NID: ' + nodes.fieldByName('nid'));
        data_terms.push({
            title : nodes.fieldByName('title'),
            nid : nodes.fieldByName('nid')
        });
        nodes.next();
    }
}

//Add fields:
regionView.add(label[count]);



    var vl_to_field = field_arr[index_label][index_size].actual_value;

    var aux_val = {
        title : "",
        vl : null
    };
    var h;
    for (h in data_terms) {
        if (data_terms[h].nid == vl_to_field) {
            aux_val.title = data_terms[h].title;
            aux_val.vl = data_terms[h].nid;
        }
    }

    Ti.API.info("-----------------     OMADI REFERENCE : " + aux_val.title + " NID: " + aux_val.vl);

    content[count] = Titanium.UI.createTextField({
        hintText : field_arr[index_label][index_size].label + ' ...',
        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        color : '#000000',
        height : (PLATFORM == 'android') ? heightTextField : heightValue,
        font : {
            fontSize : fieldFontSize
        },
        width : Ti.Platform.displayCaps.platformWidth - 30,
        top : top,
        field_type : field_arr[index_label][index_size].type,
        field_name : field_arr[index_label][index_size].field_name,
        terms : data_terms,
        restrict_new_autocomplete_terms : rest_up,
        fantasy_name : field_arr[index_label][index_size].label,
        nid : aux_val.vl,
        required : field_arr[index_label][index_size].required,
        is_title : field_arr[index_label][index_size].is_title,
        composed_obj : false,
        cardinality : settings.cardinality,
        value : aux_val.title,
        //first_time : true,
        lastValue : aux_val.title,
        reffer_index : reffer_index,
        settings : settings,
        changedFlag : 0,
        my_index : count,
        autocorrect : false,
        returnKeyType : Ti.UI.RETURNKEY_DONE,
        enabled : can_edit,
        editable : can_edit,
        touched : false,
        regionView : regionView
    });
    if (PLATFORM == 'android') {
        content[count].backgroundImage = '../images/textfield.png'
    }
    if (!can_edit) {
        content[count].backgroundImage = '';
        content[count].backgroundColor = '#BDBDBD';
        content[count].borderColor = 'gray';
        content[count].borderRadius = 10;
        content[count].color = '#848484';
        content[count].borderWidth = 1;
        content[count].paddingLeft = 3;
        content[count].paddingRight = 3;
        if (PLATFORM == 'android') {
            content[count].softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
        }
    }
    //AUTOCOMPLETE TABLE FOR OMADI REFERENCE FIELDS, cardinality = 1
    var autocomplete_table = Titanium.UI.createTableView({
        top : top + ((PLATFORM == 'android') ? heightTextField - 10 : heightValue),
        searchHidden : true,
        zIndex : 999,
        height : getScreenHeight() * 0.3,
        backgroundColor : '#FFFFFF',
        visible : false,
        borderColor : '#000',
        borderWidth : 0
    });
    content[count].autocomplete_table = autocomplete_table;
    top += (PLATFORM == 'android') ? heightTextField : heightValue;

    regionView.add(content[count].autocomplete_table);

    //
    // TABLE EVENTS FOR OMADI REFERENCE FIELDS, cardinality = 1
    //
    content[count].autocomplete_table.addEventListener('click', function(e) {
        if (PLATFORM != 'android') {
            e.source.textField.value = e.rowData.title;
            e.source.textField.nid = e.rowData.nid;
        }
        else {
            e.source.setValueF(e.rowData.title, e.rowData.nid);
        }

        setTimeout(function() {
            e.source.autocomplete_table.visible = false;
            e.source.autocomplete_table.borderWidth = 0;
            Ti.API.info(e.rowData.title + ' was selected!');
        }, 80);

    });

    content[count].addEventListener('blur', function(e) {
        e.source.autocomplete_table.visible = false;
        e.source.autocomplete_table.borderWidth = 0;
        if ((e.source.nid === null) && (e.source.value != "")) {
            if (PLATFORM == 'android') {
                Ti.UI.createNotification({
                    message : 'The field ' + e.source.fantasy_name + ' does not accept fields creation, select one of the list !',
                    duration : Ti.UI.NOTIFICATION_DURATION_LONG
                }).show();
            }
            else {
                alert('The field ' + e.source.fantasy_name + ' does not accept fields creation, select one of the list !');
            }
        }
        else {
            setDefaultValues(content, e);
            setRulesField(e.source);
        }
    });

    content[count].addEventListener('focus', function(e) {
        e.source.touched = true;
        adjustView(e.source.my_index, e.source.regionView.top + e.source.top - ((PLATFORM == 'android') ? heightTextField : heightValue));
    });

    //
    // SEARCH EVENTS omadi_reference, cardinality == 1
    //
    content[count].addEventListener('change', function(e) {
        if (e.source.touched === true) {
            e.source.nid = null;
            changedContentValue(e.source);
            //Ti.API.info('value: ' + e.source.lastValue + " " + e.source.value);
            if (e.source.lastValue != e.source.value) {
                var list = e.source.terms;
                var func = function setValueF(value_f, nid) {
                    e.source.value = value_f;
                    e.source.nid = nid;
                    //Ti.API.info('Value: ' + value_f + ' NID: ' + nid);
                };

                if ((e.value != null) && (e.value != '')) {
                    table_data = [];
                    e.source.nid = null;
                    var i;
                    for ( i = 0; i < list.length; i++) {
                        var rg = new RegExp(e.source.value, 'i');
                        if (list[i].title.search(rg) != -1) {
                            //Check match
                            if (e.source.value == list[i].title) {
                                e.source.nid = list[i].nid;
                            }
                            else {
                                e.source.nid = null;
                            }

                            //Create partial matching row
                            var row = Ti.UI.createTableViewRow({
                                height : getScreenHeight() * 0.10,
                                title : list[i].title,
                                nid : list[i].nid,
                                color : '#000000',
                                autocomplete_table : e.source.autocomplete_table,
                                setValueF : func,
                                textField : e.source
                            });
                            // apply rows to data array
                            table_data.push(row);
                        }
                    }
                    e.source.autocomplete_table.setData(table_data);
                    e.source.autocomplete_table.borderWidth = 1;
                    e.source.autocomplete_table.height = getScreenHeight() * 0.3;
                    if (table_data.length == 0) {
                        e.source.autocomplete_table.borderWidth = 0;
                    }
                    if (table_data.length < 3 && table_data.length > 0) {
                        e.source.autocomplete_table.height = (table_data.length == 1) ? getScreenHeight() * 0.1 : getScreenHeight() * 0.2;
                    }
                    e.source.autocomplete_table.scrollToTop(0, {
                        animated : false
                    });
                    viewContent.scrollTo(0, e.source.regionView.top + e.source.top - ((PLATFORM == 'android') ? heightTextField : heightValue));
                    if (table_data.length > 0) {
                        e.source.autocomplete_table.visible = true;
                    }
                    else {
                        e.source.autocomplete_table.visible = false;
                    }
                }
                else {
                    e.source.autocomplete_table.visible = false;
                    e.source.nid = null;
                }

            }
            //e.source.first_time = false;
        }
        e.source.lastValue = e.source.value;
    });
    //Add fields:
    regionView.add(content[count]);
    count++;


