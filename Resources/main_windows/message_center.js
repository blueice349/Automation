//Common used functions
Ti.include('/lib/functions.js');

//Current window's instance
var win = Ti.UI.currentWindow;

//Sets only portrait mode
win.orientationModes = [Titanium.UI.PORTRAIT];

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win.addEventListener('android:back', function() {
	//Enable background updates
	unsetUse();	
	win.close();
});

//Lock database for background updates
setUse();

var db = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );
var res_set = db.execute('SELECT * FROM alerts ORDER BY timestamp DESC');

//Check if the list is empty or not
if(res_set.rowCount == 0) {
	//Shows the empty list
	var empty = Titanium.UI.createLabel({
		height : 'auto',
		width : 'auto',
		top : '50%',
		color: '#000',
		text : 'You have no messages'
	});

	//Debug
	Ti.API.info("XXXXXXX ---- No messages ----- XXXXXX");

	win.add(empty);
}
//Shows the messages
else {
	var data = new Array();
	while (res_set.isValidRow())
	{
		var fullName = res_set.fieldByName('subject');
		var row = Ti.UI.createTableViewRow({
			height : 'auto',
			hasChild : false,
			title : fullName,
			message: res_set.fieldByName('message'),
			color: '#000'
		});
	
		//Parameters added to each row
		row.nid = res_set.fieldByName('ref_nid');
		row.name = fullName;
		
		//Populates the array
		data.push(row);
		res_set.next();
	}

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
		height : '91%',
		separatorColor: '#BDBDBD'
	});
	
	listTableView.addEventListener('focus', function(e) {
		search.blur();
		//hide keyboard
	});
	
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
		var db_t = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );
		var node_f = db_t.execute('SELECT * FROM node WHERE nid='+e.row.nid);
		var type_vl = node_f.fieldByName('table_name'); 
		db_t.close();
		
		var a_msg = Titanium.UI.createAlertDialog({
			title:'Omadi - '+type_vl,
			buttonNames: ['Close', 'See Node'],
			cancel: 0,
			click_index: e.index,
			sec_obj: e.section,
			row_obj: e.row
		});
		
		a_msg.message = e.rowData.message;
		a_msg.show();
		
		a_msg.addEventListener('click', function(e){
			if (e.index != e.cancel){
				Ti.API.info('Opening node if it exists');
				var db_t = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );
				var node_f = db_t.execute('SELECT * FROM node WHERE nid='+e.source.row_obj.nid);
				var type_vl = node_f.fieldByName('table_name'); 
				
				//Next window to be opened
				var win_new = Titanium.UI.createWindow({
					fullscreen : false,
					title: type_vl.charAt(0).toUpperCase() + type_vl.slice(1),
					type: type_vl,
					url : 'individual_object.js',
					up_node: win.up_node,
					uid: win.uid,
					region_form: node_f.fieldByName('form_part')
				});
		
				search.blur();
				//hide keyboard
		
				//Passing parameters
				win_new.picked 			 = win.picked;
				win_new.nid 			 = e.source.row_obj.nid;
				win_new.nameSelected 	 = node_f.fieldByName('title');
				db_t.close();
				
				//Avoiding memory leaking
				win_new.open();
			}
		});
	});
	
	//Adds contact list container to the UI
	win.add(listTableView);
	search.blur();
	win.addEventListener('focus', function(){
		setTimeout(function (){
			search.blur();
		}, 110 );
	});
}

db.close();
if(PLATFORM == 'android'){
	bottomBack_release(win, "Back" , "enable");
}else{
	alertNavButtons();
}

function alertNavButtons(){
	listTableView.top = '40'
	var back = Ti.UI.createButton({
		title : 'Back',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	back.addEventListener('click', function() {
		unsetUse();	
		win.close();
	});
	
	var space = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});
	var label = Titanium.UI.createButton({
		title: 'Alert List',
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
	win.add(toolbar);
};
