/**
 * Name: objects.js
 * Function:
 * 		Show objects' list retrieved from the database
 * Provides:
 * 		the window called by mainMenu.js and individual_object.js(Back button)
 *		a way to close the current window and open mainMenu.js. This is achieved when the user clicks on
 * 			"back" on the phone or on the Back button at the app's bottom
 *		the objects' list.
 */

//Common used functions
Ti.include('/lib/functions.js');
Ti.include('/main_windows/create_or_edit_node.js');

//Current window's instance
var curWin = Ti.UI.currentWindow;

//Sets only portrait mode
curWin.orientationModes = [Titanium.UI.PORTRAIT];
var movement = curWin.movement;

//Definition of the window before (opens when the user clicks on the back button)
var goToWindow = Titanium.UI.createWindow({
	fullscreen : false,
	navBarHidden : true,
	title:'Omadi CRM',	
	url : 'mainMenu.js',
	notOpen: true
});

 var backButtonPressed = function(){
	 unsetUse();
	 Ti.UI.currentWindow.close();
 };

 curWin.addEventListener('android:back', backButtonPressed);

//Lock database for background updates
//setUse();

var db = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );
if(PLATFORM != 'android'){db.file.setRemoteBackup(false);}

var db_result;

var filterValues = curWin.filterValues;

for(i in filterValues){
	Ti.API.info('FILTER VALUE TOP: ' + i + ": "+ filterValues[i]);	
}

var filterFields = [];
filterFields.push({
	field_name: "tow_yard",
	field_type: "taxonomy_term_reference"
});

filterFields.push({
	field_name: "form_part",
	field_type: "metadata"
});

if(typeof filterValues != "object"){
	filterValues = [];
}

for(i in filterValues){
	Ti.API.info('FILTER VALUE MIDDLE: ' + i + ": "+ filterValues[i]);	
}

var numFilters = filterFields.length;
var numFilterValues = filterValues.length;

var tableData = [];
var tableIndex = 0;

showFinalResults = false;

var text_values = [];


var sql;

if(numFilterValues < numFilters){
	sql = "SELECT DISTINCT ";
	
	lastFilterField = filterFields[numFilterValues];

	var field_name = lastFilterField.field_name;
	var field_type = lastFilterField.field_type;
	
	if(field_type == 'taxonomy_term_reference'){
		sql += field_name + ' AS value';
	}
	else if(field_name == 'form_part'){
		sql += 'n.form_part AS value'
	}
	
	sql += " FROM " + curWin.type + " type ";
	
	if(field_name == 'form_part'){
		sql += " INNER JOIN node n ON n.nid = type.nid";
	}
	
}
else{//(numFilterValues == numFilters){
	sql = "SELECT n.title AS title, n.nid AS nid FROM node n INNER JOIN " + curWin.type + " type ON type.nid = n.nid ";
	
	showFinalResults = true;
}

var conditions = [];

