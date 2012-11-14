
Ti.include('/main_windows/create_or_edit_node.js');
	
/*global PLATFORM,create_or_edit_node*/

var bundle_data,
bundle_label,
curWin,
search,
filterValues,
filterFields;

curWin = Ti.UI.currentWindow;

function openCreateNodeScreen(){
	"use strict";
	var win_new = create_or_edit_node.getWindow();
	win_new.title = "New " + bundle_label;
	win_new.type = curWin.type;
	win_new.uid = curWin.uid;
	win_new.mode = 0;
	win_new.region_form = 0;
	win_new.backgroundColor = "#EEEEEE";
	win_new.nameSelected = 'Fill Details...';
	win_new.open();
	setTimeout(function(){
		create_or_edit_node.loadUI();
	}, 100);
}


// function openEditScreen(part, nid, e){
	// "use strict";
// //Next window to be opened
	// // var win_new = create_or_edit_node.getWindow();
	// // win_new.title = bundle_label;
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


// function bottomButtons1(_nid, curWin, e){
	// var db_act = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + Omadi.utils.getMainDBName());
	// if(PLATFORM != 'android'){db_act.file.setRemoteBackup(false);}
	// // var json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + curWin.type + '"');
	// // var _data = JSON.parse(json_data.fieldByName('_data'));
// 
	// var node_form = db_act.execute('SELECT form_part, perm_edit FROM node WHERE nid=' + _nid);
// 
	// Ti.API.info('Form node part = ' + node_form.fieldByName('form_part'));
	
	// var btn_tt = [];
	// var btn_id = [];
	// var isEditEnabled = false;
	// if(node_form.fieldByName('perm_edit')==1){
		// if(bundle_data.form_parts!=null && bundle_data.form_parts!=""){
			// Ti.API.info('Form table part = ' + bundle_data.form_parts.parts.length);
			// if(bundle_data.form_parts.parts.length >= parseInt(node_form.fieldByName('form_part')) + 2) { 
				// Ti.API.info("Title = " + bundle_data.form_parts.parts[node_form.fieldByName('form_part') + 1].label);
				// btn_tt.push(bundle_data.form_parts.parts[node_form.fieldByName('form_part') + 1].label);
				// btn_id.push(node_form.fieldByName('form_part') + 1);
				// Ti.API.info(node_form.fieldByName('form_part') + 1);
			// }
		// }
		// isEditEnabled = true;
		// btn_tt.push('Edit');
		// btn_id.push(node_form.fieldByName('form_part'));
	// }

	// btn_tt.push('View');
	// btn_id.push(0);

	// //json_data.close();
	// db_act.close();
// 
	// btn_tt.push('Cancel');
	// btn_id.push(0);
// 
	// var postDialog = Titanium.UI.createOptionDialog();
	// postDialog.options = btn_tt;
	// postDialog.show();
// 
	// postDialog.addEventListener('click', function(ev) {
			// if (ev.index == btn_tt.length-2 ){
				// //Next window to be opened 
				// var win_new = Titanium.UI.createWindow({
					// fullscreen : false,
					// navBarHidden : true,
					// title: bundle_label,
					// type: curWin.type,
					// url : 'individual_object.js',
					// up_node: curWin.up_node,
					// uid: curWin.uid,
					// region_form: e.row.form_part,
					// backgroundColor: '#000'
				// });

				// //Passing parameters
				// win_new.nid= e.row.nid;
				// win_new.nameSelected= e.row.name;
	
				// //Avoiding memory leaking
				// win_new.open();
			// }
			// else if (ev.index  == btn_tt.length-1){
				// Ti.API.info("Cancelled")
			// }
			// else if (ev.index != -1 && isEditEnabled==true){
				// //openEditScreen(btn_id[ev.index], _nid, e);
			
				// var win_new = create_or_edit_node.getWindow();
				// win_new.title = bundle_label;
				// win_new.type = curWin.type;
				// win_new.listView = curWin.listView;
				// win_new.up_node = curWin.up_node;
				// win_new.uid = curWin.uid;
				// win_new.region_form = btn_id[ev.index];		
				// //Passing parameters
				// win_new.nid = nid;
				// win_new.nameSelected = e.row.name;		
				// //Sets a mode to fields edition
				// win_new.mode = 1;	
				// win_new.open();
				// setTimeout(function() {
					// create_or_edit_node.loadUI();
				// }, 100);
			// }
	// });	
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
	search.blur();
	if(PLATFORM === 'android'){
		Ti.UI.Android.hideSoftKeyboard();
	}
	Ti.API.debug("hide keyboard in windowOpened");
	
	setTimeout(function(){
		search.blur();
		Ti.API.info("window 1 second passed");
		search.setFocusable(true);
	}, 1000);
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
	

