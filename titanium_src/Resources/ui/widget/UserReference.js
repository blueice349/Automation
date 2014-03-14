/*jslint eqeq:true, plusplus: true*/

var Widget, Omadi;
Widget = {};

function UserReferenceWidget(formObj, instance, fieldViewWrapper){"use strict";
    this.formObj = formObj;
    this.instance = instance;
    this.fieldView = null;
    this.node = formObj.node;
    this.dbValues = [];
    this.textValues = [];
    this.nodeElement = null;
    this.numVisibleFields = 1;
    this.fieldViewWrapper = fieldViewWrapper;
    
    if(typeof this.node[this.instance.field_name] !== 'undefined'){
        this.nodeElement = this.node[this.instance.field_name];
        
        if(typeof this.nodeElement.dbValues !== 'undefined' && this.nodeElement.dbValues != null){
            this.dbValues = this.nodeElement.dbValues;   
        }
        
        if(typeof this.nodeElement.textValues !== 'undefined' && this.nodeElement.textValues != null){
            this.textValues = this.nodeElement.textValues;
        }
    }
    
    if(this.instance.settings.cardinality > 1){
        this.numVisibleFields = this.instance.settings.cardinality;
    }
}

UserReferenceWidget.prototype.getFieldView = function(){"use strict";
    
    var i, element, addButton;
    
    this.fieldView = Ti.UI.createView({
       width: '100%',
       layout: 'vertical',
       height: Ti.UI.SIZE
    });
    
    this.fieldView.add(this.formObj.getRegularLabelView(this.instance));
    
    // Add the actual fields
    for(i = 0; i < this.numVisibleFields; i ++){
        element = this.getNewElement(i);
        this.fieldView.add(element);
        this.fieldView.add(this.formObj.getSpacerView());
    }
    
    return this.fieldView;
};

UserReferenceWidget.prototype.redraw = function(){"use strict";
    Ti.API.debug("in redraw");
    var origFieldView;
    
    this.formObj.formToNode();
        
    this.node = this.formObj.node;
    if(typeof this.node[this.instance.field_name] !== 'undefined'){
        this.nodeElement = this.node[this.instance.field_name];
        
        if(typeof this.nodeElement.dbValues !== 'undefined' && this.nodeElement.dbValues != null){
            this.dbValues = this.nodeElement.dbValues;   
        }
        
        if(typeof this.nodeElement.textValues !== 'undefined' && this.nodeElement.textValues != null){
            this.textValues = this.nodeElement.textValues;
        }
    }
    
    origFieldView = this.fieldView;
    
    this.getFieldView();
    
    origFieldView.hide();
    
    this.fieldViewWrapper.add(this.fieldView);
    this.fieldViewWrapper.remove(origFieldView);
};

