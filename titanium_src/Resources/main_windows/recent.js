/*jslint eqeq:true, plusplus: true*/ 

Ti.include('/lib/functions.js');
    
/*global Omadi*/

var curWin = Ti.UI.currentWindow;

function getRecentNodeData(){"use strict";
    var db, result, nodes = [];
    
    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT title, table_name, nid, viewed FROM node ORDER BY viewed DESC LIMIT 25");
    
    while(result.isValidRow()){
        
        nodes.push({
           title: result.fieldByName('title'),
           type: result.fieldByName('table_name'),
           nid: result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT),
           viewed: result.fieldByName('viewed', Ti.Database.FIELD_TYPE_INT)
        });
        
        result.next();
    }
    db.close();
    
    return nodes;
}

(function(){"use strict";
    var i, tableView, nodeData, row, titleLabel, tableData = [];
    
    nodeData = getRecentNodeData();
    
    tableView = Ti.UI.createTableView({
        width: '100%',
        bottom: 0
    });
    
    for(i = 0; i < nodeData.length; i ++){
        row = Ti.UI.createTableViewRow({
            width: '100%',
            height: Ti.UI.SIZE
        });
        
        titleLabel = Ti.UI.createLabel({
            text: nodeData[i].title 
        });
        
        row.add(titleLabel);
        
        tableData.add(row);
    }
    
    tableView.setData(tableData);
    
    curWin.add(tableView);
    
}());
