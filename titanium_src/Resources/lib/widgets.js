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
            dbValues.push(Omadi.utils.trimWhiteSpace(children[i].dbValue));
        }
        else if(children[i].getChildren().length > 0){
            subChildren = children[i].getChildren();
            for(j = 0; j < subChildren.length; j ++){
                if(typeof subChildren[j].dbValue !== 'undefined'){
                    dbValues.push(Omadi.utils.trimWhiteSpace(subChildren[j].dbValue));
                }
                else if(subChildren[j].getChildren().length > 0){
                    subSubChildren = subChildren[j].getChildren();
                    for(k = 0; k < subSubChildren.length; k ++){
                        if(typeof subSubChildren[k].dbValue !== 'undefined'){
                            dbValues.push(Omadi.utils.trimWhiteSpace(subSubChildren[k].dbValue));
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
        
        instance.values = Omadi.widgets.getDBValues(wrapper);
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

        var labelView = Ti.UI.createLabel({
            text : ( instance.isRequired ? '*' : '') + instance.label,
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









