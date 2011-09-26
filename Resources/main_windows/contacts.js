/**
 * Name: contacts.js
 * Function:
 * 		Show contact list retrieved from the server
 * Provides:
 * 		Internet connection checking.
 * 		the window called by mainMenu.js(contact button) and individual_contact.js(Back button)
 *		a way to close the current window and open mainMenu.js. This is achieved when the user clicks on
 * 			"back" on the phone or on the Back button at the app's bottom
 *		the log out button.
 *		the contact list.
 * @author Joseandro
 */

//Common used functions
Ti.include('../lib/functions.js');

//Current window's instance
var win3 = Ti.UI.currentWindow;

//Sets only portrait mode
win3.orientationModes = [Titanium.UI.PORTRAIT];

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
});

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win3.addEventListener('android:back', function() {
	Ti.API.info("Back to the step before");

	//Passing back the parameters
	goToWindow.log = win3.log;
	goToWindow.picked = win3.picked;
	goToWindow.result = win3.result;

	//Avoids memory leaking problems:
	goToWindow.open();
	win3.close();
});

// showToolbar(name, actualWindow)
showToolbar(win3.name, win3);

var db = Ti.Database.install('../database/db.sqlite', 'omadiDb120');
var resultsNames  = db.execute('SELECT * FROM field_person LEFT OUTER JOIN contact ON field_person.nid = contact.nid');

var data = [];
var i = 0;
while (resultsNames.isValidRow())
{
	var row = Ti.UI.createTableViewRow({
		height : 'auto',
		hasChild : false,
		title : resultsNames.fieldByName('full_name')
	});
	//Ti.API.info(resultsNames.fieldByName('full_name'));
	//Ti.API.info('MUST MATCH: '+resultsNames.fieldByName('nid'));	
	var resultsPhones = db.execute('SELECT * FROM field_phone  LEFT OUTER JOIN contact ON field_phone.nid = contact.nid WHERE field_phone.nid = '+resultsNames.fieldByName('nid'));
	while (resultsPhones.isValidRow()){
		//Parameters added to each row
		row.nid = resultsNames.fieldByName('nid');
		row.name = resultsNames.fieldByName('full_name');
		row.number = resultsPhones.fieldByName('number');
		row.ext = resultsPhones.fieldByName('ext');		
		//Ti.API.info('Number: '+resultsPhones.fieldByName('number'));
		//Ti.API.info('Nid: '+resultsPhones.fieldByName('nid'));
		resultsPhones.next();
	}
	resultsPhones.close();
	
	//Populates the array
	data[i] = row;
	i++;
	resultsNames.next();
}
resultsNames.close();


//Check if the list is empty or not
if(data.length < 1) {
	//Shows the empty list
	var empty = Titanium.UI.createLabel({
		height : 'auto',
		width : 'auto',
		top : '50%',
		text : 'Empty contact list!'
	});

	//Debug
	Ti.API.info("XXXXXXX ---- No contacts ! ----- XXXXXX");

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
		top : '12%',
		search : search,
		height : '85%'
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
			url : 'individual_contact.js'
		});

		search.blur();
		//hide keyboard

		//Passing parameters
		win4.log = win3.log;
		win4.picked = win3.picked;
		win4.name = win3.name;
		win4.label_error = win3.label_error;
		win4.result = win3.result;
		win4.nid = e.row.nid;

		//Avoiding memory leaks
		win4.open();
		search.hide();
		win3.close();

	});
	//Adds contact list container to the UI
	win3.add(listTableView);
}
	
//showBottom(actualWindow, goToWindow )
showBottom(win3, goToWindow);
