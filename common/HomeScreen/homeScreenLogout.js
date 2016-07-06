'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../helpers/setup' );
	var alerts   = require( '../../helpers/alerts' );
	var assert   = require( 'assert' );
	var config   = require( '../../helpers/Config' );
	var elements = require( '../../helpers/elements' );
	var commons  = require( '../../helpers/Commons' );
	var Store    = require( '../../helpers/Store' );
	var driver   = config.driver;

	describe( 'Start logout Process using homeScreenLogout.js'.green, function( ) {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'should wait for syncAllowed', function () {

			config.loginoutTest = true;
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 40000 )
		} );

		it( 'Should make sure all buttons are visble after syncAllowed'.green, function () {

			var lastUser = Store.get( 'lastUser' );
			//Checks for buttons to be displayed on main menu after log on.
			if ( lastUser.userRole == 'admin' 
				|| lastUser.userRole == 'driver' 
			) {
				return driver
				.elementByName( lastUser.name )
				.text().should.eventually.become( lastUser.name )
				.elementByName( elements.homeScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.homeScreen.logout )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.homeScreen.alerts )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.homeScreen.jobs )
				.isDisplayed().should.eventually.be.true
				.then( function () {

					if ( lastUser.tagButton == true ) {
						return driver
						.elementByName( elements.homeScreen.expiredTags )
						.isDisplayed().should.eventually.be.true
					}
				} );

			} else if ( lastUser.userRole === 'client' 
					   || lastUser.userRole === 'AdminClient' 
		   	) {
				return driver
				.elementByName( lastUser.name )
				.text().should.become( lastUser.name )
				.elementByName( elements.homeScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.homeScreen.logout )
				.isDisplayed().should.eventually.be.true
				.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true	
				.elementByNameIfExists( elements.homeScreen.alerts )
				.then( function ( alerts ) {

					if ( alerts ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} )
				.elementByNameIfExists( elements.homeScreen.expiredTags )
				.then( function ( expiredTags ) {

					if ( expiredTags ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} )
				.elementByNameIfExists( elements.homeScreen.jobs )
				.then( function ( jobs ) {

					if ( jobs ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} );
			}
		} );

		it( 'should click on the logoutButton from homeScreen'.green, function() {

			return driver
			.elementByName( elements.homeScreen.logout )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.logout )
			.click()
		} );

		it( 'should check for a Vehicle Inspection'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );	
			if ( lastUser.truckOption === true ) {
				console.log( 'Should ask user to post-Inspect'.red );
				return commons.alertText( alerts.loginLogoutAlerts.doInspection )
				.elementByName( elements.alertButtons.no )
				.isDisplayed().should.eventually.be.true
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
				return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOutClockout )
			
			} else {
				console.log( 'User is NOT clockedin should check if current alert is visibile'.red );
				return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOut )
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
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.alertButtons.clockOutLogout )
				.click()
			
			} else {
				console.log( 'Logout Now'.red );
				return driver
				.elementByName( elements.alertButtons.logout )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.alertButtons.logout )
				.click()
			}
		} );

		it( 'should set currentTest to "passed"'.green, function ( done ) {
		
			console.log( 'Logout from homeScreen has completed Completed...'.green );
			done();
		} );
	});
};