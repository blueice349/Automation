/* jshint globalstrict:true */
'use strict';

var commentList;

var Utils = require('lib/Utils');
var Node = require('objects/Node');
var Database = require('lib/Database');
var Display = require('lib/Display');

function CommentList(nid) {
    //create module instance
    
    this.nid = nid;
    this.listWin = null;
    this.comments = null;
    this.isFormShowing = false;
    this.formView = null;
    this.numCommentsLabel = null;
    this.scrollView = null;
    this.tabObj = null;
}

CommentList.prototype.back = function() {
    Ti.API.debug("Pressed back button from comments...");
};

CommentList.prototype.initComments = function() {
    var result, comment, instances, commentTableName, fieldName, i, textValue, 
        origDBValue, tempDBValues, subValue, subResult, allowedValues;
    
    this.comments = [];
    try{
        if(this.nid > 0){
            
            this.node = Node.load(this.nid);
            commentTableName = 'comment_node_' + this.node.type;
            
            instances = Node.getFields(commentTableName);
            
            result = Database.query("SELECT c.cid, c.created, c.changed, c.uid, d.* FROM comment c INNER JOIN " + commentTableName + " d ON d.cid = c.cid WHERE c.nid = " + this.nid + " ORDER BY c.created DESC");
            
            while(result.isValidRow()){
                
                comment = {};
                comment.created = result.fieldByName('created');
                comment.changed = result.fieldByName('changed');
                comment.uid = result.fieldByName('uid');
                comment.nid = this.nid;
                comment.cid = result.fieldByName('cid');
                comment.node_type = commentTableName;
                
                for(fieldName in instances){
                    if(instances.hasOwnProperty(fieldName)){
                        comment[fieldName] = {};
                        comment[fieldName].dbValues = [result.fieldByName(fieldName)];
                        comment[fieldName].textValues = [];
                        
                        // Make sure textValues is set to something for each value
                        for ( i = 0; i < comment[fieldName].dbValues.length; i ++) {
                            comment[fieldName].textValues[i] = "";
                        }
                        
                        switch(instances[fieldName].type) {
                            case 'nfc_field':
                            case 'text':
                            case 'text_long':
                            case 'phone':
                            case 'email':
                            case 'link_field':
                            case 'location':
                            case 'license_plate':
                            case 'vehicle_fields':
                                for ( i = 0; i < comment[fieldName].dbValues.length; i++) {
                                    if (comment[fieldName].dbValues[i] === null) {
                                        comment[fieldName].textValues[i] = "";
                                    }
                                    else {
                                        comment[fieldName].textValues[i] = comment[fieldName].dbValues[i];
                                    }
                                }
                                
                                
                                break;

                            case 'number_integer':
                                for ( i = 0; i < comment[fieldName].dbValues.length; i++) {
                                    if (comment[fieldName].dbValues[i] === null) {
                                        comment[fieldName].textValues[i] = "";
                                    }
                                    else {
                                        comment[fieldName].textValues[i] = comment[fieldName].dbValues[i];
                                    }
                                }
                                break;

                            case 'number_decimal':
                                for ( i = 0; i < comment[fieldName].dbValues.length; i++) {
                                    if (comment[fieldName].dbValues[i] === null) {
                                        comment[fieldName].textValues[i] = "";
                                    }
                                    else {
                                        comment[fieldName].textValues[i] = comment[fieldName].dbValues[i].toFixed(2);
                                    }
                                }
                                break;

                            case 'auto_increment':
                                for ( i = 0; i < comment[fieldName].dbValues.length; i++) {

                                    if (instances[fieldName].settings.prefix > '') {
                                        comment[fieldName].textValues[i] = instances[fieldName].settings.prefix + comment[fieldName].dbValues[i];
                                    }
                                    else {
                                        comment[fieldName].textValues[i] = comment[fieldName].dbValues[i] + ''.toString();
                                    }
                                }
                                break;

                            case 'list_boolean':
                                for ( i = 0; i < comment[fieldName].dbValues.length; i++) {
                                    if (comment[fieldName].dbValues[i] === null) {
                                        comment[fieldName].textValues[i] = '';
                                    }
                                    else if (comment[fieldName].dbValues[i] == 1) {
                                        comment[fieldName].textValues[i] = 'Yes';
                                    }
                                    else {
                                        comment[fieldName].textValues[i] = 'No';
                                    }
                                }
                                break;

                            case 'user_reference':

                                subResult = Database.query('SELECT uid, realname FROM user WHERE uid IN(' + comment[fieldName].dbValues.join(',') + ')');
                                while (subResult.isValidRow()) {
                                    textValue = subResult.fieldByName("realname");
                                    subValue = subResult.fieldByName("uid");

                                    for ( i = 0; i < comment[fieldName].dbValues.length; i += 1) {
                                        if (comment[fieldName].dbValues[i] == subValue) {
                                            comment[fieldName].textValues[i] = textValue;
                                            break;
                                        }
                                    }

                                    subResult.next();
                                }
                                subResult.close();
                                break;

                            case 'taxonomy_term_reference':

                                subResult = Database.query('SELECT name, tid FROM term_data WHERE tid IN(' + comment[fieldName].dbValues.join(',') + ')');
                                while (subResult.isValidRow()) {
                                    textValue = subResult.fieldByName("name");
                                    subValue = subResult.fieldByName("tid");

                                    for ( i = 0; i < comment[fieldName].dbValues.length; i += 1) {
                                        if (comment[fieldName].dbValues[i] == subValue) {
                                            comment[fieldName].textValues[i] = textValue;
                                            break;
                                        }
                                    }

                                    subResult.next();
                                }
                                subResult.close();

                                break;

                            case 'list_text':

                                if(typeof instances[fieldName].settings.allowed_values !== 'undefined'){
                                    allowedValues = instances[fieldName].settings.allowed_values; 
                                    for ( i = 0; i < comment[fieldName].dbValues.length; i += 1) {
                                        if(typeof allowedValues[comment[fieldName].dbValues[i]] !== 'undefined'){
                                             comment[fieldName].textValues[i] = allowedValues[comment[fieldName].dbValues[i]];
                                        }
                                        else{
                                            comment[fieldName].textValues[i] = comment[fieldName].dbValues[i];
                                        }
                                    }
                                }
                                else{
                                    for ( i = 0; i < comment[fieldName].dbValues.length; i += 1) {
                                         comment[fieldName].textValues[i] = comment[fieldName].dbValues[i];
                                    }
                                }

                                break;
                                
                            case 'omadi_reference':
                                subResult = Database.query('SELECT title, node_type, nid FROM comment WHERE nid IN (' + comment[fieldName].dbValues.join(',') + ')');
                                comment[fieldName].commentTypes = [];

                                while (subResult.isValidRow()) {
                                    textValue = subResult.fieldByName("title");
                                    subValue = subResult.fieldByName("nid");

                                    for ( i = 0; i < comment[fieldName].dbValues.length; i++) {
                                        if (comment[fieldName].dbValues[i] == subValue) {
                                            comment[fieldName].textValues[i] = textValue;
                                            comment[fieldName].commentTypes[i] = subResult.fieldByName("node_type");
                                            break;
                                        }
                                    }

                                    subResult.next();
                                }
                                subResult.close();
                                break;

                            case 'omadi_time':

                                for ( i = 0; i < comment[fieldName].dbValues.length; i++) {
                                    comment[fieldName].textValues[i] = Utils.secondsToString(comment[fieldName].dbValues[i]);
                                }
                                break;

                            case 'datestamp':
                                for ( i = 0; i < comment[fieldName].dbValues.length; i++) {
                                    if (!Utils.isEmpty(comment[fieldName].dbValues[i])) {
                                        comment[fieldName].dbValues[i] = parseInt(comment[fieldName].dbValues[i], 10);
                                        comment[fieldName].textValues[i] = Utils.formatDate(comment[fieldName].dbValues[i], 
                                            (instances[fieldName].settings.time == 1 || 
                                                (typeof instances[fieldName].settings.granularity !== 'undefined' && typeof instances[fieldName].settings.granularity.hour !== 'undefined')));
                                    }
                                    else {
                                        comment[fieldName].dbValues[i] = null;
                                    }
                                }

                                break;
                            
                            case 'extra_price':
                                
                                comment[fieldName].tempData = result.fieldByName(fieldName + "___data", Ti.Database.FIELD_TYPE_STRING);
                                comment[fieldName].finalValue = 0;
                                if(comment[fieldName].tempData){
                                    comment[fieldName].jsonValue = JSON.parse(comment[fieldName].tempData);
                                    if(Utils.isArray(comment[fieldName].jsonValue)){
                                        for(i = 0; i < comment[fieldName].jsonValue.length; i ++){
                                            
                                            // If we have a total amount, add that in there instead of the price as they may be different
                                            if(typeof comment[fieldName].jsonValue[i].total !== 'undefined'){
                                                comment[fieldName].dbValues[i] = comment[fieldName].jsonValue[i].total;
                                            }
                                            else{
                                                comment[fieldName].dbValues[i] = comment[fieldName].jsonValue[i].price;
                                            }
                                            
                                            comment[fieldName].textValues[i] = JSON.stringify(comment[fieldName].jsonValue[i]);
                                            
                                            if(!isNaN(parseFloat(comment[fieldName].dbValues[i]))){
                                                comment[fieldName].finalValue += parseFloat(comment[fieldName].dbValues[i]);
                                            }
                                        }
                                    }
                                }

                                break;
                                
                            case 'image':
                            case 'file':
                                // This includes signature and video fields
                                subResult = Database.queryList('SELECT * FROM _files WHERE finished = 0 AND nid IN(' + comment.nid + ',0) AND fieldName ="' + fieldName + '" ORDER BY delta ASC');

                                comment[fieldName].imageData = [];
                                comment[fieldName].degrees = [];
                                comment[fieldName].deltas = [];
                                comment[fieldName].thumbData = [];
                                
                                if (subResult.rowCount > 0) {
                                    while (subResult.isValidRow()) {
                                        
                                        comment[fieldName].imageData.push(subResult.fieldByName('file_path'));
                                        comment[fieldName].deltas.push(subResult.fieldByName('delta'));
                                        comment[fieldName].degrees.push(subResult.fieldByName('degrees', Ti.Database.FIELD_TYPE_INT));
                                        comment[fieldName].thumbData.push(subResult.fieldByName('thumb_path'));
                                        
                                        subResult.next();
                                    }
                                }
                                subResult.close();
                                Database.close();
                                
                                // Special case for only file-type fields
                                if(instances[fieldName].type == 'file'){
                                    
                                    subResult = Database.query("SELECT " + fieldName + "___filename AS filename FROM " + comment.type + " WHERE nid=" + comment.nid);
                                    if (subResult.rowCount > 0) {
                                        textValue = [];
                                        origDBValue = subResult.fieldByName("filename");
                                        tempDBValues = Utils.getParsedJSON(origDBValue);
                                        if(Utils.isArray(tempDBValues)){
                                            textValue = tempDBValues;
                                        }
                                        else{
                                            textValue.push(origDBValue);
                                        }
                                        
                                        for ( i = 0; i < comment[fieldName].dbValues.length; i++) {
                                            if (!Utils.isEmpty(comment[fieldName].dbValues[i])) {
                                                
                                                if(typeof textValue[i] !== 'undefined'){
                                                    comment[fieldName].textValues[i] = textValue[i];
                                                }
                                                else{
                                                    comment[fieldName].textValues[i] = comment[fieldName].dbValues[i];
                                                }
                                            }
                                        }
                                    }
                                    subResult.close();
                                }
                                
                                break;

                            case 'calculation_field':
                                // The text value is used to store the original value for comparison
                                // A little hackish, but there is no other use for a text value in calculation_fields
                                for ( i = 0; i < comment[fieldName].dbValues.length; i++) {

                                    comment[fieldName].textValues[i] = comment[fieldName].dbValues[i];
                                }
                                break;
                        }
                    }
                }
                
                this.comments.push(comment);
                
                result.next();
            }
            
            result.close();
            Database.close();  
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception loading comments: " + ex);
    }
};

CommentList.prototype.getCommentCount = function() {
    if(this.comments === null){
        this.initComments();
    }
    
    return this.comments.length;
};

CommentList.prototype.setNumCommentsLabel = function() {
    this.numCommentsLabel.setText(this.comments.length + " comment" + (this.comments.length == 1 ? '' : 's'));
};

CommentList.prototype.setupIOSToolbar = function() {
    var back, space, label, toolbar;
    
    back = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });
    
    back.addEventListener('click', function() {
        try{
            commentList.tabObj.close();
        }
        catch(ex){
            Utils.sendErrorReport("Exception closing iOS back node view: " + ex);
        }
    });

    space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    
    label = Titanium.UI.createButton({
        title : 'Comments',
        color : '#fff',
        ellipsize : true,
        wordwrap : false,
        width : 200,
        style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
    });

    // create and add toolbar
    toolbar = Ti.UI.iOS.createToolbar({
        items : [back, space, label, space],
        top : 0,
        borderTop : false,
        borderBottom : true,
        height: Ti.UI.SIZE
    });
    
    this.listWin.add(toolbar);
};

