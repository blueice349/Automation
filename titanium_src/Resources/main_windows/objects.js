/*jslint eqeq:true, plusplus: true*/ 

Ti.include('/lib/functions.js');
	
/*global Omadi*/

var bundle,
curWin,
search,
instances,
filterValues,
filterFields, 
win_new;

var filterTableView;
var itemsPerPage = 40;
var numPagesLoaded = 0;
 var showFinalResults = false;
 var tableData = [];
 var loadingMoreLabel, loadingMoreView;
 var num_records = -1;
 var titleSearch = "";
 var settingTableData = false;

curWin = Ti.UI.currentWindow;
curWin.setBackgroundColor('#eee');

Ti.App.addEventListener('loggingOut', function(){"use strict";
    Ti.UI.currentWindow.close();
});

Ti.App.addEventListener("savedNode", function(){"use strict";
    if(Ti.App.isAndroid){
        Ti.UI.currentWindow.close();
    }
    else{
        Ti.UI.currentWindow.hide();
        // Close the window after the maximum timeout for a node save
        setTimeout(Ti.UI.currentWindow.close, 65000);
    }
});



// function openEditScreen(part, nid, e){
	// "use strict";
// //Next window to be opened
	// // var win_new = create_or_edit_node.getWindow();
	// // win_new.title = bundle.label;
	// // win_new.type = curWin.type;
	// // win_new.listView = curWin.listView;
	// // win_new.up_node = curWin.up_node;
	// // win_new.uid = curWin.uid;
	// // win_new.region_form = part;
// // 
	// // //Passing parameters
	// // win_new.nid = nid;
	// // win_new.nameSelected =  e.row.name;
// // 
	// // //Sets a mode to fields edition
	// // win_new.mode = 1;
// // 
	// // win_new.open();
	// // setTimeout(function() {
		// // create_or_edit_node.loadUI();
	// // }, 100);
// }



function sortByTitle(a, b) {
	"use strict";
	if (a.title < b.title){
		return -1;
	}
	if (a.title > b.title){
		return 1;
	}
	return 0;
}

function windowOpened(e){
	"use strict";
	
	Ti.API.info("window opened");
	//search.blur();
	//if(Ti.App.isAndroid){
		//Ti.UI.Android.hideSoftKeyboard();
	//}
	//Ti.API.debug("hide keyboard in windowOpened");
	
	//setTimeout(function(){
		//search.blur();
		//Ti.API.info("window 1 second passed");
		//search.setFocusable(true);
	//}, 1000);
}
	
function backButtonPressed(e){
     "use strict"; 
     //Ti.API.info("Went to final results: " + e.source.showFinalResults);
     if(Ti.App.isAndroid){
         if(!e.source.showFinalResults && filterValues.length){
            filterValues.pop();
         }
     }
     
     Ti.UI.currentWindow.close();
}
 
function homeButtonPressed(e){
    "use strict";
     var thisWin = Ti.UI.currentWindow, i;
     
     if(typeof thisWin.nestedWindows !== 'undefined'){
        for(i = 0; i < thisWin.nestedWindows.length; i += 1){
            thisWin.nestedWindows[i].close();
        }
     }
     
     Ti.UI.currentWindow.close();
}

// function getFinalResults(filterFields, filterValues){
//     
// }

