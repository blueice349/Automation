/*jslint plusplus:true,eqeq:true,nomen:true*/

Omadi.form = Omadi.form || {};


Omadi.form.adjustFileTable = function(node, windowNid, continuousId){"use strict";
    var fileNids, db, query, numPhotos, result, types, dialogTitle,
        dialogMessage, messageParts, secondDialog;
    
    if(typeof continuousId !== 'undefined'){
        continuousId = parseInt(continuousId, 10);
        if(isNaN(continuousId)){
            continuousId = 0;
        }
    }
    else{
        continuousId = 0;
    }
    
    if(node.flag_is_updated == 3){
        // The original node is a draft
        if(windowNid != 0){
            // Add any newly created/removed photos to the draft so they aren't lost
            fileNids = [0];
            if(continuousId != 0){
                fileNids.push(continuousId);
            }
            
            db = Omadi.utils.openListDatabase();
            db.execute("UPDATE _files SET nid = " + windowNid + " WHERE nid IN (" + fileNids.join(",") + ")");
            db.close();
        }
        
        Omadi.data.deleteContinuousNodes();
        Ti.UI.currentWindow.close();
    }
    else if(Omadi.utils.getPhotoWidget() == 'choose'){
        // This is not a draft, and we don't care about the taken photos
        // Nothing to delete with the choose widget
        // Photos should be managed externally except when uploaded successfully
        
        Omadi.data.deleteContinuousNodes();
        Ti.UI.currentWindow.close();
    }
    else{
        
        if(windowNid > 0){
            // On an update
            fileNids = [0];
        }
        else{
            // When not a draft (above)
            // When continuous
            // When new
            
            fileNids = [0];
            if(continuousId < 0){
                // Don't do anything with the photos with a positive nid
                fileNids.push(continuousId);
            }
        }
        
        query = "SELECT COUNT(*) FROM _files WHERE nid IN (" + fileNids.join(',') + ")";
        
        numPhotos = 0;

        db = Omadi.utils.openListDatabase();
        
        result = db.execute(query);
        if(result.isValidRow()){
            numPhotos = result.field(0, Ti.Database.FIELD_TYPE_INT);
        }
        result.close();
        
        types = {};
        
        if(numPhotos > 0){
            
            result = db.execute("SELECT type FROM _files WHERE nid IN (" + fileNids.join(',') + ")");
            while(result.isValidRow()){
                
                if(typeof types[result.fieldByName('type')] === 'undefined'){
                    types[result.fieldByName('type')] = 1;
                }
                else{
                    types[result.fieldByName('type')] ++;
                }
                
                result.next();
            }
            result.close();
            
            if(Omadi.utils.count(types) > 1){
                dialogTitle = 'Delete ' + numPhotos + ' Files';
                dialogMessage = 'Do you want to delete the ';
                messageParts = [];
                
                if(typeof types.image !== 'undefined'){
                    if(types.image == 1){
                        messageParts.push('photo');
                    }
                    else{
                        messageParts.push(types.image + ' photos');
                    }
                }
                if(typeof types.video !== 'undefined'){
                    if(types.video == 1){
                        messageParts.push('video');
                    }
                    else{
                        messageParts.push(types.video + ' videos');
                    }
                }
                if(typeof types.signature !== 'undefined'){
                    if(types.signature == 1){
                        messageParts.push('signature');
                    }
                    else{
                        messageParts.push(types.signature + ' signature');
                    }
                }
                if(typeof types.file !== 'undefined'){
                    if(types.file == 1){
                        messageParts.push('1 file');
                    }
                    else{
                        messageParts.push(types.file + ' files');
                    }
                }
                
                dialogMessage += messageParts.join(' and ') + "?";
            }
            else{
                if(numPhotos == 1){
                    dialogTitle = 'Delete 1 ';
                    dialogMessage = 'Do you want to delete the ';
                    if(typeof types.image !== 'undefined'){
                        dialogTitle += 'Photo';
                        dialogMessage += 'photo you just took?';
                    }
                    else if(typeof types.video !== 'undefined'){
                        dialogTitle += 'Video';
                        dialogMessage += 'video you just attached?';
                    }
                    else if(typeof types.signature !== 'undefined'){
                        dialogTitle += 'Signature';
                        dialogMessage += 'signature?';
                    }
                    else{
                        dialogTitle += 'File';
                        dialogMessage += 'file just selected?';
                    }
                }
                else{
                    dialogTitle = 'Delete ' + numPhotos + ' ';
                    dialogMessage = 'Do you want to delete the ' + numPhotos + ' ';
                    if(typeof types.image !== 'undefined'){
                        dialogTitle += 'Photos';
                        dialogMessage += 'photos you just took?';
                    }
                    else if(typeof types.video !== 'undefined'){
                        dialogTitle += 'Videos';
                        dialogMessage += 'videos you just attached?';
                    }
                    else if(typeof types.signature !== 'undefined'){
                        dialogTitle += 'Signatures';
                        dialogMessage += 'signatures?';
                    }
                    else{
                        dialogTitle += 'Files';
                        dialogMessage += 'files just selected?';
                    }
                }
            }
        }
            
        db.close();
        
        if(numPhotos > 0){
            secondDialog = Ti.UI.createAlertDialog({
                cancel : 1,
                buttonNames : ['Delete', 'Keep', 'Cancel'],
                message : dialogMessage,
                title : dialogTitle,
                continuousId : continuousId
            });

            secondDialog.addEventListener('click', function(e) {
                var db_toDeleteImage, deleteResult, file, fileNids, continuousId, thumbFile;
                continuousId = e.source.continuousId;
                
                fileNids = [0];
                if(continuousId != 0){
                    fileNids.push(continuousId);
                }
                
                if(e.index === 0 || e.index === 1){
                    
                    db_toDeleteImage = Omadi.utils.openListDatabase();
                    
                    if (e.index === 0) {
                        
                        deleteResult = db_toDeleteImage.execute("SELECT file_path, thumb_path FROM _files WHERE nid IN (" + fileNids.join(',') + ")");
                        
                        while(deleteResult.isValidRow()){
                            
                            // Delete the regular photo file
                            file = Ti.Filesystem.getFile(deleteResult.fieldByName("file_path"));
                            if(file.exists()){
                                file.deleteFile();
                            }
                            
                            // Delete the thumbnail file
                            thumbFile = Ti.Filesystem.getFile(deleteResult.fieldByName("thumb_path"));
                            if(thumbFile.exists()){
                                thumbFile.deleteFile();
                            }
                            
                            deleteResult.next();
                        }
                        
                        deleteResult.close();
                        
                        db_toDeleteImage.execute("DELETE FROM _files WHERE nid IN (" + fileNids.join(",") + ")");
                        
                    }
                    else if(e.index === 1){
                        // Set the nid of the photos to save to -1000000, so they won't be deleted by deletion of other photos, 
                        // and so it isn't automatically used by other new nodes
                        db_toDeleteImage.execute("UPDATE _files SET nid = -1000000 WHERE nid IN (" + fileNids.join(",") + ")");
                    }
                    
                    db_toDeleteImage.close();
                    
                    Omadi.data.deleteContinuousNodes();
                    Ti.UI.currentWindow.close();
                }
            });
            
            secondDialog.show();
        }
        else{
            
            Omadi.data.deleteContinuousNodes();
            Ti.UI.currentWindow.close();
        }
    }
};