CommentList.prototype.getListWindow = function() {
    var headerView, newCommentButton;
    
    this.listWin = Ti.UI.createWindow({
        navBarHidden: true,
        backgroundColor:'#eee',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0
    });
    
    if(Ti.App.isIOS){
        this.listWin.top = 20;
    }
    
    if(this.comments === null){
        this.initComments();
    }
    
    headerView = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: 45,
        backgroundColor: '#ccc',
        top: 0,
        left: 0
    });
    
    if(Ti.App.isIOS){
        headerView.top = 40;
        this.setupIOSToolbar();
    }
    
    this.numCommentsLabel = Ti.UI.createLabel({
       text: '',
       color: '#000',
       font: {
           fontWeight: 'bold',
           fontSize: 18
       },
       height: Ti.UI.SIZE,
       width: Ti.UI.SIZE,
       textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
       top: 11,
       left: '3%'
    });
    
    this.setNumCommentsLabel();
    
    newCommentButton = Ti.UI.createLabel({
        backgroundGradient: Display.backgroundGradientBlue,
        height: 35,
        top: 5,
        text: 'New Comment',
        width: 170,
        right: '3%',
        color: '#fff',
        font: {
            fontSize: 18,
            fontWeight: 'bold'
        },
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        borderRadius: 10
    });
    
    newCommentButton.addEventListener('click', function(){
        Ti.API.debug("Clicked new comment");
        var commentForm = require('ui/CommentForm');
        
        try{
            commentForm.showFormWindow(commentList.nid, commentList.listWin);
        }
        catch(ex){
            Ti.API.error("Exception showing comment form: " + ex);
        }
    });
    
    headerView.add(this.numCommentsLabel);
    headerView.add(newCommentButton);
    
    this.listWin.add(headerView);
    
    this.setScrollView();
    
    this.listWin.addEventListener('updateView', commentList.updateView);
    
    return this.listWin;
};

