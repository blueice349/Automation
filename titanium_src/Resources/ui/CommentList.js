/*jslint eqeq:true,plusplus:true*/
var Omadi, commentList;

function CommentList(nid){"use strict";
    //create module instance
    
    this.nid = nid;
    this.listWin = null;
    this.comments = null;
    this.isFormShowing = false;
    this.formView = null;
    this.numCommentsLabel = null;
    this.scrollView = null;
}

CommentList.prototype.back = function(){"use strict";
    Ti.API.debug("Pressed back button from comments...");
};

CommentList.prototype.initComments = function(){"use strict";
    var db, result, comment;
    
    this.comments = [];
    try{
        if(this.nid > 0){
            db = Omadi.utils.openMainDatabase();
            
            result = db.execute("SELECT cid, created, changed, body, uid FROM comment WHERE nid = " + this.nid + " ORDER BY created DESC");
            
            while(result.isValidRow()){
                
                comment = {};
                comment.body = result.fieldByName('body');
                comment.created = result.fieldByName('created');
                comment.changed = result.fieldByName('changed');
                comment.uid = result.fieldByName('uid');
                comment.nid = this.nid;
                comment.cid = result.fieldByName('cid');
                
                this.comments.push(comment);
                
                result.next();
            }
            
            result.close();
            db.close();  
        }
    }
    catch(ex){
        Omadi.service.sendErrorReport("Exception loading comments: " + ex);
    }
};

CommentList.prototype.getCommentCount = function(){"use strict";
    if(this.comments === null){
        this.initComments();
    }
    
    return this.comments.length;
};

CommentList.prototype.setNumCommentsLabel = function(){"use strict";
    this.numCommentsLabel.setText(this.comments.length + " comment" + (this.comments.length == 1 ? '' : 's'));
};

CommentList.prototype.getListWindow = function(){"use strict";
    
    var numCommentsLabel, headerView, newCommentButton;
    
    this.listWin = Ti.UI.createWindow({
        navBarHidden: true,
        backgroundColor:'#eee',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0
    });
    
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
        backgroundGradient: Omadi.display.backgroundGradientBlue,
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
            commentForm.showFormWindow(Omadi, commentList.nid, commentList.listWin);
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

CommentList.prototype.setScrollView = function(){"use strict";
    var commentView, comment, comments, i, 
        commentHeaderView, commentDateLabel, bodyView, bodyLabel, nameLabel;
    
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
    
    if(this.comments.length > 0){
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
                text: Omadi.utils.formatDate(comment.created, true),
                color: '#eee',
                font: {
                    fontSize: 14,
                    fontWeight: 'bold'
                },
                width: Ti.UI.SIZE,
                left: '3%'
            });
            
            nameLabel = Ti.UI.createLabel({
                text: Omadi.utils.getRealname(comment.uid),
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
            
            bodyLabel = Ti.UI.createLabel({
                text: comment.body,
                height: Ti.UI.SIZE,
                width: '100%',
                textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
                font: {
                    fontSize: 14
                },
                color: '#333'
            });
            
            bodyView.add(bodyLabel);
            
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

CommentList.prototype.updateView = function(){"use strict";
    Ti.API.debug("Updating the comment list view");
    
    // Reinitialize the comments so the scroll view can have the updated list
    commentList.initComments();
    commentList.setNumCommentsLabel();
    commentList.setScrollView();
    
    Ti.API.debug("Updated the comment list view");
};

exports.init = function(OmadiObj, nid){"use strict";
    Omadi = OmadiObj;
    commentList = new CommentList(nid);
};

exports.getCommentCount = function(){"use strict";
    return commentList.getCommentCount();
};

exports.getListWindow = function(){"use strict";
    return commentList.getListWindow();
};
