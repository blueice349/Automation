/*jslint eqeq:true*/
Omadi.bundles.timecard = {};

var Utils = require('lib/Utils');

Omadi.bundles.timecard.askClockOutLogout = function(){"use strict";
    var verifyLogout;
    
    // Ask to logout if there was a clock in and the clock out time hasn't been set
    if(Omadi.bundles.timecard.isUserClockedIn()){
        
        verifyLogout = Ti.UI.createAlertDialog({
            title : 'What do you want to do?',
            buttonNames : ['Clock Out + Logout', 'Logout', 'Cancel']
        });
    
        verifyLogout.addEventListener('click', function(e) {
            try{
                if(e.index == 0){
                    Omadi.bundles.timecard.doClockOut(true);
                }
                else if (e.index == 1) {
                    Ti.API.info("Logging out from 3-button timecard dialog.");
                    Omadi.service.logout();
                }
            }
            catch(ex){
                Utils.sendErrorReport("exception verify logout: " + ex);
            }
        });
    }
    else{
        
        verifyLogout = Ti.UI.createAlertDialog({
            title : 'Really Logout?',
            buttonNames : ['Logout', 'Cancel']
        });

        verifyLogout.addEventListener('click', function(e) {
            try{
                if (e.index == 0) {
                    Ti.API.info("Logging out from timecard regular logout.");
                    Omadi.service.logout();
                }
            }
            catch(ex){
                Utils.sendErrorReport("exception verify logout 2: " + ex);
            }
        });
    }
    
    verifyLogout.show();
};

Omadi.bundles.timecard.askClockIn = function(){"use strict";
    var dialog;
    /*global alertQueue*/
    
    if(Omadi.bundles.timecard.userShouldClockInOut()){

        // Ask to log in if not done already
        if(!Omadi.bundles.timecard.isUserClockedIn()){
            
            dialog = Ti.UI.createAlertDialog({
               title: 'Clock In Now?',
               buttonNames: ['Clock In', 'No']
            });
            
            dialog.addEventListener('click', function(e){
               try{
                   if(e.index == 0){
                       Omadi.bundles.timecard.doClockIn();
                   }
                   
                   if(typeof alertQueue !== 'undefined'){
                       Ti.App.fireEvent('showNextAlertInQueue');
                   }
                }
                catch(ex){
                    Utils.sendErrorReport("exception in clock in now?: " + ex);
                }
            });
            
            if(typeof alertQueue !== 'undefined'){
                alertQueue.push(dialog);
            }
            else{
                dialog.show(); 
            }
        }
    }
    
};

Omadi.bundles.timecard.isUserClockedIn = function(){"use strict";
    var lastNid, lastNode, lastClockOutTime;
    
    lastNid = Omadi.bundles.timecard.getLastClockInNid();
        
    lastNode = null;
    if(lastNid != 0){
        lastNode = Omadi.data.nodeLoad(lastNid);
    }
    
    lastClockOutTime = null;
    if(lastNode && typeof lastNode.clock_out_time.dbValues !== 'undefined' && typeof lastNode.clock_out_time.dbValues[0] !== 'undefined'){
        lastClockOutTime = lastNode.clock_out_time.dbValues[0];
    }
    
    // The User is currently clocked in
    if(lastNode && !lastClockOutTime){
        Ti.API.debug("Clocked IN");
        return true;
    }
    Ti.API.debug("Clocked OUT");
    return false;
};

Omadi.bundles.timecard.doClockIn = function() {"use strict";
    /*jslint nomen:true*/
    var now, node, uid;
    uid = Omadi.utils.getUid();
    now = Omadi.utils.getUTCTimestamp();
    
    node = {
        nid : Omadi.data.getNewNodeNid(),
        clock_in_time : {
            dbValues : [now]
        },
        user_0 : {
            dbValues: [uid]  
        },
        created : now,
        changed : now,
        author_uid : uid,
        uid: uid,
        changed_uid : uid,
        table_name : 'timecard',
        type : 'timecard',
        viewed : now,
        form_part : 0
    };
    
    //Ti.App.removeEventListener('doneSendingData', Omadi.bundles.timecard.removeStatus);
    //Ti.App.addEventListener('doneSendingData', Omadi.bundles.timecard.removeStatus);
    
    try{
        //Omadi.display.loading();
        node = Omadi.data.nodeSave(node);
        if(node._saved){
            Ti.App.fireEvent('sendUpdates');
        }
        else{
            //Omadi.bundles.timecard.removeStatus();
            alert("A problem occurred clocking in. Please try again.");
            Utils.sendErrorReport("Could not do a clock in timecard entry: not saved");
        }
    }
    catch(ex){
        //Omadi.bundles.timecard.removeStatus();
        alert("A problem occurred clocking in. Please try again.");
        Utils.sendErrorReport("Could not save a timecard entry: " + ex);
    }
};

