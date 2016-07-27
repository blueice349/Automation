'use strict';

require( 'colors' );
require( './setup' );
var assert = require( 'assert' );
var config = require( './Config' );
var Store  = require( './Store' );

var Commons = function () {

	this.os      = config.desired.platformName;
	this.version = config.desired.platformVersion;

	this.startAllTimer = 0;
	this.endAllTimer = 0;
};

var convertDate = function ( ms ) {

   var total = ms;

   var hours = Math.floor( total / 3600000 );
   total = total - ( hours * 3600000 );

   var minutes = Math.floor( total / 60000 );
   total = total - ( minutes * 60000 );

   var seconds = Math.floor( total / 1000 );
   total = total - ( seconds * 1000 );

   return { hours: hours, minutes: minutes, seconds: seconds, ms: total };
};

Commons.prototype.isAndroid = function () {

	if ( this.os == 'Android' ) {
		return true;
	} 

		return false;
};

Commons.prototype.isAndroid6 = function () {

	if ( this.os == 'Android'
	&&   this.version == '6.0' ) {
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

var whereAmI = function () {
		
	require( 'colors' );
	var driver    = config.driver;
	var elements  = config.elements;
	var os        = config.desired.platformName;
	var isAndroid = Boolean( os == 'Android' );
	var isIOS     = Boolean( os == 'iOS' );

	return driver
	//.sleep( 3000 )
	.elementByIdIfExists( elements.formScreen.actions )
	.then( function ( isNodeEdit ) {

		if ( isNodeEdit && isIOS ) {
			console.log( 'isIOS && isNodeEdit'.red );
			return driver
			.elementById( elements.formScreen.back )
			.click()
			.sleep ( 1000 );

		} else if ( isNodeEdit && isAndroid ) {
			console.log( 'isNodeEdit && isAndroid'.red );
			return driver
			.back()
			.sleep( 1000 );

		} else {
			console.log( 'App is not on a node edit screen.'.red );
			return driver
			.elementByIdIfExists( elements.jobsScreen.newJobsTab.newJobsHeader )
			.then( function ( jobsScreen ) {
				
				if ( jobsScreen ) {
					if ( isIOS ) {
						return driver
						.elementById( elements.jobsScreen.back )
						.click()
						.sleep ( 1000 );

					} else if ( isAndroid ) { 
						return driver
						.back()
						.sleep( 1000 );
					}

				} else {
					console.log( 'App is not on the jobsScreen.'.red );
					return driver
					.elementByIdIfExists( elements.loginScreen.loginButton )
					.isDisplayed()
					.then ( function ( isLoginScreen ) {

						if ( isLoginScreen ) {
							assert.fail( 'App is on the loginScreen can not contiune the process.'.red );

						} else {
							return driver
							.waitForElementById( elements.homeScreen.syncAllowed, 120000 )
							.then( function ( syncAllowed ) {
						
								if ( syncAllowed ) {
									console.log( 'App should be on homeScreen after a restart.'.green );
									return driver;
								}
							} );
						}
					} );
				}
			} )
		}
	} );
};

Commons.prototype.textToXPath = function ( text ) {

	var driver = config.driver;

	if ( this.isAndroid() ) {
		return '//*[ @text=\'' + text + '\' ]';

	} else {
		return '//*[ @name=\'' + text + '\' ]';
	}
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
		config.driver.elementById( 'space' ).isDisplayed().should.eventually.be.true
		return el
		.clear()
		.sendKeys( keys )
		.elementByIdIfExists( elements.alertButtons.done )
		.then( function ( keyboardDone ) {
			if ( keyboardDone 
			&&   config.loginTest != true 
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

Commons.prototype.androidPermsAlertText = function ( alertText ) {

	var driver   = config.driver;
	var elements = config.elements;

	if ( this.isAndroid()
	||   this.isAndroid6() 
  	) {
		return driver.elementById( 'com.android.packageinstaller:id/' ).text().should.eventually.contain( alertText );
	}
};

Commons.prototype.alertText = function ( alertText ) {

	var driver   = config.driver;
	var elements = config.elements;

	if ( this.isIOS() ) {
		return driver.alertText().should.eventually.contain( alertText );

	} else if ( this.isAndroid()
		||      this.isAndroid6() ) {
  		return driver
  		.elementById( 'com.omadi.crm:id/alertTitle' )
  		.text()
		.then( function ( el ) {

			if ( el === 'Alert'
			||   el === '' ) {
				return driver.elementById( 'android:id/message' ).text().should.eventually.contain( alertText );
			
			} else {
				return driver.elementById( 'com.omadi.crm:id/alertTitle' ).text().should.eventually.contain( alertText );
			}
		} )
	}
};

Commons.prototype.beforeAll = function () {

	// Runs before All my test start

	before( function () {

		config.beforeAllStartTime = new Date().getTime();
		
		var elements              = config.elements;
		var driver                = config.driver;
		var desired               = config.desired;
		var beforeAllTime         = convertDate( ( config.beforeAllEndTime - config.beforeAllStartTime ) );
		config.loginTest          = false;
		config.currentTest        = 'notStarted';
		
		console.log( 'beforeEachIt... ' + JSON.stringify( beforeAllTime ) );
		return driver.init( desired );
	} );
};

Commons.prototype.beforeEachDes = function ( ) {

	before( function () {

		config.beforeEachDesStartTime = new Date().getTime();

		var beforeEachDesTime = convertDate( ( config.beforeEachDesStartTime - config.beforeAllStartTime ) );
		console.log( 'beforeEachDes... '.red + JSON.stringify( beforeEachDesTime ) );
		if ( config.currentTest != 'passed' 
		&&   config.loginTest === true 
		||   config.skip === true ) {

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

		config.beforeItStartTime = new Date().getTime();

		var beforeEachItTime = convertDate( ( config.beforeItStartTime - config.beforeEachDesStartTime ) );
		console.log( 'beforeEachIt... '.red + JSON.stringify( beforeEachItTime ) );
		if ( config.currentTest === 'passed'
		||   config.currentTest === 'notStarted'
		||   config.currentTest === undefined
		||   config.currentTest === null ) {
			
			config.currentTest = 'testStarted';

		} else if ( config.currentTest != 'passed'
			||      config.skip === true ) {
			console.log( 'Next test was skipped'.red );
			this.skip();
		}
	} );
};

Commons.prototype.afterEachIt = function () {

	afterEach( function () {

		config.beforeItEndTime = new Date().getTime();

		var afterEachItTime = convertDate( ( config.beforeItEndTime - config.beforeItStartTime ) );
		console.log( 'afterEachIt... '.red + JSON.stringify( afterEachItTime ) );
		config.currentTest = this.currentTest.state;
	} );
};

Commons.prototype.afterEachDes = function () {

	after( function () {

		config.beforeEachDesEndTime = new Date().getTime();

		var allPassed;
		var assert           = require( 'assert' );
		var commons          = require( './Commons.js' );     
		var driver           = config.driver;
		var elements         = config.elements;
		var lastUser         = Store.get( 'lastUser' );
		var afterEachDesTime = convertDate( ( config.beforeEachDesEndTime - config.beforeEachDesStartTime ) );

		console.log( 'afterEachDes... '.red + JSON.stringify( afterEachDesTime ) );
		//allPassed = allPassed && this.currentTest.state === 'passed';
		
		if ( config.currentTest != 'passed' 
		&&   config.loginTest != true ) {

			config.currentTest = 'notStarted';
			return driver
			.resetApp()
			.then( function () {

				return whereAmI();
			} );

		} else if ( config.loginTest === true 
			&&      config.currentTest != 'passed' ) {
			
			console.log( 'Automation could not resert and comeplete due to a login failed test. '.red );
	
		} else if ( config.currentTest === 'passed' ) {
			console.log( 'Last test "passed" will start next test...'.green );
		}
	} );
};

Commons.prototype.afterAll = function () {
	
	after( function () {

		config.beforeAllEndTime = new Date().getTime();
		var afterAllTime = convertDate( ( config.beforeAllEndTime - config.beforeAllStartTime ) );

		console.log( 'AFTER ALL.... '.red + JSON.stringify( afterAllTime ) );
		var driver   = config.driver;
		var elements = config.elements;
		return driver.quit();
	} );
};

module.exports = new Commons();