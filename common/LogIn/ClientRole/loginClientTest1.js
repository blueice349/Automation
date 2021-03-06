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

	var appVersion;
	var truckOption;
	var clockInOption;
	var userRole;
	var userName;
	var name;
	var permissionGranted;
	var performJob;
	var tagButton;

	describe( 'Start login Process using "loginClientTest1.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'should check fields on loginScreen'.green, function() {

			config.loginTest = true;
			return driver
			.waitForElementByName( elements.loginScreen.clientAccount, 120000 )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.loginScreen.userName )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.loginScreen.password )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.loginScreen.loginButton )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.loginScreen.acceptTerms )
			.isDisplayed().should.eventually.be.true
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should set user information and enter clientAccount '.green, function () {

			return driver
			.elementByName( elements.loginScreen.clientAccount )
			.then( function ( el ) { 

				if ( commons.isIOS() ){
					appVersion        = login.clientLogins.client1.appVersion;
					truckOption       = login.clientLogins.client1.truckOption;
					clockInOption     = login.clientLogins.client1.clockInOption;
					userRole          = login.clientLogins.client1.userRole;
					userName          = login.clientLogins.client1.username;
					name              = login.clientLogins.client1.name;
					performJob        = login.clientLogins.client1.performJob;
					tagButton         = login.clientLogins.client1.tagButton;
					return el.text()
					.then( function ( text ) {
						
						if ( text === login.clientLogins.client1.clientAccount ) {
							console.log( 'clientAccount is already set.'.red );
							return;
						} else {
							return commons.sendKeys( el, login.clientLogins.client1.clientAccount ); 
						}
					} )

				} else if ( commons.isAndroid() ) {
					appVersion        = login.clientLogins.client2.appVersion;
					truckOption       = login.clientLogins.client2.truckOption;
					clockInOption     = login.clientLogins.client2.clockInOption;
					userRole          = login.clientLogins.client2.userRole;
					userName          = login.clientLogins.client2.username;
					name              = login.clientLogins.client2.name;
					performJob        = login.clientLogins.client2.performJob;
					tagButton         = login.clientLogins.client2.tagButton;
					return el.text()
					.then( function ( text ) {

						if ( text === login.clientLogins.client2.clientAccount ) {
							console.log( 'clientAccount is already set.'.red );
							return;
						} else {
							return commons.sendKeys( el, login.clientLogins.client2.clientAccount ); 
						}
					} )
				}
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should check appVersion on loginScreen.'.green, function () {
			
			return driver
			.elementByName( elements.loginScreen.appVersion )
			.text().should.eventually.become( appVersion )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should enter username and password'.green, function () {

			return driver
			.elementByName( elements.loginScreen.userName )
			.then( function ( el ) {

				if ( commons.isIOS() ) {
					return el.text()
					.then( function ( text ) {
						if ( text === login.clientLogins.client1.username ) {
							console.log( 'userName is already set.'.red );
							return;
						} else {
							return commons.sendKeys( el, login.clientLogins.client1.username );
						}
					} )

				} else if ( commons.isAndroid() ) {
					return el.text()
					.then( function ( text ) {
						if ( text === login.clientLogins.client2.username ) {
							console.log( 'userName is already set.'.red );
							return;
						} else {
							return commons.sendKeys( el, login.clientLogins.client2.username );
						}
					} )
				}
			} )
			.elementByName( elements.loginScreen.password )
			.then( function ( el ) {
				
				if ( commons.isIOS() ) {
					return commons.sendKeys( el, login.clientLogins.client1.password );

				} else if ( commons.isAndroid() ) {
					return commons.sendKeys( el, login.clientLogins.client2.password );
				}
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should check clientAccount and username'.green, function () {

			if ( commons.isIOS() ) {
				return driver
				.elementByName( elements.loginScreen.clientAccount )
				.text().should.eventually.become( login.clientLogins.client1.clientAccount )
				.elementByName( elements.loginScreen.userName )
				.text().should.eventually.become( login.clientLogins.client1.username )
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( commons.isAndroid() ) {
				return driver
				.elementByName( elements.loginScreen.clientAccount )
				.text().should.eventually.become( login.clientLogins.client2.clientAccount )
				.elementByName( elements.loginScreen.userName )
				.text().should.eventually.become( login.clientLogins.client2.username )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
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

		it( 'should store current user information'.green, function () {

			config.loginTest = true;
			Store.set( 'lastUser', {
				'appVersion'        : appVersion,
				'truckOption'       : truckOption,
				'clockInOption'     : clockInOption,
				'userRole'          : userRole,
				'userName'          : userName,
				'name'              : name,
				'permissionGranted' : permissionGranted,
				'performJob'        : performJob,
				'tagButton'         : tagButton
			} );
			config.currentTest = 'passed';
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

			} else if( commons.isIOS() && ( userRole === 'client' ||  userRole === 'AdminClient' ) ) {
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