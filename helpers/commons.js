'use strict';
require( './setup' );
var assert = require( 'assert' );
var config = require( './Config' );

var Commons = function () {
	
	var config = require( './Config' );

	this.os = config.desired.platformName;
	this.version = config.desired.platformVersion;
};

Commons.prototype.alertText = function ( driver, alertText ) {

	if ( this.isIOS() ) {
		return driver.alertText().should.eventually.contain( alertText );

	} else if ( this.isAndroid() || this.isAndroid6() ) {
		return driver.elementByName( alertText ).text().should.eventually.contain( alertText );
	}
};

Commons.prototype.getItem = function ( name, num ) {

	var value = name;

	if ( !isNaN( num ) ) {
		value = value + num; 
	}

	value = value + '.';

	return value
};

Commons.prototype.isAndroid = function () {

	if ( this.os == 'Android' ) {
		return true;
	} 

		return false;
};

Commons.prototype.isAndroid6 = function () {

	if ( this.os == 'Android' && this.version == '6.0' ) {
		return true;
	}
	
		return false;
};

Commons.prototype.isIOS = function () {

	if ( this.os == 'iOS' ) {
		return true;
	} 

		return false;
};

Commons.prototype.sendKeys = function ( el, keys ) {

	if ( this.isAndroid() ) {
		return el
			.click()
			.clear()
			.sendKeys( keys )
			.hideKeyboard();
	} else if ( this.isIOS() ) {
		return el
			.click()
			.clear()
			.sendKeys( keys );
	}
};

module.exports = new Commons();