CommentList.prototype.setScrollView = function() {
    var commentView, comment, i, fieldName, fieldWrapper, fieldNameLabel,
        commentHeaderView, commentDateLabel, bodyView, bodyLabel, nameLabel, instances;
    
    try{
        if(this.scrollView !== null && this.listWin !== null){
            // Attempt to remove the scroll view if this is a refresh
            this.listWin.remove(this.scrollView);
            this.scrollView = null;
        }
    }
    catch(ex){}
    
    this.scrollView = Ti.UI.createScrollView({
        top: 45,
        width: Ti.UI.FILL,
        bottom: 0,
        left: 0,
        layout: 'vertical',
        scrollType: 'vertical'
    });
    
    if(Ti.App.isIOS){
        this.scrollView.top = 85;
    }
    
    if(this.comments.length > 0){
        
        instances = Node.getFields(this.comments[0].node_type);
        
        for(i = 0; i < this.comments.length; i ++){
            
            comment = this.comments[i];
            
            commentView = Ti.UI.createView({
                layout: 'vertical',
                width: '94%',
                height: Ti.UI.SIZE,
                top: 10,
                bottom: 10,
                borderRadius: 10,
                borderColor: '#999',
                backgroundColor: '#fff'
            });
            
            commentHeaderView = Ti.UI.createView({
                backgroundColor: '#999',
                height: 25,
                width: Ti.UI.FILL 
            });
            
            commentDateLabel = Ti.UI.createLabel({
                text: Utils.formatDate(comment.created, true),
                color: '#eee',
                font: {
                    fontSize: 14,
                    fontWeight: 'bold'
                },
                width: Ti.UI.SIZE,
                left: '3%'
            });
            
            nameLabel = Ti.UI.createLabel({
                text: Utils.getRealname(comment.uid),
                color: '#eee',
                font: {
                    fontSize: 14,
                    fontWeight: 'bold'
                },
                width: Ti.UI.SIZE,
                right: '3%'
            });
            
            commentHeaderView.add(commentDateLabel);
            commentHeaderView.add(nameLabel);
            
            bodyView = Ti.UI.createView({
                layout: 'vertical',
                height: Ti.UI.SIZE,
                width: '94%',
                top: 5,
                bottom: 5
            });
            
            
            if(instances){
                for(fieldName in instances){
                    if(instances.hasOwnProperty(fieldName)){
                        if(typeof comment[fieldName] !== 'undefined' && typeof comment[fieldName].textValues !== 'undefined' && typeof comment[fieldName].textValues[0] !== 'undefined'){
                            
                            bodyLabel = Ti.UI.createLabel({
                                text: comment[fieldName].textValues[0],
                                height: Ti.UI.SIZE,
                                width: Ti.UI.SIZE,
                                textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
                                font: {
                                    fontSize: 14
                                },
                                color: '#333'
                            });
                            
                            if(fieldName == 'comment_body'){
                                bodyLabel.setWidth(Ti.UI.FILL);
                                bodyView.add(bodyLabel);
                            }
                            else{
                                
                                fieldWrapper = Ti.UI.createView({
                                    layout: 'horizontal',
                                    height: Ti.UI.SIZE,
                                    width: Ti.UI.FILL,
                                    top: 2,
                                    bottom: 2 
                                });
                                
                                fieldNameLabel = Ti.UI.createLabel({
                                    text: instances[fieldName].label + ": ",
                                    width: Ti.UI.SIZE,
                                    height: Ti.UI.SIZE,
                                    font: {
                                        fontSize: 14,
                                        fontWeight: 'bold'
                                    },
                                    color: '#333'
                                });
                                
                                fieldWrapper.add(fieldNameLabel);
                                fieldWrapper.add(bodyLabel);
                                bodyView.add(fieldWrapper);
                            }
                        }
                    }
                }
            }
            
            commentView.add(commentHeaderView);
            commentView.add(bodyView);
            
            this.scrollView.add(commentView);
        }
    }
    else{
        
        bodyLabel = Ti.UI.createLabel({
            text: 'No Comments',
            color: '#999',
            font: {
                fontWeight: 'bold',
                fontSize: 24
            },
            width: Ti.UI.FILL,
            height: Ti.UI.FILL,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
       this.scrollView.add(bodyLabel);
    }
    
    this.listWin.add(this.scrollView);
};

CommentList.prototype.updateView = function() {
    Ti.API.debug("Updating the comment list view");
    
    // Reinitialize the comments so the scroll view can have the updated list
    commentList.initComments();
    commentList.setNumCommentsLabel();
    commentList.setScrollView();
    
    Ti.API.debug("Updated the comment list view");
};

exports.init = function(nid) {
    commentList = new CommentList(nid);
};

exports.getCommentCount = function() {
    return commentList.getCommentCount();
};

exports.getListWindow = function(tabObject) {
    commentList.tabObj = tabObject;
    
    return commentList.getListWindow();
};

