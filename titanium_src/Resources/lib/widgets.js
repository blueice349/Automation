Ti.include('/lib/functions.js');


Omadi.widgets = Omadi.widgets || {};

Ti.include('/lib/widgets/text_long.js');

/*jslint eqeq: true, plusplus: true, nomen: true*/
/*global PLATFORM, Omadi*/



var fieldFontSize = 16;

var fieldViews = {};
var labelViews = {};

Omadi.widgets.fontSize = 16;

Omadi.widgets.getDBValues = function(fieldWrapper){"use strict";
    var dbValues = [], i, j, children, subChildren;
    
    children = fieldWrapper.getChildren();
    
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
            }
        }
    }
 
    return dbValues;
};

Omadi.widgets.getTextValues = function(fieldWrapper){"use strict";
    var textValues = [], i, j, children, subChildren;
    
    children = fieldWrapper.getChildren();
    
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
            }
        }
    }
  
    return textValues;
};


Omadi.widgets.shared = {
  redraw: function(instance){"use strict";
        
        var fieldView, children, i, newFieldView, newFieldViewChildren, wrapper, node;
        Ti.API.debug(instance.numVisibleFields);
        
        node = formToNode();
        
        fieldView = instance.fieldView;
        children = fieldView.getChildren();
        
        wrapper = fieldView.wrapper;
        wrapper.startLayout();
        
        instance.values = Omadi.widgets.getDBValues(wrapper);
        instance.textValues = Omadi.widgets.getTextValues(wrapper);

        newFieldView = Omadi.widgets.text_long.getFieldView(node, instance);
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




Omadi.widgets.validateAll = function(){"use strict";
    var field_name;
    
    for(field_name in fieldViews){
        if(fieldViews.hasOwnProperty(field_name)){
            
            
            
        }
    }
};









