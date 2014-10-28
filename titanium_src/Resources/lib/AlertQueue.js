/*jslint node:true */
'use strict';

exports.useAlertQueue = true;

var queue = [];

exports.enqueue = function(dialog) {
	if (exports.useAlertQueue) {
        queue.push(dialog);
    } else {
        dialog.show();
    }
};

exports.showNextAlertInQueue = function() {
    if (queue.length) {
        // Add a small break for the OS to catch up with things
        // If the break isn't there, the UI doesn't finish updates every time on iOS
        setTimeout(function(){
            var alert = queue.shift();
            if(alert){
                alert.show();
            }
        }, 250);
    }
    else{
        exports.useAlertQueue = false;
    }
};