if(filterFields.length > 0){
	for(i in filterFields){
		var field_name = filterFields[i].field_name;
		Ti.API.info("FILTER FIELD NAME: " + field_name);
		Ti.API.info("FILTER VALUE BELOW: " + i + ": " + filterValues[i] );
		
		if(typeof filterValues[i] != 'undefined' && filterValues[i] !== false){
			var filterValue = filterValues[i];
			
			Ti.API.info("FILTER VALUE 4: " + i + " " + filterValue);
			// Filter with the current filter
			
			// Show all results with filters applied
			Ti.API.info("LIST FILTER: Show all results.");
			if(filterValue == ''){
				conditions.push(field_name + ' IS NULL');
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

db_result = db.execute(sql);

if(showFinalResults){
	while(db_result.isValidRow()){
		
		Ti.API.info("FILTER FINAL RESULT: " + db_result.fieldByName('nid'));
		Ti.API.info("FILTER FINAL RESULT: " + db_result.fieldByName('title'));
		
		var row = Ti.UI.createTableViewRow({
			height : '50dp',
			hasChild : false,
			title : db_result.fieldByName('title'),
			color: '#000',
			nid: db_result.fieldByName('nid')
		});
		
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
	
	if(field_type == 'taxonomy_term_reference'){
		db_result = db.execute("SELECT tid AS value, name AS text_value FROM term_data WHERE tid IN (" + values.join(",") + ")");
		while(db_result.isValidRow()){
			text_values[db_result.fieldByName('value')] = db_result.fieldByName('text_value');			
			Ti.API.info("FILTER: " + db_result.fieldByName('text_value'));
			db_result.next();
		}
		
		db_result.close();
	}
	else if(field_name == 'form_part'){
		var db_result = db.execute('SELECT _data FROM bundles WHERE bundle_name="' + curWin.type + '"');
		var bundle_data = JSON.parse(db_result.fieldByName('_data'));

		if (bundle_data.form_parts != null && bundle_data.form_parts != "") {
			Ti.API.info('Form table part = ' + bundle_data.form_parts.parts.length);
			if (bundle_data.form_parts.parts.length > 0) {
				for(i in bundle_data.form_parts.parts){
					text_values[i] = bundle_data.form_parts.parts[i].label;
					Ti.API.info("FILTER: " + bundle_data.form_parts.parts[i].label);
				}
			}
		}
		db_result.close();
	}
	

	tableIndex = 0;
	for(i in values){
	
		//var text_value = '- Empty - ';
		//if(value > 0){
		var text_value = text_values[values[i]];
		//}
		
		var row = Ti.UI.createTableViewRow({
			height : '60dp',
			hasChild : true,
			title : text_value,
			color: '#000',
			filterValue: values[i],
			filterValueText: text_value	
		});
		
		tableData[tableIndex] = row;
		tableIndex++;
	}	
}



// if(typeof filterValues[0] != 'undefined'){
	// // //When back button on the phone is pressed, it opens mainMenu.js and close the current window
// 

// }
// else{
	// db_result = db.execute('SELECT DISTINCT tow_yard as tid, td.name as name FROM tow type LEFT JOIN term_data td ON td.tid = type.tow_yard');
// }




// if(typeof filterValue1 != 'undefined'){

// }
// else{
// 	
// 	
// }



//Contat list container
var filterOneTableView = Titanium.UI.createTableView({
	data : tableData,
	separatorColor: '#BDBDBD',
	top: '50dp'
});

var topBar = Titanium.UI.createView({
   backgroundColor:'#666',
   top: 0,
   height: '70dp'
});

var listLabel = Ti.UI.createLabel({
	font: {fontWeight: "bold"},
	text: "Tow List",
	top: '10dp',
	left: '10dp',
	textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT	
});

var filterLabel = Ti.UI.createLabel({
  color:'#fff',
  text: 'Tow Yard: Salt Lake',
  textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
  top: '30dp',
  left: '15dp'
});

var showAllButton = Ti.UI.createButton({
	title: 'Show All',
	top: '10dp',
	right: '10dp',
	width: '100dp',
	height: '50dp'
});

topBar.add(listLabel);
topBar.add(filterLabel);
topBar.add(showAllButton);

curWin.add(topBar);
curWin.add(filterOneTableView);


// TABLE EVENTS


if(showFinalResults){
	// //When the user clicks on a certain contact, it opens individual_contact.js
	filterOneTableView.addEventListener('click', function(e) {
		//Hide keyboard when returning 
		//search.blur();
		bottomButtons1(e.row.nid, curWin, e);
		//resultsNames.close();
	});
}
else{

	filterOneTableView.addEventListener('click', function(e) {
		//Hide keyboard when returning 
		//refreshDataTable();
		var newFilterValue = e.row.filterValue;
		Ti.API.info(e.row.filterValue);
		
		//Titanium.App.Properties.setString("filterValue1",e.row.filterValue);
		
		var newWin = Ti.UI.createWindow({
		    backgroundColor: '#FFF',
		    title:'Just Messing around',
		    tabBarHidden:false,
		    url: 'main_windows/objects.js',
		    navBarHidden: true,
		    type: curWin.type
		});
		
		var filterValues = curWin.filterValues;
		
		if(typeof filterValues != "object"){
			filterValues = [];
		}
		
		filterValues.push(newFilterValue);
		
		newWin.filterValues = filterValues;
		
		// Remove the listener to close the first window
		//e.row.cWin.removeEventListener('android:back', backButtonPressed);
		
		newWin.open();
	});
}
	

// var resultsNames  = db.execute('SELECT node.nid, node.title FROM node INNER JOIN '+curWin.type+' ON node.nid='+curWin.type+'.nid WHERE (node.flag_is_updated=0 OR node.flag_is_updated=1) ORDER BY node.title ASC ');
// 
// var data = [];
// var filterData = [];
// var i = 0;
// 
// i = 0;
// while (resultsNames.isValidRow())
// {
	// var fullName = resultsNames.fieldByName('title');
	// var row = Ti.UI.createTableViewRow({
		// height : '60dp',
		// hasChild : false,
		// title : fullName,
		// color: '#000'
	// });
// 
	// //Parameters added to each row
	// row.nid = resultsNames.fieldByName('nid');
	// row.name = fullName;
// 	
	// //Populates the array
	// data[i] = row;
	// i++;
	// resultsNames.next();
// }
// var listTableView = null;
// 
// //Check if the list is empty or not
// if(data.length < 1) {
	// //Shows the empty list
	// var empty = Titanium.UI.createLabel({
		// height : 'auto',
		// width : 'auto',
		// top : '50%',
		// text : 'No '+curWin.type+' has been saved.'
	// });
// 
	// //Debug
	// Ti.API.info("XXXXXXX ---- No "+curWin.type+" ! ----- XXXXXX");
// 
	// curWin.add(empty);
	// //showBottom(actualWindow, goToWindow )
	// showBottom(curWin, goToWindow);
// }
// //Shows the contacts
// else {
	// //Sort the array (A>B>C>...>Z):
	// data.sort(sortTableView);
// 
	// //Search bar definition
	// var search = Ti.UI.createSearchBar({
		// hintText : 'Search...',
		// autocorrect : false,
		// barColor : '#000',
		// top: 0,
		// color: 'black',
		// height: '50dp'
	// });
// 	
	// //Contat list container
	// var listTableView = Titanium.UI.createTableView({
		// data : data,
		// //height : '91%',
		// separatorColor: '#BDBDBD'
	// });
// 	
	// listTableView.addEventListener('focus', function(e) {
		// search.blur();
		// //hides the keyboard
	// });
// 	
	// //Sort the array (A>B>C>...>Z):
	// data.sort(sortTableView);
// 
	// // SEARCH BAR EVENTS
	// search.addEventListener('change', function(e) {
		// //e.value; // search string as user types
		// filterData = [];
		// for(var i = 0; i < data.length; i++) {
			// var rg = new RegExp(e.source.value, 'i');
			// if(data[i].title.search(rg) != -1) {
				// filterData.push(data[i]);
			// }
		// }
		// listTableView.setData(filterData);
// 		
// 		
	// });
// 
	// search.addEventListener('return', function(e) {
		// search.blur();
		// //hides the keyboard
	// });
// 	
	// search.addEventListener('cancel', function(e) {
		// e.source.value = "";
		// search.blur();
		// //hides the keyboard
	// });
// 	
	// curWin.addEventListener('android:menu', function() {
		// alert('clicked');
	// });
// 	
	// //When the user clicks on a certain contact, it opens individual_contact.js
	// listTableView.addEventListener('click', function(e) {
		// //Hide keyboard when returning 
		// search.blur();
		// bottomButtons1(e.row.nid, curWin, e);
		// resultsNames.close();
	// });
	// //Adds contact list container to the UI
	// curWin.add(search);
	// curWin.add(listTableView);
	// search.blur();
// }
// 
// resultsNames.close();


db.close();

//showBottom(actualWindow, goToWindow )
// if(PLATFORM == 'android'){
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
// }else{
	// topToolBar_object();
// }

function topToolBar_object(){
	if (listTableView != null ){
		listTableView.top = '90'	
		search.top = '40';
		listTableView.bottom = 0;			
	}

	var back = Ti.UI.createButton({
		title : 'Back',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	back.addEventListener('click', function() {
		unsetUse();
		curWin.close();
	});
	
	var space = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});
	var label = Titanium.UI.createButton({
		title: curWin.type.charAt(0).toUpperCase() + curWin.type.slice(1)+' List',
		color:'#fff',
		ellipsize: true,
		wordwrap: false,
		width: 200,
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});
	
	
	var items = [];
	if(curWin.show_plus == true){
		var newNode = Ti.UI.createButton({
			title : 'New',
			style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
		});
		newNode.addEventListener('click', function() {
			openCreateNodeScreen();
		}); 
		items = [back, space, label, space, newNode];
	}else{
		items = (Ti.Platform.osname == 'ipad')? [back, space, label, space]:[back, label, space]
	}
	
	// create and add toolbar
	var toolbar = Ti.UI.iOS.createToolbar({
		items:items,
		top:0,
		borderTop:false,
		borderBottom:true
	});
	curWin.add(toolbar);
};

function openCreateNodeScreen(){
	var win_new = create_or_edit_node.getWindow();
	win_new.title = "New "+ curWin.title;
	win_new.type = curWin.type;
	win_new.uid = curWin.uid;
	win_new.up_node = curWin.up_node;
	win_new.mode = 0;
	win_new.picked = win.picked;
	win_new.region_form = 0;
	win_new.backgroundColor = "#EEEEEE";
	win_new.nameSelected = 'Fill Details...';
	win_new.open();
	setTimeout(function(){create_or_edit_node.loadUI();}, 100);
}


function openEditScreen(part, nid, e){
//Next window to be opened
	var win_new = create_or_edit_node.getWindow();
	win_new.title = (PLATFORM == 'android') ? curWin.title + '-' + e.row.name:curWin.title;
	win_new.type = curWin.type;
	win_new.listView = curWin.listView;
	win_new.up_node = curWin.up_node;
	win_new.uid = curWin.uid;
	win_new.region_form = part;
	win_new.movement = curWin.movement;

	//Passing parameters
	win_new.nid = nid;
	win_new.picked = curWin.picked;
	win_new.nameSelected =  e.row.name;

	//Sets a mode to fields edition
	win_new.mode = 1;

	win_new.open();
	setTimeout(function() {
		create_or_edit_node.loadUI();
	}, 100);
}


function bottomButtons1(_nid, curWin, e){
	var db_act = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
	if(PLATFORM != 'android'){db_act.file.setRemoteBackup(false);}
	var json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + curWin.type + '"');
	var _data = JSON.parse(json_data.fieldByName('_data'));

	var node_form = db_act.execute('SELECT form_part, perm_edit FROM node WHERE nid=' + _nid);

	Ti.API.info('Form node part = ' + node_form.fieldByName('form_part'));
	
	var btn_tt = [];
	var btn_id = [];
	var isEditEnabled = false;
	if(node_form.fieldByName('perm_edit')==1){
		if(_data.form_parts!=null && _data.form_parts!=""){
			Ti.API.info('Form table part = ' + _data.form_parts.parts.length);
			if(_data.form_parts.parts.length >= parseInt(node_form.fieldByName('form_part')) + 2) { 
				Ti.API.info("Title = " + _data.form_parts.parts[node_form.fieldByName('form_part') + 1].label);
				btn_tt.push(_data.form_parts.parts[node_form.fieldByName('form_part') + 1].label);
				btn_id.push(node_form.fieldByName('form_part') + 1);
				Ti.API.info(node_form.fieldByName('form_part') + 1);
			}
		}
		isEditEnabled = true;
		btn_tt.push('Edit');
		btn_id.push(node_form.fieldByName('form_part'));
	}
	
	btn_tt.push('View');
	btn_id.push(0);
	
	json_data.close();
	db_act.close();

	btn_tt.push('Cancel');
	btn_id.push(0);

	var postDialog = Titanium.UI.createOptionDialog();
	postDialog.options = btn_tt;
	postDialog.show();

	postDialog.addEventListener('click', function(ev) {
			if (ev.index == btn_tt.length-2 ){
				//Next window to be opened 
				var win_new = Titanium.UI.createWindow({
					fullscreen : false,
					navBarHidden : true,
					title: curWin.type.charAt(0).toUpperCase() + curWin.type.slice(1),
					type: curWin.type,
					url : 'individual_object.js',
					up_node: curWin.up_node,
					uid: curWin.uid,
					region_form: e.row.form_part,
					backgroundColor: '#000'
				});
		
				//Passing parameters
				win_new.picked 		 = curWin.picked;
				win_new.nid 			 = e.row.nid;
				win_new.nameSelected 	 = e.row.name;
				win_new.movement = curWin.movement;
		
				//Avoiding memory leaking
				win_new.open();
			}
			else if (ev.index  == btn_tt.length-1){
				Ti.API.info("Cancelled")
			}
			else if (ev.index != -1 && isEditEnabled==true){
				openEditScreen(btn_id[ev.index], _nid, e);
			}
	});	
};