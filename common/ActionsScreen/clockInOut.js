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


	var driver          = config.driver;
	var noOptions       = false
	var clockInButton   = false
	var clockOutButton  = false
	var checkPassed     = false
	var clockedIn       = false
	var clockedOut      = false

	describe( 'Start clock in or out Process'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'Should go to Actions Screen'.green, function() {
			
			return driver
			.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
			.elementByName( elements.mainMenuScreen.actions )
			.click()
			.sleep( 800 )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should clockIn or out from actions screen.'.green, function () {

			return driver
			.waitForElementByName( elements.actionsScreen.drafts, 20000 )
			.then( function () {

				if ( Store.get( 'lastUser' ).clockInOption === true && Store.get( 'lastUser' ).userRole != 'client' ) {	
					return driver
					.elementByNameIfExists( elements.actionsScreen.clockIn )
					.then( function ( clockInOption ) {

						if ( clockInOption ) {
							console.log( 'Clock In Button'.red );
							return driver
							.elementByName( elements.actionsScreen.clockIn )
							.click()
							.sleep( 2000 )
							.then( function () {
								
								if( commons.isAndroid() ) {
									return commons.alertText( alerts.actionsScreenAlerts.timeCard.clockin );

								} else if ( commons.isIOS() ) {
									return commons.alertText( alerts.actionsScreenAlerts.timeCard.clockin );
								}
							} )
							.elementByName( elements.alertButtons.clockIn )
							.click()
							.sleep( 2000 )
							.then( function () {

								config.clockedIn  = true;
								config.clockedOut = false;
							} )
						
						} else {
							console.log( 'Clock Out Button'.red );
							return driver
							.elementByName( elements.actionsScreen.clockOut )
							.click()
							.sleep( 2000 )
							.then( function () {

								if( commons.isAndroid() ) {
									return commons.alertText( alerts.actionsScreenAlerts.timeCard.clockout );

								} else if ( commons.isIOS() ) {
									return commons.alertText( alerts.actionsScreenAlerts.timeCard.clockout );
								}
							} )
							.elementByName( elements.alertButtons.clockOut )
							.click()
							.sleep( 2000 )
							.then( function () {

								config.clockedIn  = false;
								config.clockedOut = true;
							} )
						}
					} )
					.then( function () {

					config.currentTest = 'passed';
					} );
					
				} else {
					console.log( 'No Clockin or Clockout Option'.red );
					config.currentTest = 'passed';
					return driver;
				}
			} )
		} );
		
		it( 'should go back to mainMenuScreen from actions screen.'.green, function () {
		
			if ( commons.isIOS() ) {
				return driver
				.elementByName( elements.actionsScreen.back )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.actionsScreen.back )
				.click()
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( commons.isAndroid() ) {
				return driver
				.back()
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );
			
		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'Clocked in or out has Completed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};