function getDataSQL(getCount){"use strict";
    var lastFilterField, sql, field_name, i, filterValue, conditions;
    
    conditions = [];
    
    if(filterValues.length < filterFields.length && !showFinalResults){
        lastFilterField = filterFields[filterValues.length];
        
        Ti.API.debug("Filtering by " + lastFilterField.field_name);
        
        if(typeof lastFilterField.field_name !== 'undefined'){
            field_name = lastFilterField.field_name;
            sql = "SELECT DISTINCT " + field_name + " AS value FROM " + curWin.type + " type  INNER JOIN node n ON n.nid = type.nid";
        }
        else{
            if(getCount){
                sql = "SELECT COUNT(*) FROM node n INNER JOIN " + curWin.type + " type ON type.nid = n.nid ";
            }
            else{
                sql = "SELECT n.title, n.nid, n.viewed FROM node n INNER JOIN " + curWin.type + " type ON type.nid = n.nid ";
            }
            showFinalResults = true;
        }
    }
    else{//(filterValues.length == filterFields.length){
        if(getCount){
            sql = "SELECT COUNT(*) FROM node n INNER JOIN " + curWin.type + " type ON type.nid = n.nid ";
        }
        else{
            sql = "SELECT n.title, n.nid, n.viewed FROM node n INNER JOIN " + curWin.type + " type ON type.nid = n.nid ";
        }
        
        showFinalResults = true;
    }
    
    if(filterFields.length > 0){
        for(i = 0; i < filterFields.length; i ++){
            //Ti.API.info(i);
            field_name = filterFields[i].field_name;
            //Ti.API.info("FILTER FIELD NAME: " + field_name);
            
            if(typeof filterValues[i] != 'undefined' && filterValues[i].value !== false){
                Ti.API.info("FILTER VALUE BELOW: " + i + ": " + filterValues[i].value );
                filterValue = filterValues[i].value;
                
                // Show all results with filters applied
                if(filterValue === null){
                    conditions.push(field_name + ' IS NULL');
                }
                else if(filterValue === ""){
                    conditions.push(field_name + " = ''");
                }
                else{
                    conditions.push(field_name + ' = ' + filterValue);
                }   
            }
        }
    }
    
    if(typeof titleSearch === 'string' && titleSearch.length > 0){
        conditions.push("n.title LIKE '%" + titleSearch + "%'");
    }
    
    if(conditions.length > 0){
        sql += " WHERE ";
        sql += conditions.join(" AND ");
    }
    
    if(showFinalResults){
        sql += " ORDER BY ";
        
        if(typeof bundle.data.mobile !== 'undefined' && typeof bundle.data.mobile.sort_field !== 'undefined'){
            sql += "n." + bundle.data.mobile.sort_field + " " + bundle.data.mobile.sort_direction;
        }
        else{
            sql += "n.title ASC";
        }
        
        sql += " LIMIT " + itemsPerPage + " OFFSET " + (itemsPerPage * numPagesLoaded);
    }
    
    Ti.API.info("FILTER SQL: " + sql);
    
    return sql;
}



