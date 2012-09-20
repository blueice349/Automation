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
Ti.include('/main_windows/create_or_edit_node.js');

//Current window's instance
var win3 = Ti.UI.currentWindow;

//Sets only portrait mode
win3.orientationModes = [Titanium.UI.PORTRAIT];

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win3.addEventListener('android:back', function() {
	//Enable background updates
	unsetUse();	
	win3.close();
});

//Definition of the window before (opens when the user clicks on the back button)
var goToWindow = Titanium.UI.createWindow({
	fullscreen : false,
	title:'Omadi CRM',	
	url : 'mainMenu.js',
	notOpen: true
});


//Lock database for background updates
setUse();

var db = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );
if(PLATFORM != 'android'){db.file.setRemoteBackup(false);}
var resultsNames = "";
var data = new Array();
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
					section.add(aux_data[_i]);
				}
				data.push(section);
			}
			
			aux_data = null;
			aux_data = new Array();
			
			_arr_tables[resultsNames.fieldByName('table_name')] = true;

			var section = Titanium.UI.createTableViewSection({
				height : 'auto',
				headerTitle : resultsNames.fieldByName('table_name').charAt(0).toUpperCase() + resultsNames.fieldByName('table_name').slice(1),
				backgroundColor: '#000',
				color: '#000',
				nid: false,
				visible: true
			});

		}
		
		var fullName = resultsNames.fieldByName('title');
		var row = Ti.UI.createTableViewRow({
			height : 'auto',
			hasChild : false,
			title : fullName,
			form_part: resultsNames.fieldByName('form_part'),
			_type: resultsNames.fieldByName('table_name'),
			color: '#000'
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
				section.add(aux_data[_i]);
			}	
			data.push(section);
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
		text : 'There are no drafts available',
		color: '#000'
	});

	//Debug
	Ti.API.info("XXXXXXX ---- No "+win3.type+" ! ----- XXXXXX");

	win3.add(empty);
	//showBottom(actualWindow, goToWindow )
	//showBottom(win3, goToWindow);
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
		data   : data,
		top	   : '3%',
		search : search,
		height : '91%',
		separatorColor: '#E6E6E6'
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
			
			var win_new = create_or_edit_node.getWindow();
			win_new.title = e.row.title;
			win_new.type = e.row._type;
			win_new.listView = win3.listView;
			win_new.up_node = win3.up_node;
			win_new.uid = win3.uid;
			win_new.region_form = e.row.form_part;

			//Passing parameters
			win_new.nid = e.row.nid;
			win_new.picked = win3.picked;
			win_new.nameSelected = e.row.name;

			//Sets a mode to fields edition
			win_new.mode = 1;

			win_new.open();
			setTimeout(function() {
				create_or_edit_node.loadUI();
			}, 100);
			unsetUse();	
			(PLATFORM=='android')?win3.close():win3.hide();
	
			//win3.close();
			resultsNames.close();
		}
	});

	listTableView.addEventListener('longclick', function(e) {
		//Hide keyboard when returning 
		firstClick = true;
		Ti.API.info('Size : '+e.section.rowCount);

		if (e.row.nid != null){
			Ti.API.info('DELETE');
			Titanium.Media.vibrate();
			
			var a_msg = Titanium.UI.createAlertDialog({
				title:'Omadi',
				buttonNames: ['Yes', 'No'],
				cancel: 1,
				click_index: e.index,
				sec_obj: e.section,
				row_obj: e.row
			});
			
			a_msg.message = 'Are you sure you want to delete the draft "'+e.row.title+'" ?';
			a_msg.show();
			
			a_msg.addEventListener('click', function(e){
				if (e.cancel === false){
					Ti.API.info('deleted');
					Ti.API.info(e.source.click_index);
					listTableView.deleteRow(listTableView.data[0][e.source.click_index]);
					var db = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );
					if(PLATFORM != 'android'){db.file.setRemoteBackup(false);}
					db.execute('UPDATE node SET flag_is_updated = 4 WHERE nid='+e.source.row_obj.nid);
					db.close();
				}
			});
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
if(PLATFORM == 'android'){
	bottomBack_release(win3, "Back" , "enable");
}else{
	draftNavButtons();
}

function draftNavButtons(){
	if(listTableView!=null){listTableView.top = '40'}
	var back = Ti.UI.createButton({
		title : 'Back',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	back.addEventListener('click', function() {
		unsetUse();	
		win3.close();
	});
	
	var space = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});
	var label = Titanium.UI.createButton({
		title: 'Drafts List',
		color:'#fff',
		ellipsize: true,
		wordwrap: false,
		width: 200,
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});
	
	// create and add toolbar
	var toolbar = Titanium.UI.createToolbar({
		items:[back, label, space],
		top:0,
		borderTop:false,
		borderBottom:true
	});
	win3.add(toolbar);
};

