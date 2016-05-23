'use strict';
require( './setup' );
var assert   = require( 'assert' );
var config   = require( './Config' );
var Store    = require( './Store' );

var Commons = function () {

	this.os      = config.desired.platformName;
	this.version = config.desired.platformVersion;
};

Commons.prototype.alertText = function ( alertText ) {

	var driver   = config.driver;
	var elements = config.elements;

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
		el
		.click()
		config.driver.elementByName( 'space' ).isDisplayed().should.eventually.be.true
		return el
		.clear()
		.sendKeys( keys );
	}
};

Commons.prototype.whereAmI = function () {

	var driver   = config.driver;
	var elements = config.elements;

	return driver
	.elementByNameIfExists( elements.formScreen.actions )
	.then( function ( actions ) {

		if ( actions ) {
			if ( this.isIOS() ) {
				driver
				.elementByName( elements.formScreen.back )
				.click()
				.sleep ( 1000 );

			} else if ( this.isAndroid() ) { 
				driver
				.back()
				.sleep( 1000 );
			}
		}
		return driver
		.waitForElementByName( elements.homeScreen.syncAllowed, 180000 )
		.then( function () {
		
			console.log( 'Made sure test is back on the homeScreen'.green );
			//assert.error( this.currentTest.state );
		} )
	} )
};

Commons.prototype.beforeAll = function () {

	before( function () {

		var elements = config.elements;
		var driver   = config.driver;
		var desired  = config.desired;
		console.log( 'BEFORE All Test....'.red );
		config.loginTest   = false;
		config.currentTest = 'notStarted';
		return driver.init( desired );
	} );
};

Commons.prototype.beforeEachDes = function ( ) {

	// before( function ( done ) {
	
	//  done( new Error( 'failed' ) ); 
	// } );

	before( function () {
		console.log( 'beforeEachDes '.red + config.currentTest + ' ' + config.loginTest );
		if ( config.currentTest != 'passed' && config.loginTest == true ) {
			console.log( 'Next test was skipped do to login failed test '.red );
			this.skip();

		} else if ( config.currentTest == 'passed' ) {
			config.currentTest = 'notStarted';
			config.loginTest   = false; 
		}
	} );
};

Commons.prototype.beforeEachIt = function ( ) {

	beforeEach( function () {
		console.log( 'beforeEachIt '.red + 'Curent Test Status ' + config.currentTest + ' Current test Login? ' + config.loginTest );
		if ( ( config.currentTest != 'passed'
				&& config.loginTest == true
			) || ( config.currentTest == 'testStarted' )
		) {
			console.log( 'Next test was skipped do to login failed test '.red );
			this.skip();

		} else if ( config.currentTest == 'passed' || config.currentTest == 'notStarted' ) {
			var lastUser = Store.get( 'lastUser' );
			config.currentTest = 'testStarted';
		}
	} );
};

Commons.prototype.afterAll = function () {
	
	after( function () {

		var driver   = config.driver;
		var elements = config.elements;
		console.log( 'AFTER ALL....'.red );
		return driver.quit();
	} );
};

Commons.prototype.afterEachDes = function () {

	after( function () {

		var driver   = config.driver;
		var elements = config.elements;
		var allPassed;
		console.log( 'afterEachDes '.red  + config.currentTest );
		allPassed = allPassed && this.currentTest.state === 'passed';
		
		if ( config.currentTest != 'passed' && config.loginTest != true && config.logoutTest != true ) {
			config.currentTest = 'notStarted';
			config.resetApp = true;
			return driver
			.resetApp()
			.sleep ( 1000 )
			// .then( function () {

			// 	var lastLogin = Store.get( 'lastLogin' );

			// 	if ( lastLogin && lastLogin.loginTest ) {
			// 		require( lastLogin.loginTest )();
			// 	}
			// } );
			.then( function () {
			
				console.log( 'App Restarted due to Failed test... App will not restart if a failed login test was performed'.green );
				return driver
				.elementByNameIfExists( elements.formScreen.actions )
				.then( function ( actions ) {

					if ( actions ) {
						if ( this.isIOS() ) {
							return driver
							.elementByName( elements.formScreen.back )
							.click()
							.sleep ( 1000 )
							.waitForElementByName( elements.homeScreen.syncAllowed, 180000 )
							console.log( 'Made sure test is back on the homeScreen'.green );
						} else if ( this.isAndroid() ) { 
							return driver
							.back()
							.sleep( 1000 )
							.waitForElementByName( elements.homeScreen.syncAllowed, 180000 )
							console.log( 'Made sure test is back on the homeScreen'.green );
						}
					} else if ( config.logoutTest === true ) {
						return driver
						.elementByNameIfExists( elements.loginScreen.client_account )
						.then( function ( loginScreen ) {

							if( loginScreen ) {
								console.log( 'Test is at loginScreen after a resetApp was performed'.red );
							} else {
								console.log( 'Test was unable to locate current location' );
								this.skip();
							}
						} );
					}
				} );
			} );

		} else if ( config.loginTest == true && config.currentTest != 'passed' ) {
				console.log( 'Automation could not resert and comeplete due to a login failed test. '.red );
		} else if ( config.logoutTest == true && config.currentTest != 'passed' ) {


		} else if ( config.currentTest == 'passed' ) {
			console.log( 'Tested Passed will start next test.....'.green );
		}
	}.bind( this ) );
};

Commons.prototype.afterEachIt = function () {
	
	afterEach( function () {

	} );
};

module.exports = new Commons();
