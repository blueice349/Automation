'use strict';
require( 'colors' );
require( './setup' );
var assert   = require( 'assert' );
var config   = require( './Config' );
var Store    = require( './Store' );

var Commons = function () {

	this.os      = config.desired.platformName;
	this.version = config.desired.platformVersion;
};

Commons.prototype.isAndroid = function () {

	if ( this.os == 'Android' ) {
		return true;
	} 

		return false;
};

Commons.prototype.isAndroid6 = function () {

	if ( this.os == 'Android' 
		&& this.version == '6.0' 
	) {
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
	
	var elements = config.elements;

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
		.sendKeys( keys )
		.elementByNameIfExists( elements.alertButtons.done )
		.then( function ( keyboardDone ) {
			if ( keyboardDone 
				&& config.loginTest != true 
			) {
				console.log( '"Done" button is visibile will click Done after typing data in!'.red );
				return keyboardDone
				.click();
			}
		} );
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

Commons.prototype.alertText = function ( alertText ) {

	var driver   = config.driver;
	var elements = config.elements;

	if ( this.isIOS() ) {
		return driver.alertText().should.eventually.contain( alertText );

	} else if ( this.isAndroid() 
			  || this.isAndroid6() 
  	) {
		return driver.elementByName( alertText ).text().should.eventually.contain( alertText );
	}
};

Commons.prototype.whereAmI = function () {

	require( 'colors' );
	var driver   = config.driver;
	var elements = config.elements;

	return driver
	.sleep( 3000 )
	.elementByNameIfExists( elements.formScreen.actions )
	.isDisplayed()
	.then( function ( nodeEdit ) {

		if ( nodeEdit ) {
			if ( this.isIOS() ) {
				return driver
				.elementByName( elements.formScreen.back )
				.click()
				.sleep ( 1000 );

			} else if ( this.isAndroid() ) { 
				return driver
				.back()
				.sleep( 1000 );
			}
		
		} else {

			console.log( 'App is not on a node edit screen.'.red );
			return;
		}
	} )
	.elementByNameIfExists( elements.jobsScreen.newJobsHeader )
	.isDisplayed()
	.then( function ( jobsScreen ) {

		if ( jobsScreen ) {
			if ( this.isIOS() ) {
				return driver
				.elementByName( elements.jobsScreen.back )
				.click()
				.sleep ( 1000 );

			} else if ( this.isAndroid() ) { 
				return driver
				.back()
				.sleep( 1000 );
			}
		} else {
			console.log( 'App is not on the jobsScreen.'.red );
			return;
		}
	} )
	.elementByNameIfExists( elements.loginScreen.clientAccount )
	.isDisplayed()
	.then ( function ( loginScreen ) {

		if ( loginScreen ) {

			assert.fail( 'App is on the loginScreen can not contiune the process.'.red );
		} else {

			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 180000 )
			.then( function ( syncAllowed ) {
		
				if ( syncAllowed ) {
					console.log( 'App should be on homeScreen after a restart.'.green );
				}
			} );
		}
	} );
};

Commons.prototype.beforeAll = function () {

	before( function () {

		console.log( 'BEFORE All Test....'.red );
		var elements       = config.elements;
		var driver         = config.driver;
		var desired        = config.desired;
		config.loginTest   = false;
		config.currentTest = 'notStarted';
		return driver.init( desired );
	} );
};

Commons.prototype.beforeEachDes = function ( ) {

	before( function () {
		
		console.log( 'beforeEachDes...'.red );
		if ( config.currentTest != 'passed' 
			&& config.loginTest === true 
			|| config.skip === true
		) {
			console.log( 'Next test was skipped do to login failed test or your app is not up-to-date with current source code.'.red );
			this.skip();

		} else if ( config.currentTest === 'passed' ) {
			config.currentTest = 'notStarted';
			config.loginTest   = false; 
		}
	} );
};

Commons.prototype.beforeEachIt = function ( ) {

	beforeEach( function () {

		console.log( 'beforeEachIt.......'.red );
		if ( config.currentTest != 'passed' 
			&& config.loginTest === true 
			|| config.currentTest === 'testStarted' 
			|| config.skip === true 
		) {
			console.log( 'Next test was skipped'.red );
			this.skip();

		} else if ( config.currentTest === 'passed' 
					|| config.currentTest === 'notStarted' 
		) {
			config.currentTest = 'testStarted';
		}
	} );
};

Commons.prototype.afterAll = function () {
	
	after( function () {

		console.log( 'AFTER ALL....'.red );
		var driver   = config.driver;
		var elements = config.elements;
		return driver.quit();
	} );
};

Commons.prototype.afterEachDes = function () {

	after( function () {
		
		var allPassed;
		var assert   = require( 'assert' );
		var commons  = require( './Commons.js' );     
		var driver   = config.driver;
		var elements = config.elements;
		var lastUser = Store.get( 'lastUser' );

		console.log( 'afterEachDes...'.red );
		allPassed = allPassed && this.currentTest.state === 'passed';
		
		if ( config.currentTest != 'passed' 
			&& config.loginTest != true 
		) {
			config.currentTest = 'notStarted';
			return driver
			.resetApp()
			.sleep( 3000 )
			.elementByNameIfExists( elements.formScreen.actions )
			.then( function ( isNodeEdit ) {

				if ( isNodeEdit ) {
					console.log( 'ON NODE EDIT SCREEN...'.red );
					config.nodeEdit = true;
					if ( commons.isIOS() ) {
						return driver
						.elementByName( elements.formScreen.back )
						.click()
						.sleep ( 1000 )
						.elementByNameIfExists( elements.alertButtons.exit )
						.then( function ( exitDialog ) {

							if ( exitDialog ) {
								return exitDialog
								.click()
								.sleep( 1000 );
							}
						} )

					} else if ( commons.isAndroid() ) { 
						return driver
						.back()
						.sleep( 1000 )
						.elementByNameIfExists( elements.alertButtons.exit )
						.then( function ( exitDialog ) {

							if ( exitDialog ) {
								return exitDialog
								.click()
								.sleep( 1000 );
							}
						} )
					}
				
				} else {
					console.log( 'App is not on a node edit screen.'.red );
					config.isNodeEdit = false;
				}
			} )
			.elementByNameIfExists( elements.jobsScreen.newJobsTab.newJobsHeader )
			.then( function ( isJobsScreen ) {

				if ( isJobsScreen 
					&& config.isNodeEdit != true 
					&&  lastUser.userRole != 'client' 
					&&  lastUser.userRole != 'AdminClient' 
				) {
					console.log( 'APP is on jobsScreen.'.red );
					config.isJobsScreen = false;
					if ( commons.isIOS() ) {
						return driver
						.elementByName( elements.jobsScreen.otherOptions.back )
						.click()
						.sleep ( 1000 );

					} else if ( commons.isAndroid() ) { 
						return driver
						.back()
						.sleep( 1000 );
					}
				
				} else {
					console.log( 'App is not on the jobsScreen.'.red );
					config.isJobsScreen = false;
				}
			} )
			.elementByNameIfExists( elements.loginScreen.clientAccount )
			.isDisplayed()
			.then ( function ( isLoginScreen ) {

				if ( isLoginScreen === true 
					&& config.isJobsScreen != true 
					&& config.loginTest != true 
				) {
					config.skip = true;
					assert.fail( 'App is on the loginScreen can not contiune the process.' );
				
				} else if ( isLoginScreen === true 
					       && config.isJobsScreen != true
					       && config.loginTest === true 
		       	) {
					config.skip = false;
					console.log( 'App will try and resume the test being a loginTest failed and app is on the loginScreen.'.red );
				
				} else {
					return driver
					.waitForElementByName( elements.homeScreen.syncAllowed, 180000 )
					.then( function () {

						console.log( 'App should be on homeScreen after a restart.'.green );
					} );
				}
			} );

		} else if ( config.loginTest === true 
					&& config.currentTest != 'passed' 
		) {
			console.log( 'Automation could not resert and comeplete due to a login failed test. '.red );
	
		} else if ( config.currentTest === 'passed' ) {
			console.log( 'Tested Passed will start next test...'.green );
		}
	}.bind( this ) );
};

Commons.prototype.afterEachIt = function () {
	
	afterEach( function () {
		config.currentTest = this.currentTest.state;
	} );
};

module.exports = new Commons();
