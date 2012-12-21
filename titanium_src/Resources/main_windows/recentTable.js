/*jslint eqeq:true, plusplus: true*/ 

Ti.include('/lib/functions.js');
    
/*global Omadi*/

var curWin = Ti.UI.currentWindow;

function getRecentNodeData(orderField){"use strict";
    var db, result, nodes = [];
    
    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT title, table_name, nid, viewed, changed FROM node ORDER BY " + orderField + " DESC LIMIT 40");
    
    while(result.isValidRow()){
        
        nodes.push({
           title: result.fieldByName('title'),
           type: result.fieldByName('table_name'),
           nid: result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT),
           changed: result.fieldByName('changed', Ti.Database.FIELD_TYPE_INT),
           viewed: result.fieldByName('viewed', Ti.Database.FIELD_TYPE_INT),
           timestamp: result.fieldByName(orderField, Ti.Database.FIELD_TYPE_INT)
        });
        
        result.next();
    }
    db.close();
    
    return nodes;
}


function getTableView(orderField){"use strict";
    var i, tableView, nodeData, row, titleLabel, rowImg, tableData = [], timeLabel, backgroundColor;

    nodeData = getRecentNodeData(orderField);
    
    tableView = Ti.UI.createTableView({
        width: '100%',
        bottom: 0,
        top: 0,
        scrollable: true
    });
    
    // if(Ti.App.isAndroid){
        // tableView.top = 0;
    // }
    // else{
        // tableView.top = 45;
    // }
    
    for(i = 0; i < nodeData.length; i ++){
        backgroundColor = '#eee';
        if(nodeData[i].viewed > 0){
            backgroundColor = '#fff';
        }
        
        row = Ti.UI.createTableViewRow({
            width: '100%',
            height: 45,
            nid: nodeData[i].nid,
            backgroundColor: backgroundColor
        });
        
        rowImg = Ti.UI.createImageView({
            defaultImage: '/images/icons/settings.png',
            image: '/images/icons/' + nodeData[i].type + ".png",
            left: 0,
            top: 5,
            width: '10%',
            height: 35
        });
        
        titleLabel = Ti.UI.createLabel({
            width: '90%',
            text: nodeData[i].title,
            textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
            right: 0,
            top: 4,
            font: {
                fontSize: 16
            },
            ellipsize: true,
            wordWrap: true
        });
        
        timeLabel = Ti.UI.createLabel({
            text: (orderField == 'viewed' ? 'Viewed ' : 'Saved ') + Omadi.utils.getTimeAgoStr(nodeData[i].timestamp),
            bottom: 4,
            right: 0,
            width: '90%',
            textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
            color: '#999',
            font: {
                fontSize: 14
            },
            ellipsize: true,
            wordWrap: true
        });
        
        row.add(rowImg);
        row.add(titleLabel);
        row.add(timeLabel);
        
        tableData.push(row);
    }
    
    tableView.addEventListener('click', function(e) {
        
        if(e.row.nid == 0){
            //search.setValue("");
            //search.fireEvent("change");
            //search.blur();
            //search.fireEvent("cancel");
            //search.fireEvent("return");
        }
        else{
           
           Omadi.display.showDialogFormOptions(e, e.row.nid);
        }
        //resultsNames.close();
    });
    
    tableView.setData(tableData);
    
    return tableView;
}


(function(){"use strict";
    var tableView;
    
    tableView = getTableView('viewed');  
    
    curWin.add(tableView);
}());


