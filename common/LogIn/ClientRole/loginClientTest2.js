'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../../helpers/setup' );
	var alerts   = require( '../../../helpers/alerts' );
	var apps     = require( '../../../helpers/apps' );
	var caps     = require( '../../../helpers/caps' );
	var config   = require( '../../../helpers/Config' );
	var commons  = require( '../../../helpers/Commons' );
	var elements = require( '../../../helpers/elements' );
	var login    = require( '../../../helpers/loginTable' );
	var Store    = require( '../../../helpers/Store' );
	var driver = config.driver;

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

	describe( 'Start login Process using "loginClientTest2.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'should set user information and enter clientAccount '.green, function () {

			return driver
			.elementByName( elements.loginScreen.clientAccount )
			.then( function ( el ) { 

				if ( commons.isIOS() ){
					clientAccount     = login.clientLogins.client3.clientAccount;
					truckOption       = login.clientLogins.client3.truckOption;
					clockInOption     = login.clientLogins.client3.clockInOption;
					userRole          = login.clientLogins.client3.userRole;
					userName          = login.clientLogins.client3.username;
					password          = login.clientLogins.client3.password;
					name              = login.clientLogins.client3.name;
					performJob        = login.clientLogins.client3.performJob;
					tagButton         = login.clientLogins.client3.tagButton;
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
					clientAccount     = login.clientLogins.client4.clientAccount;
					truckOption       = login.clientLogins.client4.truckOption;
					clockInOption     = login.clientLogins.client4.clockInOption;
					userRole          = login.clientLogins.client4.userRole;
					userName          = login.clientLogins.client4.username;
					password          = login.clientLogins.client1.password;
					name              = login.clientLogins.client4.name;
					performJob        = login.clientLogins.client4.performJob;
					tagButton         = login.clientLogins.client4.tagButton;
					return el.text()
					.then( function ( text ) {

						if ( text === login.clientAccount ) {
							console.log( 'clientAccount is already set.'.red );
							return;
						
						} else {
							return commons.sendKeys( el, clientAccount ); 
						}
					} )
				}
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
		} );

		it( 'should enter username and password'.green, function () {

			return driver
			.elementByName( elements.loginScreen.userName )
			.then( function ( el ) {

				return el.text()
				.then( function ( text ) {

					if ( text === userName ) {
						console.log( 'userName is already set.'.red );
						return;
					} else {
						return commons.sendKeys( el, userName );
					}
				} )
			} )
			.elementByName( elements.loginScreen.password )
			.then( function ( el ) {
				
				return commons.sendKeys( el, password );
			} );
		} );

		it( 'Should check clientAccount and username'.green, function () {

			return driver
			.elementByName( elements.loginScreen.clientAccount )
			.text().should.eventually.become( clientAccount )
			.elementByName( elements.loginScreen.userName )
			.text().should.eventually.become( userName )
		} );

		it( 'should click acceptTerms and loginButton'.green, function () {

			config.loginTest = true;
			return driver
			.elementByName( elements.loginScreen.acceptTerms )
			.click()
			.elementByName( elements.loginScreen.loginButton )
			.click()
			.sleep( 3000 )
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

			} else if ( commons.isAndroid()
				|| commons.isAndroid6() ) {
				console.log( 'Client or CRM user on a Android 6.0.x device'.green );
				return driver
				.sleep( 4000 )
				.elementByIdIfExists( elements.alertButtons.androidAllow )
				.then( function ( androidAllow ) {

					if ( androidAllow ) {
						return commons.androidPermsAlertText( alerts.loginLogoutAlerts.androidGps )
						.elementById( elements.alertButtons.androidAllow )
						.click();
					}
				} );
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

			} else if ( clockInOption === true && truckOption === false && config.isClockedin != true || clockInOption === true && truckOption === true && config.isClockedin != true ) {
				console.log( 'User has clockin options, will wait for Clockin Options'.red );
				return driver
				.waitForElementByName( elements.alertButtons.clockIn, 120000 )
				.isDisplayed().should.eventually.be.true

			} else if ( clockInOption === true && truckOption === false && config.isClockedin === true ) {
				console.log( 'User is clockedin Already, will wait for syncAllowed'.red );
				return driver
				.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true

			} else if ( clockInOption === true && truckOption === true && config.isClockedin === true ) {
				console.log( 'User is clockedin and has truck options, will wait for Select Vehicle Options'.red );
				return driver
				.waitForElementByName( elements.companyVehicle.vehicle1, 120000 )
				.isDisplayed().should.eventually.be.true

			} else if( clockInOption === false && truckOption === false ) {
				console.log( 'User has no truck or clock in options, will wait for syncAllowed'.red );
				return driver
				.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true
			}
		} );
		
		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			config.loginTest = true;	
			console.log( 'loginDriverTest1 test has Completed....'.green );
			done();
		} );
	} );
};