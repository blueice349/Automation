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

			} else if ( Store.get( 'lastUser' ).userRole === 'client' || Store.get( 'lastUser' ).userRole === 'AdminClient' ) {
				return driver
				.elementByName(  Store.get( 'lastUser' ).name )
				.text().should.become(  Store.get( 'lastUser' ).name )
				.elementByName( elements.mainMenuScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mainMenuScreen.logout )
				.isDisplayed().should.eventually.be.true
				.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
				.isDisplayed().should.eventually.be.true	
				.elementByNameIfExists( elements.mainMenuScreen.alerts )
				.then( function ( alerts ) {

					if ( alerts ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} )
				.elementByNameIfExists( elements.mainMenuScreen.expiredTags )
				.then( function ( expiredTags ) {

					if ( expiredTags ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} )
				.elementByNameIfExists( elements.mainMenuScreen.jobs )
				.then( function ( jobs ) {

					if ( jobs ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} )
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
				
		it( 'should check for a inspections and click logOutNow'.green, function () {
			return driver
			.sleep( 800 )
			.then( function ( inspection ) {
				
				if ( Store.get( 'lastUser' ).truckOption === true && Store.get( 'lastUser' ).clockInOption === false && Store.get( 'lastUser' ).userRole != 'client' ) {
					console.log( 'Log out with A inspection request'.red );
					if( commons.isAndroid() ) {
						return commons.alertText( alerts.loginAlerts.noInspection )
						.elementByName( elements.alertButtons.no )
						.click()
						.then( function () {
							return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOut )
							.elementByName( elements.alertButtons.logout )
							.click();
						} );

					} else if ( commons.isIOS() ) {
						return commons.alertText( alerts.loginAlerts.noInspection )
						.elementByName( elements.alertButtons.no )
						.click()
						.then( function () {
							return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOut )
							.elementByName( elements.alertButtons.logout )
							.click();
						} );
					}

				} else if ( Store.get( 'lastUser' ).truckOption === true && Store.get( 'lastUser' ).clockInOption === true ) {	
					console.log( 'Log out with A inspection request and clockout + logout option'.red );
					return commons.alertText( alerts.loginAlerts.noInspection )
					.elementByName( elements.alertButtons.no )
					.click()
					.sleep( 100 )
					.elementByNameIfExists( alerts.actionsScreenAlerts.logOutNow.logOut )
					.then( function ( logOutNow ) {
						if ( logOutNow ) {
							return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOut )
							.elementByName( elements.alertButtons.logout )
							.click();
						} else {
							return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOutClockout )
							.elementByName( elements.alertButtons.clockOutLogout )
							.click();
						}
					} );

				} else if ( Store.get( 'lastUser' ).truckOption === false && Store.get( 'lastUser' ).clockInOption === true && Store.get( 'lastUser' ).userRole != 'client' ) {	
					console.log( 'Log out with No inspection request and clockout + logout option'.red );
					return driver
					.elementByNameIfExists( alerts.actionsScreenAlerts.logOutNow.logOut )
					.then( function ( logOutNow ) {
						if ( logOutNow ) {
							return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOut )
							.elementByName( elements.alertButtons.logout )
							.click();
						} else {
							return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOutClockout )
							.elementByName( elements.alertButtons.clockOutLogout )
							.click();
						}
					} );

				} else {
					console.log( 'No inspection request and no clock out request required to Log-out'.red );
					if( commons.isAndroid() ) {
						return driver
						.elementByName( elements.alertButtons.logout )
						.click();

					} else if ( commons.isIOS() ) {
						return driver
						.elementByName( elements.alertButtons.logout )
						.click();
					}
				}
			} )
			.sleep( 80 )
			.then( function () {

				config.currentTest = 'passsed';
			} );
		} );

		it( 'should check for elements on loginScreen after being logged out'.green, function () {

			return driver
			.waitForElementByName( elements.loginScreen.client_account, 200000 )
			.isDisplayed().should.eventually.be.true		
			.then( function ( loginScreen ) {

				if ( loginScreen ) {
					return driver
					.elementByName( elements.loginScreen.user_name )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.loginScreen.password )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.loginScreen.login_button )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.loginScreen.accept_terms )
					.isDisplayed().should.eventually.be.true

				} else {
					assert.fail( 'Can\'t find the ' + elements.loginScreen.client_account + ' element.' ); 
				}
			} )
			.sleep( 1000 )
			.then( function () {

				config.currentTest = 'passed';
		 	} );
		} );

		it( 'should set currentTest to "passed"'.green, function ( done ) {
		
			console.log( 'Logout from mainMenuScreen has completed Completed...'.green );
			config.currentTest = 'passed';
			done();
		} );
	});
};