/*jslint eqeq:true, plusplus: true*/
/*global PLATFORM*/

Omadi.widgets.text_long = {
    
    
    getFieldView: function(instance){"use strict";
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
       
        //Add fields:
        //regionView.add(label[count]);
        //var reffer_index = count;
        Ti.API.debug(instance.numVisibleFields);
        
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
            element = Omadi.widgets.text_long.getNewElement(instance,  i);
            instance.elements.push(element);
            fieldView.add(element);
            fieldView.add(Omadi.widgets.getSpacerView());
        }
        
        if(settings.cardinality == -1){
            addAnotherItemButton = Ti.UI.createButton({
               title: 'Add another item',
               right: 15,
               instance: instance
            });
            
            addAnotherItemButton.addEventListener('click', function(e){
                var instance = e.source.instance;
                instance.numVisibleFields ++;
                Omadi.widgets.shared.redraw(instance);
            });
        
            fieldView.add(addAnotherItemButton);
            fieldView.add(Omadi.widgets.getSpacerView());
        }

    
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
            // }
            // else {
                // var decoded_values = new Array();
                // decoded_values[0] = field_arr[index_label][index_size].actual_value;
            // }
    
      
           Ti.API.info("do something here");    
        }
        
        
        //No data checkbox functionality
        //noDataCheckbox(reffer_index, regionView, top);
        //if (content[reffer_index].noDataView != null) {
        //    top += 40;
       // }
       
       //fieldViews[this.instance.field_name] = this.fieldView;
       
       //this.fieldView = fieldView;
       //this.initialized = true;
       
       return fieldView;
    },
    getNewElement: function(instance, index){"use strict";
        
        var settings, widgetView, dbValue, textValue;
        
        dbValue = (typeof instance.values !== 'undefined' && typeof instance.values[index] !== 'undefined') ? instance.values[index] : "";
        textValue = (typeof instance.textValues !== 'undefined' && typeof instance.textValues[index] !== 'undefined') ? instance.textValues[index] : "";
        
        settings = instance.settings;
        
        widgetView = Ti.UI.createTextArea({
            autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
            autocorrect: true,
            editable : instance.can_edit,
            enabled : instance.can_edit,
            ellipsize: false,
            hintText : instance.label,
            keepScreenOn: true,
            suppessReturn: false,
            borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            width : Ti.Platform.displayCaps.platformWidth - 30,
            height : 100,
            color : '#000000',
            font: {
                fontSize: Omadi.widgets.fontSize
            },
            returnKeyType : Ti.UI.RETURNKEY_DONE,
            
            instance: instance,
            dbValue: dbValue,
            textValue: textValue,
            value : textValue
                        
            // field_type : instance.type,
            // field_name : instance.field_name,
            // required : instance.required,
            // is_title : instance.is_title,
            // composed_obj : false,
            // cardinality : settings.cardinality,
            // reffer_index : reffer_index,
            // settings : settings,
            // changedFlag : 0,
            // real_ind : count
        });
        
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
    
        if (settings.min_length && settings.min_length != null && settings.min_length != "null") {
            widgetView.minLength = settings.min_length;
        }
        
        widgetView.addEventListener('change', function(e) {
            /*global setConditionallyRequiredLabels*/
            e.source.dbValue = e.source.value;
            e.source.textValue = e.source.value;
            
            if(e.source.check_conditional_fields.length > 0){
                setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
            }
            // changedContentValue(e.source);
            // noDataChecboxEnableDisable(e.source, e.source.reffer_index);
        });

        widgetView.addEventListener('blur', function(e) {
            //Ti.API.info(e.source.value.length + ' or ' + e.value.length + ' Field number ==> min: ' + e.source.myminLength + ' max: ' + e.source.mymaxLength);
            
            if (e.source.value != null && e.source.value != "") {
                if (e.source.minLength != null) {
                    if (parseInt(e.source.value.length, 10) < parseInt(e.source.minLength, 10)) {
                        var dialog = Titanium.UI.createAlertDialog({
                            title : 'Minimum Length',
                            message : 'The minimum characters for this field is ' + e.source.minLength,
                            buttonNames : ['OK']
                        });
                        dialog.addEventListener('click', function(evt) {
                            e.source.focus();
                        });
                        dialog.show();
                    }   
                }
            }
        });
        
        return widgetView;
    }
};
