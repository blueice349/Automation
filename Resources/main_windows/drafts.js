/**
 * Name: objects.js
 * Function:
 * 		Show objects' list retrieved from the database
 * Provides:
 * 		the window called by mainMenu.js and individual_object.js(Back button)
 *		a way to close the current window and open mainMenu.js. This is achieved when the user clicks on
 * 			"back" on the phone or on the Back button at the app's bottom
 *		the objects' list.
 * @author Joseandro
 */

//Common used functions
Ti.include('/lib/functions.js');

//Current window's instance
var win3 = Ti.UI.currentWindow;

//Sets only portrait mode
win3.orientationModes = [Titanium.UI.PORTRAIT];

//Definition of the window before (opens when the user clicks on the back button)
var goToWindow = Titanium.UI.createWindow({
	fullscreen : false,
	title:'Omadi CRM',	
	url : 'mainMenu.js',
	notOpen: true
});

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win3.addEventListener('android:back', function() {
	//Enable background updates
	unsetUse();
	
	win3.close();
});

//Lock database for background updates
setUse();

var db = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );
var resultsNames = "";
var data = [];
var i = 0;
var _arr_tables = [];
var resultsNames = db.execute('SELECT * FROM node WHERE flag_is_updated=3 ORDER BY table_name ASC ');
if (resultsNames.rowCount == 0){
	resultsNames = null;
	Ti.API.info('0 drafts');
}
else{
	Ti.API.info(resultsNames.rowCount+' drafts ..');
	while (resultsNames.isValidRow()){
		if (!_arr_tables[resultsNames.fieldByName('table_name')]){
			
			if (i != 0 ){
				aux_data.sort(sortTableView);
				for (var _i in aux_data ){
					data.push(aux_data[_i]);
				}
			}
			
			aux_data = null;
			aux_data = new Array();
			
			_arr_tables[resultsNames.fieldByName('table_name')] = true;

			var row = Ti.UI.createTableViewRow({
				height : 'auto',
				hasChild : false,
				title : resultsNames.fieldByName('table_name').charAt(0).toUpperCase() + resultsNames.fieldByName('table_name').slice(1),
				backgroundColor: '#FFF',
				color: '#000'
			});

			//Parameters added to each row
			row.nid = false;
			row.name = resultsNames.fieldByName('table_name');
			//Populates the array
			data.push(row);
			i++;			
		}
		
		var fullName = resultsNames.fieldByName('title');
		var row = Ti.UI.createTableViewRow({
			height : 'auto',
			hasChild : false,
			title : fullName,
			_type: resultsNames.fieldByName('table_name')
		});
		
		//Parameters added to each row
		row.nid = resultsNames.fieldByName('nid');
		row.name = fullName;
		
		//Populates the array
		aux_data.push(row);
		i++;
		resultsNames.next();
		
		if (!resultsNames.isValidRow()){
			aux_data.sort(sortTableView);
			for (var _i in aux_data ){
				data.push(aux_data[_i]);
			}			
		}
	}
}

//Check if the list is empty or not
if(data.length < 1) {
	//Shows the empty list
	var empty = Titanium.UI.createLabel({
		height : 'auto',
		width : 'auto',
		top : '50%',
		text : 'There are no drafts available'
	});

	//Debug
	Ti.API.info("XXXXXXX ---- No "+win3.type+" ! ----- XXXXXX");

	win3.add(empty);
	//showBottom(actualWindow, goToWindow )
	showBottom(win3, goToWindow);
}
//Shows the contacts
else {

	//Search bar definition
	var search = Ti.UI.createSearchBar({
		hintText : 'Search...',
		autocorrect : false,
		barColor : '#000'
	});
	
	//Contat list container
	var listTableView = Titanium.UI.createTableView({
		data : data,
		top : '3%',
		search : search,
		height : '91%'
	});
	
	listTableView.addEventListener('focus', function(e) {
		search.blur();
		//hides the keyboard
	});
	
	//Sort the array (A>B>C>...>Z):
	data.sort(sortTableView);

	// SEARCH BAR EVENTS
	search.addEventListener('change', function(e) {
		//e.value; // search string as user types
	});

	search.addEventListener('return', function(e) {
		search.blur();
		//hides the keyboard
	});
	
	search.addEventListener('cancel', function(e) {
		search.blur();
		//hides the keyboard
	});

	//When the user clicks on a certain contact, it opens individual_contact.js
	listTableView.addEventListener('click', function(e) {
		//Hide keyboard when returning 
		firstClick = true;
		if (e.row.nid != null){
			//Next window to be opened
			var win_new = Titanium.UI.createWindow({
				fullscreen : false,
				title: e.row.title,
				type: e.row._type,
				url : 'create_or_edit_node.js',
				listView: win3.listView,
				up_node: win3.up_node,
				uid: win3.uid,
			});
	
			//Passing parameters
			win_new.nid = e.row.nid;
			win_new.picked 	 = win3.picked;
			win_new.nameSelected = e.row.name;
			
			//Sets a mode to fields edition
			win_new.mode = 1;
			
			win_new.open();
			win3.close();
			resultsNames.close();
		}
	});

	//Adds contact list container to the UI
	win3.add(listTableView);
	search.blur();
	win3.addEventListener('focus', function(){
		setTimeout(function (){
			search.blur();
		}, 110 );
	});


}
if (resultsNames != null){
	resultsNames.close();	
}
db.close();

//showBottom(actualWindow, goToWindow )
bottomBack(win3, "Back" , "enable");
