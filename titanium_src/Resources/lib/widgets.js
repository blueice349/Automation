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
Ti.include('/lib/widgets/image.js');
Ti.include('/lib/widgets/calculation_field.js');
Ti.include('/lib/widgets/rules_field.js');
Ti.include('/lib/widgets/auto_increment.js');
Ti.include('/lib/widgets/omadi_time.js');
Ti.include('/lib/widgets/file.js');
Ti.include('/lib/widgets/list_text.js');

/*jslint eqeq: true, plusplus: true, nomen: true*/
/*global  Omadi*/

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
        case 'image':
            fieldView = Omadi.widgets.image.getFieldView(node, instance); break;
        case 'calculation_field':
            fieldView = Omadi.widgets.calculation_field.getFieldView(node, instance); break;
        case 'rules_field':
            fieldView = Omadi.widgets.rules_field.getFieldView(node, instance); break;
        case 'auto_increment':
            fieldView = Omadi.widgets.auto_increment.getFieldView(node, instance); break;
        case 'omadi_time':
            fieldView = Omadi.widgets.omadi_time.getFieldView(node, instance); break;
        case 'file':
            fieldView = Omadi.widgets.file.getFieldView(node, instance); break;
        case 'list_text':
            fieldView = Omadi.widgets.list_text.getFieldView(node, instance); break;
    }
    
    return fieldView;
};


var fieldFontSize = 16;
var fieldViews = {};
var labelViews = {};

Omadi.widgets.fontSize = 16;

