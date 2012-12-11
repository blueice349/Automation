/*jslint eqeq:true, plusplus: true*/ 

//Ti.include('/main_windows/create_or_edit_node.js');
Ti.include('/lib/functions.js');
	
/*global PLATFORM,create_or_edit_node*/

var bundle,
curWin,
search,
instances,
filterValues,
filterFields, 
win_new;

curWin = Ti.UI.currentWindow;

Ti.App.addEventListener('loggingOut', function(){"use strict";
    Ti.UI.currentWindow.close();
});

function openCreateNodeScreen(){
	"use strict";
	var formWindow = Ti.UI.createWindow({
	    navBarHidden: true,
	    title: "New " + bundle.label,
	    type: curWin.type,
	    nid: "new",
	    url: '/main_windows/form.js'
	});//create_or_edit_node.getWindow();
	// win_new.navBarHidden = true;
	// win_new.title = "New " + bundle.label;
	// win_new.type = curWin.type;
	// win_new.uid = curWin.uid;
	// win_new.mode = 0;
	// win_new.region_form = 0;
	// win_new.backgroundColor = "#EEEEEE";
	// win_new.nameSelected = 'Fill Details...';
	// win_new.url = '/main_windows/form.js';
	// win_new.top = 0; 
	// win_new.bottom = 0;
	formWindow.open();
	//setTimeout(function(){
//		create_or_edit_node.loadUI();
//	}, 100);
}


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
	//if(PLATFORM === 'android'){
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
     if(PLATFORM === 'android'){
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
	

(function(){
	"use strict";
	/*global Omadi*/
	/*jslint vars: true*/
	
	var i, filterField, field_name;
	var db, db_result;
	
	Omadi.data.setUpdating(true);
	
	bundle = Omadi.data.getBundle(curWin.type);
	instances = Omadi.data.getFields(curWin.type);
	
	Ti.API.info("OPENED NEW LIST WINDOW");
	
	//Current window's instance
	
	
	//Sets only portrait mode
	curWin.orientationModes = [Titanium.UI.PORTRAIT];
	curWin.setBackgroundColor("#eee");
    curWin.addEventListener('android:back', backButtonPressed);
	
	
	filterValues = curWin.filterValues;
	if(typeof filterValues !== "object"){
        filterValues = [];
    }

	//for(i in filterValues){
	//	Ti.API.info('FILTER VALUE TOP: ' + i + ": "+ filterValues[i].value);	
	//}
	
	filterFields = [];
	

	if (typeof bundle.data.mobile !== 'undefined' && typeof bundle.data.mobile.filters !== 'undefined' && typeof bundle.data.mobile.filters.fields !== 'undefined' && bundle.data.mobile.filters.fields.length > 0) {
		
		for(i in bundle.data.mobile.filters.fields){
		    if(bundle.data.mobile.filters.fields.hasOwnProperty(i)){
  
                field_name = bundle.data.mobile.filters.fields[i].field_name;
                
                if(field_name === 'form_part'){
                    filterFields.push({
                        label: 'Form Part',
                        type: 'metadata'
                    });
                }
                else{
                    filterFields.push(instances[field_name]);
                }
                
                //Ti.API.info('mobile filter field: ' + field_name);
            }
		}
	}
	
	
	//Ti.API.info(filterFields.length);
    //Ti.API.info(filterValues.length);

	var tableData = [];
	var tableIndex = 0;
	
	var showFinalResults = false;
	if(typeof curWin.showFinalResults != 'undefined'){
		showFinalResults = curWin.showFinalResults;
	}
	
	var sql;
	var lastFilterField;
	
	if(filterValues.length < filterFields.length && !showFinalResults){
		lastFilterField = filterFields[filterValues.length];
		if(typeof lastFilterField.field_name !== 'undefined'){
            field_name = lastFilterField.field_name;
            sql = "SELECT DISTINCT " + field_name + " AS value FROM " + curWin.type + " type  INNER JOIN node n ON n.nid = type.nid";
        }
        else{
            sql = "SELECT n.title, n.nid, n.viewed FROM node n INNER JOIN " + curWin.type + " type ON type.nid = n.nid ";
        
            showFinalResults = true;
        }
	}
	else{//(filterValues.length == filterFields.length){
		sql = "SELECT n.title, n.nid, n.viewed FROM node n INNER JOIN " + curWin.type + " type ON type.nid = n.nid ";
		
		showFinalResults = true;
	}
	
	var conditions = [];
	
	if(filterFields.length > 0){
		for(i = 0; i < filterFields.length; i ++){
		    Ti.API.info(i);
			field_name = filterFields[i].field_name;
			Ti.API.info("FILTER FIELD NAME: " + field_name);
			
			
			if(typeof filterValues[i] != 'undefined' && filterValues[i].value !== false){
				Ti.API.info("FILTER VALUE BELOW: " + i + ": " + filterValues[i].value );
				var filterValue = filterValues[i].value;
				
				Ti.API.info("FILTER VALUE 4: " + i + " " + filterValue);
				// Filter with the current filter
				
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
	}
	
	Ti.API.info("FILTER SQL: " + sql);
	
	if(showFinalResults){
	    db = Omadi.utils.openMainDatabase();
        db_result = db.execute(sql);
		while(db_result.isValidRow()){
			
			//Ti.API.info("FILTER FINAL RESULT: " + db_result.fieldByName('nid'));
			//Ti.API.info("FILTER FINAL RESULT: " + db_result.fieldByName('title'));
			
			var title = db_result.fieldByName('title');
			
			title = Omadi.utils.trimWhiteSpace(title);
			
			if(title.length == 0){
				title = '- No Title -';
			}
			
			var separator = ' - ';
			if(typeof bundle.data.title_fields !== 'undefined' && typeof bundle.data.title_fields.separator !== 'undefined'){
				separator = bundle.data.title_fields.separator;
			}
			
			var whiteSpaceTest = Omadi.utils.trimWhiteSpace(separator);
			var backgroundColor = '#eee';
			if(db_result.fieldByName('viewed') > 0){
				backgroundColor = '#fff';
			}
			var row = Ti.UI.createTableViewRow({
				hasChild: false,
				searchValue: db_result.fieldByName('title'),
				color: '#000',
				nid: db_result.fieldByName('nid'),
				backgroundColor: backgroundColor
			});
			
			if(whiteSpaceTest.length > 0){
				var titleParts = title.split(separator);
				var numTitleRows = Math.ceil(titleParts.length / 2);
				for(i = 0; i <= numTitleRows; i ++){
					
					// Add label1 before label2 so the white background will go over the right label if it's extra long
					var label1 = Ti.UI.createLabel({
						height : 20,
						text : titleParts[i*2],
						color: '#000',
						top: (i * 20 + 5),
						left: 5,
						zIndex: 1,
						width: '45%',
						font: {fontSize: 14},
						wordWrap: false,
						ellipsize: true
					});
					
					row.add(label1);
					
					if(typeof titleParts[i*2+1] != 'undefined'){
						var label2 = Ti.UI.createLabel({
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
			
			tableData[tableIndex] = row;
			tableIndex++;
			
			db_result.next();
		}
		db_result.close();
		db.close();
	}
	else{
		
		var text_values = [];
		var values = [];
		
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
		
		var safeValues = [];
		
		for(i = 0; i < values.length; i ++){
			if(values[i] > ''){
				safeValues.push(values[i]);
			}
			else{
				text_values[values[i]] = '- Not Set -';
			}
		}
		
		var subResult;
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
			var text_value = text_values[values[i]];
			//}
			
			tableData[tableIndex] = Ti.UI.createTableViewRow({
                height : 50,
                hasChild : true,
                title : text_value,
                color: '#000',
                filterValue: values[i],
                filterValueText: text_value
            });
			tableIndex++;
		}	
		
		if(field_name != 'form_part'){
			tableData.sort(sortByTitle);
		}
	}
	
	
	var filterTableView = Titanium.UI.createTableView({
		data : tableData,
		separatorColor: '#BDBDBD',
		top: 60,
		height: Ti.UI.SIZE
	});	
	
	if(PLATFORM === 'android'){
	    filterTableView.top = 45;
	}
	
	
	var topBar = Titanium.UI.createView({
	   backgroundColor:'#666',
	   top: 0,
	   height: 45
	});
	
	
	var labelText = '';
	if(Ti.Platform.osname == 'iphone'){
		labelText += 'Found (' + tableData.length + ')';
	}
	else{
		labelText += bundle.label + " List " + (showFinalResults ? '(' + tableData.length + ')' : '');
	}
	
	var listLabel = Ti.UI.createLabel({
		font: {fontWeight: "bold", fontSize: 16},
		text: labelText,
		textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
		color: '#ccc'
	});
	
	if(PLATFORM == 'android'){
		listLabel.top = 4;
		listLabel.left = 10;
	}
	
	var showAllButton = Ti.UI.createButton({
		title: 'Show All',
		top: 5,
		right: 10,
		width: 100,
		height: 35,
		style: (PLATFORM != 'android' ? Titanium.UI.iPhone.SystemButtonStyle.BORDERED : ''),
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
	
	if(PLATFORM == 'android'){
	    
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
			if(PLATFORM == 'android'){
				barHeight = 15 + (filterValues.length * 14);
			}
		}
		else{
			filterLabel.top = 25;
			if(PLATFORM === 'android'){
				filterLabel.left = 10;
			}
			else{
				filterLabel.left = 80;
			}
			
			if(PLATFORM === 'android'){
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
	if(PLATFORM != 'android'){
		
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
			openCreateNodeScreen();
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
	else{ // PLATFORM == 'android'
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
					openCreateNodeScreen();
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
	
	if(tableData.length){
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
			
            var filterData = [];
            var i;
            for(i = 0; i < tableData.length; i++) {
                var rg = new RegExp(e.source.value, 'i');
                if(tableData[i].searchValue.search(rg) != -1) {
                    filterData.push(tableData[i]);
                }
            }
            
            var labelText = '';
            if(Ti.Platform.osname == 'iphone'){
                labelText += 'Found (' + filterData.length + ')';
            }
            else{
                labelText += bundle.label + " List " + (showFinalResults ? '(' + filterData.length + ')' : '');
            }
            
            listLabel.setText(labelText);
            
            if(filterData.length == 0){
                var row = Ti.UI.createTableViewRow({
                    height : 50,
                    hasChild : false,
                    title : 'No Results (Touch to Reset)',
                    color: '#900',
                    nid: 0,
                    font: {fontWeight: 'bold', fontSize: 16}
                });
                filterData.push(row);
            }
            
            filterTableView.setData(filterData);
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
        
        var newWin = Ti.UI.createWindow({
            backgroundColor: '#FFF',
            title:'Results',
            url: 'objects.js',
            navBarHidden: true,
            type: curWin.type,
            showFinalResults: true,
            uid: curWin.uid,
            show_plus: curWin.show_plus
        });
        
        var filterValues = curWin.filterValues;
        
        if(typeof filterValues != "object"){
            filterValues = [];
        }
        
        newWin.filterValues = filterValues;
        newWin.addEventListener('open', windowOpened);
            newWin.open();
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
				
				if(!isEditEnabled){
				    var win_new = Titanium.UI.createWindow({
                        fullscreen : false,
                        navBarHidden : true,
                        title: bundle.label,
                        type: curWin.type,
                        url : 'individual_object.js',
                        //up_node: curWin.up_node,
                        uid: curWin.uid,
                        region_form: e.row.form_part,
                        backgroundColor: '#000',
                        nid: e.row.nid
                    });
                    
                    //Passing parameters
                    //win_new.nid             = e.row.nid;
                    //win_new.nameSelected    = e.row.name;
                    
                    e.row.setBackgroundColor('#fff');
                    win_new.open();
				}
				else{
				
                    btn_tt.push('View');
                    btn_id.push(0);
                    
                    //json_data.close();
                    
                    btn_tt.push('Cancel');
                    btn_id.push(0);
                    
                    var postDialog = Titanium.UI.createOptionDialog();
                    postDialog.options = btn_tt;
                    postDialog.eventRow = e.row;
                    postDialog.show();
                    
                    postDialog.addEventListener('click', function(ev) {
                        if (ev.index === btn_tt.length - 2 ){
                            //Next window to be opened 
                            win_new = Titanium.UI.createWindow({
                                navBarHidden : true,
                                title: bundle.label,
                                type: curWin.type,
                                url : 'individual_object.js',
                                up_node: curWin.up_node,
                                uid: curWin.uid,
                                region_form: ev.source.eventRow.form_part,
                                backgroundColor: '#000',
                                nid: ev.source.eventRow.nid
                            });
                            
                            ev.source.eventRow.setBackgroundColor('#fff');
                            
                            //Avoiding memory leaking
                            win_new.open();
                        }
                        else if (ev.index === btn_tt.length - 1){
                            Ti.API.info("Cancelled");
                        }
                        else if (ev.index !== -1 && isEditEnabled === true){
                            //openEditScreen(btn_id[ev.index], _nid, e);
                        
                            win_new = Ti.UI.createWindow({
                                navBarHidden: true,
                                url: '/main_windows/form.js',
                                title: bundle.label,
                                type: curWin.type,
                                nid: ev.source.eventRow.nid,
                                form_part: btn_id[ev.index]
                            });//create_or_edit_node.getWindow();
                            
                            
                            
                            // win_new.type = curWin.type;
                            // win_new.listView = curWin.listView;
                            // win_new.up_node = curWin.up_node;
                            // win_new.uid = curWin.uid;
                            // win_new.region_form = btn_id[ev.index];
//                             
                            // win_new.top = 0; 
                            // win_new.bottom = 0;
                            // //Passing parameters
                            // win_new.nid = ev.source.eventRow.nid;
                            // win_new.nameSelected = ev.source.eventRow.name;
//                             
                            // //Sets a mode to fields edition
                            // win_new.mode = 1;
                            

                            ev.source.eventRow.setBackgroundColor('#fff');
                            
                                
                            win_new.open();
                            //setTimeout(function() {
                            //    create_or_edit_node.loadUI();
                            //}, 100);
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
			
			var newWin = Ti.UI.createWindow({
			    backgroundColor: '#FFF',
			    title:'Results',
			    url: 'objects.js',
			    navBarHidden: true,
			    type: curWin.type,
			    uid: curWin.uid,
			    show_plus: curWin.show_plus
			});
			
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
			
			newWin.filterValues = filterValues;
			newWin.nestedWindows = nestedWindows;
			// Remove the listener to close the first window
			//e.row.cWin.removeEventListener('android:back', backButtonPressed);
			newWin.addEventListener('open', windowOpened);
			
			newWin.open();
		});
		
	}
	
	
	//search.blur();
	Ti.API.info("END OF OBJECTS WINDOW FILE");
	
	

	//if(PLATFORM === 'android'){
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
