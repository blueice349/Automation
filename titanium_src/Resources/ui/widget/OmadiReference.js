/* jslint eqeq:true, plusplus: true */
/* jshint globalstrict:true */
'use strict';

var Utils = require('lib/Utils');
var Database = require('lib/Database');
var Display = require('lib/Display');
var Node = require('objects/Node');

function OmadiReferenceWidget(formObj, instance, fieldViewWrapper){
    this.formObj = formObj;
    this.instance = instance;
    this.fieldViewWrapper = fieldViewWrapper;
    this.conditionallyRequiredFields = this.formObj.affectsAnotherConditionalField(this.instance);
    this.formObj.addCheckConditionalFields(this.conditionallyRequiredFields);
    this.onChangeCallbacks = [];
    this.defaultFields = null;
    
    this._resetMemberVariables();
	
    this.numVisibleFields = 1;
    if (this.instance.settings.cardinality == -1) {
    	this.numVisibleFields = this.dbValues.length || 1;
    } else {
        this.numVisibleFields = this.instance.settings.cardinality;
    }
}

OmadiReferenceWidget.GREY = '#999';
OmadiReferenceWidget.GREEN = '#060';
OmadiReferenceWidget.RED = '#E00';

/* PUBLIC METHODS */

OmadiReferenceWidget.prototype.getFieldView = function(){
	try {
		if (this.fieldView === null) {
		    this.fieldView = Ti.UI.createView({
		       width: '100%',
		       layout: 'vertical',
		       height: Ti.UI.SIZE
		    });
		    
		    this.fieldView.add(this.formObj.getRegularLabelView(this.instance));
		    
		    // Add the actual fields
		    for (var i = 0; i < this.numVisibleFields; i++) {
		        this.fieldView.add(this._getWrapperView(i));
		        this.fieldView.add(this.formObj.getSpacerView());
		    }
		    
		    if (this.instance.settings.cardinality == -1) {
		        this.fieldView.add(this._getAddButton());
		        this.fieldView.add(this.formObj.getSpacerView());
		    }
		}
	    return this.fieldView;
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype.getFieldView: ' + error);
	}
};

OmadiReferenceWidget.prototype.redraw = function(){
	try {
	    var origFieldView = this.getFieldView();
	    this.formObj.formToNode();
	    this._resetMemberVariables();
	    var newFieldView = this.getFieldView();
	    
	    this.fieldViewWrapper.add(newFieldView);
	    this.fieldViewWrapper.remove(origFieldView);
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype.redraw: ' + error);
	}
};

/* PRIVATE METHODS */

OmadiReferenceWidget.prototype._resetMemberVariables = function() {
	try {
	    this.node = this.formObj.node;
	    this.dbValues = [];
	    this.textValues = [];
	    this.possibleValues = null;
	    this.nodeTypes = null;
	    this.addresses = null;
	    
	    this.fieldView = null;
	    this.addButton = null;
	    
	    this.cache = [];
	    this.nodeCache = {};
	    
	    this.nodeElement = this.node[this.instance.field_name] || null;
	    if (this.nodeElement) {
	        this.dbValues = this.nodeElement.dbValues || [];
	        this.textValues = this.nodeElement.textValues || [];
	    }
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._resetMemberVariables: ' + error);
	}
};

OmadiReferenceWidget.prototype._getCache = function(index) {
	try {
		if (!this.cache[index]) {
			this.cache[index] = {
				node: null,
				wrapperView: null,
				element: null,
				optionDialog: null,
				autoCompleteTable: null,
				addressLabel: null
			};
		}
		return this.cache[index];
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._getCache: ' + error);
	}
};

OmadiReferenceWidget.prototype._getWrapperView = function(index) {
	try {
		var cache = this._getCache(index);
		if (cache.wrapperView === null) {
			this._maybeSelectCurrentUserTruck(index);
			
			cache.wrapperView = Ti.UI.createView({
		        width: '100%',
		        height: Ti.UI.SIZE,
		        layout: 'vertical',
		        dbValue: this.dbValues[index],
		        textValue: this.textValues[index]
		    });
		    
		    
		    if (this.instance.widget.type == 'omadi_reference_select') {
		    	cache.wrapperView.add(this._getSelectElement(index));
		    } else {
		    	cache.wrapperView.add(this._getAutoCompleteElement(index));
		    	cache.wrapperView.add(this._getAutoCompleteTable(index));
		    }
		    cache.wrapperView.add(this._getAddressLabel(index));
		}
		return cache.wrapperView;
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._getWrapperView: ' + error);
	}
};

