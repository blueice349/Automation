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

	describe( 'Start login Process using "loginAdminTest2.js"'.green, function( done ) {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'should check fields on loginScreen'.green, function() {

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

			return driver
			.elementByName( elements.loginScreen.client_account )
			.then( function ( el ) { 

				if ( commons.isIOS() ){
					truckOption       = login.adminLogins.admin3.truckOption;
					clockInOption     = login.adminLogins.admin3.clockInOption;
					userRole          = login.adminLogins.admin3.userRole;
					userName          = login.adminLogins.admin3.username;
					name              = login.adminLogins.admin3.name;
					newJob            = login.adminLogins.admin3.newJob;
					return commons.sendKeys( el, login.adminLogins.admin3.client_account );

				} else if ( commons.isAndroid() ) {
					truckOption       = login.adminLogins.admin4.truckOption;
					clockInOption     = login.adminLogins.admin4.clockInOption;
					userRole          = login.adminLogins.admin4.userRole;
					userName          = login.adminLogins.admin4.username;
					name              = login.adminLogins.admin4.name;
					newJob            = login.adminLogins.admin4.newJob;
					return commons.sendKeys(el, login.adminLogins.admin4.client_account );
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
					return commons.sendKeys( el, login.adminLogins.admin3.username );

				} else if ( commons.isAndroid() ) {
					return commons.sendKeys( el, login.adminLogins.admin4.username );
				}
			} )
			.elementByName( elements.loginScreen.password )
			.then( function ( el ) {
				
				if ( commons.isIOS() ) {
					return commons.sendKeys( el, login.adminLogins.admin3.password );

				} else if ( commons.isAndroid() ) {
					return commons.sendKeys( el, login.adminLogins.admin4.password );
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
				.text().should.eventually.become( login.adminLogins.admin3.client_account )
				.elementByName( elements.loginScreen.user_name )
				.text().should.eventually.become( login.adminLogins.admin3.username )
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( commons.isAndroid() ) {
				return driver
				.elementByName( elements.loginScreen.client_account )
				.text().should.eventually.become( login.adminLogins.admin4.client_account )
				.elementByName( elements.loginScreen.user_name )
				.text().should.eventually.become( login.adminLogins.admin4.username )
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
			console.log( 'User role 1 '.red + userRole );
		 	if ( commons.isIOS() && userRole != 'client' && userRole != 'AdminClient' ) {
			 	console.log( 'User role 2 '.red + userRole );
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
				console.log( 'User role 3 '.red + userRole );
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
			
			if ( clockInOption === false && truckOption === true ) {
				console.log( 'User does not have clock in options, but has truck options, will wait for Select Vehicle Options'.red );
				return driver
				.waitForElementByName( elements.companyVehicle.vehicle1, 180000 )
				.isDisplayed().should.eventually.be.true
				.then( function ( vehicle ) {

					config.currentTest = 'passed';
				} );

			} else if ( clockInOption === true ) {
				console.log( 'User has clockin options, will wait for Clockin Options'.red );
				return driver
				.waitForElementByName( elements.alertButtons.clockIn, 180000 )
				.isDisplayed().should.eventually.be.true
				.then( function ( clockIn ) {

					config.currentTest = 'passed';
				} );

			} else if( clockInOption === false && truckOption === false ) {
				console.log( 'User has no truck or clock in options, will wait for syncAllowed'.red );
				return driver
				.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
				.isDisplayed().should.eventually.be.true
				.then( function ( syncAllowed ) {

					config.currentTest = 'passed';
				} );
			}
		} );;
		
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
			
			console.log( 'loginAdminTest2 test has Completed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};