/*jslint eqeq:true, plusplus: true*/
/*global PLATFORM,setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.auto_increment = {
    
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
       
        instance.numVisibleFields = 1;
        
        element = Omadi.widgets.auto_increment.getNewElement(node, instance);
        instance.elements.push(element);
        fieldView.add(element);
        fieldView.add(Omadi.widgets.getSpacerView());
       
       return fieldView;
    },
    getNewElement: function(node, instance){"use strict";
        
        var settings, widgetView, dbValue, textValue, index;
        index = 0;
        dbValue = null;
        textValue = "";
        if(typeof node[instance.field_name] !== 'undefined'){
            if(typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined'){
                dbValue = node[instance.field_name].dbValues[index];
            }
            
            if(typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[index] !== 'undefined'){
                textValue = node[instance.field_name].textValues[index];
            }
        }
        
        if(dbValue === null){
            textValue = 'Save to generate';
        }
        
        settings = instance.settings;
        Ti.API.debug("Creating email field");
        
        widgetView = Ti.UI.createLabel({
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            width : Ti.Platform.displayCaps.platformWidth - 30,
            height: Ti.UI.SIZE,
            color : '#000000',
            font: {
                fontSize: Omadi.widgets.fontSize
            },
            
            instance: instance,
            dbValue: dbValue,
            textValue: textValue,
            text : textValue
        });
        
        return widgetView;
    }
};