OmadiReferenceWidget.prototype._maybeSelectCurrentUserTruck = function(index) {
	try {
		var nodeTypes = this._getNodeTypes();
		if (nodeTypes.length == 1 && !this.dbValues[index] && this.instance.isRequired && nodeTypes[0] == 'company_vehicle'){
	        var vehicleNid = Utils.getCurrentVehicleNid();
	        if(vehicleNid > 0){
	            this.textValue[index] = Utils.getCurrentVehicleName();
	            this.dbValues[index] = vehicleNid;
	        }
	    }
    } catch(error) {
    	Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._maybeSelectCurrentUserTruck: ' + error);
    }
};

OmadiReferenceWidget.prototype._getSelectElement = function(index) {
	try {
		var cache = this._getCache(index);
		if (cache.element === null) {
			cache.element = this.formObj.getLabelField(this.instance);
		    cache.element.top = 1;
		    cache.element.bottom = 1;
		    cache.element.text = this.textValues[index];
		    
		    if (this.instance.can_edit) {
		    	cache.element.addEventListener('click', this._selectElementClicked.bind(this, index));
		    }
		}
		return cache.element;
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._getSelectElement: ' + error);
	}
};

OmadiReferenceWidget.prototype._selectElementClicked = function(index) {
	try {
		var optionDialog = this._getOptionDialog(index);
		optionDialog.show();
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._selectElementClicked: ' + error);
	}
};

OmadiReferenceWidget.prototype._getOptionDialog = function(index) {
	try {
		var cache = this._getCache(index);
		if (cache.optionDialog === null) {
			var possibleValues = this._getPossibleValues();
			var options = [];
		    for (var i = 0; i < possibleValues.length; i++) {
		        options.push(possibleValues[i].title);
		    }
		    
		    cache.optionDialog = Titanium.UI.createOptionDialog({
		    	options: options,
		    	cancel: -1
		    });
		    
		    cache.optionDialog.addEventListener('click', this._optionDialogClicked.bind(this, index));
		}
		return cache.optionDialog;
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._getOptionDialog: ' + error);
	}
};

OmadiReferenceWidget.prototype._optionDialogClicked = function(index, event) {
    try{
    	if (event.index < 0) {
    		return;
    	}
    	var element = this._getSelectElement(index);
    	
    	var possibleValues = this._getPossibleValues();
    	var nid = possibleValues[event.index].nid;
    	var title = possibleValues[event.index].title;
    	
    	element.text = title;
    	
    	this._setValues(index, nid, title);
    }
    catch(error){
        Utils.sendErrorReport("Error in OmadiReferenceWidget.prototype._optionDialogClicked: " + error);
    }
};

OmadiReferenceWidget.prototype._getAutoCompleteElement = function(index) {
	try {
		var cache = this._getCache(index);
		if (cache.element === null) {
			if (this.instance.settings.hidden_on_form) {
				cache.element = Ti.UI.createLabel({
		            text: this.textValues[index] || '- No Options -',
		            font: {
		                fontSize: 14
		            },
		            color: OmadiReferenceWidget.GREY
		        });
			} else {
				cache.element = this.formObj.getTextField(this.instance);
		        cache.element.value = this.textValues[index];
		        cache.element.autocapitalization = Ti.UI.TEXT_AUTOCAPITALIZATION_WORDS;
		        cache.element.lastValue = cache.element.value;
		        cache.element.lastChange = 0;
		        cache.element.touched = false;
		        cache.element.blurred = true;
		        cache.element.color = this.dbValues[index] > 0 ? OmadiReferenceWidget.GREEN : OmadiReferenceWidget.GREY;
		        
		        cache.element.addEventListener('focus', this._autoCompleteElementTouched.bind(this, index));
		        cache.element.addEventListener('click', this._autoCompleteElementTouched.bind(this, index));
		        cache.element.addEventListener('blur', this._hideAutoCompleteTable.bind(this, index));
		        cache.element.addEventListener('change', this._autoCompleteElementChanged.bind(this, index));
			}
		}
		return cache.element;
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._getAutoCompleteElement: ' + error);
	}
};

