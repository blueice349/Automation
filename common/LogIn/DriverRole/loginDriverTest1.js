'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../../helpers/setup' );
	var alerts   = require( '../../../helpers/alerts' );
	var caps     = require( '../../../helpers/caps' );
	var config   = require( '../../../helpers/Config' );
	var commons  = require( '../../../helpers/Commons' );
	var elements = require( '../../../helpers/elements' );
	var login    = require( '../../../helpers/loginTable' );
	var Store    = require( '../../../helpers/Store' );
	var driver = config.driver;

	var truckOption;
	var clockInOption;
	var userRole;
	var userName;
	var name;
	var permissionGranted;
	var newJob;

	describe( 'Start login Process using "loginDriverTest1.js"'.green, function( done ) {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'Should store current loginTest.'.green, function() {
			
			Store.set( 'lastLogin', {
				'loginTest' : '../common/LogIn/DriverRole/loginDriverTest1.js'
		 	} );
		 	config.currentTest = 'passed';
		} );

		it( 'should check fields on loginScreen'.green, function() {
			
			console.log( 'Config.clockedIn 1 '.red + config.clockedIn );
			config.clockedIn = false;
			config.loginTest = true;
			return driver
			.waitForElementByName( elements.loginScreen.client_account, 180000 )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.loginScreen.user_name )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.loginScreen.password )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.loginScreen.login_button )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.loginScreen.accept_terms )
			.isDisplayed().should.eventually.be.true
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should set user information and enter client_account '.green, function () {
			console.log( 'Config.clockedIn 2 '.red + config.clockedIn );
			return driver
			.elementByName( elements.loginScreen.client_account )
			.then( function ( el ) { 

				if ( commons.isIOS() ){
					truckOption       = login.driverLogins.driver1.truckOption;
					clockInOption     = login.driverLogins.driver1.clockInOption;
					userRole          = login.driverLogins.driver1.userRole;
					userName          = login.driverLogins.driver1.username;
					name              = login.driverLogins.driver1.name;
					newJob            = login.driverLogins.driver1.newJob;
					return commons.sendKeys( el, login.driverLogins.driver1.client_account );

				} else if ( commons.isAndroid() ) {
					truckOption       = login.driverLogins.driver2.truckOption;
					clockInOption     = login.driverLogins.driver2.clockInOption;
					userRole          = login.driverLogins.driver2.userRole;
					userName          = login.driverLogins.driver2.username;
					name              = login.driverLogins.driver2.name;
					newJob            = login.driverLogins.driver2.newJob;
					return commons.sendKeys(el, login.driverLogins.driver2.client_account );
				}
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should enter username and password'.green, function () {

			return driver
			.elementByName( elements.loginScreen.user_name )
			.then( function ( el ) {

				if ( commons.isIOS() ) {
					return commons.sendKeys( el, login.driverLogins.driver1.username );

				} else if ( commons.isAndroid() ) {
					return commons.sendKeys( el, login.driverLogins.driver2.username );
				}
			} )
			.elementByName( elements.loginScreen.password )
			.then( function ( el ) {
				
				if ( commons.isIOS() ) {
					return commons.sendKeys( el, login.driverLogins.driver1.password );

				} else if ( commons.isAndroid() ) {
					return commons.sendKeys( el, login.driverLogins.driver2.password );
				}
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should check client_account and username'.green, function () {

			if ( commons.isIOS() ) {
				return driver
				.elementByName( elements.loginScreen.client_account )
				.text().should.eventually.become( login.driverLogins.driver1.client_account )
				.elementByName( elements.loginScreen.user_name )
				.text().should.eventually.become( login.driverLogins.driver1.username )
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( commons.isAndroid() ) {
				return driver
				.elementByName( elements.loginScreen.client_account )
				.text().should.eventually.become( login.driverLogins.driver2.client_account )
				.elementByName( elements.loginScreen.user_name )
				.text().should.eventually.become( login.driverLogins.driver2.username )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'should click accept_termsand login_button'.green, function () {

			return driver
			.elementByName( elements.loginScreen.accept_terms )
			.click()
			.elementByName( elements.loginScreen.login_button )
			.click()
			.sleep( 3000 )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should check for permissions'.green, function () {
		 	if ( commons.isIOS() && userRole != 'client' && userRole != 'AdminClient' ) {
			 	return driver
			 	.sleep( 4000 )
		   		.elementByNameIfExists( elements.alertButtons.ok )
		   		.then( function ( ok ) {

		   			if ( ok ) {
				   		return commons.alertText( alerts.loginAlerts.iosNotification )
		   				.elementByName( elements.alertButtons.ok )
		   				.click();
		   			}
		   		} )
		   		.elementByNameIfExists( elements.alertButtons.allow )
		   		.then( function ( allow ) {

					if ( allow ) {
		   				return commons.alertText( alerts.loginAlerts.iosGps )
						.elementByName( elements.alertButtons.allow )
						.click();
					}
				} )
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if( commons.isIOS() && ( userRole === 'client' ||  userRole === 'AdminClient' ) ) {
				return driver
		   		.elementByNameIfExists( elements.alertButtons.allow )
		   		.then( function ( allow ) {

					if ( allow ) {
		   				return commons.alertText( alerts.loginAlerts.iosGps )
						.elementByName( elements.alertButtons.allow )
						.click();
					}
				} )
				.elementByNameIfExists( elements.alertButtons.ok )
		   		.then( function ( ok ) {

		   			if ( ok ) {
				   		return commons.alertText( alerts.loginAlerts.iosNotification )
		   				.elementByName( elements.alertButtons.ok )
		   				.click();
		   			}
		   		} )
		   		.then( function () {

					config.currentTest = 'passed';
				} );
			 } else if ( commons.isAndroid6() ) {
				return driver
				.sleep( 4000 )
				.elementByNameIfExists( elements.alertButtons.allow )
				.then( function ( allow ) {

					if ( allow ) {
						return commons.alertText( alerts.loginAlerts.androidGps )
						.elementByName( elements.alertButtons.allow )
						.click();
					}
				} )
				.then( function () {

					config.currentTest = 'passed';
				} );
			 }
		} );		
		
		it( 'should wait for sync to Complete'.green, function () {
			
			if ( clockInOption === false && truckOption === true && userRole != 'client' && userRole != 'AdminClient' ) {
				console.log( 'Wait for Select Vehicle Options'.red );
				return driver
				.waitForElementByName( elements.companyVehicle.vehicle1, 180000 )
				.isDisplayed().should.eventually.be.true
				.then( function ( vehicle ) {

					if ( vehicle ) {
						config.currentTest = 'passed';
					} else {
						assert.fail( 'Did not find '.red + elements.companyVehicle.vehicle1 + ' before within 3 mins.'.red );
					}
				} );

			} else if ( clockInOption === true && userRole != 'client' && userRole != 'AdminClient' ) {
				console.log( 'Wait for Clockin Options'.red );
				return driver
				.waitForElementByName( elements.alertButtons.clockIn, 180000 )
				.isDisplayed().should.eventually.be.true
				.then( function ( clockIn ) {
					
					if( clockedIn ) {
						config.currentTest = 'passed';

					} else {
						assert.fail( 'Did not find '.red + elements.alertButtons.clockIn + ' before within 3 mins.'.red );
					}
				} );

			} else {
				console.log( 'Wait for syncAllowed'.red );
				return driver
				.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
				.isDisplayed().should.eventually.be.true
				.then( function ( syncAllowed ) {
					
					if( syncAllowed ) {
						config.currentTest = 'passed';

					} else {
						assert.fail( 'Did not find '.red + elements.mainMenuScreen.syncAllowed + ' before within 3 mins.'.red );
					}
				} );
			}
		} );
		
		it( 'should store current user information'.green, function () {

			Store.set( 'lastUser', {
				'truckOption'       : truckOption,
				'clockInOption'     : clockInOption,
				'userRole'          : userRole,
				'userName'          : userName,
				'name'              : name,
				'permissionGranted' : permissionGranted,
				'newJob'            : newJob
			} );
			config.currentTest = 'passed';
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'loginDriverTest1 test has Completed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};