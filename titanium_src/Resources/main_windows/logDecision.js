//Current window's instance
var indLog = Ti.UI.currentWindow;

Ti.include('/lib/functions.js'); 

//Definition of the window before (opens when the user clicks on the back button)
var goToWindow = Titanium.UI.createWindow({
	fullscreen : false,
	title:'Omadi CRM',	
	url : 'mainMenu.js',
	notOpen: false
});

goToWindow.log    = indLog.log;
goToWindow.picked = indLog.picked;
goToWindow.result = indLog.result;

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
indLog.addEventListener('android:back', function() {
	Ti.API.info("Back to the step before");

	//Avoids memory leaking problems:
	//goToWindow.open();
	indLog.close();
});

// Alert message
var message = Titanium.UI.createLabel({
    text:'Are you sure you want to log out?',
    color:'#000',
    width:'auto',
    height:'auto',
    textAlign:'center',
   	font:{fontWeight:'bold', fontSize:'14'},
    top:'35%'
});
 
indLog.add(message);
    
// buttons/labels of decision
var labelOut = Titanium.UI.createButton({
	title: 'Yes',
    width:'20%',
    height:'7%',
    top:'50%',
    left: '18%'
}); 

var labelIn = Titanium.UI.createButton({
	title: 'No',
    width:'20%',
    height:'7%',
    top:'50%',
    right: '18%'
});    

labelOut.addEventListener('click',function (){
	Ti.App.fireEvent('upload_gps_locations');
	showIndicator("Logging you out...");
	
	indLog.log.open('POST', indLog.picked+'/js-sync/sync/logout.json');
	
	//Timeout until error:
	indLog.log.setTimeout(10000);
	
	//Header parameters
	indLog.log.setRequestHeader("Content-Type", "application/json");
	
	indLog.log.onload = function(e) {
		Ti.App.Properties.setString('logStatus', "You have successfully logged out");
		Ti.API.info('From Functions ... Value is : '+ Ti.App.Properties.getString('logStatus'));
		if( getDeviceTypeIndentifier() == "android"){
			Ti.App.fireEvent('stop_gps');
		}
		Ti.App.fireEvent('free_login');
		
		indLog._parent.close();
		hideIndicator();
		indLog.log.abort();
		indLog.close();
		
	}

	indLog.log.onerror = function(e) {
		hideIndicator();
		Ti.API.info("Failed to log out");
		alert("Failed to log out, please try again");
	}
	indLog.log.send();
});

labelIn.addEventListener('click',function (){
	//goToWindow.open();
	indLog.close();		
});


indLog.add(labelOut);
indLog.add(labelIn);
indLog.orientationModes = [ Titanium.UI.PORTRAIT ];