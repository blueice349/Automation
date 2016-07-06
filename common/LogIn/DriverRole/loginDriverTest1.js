'use strict';

module.exports = function () {
	
	require( 'colors' );
	require( '../../../helpers/setup' );
	var apps     = require( '../../../helpers/apps' );
	var alerts   = require( '../../../helpers/alerts' );
	var caps     = require( '../../../helpers/caps' );
	var config   = require( '../../../helpers/Config' );
	var commons  = require( '../../../helpers/Commons' );
	var elements = require( '../../../helpers/elements' );
	var login    = require( '../../../helpers/loginTable' );
	var Store    = require( '../../../helpers/Store' );
	var driver   = config.driver;

	var clientAccount;
	var truckOption;
	var clockInOption;
	var userRole;
	var userName;
	var password;
	var name;
	var permissionGranted;
	var performJob;
	var tagButton;

	describe( 'Start login Process using "loginDriverTest1.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'Should store current loginTest.'.green, function() {
			
			Store.set( 'lastLogin', {
				'loginTest' : '../common/LogIn/DriverRole/loginDriverTest1.js'
		 	} );
		 	config.currentTest = 'passed';
		} );

		it( 'should set user information and enter clientAccount '.green, function () {

			config.loginTest = true;
			return driver
			.elementByName( elements.loginScreen.clientAccount )
			.then( function ( el ) { 
				
				if ( commons.isIOS() ){
					clientAccount     = login.driverLogins.driver1.clientAccount;
					truckOption       = login.driverLogins.driver1.truckOption;
					clockInOption     = login.driverLogins.driver1.clockInOption;
					userRole          = login.driverLogins.driver1.userRole;
					userName          = login.driverLogins.driver1.username;
					password          = login.driverLogins.driver1.password;
					name              = login.driverLogins.driver1.name;
					performJob        = login.driverLogins.driver1.performJob;
					tagButton         = login.driverLogins.driver1.tagButton;
					return el.text()
					.then( function ( text ) {

						if ( text === clientAccount ) {
							console.log( 'clientAccount is already set.'.red );
							return;
						} else {
							return commons.sendKeys( el, clientAccount );
						}
					} )

				} else if ( commons.isAndroid() ) {
					clientAccount     = login.driverLogins.driver2.clientAccount;
					truckOption       = login.driverLogins.driver2.truckOption;
					clockInOption     = login.driverLogins.driver2.clockInOption;
					userRole          = login.driverLogins.driver2.userRole;
					userName          = login.driverLogins.driver2.username;
					password          = login.driverLogins.driver2.password;
					name              = login.driverLogins.driver2.name;
					performJob        = login.driverLogins.driver2.performJob;
					tagButton         = login.driverLogins.driver2.tagButton;
					return el.text()
					.then( function ( text ) {

						if ( text === clientAccount ) {
							console.log( 'clientAccount is already set.'.red );
							return;
						} else {
							return commons.sendKeys( el, clientAccount );
						}
					} )
				}
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should store current user information'.green, function () {

			config.loginTest = true;
			Store.set( 'lastUser', {
				'clientAccount'     : clientAccount,
				'truckOption'       : truckOption,
				'clockInOption'     : clockInOption,
				'userRole'          : userRole,
				'userName'          : userName,
				'password'          : password,
				'name'              : name,
				'permissionGranted' : permissionGranted,
				'performJob'        : performJob,
				'tagButton'         : tagButton
			} );
			config.currentTest = 'passed';
		} );

		it( 'should enter username'.green, function () {

			config.loginTest = true;
			return driver
			.elementByName( elements.loginScreen.userName )
			.then( function ( el ) {

				return el.text()
				.then( function ( text ) {

					if ( text === userName ) {
						console.log( 'username is already set.'.red );
						return;
					
					} else {
						return commons.sendKeys( el, userName );
					}
				} )
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should enter password'.green, function () {

			config.loginTest = true;
			return driver
			.elementByName( elements.loginScreen.password )
			.then( function ( el ) {
				
				return commons.sendKeys( el, password );
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should check clientAccount and username'.green, function () {

			config.loginTest = true;
			return driver
			.elementByName( elements.loginScreen.clientAccount )
			.text().should.eventually.become( clientAccount )
			.elementByName( elements.loginScreen.userName )
			.text().should.eventually.become( userName )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should click acceptTerms and loginButton'.green, function () {

			config.loginTest = true;
			return driver
			.elementByName( elements.loginScreen.acceptTerms )
			.click()
			.elementByName( elements.loginScreen.loginButton )
			.click()
			.sleep( 3000 )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should check for permissions'.green, function () {
		 	
		 	config.loginTest = true;
		 	if ( commons.isIOS() && userRole != 'client' && userRole != 'AdminClient' ) {
		 		console.log( 'CRM user on a iOS device'.green );
			 	return driver
			 	.sleep( 4000 )
		   		.elementByNameIfExists( elements.alertButtons.ok )
		   		.then( function ( ok ) {

		   			if ( ok ) {
				   		return commons.alertText( alerts.loginLogoutAlerts.iosNotification )
		   				.elementByName( elements.alertButtons.ok )
		   				.click();
		   			}
		   		} )
		   		.elementByNameIfExists( elements.alertButtons.allow )
		   		.then( function ( allow ) {

					if ( allow ) {
		   				return commons.alertText( alerts.loginLogoutAlerts.iosGps )
						.elementByName( elements.alertButtons.allow )
						.click();
					}
				} )
				.then( function () {
					
					console.log( 'Permissions completed'.green );
					config.currentTest = 'passed';
				} );

			} else if( commons.isIOS() && userRole != 'driver' && userRole != 'admin' ) {
				console.log( 'Client user on a iOS device'.green );
				return driver
		   		.elementByNameIfExists( elements.alertButtons.allow )
		   		.then( function ( allow ) {

					if ( allow ) {
		   				return commons.alertText( alerts.loginLogoutAlerts.iosGps )
						.elementByName( elements.alertButtons.allow )
						.click();
					}
				} )
				.elementByNameIfExists( elements.alertButtons.ok )
		   		.then( function ( ok ) {

		   			if ( ok ) {
				   		return commons.alertText( alerts.loginLogoutAlerts.iosNotification )
		   				.elementByName( elements.alertButtons.ok )
		   				.click();
		   			}
		   		} )
		   		.then( function () {

					console.log( 'Permissions completed'.green );
					config.currentTest = 'passed';
				} );

			 } else if ( commons.isAndroid6() ) {
				console.log( 'Client or CRM user on a Android 6.0.x device'.green );
				return driver
				.sleep( 4000 )
				.elementByNameIfExists( elements.alertButtons.allow )
				.then( function ( allow ) {

					if ( allow ) {
						return commons.alertText( alerts.loginLogoutAlerts.androidGps )
						.elementByName( elements.alertButtons.allow )
						.click();
					}
				} )
				.then( function () {

					console.log( 'Permissions completed'.green );
					config.currentTest = 'passed';
				} );

			 } else if ( commons.isAndroid() ) {
			 	console.log( 'User on a Android that does not request permissons'.green );
			 	config.currentTest = 'passed';
			 }
		} );
		
		it( 'should wait for sync to Complete'.green, function () {

			config.loginTest = true;
			console.log( 'Clockin Status: '.red + config.isClockedin );
			console.log( 'Before should wait for sync to Complete'.green );
			if ( clockInOption === false && truckOption === true ) {
				console.log( 'User does not have clock in options, but has truck options, will wait for Select Vehicle Options'.red );
				return driver
				.waitForElementByName( elements.companyVehicle.vehicle1, 120000 )
				.isDisplayed().should.eventually.be.true
				.then( function ( vehicle ) {

					config.currentTest = 'passed';
				} );

			} else if ( clockInOption === true && truckOption === false && config.isClockedin != true || clockInOption === true && truckOption === true && config.isClockedin != true ) {
				console.log( 'User has clockin options, will wait for Clockin Options'.red );
				return driver
				.waitForElementByName( elements.alertButtons.clockIn, 120000 )
				.isDisplayed().should.eventually.be.true
				.then( function ( clockIn ) {

					config.currentTest = 'passed';
				} );

			} else if ( clockInOption === true && truckOption === false && config.isClockedin === true ) {
				console.log( 'User is clockedin Already, will wait for syncAllowed'.red );
				return driver
				.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true
				.then( function ( syncAllowed ) {

					config.currentTest = 'passed';
				} );

			} else if ( clockInOption === true && truckOption === true && config.isClockedin === true ) {
				console.log( 'User is clockedin and has truck options, will wait for Select Vehicle Options'.red );
				return driver
				.waitForElementByName( elements.companyVehicle.vehicle1, 120000 )
				.isDisplayed().should.eventually.be.true
				.then( function ( vehicle ) {

					config.currentTest = 'passed';
				} );

			} else if( clockInOption === false && truckOption === false ) {
				console.log( 'User has no truck or clock in options, will wait for syncAllowed'.red );
				return driver
				.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true
				.then( function ( syncAllowed ) {

					config.currentTest = 'passed';
				} );
			}
		} );
		
		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			config.loginTest = true;	
			console.log( 'loginDriverTest1 test has Completed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};