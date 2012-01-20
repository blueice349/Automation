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
 * 	indView: The view that contains actIndFun.
 * 	actIndFun:  Activity indicator.  
 *  
 */
function showIndicator(show)
{
	Titanium.App.Properties.setBool("indicatorActive", true);
 
    // window container
    if ( show == 'modal'){ 
    indWin = Titanium.UI.createWindow({
        modal: true,
    	title:'Omadi CRM',
        opacity: 0.9,
        backgroundColor: '#000000'
    });
    }
    else{ 
	    indWin = Titanium.UI.createWindow({
    		title:'Omadi CRM',
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
    actIndFun = Titanium.UI.createActivityIndicator({
        height:'7%',
        message: "Loading ...",
        width: '30%'
    });
    
    indWin.add(actIndFun);
    
    if ( show == "settings")
    {
    	
	    var pb=Titanium.UI.createProgressBar({
		    width:"90%",
		    min:0,
		    max:100,
		    value:0,
		    top: "75%",
		    color:'#fff',
		    message:'Installing Updates',
		    font:{fontSize:14, fontWeight:'bold'}
		});
	 	
	 	indWin.add(pb);

		function updateStatus(){
			if (Titanium.App.Properties.getInt("maxIndex", 0) <= 0 ){
				pb.value = 100;
			}
			else
			{
				if ((Titanium.App.Properties.getInt("index") == 0) && (Titanium.App.Properties.getInt("maxIndex") == 1)){
					pb.value = 50;
				}
				else{
					pb.value = (Titanium.App.Properties.getInt("index")*100/Titanium.App.Properties.getInt("maxIndex") );					
				}
			}

		}
		var timer = setInterval(updateStatus, 500);
	} 	
	else
	{
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
	}

	indWin.orientationModes = [ Titanium.UI.PORTRAIT ];
    indWin.open();
    actIndFun.show();
};

function fireStatusFirstInstall(){
	
	var firstRound = true;
	
   	var a1 = Titanium.UI.createAnimation();
	a1.bottom =  -1*Ti.Platform.displayCaps.platformHeight*0.1;
	a1.duration = 1000;

   	var a2 = Titanium.UI.createAnimation();
	a2.bottom = 0;
	a2.duration = 1000;


    // black view
    var indView = Titanium.UI.createView({
        height: '8%',
        width: '100%',
        backgroundColor:'#111',
        opacity:0.9,
        bottom: -1*Ti.Platform.displayCaps.platformHeight*0.1,
    });

    Ti.UI.currentWindow.add(indView);
    
    databaseStatusView.animate(a1);
	
	setTimeout (function (){
		indView.animate(a2);
	}, 700);
   	
    var pb=Titanium.UI.createProgressBar({
	    width:"70%",
	    min:0,
	    max:100,
	    value:0,
	    color:'#fff',
	    message:'Installing Updates',
	    font:{fontSize:14}
	});
 	
 	indView.add(pb);
	
	var alreadyAnimating = false;
	
	function updateStatus(){
		if (Titanium.App.Properties.getInt("maxIndex", 0) < 0 ){
			pb.value = 100;
		}
		else
		{
			if ((Titanium.App.Properties.getInt("index") == 0) && (Titanium.App.Properties.getInt("maxIndex") == 1)){
				pb.value = 50;
			}
			else{
				pb.value = (Titanium.App.Properties.getInt("index")*100/Titanium.App.Properties.getInt("maxIndex") );					
			}
		}
		
		if ((pb.value == 100 ) && (!alreadyAnimating)){
			clearInterval(timer);
			firstRound = false;
			alreadyAnimating = true;
			indView.animate(a1);
			setTimeout (function (){
				databaseStatusView.animate(a2);
			}, 700);
   
		}

	}
	var timer = setInterval(updateStatus, 1500);
	
}


function showIndicatorDelete(inform)
{
	Titanium.App.Properties.setBool("indicatorActive", true);
 
    // window container

    indWin = Titanium.UI.createWindow({
        title:'Omadi CRM',
        modal: true,
        opacity: 0.9,
        backgroundColor: '#000000'
    });
 
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
    actIndFun = Titanium.UI.createActivityIndicator({
        height:'7%',
        message: "Loading ...",
        width: '30%'
    });
    
    indWin.add(actIndFun);
    
	// message
    var message = Titanium.UI.createLabel({
        text: inform,
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
    actIndFun.show();
};



/* Function Name: hideIndicator()
 * Purpouse: Close the loading screen
 * Parameters: none
 * Variables: 
 * 	indWin:  Window that is supposed to contain the loading screen
 * 			 modal or fullscreen.
 * 	actIndFun:  Activity indicator.  
 *  
 */

function hideIndicator()
{
    actIndFun.hide();
    indWin.close();
    Titanium.App.Properties.setBool("indicatorActive", false);
};

function hideIndicatorFistPage()
{
    setInterval(function (){
    	if (Titanium.App.Properties.getBool("isFirstPage"))
    	{
		    actIndFun.hide();
		    Titanium.App.Properties.setBool("indicatorActive", false);
		    indWin.close();
    	}
   	}, 1000);
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
		if (!goToWindow.notOpen){
			goToWindow.log = actualWindow.log;
	    	goToWindow.picked = actualWindow.picked;
	    	goToWindow.result = actualWindow.result;
			goToWindow.name = actualWindow.name;
		}
		
		if ((actualWindow.returnTo == "individual_contact.js") || (actualWindow.returnTo == "individual_potential.js") ){
			goToWindow.nid = actualWindow.nidToReturn;
			goToWindow.nameSelected = actualWindow.nameToReturn;
		}

		//Avoiding memory leaking problems:	
		if (!goToWindow.notOpen)
			goToWindow.open();
		
		actualWindow.close();
	});					
	actualWindow.add(backView);
};


function bottomBack(actualWindow ){
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
		actualWindow.close();
	});					
	actualWindow.add(backView);
};



//
//Check type at field table
// Return values
// 0 => It is a number
// 1 => It is text
//

function check_type(name, object){
	var qRes = db.execute("SELECT DISTINCT type FROM fields WHERE field_name=? AND bundle=?", name ,  object);
	
	if (qRes.isValidRow()){
		switch(qRes.fieldByName("type")){
			case "number_integer":
				type = 0
			break;
			
			case "number_decimal":
				type = 0;
			break;
			
			default:
				type = 1;
			break;
		}	
	}
	else{
		//Ti.API.info("Field type not found!!");
		//Treat as text!
		type = 1;
	}
	qRes.close();
	return type;
}

//
// Function's signature : process_object(json,obj)
// Purpouse: Insert, update and delete objects such as contact, potential, account and lead 
// Parameters:
//		json: Receveid answer from API's request.
//		obj: Name of the object (contact/potential/account/lead)
// Returns: An empty return to callback the parent's action.
// 

function process_object(json, obj){
	var deploy = db.execute('SELECT field_name FROM fields WHERE bundle = "'+obj+'"');
	var col_titles = [];
	
	var ind_column = 0;
	while (deploy.isValidRow()){
		col_titles[ind_column] = deploy.fieldByName('field_name'); 
		ind_column++;
		deploy.next();
	}
	deploy.close();
	
	//Insert
	if (json[obj].insert){
		//Multiple objects
		if (json[obj].insert.length){
			for (var i = 0; i < json[obj].insert.length; i++ ){
				
				// Original query
				var aux_column = ind_column;

				//Insert into node table
				var obj_title = json[obj].insert[i].title;
				if ((obj_title == null) || (obj_title == 'undefined')) 
					obj_title = "No Title";
					
				var node_id = db.execute('INSERT INTO node (nid, created, changed, title, author_uid) VALUES (?,?,?,?,?)', json[obj].insert[i].nid, json[obj].insert[i].created, json[obj].insert[i].changed, obj_title, json[obj].insert[i].author_uid);
				
				if (aux_column > 0)
					var query = 'INSERT INTO '+obj+' (nid, ';
				//This would happen only if table has no columns, shouldn't happen
				else
					var query = 'INSERT INTO '+obj+' (nid) VALUES ('+json[obj].insert[i].nid+')';
				
				while (aux_column > 0){
					if (aux_column == 1)
						query += ' '+col_titles[aux_column-1]+') VALUES ('+json[obj].insert[i].nid+', ';
					else
						query += ' '+col_titles[aux_column-1]+', ';
					aux_column--;
				}

				aux_column = ind_column;
				while (aux_column > 0){
					var parse_api = col_titles[aux_column-1];
					////Ti.API.info("Inserting ["+obj+"] : "+json[obj].insert[i][parse_api]);
					//Get type:
					var mark = '';
					switch (check_type(parse_api, obj)){
						//Number
						case 0:
							mark = '';
						break;
						
						//Text
						case 1:
							mark = '"';
						break;	
					}
					if (aux_column == 1){
						if ( (json[obj].insert[i][parse_api] == null ) || (json[obj].insert[i][parse_api] == "undefined" ) ) 
							query += ' null )';
						else	
							query += ' '+mark+''+json[obj].insert[i][parse_api].replace(/"/gi, "'")+''+mark+' )';
					}
						
					else{
						if ( (json[obj].insert[i][parse_api] == null ) || (json[obj].insert[i][parse_api] == "undefined" ) )
							query += ' null ,';
						else
							query += ' '+mark+''+json[obj].insert[i][parse_api].replace(/"/gi, "'")+''+mark+' ,';
					}
					aux_column--;
				}
				//Ti.API.info(query);
				//Inserts into object table
				db.execute(query);
			}
		}
		
		//Only one object
		else{
				var aux_column = ind_column;
				var node_id = db.execute('INSERT INTO node (nid, created, changed, title, author_uid) VALUES (?,?,?,?,?)', json[obj].insert.nid, json[obj].insert.created, json[obj].insert.changed, json[obj].insert.title, json[obj].insert.author_uid);
				
				
				if (aux_column > 0)
					var query = 'INSERT INTO '+obj+' (nid, ';
				else
					var query = 'INSERT INTO '+obj+' (nid) VALUES ('+json[obj].insert.nid+')';
				
				while (aux_column > 0){
					if (aux_column == 1)
						query += ' '+col_titles[aux_column-1]+') VALUES ('+json[obj].insert.nid+', ';
					else
						query += ' '+col_titles[aux_column-1]+', ';
					aux_column--;
				}

				aux_column = ind_column;
				while (aux_column > 0){
					var parse_api = col_titles[aux_column-1];
					//Ti.API.info("Inserting ["+obj+"] : "+json[obj].insert[parse_api]);
					//Get type:
					var mark = '';
					switch (check_type(parse_api, obj)){
						//Number
						case 0:
							mark = '';
						break;
						
						//Text
						case 1:
							mark = '"';
						break;	
					}
					//Ti.API.info("String ====>   "+json[obj].insert[parse_api].replace('"', '\"'));
					if (aux_column == 1){
						if ( (json[obj].insert[parse_api] == null ) || (json[obj].insert[parse_api] == "undefined" ) ) 
							query += ' null )';
						else	
							query += ' '+mark+''+json[obj].insert[parse_api].replace('"', '\"')+''+mark+' )';
					}
						
					else{
						if ( (json[obj].insert[parse_api] == null ) || (json[obj].insert[parse_api] == "undefined" ) )
							query += ' null ,';
						else
							query += ' '+mark+''+json[obj].insert[parse_api].replace('"', '\"')+''+mark+' ,';
					}
					aux_column--;
				}
				//Inserts into account table
				db.execute(query);
		}
		//Ti.API.info("Inserted object ["+obj+"] sucefully!");				
	}
	
	//Update Object
	if (json[obj].update){
		if (json[obj].update.length){
			for (var i = 0; i < json[obj].update.length; i++ ){
				var aux_column = ind_column;

				//Updates node table
				var node_id = db.execute('UPDATE node SET "created"='+json[obj].update[i].created+', "changed"='+json[obj].update[i].changed+', "title"="'+json[obj].update[i].title+'", "author_uid"='+json[obj].update[i].author_uid+' WHERE "nid"='+json[obj].update[i].nid);

				//Must have more then 1 column (excluding nid)
				if (aux_column > 0){
					var query = 'UPDATE '+obj+' SET ';

					while (aux_column > 0){
						var parse_api = col_titles[aux_column-1];
						//Ti.API.info("Prepared field: "+json[obj].update[i][parse_api]+" for update");
						//Get type:
						var mark = '';
						switch (check_type(parse_api, obj)){
							//Number
							case 0:
								mark = '';
							break;
							
							//Text
							case 1:
								mark = '"';
							break;	
						}
						
						
						if (aux_column == 1){
							if ( (json[obj].update[i][parse_api] == null ) || (json[obj].update[i][parse_api] == "undefined" ) ) 
								query += ' "'+col_titles[aux_column-1]+'"=null WHERE "nid"='+json[obj].update[i].nid;
							else	
								query += ' "'+col_titles[aux_column-1]+'"='+mark+''+json[obj].update[i][parse_api]+''+mark+' WHERE "nid"='+json[obj].update[i].nid;
						}
							
						else{
							if ( (json[obj].update[i][parse_api] == null ) || (json[obj].update[i][parse_api] == "undefined" ) )
								query += ' "'+col_titles[aux_column-1]+'"=null , ';
							else
								query += ' "'+col_titles[aux_column-1]+'"='+mark+''+json[obj].update[i][parse_api]+''+mark+' , ';
						}

						aux_column--;
					}

					//Updates object's row
					db.execute(query);
				}
				//Doesn't make sense to update the primary key in this case
				/*
				else
					var query = 'UPDATE '+obj+' SET "nid"='+json[obj].update[i].nid;
				*/
			}
		}
		//Only one object
		else{
			var aux_column = ind_column;

			//Updates node's table
			var node_id = db.execute('UPDATE node SET "created"='+json[obj].update.created+', "changed"='+json[obj].update.changed+', "title"="'+json[obj].update.title+'", "author_uid"='+json[obj].update.author_uid+' WHERE "nid"='+json[obj].update.nid);

			//Must have more then 1 column (excluding nid)
			if (aux_column > 0){
				var query = 'UPDATE '+obj+' SET ';
			
				while (aux_column > 0){
					var parse_api = col_titles[aux_column-1];
					//Ti.API.info("Prepared field: "+json[obj].update[parse_api]+" for update");
					//Get type:
					var mark = '';
					switch (check_type(parse_api, obj)){
						//Number
						case 0:
							mark = '';
						break;
						
						//Text
						case 1:
							mark = '"';
						break;	
					}
					
					if (aux_column == 1){
						if ( (json[obj].update[parse_api] == null ) || (json[obj].update[parse_api] == "undefined" ) ) 
							query += ' "'+col_titles[aux_column-1]+'"=null WHERE "nid"='+json[obj].update.nid;
						else	
							query += ' "'+col_titles[aux_column-1]+'"='+mark+''+json[obj].update[parse_api]+''+mark+' WHERE "nid"='+json[obj].update.nid;
					}
						
					else{
						if ( (json[obj].update[parse_api] == null ) || (json[obj].update[parse_api] == "undefined" ) )
							query += ' "'+col_titles[aux_column-1]+'"=null , ';
						else
							query += ' "'+col_titles[aux_column-1]+'"='+mark+''+json[obj].update[parse_api]+''+mark+' , ';
					}

					aux_column--;
				}

				//Updates account row
				db.execute(query);
			}
			//Doesn't make sense to update the primary key in this case
			/*
			else
				var query = 'UPDATE account SET "nid"='+json.account.update.nid;
			*/
		}
		//Ti.API.info("Updated object ["+obj+"] sucefully!");
	}
	
	//Delete 
	if (json[obj]["delete"])	{
		if (json[obj]["delete"].length){
			for (var i = 0; i <  json[obj]["delete"].length; i++ ){
				//Deletes from object's table
				db.execute('DELETE FROM '+obj+' WHERE "nid"=?', json[obj]["delete"][i].nid);
				//Deletes from node table
				db.execute('DELETE FROM node WHERE "nid"=?', json[obj]["delete"][i].nid);
			}
		}
		else{
			//Deletes from account table
			db.execute('DELETE FROM '+obj+' WHERE "nid"=?', json[obj]["delete"].nid);
			
			//Deletes from node table
			db.execute('DELETE FROM node WHERE "nid"=?', json[obj]["delete"].nid);
		}
		//Ti.API.info("Deleted object ["+obj+"] sucefully!");
	}
	return;
}

//Install new updates using pagination
//Load existing data with pagination
function installMe(pageIndex, win, timeIndex, calledFrom)
{
	if ((calledFrom == "settings") && (pageIndex == 0))
	{
		Titanium.App.Properties.setInt("index",    0);
		Titanium.App.Properties.setInt("maxIndex",    100);
		showIndicator("settings");
	}	
	
	var objectsUp = win.log;

	//Timeout until error:
	objectsUp.setTimeout(10000);

	//Ti.API.info("Current page: "+ pageIndex);
	//Opens address to retrieve contact list
	//Ti.API.info("TIME: "+timeIndex);

	if (timeIndex == 0 ){
		objectsUp.open('GET', win.picked + '/js-sync/sync.json?timestamp=' + timeIndex +'&reset=1&limit=250&page='+pageIndex );
	}
	else
		objectsUp.open('GET', win.picked + '/js-sync/sync.json?timestamp=' + timeIndex +'&reset=0&limit=250&page='+pageIndex );
	
	//Header parameters
	objectsUp.setRequestHeader("Content-Type", "application/json");

	//When connected
	objectsUp.onload = function(e) {
		//Parses response into strings
		var json = JSON.parse(this.responseText);
		var existsMorePages;
		
		//Ti.API.info("JSON: "+json);
		//Ti.API.info("Delete all value: "+json.delete_all);
		
		if (json.delete_all == true){
			//Ti.API.info("=================== ############ ===================");
			//Ti.API.info("Reseting database, delete_all is required");
			//Ti.API.info("=================== ############ ===================");

			//If delete_all is present, delete all contents:
			db.execute('DROP TABLE IF EXISTS account');
			db.execute('CREATE TABLE "account" ("nid" INTEGER PRIMARY KEY NOT NULL  UNIQUE )');
			
			db.execute('DROP TABLE IF EXISTS contact');
			db.execute('CREATE TABLE "contact" ("nid" INTEGER PRIMARY KEY NOT NULL  UNIQUE )');

			db.execute('DROP TABLE IF EXISTS lead');
			db.execute('CREATE TABLE "lead" ("nid" INTEGER PRIMARY KEY   NOT NULL  UNIQUE )');
			
			db.execute('DROP TABLE IF EXISTS node');
			db.execute('CREATE TABLE "node" ("nid" INTEGER PRIMARY KEY NOT NULL  UNIQUE , "title" VARCHAR, "created" INTEGER, "changed" INTEGER, "author_uid" INTEGER)');
						
			db.execute('DROP TABLE IF EXISTS potential');
			db.execute('CREATE TABLE "potential" ("nid" INTEGER PRIMARY KEY NOT NULL  UNIQUE )');


			//Do not delete user_location, it is gonna always be in a small size
			//db.execute('DROP TABLE IF EXISTS user_location');
			//db.execute('CREATE TABLE "user_location" ("uid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE , "longitude" TEXT NOT NULL , "latitude" TEXT NOT NULL , "timestamp" INTEGER NOT NULL , "status" TEXT)');
						
			db.execute('DROP TABLE IF EXISTS user_roles');
			db.execute('CREATE TABLE "user_roles" ("uid" INTEGER, "rid" INTEGER)');

			db.execute('DROP TABLE IF EXISTS task');
			db.execute('CREATE TABLE "task" ("nid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE )');
			
			db.execute('DROP TABLE IF EXISTS boot');
			db.execute('CREATE TABLE "boot" ("boot_id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE )');

			db.execute('DROP TABLE IF EXISTS bundles');
			db.execute('CREATE TABLE "bundles" ("bid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE , "fid" INTEGER NOT NULL , "bundle_name" VARCHAR)');
			
			db.execute('DROP TABLE IF EXISTS fields');
			db.execute('CREATE TABLE "fields" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE, "fid" INTEGER NOT NULL , "type" TEXT, "field_name" TEXT, "label" TEXT, "description" TEXT, "bundle" TEXT NOT NULL , "weight" INTEGER, "required" TEXT , "widget" TEXT, "settings" TEXT)');
			
			db.execute('DROP TABLE IF EXISTS term_data');
			db.execute('CREATE TABLE "term_data" ("tid" INTEGER PRIMARY KEY  NOT NULL  UNIQUE , "vid" INTEGER, "name" VARCHAR, "description" VARCHAR, "weight" VARCHAR)');
						
			db.execute('DROP TABLE IF EXISTS updated');
			db.execute('CREATE TABLE "updated" ("timestamp" INTEGER DEFAULT 0, "url" TEXT DEFAULT NULL)');
			
			db.execute('DROP TABLE IF EXISTS users');
			db.execute('CREATE TABLE "users" ("uid" INTEGER PRIMARY KEY  NOT NULL  UNIQUE , "username" TEXT, "mail" TEXT, "realname" TEXT, "status" INTEGER)');
						
			db.execute('DROP TABLE IF EXISTS vocabulary');
			db.execute('CREATE TABLE "vocabulary" ("vid" INTEGER PRIMARY KEY  NOT NULL  UNIQUE , "name" VARCHAR, "machine_name" TEXT)');
						
			db.execute('INSERT INTO updated (timestamp, url) VALUES (?,?)', 0 , null);		
		}
		
		pageIndex++;
		

		//Ti.API.info("Max page integer: "+parseInt(json.max_page));
		//Ti.API.info("Current page integer: "+parseInt(json.page));
				
		Titanium.App.Properties.setInt("maxIndex", parseInt(json.max_page));
		Titanium.App.Properties.setInt("index",    parseInt(json.page));
		
		//If it is the end
		if ( (json.page == json.max_page) || json.max_page == -1 )
			existsMorePages = false;
		else
			existsMorePages = true;	
		
		//Ti.API.info("Current page: "+json.page);
		//Ti.API.info("Maximum pages: "+json.max_page);
		//Ti.API.info("Exist more pages? "+existsMorePages);
		//Ti.API.info("Next page (no limit): "+pageIndex);
		
		
		
		//If Database is already last version
		if ( json.total_item_count == 0 ){
			
			if ( calledFrom == "mainMenu"){
					//Ti.API.info('Called from value: '+calledFrom);
					isFirstTime = false;
			}
			db.execute('UPDATE updated SET "timestamp"='+ json.request_time +' WHERE "rowid"=1');
			//Success
			Titanium.App.Properties.setBool("succesSync", true);
			//Ti.API.info("SUCCESS -> No items ");
			if (( calledFrom == "settings") && !existsMorePages){
				setInterval(function(){
						hideIndicator();
					}, 2000);	
			}
		}
		else
		{
			if ( calledFrom == "mainMenu"){
					if ((isFirstTime) && (pageIndex==1)){
						db.execute('UPDATE updated SET "url"="'+ win.picked +'" WHERE "rowid"=1');						
					}
			}
			//pageIndex == 1 means first load, pageIndex is incremented some lines above
			if (pageIndex == 1 ){
				db.execute('UPDATE updated SET "timestamp"='+ json.request_time +' WHERE "rowid"=1');				
			}   
			//Ti.API.info("COUNT: "+json.total_item_count);	
			
			//Fields:
			if (json.fields){
				if (json.fields.insert){
					if (json.fields.insert.length){
						for (var i = 0; i < json.fields.insert.length; i++ ){

							var var_widget = JSON.stringify(json.fields.insert[i].widget);
							var var_settings = JSON.stringify(json.fields.insert[i].settings); 
							var fid = json.fields.insert[i].fid;

							if (json.fields.insert[i].type != null )
								var type = json.fields.insert[i].type.replace(/'/gi, '"');
							else
								var type = null;
							
							if (json.fields.insert[i].field_name != null)
								var field_name = json.fields.insert[i].field_name.replace(/'/gi, '"');
							else
								var field_name = null;
							
							if (json.fields.insert[i].label != null)
								var label = json.fields.insert[i].label.replace(/'/gi, '"');
							else
								var label = null;
									
							if (json.fields.insert[i].description != null)
								var description = json.fields.insert[i].description.replace(/'/gi, '"');
							else
								var description = null;
							
							if (json.fields.insert[i].bundle != null )		
								var bundle = json.fields.insert[i].bundle.replace(/'/gi, '"');
							else
								var bundle = null;
							
							if (json.fields.insert[i].weight != null)		
								var weight = json.fields.insert[i].weight;
							else
								var weight = null;
							
							if (json.fields.insert[i].required != null)
								var required = json.fields.insert[i].required;
							else
								var required = null;
							
							if (var_widget != null)
								var widget = var_widget.replace(/'/gi, '"');
							else
								var widget = null;	
							
							if (var_settings != null)
								var settings = var_settings.replace(/'/gi, '"');
							else
								var settings = null;
							
							//Multiple parts
							if (json.fields.insert[i].settings.parts){
								for (var f_value_i in json.fields.insert[i].settings.parts ) {
									db.execute("INSERT INTO fields (fid, type, field_name, label, description, bundle, weight, required, widget, settings) VALUES ("+fid+",'"+type+"','"+field_name+"___"+f_value_i+"','"+label+"','"+description+"','"+bundle+"',"+weight+", '"+required+"','"+widget+"','"+settings+"' )");
								}
							}
							else
								db.execute("INSERT INTO fields (fid, type, field_name, label, description, bundle, weight, required, widget, settings) VALUES ("+fid+",'"+type+"','"+field_name+"','"+label+"','"+description+"','"+bundle+"',"+weight+", '"+required+"','"+widget+"','"+settings+"' )");

							//Insert into bundles
							db.execute('INSERT INTO bundles (fid, bundle_name) VALUES ('+fid+',"'+bundle+'")' );
							
							var type = "";
							switch(json.fields.insert[i].type){
								case "taxonomy_term_reference":
								case "term_reference":
								case "datestamp":
								case "number_integer":
									type = "INTEGER"
								break;
								
								case "number_decimal":
									type = "REAL"
								break;
								
								default:
									type = "TEXT";
								break;
							}
							
							switch(json.fields.insert[i].bundle){
								case "lead":
								case "contact":
								case "potential":
								case "account":
								case "task":
								case "boot":
									if (json.fields.insert[i].settings.parts){
										for (var f_value_i in json.fields.insert[i].settings.parts ) {
											db.execute('ALTER TABLE '+json.fields.insert[i].bundle+' ADD '+json.fields.insert[i].field_name+'___'+f_value_i+' '+ type);
											//Ti.API.info("Inserted: "+json.fields.insert[i].field_name+"___"+f_value_i+" to "+json.fields.insert[i].bundle);
										}
									}
									else{
										db.execute('ALTER TABLE '+json.fields.insert[i].bundle+' ADD '+json.fields.insert[i].field_name+' '+ type);
										//Ti.API.info("Inserted: "+json.fields.insert[i].field_name+" to "+json.fields.insert[i].bundle);
									}
								break;
							}

						}
					}
					else{
						var var_widget = JSON.stringify(json.fields.insert.widget);
						var var_settings = JSON.stringify(json.fields.insert.settings); 

						//Insert into fields
						db.execute('INSERT INTO fields (fid, type, field_name, label, description, bundle, weight, required, widget, settings) VALUES (?,?,?,?,?,?,?,?,?,?)', json.fields.insert.fid , json.fields.insert.type , json.fields.insert.field_name , json.fields.insert.label , json.fields.insert.description , json.fields.insert.bundle , json.fields.insert.weight, json.fields.insert.required , "var_widget", "var_settings" );

						//Insert into bundles
						db.execute('INSERT INTO bundles (fid, bundle_name) VALUES (?,?)', json.fields.insert.fid,  json.fields.insert.bundle );
						
						var type = "";
						switch(json.fields.insert.type){
							case "number_integer":
								type = "INTEGER"
							break;
							
							case "number_decimal":
								type = "REAL"
							break;
							
							default:
								type = "TEXT";
							break;
						}
						
						switch(json.fields.insert.bundle){
							case "lead":
							case "contact":
							case "potential":
							case "account":
							case "task":
							case "boot":
								db.execute('ALTER TABLE '+json.fields.insert.bundle+' ADD '+json.fields.insert.field_name+' '+ type);
							break;
						}
					}
					
					//Ti.API.info("Success for fields, it was inserted!");
				}
				if (json.fields.update){
					//Ti.API.info("Fields update defined!");
					if (json.fields.update.length){
						for (var i = 0; i < json.fields.update.length; i++ ){
							var_widget = JSON.stringify(json.fields.update[i].widget);
							var_settings = JSON.stringify(json.fields.update[i].settings); 
							db.execute('UPDATE fields SET "type"=?, "field_name"=?, "label"=?, "description"=?, "bundle"=?, "weight"=?, "required"=?, "widget"=?, "settings"=? WHERE "fid"=?', json.fields.insert[i].type , json.fields.insert[i].field_name , json.fields.insert[i].label , json.fields.insert[i].description , json.fields.insert[i].bundle , json.fields.insert[i].weight, json.fields.insert[i].required , var_widget , var_settings, json.fields.insert[i].fid );
						}
					}
					else{
							var_widget = JSON.stringify(json.fields.update.widget);
							var_settings = JSON.stringify(json.fields.update.settings); 
							db.execute('UPDATE fields SET "type"=?, "field_name"=?, "label"=?, "description"=?, "bundle"=?, "weight"=?, "required"=?, "widget"=?, "settings"=? WHERE "fid"=?', json.fields.insert.type , json.fields.insert.field_name , json.fields.insert.label , json.fields.insert.description , json.fields.insert.bundle , json.fields.insert.weight, json.fields.insert.required , var_widget, var_settings, json.fields.insert.fid );
					}
				}
				
				/*
				 * Delete fields from fields table
				 * Needs to be implemented from the server side
				 */
				/*
				if (json.fields["delete"]){
					if (json.fields["delete"].length){
						for (var i = 0; i < json.fields["delete"].length; i++ ){
							//Deletes rows from terms
							db.execute('DELETE FROM fields WHERE "fid"=?',json.fields["delete"][i].vid);											
						}
					}
					else{
						//Deletes row from terms
						db.execute('DELETE FROM term_data WHERE "vid"=?',json.vocabularies["delete"].vid);							
						
						//Deletes corresponding row in vocabulary
						db.execute('DELETE FROM vocabulary WHERE "vid"=?',json.vocabularies["delete"].vid);				
					}
				}
				*/
				
			} 
			
			//Vocabulary:
			if (json.vocabularies){
				if (json.vocabularies.insert){
					if (json.vocabularies.insert.length){
						for (var i = 0; i < json.vocabularies.insert.length; i++ ){
							var vid_v = json.vocabularies.insert[i].vid;
							var name_v = json.vocabularies.insert[i].name;
							var machine_v = json.vocabularies.insert[i].machine_name;
							
							if (name_v == null)
								name_v = "null";
							if (machine_v == null)
								machine_v = "";
							//Ti.API.info("About to insert vocabulary: "+vid_v);
							db.execute('INSERT INTO vocabulary (vid, name, machine_name) VALUES (?,?,?)', vid_v , name_v, machine_v);				
						}
					}
					else{
							var vid_v = json.vocabularies.insert.vid;
							var name_v = json.vocabularies.insert.name;
							var machine_v = json.vocabularies.insert.machine_name;
							
							if (name_v == null)
								name_v = "null";
							
							if (machine_v == null)
								machine_v = "";
							//Ti.API.info("About to insert vocabulary: "+vid_v);
							db.execute('INSERT INTO vocabulary (vid, name, machine_name) VALUES (?,?,?)', vid_v , name_v, machine_v);						
					}
					//Ti.API.info("Vocabulary inserted!");
				}
				if (json.vocabularies.update){
					if (json.vocabularies.update.length){
						for (var i = 0; i < json.vocabularies.update.length; i++ ){
							//Ti.API.info("About to update vocabulary: "+json.vocabularies.update[i].vid);
							db.execute('UPDATE vocabulary SET "name"=?, "machine_name"=? WHERE "vid"=?',json.vocabularies.update[i].name, json.vocabularies.update[i].machine_name, json.vocabularies.update[i].vid);
						}
					}
					else{
							//Ti.API.info("About to update vocabulary: "+json.vocabularies.update.vid);
							db.execute('UPDATE vocabulary SET "name"=?, "machine_name"=? WHERE "vid"=?',json.vocabularies.update.name, json.vocabularies.update.machine_name, json.vocabularies.update.vid);						
					}
					//Ti.API.info("Vocabulary updated!");
				}
				if (json.vocabularies["delete"]){
					if (json.vocabularies["delete"].length){
						for (var i = 0; i < json.vocabularies["delete"].length; i++ ){
							//Ti.API.info("About to delete vocabulary: "+json.vocabularies["delete"][i].vid);
							//Deletes rows from terms
							db.execute('DELETE FROM term_data WHERE "vid"=?',json.vocabularies["delete"][i].vid);							
							
							//Deletes corresponding rows in vocabulary
							db.execute('DELETE FROM vocabulary WHERE "vid"=?',json.vocabularies["delete"][i].vid);				
						}
					}
					else{
							//Ti.API.info("About to delete vocabulary: "+json.vocabularies["delete"].vid);

						//Deletes row from terms
						db.execute('DELETE FROM term_data WHERE "vid"=?',json.vocabularies["delete"].vid);							
						
						//Deletes corresponding row in vocabulary
						db.execute('DELETE FROM vocabulary WHERE "vid"=?',json.vocabularies["delete"].vid);				
					}
					//Ti.API.info("Vocabulary deleted!");
				}
				
			} 
			//Terms:
			if (json.terms){
				if (json.terms.insert){
					if (json.terms.insert.length){
						for (var i = 0; i < json.terms.insert.length; i++ ){
							////Ti.API.info("Vid: "+json.terms.insert[i].vid);
							////Ti.API.info("Tid: "+json.terms.insert[i].tid);
							////Ti.API.info("Name: "+json.terms.insert[i].name);
							////Ti.API.info("Description: "+json.terms.insert[i].description);
							////Ti.API.info("Weight: "+json.terms.insert[i].weight);
							
							var vid_t = json.terms.insert[i].vid;
							var tid_t = json.terms.insert[i].tid;
							var name_t = json.terms.insert[i].name;
							var desc_t = json.terms.insert[i].description;
							var weight_t = json.terms.insert[i].weight;
							
							if (desc_t == null)
								desc_t = "";
							if (name_t == null)
								name_t = "";
								
							//Ti.API.info("About to insert term: "+tid_t);  	
							db.execute('INSERT INTO term_data ( tid , vid, name, description, weight) VALUES (?,?,?,?,?)', tid_t, vid_t, name_t, desc_t, weight_t);				
						}
					}
					else{
							var vid_t = json.terms.insert.vid;
							var tid_t = json.terms.insert.tid;
							var name_t = json.terms.insert.name;
							var desc_t = json.terms.insert.description;
							var weight_t = json.terms.insert.weight;
							
							if (desc_t == null)
								desc_t = "";
							if (name_t == null)
								name_t = "";

							//Ti.API.info("About to insert term: "+tid_t);
							db.execute('INSERT INTO term_data ( tid , vid, name, description, weight) VALUES (?,?,?,?,?)', tid_t, vid_t, name_t, desc_t, weight_t);						
					}
				}
				if (json.terms.update){
					if (json.terms.update.length){
						for (var i = 0; i < json.terms.update.length; i++ ){
							//Ti.API.info("About to update term: "+json.terms.update[i].tid);							
							db.execute('UPDATE term_data SET "name"=?, "description"=?,  "weight"=?, "vid"=?  WHERE "tid"=?', json.terms.update[i].name, json.terms.update[i].description, json.terms.update[i].weight, json.terms.update[i].vid, json.terms.update[i].tid);
						}
					}
					else{
							//Ti.API.info("About to update term: "+json.terms.update.tid);
							db.execute('UPDATE term_data SET "name"=?, "description"=?,  "weight"=?, "vid"=?  WHERE "tid"=?', json.terms.update.name, json.terms.update.description, json.terms.update.weight, json.terms.update.vid, json.terms.update.tid);						
					}
				}
				if (json.terms["delete"]){
					if (json.terms["delete"].length){
						for (var i = 0; i < json.terms["delete"].length; i++ ){
							//Ti.API.info("About to delete term: "+json.terms["delete"][i].tid);
							db.execute('DELETE FROM term_data WHERE "tid"=?',json.terms["delete"][i].tid);
						}
					}
					else{
						//Ti.API.info("About to delete term: "+json.terms["delete"].tid);
						db.execute('DELETE FROM term_data WHERE "tid"=?',json.terms["delete"].tid);
					}
				}
			}
			
			var callback;
			
			/*********** Account *************/
			if (json.account){
				callback = process_object(json, "account");
			}
			
			/*********** Lead *************/
			if (json.lead){
				callback = process_object(json, "lead");
			}
			
			/*********** Contact *************/
			if (json.contact){
				callback = process_object(json, "contact");
			}

			/*********** Potentials *************/
			if(json.potential){
				callback = process_object(json, "potential");
			}
			
			/*********** Boot *************/
			//It doesn't have nodes, wait Chris come up with new API
			// if(json.boot){
			//	callback = process_object(json, "boot");
			//}
			
			/*********** task *************/
			//It doesn't have nodes, wait Chris come up with new API
			// if(json.task){
			//	callback = process_object(json, "task");
			//}
			
			/*********** Users *************/
			if(json.users){
				//Insert - Users
				if (json.users.insert){
					if (json.users.insert.length){
						for (var i = 0; i < json.users.insert.length; i++ ){
							//Ti.API.info("USER UID: "+json.users.insert[i].uid);
							db.execute('INSERT INTO users (uid, username, mail, realname, status ) VALUES (?,?,?,?,?)', json.users.insert[i].uid, json.users.insert[i].username, json.users.insert[i].mail, json.users.insert[i].realname, json.users.insert[i].status);
							if (json.users.insert[i].roles.length){
								for (var j = 0; j < json.users.insert[i].roles.length; j++ ){
									db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.insert[i].uid, json.users.insert[i].roles[j]);
								}
							}
							else{
								db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.insert[i].uid, json.users.insert[i].roles);
							}
						}
					}
					else{
						db.execute('INSERT INTO users (uid, username, mail, realname, status ) VALUES (?,?,?,?,?)', json.users.insert.uid, json.users.insert.username, json.users.insert.mail, json.users.insert.realname, json.users.insert.status);
						
						if (json.users.insert.roles.length){
							for (var j = 0; j < json.users.insert.roles.length; j++ ){
								db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.insert.uid, json.users.insert.roles[j]);
							}
						}
						else{
							db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.insert.uid, json.users.insert.roles);
						}
					}
					//Ti.API.info("Inserted users sucefully!");
				}

				//Update - Users
				if (json.users.update){
					if (json.users.update.length){
						for (var i = 0; i < json.users.update.length; i++ ){
							db.execute('UPDATE users SET "username"=? , "mail"=?, "realname"=?, "status"=? WHERE "uid"=?', json.users.update[i].username, json.users.update[i].mail, json.users.update[i].realname, json.users.update[i].status, json.users.update[i].uid );
							
							//Delete every row present at user_roles
							db.execute('DELETE FROM user_roles WHERE "uid"=?', json.users.update[i].uid);
							
							//Insert it over again!
							if(json.users.update[i].roles){
								
								if (json.users.update[i].roles.length){
									for (var j = 0; j < json.users.update[i].roles.length ; j++ ){
										db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.update[i].uid, json.users.update[i].roles[j]);
									}							
								}
								else{
									db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.update[i].uid, json.users.update[i].roles);
								}
							}
						}
					}
					else{
						db.execute('UPDATE users SET "username"=? , "mail"=?, "realname"=?, "status"=? WHERE "uid"=?', json.users.update.username, json.users.update.mail, json.users.update.realname, json.users.update.status, json.users.update.uid );
							
						//Delete every row present at user_roles
						db.execute('DELETE FROM user_roles WHERE "uid"=?', json.users.update.uid);
						
						//Insert it over again!
						if(json.users.update.roles){
							if (json.users.update.roles.length){
								for (var j = 0; j < json.users.update.roles.length ; j++ ){
									db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.update.uid, json.users.update.roles[j]);
								}							
							}
							else{
								db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.update.uid, json.users.update.roles);
							}
						}
					}
					//Ti.API.info("Updated Users sucefully!");
				}
				
				//Delete - Users
				if (json.users["delete"])	{
					if (json.users["delete"].length){
						for (var i = 0; i <  json.users["delete"].length; i++ ){
							//Deletes current row (contact)
							db.execute('DELETE FROM users WHERE "uid"=?', json.users["delete"][i].uid);
							db.execute('DELETE FROM user_roles WHERE "uid"=?', json.users["delete"][i].uid);
							
						}
					}
					else{
						db.execute('DELETE FROM users WHERE "uid"=?', json.users["delete"].uid);
						db.execute('DELETE FROM user_roles WHERE "uid"=?', json.users["delete"].uid);
					}
				//Ti.API.info("Deleted Users sucefully!");
				}
				
			}
			
			//Ti.API.info("SUCCESS");
			if ( existsMorePages ){
				installMe(pageIndex, win, timeIndex, calledFrom);
			}
				
			else{
				//Ti.API.info('Called from value: '+calledFrom);
				if ( calledFrom == "settings")
					hideIndicator();
				else{
					isFirstTime = false;
					label_status.text = version;
				}

				Titanium.App.Properties.setBool("UpRunning", false);
				//Success
				Titanium.App.Properties.setBool("succesSync", true);
			}

		}
	}
	//Connection error:
	objectsUp.onerror = function(e) {
		//Ti.API.info("Services are down");
		if ( calledFrom == "settings")
			hideIndicator();
		else{
			//Ti.API.info('Called from value: '+calledFrom);
			label_status.text = version;					
		}
		Titanium.App.Properties.setBool("UpRunning", false);
		//Failure
		Titanium.App.Properties.setBool("succesSync", false);
	}
	//Sending information and try to connect
	objectsUp.send();
}

//Function Opens a new window to display descAux [Description?].
//The window closes when it receives a click event
function openBigText(descAux){
	var descWin = Ti.UI.createWindow({
		modal: true,
		opacity: 0.99
	});
	
	//Header where the selected name is presented
	var descHeader = Ti.UI.createView({
		top: '0',
		height: '20%',
		width: '100%',
		borderRadius: 5,
		backgroundColor: '#A9A9A9',
		opacity: 0.5
	});
	descWin.add(descHeader);
	
	//Label containing the selected name
	var labelDescContent = Ti.UI.createLabel({
		text: "Description",
		height: 'auto',
		color: "#FFFFFF",
		width:  '90%',
		font: {fontSize: 18,  fontWeight: "bold"},
		textAlign: 'center',
		touchEnabled: false
	});
	
	descHeader.add(labelDescContent);
		
	var textDesc = Ti.UI.createTextArea({
		value: descAux,
		color: "blue",
		editable: false,
		top: "30%"
	});	
	
	descWin.add(textDesc);
	
	descWin.open();
	
	descWin.addEventListener('click', function(){
		descWin.close();
	});
}


//Display contents for any type of object

function display_content (){

	while (fields_result.isValidRow()){
		
		fields[fields_result.fieldByName('field_name')] = new Array(); 
		fields[fields_result.fieldByName('field_name')]['label']  = fields_result.fieldByName('label');
		fields[fields_result.fieldByName('field_name')]['type']  = fields_result.fieldByName('type');
		
		c_index++;
		fields_result.next();
	}
	
	if (c_index > 0){
		var c_type = [];
		var c_label = [];
		var c_content = [];
		var c_settings = [];
		
		for (var f_name_f in fields ){
			//Ti.API.info(f_name_f+" => "+results.fieldByName(f_name_f)+" => "+fields[f_name_f]['type']);
			if (results.fieldByName(f_name_f) != null){
			
				//fields from Fields table that match with current object
				c_type[count]   	= fields[f_name_f]['type'];
				c_label[count]		= fields[f_name_f]['label'];
				c_settings[count]	= fields[f_name_f]['settings'];
				
				
				//Content
				c_content[count] = results.fieldByName(f_name_f);
				
				switch(c_type[count]){
					
					//Treatment follows the same for text or text_long
					case 'text':
					case 'text_long':
						label[count]  = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%", 
							left: 5,
							textAlign: 'left',
							touchEnabled: false
						});
					

						var openDescWin = false;
						
						if (c_content[count].length > 45){
							c_content[count] = c_content[count].substring(0,45);
							c_content[count] = c_content[count]+"...";
							openDescWin = true;
						}
						
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "100%",
							height: "100%",
							textAlign: 'left',
							left: "33%",
							id: count,
							open: openDescWin,
							w_content:c_content[count]
						});
	
						content[count].addEventListener('click', function(e){
							highlightMe(e.source.id);
							if (e.source.open)
							{
								openBigText(e.source.w_content);
							}
						});
						count++;
					break;
					
					
					//Phone
					case 'phone':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false
						});
						 
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "100%",
							height: "100%",
							textAlign: 'left',
							left: "33%",
							id: count,
							number: c_content[count].replace(/\D/g, '' )
						});
											
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id);
							Titanium.Platform.openURL('tel:'+e.source.number);
						});
					
						content[count].text = ""+c_content[count];
						count++;
					break;
					
					//Refers to some object:
					case 'omadi_reference':
						var auxRes  = db.execute('SELECT DISTINCT node.title FROM node INNER JOIN account ON node.nid='+c_content[count]);
						ref_name = auxRes.fieldByName("title");
						auxRes.close();
						
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+ref_name,
							width:  "100%",
							height: "100%",
							textAlign: 'left',
							left: "33%",
							id: count,
							nid: c_content[count]
						});
						
						// When account is clicked opens a modal window to show off the content of the specific touched
						// object.
						
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
							var newWin = Ti.UI.createWindow({
								fullscreen: true,
								title:'Account',
								url: "individual_object.js"
							});
							
							newWin.nameSelected  = ref_name;
							newWin.type = "account";
							newWin.nid = e.source.nid;
							newWin.open();
						});
						
						count++;
					break;
									
					//Must open browser if clicked
					case 'link_field':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "100%",
							height: "100%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false
						});
					
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "100%",
							height: "100%",
							textAlign: 'left',
							left: "33%",
							address: c_content[count].replace("http://",""),
							id: count
						});
										
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
							//website = website.replace("http://","");
							Titanium.Platform.openURL(e.source.address);
						});
	
						count++;
					break;
									
					//Must open mail client if clicked - Not supported by Android yet
					case 'email':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "100%",
							height: "100%",
							textAlign: 'left',
							left: "33%",
							id: count,
							email: c_content[count]
						});
	
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
							var emailDialog = Titanium.UI.createEmailDialog();
							emailDialog.subject = "Omadi CRM";
							emailDialog.toRecipients = e.source.email;
							emailDialog.open();
						});
						count++;
	
					break;
									
					//Link to taxonomy table:
					case 'taxonomy_term_reference':
						//Ti.API.info('Conteúdo: '+c_content[count]);
						var auxRes  = db.execute('SELECT * FROM term_data WHERE tid = '+c_content[count]);
						//Ti.API.info('Temos : '+ auxRes.rowCount +' linhas no resultado');
						var ref_name = auxRes.fieldByName("name");
						auxRes.close();
					
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "30%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+ref_name,
							width:  "100%",
							height: "100%",
							textAlign: 'left',
							left: "33%",
							id: count
						}); 
	
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
						});
						count++;
	
					break;
									
					//Just prints the user_reference .. If references table users, link to it
					case 'user_reference':
						var auxRes  = db.execute('SELECT realname FROM users WHERE uid = '+c_content[count]);
						var ref_name = "";
						if (auxRes.isValidRow())
							ref_name = auxRes.fieldByName("realname");
						else
							ref_name = "Not defined";
						auxRes.close();
						
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+ref_name,
							width:  "100%",
							height: "100%",
							textAlign: 'left',
							left: "33%",
							id: count
						});
						
						content[count].addEventListener('click', function(e){
							//Ti.API.info("X = "+e.source.id);
							highlightMe( e.source.id );
						});
						
						count++;
	
					break;
									
					//Formats as decimal
					case 'number_decimal':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "100%",
							height: "100%",
							textAlign: 'left',
							left: "33%",
							id: count
						});
						
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
						});
						count++;
	
					break;
									
					//Formats as integer
					case 'number_integer':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "100%",
							height: "100%",
							textAlign: 'left',
							left: "33%",
							id: count
						});
						
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
						});
						count++;
					break;
									
					//Shows up date (check how it is exhibited):
					case 'datestamp':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "100%",
							height: "100%",
							textAlign: 'left',
							left: "33%",
							id: count
						});
						
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
						});
						count++;
					break;
									
					//Shows the on and off button?
					case 'list_boolean':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "100%",
							height: "100%",
							textAlign: 'left',
							left: "33%",
							id: count
						});
						
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
						});
						count++;
					
					break;
					//Prints out content
	
					case 'license_plate':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "100%",
							height: "100%",
							textAlign: 'left',
							left: "33%",
							id: count
						});
						
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
						});
						count++;
					break;
				}
			}
		}
	
		//Ti.API.info("Items (count): "+ count);
		for (var i = 0; i < count ; i++){
		
			cell[i] = Ti.UI.createView({
				height: heightValue,
				top : 40*i
			});
			label[i].color = "#999999";
			content[i].color = "#FFFFFF";
			
			cell[i].add(label[i]);
			cell[i].add(content[i]);
		
			viewContent.add(cell[i]);	
			
			border[i] = Ti.UI.createView({
				backgroundColor:"#F16A0B",
				height:2,
				top: (40*(i+1))-2
			});
			viewContent.add(border[i]);
		
		}
	}
}

//Highlitghts clicked row
function highlightMe(data) {
	//Ti.API.info("DATA => "+data);
	cell[data].backgroundColor = "#F16A0B";
	setTimeout(function(){
		cell[data].backgroundColor = '#111111'; 
	}, 100);
};
