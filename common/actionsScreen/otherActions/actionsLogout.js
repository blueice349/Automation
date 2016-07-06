'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../../helpers/setup' );
	var alerts   = require( '../../../helpers/alerts' );
	var assert   = require( 'assert' );
	var config   = require( '../../../helpers/Config' );
	var elements = require( '../../../helpers/elements' );
	var commons  = require( '../../../helpers/Commons' );
	var Store    = require( '../../../helpers/Store' );

	var driver = config.driver;

	describe( 'Start Done with Logout Process from actionsScreen using "actionsLogout.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
   		commons.afterEachDes();
   		commons.afterEachIt();
   		
		it( 'should wait for syncAllowed.'.green, function () {
			var lastUser = Store.get( 'lastUser' );
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 20000 )
		} );

		it( 'should go to actionsScreen from homeScreen'.green, function () {

			return driver
			.elementByName( elements.homeScreen.actions )
			.click()
			.sleep( 1000 )
		} );

		it( 'should click on the logoutButton from actionsScreen'.green, function () {

			return driver
			.waitForElementByName( elements.actionsScreen.logout, 40000 )
			.click()
		} );

		it( 'should check for a Vehicle Inspection'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );	
			if ( lastUser.truckOption === true ) {
				console.log( 'Should ask user to post-Inspect'.red );
				return commons.alertText( alerts.loginLogoutAlerts.doInspection )
				.elementByName( elements.alertButtons.no )
				.click()

			} else if ( lastUser.truckOption === false ) {
				console.log( 'User does not have vehicle options!'.red );

			} else {
				assert.fail( 'User truckOption is \'undefined\' and/or not set up!'.red );
			}
		} );

		it( 'should check if user isClockedin'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.clockInOption === true 
				&& config.isClockedin === true 
			) {
				console.log( 'User isClockedin should check if current alert is visibile'.red );
				return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOutClockout );

			} else {
				console.log( 'User is NOT clockedin should check if current alert is visibile'.red );
				return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOut );
			}
		} );

		it( 'should clockOut & logout or Clockout Now'.green, function () {

			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.clockInOption === true 
				&& config.isClockedin === true 
			) {
				console.log( 'Clock out + Logout'.red );
				return driver
				.elementByName( elements.alertButtons.clockOutLogout )
				.click()
			
			} else {
				console.log( 'Logout Now'.red );
				return driver
				.elementByName( elements.alertButtons.logout )
				.click()
			}
		} );

		it( 'should set currentTest to "passed"'.green, function ( done ) {
		
			console.log( 'Logout from actionsScreen has completed Completed...'.green );
			done();
		} );
	} );
};