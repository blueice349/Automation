/*jslint node:true */
'use strict';

if (Ti.Platform.name !== 'android') {
	var ocr = require('com.omadi.ocr');
}

exports.recognizeFromCamera = function(callback) {
	if (!ocr) {
		error('OCR is not supported on this device.', callback);
		return;
	}
	
	Titanium.Media.showCamera({
		allowEditing: true,
		mediaTypes: Titanium.Media.MEDIA_TYPE_PHOTO,
		success: function(event) {
			Display.loading();
			
			var resized = resizeImage(event.media);
			var text = ocr.recognizedText(resized);
			
			Display.doneLoading();
			console.log('Recognized text: "' + text + '"');
			success(text, callback);
		},
		error: function() {
			error('There was a problem with the camera.', callback);
		},
		cancel: function() {
			cancel(callback);
		}
	});
};

function resizeImage(image) {
	return image.imageAsResized(320, 320 * image.width / image.width);
}

function success(text, callback) {
	if (callback.success) {
		callback.success(text);
	}
}

function error(error, callback) {
	if (callback.error) {
		callback.error(error);
	}
}

function cancel(callback) {
	if (callback.cancel) {
		callback.cancel();
	}
}
