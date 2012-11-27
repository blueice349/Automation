/*jslint eqeq:true, plusplus: true*/
/*global PLATFORM,setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.text = {
    
    
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
       
        //Add fields:
        //regionView.add(label[count]);
        //var reffer_index = count;
        Ti.API.debug(instance.numVisibleFields);
        
        if(typeof instance.numVisibleFields === 'undefined'){
            
            if(settings.cardinality == -1){
                if(typeof node[instance.field_name] !== 'undefined' && node[instance.field_name].values.length > 0){
                    instance.numVisibleFields = node[instance.field_name].values.length;
                }
                else{
                    instance.numVisibleFields = 1;
                }
            }
            else{
                instance.numVisibleFields = settings.cardinality;
            }
        }
        
        // Add the actual fields
        for(i = 0; i < instance.numVisibleFields; i ++){
            //widgetView = this._getUIComponent(instance); 
            element = Omadi.widgets.text.getNewElement(node, instance,  i);
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
    getNewElement: function(node, instance, index){"use strict";
        
        var settings, widgetView, dbValue, textValue;
        
        dbValue = "";
        textValue = "";
        if(typeof node[instance.field_name] !== 'undefined'){
            if(typeof node[instance.field_name].values !== 'undefined' && typeof node[instance.field_name].values[index] !== 'undefined'){
                dbValue = node[instance.field_name].values[index];
            }
            
            if(typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[index] !== 'undefined'){
                textValue = node[instance.field_name].textValues[index];
            }
        }
        
        settings = instance.settings;
        Ti.API.debug("Creating text field");
        
        
        widgetView = Ti.UI.createTextField({
            autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_WORDS,
            autocorrect: false,
            editable : instance.can_edit,
            enabled : instance.can_edit,
            ellipsize: false,
            keepScreenOn: true,
            suppessReturn: false,
            borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            width : Ti.Platform.displayCaps.platformWidth - 30,
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
        
        if(instance.numVisibleFields > 1){
            widgetView.hintText = '#' + (index + 1) + " " + instance.label;
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
        
        return widgetView;
    }
};
