//Current window's instance
var indLog = Ti.UI.currentWindow;

//Common used functions
Ti.include('../lib/functions.js');

// window container
winMenu = Titanium.UI.createWindow({
    url: 'mainMenu.js',
    fullscreen: true
});

winMenu.log		 = indLog.log;
winMenu.result	 = indLog.result;
winMenu.picked 	 = indLog.picked;


// Alert message
var message = Titanium.UI.createLabel({
    text:'Are you sure you want to log out?',
    color:'#fff',
    width:'auto',
    height:'auto',
    textAlign:'center',
    font:{fontFamily:'Helvetica Neue',fontWeight:'bold', fontSize:'14'},
    top:'35%'
});
 
indLog.add(message);
    
// buttons/labels of decision
var labelOut = Titanium.UI.createLabel({
    text:'Yes',
    color:'#fff',
    width:'auto',
    height:'auto',
    font:{fontFamily:'Helvetica Neue',fontWeight:'bold'},
    top:'50%',
    left: '25%'
}); 

var labelIn = Titanium.UI.createLabel({
    text:'No',
    color:'#fff',
    width:'auto',
    height:'auto',
    textAlign:'center',
    font:{fontFamily:'Helvetica Neue',fontWeight:'bold'},
    top:'50%',
    left: '62%'
});    

labelOut.addEventListener('click',function (){
	showIndicator("full");
	//alert(picked);
	indLog.log.open('POST', indLog.picked+'/js-login/user/logout.json');
	
	//Timeout until error:
	indLog.log.setTimeout(10000);
	
	//Header parameters
	indLog.log.setRequestHeader("Content-Type", "application/json");
	
	indLog.log.onload = function(e) {
		var logWindow = Titanium.UI.createWindow({  
			fullscreen: true,
			url:'../app.js',
		});

		Ti.App.Properties.setString('logStatus', "You have succefully logged out");
		Ti.API.info('From Functions ... Value is : '+ Ti.App.Properties.getString('logStatus'));
		logWindow.open();
		hideIndicator();
		indLog.log.abort();
		indLog.close();
	}

	indLog.log.onerror = function(e) {
		hideIndicator();
		Ti.API.info("Failed to log out");
		alert("Failed to log out, try again in a few moments");
	}
	indLog.log.send();
});

labelIn.addEventListener('click',function (){
	winMenu.open();
	indLog.close({opacity:0,duration:0});		
});

indLog.add(labelOut);
indLog.add(labelIn);
indLog.orientationModes = [ Titanium.UI.PORTRAIT ];