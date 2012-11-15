Omadi.data = Omadi.data || {};

Omadi.data.getBundle = function(type){
    "use strict";
    var db, result, bundle;
    
    db = Omadi.utils.openMainDatabase();
    result = db.execute('SELECT _data, display_name FROM bundles WHERE bundle_name="' + type + '"');
    
    if(result.isValidRow()){
        bundle = {
            type: type,
            data: JSON.parse(result.fieldByName('_data')),
            label: result.fieldByName('display_name')
        };
    }
    
    result.close();
    db.close();
    
    return bundle;
};

Omadi.data.getFields = function(type){
    "use strict";
    
    var db, result, instances, field_name;
    
    instances = {};
    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT label, type, field_name, settings FROM fields WHERE bundle = '" + type + "'");
    
    while(result.isValidRow()){
        field_name = result.fieldByName('field_name'); 
        instances[field_name] = {
            field_name: field_name,
            label: result.fieldByName('label'),
            type: result.fieldByName('type'),
            settings: JSON.parse(result.fieldByName('settings'))
        };
        result.next();   
    }
    result.close();
    db.close();
    
    return instances;
};
