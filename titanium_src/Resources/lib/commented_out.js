
function conditionalSetRequiredField(idx) {
    var entityArr = createEntityMultiple();
    var row_matches = [];
    if (content[idx].settings['criteria'] != null && content[idx].settings['criteria']['search_criteria'] != null) {
        usort(content[idx].settings['criteria']['search_criteria'], 'search_criteria_search_order');

        var row_idx;
        for (row_idx in content[idx].settings['criteria']['search_criteria']) {
            var criteria_row = content[idx].settings['criteria']['search_criteria'][row_idx];
            row_matches[row_idx] = false;
            var field_name = criteria_row.field_name;
            var search_operator = criteria_row.operator;
            var search_value = criteria_row.value;
            var node_values = [];
            if (entityArr[field_name] != null) {

                switch(entityArr[field_name][0]['field_type']) {
                    case 'text':
                    case 'text_long':
                    case 'link_field':
                    case 'phone':
                    case 'license_plate':
                    case 'location':
                    case 'vehicle_fields':
                    case 'number_integer':
                    case 'number_decimal':
                    case 'email':
                    case 'datestamp':
                    case 'omadi_reference':
                    case 'omadi_time':
                        for (idx1 in entityArr[field_name]) {
                            var elements = entityArr[field_name][idx1];
                            if (elements['value'] != null && elements['value'] != "") {
                                node_values.push(elements['value']);
                            }
                        }
                        if (search_operator == '__filled') {
                            var value_index;
                            for (value_index in node_values) {
                                node_value = node_values[value_index];
                                if (node_value != null && node_value != "") {
                                    row_matches[row_idx] = true;
                                }

                            }
                        }
                        else {
                            if (node_values == null || node_values == "" || node_values.length == 0) {
                                row_matches[row_idx] = true;
                            }
                            else {
                                var value_index;
                                for (value_index in node_values) {
                                    node_value = node_values[value_index];
                                    if (node_value == null || node_value == "") {
                                        row_matches[row_idx] = true;
                                    }

                                }
                            }
                        }
                        break;
                    case 'taxonomy_term_reference':
                    case 'user_reference':
                        for (idx1 in entityArr[field_name]) {
                            elements = entityArr[field_name][idx1];
                            if (elements['value'] != null && elements['value'] != "") {
                                node_values.push(elements['value']);
                            }
                        }

                        var search_value_arr = [];
                        if (!isArray(search_value)) {
                            var key;
                            for (key in search_value) {
                                if (search_value.hasOwnProperty(key)) {
                                    search_value_arr[key] = key;
                                }
                            }
                            search_value = search_value_arr;
                        }
                        else {
                            if (search_value.length == 0) {
                                row_matches[row_idx] = true;
                                break;
                            }
                        }
                        if (search_operator != null && search_operator == '!=') {
                            row_matches[row_idx] = true;
                            if (search_value['__null'] == '__null' && (node_values == null || node_values[0] == null)) {
                                row_matches[row_idx] = false;
                            }
                            else {
                                for (idx1 in search_value) {
                                    chosen_value = search_value[idx1];
                                    if (in_array(chosen_value, node_values)) {
                                        row_matches[row_idx] = false;
                                    }
                                }

                            }
                        }
                        else if (search_operator == '=') {
                            if (search_value['__null'] == '__null' && (node_values == null || node_values[0] == null)) {
                                row_matches[row_idx] = true;
                            }
                            else {
                                for (idx1 in search_value) {
                                    chosen_value = search_value[idx1];
                                    if (in_array(chosen_value, node_values)) {
                                        row_matches[row_idx] = true;
                                    }
                                }
                            }
                        }

                        break;

                    case 'list_boolean':

                        for (idx1 in entityArr[field_name]) {
                            var elements = entityArr[field_name][idx1];
                            node_values.push(elements['value']);
                        }

                        if (search_operator == '__filled') {
                            var value_index;
                            for (value_index in node_values) {
                                node_value = node_values[value_index];
                                if (node_value != 0) {
                                    row_matches[row_idx] = true;
                                }

                            }
                        }
                        else {
                            if (node_values == null || node_values == "" || node_values.length == 0) {
                                row_matches[row_idx] = true;
                            }
                            else {
                                var value_index;
                                for (value_index in node_values) {
                                    node_value = node_values[value_index];
                                    if (node_value == 0) {
                                        row_matches[row_idx] = true;
                                    }

                                }
                            }
                        }
                        break;

                    case 'calculation_field':
                        for (idx1 in entityArr[field_name]) {
                            var elements = entityArr[field_name][idx1];
                            node_values.push(elements['value']);
                        }
                        node_value = node_values[0];
                        switch(search_operator) {

                            case '>':
                                if (node_value > search_value) {
                                    row_matches[row_idx] = true;
                                }
                                break;
                            case '>=':
                                if (node_value >= search_value) {
                                    row_matches[row_idx] = true;
                                }
                                break;
                            case '!=':
                                if (node_value != search_value) {
                                    row_matches[row_idx] = true;
                                }
                                break;
                            case '<':
                                if (node_value < search_value) {
                                    row_matches[row_idx] = true;
                                }
                                break;
                            case '<=':
                                if (node_value <= search_value) {
                                    row_matches[row_idx] = true;
                                }
                                break;

                            default:
                                if (node_value == search_value) {
                                    row_matches[row_idx] = true;
                                }
                                break;
                        }

                        break;

                }
            }
        }

        var retval = true;
        if (count_arr_obj(content[idx].settings['criteria']['search_criteria']) == 1) {
            retval = row_matches[0];
        }
        else {
            // Group each criteria row into groups of ors with the matching result of each or
            var and_groups = new Array();
            var and_group_index = 0;
            and_groups[and_group_index] = new Array();
            //print_r($criteria['search_criteria']);
            for (criteria_index in content[idx].settings['criteria']['search_criteria']) {
                criteria_row = content[idx].settings['criteria']['search_criteria'][criteria_index];
                if (criteria_index == 0) {
                    and_groups[and_group_index][0] = row_matches[criteria_index];
                }
                else {
                    if (criteria_row['row_operator'] == null || criteria_row['row_operator'] != 'or') {
                        and_group_index++;
                        and_groups[and_group_index] = new Array();
                    }
                    and_groups[and_group_index][0] = row_matches[criteria_index];
                }
            }

            // Get the final result, making sure each and group is TRUE
            for (idx1 in and_groups) {
                and_group = and_groups[idx1];
                and_group_match = false;
                for (idx1 in and_group) {
                    or_match = and_group[idx1];
                    // Make sure at least one item in an and group is true (or the only item is true)
                    if (or_match) {
                        and_group_match = true;
                        break;
                    }
                }

                // If one and group doesn't match the whole return value of this function is false
                if (!and_group_match) {
                    retval = false;
                    break;
                }
            }
        }
        if (retval) {
            if (content[idx].required != 'true' && content[idx].required != true && content[idx].required != 1) {
                label[content[idx].reffer_index].text = '*' + label[content[idx].reffer_index].text;
                label[content[idx].reffer_index].color = 'red';
                content[idx].required = true;
            }
        }
        else {
            if (content[idx].required == 'true' || content[idx].required == true || content[idx].required == 1) {
                label[content[idx].reffer_index].text = label[content[idx].reffer_index].text.substring(1, label[content[idx].reffer_index].text.length);
                label[content[idx].reffer_index].color = _lb_color;
                content[idx].required = false;
            }
        }
    }
}



