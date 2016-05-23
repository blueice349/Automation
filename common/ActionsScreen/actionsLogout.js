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

	var driver = config.driver;

	describe( 'Start Done with Logout Process from actionsScreen user logout.js'.green, function () {

		it( 'should wait for syncAllowed.'.green, function () {
			var lastUser = Store.get( 'lastUser' );
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 20000 )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should go to actionsScreen from homeScreen'.green, function () {

			return driver
			.elementByName( elements.homeScreen.actions )
			.click().sleep( 1000 )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should click on the logoutButton from actionsScreen'.green, function () {

			return driver
			.waitForElementByName( elements.actionsScreen.logout, 40000 )
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
				return driver
				.elementByNameIfExists( alerts.actionsScreenAlerts.logOutNow.logOut )
				.then( function ( logOutNow ) {
					if ( logOutNow ) {
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
				} );

			} else if ( Store.get( 'lastUser' ).truckOption === false && Store.get( 'lastUser' ).clockInOption === true && Store.get( 'lastUser' ).userRole != 'client' ) {	
				console.log( 'Log out with No inspection request'.red );
				return driver
				.elementByNameIfExists( alerts.actionsScreenAlerts.logOutNow.logOut )
				.then( function ( logOutNow ) {
					if ( logOutNow ) {
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
				} );

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
		
			console.log( 'Logout from actionsScreen has completed Completed...'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};