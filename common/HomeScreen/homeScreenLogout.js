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
			.waitForElementById( elements.homeScreen.syncAllowed, 40000 )
		} );

		it( 'Should make sure all buttons are visble after syncAllowed'.green, function () {

			var lastUser = Store.get( 'lastUser' );
			//Checks for buttons to be displayed on main menu after log on.
			if ( lastUser.userRole == 'admin' 
			||   lastUser.userRole == 'driver' ) {

				return driver
				.elementByXPath( commons.textToXPath( lastUser.name ) )
				.text().should.eventually.become( lastUser.name )
				.elementById( elements.homeScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.homeScreen.alerts )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.homeScreen.jobs )
				.isDisplayed().should.eventually.be.true
				.then( function () {

					if ( lastUser.tagButton == true ) {
						return driver
						.elementById( elements.homeScreen.expiredTags )
						.isDisplayed().should.eventually.be.true
					}
				} );

			} else if ( lastUser.userRole === 'client' 
				||      lastUser.userRole === 'AdminClient' ) {

				return driver
				.elementByXPath( commons.textToXPath( lastUser.name ) )
				.text().should.eventually.become( lastUser.name )
				.elementById( elements.homeScreen.actions )
				.isDisplayed().should.eventually.be.true
				.waitForElementById( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true	
				.elementByIdIfExists( elements.homeScreen.alerts )
				.then( function ( alerts ) {

					if ( alerts ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} )
				.elementByIdIfExists( elements.homeScreen.expiredTags )
				.then( function ( expiredTags ) {

					if ( expiredTags ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} )
				.elementByIdIfExists( elements.homeScreen.jobs )
				.then( function ( jobs ) {

					if ( jobs ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} );
			}
		} );

		it( 'should click on the actionsScree from homeScreen'.green, function() {

			return driver
			.elementById( elements.homeScreen.actions )
			.isDisplayed().should.eventually.be.true
			.elementById( elements.homeScreen.actions )
			.click()
		} );

		it( 'should click on the logoutButton from actionsScreen'.green, function() {

			return driver
			.elementById( elements.actionsScreen.logout )
			.isDisplayed().should.eventually.be.true
			.elementById( elements.actionsScreen.logout )
			.click()
		} );
		
		it( 'should check for a Vehicle Inspection'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );	
			if ( lastUser.truckOption === true ) {
				console.log( 'Should ask user to post-Inspect'.red );
				return commons.alertText( alerts.loginLogoutAlerts.doInspection )
				.elementByXPath( commons.textToXPath( elements.alertButtons.no ) )
				.isDisplayed().should.eventually.be.true
				.elementByXPath( commons.textToXPath( elements.alertButtons.no ) )
				.click();

			} else if ( lastUser.truckOption === false ) {
				console.log( 'User does not have vehicle options!'.red );

			} else {
				assert.fail( 'User truckOption is \'undefined\' and/or not set up!'.red );
			}
		} );

		it( 'should check if user isClockedin'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.clockInOption === true 
			&&   config.isClockedin === true ) {

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
			&&   config.isClockedin === true ) {

				console.log( 'Clock out + Logout'.red );
				return driver
				.elementByXPath( commons.textToXPath( elements.alertButtons.clockOutLogout ) )
				.isDisplayed().should.eventually.be.true
				.elementByXPath( commons.textToXPath( elements.alertButtons.clockOutLogout ) )
				.click();
			
			} else {
				console.log( 'Logout Now'.red );
				return driver
				.elementByXPath( commons.textToXPath( elements.alertButtons.logout ) )
				.isDisplayed().should.eventually.be.true
				.elementByXPath( commons.textToXPath( elements.alertButtons.logout ) )
				.click();
			}
		} );

		it( 'should set currentTest to "passed"'.green, function ( done ) {
		
			console.log( 'Logout from homeScreen has completed Completed...'.green );
			done();
		} );
	});
};