function setTableData(){"use strict";
    
    var lastFilterField, field_name, sql, i, filterValue, row, titleParts, label1, label2,
        db, db_result, title, separator, whiteSpaceTest, backgroundColor, numTitleRows, fullWidth,
        text_values, text_value, values, safeValues, subResult, tableIndex, resultCount, appendData, 
        countSQL;
    
    tableIndex = 0;
    appendData = [];
    
    sql = getDataSQL();
    
    if(showFinalResults){
        db = Omadi.utils.openMainDatabase();
        
        if(numPagesLoaded === 0){
            countSQL = getDataSQL(true);
            db_result = db.execute(countSQL);
            num_records = db_result.field(0, Ti.Database.FIELD_TYPE_INT);
            db_result.close();
        }
        
        db_result = db.execute(sql);
        
        resultCount = 0;
        while(db_result.isValidRow()){
            resultCount ++;
            
            //Ti.API.info("FILTER FINAL RESULT: " + db_result.fieldByName('nid'));
            //Ti.API.info("FILTER FINAL RESULT: " + db_result.fieldByName('title'));
            
            title = db_result.fieldByName('title');
            title = Omadi.utils.trimWhiteSpace(title);
            
            if(title.length == 0){
                title = '- No Title -';
            }
            
            separator = ' - ';
            if(typeof bundle.data.title_fields !== 'undefined' && typeof bundle.data.title_fields.separator !== 'undefined'){
                separator = bundle.data.title_fields.separator;
            }
            
            whiteSpaceTest = Omadi.utils.trimWhiteSpace(separator);
            backgroundColor = '#eee';
            if(db_result.fieldByName('viewed') > 0){
                backgroundColor = '#fff';
            }
            
            row = Ti.UI.createTableViewRow({
                hasChild: false,
                searchValue: db_result.fieldByName('title'),
                color: '#000',
                nid: db_result.fieldByName('nid'),
                backgroundColor: backgroundColor
            });
            
            if(whiteSpaceTest.length > 0){
                titleParts = title.split(separator);
                numTitleRows = Math.ceil(titleParts.length / 2);
                fullWidth = (titleParts.length === 1);
                
                for(i = 0; i <= numTitleRows; i ++){
                    
                    // Add label1 before label2 so the white background will go over the right label if it's extra long
                    label1 = Ti.UI.createLabel({
                        height : 20,
                        text : titleParts[i*2],
                        color: '#000',
                        top: (i * 20 + 5),
                        left: 5,
                        zIndex: 1,
                        width: (fullWidth ? '100%' : '45%'),
                        font: {fontSize: 14},
                        wordWrap: false,
                        ellipsize: true
                    });
                    
                    row.add(label1);
                    
                    if(typeof titleParts[i*2+1] != 'undefined'){
                        label2 = Ti.UI.createLabel({
                            height : 20,
                            text : titleParts[i*2+1],
                            color: '#666',
                            top: (i * 20 + 5),
                            left: '54%',
                            width: '45%',
                            font: {fontSize: 14},
                            wordWrap: false,
                            ellipsize: true
                        });
                        
                        row.add(label2);
                    }
                }
                row.height = (numTitleRows * 20) + 10;
    
            }
            else{
                row.height = 50;
                row.title = row.searchValue;
            }
            
            appendData[tableIndex] = row;
            tableIndex++;
            
            db_result.next();
        }
        db_result.close();
        db.close();
    }
    else{
        
        text_values = [];
        values = [];
        
        db = Omadi.utils.openMainDatabase();
        db_result = db.execute(sql);
        
        while(db_result.isValidRow()){
            
            values.push(db_result.fieldByName('value'));
            
            Ti.API.info("FILTER: " + db_result.fieldByName('value'));
            
            db_result.next();
        }
        db_result.close();
        
        
        
        sql = "SELECT ";
        
        lastFilterField = filterFields[filterValues.length];
        
        safeValues = [];
        
        for(i = 0; i < values.length; i ++){
            if(values[i] > ''){
                safeValues.push(values[i]);
            }
            else{
                text_values[values[i]] = '- Not Set -';
            }
        }
        

        //db = Omadi.utils.openMainDatabase();
        
        if(lastFilterField.type == 'taxonomy_term_reference'){
            subResult = db.execute("SELECT tid AS value, name AS text_value FROM term_data WHERE tid IN (" + safeValues.join(",") + ")");
            while(subResult.isValidRow()){
                text_values[subResult.fieldByName('value')] = subResult.fieldByName('text_value');          
                //Ti.API.info("FILTER: " + subResult.fieldByName('text_value'));
                subResult.next();
            }
            
            subResult.close();
        }
        else if(lastFilterField.type == 'omadi_reference'){
            subResult = db.execute("SELECT nid AS value, title AS text_value FROM node WHERE nid IN (" + safeValues.join(",") + ")");
            while(subResult.isValidRow()){
                text_values[subResult.fieldByName('value')] = subResult.fieldByName('text_value');          
                //Ti.API.info("FILTER: " + subResult.fieldByName('text_value'));
                subResult.next();
            }
            
            subResult.close();
        }
        else if(lastFilterField.type == 'user_reference'){
            subResult = db.execute("SELECT uid AS value, realname AS text_value FROM user WHERE uid IN (" + safeValues.join(",") + ")");
            while(subResult.isValidRow()){
                text_values[subResult.fieldByName('value')] = subResult.fieldByName('text_value');          
                //Ti.API.info("FILTER: " + subResult.fieldByName('text_value'));
                subResult.next();
            }
            
            subResult.close();
        }
        else if(lastFilterField.field_name == 'form_part'){
            
            if (bundle.data.form_parts != null && bundle.data.form_parts != "") {
                Ti.API.info('Form table part = ' + bundle.data.form_parts.parts.length);
                if (bundle.data.form_parts.parts.length > 0) {
                    for(i in bundle.data.form_parts.parts){
                        if(bundle.data.form_parts.parts.hasOwnProperty(i)){
                            text_values[i] = bundle.data.form_parts.parts[i].label;
                        }
                        //Ti.API.info("FILTER: " + bundle.data.form_parts.parts[i].label);
                    }
                }
            }
        }
        db.close();
    
        tableIndex = 0;
        for(i = 0; i < values.length; i ++){
        
            //var text_value = '- Empty - ';
            //if(value > 0){
            text_value = text_values[values[i]];
            //}
            
            appendData[tableIndex] = Ti.UI.createTableViewRow({
                height : 50,
                hasChild : true,
                title : text_value,
                color: '#000',
                filterValue: values[i],
                filterValueText: text_value,
                backgroundColor: '#fff'
            });
            tableIndex++;
        }   
        
        if(field_name != 'form_part'){
            appendData.sort(sortByTitle);
        }
    }
    
   // Ti.API.debug("Num possible: " + (numPagesLoaded + 1) * itemsPerPage);
    Ti.API.debug("Num Records: " + num_records);
    
    if(showFinalResults){
        if(num_records <= (numPagesLoaded + 1) * itemsPerPage){
            filterTableView.setFooterTitle(null);
        }
        else{
            filterTableView.setFooterTitle("Loading More Rows...");
        }
   }
    
    
    if(numPagesLoaded === 0){
        filterTableView.setData(appendData);
    }
    else{
        filterTableView.appendRow(appendData);
    }
}
	

