/*jslint eqeq:true, plusplus: true*/
/*global PLATFORM,setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.user_reference = {
    
    // TODO: add autocomplete widget
    // TODO: add parent default value
    
    getFieldView: function(node, instance){"use strict";
        //this.base = Omadi.widgets.base.init(in_instance);
        instance.elements = [];
        
        var settings = instance.settings, fieldView, i, j, element, addAnotherItemButton = null;
        
        fieldView = Ti.UI.createView({
           width: '100%',
           layout: 'vertical',
           height: Ti.UI.SIZE,
           instance: instance
        });
        
        instance.fieldView = fieldView;
        
        fieldView.add(Omadi.widgets.label.getRegularLabelView(instance));
        setConditionallyRequiredLabelForInstance(node, instance);
       
        if(typeof instance.numVisibleFields === 'undefined'){
            
            if(settings.cardinality == -1){

                instance.numVisibleFields = 1;
            }
            else{
                instance.numVisibleFields = settings.cardinality;
            }
        }
        
        // Add the actual fields
        for(i = 0; i < instance.numVisibleFields; i ++){
            //widgetView = this._getUIComponent(instance); 
            element = Omadi.widgets.user_reference.getNewElement(node, instance,  i);
            instance.elements.push(element);
            fieldView.add(element);
            fieldView.add(Omadi.widgets.getSpacerView());
        }
       
       return fieldView;
    },
    getNewElement: function(node, instance, index){"use strict";
        
        var settings, widgetView, dbValue, textValue, i, options, textOptions, loginDetails;
        
        settings = instance.settings;
        
        if(settings.cardinality == -1){
            dbValue = [];
            textValue = '- None -';
            if(typeof node[instance.field_name] !== 'undefined'){
                if(typeof node[instance.field_name].dbValues !== 'undefined'){
                    dbValue = node[instance.field_name].dbValues;
                }
                
                if(typeof node[instance.field_name].textValues !== 'undefined'){
                    textValue = node[instance.field_name].textValues;
                    if(textValue.length > 0){
                        textValue = textValue.join(', ');
                    }
                }
            }
            
            if (dbValue.length == 0 && typeof settings.default_value !== 'undefined' && settings.default_value == "current_user") {
                loginDetails = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
                dbValue.push(loginDetails.user.uid);
                textValue = loginDetails.user.realname;
            }
        }
        else{
            dbValue = "";
            textValue = "- None -";
            if(typeof node[instance.field_name] !== 'undefined'){
                if(typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined'){
                    dbValue = node[instance.field_name].dbValues[index];
                }
                
                if(typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[index] !== 'undefined'){
                    textValue = node[instance.field_name].textValues[index];
                }
            }
            
            if (dbValue === "" && typeof settings.default_value !== 'undefined' && settings.default_value == "current_user") {
                loginDetails = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
                dbValue = loginDetails.user.uid;
                textValue = loginDetails.user.realname;
            }
        }
        
        
        Ti.API.debug("Creating user_reference field");
        
        options = Omadi.widgets.user_reference.getOptions(instance);
        textOptions = [];
        
        for(i = 0; i < options.length; i ++){
            textOptions.push(options[i].title);
        }
        
        widgetView = Titanium.UI.createButton({
            //borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            width : Ti.Platform.displayCaps.platformWidth - 30,
            options : options,
            textOptions: textOptions,
            title : textValue,
            height: 35,
            font : {
                fontSize : Omadi.widgets.fontSize
            },
            color : '#000000',
            selectionIndicator : true,
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
                    color : '#f3f3f3',
                    offset : 0.0
                }, {
                    color : '#f9f9f9',
                    offset : 0.4
                }, {
                    color : '#bbb',
                    offset : 1.0
                }]
            },
            borderColor: '#999',
            borderRadius: 5,
            
            instance: instance,
            dbValue: dbValue,
            textValue: textValue,
            value : textValue,
            
            view_title : instance.label
        });
        
        if(instance.numVisibleFields > 1){
            widgetView.hintText = '#' + (index + 1) + " " + instance.label;
        }
        
        if(instance.can_edit){
            widgetView.addEventListener('click', function(e) {
                /*global setConditionallyRequiredLabels*/
                var i, postDialog;
                
                if(instance.settings.cardinality == -1){
                    

                        //for (jsa in e.source.itens) {
                        //    Ti.API.info(jsa + ' = ' + e.source.itens[jsa].title);
                        //}
                        //if (e.source.itens.length == 0) {
                        //    var dt = new Date(e.source.violation_time);
                        //    alert("No violations should be enforced at " + e.source.omadi_reference_title + " at " + date(omadi_time_format, dt) + " on " + weekday[dt.getDay()]);
                         //   return;
                        //}
                        Omadi.widgets.user_reference.getMultSelector(e.source);
                        //changedContentValue(e.source);
                        //noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                   
                }
                else{
                    //Ti.API.info('USPS: '+e.row.usps);
                    //e.source.value = e.row.usps;
                    postDialog = Titanium.UI.createOptionDialog();
                    postDialog.options = e.source.textOptions;
                    postDialog.cancel = -1;
                    postDialog.widgetView = e.source;
                    postDialog.show();
        
                    postDialog.addEventListener('click', function(ev) {
                        if (ev.index >= 0) {
                            ev.source.widgetView.title = ev.source.widgetView.textValue = ev.source.options[ev.index];
                            ev.source.widgetView.value = ev.source.widgetView.dbValue = ev.source.widgetView.options[ev.index].tid;
                        }
                        
                        if(ev.source.widgetView.check_conditional_fields.length > 0){
                
                            setConditionallyRequiredLabels(ev.source.widgetView.instance, ev.source.widgetView.check_conditional_fields);
                        }
                        //changedContentValue(e.source);
                        //noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                    });
                }
            });
        }
        

        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);
        
        if (PLATFORM == 'android') {
            widgetView.backgroundImage = '/images/textfield.png';
        }
        
        if (!instance.can_edit) {
            widgetView.backgroundImage = '';
            widgetView.backgroundColor = '#BDBDBD';
            widgetView.borderColor = 'gray';
            widgetView.borderRadius = 10;
            widgetView.color = '#848484';
            widgetView.paddingLeft = 3;
            widgetView.paddingRight = 3;
            
            if (PLATFORM == 'android') {
                widgetView.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
            }
        }
        
        return widgetView;

    },
    getOptions: function(instance){"use strict";
        var db, result, vid, options, name;
        db = Omadi.utils.openMainDatabase();
        
        Ti.API.debug(JSON.stringify(instance.settings));
        
        result = db.execute("SELECT username, realname, uid FROM user WHERE ((uid != 0) AND (uid != 1)) ORDER BY realname ASC");

        options = [];
        while (result.isValidRow()) {
            if (result.fieldByName('realname') == '') {
                name = result.fieldByName('username');
            }
            else {
                name = result.fieldByName('realname');
            }

            options.push({
                title : name,
                uid : result.fieldByName('uid')
            });

            result.next();
        }
        result.close();
        db.close();
        
        return options;
    },
    getMultSelector: function(buttonView){"use strict";
        
        var popupWin, opacView, coItemSelected, wrapperView, descriptionView, headerView, ico_sel, label_sel, listView, descriptionLabel, 
            i, color_set, color_unset, cancelButton, itemLabel, itemRow, bottomButtonsView, okButton, options, data, dbValues;
        
        if (PLATFORM == 'android') {
            Ti.UI.Android.hideSoftKeyboard();
            Ti.API.debug("hide keyboard in open_mult_selector");
        }
        
        color_set = "#246";
        color_unset = "#fff";
        
        popupWin = Ti.UI.createWindow({
            
        });
        
        opacView = Ti.UI.createView({
            left : 0,
            right : 0,
            top : 0,
            bottom : 0,
            backgroundColor : '#000000',
            opacity : 0.5
        });
        
        coItemSelected = 0;
        popupWin.add(opacView);
    
        wrapperView = Ti.UI.createView({
            backgroundColor : '#FFFFFF',
            left : '5%',
            right : '5%',
            height: Ti.UI.SIZE,
            borderRadius : 10,
            borderWidth : 2,
            borderColor : '#FFFFFF',
            opacity: 1
        });
        popupWin.add(wrapperView);
    
        headerView = Ti.UI.createView({
            top : 0,
            height : 50,
            backgroundColor : '#444'
        });
        wrapperView.add(headerView);
    
        label_sel = Ti.UI.createLabel({
            text : 'Select ' + buttonView.view_title,
            color : '#FFF',
            font : {
                fontSize : '18dp',
                fontWeight : 'bold'
            },
            left : 10,
            wordWrap : false,
            ellipsize : true
        });
        headerView.add(label_sel);
        
        options = buttonView.options;
        
        listView = Titanium.UI.createTableView({
            data : [],
            scrollable : true,
            options: options,
            top: 50,
            footerView: Ti.UI.createView({
                height: 125
            })
        });
        
        dbValues = buttonView.dbValue;
        
        for(i = 0; i < options.length; i ++){
            if(dbValues.indexOf(options[i].tid) != -1){
                options[i].selected = true;
            }
        }
    
        
    
        //elements_to_insert = [];
        
        // for (i = 0; i < buttonView.options.length; i ++) {
//             
            // //Ti.API.info(v_iten);
            // elements_to_insert.push({
                // title : buttonView.options[i].title,
                // v_info : buttonView.options[i].v_info,
                // desc : buttonView.options[i].desc,
                // is_set : buttonView.options[i].is_set
            // });
        // }
        
        data = [];
        
        for(i = 0; i < options.length; i ++){
    
            itemRow = Ti.UI.createTableViewRow({
                height : 30,
                title : options[i].title,
                selected : options[i].selected,
                tid : options[i].tid,
                description : options[i].description,
                backgroundColor : (options[i].selected ? color_set : color_unset),
                color: (options[i].selected ? '#fff' : '#000'),
                listView: listView
            });
    
            if (options[i].selected) {
                coItemSelected++;
            }
            data.push(itemRow);
        }
        
        listView.setData(data);
        
        wrapperView.add(listView);
    
        listView.addEventListener('click', function(e) {
            if (!e.rowData.selected) {
                e.rowData.selected = true;
                e.row.setBackgroundColor(color_set);
                e.row.setColor('#fff');
                coItemSelected++;
                //e.rowData.listView.options[e.index].selected = true;
            }
            else {
                e.rowData.selected = false;
                //listView.data[0].rows[e.index].backgroundColor = color_unset;
                e.row.setBackgroundColor(color_unset);
                e.row.setColor('#000');
                coItemSelected--;
                //e.rowData.listView.options[e.index].selected = false;
            }
    
            // if (coItemSelected == 1) {
                // if (buttonView.from_cond_vs != null && obj.from_cond_vs == true) {
                    // listView.height = '66.5%';
                    // descriptionLabel.visible = true;
                    // var i_sel;
                    // for ( i_sel = 0; i_sel < listView.data[0].rows.length; i_sel++) {
                        // if (listView.data[0].rows[i_sel].selected == true) {
                            // descriptionLabel.text = (listView.data[0].rows[i_sel].desc != null && listView.data[0].rows[i_sel].desc != "") ? listView.data[0].rows[i_sel].desc : 'No Description';
                            // break;
                        // }
                    // }
                // }
            // }
            // else if (coItemSelected > 1) {
                // if (obj.from_cond_vs != null && obj.from_cond_vs == true) {
                    // listView.height = '66.5%';
                    // descriptionLabel.visible = true;
                    // descriptionLabel.text = 'Multiple violations selected';
                // }
            // }
            // else if (coItemSelected == 0) {
                // if (obj.from_cond_vs != null && obj.from_cond_vs == true) {
                    // listView.height = '73%';
                    // descriptionLabel.visible = false;
                    // descriptionLabel.text = '';
                // }
            // }
    
            //Ti.API.info('Field set to ' + listView.data[0].rows[e.index].selected);
        });
        
        bottomButtonsView = Ti.UI.createView({
            bottom : 0,
            height : 70,
            width : '100%',
            backgroundColor : '#AAA'
        });
        
        descriptionView = Ti.UI.createView({
            width: '100%',
            height: Ti.UI.SIZE,
            backgroundColor: '#eee',
            borderColor: '#999',
            borderWidth: 1,
            bottom: 70
        });
        
        descriptionLabel = Titanium.UI.createLabel({
            ellipsize : false,
            wordWrap : true,
            font : {
                fontsize : 12
            },
            color : 'black',
            height : Ti.UI.SIZE,
            width: '100%',
            text: 'Description: None',
            left: 10,
            right: 10
        });
        
        descriptionView.add(descriptionLabel);
        wrapperView.add(descriptionView);
        
        wrapperView.add(bottomButtonsView);
    
        okButton = Ti.UI.createButton({
            title : 'OK',
            width : '40%',
            top : '3',
            bottom : '5',
            left : '6%',
            listView: listView
        });
        bottomButtonsView.add(okButton);
        
        okButton.addEventListener('click', function(e) {
            /*global setConditionallyRequiredLabels*/
            var i, aux_ret, valid_return, data, dbValues, textValue, textValues, listView;
            aux_ret = [];
            valid_return = [];
            dbValues = [];
            textValue = "- None -";
            textValues = [];

            listView = e.source.listView;
            
            //Ti.API.debug(JSON.stringify(data));

            for (i = 0; i < listView.data[0].rows.length; i++) {
                
                
                if (listView.data[0].rows[i].selected) {
                    
                   // Ti.API.debug(listView.data[0].rows[i].title);
                    // aux_ret.push({
                        // title : data[i].display,
                        // tid : data[i].v_info,
                        // desc : data[i].desc,
                        // selected : true
                    // });
                    
                    
                    
                    textValues.push(listView.data[0].rows[i].title);
                    dbValues.push(listView.data[0].rows[i].tid);
                    
                    // valid_return.push({
                        // title : data[i].title,
                        // tid : data[i].tid,
                        // desc : data[i].desc
                    // });
                }
                // else {
                    // aux_ret.push({
                        // title : data[i].title,
                        // tid : data[i].tid,
                        // desc : data[i].desc,
                        // selected : false
                    // });
                // }
            }
            
            if(textValues.length > 0){
                textValue = textValues.join(', ');
            }
    
            //if (valid_return.length == 0) {
            buttonView.dbValue = dbValues;
            buttonView.textValue = textValue;
            //buttonView.setText(textValue);
            buttonView.setTitle(textValue);
            
            
            if(buttonView.check_conditional_fields.length > 0){
                
                setConditionallyRequiredLabels(buttonView.instance, buttonView.check_conditional_fields);
            }
           // }
            // else {
                // buttonView.value = valid_return;
                // if (valid_return.length == 1) {
                    // buttonView.text = valid_return[0].title;
                    // if (obj.from_cond_vs != null && obj.from_cond_vs == true) {
                        // obj.descriptionLabel.visible = true;
                        // obj.descriptionLabel.text = (valid_return[0].desc != null && valid_return[0].desc != "") ? valid_return[0].desc : 'No Description';
                    // }
//     
                // }
                // else {
                    // obj.text = obj.view_title + " [" + valid_return.length + "]";
                    // if (obj.from_cond_vs != null && obj.from_cond_vs == true) {
                        // obj.descriptionLabel.visible = true;
                        // obj.descriptionLabel.text = 'Multiple violations selected';
                    // }
                // }
            // }
//     
            // obj.itens = aux_ret;
            popupWin.close();
    
        });
    
        cancelButton = Ti.UI.createButton({
            title : 'Cancel',
            width : '40%',
            top : '3',
            bottom : '5',
            right : '6%'
        });
        bottomButtonsView.add(cancelButton);
        cancelButton.addEventListener('click', function() {
            popupWin.close();
        });
    
        popupWin.open();
    }
};


                          