OmadiReferenceWidget.prototype._autoCompleteElementTouched = function(index) {
	try {
		this._getAutoCompleteElement(index).touched = true;
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._autoCompleteElementTouched: ' + error);
	}
};

OmadiReferenceWidget.prototype._autoCompleteElementBlurred = function(index) {
	try {
		this._hideAutoCompleteTable(index);
		
		var element = this._getAutoCompleteElement(index);
		element.blurred = true;
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._autoCompleteElementBlurred: ' + error);
	}
};

OmadiReferenceWidget.prototype._hideAutoCompleteTable = function(index) {
	try {
		var autoCompleteTable = this._getAutoCompleteTable(index);
		autoCompleteTable.borderWidth = 0;
		autoCompleteTable.height = 0;
		autoCompleteTable.setVisible(false);
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._hideAutoCompleteTable: ' + error);
	}
};

OmadiReferenceWidget.prototype._showAutoCompleteTable = function(index, data) {
	try {
		var autoCompleteTable = this._getAutoCompleteTable(index);
		autoCompleteTable.setData(data);
		autoCompleteTable.borderWidth = 1;
		autoCompleteTable.height = data.length * 38;
	    autoCompleteTable.setVisible(true);
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._showAutoCompleteTable: ' + error);
	}
};

OmadiReferenceWidget.prototype._setValues = function(index, dbValue, textValue) {
	try {
		var wrapper = this._getWrapperView(index);
		
		wrapper.dbValue = this.dbValues[index] = dbValue;
		wrapper.textValue = this.textValues[index] = textValue;
		
		this._updateAddressLabel(index, dbValue);
		
		if (index === 0) {
	    	this.formObj.setConditionallyRequiredLabels(this.instance, this.conditionallyRequiredFields);
	    	this._updateDefaultFieldValues();
	    }
	    
	    this._fireOnChangeCallbacks();
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._setValues: ' + error);
	}
};

OmadiReferenceWidget.prototype._autoCompleteElementChanged = function(index, event) {
	try{
		var element = this._getAutoCompleteElement(index);
		
		if (!element.touched) {
			// Don't autocomplete on programatically changed values.
			return;
		}
		
		var now = new Date().getTime();
		if (element.value === element.lastValue || now - element.lastChange < 20) {
			// Don't autocomplete if the value hasn't changed or the user is still typing.
			return;
		}
		
		element.lastChange = now;
		element.lastValue = element.value;
		
		if (element.value === '') {
			this._setValues(index, null, '');
			this._hideAutoCompleteTable(index);
			element.color = OmadiReferenceWidget.GREY;
			return;
		}
		
		var matches = this._getMatches(element.value);
		if (matches.length == 0) {
			// No matches found
			this._setValues(index, null, '');
			this._hideAutoCompleteTable();
			element.color = OmadiReferenceWidget.RED;
		} else if (matches[0].title.toUpperCase() == element.value.toUpperCase()) {
			// Perfect match found
			this._setValues(index, matches[0].nid, matches[0].title);
			element.color = OmadiReferenceWidget.GREEN;
			this._hideAutoCompleteTable();
		} else {
			// One or more matches found
			var tableData = [];
			for (var i = 0; i < matches.length; i++) {
				tableData.push(Ti.UI.createTableViewRow({
	                height : 38,
	                title : matches[i].title,
	                nid : matches[i].nid,
	                color : '#000'
	            }));
			}
			element.color = OmadiReferenceWidget.GREEN;
			this._showAutoCompleteTable(index, tableData);
		}
		
		if(element.blurred){
            element.blurred = false;
            this.formObj.scrollToField(event);
        }
    } catch (error) {
        Utils.sendErrorReport("Error in OmadiReferenceWidget.prototype._autoCompleteElementChanged: " + error);
    }
};

