/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.rules_field = {

    getFieldView : function(node, instance) {"use strict";
        
        instance.elements = [];

        var settings = instance.settings, fieldView, i, j, element, addAnotherItemButton = null;

        fieldView = Ti.UI.createView({
            width : '100%',
            layout : 'vertical',
            height : Ti.UI.SIZE,
            instance : instance
        });

        instance.fieldView = fieldView;

        fieldView.add(Omadi.widgets.label.getRegularLabelView(instance));
        setConditionallyRequiredLabelForInstance(node, instance);

        instance.numVisibleFields = 1;

        element = Omadi.widgets.rules_field.getNewElement(node, instance);
        instance.elements.push(element);
        fieldView.add(element);
        fieldView.add(Omadi.widgets.getSpacerView());

        return fieldView;
    },
    getNewElement : function(node, instance) {"use strict";
        var widget, settings, nodeValue, i, key, violation_name, db, result, formTypes, row, view;
        /*global isArray*/
        Ti.API.debug("Creating rules_field field");

        Ti.API.debug(JSON.stringify(instance.widget));

        nodeValue = null;
        if ( typeof instance.widget === 'object' && typeof instance.widget.type !== 'undefined') {
            widget = instance.widget;
        }
        else {
            widget = JSON.parse(instance.widget);
        }

        settings = instance.settings;

        if ( typeof node[instance.field_name] !== 'undefined' && typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[0] !== 'undefined') {
            nodeValue = node[instance.field_name].dbValues[0];
        }

        view = Ti.UI.createView({
            height : Ti.UI.SIZE,
            width : '96%',
            layout : 'vertical',
            dbValue : nodeValue
        });

        if (nodeValue !== null) {

            switch(widget.type) {
                case 'rules_field_violations':
                    nodeValue = JSON.parse(nodeValue);
                    if ( nodeValue instanceof Array) {

                        if (nodeValue.length > 0) {

                            Ti.API.debug(JSON.stringify(nodeValue));

                            db = Omadi.utils.openMainDatabase();

                            for ( i = 0; i < nodeValue.length; i++) {

                                violation_name = '- ALL OTHER VIOLATIONS -';
                                if (!isNaN(nodeValue[i].tid)) {
                                    result = db.execute('SELECT name FROM term_data WHERE tid=' + nodeValue[i].tid);
                                    violation_name = result.fieldByName('name');
                                    result.close();
                                }

                                formTypes = [];
                                if (!isArray(nodeValue[i].node_types)) {

                                    for (key in nodeValue[i].node_types) {
                                        if (nodeValue[i].node_types.hasOwnProperty(key)) {
                                            result = db.execute('SELECT display_name FROM bundles WHERE bundle_name="' + key + '"');
                                            formTypes.push(result.fieldByName('display_name'));
                                            result.close();
                                        }
                                    }
                                }

                                row = Ti.UI.createView({
                                    layout : 'horizontal',
                                    height : Ti.UI.SIZE,
                                    width : '100%'
                                });

                                row.image = Ti.UI.createImageView({
                                    image : '/images/arrow.png',
                                    height : 23,
                                    width : 23,
                                    details : nodeValue[i],
                                    formTypes : formTypes,
                                    text : violation_name
                                });

                                row.label = Ti.UI.createLabel({
                                    text : violation_name,
                                    height : Ti.UI.SIZE,
                                    color : '#000',
                                    font : {
                                        fontSize : 15,
                                        fontFamily : 'Helvetica Neue'
                                    },
                                    ellipsize : true,
                                    wordWrap : false,
                                    details : nodeValue[i],
                                    formTypes : formTypes
                                });

                                row.add(row.image);
                                row.add(row.label);

                                row.addEventListener('click', Omadi.widgets.rules_field.showDetail);

                                view.add(row);
                            }

                            db.close();
                        }
                    }
                    break;
            }
        }

        if (view.getChildren().length == 0) {
            view.add(Ti.UI.createLabel({
                text : "All Violations Enforceable - 24/7",
                width : '100%',
                textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                font : {
                    fontSize : 16
                },
                color : '#666'
            }));
        }

        return view;
    },
    showDetail : function(e) {"use strict";
        var detail_popup, translucent, table_format_bg, headerRow0, headerRowLabel, headerRow, forms, desc, detail_row, dttm, formsView, formsViewLabel, detailsVal, forms_str, i, dttmViewLabel, dttmView, descView, descViewLabel;

        if (Ti.App.isAndroid) {
            Ti.UI.Android.hideSoftKeyboard();
            //Ti.API.info("hide keyboard in row click listener");
        }

        detail_popup = Ti.UI.createView({
            backgroundColor : '#00000000'
        });
        detail_popup.left = detail_popup.right = detail_popup.top = detail_popup.bottom = 0;

        translucent = Ti.UI.createView({
            opacity : 0.5,
            backgroundColor : '#000'
        });
        translucent.left = translucent.right = translucent.top = translucent.bottom = 0;
        detail_popup.add(translucent);

        table_format_bg = Ti.UI.createView({
            backgroundColor : '#FFF',
            borderColor : '#424242',
            borderWidth : 1,
            left : 4,
            right : 4,
            height : '250'
            //layout: 'vertical'
        });
        detail_popup.add(table_format_bg);

        headerRow0 = Ti.UI.createView({
            top : 0,
            height : 30,
            width : Ti.Platform.displayCaps.platformWidth - 8,
            layout : 'horizontal',
            backgroundImage : '/images/header.png'
        });

        headerRowLabel = Ti.UI.createLabel({
            text : e.source.text,
            height : Ti.UI.SIZE,
            width : '100%',
            color : '#fff',
            top : 5,
            font : {
                fontSize : 18,
                fontWeight : 'bold'
            },
            ellipsize : true,
            wordWrap : false,
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER
        });

        table_format_bg.add(headerRow0);
        headerRow0.add(headerRowLabel);

        headerRow = Ti.UI.createView({
            top : 33,
            height : 42,
            width : Ti.Platform.displayCaps.platformWidth - 16,
            layout : 'horizontal'
        });
        table_format_bg.add(headerRow);

        forms = Ti.UI.createLabel({
            text : 'Forms',
            height : 38,
            width : (Ti.Platform.displayCaps.platformWidth - 20) / 3,
            backgroundImage : '/images/header.png',
            font : {
                fontSize : 16,
                fontWeight : 'bold'
            },
            color : '#fff',
            textAlign : 'center'
        });
        headerRow.add(forms);

        dttm = Ti.UI.createLabel({
            text : 'Date/Time Rules',
            height : 38,
            width : (Ti.Platform.displayCaps.platformWidth - 20) / 3,
            backgroundImage : '/images/header.png',
            font : {
                fontSize : 16,
                fontWeight : 'bold'
            },
            left : 1,
            color : '#fff',
            textAlign : 'center'
        });
        headerRow.add(dttm);

        desc = Ti.UI.createLabel({
            text : 'Description',
            height : 38,
            width : (Ti.Platform.displayCaps.platformWidth - 20) / 3,
            backgroundImage : '/images/header.png',
            font : {
                fontFamily : 'Helvetica Neue',
                fontSize : 16,
                fontWeight : 'bold'
            },
            left : 1.5,
            color : '#fff',
            textAlign : 'center'
        });
        headerRow.add(desc);

        detail_row = Ti.UI.createView({
            width : Ti.Platform.displayCaps.platformWidth - 16,
            top : 75,
            height : '175',
            layout : 'horizontal'
        });
        table_format_bg.add(detail_row);

        formsView = Ti.UI.createScrollView({
            height : '175',
            contentHeight : 'auto',
            scrollType : 'vertical',
            showVerticalScrollIndicator : true,
            width : (Ti.Platform.displayCaps.platformWidth - 20) / 3
        });
        detail_row.add(formsView);
        formsViewLabel = Ti.UI.createLabel({
            top : 0,
            left : 5,
            right : 5,
            height : Ti.UI.SIZE,
            color : '#1c1c1c',
            font : {
                fontFamily : 'Helvetica Neue',
                fontSize : 16
            },
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT
        });
        formsView.add(formsViewLabel);

        detailsVal = e.source.details;
        forms_str = '- All -';

        if (e.source.formTypes.length < 4 && e.source.formTypes.length > 0) {
            forms_str = '';
            for ( i = 0; i < e.source.formTypes.length; i++) {
                forms_str += e.source.formTypes[i] + ((i == e.source.formTypes.length - 1) ? "" : ", ");
            }
        }
        else if (e.source.formTypes.length == 0) {
            forms_str = '- NONE -';

        }
        formsViewLabel.text = forms_str;

        dttmView = Ti.UI.createScrollView({
            height : 170,
            contentHeight : 'auto',
            scrollType : 'vertical',
            showVerticalScrollIndicator : true,
            width : (Ti.Platform.displayCaps.platformWidth - 20) / 3,
            left : 1
        });
        detail_row.add(dttmView);
        dttmViewLabel = Ti.UI.createLabel({
            top : 0,
            left : 5,
            right : 5,
            text : Omadi.widgets.rules_field.getTimeRulesText(detailsVal.time_rules),
            height : Ti.UI.SIZE,
            color : '#1c1c1c',
            font : {
                fontFamily : 'Helvetica Neue',
                fontSize : 16
            },
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT
        });
        dttmView.add(dttmViewLabel);

        descView = Ti.UI.createScrollView({
            height : 175,
            contentHeight : 'auto',
            scrollType : 'vertical',
            showVerticalScrollIndicator : true,
            left : 2,
            width : (Ti.Platform.displayCaps.platformWidth - 20) / 3
        });
        detail_row.add(descView);
        descViewLabel = Ti.UI.createLabel({
            top : 0,
            left : 5,
            right : 5,
            text : detailsVal.description,
            height : Ti.UI.SIZE,
            color : '#1c1c1c',
            font : {
                fontSize : 16
            },
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT
        });
        descView.add(descViewLabel);

        Ti.UI.currentWindow.add(detail_popup);

        translucent.addEventListener('click', function(ent) {
            Ti.UI.currentWindow.remove(detail_popup);
        });
    },
    getTimeRulesText : function(timeValue) {"use strict";
        var timeStrings = [], dayStrings = [], times = [], returnVal, rows, i, row, values, day, time, timeString, startDay, currentDay, lastConsecutive, dayPatrolStrings, day_index;

        /*global count_arr_obj, omadi_time_seconds_to_string*/

        dayStrings.push('Sun');
        dayStrings.push('Mon');
        dayStrings.push('Tue');
        dayStrings.push('Wed');
        dayStrings.push('Thu');
        dayStrings.push('Fri');
        dayStrings.push('Sat');

        returnVal = '24/7';

        if (timeValue > '') {
            rows = timeValue.split(';');
            for (i in rows) {
                if (rows.hasOwnProperty(i)) {
                    row = rows[i];
                    values = row.split('|');
                    if (values[0] == '1') {
                        if (values[1] == '1') {
                            if (times['All Day'] == null) {
                                times['All Day'] = [];
                            }

                            times['All Day'].push(i);
                        }
                        else {
                            if (times[omadi_time_seconds_to_string(values[2], 'h:iA') + '-' + omadi_time_seconds_to_string(values[3], 'h:iA')] == null) {
                                times[omadi_time_seconds_to_string(values[2], 'h:iA') + '-' + omadi_time_seconds_to_string(values[3], 'h:iA')] = [];
                            }

                            times[omadi_time_seconds_to_string(values[2], 'h:iA') + '-' + omadi_time_seconds_to_string(values[3], 'h:iA')].push(i);
                        }
                    }
                }
            }

            if (times['All Day'] != null && count_arr_obj(times['All Day']) == 7) {
                // This is equivalent to no rules, so fall through
                Ti.API.info("NO RULES");
            }
            else {

                for (i in times) {
                    if (times.hasOwnProperty(i)) {
                        time = times[i];
                        timeString = '';
                        startDay = -1;
                        currentDay = -2;
                        lastConsecutive = -1;
                        dayPatrolStrings = [];

                        for (day_index in time) {
                            if (time.hasOwnProperty(day_index)) {
                                day = time[day_index];
                                currentDay = Number(day);
                                if (startDay == -1) {
                                    startDay = currentDay;
                                }
                                else if (currentDay == (lastConsecutive + 1)) {
                                    // Just continue to the next day
                                    Ti.API.info("");
                                }
                                else {
                                    if (startDay != lastConsecutive) {
                                        dayPatrolStrings.push(dayStrings[startDay] + '-' + dayStrings[lastConsecutive]);
                                    }
                                    else {
                                        dayPatrolStrings.push(dayStrings[startDay]);
                                    }
                                    startDay = currentDay;
                                }
                                lastConsecutive = currentDay;
                            }
                        }

                        if (lastConsecutive == currentDay) {
                            if (startDay != lastConsecutive) {
                                dayPatrolStrings.push(dayStrings[startDay] + '-' + dayStrings[lastConsecutive]);
                            }
                            else {
                                dayPatrolStrings.push(dayStrings[startDay]);
                            }
                        }

                        timeString += dayPatrolStrings.join(',') + ' (' + i + ')';

                        timeStrings.push(timeString);
                    }
                }

                returnVal = timeStrings.join('; ');
            }
        }

        return returnVal;
    }
};

