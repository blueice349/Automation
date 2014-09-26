/* jshint globalstrict:true */
'use strict';

var NFCEventDispatcher = require('services/NFCEventDispatcher');

var NFCCollectionGame = function() {
	try {
		this.tagScannedCallback = null;
		this.nfc = null;
		
		this.collection = {};
		
		this._initNFCEventDispatcher();
	} catch (error) {}
};

NFCCollectionGame.TagName = {
	TAG_ONE: 'tag 1',
	TAG_TWO: 'tag 2',
	TAG_THREE: 'tag 3',
	TAG_FOUR: 'tag 4',
	TAG_FINAL: 'tag final'
};

NFCCollectionGame.Tag = {
	'04BCBA5A973780': NFCCollectionGame.TagName.TAG_ONE,
	'04CB16BA532880': NFCCollectionGame.TagName.TAG_ONE,
	'04BD945A973780': NFCCollectionGame.TagName.TAG_TWO,
	'04CD17BA532880': NFCCollectionGame.TagName.TAG_TWO,
	'04E75D5A973780': NFCCollectionGame.TagName.TAG_THREE,
	'04CE17BA532880': NFCCollectionGame.TagName.TAG_THREE,
	'04BCD65A973780': NFCCollectionGame.TagName.TAG_FOUR,
	'04BD17BA532880': NFCCollectionGame.TagName.TAG_FOUR,
	'049C662A473480': NFCCollectionGame.TagName.TAG_FINAL,
	'06436800': NFCCollectionGame.TagName.TAG_FINAL
};

NFCCollectionGame.prototype._initNFCEventDispatcher = function() {
	try {
		if (Ti.Platform.name === 'android') {
			this.tagScannedCallback = this._handleTagScanned.bind(this);
			this.nfc = new NFCEventDispatcher(Titanium.Android.currentActivity);
			this.nfc.addNFCListener(this.tagScannedCallback);
		}
	} catch(error) {}
};

NFCCollectionGame.prototype._handleTagScanned = function(tag) {
	try {
		var tagName = NFCCollectionGame.Tag[tag.getId()];
		if (tagName == NFCCollectionGame.TagName.TAG_FINAL) {
			var missingTags = this._getMissingTags();
			if (missingTags.length === 0) {
				alert(tag.getData());
			} else {
				alert('You still need to find the following tags:\n' + missingTags.join('\n'));
			}
		} else if (tagName) {
			Ti.API.info(tagName + ' scanned!');
			alert(tag.getData());
			this.collection[tagName] = true;
		}
	} catch (error) {
		Ti.API.error('Error in NFCCollectionGame.prototype._handleTagScanned: ' + error);
	}
};

NFCCollectionGame.prototype._getMissingTags = function() {
	try {
		var missingTags = [];
		
		for (var tag in NFCCollectionGame.TagName) {
			var tagName = NFCCollectionGame.TagName[tag];
			if (tagName != NFCCollectionGame.TagName.TAG_FINAL && !this.collection[tagName]) {
				missingTags.push(tagName);
			}
		}
		
		return missingTags;
	} catch (error) {
		alert('Error: unable to determine missing tags. Try again.');
		return ['tag 1', 'tag 2', 'tag 3', 'tag 4'];
	}
};

var nfcCollectionGame = new NFCCollectionGame();

exports.getInstance = function() {
	return nfcCollectionGame;
};