UserReferenceWidget.prototype.getNewElement = function(index){"use strict";
    var dbValue, textValue, element, options, descriptionText, descriptionLabel, wrapper, i, loginDetails, textOptions;
    
    Ti.API.debug("Creating user reference field: " + this.instance.label);
    
    if (this.instance.settings.cardinality == -1) {
        dbValue = [];
        textValue = '- None -';
        
        if(this.nodeElement){
            
            dbValue = this.dbValues;
            textValue = this.textValues;
            
            if (textValue.length > 0) {
                textValue = textValue.join(', ');
            }
            else {
                textValue = "";
            }
        }

        if (dbValue.length == 0 && typeof this.instance.settings.default_value !== 'undefined' && this.instance.settings.default_value == "current_user") {
            loginDetails = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
            dbValue.push(loginDetails.user.uid);
            textValue = loginDetails.user.realname;
        }
    }
    else {
        dbValue = null;
        textValue = "";
        if(this.nodeElement){
            if(typeof this.dbValues[index] !== 'undefined'){
                dbValue = this.dbValues[index];
            }
            
            if(typeof this.textValues[index] !== 'undefined'){
                textValue = this.textValues[index];
            }
        }
    
        if (dbValue === null && typeof this.instance.settings.default_value !== 'undefined' && this.instance.settings.default_value == "current_user") {
            loginDetails = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
            dbValue = loginDetails.user.uid;
            textValue = loginDetails.user.realname;
        }
    }

    options = this.getOptions();
    textOptions = [];

    for ( i = 0; i < options.length; i++) {
        textOptions.push(options[i].title);
    }
    
    textOptions.push('- Cancel -');
    
    element = this.formObj.getLabelField(this.instance);
    element.setText(textValue);
    element.textValue = textValue;
    element.dbValue = dbValue;
    element.options = options;
    element.textOptions = textOptions;
    element.view_title = this.instance.label;
    
    element.check_conditional_fields = this.formObj.affectsAnotherConditionalField(this.instance);
    this.formObj.addCheckConditionalFields(element.check_conditional_fields);

    if (this.instance.can_edit) {
        element.addEventListener('click', function(e) {
            var i, postDialog;
            try{
                if (e.source.instance.settings.cardinality == -1) {
                    Widget[e.source.instance.field_name].formObj.getMultipleSelector(e.source);
                }
                else {
                    postDialog = Titanium.UI.createOptionDialog({
                        title: Widget[e.source.instance.field_name].formObj.labelViews[e.source.instance.field_name].text
                    });
                    
                    postDialog.options = e.source.textOptions;
                    postDialog.cancel = e.source.textOptions.length - 1;
                    postDialog.element = e.source;
                    postDialog.show();
    
                    postDialog.addEventListener('click', function(ev) {
                        try{
                            if (ev.index >= 0 && ev.index != ev.source.cancel) {
                                var textValue = ev.source.options[ev.index];
        
                                if (textValue == '- None -') {
                                    textValue = "";
                                }
                                ev.source.element.textValue = textValue;
                                ev.source.element.setText(textValue);
                                ev.source.element.value = ev.source.element.dbValue = ev.source.element.options[ev.index].dbValue;
                            }
        
                            if (ev.source.element.check_conditional_fields.length > 0) {
                                Widget[ev.source.element.instance.field_name].formObj.setConditionallyRequiredLabels(ev.source.element.instance, ev.source.element.check_conditional_fields);
                            }
                        }
                        catch(ex){
                            Omadi.service.sendErrorReport("Exception in user reference dialog click: " + ex);
                        }
                    });
                }
            }
            catch(ex){
                Omadi.service.sendErrorReport("Exception in user reference widget click: " + ex);
            }
        });
    }

    return element;
};

UserReferenceWidget.prototype.getOptions = function() {"use strict";
    var db, result, options, name, referenceable_roles, rid;

    options = [];
    referenceable_roles = [];

    // Get the right roles in the list
    for (rid in this.instance.settings.referenceable_roles) {
        if (this.instance.settings.referenceable_roles.hasOwnProperty(rid)) {
            referenceable_roles.push(this.instance.settings.referenceable_roles[rid]);
        }
    }

    if (referenceable_roles.length == 0) {
        referenceable_roles.push(3);
        referenceable_roles.push(4);
        referenceable_roles.push(5);
        referenceable_roles.push(6);
    }

    if (referenceable_roles.length > 0) {
        db = Omadi.utils.openMainDatabase();

        result = db.execute("SELECT u.username, u.realname, u.uid FROM user u JOIN user_roles r ON r.uid = u.uid WHERE u.uid NOT IN (0,1) AND u.status = 1 AND rid IN (" + referenceable_roles.join(",") + ") GROUP BY u.uid ORDER BY u.realname ASC");

        if (this.instance.settings.cardinality != -1 && this.instance.required == 0) {
            options.push({
                title : '- None -',
                dbValue : null
            });
        }

        while (result.isValidRow()) {
            if (result.fieldByName('realname') == '') {
                name = result.fieldByName('username');
            }
            else {
                name = result.fieldByName('realname');
            }

            options.push({
                title : name,
                dbValue : result.fieldByName('uid')
            });

            result.next();
        }
        result.close();
        db.close();
    }

    return options;
};


exports.getFieldObject = function(OmadiObj, FormObj, instance, fieldViewWrapper){"use strict";
    
    Omadi = OmadiObj;
    Widget[instance.field_name] = new UserReferenceWidget(FormObj, instance, fieldViewWrapper);
    
    return Widget[instance.field_name];
};


