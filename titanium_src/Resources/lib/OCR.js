/*jslint node:true */
'use strict';

var Display = require('lib/Display');

if (Ti.Platform.name !== 'android') {
	var ocr = require('com.omadi.ocr');
}

var OCR = function(callback, saveImage) {
	this.callback = callback;
	
	this.saveImage = saveImage || false;
	
	this.x = null;
	this.y = null;
	this.height = null;
	this.width = null;
};

OCR.OVERLAY_COLOR = 'rgba(255, 0, 0, .5)';
OCR.MIN_CROP_SIZE = 75;

OCR.prototype.recognizeFromCamera = function() {
	if (!ocr) {
		error('OCR is not supported on this device.', callback);
		return;
	}
	
	var self = this;
	
	Titanium.Media.showCamera({
		saveToPhotoGallery: this.saveImage,
		mediaTypes: Titanium.Media.MEDIA_TYPE_PHOTO,
		success: function(event) {
			Display.loading();
			
			var image = event.media;
			
			self._cropImage(image);
		},
		error: function() {
			self._error('There was a problem with the camera.');
		},
		cancel: function() {
			self._cancel();
		}
	});
};

OCR.prototype._getOverlay = function() {
	var self = this;
	var wrapper = Ti.UI.createView({
		width: Ti.UI.FILL,
		height: Ti.UI.FILL
	});
	
	var dim = wrapper.toImage();
	
	var crop = Ti.UI.createView({
		borderWidth: 3,
		borderColor: OCR.OVERLAY_COLOR,
		width: Math.floor(dim.width * .9),
		height: Math.floor(dim.height * .2),
		touchEnabled: false
	});
	
	this.y = crop.top = Math.floor((dim.height - crop.height) / 2);
	this.x = crop.left = Math.floor((dim.width - crop.width) / 2);
	this.width = crop.width;
	this.height = crop.height;
	
	var innerBorder = Ti.UI.createView({
		borderWidth: 1,
		borderColor: OCR.OVERLAY_COLOR,
		width: crop.width - 6,
		height: crop.height - 6,
	});
	
	var topLeftScaleHandle = Ti.UI.createView({
		width: 30,
		height: 30,
		top: 0,
		left: 0,
		bubbleParent: false
	});
	topLeftScaleHandle.add(Ti.UI.createView({
		height: 29,
		width: 1,
		right: 0,
		top: 1,
		backgroundColor: OCR.OVERLAY_COLOR,
	}));
	topLeftScaleHandle.add(Ti.UI.createView({
		height: 1,
		width: 28,
		left: 1,
		bottom: 0,
		backgroundColor: OCR.OVERLAY_COLOR,
	}));
	
	var bottomLeftScaleHandle = Ti.UI.createView({
		width: 30,
		height: 30,
		bottom: 0,
		left: 0,
		bubbleParent: false
	});
	bottomLeftScaleHandle.add(Ti.UI.createView({
		height: 29,
		width: 1,
		right: 0,
		bottom: 1,
		backgroundColor: OCR.OVERLAY_COLOR,
	}));
	bottomLeftScaleHandle.add(Ti.UI.createView({
		height: 1,
		width: 28,
		left: 1,
		top: 0,
		backgroundColor: OCR.OVERLAY_COLOR,
	}));
	
	var topRightScaleHandle = Ti.UI.createView({
		width: 30,
		height: 30,
		top: 0,
		right: 0,
		bubbleParent: false
	});
	topRightScaleHandle.add(Ti.UI.createView({
		height: 29,
		width: 1,
		left: 0,
		top: 1,
		backgroundColor: OCR.OVERLAY_COLOR,
	}));
	topRightScaleHandle.add(Ti.UI.createView({
		height: 1,
		width: 28,
		right: 1,
		bottom: 0,
		backgroundColor: OCR.OVERLAY_COLOR,
	}));
	
	var bottomRightScaleHandle = Ti.UI.createView({
		width: 30,
		height: 30,
		bottom: 0,
		right: 0,
		bubbleParent: false
	});
	bottomRightScaleHandle.add(Ti.UI.createView({
		height: 29,
		width: 1,
		left: 0,
		buttom: 1,
		backgroundColor: OCR.OVERLAY_COLOR,
	}));
	bottomRightScaleHandle.add(Ti.UI.createView({
		height: 1,
		width: 28,
		right: 1,
		top: 0,
		backgroundColor: OCR.OVERLAY_COLOR,
	}));
	
	function touchstart(event) {
		crop.offsetX = event.x;
		crop.offsetY = event.y;
		topLeftScaleHandle.hide();
		bottomLeftScaleHandle.hide();
		topRightScaleHandle.hide();
		bottomRightScaleHandle.hide();
	}
	
	function touchend() {
		self.width = crop.width;
		self.height = crop.height;
		self.y = crop.top;
		self.x = crop.left;
		delete crop.offsetX;
		delete crop.offsetY;
		topLeftScaleHandle.show();
		bottomLeftScaleHandle.show();
		topRightScaleHandle.show();
		bottomRightScaleHandle.show();
		innerBorder.width = crop.width - 6;
		innerBorder.height = crop.height - 6;
		innerBorder.top = crop.top + 3;
		innerBorder.left = crop.left + 3;
	}
	
	function cap(num, min, max) {
		if (num < min) {
			return min;
		}
		
		if (num > max) {
			return max;
		}
		
		return num;
	} 
	
	topLeftScaleHandle.addEventListener('touchstart', touchstart);
	topLeftScaleHandle.addEventListener('touchmove', function(event) {
		crop.width = cap(self.width - event.x + crop.offsetX, OCR.MIN_CROP_SIZE, dim.width);
		crop.height = cap(self.height - event.y + crop.offsetY, OCR.MIN_CROP_SIZE, dim.height);
		crop.left = self.x + self.width - crop.width;
		crop.top = self.y + self.height - crop.height;
	});
	topLeftScaleHandle.addEventListener('touchend', touchend);
	
	bottomLeftScaleHandle.addEventListener('touchstart', touchstart);
	bottomLeftScaleHandle.addEventListener('touchmove', function(event) {
		crop.width = cap(self.width - event.x + crop.offsetX, OCR.MIN_CROP_SIZE, dim.width);
		crop.height = cap(self.height + event.y - crop.offsetY, OCR.MIN_CROP_SIZE, dim.height);
		crop.left = self.x + self.width - crop.width;
	});
	bottomLeftScaleHandle.addEventListener('touchend', touchend);
	
	topRightScaleHandle.addEventListener('touchstart', touchstart);
	topRightScaleHandle.addEventListener('touchmove', function(event) {
		crop.width = cap(self.width + event.x - crop.offsetX, OCR.MIN_CROP_SIZE, dim.width);
		crop.height = cap(self.height - event.y + crop.offsetY, OCR.MIN_CROP_SIZE, dim.height);
		crop.top = self.y + self.height - crop.height;
	});
	topRightScaleHandle.addEventListener('touchend', touchend);
	
	bottomRightScaleHandle.addEventListener('touchstart', touchstart);
	bottomRightScaleHandle.addEventListener('touchmove', function(event) {
		crop.width = cap(self.width + event.x - crop.offsetX, OCR.MIN_CROP_SIZE, dim.width);
		crop.height = cap(self.height + event.y - crop.offsetY, OCR.MIN_CROP_SIZE, dim.height);
	});
	bottomRightScaleHandle.addEventListener('touchend', touchend);
	
	innerBorder.addEventListener('touchstart', touchstart);
	innerBorder.addEventListener('touchmove', function(event) {
		crop.left = cap(self.x + event.x - crop.offsetX, 0, dim.width - crop.width);
		crop.top = cap(self.y + event.y - crop.offsetY, 0, dim.height - crop.height);
	});
	innerBorder.addEventListener('touchend', touchend);
	
	innerBorder.add(topLeftScaleHandle);
	innerBorder.add(bottomLeftScaleHandle);
	innerBorder.add(topRightScaleHandle);
	innerBorder.add(bottomRightScaleHandle);
	wrapper.add(innerBorder);
	wrapper.add(crop);
	
	return wrapper;
};

