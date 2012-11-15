Omadi.display = Omadi.display || {};

Omadi.display.showBigImage = function(imageView) {
	"use strict";
	
	var imageWin, fullImage, background;
	
	imageWin = Ti.UI.createWindow({
		backgroundColor : '#00000000'
	});
	
	imageWin.orientation = [Ti.UI.PORTRAIT];

	background = Ti.UI.createView({
		backgroundColor : 'black',
		opacity : 0.8,
		top : 0,
		bottom : 0,
		right : 0,
		left : 0
	});
	
	fullImage = Omadi.display.getImageViewFromData(imageView.bigImg, Ti.Platform.displayCaps.platformWidth, Ti.Platform.displayCaps.platformHeight - 50);
	
	if(fullImage !== null){
		
		fullImage.opacity = 1;
		fullImage.addEventListener('click', function(e) {
			imageWin.close();
		});
		
		background.addEventListener('click', function(e) {
			imageWin.close();
		});
		
		background.add(fullImage);
		imageWin.add(background);
		imageWin.open();
	}
};


Omadi.display.displayLargeImage = function(imageView, nid, file_id) {
	"use strict";
	
	var http, loading;
	
	if(nid > 0 && file_id > 0){
		loading = Ti.UI.createActivityIndicator();
		loading.font = {
			fontFamily : 'Helvetica Neue',
			fontSize : 15,
			fontWeight : 'bold'
		};
		loading.color = 'white';
		loading.message = 'Loading...';
		loading.show();
		
		if (imageView.bigImg !== null) {
			Omadi.display.showBigImage(imageView);
			return;
		}
		
		try {
			http = Ti.Network.createHTTPClient();
			http.setTimeout(30000);
			http.open('GET', Omadi.DOMAIN_NAME + '/sync/file/' + nid + '/' + file_id);
			
			Omadi.utils.setCookieHeader(http);
			
			http.onload = function(e) {
				//Ti.API.info('=========== Success ========');
				imageView.bigImg = this.responseData;
				Omadi.display.showBigImage(imageView);
				loading.hide();
			};
	
			http.onerror = function(e) {
				Ti.API.error("Error in download Image 2");
				loading.hide();
				alert("There was an error retrieving the file.");
			};
			
			http.send();
		} 
		catch(e) {
			loading.hide();
			alert("There was an error retrieving the file.");
			Ti.API.info("==== ERROR ===" + e);
		}
	}
};


Omadi.display.getImageViewFromData = function(blobImage, maxWidth, maxHeight) {
	"use strict";
	var imageView, multiple;
	try{
		imageView = Titanium.UI.createImageView({
			image : blobImage,
			width : 'auto',
			height : 'auto'
		});
		
		blobImage = imageView.toBlob();

		if(blobImage.height / blobImage.width > maxHeight / maxWidth) {
			multiple = blobImage.height / maxHeight;
		} 
		else {
			multiple = blobImage.width / maxWidth;
		}

		if(multiple >= 1) {
			imageView.height = parseInt(blobImage.height / multiple, 10);
			imageView.width = parseInt(blobImage.width / multiple, 10);
			imageView.image = imageView.toImage();
		} 
		
		return imageView;
	}
	catch(evt){
		Ti.API.error("Error in reduce Image Size");
	}
	
};

// Download Image from the server
Omadi.display.setImageViewThumbnail = function(imageView, nid, file_id) {
	"use strict";
	
	var http, tempImg;
	
	if(nid > 0 && file_id > 0){
		try {
			http = Ti.Network.createHTTPClient();
			http.setTimeout(30000);
			Ti.API.info(Omadi.DOMAIN_NAME + '/sync/image/thumbnail/' + nid + '/' + file_id);
			http.open('GET', Omadi.DOMAIN_NAME + '/sync/image/thumbnail/' + nid + '/' + file_id);
			
			Omadi.utils.setCookieHeader(http);
	
			http.onload = function(e) {
				tempImg = Ti.UI.createImageView({
					height : 'auto',
					width : 'auto',
					image : this.responseData
				});
				
				if (tempImg.toImage().height > 100 || tempImg.toImage().width > 100) {
					imageView.setImage(Omadi.display.getImageViewFromData(tempImg.toImage(), 100, 100).toBlob());
				} 
				else {
					imageView.setImage(this.responseData);
				}
				imageView.isImage = true;
			};
	
			http.onerror = function(e) {
				Ti.API.error("Error in download image: " + e.status + " " + e.error + " " + nid + " " + file_id);
				imageView.image = '../images/default.png';
			};
	
			http.send();
		} 
		catch(e) {
			Ti.API.info("==== ERROR ===" + e);
		}
	}
};