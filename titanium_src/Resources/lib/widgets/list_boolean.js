/*jslint eqeq:true, plusplus: true*/
/*global PLATFORM,setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.list_boolean = {
    
    
    getFieldView: function(node, instance){"use strict";
        //this.base = Omadi.widgets.base.init(in_instance);
        instance.elements = [];
        
        var settings = instance.settings, wrapper, labelView, fieldView, i, j, element, addAnotherItemButton = null;
        
        wrapper = Ti.UI.createView({
            layout: 'vertical',
            height: Ti.UI.SIZE,
            width: Ti.Platform.displayCaps.platformWidth - 30
        });
        
        fieldView = Ti.UI.createView({
           width: '100%',
           layout: 'horizontal',
           height: Ti.UI.SIZE,
           instance: instance
        });
        
        instance.fieldView = fieldView;
        
        setConditionallyRequiredLabelForInstance(node, instance);
      
        instance.numVisibleFields = 1;
        
        element = Omadi.widgets.list_boolean.getNewElement(node, instance,  0);
        instance.elements.push(element);
        fieldView.add(element);
        
        labelView = Omadi.widgets.label.getRegularLabelView(instance);
        labelView.setWidth(labelView.width - 100);
        labelView.setEllipsize(false);
        labelView.setWordWrap(true);
        labelView.setHeight(Ti.UI.SIZE);
        
        fieldView.add(Ti.UI.createView({
            width: 10,
            height: 10
        }));
        fieldView.add(labelView);
        
        wrapper.add(fieldView);
        wrapper.add(Omadi.widgets.getSpacerView());
       
       return wrapper;
    },
    getNewElement: function(node, instance, index){"use strict";
        
        var settings, widgetView, dbValue, textValue;
        
        settings = instance.settings;
        
        dbValue = "0";
        textValue = "";
        if(typeof node[instance.field_name] !== 'undefined'){
            if(typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined'){
                dbValue = node[instance.field_name].dbValues[index];
            }
        }
        
        if(dbValue != 1){
            dbValue = "0";
        }
        
        textValue = dbValue;
        
        Ti.API.debug("Creating list_boolean field");

        widgetView = Titanium.UI.createView({
            width : 35,
            height : 35,
            borderRadius : 4,
            borderColor : '#333',
            borderWidth : 1,
            backgroundColor : '#FFF',
            enabled : true,
            
            instance: instance,
            dbValue: dbValue,
            textValue: textValue,
            value : dbValue
        });
        
        if(dbValue == 1){
            widgetView.setBackgroundImage('/images/selected_test.png');
        }
        
        //hintText : instance.label,
        
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
        
        widgetView.addEventListener('click', function(e) {
            /*global setConditionallyRequiredLabels*/
            
            if (e.source.value == 0) {
                e.source.setBackgroundImage('/images/selected_test.png');
                e.source.borderWidth = 2;
                e.source.value = true;
                e.source.dbValue = "1";
                e.source.textValue = "1";
            }
            else {
                e.source.setBackgroundImage(null);
                e.source.borderWidth = 1;
                e.source.value = false;
                e.source.dbValue = "0";
                e.source.textValue = "0";
            }
            
            if(e.source.check_conditional_fields.length > 0){
                setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
            }
            // changedContentValue(e.source);
            // noDataChecboxEnableDisable(e.source, e.source.reffer_index);
        });
        
        
        
        return widgetView;
    }
};


// 
// 
// if ((field_arr[index_label][index_size].actual_value === true ) || (field_arr[index_label][index_size].actual_value == "true") || (field_arr[index_label][index_size].actual_value == 1) || (field_arr[index_label][index_size].actual_value == '1'))
        // var vl_to_field = true;
    // else
        // var vl_to_field = false;
// 
    // // content[count] = Titanium.UI.createView({
        // // top : top,
        // // width : '30dp',
        // // height : '30dp',
        // // borderRadius : 4,
        // // borderColor : '#333',
        // // borderWidth : 1,
        // // backgroundColor : '#FFF',
        // // private_index : o_index,
        // // value : vl_to_field,
        // // field_type : field_arr[index_label][index_size].type,
        // // field_name : field_arr[index_label][index_size].field_name,
        // // enabled : true,
        // // required : field_arr[index_label][index_size].required,
        // // is_title : field_arr[index_label][index_size].is_title,
        // // composed_obj : false,
        // // cardinality : settings.cardinality,
        // // reffer_index : reffer_index,
        // // settings : settings,
        // // changedFlag : 0,
        // // enabled : true
    // // });
    // top += getScreenHeight() * 0.1;
// 
    // content[count].addEventListener('click', function(e) {
        // Ti.API.info("CLICK");
        // if (e.source.value === false) {
            // e.source.backgroundImage = '/images/selected_test.png';
            // e.source.borderWidth = 2;
            // e.source.value = true;
        // }
        // else {
            // e.source.backgroundImage = null;
            // e.source.borderWidth = 1;
            // e.source.value = false;
        // }
// 
        // Ti.API.info('Actual value = ' + e.source.value);
        // changedContentValue(e.source);
    // });
// 
    // regionView.add(content[count]);
    



