Ti.include('/lib/functions.js');


Omadi.widgets = Omadi.widgets || {};

Ti.include('/lib/widgets/text_long.js');
Ti.include('/lib/widgets/text.js');
Ti.include('/lib/widgets/phone.js');
Ti.include('/lib/widgets/email.js');
Ti.include('/lib/widgets/link_field.js');
Ti.include('/lib/widgets/number_integer.js');
Ti.include('/lib/widgets/number_decimal.js');
Ti.include('/lib/widgets/omadi_reference.js');
Ti.include('/lib/widgets/vehicle_fields.js');
Ti.include('/lib/widgets/license_plate.js');
Ti.include('/lib/widgets/location.js');
Ti.include('/lib/widgets/taxonomy_term_reference.js');
Ti.include('/lib/widgets/user_reference.js');
Ti.include('/lib/widgets/list_boolean.js');
Ti.include('/lib/widgets/datestamp.js');

/*jslint eqeq: true, plusplus: true, nomen: true*/
/*global PLATFORM, Omadi*/


Omadi.widgets.getFieldView = function (node, instance){"use strict";
    var fieldView = null;
    
    
    switch(instance.type){
        case 'text':
            fieldView = Omadi.widgets.text.getFieldView(node, instance); break;
        case 'text_long':
            fieldView = Omadi.widgets.text_long.getFieldView(node, instance); break;
        case 'phone':
            fieldView = Omadi.widgets.phone.getFieldView(node, instance); break;
        case 'email':
            fieldView = Omadi.widgets.email.getFieldView(node, instance); break;
        case 'link_field':
            fieldView = Omadi.widgets.link_field.getFieldView(node, instance); break;
        case 'number_integer':
            fieldView = Omadi.widgets.number_integer.getFieldView(node, instance); break;
        case 'number_decimal':
            fieldView = Omadi.widgets.number_decimal.getFieldView(node, instance); break;
        case 'omadi_reference':
            fieldView = Omadi.widgets.omadi_reference.getFieldView(node, instance); break;
        case 'vehicle_fields':
            fieldView = Omadi.widgets.vehicle_fields.getFieldView(node, instance); break;
        case 'license_plate':
            fieldView = Omadi.widgets.license_plate.getFieldView(node, instance); break;
        case 'location':
            fieldView = Omadi.widgets.location.getFieldView(node, instance); break;
        case 'taxonomy_term_reference':
            fieldView = Omadi.widgets.taxonomy_term_reference.getFieldView(node, instance); break;
        case 'user_reference':
            fieldView = Omadi.widgets.user_reference.getFieldView(node, instance); break;
        case 'list_boolean':
            fieldView = Omadi.widgets.list_boolean.getFieldView(node, instance); break;
        case 'datestamp':
            fieldView = Omadi.widgets.datestamp.getFieldView(node, instance); break;
    }
    
    return fieldView;
};


var fieldFontSize = 16;
var fieldViews = {};
var labelViews = {};

Omadi.widgets.fontSize = 16;

Omadi.widgets.getDBValues = function(fieldWrapper){"use strict";
    var dbValues = [], i, j, k, children, subChildren, subSubChildren;
    
    children = fieldWrapper.getChildren();
    
    // Find the dbValue up to 3 levels deep in the UI elements
    
    for(i = 0; i < children.length; i ++){
        if(typeof children[i].dbValue !== 'undefined'){
            if(typeof children[i].dbValue === 'object' && children[i].dbValue instanceof Array){
                dbValues = children[i].dbValue;
            }
            else{
                dbValues.push(Omadi.utils.trimWhiteSpace(children[i].dbValue));
            }
        }
        else if(children[i].getChildren().length > 0){
            subChildren = children[i].getChildren();
            for(j = 0; j < subChildren.length; j ++){
                if(typeof subChildren[j].dbValue !== 'undefined'){
                    
                    if(typeof subChildren[j].dbValue === 'object' && subChildren[j].dbValue instanceof Array){
                        //Ti.API.debug(JSON.stringify(subChildren[j].dbValue));
                        dbValues = subChildren[j].dbValue;
                    }
                    else{
                        dbValues.push(Omadi.utils.trimWhiteSpace(subChildren[j].dbValue));
                    }
                }
                else if(subChildren[j].getChildren().length > 0){
                    subSubChildren = subChildren[j].getChildren();
                    for(k = 0; k < subSubChildren.length; k ++){
                        if(typeof subSubChildren[k].dbValue !== 'undefined'){
                            if(typeof subSubChildren[k].dbValue === 'object' && subSubChildren[k].dbValue instanceof Array){
                                dbValues = subSubChildren[k].dbValue;
                            }
                            else{
                                dbValues.push(Omadi.utils.trimWhiteSpace(subSubChildren[k].dbValue));
                            }
                        }
                    }
                }
            }
        }
    }
 
    return dbValues;
};

