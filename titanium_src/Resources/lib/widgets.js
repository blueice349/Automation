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

/*jslint eqeq: true, plusplus: true, nomen: true*/
/*global PLATFORM, Omadi*/


Omadi.widgets.getFieldView = function (node, instance){"use strict";
    var fieldView = null;
    
    if(instance.disabled == 0){
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
        }
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









