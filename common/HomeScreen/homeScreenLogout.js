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
			.waitForElementByName( elements.homeScreen.syncAllowed, 40000 )
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
				.elementByName( elements.homeScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.homeScreen.logout )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.homeScreen.alerts )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.homeScreen.expiredTags )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.homeScreen.jobs )
				.isDisplayed().should.eventually.be.true
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( Store.get( 'lastUser' ).userRole === 'client' || Store.get( 'lastUser' ).userRole === 'AdminClient' ) {
				return driver
				.elementByName(  Store.get( 'lastUser' ).name )
				.text().should.become(  Store.get( 'lastUser' ).name )
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
				} )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'should click on the logout_button from homeScreen'.green, function() {

			return driver
			.elementByName( elements.homeScreen.logout )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.logout )
			.click()
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should check for a inspections and click logOutNow'.green, function () {
				
			if ( Store.get( 'lastUser' ).truckOption === true && Store.get( 'lastUser' ).clockInOption === false && Store.get( 'lastUser' ).userRole != 'client' ) {
				console.log( 'Log out with A inspection request'.red );
				if ( config.isInVehicle === true ) {
					commons.alertText( alerts.loginLogoutAlerts.doInspection )
					.elementByName( elements.alertButtons.no )
					.click();
				}
				return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOut )
				.elementByName( elements.alertButtons.logout )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.alertButtons.logout )
				.click()
				.then( function () {

					config.currentTest = 'passsed';
				} );

			} else if ( Store.get( 'lastUser' ).truckOption === true && Store.get( 'lastUser' ).clockInOption === true ) {	
				console.log( 'Log out with inspection request'.red );
				if ( config.isInVehicle === true ) {
					commons.alertText( alerts.loginLogoutAlerts.doInspection )
					.elementByName( elements.alertButtons.no )
					.click()
					.sleep( 100 )
				}
				
				if ( commons.isIOS() ) {
					return driver
					.elementByNameIfExists( 'null ' + alerts.actionsScreenAlerts.logOutNow.logOut )
					.then( function ( el ) {
						if ( el ) {
							config.logOutNow = true;
						}
					} )

				} else if ( commons.isAndroid() ) {
					return driver
					.elementByNameIfExists( alerts.actionsScreenAlerts.logOutNow.logOut )
					.then( function ( el ) {
						if ( el ) {
							logOutNow = true;
						}
					} )
				}
				console.log( 'logOutNow ' + logOutNow );
				if ( config.logOutNow === true ) {
					console.log( 'Logout Now'.red );
					return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOut )
					.elementByName( elements.alertButtons.logout )
					.click()
					.then( function () {

						config.currentTest = 'passsed';
					} );
				} else {
					console.log( 'Clock out + Logout'.red );
					return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOutClockout )
					.elementByName( elements.alertButtons.clockOutLogout )
					.click()
					.then( function () {

						config.currentTest = 'passsed';
					} );
				}

			} else if ( Store.get( 'lastUser' ).truckOption === false && Store.get( 'lastUser' ).clockInOption === true && Store.get( 'lastUser' ).userRole != 'client' ) {	
				console.log( 'Log out with No inspection request'.red );
				if ( commons.isIOS() ) {
					driver
					.elementByNameIfExists( 'null ' + alerts.actionsScreenAlerts.logOutNow.logOut )
					.then( function ( el ) {

						if ( el ) {
							console.log( el );
							config.logOutNow = true;
						}
					} )

				} else if ( commons.isAndroid() ) {
					driver
					.elementByNameIfExists( alerts.actionsScreenAlerts.logOutNow.logOut )
					.then( function ( el ) {
						
						if ( el ) {
							config.logOutNow = true;
						}
					} )
				}
				if ( config.logOutNow === true ) {
					console.log( 'Logout Now'.red );
					return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOut )
					.elementByName( elements.alertButtons.logout )
					.click()
					.then( function () {

						config.currentTest = 'passsed';
					} );
				} else {
					console.log( 'Clock out + Logout'.red );
					return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOutClockout )
					.elementByName( elements.alertButtons.clockOutLogout )
					.click()
					.then( function () {

						config.currentTest = 'passsed';
					} );
				}

			} else {
				console.log( 'No inspection request and no clock out request required to Log-out'.red );
				if( commons.isAndroid() ) {
					return driver
					.elementByName( elements.alertButtons.logout )
					.click()
					.then( function () {

						config.currentTest = 'passsed';
					} );

				} else if ( commons.isIOS() ) {
					return driver
					.elementByName( elements.alertButtons.logout )
					.click()
					.then( function () {

						config.currentTest = 'passsed';
					} );
				}
			}
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
		
			console.log( 'Logout from homeScreen has completed Completed...'.green );
			config.currentTest = 'passed';
			done();
		} );
	});
};