create_or_edit_node.loadUI = function() {

    toolActInd.show();
    db_display = null;
    regions = null;
    fields_result = null;
    bundle_titles = null;
    content_fields = null;
    label = null;
    content = null;
    border = null;
    values_query = null;
    field_arr = null;
    unsorted_res = null;
    field_arr = new Array();
    unsorted_res = new Array();
    label = new Array();
    content = new Array();
    border = new Array();
    values_query = new Array();
    count = 0;
    title = 0;
    //movement = win.movement;
    omadi_session_details = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
    roles = omadi_session_details.user.roles;
    db_display = Omadi.utils.openMainDatabase();
    regions = db_display.execute('SELECT * FROM regions WHERE node_type = "' + win.type + '" ORDER BY weight ASC');
    if (win.mode == 1) {
        var node_table = db_display.execute('SELECT * FROM node WHERE nid=' + win.nid);
        if (node_table.rowCount > 0) {
            var no_data_fields = node_table.fieldByName('no_data_fields');
            if (no_data_fields != null && no_data_fields != "") {
                no_data_fields = JSON.parse(no_data_fields);
                var key;
                for (key in no_data_fields) {
                    if (no_data_fields.hasOwnProperty(key)) {
                        no_data_fieldsArr.push(key);
                    }
                }
            }
        }
    }

    // if(win.mode == 1){
    // win.addEventListener('open', function(e){
    // Ti.API.info("window opened");
    // setNodeViewed(e.source.nid);
    // });
    // }

    var y = 0;
    var regionCount = 0;
    var expandedRegion = 0;
    while (regions.isValidRow()) {
        var reg_settings = JSON.parse(regions.fieldByName('settings'));

        if (reg_settings != null && parseInt(reg_settings.form_part) > win.region_form) {
            Ti.API.info('Region : ' + regions.fieldByName('label') + ' won\'t appear');
        }
        else {
            // var arrow_img = Ti.UI.createImageView({
                // image : '/images/light_arrow_left.png',
                // width : DPUnitsToPixels(29),
                // height : DPUnitsToPixels(29),
                // top : DPUnitsToPixels(y + 5),
                // right : DPUnitsToPixels(5),
                // zIndex : 999
            // });
// 
            // var regionHeader = Ti.UI.createLabel({
                // text : regions.fieldByName('label').toUpperCase(),
                // color : '#ddd',
                // font : {
                    // fontSize : "18dp",
                    // fontWeight : 'bold'
                // },
                // textAlign : 'center',
                // width : '100%',
                // height : DPUnitsToPixels(40),
                // top : y,
                // ellipsize : true,
                // wordWrap : false,
                // zIndex : 998,
                // backgroundGradient : {
                    // type : 'linear',
                    // startPoint : {
                        // x : '50%',
                        // y : '0%'
                    // },
                    // endPoint : {
                        // x : '50%',
                        // y : '100%'
                    // },
                    // colors : [{
                        // color : '#555',
                        // offset : 0.0
                    // }, {
                        // color : '#666',
                        // offset : 0.3
                    // }, {
                        // color : '#333',
                        // offset : 1.0
                    // }],
                // }
            // });
            y = y + DPUnitsToPixels(50);

            var regionView = Ti.UI.createView({
                width : '100%',
                top : y,
                backgroundColor : '#EEEEEE',
                zIndex : 0
            });

            regionHeader.arrow = arrow_img;
            regionHeader.viewContainer = regionView;
            regionHeader.addEventListener('click', function(e) {
                e.source.viewContainer.expanded = !e.source.viewContainer.expanded;
                if (e.source.viewContainer.expanded === true) {
                    e.source.viewContainer.height = e.source.viewContainer.calculatedHeight;
                    var top = 0;
                    var i;
                    for ( i = 0; i < viewContent.getChildren().length; i++) {
                        var v = viewContent.getChildren()[i];
                        var isLabel = false;
                        if (PLATFORM == 'android') {
                            if ( v instanceof Ti.UI.Label) {
                                isLabel = true;
                            }
                        }
                        else {
                            if (v == '[object TiUILabel]') {
                                isLabel = true;
                            }
                        }
                        if (isLabel) {
                            v.top = top;
                            v.arrow.top = top + 5;
                            if (v.viewContainer.expanded === true) {
                                v.arrow.image = "/images/light_arrow_down.png";
                            }
                            else {
                                v.arrow.image = "/images/light_arrow_left.png";
                            }
                            top = top + DPUnitsToPixels(40);
                            v.viewContainer.top = top;
                            top = top + v.viewContainer.height + 10;
                            e.source.viewContainer.show();
                        }
                    }
                }
                else {
                    e.source.viewContainer.height = 0;
                    e.source.viewContainer.hide();
                    var top = 0;
                    var i;
                    for ( i = 0; i < viewContent.getChildren().length; i++) {
                        var v = viewContent.getChildren()[i];
                        var isLabel = false;
                        if (PLATFORM == 'android') {
                            if ( v instanceof Ti.UI.Label) {
                                isLabel = true;
                            }
                        }
                        else {
                            if (v == '[object TiUILabel]') {
                                isLabel = true;
                            }
                        }
                        if (isLabel) {
                            v.top = top;
                            v.arrow.top = top + 5;
                            if (v.viewContainer.expanded === true) {
                                v.arrow.image = "/images/light_arrow_down.png";
                            }
                            else {
                                v.arrow.image = "/images/light_arrow_left.png";
                            }
                            top = top + DPUnitsToPixels(40);
                            v.viewContainer.top = top;
                            top = top + v.viewContainer.height + 10;
                        }
                    }
                }

                if (viewContent.getChildren() != null) {
                    var i;
                    for ( i = viewContent.getChildren().length - 1; i >= 0; i--) {
                        var v = viewContent.getChildren()[i];
                        var isLabel = false;
                        if (PLATFORM == 'android') {
                            if ( v instanceof Ti.UI.Label) {
                                isLabel = true;
                            }
                        }
                        else {
                            if (v == '[object TiUILabel]') {
                                isLabel = true;
                            }
                        }

                        if (isLabel == true && v.viewContainer.expanded == true) {
                            v.viewContainer.height = v.viewContainer.height + DPUnitsToPixels(30);
                            //(getScreenHeight() * 0.3);
                            break;
                        }
                        else if (isLabel == true && v.viewContainer.expanded == false) {
                            break;
                        }
                    }
                }
            });
            var regionName = regions.fieldByName('region_name');
            fields_result = db_display.execute('SELECT * FROM fields WHERE bundle = "' + win.type + '" AND region = "' + regionName + '" ORDER BY weight, id ASC');

            if (win.mode == 1) {

                content_fields = db_display.execute('SELECT * FROM ' + win.type + ' WHERE nid = "' + win.nid + '" ');
                //alert(content_fields.fieldByName)
            }

            var top = 10;
            var field_definer = 0;
            var index_size = 0;
            var partsArr = [];

            //If there is no field enabled for this region, then remove the header for this region after the end of loop.
            var isAnyEnabledField = false;

            var index_label = regions.fieldByName('label');
            while (fields_result.isValidRow()) {
                if (fields_result.fieldByName('disabled') == 0) {
                    isAnyEnabledField = true;
                    var widget = JSON.parse(fields_result.fieldByName('widget'));
                    var settings = JSON.parse(fields_result.fieldByName('settings'));

                    //Array of fields
                    // field_arr[label][length]
                    // field_arr[address][0], field_arr[address][1], field_arr[address][2]
                    ////
                    field_arr[index_label] = new Array();
                    if (win.mode == 1) {
                        field_arr[index_label][index_size] = {
                            label : fields_result.fieldByName('label'),
                            type : fields_result.fieldByName('type'),
                            required : fields_result.fieldByName('required'),
                            field_name : fields_result.fieldByName('field_name'),
                            settings : fields_result.fieldByName('settings'),
                            widget : fields_result.fieldByName('widget'),
                            fid : fields_result.fieldByName('fid'),
                            is_title : false,
                            actual_value : content_fields.fieldByName(fields_result.fieldByName('field_name'))
                        };
                    }
                    else {
                        field_arr[index_label][index_size] = {
                            label : fields_result.fieldByName('label'),
                            type : fields_result.fieldByName('type'),
                            required : fields_result.fieldByName('required'),
                            field_name : fields_result.fieldByName('field_name'),
                            settings : fields_result.fieldByName('settings'),
                            widget : fields_result.fieldByName('widget'),
                            fid : fields_result.fieldByName('fid'),
                            is_title : false,
                            actual_value : ""
                        };
                    }

                    var isRequired = false;
                    if (field_arr[index_label][index_size].required == true || field_arr[index_label][index_size].required == 'true' || field_arr[index_label][index_size].required == 1 || field_arr[index_label][index_size].required == '1') {
                        isRequired = true;
                    }

                    field_arr[index_label][index_size].label = field_arr[index_label][index_size].label.replace(/"/gi, '\'');

                    switch(field_arr[index_label][index_size].type) {

                        case 'license_plate':
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

                            var fi_name = field_arr[index_label][index_size].field_name;
                            var reffer_index = count;

                            fi_name = fi_name.split('___');
                            if (fi_name[1]) {
                                var i_name = fi_name[1];
                            }
                            else {
                                var i_name = fi_name[0];
                            }

                            i_name = i_name.charAt(0).toUpperCase() + i_name.slice(1);
                            //Add fields:
                            regionView.add(label[count]);

                            if (settings.cardinality > 1) {
                                if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                    var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                    //Decode the stored array:
                                    var decoded = array_cont.fieldByName('encoded_array');
                                    decoded = Base64.decode(decoded);
                                    Ti.API.info('Decoded array is equals to: ' + decoded);
                                    decoded = decoded.toString();

                                    // Token that splits each element contained into the array: 'j8Oc2s1E'
                                    var decoded_values = decoded.split("j8Oc2s1E");
                                }
                                else {
                                    var decoded_values = new Array();
                                    decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                }

                                var o_index;
                                for ( o_index = 0; o_index < settings.cardinality; o_index++) {

                                    if ((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
                                        var vl_to_field = decoded_values[o_index];
                                    }
                                    else {
                                        var vl_to_field = settings.state_default_value;
                                    }

                                    if (field_arr[index_label][index_size].field_name == "license_plate___state" || field_arr[index_label][index_size].field_name == "restriction_license_plate___state") {
                                        label[count].text += ' State';
                                        var arr_picker = [];
                                        var arr_opt = new Array();

                                        var aux_val = {
                                            cnt : 0,
                                            usps : null,
                                            title : " -- State -- "
                                        }

                                        //States
                                        arr_picker.push({
                                            title : " -- State -- ",
                                            usps : null
                                        });
                                        arr_picker.push({
                                            title : "Alabama",
                                            usps : "AL"
                                        });
                                        arr_picker.push({
                                            title : "Alaska",
                                            usps : "AK"
                                        });
                                        arr_picker.push({
                                            title : "Arizona",
                                            usps : "AZ"
                                        });
                                        arr_picker.push({
                                            title : "Arkansas",
                                            usps : "AR"
                                        });
                                        arr_picker.push({
                                            title : "California",
                                            usps : "CA"
                                        });
                                        arr_picker.push({
                                            title : "Colorado",
                                            usps : "CO"
                                        });
                                        arr_picker.push({
                                            title : "Connecticut",
                                            usps : "CT"
                                        });
                                        arr_picker.push({
                                            title : "Delaware",
                                            usps : "DE"
                                        });
                                        arr_picker.push({
                                            title : "Florida",
                                            usps : "FL"
                                        });
                                        arr_picker.push({
                                            title : "Georgia",
                                            usps : "GA"
                                        });
                                        arr_picker.push({
                                            title : "Hawaii",
                                            usps : "HI"
                                        });
                                        arr_picker.push({
                                            title : "Idaho",
                                            usps : "ID"
                                        });
                                        arr_picker.push({
                                            title : "Illinois",
                                            usps : "IL"
                                        });
                                        arr_picker.push({
                                            title : "Indiana",
                                            usps : "IN"
                                        });
                                        arr_picker.push({
                                            title : "Iowa",
                                            usps : "IA"
                                        });
                                        arr_picker.push({
                                            title : "Kansas",
                                            usps : "KS"
                                        });
                                        arr_picker.push({
                                            title : "Kentucky",
                                            usps : "KY"
                                        });
                                        arr_picker.push({
                                            title : "Louisiana",
                                            usps : "LA"
                                        });
                                        arr_picker.push({
                                            title : "Maine",
                                            usps : "ME"
                                        });
                                        arr_picker.push({
                                            title : "Maryland",
                                            usps : "MD"
                                        });
                                        arr_picker.push({
                                            title : "Massachusetts",
                                            usps : "MA"
                                        });
                                        arr_picker.push({
                                            title : "Michigan",
                                            usps : "MI"
                                        });
                                        arr_picker.push({
                                            title : "Minnesota",
                                            usps : "MN"
                                        });
                                        arr_picker.push({
                                            title : "Mississippi",
                                            usps : "MS"
                                        });
                                        arr_picker.push({
                                            title : "Missouri",
                                            usps : "MO"
                                        });
                                        arr_picker.push({
                                            title : "Montana",
                                            usps : "MT"
                                        });
                                        arr_picker.push({
                                            title : "Nebraska",
                                            usps : "NE"
                                        });
                                        arr_picker.push({
                                            title : "Nevada",
                                            usps : "NV"
                                        });
                                        arr_picker.push({
                                            title : "New Hampshire",
                                            usps : "NH"
                                        });
                                        arr_picker.push({
                                            title : "New Jersey",
                                            usps : "NJ"
                                        });
                                        arr_picker.push({
                                            title : "New Mexico",
                                            usps : "NM"
                                        });
                                        arr_picker.push({
                                            title : "New York",
                                            usps : "NY"
                                        });
                                        arr_picker.push({
                                            title : "North Carolina",
                                            usps : "NC"
                                        });
                                        arr_picker.push({
                                            title : "North Dakota",
                                            usps : "ND"
                                        });
                                        arr_picker.push({
                                            title : "Ohio",
                                            usps : "OH"
                                        });
                                        arr_picker.push({
                                            title : "Oklahoma",
                                            usps : "OK"
                                        });
                                        arr_picker.push({
                                            title : "Oregon",
                                            usps : "OR"
                                        });
                                        arr_picker.push({
                                            title : "Pennsylvania",
                                            usps : "PA"
                                        });
                                        arr_picker.push({
                                            title : "Rhode Island",
                                            usps : "RI"
                                        });
                                        arr_picker.push({
                                            title : "South Carolina",
                                            usps : "SC"
                                        });
                                        arr_picker.push({
                                            title : "South Dakota",
                                            usps : "SD"
                                        });
                                        arr_picker.push({
                                            title : "Tennessee",
                                            usps : "TN"
                                        });
                                        arr_picker.push({
                                            title : "Texas",
                                            usps : "TX"
                                        });
                                        arr_picker.push({
                                            title : "Utah",
                                            usps : "UT"
                                        });
                                        arr_picker.push({
                                            title : "Vermont",
                                            usps : "VT"
                                        });
                                        arr_picker.push({
                                            title : "Virginia",
                                            usps : "VA"
                                        });
                                        arr_picker.push({
                                            title : "Washington",
                                            usps : "WA"
                                        });
                                        arr_picker.push({
                                            title : "West Virginia",
                                            usps : "WV"
                                        });
                                        arr_picker.push({
                                            title : "Wisconsin",
                                            usps : "WI"
                                        });
                                        arr_picker.push({
                                            title : "Wyoming",
                                            usps : "WY"
                                        });

                                        var count_at = 0;
                                        //var to_row = new Array();
                                        var at;
                                        for (at in arr_picker) {
                                            // to_row.push(Ti.UI.createPickerRow({
                                            // title : arr_picker[at].title,
                                            // usps : arr_picker[at].usps
                                            // }));
                                            if (arr_picker[at].usps == vl_to_field) {
                                                aux_val.cnt = count_at;
                                                aux_val.title = arr_picker[at].title;
                                                aux_val.usps = arr_picker[at].usps;
                                            }
                                            arr_opt.push(arr_picker[at].title);
                                            count_at++;
                                        }

                                        //Compares where it is

                                        content[count] = Titanium.UI.createButton({
                                            borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                            private_index : o_index,
                                            width : Ti.Platform.displayCaps.platformWidth - 30,
                                            height : heightValue,
                                            arr_opt : arr_opt,
                                            arr_picker : arr_picker,
                                            title : aux_val.title,
                                            font : {
                                                fontSize : fieldFontSize
                                            },
                                            color : '#000000',
                                            top : top,
                                            selectionIndicator : true,
                                            field_type : field_arr[index_label][index_size].type,
                                            field_name : field_arr[index_label][index_size].field_name,
                                            required : field_arr[index_label][index_size].required,
                                            is_title : field_arr[index_label][index_size].is_title,
                                            value : aux_val.usps,
                                            composed_obj : true,
                                            cardinality : settings.cardinality,
                                            reffer_index : reffer_index,
                                            settings : settings,
                                            changedFlag : 0,
                                            enabled : can_edit
                                        });
                                        if (PLATFORM == 'android') {
                                            content[count].backgroundImage = '';
                                            content[count].backgroundColor = 'white';
                                            content[count].backgroundSelectedColor = '#2E64FE';
                                            content[count].borderColor = 'gray';
                                            content[count].borderRadius = 10;
                                            content[count].color = 'black';
                                            content[count].borderWidth = 1
                                        }
                                        if (!can_edit) {
                                            content[count].backgroundImage = '';
                                            content[count].backgroundColor = '#BDBDBD';
                                            content[count].borderColor = 'gray';
                                            content[count].borderRadius = 10;
                                            content[count].color = '#848484';
                                            content[count].borderWidth = 1
                                        }

                                        content[count].addEventListener('click', function(e) {
                                            //Ti.API.info('USPS: '+e.row.usps);
                                            //e.source.value = e.row.usps;
                                            var postDialog = Titanium.UI.createOptionDialog();
                                            postDialog.options = e.source.arr_opt;
                                            postDialog.cancel = -1;
                                            postDialog.show();

                                            postDialog.addEventListener('click', function(ev) {
                                                if (ev.index >= 0) {
                                                    e.source.title = e.source.arr_opt[ev.index];
                                                    e.source.value = e.source.arr_picker[ev.index].usps;
                                                }
                                                changedContentValue(e.source);
                                                noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                            });
                                        });
                                        top += heightValue;

                                        regionView.add(content[count]);
                                        count++;

                                    }
                                    else {
                                        label[count].text += ' #';
                                        content[count] = Ti.UI.createTextField({
                                            hintText : "#" + o_index + " " + label[count].text,
                                            private_index : o_index,
                                            reffer_index : reffer_index,
                                            borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                            textAlign : 'left',
                                            width : Ti.Platform.displayCaps.platformWidth - 30,
                                            height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                            maxLength : 10,
                                            font : {
                                                fontSize : fieldFontSize
                                            },
                                            color : '#000000',
                                            top : top,
                                            autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_ALL,
                                            field_type : field_arr[index_label][index_size].type,
                                            field_name : field_arr[index_label][index_size].field_name,
                                            required : field_arr[index_label][index_size].required,
                                            is_title : field_arr[index_label][index_size].is_title,
                                            composed_obj : true,
                                            cardinality : settings.cardinality,
                                            value : vl_to_field,
                                            settings : settings,
                                            changedFlag : 0,
                                            real_ind : count,
                                            autocorrect : false,
                                            returnKeyType : Ti.UI.RETURNKEY_DONE,
                                            enabled : can_edit,
                                            editable : can_edit
                                        });
                                    }
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
                                    top += (PLATFORM == 'android') ? heightTextField : heightValue;

                                    regionView.add(content[count]);
                                    content[count].addEventListener('change', function(e) {
                                        if (e.source.value.length > 10) {
                                            //e.source.value = e.source.value.substr(0, 10);
                                            //e.source.blur();
                                            e.source.setValue(e.source.value.substr(0, 10));
                                            e.source.setSelection(10, 10);
                                            e.source.setSoftKeyboardOnFocus(Ti.UI.Android.SOFT_KEYBOARD_DEFAULT_ON_FOCUS);
                                            e.source.blur();
                                            Ti.UI.Android.hideSoftKeyboard();
                                        }
                                        changedContentValue(e.source);
                                        noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                    });

                                    count++;
                                }
                            }
                            else {
                                if (field_arr[index_label][index_size].field_name == "license_plate___state" || field_arr[index_label][index_size].field_name == "restriction_license_plate___state") {

                                    label[count].text += ' State';
                                    var arr_picker = [];
                                    var arr_opt = new Array();

                                    var aux_val = {
                                        cnt : 0,
                                        usps : null,
                                        title : " -- State -- "
                                    }
                                    if (field_arr[index_label][index_size].actual_value != "" && field_arr[index_label][index_size].actual_value != "null" && field_arr[index_label][index_size].actual_value != null) {
                                    }
                                    else {
                                        field_arr[index_label][index_size].actual_value = settings.state_default_value;
                                    }
                                    Ti.API.info(settings.state_default_value);
                                    //States
                                    arr_picker.push({
                                        title : " -- State -- ",
                                        usps : null
                                    });
                                    arr_picker.push({
                                        title : "Alabama",
                                        usps : "AL"
                                    });
                                    arr_picker.push({
                                        title : "Alaska",
                                        usps : "AK"
                                    });
                                    arr_picker.push({
                                        title : "Arizona",
                                        usps : "AZ"
                                    });
                                    arr_picker.push({
                                        title : "Arkansas",
                                        usps : "AR"
                                    });
                                    arr_picker.push({
                                        title : "California",
                                        usps : "CA"
                                    });
                                    arr_picker.push({
                                        title : "Colorado",
                                        usps : "CO"
                                    });
                                    arr_picker.push({
                                        title : "Connecticut",
                                        usps : "CT"
                                    });
                                    arr_picker.push({
                                        title : "Delaware",
                                        usps : "DE"
                                    });
                                    arr_picker.push({
                                        title : "Florida",
                                        usps : "FL"
                                    });
                                    arr_picker.push({
                                        title : "Georgia",
                                        usps : "GA"
                                    });
                                    arr_picker.push({
                                        title : "Hawaii",
                                        usps : "HI"
                                    });
                                    arr_picker.push({
                                        title : "Idaho",
                                        usps : "ID"
                                    });
                                    arr_picker.push({
                                        title : "Illinois",
                                        usps : "IL"
                                    });
                                    arr_picker.push({
                                        title : "Indiana",
                                        usps : "IN"
                                    });
                                    arr_picker.push({
                                        title : "Iowa",
                                        usps : "IA"
                                    });
                                    arr_picker.push({
                                        title : "Kansas",
                                        usps : "KS"
                                    });
                                    arr_picker.push({
                                        title : "Kentucky",
                                        usps : "KY"
                                    });
                                    arr_picker.push({
                                        title : "Louisiana",
                                        usps : "LA"
                                    });
                                    arr_picker.push({
                                        title : "Maine",
                                        usps : "ME"
                                    });
                                    arr_picker.push({
                                        title : "Maryland",
                                        usps : "MD"
                                    });
                                    arr_picker.push({
                                        title : "Massachusetts",
                                        usps : "MA"
                                    });
                                    arr_picker.push({
                                        title : "Michigan",
                                        usps : "MI"
                                    });
                                    arr_picker.push({
                                        title : "Minnesota",
                                        usps : "MN"
                                    });
                                    arr_picker.push({
                                        title : "Mississippi",
                                        usps : "MS"
                                    });
                                    arr_picker.push({
                                        title : "Missouri",
                                        usps : "MO"
                                    });
                                    arr_picker.push({
                                        title : "Montana",
                                        usps : "MT"
                                    });
                                    arr_picker.push({
                                        title : "Nebraska",
                                        usps : "NE"
                                    });
                                    arr_picker.push({
                                        title : "Nevada",
                                        usps : "NV"
                                    });
                                    arr_picker.push({
                                        title : "New Hampshire",
                                        usps : "NH"
                                    });
                                    arr_picker.push({
                                        title : "New Jersey",
                                        usps : "NJ"
                                    });
                                    arr_picker.push({
                                        title : "New Mexico",
                                        usps : "NM"
                                    });
                                    arr_picker.push({
                                        title : "New York",
                                        usps : "NY"
                                    });
                                    arr_picker.push({
                                        title : "North Carolina",
                                        usps : "NC"
                                    });
                                    arr_picker.push({
                                        title : "North Dakota",
                                        usps : "ND"
                                    });
                                    arr_picker.push({
                                        title : "Ohio",
                                        usps : "OH"
                                    });
                                    arr_picker.push({
                                        title : "Oklahoma",
                                        usps : "OK"
                                    });
                                    arr_picker.push({
                                        title : "Oregon",
                                        usps : "OR"
                                    });
                                    arr_picker.push({
                                        title : "Pennsylvania",
                                        usps : "PA"
                                    });
                                    arr_picker.push({
                                        title : "Rhode Island",
                                        usps : "RI"
                                    });
                                    arr_picker.push({
                                        title : "South Carolina",
                                        usps : "SC"
                                    });
                                    arr_picker.push({
                                        title : "South Dakota",
                                        usps : "SD"
                                    });
                                    arr_picker.push({
                                        title : "Tennessee",
                                        usps : "TN"
                                    });
                                    arr_picker.push({
                                        title : "Texas",
                                        usps : "TX"
                                    });
                                    arr_picker.push({
                                        title : "Utah",
                                        usps : "UT"
                                    });
                                    arr_picker.push({
                                        title : "Vermont",
                                        usps : "VT"
                                    });
                                    arr_picker.push({
                                        title : "Virginia",
                                        usps : "VA"
                                    });
                                    arr_picker.push({
                                        title : "Washington",
                                        usps : "WA"
                                    });
                                    arr_picker.push({
                                        title : "West Virginia",
                                        usps : "WV"
                                    });
                                    arr_picker.push({
                                        title : "Wisconsin",
                                        usps : "WI"
                                    });
                                    arr_picker.push({
                                        title : "Wyoming",
                                        usps : "WY"
                                    });

                                    var count_at = 0;
                                    //var to_row = new Array();
                                    var at;
                                    for (at in arr_picker) {
                                        // to_row.push(Ti.UI.createPickerRow({
                                        // title : arr_picker[at].title,
                                        // usps : arr_picker[at].usps
                                        // }));
                                        if (arr_picker[at].usps == field_arr[index_label][index_size].actual_value) {
                                            aux_val.cnt = count_at;
                                            aux_val.title = arr_picker[at].title;
                                            aux_val.usps = arr_picker[at].usps;
                                        }
                                        arr_opt.push(arr_picker[at].title);
                                        count_at++;
                                    }

                                    //Compares where it is

                                    content[count] = Titanium.UI.createButton({
                                        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                        private_index : o_index,
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        height : heightValue,
                                        arr_opt : arr_opt,
                                        arr_picker : arr_picker,
                                        title : aux_val.title,
                                        font : {
                                            fontSize : fieldFontSize
                                        },
                                        color : '#000000',
                                        top : top,
                                        selectionIndicator : true,
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        required : field_arr[index_label][index_size].required,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        value : aux_val.usps,
                                        composed_obj : false,
                                        cardinality : settings.cardinality,
                                        reffer_index : reffer_index,
                                        settings : settings,
                                        changedFlag : 0,
                                        enabled : can_edit
                                    });
                                    if (PLATFORM == 'android') {
                                        content[count].backgroundImage = '';
                                        content[count].backgroundColor = 'white';
                                        content[count].backgroundSelectedColor = '#2E64FE';
                                        content[count].borderColor = 'gray';
                                        content[count].borderRadius = 10;
                                        content[count].color = 'black';
                                        content[count].borderWidth = 1;
                                    }
                                    if (!can_edit) {
                                        content[count].backgroundImage = '';
                                        content[count].backgroundColor = '#BDBDBD';
                                        content[count].borderColor = 'gray';
                                        content[count].borderRadius = 10;
                                        content[count].color = '#848484';
                                        content[count].borderWidth = 1;
                                    }

                                    content[count].addEventListener('click', function(e) {
                                        //Ti.API.info('USPS: '+e.row.usps);
                                        //e.source.value = e.row.usps;
                                        var postDialog = Titanium.UI.createOptionDialog();
                                        postDialog.options = e.source.arr_opt;
                                        postDialog.cancel = -1;
                                        postDialog.show();

                                        postDialog.addEventListener('click', function(ev) {
                                            if (ev.index >= 0) {
                                                e.source.title = e.source.arr_opt[ev.index];
                                                e.source.value = e.source.arr_picker[ev.index].usps;
                                            }
                                            changedContentValue(e.source);
                                            noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                        });
                                    });
                                    top += heightValue;

                                    regionView.add(content[count]);
                                    count++;
                                }
                                else {
                                    label[count].text += ' #';
                                    content[count] = Ti.UI.createTextField({
                                        hintText : label[count].text,
                                        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                        textAlign : 'left',
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                        maxLength : 10,
                                        font : {
                                            fontSize : fieldFontSize
                                        },
                                        color : '#000000',
                                        top : top,
                                        autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_ALL,
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        required : field_arr[index_label][index_size].required,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        composed_obj : false,
                                        cardinality : settings.cardinality,
                                        value : field_arr[index_label][index_size].actual_value,
                                        reffer_index : reffer_index,
                                        settings : settings,
                                        changedFlag : 0,
                                        real_ind : count,
                                        autocorrect : false,
                                        returnKeyType : Ti.UI.RETURNKEY_DONE,
                                        enabled : can_edit,
                                        editable : can_edit
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
                                    top += (PLATFORM == 'android') ? heightTextField : heightValue;

                                    regionView.add(content[count]);
                                    content[count].addEventListener('change', function(e) {
                                        if (e.source.value.length > 10) {
                                            //e.source.value = e.source.value.substr(0, 10);
                                            //
                                            e.source.setValue(e.source.value.substr(0, 10));
                                            e.source.setSelection(10, 10);
                                        }
                                        changedContentValue(e.source);
                                        noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                    });

                                    count++;
                                }
                            }
                            //No data checkbox functionality
                            if (settings.parts != null && settings.parts != "") {
                                partsArr.push(reffer_index);
                                if (partsArr.length == 2) {
                                    content[reffer_index].partsArr = partsArr;
                                    partsArr = [];
                                    noDataCheckbox(reffer_index, regionView, top);
                                    if (content[reffer_index].noDataView != null) {
                                        top += 40;
                                    }
                                }
                            }

                            break;

                        case 'link_field':
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
                            //Add fields:
                            regionView.add(label[count]);
                            var reffer_index = count;

                            var _min = null;
                            var _max = null;

                            if (settings.cardinality > 1) {
                                if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                    var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                    //Decode the stored array:
                                    var decoded = array_cont.fieldByName('encoded_array');
                                    decoded = Base64.decode(decoded);
                                    Ti.API.info('Decoded array is equals to: ' + decoded);
                                    decoded = decoded.toString();

                                    // Token that splits each element contained into the array: 'j8Oc2s1E'
                                    var decoded_values = decoded.split("j8Oc2s1E");
                                }
                                else {
                                    var decoded_values = new Array();
                                    decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                }

                                var o_index;
                                for ( o_index = 0; o_index < settings.cardinality; o_index++) {

                                    if ((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
                                        var vl_to_field = decoded_values[o_index];
                                    }
                                    else {
                                        var vl_to_field = "";
                                    }

                                    content[count] = Ti.UI.createTextField({
                                        hintText : "#" + o_index + " " + field_arr[index_label][index_size].label,
                                        private_index : o_index,
                                        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                        textAlign : 'left',
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                        font : {
                                            fontSize : fieldFontSize
                                        },
                                        color : '#000000',
                                        top : top,
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        required : field_arr[index_label][index_size].required,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        composed_obj : true,
                                        cardinality : settings.cardinality,
                                        value : vl_to_field,
                                        reffer_index : reffer_index,
                                        settings : settings,
                                        changedFlag : 0,
                                        autocorrect : false,
                                        returnKeyType : Ti.UI.RETURNKEY_DONE,
                                        enabled : can_edit
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
                                    top += (PLATFORM == 'android') ? heightTextField : heightValue;

                                    regionView.add(content[count]);
                                    content[count].addEventListener('change', function(e) {
                                        changedContentValue(e.source);
                                        noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                                    });

                                    count++;
                                }
                            }
                            else {
                                content[count] = Ti.UI.createTextField({
                                    hintText : field_arr[index_label][index_size].label,
                                    borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                    textAlign : 'left',
                                    width : Ti.Platform.displayCaps.platformWidth - 30,
                                    height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                    font : {
                                        fontSize : fieldFontSize
                                    },
                                    color : '#000000',
                                    top : top,
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    required : field_arr[index_label][index_size].required,
                                    is_title : field_arr[index_label][index_size].is_title,
                                    composed_obj : false,
                                    cardinality : settings.cardinality,
                                    value : field_arr[index_label][index_size].actual_value,
                                    reffer_index : reffer_index,
                                    settings : settings,
                                    changedFlag : 0,
                                    autocorrect : false,
                                    returnKeyType : Ti.UI.RETURNKEY_DONE,
                                    enabled : can_edit
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
                                top += (PLATFORM == 'android') ? heightTextField : heightValue;

                                regionView.add(content[count]);
                                content[count].addEventListener('change', function(e) {
                                    changedContentValue(e.source);
                                    noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                                });
                                count++;
                            }
                            //No data checkbox functionality
                            noDataCheckbox(reffer_index, regionView, top);
                            if (content[reffer_index].noDataView != null) {
                                top += 40;
                            }
                            break;

                        case 'text':
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

                            //Add fields:
                            regionView.add(label[count]);
                            var reffer_index = count;
                            var _min = null;
                            var _max = null;

                            if (settings.min_length && settings.min_length != null && settings.min_length != "null") {
                                _min = settings.min_length
                            }

                            if (settings.max_length && settings.max_length != null && settings.max_length != "null") {
                                _max = settings.max_length
                            }

                            if (settings.cardinality > 1) {
                                if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                    var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                    //Decode the stored array:
                                    var decoded = array_cont.fieldByName('encoded_array');
                                    decoded = Base64.decode(decoded);
                                    Ti.API.info('Decoded array is equals to: ' + decoded);
                                    decoded = decoded.toString();

                                    // Token that splits each element contained into the array: 'j8Oc2s1E'
                                    var decoded_values = decoded.split("j8Oc2s1E");
                                }
                                else {
                                    var decoded_values = new Array();
                                    decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                }

                                var o_index;
                                for ( o_index = 0; o_index < settings.cardinality; o_index++) {

                                    if ((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
                                        var vl_to_field = decoded_values[o_index];
                                    }
                                    else {
                                        var vl_to_field = "";
                                    }

                                    content[count] = Ti.UI.createTextField({
                                        hintText : "#" + o_index + " " + field_arr[index_label][index_size].label,
                                        private_index : o_index,
                                        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                        textAlign : 'left',
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                        font : {
                                            fontSize : fieldFontSize
                                        },
                                        color : '#000000',
                                        top : top,
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        required : field_arr[index_label][index_size].required,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        composed_obj : true,
                                        cardinality : settings.cardinality,
                                        value : vl_to_field,
                                        reffer_index : reffer_index,
                                        settings : settings,
                                        changedFlag : 0,
                                        my_min : _min,
                                        my_max : _max,
                                        real_ind : count,
                                        autocorrect : false,
                                        returnKeyType : Ti.UI.RETURNKEY_DONE,
                                        enabled : can_edit,
                                        editable : can_edit
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
                                    if (_max != null) {
                                        content[count].maxLength = _max;
                                    }
                                    top += (PLATFORM == 'android') ? heightTextField : heightValue;

                                    regionView.add(content[count]);
                                    content[count].addEventListener('change', function(e) {
                                        if (e.source.my_max != null && e.source.my_max != "" && e.source.value.length > e.source.my_max) {
                                            //e.source.value = e.source.value.substr(0, e.source.my_max);
                                            //e.source.blur();
                                            e.source.value = e.source.value.substr(0, e.source.my_max);
                                            e.source.setSelection(e.source.my_max, e.source.my_max);

                                            //Ti.UI.Android.hideSoftKeyboard();

                                        }
                                        changedContentValue(e.source);
                                        noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                                    });

                                    content[count].addEventListener('blur', function(e) {
                                        Ti.API.info(e.source.value.length + ' or ' + e.value.length + ' Field number ==> min: ' + e.source.my_min + ' max: ' + e.source.my_max);
                                        if (e.source.value != null && e.source.value != "") {
                                            if (e.source.my_max != null && e.source.my_min != null) {
                                                if (parseFloat(e.source.value.length) < parseFloat(e.source.my_min)) {
                                                    var _a = Titanium.UI.createAlertDialog({
                                                        title : 'Omadi',
                                                        message : 'The minimum for this field is ' + e.source.my_min,
                                                        buttonNames : ['OK']
                                                    });

                                                    _a.show();

                                                    _a.addEventListener('click', function(evt) {
                                                        content[e.source.real_ind].focus();
                                                    });

                                                }
                                                else if (parseFloat(e.source.value.length) > parseFloat(e.source.my_max)) {
                                                    var _a = Titanium.UI.createAlertDialog({
                                                        title : 'Omadi',
                                                        message : "The maximum for this field is " + e.source.my_max,
                                                        buttonNames : ['OK']
                                                    });

                                                    _a.show();

                                                    _a.addEventListener('click', function(evt) {
                                                        content[e.source.real_ind].focus();
                                                    });
                                                }
                                                else {
                                                    //value is ok
                                                }
                                            }
                                            else if (e.source.my_max != null) {
                                                if (parseFloat(e.source.value.length) > parseFloat(e.source.my_max)) {
                                                    var _a = Titanium.UI.createAlertDialog({
                                                        title : 'Omadi',
                                                        message : "The maximum for this field is " + e.source.my_max,
                                                        buttonNames : ['OK']
                                                    });

                                                    _a.show();

                                                    _a.addEventListener('click', function(evt) {
                                                        content[e.source.real_ind].focus();
                                                    });
                                                }
                                                else {
                                                    //value is ok
                                                }
                                            }
                                            else if (e.source.my_min != null) {
                                                if (parseFloat(e.source.value.length) < parseFloat(e.source.my_min)) {
                                                    var _a = Titanium.UI.createAlertDialog({
                                                        title : 'Omadi',
                                                        message : 'The minimum for this field is ' + e.source.my_min,
                                                        buttonNames : ['OK']
                                                    });

                                                    _a.show();

                                                    _a.addEventListener('click', function(evt) {
                                                        content[e.source.real_ind].focus();
                                                    });
                                                }
                                                else {
                                                    //value is ok
                                                }
                                            }
                                            else {
                                                //No min or max sets
                                            }
                                        }
                                    });
                                    count++;
                                }
                            }
                            else {
                                content[count] = Ti.UI.createTextField({
                                    hintText : field_arr[index_label][index_size].label,
                                    borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                    textAlign : 'left',
                                    width : Ti.Platform.displayCaps.platformWidth - 30,
                                    height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                    font : {
                                        fontSize : fieldFontSize
                                    },
                                    color : '#000000',
                                    top : top,
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    required : field_arr[index_label][index_size].required,
                                    is_title : field_arr[index_label][index_size].is_title,
                                    composed_obj : false,
                                    cardinality : settings.cardinality,
                                    value : field_arr[index_label][index_size].actual_value,
                                    reffer_index : reffer_index,
                                    settings : settings,
                                    changedFlag : 0,
                                    my_min : _min,
                                    my_max : _max,
                                    real_ind : count,
                                    autocorrect : false,
                                    returnKeyType : Ti.UI.RETURNKEY_DONE,
                                    enabled : can_edit,
                                    editable : can_edit
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

                                if (_max != null) {
                                    content[count].maxLength = _max;
                                }

                                top += (PLATFORM == 'android') ? heightTextField : heightValue;

                                regionView.add(content[count]);
                                content[count].addEventListener('change', function(e) {
                                    if (e.source.my_max != null && e.source.my_max != "" && e.source.value.length >= e.source.my_max) {
                                        //for(i in e.source){
                                        //  Ti.API.debug(i + ": " + e.source[i]);
                                        //}

                                        e.source.value = e.source.value.substr(0, e.source.my_max);
                                        //e.source.setValue(e.source.value.substr(0, e.source.my_max));
                                        e.source.setSelection(e.source.my_max, e.source.my_max);
                                        //e.source.setSoftKeyboardOnFocus(Ti.UI.Android.SOFT_KEYBOARD_DEFAULT_ON_FOCUS);
                                        //e.source.blur();
                                        //Ti.UI.Android.hideSoftKeyboard();
                                    }
                                    changedContentValue(e.source);
                                    noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                                });

                                content[count].addEventListener('blur', function(e) {
                                    Ti.API.info(e.source.value.length + ' or ' + e.value.length + ' Field number ==> min: ' + e.source.my_min + ' max: ' + e.source.my_max);
                                    if (e.source.value != null && e.source.value != "") {
                                        if (e.source.my_max != null && e.source.my_min != null) {
                                            if (parseFloat(e.source.value.length) < parseFloat(e.source.my_min)) {
                                                var _a = Titanium.UI.createAlertDialog({
                                                    title : 'Omadi',
                                                    message : 'The minimum for this field is ' + e.source.my_min,
                                                    buttonNames : ['OK']
                                                });

                                                _a.show();

                                                _a.addEventListener('click', function(evt) {
                                                    content[e.source.real_ind].focus();
                                                });

                                            }
                                            else if (parseFloat(e.source.value.length) > parseFloat(e.source.my_max)) {
                                                var _a = Titanium.UI.createAlertDialog({
                                                    title : 'Omadi',
                                                    message : "The maximum for this field is " + e.source.my_max,
                                                    buttonNames : ['OK']
                                                });

                                                _a.show();

                                                _a.addEventListener('click', function(evt) {
                                                    content[e.source.real_ind].focus();
                                                });
                                            }
                                            else {
                                                //value is ok
                                            }
                                        }
                                        else if (e.source.my_max != null) {
                                            if (parseFloat(e.source.value.length) > parseFloat(e.source.my_max)) {
                                                var _a = Titanium.UI.createAlertDialog({
                                                    title : 'Omadi',
                                                    message : "The maximum for this field is " + e.source.my_max,
                                                    buttonNames : ['OK']
                                                });

                                                _a.show();

                                                _a.addEventListener('click', function(evt) {
                                                    content[e.source.real_ind].focus();
                                                });
                                            }
                                            else {
                                                //value is ok
                                            }
                                        }
                                        else if (e.source.my_min != null) {
                                            if (parseFloat(e.source.value.length) < parseFloat(e.source.my_min)) {
                                                var _a = Titanium.UI.createAlertDialog({
                                                    title : 'Omadi',
                                                    message : 'The minimum for this field is ' + e.source.my_min,
                                                    buttonNames : ['OK']
                                                });

                                                _a.show();

                                                _a.addEventListener('click', function(evt) {
                                                    content[e.source.real_ind].focus();
                                                });
                                            }
                                            else {
                                                //value is ok
                                            }
                                        }
                                        else {
                                            //No min or max sets
                                        }
                                    }
                                });
                                count++;
                            }
                            //No data checkbox functionality
                            noDataCheckbox(reffer_index, regionView, top);
                            if (content[reffer_index].noDataView != null) {
                                top += 40;
                            }

                            break;

                        case 'text_long':
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

                            //Add fields:
                            regionView.add(label[count]);
                            var reffer_index = count;
                            var _min = null;
                            var _max = null;

                            if (settings.min_length && settings.min_length != null && settings.min_length != "null") {
                                _min = settings.min_length
                            }

                            if (settings.max_length && settings.max_length != null && settings.max_length != "null") {
                                _max = settings.max_length
                            }

                            if (settings.cardinality > 1) {
                                if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                    var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                    //Decode the stored array:
                                    var decoded = array_cont.fieldByName('encoded_array');
                                    decoded = Base64.decode(decoded);
                                    Ti.API.info('Decoded array is equals to: ' + decoded);
                                    decoded = decoded.toString();

                                    // Token that splits each element contained into the array: 'j8Oc2s1E'
                                    var decoded_values = decoded.split("j8Oc2s1E");
                                }
                                else {
                                    var decoded_values = new Array();
                                    decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                }

                                var o_index;
                                for ( o_index = 0; o_index < settings.cardinality; o_index++) {

                                    if ((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
                                        var vl_to_field = decoded_values[o_index];
                                    }
                                    else {
                                        var vl_to_field = "";
                                    }

                                    content[count] = Ti.UI.createTextField({
                                        hintText : "#" + o_index + " " + field_arr[index_label][index_size].label,
                                        private_index : o_index,
                                        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                        textAlign : 'left',
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        height : (PLATFORM == 'android') ? 2 * heightTextField : 100,
                                        color : '#000000',
                                        top : top,
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        required : field_arr[index_label][index_size].required,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        composed_obj : true,
                                        cardinality : settings.cardinality,
                                        value : vl_to_field,
                                        reffer_index : reffer_index,
                                        settings : settings,
                                        changedFlag : 0,
                                        my_min : _min,
                                        my_max : _max,
                                        real_ind : count,
                                        returnKeyType : Ti.UI.RETURNKEY_DONE,
                                        enabled : can_edit,
                                        editable : can_edit
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

                                    if (_max != null) {
                                        content[count].maxLength = _max;
                                    }
                                    top += (PLATFORM == 'android') ? 2 * heightTextField : 100;

                                    regionView.add(content[count]);
                                    content[count].addEventListener('change', function(e) {
                                        if (e.source.my_max != null && e.source.my_max != "" && e.source.value.length >= e.source.my_max) {
                                            //e.source.value = e.source.value.substr(0, e.source.my_max);
                                            //e.source.blur();
                                            e.source.value = e.source.value.substr(0, e.source.my_max);
                                            e.source.setSelection(e.source.my_max, e.source.my_max);
                                            //e.source.blur();
                                            //Ti.UI.Android.hideSoftKeyboard();
                                        }
                                        changedContentValue(e.source);
                                        noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                                    });

                                    content[count].addEventListener('blur', function(e) {
                                        Ti.API.info(e.source.value.length + ' or ' + e.value.length + ' Field number ==> min: ' + e.source.my_min + ' max: ' + e.source.my_max);
                                        if (e.source.value != null && e.source.value != "") {
                                            if (e.source.my_max != null && e.source.my_min != null) {
                                                if (parseFloat(e.source.value.length) < parseFloat(e.source.my_min)) {
                                                    var _a = Titanium.UI.createAlertDialog({
                                                        title : 'Omadi',
                                                        message : 'The minimum for this field is ' + e.source.my_min,
                                                        buttonNames : ['OK']
                                                    });

                                                    _a.show();

                                                    _a.addEventListener('click', function(evt) {
                                                        content[e.source.real_ind].focus();
                                                    });

                                                }
                                                else if (parseFloat(e.source.value.length) > parseFloat(e.source.my_max)) {
                                                    var _a = Titanium.UI.createAlertDialog({
                                                        title : 'Omadi',
                                                        message : "The maximum for this field is " + e.source.my_max,
                                                        buttonNames : ['OK']
                                                    });

                                                    _a.show();

                                                    _a.addEventListener('click', function(evt) {
                                                        content[e.source.real_ind].focus();
                                                    });
                                                }
                                                else {
                                                    //value is ok
                                                }
                                            }
                                            else if (e.source.my_max != null) {
                                                if (parseFloat(e.source.value.length) > parseFloat(e.source.my_max)) {
                                                    var _a = Titanium.UI.createAlertDialog({
                                                        title : 'Omadi',
                                                        message : "The maximum for this field is " + e.source.my_max,
                                                        buttonNames : ['OK']
                                                    });

                                                    _a.show();

                                                    _a.addEventListener('click', function(evt) {
                                                        content[e.source.real_ind].focus();
                                                    });
                                                }
                                                else {
                                                    //value is ok
                                                }
                                            }
                                            else if (e.source.my_min != null) {
                                                if (parseFloat(e.source.value.length) < parseFloat(e.source.my_min)) {
                                                    var _a = Titanium.UI.createAlertDialog({
                                                        title : 'Omadi',
                                                        message : 'The minimum for this field is ' + e.source.my_min,
                                                        buttonNames : ['OK']
                                                    });

                                                    _a.show();

                                                    _a.addEventListener('click', function(evt) {
                                                        content[e.source.real_ind].focus();
                                                    });
                                                }
                                                else {
                                                    //value is ok
                                                }
                                            }
                                            else {
                                                //No min or max sets
                                            }
                                        }
                                    });
                                    count++;
                                }
                            }
                            else {
                                content[count] = Ti.UI.createTextField({
                                    hintText : field_arr[index_label][index_size].label,
                                    borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                    textAlign : 'left',
                                    width : Ti.Platform.displayCaps.platformWidth - 30,
                                    height : (PLATFORM == 'android') ? 2 * heightTextField : 100,
                                    color : '#000000',
                                    top : top,
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    required : field_arr[index_label][index_size].required,
                                    is_title : field_arr[index_label][index_size].is_title,
                                    composed_obj : false,
                                    cardinality : settings.cardinality,
                                    value : field_arr[index_label][index_size].actual_value,
                                    reffer_index : reffer_index,
                                    settings : settings,
                                    changedFlag : 0,
                                    my_min : _min,
                                    my_max : _max,
                                    real_ind : count,
                                    returnKeyType : Ti.UI.RETURNKEY_DONE,
                                    enabled : can_edit,
                                    editable : can_edit
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
                                    content[count].paddingLeft = 3;
                                    content[count].paddingRight = 3;
                                    if (PLATFORM == 'android') {
                                        content[count].softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
                                    }
                                }
                                if (_max != null) {
                                    content[count].maxLength = _max;
                                }

                                top += (PLATFORM == 'android') ? 2 * heightTextField : 100;

                                regionView.add(content[count]);
                                content[count].addEventListener('change', function(e) {
                                    if (e.source.my_max != null && e.source.my_max != "" && e.source.value.length >= e.source.my_max) {
                                        //e.source.value = e.source.value.substr(0, e.source.my_max);
                                        //e.source.blur();
                                        e.source.value = e.source.value.substr(0, e.source.my_max);
                                        e.source.setSelection(e.source.my_max, e.source.my_max);
                                        //e.source.setSoftKeyboardOnFocus(Ti.UI.Android.SOFT_KEYBOARD_DEFAULT_ON_FOCUS);
                                        //e.source.blur();
                                        //Ti.UI.Android.hideSoftKeyboard();
                                    }
                                    changedContentValue(e.source);
                                    noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                                });

                                content[count].addEventListener('blur', function(e) {
                                    Ti.API.info(e.source.value.length + ' or ' + e.value.length + ' Field number ==> min: ' + e.source.my_min + ' max: ' + e.source.my_max);
                                    if (e.source.value != null && e.source.value != "") {
                                        if (e.source.my_max != null && e.source.my_min != null) {
                                            if (parseFloat(e.source.value.length) < parseFloat(e.source.my_min)) {
                                                var _a = Titanium.UI.createAlertDialog({
                                                    title : 'Omadi',
                                                    message : 'The minimum for this field is ' + e.source.my_min,
                                                    buttonNames : ['OK']
                                                });

                                                _a.show();

                                                _a.addEventListener('click', function(evt) {
                                                    content[e.source.real_ind].focus();
                                                });

                                            }
                                            else if (parseFloat(e.source.value.length) > parseFloat(e.source.my_max)) {
                                                var _a = Titanium.UI.createAlertDialog({
                                                    title : 'Omadi',
                                                    message : "The maximum for this field is " + e.source.my_max,
                                                    buttonNames : ['OK']
                                                });

                                                _a.show();

                                                _a.addEventListener('click', function(evt) {
                                                    content[e.source.real_ind].focus();
                                                });
                                            }
                                            else {
                                                //value is ok
                                            }
                                        }
                                        else if (e.source.my_max != null) {
                                            if (parseFloat(e.source.value.length) > parseFloat(e.source.my_max)) {
                                                var _a = Titanium.UI.createAlertDialog({
                                                    title : 'Omadi',
                                                    message : "The maximum for this field is " + e.source.my_max,
                                                    buttonNames : ['OK']
                                                });

                                                _a.show();

                                                _a.addEventListener('click', function(evt) {
                                                    content[e.source.real_ind].focus();
                                                });
                                            }
                                            else {
                                                //value is ok
                                            }
                                        }
                                        else if (e.source.my_min != null) {
                                            if (parseFloat(e.source.value.length) < parseFloat(e.source.my_min)) {
                                                var _a = Titanium.UI.createAlertDialog({
                                                    title : 'Omadi',
                                                    message : 'The minimum for this field is ' + e.source.my_min,
                                                    buttonNames : ['OK']
                                                });

                                                _a.show();

                                                _a.addEventListener('click', function(evt) {
                                                    content[e.source.real_ind].focus();
                                                });
                                            }
                                            else {
                                                //value is ok
                                            }
                                        }
                                        else {
                                            //No min or max sets
                                        }
                                    }
                                });
                                count++;
                            }
                            //No data checkbox functionality
                            noDataCheckbox(reffer_index, regionView, top);
                            if (content[reffer_index].noDataView != null) {
                                top += 40;
                            }
                            break;

                        case 'location':
                            var settings = JSON.parse(field_arr[index_label][index_size].settings);

                            //Set our auxiliar array
                            var aux_local = new Array;
                            var i;
                            for (i in settings.parts) {
                                aux_local.push(settings.parts[i]);
                            }

                            var title_location = "";

                            if (aux_local.length > 0) {
                                if (aux_local.length == field_definer) {
                                    field_definer = 0;
                                }
                                if (aux_local[field_definer]) {
                                    title_location = aux_local[field_definer];
                                    field_definer++;
                                }

                            }
                            else {
                                title_location = field_arr[index_label][index_size].label;
                                field_definer = 0;
                            }

                            label[count] = Ti.UI.createLabel({
                                text : ( isRequired ? '*' : '') + field_arr[index_label][index_size].label + " " + title_location,
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

                            //Add fields:
                            regionView.add(label[count]);

                            var reffer_index = count;

                            if (settings.cardinality > 1) {
                                if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                    var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                    //Decode the stored array:
                                    var decoded = array_cont.fieldByName('encoded_array');
                                    decoded = Base64.decode(decoded);
                                    Ti.API.info('Decoded array is equals to: ' + decoded);
                                    decoded = decoded.toString();

                                    // Token that splits each element contained into the array: 'j8Oc2s1E'
                                    var decoded_values = decoded.split("j8Oc2s1E");
                                }
                                else {
                                    var decoded_values = new Array();
                                    decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                }

                                var o_index;
                                for ( o_index = 0; o_index < settings.cardinality; o_index++) {

                                    if ((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
                                        var vl_to_field = decoded_values[o_index];
                                    }
                                    else {
                                        var vl_to_field = "";
                                    }

                                    content[count] = Ti.UI.createTextField({
                                        hintText : "#" + o_index + " " + field_arr[index_label][index_size].label + " " + title_location,
                                        private_index : o_index,
                                        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                        textAlign : 'left',
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                        font : {
                                            fontSize : fieldFontSize
                                        },
                                        color : '#000000',
                                        top : top,
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        required : field_arr[index_label][index_size].required,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        composed_obj : true,
                                        cardinality : settings.cardinality,
                                        value : vl_to_field,
                                        reffer_index : reffer_index,
                                        settings : settings,
                                        changedFlag : 0,
                                        autocorrect : false,
                                        returnKeyType : Ti.UI.RETURNKEY_DONE,
                                        enabled : true
                                    });
                                    if (PLATFORM == 'android') {
                                        content[count].backgroundImage = '../images/textfield.png'
                                    }
                                    top += (PLATFORM == 'android') ? heightTextField : heightValue;

                                    regionView.add(content[count]);
                                    content[count].addEventListener('change', function(e) {
                                        changedContentValue(e.source);
                                        noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                    });
                                    count++;
                                }
                            }
                            else {
                                content[count] = Ti.UI.createTextField({
                                    hintText : field_arr[index_label][index_size].label + " " + title_location,
                                    borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                    textAlign : 'left',
                                    width : Ti.Platform.displayCaps.platformWidth - 30,
                                    height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                    font : {
                                        fontSize : fieldFontSize
                                    },
                                    color : '#000000',
                                    top : top,
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    required : field_arr[index_label][index_size].required,
                                    is_title : field_arr[index_label][index_size].is_title,
                                    composed_obj : false,
                                    cardinality : settings.cardinality,
                                    value : field_arr[index_label][index_size].actual_value,
                                    reffer_index : reffer_index,
                                    settings : settings,
                                    changedFlag : 0,
                                    autocorrect : false,
                                    returnKeyType : Ti.UI.RETURNKEY_DONE,
                                    enabled : true,
                                    softKeyboardOnFocus : Ti.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS
                                });
                                if (PLATFORM == 'android') {
                                    content[count].backgroundImage = '../images/textfield.png'
                                }
                                top += (PLATFORM == 'android') ? heightTextField : heightValue;

                                regionView.add(content[count]);
                                content[count].addEventListener('change', function(e) {
                                    changedContentValue(e.source);
                                    noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                                });
                                count++;
                            }
                            //No data checkbox functionality
                            if (settings.parts != null && settings.parts != "") {
                                partsArr.push(reffer_index);
                                if (partsArr.length == 4) {
                                    content[reffer_index].partsArr = partsArr;
                                    partsArr = [];
                                    noDataCheckbox(reffer_index, regionView, top);
                                    if (content[reffer_index].noDataView != null) {
                                        top += 30;
                                    }
                                }
                            }

                            break;

                        case 'number_decimal':
                        case 'number_integer':
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

                            //Add fields:
                            regionView.add(label[count]);
                            var reffer_index = count;
                            var hasParent = false;
                            var parent_name = "";
                            var defaultField = "";
                            if (settings.parent_form_default_value) {
                                if (settings.parent_form_default_value.parent_field != null && settings.parent_form_default_value.parent_field != "") {
                                    hasParent = true;
                                    parent_name = settings.parent_form_default_value.parent_field;
                                    defaultField = settings.parent_form_default_value.default_value_field;
                                }
                            }
                            var _min = null;
                            var _max = null;

                            var minRange = (field_arr[index_label][index_size].type == 'number_integer') ? -2147483648 : -99999999;
                            var maxRange = (field_arr[index_label][index_size].type == 'number_integer') ? 2147483647 : 99999999;

                            if (settings.min && settings.min != null && settings.min != "null") {
                                _min = settings.min
                            }

                            if (settings.max && settings.max != null && settings.max != "null") {
                                _max = settings.max
                            }

                            Ti.API.info('********************** Field: ' + field_arr[index_label][index_size].label + ",  Cardinality: " + settings.cardinality);
                            if (settings.cardinality > 1) {

                                if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                    var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                    Ti.API.info('#######################################################################');
                                    Ti.API.info('Field: ' + field_arr[index_label][index_size].label + " Cardinality: " + settings.cardinality);

                                    //Decode the stored array:
                                    var decoded = array_cont.fieldByName('encoded_array');
                                    Ti.API.info('Encoded array is equals to: ' + decoded);
                                    decoded = Base64.decode(decoded);
                                    Ti.API.info('Decoded array is equals to: ' + decoded);
                                    decoded = decoded.toString();
                                    // Token that splits each element contained into the array: 'j8Oc2s1E'
                                    var decoded_values = decoded.split("j8Oc2s1E");
                                    Ti.API.info('Splited: ' + decoded_values);
                                    Ti.API.info('#######################################################################');
                                }
                                else {
                                    var decoded_values = new Array();
                                    decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                }

                                var o_index;
                                for ( o_index = 0; o_index < settings.cardinality; o_index++) {

                                    if ((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") && (decoded_values[o_index] != "null"))) {
                                        var vl_to_field = decoded_values[o_index];
                                    }
                                    else {
                                        var vl_to_field = null;
                                    }

                                    content[count] = Ti.UI.createTextField({
                                        hintText : "#" + o_index + " " + field_arr[index_label][index_size].label,
                                        private_index : o_index,
                                        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                        keyboardType : Titanium.UI.KEYBOARD_NUMBER_PAD,
                                        returnKeyType : Titanium.UI.RETURNKEY_DONE,
                                        textAlign : 'left',
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                        font : {
                                            fontSize : fieldFontSize
                                        },
                                        color : '#000000',
                                        top : top,
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        required : field_arr[index_label][index_size].required,
                                        composed_obj : true,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        cardinality : settings.cardinality,
                                        value : vl_to_field,
                                        reffer_index : reffer_index,
                                        hasParent : hasParent,
                                        parent_name : parent_name,
                                        defaultField : defaultField,
                                        settings : settings,
                                        changedFlag : 0,
                                        my_max : _max,
                                        my_min : _min,
                                        autocorrect : false,
                                        enabled : can_edit,
                                        editable : can_edit
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
                                    addDoneButtonInKB(content[count]);
                                    top += (PLATFORM == 'android') ? heightTextField : heightValue;

                                    regionView.add(content[count]);
                                    content[count].addEventListener('change', function(e) {
                                        changedContentValue(e.source);
                                        noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                    });

                                    content[count].addEventListener('blur', function(e) {
                                        Ti.API.info(e.source.value + ' or ' + e.value + ' Field number ==> min: ' + e.source.my_min + ' max: ' + e.source.my_max);
                                        if (e.source.value <= (minRange)) {
                                            alert("The minimum for this field is " + minRange);
                                            e.source.value = null;
                                        }
                                        else if (e.source.value >= (maxRange)) {
                                            alert("The maximum for this field is " + maxRange);
                                            e.source.value = null;
                                        }
                                        if (e.source.value != null && e.source.value != "") {
                                            if (e.source.my_max != null && e.source.my_min != null) {
                                                if (parseFloat(e.source.value) < parseFloat(e.source.my_min)) {
                                                    alert("The minimum for this field is " + e.source.my_min);
                                                    e.source.value = null;
                                                }
                                                else if (parseFloat(e.source.value) > parseFloat(e.source.my_max)) {
                                                    alert("The maximum for this field is " + e.source.my_max);
                                                    e.source.value = null;
                                                }
                                                else {
                                                    //value is ok
                                                }
                                            }
                                            else if (e.source.my_max != null) {
                                                if (parseFloat(e.source.value) > parseFloat(e.source.my_max)) {
                                                    alert("The maximum for this field is " + e.source.my_max);
                                                    e.source.value = null;
                                                }
                                                else {
                                                    //value is ok
                                                }
                                            }
                                            else if (e.source.my_min != null) {
                                                if (parseFloat(e.source.value) < parseFloat(e.source.my_min)) {
                                                    alert("The minimum for this field is " + e.source.my_min);
                                                    e.source.value = null;
                                                }
                                                else {
                                                    //value is ok
                                                }
                                            }
                                            else {
                                                //No min or max sets
                                            }
                                        }
                                    });
                                    count++;
                                }
                            }
                            else {
                                content[count] = Ti.UI.createTextField({
                                    hintText : field_arr[index_label][index_size].label,
                                    borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                    keyboardType : Titanium.UI.KEYBOARD_NUMBER_PAD,
                                    returnKeyType : Titanium.UI.RETURNKEY_DONE,
                                    textAlign : 'left',
                                    width : Ti.Platform.displayCaps.platformWidth - 30,
                                    height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                    font : {
                                        fontSize : fieldFontSize
                                    },
                                    color : '#000000',
                                    top : top,
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    required : field_arr[index_label][index_size].required,
                                    composed_obj : false,
                                    is_title : field_arr[index_label][index_size].is_title,
                                    cardinality : settings.cardinality,
                                    value : field_arr[index_label][index_size].actual_value,
                                    reffer_index : reffer_index,
                                    hasParent : hasParent,
                                    parent_name : parent_name,
                                    defaultField : defaultField,
                                    settings : settings,
                                    changedFlag : 0,
                                    my_max : _max,
                                    my_min : _min,
                                    autocorrect : false,
                                    enabled : can_edit,
                                    editable : can_edit
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
                                addDoneButtonInKB(content[count]);
                                top += (PLATFORM == 'android') ? heightTextField : heightValue;

                                regionView.add(content[count]);
                                content[count].addEventListener('change', function(e) {
                                    changedContentValue(e.source);
                                    noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                });

                                content[count].addEventListener('blur', function(e) {
                                    Ti.API.info(e.source.value + ' or ' + e.value + ' Field number ==> min: ' + e.source.my_min + ' max: ' + e.source.my_max);

                                    if (e.source.value <= (minRange)) {
                                        alert("The minimum for this field is " + minRange);
                                        e.source.value = null;
                                    }
                                    else if (e.source.value >= (maxRange)) {
                                        alert("The maximum for this field is " + maxRange);
                                        e.source.value = null;
                                    }

                                    if (e.source.value != null && e.source.value != "") {
                                        if (e.source.my_max != null && e.source.my_min != null) {
                                            if (parseFloat(e.source.value) < parseFloat(e.source.my_min)) {
                                                alert("The minimum for this field is " + e.source.my_min);
                                                e.source.value = null;
                                            }
                                            else if (parseFloat(e.source.value) > parseFloat(e.source.my_max)) {
                                                alert("The maximum for this field is " + e.source.my_max);
                                                e.source.value = null;
                                            }
                                            else {
                                                //value is ok
                                            }
                                        }
                                        else if (e.source.my_max != null) {
                                            if (parseFloat(e.source.value) > parseFloat(e.source.my_max)) {
                                                alert("The maximum for this field is " + e.source.my_max);
                                                e.source.value = null;
                                            }
                                            else {
                                                //value is ok
                                            }
                                        }
                                        else if (e.source.my_min != null) {
                                            if (parseFloat(e.source.value) < parseFloat(e.source.my_min)) {
                                                alert("The minimum for this field is " + e.source.my_min);
                                                e.source.value = null;
                                            }
                                            else {
                                                //value is ok
                                            }
                                        }
                                        else {
                                            //No min or max sets
                                        }
                                    }
                                });

                                count++;
                            }
                            //No data checkbox functionality
                            noDataCheckbox(reffer_index, regionView, top);
                            if (content[reffer_index].noDataView != null) {
                                top += 40;
                            }
                            break;

                        case 'phone':
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
                            //Add fields:
                            regionView.add(label[count]);
                            var reffer_index = count;

                            if (settings.cardinality > 1) {
                                if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                    var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                    //Decode the stored array:
                                    var decoded = array_cont.fieldByName('encoded_array');
                                    decoded = Base64.decode(decoded);
                                    Ti.API.info('Decoded array is equals to: ' + decoded);
                                    decoded = decoded.toString();

                                    // Token that splits each element contained into the array: 'j8Oc2s1E'
                                    var decoded_values = decoded.split("j8Oc2s1E");
                                }
                                else {
                                    var decoded_values = new Array();
                                    decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                }

                                var o_index;
                                for ( o_index = 0; o_index < settings.cardinality; o_index++) {

                                    if ((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
                                        var vl_to_field = decoded_values[o_index];
                                    }
                                    else {
                                        var vl_to_field = "";
                                    }

                                    content[count] = Ti.UI.createTextField({
                                        hintText : "#" + o_index + " " + field_arr[index_label][index_size].label,
                                        private_index : o_index,
                                        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                        keyboardType : Titanium.UI.KEYBOARD_NUMBER_PAD,
                                        returnKeyType : Titanium.UI.RETURNKEY_DONE,
                                        textAlign : 'left',
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                        font : {
                                            fontSize : fieldFontSize
                                        },
                                        color : '#000000',
                                        top : top,
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        required : field_arr[index_label][index_size].required,
                                        composed_obj : true,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        cardinality : settings.cardinality,
                                        value : vl_to_field,
                                        reffer_index : reffer_index,
                                        settings : settings,
                                        changedFlag : 0,
                                        autocorrect : false,
                                        enabled : can_edit,
                                        editable : can_edit
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
                                    addDoneButtonInKB(content[count]);
                                    top += (PLATFORM == 'android') ? heightTextField : heightValue;

                                    regionView.add(content[count]);
                                    content[count].addEventListener('change', function(e) {
                                        changedContentValue(e.source);
                                        noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                    });
                                    count++;
                                }
                            }
                            else {
                                content[count] = Ti.UI.createTextField({
                                    hintText : field_arr[index_label][index_size].label,
                                    borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                    keyboardType : Titanium.UI.KEYBOARD_NUMBER_PAD,
                                    returnKeyType : Titanium.UI.RETURNKEY_DONE,
                                    textAlign : 'left',
                                    width : Ti.Platform.displayCaps.platformWidth - 30,
                                    height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                    font : {
                                        fontSize : fieldFontSize
                                    },
                                    color : '#000000',
                                    top : top,
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    required : field_arr[index_label][index_size].required,
                                    composed_obj : false,
                                    is_title : field_arr[index_label][index_size].is_title,
                                    cardinality : settings.cardinality,
                                    value : field_arr[index_label][index_size].actual_value,
                                    reffer_index : reffer_index,
                                    settings : settings,
                                    changedFlag : 0,
                                    autocorrect : false,
                                    enabled : can_edit,
                                    editable : can_edit
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
                                addDoneButtonInKB(content[count]);
                                top += (PLATFORM == 'android') ? heightTextField : heightValue;

                                regionView.add(content[count]);
                                content[count].addEventListener('change', function(e) {
                                    changedContentValue(e.source);
                                    noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                });
                                count++;
                            }
                            //No data checkbox functionality
                            noDataCheckbox(reffer_index, regionView, top);
                            if (content[reffer_index].noDataView != null) {
                                top += 40;
                            }
                            break;

                        case 'email':
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

                            //Add fields:
                            regionView.add(label[count]);
                            var reffer_index = count;

                            if (settings.cardinality > 1) {
                                if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                    var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                    //Decode the stored array:
                                    var decoded = array_cont.fieldByName('encoded_array');
                                    decoded = Base64.decode(decoded);
                                    Ti.API.info('Decoded array is equals to: ' + decoded);
                                    decoded = decoded.toString();

                                    // Token that splits each element contained into the array: 'j8Oc2s1E'
                                    var decoded_values = decoded.split("j8Oc2s1E");
                                }
                                else {
                                    var decoded_values = new Array();
                                    decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                }

                                var o_index;
                                for ( o_index = 0; o_index < settings.cardinality; o_index++) {

                                    if ((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
                                        var vl_to_field = decoded_values[o_index];
                                    }
                                    else {
                                        var vl_to_field = "";
                                    }

                                    content[count] = Ti.UI.createTextField({
                                        hintText : "#" + o_index + " " + field_arr[index_label][index_size].label,
                                        private_index : o_index,
                                        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                        keyboardType : Ti.UI.KEYBOARD_EMAIL,
                                        textAlign : 'left',
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                        font : {
                                            fontSize : fieldFontSize
                                        },
                                        color : '#000000',
                                        top : top,
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        required : field_arr[index_label][index_size].required,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        composed_obj : true,
                                        cardinality : settings.cardinality,
                                        value : vl_to_field,
                                        reffer_index : reffer_index,
                                        settings : settings,
                                        changedFlag : 0,
                                        autocorrect : false,
                                        returnKeyType : Ti.UI.RETURNKEY_DONE,
                                        enabled : can_edit,
                                        editable : can_edit
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
                                    top += (PLATFORM == 'android') ? heightTextField : heightValue;

                                    regionView.add(content[count]);
                                    content[count].addEventListener('change', function(e) {
                                        changedContentValue(e.source);
                                        noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                    });
                                    count++;
                                }
                            }
                            else {
                                content[count] = Ti.UI.createTextField({
                                    hintText : field_arr[index_label][index_size].label,
                                    borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                    keyboardType : Ti.UI.KEYBOARD_EMAIL,
                                    textAlign : 'left',
                                    width : Ti.Platform.displayCaps.platformWidth - 30,
                                    height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                    font : {
                                        fontSize : fieldFontSize
                                    },
                                    color : '#000000',
                                    top : top,
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    required : field_arr[index_label][index_size].required,
                                    is_title : field_arr[index_label][index_size].is_title,
                                    composed_obj : false,
                                    cardinality : settings.cardinality,
                                    value : field_arr[index_label][index_size].actual_value,
                                    reffer_index : reffer_index,
                                    settings : settings,
                                    changedFlag : 0,
                                    autocorrect : false,
                                    returnKeyType : Ti.UI.RETURNKEY_DONE,
                                    enabled : can_edit,
                                    editable : can_edit
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
                                top += (PLATFORM == 'android') ? heightTextField : heightValue;

                                regionView.add(content[count]);
                                content[count].addEventListener('change', function(e) {
                                    changedContentValue(e.source);
                                    noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                });
                                count++;
                            }
                            //No data checkbox functionality
                            noDataCheckbox(reffer_index, regionView, top);
                            if (content[reffer_index].noDataView != null) {
                                top += 40;
                            }
                            break;
                        
                        
                        //// CREATE FORM ELEMENT
                        case 'taxonomy_term_reference':
                            var widget = JSON.parse(field_arr[index_label][index_size].widget);
                            var settings = JSON.parse(field_arr[index_label][index_size].settings);
                            var can_view = false;
                            var can_edit = false;

                            if (settings.enforce_permissions != null && settings.enforce_permissions == 1) {
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
                            var hasParent = false;
                            var parent_name = "";
                            var defaultField = "";
                            if (settings.parent_form_default_value) {
                                if (settings.parent_form_default_value.parent_field != null && settings.parent_form_default_value.parent_field != "") {
                                    hasParent = true;
                                    parent_name = settings.parent_form_default_value.parent_field;
                                    defaultField = settings.parent_form_default_value.default_value_field;
                                }
                            }

                            //Create picker list
                            if (widget.type == 'options_select' || widget.type == 'violation_select') {
                                label[count] = Ti.UI.createLabel({
                                    text : ( isRequired ? '*' : '') + '' + field_arr[index_label][index_size].label,
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

                                var vocabulary = db_display.execute("SELECT vid FROM vocabulary WHERE machine_name = '" + settings.vocabulary + "'");
                                var terms = db_display.execute("SELECT * FROM term_data WHERE vid='" + vocabulary.fieldByName('vid') + "'GROUP BY name ORDER BY CAST(`weight` AS INTEGER) ASC");

                                var data_terms = [];
                                if (settings.cardinality != -1) {
                                    // data_terms.push({
                                    // title : field_arr[index_label][index_size].label,
                                    // tid : null
                                    // });
                                }

                                while (terms.isValidRow()) {
                                    data_terms.push({
                                        title : terms.fieldByName('name'),
                                        tid : terms.fieldByName('tid')
                                    });
                                    terms.next();
                                }
                                terms.close();
                                vocabulary.close();

                                //Add fields:
                                regionView.add(label[count]);

                                Ti.API.info('===> ' + settings.cardinality);

                                if (settings.cardinality > 1) {
                                    if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                        var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                        //Decode the stored array:
                                        var decoded = array_cont.fieldByName('encoded_array');
                                        decoded = Base64.decode(decoded);
                                        Ti.API.info('Decoded array is equals to: ' + decoded);
                                        decoded = decoded.toString();

                                        // Token that splits each element contained into the array: 'j8Oc2s1E'
                                        var decoded_values = decoded.split("j8Oc2s1E");
                                    }
                                    else {
                                        var decoded_values = new Array();
                                        decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                    }

                                    var o_index;
                                    for ( o_index = 0; o_index < settings.cardinality; o_index++) {

                                        if ((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
                                            var vl_to_field = decoded_values[o_index];
                                        }
                                        else {
                                            var vl_to_field = "";
                                        }

                                        var arr_picker = new Array();
                                        var arr_opt = new Array();
                                        arr_picker.push({
                                            title : '-- NONE --',
                                            uid : null
                                        });
                                        arr_opt.push('-- NONE --');

                                        var aux_val = {
                                            title : '-- NONE --',
                                            vl : null,
                                            cnt : 0
                                        };

                                        var counter_loop = 0;
                                        var i_data_terms;
                                        for (i_data_terms in data_terms) {
                                            if (vl_to_field == data_terms[i_data_terms].tid) {
                                                aux_val.title = data_terms[i_data_terms].title;
                                                aux_val.vl = data_terms[i_data_terms].tid;
                                                aux_val.cnt = counter_loop;
                                            }
                                            arr_picker.push({
                                                title : data_terms[i_data_terms].title,
                                                tid : data_terms[i_data_terms].tid
                                            });
                                            arr_opt.push(data_terms[i_data_terms].title);
                                            counter_loop++;
                                        }

                                        content[count] = Titanium.UI.createButton({
                                            borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                            private_index : o_index,
                                            width : Ti.Platform.displayCaps.platformWidth - 30,
                                            height : heightValue,
                                            arr_opt : arr_opt,
                                            arr_picker : arr_picker,
                                            title : aux_val.title,
                                            font : {
                                                fontSize : fieldFontSize
                                            },
                                            color : '#000000',
                                            top : top,
                                            selectionIndicator : true,
                                            field_type : field_arr[index_label][index_size].type,
                                            field_name : field_arr[index_label][index_size].field_name,
                                            machine_name : vocabulary.fieldByName('machine_name'),
                                            widget : 'options_select',
                                            widgetObj : widget,
                                            required : field_arr[index_label][index_size].required,
                                            is_title : field_arr[index_label][index_size].is_title,
                                            value : aux_val.vl,
                                            composed_obj : true,
                                            cardinality : settings.cardinality,
                                            reffer_index : reffer_index,
                                            hasParent : hasParent,
                                            parent_name : parent_name,
                                            defaultField : defaultField,
                                            settings : settings,
                                            changedFlag : 0,
                                            enabled : can_edit
                                        });
                                        var desLabel = Ti.UI.createLabel({
                                            top : (top + heightValue),
                                            width : Ti.Platform.displayCaps.platformWidth - 30,
                                            ellipsize : true,
                                            wordWrap : false,
                                            visible : false,
                                            font : {
                                                fontsize : 10
                                            },
                                            color : 'black',
                                            height : 20

                                        });
                                        content[count].desLabel = desLabel;
                                        desLabel.addEventListener('click', function(e) {
                                            openBigText(e.source.text);
                                        });
                                        if (PLATFORM == 'android') {
                                            content[count].backgroundImage = '';
                                            content[count].backgroundColor = 'white';
                                            content[count].backgroundSelectedColor = '#2E64FE';
                                            content[count].borderColor = 'gray';
                                            content[count].borderRadius = 10;
                                            content[count].color = 'black';
                                            content[count].borderWidth = 1;
                                        }
                                        if (!can_edit) {
                                            content[count].backgroundImage = '';
                                            content[count].backgroundColor = '#BDBDBD';
                                            content[count].borderColor = 'gray';
                                            content[count].borderRadius = 10;
                                            content[count].color = '#848484';
                                            content[count].borderWidth = 1;
                                        }
                                        content[count].addEventListener('click', function(e) {
                                            //Ti.API.info('TID: '+e.row.tid);
                                            //e.source.value = e.row.tid;
                                            if (e.source.arr_opt.length == 1) {
                                                var dt = new Date(e.source.violation_time);
                                                alert("No violations should be enforced at " + e.source.omadi_reference_title + " at " + date(omadi_time_format, dt) + " on " + weekday[dt.getDay()]);
                                                return;
                                            }
                                            var postDialog = Titanium.UI.createOptionDialog();
                                            postDialog.options = e.source.arr_opt;
                                            postDialog.cancel = -1;
                                            postDialog.show();

                                            postDialog.addEventListener('click', function(ev) {
                                                if (ev.index >= 0) {
                                                    e.source.title = e.source.arr_opt[ev.index];
                                                    e.source.value = e.source.arr_picker[ev.index].tid;
                                                }
                                                changedContentValue(e.source);
                                                noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                            });
                                        });

                                        top += heightValue;

                                        //Add fields:
                                        regionView.add(desLabel);
                                        regionView.add(content[count]);
                                        count++;
                                    }
                                }
                                else if (settings.cardinality == 1) {

                                    var arr_picker = new Array();
                                    var arr_opt = new Array();
                                    arr_picker.push({
                                        title : '-- NONE --',
                                        uid : null
                                    });
                                    arr_opt.push('-- NONE --');

                                    var aux_val = {
                                        title : '-- NONE --',
                                        vl : null,
                                        cnt : 0
                                    };

                                    var counter_loop = 0;
                                    var i_data_terms;
                                    for (i_data_terms in data_terms) {
                                        if (field_arr[index_label][index_size].actual_value == data_terms[i_data_terms].tid) {
                                            aux_val.title = data_terms[i_data_terms].title;
                                            aux_val.vl = data_terms[i_data_terms].tid;
                                            aux_val.cnt = counter_loop;
                                        }
                                        arr_picker.push({
                                            title : data_terms[i_data_terms].title,
                                            tid : data_terms[i_data_terms].tid
                                        });
                                        arr_opt.push(data_terms[i_data_terms].title);
                                        counter_loop++;
                                    }

                                    content[count] = Titanium.UI.createButton({
                                        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        height : heightValue,
                                        arr_opt : arr_opt,
                                        arr_picker : arr_picker,
                                        title : aux_val.title,
                                        font : {
                                            fontSize : fieldFontSize
                                        },
                                        color : '#000000',
                                        top : top,
                                        selectionIndicator : true,
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        machine_name : vocabulary.fieldByName('machine_name'),
                                        widget : 'options_select',
                                        widgetObj : widget,
                                        required : field_arr[index_label][index_size].required,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        composed_obj : false,
                                        cardinality : settings.cardinality,
                                        value : aux_val.vl,
                                        reffer_index : reffer_index,
                                        hasParent : hasParent,
                                        parent_name : parent_name,
                                        defaultField : defaultField,
                                        settings : settings,
                                        changedFlag : 0,
                                        enabled : can_edit
                                    });
                                    var desLabel = Ti.UI.createLabel({
                                        top : (top + heightValue),
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        ellipsize : true,
                                        wordWrap : false,
                                        visible : false,
                                        font : {
                                            fontsize : 10
                                        },
                                        color : 'black',
                                        height : 20

                                    });
                                    content[count].desLabel = desLabel;
                                    desLabel.addEventListener('click', function(e) {
                                        openBigText(e.source.text);
                                    });
                                    if (PLATFORM == 'android') {
                                        content[count].backgroundImage = '';
                                        content[count].backgroundColor = 'white';
                                        content[count].backgroundSelectedColor = '#2E64FE';
                                        content[count].borderColor = 'gray';
                                        content[count].borderRadius = 10;
                                        content[count].color = 'black';
                                        content[count].borderWidth = 1;
                                    }
                                    if (!can_edit) {
                                        content[count].backgroundImage = '';
                                        content[count].backgroundColor = '#BDBDBD';
                                        content[count].borderColor = 'gray';
                                        content[count].borderRadius = 10;
                                        content[count].color = '#848484';
                                        content[count].borderWidth = 1;
                                    }

                                    content[count].addEventListener('click', function(e) {
                                        //Ti.API.info('TID: '+e.row.tid);
                                        //e.source.value = e.row.tid;
                                        if (e.source.arr_opt.length == 1) {
                                            var dt = new Date(e.source.violation_time);
                                            alert("No violations should be enforced at " + e.source.omadi_reference_title + " at " + date(omadi_time_format, dt) + " on " + weekday[dt.getDay()]);
                                            return;
                                        }

                                        var postDialog = Titanium.UI.createOptionDialog();
                                        postDialog.options = e.source.arr_opt;
                                        postDialog.cancel = -1;
                                        postDialog.show();

                                        postDialog.addEventListener('click', function(ev) {
                                            if (ev.index >= 0) {
                                                e.source.title = e.source.arr_opt[ev.index];
                                                e.source.value = e.source.arr_picker[ev.index].tid;
                                            }
                                            changedContentValue(e.source);
                                            noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                        });
                                    });
                                    top += heightValue;

                                    //Add fields:
                                    regionView.add(desLabel);
                                    regionView.add(content[count]);
                                    count++;
                                }
                                else if (settings.cardinality == -1) {
                                    var sel_text = "";
                                    var _val_itens = [];
                                    var _itens = "";
                                    var _exist = [];

                                    if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                        var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                        //Decode the stored array:
                                        var decoded = array_cont.fieldByName('encoded_array');
                                        decoded = Base64.decode(decoded);
                                        Ti.API.info('Decoded array is equals to: ' + decoded);
                                        decoded = decoded.toString();

                                        // Token that splits each element contained into the array: 'j8Oc2s1E'
                                        var decoded_values = decoded.split("j8Oc2s1E");
                                    }
                                    else {
                                        var decoded_values = new Array();
                                        decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                    }

                                    var j_ind;
                                    for (j_ind in data_terms) {
                                        Ti.API.info(data_terms[j_ind].tid + ' = ' + decoded_values.indexOf(data_terms[j_ind].tid.toString()));

                                        if (decoded_values.indexOf(data_terms[j_ind].tid.toString()) != -1) {
                                            sel_text = data_terms[j_ind].title;
                                            _val_itens.push({
                                                title : data_terms[j_ind].title,
                                                v_info : data_terms[j_ind].tid,
                                                is_set : true
                                            });

                                            _exist.push({
                                                title : data_terms[j_ind].title,
                                                v_info : data_terms[j_ind].tid
                                            });

                                        }
                                        else {
                                            _val_itens.push({
                                                title : data_terms[j_ind].title,
                                                v_info : data_terms[j_ind].tid,
                                                is_set : false
                                            });
                                        }

                                    }

                                    if (_exist.length > 1) {
                                        sel_text = field_arr[index_label][index_size].label + " [" + _exist.length + "]"
                                    }
                                    _itens = _exist;

                                    if (_exist.length == 0) {
                                        _itens = null;
                                    }

                                    Ti.API.info("==>> " + _val_itens);
                                    Ti.API.info("==>> " + _itens);

                                    content[count] = Titanium.UI.createLabel({
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        text : sel_text,
                                        backgroundColor : "#FFF",
                                        textAlign : "center",
                                        height : heightValue,
                                        font : {
                                            fontSize : fieldFontSize
                                        },
                                        color : '#000000',
                                        top : top,
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        machine_name : vocabulary.fieldByName('machine_name'),
                                        widget : 'options_select',
                                        widgetObj : widget,
                                        required : field_arr[index_label][index_size].required,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        composed_obj : false,
                                        cardinality : settings.cardinality,
                                        value : _itens,
                                        itens : _val_itens,
                                        view_title : field_arr[index_label][index_size].label,
                                        reffer_index : reffer_index,
                                        settings : settings,
                                        changedFlag : 0,
                                        can_edit : can_edit,
                                        enabled : can_edit,
                                    });

                                    var desLabel = Ti.UI.createLabel({
                                        top : (top + heightValue),
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        ellipsize : true,
                                        wordWrap : false,
                                        visible : false,
                                        font : {
                                            fontsize : 10
                                        },
                                        color : 'black',
                                        height : 20

                                    });
                                    content[count].desLabel = desLabel;
                                    desLabel.addEventListener('click', function(e) {
                                        openBigText(e.source.text);
                                    });
                                    if (!can_edit) {
                                        content[count].backgroundImage = '';
                                        content[count].backgroundColor = '#BDBDBD';
                                        content[count].borderColor = 'gray';
                                        content[count].color = '#848484';
                                        content[count].borderWidth = 1
                                    }

                                    content[count].addEventListener('click', function(e) {
                                        if (e.source.can_edit) {
                                            var jsa;
                                            for (jsa in e.source.itens) {
                                                Ti.API.info(jsa + ' = ' + e.source.itens[jsa].title);
                                            }
                                            if (e.source.itens.length == 0) {
                                                var dt = new Date(e.source.violation_time);
                                                alert("No violations should be enforced at " + e.source.omadi_reference_title + " at " + date(omadi_time_format, dt) + " on " + weekday[dt.getDay()]);
                                                return;
                                            }
                                            open_mult_selector(e.source);
                                            changedContentValue(e.source);
                                            noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                                        }
                                    });

                                    top += heightValue + 20;

                                    //Add fields:
                                    regionView.add(desLabel);
                                    regionView.add(content[count]);
                                    count++;
                                }
                            }
                            //Create autofill field
                            else if (widget.type == 'taxonomy_autocomplete') {
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

                                //Add fields:
                                regionView.add(label[count]);
                                var reffer_index = count;

                                if (settings.cardinality > 1) {
                                    if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                        var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                        //Decode the stored array:
                                        var decoded = array_cont.fieldByName('encoded_array');
                                        decoded = Base64.decode(decoded);
                                        Ti.API.info('Decoded array is equals to: ' + decoded);
                                        decoded = decoded.toString();

                                        // Token that splits each element contained into the array: 'j8Oc2s1E'
                                        var decoded_values = decoded.split("j8Oc2s1E");
                                    }
                                    else {
                                        var decoded_values = new Array();
                                        decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                    }

                                    var o_index;
                                    for ( o_index = 0; o_index < settings.cardinality; o_index++) {

                                        if ((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
                                            var vl_to_field = decoded_values[o_index];
                                        }
                                        else {
                                            var vl_to_field = "";
                                        }

                                        if (!settings.vocabulary) {
                                            settings.vocabulary = field_arr[index_label][index_size].field_name;
                                        }
                                        Ti.API.info('================> Vocabulary ' + settings.vocabulary);
                                        var vocabulary = db_display.execute("SELECT vid FROM vocabulary WHERE machine_name = '" + settings.vocabulary + "'");
                                        var terms = db_display.execute("SELECT * FROM term_data WHERE vid='" + vocabulary.fieldByName('vid') + "'GROUP BY name ORDER BY name ASC");
                                        var vid = vocabulary.fieldByName('vid');
                                        data_terms = new Array;
                                        var aux_val = {
                                            title : "",
                                            vl : null
                                        };

                                        while (terms.isValidRow()) {
                                            if (vl_to_field == terms.fieldByName('tid')) {
                                                aux_val.title = terms.fieldByName('name');
                                                aux_val.vl = terms.fieldByName('tid');
                                            }

                                            data_terms.push({
                                                title : terms.fieldByName('name'),
                                                tid : terms.fieldByName('tid')
                                            });
                                            terms.next();
                                        }
                                        //alert('AQUI => title: '+aux_val.title+' tid = '+aux_val.vl);

                                        terms.close();
                                        vocabulary.close();

                                        var rest_up = settings.restrict_new_autocomplete_terms;
                                        if (!rest_up) {
                                            rest_up = 0;
                                        }

                                        content[count] = Titanium.UI.createTextField({
                                            hintText : "#" + o_index + " " + field_arr[index_label][index_size].label + ' ...',
                                            borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                            color : '#000000',
                                            private_index : o_index,
                                            height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                            font : {
                                                fontSize : fieldFontSize
                                            },
                                            width : Ti.Platform.displayCaps.platformWidth - 30,
                                            top : top,
                                            field_type : field_arr[index_label][index_size].type,
                                            field_name : field_arr[index_label][index_size].field_name,
                                            machine_name : vocabulary.fieldByName('machine_name'),
                                            terms : data_terms,
                                            tid : aux_val.vl,
                                            restrict_new_autocomplete_terms : rest_up,
                                            widget : 'taxonomy_autocomplete',
                                            vid : vid,
                                            fantasy_name : field_arr[index_label][index_size].label,
                                            required : field_arr[index_label][index_size].required,
                                            is_title : field_arr[index_label][index_size].is_title,
                                            composed_obj : true,
                                            cardinality : settings.cardinality,
                                            value : aux_val.title,
                                            //first_time : true,
                                            lastValue : aux_val.title,
                                            reffer_index : reffer_index,
                                            settings : settings,
                                            changedFlag : 0,
                                            returnKeyType : Ti.UI.RETURNKEY_DONE,
                                            enabled : can_edit,
                                            editable : can_edit,
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
                                        //AUTOCOMPLETE TABLE for taxonomy_term_reference and auto_complete widget cardinality > 1
                                        var autocomplete_table = Titanium.UI.createTableView({
                                            top : top + ((PLATFORM == 'android') ? heightTextField - 10 : heightValue),
                                            searchHidden : true,
                                            zIndex : 15,
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
                                        // TABLE EVENTS for taxonomy_term_reference and auto_complete widget, cardinality > 1
                                        //
                                        content[count].autocomplete_table.addEventListener('click', function(e) {
                                            //e.source.setValueF(e.rowData.title, e.rowData.tid);
                                            if (PLATFORM != 'android') {
                                                e.source.textField.value = e.rowData.title;
                                                e.source.textField.tid = e.rowData.tid;
                                            }
                                            else {
                                                e.source.setValueF(e.rowData.title, e.rowData.tid);
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
                                            if ((e.source.restrict_new_autocomplete_terms == 1) && (e.source.value != "") && (e.source.tid == null)) {
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
                                        });

                                        //
                                        // SEARCH EVENTS for taxonomy_term_reference and auto_complete widget cardinality > 1
                                        //
                                        content[count].addEventListener('change', function(e) {
                                            changedContentValue(e.source);
                                            noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                                            if (e.source.lastValue != e.source.value) {
                                                var list = e.source.terms;
                                                var func = function setValueF(value_f, tid) {
                                                    e.source.value = value_f;
                                                    e.source.tid = tid;
                                                    Ti.API.info('Value: ' + value_f + ' TID: ' + tid);
                                                };

                                                e.source.tid = null;
                                                if ((e.value != null) && (e.value != '')) {
                                                    table_data = [];
                                                    var i;
                                                    for ( i = 0; i < list.length; i++) {
                                                        var rg = new RegExp(e.source.value, 'i');
                                                        if (list[i].title.search(rg) != -1) {
                                                            //Check match
                                                            if (e.source.value == list[i].title) {
                                                                e.source.tid = list[i].tid;
                                                            }
                                                            else {
                                                                e.source.tid = null;
                                                            }

                                                            var row = Ti.UI.createTableViewRow({
                                                                height : getScreenHeight() * 0.10,
                                                                title : list[i].title,
                                                                tid : list[i].tid,
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
                                                    e.source.autocomplete_table.height = getScreenHeight() * 0.3;
                                                    e.source.autocomplete_table.borderWidth = 1;
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
                                                    e.source.tid = null;
                                                }
                                            }
                                            //e.source.first_time = false;
                                            e.source.lastValue = e.source.value;
                                        });
                                        //Add fields:
                                        regionView.add(content[count]);
                                        count++;
                                    }
                                }
                                else {

                                    var vl_to_field = field_arr[index_label][index_size].actual_value;

                                    if (!settings.vocabulary) {
                                        settings.vocabulary = field_arr[index_label][index_size].field_name;
                                    }

                                    Ti.API.info('================> Vocabulary ' + settings.vocabulary);
                                    var vocabulary = db_display.execute("SELECT vid FROM vocabulary WHERE machine_name = '" + settings.vocabulary + "'");
                                    var terms = db_display.execute("SELECT * FROM term_data WHERE vid='" + vocabulary.fieldByName('vid') + "'GROUP BY name ORDER BY name ASC");
                                    var vid = vocabulary.fieldByName('vid');
                                    data_terms = new Array;
                                    var aux_val = {
                                        title : "",
                                        vl : null
                                    };

                                    while (terms.isValidRow()) {
                                        if (vl_to_field == terms.fieldByName('tid')) {
                                            aux_val.title = terms.fieldByName('name');
                                            aux_val.vl = terms.fieldByName('tid');
                                        }

                                        data_terms.push({
                                            title : terms.fieldByName('name'),
                                            tid : terms.fieldByName('tid')
                                        });
                                        terms.next();
                                    }
                                    //alert('AQUI => title: '+aux_val.title+' tid = '+aux_val.vl);

                                    terms.close();
                                    vocabulary.close();

                                    var rest_up = settings.restrict_new_autocomplete_terms;
                                    if (!rest_up) {
                                        rest_up = 0;
                                    }

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
                                        machine_name : vocabulary.fieldByName('machine_name'),
                                        terms : data_terms,
                                        tid : aux_val.vl,
                                        restrict_new_autocomplete_terms : rest_up,
                                        widget : 'taxonomy_autocomplete',
                                        vid : vid,
                                        fantasy_name : field_arr[index_label][index_size].label,
                                        required : field_arr[index_label][index_size].required,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        composed_obj : false,
                                        cardinality : settings.cardinality,
                                        value : aux_val.title,
                                        //first_time : true,
                                        lastValue : aux_val.title,
                                        reffer_index : reffer_index,
                                        hasParent : hasParent,
                                        parent_name : parent_name,
                                        defaultField : defaultField,
                                        settings : settings,
                                        changedFlag : 0,
                                        returnKeyType : Ti.UI.RETURNKEY_DONE,
                                        enabled : can_edit,
                                        editable : can_edit,
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
                                    //AUTOCOMPLETE TABLE taxonomy_term_reference widget auto_complete, cardinality = 1
                                    var autocomplete_table = Titanium.UI.createTableView({
                                        top : top + ((PLATFORM == 'android') ? heightTextField - 10 : heightValue),
                                        searchHidden : true,
                                        zIndex : 15,
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
                                    // TABLE EVENTS taxonomy_term_reference widget auto_complete, cardinality = 1
                                    //
                                    content[count].autocomplete_table.addEventListener('click', function(e) {

                                        //e.source.setValueF(e.rowData.title, e.rowData.tid);
                                        if (PLATFORM != 'android') {
                                            e.source.textField.value = e.rowData.title;
                                            e.source.textField.tid = e.rowData.tid;
                                        }
                                        else {
                                            e.source.setValueF(e.rowData.title, e.rowData.tid);
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
                                        if ((e.source.restrict_new_autocomplete_terms == 1) && (e.source.value != "") && (e.source.tid == null)) {
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
                                    });
                                    //
                                    // SEARCH EVENTS taxonomy_term_reference widget auto_complete, cardinality = 1
                                    //
                                    content[count].addEventListener('change', function(e) {
                                        changedContentValue(e.source);
                                        noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                        if (e.source.lastValue != e.source.value) {
                                            var list = e.source.terms;
                                            var func = function setValueF(value_f, tid) {
                                                e.source.value = value_f;
                                                e.source.tid = tid;
                                                Ti.API.info('Value: ' + value_f + ' TID: ' + tid);
                                            };

                                            e.source.tid = null;
                                            if ((e.value != null) && (e.value != '')) {
                                                table_data = [];
                                                var i;
                                                for ( i = 0; i < list.length; i++) {
                                                    var rg = new RegExp(e.source.value, 'i');
                                                    if (list[i].title.search(rg) != -1) {
                                                        //Check match
                                                        if (e.source.value == list[i].title) {
                                                            e.source.tid = list[i].tid;
                                                        }
                                                        else {
                                                            e.source.tid = null;
                                                        }

                                                        var row = Ti.UI.createTableViewRow({
                                                            height : getScreenHeight() * 0.10,
                                                            title : list[i].title,
                                                            tid : list[i].tid,
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
                                                e.source.autocomplete_table.height = getScreenHeight() * 0.3;
                                                e.source.autocomplete_table.borderWidth = 1;
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
                                                e.source.tid = null;
                                            }
                                        }

                                        //e.source.first_time = false;
                                        e.source.lastValue = e.source.value;

                                    });
                                    //Add fields:
                                    regionView.add(content[count]);
                                    count++;
                                }
                            }
                            //No data checkbox functionality
                            noDataCheckbox(reffer_index, regionView, top);
                            if (content[reffer_index].noDataView != null) {
                                top += 40;
                            }
                            break;

                        //Refers to an object:
                        case 'omadi_reference':
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

                            if (settings.cardinality > 1) {
                                // if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                // var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');
                                //
                                // //Decode the stored array:
                                // var decoded = array_cont.fieldByName('encoded_array');
                                // decoded = Base64.decode(decoded);
                                // Ti.API.info('Decoded array is equals to: ' + decoded);
                                // decoded = decoded.toString();
                                //
                                // // Token that splits each element contained into the array: 'j8Oc2s1E'
                                // var decoded_values = decoded.split("j8Oc2s1E");
                                // } else {
                                // var decoded_values = new Array();
                                // decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                // }
                                //
                                // for (var o_index = 0; o_index < settings.cardinality; o_index++) {
                                //
                                // if ((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
                                // var vl_to_field = decoded_values[o_index];
                                // } else {
                                // var vl_to_field = "";
                                // }
                                //
                                // var aux_val = {
                                // title : "",
                                // vl : null
                                // };
                                //
                                // for (var h in data_terms) {
                                // if (data_terms[h].nid == vl_to_field) {
                                // aux_val.title = data_terms[h].title;
                                // aux_val.vl = data_terms[h].nid;
                                // }
                                // }
                                //
                                // content[count] = Titanium.UI.createTextField({
                                // hintText : "#" + o_index + " " + field_arr[index_label][index_size].label + ' ...',
                                // borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                // color : '#000000',
                                // private_index : o_index,
                                // height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                // font : {
                                // fontSize : fieldFontSize
                                // },
                                // width : Ti.Platform.displayCaps.platformWidth - 30,
                                // top : top,
                                // field_type : field_arr[index_label][index_size].type,
                                // field_name : field_arr[index_label][index_size].field_name,
                                // terms : data_terms,
                                // restrict_new_autocomplete_terms : rest_up,
                                // fantasy_name : field_arr[index_label][index_size].label,
                                // nid : aux_val.vl,
                                // required : field_arr[index_label][index_size].required,
                                // is_title : field_arr[index_label][index_size].is_title,
                                // composed_obj : true,
                                // cardinality : settings.cardinality,
                                // value : aux_val.title,
                                // first_time : true,
                                // reffer_index : reffer_index,
                                // settings : settings,
                                // changedFlag : 0,
                                // my_index : count,
                                // autocorrect : false,
                                // returnKeyType : Ti.UI.RETURNKEY_DONE,
                                // enabled : can_edit,
                                // editable : can_edit,
                                // touched : false,
                                // regionView : regionView
                                // });
                                // if (PLATFORM == 'android') {
                                // content[count].backgroundImage = '../images/textfield.png'
                                // }
                                // if (!can_edit) {
                                // content[count].backgroundImage = '';
                                // content[count].backgroundColor = '#BDBDBD';
                                // content[count].borderColor = 'gray';
                                // content[count].borderRadius = 10;
                                // content[count].color = '#848484';
                                // content[count].borderWidth = 1;
                                // content[count].paddingLeft = 3;
                                // content[count].paddingRight = 3;
                                // if(PLATFORM == 'android'){
                                // content[count].softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
                                // }
                                // }
                                // //AUTOCOMPLETE TABLE omadi_reference, cardinality > 1
                                // var autocomplete_table = Titanium.UI.createTableView({
                                // top : top + ((PLATFORM == 'android') ? heightTextField - 10 : heightValue),
                                // searchHidden : true,
                                // zIndex : 15,
                                // height : getScreenHeight() * 0.3,
                                // backgroundColor : '#FFFFFF',
                                // visible : false,
                                // borderColor : '#000',
                                // borderWidth : 0
                                // });
                                // content[count].autocomplete_table = autocomplete_table;
                                // top += (PLATFORM == 'android') ? heightTextField : heightValue;
                                //
                                // regionView.add(content[count].autocomplete_table);
                                //
                                // //
                                // // TABLE EVENTS omadi_reference, cardinality > 1
                                // //
                                // content[count].autocomplete_table.addEventListener('click', function(e) {
                                // //e.source.textField.setValueF(e.rowData.title, e.rowData.nid);
                                //
                                // if (PLATFORM != 'android') {
                                // e.source.textField.value = e.rowData.title;
                                // e.source.textField.nid = e.rowData.nid;
                                // } else {
                                // e.source.setValueF(e.rowData.title, e.rowData.nid);
                                // }
                                //
                                // setTimeout(function() {
                                // e.source.autocomplete_table.visible = false;
                                // e.source.autocomplete_table.borderWidth = 0;
                                // Ti.API.info(e.rowData.title + ' was selected!');
                                // }, 80);
                                //
                                // });
                                //
                                // content[count].addEventListener('blur', function(e) {
                                // e.source.autocomplete_table.visible = false;
                                // e.source.autocomplete_table.borderWidth = 0;
                                // if ((e.source.nid === null) && (e.source.value != "")) {
                                // if (PLATFORM == 'android') {
                                // Ti.UI.createNotification({
                                // message : 'The field ' + e.source.fantasy_name + ' does not accept fields creation, select one of the list !',
                                // duration : Ti.UI.NOTIFICATION_DURATION_LONG
                                // }).show();
                                // } else {
                                // alert('The field ' + e.source.fantasy_name + ' does not accept fields creation, select one of the list !');
                                // }
                                // }
                                // });
                                //
                                // content[count].addEventListener('focus', function(e) {
                                // e.source.touched = true;
                                // adjustView(e.source.my_index, e.source.regionView.top + e.source.top - ((PLATFORM == 'android') ? heightTextField : heightValue));
                                // });
                                //
                                // //
                                // // SEARCH EVENTS, omadi_reference, cardinality > 1
                                // //
                                // content[count].addEventListener('change', function(e) {
                                // if (e.source.touched === true) {
                                // changedContentValue(e.source);
                                // if (e.source.first_time === false || e.source.value == '') {
                                // var list = e.source.terms;
                                // var func = function setValueF(value_f, nid) {
                                // e.source.value = value_f;
                                // e.source.nid = nid;
                                // Ti.API.info('Value: ' + value_f + ' NID: ' + nid);
                                // }
                                // if ((e.value != null) && (e.value != '')) {
                                // table_data = [];
                                // e.source.nid = null;
                                // for (var i = 0; i < list.length; i++) {
                                // var rg = new RegExp(e.source.value, 'i');
                                // if (list[i].title.search(rg) != -1) {
                                // //Check match
                                // if (e.source.value == list[i].title) {
                                // e.source.nid = list[i].nid;
                                // } else {
                                // e.source.nid = null;
                                // }
                                //
                                // //Create partial matching row
                                // var row = Ti.UI.createTableViewRow({
                                // height : getScreenHeight() * 0.10,
                                // title : list[i].title,
                                // nid : list[i].nid,
                                // color : '#000000',
                                // autocomplete_table : e.source.autocomplete_table,
                                // setValueF : func,
                                // textField : e.source
                                // });
                                // // apply rows to data array
                                // table_data.push(row);
                                // }
                                // }
                                // e.source.autocomplete_table.setData(table_data);
                                // e.source.autocomplete_table.height = getScreenHeight() * 0.3;
                                // e.source.autocomplete_table.borderWidth = 1;
                                // if(table_data.length == 0){
                                // e.source.autocomplete_table.borderWidth = 0;
                                // }
                                // if (table_data.length < 3 && table_data.length > 0) {
                                // e.source.autocomplete_table.height = (table_data.length == 1) ? getScreenHeight() * 0.1 : getScreenHeight() * 0.2;
                                // }
                                // e.source.autocomplete_table.scrollToTop(0, {
                                // animated : false
                                // });
                                // viewContent.scrollTo(0, e.source.regionView.top + e.source.top - ((PLATFORM == 'android') ? heightTextField : heightValue));
                                // if (table_data.length > 0) {
                                // e.source.autocomplete_table.visible = true;
                                // } else {
                                // e.source.autocomplete_table.visible = false;
                                // }
                                // } else {
                                // e.source.autocomplete_table.visible = false;
                                // e.source.nid = null;
                                // }
                                // }
                                // e.source.first_time = false;
                                // }
                                //
                                // });
                                // //Add fields:
                                // regionView.add(content[count]);
                                // count++;
                                // }
                            }
                            else {

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
                            }

                            break;

                        case 'user_reference':
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
                                text : ( isRequired ? '*' : '') + '' + field_arr[index_label][index_size].label,
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
                            //Add fields:
                            regionView.add(label[count]);

                            var users = db_display.execute("SELECT * FROM user WHERE ((uid != 0) AND (uid != 1)) ORDER BY realname ASC");
                            var data_terms = [];
                            // data_terms.push({
                            // title : field_arr[index_label][index_size].label,
                            // uid : null
                            // });

                            while (users.isValidRow()) {
                                if (users.fieldByName('realname') == '') {
                                    var name_ff = users.fieldByName('username');
                                }
                                else {
                                    var name_ff = users.fieldByName('realname');
                                }

                                data_terms.push({
                                    title : name_ff,
                                    uid : users.fieldByName('uid')
                                });

                                Ti.API.info('Username: \'' + users.fieldByName('username') + '\' , Realname: \'' + users.fieldByName('realname') + '\' , UID = ' + users.fieldByName('uid'));
                                users.next();
                            }
                            users.close();
                            var algo;
                            for (algo in settings) {
                                Ti.API.info(algo + " ===================>>> " + settings[algo]);
                            }

                            if (settings.cardinality > 1) {
                                if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                    var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                    //Decode the stored array:
                                    var decoded = array_cont.fieldByName('encoded_array');
                                    decoded = Base64.decode(decoded);
                                    Ti.API.info('Decoded array is equals to: ' + decoded);
                                    decoded = decoded.toString();

                                    // Token that splits each element contained into the array: 'j8Oc2s1E'
                                    var decoded_values = decoded.split("j8Oc2s1E");
                                }
                                else {
                                    var decoded_values = new Array();
                                    decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                }

                                var o_index;
                                for ( o_index = 0; o_index < settings.cardinality; o_index++) {

                                    if ((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
                                        var vl_to_field = decoded_values[o_index];
                                    }
                                    else {
                                        var vl_to_field = "";
                                    }

                                    var arr_picker = new Array();
                                    var arr_opt = new Array();
                                    arr_picker.push({
                                        title : '-- NONE --',
                                        uid : null
                                    });
                                    arr_opt.push('-- NONE --');

                                    var aux_val = {
                                        title : '-- NONE --',
                                        vl : null,
                                        cnt : 0
                                    };

                                    if (vl_to_field == "") {
                                        if (settings.default_value == "current_user") {
                                            vl_to_field = win.uid;
                                        }

                                    }

                                    Ti.API.info(vl_to_field + " ----------------- is the uid ------------------- " + settings.default_value);

                                    var counter_loop = 0;
                                    var i_data_terms;
                                    for (i_data_terms in data_terms) {
                                        if (vl_to_field == data_terms[i_data_terms].uid) {
                                            aux_val.title = data_terms[i_data_terms].title;
                                            aux_val.vl = data_terms[i_data_terms].uid;
                                            aux_val.cnt = counter_loop;
                                        }
                                        arr_picker.push({
                                            title : data_terms[i_data_terms].title,
                                            uid : data_terms[i_data_terms].uid
                                        });
                                        arr_opt.push(data_terms[i_data_terms].title);
                                        counter_loop++;
                                    }

                                    content[count] = Titanium.UI.createButton({
                                        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                        private_index : o_index,
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        height : heightValue,
                                        arr_opt : arr_opt,
                                        arr_picker : arr_picker,
                                        title : aux_val.title,
                                        font : {
                                            fontSize : fieldFontSize
                                        },
                                        color : '#000000',
                                        top : top,
                                        selectionIndicator : true,
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        required : field_arr[index_label][index_size].required,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        value : aux_val.vl,
                                        composed_obj : true,
                                        cardinality : settings.cardinality,
                                        reffer_index : reffer_index,
                                        settings : settings,
                                        changedFlag : 0,
                                        enabled : can_edit
                                    });
                                    if (PLATFORM == 'android') {
                                        content[count].backgroundImage = '';
                                        content[count].backgroundColor = 'white';
                                        content[count].backgroundSelectedColor = '#2E64FE';
                                        content[count].borderColor = 'gray';
                                        content[count].borderRadius = 10;
                                        content[count].color = 'black';
                                        content[count].borderWidth = 1;
                                    }
                                    if (!can_edit) {
                                        content[count].backgroundImage = '';
                                        content[count].backgroundColor = '#BDBDBD';
                                        content[count].borderColor = 'gray';
                                        content[count].borderRadius = 10;
                                        content[count].color = '#848484';
                                        content[count].borderWidth = 1;
                                    }
                                    top += heightValue;

                                    content[count].addEventListener('click', function(e) {
                                        //Ti.API.info('UID: '+e.row.uid);
                                        //e.source.value = e.row.uid;
                                        var postDialog = Titanium.UI.createOptionDialog();
                                        postDialog.options = e.source.arr_opt;
                                        postDialog.cancel = -1;
                                        postDialog.show();

                                        postDialog.addEventListener('click', function(ev) {
                                            if (ev.index >= 0) {
                                                e.source.title = e.source.arr_opt[ev.index];
                                                e.source.value = e.source.arr_picker[ev.index].uid;
                                            }
                                            changedContentValue(e.source);
                                            noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                        });
                                    });
                                    //Add fields:
                                    regionView.add(content[count]);
                                    count++;

                                }
                            }
                            else {

                                var vl_to_field = field_arr[index_label][index_size].actual_value;

                                if (vl_to_field == "" || vl_to_field == "null" || vl_to_field == null) {
                                    if (settings.default_value == "current_user") {
                                        vl_to_field = win.uid;
                                    }
                                }

                                Ti.API.info(vl_to_field + " ----------------- is the uid ------------------- " + settings.default_value);

                                var arr_picker = new Array();
                                var arr_opt = new Array();
                                arr_picker.push({
                                    title : '-- NONE --',
                                    uid : null
                                });
                                arr_opt.push('-- NONE --');

                                var aux_val = {
                                    title : '-- NONE --',
                                    vl : null,
                                    cnt : 0
                                };

                                var counter_loop = 0;
                                var i_data_terms;
                                for (i_data_terms in data_terms) {
                                    if (vl_to_field == data_terms[i_data_terms].uid) {
                                        aux_val.title = data_terms[i_data_terms].title;
                                        aux_val.vl = data_terms[i_data_terms].uid;
                                        aux_val.cnt = counter_loop;
                                    }
                                    arr_picker.push({
                                        title : data_terms[i_data_terms].title,
                                        uid : data_terms[i_data_terms].uid
                                    });
                                    arr_opt.push(data_terms[i_data_terms].title);
                                    counter_loop++;
                                }

                                content[count] = Titanium.UI.createButton({
                                    borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                    width : Ti.Platform.displayCaps.platformWidth - 30,
                                    height : heightValue,
                                    arr_opt : arr_opt,
                                    arr_picker : arr_picker,
                                    title : aux_val.title,
                                    font : {
                                        fontSize : fieldFontSize
                                    },
                                    color : '#000000',
                                    top : top,
                                    selectionIndicator : true,
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    required : field_arr[index_label][index_size].required,
                                    is_title : field_arr[index_label][index_size].is_title,
                                    composed_obj : false,
                                    cardinality : settings.cardinality,
                                    value : aux_val.vl,
                                    reffer_index : reffer_index,
                                    settings : settings,
                                    changedFlag : 0,
                                    enabled : can_edit
                                });
                                if (PLATFORM == 'android') {
                                    content[count].backgroundImage = '';
                                    content[count].backgroundColor = 'white';
                                    content[count].backgroundSelectedColor = '#2E64FE';
                                    content[count].borderColor = 'gray';
                                    content[count].borderRadius = 10;
                                    content[count].color = 'black';
                                    content[count].borderWidth = 1;
                                }
                                if (!can_edit) {
                                    content[count].backgroundImage = '';
                                    content[count].backgroundColor = '#BDBDBD';
                                    content[count].borderColor = 'gray';
                                    content[count].borderRadius = 10;
                                    content[count].color = '#848484';
                                    content[count].borderWidth = 1;
                                }
                                top += heightValue;

                                content[count].addEventListener('click', function(e) {
                                    //Ti.API.info('UID: '+e.row.uid);
                                    //e.source.value = e.row.uid;
                                    var postDialog = Titanium.UI.createOptionDialog();
                                    postDialog.options = e.source.arr_opt;
                                    postDialog.cancel = -1;
                                    postDialog.show();

                                    postDialog.addEventListener('click', function(ev) {
                                        if (ev.index >= 0) {
                                            e.source.title = e.source.arr_opt[ev.index];
                                            e.source.value = e.source.arr_picker[ev.index].uid;
                                        }
                                        changedContentValue(e.source);
                                        noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                    });

                                });
                                //Add fields:
                                regionView.add(content[count]);
                                count++;
                            }
                            //No data checkbox functionality
                            noDataCheckbox(reffer_index, regionView, top);
                            if (content[reffer_index].noDataView != null) {
                                top += 40;
                            }
                            break;

                        //Shows up date (check how it is exhibited):
                        case 'datestamp':
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
                            Ti.API.info(field_arr[index_label][index_size].settings);

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

                            //Add fields:
                            regionView.add(label[count]);

                            // call function display_widget
                            if (widget.settings['time'] != "1") {

                                if (settings.cardinality > 1) {
                                    if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                        var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                        //Decode the stored array:
                                        var decoded = array_cont.fieldByName('encoded_array');
                                        decoded = Base64.decode(decoded);
                                        Ti.API.info('Decoded array is equals to: ' + decoded);
                                        decoded = decoded.toString();

                                        // Token that splits each element contained into the array: 'j8Oc2s1E'
                                        var decoded_values = decoded.split("j8Oc2s1E");
                                    }
                                    else {
                                        var decoded_values = new Array();
                                        decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                    }

                                    var o_index;
                                    for ( o_index = 0; o_index < settings.cardinality; o_index++) {
                                        var text_in_field = "";
                                        if ((o_index < decoded_values.length) && ((decoded_values[o_index] != null) && (decoded_values[o_index] != "null") && (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
                                            var vl_to_field = (decoded_values[o_index]) * 1000;
                                            //Get current
                                            var currentDate = new Date(vl_to_field);
                                            var day = currentDate.getDate();
                                            var month = currentDate.getMonth();
                                            var year = currentDate.getFullYear();
                                            text_in_field = months_set[month] + " / " + day + " / " + year;
                                        }
                                        else {
                                            //Let's show it as
                                            var currentDate = new Date();
                                            var day = currentDate.getDate();
                                            var month = currentDate.getMonth();
                                            var year = currentDate.getFullYear();

                                            if (settings.default_value == 'now') {
                                                var vl_to_field = currentDate.getTime();
                                                text_in_field = months_set[month] + " / " + day + " / " + year;
                                            }
                                            else {
                                                var vl_to_field = null;
                                                text_in_field = "";
                                            }

                                        }

                                        content[count] = Titanium.UI.createLabel({
                                            borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                            private_index : o_index,
                                            width : Ti.Platform.displayCaps.platformWidth - 30,
                                            title_picker : field_arr[index_label][index_size].label,
                                            font : {
                                                fontSize : fieldFontSize
                                            },
                                            text : text_in_field,
                                            textAlign : 'center',
                                            color : '#000000',
                                            backgroundColor : '#FFFFFF',
                                            field_type : field_arr[index_label][index_size].type,
                                            field_name : field_arr[index_label][index_size].field_name,
                                            widget : widget,
                                            settings : settings,
                                            currentDate : currentDate,
                                            update_it : true,
                                            time_type : 0,
                                            required : field_arr[index_label][index_size].required,
                                            value : vl_to_field,
                                            is_title : field_arr[index_label][index_size].is_title,
                                            composed_obj : true,
                                            cardinality : settings.cardinality,
                                            reffer_index : reffer_index,
                                            height : heightValue,
                                            settings : settings,
                                            changedFlag : 0,
                                            can_edit : can_edit,
                                            enabled : can_edit,
                                        });
                                        if (!can_edit) {
                                            content[count].backgroundImage = '';
                                            content[count].backgroundColor = '#BDBDBD';
                                            content[count].borderColor = 'gray';
                                            content[count].color = '#848484';
                                            content[count].borderWidth = 1
                                        }

                                        var mother_of_view = Ti.UI.createView({
                                            height : heightValue,
                                            top : top
                                        });
                                        top += heightValue;

                                        mother_of_view.add(content[count]);

                                        var clear = Ti.UI.createImageView({
                                            image : '/images/cancel.png',
                                            right : '4%',
                                            height : '35dp',
                                            width : '35dp',
                                            is_clear : true,
                                            its_parent : content[count],
                                            can_edit : can_edit,
                                        });

                                        content[count].clear = clear;
                                        mother_of_view.add(content[count].clear);
                                        content[count].clear.addEventListener('click', function(e) {
                                            if (e.source.can_edit) {
                                                e.source.its_parent.text = "";
                                                e.source.its_parent.value = null;
                                            }
                                        });

                                        content[count].addEventListener('click', function(e) {
                                            if (e.source.can_edit) {
                                                display_widget(e.source);
                                            }
                                        });
                                        //regionView.add(content[count]);
                                        regionView.add(mother_of_view);
                                        count++;

                                    }
                                }
                                else {
                                    var text_in_field = "";
                                    if ((field_arr[index_label][index_size].actual_value != null) && (field_arr[index_label][index_size].actual_value != "null") && (field_arr[index_label][index_size].actual_value != "") && (field_arr[index_label][index_size].actual_value != " ")) {
                                        var vl_to_field = (field_arr[index_label][index_size].actual_value) * 1000;

                                        //Get current
                                        var currentDate = new Date(vl_to_field);
                                        var day = currentDate.getDate();
                                        var month = currentDate.getMonth();
                                        var year = currentDate.getFullYear();
                                        text_in_field = months_set[month] + " / " + day + " / " + year;
                                    }
                                    else {
                                        var currentDate = new Date();

                                        var day = currentDate.getDate();
                                        var month = currentDate.getMonth();
                                        var year = currentDate.getFullYear();

                                        if (settings.default_value == 'now') {
                                            var vl_to_field = currentDate.getTime();
                                            text_in_field = months_set[month] + " / " + day + " / " + year;
                                        }
                                        else {
                                            var vl_to_field = null;
                                            text_in_field = "";
                                        }

                                    }

                                    content[count] = Titanium.UI.createLabel({
                                        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        title_picker : field_arr[index_label][index_size].label,
                                        font : {
                                            fontSize : fieldFontSize
                                        },
                                        text : text_in_field,
                                        textAlign : 'center',
                                        color : '#000000',
                                        backgroundColor : '#FFFFFF',
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        widget : widget,
                                        settings : settings,
                                        currentDate : currentDate,
                                        update_it : true,
                                        value : vl_to_field,
                                        time_type : 0,
                                        required : field_arr[index_label][index_size].required,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        composed_obj : false,
                                        cardinality : settings.cardinality,
                                        reffer_index : reffer_index,
                                        height : heightValue,
                                        settings : settings,
                                        changedFlag : 0,
                                        can_edit : can_edit,
                                        enabled : can_edit,

                                    });
                                    if (!can_edit) {
                                        content[count].backgroundImage = '';
                                        content[count].backgroundColor = '#BDBDBD';
                                        content[count].borderColor = 'gray';
                                        content[count].color = '#848484';
                                        content[count].borderWidth = 1
                                    }

                                    var mother_of_view = Ti.UI.createView({
                                        height : heightValue,
                                        top : top
                                    });
                                    top += heightValue;

                                    mother_of_view.add(content[count]);

                                    var clear = Ti.UI.createImageView({
                                        image : '/images/cancel.png',
                                        right : '4%',
                                        height : '35dp',
                                        width : '35dp',
                                        is_clear : true,
                                        its_parent : content[count],
                                        can_edit : can_edit,
                                    });

                                    content[count].clear = clear;
                                    mother_of_view.add(content[count].clear);
                                    content[count].clear.addEventListener('click', function(e) {
                                        if (e.source.can_edit) {
                                            e.source.its_parent.text = "";
                                            e.source.its_parent.value = null;
                                        }
                                    });

                                    content[count].addEventListener('click', function(e) {
                                        if (e.source.can_edit) {
                                            display_widget(e.source);
                                        }
                                    });
                                    //regionView.add(content[count]);
                                    regionView.add(mother_of_view);
                                    count++;

                                }
                            }
                            else {
                                //Composed field
                                // Date picker
                                // Time picker
                                // For current Titanium Studio version (1.8), Android doesn't supply such pre build API. Here we create it

                                if (settings.cardinality > 1) {
                                    if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                        var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                        //Decode the stored array:
                                        var decoded = array_cont.fieldByName('encoded_array');
                                        decoded = Base64.decode(decoded);
                                        Ti.API.info('Decoded array is equals to: ' + decoded);
                                        decoded = decoded.toString();

                                        // Token that splits each element contained into the array: 'j8Oc2s1E'
                                        var decoded_values = decoded.split("j8Oc2s1E");
                                    }
                                    else {
                                        var decoded_values = new Array();
                                        decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                    }

                                    var o_index;
                                    for ( o_index = 0; o_index < settings.cardinality; o_index++) {
                                        var text_in_field = "";
                                        if ((o_index < decoded_values.length) && ((decoded_values[o_index] != null) && (decoded_values[o_index] != "null") && (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
                                            var vl_to_field = decoded_values[o_index] * 1000;

                                            //Get current
                                            var currentDate = new Date(vl_to_field);

                                            var day = currentDate.getDate();
                                            var month = currentDate.getMonth();
                                            var year = currentDate.getFullYear();
                                            var min = currentDate.getMinutes();
                                            var hours = currentDate.getHours();
                                            //text_in_field = hours + ":" + form_min(min) + " - " + months_set[month] + " / " + day + " / " + year;
                                            text_in_field = date(omadi_time_format, currentDate) + " - " + months_set[month] + " / " + day + " / " + year;
                                        }
                                        else {
                                            //Get current
                                            var currentDate = new Date();

                                            var day = currentDate.getDate();
                                            var month = currentDate.getMonth();
                                            var year = currentDate.getFullYear();
                                            var min = currentDate.getMinutes();
                                            var hours = currentDate.getHours();

                                            if (settings.default_value == 'now') {
                                                var vl_to_field = currentDate.getTime();
                                                //text_in_field = hours + ":" + form_min(min) + " - " + months_set[month] + " / " + day + " / " + year;
                                                text_in_field = date(omadi_time_format, currentDate) + " - " + months_set[month] + " / " + day + " / " + year;
                                            }
                                            else {
                                                var vl_to_field = null;
                                                text_in_field = "";
                                            }
                                        }

                                        //Date picker
                                        content[count] = Titanium.UI.createLabel({
                                            borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                            private_index : o_index,
                                            width : Ti.Platform.displayCaps.platformWidth - 30,
                                            font : {
                                                fontSize : fieldFontSize
                                            },
                                            text : text_in_field,
                                            textAlign : 'center',
                                            color : '#000000',
                                            backgroundColor : '#FFFFFF',
                                            field_type : field_arr[index_label][index_size].type,
                                            field_name : field_arr[index_label][index_size].field_name,
                                            title_picker : field_arr[index_label][index_size].label,
                                            widget : widget,
                                            settings : settings,
                                            currentDate : currentDate,
                                            update_it : true,
                                            value : vl_to_field,
                                            time_type : 1,
                                            required : field_arr[index_label][index_size].required,
                                            is_title : field_arr[index_label][index_size].is_title,
                                            composed_obj : true,
                                            cardinality : settings.cardinality,
                                            reffer_index : reffer_index,
                                            height : heightValue,
                                            settings : settings,
                                            changedFlag : 0,
                                            can_edit : can_edit,
                                            enabled : can_edit,

                                        });

                                        if (!can_edit) {
                                            content[count].backgroundImage = '';
                                            content[count].backgroundColor = '#BDBDBD';
                                            content[count].borderColor = 'gray';
                                            content[count].color = '#848484';
                                            content[count].borderWidth = 1
                                        }

                                        var mother_of_view = Ti.UI.createView({
                                            height : heightValue,
                                            top : top
                                        });
                                        top += heightValue;

                                        mother_of_view.add(content[count]);

                                        var clear = Ti.UI.createImageView({
                                            image : '/images/cancel.png',
                                            right : '4%',
                                            height : '35dp',
                                            width : '35dp',
                                            is_clear : true,
                                            its_parent : content[count],
                                            can_edit : can_edit,
                                        });

                                        content[count].clear = clear;
                                        mother_of_view.add(content[count].clear);
                                        content[count].clear.addEventListener('click', function(e) {
                                            if (e.source.can_edit) {
                                                e.source.its_parent.text = "";
                                                e.source.its_parent.value = null;
                                            }
                                        });

                                        content[count].addEventListener('click', function(e) {
                                            if (e.source.can_edit) {
                                                display_widget(e.source);
                                            }
                                        });
                                        //regionView.add(content[count]);
                                        regionView.add(mother_of_view);
                                        count++;
                                    }
                                }
                                else {
                                    var text_in_field = "";
                                    if ((field_arr[index_label][index_size].actual_value != null) && (field_arr[index_label][index_size].actual_value != "null") && (field_arr[index_label][index_size].actual_value != "") && (field_arr[index_label][index_size].actual_value != " ")) {
                                        var vl_to_field = field_arr[index_label][index_size].actual_value * 1000;
                                        //Get current
                                        var currentDate = new Date(vl_to_field);

                                        var day = currentDate.getDate();
                                        var month = currentDate.getMonth();
                                        var year = currentDate.getFullYear();
                                        var min = currentDate.getMinutes();
                                        var hours = currentDate.getHours();
                                        //text_in_field = hours + ":" + form_min(min) + " - " + months_set[month] + " / " + day + " / " + year;
                                        text_in_field = date(omadi_time_format, currentDate) + " - " + months_set[month] + " / " + day + " / " + year;
                                    }
                                    else {
                                        //Get current
                                        var currentDate = new Date();

                                        var day = currentDate.getDate();
                                        var month = currentDate.getMonth();
                                        var year = currentDate.getFullYear();
                                        var min = currentDate.getMinutes();
                                        var hours = currentDate.getHours();

                                        if (settings.default_value == 'now') {
                                            var vl_to_field = currentDate.getTime();
                                            //text_in_field = hours + ":" + form_min(min) + " - " + months_set[month] + " / " + day + " / " + year;
                                            text_in_field = date(omadi_time_format, currentDate) + " - " + months_set[month] + " / " + day + " / " + year;
                                        }
                                        else {
                                            var vl_to_field = null;
                                            text_in_field = "";
                                        }
                                    }

                                    //Date picker

                                    content[count] = Titanium.UI.createLabel({
                                        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        font : {
                                            fontSize : fieldFontSize
                                        },
                                        text : text_in_field,
                                        textAlign : 'center',
                                        color : '#000000',
                                        backgroundColor : '#FFFFFF',
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        title_picker : field_arr[index_label][index_size].label,
                                        widget : widget,
                                        settings : settings,
                                        currentDate : currentDate,
                                        update_it : true,
                                        time_type : 1,
                                        required : field_arr[index_label][index_size].required,
                                        value : vl_to_field,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        composed_obj : false,
                                        cardinality : settings.cardinality,
                                        reffer_index : reffer_index,
                                        height : heightValue,
                                        settings : settings,
                                        changedFlag : 0,
                                        can_edit : can_edit,
                                        enabled : can_edit,
                                    });
                                    if (!can_edit) {
                                        content[count].backgroundImage = '';
                                        content[count].backgroundColor = '#BDBDBD';
                                        content[count].borderColor = 'gray';
                                        content[count].color = '#848484';
                                        content[count].borderWidth = 1
                                    }

                                    var mother_of_view = Ti.UI.createView({
                                        height : heightValue,
                                        top : top
                                    });
                                    top += heightValue;

                                    mother_of_view.add(content[count]);

                                    var clear = Ti.UI.createImageView({
                                        image : '/images/cancel.png',
                                        right : '4%',
                                        height : '35dp',
                                        width : '35dp',
                                        is_clear : true,
                                        its_parent : content[count],
                                        can_edit : can_edit,
                                    });

                                    content[count].clear = clear;
                                    mother_of_view.add(content[count].clear);
                                    content[count].clear.addEventListener('click', function(e) {
                                        if (e.source.can_edit) {
                                            e.source.its_parent.text = "";
                                            e.source.its_parent.value = null;
                                        }
                                    });

                                    content[count].addEventListener('click', function(e) {
                                        if (e.source.can_edit) {
                                            display_widget(e.source);
                                        }
                                    });
                                    //regionView.add(content[count]);
                                    regionView.add(mother_of_view);
                                    count++;
                                }

                            }
                            //No data checkbox functionality
                            noDataCheckbox(reffer_index, regionView, top);
                            if (content[reffer_index].noDataView != null) {
                                top += 40;
                            }
                            break;

                        //Shows the on and off button?
                        case 'list_boolean':

                            var settings = JSON.parse(field_arr[index_label][index_size].settings);

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

                            //Add fields:
                            regionView.add(label[count]);

                            if (settings.cardinality > 1) {

                                if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                    var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                    //Decode the stored array:
                                    var decoded = array_cont.fieldByName('encoded_array');
                                    decoded = Base64.decode(decoded);
                                    Ti.API.info('Decoded array is equals to: ' + decoded);
                                    decoded = decoded.toString();

                                    // Token that splits each element contained into the array: 'j8Oc2s1E'
                                    var decoded_values = decoded.split("j8Oc2s1E");
                                }
                                else {
                                    var decoded_values = new Array();
                                    decoded_values[0] = field_arr[index_label][index_size].actual_value;

                                }

                                var o_index;
                                for ( o_index = 0; o_index < settings.cardinality; o_index++) {

                                    if (o_index < decoded_values.length) {
                                        if ((decoded_values[o_index] === true ) || (decoded_values[o_index] == "true") || (field_arr[index_label][index_size].actual_value == 1) || (field_arr[index_label][index_size].actual_value == '1'))
                                            var vl_to_field = true;
                                        else
                                            var vl_to_field = false;
                                    }
                                    else {
                                        var vl_to_field = false;
                                    }

                                    content[count] = Titanium.UI.createButton({
                                        top : top,
                                        width : '30dp',
                                        height : '30dp',
                                        borderRadius : 4,
                                        borderColor : '#333',
                                        borderWidth : 1,
                                        backgroundColor : '#FFF',
                                        private_index : o_index,
                                        //height : getScreenHeight() * 0.1,
                                        value : vl_to_field,
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        enabled : true,
                                        required : field_arr[index_label][index_size].required,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        composed_obj : true,
                                        cardinality : settings.cardinality,
                                        reffer_index : reffer_index,
                                        settings : settings,
                                        changedFlag : 0,
                                        enabled : true
                                    });
                                    top += getScreenHeight() * 0.1;

                                    content[count].addEventListener('click', function(e) {
                                        if (e.source.value === false) {
                                            e.source.backgroundImage = '/images/selected_test.png';
                                            e.source.borderWidth = 2;
                                            e.source.value = true;
                                        }
                                        else {
                                            e.source.backgroundImage = null;
                                            e.source.borderWidth = 1;
                                            e.source.value = false;
                                        }

                                        Ti.API.info('Actual value = ' + e.source.value);
                                        changedContentValue(e.source);
                                    });

                                    regionView.add(content[count]);
                                    count++;
                                }
                            }
                            else {

                                if ((field_arr[index_label][index_size].actual_value === true ) || (field_arr[index_label][index_size].actual_value == "true") || (field_arr[index_label][index_size].actual_value == 1) || (field_arr[index_label][index_size].actual_value == '1'))
                                    var vl_to_field = true;
                                else
                                    var vl_to_field = false;

                                content[count] = Titanium.UI.createView({
                                    top : top,
                                    width : '30dp',
                                    height : '30dp',
                                    borderRadius : 4,
                                    borderColor : '#333',
                                    borderWidth : 1,
                                    backgroundColor : '#FFF',
                                    private_index : o_index,
                                    value : vl_to_field,
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    enabled : true,
                                    required : field_arr[index_label][index_size].required,
                                    is_title : field_arr[index_label][index_size].is_title,
                                    composed_obj : false,
                                    cardinality : settings.cardinality,
                                    reffer_index : reffer_index,
                                    settings : settings,
                                    changedFlag : 0,
                                    enabled : true
                                });
                                top += getScreenHeight() * 0.1;

                                content[count].addEventListener('click', function(e) {
                                    Ti.API.info("CLICK");
                                    if (e.source.value === false) {
                                        e.source.backgroundImage = '/images/selected_test.png';
                                        e.source.borderWidth = 2;
                                        e.source.value = true;
                                    }
                                    else {
                                        e.source.backgroundImage = null;
                                        e.source.borderWidth = 1;
                                        e.source.value = false;
                                    }

                                    Ti.API.info('Actual value = ' + e.source.value);
                                    changedContentValue(e.source);
                                });

                                regionView.add(content[count]);
                                count++;
                            }
                            break;

                        //Shows up date (check how it is exhibited):
                        case 'omadi_time':
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
                                text : ( isRequired ? '*' : '') + '' + field_arr[index_label][index_size].label,
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

                            var widget = JSON.parse(field_arr[index_label][index_size].widget);

                            Ti.API.info('SETTINGS FOR DATESTAMP: ' + settings.default_value);
                            Ti.API.info('WIDGET FOR DATESTAMP: ' + widget.settings['time']);

                            //Add fields:
                            regionView.add(label[count]);

                            if (settings.cardinality > 1) {
                                var currentDate;
                                if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                    var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                    //Decode the stored array:
                                    var decoded = array_cont.fieldByName('encoded_array');
                                    decoded = Base64.decode(decoded);
                                    Ti.API.info('Decoded array is equals to: ' + decoded);
                                    decoded = decoded.toString();

                                    // Token that splits each element contained into the array: 'j8Oc2s1E'
                                    var decoded_values = decoded.split("j8Oc2s1E");
                                }
                                else {
                                    var decoded_values = new Array();
                                    decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                }

                                var o_index;
                                for ( o_index = 0; o_index < settings.cardinality; o_index++) {

                                    if ((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") && (decoded_values[o_index] != null) )) {
                                        var vl_to_field = decoded_values[o_index] * 1000;
                                        currentDate = new Date(vl_to_field);
                                    }
                                    else {
                                        currentDate = new Date();
                                        var vl_to_field = currentDate.getTime();
                                    }
                                    var text_in_field = date(omadi_time_format, currentDate);
                                    content[count] = Titanium.UI.createLabel({
                                        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                        private_index : o_index,
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        title_picker : field_arr[index_label][index_size].label,
                                        font : {
                                            fontSize : fieldFontSize
                                        },
                                        text : text_in_field,
                                        textAlign : 'center',
                                        color : '#000000',
                                        backgroundColor : '#FFFFFF',
                                        value : vl_to_field,
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        widget : widget,
                                        settings : settings,
                                        currentDate : currentDate,
                                        update_it : true,
                                        timezone : null,
                                        required : field_arr[index_label][index_size].required,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        composed_obj : true,
                                        cardinality : settings.cardinality,
                                        reffer_index : reffer_index,
                                        height : heightValue,
                                        settings : settings,
                                        changedFlag : 0,
                                        can_edit : can_edit,
                                        enabled : can_edit
                                    });
                                    if (!can_edit) {
                                        content[count].backgroundImage = '';
                                        content[count].backgroundColor = '#BDBDBD';
                                        content[count].borderColor = 'gray';
                                        content[count].color = '#848484';
                                        content[count].borderWidth = 1
                                    }

                                    var mother_of_view = Ti.UI.createView({
                                        height : heightValue,
                                        top : top
                                    });
                                    top += heightValue;

                                    mother_of_view.add(content[count]);

                                    var clear = Ti.UI.createImageView({
                                        image : '/images/cancel.png',
                                        right : '4%',
                                        height : '35dp',
                                        width : '35dp',
                                        is_clear : true,
                                        its_parent : content[count],
                                        can_edit : can_edit,
                                    });

                                    content[count].clear = clear;
                                    mother_of_view.add(content[count].clear);
                                    content[count].clear.addEventListener('click', function(e) {
                                        if (e.source.can_edit) {
                                            e.source.its_parent.text = "";
                                            e.source.its_parent.value = null;
                                        }
                                    });

                                    content[count].addEventListener('click', function(e) {
                                        if (e.source.can_edit) {
                                            display_omadi_time(e.source);
                                        }
                                    });
                                    //regionView.add(content[count]);
                                    regionView.add(mother_of_view);
                                    count++;
                                }
                            }
                            else {
                                var text_in_field = "";
                                var currentDate;
                                var vl_to_field;
                                if ((field_arr[index_label][index_size].actual_value != null) && (field_arr[index_label][index_size].actual_value != "null") && (field_arr[index_label][index_size].actual_value != "") && (field_arr[index_label][index_size].actual_value != " ")) {
                                    vl_to_field = field_arr[index_label][index_size].actual_value * 1000;
                                    currentDate = new Date(vl_to_field);
                                }
                                else {
                                    currentDate = new Date();
                                    vl_to_field = currentDate.getTime();
                                }
                                text_in_field = date(omadi_time_format, currentDate);

                                content[count] = Titanium.UI.createLabel({
                                    borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                    width : Ti.Platform.displayCaps.platformWidth - 30,
                                    title_picker : field_arr[index_label][index_size].label,
                                    font : {
                                        fontSize : fieldFontSize
                                    },
                                    text : text_in_field,
                                    textAlign : 'center',
                                    color : '#000000',
                                    backgroundColor : '#FFFFFF',
                                    value : vl_to_field,
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    widget : widget,
                                    settings : settings,
                                    currentDate : currentDate,
                                    update_it : true,
                                    value : currentDate.getTime(),
                                    required : field_arr[index_label][index_size].required,
                                    is_title : field_arr[index_label][index_size].is_title,
                                    composed_obj : false,
                                    cardinality : settings.cardinality,
                                    reffer_index : reffer_index,
                                    height : heightValue,
                                    settings : settings,
                                    changedFlag : 0,
                                    can_edit : can_edit,
                                    enabled : can_edit
                                });
                                if (!can_edit) {
                                    content[count].backgroundImage = '';
                                    content[count].backgroundColor = '#BDBDBD';
                                    content[count].borderColor = 'gray';
                                    content[count].color = '#848484';
                                    content[count].borderWidth = 1
                                }

                                var mother_of_view = Ti.UI.createView({
                                    height : heightValue,
                                    top : top
                                });
                                top += heightValue;

                                mother_of_view.add(content[count]);

                                var clear = Ti.UI.createImageView({
                                    image : '/images/cancel.png',
                                    right : '4%',
                                    height : '35dp',
                                    width : '35dp',
                                    is_clear : true,
                                    its_parent : content[count],
                                    can_edit : can_edit,
                                });

                                content[count].clear = clear;
                                mother_of_view.add(content[count].clear);
                                content[count].clear.addEventListener('click', function(e) {
                                    if (e.source.can_edit) {
                                        e.source.its_parent.text = "";
                                        e.source.its_parent.value = null;
                                    }
                                });

                                content[count].addEventListener('click', function(e) {
                                    if (e.source.can_edit) {
                                        display_omadi_time(e.source);
                                    }
                                });
                                //regionView.add(content[count]);
                                regionView.add(mother_of_view);
                                count++;
                            }
                            //No data checkbox functionality
                            noDataCheckbox(reffer_index, regionView, top);
                            if (content[reffer_index].noDataView != null) {
                                top += 40;
                            }
                            break;

                        case 'vehicle_fields':
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
                            var fi_name = field_arr[index_label][index_size].field_name;
                            fi_name = fi_name.split('___');
                            if (fi_name[1]) {
                                var i_name = fi_name[1];
                            }
                            else {
                                var i_name = fi_name[0];
                            }
                            i_name = i_name.charAt(0).toUpperCase() + i_name.slice(1);

                            if (i_name == "Make") {
                                var _make_ref = reffer_index;
                            }
                            label[count].text += (' ' + i_name);
                            //Add fields:
                            regionView.add(label[count]);

                            if (settings.cardinality > 1) {
                                if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
                                    var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

                                    //Decode the stored array:
                                    var decoded = array_cont.fieldByName('encoded_array');
                                    decoded = Base64.decode(decoded);
                                    Ti.API.info('Decoded array is equals to: ' + decoded);
                                    decoded = decoded.toString();

                                    // Token that splits each element contained into the array: 'j8Oc2s1E'
                                    var decoded_values = decoded.split("j8Oc2s1E");
                                }
                                else {
                                    var decoded_values = new Array();
                                    decoded_values[0] = field_arr[index_label][index_size].actual_value;
                                }

                                var o_index;
                                for ( o_index = 0; o_index < settings.cardinality; o_index++) {

                                    if ((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
                                        var vl_to_field = decoded_values[o_index];
                                    }
                                    else {
                                        var vl_to_field = "";
                                    }

                                    content[count] = Ti.UI.createTextField({
                                        hintText : "#" + o_index + " " + field_arr[index_label][index_size].label + " " + i_name,
                                        private_index : o_index,
                                        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                        textAlign : 'left',
                                        width : Ti.Platform.displayCaps.platformWidth - 30,
                                        height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                        font : {
                                            fontSize : fieldFontSize
                                        },
                                        color : '#000000',
                                        top : top,
                                        field_type : field_arr[index_label][index_size].type,
                                        field_name : field_arr[index_label][index_size].field_name,
                                        required : field_arr[index_label][index_size].required,
                                        is_title : field_arr[index_label][index_size].is_title,
                                        composed_obj : true,
                                        cardinality : settings.cardinality,
                                        value : vl_to_field,
                                        reffer_index : reffer_index,
                                        settings : settings,
                                        changedFlag : 0,
                                        autocorrect : false,
                                        returnKeyType : Ti.UI.RETURNKEY_DONE,
                                        enabled : can_edit,
                                        editable : can_edit
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
                                    top += (PLATFORM == 'android') ? heightTextField : heightValue;

                                    regionView.add(content[count]);
                                    content[count].addEventListener('change', function(e) {
                                        if (e.source.i_name == 'Make') {
                                            if (e.source.value.length > 18) {
                                                e.source.value = e.source.value.substr(0, 18);
                                            }
                                        }
                                        else if (e.source.i_name == 'Model') {
                                            if (e.source.value.length > 38) {
                                                e.source.value = e.source.value.substr(0, 38);
                                            }
                                        }
                                        changedContentValue(e.source);
                                        noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                    });
                                    count++;
                                }
                            }
                            else {
                                var vl_to_field = field_arr[index_label][index_size].actual_value;
                                var data_terms = new Array();

                                if (i_name == "Make") {
                                    var aux_dt = db_display.execute("SELECT DISTINCT make FROM _vehicles");
                                    var keep_from_make = vl_to_field;

                                    while (aux_dt.isValidRow()) {
                                        data_terms.push(aux_dt.fieldByName("make"));
                                        aux_dt.next();
                                    }
                                }
                                else {
                                    data_terms = get_models(keep_from_make);
                                }

                                content[count] = Ti.UI.createTextField({
                                    hintText : field_arr[index_label][index_size].label + " " + i_name,
                                    fantasy_name : i_name,
                                    borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                    textAlign : 'left',
                                    width : Ti.Platform.displayCaps.platformWidth - 30,
                                    height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                    font : {
                                        fontSize : fieldFontSize
                                    },
                                    color : '#000000',
                                    top : top,
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    required : field_arr[index_label][index_size].required,
                                    is_title : field_arr[index_label][index_size].is_title,
                                    composed_obj : false,
                                    cardinality : settings.cardinality,
                                    value : vl_to_field,
                                    reffer_index : reffer_index,
                                    make_ind : _make_ref,
                                    terms : data_terms,
                                    //first_time : true,
                                    lastValue : vl_to_field,
                                    _make : keep_from_make,
                                    settings : settings,
                                    changedFlag : 0,
                                    i_name : i_name,
                                    my_index : count,
                                    autocorrect : false,
                                    returnKeyType : Ti.UI.RETURNKEY_DONE,
                                    enabled : can_edit,
                                    editable : can_edit,
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
                                //AUTOCOMPLETE TABLE FOR vehicle_fields fields
                                var autocomplete_table = Titanium.UI.createTableView({
                                    top : top + ((PLATFORM == 'android') ? heightTextField - 10 : heightValue),
                                    searchHidden : true,
                                    zIndex : 15,
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
                                // TABLE EVENTS for vehicle_fields fields, cardinality == 1
                                //
                                content[count].autocomplete_table.addEventListener('click', function(e) {
                                    if (PLATFORM != 'android') {
                                        e.source.textField.value = e.rowData.title;
                                    }
                                    else {
                                        e.source.setValueF(e.rowData.title);
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
                                });

                                content[count].addEventListener('focus', function(e) {
                                    adjustView(e.source.my_index, e.source.regionView.top + e.source.top - ((PLATFORM == 'android') ? heightTextField : heightValue));
                                    if (e.source.fantasy_name == "Model") {
                                        Ti.API.info(content[e.source.make_ind].value);

                                        if (content[e.source.make_ind].value == e.source._make) {
                                            Ti.API.info('User didn\'t change make');
                                        }
                                        else {
                                            Ti.API.info('Make changed, reloading list')
                                            e.source._make = content[e.source.make_ind].value;
                                            e.source.terms = get_models(content[e.source.make_ind].value);
                                            e.source.value = null;
                                            //e.source.first_time = true;
                                        }
                                    }
                                });
                                //
                                // SEARCH EVENTS vehicle_fields, cardinality == 1
                                //
                                content[count].addEventListener('change', function(e) {
                                    if (e.source.i_name == 'Make') {
                                        if (e.source.value.length > 18) {
                                            e.source.value = e.source.value.substr(0, 18);
                                        }
                                    }
                                    else if (e.source.i_name == 'Model') {
                                        if (e.source.value.length > 38) {
                                            e.source.value = e.source.value.substr(0, 38);
                                        }
                                    }
                                    changedContentValue(e.source);
                                    noDataChecboxEnableDisable(e.source, e.source.reffer_index);

                                    if (e.source.lastValue != e.source.value) {
                                        var list = e.source.terms;
                                        var func = function setValueF(value_f) {
                                            e.source.value = value_f;
                                            Ti.API.info('Value: ' + value_f);
                                        };

                                        if ((e.value != null) && (e.value != '')) {
                                            table_data = [];
                                            var i;
                                            for ( i = 0; i < list.length; i++) {
                                                var rg = new RegExp(e.source.value, 'i');
                                                if (list[i].search(rg) != -1) {

                                                    //Create partial matching row
                                                    var row = Ti.UI.createTableViewRow({
                                                        height : getScreenHeight() * 0.10,
                                                        title : list[i],
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
                                            e.source.autocomplete_table.height = getScreenHeight() * 0.3;
                                            e.source.autocomplete_table.borderWidth = 1;
                                            if (table_data.lenth == 0) {
                                                e.source.autocomplete_table.borderWidth = 0;
                                            }
                                            if (table_data.length < 3 && table_data.length > 0) {
                                                e.source.autocomplete_table.height = (table_data.length == 1) ? getScreenHeight() * 0.1 : getScreenHeight() * 0.2;
                                            }
                                            e.source.autocomplete_table.scrollToTop(0, {
                                                animated : false
                                            });
                                            viewContent.scrollTo(0, (e.source.regionView.top + e.source.top - ((PLATFORM == 'android') ? heightTextField : heightValue)));
                                            if (table_data.length > 0) {
                                                e.source.autocomplete_table.visible = true;
                                            }
                                            else {
                                                e.source.autocomplete_table.visible = false;
                                            }
                                        }
                                        else {
                                            e.source.autocomplete_table.visible = false;
                                        }
                                    }

                                    //e.source.first_time = false;
                                    e.source.lastValue = e.source.value;
                                });
                                //Add fields:
                                regionView.add(content[count]);
                                count++;

                            }
                            //No data checkbox functionality
                            if (settings.parts != null && settings.parts != "") {
                                partsArr.push(reffer_index);
                                if (partsArr.length == 2) {
                                    content[reffer_index].partsArr = partsArr;
                                    partsArr = [];
                                    noDataCheckbox(reffer_index, regionView, top);
                                    if (content[reffer_index].noDataView != null) {
                                        top += 40;
                                    }
                                }
                            }

                            break;

                        case 'region_separator_mode':
                            if (field_arr[index_label][index_size].region_show === true) {
                                if (top == 0) {
                                    var regionTop = 0;
                                }
                                else {
                                    var regionTop = top + 10;
                                }
                                label[count] = Ti.UI.createLabel({
                                    text : field_arr[index_label][index_size].label + ' :',
                                    color : '#000000',
                                    font : {
                                        fontSize : fieldFontSize,
                                        fontWeight : 'bold'
                                    },
                                    textAlign : 'center',
                                    width : '100%',
                                    touchEnabled : false,
                                    height : 40,
                                    top : regionTop,
                                    backgroundColor : '#FFFFFF'
                                });
                                top += 40;

                                regionView.add(label[count]);
                                count++;
                            }

                            break;
                        //Stuff to add file

                        case 'image':
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
                            //Add fields:
                            var reserveTop = top;
                            regionView.add(label[count]);
                            var settings = JSON.parse(field_arr[index_label][index_size].settings);
                            var reffer_index = count;
                            top += heightValue;

                            if (settings.cardinality > 1 || settings.cardinality < 0) {
                                isUpdated = [];
                                content[count] = Ti.UI.createScrollView({
                                    right : 10,
                                    width : Ti.Platform.displayCaps.platformWidth - 30,
                                    top : top,
                                    contentWidth : 'auto',
                                    contentHeight : 100,
                                    height : 100,
                                    reffer_index : reffer_index,
                                    arrImages : null,
                                    scrollType : "horizontal",
                                    layout : 'horizontal',
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    required : field_arr[index_label][index_size].required,
                                    is_title : field_arr[index_label][index_size].is_title,
                                    label : field_arr[index_label][index_size].label,
                                    composed_obj : true,
                                    addButton : null,
                                    cardinality : settings.cardinality,
                                    value : null,
                                    enabled : true
                                });
                                regionView.add(content[count]);
                                var decodedValues = [];
                                if (win.mode == 1) {
                                    var val = db_display.execute('SELECT * FROM ' + win.type + ' WHERE nid=' + win.nid + ';');
                                    if (val.fieldByName(field_arr[index_label][index_size].field_name + '___file_id') == '7411317618171051229' || val.fieldByName(field_arr[index_label][index_size].field_name + '___file_id') == 7411317618171051229) {
                                        array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '___file_id\'');
                                    }
                                    else {
                                        array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');
                                    }
                                    if (array_cont.rowCount > 0) {
                                        //Decode the stored array:
                                        var decoded = array_cont.fieldByName('encoded_array');
                                        decoded = Base64.decode(decoded);
                                        decoded = decoded.toString();
                                        decodedValues = decoded.split("j8Oc2s1E");
                                    }
                                    val = db_display.execute('SELECT * FROM file_upload_queue WHERE nid=' + win.nid + ' AND field_name ="' + field_arr[index_label][index_size].field_name + '";');
                                    if (val.rowCount > 0) {
                                        while (val.isValidRow()) {
                                            isUpdated[val.fieldByName('delta')] = true;
                                            decodedValues[val.fieldByName('delta')] = Ti.Utils.base64decode(val.fieldByName('file_data'));
                                            val.next();
                                        }
                                    }
                                }
                                var arrImages = [];

                                if (settings.cardinality < 0) {
                                    o_index = 0;
                                    for ( img = 0; img < decodedValues.length; img++) {
                                        var updated = false
                                        if ((img < decodedValues.length) && (decodedValues[img] != "") && (decodedValues[img] != null) && decodedValues[img] != 'null' && decodedValues[img] != 'undefined') {
                                            var vl_to_field = decodedValues[img];
                                            if (isUpdated[img] == true) {
                                                updated = isUpdated[img];
                                            }
                                        }
                                        else {
                                            continue;
                                        }
                                        arrImages = createImage(o_index, arrImages, vl_to_field, content[count], updated);
                                        o_index += 1;
                                    }
                                    if (decodedValues.length == 0 || o_index == 0) {
                                        arrImages = createImage(o_index, arrImages, defaultImageVal, content[count], false);
                                        o_index += 1;
                                    }

                                    //--------- Add Button
                                    addButton = Ti.UI.createButton({
                                        right : '5',
                                        title : '+',
                                        top : reserveTop,
                                        height : 40,
                                        width : 40,
                                        scrollView : content[count],
                                        o_index : o_index
                                    });
                                    regionView.add(addButton);
                                    addButton.addEventListener('click', function(e) {
                                        arrImages = createImage(e.source.o_index, arrImages, defaultImageVal, e.source.scrollView, false);
                                        e.source.scrollView.arrImages = arrImages
                                        e.source.o_index += 1;
                                    });
                                    content[count].addButton = addButton;
                                }
                                else {
                                    var o_index;
                                    for ( o_index = 0; o_index < settings.cardinality; o_index++) {
                                        var updated = false;
                                        if ((o_index < decodedValues.length) && (decodedValues[o_index] != "") && (decodedValues[o_index] != null) && decodedValues[o_index] != 'null' && decodedValues[o_index] != 'undefined') {
                                            var vl_to_field = decodedValues[o_index];
                                            if (isUpdated[o_index] == true) {
                                                updated = isUpdated[o_index];
                                            }
                                        }
                                        else {
                                            var vl_to_field = defaultImageVal;
                                        }
                                        arrImages = createImage(o_index, arrImages, vl_to_field, content[count], updated);
                                    }
                                }
                                content[count].arrImages = arrImages;
                            }
                            else {
                                isUpdated = false;
                                if (win.mode == 1) {
                                    var results = db_display.execute('SELECT * FROM ' + win.type + ' WHERE nid=' + win.nid + ';');
                                    if (results.rowCount > 0) {
                                        val = results.fieldByName(field_arr[index_label][index_size].field_name + '___file_id');
                                        if (val == null || val == 'null' || val == 'undefined') {
                                            val = results.fieldByName(field_arr[index_label][index_size].field_name);
                                        }
                                    }
                                    valUp = db_display.execute('SELECT * FROM file_upload_queue WHERE nid=' + win.nid + ' AND field_name ="' + field_arr[index_label][index_size].field_name + '";');

                                    if (valUp.rowCount > 0) {
                                        isUpdated = true;
                                        val = Ti.Utils.base64decode(valUp.fieldByName('file_data'));
                                    }
                                    if (val == null || val == 'null' || val == 'undefined' || val.rowCount == 0) {
                                        val = defaultImageVal;
                                    }

                                }
                                content[count] = Ti.UI.createImageView({
                                    label : field_arr[index_label][index_size].label,
                                    width : Ti.Platform.displayCaps.platformWidth - 30,
                                    height : 80,
                                    width : 80,
                                    reffer_index : reffer_index,
                                    size : {
                                        height : '80',
                                        width : '80'
                                    },
                                    top : top + 10,
                                    private_index : 0,
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    required : field_arr[index_label][index_size].required,
                                    is_title : field_arr[index_label][index_size].is_title,
                                    composed_obj : false,
                                    image : defaultImageVal,
                                    imageVal : val,
                                    isImage : false,
                                    bigImg : null,
                                    mimeType : null,
                                    cardinality : settings.cardinality,
                                    isUpdated : isUpdated,
                                    value : null,
                                    enabled : true
                                });

                                if (isUpdated == true) {
                                    content[count].image = val;
                                    content[count].bigImg = val;
                                    content[count].isImage = true;
                                }
                                content[count].addEventListener('click', function(e) {
                                    //Following method will open camera to capture the image.
                                    if (e.source.isImage != false) {
                                        var postDialog = Titanium.UI.createOptionDialog();
                                        postDialog.options = ['Capture Image', 'Show Image', 'cancel'];
                                        postDialog.cancel = 2;
                                        postDialog.show();

                                        postDialog.addEventListener('click', function(ev) {
                                            if (ev.index == 0) {
                                                openCamera(e);
                                            }
                                            else if (ev.index == 1) {
                                                //downloadMainImage(e.source.imageVal, e.source, win);
                                                Omadi.display.displayLargeImage(e.source, win.nid, e.source.imageVal);
                                            }
                                        });
                                        return;
                                    }
                                    openCamera(e);
                                });
                                regionView.add(content[count]);
                            }

                            top += 100;
                            count++;
                            //No data checkbox functionality
                            noDataCheckbox(reffer_index, regionView, top);
                            if (content[reffer_index].noDataView != null) {
                                top += 40;
                            }
                            break;

                        case 'calculation_field':
                            label[count] = Ti.UI.createLabel({
                                text : field_arr[index_label][index_size].label,
                                color : _lb_color,
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
                            var settings = JSON.parse(field_arr[index_label][index_size].settings);
                            if (settings.hidden == null || settings.hidden != 1) {
                                regionView.add(label[count]);
                                top += heightValue;
                            }
                            var reffer_index = count;
                            content[count] = Ti.UI.createView({
                                width : Ti.Platform.displayCaps.platformWidth - 30,
                                top : top,
                                field_type : field_arr[index_label][index_size].type,
                                field_name : field_arr[index_label][index_size].field_name,
                                required : field_arr[index_label][index_size].required,
                                composed_obj : false,
                                is_title : field_arr[index_label][index_size].is_title,
                                cardinality : settings.cardinality,
                                value : field_arr[index_label][index_size].actual_value,
                                label : field_arr[index_label][index_size].label,
                                reffer_index : reffer_index,
                                settings : settings,
                                layout : 'vertical',
                                settings : settings,
                                changedFlag : 0,
                                enabled : true
                            });
                            createCalFieldTableFormat(content[count], db_display, content);
                            if (settings.hidden == null || settings.hidden != 1) {
                                regionView.add(content[count]);
                                top += content[count].height + 10;
                            }
                            count++;
                            break;

                        case 'rules_field':
                            if (field_arr[index_label][index_size].actual_value != false && field_arr[index_label][index_size].actual_value != "false" && field_arr[index_label][index_size].actual_value != 0 && JSON.parse(field_arr[index_label][index_size].actual_value).length > 0) {
                                label[count] = Ti.UI.createLabel({
                                    text : field_arr[index_label][index_size].label,
                                    color : _lb_color,
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
                                regionView.add(label[count]);
                                var reffer_index = count;
                                var settings = JSON.parse(field_arr[index_label][index_size].settings);
                                top += heightValue;
                                content[count] = Ti.UI.createView({
                                    width : Ti.Platform.displayCaps.platformWidth - 30,
                                    top : top,
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    required : field_arr[index_label][index_size].required,
                                    composed_obj : false,
                                    is_title : field_arr[index_label][index_size].is_title,
                                    cardinality : settings.cardinality,
                                    value : field_arr[index_label][index_size].actual_value,
                                    label : field_arr[index_label][index_size].label,
                                    reffer_index : reffer_index,
                                    settings : settings,
                                    value : JSON.parse(field_arr[index_label][index_size].actual_value),
                                    layout : 'vertical',
                                    widget : JSON.parse(field_arr[index_label][index_size].widget),
                                    changedFlag : 0,
                                    enabled : true
                                });

                                showRulesRow(content[count], db_display, win);
                                top += content[count].height + 10;
                                regionView.add(content[count]);
                                count++;

                            }
                            break;

                        case 'auto_increment':
                            if (field_arr[index_label][index_size].actual_value != "" && field_arr[index_label][index_size].actual_value != " " && field_arr[index_label][index_size].actual_value != null && field_arr[index_label][index_size].actual_value != "null") {
                                label[count] = Ti.UI.createLabel({
                                    text : field_arr[index_label][index_size].label,
                                    color : _lb_color,
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
                                regionView.add(label[count]);

                                var reffer_index = count;
                                var settings = JSON.parse(field_arr[index_label][index_size].settings);
                                top += heightValue;

                                //alert(c_settings[count]);
                                var prefix = "";
                                if (settings.prefix) {
                                    prefix = settings.prefix;
                                }
                                content[count] = Ti.UI.createTextField({
                                    text : prefix + "" + field_arr[index_label][index_size].actual_value,
                                    hintText : "No prefix for this node",
                                    borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                                    color : '#000000',
                                    backgroundColor : '#D6CED9',
                                    height : (PLATFORM == 'android') ? heightTextField : heightValue,
                                    font : {
                                        fontSize : fieldFontSize
                                    },
                                    width : Ti.Platform.displayCaps.platformWidth - 30,
                                    top : top,
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    fantasy_name : field_arr[index_label][index_size].label,
                                    composed_obj : false,
                                    cardinality : 1,
                                    value : field_arr[index_label][index_size].actual_value,
                                    //first_time : true,
                                    lastValue : field_arr[index_label][index_size].actual_value,
                                    reffer_index : reffer_index,
                                    settings : settings,
                                    changedFlag : 0,
                                    my_index : count,
                                    autocorrect : false,
                                    enabled : false,
                                    editable : false,
                                    touched : false
                                });
                                regionView.add(content[count]);

                                top += (PLATFORM == 'android') ? heightTextField : heightValue;
                                regionView.add(content[count]);
                                count++;
                            }
                            break;
                        case 'file':
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

                            if (settings.cardinality >= -1) {

                                label[count] = Ti.UI.createLabel({
                                    text : field_arr[index_label][index_size].label,
                                    color : _lb_color,
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

                                regionView.add(label[count]);
                                var reffer_index = count;
                                top += heightValue;

                                content[count] = Ti.UI.createView({
                                    width : Ti.Platform.displayCaps.platformWidth - 30,
                                    top : top,
                                    field_type : field_arr[index_label][index_size].type,
                                    field_name : field_arr[index_label][index_size].field_name,
                                    required : field_arr[index_label][index_size].required,
                                    composed_obj : false,
                                    is_title : field_arr[index_label][index_size].is_title,
                                    cardinality : settings.cardinality,
                                    value : field_arr[index_label][index_size].actual_value,
                                    label : field_arr[index_label][index_size].label,
                                    reffer_index : reffer_index,
                                    settings : settings,
                                    layout : 'vertical',
                                    widget : JSON.parse(field_arr[index_label][index_size].widget),
                                    height : heightValue
                                })
                                top += heightValue;

                                regionView.add(content[count]);

                                count++;

                                break;
                            }
                    }

                }
                fields_result.next();
                index_size++;
            }
            fields_result.close();

            if (reg_settings != null && reg_settings.form_part != null) {
                regionView.form_part = parseInt(reg_settings.form_part);
            }
            else {
                regionView.form_part = 0;
            }

            if (reg_settings != null && reg_settings.always_expanded != null) {
                regionView.always_expanded = parseInt(reg_settings.always_expanded);
            }
            else {
                regionView.always_expanded = 0;
            }

            //regionView.calculatedHeight = DPUnitsToPixels(top);
            regionView.calculatedHeight = top + 10;
            regionView.height = 0;
            regionView.expanded = false;
            regionView.hide();

            if (viewContent.max_form_part != null) {
                if (regionView.form_part > viewContent.max_form_part) {
                    viewContent.max_form_part = regionView.form_part;
                }
            }
            else {
                viewContent.max_form_part = regionView.form_part;
            }

            // Ti.API.info("expandedRegion = " + expandedRegion + "\ni = " + regionCount);
            // if(expandedRegion == regionCount) {
            // regionView.calculatedHeight = top;
            // regionView.height = top;
            // regionView.expanded = true;
            // regionView.show();
            // } else {
            // regionView.calculatedHeight = top;
            // regionView.height = 0;
            // regionView.expanded = false;
            // regionView.hide();
            // }
            y = y + regionView.height + 10;

            if (isAnyEnabledField == true) {
                viewContent.add(regionHeader);
                viewContent.add(arrow_img);
                viewContent.add(regionView);
            }
        }
        regions.next();
        regionCount++;
    }

    regions.close();
    if (content_fields != null) {
        content_fields.close();
    }
    db_display.close();

    var top = 0;
    if (viewContent.getChildren() != null) {
        var i;
        for ( i = 0; i < viewContent.getChildren().length; i++) {
            var v = viewContent.getChildren()[i];
            var isLabel = false;
            if (PLATFORM == 'android') {
                if ( v instanceof Ti.UI.Label) {
                    isLabel = true;
                }
            }
            else {
                if (v == '[object TiUILabel]') {
                    isLabel = true;
                }
            }

            if (isLabel) {
                if (v.viewContainer.form_part == viewContent.max_form_part || v.viewContainer.always_expanded == 1) {
                    v.viewContainer.height = v.viewContainer.calculatedHeight;
                    v.viewContainer.expanded = true;
                    v.arrow.image = "/images/light_arrow_down.png";
                    v.top = top;
                    v.arrow.top = top + 5;
                    top = top + DPUnitsToPixels(40);
                    v.viewContainer.top = top;
                    top = top + v.viewContainer.height + 10;
                    v.viewContainer.show();
                }
                else {
                    v.viewContainer.height = 0;
                    v.viewContainer.expanded = false;
                    v.arrow.image = "/images/light_arrow_left.png";
                    v.top = top;
                    v.arrow.top = top + 5;
                    top = top + DPUnitsToPixels(40);
                    v.viewContainer.top = top;
                    top = top + v.viewContainer.height + 10;
                    v.viewContainer.hide();
                }
            }

        }
    }

    if (viewContent.getChildren() != null) {
        var i;
        for ( i = viewContent.getChildren().length; i >= 0; i--) {
            var v = viewContent.getChildren()[i];
            var isLabel = false;
            if (PLATFORM == 'android') {
                if ( v instanceof Ti.UI.Label) {
                    isLabel = true;
                }
            }
            else {
                if (v == '[object TiUILabel]') {
                    isLabel = true;
                }
            }

            if (isLabel == true && v.viewContainer.expanded == true) {
                v.viewContainer.height = v.viewContainer.height + DPUnitsToPixels(30);
                //(getScreenHeight() * 0.3);
                break;
            }
        }
    }

    setTimeout(function() {
        var entityArr = createEntityMultiple();
        var j;
        for ( j = 0; j <= content.length; j++) {
            if (!content[j]) {
                continue;
            }
            // Call for Calculate 'Calculation field'
            if (win.mode == 1) {
                if (content[j].field_type == 'calculation_field') {
                    Ti.API.info("RECALCULATE BUTTON" + content[j].field_name);
                    reCalculate(content[j]);
                }
            }

            // set conditional required field
            if (content[j].settings != null && content[j].settings != "" && content[j].settings['criteria'] != null && content[j].settings['criteria']['search_criteria'] != null) {
                var row_idx;
                for (row_idx in content[j].settings['criteria']['search_criteria']) {
                    var criteria_row = content[j].settings['criteria']['search_criteria'][row_idx];
                    var field_name = criteria_row.field_name;
                    if (content[entityArr[field_name][0]['reffer_index']].condDependedFields == null) {
                        content[entityArr[field_name][0]['reffer_index']].condDependedFields = [];
                    }
                    var depArr = content[entityArr[field_name][0]['reffer_index']].condDependedFields;
                    depArr.push(j);
                    content[entityArr[field_name][0]['reffer_index']].condDependedFields = depArr;
                }
                if (content[j] != null) {
                    conditionalSetRequiredField(j);
                }

            }
            // Download thumbnails from site
            if (win.mode == 1) {
                if (content[j].field_type == 'image') {
                    if (content[j].cardinality > 1 || content[j].cardinality < 0) {
                        var arrImages = content[j].arrImages;
                        for ( i_idx = 0; i_idx < arrImages.length; i_idx++) {
                            if (arrImages[i_idx].imageVal != defaultImageVal && arrImages[i_idx].isUpdated == false) {
                                //downloadThumnail(arrImages[i_idx].imageVal, arrImages[i_idx], win);
                                Omadi.display.setImageViewThumbnail(arrImages[i_idx], win.nid, arrImages[i_idx].imageVal);
                            }
                        }
                    }
                    else {
                        if (content[j].imageVal != defaultImageVal && content[j].isUpdated == false) {
                            //downloadThumnail(content[j].imageVal, content[j], win);
                            Omadi.display.setImageViewThumbnail(content[j], win.nid, content[j].imageVal);
                        }
                    }
                }
            }

            //For 'rules_field'
            if (content[j].widgetObj != null && content[j].widgetObj.type == 'violation_select') {
                var content_widget = content[j].widgetObj;
                if (content_widget['rules_field_name'] != null && content_widget['rules_field_name'] != "") {
                    var _reffer_index = entityArr[content_widget['rules_field_name']][0]['reffer_index'];
                    var _rulesFieldArr;
                    if (content[_reffer_index].rulesFieldArr == null) {
                        _rulesFieldArr = [];
                        content[_reffer_index].rulesFieldArr = _rulesFieldArr;
                    }
                    _rulesFieldArr = content[_reffer_index].rulesFieldArr;
                    _rulesFieldArr.push(content[j].reffer_index);
                    content[_reffer_index].rulesFieldArr = _rulesFieldArr;
                }

                if (content_widget['rules_violation_time_field_name'] != null && content_widget['rules_violation_time_field_name'] != "") {
                    var _reffer_index = entityArr[content_widget['rules_violation_time_field_name']][0]['reffer_index'];
                    var _rulesFieldArr;
                    if (content[_reffer_index].rulesFieldArr == null) {
                        _rulesFieldArr = [];
                        content[_reffer_index].rulesFieldArr = _rulesFieldArr;
                    }
                    _rulesFieldArr = content[_reffer_index].rulesFieldArr;
                    _rulesFieldArr.push(content[j].reffer_index);
                    content[_reffer_index].rulesFieldArr = _rulesFieldArr;
                }

                if (win.mode == 1) {
                    if (content_widget['rules_field_name'] != null && content_widget['rules_violation_time_field_name'] != null && content_widget['rules_field_name'] != "" && content_widget['rules_violation_time_field_name'] != "") {
                        var title = '';
                        var value = content[j].value;
                        if (content[j].settings.cardinality > 1 || content[j].settings.cardinality == 1) {
                            title = content[j].title;
                        }
                        else if (content[j].settings.cardinality == -1) {
                            title = content[j].text;
                        }
                        setParticularRulesField(content[j]);
                        content[j].value = value;
                        if (content[j].settings.cardinality > 1 || content[j].settings.cardinality == 1) {
                            content[j].title = title;
                        }
                        else if (content[j].settings.cardinality == -1) {
                            content[j].text = title;
                            //for(var itens_idx =0; itens_idx<content[j].itens.length; itens_idx++){
                            //for(var value_idx=0; value_idx < content[j].value.length ; value_idx++){
                            //alert(content[j].itens[itens_idx][0].v_into);
                            //alert(content[j].value[value_idx][0].v_into);
                            //if(content[j].itens[itens_idx].v_into == content[j].value[value_idx].v_into){
                            //content[j].itens[itens_idx].is_set = true;
                            //}
                            //}
                            //}
                            var itens = content[j].itens;
                            var value = content[j].value;
                            var itens_idx;
                            for (itens_idx in itens) {
                                var value_idx;
                                for (value_idx in value) {
                                    if (itens[itens_idx].v_info == value[value_idx].v_info) {
                                        itens[itens_idx].is_set = true;
                                    }
                                }
                            }
                            content[j].itens = itens;
                        }

                    }
                }

            }

        }
    }, 100);

    var a = Titanium.UI.createAlertDialog({
        title : 'Omadi',
        buttonNames : ['OK']
    });

    //MENU
    //======================================
    // MENU
    //======================================

    if (Ti.Platform.name == 'android') {
        get_android_menu();
    }
    else {
        bottomButtons(win);
    }

    win.addEventListener('android:back', function() {

        var dialog = Ti.UI.createAlertDialog({
            cancel : 1,
            buttonNames : ['Yes', 'No'],
            message : 'Are you sure you want to cancel and go back?',
            title : 'Cancel'
        });

        dialog.addEventListener('click', function(e) {
            if (e.index == 0) {
                if (win.mode == 1) {
                    Ti.UI.createNotification({
                        message : win.title + ' update was cancelled !',
                        duration : Ti.UI.NOTIFICATION_DURATION_LONG
                    }).show();
                }
                else {
                    Ti.UI.createNotification({
                        message : win.title + ' creation was cancelled !',
                        duration : Ti.UI.NOTIFICATION_DURATION_LONG
                    }).show();
                }
                var db_toDeleteImage = Omadi.utils.openMainDatabase();

                db_toDeleteImage.execute("DELETE FROM file_upload_queue WHERE nid=0;");
                db_toDeleteImage.close();
                win.close();
            }
        });

        dialog.show();
    });

    toolActInd.hide();
};

















/**
 *  Function Name: (actualWindow, goToWindow )
 * Purpouse: Show button Back at the bottom and close actualWindow and go to goToWindow
 * Parameters:
 *  actualWindow:   The windows where the function was called from.
 *  goToWindow:     The target window (The window where the user is gonna be redirected)
 * Variables:
 *  backView:       The bottom button
 *  label_bottom:   Label "Back"
 */
// function showBottom(actualWindow, goToWindow) {
    // var backView = Titanium.UI.createView({
        // top : '95%',
        // backgroundColor : '#111',
        // height : '6%',
        // width : '100%',
        // opacity : 0.99,
        // borderRadius : 5
    // });
// 
    // var label_bottom = Titanium.UI.createLabel({
        // color : '#FFFFFF',
        // text : 'Back',
        // textAlign : 'center',
        // height : 'auto'
    // });
// 
    // backView.add(label_bottom);
// 
    // backView.addEventListener('click', function() {
        // if (!goToWindow.notOpen) {
            // goToWindow.log = actualWindow.log;
            // goToWindow.result = actualWindow.result;
            // goToWindow.name = actualWindow.name;
        // }
// 
        // if ((actualWindow.returnTo == "individual_contact.js") || (actualWindow.returnTo == "individual_potential.js")) {
            // goToWindow.nid = actualWindow.nidToReturn;
            // goToWindow.nameSelected = actualWindow.nameToReturn;
        // }
// 
        // //Avoiding memory leaking problems:
        // if (!goToWindow.notOpen)
            // goToWindow.open();
// 
        // actualWindow.close();
    // });
    // actualWindow.add(backView);
// };




// function getCookie() {"use strict";
    // var db, result, cookie;
// 
    // db = Omadi.utils.openListDatabase();
    // result = db.execute('SELECT * FROM login WHERE rowid=1');
    // cookie = result.fieldByName("cookie");
    // Ti.API.info("FOUND COOKIE = " + cookie);
// 
    // result.close();
    // db.close();
    // return cookie;
// }




// function Omadi.display.showLoadingIndicatorDelete(inform) {
    // Titanium.App.Properties.setBool("indicatorActive", true);
// 
    // // window container
// 
    // indWin = Titanium.UI.createWindow({
        // title : 'Omadi CRM',
        // modal : true,
        // navBarHidden : true,
        // opacity : 0.9,
        // backgroundColor : '#000000'
    // });
// 
    // // black view
    // var indView = Titanium.UI.createView({
        // height : '32%',
        // width : '70%',
        // backgroundColor : '#000',
        // borderRadius : 10,
        // opacity : 0.9
    // });
// 
    // indWin.add(indView);
// 
    // // loading indicator
    // actIndFun = Titanium.UI.createActivityIndicator({
        // height : '7%',
        // message : "Logging you in",
        // width : '30%'
    // });
// 
    // indWin.add(actIndFun);
// 
    // // message
    // var message = Titanium.UI.createLabel({
        // text : inform,
        // color : '#fff',
        // width : 'auto',
        // height : 'auto',
        // textAlign : 'center',
        // font : {
            // fontFamily : 'Helvetica Neue',
            // fontWeight : 'bold'
        // },
        // top : '67%'
    // });
    // indWin.add(message);
// 
    // indWin.orientationModes = [Titanium.UI.PORTRAIT];
    // indWin.open();
    // actIndFun.show();
// };



// function Omadi.display.hideLoadingIndicatorFistPage() {
    // setInterval(function() {
        // if (Titanium.App.Properties.getBool("isFirstPage")) {
            // actIndFun.hide();
            // Titanium.App.Properties.setBool("indicatorActive", false);
            // indWin.close();
        // }
    // }, 1000);
// };





// To reduce image
// function reduceImageSize(blobImage, maxWidth, maxHeight) {
// try{
// var image1 = Titanium.UI.createImageView({
// image : blobImage,
// width : 'auto',
// height : 'auto'
// });
// var imageBlob = image1.toBlob();
// var multiple;
// if(imageBlob.height / imageBlob.width > maxHeight / maxWidth) {
// multiple = imageBlob.height / maxHeight;
// } else {
// multiple = imageBlob.width / maxWidth;
// }
//
// if(multiple >= 1) {
// image1.height = parseInt(imageBlob.height / multiple);
// image1.width = parseInt(imageBlob.width / multiple);
// image1.image = image1.toImage();
// } else {
//
// }
// return image1;
// }catch(evt){
// Ti.API.error("Error in reduce Image Size");
// }
//
// }



// // Download Image from the server
// function downloadThumnail(file_id, image, win) {
// if(win.nid > 0 && file_id > 0){
// var URL = domainName + DOWNLOAD_URL_THUMBNAIL + win.nid + '/' + file_id;
// Ti.API.info("==== site:: " + URL);
// try {
// var downloadImage = Ti.Network.createHTTPClient();
// downloadImage.setTimeout(30000);
// downloadImage.open('GET', URL);
//
// Omadi.utils.setCookieHeader(downloadImage);
//
//
// downloadImage.onload = function(e) {
// var tempImg = Ti.UI.createImageView({
// height : 'auto',
// width : 'auto',
// image : this.responseData
// });
//
// //Ti.API.info(this.responseData);
//
// if (tempImg.toImage().height > 100 || tempImg.toImage().width > 100) {
// image.setImage(reduceImageSize(tempImg.toImage(), 100, 100).toBlob());
// } else {
// image.setImage(this.responseData);
// }
// image.isImage = true;
// //image = tempImg;
// };
//
// downloadImage.onerror = function(e) {
// Ti.API.error("Error in download image.");
// image.image = '../images/default.png';
// };
//
// downloadImage.send();
// }
// catch(e) {
// Ti.API.info("==== ERROR ===" + e);
// }
// }
// }

// function downloadMainImage(file_id, content, win) {
// var actInd = Ti.UI.createActivityIndicator();
// actInd.font = {
// fontFamily : 'Helvetica Neue',
// fontSize : 15,
// fontWeight : 'bold'
// };
// actInd.color = 'white';
// actInd.message = 'Loading...';
// actInd.show();
// if (content.bigImg != null) {
// showImage(content, actInd);
// return;
// }
//
// //Ti.API.info("==== site:: " + URL);
// try {
// var http = Ti.Network.createHTTPClient();
// http.setTimeout(30000);
// http.open('GET', Omadi.DOMAIN_NAME + '/sync/file/' + win.nid + '/' + file_id);
//
// Omadi.utils.setCookieHeader(http);
//
// http.onload = function(e) {
// //Ti.API.info('=========== Success ========');
// content.bigImg = this.responseData;
// showImage(content, actInd);
// actInd.hide();
// };
//
// http.onerror = function(e) {
// Ti.API.error("Error in download Image 2");
// actInd.hide();
// alert("There was an error retrieving the file.");
// };
//
// http.send();
// }
// catch(e) {
// actInd.hide();
// alert("There was an error retrieving the file.");
// Ti.API.info("==== ERROR ===" + e);
// }
// }

// function showImage(source, actInd) {
// var imageWin = Ti.UI.createWindow({
// backgroundColor : '#00000000'
// });
// imageWin.orientation = [Ti.UI.PORTRAIT];
//
// var tanslucent = Ti.UI.createView({
// backgroundColor : 'black',
// opacity : 0.8,
// top : 0,
// bottom : 0,
// right : 0,
// left : 0
// });
//
// //Header part
// // var header = Ti.UI.createView({
// // backgroundImage : '../images/header.png',
// // height : '40',
// // top : 0
// // });
// // header.top = header.left = header.right = 0
// // var labelDesc = Ti.UI.createLabel({
// // text : source.label,
// // left : 5,
// // height : 30,
// // width : Ti.Platform.displayCaps.platformWidth - 10,
// // color : '#fff',
// // font : {
// // fontFamily : 'Helvetica Neue',
// // fontSize : 18,
// // fontWeight : 'bold',
// //
// // },
// // ellipsize : true,
// // wordWrap : false
// // });
// // var close_btn = Ti.UI.createImageView({
// // height : 30,
// // width : 25,
// // top : 4,
// // right : 5,
// // image : '../images/close.png'
// // });
// //imageWin.add(header);
// //header.add(labelDesc);
// //header.add(close_btn);
//
// var fullImage = Omadi.display.getImageViewFromData(source.bigImg, Ti.Platform.displayCaps.platformWidth, Ti.Platform.displayCaps.platformHeight - 50);
//
// // var imageBaseView = Ti.UI.createView({
// // top : 0,
// // right : 0,
// // left : 0,
// // bottom : 0
// // });
//
// fullImage.addEventListener('click', function(e) {
// imageWin.close();
// });
//
// tanslucent.addEventListener('click', function(e) {
// imageWin.close();
// });
//
// if(!(fullImage==null)){
// tanslucent.add(fullImage);
// }
// imageWin.add(tanslucent);
// //imageWin.add(imageBaseView);
// imageWin.open();
// }


// while (n_bund.isValidRow()) {
                    // var name_table = n_bund.fieldByName("bundle_name");
                    // //try{
                    // if ((json.node) && (json.node[name_table])) {
                        // Ti.API.info('##### Called ' + name_table);
                        // Omadi.data.processNodeJson(json.node, name_table, db_installMe, progress);
                        // //callback = process_object(json.node, name_table, quotes, progress, type_request, db_installMe);
                    // }
                    // //Add it to the main screen
                    // var display = n_bund.fieldByName("display_name").toUpperCase();
                    // var description = n_bund.fieldByName("description");
                    // var flag_display = n_bund.fieldByName("display_on_menu");
                    // var id = n_bund.fieldByName("bid");
                    // var _is_disabled = n_bund.fieldByName("disabled");
                    // var _nd = n_bund.fieldByName("_data");
                    // var show_plus = false;
                    // var app_permissions = {
                        // "can_create" : false,
                        // "can_update" : false,
                        // "all_permissions" : false,
                        // "can_view" : false
                    // }
// 
                    // var node_type_json = JSON.parse(_nd);
// 
                    // if (node_type_json.no_mobile_display != null && node_type_json.no_mobile_display == 1 && node_type_json.no_mobile_display == '1') {
                        // n_bund.next();
                        // continue;
                    // }
// 
                    // if (roles.hasOwnProperty(ROLE_ID_ADMIN)) {
                        // show_plus = true;
                        // app_permissions.can_create = true;
                        // app_permissions.all_permissions = true;
                        // app_permissions.can_update = true;
                        // app_permissions.can_view = true;
// 
                    // }
                    // else {
                        // var _l;
                        // for (_l in node_type_json.permissions) {
                            // for (_k in roles) {
                                // if (_l == _k) {
                                    // var stringifyObj = JSON.stringify(node_type_json.permissions[_l]);
                                    // if (node_type_json.permissions[_l]["can create"] || node_type_json.permissions[_l]["all_permissions"]) {
                                        // show_plus = true;
                                        // app_permissions.can_create = true;
                                    // }
// 
                                    // if (node_type_json.permissions[_l]["all_permissions"]) {
                                        // app_permissions.all_permissions = true;
                                        // app_permissions.can_update = true;
                                        // app_permissions.can_view = true;
                                        // continue;
                                    // }
// 
                                    // if (stringifyObj.indexOf('update') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
                                        // app_permissions.can_update = true;
                                    // }
// 
                                    // if (stringifyObj.indexOf('view') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
                                        // app_permissions.can_view = true;
                                    // }
// 
                                // }
                            // }
                        // }
                    // }
// 
                    // if (flag_display == 'false' && (_is_disabled != 1 && _is_disabled != "1" && _is_disabled != "true" && _is_disabled != true)) {
// 
                        // if (app_permissions.can_view == false && app_permissions.can_create == false) {
                            // n_bund.next();
                            // continue;
                        // }
// 
                        // var row_a = Ti.UI.createTableViewRow({
                            // height : "40dp",
                            // name : display,
                            // display : display,
                            // desc : description,
                            // name_table : name_table,
                            // show_plus : show_plus,
                            // app_permissions : app_permissions,
                            // className : 'menu_row', // this is to optimize the rendering
                            // selectionStyle : app_permissions.can_view ? 1 : 0,
                            // backgroundSelectedColor : app_permissions.can_view ? '#BDBDBD' : '#00000000'
                        // });
// 
                        // var icon = Titanium.UI.createImageView({
                            // width : "32dp",
                            // height : "32dp",
                            // top : "6dp",
                            // left : "5dp",
                            // desc : description,
                            // image : '/images/icons/' + name_table.toLowerCase() + '.png',
                        // });
// 
                        // if (icon.toBlob() == null || icon.toBlob().length == 0) {
                            // icon.image = '/images/icons/settings.png';
                        // }
// 
                        // var title_a = Titanium.UI.createLabel({
                            // text : display,
                            // font : {
                                // fontSize : "20dp"
                            // },
                            // width : '82%',
                            // textAlign : 'left',
                            // left : "42dp",
                            // height : 'auto',
                            // desc : description,
                            // color : '#000'
                        // });
// 
                        // var plus_a = Titanium.UI.createButton({
                            // backgroundImage : '/images/plus_btn.png',
                            // backgroundSelectedImage : '/images/plus_btn_selected.png',
                            // width : "54dp",
                            // height : "38dp",
                            // right : "1dp",
                            // is_plus : true
                        // });
                        // if (show_plus === false) {
                            // plus_a.hide();
                        // }
// 
                        // row_a.add(icon);
                        // row_a.add(title_a);
                        // row_a.add(plus_a);
// 
                        // if (PLATFORM == 'android') {
                            // row_a.addEventListener('longclick', function(e) {
                                // if (e.source.desc != null && e.source.desc != "") {
                                    // alert(e.source.desc)
                                // }
                            // });
                        // }
                        // else {
                            // row_a.addEventListener('longpress', function(e) {
                                // if (e.source.desc != null && e.source.desc != "") {
                                    // alert(e.source.desc)
                                // }
                            // });
                        // }
// 
                        // //menu.appendRow(row_a);
                        // data_rows.push(row_a);
                        // data_rows.sort(sortTableView);
                        // menu.setData(data_rows);
                        // db_installMe.execute('UPDATE bundles SET display_on_menu =\'true\' WHERE bid=' + id);
                    // }
                   // n_bund.next();
                    //  }
                    //catch(evt){
                    //}

               // }
               // n_bund.close();
                /*********** Users *************/

// //Fields:
                // if (json.fields) {
//                     
// 
                    // if (json.fields.update) {
                        // Ti.API.info("################################ Fields update found! #################################");
                        // //Array of objects
                        // if (json.fields.update.length) {
                            // var i;
                            // for ( i = 0; i < json.fields.update.length; i++) {
                                // if (progress != null) {
                                    // //Increment Progress Bar
                                    // progress.set();
                                // }
// 
                                // //Encode:
                                // var var_widget = JSON.stringify(json.fields.update[i].widget);
                                // var var_settings = JSON.stringify(json.fields.update[i].settings);
// 
                                // var fid = json.fields.update[i].fid;
// 
                                // if (json.fields.update[i].type != null)
                                    // var type = json.fields.update[i].type.replace(/'/gi, '"');
                                // else
                                    // var type = null;
// 
                                // if (json.fields.update[i].field_name != null)
                                    // var field_name = json.fields.update[i].field_name.replace(/'/gi, '"');
                                // else
                                    // var field_name = null;
// 
                                // if (json.fields.update[i].label != null)
                                    // var label = json.fields.update[i].label.replace(/'/gi, '"');
                                // else
                                    // var label = null;
// 
                                // if (json.fields.update[i].description != null)
                                    // var description = json.fields.update[i].description.replace(/'/gi, '"');
                                // else
                                    // var description = null;
// 
                                // if (json.fields.update[i].bundle != null)
                                    // var bundle = json.fields.update[i].bundle.replace(/'/gi, '"');
                                // else
                                    // var bundle = null;
// 
                                // if (json.fields.update[i].weight != null)
                                    // var weight = json.fields.update[i].weight;
                                // else
                                    // var weight = null;
// 
                                // if (json.fields.update[i].required != null)
                                    // var required = json.fields.update[i].required;
                                // else
                                    // var required = null;
// 
                                // if (json.fields.update[i].disabled != null)
                                    // var disabled = json.fields.update[i].disabled;
                                // else
                                    // var disabled = 0;
// 
                                // if (var_widget != null)
                                    // var widget = var_widget.replace(/'/gi, '"');
                                // else
                                    // var widget = null;
// 
                                // if (var_settings != null) {
                                    // var settings = var_settings.replace(/'/gi, '"');
                                    // var s = JSON.parse(settings);
                                    // var region = s.region;
                                // }
                                // else {
                                    // var settings = null;
                                    // var region = null;
                                // }
// 
                                // var tables = db_installMe.execute('SELECT * FROM fields WHERE fid = ' + fid);
// 
                                // var fi_array = {
                                    // //We might have many (of the same) fid for the same row
                                    // fid : tables.fieldByName('fid'),
                                    // //Settings never changes when there is duplicity
                                    // settings : tables.fieldByName('settings'),
                                    // //Variables
                                    // fi_obj : new Array()
                                // }
// 
                                // var count_fi_database = 0;
// 
                                // while (tables.isValidRow()) {
                                    // //ID is primary key
                                    // fi_array.fi_obj[count_fi_database] = new Array();
                                    // fi_array.fi_obj[count_fi_database]['id'] = tables.fieldByName('id');
                                    // fi_array.fi_obj[count_fi_database]['field_name'] = tables.fieldByName('field_name');
                                    // count_fi_database++;
                                    // tables.next();
                                // }
// 
                                // if (count_fi_database == 0) {
                                    // //This field is not present in database, let's include it:
                                    // //Shouldn't happen within an update but if it does, it will be treated
                                    // //Multiple parts
                                    // if (json.fields.update[i].settings.parts) {
                                        // var f_value_i;
                                        // for (f_value_i in json.fields.update[i].settings.parts ) {
                                            // perform[perform.length] = "INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "___" + f_value_i + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "' ,  '" + disabled + "' , '" + widget + "','" + settings + "' )";
                                            // //Ti.API.info('Field not presented in the database, creating field_name = '+field_name+"___"+f_value_i);
                                        // }
                                    // }
                                    // //Normal field
                                    // else {
                                        // perform[perform.length] = "INSERT OR REPLACE  INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ",'" + required + "','" + disabled + "','" + widget + "','" + settings + "' )";
                                        // //Ti.API.info('Field not presented in the database, creating field_name = '+field_name);
                                    // }
// 
                                    // var type = "";
// 
                                    // switch(json.fields.update[i].type) {
                                        // case "taxonomy_term_reference":
                                        // case "term_reference":
                                        // case "datestamp":
                                        // case "number_integer":
                                            // (PLATFORM == 'android') ? type = "INTEGER" : type = 'TEXT'
                                            // break;
// 
                                        // case "number_decimal":
                                            // type = "REAL"
                                            // break;
// 
                                        // default:
                                            // type = "TEXT";
                                            // break;
                                    // }
// 
                                    // //Check if it is a valid bundle (automatically updated throught the API):
                                    // var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "' + bundle + '"');
                                    // if (q_bund.isValidRow()) {
                                        // if (json.fields.update[i].settings.parts) {
                                            // var f_value_i;
                                            // for (f_value_i in json.fields.update[i].settings.parts ) {
                                                // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___' + f_value_i + '\' ' + type;
                                                // Ti.API.info("Updated: " + field_name + "___" + f_value_i + " to be used in " + bundle);
                                            // }
                                        // }
                                        // else {
                                            // if (json.fields.update[i].type == 'image') {
                                                // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___file_id' + '\' ' + type;
                                                // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___status' + '\' ' + type;
                                            // }
                                            // if (json.fields.update[i].type == 'file') {
                                                // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___fid' + '\' ' + type;
                                                // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___filename' + '\' ' + type;
                                            // }
                                            // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '\' ' + type;
                                            // Ti.API.info("Updated: " + field_name + " to be used in " + bundle);
                                        // }
                                    // }
                                    // else {
                                        // Ti.API.info('=====================>>>>> Avoiding fields creation for table: ' + bundle);
                                    // }
                                    // q_bund.close();
                                // }
                                // else {
                                    // //Real update
                                    // //This field is present in database, let's update it:
// 
                                    // //Multiple parts need to be inserted
                                    // if (fi_array.fi_obj.length > 1) {
                                        // //Filter fields from database
                                        // var missing_update = new Array();
                                        // var match_base = new Array();
                                        // var f_base;
                                        // for (f_base in json.fields.update[i].settings.parts) {
                                            // missing_update[f_base] = true;
                                        // }
// 
                                        // for (f_base in fi_array.fi_obj) {
                                            // var i_obj = {
                                                // match : false,
                                                // id : fi_array.fi_obj[f_base]['id'],
                                                // field_name : fi_array.fi_obj[f_base]['field_name']
                                            // };
                                            // match_base[fi_array.fi_obj[f_base]['field_name']] = i_obj;
// 
                                            // Ti.API.info('***************** INSERTED ' + fi_array.fi_obj[f_base]['field_name']);
                                        // }
// 
                                        // //Deletions
                                        // //Fields in database and in JSON update
                                        // var parts = json.fields.update[i].settings.parts;
// 
                                        // for (f_base in fi_array.fi_obj) {
                                            // var indField;
                                            // for (indField in parts) {
                                                // if (field_name + "___" + indField == fi_array.fi_obj[f_base]['field_name']) {
                                                    // Ti.API.info('IS in database : ' + fi_array.fi_obj[f_base]['field_name']);
                                                    // //Turn update flag off
                                                    // match_base[fi_array.fi_obj[f_base]['field_name']].match = true;
                                                // }
                                            // }
                                        // }
                                        // //Delete missing fields at the database
                                        // var i_x;
                                        // for (i_x in match_base) {
                                            // if (match_base[i_x].match === false) {
                                                // perform[perform.length] = "DELETE FROM fields WHERE id=" + match_base[i_x].id;
                                            // }
                                        // }
// 
                                        // //UPDATES:
                                        // //First off, update the fields:
                                        // var indField;
                                        // for (indField in json.fields.update[i].settings.parts) {
                                            // var f_base;
                                            // for (f_base in fi_array.fi_obj) {
                                                // if (field_name + "___" + indField == fi_array.fi_obj[f_base]['field_name']) {
                                                    // Ti.API.info(field_name + '___' + indField);
                                                    // Ti.API.info(fi_array.fi_obj[f_base]['field_name']);
// 
                                                    // //Run update script
                                                    // Ti.API.info('Updated field_name = ' + field_name + "___" + indField);
// 
                                                    // perform[perform.length] = "UPDATE fields SET type='" + type + "', label='" + label + "', description='" + description + "', bundle='" + bundle + "', region='" + region + "', weight=" + weight + ", required='" + required + "', disabled='" + disabled + "', widget='" + widget + "', settings='" + settings + "'  WHERE id=" + fi_array.fi_obj[f_base]['id'];
// 
                                                    // //Turn update flag off
                                                    // missing_update[indField] = false;
                                                // }
                                            // }
                                        // }
// 
                                        // //Now we have the new properties, let's add them
                                        // var index;
                                        // for (index in missing_update) {
                                            // if (missing_update[index] === true) {
                                                // perform[perform.length] = "INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "___" + index + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "' ,  '" + disabled + "' , '" + widget + "','" + settings + "' )";
                                                // Ti.API.info('Created a new field because of a new part, field_name = ' + field_name + "___" + index);
// 
                                                // var type = "";
// 
                                                // switch(json.fields.update[i].type) {
                                                    // case "taxonomy_term_reference":
                                                    // case "term_reference":
                                                    // case "datestamp":
                                                    // case "number_integer":
                                                        // (PLATFORM == 'android') ? type = "INTEGER" : type = 'TEXT';
                                                        // break;
// 
                                                    // case "number_decimal":
                                                        // type = "REAL"
                                                        // break;
// 
                                                    // default:
                                                        // type = "TEXT";
                                                        // break;
                                                // }
// 
                                                // var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "' + bundle + '"');
                                                // if (q_bund.isValidRow()) {
                                                    // var db_tester = db_installMe.execute('SELECT ' + field_name + '___' + index + ' FROM ' + bundle);
                                                    // if (db_tester.isValidRow()) {
                                                        // Ti.API.info('Field recovered!');
                                                    // }
                                                    // else {
                                                        // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + "___" + index + '\' ' + type;
                                                    // }
                                                    // db_tester.close();
                                                    // Ti.API.info("Updated: " + field_name + "___" + index + " to be used in " + bundle);
                                                // }
                                                // else {
                                                    // Ti.API.info('=====================>>>>> Avoiding fields creation for table: ' + bundle);
                                                // }
                                                // q_bund.close();
                                            // }
                                        // }
                                    // }
                                    // //Single insert
                                    // else
                                    // if (fi_array.fi_obj.length == 1) {
                                        // //Run update script
                                        // Ti.API.info('Single updated for single part, fid = ' + fid);
                                        // perform[perform.length] = "UPDATE fields SET type='" + type + "', label='" + label + "', description='" + description + "', bundle='" + bundle + "', region='" + region + "', weight=" + weight + ", required='" + required + "', disabled='" + disabled + "', widget='" + widget + "', settings='" + settings + "'  WHERE id=" + fi_array.fi_obj[0]['id'];
                                    // }
                                    // //Length == 0 has count_fi_database == 0, so it should not end here.
                                    // else {
                                        // Ti.API.info('#################################### @Developer, take a look, fields update should not end here ####################################');
                                    // }
                                // }
                            // }
                        // }
                        // //Single object
                        // else {
                            // if (progress != null) {
                                // //Increment Progress Bar
                                // progress.set();
                            // }
// 
                            // //Encode:
                            // var var_widget = JSON.stringify(json.fields.update.widget);
                            // var var_settings = JSON.stringify(json.fields.update.settings);
// 
                            // var fid = json.fields.update.fid;
// 
                            // if (json.fields.update.type != null)
                                // var type = json.fields.update.type.replace(/'/gi, '"');
                            // else
                                // var type = null;
// 
                            // if (json.fields.update.field_name != null)
                                // var field_name = json.fields.update.field_name.replace(/'/gi, '"');
                            // else
                                // var field_name = null;
// 
                            // if (json.fields.update.label != null)
                                // var label = json.fields.update.label.replace(/'/gi, '"');
                            // else
                                // var label = null;
// 
                            // if (json.fields.update.description != null)
                                // var description = json.fields.update.description.replace(/'/gi, '"');
                            // else
                                // var description = null;
// 
                            // if (json.fields.update.bundle != null)
                                // var bundle = json.fields.update.bundle.replace(/'/gi, '"');
                            // else
                                // var bundle = null;
// 
                            // if (json.fields.update.weight != null)
                                // var weight = json.fields.update.weight;
                            // else
                                // var weight = null;
// 
                            // if (json.fields.update.required != null)
                                // var required = json.fields.update.required;
                            // else
                                // var required = null;
// 
                            // if (json.fields.update.disabled != null)
                                // var disabled = json.fields.update.disabled;
                            // else
                                // var disabled = null;
// 
                            // if (var_widget != null)
                                // var widget = var_widget.replace(/'/gi, '"');
                            // else
                                // var widget = null;
// 
                            // if (var_settings != null) {
                                // var settings = var_settings.replace(/'/gi, '"');
                                // var s = JSON.parse(settings);
                                // var region = s.region;
                            // }
                            // else {
                                // var settings = null;
                                // var region = null;
                            // }
// 
                            // var tables = db_installMe.execute('SELECT * FROM fields WHERE fid = ' + fid);
// 
                            // var fi_array = {
                                // //We might have various (of the same) fid for the same row
                                // fid : tables.fieldByName('fid'),
                                // //Settings never changes when there is duplicity
                                // settings : tables.fieldByName('settings'),
                                // //Variables
                                // fi_obj : new Array()
                            // }
// 
                            // var count_fi_database = 0;
// 
                            // while (tables.isValidRow()) {
                                // //ID is primary key
                                // fi_array.fi_obj[count_fi_database] = new Array();
                                // fi_array.fi_obj[count_fi_database]['id'] = tables.fieldByName('id');
                                // fi_array.fi_obj[count_fi_database]['field_name'] = tables.fieldByName('field_name');
                                // count_fi_database++;
                                // tables.next();
                            // }
// 
                            // if (count_fi_database == 0) {
                                // //This field is not present in database, let's include it:
                                // //Shouldn't happen within an update but if it does, it will be treated
                                // //Multiple parts
                                // if (json.fields.update.settings.parts) {
                                    // var f_value_i;
                                    // for (f_value_i in json.fields.update.settings.parts ) {
                                        // perform[perform.length] = "INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "___" + f_value_i + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "' ,  '" + disabled + "' , '" + widget + "','" + settings + "' )";
                                        // Ti.API.info('Field not presented in the database, creating field_name = ' + field_name + "___" + f_value_i);
                                    // }
                                // }
                                // //Normal field
                                // else {
                                    // perform[perform.length] = "INSERT OR REPLACE  INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ",'" + required + "','" + disabled + "','" + widget + "','" + settings + "' )";
                                    // Ti.API.info('Field not presented in the database, creating field_name = ' + field_name);
                                // }
// 
                                // var type = "";
// 
                                // switch(json.fields.update.type) {
                                    // case "taxonomy_term_reference":
                                    // case "term_reference":
                                    // case "datestamp":
                                    // case "number_integer":
                                        // (PLATFORM == 'android') ? type = "INTEGER" : type = 'TEXT'
                                        // break;
// 
                                    // case "number_decimal":
                                        // type = "REAL"
                                        // break;
// 
                                    // default:
                                        // type = "TEXT";
                                        // break;
                                // }
// 
                                // //Check if it is a valid bundle (automatically updated throught the API):
                                // var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "' + bundle + '"');
                                // if (q_bund.isValidRow()) {
                                    // if (json.fields.update.settings.parts) {
                                        // var f_value_i;
                                        // for (f_value_i in json.fields.update.settings.parts ) {
                                            // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___' + f_value_i + '\' ' + type;
                                            // Ti.API.info("Updated: " + field_name + "___" + f_value_i + " to be used in " + bundle);
                                        // }
                                    // }
                                    // else {
                                        // if (json.fields.update[i].type == 'image') {
                                            // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___file_id' + '\' ' + type;
                                            // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___status' + '\' ' + type;
                                        // }
                                        // if (json.fields.update[i].type == 'file') {
                                            // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___fid' + '\' ' + type;
                                            // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___filename' + '\' ' + type;
                                        // }
// 
                                        // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '\' ' + type;
                                        // Ti.API.info("Updated: " + field_name + " to be used in " + bundle);
                                    // }
                                // }
                                // else {
                                    // Ti.API.info('=====================>>>>> Avoiding fields creation for table: ' + bundle);
                                // }
                                // q_bund.close();
                            // }
                            // else {
                                // //Real update
                                // //This field is present in database, let's update it:
// 
                                // //Multiple parts need to be inserted
                                // if (fi_array.fi_obj.length > 1) {
                                    // //Filter fields from database
                                    // var missing_update = new Array();
                                    // var match_base = new Array();
                                    // var f_base;
                                    // for (f_base in json.fields.update.settings.parts) {
                                        // missing_update[f_base] = true;
                                    // }
// 
                                    // for (f_base in fi_array.fi_obj) {
                                        // var i_obj = {
                                            // match : false,
                                            // id : fi_array.fi_obj[f_base]['id'],
                                            // field_name : fi_array.fi_obj[f_base]['field_name']
                                        // };
                                        // match_base[fi_array.fi_obj[f_base]['field_name']] = i_obj;
// 
                                        // Ti.API.info('***************** INSERTED ' + fi_array.fi_obj[f_base]['field_name']);
                                    // }
// 
                                    // //Deletions
                                    // //Fields in database and in JSON update
                                    // var parts = json.fields.update.settings.parts;
// 
                                    // for (f_base in fi_array.fi_obj) {
                                        // var indField;
                                        // for (indField in parts) {
                                            // if (field_name + "___" + indField == fi_array.fi_obj[f_base]['field_name']) {
                                                // Ti.API.info('IS in database : ' + fi_array.fi_obj[f_base]['field_name']);
                                                // //Turn update flag off
                                                // match_base[fi_array.fi_obj[f_base]['field_name']].match = true;
                                            // }
                                        // }
                                    // }
                                    // //Delete missing fields at the database
                                    // var i_x;
                                    // for (i_x in match_base) {
                                        // if (match_base[i_x].match === false) {
                                            // perform[perform.length] = "DELETE FROM fields WHERE id=" + match_base[i_x].id;
                                        // }
                                    // }
// 
                                    // //UPDATES:
                                    // //First off, update the fields:
                                    // var indField;
                                    // for (indField in json.fields.update.settings.parts) {
                                        // var f_base;
                                        // for (f_base in fi_array.fi_obj) {
                                            // if (field_name + "___" + indField == fi_array.fi_obj[f_base]['field_name']) {
                                                // Ti.API.info(field_name + '___' + indField);
                                                // Ti.API.info(fi_array.fi_obj[f_base]['field_name']);
// 
                                                // //Run update script
                                                // Ti.API.info('Updated field_name = ' + field_name + "___" + indField);
// 
                                                // perform[perform.length] = "UPDATE fields SET type='" + type + "', label='" + label + "', description='" + description + "', bundle='" + bundle + "', region='" + region + "', weight=" + weight + ", required='" + required + "', disabled='" + disabled + "', widget='" + widget + "', settings='" + settings + "'  WHERE id=" + fi_array.fi_obj[f_base]['id'];
// 
                                                // //Turn update flag off
                                                // missing_update[indField] = false;
                                            // }
                                        // }
                                    // }
// 
                                    // //Now we have the new properties, let's add them
                                    // var index;
                                    // for (index in missing_update) {
                                        // if (missing_update[index] === true) {
                                            // perform[perform.length] = "INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "___" + index + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "' ,  '" + disabled + "' , '" + widget + "','" + settings + "' )";
                                            // Ti.API.info('Created a new field because of a new part, field_name = ' + field_name + "___" + index);
// 
                                            // var type = "";
// 
                                            // switch(json.fields.update.type) {
                                                // case "taxonomy_term_reference":
                                                // case "term_reference":
                                                // case "datestamp":
                                                // case "number_integer":
                                                    // (PLATFORM == 'android') ? type = "INTEGER" : type = 'TEXT'
                                                    // break;
// 
                                                // case "number_decimal":
                                                    // type = "REAL"
                                                    // break;
// 
                                                // default:
                                                    // type = "TEXT";
                                                    // break;
                                            // }
// 
                                            // var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "' + bundle + '"');
                                            // if (q_bund.isValidRow()) {
                                                // var db_tester = db_installMe.execute('SELECT ' + field_name + '___' + index + ' FROM ' + bundle);
                                                // if (db_tester.isValidRow()) {
                                                    // Ti.API.info('Field recovered!');
                                                // }
                                                // else {
                                                    // perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + "___" + index + '\' ' + type;
                                                // }
                                                // db_tester.close();
                                                // Ti.API.info("Updated: " + field_name + "___" + index + " to be used in " + bundle);
                                            // }
                                            // else {
                                                // Ti.API.info('=====================>>>>> Avoiding fields creation for table: ' + bundle);
                                            // }
                                            // q_bund.close();
                                        // }
                                    // }
                                // }
                                // //Single insert
                                // else
                                // if (fi_array.fi_obj.length == 1) {
                                    // //Run update script
                                    // Ti.API.info('Single updated for single part, fid = ' + fid);
                                    // perform[perform.length] = "UPDATE fields SET type='" + type + "', label='" + label + "', description='" + description + "', bundle='" + bundle + "', region='" + region + "', weight=" + weight + ", required='" + required + "', disabled='" + disabled + "', widget='" + widget + "', settings='" + settings + "'  WHERE id=" + fi_array.fi_obj[0]['id'];
                                // }
                                // //Length == 0 has count_fi_database == 0, so it should not end here.
                                // else {
                                    // Ti.API.info('#################################### @Developer, take a look, fields update should not end here ####################################');
                                // }
                            // }
                        // }
                    // }
                    // /*
                     // * Delete fields from fields table
                     // */
// 
                    // if (json.fields["delete"]) {
                        // if (json.fields["delete"].length) {
                            // var i;
                            // for ( i = 0; i < json.fields["delete"].length; i++) {
                                // Ti.API.info('FID: ' + json.fields["delete"][i].fid + ' was deleted');
                                // //Deletes rows from terms
                                // perform[perform.length] = 'DELETE FROM fields WHERE "fid"=' + json.fields["delete"][i].fid;
                            // }
                        // }
                        // else {
                            // Ti.API.info('FID: ' + json.fields["delete"].fid + ' was deleted');
                            // perform[perform.length] = 'DELETE FROM fields WHERE "fid"=' + json.fields["delete"].fid;
                        // }
                    // }
// 
                    // if (perform) {
                        // var iPerform = 0;
                        // var iStart = Math.round(new Date().getTime() / 1000);
                        // Ti.API.info("Fields started at : " + iStart);
// 
                        // db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
                        // while (iPerform <= perform.length - 1) {
                            // //Ti.API.info("Field -------  "+perform[iPerform]);
                            // db_installMe.execute(perform[iPerform]);
                            // iPerform++;
                        // }
                        // db_installMe.execute("COMMIT TRANSACTION");
// 
                        // var iEnd = Math.round(new Date().getTime() / 1000);
                        // Ti.API.info("Fields finishes at : " + iEnd);
// 
                        // var iResult = iEnd - iStart;
                        // Ti.API.info('Fields seconds: ' + iResult);
                        // Ti.API.info("Success for fields, it was inserted / updated!");
                    // }
                // }






// function bottomBack(actualWindow, text, method, unset) {
    // var backView = Titanium.UI.createView({
        // top : '95%',
        // backgroundColor : '#111',
        // height : '6%',
        // width : '100%',
        // opacity : 0.99,
        // borderRadius : 5
    // });
// 
    // if (text) {
        // var label_bottom = Titanium.UI.createLabel({
            // color : '#FFFFFF',
            // text : text,
            // textAlign : 'center',
            // height : 'auto'
        // });
    // }
    // else {
        // var label_bottom = Titanium.UI.createLabel({
            // color : '#FFFFFF',
            // text : 'Back',
            // textAlign : 'center',
            // height : 'auto'
        // });
    // }
    // backView.add(label_bottom);
// 
    // backView.addEventListener('click', function() {
        // if (unset === true) {
// 
            // //Omadi.data.setUpdating(false)
        // }
        // actualWindow.close();
    // });
    // actualWindow.add(backView);
// };

// function bottomBack_release(actualWindow, text, method) {
    // var backView = Titanium.UI.createView({
        // top : '95%',
        // backgroundColor : '#111',
        // height : '6%',
        // width : '100%',
        // opacity : 0.99,
        // borderRadius : 5
    // });
// 
    // if (text) {
        // var label_bottom = Titanium.UI.createLabel({
            // color : '#FFFFFF',
            // text : text,
            // textAlign : 'center',
            // height : 'auto'
        // });
    // }
    // else {
        // var label_bottom = Titanium.UI.createLabel({
            // color : '#FFFFFF',
            // text : 'Back',
            // textAlign : 'center',
            // height : 'auto'
        // });
    // }
    // backView.add(label_bottom);
// 
    // backView.addEventListener('click', function() {
        // Omadi.data.setUpdating(false)
        // actualWindow.close();
    // });
    // actualWindow.add(backView);
// };




// // function process_object(json, obj, f_marks, progress, type_request, db_process_object) {
    // // var deploy = db_process_object.execute('SELECT field_name, type FROM fields WHERE bundle = "' + obj + '"');
    // // var col_titles = [];
    // // var col_type = [];
    // // var ind_column = 0;
    // // while (deploy.isValidRow()) {
        // // col_titles[ind_column] = deploy.fieldByName('field_name');
        // // col_type[ind_column] = deploy.fieldByName('type');
        // // if (deploy.fieldByName('type') == 'file') {
            // // ind_column++;
            // // col_titles[ind_column] = deploy.fieldByName('field_name') + '___fid';
            // // col_type[ind_column] = deploy.fieldByName('type');
            // // ind_column++;
            // // col_titles[ind_column] = deploy.fieldByName('field_name') + '___filename';
            // // col_type[ind_column] = deploy.fieldByName('type');
        // // }
        // // ind_column++;
        // // deploy.next();
    // // }
    // // deploy.close();
// // 
    // // var process_obj = [];
// // 
    // // //Insert
    // // if (json[obj].insert) {
// // 
        // // if (type_request == 'POST') {
            // // if (json[obj].insert.length) {
                // // Titanium.App.Properties.setString("new_node_id", json[obj].insert[0].nid);
            // // }
            // // else {
                // // Titanium.App.Properties.setString("new_node_id", json[obj].insert.nid);
            // // }
        // // }
        // // //Multiple objects
        // // if (json[obj].insert.length) {
            // // var i;
            // // for ( i = 0; i < json[obj].insert.length; i++) {
                // // if (progress != null) {
                    // // //Increments Progress Bar
                    // // progress.set();
                // // }
                // // // Original query
                // // var aux_column = ind_column;
                // // var query = "";
// // 
                // // //Insert into node table
                // // if ((json[obj].insert[i].title === null) || (json[obj].insert[i].title == 'undefined') || (json[obj].insert[i].title === false))
                    // // json[obj].insert[i].title = "No Title";
// // 
                // // //'update' is a flag to decide whether the node needs to be synced to the server or not
                // // var no_data = '';
                // // if (!(json[obj].insert[i].no_data_fields instanceof Array)) {
                    // // no_data = JSON.stringify(json[obj].insert[i].no_data_fields);
                // // }
// // 
                // // process_obj[process_obj.length] = getNodeTableInsertStatement({
                    // // nid : json[obj].insert[i].nid,
                    // // perm_edit : json[obj].insert[i].perm_edit,
                    // // perm_delete : json[obj].insert[i].perm_delete,
                    // // created : json[obj].insert[i].created,
                    // // changed : json[obj].insert[i].changed,
                    // // title : json[obj].insert[i].title.replace(/"/gi, "'"),
                    // // author_uid : json[obj].insert[i].author_uid,
                    // // flag_is_updated : 0,
                    // // table_name : obj,
                    // // form_part : json[obj].insert[i].form_part,
                    // // changed_uid : json[obj].insert[i].changed_uid,
                    // // no_data_fields : no_data,
                    // // viewed : json[obj].insert[i].viewed
                // // });
// // 
                // // //'INSERT OR REPLACE INTO node (nid , perm_edit, perm_delete, created , changed , title , author_uid , flag_is_updated, table_name, form_part, changed_uid, no_data_fields, viewed ) VALUES ( ' +
                // // //json[obj].insert[i].nid + ', '+ json[obj].insert[i].perm_edit + ', '+ json[obj].insert[i].perm_delete + ', ' +
                // // //json[obj].insert[i].created + ' , ' + json[obj].insert[i].changed + ', "' + json[obj].insert[i].title.replace(/"/gi, "'") + '" , ' +
                // // //json[obj].insert[i].author_uid + ' , 0 , "' + obj + '", ' + json[obj].insert[i].form_part + ',' + json[obj].insert[i].changed_uid + ',\'' + no_data + '\', \'' + json[obj].insert[i].viewed + '\') ';
// // 
                // // if (aux_column > 0) {
                    // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (\'nid\', ';
                // // }
                // // //This would happen only if table has no columns, shouldn't happen
                // // else {
                    // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (nid) VALUES (' + json[obj].insert[i].nid + ')';
                // // }
// // 
                // // while (aux_column > 0) {
                    // // if (aux_column == 1) {
                        // // query += ' \'' + col_titles[aux_column - 1] + '\') VALUES (' + json[obj].insert[i].nid + ', ';
                    // // }
                    // // else {
                        // // query += ' \'' + col_titles[aux_column - 1] + '\', ';
                    // // }
                    // // aux_column--;
                // // }
// // 
                // // aux_column = ind_column;
                // // var mark = '';
                // // while (aux_column > 0) {
                    // // var parse_api = col_titles[aux_column - 1];
                    // // mark = '"';
                    // // var i_index;
                    // // for (i_index in f_marks) {
                        // // if (i_index == parse_api) {
                            // // var j_index;
                            // // for (j_index in f_marks[i_index]) {
                                // // if (j_index == obj) {
                                    // // mark = '';
                                // // }
                            // // }
                        // // }
                    // // }
                    // // if (aux_column == 1) {
                        // // if ((json[obj].insert[i][parse_api] == null ) || (json[obj].insert[i][parse_api] == "undefined" )) {
                            // // query += ' null )';
                        // // }
                        // // else {
                            // // if (mark == '') {
                                // // var num_to_insert = json[obj].insert[i][parse_api];
// // 
                                // // if (isNumber(num_to_insert)) {
                                    // // query += ' ' + num_to_insert + ' )';
                                // // }
                                // // else
                                // // if ( num_to_insert instanceof Array) {
                                    // // content_s = treatArray(num_to_insert, 1);
// // 
                                    // // // table structure:
                                    // // // incremental, node_id, field_name, value
                                    // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                    // // //Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');
// // 
                                    // // // Code must to be a number since this database field accepts only integers numbers
                                    // // // Token to indentify array of numbers is 7411176117105122
                                    // // query += ' 7411317618171051229 )';
                                // // }
                                // // else {
                                    // // //Ti.API.info('Null ==> The value '+num_to_insert+' is a number? '+isNumber(num_to_insert) );
                                    // // query += ' null )';
                                // // }
                            // // }
                            // // else {
                                // // if (json[obj].insert[i][parse_api] instanceof Array) {
                                    // // if (col_type[aux_column - 1] == 'rules_field') {
                                        // // query += ' "' + JSON.stringify(json[obj].insert[i][parse_api]).replace(/"/gi, "\"\"") + '" )';
                                    // // }
                                    // // else {
                                        // // content_s = treatArray(json[obj].insert[i][parse_api], 2);
// // 
                                        // // // table structure:
                                        // // // incremental, node_id, field_name, value
                                        // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                        // // //Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');
// // 
                                        // // // Code must to be a number since this database field accepts only integers numbers
                                        // // // Token to indentify array of numbers is 7411176117105122
                                        // // query += ' ' + mark + '7411317618171051229' + mark + ' )';
// // 
                                    // // }
                                // // }
                                // // else {
                                    // // query += ' ' + mark + '' + json[obj].insert[i][parse_api].toString().replace(/"/gi, "'") + '' + mark + ' )';
                                // // }
                            // // }
                        // // }
                    // // }
                    // // else {
                        // // if ((json[obj].insert[i][parse_api] == null ) || (json[obj].insert[i][parse_api] == "undefined" )) {
                            // // query += ' null ,';
                        // // }
                        // // else {
                            // // if (mark == '') {
                                // // var num_to_insert = json[obj].insert[i][parse_api];
// // 
                                // // if (isNumber(num_to_insert)) {
                                    // // query += ' ' + num_to_insert + ' ,';
                                // // }
                                // // else
                                // // if ( num_to_insert instanceof Array) {
                                    // // //If we have only one object in array we don't need another table to help us out
                                    // // content_s = treatArray(num_to_insert, 3);
// // 
                                    // // // table structure:
                                    // // // incremental, node_id, field_name, value
                                    // // process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                    // // //Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');
// // 
                                    // // // Code must to be a number since this database field accepts only integers numbers
                                    // // // Token to indentify array of numbers is 7411176117105122
                                    // // query += ' 7411317618171051229 ,';
                                // // }
                                // // else {
                                    // // query += ' null ,';
                                // // }
                            // // }
                            // // else {
                                // // if (json[obj].insert[i][parse_api] instanceof Array) {
                                    // // if (col_type[aux_column - 1] == 'rules_field') {
                                        // // query += ' "' + JSON.stringify(json[obj].insert[i][parse_api]).replace(/"/gi, "\"\"") + '" ,';
                                    // // }
                                    // // else {
                                        // // content_s = treatArray(json[obj].insert[i][parse_api], 4);
// // 
                                        // // // table structure:
                                        // // // incremental, node_id, field_name, value
                                        // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                        // // //Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');
// // 
                                        // // // Code must to be a number since this database field accepts only integers numbers
                                        // // // Token to indentify array of numbers is 7411176117105122
                                        // // query += ' ' + mark + '7411317618171051229' + mark + ' ,';
                                    // // }
                                // // }
                                // // else {
                                    // // query += ' ' + mark + '' + json[obj].insert[i][parse_api].toString().replace(/"/gi, "'") + '' + mark + ' ,';
                                // // }
                            // // }
                        // // }
                    // // }
                    // // aux_column--;
                // // }
                // // //Inserts into object table
                // // process_obj[process_obj.length] = query;
                // // if (type_request == 'POST') {
                    // // process_obj[process_obj.length] = 'DELETE FROM ' + obj + ' WHERE nid=' + json[obj].insert[i].__negative_nid;
                    // // process_obj[process_obj.length] = 'DELETE FROM node WHERE nid=' + json[obj].insert[i].__negative_nid;
                // // }
// // 
            // // }
// // 
        // // }
        // // //Only one object
        // // else {
            // // if (progress != null) {
                // // //Increments Progress Bar
                // // progress.set();
            // // }
            // // // Original query
            // // var aux_column = ind_column;
            // // var query = "";
// // 
            // // //Insert into node table
            // // if ((json[obj].insert.title === null) || (json[obj].insert.title == 'undefined') || (json[obj].insert.title === false))
                // // json[obj].insert.title = "No Title";
// // 
            // // //'update' is a flag to decide whether the node needs to be synced to the server or not
            // // var no_data = '';
            // // if (!(json[obj].insert.no_data_fields instanceof Array)) {
                // // no_data = JSON.stringify(json[obj].insert.no_data_fields);
            // // }
// // 
            // // process_obj[process_obj.length] = getNodeTableInsertStatement({
                // // nid : json[obj].insert.nid,
                // // perm_edit : json[obj].insert.perm_edit,
                // // perm_delete : json[obj].insert.perm_delete,
                // // created : json[obj].insert.created,
                // // changed : json[obj].insert.changed,
                // // title : json[obj].insert.title,
                // // author_uid : json[obj].insert.author_uid,
                // // flag_is_updated : 0,
                // // table_name : obj,
                // // form_part : json[obj].insert.form_part,
                // // changed_uid : json[obj].insert.changed_uid,
                // // no_data_fields : no_data,
                // // viewed : json[obj].insert.viewed
            // // });
// // 
            // // //process_obj[process_obj.length] = 'INSERT OR REPLACE INTO node (nid , perm_edit, perm_delete, created , changed , title , author_uid , flag_is_updated, table_name, form_part, changed_uid, no_data_fields, viewed ) VALUES ( ' +
            // // //json[obj].insert.nid + ', ' + json[obj].insert.perm_edit + ', '+ json[obj].insert.perm_delete + ', '+ json[obj].insert.created + ' , ' +
            // // //json[obj].insert.changed + ', "' + json[obj].insert.title.replace(/"/gi, "'") + '" , ' +
            // // //json[obj].insert.author_uid + ' , 0 , "' + obj + '", ' + json[obj].insert.form_part + ',' + json[obj].insert.changed_uid + ',\'' +
            // // //no_data + '\', \'' + json[obj].insert.viewed + '\') ';
// // 
            // // if (aux_column > 0) {
                // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (\'nid\', ';
            // // }
            // // //This would happen only if table has no columns, shouldn't happen
            // // else {
                // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (nid) VALUES (' + json[obj].insert.nid + ')';
            // // }
// // 
            // // while (aux_column > 0) {
                // // if (aux_column == 1) {
                    // // query += ' \'' + col_titles[aux_column - 1] + '\') VALUES (' + json[obj].insert.nid + ', ';
                // // }
                // // else {
                    // // query += ' \'' + col_titles[aux_column - 1] + '\', ';
                // // }
                // // aux_column--;
            // // }
// // 
            // // aux_column = ind_column;
            // // var mark = '';
            // // while (aux_column > 0) {
                // // var parse_api = col_titles[aux_column - 1];
                // // mark = '"';
                // // var i_index;
                // // for (i_index in f_marks) {
                    // // if (i_index == parse_api) {
                        // // var j_index;
                        // // for (j_index in f_marks[i_index]) {
                            // // if (j_index == obj) {
                                // // mark = '';
                            // // }
                        // // }
                    // // }
                // // }
                // // if (aux_column == 1) {
                    // // if ((json[obj].insert[parse_api] == null ) || (json[obj].insert[parse_api] == "undefined" )) {
                        // // query += ' null )';
                    // // }
                    // // else {
                        // // if (mark == '') {
                            // // var num_to_insert = json[obj].insert[parse_api];
// // 
                            // // if (isNumber(num_to_insert)) {
                                // // query += ' ' + num_to_insert + ' )';
                            // // }
                            // // else
                            // // if ( num_to_insert instanceof Array) {
                                // // content_s = treatArray(num_to_insert, 1);
// // 
                                // // // table structure:
                                // // // incremental, node_id, field_name, value
                                // // process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                // // //Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert.nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');
// // 
                                // // // Code must to be a number since this database field accepts only integers numbers
                                // // // Token to indentify array of numbers is 7411176117105122
                                // // query += ' 7411317618171051229 )';
                            // // }
                            // // else {
                                // // //Ti.API.info('Null ==> The value '+num_to_insert+' is a number? '+isNumber(num_to_insert) );
                                // // query += ' null )';
                            // // }
                        // // }
                        // // else {
                            // // if (json[obj].insert[parse_api] instanceof Array) {
                                // // if (col_type[aux_column - 1] == 'rules_field') {
                                    // // query += ' "' + JSON.stringify(json[obj].insert[parse_api]).replace(/"/gi, "\"\"") + '" )';
                                // // }
                                // // else {
                                    // // content_s = treatArray(json[obj].insert[parse_api], 2);
// // 
                                    // // // table structure:
                                    // // // incremental, node_id, field_name, value
                                    // // process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                    // // // Code must to be a number since this database field accepts only integers numbers
                                    // // // Token to indentify array of numbers is 7411176117105122
                                    // // query += ' ' + mark + '7411317618171051229' + mark + ' )';
                                // // }
                            // // }
                            // // else {
                                // // query += ' ' + mark + '' + json[obj].insert[parse_api].toString().replace(/"/gi, "'") + '' + mark + ' )';
                            // // }
                        // // }
                    // // }
                // // }
                // // else {
                    // // if ((json[obj].insert[parse_api] == null ) || (json[obj].insert[parse_api] == "undefined" )) {
                        // // query += ' null ,';
                    // // }
                    // // else {
                        // // if (mark == '') {
                            // // var num_to_insert = json[obj].insert[parse_api];
// // 
                            // // if (isNumber(num_to_insert)) {
                                // // query += ' ' + num_to_insert + ' ,';
                            // // }
                            // // else
                            // // if ( num_to_insert instanceof Array) {
                                // // content_s = treatArray(num_to_insert, 3);
// // 
                                // // // table structure:
                                // // // incremental, node_id, field_name, value
                                // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                // // //Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert.nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');
// // 
                                // // // Code must to be a number since this database field accepts only integers numbers
                                // // // Token to indentify array of numbers is 7411176117105122
                                // // query += ' 7411317618171051229 ,';
                            // // }
                            // // else {
                                // // query += ' null ,';
                            // // }
                        // // }
                        // // else {
                            // // if (json[obj].insert[parse_api] instanceof Array) {
                                // // if (col_type[aux_column - 1] == 'rules_field') {
                                    // // query += ' "' + JSON.stringify(json[obj].insert[parse_api]).replace(/"/gi, "\"\"") + '" ,';
                                // // }
                                // // else {
// // 
                                    // // content_s = treatArray(json[obj].insert[parse_api], 4);
// // 
                                    // // // table structure:
                                    // // // incremental, node_id, field_name, value
                                    // // process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
                                    // // //Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert.nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');
// // 
                                    // // // Code must to be a number since this database field accepts only integers numbers
                                    // // // Token to indentify array of numbers is 7411176117105122
                                    // // query += ' ' + mark + '7411317618171051229' + mark + ' ,';
                                // // }
                            // // }
                            // // else {
                                // // query += ' ' + mark + '' + json[obj].insert[parse_api].toString().replace(/"/gi, "'") + '' + mark + ' ,';
                            // // }
                        // // }
                    // // }
                // // }
                // // aux_column--;
            // // }
            // // //Inserts into object table
            // // process_obj[process_obj.length] = query;
            // // if (type_request == 'POST') {
                // // process_obj[process_obj.length] = 'DELETE FROM ' + obj + ' WHERE nid=' + json[obj].insert.__negative_nid;
                // // process_obj[process_obj.length] = 'DELETE FROM node WHERE nid=' + json[obj].insert.__negative_nid;
            // // }
        // // }
        // // //Ti.API.info("Inserted object [" + obj + "] sucefully!");
    // // }
// // 
    // // //Update Object
    // // //We use 'insert or replace' for updates in order to reuse the logic for inserts
    // // //If an updated field doesn't exists, the app is gonna create it avoiding errors returns
    // // //It will never freezes if a field that needs update isn't found in the database yet
// // 
    // // if (json[obj].update) {
        // // if (json[obj].update.length) {
            // // var i;
            // // for ( i = 0; i < json[obj].update.length; i++) {
                // // if (progress != null) {
                    // // //Increments Progress Bar
                    // // progress.set();
                // // }
                // // // Original query
                // // var aux_column = ind_column;
                // // var query = "";
// // 
                // // //Insert into node table
                // // if ((json[obj].update[i].title === null) || (json[obj].update[i].title == 'undefined') || (json[obj].update[i].title === false))
                    // // json[obj].update[i].title = "No Title";
// // 
                // // var no_data = '';
                // // if (!(json[obj].update[i].no_data_fields instanceof Array)) {
                    // // no_data = JSON.stringify(json[obj].update[i].no_data_fields);
                // // }
                // // //'update' is a flag to decide whether the node needs to be synced to the server or not
// // 
                // // process_obj[process_obj.length] = getNodeTableInsertStatement({
                    // // nid : json[obj].update[i].nid,
                    // // perm_edit : json[obj].update[i].perm_edit,
                    // // perm_delete : json[obj].update[i].perm_delete,
                    // // created : json[obj].update[i].created,
                    // // changed : json[obj].update[i].changed,
                    // // title : json[obj].update[i].title,
                    // // author_uid : json[obj].update[i].author_uid,
                    // // flag_is_updated : 0,
                    // // table_name : obj,
                    // // form_part : json[obj].update[i].form_part,
                    // // changed_uid : json[obj].update[i].changed_uid,
                    // // no_data_fields : no_data,
                    // // viewed : json[obj].update[i].viewed
                // // });
// // 
                // // //process_obj[process_obj.length] = 'INSERT OR REPLACE INTO node (nid , perm_edit, perm_delete, created , changed , title , author_uid ,
                // // //bj].update[i].form_part + ', ' + json[obj].update[i].changed_uid + ',\'' + no_data + '\') ';
// // 
                // // if (aux_column > 0) {
                    // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (\'nid\', ';
                // // }
                // // //This would happen only if table has no columns, shouldn't happen
                // // else {
                    // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (nid) VALUES (' + json[obj].update[i].nid + ')';
                // // }
// // 
                // // while (aux_column > 0) {
                    // // if (aux_column == 1) {
                        // // query += ' \'' + col_titles[aux_column - 1] + '\') VALUES (' + json[obj].update[i].nid + ', ';
                    // // }
                    // // else {
                        // // query += ' \'' + col_titles[aux_column - 1] + '\', ';
                    // // }
                    // // aux_column--;
                // // }
// // 
                // // aux_column = ind_column;
                // // var mark = '';
                // // while (aux_column > 0) {
                    // // var parse_api = col_titles[aux_column - 1];
                    // // mark = '"';
                    // // var i_index;
                    // // for (i_index in f_marks) {
                        // // if (i_index == parse_api) {
                            // // var j_index;
                            // // for (j_index in f_marks[i_index]) {
                                // // if (j_index == obj) {
                                    // // mark = '';
                                // // }
                            // // }
                        // // }
                    // // }
                    // // if (aux_column == 1) {
                        // // if ((json[obj].update[i][parse_api] == null ) || (json[obj].update[i][parse_api] == "undefined" )) {
                            // // query += ' null )';
                        // // }
                        // // else {
                            // // if (mark == '') {
                                // // var num_to_insert = json[obj].update[i][parse_api];
// // 
                                // // if (isNumber(num_to_insert)) {
                                    // // query += ' ' + num_to_insert + ' )';
                                // // }
                                // // else
                                // // if ( num_to_insert instanceof Array) {
                                    // // content_s = treatArray(num_to_insert, 1);
// // 
                                    // // var array_cont = db_process_object.execute('SELECT * FROM array_base WHERE node_id = ' + json[obj].update[i].nid + ' AND field_name=\'' + col_titles[aux_column - 1] + '\'');
                                    // // if ((array_cont.rowCount > 0) || (array_cont.isValidRow())) {
                                        // // // table structure:
                                        // // // incremental, node_id, field_name, value
                                        // // process_obj[process_obj.length] = 'UPDATE array_base SET encoded_array = \'' + content_s + '\' WHERE node_id=' + json[obj].update[i].nid + ' AND field_name=\'' + col_titles[aux_column - 1] + '\' ';
// // 
                                        // // // Code must to be a number since this database field accepts only integers numbers
                                        // // // Token to indentify array of numbers is 7411176117105122
                                        // // query += ' 7411317618171051229 )';
                                    // // }
                                    // // else {
                                        // // // table structure:
                                        // // // incremental, node_id, field_name, value
                                        // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                        // // // Code must to be a number since this database field accepts only integers numbers
                                        // // // Token to indentify array of numbers is 7411176117105122
                                        // // query += ' 7411317618171051229 )';
                                    // // }
// // 
                                    // // array_cont.close();
                                // // }
                                // // else {
                                    // // Ti.API.info('Null ==> The value ' + num_to_insert + ' is a number? ' + isNumber(num_to_insert));
                                    // // query += ' null )';
                                // // }
                            // // }
                            // // else {
                                // // if (json[obj].update[i][parse_api] instanceof Array) {
                                    // // if (col_type[aux_column - 1] == 'rules_field') {
                                        // // query += ' "' + JSON.stringify(json[obj].update[i][parse_api]).replace(/"/gi, "\"\"") + '" )';
                                    // // }
                                    // // else {
                                        // // content_s = treatArray(json[obj].update[i][parse_api], 2);
                                        // // var array_cont = db_process_object.execute('SELECT * FROM array_base WHERE node_id = ' + json[obj].update[i].nid + ' AND field_name="' + col_titles[aux_column - 1] + '"');
                                        // // if ((array_cont.rowCount > 0) || (array_cont.isValidRow())) {
                                            // // // table structure:
                                            // // // incremental, node_id, field_name, value
                                            // // process_obj[process_obj.length] = 'UPDATE array_base SET encoded_array = \'' + content_s + '\' WHERE node_id=' + json[obj].update[i].nid + ' AND field_name=\'' + col_titles[aux_column - 1] + '\' ';
// // 
                                            // // // Code must to be a number since this database field accepts only integers numbers
                                            // // // Token to indentify array of numbers is 7411176117105122
                                            // // query += ' ' + mark + '7411317618171051229' + mark + ' )';
                                        // // }
                                        // // else {
                                            // // // table structure:
                                            // // // incremental, node_id, field_name, value
                                            // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                            // // // Code must to be a number since this database field accepts only integers numbers
                                            // // // Token to indentify array of numbers is 7411176117105122
                                            // // query += ' ' + mark + '7411317618171051229' + mark + ' )';
                                        // // }
                                        // // array_cont.close();
                                    // // }
                                // // }
                                // // else {
                                    // // query += ' ' + mark + '' + json[obj].update[i][parse_api].toString().replace(/"/gi, "'") + '' + mark + ' )';
                                // // }
                            // // }
                        // // }
                    // // }
                    // // else {
                        // // if ((json[obj].update[i][parse_api] == null ) || (json[obj].update[i][parse_api] == "undefined" )) {
                            // // query += ' null ,';
                        // // }
                        // // else {
                            // // if (mark == '') {
                                // // var num_to_insert = json[obj].update[i][parse_api];
// // 
                                // // if (isNumber(num_to_insert)) {
                                    // // query += ' ' + num_to_insert + ' ,';
                                // // }
                                // // else
                                // // if ( num_to_insert instanceof Array) {
                                    // // content_s = treatArray(num_to_insert, 3);
// // 
                                    // // var array_cont = db_process_object.execute('SELECT * FROM array_base WHERE node_id = ' + json[obj].update[i].nid + ' AND field_name="' + col_titles[aux_column - 1] + '"');
                                    // // if ((array_cont.rowCount > 0) || (array_cont.isValidRow())) {
                                        // // // table structure:
                                        // // // incremental, node_id, field_name, value
                                        // // process_obj[process_obj.length] = 'UPDATE array_base SET encoded_array = \'' + content_s + '\' WHERE node_id=' + json[obj].update[i].nid + ' AND field_name=\'' + col_titles[aux_column - 1] + '\' ';
// // 
                                        // // // Code must to be a number since this database field accepts only integers numbers
                                        // // // Token to indentify array of numbers is 7411176117105122
                                        // // query += ' 7411317618171051229 ,';
                                    // // }
                                    // // else {
                                        // // // table structure:
                                        // // // incremental, node_id, field_name, value
                                        // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                        // // // Code must to be a number since this database field accepts only integers numbers
                                        // // // Token to indentify array of numbers is 7411176117105122
                                        // // query += ' 7411317618171051229 ,';
                                    // // }
                                    // // array_cont.close();
                                // // }
                                // // else {
                                    // // query += ' null ,';
                                // // }
                            // // }
                            // // else {
                                // // if (json[obj].update[i][parse_api] instanceof Array) {
                                    // // if (col_type[aux_column - 1] == 'rules_field') {
                                        // // query += ' "' + JSON.stringify(json[obj].update[i][parse_api]).replace(/"/gi, "\"\"") + '" ,';
                                    // // }
                                    // // else {
                                        // // content_s = treatArray(json[obj].update[i][parse_api], 4);
// // 
                                        // // var array_cont = db_process_object.execute('SELECT * FROM array_base WHERE node_id = ' + json[obj].update[i].nid + ' AND field_name="' + col_titles[aux_column - 1] + '"');
                                        // // if ((array_cont.rowCount > 0) || (array_cont.isValidRow())) {
// // 
                                            // // // table structure:
                                            // // // incremental, node_id, field_name, value
                                            // // process_obj[process_obj.length] = 'UPDATE array_base SET encoded_array = \'' + content_s + '\' WHERE node_id=' + json[obj].update[i].nid + ' AND field_name=\'' + col_titles[aux_column - 1] + '\' ';
// // 
                                            // // // Code must to be a number since this database field accepts only integers numbers
                                            // // // Token to indentify array of numbers is 7411176117105122
                                            // // query += ' ' + mark + '7411317618171051229' + mark + ' ,';
                                        // // }
                                        // // else {
                                            // // // table structure:
                                            // // // incremental, node_id, field_name, value
                                            // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                            // // // Code must to be a number since this database field accepts only integers numbers
                                            // // // Token to indentify array of numbers is 7411176117105122
                                            // // query += ' ' + mark + '7411317618171051229' + mark + ' ,';
                                        // // }
                                        // // array_cont.close();
                                    // // }
                                // // }
                                // // else {
                                    // // query += ' ' + mark + '' + json[obj].update[i][parse_api].toString().replace(/"/gi, "'") + '' + mark + ' ,';
                                // // }
                            // // }
                        // // }
                    // // }
                    // // aux_column--;
                // // }
                // // //Inserts into object table
                // // process_obj[process_obj.length] = query;
            // // }
        // // }
        // // //Only one object
        // // else {
            // // if (progress != null) {
                // // //Increments Progress Bar
                // // progress.set();
            // // }
            // // // Original query
            // // var aux_column = ind_column;
            // // var query = "";
            // // //Insert into node table
            // // if ((json[obj].update.title === null) || (json[obj].update.title == 'undefined') || (json[obj].update.title === false))
                // // json[obj].update.title = "No Title";
// // 
            // // var no_data = '';
            // // if (!(json[obj].update.no_data_fields instanceof Array)) {
                // // no_data = JSON.stringify(json[obj].update.no_data_fields);
            // // }
            // // //'update' is a flag to decide whether the node needs to be synced to the server or not
            // // process_obj[process_obj.length] = getNodeTableInsertStatement({
                // // nid : json[obj].update.nid,
                // // perm_edit : json[obj].update.perm_edit,
                // // perm_delete : json[obj].update.perm_delete,
                // // created : json[obj].update.created,
                // // changed : json[obj].update.changed,
                // // title : json[obj].update.title,
                // // author_uid : json[obj].update.author_uid,
                // // flag_is_updated : 0,
                // // table_name : obj,
                // // form_part : json[obj].update.form_part,
                // // changed_uid : json[obj].update.changed_uid,
                // // no_data_fields : no_data,
                // // viewed : json[obj].update.viewed
            // // });
// // 
            // // //process_obj[process_obj.length] = 'INSERT OR REPLACE INTO node (nid , perm_edit, perm_delete, created , changed , title ,
            // // // author_uid , flag_is_updated, table_name, form_part, changed_uid, no_data_fields ) VALUES ( ' +
            // // // json[obj].update.nid + ', ' + json[obj].update.perm_edit + ', '+ json[obj].update.perm_delete + ', '+
            // // // json[obj].update.created + ' , ' + json[obj].update.changed + ', "' + json[obj].update.title.replace(/"/gi, "'") + '" , ' +
            // // // json[obj].update.author_uid + ' , 0 , "' + obj + '", ' + json[obj].update.form_part + ', ' + json[obj].update.changed_uid + ',\'' +
            // // // no_data + '\') ';
// // 
            // // if (aux_column > 0) {
                // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (\'nid\', ';
            // // }
            // // //This would happen only if table has no columns, shouldn't happen
            // // else {
                // // query = 'INSERT OR REPLACE  INTO ' + obj + ' (nid) VALUES (' + json[obj].update.nid + ')';
            // // }
// // 
            // // while (aux_column > 0) {
                // // if (aux_column == 1) {
                    // // query += ' \'' + col_titles[aux_column - 1] + '\') VALUES (' + json[obj].update.nid + ', ';
                // // }
                // // else {
                    // // query += ' \'' + col_titles[aux_column - 1] + '\', ';
                // // }
                // // aux_column--;
            // // }
// // 
            // // aux_column = ind_column;
            // // var mark = '';
            // // while (aux_column > 0) {
                // // var parse_api = col_titles[aux_column - 1];
                // // mark = '"';
                // // var i_index;
                // // for (i_index in f_marks) {
                    // // if (i_index == parse_api) {
                        // // var j_index;
                        // // for (j_index in f_marks[i_index]) {
                            // // if (j_index == obj) {
                                // // mark = '';
                            // // }
                        // // }
                    // // }
                // // }
                // // if (aux_column == 1) {
                    // // if ((json[obj].update[parse_api] == null ) || (json[obj].update[parse_api] == "undefined" )) {
                        // // query += ' null )';
                    // // }
                    // // else {
                        // // if (mark == '') {
                            // // var num_to_insert = json[obj].update[parse_api];
// // 
                            // // if (isNumber(num_to_insert)) {
                                // // query += ' ' + num_to_insert + ' )';
                            // // }
                            // // else
                            // // if ( num_to_insert instanceof Array) {
                                // // content_s = treatArray(num_to_insert, 1);
// // 
                                // // // table structure:
                                // // // incremental, node_id, field_name, value
                                // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                // // // Code must to be a number since this database field accepts only integers numbers
                                // // // Token to indentify array of numbers is 7411176117105122
                                // // query += ' 7411317618171051229 )';
// // 
                            // // }
                            // // else {
                                // // Ti.API.info('Null ==> The value ' + num_to_insert + ' is a number? ' + isNumber(num_to_insert));
                                // // query += ' null )';
                            // // }
                        // // }
                        // // else {
                            // // if (json[obj].update[parse_api] instanceof Array) {
                                // // if (col_type[aux_column - 1] == 'rules_field') {
                                    // // query += ' "' + JSON.stringify(json[obj].update[parse_api]).replace(/"/gi, "\"\"") + '" )';
                                // // }
                                // // else {
                                    // // content_s = treatArray(json[obj].update[parse_api], 2);
// // 
                                    // // // table structure:
                                    // // // incremental, node_id, field_name, value
                                    // // process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                    // // // Code must to be a number since this database field accepts only integers numbers
                                    // // // Token to indentify array of numbers is 7411176117105122
                                    // // query += ' ' + mark + '7411317618171051229' + mark + ' )';
                                // // }
                            // // }
                            // // else {
                                // // query += ' ' + mark + '' + json[obj].update[parse_api].toString().replace(/"/gi, "'") + '' + mark + ' )';
                            // // }
                        // // }
                    // // }
                // // }
                // // else {
                    // // if ((json[obj].update[parse_api] == null ) || (json[obj].update[parse_api] == "undefined" )) {
                        // // query += ' null ,';
                    // // }
                    // // else {
                        // // if (mark == '') {
                            // // var num_to_insert = json[obj].update[parse_api];
// // 
                            // // if (isNumber(num_to_insert)) {
                                // // query += ' ' + num_to_insert + ' ,';
                            // // }
                            // // else
                            // // if ( num_to_insert instanceof Array) {
                                // // content_s = treatArray(num_to_insert, 3);
// // 
                                // // // table structure:
                                // // // incremental, node_id, field_name, value
                                // // process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                // // // Code must to be a number since this database field accepts only integers numbers
                                // // // Token to indentify array of numbers is 7411176117105122
                                // // query += ' 7411317618171051229 ,';
                            // // }
                            // // else {
                                // // query += ' null ,';
                            // // }
                        // // }
                        // // else {
                            // // if (json[obj].update[parse_api] instanceof Array) {
                                // // if (col_type[aux_column - 1] == 'rules_field') {
                                    // // query += ' "' + JSON.stringify(json[obj].update[parse_api]).replace(/"/gi, "\"\"") + '" ,';
                                // // }
                                // // else {
                                    // // content_s = treatArray(json[obj].update[parse_api], 4);
// // 
                                    // // // table structure:
                                    // // // incremental, node_id, field_name, value
                                    // // process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
// // 
                                    // // // Code must to be a number since this database field accepts only integers numbers
                                    // // // Token to indentify array of numbers is 7411176117105122
                                    // // query += ' ' + mark + '7411317618171051229' + mark + ' ,';
                                // // }
                            // // }
                            // // else {
                                // // query += ' ' + mark + '' + json[obj].update[parse_api].toString().replace(/"/gi, "'") + '' + mark + ' ,';
                            // // }
                        // // }
                    // // }
                // // }
                // // aux_column--;
            // // }
            // // //Inserts into object table
            // // process_obj[process_obj.length] = query;
        // // }
        // // //Ti.API.info("Updated object [" + obj + "] sucefully!");
    // // }
// // 
    // // //Delete
    // // if (json[obj]["delete"]) {
        // // if (json[obj]["delete"].length) {
            // // var i;
            // // for ( i = 0; i < json[obj]["delete"].length; i++) {
                // // if (progress != null) {
                    // // //Increments Progress Bar
                    // // progress.set();
                // // }
                // // //Deletes from object's table
                // // process_obj[process_obj.length] = 'DELETE FROM ' + obj + ' WHERE "nid"=' + json[obj]["delete"][i].nid;
                // // //Deletes from node table
                // // process_obj[process_obj.length] = 'DELETE FROM node WHERE "nid"=' + json[obj]["delete"][i].nid;
            // // }
        // // }
        // // else {
            // // if (progress != null) {
                // // //Increments Progress Bar
                // // progress.set();
            // // }
            // // //Deletes from object's table
            // // process_obj[process_obj.length] = 'DELETE FROM ' + obj + ' WHERE "nid"=' + json[obj]["delete"].nid;
// // 
            // // //Deletes from node table
            // // process_obj[process_obj.length] = 'DELETE FROM node WHERE "nid"=' + json[obj]["delete"].nid;
        // // }
        // // //Ti.API.info("Deleted object [" + obj + "] sucefully!");
    // // }
// // 
    // // //Ti.API.info('########## CRITICAL STEP ##########');
// // 
    // // var iObj = 0;
    // // var iStart = Math.round(new Date().getTime() / 1000);
    // // Ti.API.info("Objects started at : " + iStart);
// // 
    // // db_process_object.execute("BEGIN IMMEDIATE TRANSACTION");
    // // while (iObj <= process_obj.length - 1) {
        // // db_process_object.execute(process_obj[iObj]);
        // // iObj++;
    // // }
    // // db_process_object.execute("COMMIT TRANSACTION");
// // 
    // // var iEnd = Math.round(new Date().getTime() / 1000);
    // // Ti.API.info("Object finishes at : " + iEnd);
// // 
    // // var iResult = iEnd - iStart;
    // // Ti.API.info('Object seconds: ' + iResult);
    // // //db_process_object.close();
    // // return;
// // }
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
 // if (json.node_type) {
        // var node_db = [];
        // //Node type inserts
        // if (json.node_type.insert) {
            // //Multiple nodes inserts
            // if (json.node_type.insert.length) {
                // var i;
                // for ( i = 0; i < json.node_type.insert.length; i++) {
                    // var type = json.node_type.insert[i].type;
//                     
                    // if (type != 'user') {
                        // //Increment the progress bar
                        // if (progress != null) {
                            // progress.set();
                        // }
                        // node_db[node_db.length] = "CREATE TABLE " + type + " ('nid' INTEGER PRIMARY KEY NOT NULL UNIQUE )";
// 
//                    
                        // var title_fields = json.node_type.insert[i].data.title_fields;
                        // var title_fields_string = JSON.stringify(title_fields);
//                         
                        // var data = json.node_type.insert[i].data;
                        // var data_string = JSON.stringify(data);
//                         
                         // //Add it to the main screen
                        // var display = json.node_type.insert[i].name.toUpperCase();//n_bund.fieldByName("display_name").toUpperCase();
                        // var description = json.node_type.insert[i].description;//n_bund.fieldByName("description");
                        // var flag_display = true;//n_bund.fieldByName("display_on_menu");
                        // //var id = n_bund.fieldByName("bid");
                        // var display_on_menu = false;
//                         
//                         
                        // var disabled = json.node_type.insert[i].disabled;
                        // var is_disabled = (disabled == 1 ? true : false); //n_bund.fieldByName("disabled");
                        // //var _nd = n_bund.fieldByName("_data");
                        // var show_plus = false;
                        // var app_permissions = {
                            // can_create : false,
                            // can_update : false,
                            // all_permissions : false,
                            // can_view : false
                        // }
//     
                        // //var node_type_json = JSON.parse(_nd);
//     
                        // if (data.no_mobile_display != null && data.no_mobile_display == 1) {
                            // //n_bund.next();
                            // //continue;
                            // is_disabled = true;
                        // }
//                         
                        // var user = Ti.App.Properties.getObject("user", {});
                        // var roles = user.roles;
//                         
                        // if (roles.hasOwnProperty(ROLE_ID_ADMIN)) {
                            // show_plus = true;
                            // app_permissions.can_create = true;
                            // app_permissions.all_permissions = true;
                            // app_permissions.can_update = true;
                            // app_permissions.can_view = true;
//     
                        // }
                        // else {
                            // var _l;
                            // for (_l in data.permissions) {
                                // for (_k in roles) {
                                    // if (_l == _k) {
                                        // var stringifyObj = JSON.stringify(data.permissions[_l]);
                                        // if (data.permissions[_l]["can create"] || data.permissions[_l]["all_permissions"]) {
                                            // show_plus = true;
                                            // app_permissions.can_create = true;
                                        // }
//     
                                        // if (data.permissions[_l]["all_permissions"]) {
                                            // app_permissions.all_permissions = true;
                                            // app_permissions.can_update = true;
                                            // app_permissions.can_view = true;
                                            // continue;
                                        // }
//     
                                        // if (stringifyObj.indexOf('update') >= 0 || data.permissions[_l]["all_permissions"]) {
                                            // app_permissions.can_update = true;
                                        // }
//     
                                        // if (stringifyObj.indexOf('view') >= 0 || data.permissions[_l]["all_permissions"]) {
                                            // app_permissions.can_view = true;
                                        // }
//     
                                    // }
                                // }
                            // }
                        // }
//                         
                        // if(!is_disabled && (app_permissions.can_view || app_permissions.can_create)){
                            // display_on_menu = true;
                        // }
//                         
                        // // if ((_is_disabled != 1 && _is_disabled != "1" && _is_disabled != "true" && _is_disabled != true)) {
// //                 
                            // // if (app_permissions.can_view || app_permissions.can_create) {
                                // // display_on_menu = true;
                            // // }
//     
                            // // var row_a = Ti.UI.createTableViewRow({
                                // // height : "40dp",
                                // // name : display,
                                // // display : display,
                                // // desc : description,
                                // // name_table : name_table,
                                // // show_plus : show_plus,
                                // // app_permissions : app_permissions,
                                // // className : 'menu_row', // this is to optimize the rendering
                                // // selectionStyle : app_permissions.can_view ? 1 : 0,
                                // // backgroundSelectedColor : app_permissions.can_view ? '#BDBDBD' : '#00000000'
                            // // });
// //                 
                            // // var icon = Titanium.UI.createImageView({
                                // // width : "32dp",
                                // // height : "32dp",
                                // // top : "6dp",
                                // // left : "5dp",
                                // // desc : description,
                                // // image : '/images/icons/' + name_table.toLowerCase() + '.png',
                            // // });
// //                 
                            // // if (icon.toBlob() == null || icon.toBlob().length == 0) {
                                // // icon.image = '/images/icons/settings.png';
                            // // }
// //                 
                            // // var title_a = Titanium.UI.createLabel({
                                // // text : display,
                                // // font : {
                                    // // fontSize : "20dp"
                                // // },
                                // // width : '82%',
                                // // textAlign : 'left',
                                // // left : "42dp",
                                // // height : 'auto',
                                // // desc : description,
                                // // color : '#000'
                            // // });
// //                 
                            // // var plus_a = Titanium.UI.createButton({
                                // // backgroundImage : '/images/plus_btn.png',
                                // // backgroundSelectedImage : '/images/plus_btn_selected.png',
                                // // width : "54dp",
                                // // height : "38dp",
                                // // right : "1dp",
                                // // is_plus : true
                            // // });
                            // // if (show_plus === false) {
                                // // plus_a.hide();
                            // // }
// //                 
                            // // row_a.add(icon);
                            // // row_a.add(title_a);
                            // // row_a.add(plus_a);
// //                 
                            // // if (PLATFORM == 'android') {
                                // // row_a.addEventListener('longclick', function(e) {
                                    // // if (e.source.desc != null && e.source.desc != "") {
                                        // // alert(e.source.desc)
                                    // // }
                                // // });
                            // // }
                            // // else {
                                // // row_a.addEventListener('longpress', function(e) {
                                    // // if (e.source.desc != null && e.source.desc != "") {
                                        // // alert(e.source.desc)
                                    // // }
                                // // });
                            // // }
//     
                            // //menu.appendRow(row_a);
                            // // data_rows.push(row_a);
                            // // data_rows.sort(sortTableView);
                            // // menu.setData(data_rows);
                            // //db_installMe.execute('UPDATE bundles SET display_on_menu =\'true\' WHERE bid=' + id);
                       // //}                                    
//                         
//                         
                        // node_db[node_db.length] = "INSERT OR REPLACE INTO bundles (bundle_name, display_name, description, title_fields, _data , disabled, display_on_menu) VALUES ('" + type + "', '" + display + "' , '" + description + "', '" + title_fields_string + "', '" + data_string + "', '" + disabled + "', '" + display_on_menu + "' )";
                        // //Ti.API.info('Node type : ' + json.node_type.insert[i].type + ' has been created');
                        // //Ti.API.info("DISABLED ? " + json.node_type.insert[i].disabled);
                    // }
                // }
            // }
            // //Unique node insert
            // // else {
                // // if (json.node_type.insert.type != 'user') {
                    // // if (progress != null) {
                        // // progress.set();
                    // // }
                    // // node_db[node_db.length] = "CREATE TABLE " + json.node_type.insert.type + " ('nid' INTEGER PRIMARY KEY NOT NULL  UNIQUE )";
// // 
                    // // var get_title = JSON.stringify(json.node_type.insert.data.title_fields);
                    // // var _get_data = JSON.stringify(json.node_type.insert.data);
// // 
                    // // node_db[node_db.length] = "INSERT OR REPLACE INTO bundles (bundle_name, display_name, description, title_fields, _data  , disabled) VALUES ('" + json.node_type.insert.type + "', '" + json.node_type.insert.name + "' , '" + json.node_type.insert.description + "' , '" + get_title + "', '" + _get_data + "',  '" + json.node_type.insert.disabled + "' )";
                    // // Ti.API.info('Node type : ' + json.node_type.insert.type + ' has been created');
                    // // Ti.API.info("DISABLED ? " + json.node_type.insert.disabled);
                // // }
            // // }
        // }
// 
        // // //Doesn't make sense to update it at this moment because we create an empty table
        // // //The only thing to consideer is deletion.
        // // //Node type updates - Not implemented yet (API's side)
        // // else
        // // if (json.node_type.update) {
            // // //Multiple nodes updates
// // 
            // // if (json.node_type.update.length) {
                // // var data_rows = [];
                // // var i;
                // // for ( i = 0; i < json.node_type.update.length; i++) {
                    // // //Increment the progress bar
                    // // if (progress != null) {
                        // // progress.set();
                    // // }
// // 
                    // // var get_title = JSON.stringify(json.node_type.update[i].data.title_fields);
// // 
                    // // var _get_data = JSON.stringify(json.node_type.update[i].data);
                    // // var node_type_json = json.node_type.update[i].data;
                    // // var no_mob_display = true;
// // 
                    // // if ((node_type_json.no_mobile_display != null && (node_type_json.no_mobile_display == 1 || node_type_json.no_mobile_display == '1')) || json.node_type.update[i].disabled == 1 || json.node_type.update[i].disabled == '1' || json.node_type.update[i].disabled == 'true' || json.node_type.update[i].disabled == true) {
                        // // no_mob_display = false;
                    // // }
// // 
                    // // db_installMe.execute("UPDATE bundles SET bundle_name='" + json.node_type.update[i].type + "', display_on_menu='" + no_mob_display + "', display_name='" + json.node_type.update[i].name + "', description='" + json.node_type.update[i].description + "', title_fields='" + get_title + "', _data='" + _get_data + "', disabled='" + json.node_type.update[i].disabled + "' WHERE bundle_name='" + json.node_type.update[i].type + "'");
// // 
                    // // var n_bund = db_installMe.execute('SELECT * FROM bundles');
                    // // data_rows = new Array();
                    // // while (n_bund.isValidRow()) {
                        // // var name_table = n_bund.fieldByName("bundle_name");
                        // // var display = n_bund.fieldByName("display_name").toUpperCase();
                        // // var description = n_bund.fieldByName("description");
                        // // var flag_display = n_bund.fieldByName("display_on_menu");
                        // // var _is_disabled = n_bund.fieldByName("disabled");
                        // // var _nd = n_bund.fieldByName("_data");
                        // // var show_plus = false;
                        // // var app_permissions = {
                            // // "can_create" : false,
                            // // "can_update" : false,
                            // // "all_permissions" : false,
                            // // "can_view" : false
                        // // }
// // 
                        // // var node_type_json = JSON.parse(_nd);
// // 
                        // // if (node_type_json.no_mobile_display != null && node_type_json.no_mobile_display == 1 && node_type_json.no_mobile_display == '1') {
                            // // n_bund.next();
                            // // continue;
                        // // }
// // 
                        // // if (roles.hasOwnProperty(ROLE_ID_ADMIN)) {
                            // // show_plus = true;
                            // // app_permissions.can_create = true;
                            // // app_permissions.all_permissions = true;
                            // // app_permissions.can_update = true;
                            // // app_permissions.can_view = true;
// // 
                        // // }
                        // // else {
                            // // var _l;
                            // // for (_l in node_type_json.permissions) {
                                // // for (_k in roles) {
                                    // // if (_l == _k) {
                                        // // var stringifyObj = JSON.stringify(node_type_json.permissions[_l]);
                                        // // if (node_type_json.permissions[_l]["can create"] || node_type_json.permissions[_l]["all_permissions"]) {
                                            // // show_plus = true;
                                            // // app_permissions.can_create = true;
                                        // // }
// // 
                                        // // if (node_type_json.permissions[_l]["all_permissions"]) {
                                            // // app_permissions.all_permissions = true;
                                            // // app_permissions.can_update = true;
                                            // // app_permissions.can_view = true;
                                            // // continue;
                                        // // }
// // 
                                        // // if (stringifyObj.indexOf('update') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
                                            // // app_permissions.can_update = true;
                                        // // }
// // 
                                        // // if (stringifyObj.indexOf('view') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
                                            // // app_permissions.can_view = true;
                                        // // }
// // 
                                    // // }
                                // // }
                            // // }
                        // // }
// // 
                        // // if (flag_display == 'true' && (_is_disabled != 1 && _is_disabled != "1" && _is_disabled != "true" && _is_disabled != true)) {
                            // // if (app_permissions.can_view == false && app_permissions.can_create == false) {
                                // // n_bund.next();
                                // // continue;
                            // // }
                            // // var row_a = Ti.UI.createTableViewRow({
                                // // height : "40dp",
                                // // name : display,
                                // // display : display,
                                // // desc : description,
                                // // name_table : name_table,
                                // // show_plus : show_plus,
                                // // app_permissions : app_permissions,
                                // // className : 'menu_row', // this is to optimize the rendering
                                // // selectionStyle : app_permissions.can_view ? 1 : 0,
                                // // backgroundSelectedColor : app_permissions.can_view ? '#BDBDBD' : '#00000000'
                            // // });
// // 
                            // // var icon = Titanium.UI.createImageView({
                                // // width : "32dp",
                                // // height : "32dp",
                                // // top : "6dp",
                                // // left : "5dp",
                                // // desc : description,
                                // // image : '/images/icons/' + name_table.toLowerCase() + '.png',
                            // // });
// // 
                            // // if (icon.toBlob() == null || icon.toBlob().length == 0) {
                                // // icon.image = '/images/icons/settings.png';
                            // // }
// // 
                            // // var title_a = Titanium.UI.createLabel({
                                // // text : display,
                                // // font : {
                                    // // fontSize : "20dp"
                                // // },
                                // // width : '82%',
                                // // textAlign : 'left',
                                // // left : "42dp",
                                // // height : 'auto',
                                // // desc : description,
                                // // color : '#000'
                            // // });
// // 
                            // // var plus_a = Titanium.UI.createButton({
                                // // backgroundImage : '/images/plus_btn.png',
                                // // backgroundSelectedImage : '/images/plus_btn_selected.png',
                                // // width : "54dp",
                                // // height : "38dp",
                                // // right : "1dp",
                                // // is_plus : true
                            // // });
                            // // if (show_plus === false) {
                                // // plus_a.hide();
                            // // }
// // 
                            // // row_a.add(icon);
                            // // row_a.add(title_a);
                            // // row_a.add(plus_a);
// // 
                            // // if (PLATFORM == 'android') {
                                // // row_a.addEventListener('longclick', function(e) {
                                    // // if (e.source.desc != null && e.source.desc != "") {
                                        // // alert(e.source.desc)
                                    // // }
                                // // });
                            // // }
                            // // else {
                                // // row_a.addEventListener('longpress', function(e) {
                                    // // if (e.source.desc != null && e.source.desc != "") {
                                        // // alert(e.source.desc)
                                    // // }
                                // // });
                            // // }
                            // // data_rows.push(row_a);
                            // // data_rows.sort(sortTableView);
                        // // }
// // 
                        // // n_bund.next();
                    // // }
                    // // n_bund.close();
                // // }
                // // if (data_rows.length > 0) {
                    // // menu.setData(data_rows);
                // // }
// // 
            // // }
            // // //Unique node update
            // // else {
                // // //Increment the progress bar
                // // if (progress != null) {
                    // // progress.set();
                // // }
// // 
                // // var get_title = JSON.stringify(json.node_type.update.data.title_fields);
// // 
                // // var _get_data = JSON.stringify(json.node_type.update.data);
                // // var node_type_json = json.node_type.update.data;
                // // var no_mob_display = true;
// // 
                // // if ((node_type_json.no_mobile_display != null && (node_type_json.no_mobile_display == 1 || node_type_json.no_mobile_display == '1')) || json.node_type.update.disabled == 1 || json.node_type.update.disabled == '1' || json.node_type.update.disabled == 'true' || json.node_type.update.disabled == true) {
                    // // no_mob_display = false;
                // // }
// // 
                // // db_installMe.execute("UPDATE bundles SET bundle_name='" + json.node_type.update.type + "', display_on_menu='" + no_mob_display + "', display_name='" + json.node_type.update.name + "', description='" + json.node_type.update.description + "', title_fields='" + get_title + "', _data='" + _get_data + "', disabled='" + json.node_type.update.disabled + "' WHERE bundle_name='" + json.node_type.update.type + "'");
// // 
                // // var n_bund = db_installMe.execute('SELECT * FROM bundles');
                // // var data_rows = new Array();
                // // while (n_bund.isValidRow()) {
                    // // var name_table = n_bund.fieldByName("bundle_name");
                    // // var display = n_bund.fieldByName("display_name").toUpperCase();
                    // // var description = n_bund.fieldByName("description");
                    // // var flag_display = n_bund.fieldByName("display_on_menu");
                    // // var _is_disabled = n_bund.fieldByName("disabled");
                    // // var _nd = n_bund.fieldByName("_data");
                    // // var show_plus = false;
                    // // var app_permissions = {
                        // // "can_create" : false,
                        // // "can_update" : false,
                        // // "all_permissions" : false,
                        // // "can_view" : false
                    // // }
// // 
                    // // var node_type_json = JSON.parse(_nd);
// // 
                    // // if (node_type_json.no_mobile_display != null && node_type_json.no_mobile_display == 1 && node_type_json.no_mobile_display == '1') {
                        // // n_bund.next();
                        // // continue;
                    // // }
// // 
                    // // if (roles.hasOwnProperty(ROLE_ID_ADMIN)) {
                        // // show_plus = true;
                        // // app_permissions.can_create = true;
                        // // app_permissions.all_permissions = true;
                        // // app_permissions.can_update = true;
                        // // app_permissions.can_view = true;
// // 
                    // // }
                    // // else {
                        // // var _l;
                        // // for (_l in node_type_json.permissions) {
                            // // for (_k in roles) {
                                // // if (_l == _k) {
                                    // // var stringifyObj = JSON.stringify(node_type_json.permissions[_l]);
                                    // // if (node_type_json.permissions[_l]["can create"] || node_type_json.permissions[_l]["all_permissions"]) {
                                        // // show_plus = true;
                                        // // app_permissions.can_create = true;
                                    // // }
// // 
                                    // // if (node_type_json.permissions[_l]["all_permissions"]) {
                                        // // app_permissions.all_permissions = true;
                                        // // app_permissions.can_update = true;
                                        // // app_permissions.can_view = true;
                                        // // continue;
                                    // // }
// // 
                                    // // if (stringifyObj.indexOf('update') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
                                        // // app_permissions.can_update = true;
                                    // // }
// // 
                                    // // if (stringifyObj.indexOf('view') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
                                        // // app_permissions.can_view = true;
                                    // // }
// // 
                                // // }
                            // // }
                        // // }
                    // // }
// // 
                    // // if (flag_display == 'true' && (_is_disabled != 1 && _is_disabled != "1" && _is_disabled != "true" && _is_disabled != true)) {
                        // // if (app_permissions.can_view == false && app_permissions.can_create == false) {
                            // // n_bund.next();
                            // // continue;
                        // // }
                        // // var row_a = Ti.UI.createTableViewRow({
                            // // height : "40dp",
                            // // name : display,
                            // // display : display,
                            // // desc : description,
                            // // name_table : name_table,
                            // // show_plus : show_plus,
                            // // app_permissions : app_permissions,
                            // // className : 'menu_row', // this is to optimize the rendering
                            // // selectionStyle : app_permissions.can_view ? 1 : 0,
                            // // backgroundSelectedColor : app_permissions.can_view ? '#BDBDBD' : '#00000000'
                        // // });
// // 
                        // // var icon = Titanium.UI.createImageView({
                            // // width : "32dp",
                            // // height : "32dp",
                            // // top : "6dp",
                            // // left : "5dp",
                            // // desc : description,
                            // // image : '/images/icons/' + name_table.toLowerCase() + '.png',
                        // // });
// // 
                        // // if (icon.toBlob() == null || icon.toBlob().length == 0) {
                            // // icon.image = '/images/icons/settings.png';
                        // // }
// // 
                        // // var title_a = Titanium.UI.createLabel({
                            // // text : display,
                            // // font : {
                                // // fontSize : "20dp"
                            // // },
                            // // width : '82%',
                            // // textAlign : 'left',
                            // // left : "42dp",
                            // // height : 'auto',
                            // // desc : description,
                            // // color : '#000'
                        // // });
// // 
                        // // var plus_a = Titanium.UI.createButton({
                            // // backgroundImage : '/images/plus_btn.png',
                            // // backgroundSelectedImage : '/images/plus_btn_selected.png',
                            // // width : "54dp",
                            // // height : "38dp",
                            // // right : "1dp",
                            // // is_plus : true
                        // // });
                        // // if (show_plus === false) {
                            // // plus_a.hide();
                        // // }
// // 
                        // // row_a.add(icon);
                        // // row_a.add(title_a);
                        // // row_a.add(plus_a);
// // 
                        // // if (PLATFORM == 'android') {
                            // // row_a.addEventListener('longclick', function(e) {
                                // // if (e.source.desc != null && e.source.desc != "") {
                                    // // alert(e.source.desc)
                                // // }
                            // // });
                        // // }
                        // // else {
                            // // row_a.addEventListener('longpress', function(e) {
                                // // if (e.source.desc != null && e.source.desc != "") {
                                    // // alert(e.source.desc)
                                // // }
                            // // });
                        // // }
                        // // data_rows.push(row_a);
                        // // data_rows.sort(sortTableView);
                        // // menu.setData(data_rows);
                    // // }
// // 
                    // // n_bund.next();
                // // }
                // // n_bund.close();
            // // }
        // // }
// 
        // //Node type deletion - Not implemented yet (API's side)
        // else
        // if (json.node_type['delete']) {
            // //Multiple node type deletions
            // if (json.node_type['delete'].length) {
                // var i;
                // for ( i = 0; i < json.node_type['delete'].length; i++) {
                    // //Increment the progress bar
                    // if (progress != null) {
                        // progress.set();
                    // }
                    // node_db[node_db.length] = "DROP TABLE " + json.node_type.insert[i].type;
                    // node_db[node_db.length] = "DELETE FROM bundles WHERE bundle_name = '" + json.node_type.insert[i].type + "'";
                    // node_db[node_db.length] = "DELETE FROM node WHERE table_name = '" + json.node_type.insert[i].type + "'";
// 
                // }
            // }
            // //Unique node deletion
            // else {
                // if (progress != null) {
                    // progress.set();
                // }
                // node_db[node_db.length] = "DROP TABLE " + json.node_type.insert.type;
                // node_db[node_db.length] = "DELETE FROM bundles WHERE bundle_name = '" + json.node_type.insert.type + "'";
                // node_db[node_db.length] = "DELETE FROM node WHERE table_name = '" + json.node_type.insert.type + "'";
            // }
        // }
// 
        // //DB operations
        // var iPerform = 0;
        // var iStart = Math.round(new Date().getTime() / 1000);
        // Ti.API.info("Node_type started at : " + iStart);
// 
        // db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
        // while (iPerform <= node_db.length - 1) {
            // db_installMe.execute(node_db[iPerform]);
            // iPerform++;
        // }
        // db_installMe.execute("COMMIT TRANSACTION");
// 
        // var iEnd = Math.round(new Date().getTime() / 1000);
        // Ti.API.info("Node_type finishes at : " + iEnd);
// 
        // var iResult = iEnd - iStart;
        // Ti.API.info('Node_type seconds: ' + iResult);
        // Ti.API.info("Success for node_types, db operations ran smoothly!");
    // }