Omadi.widgets.getDBValues = function(fieldWrapper){"use strict";
    var dbValues = [], i, j, k, m, children, subChildren, subSubChildren, subSubSubChildren;
    
    children = fieldWrapper.getChildren();
    
    // Find the dbValue up to 4 levels deep in the UI elements
    // The only one going 4 levels deep is the image field with widget signature
    
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
                        else if(subSubChildren[k].getChildren().length > 0){
                            subSubSubChildren = subSubChildren[k].getChildren();
                            for(m = 0; m < subSubSubChildren.length; m ++){
                                if(typeof subSubSubChildren[m].dbValue !== 'undefined'){
                                    if(typeof subSubSubChildren[m].dbValue === 'object' && subSubSubChildren[m].dbValue instanceof Array){
                                        dbValues = subSubSubChildren[m].dbValue;
                                    }
                                    else{
                                        dbValues.push(Omadi.utils.trimWhiteSpace(subSubSubChildren[m].dbValue));
                                    }
                                }
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
    var textValues = [], i, j, k, m, children, subChildren, subSubChildren, subSubSubChildren;
    
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
                        else if(subSubChildren[k].getChildren().length > 0){
                            subSubSubChildren = subSubChildren[k].getChildren();
                            for(m = 0; m < subSubSubChildren.length; m ++){
                                if(typeof subSubSubChildren[m].textValue !== 'undefined'){
                                    textValues.push(subSubSubChildren[m].textValue);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    return textValues;
};

Omadi.widgets.setValueWidgetProperty = function(field_name, property, value, setIndex){"use strict";
    var i, j, k, m, children, subChildren, subSubChildren, subSubSubChildren;
    /*global fieldWrappers*/
    
    
    //TODO: currently, this does not support 4 levels deep, which is required for the signature fields
    
    if(typeof setIndex === 'undefined'){
        // setIndex == -1 means that the value should be set for all elements, even when there are multiples
        setIndex = -1;
    }
    
    if(typeof property === 'string'){
        property = [property];
    }
    
    // Android has a problem with an integer being set for a value or text... cast it to a string
    if(property[0] == 'value' || property[0] == 'text'){
        value = value + "".toString();
    }
    
    children = fieldWrappers[field_name].getChildren();
    
    if(setIndex == -1){
        for(i = 0; i < children.length; i ++){
            if(typeof children[i].dbValue !== 'undefined'){
               
                if(property.length == 1){
                    fieldWrappers[field_name].children[i][property[0]] = value;
                }
                else if(property.length == 2){
                    fieldWrappers[field_name].children[i][property[0]][property[1]] = value;
                }
            }
            
            if(children[i].getChildren().length > 0){
                subChildren = children[i].getChildren();
                for(j = 0; j < subChildren.length; j ++){
                    if(typeof subChildren[j].dbValue !== 'undefined'){
                        //Ti.API.debug(field_name + " " + property[0] + " sub children");
                        if(property.length == 1){
                            fieldWrappers[field_name].children[i].children[j][property[0]] = value;
                        }
                        else if(property.length == 2){
                            fieldWrappers[field_name].children[i].children[j][property[0]][property[1]] = value;
                        }
                    }
                    
                    if(subChildren[j].getChildren().length > 0){
                        subSubChildren = subChildren[j].getChildren();
                        for(k = 0; k < subSubChildren.length; k ++){
                            if(typeof subSubChildren[k].dbValue !== 'undefined'){
                                //Ti.API.debug(field_name + " " + property[0] + " sub sub children");
                                if(property.length == 1){
                                    //Ti.API.debug('value: ' + value);
                                    fieldWrappers[field_name].children[i].children[j].children[k][property[0]] = value;
                                }
                                else if(property.length == 2){
                                    fieldWrappers[field_name].children[i].children[j].children[k][property[0]][property[1]] = value;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    else{
        for(i = 0; i < children.length; i ++){
            if(typeof children[i].dbValue !== 'undefined'){
                if(i == setIndex){
                    if(property.length == 1){
                        fieldWrappers[field_name].children[i][property[0]] = value;
                    }
                    else if(property.length == 2){
                        fieldWrappers[field_name].children[i][property[0]][property[1]] = value;
                    }
                }
            }
            
            if(children[i].getChildren().length > 0){
                subChildren = children[i].getChildren();
                for(j = 0; j < subChildren.length; j ++){
                    if(typeof subChildren[j].dbValue !== 'undefined'){
                        if(j == setIndex){
                            if(property.length == 1){
                                fieldWrappers[field_name].children[i].children[j][property[0]] = value;
                            }
                            else if(property.length == 2){
                                fieldWrappers[field_name].children[i].children[j][property[0]][property[1]] = value;
                            }
                        }
                    }
                    
                    if(subChildren[j].getChildren().length > 0){
                        subSubChildren = subChildren[j].getChildren();
                        for(k = 0; k < subSubChildren.length; k ++){
                            if(typeof subSubChildren[k].dbValue !== 'undefined'){
                                if(k == setIndex){
                                    if(property.length == 1){
                                        fieldWrappers[field_name].children[i].children[j].children[k][property[0]] = value;
                                    }
                                    else if(property.length == 2){
                                        fieldWrappers[field_name].children[i].children[j].children[k][property[0]][property[1]] = value;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

Omadi.widgets.setValues = function(field_name, defaultValues){"use strict";
    //var children, subChildren, subSubChildren, i, j, k, fieldWrapper, actualWidget;
    
    /*global fieldWrappers, instances */
    
    Omadi.widgets.setValueWidgetProperty(field_name, ['textValue'], defaultValues.textValues[0]);
    Omadi.widgets.setValueWidgetProperty(field_name, ['dbValue'], defaultValues.dbValues[0]);
    
    if(instances[field_name].type == 'taxonomy_term_reference' || 
        (instances[field_name].type == 'omadi_reference' && instances[field_name].widget.type == 'omadi_reference_select')){
        Omadi.widgets.setValueWidgetProperty(field_name, ['text'], defaultValues.textValues[0]);
    }
    else{
        Omadi.widgets.setValueWidgetProperty(field_name, ['value'], defaultValues.textValues[0]);
    }
};

Omadi.widgets.getValueWidget = function(field_name){"use strict";
    var actualWidget = null, i, j, k, children, fieldWrapper, subChildren, subSubChildren;
    
    // TODO: currently this does not support 4 levels deep, which is required for the signature field
    
    if(typeof fieldWrappers[field_name] !== 'undefined'){
        fieldWrapper = fieldWrappers[field_name];
        
        if(typeof fieldWrapper.children !== 'undefined'){
            children = fieldWrapper.getChildren();
               
            for(i = 0; i < children.length; i ++){
                 
                if(typeof children[i].dbValue !== 'undefined'){
                    actualWidget = children[i];
                    break;
                }
                else if(children[i].getChildren().length > 0){
                    subChildren = children[i].getChildren();
                    for(j = 0; j < subChildren.length; j ++){
                        
                        if(typeof subChildren[j].dbValue !== 'undefined'){
                            actualWidget = subChildren[j];
                            break;
                        }
                        else if(subChildren[j].getChildren().length > 0){
                            subSubChildren = subChildren[j].getChildren();
                            for(k = 0; k < subSubChildren.length; k ++){
                                
                                if(typeof subSubChildren[k].dbValue !== 'undefined'){
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
        }
    }
    return actualWidget;
};

Omadi.widgets.blurFields = function(){"use strict";
    var field_name, widget;
    
    for(field_name in fieldWrappers){
        if(fieldWrappers.hasOwnProperty(field_name)){
            
            widget = Omadi.widgets.getValueWidget(field_name);
            
            if(widget instanceof Ti.UI.TextField || widget instanceof Ti.UI.TextArea){
                Ti.API.debug('is a textfield');
                widget.blur();
            }
        }
    }  
};

Omadi.widgets.shared = {
    redraw: function(instance){"use strict";
    /*global formToNode*/
        
        var fieldView, children, i, newFieldView, newFieldViewChildren, wrapper, node;
        
        Ti.API.debug("IN REDRAW");
        
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
            left: '4%',
            touchEnabled : false,
            height : Ti.UI.SIZE,
            width: '96%',
            ellipsize: true
        });
        
        labelViews[instance.field_name] = labelView;
        
        return labelView;
    }
};

Omadi.widgets.getLabelField = function(instance){"use strict";
    
    var labelView = Titanium.UI.createLabel({
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
        borderRadius : 10,
        borderColor : '#999',
        borderWidth : 1,
        color : '#000',
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        font : {
            fontSize : Omadi.widgets.fontSize
        },
        left: '4%',
        height: 35,
        width: '92%',
        
        // Android options
        ellipsize : true,
        wordWrap : false,
        
        // custom options
        instance : instance
    });
    
    if (!instance.can_edit) {
        labelView.setBackgroundGradient(null);
        labelView.setBackgroundColor('#ccc');
        labelView.setColor('#666');
    }
        
    return labelView;
};

Omadi.widgets.getTextField = function(instance){"use strict";
    
    var textField, now;
    
    now = new Date();
    
    textField = Ti.UI.createTextField({
        backgroundColor: '#fff',
        borderRadius: 10,
        borderColor: '#999',
        borderWidth: 1,
        textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
        left: '4%',
        height: 35,
        width: '92%',
        color: '#000',
        autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect: false,
        editable: instance.can_edit,
        enabled: instance.can_edit,
        font: {
            fontSize: Omadi.widgets.fontSize
        },
        returnKeyType: Ti.UI.RETURNKEY_DONE,
        
        // Android options
        keepScreenOn: true,
        ellipsize: false,
        focusable: true,
        
        // iOS options
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
        suppressReturn: true,
        
        // Custom variables
        instance: instance,
        lastChange: now.getTime()
    });
    
    if(Ti.App.isAndroid){
        textField.setHeight(Ti.UI.SIZE);
    }
    else{
        textField.setHeight(35);
    }

    if (!instance.can_edit) {
        
        textField.setBackgroundColor('#ccc');
        textField.setColor('#666');
        
        if (Ti.App.isAndroid) {
            textField.setSoftKeyboardOnFocus(Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS);
        }
        else{
            textField.setBorderStyle(Ti.UI.INPUT_BORDERSTYLE_NONE);
            textField.setPaddingLeft(7);
            textField.setPaddingRight(7);
        }
    }
    
    textField.addEventListener('focus', function(e){
        Omadi.widgets.currentlyFocusedField = e.source; 
    });
    
    //Ti.App.addEventListener('customCopy')
    
    return textField;
};


Omadi.widgets.getMultipleSelector = function(buttonView){"use strict";
        
    var popupWin, opacView, numItemsSelected, wrapperView, descriptionView, listView, descriptionLabel, 
        i, j, color_set, color_unset, cancelButton, itemLabel, itemRow, topButtonsView, okButton, options, data, dbValues, 
        descriptionText, selectedIndexes, screenHeight, listHeight, label;
    
    
    if(buttonView.instance.widget.type == 'violation_select' && buttonView.options.length == 0){
        alert("No violations are enforceable for a " + Ti.UI.currentWindow.type + " at the selected account and time.");
    }
    else{
        
        screenHeight = Ti.Platform.displayCaps.platformHeight;
        
        if (Ti.App.isAndroid) {
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
        
        numItemsSelected = 0;
        popupWin.add(opacView);
    
        wrapperView = Ti.UI.createView({
            backgroundColor : '#FFFFFF',
            left : '5%',
            right : '5%',
            height: Ti.UI.SIZE,
            borderRadius : 10,
            borderWidth : 2,
            borderColor : '#FFFFFF',
            opacity: 1,
            layout: 'vertical'
        });
        popupWin.add(wrapperView);
        
        options = buttonView.options;
        
        listHeight = options.length * 32;
        
        if(listHeight > screenHeight - 65){
        
            listHeight = screenHeight - 65;
        }
        
        listView = Titanium.UI.createTableView({
            data : [],
            scrollable : true,
            height: listHeight,
            options: options
        });
        
        //scrollView.add(listView);
        
        dbValues = buttonView.dbValue;
        
        for(i = 0; i < options.length; i ++){
            options[i].isSelected = false;
        }
        
        for(i = 0; i < options.length; i ++){
            for(j = 0; j < dbValues.length; j ++){
                if(dbValues[j] == options[i].dbValue){
                    options[i].isSelected = true;
                }
            }
        }
    
        
        data = [];
        selectedIndexes = [];
        
        for(i = 0; i < options.length; i ++){
            
            // This label must be added for the Android label color to change
            // Otherwise, setcolor is not defined for the row
            label = Ti.UI.createLabel({
                text: options[i].title,
                width: '100%',
                height: Ti.UI.FILL,
                color: (options[i].isSelected ? '#fff' : '#000'),
                left: 10,
                font: {
                    fontSize: 16,
                    fontWeight: 'bold'
                }
            });
            
            itemRow = Ti.UI.createTableViewRow({
                height : 30,
                isSelected : options[i].isSelected,
                dbValue : options[i].dbValue,
                textValue: options[i].title,
                description : options[i].description,
                backgroundColor : (options[i].isSelected ? color_set : color_unset),
                listView: listView,
                label: label
            });
            
            itemRow.add(label);
    
            if (options[i].isSelected) {
                numItemsSelected++;
                selectedIndexes.push(i);
            }
            data.push(itemRow);
        }
        
        listView.setData(data);
        
        listView.addEventListener('click', function(e) {
            // Ti.API.debug(e.row.isSelected);
            
            if (!e.row.isSelected) {
                e.rowData.listView.data[0].rows[e.index].isSelected = true;
                e.row.label.setColor('#fff');
                e.row.setBackgroundColor(color_set);
                
                numItemsSelected++;
                selectedIndexes.push(e.index);
                //e.rowData.listView.options[e.index].selected = true;
            }
            else {
                e.rowData.listView.data[0].rows[e.index].isSelected = false;
                //listView.data[0].rows[e.index].backgroundColor = color_unset;
                e.row.setBackgroundColor(color_unset);
                e.row.label.setColor('#000');
                numItemsSelected--;
                selectedIndexes.splice(selectedIndexes.indexOf(e.index), 1);
                //e.rowData.listView.options[e.index].selected = false;
            }
            
            if(descriptionLabel != null){
                if(numItemsSelected == 1){
                    //Ti.API.debug(selectedIndexes);
                    //Ti.API.debug(options);
                    if(options[selectedIndexes[0]].description > ""){
                        
                        descriptionText = options[selectedIndexes[0]].description;
                    }
                    else{
                        descriptionText = "";
                    }
                    
                }
                else if(numItemsSelected == 0){
                    descriptionText = "";
                }
                else{
                    descriptionText = "";
                }
                
                descriptionLabel.setText(descriptionText);
            }
        });
        
        topButtonsView = Ti.UI.createView({
            bottom: 0,
            height : 44,
            width : '100%',
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
                    color : '#ccc',
                    offset : 0.0
                }, {
                    color : '#999',
                    offset : 1.0
                }]
            }
        });
        
        //Ti.API.info("widget: " + JSON.stringify(buttonView.instance.settings));
        descriptionView = Ti.UI.createView({
            width: '100%',
            height: Ti.UI.SIZE,
            backgroundColor: '#eee',
            borderColor: '#999',
            borderWidth: 1
        });
            
        if(buttonView.instance.widget.type == 'violation_select'){
            
            if(numItemsSelected == 1){
                
                if(options[selectedIndexes[0]].description > ""){
                        
                    descriptionText = options[selectedIndexes[0]].description;
                }
                else{
                    descriptionText = "";
                }
            }
            else if(numItemsSelected == 0){
                descriptionText = "";
            }
            else{
                descriptionText = "";
            }
            
            descriptionLabel = Titanium.UI.createLabel({
                ellipsize : false,
                wordWrap : true,
                font : {
                    fontSize : 14
                },
                color : '#000',
                height : Ti.UI.SIZE,
                width: '100%',
                text: descriptionText,
                left: 10,
                right: 10
            });
            
            descriptionView.add(descriptionLabel);
        }
        
        okButton = Ti.UI.createButton({
            title : 'Done',
            top : 7,
            bottom : 7,
            right : 10,
            width: 80,
            height: 30,
            listView: listView,
            buttonView: buttonView,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            color: '#fff',
            borderRadius: 5,
            font: {
                fontSize: 14
            },
            borderWidth: 1,
            borderColor: '#555',
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
                    color : '#999',
                    offset : 0.0
                }, {
                    color : '#444',
                    offset : 1.0
                }]
            }
        });
        topButtonsView.add(okButton);
        
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
                
                
                if (listView.data[0].rows[i].isSelected) {
                    
                    textValues.push(listView.data[0].rows[i].textValue);
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
            e.source.buttonView.setText(textValue);
            
            if(descriptionLabel != null){                
                e.source.buttonView.descriptionLabel.setText(descriptionLabel.text);
            }
            
            
            if(e.source.buttonView.check_conditional_fields.length > 0){
                
                setConditionallyRequiredLabels(e.source.buttonView.instance, e.source.buttonView.check_conditional_fields);
            }

            popupWin.close();
    
        });
    
        cancelButton = Ti.UI.createButton({
            title : 'Cancel',
            width: 80,
            top : 7,
            bottom : 7,
            left : 10,
            height: 30,
            listView: listView,
            buttonView: buttonView,
            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            color: '#fff',
            borderRadius: 5,
            font: {
                fontSize: 14
            },
            borderWidth: 1,
            borderColor: '#555',
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
                    color : '#999',
                    offset : 0.0
                }, {
                    color : '#444',
                    offset : 1.0
                }]
            }
        });
        
        topButtonsView.add(cancelButton);
        cancelButton.addEventListener('click', function() {
            popupWin.close();
        });
        
        wrapperView.add(topButtonsView);
        wrapperView.add(descriptionView);
        wrapperView.add(listView);
        
        popupWin.open();
    }
   
};


