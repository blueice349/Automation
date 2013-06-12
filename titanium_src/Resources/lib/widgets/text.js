/*jslint eqeq:true, plusplus: true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

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
    
        Ti.API.debug(instance.numVisibleFields);
        
        if(typeof instance.numVisibleFields === 'undefined'){
            
            if(settings.cardinality == -1){
                if(typeof node[instance.field_name] !== 'undefined' && node[instance.field_name].dbValues.length > 0){
                    instance.numVisibleFields = node[instance.field_name].dbValues.length;
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
        
        Ti.UI.currentWindow.addEventListener('close', function(){
            var i;
            
            for(i = 0; i < instance.elements.length; i ++){
                fieldView.remove(instance.elements[i]);
                instance.elements[i] = null;
            }
            
            instance.fieldView = null;
        });  
       
        return fieldView;
    },
    getNewElement: function(node, instance, index){"use strict";
        
        var settings, widgetView, dbValue, textValue;
        
        dbValue = "";
        textValue = "";
        if(typeof node[instance.field_name] !== 'undefined'){
            if(typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined'){
                dbValue = node[instance.field_name].dbValues[index];
            }
            
            if(typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[index] !== 'undefined'){
                textValue = node[instance.field_name].textValues[index];
            }
        }
        
        settings = instance.settings;
        Ti.API.debug("Creating text field");
        
        widgetView = Omadi.widgets.getTextField(instance);
        
        widgetView.dbValue = dbValue;
        widgetView.textValue = textValue;
        widgetView.setValue(textValue);
        widgetView.setAutocapitalization(Ti.UI.TEXT_AUTOCAPITALIZATION_WORDS);
        
        widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);
    
        if (settings.min_length && settings.min_length != null && settings.min_length != "null") {
            widgetView.minLength = settings.min_length;
        }
        
        if (settings.max_length && settings.max_length != null && settings.max_length != "null") {
            widgetView.maxLength = settings.max_length;
        }
        
        if (typeof settings.capitalization  !== null && settings.capitalization != null) {
            widgetView.capitalization = settings.capitalization;
        }
        
        widgetView.addEventListener('change', function(e) {
            /*global setConditionallyRequiredLabels*/
            
            Ti.API.debug("Change: " + e.source.value);
            
            if(e.source.lastValue != e.source.value){
                Ti.API.debug("text value changed: " + e.source.lastValue + " -> " + e.source.value);
                
                if(Ti.App.isAndroid && typeof e.source.maxLength !== 'undefined'){
                    if(e.source.value.length > e.source.maxLength){
                        Ti.API.debug("len text before set value");
                        e.source.value = e.source.value.substring(0, e.source.maxLength);
                        Ti.API.debug("len text setvalue");
                        
                        e.source.setSelection(e.source.value.length, e.source.value.length);
                        Ti.API.debug("len text setselection");
                    }
                }
                
                if(typeof e.source.capitalization !== 'undefined'){
                    if(e.source.capitalization == 'all_caps' && e.source.value !== null){
                        Ti.API.debug("cap text before set value");
                        e.source.value = (e.source.value + "".toString()).toUpperCase();
                        Ti.API.debug("cap text setvalue");
                        if(Ti.App.isAndroid){
                            e.source.setSelection(e.source.value.length, e.source.value.length);
                            Ti.API.debug("cap text setselection");
                        }
                    }
                }
           
                e.source.dbValue = e.source.value;
                e.source.textValue = e.source.value;
                
                if(e.source.check_conditional_fields.length > 0){
                    Ti.API.debug("text before conditional");
                    setConditionallyRequiredLabels(e.source.instance, e.source.check_conditional_fields);
                    Ti.API.debug("text after conditional");
                }
                
                e.source.lastValue = e.source.value;
                
                Ti.API.debug("text: End of change logic");
            }
        });
        
        return widgetView;
    }
};