(function(){
	"use strict";
	/*global setUse, Omadi*/
	
	var i, curWin, db, db_result, filterFieldNames, filterField, filter_field_name;
	
	Ti.API.info("OPENED NEW LIST WINDOW");
	
	//Current window's instance
	curWin = Ti.UI.currentWindow;
	
	//Sets only portrait mode
	curWin.orientationModes = [Titanium.UI.PORTRAIT];
	curWin.setBackgroundColor("#eee");
    curWin.addEventListener('android:back', backButtonPressed);
	
	//Lock database for background updates
	setUse();
	
	db = Omadi.utils.openMainDatabase();//Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+Omadi.utils.getMainDBName() );
	//if(PLATFORM != 'android'){db.file.setRemoteBackup(false);}
	
	filterValues = curWin.filterValues;
	if(typeof filterValues !== "object"){
        filterValues = [];
    }

	//for(i in filterValues){
	//	Ti.API.info('FILTER VALUE TOP: ' + i + ": "+ filterValues[i].value);	
	//}
	
	filterFields = [];
	filterFieldNames = [];
	
	db_result = db.execute('SELECT _data, display_name FROM bundles WHERE bundle_name="' + curWin.type + '"');
	bundle_data = JSON.parse(db_result.fieldByName('_data'));
	bundle_label = db_result.fieldByName('display_name');
    
	
	if (typeof bundle_data.mobile !== 'undefined' && typeof bundle_data.mobile.filters !== 'undefined' && typeof bundle_data.mobile.filters.fields !== 'undefined' && bundle_data.mobile.filters.fields.length > 0) {
		
		for(i in bundle_data.mobile.filters.fields){
		    if(bundle_data.mobile.filters.fields.hasOwnProperty(i)){
  
                filter_field_name = bundle_data.mobile.filters.fields[i].field_name;
                filterField = {};
                filterField.field_name = filter_field_name;

                if(filter_field_name === 'form_part'){
                    filterField.field_label = 'Form Part';
                    filterField.field_type = 'metadata';
                }
                else{
                    filterFieldNames.push(filter_field_name);
                }
                filterFields.push(filterField);
                //Ti.API.info('mobile filter field: ' + filter_field_name);
            }
		}
	}
	db_result.close();
	
	if(filterFieldNames.length > 0){
		db_result = db.execute("SELECT label, type, field_name FROM fields WHERE field_name IN ('" + filterFieldNames.join("','") + "') AND bundle = '" + curWin.type + "'");
		
		while(db_result.isValidRow()){
			for(i = 0; i < filterFields.length; i += 1){
				if(filterFields[i].field_name === db_result.fieldByName('field_name')){
					filterFields[i].field_type = db_result.fieldByName('type');
					filterFields[i].field_label = db_result.fieldByName('label');
				}
			}
			
			db_result.next();	
		}
		
		db_result.close();
	}
	
	// for(i in filterValues){
		// Ti.API.info('FILTER VALUE MIDDLE: ' + i + ": "+ filterValues[i].value);	
	// }
	
	var numFilters = filterFields.length;
	var numFilterValues = filterValues.length;
	
	//Ti.API.info(numFilters);
    //Ti.API.info(numFilterValues);

	var tableData = [];
	var tableIndex = 0;
	
	var showFinalResults = false;
	if(typeof curWin.showFinalResults != 'undefined'){
		showFinalResults = curWin.showFinalResults;
	}
	
	var sql;
	var lastFilterField;
	
	if(numFilterValues < numFilters && !showFinalResults){
		lastFilterField = filterFields[numFilterValues];
		if(typeof lastFilterField.field_name !== 'undefined'){
            var field_name = lastFilterField.field_name;
            sql = "SELECT DISTINCT " + field_name + " AS value FROM " + curWin.type + " type  INNER JOIN node n ON n.nid = type.nid";
        }
        else{
            sql = "SELECT n.title, n.nid, n.viewed FROM node n INNER JOIN " + curWin.type + " type ON type.nid = n.nid ";
        
            showFinalResults = true;
        }
	}
	else{//(numFilterValues == numFilters){
		sql = "SELECT n.title, n.nid, n.viewed FROM node n INNER JOIN " + curWin.type + " type ON type.nid = n.nid ";
		
		showFinalResults = true;
	}
	
	var conditions = [];
	
	if(filterFields.length > 0){
		for(i in filterFields){
		    Ti.API.info(i);
			var field_name = filterFields[i].field_name;
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
	
	Ti.API.info("FILTER SQL: " + sql);
	
	if(showFinalResults){
		sql += " ORDER BY ";
		
		if(typeof bundle_data.mobile !== 'undefined' && typeof bundle_data.mobile.sort_field !== 'undefined'){
			sql += "n." + bundle_data.mobile.sort_field + " " + bundle_data.mobile.sort_direction;
		}
		else{
			sql += "n.title ASC";
		}
	}
	
	db_result = db.execute(sql);
	
	if(showFinalResults){
		while(db_result.isValidRow()){
			
			//Ti.API.info("FILTER FINAL RESULT: " + db_result.fieldByName('nid'));
			//Ti.API.info("FILTER FINAL RESULT: " + db_result.fieldByName('title'));
			
			var title = db_result.fieldByName('title');
			
			title = trimWhiteSpace(title);
			
			if(title.length == 0){
				title = '- No Title -';
			}
			
			var separator = ' - ';
			if('title_fields' in bundle_data && 'separator' in bundle_data.title_fields){
				separator = bundle_data.title_fields.separator;
			}
			
			var whiteSpaceTest = trimWhiteSpace(separator);
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
						height : '20dp',
						text : titleParts[i*2],
						color: '#000',
						top: (i * 20 + 5) + 'dp',
						left: '5dp',
						zIndex: 1,
						width: '45%',
						font: {fontSize: '14dp'},
						wordWrap: false,
						ellipsize: true
					});
					
					row.add(label1);
					
					if(typeof titleParts[i*2+1] != 'undefined'){
						var label2 = Ti.UI.createLabel({
							height : '20dp',
							text : titleParts[i*2+1],
							color: '#666',
							top: (i * 20 + 5) + 'dp',
							left: '54%',
							width: '45%',
							font: {fontSize: '14dp'},
							wordWrap: false,
							ellipsize: true
						});
						
						row.add(label2);
					}
				}
				row.height = (numTitleRows * 20) + 10 + 'dp';
	
			}
			else{
				row.height = '50dp';
				row.title = row.searchValue;
			}
			
			tableData[tableIndex] = row;
			tableIndex++;
			
			db_result.next();
		}
		db_result.close();
	}
	else{
		
		var text_values = [];
		var values = [];
		
		while(db_result.isValidRow()){
			
			values.push(db_result.fieldByName('value'));
			
			Ti.API.info("FILTER: " + db_result.fieldByName('value'));
			
			db_result.next();
		}
		
		db_result.close();
		
		
		sql = "SELECT ";
		
		lastFilterField = filterFields[numFilterValues];
	
		var field_name = lastFilterField.field_name;
		var field_type = lastFilterField.field_type;
		
		var safeValues = [];
		
		for(i in values){
			if(values[i] > ''){
				safeValues.push(values[i]);
			}
			else{
				text_values[values[i]] = '- Not Set -';
			}
		}
		
		if(field_type == 'taxonomy_term_reference'){
			db_result = db.execute("SELECT tid AS value, name AS text_value FROM term_data WHERE tid IN (" + safeValues.join(",") + ")");
			while(db_result.isValidRow()){
				text_values[db_result.fieldByName('value')] = db_result.fieldByName('text_value');			
				//Ti.API.info("FILTER: " + db_result.fieldByName('text_value'));
				db_result.next();
			}
			
			db_result.close();
		}
		else if(field_type == 'omadi_reference'){
			db_result = db.execute("SELECT nid AS value, title AS text_value FROM node WHERE nid IN (" + safeValues.join(",") + ")");
			while(db_result.isValidRow()){
				text_values[db_result.fieldByName('value')] = db_result.fieldByName('text_value');			
				//Ti.API.info("FILTER: " + db_result.fieldByName('text_value'));
				db_result.next();
			}
			
			db_result.close();
		}
		else if(field_type == 'user_reference'){
			db_result = db.execute("SELECT uid AS value, realname AS text_value FROM user WHERE uid IN (" + safeValues.join(",") + ")");
			while(db_result.isValidRow()){
				text_values[db_result.fieldByName('value')] = db_result.fieldByName('text_value');			
				//Ti.API.info("FILTER: " + db_result.fieldByName('text_value'));
				db_result.next();
			}
			
			db_result.close();
		}
		else if(field_name == 'form_part'){
			
			if (bundle_data.form_parts != null && bundle_data.form_parts != "") {
				Ti.API.info('Form table part = ' + bundle_data.form_parts.parts.length);
				if (bundle_data.form_parts.parts.length > 0) {
					for(i in bundle_data.form_parts.parts){
						text_values[i] = bundle_data.form_parts.parts[i].label;
						//Ti.API.info("FILTER: " + bundle_data.form_parts.parts[i].label);
					}
				}
			}
		}
		
	
		tableIndex = 0;
		for(i in values){
		
			//var text_value = '- Empty - ';
			//if(value > 0){
			var text_value = text_values[values[i]];
			//}
			
			var row = Ti.UI.createTableViewRow({
				height : '50dp',
				hasChild : true,
				title : text_value,
				color: '#000',
				filterValue: values[i],
				filterValueText: text_value
			});
			
			tableData[tableIndex] = row;
			tableIndex++;
		}	
		
		if(field_name != 'form_part'){
			tableData.sort(sortByTitle);
		}
	}
	
	
	var filterTableView = Titanium.UI.createTableView({
		data : tableData,
		separatorColor: '#BDBDBD',
		top: '60dp',
	});	
	
	//Contat list container
	
	
	var topBar = Titanium.UI.createView({
	   backgroundColor:'#666',
	   top: 0,
	   height: '60dp'
	});
	
	
	var labelText = '';
	if(Ti.Platform.osname == 'iphone'){
		labelText += 'Found (' + tableData.length + ')';
	}
	else{
		labelText += bundle_label + " List " + (showFinalResults ? '(' + tableData.length + ')' : '');
	}
	
	var listLabel = Ti.UI.createLabel({
		font: {fontWeight: "bold", fontSize: '16dp'},
		text: labelText,
		textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
		color: '#ccc',
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});
	
	if(PLATFORM == 'android'){
		listLabel.top = '4dp';
		listLabel.left = '10dp';
	}
	
	var showAllButton = Ti.UI.createButton({
		title: 'Show All',
		top: '10dp',
		right: '10dp',
		width: '100dp',
		height: '40dp',
		style: (PLATFORM != 'android' ? Titanium.UI.iPhone.SystemButtonStyle.BORDERED : ''),
		backgroundGradient: {
	        type: 'linear',
	        startPoint: { x: '50%', y: '0%' },
	        endPoint: { x: '50%', y: '100%' },
	        colors: [ { color: '#ccc', offset: 0.0}, { color: '#ddd', offset: 0.25 }, { color: '#aaa', offset: 1.0 } ],
	   },
	   borderRadius: '5dp', 
	   color: '#000'
	});
	
	search = Ti.UI.createSearchBar({
		hintText : 'Search...',
		autocorrect : false,
		barColor : '#666',
		color: 'black',
		height: '50dp',
		focusable: false
	});
	
	topBar.add(listLabel);
	
	var barHeight;
	
	if(PLATFORM == 'android'){
		if(showFinalResults){
			barHeight = 30;
		}
		else{
			barHeight = 60;
		}
	}
	else{
		barHeight = 40;
	}
	
	if(filterValues.length){
		var filterLabelParts = [];
		for(i in filterValues){
			if(typeof filterValues[i] != 'undefined' && filterValues[i].value !== false){
				Ti.API.info(filterValues[i].text);
				var filterLabelText = filterFields[i].field_label + ": ";
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
		  font: {fontSize: '12dp'}
		});
		
		if(showFinalResults){
			filterLabel.top = '5dp';
			filterLabel.right = '10dp';
			if(PLATFORM == 'android'){
				barHeight = 15 + (filterValues.length * 14);
			}
		}
		else{
			filterLabel.top = '25dp';
			if(PLATFORM == 'android'){
				filterLabel.left = '10dp';
			}
			else{
				filterLabel.left = '80dp';
			}
			
			if(PLATFORM == 'android'){
				barHeight = 30 + (filterValues.length * 14);
				if(barHeight < 60){
					barHeight = 60;
				}
			}
		}
		
		topBar.add(filterLabel);
		topBar.height = barHeight + 'dp';
		filterTableView.top = barHeight + 'dp';
	}
	
	/*** ADD the IOS top navigation bar ***/
	if(PLATFORM != 'android'){
		
		// var iOSBackButton = Ti.UI.createButton({
			// title : 'Back',
			// style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
			// top: '10dp',
			// left: '10dp',
			// height: '40dp',
			// backgroundGradient: {
	        // type: 'linear',
		        // startPoint: { x: '50%', y: '0%' },
		        // endPoint: { x: '50%', y: '100%' },
		        // colors: [ { color: '#ccc', offset: 0.0}, { color: '#ddd', offset: 0.25 }, { color: '#aaa', offset: 1.0 } ],
		   // },
		   // borderRadius: '5dp', 
		   // color: '#000',
		   // width: '60dp'
		// });
		// iOSBackButton.addEventListener('click', function() {
			// curWin.close();
		// });
		// topBar.add(iOSBackButton);
		// listLabel.left = '80dp';
		
		
		
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
			width:"54dp",
			height:"38dp",
			right: "1dp",
			is_plus: true
		});
		
		plusButton.addEventListener('click', function() {
			openCreateNodeScreen();
		}); 
		
		items.push(back);
		
		if(numFilterValues > 0){
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
			listLabel.setWidth('160dp');
			
			items.push(listLabel);
		}
		
		if(!showFinalResults){
			showAllButton.width = '80dp';
			items.push(showAllButton)
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
			height: '60dp'
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
			
			homeItem.setIcon("/images/home2.png");
			homeItem.addEventListener("click", function(e) {
				homeButtonPressed();
			});
				
			if(curWin.show_plus){
				var newItem = menu.add({
					title : 'New ' + bundle_label,
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
		search.top = barHeight + 'dp';
		curWin.add(search);
		filterTableView.top = (barHeight + 50) + 'dp';
	}
	else{
		
		lastFilterField = filterFields[numFilterValues];
	
		var filterFieldLabel = Ti.UI.createLabel({
			font: {fontSize: '16dp', fontWeight: "bold"},
			top: barHeight + 'dp',
			width: '100%',
			height: '25dp',
			textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
			backgroundColor: '#ddd',
			color: '#000',
			backgroundGradient: {
		        type: 'linear',
		        startPoint: { x: '50%', y: '0%' },
		        endPoint: { x: '50%', y: '100%' },
		        colors: [ { color: '#ddd', offset: 0.0}, { color: '#eee', offset: 0.3 }, { color: '#bbb', offset: 1.0 } ],
		    }
		});
		
		if(Ti.Platform.osname == 'iphone'){
			filterFieldLabel.text = bundle_label + ': Filter by ' + lastFilterField.field_label;
		}
		else{
			filterFieldLabel.text = 'Filter by ' + lastFilterField.field_label;
		}
		
		curWin.add(filterFieldLabel);
		filterTableView.top = (barHeight + 25) + 'dp';
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
		  font: {fontSize: '24dp'}
		});
		curWin.add(emptyLabel);
	}
	
	
	
	
	/********** EVENTS *************/
	
	search.addEventListener('change', function(e) {
			//e.value; // search string as user types
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
			labelText += bundle_label + " List " + (showFinalResults ? '(' + filterData.length + ')' : '');
		}
		
		listLabel.setText(labelText);
		
		if(filterData.length == 0){
			var row = Ti.UI.createTableViewRow({
				height : '50dp',
				hasChild : false,
				title : 'No Results (Touch to Reset)',
				color: '#900',
				nid: 0,
				font: {fontWeight: 'bold', fontSize: '16dp'}
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
	
	if(showFinalResults){
		// //When the user clicks on a certain contact, it opens individual_contact.js
		filterTableView.addEventListener('click', function(e) {
			//Hide keyboard when returning 
			//search.blur();
			if(e.row.nid == 0){
				search.setValue("");
			}
			else{
				//bottomButtons1(e.row.nid, curWin, e);
				
				var _nid = e.row.nid;
				var db = Omadi.utils.openMainDatabase();//Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + Omadi.utils.getMainDBName());
				//if(PLATFORM != 'android'){db_act.file.setRemoteBackup(false);}
				// var json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + curWin.type + '"');
				// var _data = JSON.parse(json_data.fieldByName('_data'));
			
				var result = db.execute('SELECT form_part, perm_edit FROM node WHERE nid=' + _nid);
			
				//Ti.API.info('Form node part = ' + result.fieldByName('form_part'));
				
				var btn_tt = [];
				var btn_id = [];
				var isEditEnabled = false;
				if(result.fieldByName('perm_edit') == 1){
					if(bundle_data.form_parts!=null && bundle_data.form_parts!=""){
						//Ti.API.info('Form table part = ' + bundle_data.form_parts.parts.length);
						if(bundle_data.form_parts.parts.length >= parseInt(result.fieldByName('form_part')) + 2) { 
							//Ti.API.info("Title = " + bundle_data.form_parts.parts[result.fieldByName('form_part') + 1].label);
							btn_tt.push(bundle_data.form_parts.parts[result.fieldByName('form_part') + 1].label);
							btn_id.push(result.fieldByName('form_part') + 1);
							//Ti.API.info(result.fieldByName('form_part') + 1);
						}
					}
					isEditEnabled = true;
					btn_tt.push('Edit');
					btn_id.push(result.fieldByName('form_part'));
				}
				
				result.close();
				db.close();
				
				if(!isEditEnabled){
				    var win_new = Titanium.UI.createWindow({
                        fullscreen : false,
                        navBarHidden : true,
                        title: bundle_label,
                        type: curWin.type,
                        url : 'individual_object.js',
                        up_node: curWin.up_node,
                        uid: curWin.uid,
                        region_form: e.row.form_part,
                        backgroundColor: '#000'
                    });
                    
                    //Passing parameters
                    win_new.nid             = e.row.nid;
                    win_new.nameSelected    = e.row.name;
                    
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
                    postDialog.eventSource = e.row;
                    postDialog.show();
                    
                    postDialog.addEventListener('click', function(ev) {
                        if (ev.index === btn_tt.length - 2 ){
                            //Next window to be opened 
                            var win_new = Titanium.UI.createWindow({
                                fullscreen : false,
                                navBarHidden : true,
                                title: bundle_label,
                                type: curWin.type,
                                url : 'individual_object.js',
                                up_node: curWin.up_node,
                                uid: curWin.uid,
                                region_form: e.row.form_part,
                                backgroundColor: '#000'
                            });
                            
                            //Passing parameters
                            win_new.nid				= e.row.nid;
                            win_new.nameSelected	= e.row.name;
                            
                            ev.source.eventSource.setBackgroundColor('#fff');
                            
                            //Avoiding memory leaking
                            win_new.open();
                        }
                        else if (ev.index === btn_tt.length - 1){
                            Ti.API.info("Cancelled");
                        }
                        else if (ev.index !== -1 && isEditEnabled === true){
                            //openEditScreen(btn_id[ev.index], _nid, e);
                        
                            var win_new;
                            win_new = create_or_edit_node.getWindow();
                            win_new.title = bundle_label;
                            win_new.type = curWin.type;
                            win_new.listView = curWin.listView;
                            win_new.up_node = curWin.up_node;
                            win_new.uid = curWin.uid;
                            win_new.region_form = btn_id[ev.index];
                            
                            //Passing parameters
                            win_new.nid = _nid;
                            win_new.nameSelected = e.row.name;
                            
                            //Sets a mode to fields edition
                            win_new.mode = 1;
                            
                            ev.source.eventSource.setBackgroundColor('#fff');
                            
                            win_new.addEventListener("open", function(e){
                                Omadi.service.setNodeViewed(e.source.nid);
                            });
                                
                            win_new.open();
                            setTimeout(function() {
                                create_or_edit_node.loadUI();
                            }, 100);
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
	
	
	search.blur();
	Ti.API.info("END OF OBJECTS WINDOW FILE");
	
	db.close();

	if(PLATFORM === 'android'){
		// bottomBack(curWin, "Back" , "enable", true);
		// if (listTableView != null ){
			// listTableView.bottom = '6%'	
			// listTableView.top = '50dp';
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
	}
		
	unsetUse();
	
}());
