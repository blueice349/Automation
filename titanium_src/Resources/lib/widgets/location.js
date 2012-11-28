/*jslint eqeq:true, plusplus: true*/
/*global PLATFORM,setConditionallyRequiredLabelForInstance,affectsAnotherConditionalField*/

Omadi.widgets.location = {
    
    // TODO: add validation for plate and state, remove spaces, capitalize all, don't send more than 10 chars
    //TODO: add number keyboard for zip code
    
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
              
        element = Omadi.widgets.location.getNewElement(node, instance,  0);
        instance.elements.push(element);
        fieldView.add(element);
        fieldView.add(Omadi.widgets.getSpacerView());

        
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
        
        var settings, widgetView, dbValue, textValue, part, nameParts, real_field_name, i, options, states;
        
        nameParts = instance.field_name.split('___');
        
        if (nameParts[1]) {
            part = nameParts[1];
            real_field_name = nameParts[0];
        }
        else {
            Ti.API.error("There should be parts to this location field!!!");
        }
        
        //i_name = i_name.charAt(0).toUpperCase() + i_name.slice(1);
        
        //if (part == "make") {
            //var _make_ref = reffer_index;
        //}
        
        //label[count].text += (' ' + i_name);
        
        
        if(part == 'province'){
            states = Omadi.widgets.location.getStates();
            dbValue = "";
            textValue = "- None -";
            if(typeof node[real_field_name] !== 'undefined'){
                if(typeof node[real_field_name].parts[part].textValue !== 'undefined'){
                    dbValue = node[real_field_name].parts[part].textValue;
                }
            }
            
            if(dbValue > ""){
                for(i = 0; i < states.length; i ++){
                    if(states[i].usps == dbValue){
                        textValue = states[i].title;
                        break;
                    }
                }
            }
            
        }
        else{
            
            dbValue = "";
            textValue = "";
            if(typeof node[real_field_name] !== 'undefined'){
                if(typeof node[real_field_name].parts[part].textValue !== 'undefined'){
                    dbValue = textValue = node[real_field_name].parts[part].textValue;
                }
            }
        }
        
        //node[real_field_name].parts[part]
        
        
        
        settings = instance.settings;
        Ti.API.debug("Creating location " + part + " field");
        
        if(part == 'province'){ // state
            
            
            options = [];
            
            for (i = 0; i < states.length; i ++) {
                options.push(states[i].title);
            }
            
            widgetView = Titanium.UI.createButton({
                //borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
                style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
                width : Ti.Platform.displayCaps.platformWidth - 30,
                options : options,
                states : states,
                title : textValue,
                height: 35,
                font : {
                    fontSize : Omadi.widgets.fontSize
                },
                color : '#000000',
                selectionIndicator : true,
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
                borderColor: '#999',
                borderRadius: 5,
                
                instance: instance,
                dbValue: dbValue,
                textValue: textValue,
                value : textValue,
                real_field_name: real_field_name
            });
            
            widgetView.addEventListener('click', function(e) {
                //Ti.API.info('USPS: '+e.row.usps);
                //e.source.value = e.row.usps;
                var postDialog = Titanium.UI.createOptionDialog();
                postDialog.options = e.source.options;
                postDialog.cancel = -1;
                postDialog.widgetView = e.source;
                postDialog.show();

                postDialog.addEventListener('click', function(ev) {
                    if (ev.index >= 0) {
                        ev.source.widgetView.title = ev.source.widgetView.textValue = ev.source.options[ev.index];
                        ev.source.widgetView.value = ev.source.widgetView.dbValue = ev.source.widgetView.states[ev.index].usps;
                    }
                    //changedContentValue(e.source);
                    //noDataChecboxEnableDisable(e.source, e.source.reffer_index);
                });
            });
        }
        else{
            widgetView = Ti.UI.createTextField({
                autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_ALL,
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
                value : textValue,
                real_field_name: real_field_name
            });
            
            widgetView.addEventListener('focus', function(e) {
                e.source.touched = true;
                //adjustView(e.source.my_index, e.source.regionView.top + e.source.top - ((PLATFORM == 'android') ? heightTextField : heightValue));
            });
            
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
        }

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
        
        return widgetView;

    },
    getStates: function(){"use strict";
        var states = [];
        states.push({
            title : " - None - ",
            usps : null
        });
        states.push({
            title : "Alabama",
            usps : "AL"
        });
        states.push({
            title : "Alaska",
            usps : "AK"
        });
        states.push({
            title : "Arizona",
            usps : "AZ"
        });
        states.push({
            title : "Arkansas",
            usps : "AR"
        });
        states.push({
            title : "California",
            usps : "CA"
        });
        states.push({
            title : "Colorado",
            usps : "CO"
        });
        states.push({
            title : "Connecticut",
            usps : "CT"
        });
        states.push({
            title : "Delaware",
            usps : "DE"
        });
        states.push({
            title : "Florida",
            usps : "FL"
        });
        states.push({
            title : "Georgia",
            usps : "GA"
        });
        states.push({
            title : "Hawaii",
            usps : "HI"
        });
        states.push({
            title : "Idaho",
            usps : "ID"
        });
        states.push({
            title : "Illinois",
            usps : "IL"
        });
        states.push({
            title : "Indiana",
            usps : "IN"
        });
        states.push({
            title : "Iowa",
            usps : "IA"
        });
        states.push({
            title : "Kansas",
            usps : "KS"
        });
        states.push({
            title : "Kentucky",
            usps : "KY"
        });
        states.push({
            title : "Louisiana",
            usps : "LA"
        });
        states.push({
            title : "Maine",
            usps : "ME"
        });
        states.push({
            title : "Maryland",
            usps : "MD"
        });
        states.push({
            title : "Massachusetts",
            usps : "MA"
        });
        states.push({
            title : "Michigan",
            usps : "MI"
        });
        states.push({
            title : "Minnesota",
            usps : "MN"
        });
        states.push({
            title : "Mississippi",
            usps : "MS"
        });
        states.push({
            title : "Missouri",
            usps : "MO"
        });
        states.push({
            title : "Montana",
            usps : "MT"
        });
        states.push({
            title : "Nebraska",
            usps : "NE"
        });
        states.push({
            title : "Nevada",
            usps : "NV"
        });
        states.push({
            title : "New Hampshire",
            usps : "NH"
        });
        states.push({
            title : "New Jersey",
            usps : "NJ"
        });
        states.push({
            title : "New Mexico",
            usps : "NM"
        });
        states.push({
            title : "New York",
            usps : "NY"
        });
        states.push({
            title : "North Carolina",
            usps : "NC"
        });
        states.push({
            title : "North Dakota",
            usps : "ND"
        });
        states.push({
            title : "Ohio",
            usps : "OH"
        });
        states.push({
            title : "Oklahoma",
            usps : "OK"
        });
        states.push({
            title : "Oregon",
            usps : "OR"
        });
        states.push({
            title : "Pennsylvania",
            usps : "PA"
        });
        states.push({
            title : "Rhode Island",
            usps : "RI"
        });
        states.push({
            title : "South Carolina",
            usps : "SC"
        });
        states.push({
            title : "South Dakota",
            usps : "SD"
        });
        states.push({
            title : "Tennessee",
            usps : "TN"
        });
        states.push({
            title : "Texas",
            usps : "TX"
        });
        states.push({
            title : "Utah",
            usps : "UT"
        });
        states.push({
            title : "Vermont",
            usps : "VT"
        });
        states.push({
            title : "Virginia",
            usps : "VA"
        });
        states.push({
            title : "Washington",
            usps : "WA"
        });
        states.push({
            title : "West Virginia",
            usps : "WV"
        });
        states.push({
            title : "Wisconsin",
            usps : "WI"
        });
        states.push({
            title : "Wyoming",
            usps : "WY"
        });
        states.push({
            title : "Other",
            usps : "-"
        });
        
        return states;
    }
};


                          
