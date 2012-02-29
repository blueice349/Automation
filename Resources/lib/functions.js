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

//
// The progress bar for every install/update
//
// 1st param : sets the first value of the progress bar (instance of this object)
// 2nd param : Maximum the progress bar can reach
//

function Progress_install(current, max){
	
	this.current = current;
	this.max = max;
	
	var a1 = Titanium.UI.createAnimation();
	a1.bottom =  -1*Ti.Platform.displayCaps.platformHeight*0.14;
	a1.duration = 1000;

   	var a2 = Titanium.UI.createAnimation();
	a2.bottom = 0;
	a2.duration = 1000;


    // black view
    var indView = Titanium.UI.createView({
<<<<<<< HEAD
        height: '10%',
=======
        height: '13%',
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
        width: '100%',
        backgroundColor:'#111',
        opacity:0.9,
        bottom: -1*Ti.Platform.displayCaps.platformHeight*0.14,
    });

    Ti.UI.currentWindow.add(indView);
    
    //If bar is not hiding change this to be incorporated at mainMenu.js
    databaseStatusView.animate(a1);
	
	setTimeout (function (){
		indView.animate(a2);
	}, 700);
   	
    var pb = Titanium.UI.createProgressBar({
	    width:"70%",
	    min:0,
	    max:100,
	    value:0,
	    color:'#fff',
	    message:'Installing Updates ...',
	   	font:{
				fontFamily: 'Lobster'
		}
	});
 	
 	indView.add(pb);

	pb.value = this.current;
	
	this.set_max = function (value){
		this.max = value;
	}
	
	this.set = function (){
		this.current++;
		
		if (this.max <= 0 ){
			pb.value = 100;
		}
		else
		{
			//Only one page case
			if ( (this.current == 0) && (this.max == 1) ){
				pb.value = 50;
			}
			else{
				var perc = parseInt( ( this.current * 100 ) / this.max );
				pb.value = perc;
				Ti.API.info("Progress: "+ pb.value +" ... Index: "+this.current+" ... Max_Index : "+this.max);					
			}
		}
	}
	
	this.close = function () {
			indView.animate(a1);
			setTimeout (function (){
				databaseStatusView.animate(a2);
			}, 700);
	}
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


function bottomBack(actualWindow , text){
	var backView = Titanium.UI.createView({
		top: '95%',	
		backgroundColor:'#111',
		height: '6%',
		width: '100%',
		opacity: 0.99,
		borderRadius:5
	});
	
	if (text){
		var label_bottom = Titanium.UI.createLabel({
			color:'#FFFFFF',
			text: text,
			textAlign: 'center',
			height: 'auto'
		});		
	}
	else{
		var label_bottom = Titanium.UI.createLabel({
			color:'#FFFFFF',
			text:'Back',
			textAlign: 'center',
			height: 'auto'
		}); 
	}
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
	var db_type = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
	var qRes = db_type.execute("SELECT DISTINCT type FROM fields WHERE field_name=? AND bundle=?", name ,  object);
	
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
		Ti.API.info("Field type not found!!");
		//Treat as text!
		type = 1;
	}
	qRes.close();
	db_type.close();
	
	return type;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

<<<<<<< HEAD
function treatArray( num_to_insert , call_id ){
	
	// Insert array in a better way?
	// Optimization matters!
	// data separator
	
	var separator = 'j8Oá2s)E';
	var content_s = '';
	var array_size = num_to_insert.length;
	
	var test1 = 0;
	var test2 = 0;
	var count_a = 0;
	 
	for (var key in num_to_insert){
		count_a++;
		if ( count_a < array_size){
			content_s += num_to_insert[key]+''+separator;
			test1++;
		}
		else if (count_a == array_size){
			content_s += num_to_insert[key]+'';
			test2++;
		}
	}
	
	//Checking test:
	if ( (test1 < 1) || (test2 != 1) ){
		Ti.API.info('@Developer, check arrays insertion! _'+call_id);
		var blah = num_to_insert instanceof Array;
		Ti.API.info('This is the original array: '+num_to_insert+' is this an array? '+ blah );
		for (var key in num_to_insert){
			Ti.API.info('For value '+key+' in array we got '+ num_to_insert[key]);
		}
	}
	
	//Pack everything
	content_s = Titanium.Utils.base64encode(content_s);
	
	return content_s;
}

=======
>>>>>>> 2696447049ef095bd171249c415a58c543975f20

//
// Function's signature : process_object(json,obj)
// Purpouse: Insert, update and delete objects such as contact, potential, account and lead 
// Parameters:
//		json: Receveid answer from API's request.
//		obj: Name of the object (contact/potential/account/lead)
// Returns: An empty return to callback the parent's action.
// 

<<<<<<< HEAD
function process_object(json, obj, f_marks, progress, type_request){

	var db_process_object = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
=======
function process_object(json, obj, f_marks, progress){
	
	var db_process_object = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
	
	var deploy = db_process_object.execute('SELECT field_name FROM fields WHERE bundle = "'+obj+'"');
	var col_titles = [];
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
	
	var deploy = db_process_object.execute('SELECT field_name FROM fields WHERE bundle = "'+obj+'"');
	var col_titles = [];
	Ti.API.info('1');
	var ind_column = 0;
	while (deploy.isValidRow()){
		col_titles[ind_column] = deploy.fieldByName('field_name'); 
		ind_column++;
		deploy.next();
	}
	deploy.close();

	var process_obj = [];
	
	var process_obj = [];
	
	//Insert
	if (json[obj].insert){
		//Multiple objects
		if (json[obj].insert.length){
			for (var i = 0; i < json[obj].insert.length; i++ ){
<<<<<<< HEAD

				if (progress != null){
					//Increments Progress Bar
					progress.set();
				}
=======
				//Increments Progress Bar
				progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20
				// Original query
				var aux_column = ind_column;
				var query = "";
				
				//Insert into node table
				if ((json[obj].insert[i].title === null) || (json[obj].insert[i].title == 'undefined') || (json[obj].insert[i].title === false)) 
					json[obj].insert[i].title = "No Title";
				
<<<<<<< HEAD
				//'update' is a flag to decide whether the node needs to be synced to the server or not 
				process_obj[process_obj.length] = 'INSERT INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name ) VALUES ( '+json[obj].insert[i].nid+', '+json[obj].insert[i].created+' , '+json[obj].insert[i].changed+', "'+json[obj].insert[i].title.replace(/"/gi, "'")+'" , '+json[obj].insert[i].author_uid+' , 0 , "'+obj+'") ';
=======
				process_obj[process_obj.length] = 'INSERT INTO node (nid, created, changed, title, author_uid) VALUES ('+json[obj].insert[i].nid+', '+json[obj].insert[i].created+', '+json[obj].insert[i].changed+', "'+json[obj].insert[i].title.replace(/"/gi, "'")+'" , '+json[obj].insert[i].author_uid+')';
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
				
				if (aux_column > 0){
					query = 'INSERT INTO '+obj+' (nid, ';
				}
				//This would happen only if table has no columns, shouldn't happen
				else{
					query = 'INSERT INTO '+obj+' (nid) VALUES ('+json[obj].insert[i].nid+')';
				}
				
				while (aux_column > 0){
					if (aux_column == 1){
						query += ' '+col_titles[aux_column-1]+') VALUES ('+json[obj].insert[i].nid+', ';
					}
					else{
						query += ' '+col_titles[aux_column-1]+', ';
					}
					aux_column--;
				}
				
				aux_column = ind_column;
				var mark = '';
				while (aux_column > 0){
					var parse_api = col_titles[aux_column-1];
					mark = '"';
					for (var i_index in f_marks){
						if (i_index == parse_api){
							for (var j_index in f_marks[i_index]){
								if (j_index == obj){
									mark = '';
								}
							}
						}
					}
					if (aux_column == 1){
						if ( (json[obj].insert[i][parse_api] == null ) || (json[obj].insert[i][parse_api] == "undefined" ) ){ 
							query += ' null )';
						}
						else{
							if (mark == ''){
								var num_to_insert = json[obj].insert[i][parse_api];

								if ( isNumber(num_to_insert) ){
									query += ' '+num_to_insert+' )';
								}
								else if (num_to_insert instanceof Array){
<<<<<<< HEAD

									//If we have only one object in array we don't need another table to help us out
									if (num_to_insert.length == 1 ){
										if (isNumber(num_to_insert[0])){
											query += ' '+num_to_insert[0]+' )';	
										}
										else{
											query += ' null )';
										}
									}
									else{
										content_s = treatArray(num_to_insert, 1);
										
										// table structure:
										// incremental, node_id, field_name, value
										process_obj[process_obj.length] = 'INSERT INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )';
										
										// Code must to be a number since this database field accepts only integers numbers
										// Token to indentify array of numbers is 7411176117105122
										query += ' 7411317618171051229 )';
									}
=======
									Ti.API.info("ARRAY FOR "+obj);
									query += ' null )';
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
								}
								else{
									Ti.API.info('Null ==> The value '+num_to_insert+' is a number? '+isNumber(num_to_insert) );
									query += ' null )';
								}
							}
							else{
								if (json[obj].insert[i][parse_api] instanceof Array){
<<<<<<< HEAD
									//If we have only one object in array we don't need another table to help us out
									if (json[obj].insert[i][parse_api].length == 1 ){
										query += ' '+json[obj].insert[i][parse_api][0]+' )';										
									}
									else{
										content_s = treatArray(json[obj].insert[i][parse_api] , 2);
										
										// table structure:
										// incremental, node_id, field_name, value
										process_obj[process_obj.length] = 'INSERT INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )';
										
										// Code must to be a number since this database field accepts only integers numbers
										// Token to indentify array of numbers is 7411176117105122
										query += ' '+mark+'7411317618171051229'+mark+' )';
									}								
=======
									Ti.API.info("ARRAY FOR "+obj);
									query += ' '+mark+''+mark+' )';								
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
								}
								else{
									query += ' '+mark+''+json[obj].insert[i][parse_api].replace(/"/gi, "'")+''+mark+' )';
								}
							}
						}
					}
					else{
						if ( (json[obj].insert[i][parse_api] == null ) || (json[obj].insert[i][parse_api] == "undefined" ) ){
							query += ' null ,';
						}
						else{
							if (mark == ''){
								var num_to_insert = json[obj].insert[i][parse_api];

								if ( isNumber(num_to_insert) ){
									query += ' '+num_to_insert+' ,';
								}
								else if (num_to_insert instanceof Array){
<<<<<<< HEAD

									//If we have only one object in array we don't need another table to help us out
									if (num_to_insert.length == 1 ){
										if (isNumber(num_to_insert[0])){
											query += ' '+num_to_insert[0]+' ,';	
										}
										else{
											query += ' null ,';
										}
									}
									else{
										content_s = treatArray(num_to_insert , 3);
									
										// table structure:
										// incremental, node_id, field_name, value
										process_obj[process_obj.length] = 'INSERT INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )';
										
										// Code must to be a number since this database field accepts only integers numbers
										// Token to indentify array of numbers is 7411176117105122
										query += ' 7411317618171051229 ,';	
									}
								}
								else{
=======
									Ti.API.info("ARRAY FOR "+obj);
									query += ' null ,';								
								}
								else{
									Ti.API.info('Null ==> The value '+num_to_insert+' is a number? '+isNumber(num_to_insert) );
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
									query += ' null ,';
								}
							}
							else{
								if (json[obj].insert[i][parse_api] instanceof Array){
<<<<<<< HEAD
									
									//If we have only one object in array we don't need another table to help us out
									if (json[obj].insert[i][parse_api].length == 1 ){
										query += ' '+mark+''+json[obj].insert[i][parse_api][0].replace(/"/gi, "'")+''+mark+' ,';										
									}
									else{
										content_s = treatArray(json[obj].insert[i][parse_api] , 4);
									
										// table structure:
										// incremental, node_id, field_name, value
										process_obj[process_obj.length] = 'INSERT INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )';
										
										// Code must to be a number since this database field accepts only integers numbers
										// Token to indentify array of numbers is 7411176117105122
										query += ' '+mark+'7411317618171051229'+mark+' ,';	
									}
=======
									Ti.API.info("ARRAY FOR "+obj);
									query += ' '+mark+''+mark+' ,';	
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
								}
								else{
									query += ' '+mark+''+json[obj].insert[i][parse_api].replace(/"/gi, "'")+''+mark+' ,';								
								}
							}
						}
					}
					aux_column--;
				}
				//Inserts into object table
				process_obj[process_obj.length] = query;
<<<<<<< HEAD
				if (type_request == 'POST'){
					process_obj[process_obj.length] = 'DELETE FROM '+obj+' WHERE nid='+json[obj].insert[i].__negative_nid;
					process_obj[process_obj.length] = 'DELETE FROM node WHERE nid='+json[obj].insert[i].__negative_nid;
				}
=======
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
				
			}
		}
		
		//Only one object
		else{
<<<<<<< HEAD
				if (progress != null){
					//Increments Progress Bar
					progress.set();
				}
=======
				//Increments Progress Bar
				progress.set();
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
				
				Ti.API.info('####################### NOT READY ########################');
				var aux_column = ind_column;

				//Insert into node table
				var obj_title = json[obj].insert.title;
				if ((obj_title == null) || (obj_title == 'undefined')) 
					obj_title = "No Title";

				process_obj[process_obj.length] = 'INSERT INTO node (nid, created, changed, title, author_uid) VALUES ('+json[obj].insert.nid+', '+json[obj].insert.created+', '+json[obj].insert.changed+', '+obj_title+' , '+json[obj].insert.author_uid+')';
				
				
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
					Ti.API.info("Inserting ["+obj+"] : "+json[obj].insert[parse_api]);
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
					Ti.API.info("String ====>   "+json[obj].insert[parse_api].replace('"', '\"'));
					if (aux_column == 1){
<<<<<<< HEAD
				 		if ( (json[obj].insert[parse_api] == null ) || (json[obj].insert[parse_api] == "undefined" ) || ( (mark == '') && (json[obj].insert[parse_api] == '') ) ) 
=======
						if ( (json[obj].insert[parse_api] == null ) || (json[obj].insert[parse_api] == "undefined" ) || ( (mark == '') && (json[obj].insert[parse_api] == '') ) ) 
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							query += ' null )';
						else	
							query += ' '+mark+''+json[obj].insert[parse_api].replace('"', '\"')+''+mark+' )';
					}
						
					else{
						if ( (json[obj].insert[parse_api] == null ) || (json[obj].insert[parse_api] == "undefined" ) || ( (mark == '') && (json[obj].insert[parse_api] == '') ))
							query += ' null ,';
						else
							query += ' '+mark+''+json[obj].insert[parse_api].replace('"', '\"')+''+mark+' ,';
					}
					aux_column--;
				}
				//Inserts into account table
				//db_process_object.execute(query);
				process_obj[process_obj.length] = query; 
		}
		Ti.API.info("Inserted object ["+obj+"] sucefully!");				
	}
	
	//Update Object
	if (json[obj].update){
		if (json[obj].update.length){
			for (var i = 0; i < json[obj].update.length; i++ ){
<<<<<<< HEAD
				if (progress != null){
					//Increments Progress Bar
					progress.set();
				}
=======
				//Increments Progress Bar
				progress.set();
		
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
				var aux_column = ind_column;

				//Updates node table
				process_obj [process_obj.length] =  'UPDATE node SET "created"='+json[obj].update[i].created+', "changed"='+json[obj].update[i].changed+', "title"="'+json[obj].update[i].title+'", "author_uid"='+json[obj].update[i].author_uid+' WHERE "nid"='+json[obj].update[i].nid;

				//Must have more then 1 column (excluding nid)
				if (aux_column > 0){
					var query = 'UPDATE '+obj+' SET ';

					while (aux_column > 0){
						var parse_api = col_titles[aux_column-1];
						Ti.API.info("Prepared field: "+json[obj].update[i][parse_api]+" for update");
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
					process_obj [process_obj.length] =  query;
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
<<<<<<< HEAD
			if (progress != null){
				//Increments Progress Bar
				progress.set();
			}
=======
			
			//Increments Progress Bar
			progress.set();
				
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
			var aux_column = ind_column;

			//Updates node's table
			process_obj [process_obj.length] =  'UPDATE node SET "created"='+json[obj].update.created+', "changed"='+json[obj].update.changed+', "title"="'+json[obj].update.title+'", "author_uid"='+json[obj].update.author_uid+' WHERE "nid"='+json[obj].update.nid;

			//Must have more then 1 column (excluding nid)
			if (aux_column > 0){
				var query = 'UPDATE '+obj+' SET ';
			
				while (aux_column > 0){
					var parse_api = col_titles[aux_column-1];
					Ti.API.info("Prepared field: "+json[obj].update[parse_api]+" for update");
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
				process_obj [process_obj.length] = query;
			}
			//Doesn't make sense to update the primary key in this case
			/*
			else
				var query = 'UPDATE account SET "nid"='+json.account.update.nid;
			*/
		}
		Ti.API.info("Updated object ["+obj+"] sucefully!");
	}
	
	//Delete 
	if (json[obj]["delete"]){
		if (json[obj]["delete"].length){
			for (var i = 0; i <  json[obj]["delete"].length; i++ ){
<<<<<<< HEAD
				if (progress != null){
					//Increments Progress Bar
					progress.set();
				}
=======
				//Increments Progress Bar
				progress.set();
		
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
				//Deletes from object's table
				process_obj [process_obj.length] =  'DELETE FROM '+obj+' WHERE "nid"=?', json[obj]["delete"][i].nid;
				//Deletes from node table
				process_obj [process_obj.length] =  'DELETE FROM node WHERE "nid"=?', json[obj]["delete"][i].nid;
			}
		}
		else{
<<<<<<< HEAD
			if (progress != null){
				//Increments Progress Bar
				progress.set();
			}
=======
			//Increments Progress Bar
			progress.set();
			
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
			//Deletes from account table
			process_obj [process_obj.length] = 'DELETE FROM '+obj+' WHERE "nid"=?', json[obj]["delete"].nid;
			
			//Deletes from node table
			process_obj [process_obj.length] = 'DELETE FROM node WHERE "nid"=?', json[obj]["delete"].nid;
		}
		Ti.API.info("Deleted object ["+obj+"] sucefully!");
<<<<<<< HEAD
	}
	
	Ti.API.info('########## CRITICAL STEP ##########');
	
	var iObj = 0;
	var iStart = Math.round(new Date().getTime() / 1000);
	Ti.API.info("Objects started at : "+iStart);
	
	db_process_object.execute("BEGIN IMMEDIATE TRANSACTION");
	while (iObj <= process_obj.length - 1 ){
		db_process_object.execute(process_obj[iObj]);
		iObj++;
	}
=======
	}
	
	Ti.API.info('########## CRITICAL STEP ##########');
	
	var iObj = 0;
	var iStart = Math.round(new Date().getTime() / 1000);
	Ti.API.info("Objects started at : "+iStart);
	
	db_process_object.execute("BEGIN IMMEDIATE TRANSACTION");
	while (iObj <= process_obj.length - 1 ){
		db_process_object.execute(process_obj[iObj]);
		iObj++;
	}
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
	db_process_object.execute("COMMIT TRANSACTION");
	
	var iEnd = Math.round(new Date().getTime() / 1000);
	Ti.API.info("Object finishes at : "+iEnd);
	
	var iResult = iEnd - iStart;
	Ti.API.info('Object seconds: '+ iResult);
	
	return;
}

////////////////////////////////////////////////
// Gets the JSON for updated nodes
////////////////////////////////////////////////

function getJSON(){
	//Initial JSON values:
	var current_timestamp = Math.round(+new Date()/1000);
	var returning_json = '{ "timestamp" : "'+current_timestamp+'", "data" : { ';
	var db_json = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
	
	//=============================
	//Builds JSON for new nodes and for nodes that were updated
	//=============================
	var new_nodes = db_json.execute('SELECT * FROM node WHERE flag_is_updated=1 ORDER BY nid DESC');

	if (new_nodes.rowCount > 0){
		returning_json += '"node":{ ';
		while (new_nodes.isValidRow()){
				Ti.API.info('NODE '+new_nodes.fieldByName('nid')+' -----JSON BEING CREATED-----');
				var selected_node	= db_json.execute('SELECT * FROM '+new_nodes.fieldByName('table_name')+' WHERE nid = '+new_nodes.fieldByName('nid'));
				var node_fields 	= db_json.execute('SELECT * FROM fields WHERE bundle = "'+new_nodes.fieldByName('table_name')+'"');
				var type			= db_json.execute('SELECT display_name FROM bundles WHERE bundle_name = "'+node_fields.fieldByName('bundle')+'"');
				var type_string		= type.fieldByName('display_name');

				if (new_nodes.fieldByName('nid') < 0){
					returning_json += '"'+new_nodes.fieldByName('nid')+'":{ "created":"'+new_nodes.fieldByName('created')+'", "nid":"'+new_nodes.fieldByName('nid')+'", "type":"'+type_string.toLowerCase()+'" ';
				}
				else{
					returning_json += '"'+new_nodes.fieldByName('nid')+'":{ "changed":"'+new_nodes.fieldByName('changed')+'", "nid":"'+new_nodes.fieldByName('nid')+'", "type":"'+type_string.toLowerCase()+'" ';					
				}

				while (node_fields.isValidRow()){
					if ( (selected_node.fieldByName(node_fields.fieldByName('field_name')) != null) && (selected_node.fieldByName(node_fields.fieldByName('field_name')) != '')){
						returning_json += ', "'+node_fields.fieldByName('field_name')+'": "'+selected_node.fieldByName(node_fields.fieldByName('field_name'))+'" ';
					}				
					node_fields.next();
				}
				returning_json += ' } ';

				//Next node
				new_nodes.next();
				if (new_nodes.isValidRow()){
					returning_json += ', ';
				}
		}

		//close 'node'
		returning_json += '} ';
		selected_node.close();
		node_fields.close();
		type.close();
	}
	// close data and timestamp:
	returning_json += ' } }';
	
	Ti.API.info(returning_json);
	
	//Close db connections and result set
	new_nodes.close();
	db_json.close();
	return returning_json;
}

//Install new updates using pagination
//Load existing data with pagination
<<<<<<< HEAD
function installMe(pageIndex, win, timeIndex, progress, menu, img, type_request)
=======
function installMe(pageIndex, win, timeIndex, progress, menu, img)
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
{
	var db_installMe = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
	
	var objectsUp = win.log;

	//Timeout until error:
	objectsUp.setTimeout(10000);

	Ti.API.info("Current page: "+ pageIndex);
	
	Ti.API.info("TIME: "+timeIndex);
<<<<<<< HEAD
	Ti.API.info("Type: "+type_request);
=======

	//Opens address to retrieve contact list
	if (timeIndex == 0 ){
		if (pageIndex == 0)
			objectsUp.open('GET', win.picked + '/js-sync/sync.json?reset=1&limit=250' );
		else
			objectsUp.open('GET', win.picked + '/js-sync/sync.json?sync_timestamp='+ timeIndex+'&reset=1&limit=250&page='+pageIndex );
	}
	else{
		if (pageIndex == 0)
			objectsUp.open('GET', win.picked + '/js-sync/sync.json?reset=0&limit=250');
		else
			objectsUp.open('GET', win.picked + '/js-sync/sync.json?sync_timestamp=' + timeIndex +'&reset=1&limit=250&page='+pageIndex );
	}
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
	
	if (type_request == 'POST'){
		objectsUp.open('POST', win.picked + '/js-sync/sync.json' );		
	}
	else{
		//Opens address to retrieve contact list
		if (timeIndex == 0 ){
			if (pageIndex == 0)
				objectsUp.open('GET', win.picked + '/js-sync/sync.json?reset=1&limit=250' );
			else
				objectsUp.open('GET', win.picked + '/js-sync/sync.json?sync_timestamp='+ timeIndex+'&reset=1&limit=250&page='+pageIndex );
		}
		else{
			if (pageIndex == 0)
				objectsUp.open('GET', win.picked + '/js-sync/sync.json?reset=0&limit=250');
			else
				objectsUp.open('GET', win.picked + '/js-sync/sync.json?sync_timestamp=' + timeIndex +'&reset=1&limit=250&page='+pageIndex );
		}
	}
	//Header parameters
	objectsUp.setRequestHeader("Content-Type", "application/json");

	//When connected
	objectsUp.onload = function(e) {
		//Parses response into strings
		Ti.API.info("Onload reached");
		var json = JSON.parse(this.responseText);
<<<<<<< HEAD
		
		Ti.API.info('==========TYPE=========   '+type_request);
		if (type_request == 'GET'){
			var existsMorePages;

			//Set our maximum 
			if (pageIndex == 0){
				Ti.API.info("######## CHECK ########  "+parseInt(json.total_item_count));
				if (progress != null){
					//Set max value for progress bar
					progress.set_max(parseInt(json.total_item_count));				
				}
				
			}
			Ti.API.info("JSON: "+json);
		}
		else{
			Ti.API.info("######## CHECK ########  "+parseInt(json.total_item_count));
			if (progress != null){
				//Set max value for progress bar
				progress.set_max(parseInt(json.total_item_count));				
			}
			Ti.API.info("JSON update: "+json);
		}
		
		if (type_request == 'GET'){
			Ti.API.info("Delete all value: "+json.delete_all);
			
			//Check this function
			if (json.delete_all == true){
				Ti.API.info("=================== ############ ===================");
				Ti.API.info("Reseting database, delete_all is required");
				Ti.API.info("=================== ############ ===================");
	
				//If delete_all is present, delete all contents:
				db_installMe.execute('DROP TABLE IF EXISTS account');
				db_installMe.execute('CREATE TABLE "account" ("nid" INTEGER PRIMARY KEY NOT NULL  UNIQUE )');
				
				db_installMe.execute('DROP TABLE IF EXISTS contact');
				db_installMe.execute('CREATE TABLE "contact" ("nid" INTEGER PRIMARY KEY NOT NULL  UNIQUE )');
	
				db_installMe.execute('DROP TABLE IF EXISTS lead');
				db_installMe.execute('CREATE TABLE "lead" ("nid" INTEGER PRIMARY KEY   NOT NULL  UNIQUE )');
				
				db_installMe.execute('DROP TABLE IF EXISTS node');
				db_installMe.execute('CREATE TABLE "node" ("nid" INTEGER PRIMARY KEY NOT NULL  UNIQUE , "title" VARCHAR, "created" INTEGER, "changed" INTEGER, "author_uid" INTEGER)');
							
				db_installMe.execute('DROP TABLE IF EXISTS potential');
				db_installMe.execute('CREATE TABLE "potential" ("nid" INTEGER PRIMARY KEY NOT NULL  UNIQUE )');
	
	
				//Do not delete user_location, it is gonna always be in a small size
				//db_installMe.execute('DROP TABLE IF EXISTS user_location');
				//db_installMe.execute('CREATE TABLE "user_location" ("uid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE , "longitude" TEXT NOT NULL , "latitude" TEXT NOT NULL , "timestamp" INTEGER NOT NULL , "status" TEXT)');
							
				db_installMe.execute('DROP TABLE IF EXISTS user_roles');
				db_installMe.execute('CREATE TABLE "user_roles" ("uid" INTEGER, "rid" INTEGER)');
	
				db_installMe.execute('DROP TABLE IF EXISTS task');
				db_installMe.execute('CREATE TABLE "task" ("nid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE )');
				
				db_installMe.execute('DROP TABLE IF EXISTS boot');
				db_installMe.execute('CREATE TABLE "boot" ("boot_id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE )');
	
				db_installMe.execute('DROP TABLE IF EXISTS bundles');
				db_installMe.execute('CREATE TABLE "bundles" ("bid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE , "bundle_name" VARCHAR)');
				
				db_installMe.execute('DROP TABLE IF EXISTS fields');
				db_installMe.execute('CREATE TABLE "fields" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE, "fid" INTEGER NOT NULL , "type" TEXT, "field_name" TEXT, "label" TEXT, "description" TEXT, "bundle" TEXT NOT NULL , "weight" INTEGER, "required" TEXT , "widget" TEXT, "settings" TEXT, "disabled" INTEGER DEFAULT 0)');
				
				db_installMe.execute('DROP TABLE IF EXISTS term_data');
				db_installMe.execute('CREATE TABLE "term_data" ("tid" INTEGER PRIMARY KEY  NOT NULL  UNIQUE , "vid" INTEGER, "name" VARCHAR, "description" VARCHAR, "weight" VARCHAR)');
							
				db_installMe.execute('DROP TABLE IF EXISTS updated');
				db_installMe.execute('CREATE TABLE "updated" ("timestamp" INTEGER DEFAULT 0, "url" TEXT DEFAULT NULL)');
				
				db_installMe.execute('DROP TABLE IF EXISTS users');
				db_installMe.execute('CREATE TABLE "users" ("uid" INTEGER PRIMARY KEY  NOT NULL  UNIQUE , "username" TEXT, "mail" TEXT, "realname" TEXT, "status" INTEGER)');
							
				db_installMe.execute('DROP TABLE IF EXISTS vocabulary');
				db_installMe.execute('CREATE TABLE "vocabulary" ("vid" INTEGER PRIMARY KEY  NOT NULL  UNIQUE , "name" VARCHAR, "machine_name" TEXT)');
							
				db_installMe.execute('INSERT INTO updated (timestamp, url) VALUES (?,?)', 0 , null);		
			}
			
			pageIndex++;
			
	
			Ti.API.info("Max itens: "+parseInt(json.total_item_count));
			Ti.API.info("Current page integer: "+parseInt(json.page));
	
			//If it is the end
			if ( (json.page == json.max_page) || json.max_page == -1 )
				existsMorePages = false;
			else
				existsMorePages = true;	
			
			Ti.API.info("Current page: "+json.page);
			Ti.API.info("Maximum pages: "+json.max_page);
			Ti.API.info("Exist more pages? "+existsMorePages);
			Ti.API.info("Next page (no limit): "+pageIndex);
		}
		
		//If Database is already last version
		if ( (type_request == 'GET') && (json.total_item_count == 0 ) ){
=======
		var existsMorePages;

		//Set our maximum 
		if (pageIndex == 0){
			Ti.API.info("######## CHECK ########  "+parseInt(json.total_item_count));
			//Set max value for progress bar
			progress.set_max(parseInt(json.total_item_count));
		}
		
		
		Ti.API.info("JSON: "+json);
		Ti.API.info("Delete all value: "+json.delete_all);
		
		
		//Check this function
		if (json.delete_all == true){
			Ti.API.info("=================== ############ ===================");
			Ti.API.info("Reseting database, delete_all is required");
			Ti.API.info("=================== ############ ===================");

			//If delete_all is present, delete all contents:
			db_installMe.execute('DROP TABLE IF EXISTS account');
			db_installMe.execute('CREATE TABLE "account" ("nid" INTEGER PRIMARY KEY NOT NULL  UNIQUE )');
			
			db_installMe.execute('DROP TABLE IF EXISTS contact');
			db_installMe.execute('CREATE TABLE "contact" ("nid" INTEGER PRIMARY KEY NOT NULL  UNIQUE )');

			db_installMe.execute('DROP TABLE IF EXISTS lead');
			db_installMe.execute('CREATE TABLE "lead" ("nid" INTEGER PRIMARY KEY   NOT NULL  UNIQUE )');
			
			db_installMe.execute('DROP TABLE IF EXISTS node');
			db_installMe.execute('CREATE TABLE "node" ("nid" INTEGER PRIMARY KEY NOT NULL  UNIQUE , "title" VARCHAR, "created" INTEGER, "changed" INTEGER, "author_uid" INTEGER)');
						
			db_installMe.execute('DROP TABLE IF EXISTS potential');
			db_installMe.execute('CREATE TABLE "potential" ("nid" INTEGER PRIMARY KEY NOT NULL  UNIQUE )');


			//Do not delete user_location, it is gonna always be in a small size
			//db_installMe.execute('DROP TABLE IF EXISTS user_location');
			//db_installMe.execute('CREATE TABLE "user_location" ("uid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE , "longitude" TEXT NOT NULL , "latitude" TEXT NOT NULL , "timestamp" INTEGER NOT NULL , "status" TEXT)');
						
			db_installMe.execute('DROP TABLE IF EXISTS user_roles');
			db_installMe.execute('CREATE TABLE "user_roles" ("uid" INTEGER, "rid" INTEGER)');

			db_installMe.execute('DROP TABLE IF EXISTS task');
			db_installMe.execute('CREATE TABLE "task" ("nid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE )');
			
			db_installMe.execute('DROP TABLE IF EXISTS boot');
			db_installMe.execute('CREATE TABLE "boot" ("boot_id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE )');

			db_installMe.execute('DROP TABLE IF EXISTS bundles');
			db_installMe.execute('CREATE TABLE "bundles" ("bid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE , "bundle_name" VARCHAR)');
			
			db_installMe.execute('DROP TABLE IF EXISTS fields');
			db_installMe.execute('CREATE TABLE "fields" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE, "fid" INTEGER NOT NULL , "type" TEXT, "field_name" TEXT, "label" TEXT, "description" TEXT, "bundle" TEXT NOT NULL , "weight" INTEGER, "required" TEXT , "widget" TEXT, "settings" TEXT, "disabled" INTEGER DEFAULT 0)');
			
			db_installMe.execute('DROP TABLE IF EXISTS term_data');
			db_installMe.execute('CREATE TABLE "term_data" ("tid" INTEGER PRIMARY KEY  NOT NULL  UNIQUE , "vid" INTEGER, "name" VARCHAR, "description" VARCHAR, "weight" VARCHAR)');
						
			db_installMe.execute('DROP TABLE IF EXISTS updated');
			db_installMe.execute('CREATE TABLE "updated" ("timestamp" INTEGER DEFAULT 0, "url" TEXT DEFAULT NULL)');
			
			db_installMe.execute('DROP TABLE IF EXISTS users');
			db_installMe.execute('CREATE TABLE "users" ("uid" INTEGER PRIMARY KEY  NOT NULL  UNIQUE , "username" TEXT, "mail" TEXT, "realname" TEXT, "status" INTEGER)');
						
			db_installMe.execute('DROP TABLE IF EXISTS vocabulary');
			db_installMe.execute('CREATE TABLE "vocabulary" ("vid" INTEGER PRIMARY KEY  NOT NULL  UNIQUE , "name" VARCHAR, "machine_name" TEXT)');
						
			db_installMe.execute('INSERT INTO updated (timestamp, url) VALUES (?,?)', 0 , null);		
		}
		
		pageIndex++;
		

		Ti.API.info("Max itens: "+parseInt(json.total_item_count));
		Ti.API.info("Current page integer: "+parseInt(json.page));

		//If it is the end
		if ( (json.page == json.max_page) || json.max_page == -1 )
			existsMorePages = false;
		else
			existsMorePages = true;	
		
		Ti.API.info("Current page: "+json.page);
		Ti.API.info("Maximum pages: "+json.max_page);
		Ti.API.info("Exist more pages? "+existsMorePages);
		Ti.API.info("Next page (no limit): "+pageIndex);
		
		//If Database is already last version
		if (json.total_item_count == 0 ){
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
			Ti.API.info('######### Last request : '+json.sync_timestamp);
			db_installMe.execute('UPDATE updated SET "timestamp"='+ json.sync_timestamp +' WHERE "rowid"=1');
			db_installMe.close();
			
<<<<<<< HEAD
			Ti.API.info("SUCCESS -> No items ");
			if (progress != null){
				progress.set();
				progress.close();
			}
			unsetUse();
		}
		else
		{
			if (type_request == 'GET'){
				if ((isFirstTime) && (pageIndex==1)){
					db_installMe.execute('UPDATE updated SET "url"="'+ win.picked +'" WHERE "rowid"=1');						
				}
	
				//pageIndex == 1 means first load, pageIndex is incremented some lines above
				if (pageIndex == 1 ){
					Ti.API.info('######### Last request : '+json.sync_timestamp);
					db_installMe.execute('UPDATE updated SET "timestamp"='+ json.sync_timestamp +' WHERE "rowid"=1');				
				}   
				Ti.API.info("COUNT: "+json.total_item_count);	
			}
=======
			Titanium.App.Properties.setBool("UpRunning", false);
			Ti.API.info("SUCCESS -> No items ");
			Ti.API.info('Is there an update happening? '+Titanium.App.Properties.getBool("UpRunning"));
			
			progress.set();
			progress.close();
		}
		else
		{
			if ((isFirstTime) && (pageIndex==1)){
				db_installMe.execute('UPDATE updated SET "url"="'+ win.picked +'" WHERE "rowid"=1');						
			}

			//pageIndex == 1 means first load, pageIndex is incremented some lines above
			if (pageIndex == 1 ){
				Ti.API.info('######### Last request : '+json.sync_timestamp);
				db_installMe.execute('UPDATE updated SET "timestamp"='+ json.sync_timestamp +' WHERE "rowid"=1');				
			}   
			Ti.API.info("COUNT: "+json.total_item_count);	
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
			
			//Node types creation:
			if (json.node_type){
				var node_db = [];
				//Node type inserts
				if (json.node_type.insert){
					//Multiple nodes inserts
					if (json.node_type.insert.length){
						for (var i = 0; i < json.node_type.insert.length; i++ ){
							if (json.node_type.insert[i].type != 'user'){
								//Increment the progress bar
<<<<<<< HEAD
								if (progress != null){
									progress.set();
								}
=======
								progress.set();
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
								node_db[node_db.length] = "CREATE TABLE "+json.node_type.insert[i].type+" ('nid' INTEGER PRIMARY KEY NOT NULL  UNIQUE )";
								node_db[node_db.length] = "INSERT INTO bundles (bundle_name, display_name, description) VALUES ('"+json.node_type.insert[i].type+"', '"+json.node_type.insert[i].name+"' , '"+json.node_type.insert[i].description+"' )";
								Ti.API.info('Node type : '+json.node_type.insert[i].type+' has been created');
							}
						}
					}
					
					//Unique node insert
					else{
						if (json.node_type.insert.type != 'user'){
<<<<<<< HEAD
							if (progress != null){
								progress.set();
							}
=======
							progress.set();
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							node_db[node_db.length] = "CREATE TABLE "+json.node_type.insert.type+" ('nid' INTEGER PRIMARY KEY NOT NULL  UNIQUE )";
							node_db[node_db.length] = "INSERT INTO bundles (bundle_name) VALUES ('"+json.node_type.insert.type+"')";						
							Ti.API.info('Node type : '+json.node_type.insert.type+' has been created');
						}						
					}
				}
				//Doesn't make sense to update it at this moment because we create an empty table
				//The only thing to consideer is deletion.
				//Node type updates - Not implemented yet (API's side)
				else if (json.node_type.update){
					//Multiple nodes updates
					if (json.node_type.update.length){
						for (var i = 0; i < json.node_type.update.length; i++ ){
							//Increment the progress bar
<<<<<<< HEAD
							if (progress != null){
								progress.set();
							}
=======
							progress.set();
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							//Just in case it is working
							Ti.API.info('@Developer: Updates for node_type need to be created');
						}
					}
					//Unique node update
					else{
<<<<<<< HEAD
						if (progress != null){
							progress.set();
						}
=======
						progress.set();
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
						Ti.API.info('@Developer: Updates for node_type need to be created');
					}
				}
				
				//Node type deletion - Not implemented yet (API's side)
				else if (json.node_type['delete']){
					//Multiple node deletions
					if ( json.node_type['delete'].length ){
						for (var i = 0; i < json.node_type['delete'].length; i++ ){
							//Increment the progress bar
<<<<<<< HEAD
							if (progress != null){
								progress.set();
							}
=======
							progress.set();
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							node_db[node_db.length] = "DROP TABLE "+json.node_type.insert[i].type;
							node_db[node_db.length] = "DELETE FROM bundles WHERE bundle_name = '"+json.node_type.insert[i].type+"'";
							Ti.API.info('@Developer: Deletions for node_type need to be created');
						}
					}
					//Unique node deletion
					else{
<<<<<<< HEAD
						if (progress != null){
							progress.set();
						}
=======
						progress.set();
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
						node_db[node_db.length] = "DROP TABLE "+json.node_type.insert.type;
						node_db[node_db.length] = "DELETE FROM bundles WHERE bundle_name = '"+json.node_type.insert.type+"'";
						Ti.API.info('@Developer: Deletions for node_type need to be created');
					}
				}
				
				//DB operations
				var iPerform = 0;
				var iStart = Math.round(new Date().getTime() / 1000);
				Ti.API.info("Node_type started at : "+iStart);

				db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
				while (iPerform <= node_db.length - 1 ){
					db_installMe.execute(node_db[iPerform]);
					iPerform++;
				}
				db_installMe.execute("COMMIT TRANSACTION");
				
				var iEnd = Math.round(new Date().getTime() / 1000);
				Ti.API.info("Node_type finishes at : "+iEnd);
				
				var iResult = iEnd - iStart;
				Ti.API.info('Node_type seconds: '+ iResult);
				Ti.API.info("Success for node_types, db operations ran smoothly!");
			}

			//Fields:
			if (json.fields){
				if (json.fields.insert){
					//SQL actions:
					var perform = [];
					//Array of objects
					if (json.fields.insert.length){
						for (var i = 0; i < json.fields.insert.length; i++ ){
<<<<<<< HEAD
							if (progress != null){
								//Increment Progress Bar
								progress.set();
							}
=======
							//Increment Progress Bar
							progress.set();
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							
							//Encode:
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
									//db_installMe.execute("INSERT INTO fields (fid, type, field_name, label, description, bundle, weight, required, widget, settings) VALUES ("+fid+",'"+type+"','"+field_name+"___"+f_value_i+"','"+label+"','"+description+"','"+bundle+"',"+weight+", '"+required+"','"+widget+"','"+settings+"' )");
									perform[perform.length] = "INSERT INTO fields (fid, type, field_name, label, description, bundle, weight, required, widget, settings) VALUES ("+fid+",'"+type+"','"+field_name+"___"+f_value_i+"','"+label+"','"+description+"','"+bundle+"',"+weight+", '"+required+"','"+widget+"','"+settings+"' )";
								}
							}
							//Normal field
							else {
								perform[perform.length] = "INSERT INTO fields (fid, type, field_name, label, description, bundle, weight, required, widget, settings) VALUES ("+fid+",'"+type+"','"+field_name+"','"+label+"','"+description+"','"+bundle+"',"+weight+", '"+required+"','"+widget+"','"+settings+"' )";
							}

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
							
							//Check if it is a valid bundle (automatically inserted throught the API):
							var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "'+json.fields.insert[i].bundle+'"');
							if ( q_bund.isValidRow() ){
								if (json.fields.insert[i].settings.parts){
									for (var f_value_i in json.fields.insert[i].settings.parts ) {
										perform[perform.length] = 'ALTER TABLE '+json.fields.insert[i].bundle+' ADD '+json.fields.insert[i].field_name+'___'+f_value_i+' '+ type;
										Ti.API.info("Inserted: "+json.fields.insert[i].field_name+"___"+f_value_i+" to be used in "+json.fields.insert[i].bundle);
									}
								}
								else{
									perform[perform.length] = 'ALTER TABLE '+json.fields.insert[i].bundle+' ADD '+json.fields.insert[i].field_name+' '+ type;
									Ti.API.info("Inserted: "+json.fields.insert[i].field_name+" to be used in "+json.fields.insert[i].bundle);
								}
							}
							else{
								Ti.API.info('=====================>>>>> Avoiding fields creation for table: '+json.fields.insert[i].bundle);
							}
						}
						q_bund.close();
					}
					//Single object
					else{
<<<<<<< HEAD
						if (progress != null){
							//Increment Progress Bar
							progress.set();
						}
=======
						//Increment Progress Bar
						progress.set();
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
						
						var var_widget = JSON.stringify(json.fields.insert.widget);
						var var_settings = JSON.stringify(json.fields.insert.settings); 

						//Insert into fields
						perform[perform.length] = 'INSERT INTO fields (fid, type, field_name, label, description, bundle, weight, required, widget, settings) VALUES (?,?,?,?,?,?,?,?,?,?)', json.fields.insert.fid , json.fields.insert.type , json.fields.insert.field_name , json.fields.insert.label , json.fields.insert.description , json.fields.insert.bundle , json.fields.insert.weight, json.fields.insert.required , "var_widget", "var_settings" ;
						
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
						
						//Check if it is a valid bundle (automatically inserted throught the API):
						var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "'+json.fields.insert[i].bundle+'"');
						if ( q_bund.isValidRow() ){
							if (json.fields.insert.settings.parts){
								for (var f_value_i in json.fields.insert.settings.parts ) {
									perform[perform.length] = 'ALTER TABLE '+json.fields.insert.bundle+' ADD '+json.fields.insert.field_name+'___'+f_value_i+' '+ type;
									Ti.API.info("Inserted: "+json.fields.insert.field_name+"___"+f_value_i+" to be used in "+json.fields.insert.bundle);
								}
							}
							else{
								perform[perform.length] = 'ALTER TABLE '+json.fields.insert.bundle+' ADD '+json.fields.insert.field_name+' '+ type;
								Ti.API.info("Inserted: "+json.fields.insert.field_name+" to be used in "+json.fields.insert.bundle);
							}
						}
						else{
							Ti.API.info('Avoiding fields creation for table: '+json.fields.insert.bundle);
						}
						q_bund.close();
					}
				}
				if (json.fields.update){
					Ti.API.info("Fields update defined!");
					if (json.fields.update.length){
						for (var i = 0; i < json.fields.update.length; i++ ){
<<<<<<< HEAD
							if (progress != null){
								//Increment Progress Bar
								progress.set();
							}
=======
							//Increment Progress Bar
							progress.set();
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							var_widget = JSON.stringify(json.fields.update[i].widget);
							var_settings = JSON.stringify(json.fields.update[i].settings); 
							db_installMe.execute('UPDATE fields SET "type"=?, "field_name"=?, "label"=?, "description"=?, "bundle"=?, "weight"=?, "required"=?, "widget"=?, "settings"=? WHERE "fid"=?', json.fields.insert[i].type , json.fields.insert[i].field_name , json.fields.insert[i].label , json.fields.insert[i].description , json.fields.insert[i].bundle , json.fields.insert[i].weight, json.fields.insert[i].required , var_widget , var_settings, json.fields.insert[i].fid );
						}
					}
<<<<<<< HEAD
					else{ 
							if (progress != null){
								//Increment Progress Bar
								progress.set();
							}
=======
					else{
							//Increment Progress Bar
							progress.set();
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							var_widget = JSON.stringify(json.fields.update.widget);
							var_settings = JSON.stringify(json.fields.update.settings); 
							db_installMe.execute('UPDATE fields SET "type"=?, "field_name"=?, "label"=?, "description"=?, "bundle"=?, "weight"=?, "required"=?, "widget"=?, "settings"=? WHERE "fid"=?', json.fields.insert.type , json.fields.insert.field_name , json.fields.insert.label , json.fields.insert.description , json.fields.insert.bundle , json.fields.insert.weight, json.fields.insert.required , var_widget, var_settings, json.fields.insert.fid );
					}
				}
				
				/*
				 * Delete fields from fields table
				 * Needs to be implemented from the server side
				 *
				 * 
				if (json.fields["delete"]){
					if (json.fields["delete"].length){
						for (var i = 0; i < json.fields["delete"].length; i++ ){
							//Deletes rows from terms
							db_installMe.execute('DELETE FROM fields WHERE "fid"=?',json.fields["delete"][i].vid);											
						}
					}
					else{
						//Deletes row from terms
						db_installMe.execute('DELETE FROM term_data WHERE "vid"=?',json.vocabularies["delete"].vid);							
						
						//Deletes corresponding row in vocabulary
						db_installMe.execute('DELETE FROM vocabulary WHERE "vid"=?',json.vocabularies["delete"].vid);				
					}
				}
				*/

				var iPerform = 0;
				var iStart = Math.round(new Date().getTime() / 1000);
				Ti.API.info("Fields started at : "+iStart);

<<<<<<< HEAD

=======
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
				db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
				while (iPerform <= perform.length - 1 ){
					db_installMe.execute(perform[iPerform]);
					iPerform++;
				}
				db_installMe.execute("COMMIT TRANSACTION");
				
				var iEnd = Math.round(new Date().getTime() / 1000);
				Ti.API.info("Fields finishes at : "+iEnd);
				
				var iResult = iEnd - iStart;
				Ti.API.info('Fields seconds: '+ iResult);
				Ti.API.info("Success for fields, it was inserted!");
				
			} 
			
			//
			//Retrieve objects that need quotes:
			//
			var iStart = Math.round(new Date().getTime() / 1000);
			Ti.API.info("Finding proccess started at : "+iStart);

			var need_at = db_installMe.execute("SELECT field_name,bundle FROM fields WHERE type='number_integer' OR type='number_decimal' ");
			
			var quotes = new Array(); 
			
			while (need_at.isValidRow()){
				quotes[need_at.fieldByName('field_name')] = new Array(); 
				quotes[need_at.fieldByName('field_name')][need_at.fieldByName('bundle')] = true;
				need_at.next();
			}
			
			var iEnd = Math.round(new Date().getTime() / 1000);
			Ti.API.info("Finding proccess ended at : "+iEnd);
			
			var iResult = iEnd - iStart;
			Ti.API.info('Found in seconds: '+ iResult);
			Ti.API.info("Success for finding!");
			
			for (var index in quotes ){
				for (var jndex in quotes[index])
					Ti.API.info("For index "+index+" in "+jndex+" we got "+quotes[index][jndex]);
			}
			
			//Vocabulary:
			if (json.vocabularies){
				Ti.API.info('Vocabularies');
				if (json.vocabularies.insert){
					var perform_vocabulary = [];
					if (json.vocabularies.insert.length){
						for (var i = 0; i < json.vocabularies.insert.length; i++ ){
							//Increment Progress Bar
<<<<<<< HEAD
							if (progress != null){
								progress.set();
							}
=======
							progress.set();
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							var vid_v = json.vocabularies.insert[i].vid;
							var name_v = json.vocabularies.insert[i].name;
							var machine_v = json.vocabularies.insert[i].machine_name;
							
							if (name_v == null)
								name_v = "null";
							if (machine_v == null)
								machine_v = "";
							//Ti.API.info("About to insert vocabulary: "+vid_v);
							perform_vocabulary[perform_vocabulary.length] = 'INSERT INTO vocabulary (vid, name, machine_name) VALUES ('+vid_v+',"'+name_v+'","'+machine_v+'")'; 				
						}
					}
					else{
<<<<<<< HEAD
							if (progress != null){
								//Increment Progress Bar
								progress.set();
							}
=======
							//Increment Progress Bar
							progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							var vid_v = json.vocabularies.insert.vid;
							var name_v = json.vocabularies.insert.name;
							var machine_v = json.vocabularies.insert.machine_name;
							
							if (name_v == null)
								name_v = "null";
							
							if (machine_v == null)
								machine_v = "";
							//Ti.API.info("About to insert vocabulary: "+vid_v);
							perform_vocabulary[perform_vocabulary.length] = 'INSERT INTO vocabulary (vid, name, machine_name) VALUES ('+vid_v+',"'+name_v+'","'+machine_v+'")';
					}
					
				}
				if (json.vocabularies.update){
					if (json.vocabularies.update.length){
						for (var i = 0; i < json.vocabularies.update.length; i++ ){
<<<<<<< HEAD
							if (progress != null){
								//Increment Progress Bar
								progress.set();
							}
=======
							//Increment Progress Bar
							progress.set();
>>>>>>> 2696447049ef095bd171249c415a58c543975f20

							//Ti.API.info("About to update vocabulary: "+json.vocabularies.update[i].vid);
							perform_vocabulary[perform_vocabulary.length] =  'UPDATE vocabulary SET "name"="'+json.vocabularies.update[i].name+'", "machine_name"="'+json.vocabularies.update[i].machine_name+'" WHERE "vid"='+json.vocabularies.update[i].vid;
						}
					}
					else{
<<<<<<< HEAD
							if (progress != null){
								//Increment Progress Bar
								progress.set();
							}
=======
							//Increment Progress Bar
							progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							//Ti.API.info("About to update vocabulary: "+json.vocabularies.update.vid);
							perform_vocabulary[perform_vocabulary.length] =  'UPDATE vocabulary SET "name"="'+json.vocabularies.update.name+'", "machine_name"="'+json.vocabularies.update.machine_name+'" WHERE "vid"='+json.vocabularies.update.vid;						
					}
					Ti.API.info("Vocabulary updated!");
				}
				if (json.vocabularies["delete"]){
					if (json.vocabularies["delete"].length){
						for (var i = 0; i < json.vocabularies["delete"].length; i++ ){
<<<<<<< HEAD
							if (progress != null){
								//Increment Progress Bar
								progress.set();
							}
=======
							//Increment Progress Bar
							progress.set();
>>>>>>> 2696447049ef095bd171249c415a58c543975f20

							//Ti.API.info("About to delete vocabulary: "+json.vocabularies["delete"][i].vid);
							//Deletes rows from terms
							perform_vocabulary[perform_vocabulary.length] = 'DELETE FROM term_data WHERE "vid"='+json.vocabularies["delete"][i].vid;							
							
							//Deletes corresponding rows in vocabulary
							perform_vocabulary[perform_vocabulary.length] = 'DELETE FROM vocabulary WHERE "vid"='+json.vocabularies["delete"][i].vid;
						}
					}
					else{
						//Ti.API.info("About to delete vocabulary: "+json.vocabularies["delete"].vid);
<<<<<<< HEAD
						if (progress != null){
							//Increment Progress Bar
							progress.set();
						}
=======

						//Increment Progress Bar
						progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20
						//Deletes row from terms
						perform_vocabulary[perform_vocabulary.length] = 'DELETE FROM term_data WHERE "vid"='+json.vocabularies["delete"].vid;							
						
						//Deletes corresponding row in vocabulary
						perform_vocabulary[perform_vocabulary.length] = 'DELETE FROM vocabulary WHERE "vid"='+json.vocabularies["delete"].vid;				
					}
					Ti.API.info("Vocabulary deleted!");
<<<<<<< HEAD
				}
				var iVocabulary = 0;
					
				var iStart = Math.round(new Date().getTime() / 1000);
				Ti.API.info("Vocabulary started at : "+iStart);

				db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
				while (iVocabulary <= perform_vocabulary.length-1 ){
					db_installMe.execute(perform_vocabulary[iVocabulary]);
					iVocabulary++;
				}
				db_installMe.execute("COMMIT TRANSACTION");
				
				var iEnd = Math.round(new Date().getTime() / 1000);
				Ti.API.info("Vocabulary finishes at : "+iEnd);
				
=======
				}
				var iVocabulary = 0;
					
				var iStart = Math.round(new Date().getTime() / 1000);
				Ti.API.info("Vocabulary started at : "+iStart);

				db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
				while (iVocabulary <= perform_vocabulary.length-1 ){
					db_installMe.execute(perform_vocabulary[iVocabulary]);
					iVocabulary++;
				}
				db_installMe.execute("COMMIT TRANSACTION");
				
				var iEnd = Math.round(new Date().getTime() / 1000);
				Ti.API.info("Vocabulary finishes at : "+iEnd);
				
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
				var iResult = iEnd - iStart;
				Ti.API.info('Vocabulary seconds: '+ iResult);

				Ti.API.info("Vocabulary inserted!");
			} 
			//Terms:
			if (json.terms){
				Ti.API.info('Terms');
				if (json.terms.insert){
					var perform_term = [];
					if (json.terms.insert.length){
						for (var i = 0; i < json.terms.insert.length; i++ ){
<<<<<<< HEAD
							if (progress != null){
								//Increment Progress Bar
								progress.set();
							}
=======

							//Increment Progress Bar
							progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							
							var vid_t = json.terms.insert[i].vid;
							var tid_t = json.terms.insert[i].tid;
							var name_t = json.terms.insert[i].name;
							var desc_t = json.terms.insert[i].description;
							var weight_t = json.terms.insert[i].weight;
							
							if (desc_t == null)
								desc_t = "";
							if (name_t == null)
								name_t = "";
							if (weight_t == null)
								weight_t = "";
																
							//Ti.API.info("About to insert term: "+tid_t);  	
							perform_term [perform_term.length] = 'INSERT INTO term_data ( tid , vid, name, description, weight) VALUES ('+tid_t+','+vid_t+',"'+name_t+'","'+desc_t+'","'+weight_t+'")';
						}
					}
					else{
<<<<<<< HEAD
							if (progress != null){
								//Increment Progress Bar
								progress.set();
							}
							
=======
							//Increment Progress Bar
							progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							var vid_t = json.terms.insert.vid;
							var tid_t = json.terms.insert.tid;
							var name_t = json.terms.insert.name;
							var desc_t = json.terms.insert.description;
							var weight_t = json.terms.insert.weight;
							
							if (desc_t == null)
								desc_t = "";
							if (name_t == null)
								name_t = "";
							if (weight_t == null)
								weight_t = "";

							//Ti.API.info("About to insert term: "+tid_t);
							perform_term [perform_term.length] = 'INSERT INTO term_data ( tid , vid, name, description, weight) VALUES ('+tid_t+','+vid_t+',"'+name_t+'","'+desc_t+'","'+weight_t+'")';
					}
					
				}
				if (json.terms.update){
					if (json.terms.update.length){
						for (var i = 0; i < json.terms.update.length; i++ ){
<<<<<<< HEAD
							
							if (progress != null){
								//Increment Progress Bar
								progress.set();
							}
=======
							//Increment Progress Bar
							progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							//Ti.API.info("About to update term: "+json.terms.update[i].tid);							
							perform_term[perform_term.length] = 'UPDATE term_data SET "name"="'+json.terms.update[i].name+'", "description"="'+json.terms.update[i].description+'",  "weight"="'+json.terms.update[i].weight+'", "vid"='+json.terms.update[i].vid+'  WHERE "tid"='+json.terms.update[i].tid;
						}
					}
					else{
<<<<<<< HEAD
							if (progress != null){
								//Increment Progress Bar
								progress.set();
							}
							
=======
							//Increment Progress Bar
							progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							//Ti.API.info("About to update term: "+json.terms.update.tid);
							perform_term[perform_term.length] = 'UPDATE term_data SET "name"="'+json.terms.update.name+'", "description"="'+json.terms.update.description+'",  "weight"="'+json.terms.update.weight+'", "vid"='+json.terms.update.vid+'  WHERE "tid"='+json.terms.update.tid;						
					}
				}
				if (json.terms["delete"]){
					if (json.terms["delete"].length){
						for (var i = 0; i < json.terms["delete"].length; i++ ){
<<<<<<< HEAD
							if (progress != null){
								//Increment Progress Bar
								progress.set();
							}
=======
							//Increment Progress Bar
							progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							//Ti.API.info("About to delete term: "+json.terms["delete"][i].tid);
							perform_term[perform_term.length] = 'DELETE FROM term_data WHERE "tid"='+json.terms["delete"][i].tid;
						}
					}
					else{
<<<<<<< HEAD
						if (progress != null){
							//Increment Progress Bar
							progress.set();
						}
=======
						//Increment Progress Bar
						progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20
						//Ti.API.info("About to delete term: "+json.terms["delete"].tid);
						perform_term[perform_term.length] = 'DELETE FROM term_data WHERE "tid"='+json.terms["delete"].tid;
					}
				}

				var iTerm = 0;
				
				var iStart = Math.round(new Date().getTime() / 1000);
				Ti.API.info("Term started at : "+iStart);

				db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
				while (iTerm <= perform_term.length-1 ){
					db_installMe.execute(perform_term[iTerm]);
					iTerm++;
				}
				db_installMe.execute("COMMIT TRANSACTION");
				
				var iEnd = Math.round(new Date().getTime() / 1000);
				Ti.API.info("Term finishes at : "+iEnd);
				
				var iResult = iEnd - iStart;
				Ti.API.info('Term seconds: '+ iResult);
				Ti.API.info('Terms were succefully installed');
				
			}
			
			// Adds new itemns to menu and also processes each object
			var callback;
			var n_bund = db_installMe.execute('SELECT * FROM bundles');
			var take = db_installMe.execute('SELECT * FROM bundles WHERE display_on_menu="true"');
			var count_t = 0;
			
			while ( n_bund.isValidRow() ){
				var name_table = n_bund.fieldByName("bundle_name");
				if ( (json.node) && (json.node[name_table]) ){
						Ti.API.info('##### Called '+name_table);
<<<<<<< HEAD
						callback = process_object(json.node, name_table , quotes, progress, type_request );
=======
						callback = process_object(json.node, name_table , quotes, progress);
>>>>>>> 2696447049ef095bd171249c415a58c543975f20

						//Hides the image alert:
						if ( (take.rowCount === 0 ) && (count_t === 0) ){
							var zoomImage = Titanium.UI.createAnimation();
							t = Ti.UI.create2DMatrix();
							t = t.scale(0);
							zoomImage.transform = t;
							zoomImage.duration = 1400;
							img.animate(zoomImage);
							
							zoomImage.addEventListener('complete', function(){
								win.remove(img);
							});
							
							count_t++;
						}
<<<<<<< HEAD

						//Add it to the main screen
						var display      = n_bund.fieldByName("display_name");
						var description  = n_bund.fieldByName("description");
						var flag_display = n_bund.fieldByName("display_on_menu");
						var id 			 = n_bund.fieldByName("bid");
						
						if (flag_display == 'false'){

							var row_a = Ti.UI.createTableViewRow({
								height      : 60,	
								display     : display,
								description : description,
								name_table  : name_table,
								className	: 'menu_row' // this is to optimize the rendering
							});
							
							var title_a = Titanium.UI.createLabel({
								text: display,
								font:{
									fontSize:28
								},
								width:'auto',
								textAlign:'left',
								left:'17%',
								height:'auto'
							});
							
							var plus_a =  Titanium.UI.createImageView({
								image: '../images/plus_transparent.png',
								width:'15%',
								height:'100%',
								left:0,
								is_plus: true
							});
							
							row_a.add(title_a);
							row_a.add(plus_a);

							menu.appendRow(row_a);
=======

						//Add it to the main screen
						var display      = n_bund.fieldByName("display_name");
						var description  = n_bund.fieldByName("description");
						var flag_display = n_bund.fieldByName("display_on_menu");
						var id 			 = n_bund.fieldByName("bid");
						
						if (flag_display == 'false'){
							var row_try = Ti.UI.createTableViewRow({
									height      : 60,	
									hasChild    : true,
									title       : display,
									description : description,
									name_table  : name_table
							});
							menu.appendRow(row_try);
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							db_installMe.execute('UPDATE bundles SET display_on_menu =\'true\' WHERE bid='+id);
						}
						
				}
				n_bund.next();
			}
			n_bund.close();
			
			/*********** Users *************/
			if(json.users){
				
				var perform_user = [];
				
				//Insert - Users
				if (json.users.insert){
					if (json.users.insert.length){
						for (var i = 0; i < json.users.insert.length; i++ ){
<<<<<<< HEAD
							if (progress != null){
								//Increment Progress Bar
								progress.set();
							}
=======
							//Increment Progress Bar
							progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							Ti.API.info("USER UID: "+json.users.insert[i].uid);
							//db_installMe.execute('INSERT INTO users (uid, username, mail, realname, status ) VALUES (?,?,?,?,?)', json.users.insert[i].uid, json.users.insert[i].username, json.users.insert[i].mail, json.users.insert[i].realname, json.users.insert[i].status);
							perform_user[perform_user.length] = 'INSERT INTO user (uid, username, mail, realname, status ) VALUES ('+json.users.insert[i].uid+',"'+json.users.insert[i].username+'","'+json.users.insert[i].mail+'","'+json.users.insert[i].realname+'",'+json.users.insert[i].status+')';
							
							if (json.users.insert[i].roles.length){
								for (var j = 0; j < json.users.insert[i].roles.length; j++ ){
									//db_installMe.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.insert[i].uid, json.users.insert[i].roles[j]);
									perform_user[perform_user.length] = 'INSERT INTO user_roles (uid, rid ) VALUES ('+json.users.insert[i].uid+','+json.users.insert[i].roles[j]+')';
								}
							}
							else{
								//db_installMe.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.insert[i].uid, json.users.insert[i].roles);
								perform_user[perform_user.length] = 'INSERT INTO user_roles (uid, rid ) VALUES ('+json.users.insert[i].uid+','+json.users.insert[i].roles+')';
							}
						}
					}
					else{
<<<<<<< HEAD
						if (progress != null){
							//Increment Progress Bar
							progress.set();
						}
=======
						//Increment Progress Bar
						progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20
						
						//db_installMe.execute('INSERT INTO users (uid, username, mail, realname, status ) VALUES (?,?,?,?,?)', json.users.insert.uid, json.users.insert.username, json.users.insert.mail, json.users.insert.realname, json.users.insert.status);
						perform_user[perform_user.length] = 'INSERT INTO user (uid, username, mail, realname, status ) VALUES ('+json.users.insert.uid+',"'+json.users.insert.username+'","'+json.users.insert.mail+'","'+json.users.insert.realname+'",'+json.users.insert.status+')';
						
						if (json.users.insert.roles.length){
							for (var j = 0; j < json.users.insert.roles.length; j++ ){
								//db_installMe.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.insert.uid, json.users.insert.roles[j]);
								perform_user[perform_user.length] = 'INSERT INTO user_roles (uid, rid ) VALUES ('+json.users.insert.uid+','+json.users.insert.roles[j]+')' ; 
							}
						}
						else{
							//db_installMe.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.insert.uid, json.users.insert.roles);
							perform_user[perform_user.length] = 'INSERT INTO user_roles (uid, rid ) VALUES ('+json.users.insert.uid+','+json.users.insert.roles+')';
						}
					}
					Ti.API.info("Inserted users sucefully!");
				}

				//Update - Users
				if (json.users.update){
					if (json.users.update.length){
						for (var i = 0; i < json.users.update.length; i++ ){
<<<<<<< HEAD
							if (progress != null){
								//Increment Progress Bar
								progress.set();
							}
=======
							//Increment Progress Bar
							progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20
							//db_installMe.execute('UPDATE users SET "username"=? , "mail"=?, "realname"=?, "status"=? WHERE "uid"=?', json.users.update[i].username, json.users.update[i].mail, json.users.update[i].realname, json.users.update[i].status, json.users.update[i].uid );
							perform_user[perform_user.length] = 'UPDATE user SET "username"="'+json.users.update[i].username+'" , "mail"="'+json.users.update[i].mail+'", "realname"="'+json.users.update[i].realname+'", "status"='+json.users.update[i].status+' WHERE "uid"='+json.users.update[i].uid;
							
							//Delete every row present at user_roles
							//db_installMe.execute('DELETE FROM user_roles WHERE "uid"=?', json.users.update[i].uid);
							
							perform_user[perform_user.length] = 'DELETE FROM user_roles WHERE "uid"='+json.users.update[i].uid ;
							
							//Insert it over again!
							if(json.users.update[i].roles){
								
								if (json.users.update[i].roles.length){
									for (var j = 0; j < json.users.update[i].roles.length ; j++ ){
										perform_user[perform_user.length] = 'INSERT INTO user_roles (uid, rid ) VALUES ('+json.users.update[i].uid+','+json.users.update[i].roles[j]+')';
									}							
								}
								else{
									//db_installMe.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.update[i].uid, json.users.update[i].roles);
									perform_user[perform_user.length] = 'INSERT INTO user_roles (uid, rid ) VALUES ('+json.users.update[i].uid+','+json.users.update[i].roles+')';
								}
							}
						}
					}
					else{
<<<<<<< HEAD
						if (progress != null){
							//Increment Progress Bar
							progress.set();
						}
=======
						//Increment Progress Bar
						progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20

						//db_installMe.execute('UPDATE users SET "username"=? , "mail"=?, "realname"=?, "status"=? WHERE "uid"=?', json.users.update.username, json.users.update.mail, json.users.update.realname, json.users.update.status, json.users.update.uid );
						perform_user[perform_user.length] = 'UPDATE user SET "username"="'+json.users.update.username+'" , "mail"="'+json.users.update.mail+'", "realname"="'+json.users.update.realname+'", "status"='+json.users.update.status+' WHERE "uid"='+json.users.update.uid;
						//Delete every row present at user_roles
						//db_installMe.execute('DELETE FROM user_roles WHERE "uid"=?', json.users.update.uid);
						
						perform_user[perform_user.length] = 'DELETE FROM user_roles WHERE "uid"='+json.users.update.uid;
						
						//Insert it over again!
						if(json.users.update.roles){
							if (json.users.update.roles.length){
								for (var j = 0; j < json.users.update.roles.length ; j++ ){
									//db_installMe.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.update.uid, json.users.update.roles[j]);
									perform_user[perform_user.length] = 'INSERT INTO user_roles (uid, rid ) VALUES ('+json.users.update.uid+','+json.users.update.roles[j]+')';
								}							
							}
							else{
								//db_installMe.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.update.uid, json.users.update.roles);
								perform_user[perform_user.length] = 'INSERT INTO user_roles (uid, rid ) VALUES ('+json.users.update.uid+','+json.users.update.roles+')';
							}
						}
					}
					Ti.API.info("Updated Users sucefully!");
				}
				
				//Delete - Users
				if (json.users["delete"])	{
					if (json.users["delete"].length){
						for (var i = 0; i <  json.users["delete"].length; i++ ){
<<<<<<< HEAD
							if (progress != null){
								//Increment Progress Bar
								progress.set();
							}
=======
							//Increment Progress Bar
							progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20

							//Deletes current row (contact)
							//db_installMe.execute('DELETE FROM users WHERE "uid"=?', json.users["delete"][i].uid);
							perform_user[perform_user.length] = 'DELETE FROM user WHERE "uid"='+json.users["delete"][i].uid ;
							
							//db_installMe.execute('DELETE FROM user_roles WHERE "uid"=?', json.users["delete"][i].uid);
							perform_user[perform_user.length] = 'DELETE FROM user_roles WHERE "uid"='+json.users["delete"][i].uid;
						}
					}
					else{
<<<<<<< HEAD
						if (progress != null){
							//Increment Progress Bar
							progress.set();
						}
=======
						//Increment Progress Bar
						progress.set();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20

						//db_installMe.execute('DELETE FROM users WHERE "uid"=?', json.users["delete"].uid);
						perform_user[perform_user.length] = 'DELETE FROM user WHERE "uid"='+json.users["delete"].uid;
						
						//db_installMe.execute('DELETE FROM user_roles WHERE "uid"=?', json.users["delete"].uid);
						perform_user[perform_user.length] = 'DELETE FROM user_roles WHERE "uid"='+json.users["delete"].uid;
					}
				Ti.API.info("Deleted Users sucefully!");
<<<<<<< HEAD
=======
				}
				
				
				var iUser = 0;
				
				var iStart = Math.round(new Date().getTime() / 1000);
				Ti.API.info("User started at : "+iStart);
	
				db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
				while (iUser <= perform_user.length-1 ){
					db_installMe.execute(perform_user[iUser]);
					iUser++;
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
				}
				db_installMe.execute("COMMIT TRANSACTION");
				
				var iEnd = Math.round(new Date().getTime() / 1000);
				Ti.API.info("User finishes at : "+iEnd);
				
				var iResult = iEnd - iStart;
				Ti.API.info('User seconds: '+ iResult);
	
				Ti.API.info("User ended!");
				
				
				var iUser = 0;
				
				var iStart = Math.round(new Date().getTime() / 1000);
				Ti.API.info("User started at : "+iStart);
	
				db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
				while (iUser <= perform_user.length-1 ){
					db_installMe.execute(perform_user[iUser]);
					iUser++;
				}
				db_installMe.execute("COMMIT TRANSACTION");
				
				var iEnd = Math.round(new Date().getTime() / 1000);
				Ti.API.info("User finishes at : "+iEnd);
				
				var iResult = iEnd - iStart;
				Ti.API.info('User seconds: '+ iResult);
	
				Ti.API.info("User ended!");
				
			}
			
			if ( existsMorePages ){
				Ti.API.info('Another Call');
<<<<<<< HEAD
				installMe(pageIndex, win, json.sync_timestamp, progress, menu, img, 'GET');
			}
			else{
				unsetUse();
				Ti.API.info("SUCCESS");
				if (progress != null){
					progress.close();
				}
				db_installMe.close();
=======
				installMe(pageIndex, win, json.sync_timestamp, progress, menu, img);
			}
			else{
				Titanium.App.Properties.setBool("UpRunning", false);
				Ti.API.info('Is there an update happening? '+Titanium.App.Properties.getBool("UpRunning"));
				Ti.API.info("SUCCESS");
				progress.close();
				Ti.API.info('Called from value: '+calledFrom);
				db_installMe.close();

>>>>>>> 2696447049ef095bd171249c415a58c543975f20
			}
		}
	}
	
	//Connection error:
	objectsUp.onerror = function(e) {
<<<<<<< HEAD
		unsetUse();
		if (progress != null){
			progress.close();
		}
		if ((type_request == 'POST') && (progress != null)){
			Ti.UI.createNotification({
				message : 'Connection timed out, please try again',
				duration: Ti.UI.NOTIFICATION_DURATION_LONG
			}).show();
		}
		
=======
		Titanium.App.Properties.setBool("UpRunning", false);
		progress.close();
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
		db_installMe.close();
		Ti.API.info("Services are down");
		Ti.API.info('Called from value: '+calledFrom);
	}
	
	//Get upload JSON
	if ( type_request == 'POST'){
		var insert_JSON = getJSON();
		objectsUp.send(insert_JSON);
	}
	else{
		//Sending information and try to connect
		objectsUp.send();
	}
	
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


function timeConverter(UNIX_timestamp){
	 var a = new Date(UNIX_timestamp*1000);
	 var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	 var year = a.getFullYear();
	 var month = months[a.getMonth()];
	 var date = a.getDate();
	 var hour = a.getHours();
	 var min = a.getMinutes();
	 var sec = a.getSeconds();
	 var time = date+' , '+month+' '+year+' '+hour+':'+min+':'+sec ;
	 return time;
<<<<<<< HEAD
}

function setUse(){
	var db_su = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
	db_su.execute('UPDATE updated SET updating = 1 ');
	db_su.close();
}

function unsetUse(){
	var db_us = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
	db_us.execute('UPDATE updated SET updating = 0 ');
	db_us.close();
}

function isUpdating(){
	var db_gu = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
	var res_set = db_gu.execute('SELECT updating FROM updated WHERE rowid=1');
	
	if (res_set.fieldByName('updating') == 1)
		return true;
	else
		return false;
		
	db_gu.close();
}
=======
}

>>>>>>> 2696447049ef095bd171249c415a58c543975f20
