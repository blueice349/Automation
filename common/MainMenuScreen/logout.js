'use strict';

require( 'colors' );
require( '../../helpers/setup' );
var alerts   = require( '../../helpers/alerts' );
var assert   = require( 'assert' );
var config   = require( '../../helpers/Config' );
var elements = require( '../../helpers/elements' );
var commons  = require( '../../helpers/Commons' );
var Store    = require( '../../helpers/Store' );
var driver   = config.driver;


describe( 'Start logout Process'.green, function( ) {

	commons.beforeEachDes();
	commons.beforeEachIt();
	commons.afterEachDes();

	it( 'should wait for syncAllowed', function () {

		config.loginoutTest = true;
		return driver
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 40000 )
		.then( function () {
			
			config.currentTest = 'passed';
		} );
	} );

	it( 'Should make sure all buttons are visble after syncAllowed'.green, function () {

		//Checks for buttons to be displayed on main menu after log on.
		if ( Store.get( 'lastUser' ).userRole == 'admin' || Store.get( 'lastUser' ).userRole == 'driver' ) {
			return driver
			.elementByName( Store.get( 'lastUser' ).name )
			.text().should.eventually.become( Store.get( 'lastUser' ).name )
			.elementByName( elements.mainMenuScreen.actions )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.mainMenuScreen.logout )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.mainMenuScreen.alerts )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.mainMenuScreen.expiredTags )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.mainMenuScreen.jobs )
			.isDisplayed().should.eventually.be.true
			.then( function () {

				config.currentTest = 'passed';
			} );

		} else if ( Store.get( 'lastUser' ).userRole == 'client' || Store.get( 'lastUser' ).userRole == 'AdminClient' ) {
			return driver
			.elementByName(  Store.get( 'lastUser' ).name )
			.text().should.become(  Store.get( 'lastUser' ).name )
			.elementByName( elements.mainMenuScreen.actions )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.mainMenuScreen.logout )
			.isDisplayed().should.eventually.be.true
			.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.mainMenuScreen.alerts )
			.isDisplayed().should.eventually.be.false
			.elementByName( elements.mainMenuScreen.expiredTags )
			.isDisplayed().should.eventually.be.false
			.elementByName( elements.mainMenuScreen.jobs )
			.isDisplayed().should.eventually.be.false
			.then( function () {

				config.currentTest = 'passed';
			} );
		}
	} );

	it( 'should click on the logout_button from mainMenuScreen'.green, function() {

		return driver
		.elementByName( elements.mainMenuScreen.logout )
		.click()
		.then( function () {

			config.currentTest = 'passed';
		} );
	} );

	it( 'should check if current user has inspection option after clicking log out'.green, function () {

		return driver
		.sleep( 800 )
		.then( function () {
			
			if ( Store.get( 'lastUser' ).truckOption === true && Store.get( 'lastUser' ).userRole != 'client' ) {
				console.log( 'Log out with A inspection request'.red );
				if( commons.isAndroid() ) {
					return commons.alertText( driver, alerts.actionsScreenAlerts.companyVehicle.postInspection )
					.elementByName( elements.alertButtons.no, 3000 )
					.click()
					.elementByName( elements.alertButtons.logout )
					.click()
					.sleep( 3000 );

				} else if ( commons.isIOS() ) {
					return commons.alertText( driver, alerts.actionsScreenAlerts.companyVehicle.postInspection )
					.elementByName( elements.alertButtons.no, 3000 )
					.click()
					.elementByName( elements.alertButtons.logout )
					.click()
					.sleep( 3000 );
				}

			} else if ( Store.get( 'lastUser' ).truckOption === false ) {
				console.log( 'Log out with no inspection request'.red );
					return driver//commons.alertText( driver, alerts.actionsScreenAlerts.logOutNow.logOut )
					.elementByName( elements.alertButtons.logout )
					.click()
					.sleep( 3000 );
			}
		} )
		.then( function () {

			config.currentTest = 'passed';
		} );
	} );

	// it( 'should make sure all fields are visible on the loginScreen'.green, function () {

	// 	return driver
	// 	.sleep( 5000 )
	// 	.elementByName( elements.loginScreen.user_name )
	// 	.isDisplayed().should.eventually.be.true
	// 	.elementByName( elements.loginScreen.password )
	// 	.isDisplayed().should.eventually.be.true
	// 	.elementByName( elements.loginScreen.login_button )
	// 	.isDisplayed().should.eventually.be.true
	// 	.elementByName( elements.loginScreen.accept_terms )
	// 	.isDisplayed().should.eventually.be.true
	// 	.then( function() {	

	// 		console.log( 'Logout from mainMenuScreen has completed Completed...'.green );
	// 		config.currentTest = 'passed';
	// 	});
	// });
});