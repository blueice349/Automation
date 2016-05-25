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

	describe( 'Start login Process using "loginClientTest1.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'should check fields on loginScreen'.green, function() {

			config.loginTest = true;
			return driver
			.waitForElementByName( elements.loginScreen.client_account, 120000 )
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

			return driver
			.elementByName( elements.loginScreen.client_account )
			.then( function ( el ) { 

				if ( commons.isIOS() ){
					truckOption       = login.clientLogins.client1.truckOption;
					clockInOption     = login.clientLogins.client1.clockInOption;
					userRole          = login.clientLogins.client1.userRole;
					userName          = login.clientLogins.client1.username;
					name              = login.clientLogins.client1.name;
					newJob            = login.clientLogins.client1.newJob;
					return commons.sendKeys( el, login.clientLogins.client1.client_account );

				} else if ( commons.isAndroid() ) {
					truckOption       = login.clientLogins.client2.truckOption;
					clockInOption     = login.clientLogins.client2.clockInOption;
					userRole          = login.clientLogins.client2.userRole;
					userName          = login.clientLogins.client2.username;
					name              = login.clientLogins.client2.name;
					newJob            = login.clientLogins.client2.newJob;
					return commons.sendKeys(el, login.clientLogins.client2.client_account );
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
					return commons.sendKeys( el, login.clientLogins.client1.username );

				} else if ( commons.isAndroid() ) {
					return commons.sendKeys( el, login.clientLogins.client2.username );
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

		it( 'Should check client_account and username'.green, function () {

			if ( commons.isIOS() ) {
				return driver
				.elementByName( elements.loginScreen.client_account )
				.text().should.eventually.become( login.clientLogins.client1.client_account )
				.elementByName( elements.loginScreen.user_name )
				.text().should.eventually.become( login.clientLogins.client1.username )
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( commons.isAndroid() ) {
				return driver
				.elementByName( elements.loginScreen.client_account )
				.text().should.eventually.become( login.clientLogins.client2.client_account )
				.elementByName( elements.loginScreen.user_name )
				.text().should.eventually.become( login.clientLogins.client2.username )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'should click accept_terms and login_button'.green, function () {

			config.loginTest = true;
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

		it( 'should store current user information'.green, function () {

			config.loginTest = true;
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