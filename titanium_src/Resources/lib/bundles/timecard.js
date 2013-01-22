/*jslint eqeq:true*/

Omadi.bundles.timecard = {};

Omadi.bundles.timecard.askClockOutLogout = function(){"use strict";
    var verifyLogout;
    
    // Ask to logout if there was a clock in and the clock out time hasn't been set
    if(Omadi.bundles.timecard.isUserClockedIn()){
        
        verifyLogout = Ti.UI.createAlertDialog({
            title : 'What do you want to do?',
            buttonNames : ['Clock Out + Logout', 'Logout', 'Cancel']
        });
    
        verifyLogout.addEventListener('click', function(e) {
            if(e.index == 0){
                Omadi.bundles.timecard.doClockOut(true);
            }
            else if (e.index == 1) {
                Omadi.service.logout();
            }
        });
    }
    else{
        
        verifyLogout = Ti.UI.createAlertDialog({
            title : 'Logout?',
            message : 'Are you sure you want to logout?',
            buttonNames : ['Yes', 'No']
        });

        verifyLogout.addEventListener('click', function(e) {
            if (e.index == 0) {
                Omadi.service.logout();
            }
        });
    }
    
    verifyLogout.show();
};

Omadi.bundles.timecard.askClockIn = function(){"use strict";
    var dialog;
    
    if(Omadi.bundles.timecard.userShouldClockInOut()){

        // Ask to log in if not done already
        if(!Omadi.bundles.timecard.isUserClockedIn()){
            
            dialog = Ti.UI.createAlertDialog({
               title: 'Clock In',
               message: 'Do you want to clock in now?',
               buttonNames: ['Yes', 'No']
            });
            
            dialog.addEventListener('click', function(e){
               if(e.index == 0){
                   Omadi.bundles.timecard.doClockIn();
               }
            });
            
            dialog.show(); 
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
        return true;
    }
    
    return false;
};

Omadi.bundles.timecard.doClockIn = function() {"use strict";
    var now, node, uid;
    uid = Omadi.utils.getUid();
    now = Omadi.utils.getUTCTimestamp();
    
    node = {
        nid : 'new',
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
        no_data : [],
        viewed : now,
        form_part : 0
    };

    Omadi.data.trySaveNode(node);
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
    
    result = db.execute("SELECT t.nid, MAX(t.clock_in_time) FROM timecard t WHERE t.user_0 = " + uid + " LIMIT 1");
    
    if(result.isValidRow()){
        nid = result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT);
    }
    result.close();
    
    db.close();
    
    return nid;
};

Omadi.bundles.timecard.doClockOut = function(logout) {"use strict";
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
    
    if(logout){
    
        if(Ti.Network.online){
            Ti.App.addEventListener("doneSendingData", function(){
                 Omadi.service.logout();
            });
        }
        else{
            alert("Your timecard was saved successfully, but you do not have a connection to the Internet, so your clock out will not be synched online until you connect to the Internet.");
            Omadi.service.logout();
        }
    }

    Omadi.data.trySaveNode(lastNode);
};