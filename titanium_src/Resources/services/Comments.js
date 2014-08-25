/*jslint eqeq:true,nomen:true,plusplus:true*/

var _instance = null;

var Utils = require('lib/Utils');
var Database = require('lib/Database');
var Comment = require('objects/Comment');
var Field = require('objects/Field');
var Node = require('objects/Node');

function Comments(){"use strict";
    this.sendCommentRetries = 0;
    this.lastSendTimestamp = 0;
    this.lastSentCid = null;
    this.fetchedJSON = null;
}


function getInstance(){"use strict";
    if(_instance === null){
        _instance = new Comments();
    }
    
    return _instance;
}

// The success callback for sending comments
// The this in this callback is the http object
var sendOnLoad = function(e){"use strict";
    var dialog, json, nameTable, dir, file, string, commentsInstance;
    
    commentsInstance = getInstance();
   
    try{
        if (this.responseText !== null && this.responseText !== "null" && this.responseText !== "" && this.responseText !== "") {
            
            try{
                commentsInstance.fetchedJSON = JSON.parse(this.responseText);
                    
                // Free the memory (probably doesn't actually do anything)
                this.responseText = null;
                
                commentsInstance.processJson();
            }
            catch(ex){
                Utils.sendErrorReport("Exception processing comment JSON: " + ex);
            }
        }
        else if(this.responseData !== null){
            // In some very rare cases, this.responseText will be null
            // Here, we write the data to a file, read it back and do the installation
            try{
                dir = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory);
                
                if(!dir.exists()){
                    dir.createDirectory();
                }
                
                Ti.API.debug("JSON String Length: " + this.responseData.length);
                
                file = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory + "/download_" + Utils.getUTCTimestamp() + ".txt");
                
                if(file.write(this.responseData)){
                   
                   string = file.read();
                   
                   try{
                        Ti.API.debug("Is JSON");
                        
                        commentsInstance.fetchedJSON = JSON.parse(string.text);
                        
                        // Free the memory
                        string = null;
                        
                        commentsInstance.processJson();
                    }
                    catch(ex1){
                        Utils.sendErrorReport("Exception processing comment JSON 2: " + ex1);
                    }
                }
                else{
                    Utils.sendErrorReport("Failed to write to the download file");
                }
                
                if(file.exists()){
                    file.deleteFile();
                }
            }
            catch(ex2){
                Utils.sendErrorReport("Exception at json comment data sync: " + ex2);
            }
            
            file = null;
            dir = null;
        }
        else {
            
            if(Ti.App.isAndroid){
                Ti.Media.vibrate();
            }
    
            dialog = Ti.UI.createAlertDialog({
                title : 'Omadi',
                buttonNames : ['OK'],
                message : "The server disconnected you. Please login again."
            });
    
            dialog.show();
    
            dialog.addEventListener('click', function(e) {
                try{
                    Ti.App.Properties.setString('logStatus', "The server logged you out");
                    
                    // TODO: Make sure this event works
                    Ti.App.fireEvent('logout');
                }
                catch(ex){
                    Utils.sendErrorReport("exception on logstatus comment logout: " + ex);
                }
            });
        }
        
        // Send more comments if they exist
        commentsInstance.sendComments();
    }
    catch(ex4){
        Utils.sendErrorReport("Exception in update comment onload: " + ex4);
    }
};

var sendOnError = function(e){"use strict";
    var dialog, commentsInstance, commentText;
    
    try{
        try{
            Ti.Media.vibrate();
        }
        catch(ex1){}
        
        Ti.API.error('Error Status Comment: ' + e.error + ", message: " + this.status);
        
        commentText = Comment.viewText(this.cid); 
        
        if (this.status == 500) {
    
            dialog = Titanium.UI.createAlertDialog({
                title : 'Service Error',
                buttonNames : ['OK'],
                message : "There was a problem saving the following comment to the server. The app will continue attempting to save the comment: \n\n\"" + commentText + "\""
            });
    
            dialog.show();
    
            Utils.sendErrorReport('500 error on send update: ' + e.error);
        }
        else if(this.status == 406){
            
            dialog = Titanium.UI.createAlertDialog({
                title : 'Service Error',
                buttonNames : ['OK'],
                message : "The following comment is invalid and will be deleted. Details: " + e.error + " \n\nComment: \"" + commentText + "\""
            });
    
            dialog.show();
            
            Comment.remove(this.cid);
        }
        else if(this.status == 401 || this.status == 403){
            
            dialog = Titanium.UI.createAlertDialog({
                title : 'Service Error',
                buttonNames : ['OK'],
                message : "The following comment could not be posted because you do not have permissions to the form: \n\n\"" + commentText + "\""
            });
    
            dialog.show();
        }
        else{
            
            try{
                Utils.sendErrorReport('Showed the user a comment network error dialog on send: ' + this.status + " " + e.error);
            }
            catch(none2){}
            
            dialog = Titanium.UI.createAlertDialog({
                title : 'Network Error',
                buttonNames : ['Retry', 'Cancel'],
                message : "Please check your Internet connection. Your comment will sync once you regain an Internet connection."
            });
            
            dialog.addEventListener('click', function(e){
                if(e.index === 0){
                    commentsInstance = getInstance();
                    commentsInstance.sendComments();
                } 
            });
    
            dialog.show();
        }
        
        Database.query("UPDATE comment set sync_attempts = (sync_attempts + 1) WHERE cid = " + this.cid);
    }
    catch(ex){
        Utils.sendErrorReport("Exception with update comment onerror callback: " + ex);
    }
};

