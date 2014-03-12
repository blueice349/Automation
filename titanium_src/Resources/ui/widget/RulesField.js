/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;

Widget = {};

function RulesFieldWidget(formObj, instance, fieldViewWrapper){"use strict";
    this.formObj = formObj;
    this.instance = instance;
    this.fieldView = null;
    this.node = formObj.node;
    this.dbValues = [];
    this.textValues = [];
    this.nodeElement = null;
    this.numVisibleFields = 1;
    this.fieldViewWrapper = fieldViewWrapper;
    
    if(typeof this.node[this.instance.field_name] !== 'undefined'){
        this.nodeElement = this.node[this.instance.field_name];
        
        if(typeof this.nodeElement.dbValues !== 'undefined' && this.nodeElement.dbValues != null){
            this.dbValues = this.nodeElement.dbValues;
            
        }
        
        if(typeof this.nodeElement.textValues !== 'undefined' && this.nodeElement.textValues != null){
            this.textValues = this.nodeElement.textValues;
        }
    }
    
    if(this.instance.settings.cardinality == -1){
        if(Omadi.utils.isArray(this.dbValues)){
            this.numVisibleFields = this.dbValues.length;
        }
    }
    else{
        this.numVisibleFields = this.instance.settings.cardinality;
    }
}

RulesFieldWidget.prototype.getFieldView = function(){"use strict";
    
    var i, element, addButton;
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    this.fieldView.add(this.formObj.getRegularLabelView(this.instance));
    
    // Add the actual fields
    element = this.getNewElement(0);
    this.fieldView.add(element);
    this.fieldView.add(this.formObj.getSpacerView());
    
    return this.fieldView;
};

RulesFieldWidget.prototype.redraw = function(){"use strict";
    Ti.API.debug("in redraw");
    var origFieldView;
    
    this.formObj.formToNode();
        
    //Ti.API.debug(JSON.stringify(this.formObj.node));
    
    this.node = this.formObj.node;
    if(typeof this.node[this.instance.field_name] !== 'undefined'){
        this.nodeElement = this.node[this.instance.field_name];
        
        if(typeof this.nodeElement.dbValues !== 'undefined' && this.nodeElement.dbValues != null){
            this.dbValues = this.nodeElement.dbValues;   
        }
        
        if(typeof this.nodeElement.textValues !== 'undefined' && this.nodeElement.textValues != null){
            this.textValues = this.nodeElement.textValues;
        }
    }
    
    origFieldView = this.fieldView;
    
    this.getFieldView();
    
    origFieldView.hide();
    
    this.fieldViewWrapper.add(this.fieldView);
    this.fieldViewWrapper.remove(origFieldView);
};

