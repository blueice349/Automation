//Current window's instance
var indLog = Ti.UI.currentWindow;

Ti.include('/lib/functions.js'); 

var domainName = Ti.App.Properties.getString("domainName");

//Definition of the window before (opens when the user clicks on the back button)
var goToWindow = Titanium.UI.createWindow({
	fullscreen : false,
	navBarHidden : true,
	title:'Omadi CRM',	
	url : 'mainMenu.js',
	notOpen: false
});

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
   	font:{fontWeight:'bold', fontSize:'15dp'},
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
	
	var logout_xhr = Ti.Network.createHTTPClient();
	
	logout_xhr.open('POST', domainName+'/js-sync/sync/logout.json');
	
	//Timeout until error:
	logout_xhr.setTimeout(10000);
	
	//Header parameters
	logout_xhr.setRequestHeader("Content-Type", "application/json");
	if(PLATFORM == 'android'){
		logout_xhr.setRequestHeader("Cookie", getCookie());// Set cookies
	}
	else{
		var split_cookie = getCookie().split(';');
		if (!split_cookie[0] ){
			split_cookie[0]="";
		}
		logout_xhr.setRequestHeader("Cookie", split_cookie[0]);// Set cookies
	}
	
	logout_xhr.onload = function(e) {
		Ti.App.Properties.setString('logStatus', "You have successfully logged out");
		Ti.API.info('From Functions ... Value is : '+ Ti.App.Properties.getString('logStatus'));
		Ti.App.fireEvent('stop_gps');

		var db = Ti.Database.install('/database/db_list.sqlite',  Titanium.App.Properties.getString("databaseVersion")+"_list"  );
		no_backup(db);	
		db.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
		db.close();
		Ti.App.fireEvent('free_login');
		
		indLog._parent.close();
		hideIndicator();
		logout_xhr.abort();
		indLog.close();
		removeNotifications();
	}

	logout_xhr.onerror = function(e) {
		hideIndicator();
		
		if(this.status == 403 || elements.status == 403 || this.status == 401 || elements.status == 401) {
			Ti.App.Properties.setString('logStatus', "You are logged out");
			
	
			var db = Ti.Database.install('/database/db_list.sqlite',  Titanium.App.Properties.getString("databaseVersion")+"_list"  );
			no_backup(db);	
			db.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
			db.close();
			Ti.App.fireEvent('free_login');
			
			indLog._parent.close();
			hideIndicator();
			logout_xhr.abort();
			indLog.close();
		}
		else{
			Ti.API.info("Failed to log out");
			alert("Failed to log out, please try again");
		}
		
		Ti.App.fireEvent('stop_gps');
		removeNotifications();
	}
	logout_xhr.send();
	
	Ti.App.Properties.setBool("stopGPS", true);
	Ti.App.Properties.setBool("quitApp", true);
	
});

labelIn.addEventListener('click',function (){
	//goToWindow.open();
	indLog.close();		
});


indLog.add(labelOut);
indLog.add(labelIn);
indLog.orientationModes = [ Titanium.UI.PORTRAIT ];