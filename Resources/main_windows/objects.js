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
var resultsNames  = db.execute('SELECT node.nid, node.title FROM node INNER JOIN '+win3.type+' ON node.nid='+win3.type+'.nid WHERE (node.flag_is_updated=0 OR node.flag_is_updated=1) ORDER BY node.title ASC ');

var data = [];
var i = 0;

i = 0;
while (resultsNames.isValidRow())
{
	var fullName = resultsNames.fieldByName('title');
	var row = Ti.UI.createTableViewRow({
		height : 'auto',
		hasChild : false,
		title : fullName
	});

	//Parameters added to each row
	row.nid = resultsNames.fieldByName('nid');
	row.name = fullName;
	
	//Populates the array
	data[i] = row;
	i++;
	resultsNames.next();
}
var listTableView = null;

//Check if the list is empty or not
if(data.length < 1) {
	//Shows the empty list
	var empty = Titanium.UI.createLabel({
		height : 'auto',
		width : 'auto',
		top : '50%',
		text : 'Empty '+win3.type+' list!'
	});

	//Debug
	Ti.API.info("XXXXXXX ---- No "+win3.type+" ! ----- XXXXXX");

	win3.add(empty);
	//showBottom(actualWindow, goToWindow )
	showBottom(win3, goToWindow);
}
//Shows the contacts
else {
	//Sort the array (A>B>C>...>Z):
	data.sort(sortTableView);

	//Search bar definition
	var search = Ti.UI.createSearchBar({
		hintText : 'Search...',
		autocorrect : false,
		barColor : '#000'
	});
	
	//Contat list container
	var listTableView = Titanium.UI.createTableView({
		data : data,
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
		//Next window to be opened
		var win4 = Titanium.UI.createWindow({
			fullscreen : false,
			title: win3.type.charAt(0).toUpperCase() + win3.type.slice(1),
			type: win3.type,
			url : 'individual_object.js',
			up_node: win3.up_node,
			uid: win3.uid,
			region_form: e.row.form_part,
			backgroundColor: '#000'
		});

		search.blur();
		//hide keyboard

		//Passing parameters
		win4.picked 		 = win3.picked;
		win4.nid 			 = e.row.nid;
		win4.nameSelected 	 = e.row.name;

		//Avoiding memory leaking
		win4.open();
		resultsNames.close();
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

resultsNames.close();
db.close();

//showBottom(actualWindow, goToWindow )
if(PLATFORM == 'android'){
	bottomBack(win3, "Back" , "enable", true);
	if(win3.show_plus == true){
		var activity = win3.activity;
		activity.onCreateOptionsMenu = function(e) {
			var menu = e.menu;
			var menu_edit = menu.add({
				title : 'New',
				order : 0
			});
			menu_edit.setIcon("/images/action.png");
			menu_edit.addEventListener("click", function(e) {
				openCreateNodeScreen();
			});
		}
	}
}else{
	if (listTableView != null){
		listTableView.height = "97%";	
	}
	topToolBar_object();
}

function topToolBar_object(){
	if (listTableView != null ){
		listTableView.top = '40'		
	}

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
		title: win3.type.charAt(0).toUpperCase() + win3.type.slice(1)+' List',
		color:'#fff',
		ellipsize: true,
		wordwrap: false,
		width: 200,
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});
	
	
	var items = [];
	if(win3.show_plus == true){
		var newNode = Ti.UI.createButton({
			title : 'New',
			style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
		});
		newNode.addEventListener('click', function() {
			openCreateNodeScreen();
		}); 
		items = [back, label, space, newNode];
	}else{
		items = [back, label, space];
	}
	
	// create and add toolbar
	var toolbar = Titanium.UI.createToolbar({
		items:items,
		top:0,
		borderTop:false,
		borderBottom:true
	});
	win3.add(toolbar);
};

function openCreateNodeScreen(){
	var win_new = create_or_edit_node.getWindow();
	win_new.title = "New "+ win3.title;
	win_new.type = win3.type;
	win_new.uid = win3.uid;
	win_new.up_node = win3.up_node;
	win_new.mode = 0;
	win_new.picked = win.picked;
	win_new.region_form = 0;
	win_new.backgroundColor = "#EEEEEE";
	win_new.nameSelected = 'Fill Details...';
	win_new.open();
	setTimeout(function(){create_or_edit_node.loadUI();}, 100);
}
