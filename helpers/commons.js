'use strict';

require( 'colors' );
require( './setup' );
var assert = require( 'assert' );
var config = require( './Config' );
var Store  = require( './Store' );

var Commons = function () {

	//this is used for getting the os and version of the app that was set in desired caps
	this.os      = config.desired.platformName;
	this.version = config.desired.platformVersion;

	this.startAllTimer = 0;
	this.endAllTimer = 0;
};

var convertDate = function ( ms ) {

	//this is not used for anything that you will need! it is used for logging date/time and already set up
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

	//This just checks if you are using iOS if so we set the function to true
	if ( this.os == 'Android' ) {
		return true;
	} 

		return false;
};

Commons.prototype.isAndroid6 = function () {

	//This just checks if you are using android6 if so we set the function to true
	if ( this.os == 'Android'
	&&   this.version == '6.0' ) {
		return true;
	}
	
		return false;
};

Commons.prototype.isIOS = function () {

	//This just checks if you are using iOS if so we set the function to true
	if ( this.os == 'iOS' ) {
		return true;
	} 

		return false;
};

var whereAmI = function () {
	
	//this is used to find where the user is in the app in the event the app was reset on a failed test	
	require( 'colors' );
	var driver    = config.driver;
	var elements  = config.elements;
	var os        = config.desired.platformName;
	var isAndroid = Boolean( os == 'Android' );
	var isIOS     = Boolean( os == 'iOS' );

	return driver
	//.sleep( 3000 )
	//checks to see if users is on a node edit screen
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
			.elementByIdIfExists( elements.newHomeScreen.jobsSelected )
			.then( function ( jobsScreen ) {
				
				if ( jobsScreen ) {
					return driver
					.elementById( elements.newHomeScreen.dashBoardNotSelected )
					.click()
					.sleep( 1000 ) 
					.elementById( elements.newHomeScreen.dashBoardSelected )
					.isDisplayed().should.eventually.be.true 

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
	//this is used only if you need to get to an element using Xpath. most of the time you will use elementById()
	if ( this.isAndroid() ) {
		return '//*[ @text=\'' + text + '\' ]';

	} else {
		return '//*[ @name=\'' + text + '\' ]';
	}
};

Commons.prototype.sendKeys = function ( el, keys ) {
	
	var elements = config.elements;
	//this is used to sendKeys to andorid and iOS I created this custom function so that android we can hide the keyboard, sense the hideKeyboard does not work on iOs, 
	//also it ches for a button to make sure the keyboard is there before sending the keys to the app
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
	//this is used to add a number and . at the end of a element
	if ( !isNaN( num ) ) {
		value = value + num; 
	}

	value = value + '.';

	return value
};

Commons.prototype.androidPermsAlertText = function ( alertText ) {

	var driver   = config.driver;
	var elements = config.elements;
	//this is used to check for permissins on android no way to label android permissions in our Omadi app code.
	if ( this.isAndroid()
	||   this.isAndroid6() 
  	) {
		return driver.elementById( 'com.android.packageinstaller:id/' ).text().should.eventually.contain( alertText );
	}
};

Commons.prototype.alertText = function ( alertText ) {

	var driver   = config.driver;
	var elements = config.elements;
	//This is used to read alertText in the app for both android and iOS they ruse different paths to get the data, it just makes sure what you pass into it is what the alerts is

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
		//this is where the driver is creted before ANY test runs
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

			//This is to skip test if last test was not passed and it was a login test
			console.log( 'Next test was skipped do to login failed test or your app is not up-to-date with current source code.'.red );
			this.skip();

		} else if ( config.currentTest === 'passed' ) {
			//This is used for setting currentTest to notStarted if last test passed and the loginTest to false ( these get reset in the test it self )
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

			//This sets currentTest to testStarted before the test runs if last test was passed, notStarted, undefined or null
			config.currentTest = 'testStarted';

		} else if ( config.currentTest != 'passed'
			||      config.skip === true ) {
			console.log( 'Next test was skipped'.red );
			//This will skip the it test it is running if last test was != passed or skip -- true this ensures the next test desdribe test can run.
			this.skip();
		}
	} );
};

Commons.prototype.afterEachIt = function () {

	afterEach( function () {

		config.beforeItEndTime = new Date().getTime();

		var afterEachItTime = convertDate( ( config.beforeItEndTime - config.beforeItStartTime ) );
		console.log( 'afterEachIt... '.red + JSON.stringify( afterEachItTime ) );
		//This only sets currentTest to the currentTest state ( passed if passed failed if falile etc.... )
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

			//This runes after each describe if the test failed it will restart the app and run a whereAmI function which will find out where user is in the app and get them to a good state for the next test to run
			config.currentTest = 'notStarted';
			return driver
			.resetApp()
			.then( function () {

				return whereAmI();
			} );

		} else if ( config.loginTest === true 
			&&      config.currentTest != 'passed' ) {
			//If login test failed then NO OTHER test will run and will print out a console letting user know why NO OTHER test was able to run
			
			console.log( 'Automation could not resert and comeplete due to a login failed test. '.red );
	
		} else if ( config.currentTest === 'passed' ) {
			//this just prints out console that last test passed and will start the next test
			console.log( 'Last test "passed" will start next test...'.green );
		}
	} );
};

Commons.prototype.afterAll = function () {
	
	after( function () {

		//this runs after ALL test have run to quit or close the driver, driver is what is created by appium to run the test
		config.beforeAllEndTime = new Date().getTime();
		var afterAllTime = convertDate( ( config.beforeAllEndTime - config.beforeAllStartTime ) );

		console.log( 'AFTER ALL.... '.red + JSON.stringify( afterAllTime ) );
		var driver   = config.driver;
		var elements = config.elements;
		return driver.quit();
	} );
};

module.exports = new Commons();