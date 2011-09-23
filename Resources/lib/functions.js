/**
 * Name: functions.js
 * Provides:
 * 		Functions used by the app
 * @author Joseandro
 */

/* Function Name: showIndicator(show)
 * Purpouse: Show the loading screen
 * Parameters: 
 * 	show:   Used to decide if the loading screen should be modal or
 * 			full screen.
 * Variables: 
 * 	indWin:  Window that is supposed to contain the loading screen
 * 			 modal or fullscreen.
 * 	indView: The view that contains actInd.
 * 	actInd:  Activity indicator.  
 *  
 */
function showIndicator(show)
{
 
    // window container
    if ( show == 'modal'){ 
    indWin = Titanium.UI.createWindow({
        modal: true,
        opacity: 0.9,
        backgroundColor: '#000000'
    });
    }
    else{ 
	    indWin = Titanium.UI.createWindow({
	        fullscreen: true
	    });
    }
 
    // black view
    var indView = Titanium.UI.createView({
        height: '32%',
        width: '70%',
        backgroundColor:'#000',
        borderRadius:10,
        opacity:0.9
    });
 
    indWin.add(indView);
 
    // loading indicator
    actInd = Titanium.UI.createActivityIndicator({
        height:'7%',
        message: "Loading ...",
        width: '30%'
    });
    
    indWin.add(actInd);
 
    // message
    var message = Titanium.UI.createLabel({
        text:'Communicating with' + '\n' + 'the server...',
        color:'#fff',
        width:'auto',
        height:'auto',
        textAlign:'center',
        font:{fontFamily:'Helvetica Neue',fontWeight:'bold'},
        top:'67%'
    });
 
    indWin.add(message);
	indWin.orientationModes = [ Titanium.UI.PORTRAIT ];
    indWin.open();
    actInd.show();
};

/* Function Name: hideIndicator()
 * Purpouse: Close the loading screen
 * Parameters: none
 * Variables: 
 * 	indWin:  Window that is supposed to contain the loading screen
 * 			 modal or fullscreen.
 * 	actInd:  Activity indicator.  
 *  
 */

function hideIndicator()
{
    actInd.hide();
    indWin.close();
};


/* Function Name: showToolbar(name, actualWindow)
 * 
 * Purpouse: Show the toolbar where the user can log out. 
 * 			 Provides also the methods to log the user out
 * 
 * Parameters: 
 * 	name: 	 The logged username showed on the toolbar
 *  actualWindow: The reference's window. Where the function is being called.
 * 
 * Variables:
 * 	loggedView: View to represent the toolbar on top
 *  label_top:  Label containing the logged username
 *  offImage:   The "X" on the top. It is provided by android natively.
 *  indLog:		Black window that contains the buttons to log out or not
 *  labelOut:   Label that contains "YES" (when clicked logs out the user and opens app.js )
 *  labelIn:    Label that contains "NO" (when clicked close loggedView and goes back to the app)
 */
function showToolbar(name, actualWindow){
	var loggedView = Titanium.UI.createView({
		top: '0px',	
		backgroundColor:'#111',
		height: '10%',
		width: '100%',
		opacity: 0.99,
		borderRadius:5
	});
	
	var label_top = Titanium.UI.createLabel({
		color:'#FFFFFF',
		text:'Logged in as '+ name,
		textAlign: 'left',
		width:'75%',
		left: '5%',
		horizontalAlign: 'left',
		height: 'auto'
	}); 
	
	var offImage = Titanium.UI.createImageView({
	    image: Titanium.Android.R.drawable.ic_menu_close_clear_cancel,
		left: '85%',
		width:'30px',
		height: '30px'
	});
	
	loggedView.add(label_top);
	loggedView.add(offImage);					
	actualWindow.add(loggedView);
	
	offImage.addEventListener('click',function(e)
	{
	    // window container
	    indLog = Titanium.UI.createWindow({
	        opacity: 0.95,
	        backgroundColor: '#000000'
	    });
	
	    // Alert message
	    var message = Titanium.UI.createLabel({
	        text:'Do you wanna log out?',
	        color:'#fff',
	        width:'auto',
	        height:'auto',
	        textAlign:'center',
	        font:{fontFamily:'Helvetica Neue',fontWeight:'bold'},
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
	
		labelIn.addEventListener('click',function (){
	    	indLog.close({opacity:0,duration:0});		
		});
		
		labelOut.addEventListener('click',function (){
			showIndicator('modal');
			
			//alert(picked);
			actualWindow.log.open('POST', actualWindow.picked+'/js-login/user/logout.xml');
			
			//Timeout until error:
			actualWindow.log.setTimeout(10000);
			
			//Header parameters
			actualWindow.log.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			
			actualWindow.log.onload = function(e) {
				actualWindow.log.abort();
				
				var logWindow = Titanium.UI.createWindow({  
					fullscreen: true,
					url:'../app.js',
				});
				
				Ti.App.Properties.setString('logStatus', "You have succefully logged out");
				logWindow.open();
				hideIndicator();
				Ti.API.info('From Functions ... Value is : '+ Ti.App.Properties.getString('logStatus'));
				actualWindow.close();
				indLog.close();				
			}
	
			actualWindow.log.onerror = function(e) {
				Ti.API.info("Failed to log out");
				hideIndicator();
				indLog.close();
				alert("Failed to log out, services are down");
			}
			
			actualWindow.log.send();
		});
	
	    indLog.add(labelOut);
		indLog.add(labelIn);
		indLog.orientationModes = [ Titanium.UI.PORTRAIT ];
	    indLog.open();
	});
};

/* Function Name: sortTableView( a, b)
 * Purpouse: Sort arrays
 * Parameters: 
 * 	a:   Previous object in the array.
 *  b: 	 Next object in the array.
 * Variables: none 
 *  
 */

function sortTableView( a, b)  
{  
  if (a.name < b.name)  
     return -1;  
  if (a.name > b.name)  
     return 1;  
  // a must be equal to b  
  return 0;  
};

/* Function Name: (actualWindow, goToWindow )
 * Purpouse: Show button Back at the bottom and close actualWindow and go to goToWindow
 * Parameters: 
 * 	actualWindow:   The windows where the function was called from.
 *  goToWindow: 	The target window (The window where the user is gonna be redirected)
 * Variables: 
 *  backView:		The bottom button
 *  label_bottom:   Label "Back"
 */
function showBottom(actualWindow, goToWindow ){
	var backView = Titanium.UI.createView({
		top: '95%',	
		backgroundColor:'#111',
		height: '6%',
		width: '100%',
		opacity: 0.99,
		borderRadius:5
	});
	
	var label_bottom = Titanium.UI.createLabel({
		color:'#FFFFFF',
		text:'Back',
		textAlign: 'center',
		height: 'auto'
	}); 
	
	
	backView.add(label_bottom);
	backView.addEventListener('click', function(){
		goToWindow.log = actualWindow.log;
    	goToWindow.picked = actualWindow.picked;
    	goToWindow.result = actualWindow.result;
		goToWindow.name = actualWindow.name;
		
		goToWindow.open();
		actualWindow.close();
	});					
	actualWindow.add(backView);
};