RulesFieldWidget.prototype.getNewElement = function(index){"use strict";
    var widget, nodeValue, i, key, violation_name, db, result, formTypes, row, view, hasRules;
    Ti.API.debug("Creating rules_field field: " + this.instance.label);
    
    hasRules = false;

    nodeValue = null;
    if ( typeof this.instance.widget === 'object' && typeof this.instance.widget.type !== 'undefined') {
        widget = this.instance.widget;
    }
    else {
        widget = JSON.parse(this.instance.widget);
    }
    
    if(this.nodeElement){
        if(typeof this.dbValues[index] !== 'undefined'){
            nodeValue = this.dbValues[index];
        }
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
                if(typeof nodeValue === 'string'){
                    nodeValue = JSON.parse(nodeValue);
                }
                
                Ti.API.debug(JSON.stringify(nodeValue));
                
                if ( nodeValue instanceof Array) {

                    if (nodeValue.length > 0) {

                        //Ti.API.debug(JSON.stringify(nodeValue));

                        db = Omadi.utils.openMainDatabase();

                        for ( i = 0; i < nodeValue.length; i++) {

                            violation_name = '- ALL OTHER VIOLATIONS -';
                            if (!isNaN(nodeValue[i].tid)) {
                                result = db.execute('SELECT name FROM term_data WHERE tid=' + nodeValue[i].tid);
                                violation_name = result.fieldByName('name');
                                result.close();
                            }

                            formTypes = [];
                            if (!Omadi.utils.isArray(nodeValue[i].node_types)) {

                                for (key in nodeValue[i].node_types) {
                                    if (nodeValue[i].node_types.hasOwnProperty(key)) {
                                        result = db.execute('SELECT display_name FROM bundles WHERE bundle_name="' + key + '"');
                                        if(result.isValidRow()){
                                            formTypes.push(result.fieldByName('display_name'));
                                        }
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

                            row.addEventListener('click', this.showDetail);

                            view.add(row);
                            
                            hasRules = true;
                        }

                        db.close();
                    }
                }
                break;
        }
    }

    if (!hasRules) {
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
};

RulesFieldWidget.prototype.showDetail = function(e) {"use strict";
    var detail_popup, translucent, table_format_bg, headerRow0, headerRowLabel, headerRow, 
        forms, desc, detail_row, dttm, formsView, formsViewLabel, detailsVal, forms_str, i, 
        dttmViewLabel, dttmView, descView, descViewLabel;

    if (Ti.App.isAndroid) {
        Ti.UI.Android.hideSoftKeyboard();
    }

    detail_popup = Ti.UI.createWindow({
        modal: true,
        navBarHidden: true,
        orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
    });

    translucent = Ti.UI.createView({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    });
    
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
        height : 175,
        layout : 'horizontal'
    });
    table_format_bg.add(detail_row);

    formsView = Ti.UI.createScrollView({
        height : 175,
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

    if (typeof e.source.formTypes !== 'undefined' && typeof e.source.formTypes.length !== 'undefined'){
        
        if(e.source.formTypes.length < 4 && e.source.formTypes.length > 0) {
            forms_str = '';
            for (i = 0; i < e.source.formTypes.length; i++) {
                forms_str += e.source.formTypes[i] + ((i == e.source.formTypes.length - 1) ? "" : ", ");
            }
        }
    }
    else{
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
    
    if(typeof detailsVal.time_rules !== 'undefined'){
        dttmViewLabel = Ti.UI.createLabel({
            top : 0,
            left : 5,
            right : 5,
            text : this.getTimeRulesText(detailsVal.time_rules),
            height : Ti.UI.SIZE,
            color : '#1c1c1c',
            font : {
                fontFamily : 'Helvetica Neue',
                fontSize : 16
            },
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT
        });
        
        dttmView.add(dttmViewLabel);
    }

    descView = Ti.UI.createScrollView({
        height : 175,
        contentHeight : 'auto',
        scrollType : 'vertical',
        showVerticalScrollIndicator : true,
        left : 2,
        width : (Ti.Platform.displayCaps.platformWidth - 20) / 3
    });
    detail_row.add(descView);
    
    if(typeof detailsVal.description !== 'undefined'){
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
    }
    
    detail_popup.open();
};

RulesFieldWidget.prototype.getTimeRulesText = function(timeValue) {"use strict";
    var timeStrings = [], dayStrings = [], times = [], returnVal, rows, i, row, values, day, time, 
        timeString, startDay, currentDay, lastConsecutive, dayPatrolStrings, day_index;

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
                        if (times[Omadi.utils.secondsToString(values[2]) + '-' + Omadi.utils.secondsToString(values[3])] == null) {
                            times[Omadi.utils.secondsToString(values[2]) + '-' + Omadi.utils.secondsToString(values[3])] = [];
                        }

                        times[Omadi.utils.secondsToString(values[2]) + '-' + Omadi.utils.secondsToString(values[3])].push(i);
                    }
                }
            }
        }

        if (times['All Day'] != null && Omadi.utils.count(times['All Day']) == 7) {
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
};

exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    Omadi = OmadiObj;
    Widget[instance.field_name] = new RulesFieldWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};


