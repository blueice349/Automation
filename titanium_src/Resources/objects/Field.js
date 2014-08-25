/*jslint eqeq:true,nomen:true,plusplus:true*/

var Database = require('lib/Database');
var Utils = require('lib/Utils');

function Field(){"use strict";
    
}



exports.getFields = function(type) {"use strict";
    var db, result, instances, field_name, nameParts;
    try{
        instances = {};
        
        result = Database.query("SELECT type, field_name, label, description, bundle, weight, required, widget, settings, disabled, region, fid, can_view, can_edit FROM fields WHERE bundle = '" + type + "' and disabled = 0 ORDER BY weight");

        while (result.isValidRow()) {
            field_name = result.fieldByName('field_name');
            instances[field_name] = {
                type : result.fieldByName('type'),
                field_name : result.fieldByName('field_name'),
                label : result.fieldByName('label'),
                description : result.fieldByName('description'),
                bundle : result.fieldByName('bundle'),
                weight : result.fieldByName('weight'),
                required : result.fieldByName('required'),
                widget : result.fieldByName('widget'),
                settings : JSON.parse(result.fieldByName('settings')),
                disabled : result.fieldByName('disabled'),
                region : result.fieldByName('region'),
                fid : result.fieldByName('fid'),
                can_view : (result.fieldByName('can_view', Ti.Database.FIELD_TYPE_INT) === 1 ? true : false),
                can_edit : (result.fieldByName('can_edit', Ti.Database.FIELD_TYPE_INT) === 1 ? true : false)
            };

            if ( typeof instances[field_name].widget === 'string') {
                instances[field_name].widget = JSON.parse(instances[field_name].widget);
            }

            if (field_name.indexOf("___") !== -1) {
                nameParts = field_name.split("___");
                instances[field_name].part = nameParts[1];
                instances[field_name].partLabel = instances[field_name].settings.parts[nameParts[1]];
            }
            else {
                instances[field_name].part = null;
                instances[field_name].partLabel = null;
            }

            result.next();
        }
        result.close();
    }
    catch(ex){
        Utils.sendErrorReport("Exception getting fields: " + ex);
    }
        
    Database.close();

    return instances;
};