/*jslint eqeq:true, plusplus: true*/

var Utils = require('lib/Utils');
var Database = require('lib/Database');
var Display = require('lib/Display');

function getTimeRulesText(timeValue) {"use strict";
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
    
    try{
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
                            if (times[Utils.secondsToString(values[2]) + '-' + Utils.secondsToString(values[3])] == null) {
                                times[Utils.secondsToString(values[2]) + '-' + Utils.secondsToString(values[3])] = [];
                            }
    
                            times[Utils.secondsToString(values[2]) + '-' + Utils.secondsToString(values[3])].push(i);
                        }
                    }
                }
            }
    
            if (times['All Day'] != null && Utils.count(times['All Day']) == 7) {
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
    }
    catch(ex){
        Utils.sendErrorReport("Exception creating time strings in rules field: " + ex);
    }

    return returnVal;
}

function RulesFieldWidget(formObj, instance, fieldViewWrapper){"use strict";
    this.formObj = formObj;
    this.instance = instance;
    this.fieldView = null;
    this.node = formObj.node;
    this.dbValues = [];
    this.textValues = [];
    this.elements = [];
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
        if(Utils.isArray(this.dbValues)){
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
    this.elements[0] = this.getNewElement(0);
    this.fieldView.add(this.elements[0]);
    this.fieldView.add(this.formObj.getSpacerView());
    
    return this.fieldView;
};

RulesFieldWidget.prototype.redraw = function(){"use strict";
    Ti.API.debug("in redraw");
    var origFieldView;
    
    this.formObj.formToNode();
    
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
    var self = this;
    Ti.API.debug("Creating rules_field field: " + this.instance.label);
    
    hasRules = false;

    nodeValue = null;
    if ( typeof this.instance.widget === 'object' && typeof this.instance.widget.type !== 'undefined') {
        widget = this.instance.widget;
    }
    else {
        widget = Utils.getParsedJSON(this.instance.widget);
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
                    Ti.API.debug("is string");
                    nodeValue = Utils.getParsedJSON(nodeValue);
                }
                
                if(typeof nodeValue === 'string'){
                    Ti.API.debug("is string again");
                }
                else{
                    Ti.API.debug("is not string again");
                }
                
                if (Utils.isArray(nodeValue)) {

                    if (nodeValue.length > 0) {
                
                        Ti.API.debug("in with the array");
                        
                        var showDetail = function(event) {
							self.showDetail(event);
                        };

                        for ( i = 0; i < nodeValue.length; i++) {
                            try{
                                violation_name = '- ALL OTHER VIOLATIONS -';
                                if (!isNaN(nodeValue[i].tid)) {
                                    result = Database.query('SELECT name FROM term_data WHERE tid=' + nodeValue[i].tid);
                                    violation_name = result.fieldByName('name');
                                    result.close();
                                }
    
                                formTypes = [];
                                if (!Utils.isArray(nodeValue[i].node_types)) {
    
                                    for (key in nodeValue[i].node_types) {
                                        if (nodeValue[i].node_types.hasOwnProperty(key)) {
                                            result = Database.query('SELECT display_name FROM bundles WHERE bundle_name="' + key + '"');
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
                                    text : violation_name,
                                    instance : this.instance
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
                                    formTypes : formTypes,
                                    instance : this.instance
                                });
    
                                row.add(row.image);
                                row.add(row.label);
    
                                row.addEventListener('click', showDetail);
    
                                view.add(row);
                            }
                            catch(ex){
                                Utils.sendErrorReport("Exception with a rules field row: " + ex);
                            }
                            
                            hasRules = true;
                        }

                        Database.close();
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
    var detail_popup, translucent, table_format_bg, headerRow0, headerRowLabel, 
            headerRow, forms, desc, detail_row, dttm, formsView, formsViewLabel, detailsVal, 
            forms_str, i, dttmViewLabel, dttmView, descView, descViewLabel, closeLabel;

    try{
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
            height : 290
        });
        detail_popup.add(table_format_bg);

        headerRow0 = Ti.UI.createView({
            top : 0,
            height : 30,
            width : Ti.Platform.displayCaps.platformWidth - 8,
            layout : 'horizontal',
            backgroundGradient: Display.backgroundGradientBlue
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
            backgroundGradient: Display.backgroundGradientGray,
            font : {
                fontSize : 16,
                fontWeight : 'bold'
            },
            color : '#fff',
            textAlign : 'center'
        });
		headerRow.add(forms);

        dttm = Ti.UI.createLabel({
            text : 'Time Rules',
            height : 38,
            width : (Ti.Platform.displayCaps.platformWidth - 20) / 3,
            backgroundGradient: Display.backgroundGradientGray,
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
            backgroundGradient: Display.backgroundGradientGray,
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
        
        closeLabel = Ti.UI.createLabel({
           text: 'Close',
           color: '#eee',
           backgroundGradient: Display.backgroundGradientBlue,
           font: {
               fontSize: 18,
               fontWeight: 'bold'
           },
           width: Ti.UI.FILL,
           top: 250,
           height: 40,
           textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        
        closeLabel.addEventListener('click', function(){
            detail_popup.close();
        });
        
        table_format_bg.add(closeLabel);

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
        
        if(detailsVal && detailsVal.time_rules){
            dttmViewLabel = Ti.UI.createLabel({
                top : 0,
                left : 5,
                right : 5,
                text : getTimeRulesText(detailsVal.time_rules),
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
        
        try{
            this.formObj.unfocusField();
        }
        catch(ex1){}
        
        detail_popup.open();
    }
    catch(ex){
        Utils.sendErrorReport("Could not show the details for a rules: " + ex);   
    }
};

RulesFieldWidget.prototype.cleanUp = function(){"use strict";
    var i, j;
    
    try{
        for(j = 0; j < this.elements.length; j ++){
            this.fieldView.remove(this.elements[j]);
            this.elements[j] = null;
        }
        
        this.fieldView = null;
        this.fieldViewWrapper = null;
        this.formObj = null;
        this.node = null;
        this.dbValues = null;
        this.textValues = null;
        this.nodeElement = null;
        this.instance = null;
    }
    catch(ex){
        try{
            Utils.sendErrorReport("Exception cleaning up rules widget field: " + ex);
        }
        catch(ex1){}
    }
};

exports.getFieldObject = function(FormObj, instance, fieldViewWrapper){"use strict";
    return new RulesFieldWidget(FormObj, instance, fieldViewWrapper);
};

exports.getView = function(node, instance){"use strict";
    var formObj, widget;
    
    formObj = {};
    formObj.node = node;
    formObj.unfocusField = function(){};
    
    widget = new RulesFieldWidget(formObj, instance, null);
    
    return widget.getNewElement(0);
};

