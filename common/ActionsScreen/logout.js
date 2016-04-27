'use strict';

require( 'colors' );
require( '../../helpers/setup' );
var alerts   = require( '../../helpers/alerts' );
var assert   = require( 'assert' );
var config   = require( '../../helpers/Config' );
var elements = require( '../../helpers/elements' );
var commons  = require( '../../helpers/Commons' );
var Store    = require( '../../helpers/Store' );

var driver = config.driver;


describe( 'Start Done with Vehicle Process'.green, function () {

	it( 'should wait for syncAllowed.'.green, function () {
		var lastUser = Store.get( 'lastUser' );
		return driver
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 20000 )
		.then( function () {

			config.currentTest = 'passed';
		} );
	} );

	it( 'should go to actionsScreen from mainMenuScreen'.green, function () {

		return driver
		.elementByName( elements.mainMenuScreen.actions )
		.click().sleep( 1000 )
		.then( function () {

			config.currentTest = 'passed';
		} );
	} );

	it( 'should click on the logout_button from actionsScreen'.green, function () {

		return driver
		.waitForElementByName( elements.actionsScreen.logout, 40000 )
		.click()
		.then( function () {

			config.currentTest = 'passed';
		} );
	} );

	it( 'should check for a inspections and click logOutNow'.green, function () {

		return driver
		.sleep( 800 )
		.then( function ( inspection ) {
			
			if ( Store.get( 'lastUser' ).truckOption === true && Store.get( 'lastUser' ).userRole != 'client' ) {
				console.log( 'Log out with A inspection request'.red );
				if( commons.isAndroid() ) {
					return commons.alertText( driver, alerts.loginAlerts.noInspection )
					.elementByName( elements.alertButtons.no )
					.click()
					.then( function () {
						return commons.alertText( driver, alerts.actionsScreenAlerts.logOutNow.logOut )
						.elementByName( elements.alertButtons.logout )
						.click();
					} );

				} else if ( commons.isIOS() ) {
					return commons.alertText( driver, alerts.loginAlerts.noInspection )
					.elementByName( elements.alertButtons.no )
					.click()
					.then( function () {
						return commons.alertText( driver, alerts.actionsScreenAlerts.logOutNow.logOut )
						.elementByName( elements.alertButtons.logout )
						.click();
					} );
				}

			} else {
				console.log( 'No inspection request required to Log-out'.red );
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
		.then( function () {

			config.currentTest = 'passsed';
		} );
	} );

	it( 'should check for elements on loginScreen after being logged out'.green, function () {

		return driver
		.waitForElementByName( elements.loginScreen.client_account, 200000 )
		.isDisplayed().should.eventually.be.ok		
		.then( function ( loginScreen ) {

			if ( loginScreen ) {
				return driver
				.elementByName( elements.loginScreen.user_name )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.loginScreen.password )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.loginScreen.login_button )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.loginScreen.accept_terms )
				.isDisplayed().should.eventually.be.ok

			} else {
				assert.fail( 'Can\'t find the ' + elements.loginScreen.client_account + ' element.' ); 
			}
		} )
		.then( function () {

			console.log( 'Logged out of Vehicle has Completed....'.green );
			config.currentTest = 'passed';
	 	} );
	} );
} );
