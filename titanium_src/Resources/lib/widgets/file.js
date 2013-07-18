/*jslint eqeq:true,plusplus:true*/
/*global setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Ti.include('/lib/widgets/video.js');

Omadi.widgets.file = {

    getFieldView : function(node, instance) {"use strict";
        instance.elements = [];

        var settings = instance.settings, fieldView, i, j, element, addAnotherItemButton = null;

        fieldView = Ti.UI.createView({
            width : '100%',
            layout : 'vertical',
            height : Ti.UI.SIZE,
            instance : instance
        });

        instance.fieldView = fieldView;

        fieldView.add(Omadi.widgets.label.getRegularLabelView(instance));
        setConditionallyRequiredLabelForInstance(node, instance);
        
        if(instance.widget.type == 'omadi_file_video'){
            // This is a video widget
            element = Omadi.widgets.video.getNewElement(node, instance);   
            
            instance.elements.push(element);
            fieldView.add(element);
            fieldView.add(Omadi.widgets.getSpacerView());
        }
        else{
           
            if ( typeof instance.numVisibleFields === 'undefined') {
    
                if (settings.cardinality == -1) {
                    if ( typeof node[instance.field_name] !== 'undefined' && node[instance.field_name].dbValues.length > 0) {
                        instance.numVisibleFields = node[instance.field_name].dbValues.length;
                    }
                    else {
                        instance.numVisibleFields = 1;
                    }
                }
                else {
                    instance.numVisibleFields = settings.cardinality;
                }
            }
    
            // Add the actual fields
            for ( i = 0; i < instance.numVisibleFields; i++) {
                element = Omadi.widgets.file.getNewElement(node, instance, i);
                if(element){
                    instance.elements.push(element);
                    fieldView.add(element);
                    fieldView.add(Omadi.widgets.getSpacerView());
                }
            }
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
    getNewElement : function(node, instance, index) {"use strict";
        var settings, widgetView, dbValue, textValue;

        dbValue = null;
        textValue = "- No file -";
        if ( typeof node[instance.field_name] !== 'undefined') {
            if ( typeof node[instance.field_name].dbValues !== 'undefined' && typeof node[instance.field_name].dbValues[index] !== 'undefined') {
                dbValue = node[instance.field_name].dbValues[index];
            }

            if ( typeof node[instance.field_name].textValues !== 'undefined' && typeof node[instance.field_name].textValues[index] !== 'undefined') {
                textValue = node[instance.field_name].textValues[index];
            }
        }
        
        if(index == 0 || dbValue !== null){
            settings = instance.settings;
            Ti.API.debug("Creating file field");
    
            widgetView = Omadi.widgets.getLabelField(instance);
            
            widgetView.dbValue = dbValue;
            widgetView.textValue = textValue;
            widgetView.setText(textValue);
            widgetView.textAlign = Ti.UI.TEXT_ALIGNMENT_LEFT;
            widgetView.backgroundColor = 'transparent';
            widgetView.backgroundGradient = null;
            widgetView.borderWidth = 0;
            widgetView.font.fontWeight = 'bold';
            widgetView.borderColor = 'transparent';
            widgetView.borderRadius = 0;
            widgetView.borderStyle = null;
            widgetView.height = 40;
            
            if(Omadi.display.getFileViewType(textValue) !== null){
                widgetView.addEventListener('click', function(e){
                    Omadi.display.displayFile(e.source.nid, e.source.dbValue, e.source.textValue);
                });
                widgetView.color = '#369';
            }
            else{
                widgetView.color = '#999';
            }
            
            widgetView.nid = node.nid;
            widgetView.height = Ti.UI.SIZE;
           
            widgetView.check_conditional_fields = affectsAnotherConditionalField(instance);
            
            return widgetView;
        }
        return null;
    }
};