OCR.prototype._cropImage = function(image) {
	var self = this;
	
	var win = Ti.UI.createWindow({
		width: Ti.UI.FILL,
		height: Ti.UI.FILL
	});
	
	var imageView = Ti.UI.createImageView({
		width: Ti.UI.FILL,
		height: Ti.UI.FILL,
		image: image
	});
	
	var buttonBar = Ti.UI.createView({
		width: Ti.UI.FILL,
		height: 75,
		backgroundColor: 'rgba(0, 0, 0, .5)',
		bottom: 0
	});
	
	var cropButton = Ti.UI.createButton({
		title: 'Crop',
		color: 'white',
		right: 50,
		font: {
			fontSize: 16,
			fontWeight: 'bold'
		}
	});
	
	cropButton.addEventListener('click', function() {
		var dim = imageView.toImage();
		var resized = image.imageAsResized(dim.width, dim.height);
		var cropped = resized.imageAsCropped({
			width: self.width,
			height: self.height,
			x: self.x,
			y: self.y
		});
		var text = ocr.recognizedText(cropped);
		
		Display.doneLoading();
		self._success(text);
		win.close();
	});
	
	var cancelButton = Ti.UI.createButton({
		title: 'Cancel',
		color: 'white',
		left: 50,
		font: {
			fontSize: 16,
			fontWeight: 'bold'
		}
	});
	
	cancelButton.addEventListener('click', function() {
		win.close();
	});
	
	buttonBar.add(cropButton);
	buttonBar.add(cancelButton);
	
	imageView.add(this._getOverlay());
	win.add(imageView);
	win.add(buttonBar);
	
	win.open();
};

OCR.prototype._success = function(text) {
	if (this.callback.success) {
		this.callback.success(text);
	}
};

OCR.prototype._error = function(er) {
	if (this.callback.er) {
		this.callback.error(er);
	}
};

OCR.prototype._cancel = function() {
	if (this.callback.cancel) {
		this.callback.cancel();
	}
};

module.exports = OCR;
