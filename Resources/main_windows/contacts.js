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
win3.orientationModes = [ Titanium.UI.PORTRAIT ];

//
// create base UI root window
//
var logWindow = Titanium.UI.createWindow({  
	fullscreen: true,
	url:'../app.js',
});

//Definition of the window before (opens when the user clicks on the back button)
var goToWindow = Titanium.UI.createWindow({  
	fullscreen: true,
	url:'mainMenu.js',
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

//Checks internet connection's status
if ( !(Titanium.Network.online)) {
		// Goes to the first screen in case of no connection is found
		alert("Please, check your internet connection!");
		Ti.App.Properties.setString('logStatus', "App exited, we didn't find an active internet connection");
		logWindow.open();
		win3.close();
}
else{
	//Shows loading screen:
	showIndicator('modal');
	
	// showToolbar(name, actualWindow)
	showToolbar( win3.name.item(0).text, win3 );
	
	//Opens address to retrieve contact list
	win3.log.open('GET', win3.picked+'/js-api/contact.xml');
	
	//Header parameters
	win3.log.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	
	//When connected
	win3.log.onload = function(e) {

		//Filters response
		var result 		 = this.responseText;
		
		//Parses response into strings
		var xml  		 = Ti.XML.parseString(result);
		
		//Result's set:
		var nItem 		 = xml.documentElement.getElementsByTagName("item");
		var nid 		 = xml.documentElement.getElementsByTagName("nid");
		var name 	 	 = xml.documentElement.getElementsByTagName("name");
		var first_name 	 = xml.documentElement.getElementsByTagName("first_name");
		var last_name 	 = xml.documentElement.getElementsByTagName("last_name");
		
		
		//The array where the contact list is stored
		var data = [];
	 	
	 	//Debug
		Ti.API.info('We have '+nItem.length+' items: ');
	
		//Populate data[] according how many items we found
		for (var i=0;i<nItem.length;i++) {
	
		    var row = Ti.UI.createTableViewRow({height:'auto',hasChild:false, title:name.item(i).text}); 

		    //Parameters added to each row
		    row.nid   = nid.item(i).text;
			row.name  =	name.item(i).text;

		    //Populates the array
		    data[i] = row;
		}
		
		//Check if the list is empty or not
		if (nItem.length < 1){
			//Shows the empty list
			var empty = Titanium.UI.createLabel({
				height:'auto',
				width: 'auto',
				top:   '50%',
				text:  'Empty contact list!'
			});
			
			//Debug
			Ti.API.info("XXXXXXX ---- No contacts ! ----- XXXXXX");

			hideIndicator();
			win3.add(empty);
			
			//showBottom(actualWindow, goToWindow )
			showBottom(win3, goToWindow);
		}
		//Shows the contacts
		else
		{
			//Sort the array (A>B>C>...>Z):
			data.sort(sortTableView);
			
			//Search bar definition
			var search = Ti.UI.createSearchBar({
	   			hintText:'Search...',
	   			autocorrect: false,
				barColor:'#000'
			});
			
			//Contat list container
			var listTableView = Titanium.UI.createTableView({
				data:data,
				top: '12%',
				search: search,
				height: '85%'
			});
			
			// SEARCH BAR EVENTS
			search.addEventListener('change', function(e)
			{
			   e.value; // search string as user types
			});
			
			search.addEventListener('return', function(e)
			{
			   search.blur(); //hides the keyboard
			});
			search.addEventListener('cancel', function(e)
			{
			   search.blur(); //hides the keyboard
			});
	
	
			//When the user clicks on a certain contact, it opens individual_contact.js
			listTableView.addEventListener('click',function(e){
				
				//Next window to be opened
				var win4 = Titanium.UI.createWindow({  
					fullscreen: true,
					url:'individual_contact.js'
				});
			
				search.blur(); //hide keyboard
				
				//Passing parameters
				win4.log	     = win3.log;
				win4.picked 	 = win3.picked;
				win4.name   	 = win3.name;
				win4.label_error = win3.label_error;
				win4.result      = win3.result;
				win4.nid		 = e.row.nid;
				
				//Avoiding memory leaks
				win4.open();
				search.hide();			
				win3.close();
				
			});
	
			//Adds contact list container to the UI
			win3.add(listTableView);
		}
		hideIndicator();
		
		//showBottom(actualWindow, goToWindow )
		showBottom(win3, goToWindow);
	}
	
	//Connection error:
	win3.log.onerror = function(e) {
			hideIndicator();
			Ti.API.info("Services are down");
			alert("Services are down at the moment, please try again later");
	}
	//Sending information and try to connect
	win3.log.send();				
}