Comments.prototype.sendComments = function(){"use strict";
    var cid;
    
    cid = this.getNextCidToUpload();
    
    Ti.API.debug("sending for cid: " + cid);
    
    if(cid){
        this.sendComment(cid);
    }  
};

Comments.prototype.processJson = function(){"use strict";
    var Comment, comment, instances, fieldName, origData;
    
    Ti.API.debug("Processing comment JSON");
    
    if(this.fetchedJSON !== null){
        if(typeof this.fetchedJSON.comment !== 'undefined'){
            Comment = require('objects/Comment');
            
            comment = this.fetchedJSON.comment;
            
            Ti.API.debug("Returned JSON: " + JSON.stringify(comment));
            
            instances = Field.getFields(comment.node_type);
            for(fieldName in instances){
                if(instances.hasOwnProperty(fieldName)){
                    if(typeof comment[fieldName] !== 'undefined'){
                        origData = comment[fieldName];
                        comment[fieldName] = {};
                        comment[fieldName].dbValues = [origData];
                        comment[fieldName].textValues = [origData];
                    }
                }
            }
            
            Comment.save(comment);
            
            if(typeof this.fetchedJSON.orig_cid !== 'undefined'){
                Comment.remove(this.fetchedJSON.orig_cid);
            }        
        }
    }
};

Comments.prototype.sendComment = function(cid) {"use strict";
    var http, timestamp, commentOutput;
    
    Ti.API.error("Sending Comment " + cid + " Now");
    
    try{
        timestamp = Utils.getUTCTimestamp();
        
        if((timestamp - this.lastSendTimestamp) < 2 && this.lastSentCid == cid){
            // Do not send updates within 2 seconds of each other
            Ti.API.error("Not allowing comment send - too soon after previous send.");
            return;
        }
        
        this.lastSendTimestamp = timestamp;
        this.lastSentCid = cid;
    
        if (Ti.Network.online) {
            
            commentOutput = this.getUpdatedCommentJSON(cid);
            
            if(commentOutput != ""){
                
                Ti.API.debug("Going to send: " + commentOutput);
              
                http = Ti.Network.createHTTPClient({
                    enableKeepAlive: false,
                    validatesSecureCertificate: false,
                    timeout: 15000,
                    cid: cid
                });
                
                http.open('POST', Ti.App.DOMAIN_NAME + '/js-sync/omadi_comment.json');
    
                http.setRequestHeader("Content-Type", "application/json");
                Utils.setCookieHeader(http);
                
                http.onload = sendOnLoad;
                http.onerror = sendOnError;
                
                http.send(commentOutput);
            }
        }
        else{
            alert("Your comment will be synced when you gain an Internet connection.");
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception sending comment with cid " + cid + ": " + ex);
    }
};

Comments.prototype.getNextCidToUpload = function(){"use strict";
    var result, cid = null;
    
    // Sync first comments that have not attempted to be uploaded, then highest negative number first, since it was created first
    result = Database.query("SELECT cid FROM comment WHERE cid < 0 ORDER BY sync_attempts ASC, cid DESC LIMIT 1");
    
    if(result.isValidRow()){
        cid = result.field(0, Ti.Database.FIELD_TYPE_INT);
    }
    Database.close();
    
    return cid;
};

Comments.prototype.getUpdatedCommentJSON = function(cid) {"use strict";
    /*jslint eqeq:true,plusplus:true*/
    var db, result, obj, nid, tid, nids, comment, instances, field_name, i, v_result, output, hasComment, nodeType;
    
    hasComment = false;
    
    try {
        obj = {
            timestamp : Utils.getUTCTimestamp(),
            comment : {}
        };
        
        // Currently only syncing new comments, no editing currently on the app
        result = Database.query("SELECT * FROM comment WHERE cid = " + cid);
        
        if (result.isValidRow()) {
            cid = result.fieldByName('cid');
            Ti.API.info("Sending cid: " + result.fieldByName('cid'));
            hasComment = true;
        }
        result.close();
        
        if(!hasComment){
            return null;
        }
        
        if (hasComment) {
            comment = Comment.load(cid);
            
            Ti.API.debug("JSON comment: " + JSON.stringify(comment));
            
            nodeType = Node.getNodeType(comment.nid);
            
            if(nodeType === null){
                alert("An error occurred sending the comment, and it was not saved. Please try again.");
                Utils.sendErrorReport("nodeType was null in getting comment json.");
            }
            else{
                Ti.API.debug("Node type: " + nodeType);
                
                instances = Field.getFields('comment_node_' + nodeType);
    
                obj.comment = comment;
    
                for (field_name in instances) {
                    if (instances.hasOwnProperty(field_name)) {
                        
                        if ( typeof comment[field_name] !== 'undefined' && typeof comment[field_name].dbValues !== 'undefined' && comment[field_name].dbValues.length > 0) {
                            if (comment[field_name].dbValues.length > 1) {
                                obj.comment[field_name] = comment[field_name].dbValues;
                            }
                            else {
                                obj.comment[field_name] = comment[field_name].dbValues[0];
                            }
                        }
                        else {
                            obj.comment[field_name] = null;
                        }
                    }
                }
            }
        }        
    }
    catch(ex) {
        alert("There was a problem packaging your comment, so it has been saved as a draft.");
        Utils.sendErrorReport("Exception in JSON comment creation: " + ex);
    }
    
    Database.close();
    
    output = "";
    try{
        output = JSON.stringify(obj);
    }
    catch(jsonEx){
        Utils.sendErrorReport("Error stringifying comment obj: " + jsonEx);
    }
    
    Ti.API.info("Comment: " + output);
    return output;
};




exports.sendComments = function(){"use strict";
    getInstance().sendComments();
};