Omadi.widgets.getTextValues = function(fieldWrapper){"use strict";
    var textValues = [], i, j, k, children, subChildren, subSubChildren;
    
    children = fieldWrapper.getChildren();
    
    // Find the textValue up to 3 levels deep in the UI elements
    
    for(i = 0; i < children.length; i ++){
        if(typeof children[i].textValue !== 'undefined'){
            textValues.push(children[i].textValue);
        }
        else if(children[i].getChildren().length > 0){
            subChildren = children[i].getChildren();
            for(j = 0; j < subChildren.length; j ++){
                if(typeof subChildren[j].textValue !== 'undefined'){
                    textValues.push(subChildren[j].textValue);
                }
                else if(subChildren[j].getChildren().length > 0){
                    subSubChildren = subChildren[j].getChildren();
                    for(k = 0; k < subSubChildren.length; k ++){
                        if(typeof subSubChildren[k].textValue !== 'undefined'){
                            textValues.push(subSubChildren[k].textValue);
                        }
                    }
                }
            }
        }
    }
  
    return textValues;
};


Omadi.widgets.setValues = function(field_name, defaultValues){"use strict";
    var children, subChildren, subSubChildren, i, j, k, fieldWrapper, actualWidget;
    
    /*global fieldWrappers */
    
    fieldWrapper = fieldWrappers[field_name];
    children = fieldWrapper.getChildren();
    
    actualWidget = null;
    
    // Find the textValue up to 3 levels deep in the UI elements
    
    for(i = 0; i < children.length; i ++){
        Ti.API.info("what");
        if(typeof children[i].textValue !== 'undefined'){
            actualWidget = children[i];
            break;
        }
        else if(children[i].getChildren().length > 0){
            subChildren = children[i].getChildren();
            for(j = 0; j < subChildren.length; j ++){
                Ti.API.info("who");
                if(typeof subChildren[j].textValue !== 'undefined'){
                    actualWidget = subChildren[j];
                    break;
                }
                else if(subChildren[j].getChildren().length > 0){
                    subSubChildren = subChildren[j].getChildren();
                    for(k = 0; k < subSubChildren.length; k ++){
                        Ti.API.info("when");
                        if(typeof subSubChildren[k].textValue !== 'undefined'){
                            actualWidget = subSubChildren[k];
                            break;
                        }
                    }
                }
                if(actualWidget !== null){
                    break;
                }
            }
        }
        if(actualWidget !== null){
            break;
        }
    }
    
    if(actualWidget !== null){
    
        actualWidget.textValue = defaultValues.textValues[0];
        actualWidget.dbValue = defaultValues.dbValues[0];
        
        if(actualWidget.instance.type == 'taxonomy_term_reference'){
            actualWidget.setTitle(defaultValues.textValues[0]);
        }
        else{
            actualWidget.setValue(defaultValues.textValues[0]);
        }
    }
};

Omadi.widgets.shared = {
    redraw: function(instance){"use strict";
    /*global formToNode*/
        
        var fieldView, children, i, newFieldView, newFieldViewChildren, wrapper, node;
        Ti.API.debug(instance.numVisibleFields);
        
        node = formToNode();
        
        fieldView = instance.fieldView;
        children = fieldView.getChildren();
        
        wrapper = fieldView.wrapper;
        wrapper.startLayout();
        
        instance.dbValues = Omadi.widgets.getDBValues(wrapper);
        instance.textValues = Omadi.widgets.getTextValues(wrapper);
        
        newFieldView = Omadi.widgets.getFieldView(node, instance);
        
        //newFieldView = Omadi.widgets.text_long.getFieldView(node, instance);
        newFieldView.wrapper = wrapper;
        //newFieldViewChildren = newFieldView.getChildren();
       
        children = fieldView.wrapper.getChildren();
        
        wrapper.add(newFieldView);
        
        instance.fieldView = newFieldView;
        //var wrapper = fieldView.wrapper;
        
        for(i = children.length - 1; i >= 0; i --){
            wrapper.remove(children[i]);
        }
        
        // for(i = children.length - 1; i >= 0; i --){
            // fieldView.remove(children[i]);
        // }
        
        wrapper.finishLayout();
    }
};


