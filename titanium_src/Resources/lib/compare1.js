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