Omadi.bundles.timecard.userShouldClockInOut = function(){"use strict";
    var loginDetails, bundle;
    
    loginDetails = JSON.parse(Ti.App.Properties.getString("Omadi_session_details"));
    
    if(typeof loginDetails.user.user_should_clock_inout !== 'undefined' && 
        typeof loginDetails.user.user_should_clock_inout.und !== 'undefined' && 
        typeof loginDetails.user.user_should_clock_inout.und[0] !== 'undefined' && 
        typeof loginDetails.user.user_should_clock_inout.und[0].value !== 'undefined' &&
        loginDetails.user.user_should_clock_inout.und[0].value == 1){
        
        bundle = Omadi.data.getBundle('timecard');
        if(bundle && bundle.can_create == 1){
            return true;
        }
    }
    
    return false;
};

Omadi.bundles.timecard.getLastClockInNid = function(){"use strict";
    var db, result, uid, nid = 0;
    
    uid = Omadi.utils.getUid();
    db = Omadi.utils.openMainDatabase();
    
    try{
        result = db.execute("SELECT t.nid, MAX(t.clock_in_time) FROM timecard t WHERE t.user_0 = " + uid + " LIMIT 1");
        
        if(result.isValidRow()){
            try{
                nid = result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT);
            }
            catch(ex){
                nid = 0;
                // the result is null, no clockins exist
            }
        }
        result.close();
    }
    catch(ex){
        Utils.sendErrorReport("Exception getting lastclockinnid: " + ex);
    }
    
    db.close();
    
    return nid;
};

Omadi.bundles.timecard.doClockOut = function(logoutNext) {"use strict";
    /*jslint nomen:true*/
    var now, lastNid, lastNode;
    
    lastNid = Omadi.bundles.timecard.getLastClockInNid();
    lastNode = Omadi.data.nodeLoad(lastNid);
    
    now = Omadi.utils.getUTCTimestamp();
    lastNode.clock_out_time = {
        dbValues : [now]
    };
    lastNode.changed = now;
    lastNode.changed_uid = Omadi.utils.getUid();
    lastNode.viewed = now;
    lastNode.form_part = 1;
    
    Ti.App.removeEventListener('doneSendingData', Omadi.bundles.timecard.removeStatus);
    Ti.App.addEventListener('doneSendingData', Omadi.bundles.timecard.removeStatus);
    
    try{
        Omadi.display.loading();
        lastNode = Omadi.data.nodeSave(lastNode);
        if(lastNode._saved){
            Ti.App.fireEvent('sendUpdates');
        }
        else{
            Omadi.bundles.timecard.removeStatus();
            alert("A problem occurred clocking out. Please try again.");
            Utils.sendErrorReport("Could not do a clock out timecard entry: not saved");
        }
    }
    catch(ex){
        Omadi.bundles.timecard.removeStatus();
        alert("A problem occurred clocking out. Please try again.");
        Utils.sendErrorReport("Could not do a clock out timecard entry: " + ex);
    }
    
    if(logoutNext){
    
        if(Ti.Network.online){
            Ti.App.removeEventListener("doneSendingData", Omadi.bundles.timecard.logout);
            Ti.App.addEventListener("doneSendingData", Omadi.bundles.timecard.logout);
        }
        else{
            Ti.API.info("Logging out from do clock out without a network connection");
            alert("Your timecard was saved successfully, but you do not have a connection to the Internet, so your clock out will not be synched online until you connect to the Internet.");
            Omadi.service.logout();
        }
    }
};

Omadi.bundles.timecard.logout = function(){"use strict";
    Ti.API.info("Logging out from do clock out after data was sent");
    
    Ti.App.removeEventListener('doneSendingData', Omadi.bundles.timecard.logout);
   
    Omadi.service.logout();
};

Omadi.bundles.timecard.removeStatus = function(){"use strict";
  
  Ti.App.removeEventListener('doneSendingData', Omadi.bundles.timecard.removeStatus);
  
  Omadi.display.doneLoading();
};


