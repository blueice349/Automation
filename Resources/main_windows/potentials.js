/**
 * Name: potentials.js
 * Function:
 * 		Show potential's list retrieved from the server
 * Provides:
 * 		the window called by mainMenu.js and individual_potential.js(Back button)
 *		a way to close the current window and open mainMenu.js. This is achieved when the user clicks on
 * 			"back" on the phone or on the Back button at the app's bottom
 *		the potential's list.
 * @author Joseandro
 */

//Common used functions
Ti.include('../lib/functions.js');

//Current window's instance
var win5 = Ti.UI.currentWindow;

//Sets only portrait mode
win5.orientationModes = [Titanium.UI.PORTRAIT];


//
// create base UI root window
//
var logWindow = Titanium.UI.createWindow({
	fullscreen : true,
	url : '../app.js',
});

//Definition of the window before (opens when the user clicks on the back button)
var goToWindow = Titanium.UI.createWindow({
	fullscreen : true,
	url : 'mainMenu.js',
	notOpen: true
});


//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win5.addEventListener('android:back', function() {
	Ti.API.info("Back to the step before");
	win5.close();
});

// showToolbar(name, actualWindow)
//showToolbar(win5.name, win5);

var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
var resultsNames  = db.execute('SELECT nid, name FROM potential');

var data = [];
var i = 0;

i = 0;
while (resultsNames.isValidRow())
{
	var fullName = resultsNames.fieldByName('name');
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


//Check if the list is empty or not
if(data.length < 1) {
	//Shows the empty list
	var empty = Titanium.UI.createLabel({
		height : 'auto',
		width : 'auto',
		top : '50%',
		text : 'Empty potential list!'
	});

	//Debug
	Ti.API.info("XXXXXXX ---- No potentials ! ----- XXXXXX");

	win5.add(empty);
	//showBottom(actualWindow, goToWindow )
	showBottom(win5, goToWindow);
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
		top : '3%',
		search : search,
		height : '91%'
	});
	
	// SEARCH BAR EVENTS
	search.addEventListener('change', function(e) {
		e.value // search string as user types
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

		//Next window to be opened
		var win4 = Titanium.UI.createWindow({
			fullscreen : true,
			url : 'individual_potential.js'
		});

		search.blur();
		//hide keyboard 

		//Passing parameters
		win4.result = win5.result;
		win4.nid = e.row.nid;
		win4.nameSelected = e.row.name;

		//Avoiding memory leaking
		win4.open();
		resultsNames.close();

	});
	//Adds contact list container to the UI
	win5.add(listTableView);
	search.blur();
}
	
//showBottom(actualWindow, goToWindow )
showBottom(win5, goToWindow);


win5.addEventListener('focus', function(){
	setTimeout(function (){
		search.blur();
	}, 100 );
});