(function(){"use strict";
	/*global Omadi*/
	/*jslint vars: true*/
	
	var i, filterField, field_name, db, db_result, sql, lastFilterField;
    
    
    filterTableView = Titanium.UI.createTableView({
        separatorColor: '#BDBDBD',
        top: 60,
        height: Ti.UI.SIZE,
        data: [],
        backgroundColor: '#eee'
    }); 
	
	Omadi.data.setUpdating(true);
	
	bundle = Omadi.data.getBundle(curWin.type);
	instances = Omadi.data.getFields(curWin.type);
	
	Ti.API.info("OPENED NEW LIST WINDOW");
	
	curWin.orientationModes = [Titanium.UI.PORTRAIT];
	curWin.setBackgroundColor("#eee");
    curWin.addEventListener('android:back', backButtonPressed);
	
	filterValues = curWin.filterValues;
	
	if(typeof filterValues !== "object"){
        filterValues = [];
    }

	filterFields = [];
	
	if (typeof bundle.data.mobile !== 'undefined' && typeof bundle.data.mobile.filters !== 'undefined' && typeof bundle.data.mobile.filters.fields !== 'undefined' && bundle.data.mobile.filters.fields.length > 0) {
		
		for(i in bundle.data.mobile.filters.fields){
		    if(bundle.data.mobile.filters.fields.hasOwnProperty(i)){
  
                field_name = bundle.data.mobile.filters.fields[i].field_name;
                
                if(field_name === 'form_part'){
                    filterFields.push({
                        label: 'Form Part',
                        type: 'metadata',
                        field_name: 'form_part'
                    });
                }
                else{
                    filterFields.push(instances[field_name]);
                }
            }
		}
	}
	
	Ti.API.debug("Filter Fields: " + JSON.stringify(filterFields));

	if(typeof curWin.showFinalResults != 'undefined'){
		showFinalResults = curWin.showFinalResults;
	}
	
	if(Ti.App.isAndroid){
	    filterTableView.top = 45;
	}

	filterTableView.addEventListener('scroll', function(e){
	    if(Ti.App.isAndroid){
	        if(!settingTableData && e.firstVisibleItem > (itemsPerPage * numPagesLoaded)){
	            settingTableData = true;
                numPagesLoaded ++;
                setTableData();
                settingTableData = false;
	        }
	    } 
	    else{
	        Ti.API.debug(e.contentOffset.y + " " + e.contentSize.height);
	        if(!settingTableData && e.contentOffset.y + (Ti.Platform.displayCaps.getPlatformHeight() * 3) > e.contentSize.height){
	            settingTableData = true;
	            numPagesLoaded ++;
	            setTableData();
	            
	            // Add in a small delay for the contentSize.height to catchup with rendering
	            // If this isn't here, 3-5 pages will be loaded at once
	            setTimeout(function(){
	                settingTableData = false;
	            }, 4000);
	        }
	    }
	});
	
	setTableData();
	
	var topBar = Titanium.UI.createView({
	   backgroundColor:'#666',
	   top: 0,
	   height: 45
	});
	
	
	var labelText = '';
	if(Ti.Platform.osname == 'iphone'){
		labelText += 'Found (' + num_records + ')';
	}
	else{
		labelText += bundle.label + " List " + (showFinalResults ? '(' + num_records + ')' : '');
	}
	
	var listLabel = Ti.UI.createLabel({
		font: {fontWeight: "bold", fontSize: 16},
		text: labelText,
		textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
		color: '#ccc'
	});
	
	if(Ti.App.isAndroid){
		listLabel.top = 4;
		listLabel.left = 10;
	}
	
	var showAllButton = Ti.UI.createButton({
		title: 'Show All',
		top: 5,
		right: 10,
		width: 100,
		height: 35,
		style: (Ti.App.isIOS ? Titanium.UI.iPhone.SystemButtonStyle.BORDERED : ''),
		backgroundGradient: {
	        type: 'linear',
	        startPoint: { x: '50%', y: '0%' },
	        endPoint: { x: '50%', y: '100%' },
	        colors: [ { color: '#ccc', offset: 0.0}, { color: '#ddd', offset: 0.25 }, { color: '#aaa', offset: 1.0 } ]
	   },
	   borderRadius: 5, 
	   color: '#000'
	});
	
	if(showFinalResults){
	    
	    search = Ti.UI.createSearchBar({
            hintText : 'Search...',
            autocorrect : false,
            barColor : '#666',
            color: 'black',
            height: 50,
            focusable: false
        });
	}
	
	var barHeight;
	
	if(Ti.App.isAndroid){
	    
	    topBar.add(listLabel); // IMPORTANT!! This took way too long to figure out... Do not add this to iOS, or the app will crash at random
		
		if(showFinalResults){
			barHeight = 30;
		}
		else{
			barHeight = 45;
		}
	}
	else{
		barHeight = 40;
	}
	
	if(filterValues.length){
		var filterLabelParts = [];
		for(i = 0; i < filterValues.length; i ++){
			if(typeof filterValues[i] != 'undefined' && filterValues[i].value !== false){
				Ti.API.info(filterValues[i].text);
				
				var filterLabelText = filterFields[i].label + ": ";
				if(filterValues[i].text == ""){
					filterLabelText += "- Not Set -";
				}
				else{
					filterLabelText += filterValues[i].text;
				}
				filterLabelParts.push(filterLabelText);	
			}
		}
		
		var filterLabel = Ti.UI.createLabel({
		  color:'#fff',
		  text: filterLabelParts.join("\n"),
		  textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
		  font: {fontSize: 12}
		});
		
		if(showFinalResults){
			filterLabel.top = 5;
			filterLabel.right = 10;
			if(Ti.App.isAndroid){
				barHeight = 15 + (filterValues.length * 14);
			}
		}
		else{
			filterLabel.top = 25;
			if(Ti.App.isAndroid){
				filterLabel.left = 10;
			}
			else{
				filterLabel.left = 80;
			}
			
			if(Ti.App.isAndroid){
				barHeight = 30 + (filterValues.length * 14);
				if(barHeight < 45){
					barHeight = 45;
				}
			}
		}
		
		topBar.add(filterLabel);
		topBar.height = barHeight;
		filterTableView.top = barHeight;
	}
	
	/*** ADD the IOS top navigation bar ***/
	if(Ti.App.isIOS){
		
		// var iOSBackButton = Ti.UI.createButton({
			// title : 'Back',
			// style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
			// top: 10,
			// left: 10,
			// height: 40,
			// backgroundGradient: {
	        // type: 'linear',
		        // startPoint: { x: '50%', y: '0%' },
		        // endPoint: { x: '50%', y: '100%' },
		        // colors: [ { color: '#ccc', offset: 0.0}, { color: '#ddd', offset: 0.25 }, { color: '#aaa', offset: 1.0 } ],
		   // },
		   // borderRadius: 5, 
		   // color: '#000',
		   // width: 60
		// });
		// iOSBackButton.addEventListener('click', function() {
			// curWin.close();
		// });
		// topBar.add(iOSBackButton);
		// listLabel.left = 80;
		
		
		
		var back = Ti.UI.createButton({
			title : 'Back',
	        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
		});
		
		back.addEventListener('click', function() {
			backButtonPressed();
		});
		
		var homeButton = Ti.UI.createButton({
			title : 'Home',
	        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
		});
		
		homeButton.addEventListener('click', function() {
			homeButtonPressed();
		});
		
		var space = Titanium.UI.createButton({
			systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
		});
		
		var items = [];
		
		var plusButton =  Titanium.UI.createButton({
			backgroundImage: '/images/plus_btn.png',
			backgroundSelectedImage: '/images/plus_btn_selected.png',
			width:54,
			height:38,
			right: 1,
			is_plus: true
		});
		
		plusButton.addEventListener('click', function() {
			Omadi.display.openFormWindow(curWin.type, 'new', 0);
		}); 
		
		items.push(back);
		
		if(filterValues.length > 0){
			items.push(homeButton);
		}
		
		listLabel.color = '#fff';
		listLabel.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
		items.push(space);
		
		if(Ti.Platform.osname == 'ipad'){
			
			items.push(listLabel);
			items.push(space);
			listLabel.color = '#000';
		}
		else if(showFinalResults){// for iPhone
			listLabel.setTextAlign(Ti.UI.TEXT_ALIGNMENT_RIGHT);
			listLabel.setWidth(160);
			
			items.push(listLabel);
		}
		
		if(!showFinalResults){
			showAllButton.width = 80;
			items.push(showAllButton);
		}
		
		if(curWin.show_plus == true){
			items.push(plusButton);
		}
		
		// else{
			// items = (Ti.Platform.osname == 'ipad')? [back, space, label, space, showAllButton, space]:[back, label, space, showAllButton]
		// }
		
		// create and add toolbar
		var toolbar = Ti.UI.iOS.createToolbar({
			items:items,
			top:0,
			borderTop:false,
			borderBottom:true,
			zIndex: 1,
			height: 60
		});
		curWin.add(toolbar);
	}
	else{ // Ti.App.isAndroid
		curWin.add(topBar);
		if(!showFinalResults){
			topBar.add(showAllButton);
		}
		
		var activity = curWin.activity;
		activity.onCreateOptionsMenu = function(e) {
	
			var menu = e.menu;
			
			var homeItem = menu.add({
				title : 'Home',
				order : 0
			});
			
			homeItem.setIcon("/images/home_android.png");
			homeItem.addEventListener("click", function(e) {
				homeButtonPressed();
			});
				
			if(curWin.show_plus){
				var newItem = menu.add({
					title : 'New ' + bundle.label,
					order : 1
				});
				
				newItem.setIcon("/images/plus_btn.png");
				newItem.addEventListener("click", function(e) {
					Omadi.display.openFormWindow(curWin.type, 'new', 0);
				});
			}
		};
	}
	
	
	if(showFinalResults){
		//Search bar definition
		search.top = barHeight;
		curWin.add(search);
		filterTableView.top = (barHeight + 50);
	}
	else{
		
		lastFilterField = filterFields[filterValues.length];
	   
	    var filterFieldView = Ti.UI.createView({
	       height: 25,
	       width: '100%',
	       top: barHeight,
	       backgroundGradient: {
                type: 'linear',
                startPoint: { x: '50%', y: '0%' },
                endPoint: { x: '50%', y: '100%' },
                colors: [ { color: '#555', offset: 0.0}, { color: '#777', offset: 0.3 }, { color: '#444', offset: 1.0 } ]
            }   
	    });
	    
		var filterFieldLabel = Ti.UI.createLabel({
			font: {fontSize: 16, fontWeight: "bold"},
			width: '100%',
			height: 25,
			top: 1,
			left: 10,
			textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
			color: '#fff'
		});
		
		if(Ti.Platform.osname == 'iphone'){
			filterFieldLabel.text = bundle.label + ': Filter by ' + lastFilterField.label;
		}
		else{
			filterFieldLabel.text = 'Filter by ' + lastFilterField.label;
		}
		
		filterFieldView.add(filterFieldLabel);
		curWin.add(filterFieldView);
		filterTableView.top = (barHeight + 25);
	}
	
	if(filterTableView.getData().length){
		curWin.add(filterTableView);
	}
	else{
		var emptyLabel = Ti.UI.createLabel({
		  color:'#666',
		  text: 'No Results Were Found',
		  textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		  top: '50%',
		  font: {fontSize: 24}
		});
		curWin.add(emptyLabel);
	}
	

	/********** EVENTS *************/
	
	if(showFinalResults){
	    
	   search.addEventListener('change', function(e) {
			//e.value; // search string as user types
			Ti.API.info("in change");
			
			titleSearch = e.source.value;
			numPagesLoaded = 0;
			
			setTableData();
			
            // var filterData = [];
            // var i;
            // for(i = 0; i < tableData.length; i++) {
                // var rg = new RegExp(e.source.value, 'i');
                // if(tableData[i].searchValue.search(rg) != -1) {
                    // filterData.push(tableData[i]);
                // }
            // }
//             
            var labelText = '';
            if(Ti.Platform.osname == 'iphone'){
                labelText += 'Found (' + num_records + ')';
            }
            else{
                labelText += bundle.label + " List " + (showFinalResults ? '(' + num_records + ')' : '');
            }
            
            listLabel.setText(labelText);
            
            // if(filterData.length == 0){
                // var row = Ti.UI.createTableViewRow({
                    // height : 50,
                    // hasChild : false,
                    // title : 'No Results (Touch to Reset)',
                    // color: '#900',
                    // nid: 0,
                    // font: {fontWeight: 'bold', fontSize: 16}
                // });
                // filterTableView..push(row);
            // }
//             
            //filterTableView.setData(filterData);
        });
        
        search.addEventListener('return', function(e) {
            search.blur();
            //hides the keyboard
        });
        
        search.addEventListener('cancel', function(e) {
            e.source.value = "";
            search.blur();
            //hides the keyboard
        });
        
        
        filterTableView.addEventListener('focus', function(e) {
            search.blur();
        });
         
        filterTableView.addEventListener('scroll', function(e){
            search.blur();
        });
         
        filterTableView.addEventListener('touchstart', function(e){
            search.blur();
        });
    }
	else{
        showAllButton.addEventListener('click', function(e){

            Omadi.display.openListWindow(curWin.type, curWin.show_plus, filterValues, [], true);
        });
    }
	
	if(showFinalResults){
		// //When the user clicks on a certain contact, it opens individual_contact.js
		filterTableView.addEventListener('click', function(e) {
			//Hide keyboard when returning 
			//search.blur();
			if(e.row.nid == 0){
				search.setValue("");
				search.fireEvent("change");
				search.blur();
				search.fireEvent("cancel");
				search.fireEvent("return");
			}
			else{
				//bottomButtons1(e.row.nid, curWin, e);
				
				//var _nid = e.row.nid;
				var subDB = Omadi.utils.openMainDatabase();
				
				// var json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + curWin.type + '"');
				// var _data = JSON.parse(json_data.fieldByName('_data'));
			
				var result = subDB.execute('SELECT form_part, perm_edit FROM node WHERE nid=' + e.row.nid);
			
				//Ti.API.info('Form node part = ' + result.fieldByName('form_part'));
				
				var btn_tt = [];
				var btn_id = [];
				var isEditEnabled = false;
				var to_type, to_bundle;
				
				if(result){
					if(result.fieldByName('perm_edit') == 1){
						if(bundle.data.form_parts!=null && bundle.data.form_parts!=""){
							//Ti.API.info('Form table part = ' + bundle.data.form_parts.parts.length);
							if(bundle.data.form_parts.parts.length >= parseInt(result.fieldByName('form_part'), 10) + 2) { 
								//Ti.API.info("Title = " + bundle.data.form_parts.parts[result.fieldByName('form_part') + 1].label);
								btn_tt.push(bundle.data.form_parts.parts[result.fieldByName('form_part') + 1].label);
								btn_id.push(result.fieldByName('form_part') + 1);
								//Ti.API.info(result.fieldByName('form_part') + 1);
							}
						}
						isEditEnabled = true;
						btn_tt.push('Edit');
						btn_id.push(result.fieldByName('form_part'));
					}
					result.close();
				}
				
				subDB.close();
				
				btn_tt.push('View');
                btn_id.push('_view');
				
				if(typeof bundle.data.custom_copy !== 'undefined'){
                    for(to_type in bundle.data.custom_copy){
                        if(bundle.data.custom_copy.hasOwnProperty(to_type)){
                            to_bundle = Omadi.data.getBundle(to_type);
                            if(to_bundle){
                                btn_tt.push("Copy to " + to_bundle.label);
                                btn_id.push(to_type);
                                isEditEnabled = true;
                            }
                        }
                    }
                }
                
				
				if(!isEditEnabled){
				    e.row.setBackgroundColor('#fff');
				    Omadi.display.openViewWindow(curWin.type, e.row.nid);
				}
				else{
                    
                    btn_tt.push('Cancel');
                    btn_id.push('_cancel');
                    
                    var postDialog = Titanium.UI.createOptionDialog();
                    postDialog.options = btn_tt;
                    postDialog.eventRow = e.row;
                    postDialog.show();
                    
                    postDialog.addEventListener('click', function(ev) {
                        var form_part = btn_id[ev.index];
                        
                        if(form_part == '_cancel'){
                            Ti.API.info("Cancelled");
                        }
                        else if(form_part == '_view'){
                            ev.source.eventRow.setBackgroundColor('#fff');
                            Omadi.display.openViewWindow(curWin.type, ev.source.eventRow.nid);
                        }
                        else if (ev.index !== -1 && isEditEnabled === true){
                            ev.source.eventRow.setBackgroundColor('#fff');
                            Omadi.display.openFormWindow(curWin.type, ev.source.eventRow.nid, form_part);
                        }
                    });	
                }
			}
			//resultsNames.close();
		});
	}
	else{
	
		filterTableView.addEventListener('click', function(e) {
			//Hide keyboard when returning 
			//refreshDataTable();
			//var newFilterValue = e.row.filterValue;
			//var new
			Ti.API.info(e.row.filterValue);
			
			//Titanium.App.Properties.setString("filterValue1",e.row.filterValue);
			
			
			// var newWin = Ti.UI.createWindow({
			    // title:'Results',
			    // url: 'objects.js',
			    // navBarHidden: true,
			    // type: curWin.type,
			    // uid: curWin.uid,
			    // show_plus: curWin.show_plus
			// });
			
			var filterValues = curWin.filterValues;
			
			if(typeof filterValues != "object"){
				filterValues = [];
			}
			
			filterValues.push({
				value: e.row.filterValue,
				text: e.row.filterValueText
			});
			
			var nestedWindows;
			if(typeof curWin.nestedWindows == 'undefined'){
				nestedWindows = [];
			}
			else{
				nestedWindows = curWin.nestedWindows;
			}
			nestedWindows.push(curWin);
			
			Omadi.display.openListWindow(curWin.type, curWin.show_plus, filterValues, nestedWindows, false);
		});
		
	}
	
	
	//search.blur();
	Ti.API.info("END OF OBJECTS WINDOW FILE");
	
	

	//if(Ti.App.isAndroid){
		// bottomBack(curWin, "Back" , "enable", true);
		// if (listTableView != null ){
			// listTableView.bottom = '6%'	
			// listTableView.top = 50;
		// }
		// if(curWin.show_plus == true){
			// var activity = curWin.activity;
			// activity.onCreateOptionsMenu = function(e) {
				// var menu = e.menu;
				// var menu_edit = menu.add({
					// title : 'New',
					// order : 0
				// });
				// menu_edit.setIcon("/images/action.png");
				// menu_edit.addEventListener("click", function(e) {
					// openCreateNodeScreen();
				// });
			// }
		// }
	//}
		
	Omadi.data.setUpdating(false);
	
}());