OmadiReferenceWidget.prototype._getMatches = function(value) {
	try {
		var matches = [];
		
		var regEx = new RegExp(String(value).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|'"]/g, "\\$&"), 'i');
		
		var possibleValues = this._getPossibleValues();
		for (var i = 0; i < possibleValues.length && matches.length < 4; i++) {
			if (possibleValues[i].title.search(regEx) != -1) {
				matches.push({
					title: possibleValues[i].title,
					nid: possibleValues[i].nid
				});
			}
		}
		
		return matches;
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._getMatches: ' + error);
	}
};

OmadiReferenceWidget.prototype._getAutoCompleteTable = function(index) {
	try {
		var cache = this._getCache(index);
		if (cache.autoCompleteTable === null) {
			cache.autoCompleteTable = Titanium.UI.createTableView({
	            height : 0,
	            backgroundColor : '#fff',
	            visible : false,
	            borderColor : '#000',
	            borderWidth : 0,
	            top : 0,
	            width: '92%'
	        });
	        
		    if (this.instance.can_edit) {
		    	cache.autoCompleteTable.addEventListener('click', this._autoCompleteTableClicked.bind(this, index));
		    }
		}
		return cache.autoCompleteTable;
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._getAutoCompleteTable: ' + error);
	}
};

OmadiReferenceWidget.prototype._autoCompleteTableClicked = function(index, event) {
    try{
    	var element = this._getAutoCompleteElement(index);
		
		element.setValue(event.rowData.title);
    	element.setColor(OmadiReferenceWidget.GREEN);
        
        if (Ti.App.isAndroid) {
        	// Make sure the cursor is at the end of the text
        	var len = element.getValue().length;
        	element.setSelection(len, len);
        }
        
    	this._hideAutoCompleteTable(index);
        this._setValues(index, event.rowData.nid, event.rowData.title);
    }
    catch(error){
        Utils.sendErrorReport("Error in OmadiReferenceWidget.prototype._autoCompleteTableClicked: " + error);
    }
};

OmadiReferenceWidget.prototype._getAddressLabel = function(index) {
	try {
		var cache = this._getCache(index);
		if (cache.addressLabel === null) {
			cache.addressLabel = Ti.UI.createLabel({
		    	text: '',
		        height: 0,
		        width: Ti.UI.FILL,
		        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		        color: '#666',
		        font: {
		            fontSize: 12
		        },
		        top: 0
		    });
		    
		    this._updateAddressLabel(index, this.dbValues[index]);
		    
		    cache.addressLabel.addEventListener('click', this._addressLabelClicked.bind(this, index));
		}
		return cache.addressLabel;
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._getAddressLabel: ' + error);
	}
};

OmadiReferenceWidget.prototype._updateAddressLabel = function(index, nid) {
	try {
		var addressLabel = this._getAddressLabel(index);
		
		if (nid > 0) {
			var addr = Node.getFirstStreetAddress(this._getNode(this.dbValues[index]));
			addressLabel.text = (addr ? addr + ' - ' : '') + 'touch to view';
			addressLabel.height = 20;
		} else {
			addressLabel.text = '';
			addressLabel.height = 0;
		}
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._updateAddressLabel: ' + error);
	}
};

OmadiReferenceWidget.prototype._getNode = function(nid) {
	try {
		if (!this.nodeCache[nid]) {
			this.nodeCache[nid] = Node.load(nid);
		}
		return this.nodeCache[nid];
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._getNode: ' + error);
	}
};

OmadiReferenceWidget.prototype._addressLabelClicked = function(index) {
	try{
		var nid = this.dbValues[index];
        if(nid > 0){
            var node = Node.load(nid);
            if(node){
				Ti.App.fireEvent('openViewWindow', {
					type: node.type,
					nid: node.nid,
					allowActions: false
				});
            }
        }
    }
    catch(error){
        Utils.sendErrorReport("Error in OmadiReferenceWidget.prototype._addressLabelClicked: " + error);
    }
};

OmadiReferenceWidget.prototype._getAddButton = function() {
	try {
		if (this.addButton === null) {
			this.addButton = Ti.UI.createButton({
	            title: ' Add another item ',
	            right: 15,
	            style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
	            backgroundGradient: Display.backgroundGradientGray,
	            borderColor: '#999',
	            borderWidth: 1,
	            width: Ti.UI.SIZE,
	            borderRadius: 10,
	            color: '#eee',
	            top: 10,
	            height: Ti.UI.SIZE
	        });
	        
	        this.addButton.addEventListener('click', this._addButtonClicked.bind(this));
		}
		return this.addButton;
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._getAddButton: ' + error);
	}
};

OmadiReferenceWidget.prototype._addButtonClicked = function() {
	try{
        this.numVisibleFields++;
        this.formObj.unfocusField();
        this.redraw();
    }
    catch(error){
        Utils.sendErrorReport("Error in OmadiReferenceWidget.prototype._addButtonClicked: " + error);
    }
};

OmadiReferenceWidget.prototype._getPossibleValues = function() {
	try {
		if (this.possibleValues === null) {
			try {
				this.possibleValues = [];
				this.possibleValues.push({
				    title : '- None -',
				    nid : null
				});
				
				var nodeTypes = this._getNodeTypes();
				if (nodeTypes.length > 0) {
				    var result = Database.query("SELECT title, nid FROM node WHERE table_name IN ('" + nodeTypes.join("','") + "')");
				
				    while (result.isValidRow()) {
				        this.possibleValues.push({
				            title: result.fieldByName('title'),
				            nid: result.fieldByName('nid')
				        });
				        result.next();
				    }
				    result.close();
				    Database.close();
				}
			} catch (error) {
				Utils.sendErrorReport("Error in OmadiReferenceWidget.prototype._getPossibleValues: " + error);
			}
		}
		return this.possibleValues;
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._getPossibleValues: ' + error);
	}
};

OmadiReferenceWidget.prototype._getNodeTypes = function() {
	try {
		if (this.nodeTypes === null) {
			try {
				this.nodeTypes = [];
				this.nodeTypes = Utils.getValues(this.instance.settings.reference_types);
			} catch (error) {
				Utils.sendErrorReport("Error in OmadiReferenceWidget.prototype._getNodeTypes: " + error);
			}
		}
		return this.nodeTypes;
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._getNodeTypes: ' + error);
	}
};

OmadiReferenceWidget.prototype._fireOnChangeCallbacks = function() {
	try {
		for (var i = 0; i < this.onChangeCallbacks.length; i++) {
			this.formObj[this.onChangeCallbacks[i].callback](this.onChangeCallbacks[i].args);
		}
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._fireOnChangeCallbacks: ' + error);
	}
};

OmadiReferenceWidget.prototype._getDefaultFields = function() {
	try {
		if (this.defaultFields === null) {
			this.defaultFields = [];
			
		    var instances = Node.getFields(this.formObj.type);
		    for (var fieldName in instances) {
		        var instance = instances[fieldName];
		        if (instance.settings.parent_form_default_value &&
		        	instance.settings.parent_form_default_value.parent_field &&
		        	instance.settings.parent_form_default_value.parent_field == this.instance.field_name) {
		        		
		            this.defaultFields.push({
		                target : fieldName,
		                source : instance.settings.parent_form_default_value.default_value_field
		            });
		        }
		    }
	    }
	    return this.defaultFields;
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._getDefaultFields: ' + error);
	}
};

OmadiReferenceWidget.prototype._updateDefaultFieldValues = function() {
	try {
		if (this.dbValues[0]) {
			var defaultFields = this._getDefaultFields();
			if (defaultFields.length > 0) {
				var sourceNode = Node.load(this.dbValues[0]);
				
				for (var i = 0; i < defaultFields.length; i++) {
					var targetValues = this.formObj.getFormFieldValues(defaultFields.target);
					var sourceValues = sourceNode[defaultFields.source];
					
					if (sourceValues && (!targetValues.dbValues || targetValues.dbValues.length == 0 || !targetValues.dbValues[0])) {
						this.formObj.setValues(defaultFields.target, sourceValues);
					}
				}
			}
		}
	} catch (error) {
		Utils.sendErrorReport('Error in OmadiReferenceWidget.prototype._updateDefaultFieldValues: ' + error);
	}
};

OmadiReferenceWidget.prototype.cleanUp = function(){
    this._resetMemberVariables();
};

exports.getFieldObject = function(FormObj, instance, fieldViewWrapper){
    return new OmadiReferenceWidget(FormObj, instance, fieldViewWrapper);
};