Omadi.widgets.getSpacerView = function(){"use strict";
    return Ti.UI.createView({
        height: 10,
        width: '100%' 
    });  
};

Omadi.widgets.label = {
    color: "#4C5A88",
    getRegularLabelView: function(instance){"use strict";
        var labelText, labelView, nameParts, part;
        
        labelText = instance.label;
        
        if(instance.field_name.indexOf('___') !== -1){
            nameParts = instance.field_name.split('___');
            part = nameParts[1];
            if(typeof instance.settings.parts !== 'undefined'){
                labelText += " " + instance.settings.parts[part];
            }
        }
        
        labelView = Ti.UI.createLabel({
            text : ( instance.isRequired ? '*' : '') + labelText,
            color : instance.isRequired ? 'red' : this.color,
            font : {
                fontSize : fieldFontSize,
                fontWeight : 'bold'
            },
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            width : Ti.Platform.displayCaps.platformWidth - 30,
            touchEnabled : false,
            height : Ti.UI.SIZE
        });
        
        labelViews[instance.field_name] = labelView;
        
        return labelView;
    }
};


Omadi.widgets.getMultipleSelector = function(buttonView){"use strict";
        
    var popupWin, opacView, coItemSelected, wrapperView, descriptionView, headerView, ico_sel, label_sel, listView, descriptionLabel, 
        i, j, color_set, color_unset, cancelButton, itemLabel, itemRow, bottomButtonsView, okButton, options, data, dbValues;
    
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
        for(j = 0; j < dbValues.length; j ++){
            if(dbValues[j] == options[i].dbValue){
                options[i].selected = true;
            }
        }
    }

    
    data = [];
    
    for(i = 0; i < options.length; i ++){

        itemRow = Ti.UI.createTableViewRow({
            height : 30,
            title : options[i].title,
            selected : options[i].selected,
            dbValue : options[i].dbValue,
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
    
    //Ti.API.info("widget: " + JSON.stringify(buttonView.instance.settings));
    
    if(buttonView.instance.widget.indexOf('violation_select') !== -1){
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
    }
    
    wrapperView.add(bottomButtonsView);

    okButton = Ti.UI.createButton({
        title : 'OK',
        width : '40%',
        top : '3',
        bottom : '5',
        left : '6%',
        listView: listView,
        buttonView: buttonView
    });
    bottomButtonsView.add(okButton);
    
    okButton.addEventListener('click', function(e) {
        /*global setConditionallyRequiredLabels*/
        var i, aux_ret, valid_return, data, dbValues, textValue, textValues, listView;
        aux_ret = [];
        valid_return = [];
        dbValues = [];
        textValue = "";
        textValues = [];

        listView = e.source.listView;
        
        //Ti.API.debug(JSON.stringify(data));

        for (i = 0; i < listView.data[0].rows.length; i++) {
            
            
            if (listView.data[0].rows[i].selected) {
                
                textValues.push(listView.data[0].rows[i].title);
                dbValues.push(listView.data[0].rows[i].dbValue);
                
            }

        }
        
        if(textValues.length > 0){
            textValue = textValues.join(', ');
        }

        //if (valid_return.length == 0) {
        e.source.buttonView.dbValue = dbValues;
        e.source.buttonView.textValue = textValue;
        //buttonView.setText(textValue);
        e.source.buttonView.setTitle(textValue);
        
        
        if(e.source.buttonView.check_conditional_fields.length > 0){
            
            setConditionallyRequiredLabels(e.source.buttonView.instance, e.source.buttonView.check_conditional_fields);
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
};







