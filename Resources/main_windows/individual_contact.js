/**
 * Name: individual_contact.js
 * Function: 
 * 		Show contact's informations retrieved from the server
 * Provides:
 * 		Internet connection checking.
 * 		the window called by contact.js(contact button)
 *		a way to close the current window and open contact.js. This is achieved when the user clicks on
 * 			"back" on the phone or on the Back button at the app's bottom
 *		the log out button.
 *		the contact information.
 * @author Joseandro
 */

//Common used functions
Ti.include('../lib/functions.js');

//Current window's instance
var win4 = Ti.UI.currentWindow;

//Sets only portrait mode
win4.orientationModes = [ Titanium.UI.PORTRAIT ];

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
	url:'contacts.js',
});

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win4.addEventListener('android:back', function() {
	Ti.API.info("Back to the step before");

	//Passing back the parameters
	goToWindow.log = win4.log;
   	goToWindow.picked = win4.picked;
	goToWindow.result = win4.result;
	goToWindow.name = win4.name;

	//Avoiding memory leaking problems:	
	goToWindow.open();
	win4.close();
});
		showToolbar( win4.name, win4);
		showBottom(win4, goToWindow);
/*
//Checks internet connection's status
if ( !(Titanium.Network.online)) {
		// Goes to the first screen in case of no connection is found
		alert("Please, check your internet connection!");
		Ti.App.Properties.setString('logStatus', "App exited, we didn't find an active internet connection");
		logWindow.open();
		win4.close();
}
else {
	//Shows loading screen:
	showIndicator('modal');
	
	// showToolbar(name, actualWindow)
	showToolbar( win4.name.item(0).text, win4);

	//Opens address to retrieve contact list
	win4.log.open('GET', win4.picked+'/js-api/contact/'+win4.nid+'.xml');
	
	//Header parameters
	win4.log.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	
	//When connected
	win4.log.onload = function(e) {
		
		//Filters response
		var result 		 = this.responseText;
		
		//Parses response into strings
		var xml  		 = Ti.XML.parseString(result);

		//Result's set:
		var nid 		 = xml.documentElement.getElementsByTagName("nid");
		var vid 		 = xml.documentElement.getElementsByTagName("vid");
		var name 	 	 = xml.documentElement.getElementsByTagName("name");
		var first_name 	 = xml.documentElement.getElementsByTagName("first_name");
		var last_name 	 = xml.documentElement.getElementsByTagName("last_name");
		var type 	 	 = xml.documentElement.getElementsByTagName("type");
		var number 	 	 = xml.documentElement.getElementsByTagName("number");
		var extension 	 = xml.documentElement.getElementsByTagName("extension");
	
		
		//Debug
		Ti.API.info('We have '+type.length+' different types ');

		//Check if the list of phone numbers is empty or not
		if (type.length < 1){
			//Shows message contaning no numbers associated
			var empty = Titanium.UI.createLabel({
				height:'auto',
				width: 'auto',
				textAlign: 'center',
				top:   '50%',
				font: {fontSize: 15},
				text:  'There is no number associated to this contact!'
			});
			win4.add(empty);
		}
		else
		{
			//Debug
			Ti.API.info("Worked !");
			
			
			//The view where the results are presented
			var resultView = Ti.UI.createView({
				top: '16%',
				height: '74%',
				width: '90%',
				borderRadius: 5,
				backgroundColor: '#A9A9A9',
				opacity: 0.05
			});
			win4.add(resultView);
			
			//Header where the selected name is presented
			var header = Ti.UI.createView({
				top: '0',
				height: '20%',
				width: '100%',
				borderRadius: 5,
				backgroundColor: '#A9A9A9',
				opacity: 0.1
			});
			resultView.add(header);

			//Label containing "Name" 
			var labelName = Ti.UI.createLabel({
				text: 'Name: ',
				height: 'auto',
				width:  '18%',
				left: '5%',
				font: {fontSize: 11},
				textAlign: 'left',
				touchEnabled: false,
			});
			
			//Label containing the selected name
			var labelNameContent = Ti.UI.createLabel({
				text: name.item(0).text,
				height: 'auto',
				width:  '77%',
				left: '23%',
				font: {fontSize: 11},
				textAlign: 'left',
				touchEnabled: false,
			});

			header.add(labelName);
			header.add(labelNameContent);

			//Support for 3 different kinds of phone:
			switch(type.length){
				//No telephone numbers were found
				case 0:
					//Print message warning, with no numbers associated
					var labelNoResults = Ti.UI.createLabel({
						text: 'No phone numbers assigned',
						height: 'auto',
						width:  'auto',
						textAlign: 'center',
						touchEnabled: false,
						top: '45%'
					});
					
					resultView.add(labelNoResults);
				break;

				//One phone's type was found:
				case 1:
					//Print phone's type on the result's screen
					var labeltype = Ti.UI.createLabel({
						text: type.item(0).text+': ',
						height: '10%',
						width:  '20%',
						textAlign: 'left',
						top: '52%',
						touchEnabled: false,
						left: '10%'
					});
					resultView.add(labeltype);
									
					//Check if there is extension or not
					if (extension.item(0).text != "")
					{
						var extTitle = "Extension: ";
					}
					else
					{
						var extTitle = "";
					}

					//Print "Extension: " if extension is present
					var labeltypeExtension = Ti.UI.createLabel({
						text: extTitle,
						height: '10%',
						width:  '20%',
						textAlign: 'left',
						top: '62%',
						touchEnabled: false,
						left: '10%'
					});
					resultView.add(labeltypeExtension);

					//Print number in the format (XXX) XXX-XXXX 
					var labeltypeContent = Ti.UI.createLabel({
						text: '('+number.item(0).text.slice(0,3)+') '+number.item(0).text.slice(3,6)+'-'+number.item(0).text.slice(6,10),
						height: '10%',
						width:  '60%',
						textAlign: 'left',
						top: '52%',
						left: '40%'
					});
					resultView.add(labeltypeContent);

					//Print extension's content 
					var labeltypeContentExt = Ti.UI.createLabel({
						text: extension.item(0).text,
						height: '10%',
						width:  '60%',
						textAlign: 'left',
						touchEnabled: false,
						top: '62%',
						left: '40%'
					});
					resultView.add(labeltypeContentExt);

					//When number is clicked, make the call
					labeltypeContent.addEventListener('click', function(){
						Titanium.Platform.openURL('tel:'+number.item(0).text);
					});
					
					//Debug information
					Ti.API.info(extension.item(0).text);
	
				break;
				
				//Two phone's type were found:
				case 2:
					//Print phone's type on the result's screen
					var labeltype0 = Ti.UI.createLabel({
						text: type.item(0).text+': ',
						height: '10%',
						width:  '20%',
						textAlign: 'left',
						top: '35%',
						touchEnabled: false,
						left: '10%'
					});
					resultView.add(labeltype0);
					
					//Check if there is extension or not
					if (extension.item(0).text != "")
					{
						var extTitle = "Extension: ";
					}
					else
					{
						var extTitle = "";
					}

					//Print "Extension: " if extension is present					
					var labeltypeExtension0 = Ti.UI.createLabel({
						text: extTitle,
						height: '10%',
						width:  '25%',
						textAlign: 'left',
						top: '45%',
						touchEnabled: false,
						left: '10%'
					});
					resultView.add(labeltypeExtension0);
	
					//Print number in the format (XXX) XXX-XXXX 
					var labeltypeContent0 = Ti.UI.createLabel({
						text: '('+number.item(0).text.slice(0,3)+') '+number.item(0).text.slice(3,6)+'-'+number.item(0).text.slice(6,10),
						height: '10%',
						width:  '60%',
						textAlign: 'left',
						top: '35%',
						left: '40%'
					});
					resultView.add(labeltypeContent0);

					//Print extension's content 
					var labeltypeContentExt0 = Ti.UI.createLabel({
						text: extension.item(0).text,
						height: '10%',
						width:  '60%',
						textAlign: 'left',
						touchEnabled: false,
						top: '45%',
						left: '40%'
					});
					resultView.add(labeltypeContentExt0);
					
					//When number is clicked, make the call
					labeltypeContent0.addEventListener('click', function(){
						Titanium.Platform.openURL('tel:'+number.item(0).text);
					});

					//Print phone's type on the result's screen
					var labeltype1 = Ti.UI.createLabel({
						text: type.item(1).text+': ',
						height: '10%',
						width:  '20%',
						textAlign: 'left',
						top: '65%',
						touchEnabled: false,
						left: '10%'
					});
					resultView.add(labeltype1);

					//Check if there is extension or not
					if (extension.item(1).text != "")
					{
						var extTitle1 = "Extension: ";
					}
					else
					{
						var extTitle1 = "";
					}

					//Print "Extension: " if extension is present
					var labeltypeExtension1 = Ti.UI.createLabel({
						text: extTitle1,
						height: '10%',
						width:  '20%',
						textAlign: 'left',
						top: '85%',
						touchEnabled: false,
						left: '10%'
					});
					resultView.add(labeltypeExtension1);

					//Print number in the format (XXX) XXX-XXXX 
					var labeltypeContent1 = Ti.UI.createLabel({
						text: '('+number.item(1).text.slice(0,3)+') '+number.item(1).text.slice(3,6)+'-'+number.item(1).text.slice(6,10),
						height: '10%',
						width:  '60%',
						textAlign: 'left',
						top: '65%',
						left: '40%'
					});
					resultView.add(labeltypeContent1);

					//Print extension's content 
					var labeltypeContentExt1 = Ti.UI.createLabel({
						text: extension.item(1).text,
						height: '10%',
						width:  '60%',
						textAlign: 'left',
						touchEnabled: false,
						top: '75%',
						left: '40%'
					});
					resultView.add(labeltypeContentExt1);
					
					//When number is clicked, make the call
					labeltypeContent1.addEventListener('click', function(){
						Titanium.Platform.openURL('tel:'+number.item(1).text);
					});
				
				//Debug information
				Ti.API.info('Extension 1:'+ extension.item(0).text);
				Ti.API.info('Extension 2:'+ extension.item(1).text);
	
					
				break;
				
				//Three phone's type were found:				
				case 3:
				//case 4:
				//case 5:
					//Print phone's type on the result's screen
					var labeltype0 = Ti.UI.createLabel({
						text: type.item(0).text+': ',
						height: '10%',
						width:  '20%',
						textAlign: 'left',
						top: '30%',
						touchEnabled: false,
						left: '10%'
					});
					resultView.add(labeltype0);
					
					//Check if there is extension or not
					if (extension.item(0).text != "")
					{
						var extTitle = "Extension: ";
					}
					else
					{
						var extTitle = "";
					}

					//Print "Extension: " if extension is present
					var labeltypeExtension0 = Ti.UI.createLabel({
						text: extTitle,
						height: '10%',
						width:  '20%',
						textAlign: 'left',
						top: '40%',
						touchEnabled: false,
						left: '10%'
					});
					resultView.add(labeltypeExtension0);

					//Print number in the format (XXX) XXX-XXXX 
					var labeltypeContent0 = Ti.UI.createLabel({
						//Number's mask
						text: '('+number.item(0).text.slice(0,3)+') '+number.item(0).text.slice(3,6)+'-'+number.item(0).text.slice(6,10),
						height: '10%',
						width:  '60%',
						textAlign: 'left',
						top: '30%',
						left: '40%'
					});
					resultView.add(labeltypeContent0);
					
					//Print extension's content 
					var labeltypeContentExt0 = Ti.UI.createLabel({
						text: extension.item(0).text,
						height: '10%',
						width:  '60%',
						textAlign: 'left',
						touchEnabled: false,
						top: '40%',
						left: '40%'
					});
					resultView.add(labeltypeContentExt0);

					//When number is clicked, make the call
					labeltypeContent0.addEventListener('click', function(){
						Titanium.Platform.openURL('tel:'+number.item(0).text);
					});

					//Print phone's type on the result's screen
					var labeltype1 = Ti.UI.createLabel({
						text: type.item(1).text+': ',
						height: '10%',
						width:  '20%',
						textAlign: 'left',
						top: '53%',
						touchEnabled: false,
						left: '10%'
					});
					resultView.add(labeltype1);

					//Check if there is extension or not
					if (extension.item(1).text != "")
					{
						var extTitle1 = "Extension: ";
					}
					else
					{
						var extTitle1 = "";
					}
	
					//Print "Extension: " if extension is present
					var labeltypeExtension1 = Ti.UI.createLabel({
						text: extTitle1,
						height: '10%',
						width:  '20%',
						textAlign: 'left',
						top: '63%',
						touchEnabled: false,
						left: '10%'
					});
					resultView.add(labeltypeExtension1);
	
					//Print number in the format (XXX) XXX-XXXX 
					var labeltypeContent1 = Ti.UI.createLabel({
						text: '('+number.item(1).text.slice(0,3)+') '+number.item(1).text.slice(3,6)+'-'+number.item(1).text.slice(6,10),
						height: '10%',
						width:  '60%',
						textAlign: 'left',
						top: '53%',
						left: '40%'
					});
					resultView.add(labeltypeContent1);
					
					//Print extension's content 
					var labeltypeContentExt1 = Ti.UI.createLabel({
						text: extension.item(1).text,
						height: '10%',
						width:  '60%',
						textAlign: 'left',
						touchEnabled: false,
						top: '63%',
						left: '40%'
					});
					
					resultView.add(labeltypeContentExt1);

					//When number is clicked, make the call
					labeltypeContent1.addEventListener('click', function(){
						Titanium.Platform.openURL('tel:'+number.item(1).text);
					});
	
					//Print phone's type on the result's screen
					var labeltype2 = Ti.UI.createLabel({
						text: type.item(2).text+': ',
						height: '10%',
						width:  '20%',
						textAlign: 'left',
						top: '80%',
						touchEnabled: false,
						left: '10%'
					});
					resultView.add(labeltype2);

					//Check if there is extension or not
					if (extension.item(2).text != "")
					{
						var extTitle1 = "Extension: ";
					}
					else
					{
						var extTitle1 = "";
					}

					//Print "Extension: " if extension is present
					var labeltypeExtension2 = Ti.UI.createLabel({
						text: extTitle1,
						height: '10%',
						width:  '20%',
						textAlign: 'left',
						top: '90%',
						touchEnabled: false,
						left: '10%'
					});
					resultView.add(labeltypeExtension2);
	
					//Print number in the format (XXX) XXX-XXXX 					
					var labeltypeContent2 = Ti.UI.createLabel({
						text: '('+number.item(2).text.slice(0,3)+') '+number.item(2).text.slice(3,6)+'-'+number.item(2).text.slice(6,10),
						height: '10%',
						width:  '60%',
						textAlign: 'left',
						top: '80%',
						left: '40%'
					});
					resultView.add(labeltypeContent2);

					//Print extension's content 
					var labeltypeContentExt2 = Ti.UI.createLabel({
						text: extension.item(2).text,
						height: '10%',
						width:  '60%',
						textAlign: 'left',
						touchEnabled: false,
						top: '90%',
						left: '40%'
					});
					
					resultView.add(labeltypeContentExt2);

					//When number is clicked, make the call
					labeltypeContent2.addEventListener('click', function(){
						Titanium.Platform.openURL('tel:'+number.item(2).text);
					});
					
					//Debug information
					Ti.API.info(extension.item(0).text);
					Ti.API.info(extension.item(1).text);
					Ti.API.info(extension.item(2).text);
					
				break;
				
				default:
				break;
			}
	
			
		}
		hideIndicator();

		//showBottom(actualWindow, goToWindow )
		showBottom(win4, goToWindow);
	}
	
	//In case the services are down:
	win4.log.onerror = function(e) {
			hideIndicator();
			Ti.API.info("Services are down");
			alert("Services are down at the moment, please try again later");
	}
	//Sending information
	win4.log.send();				
}
*/