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

	it( 'should log out of a app from actions screen.'.green, function ( done ) {
		var lastUser = Store.get( 'lastUser' );
		console.log( 'Log Out of App from actionsScreen Automation...'.green );
		driver
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 20000 )
		.elementByName( elements.mainMenuScreen.actions )
		.click().sleep( 1000 )
		.waitForElementByName( elements.actionsScreen.logout, 40000 )
		.click()
		.sleep( 800 )
		.then( function ( inspection ) {
			
			if ( lastUser.truckOption === true && lastUser.userRole != 'client' ) {
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
					return commons.alertText( driver, 'null ' + alerts.loginAlerts.noInspection )
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
			return driver;
		} )
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
		.then( function () {

			console.log( 'Logged out of Vehicle has Completed....'.green );
			config.currentTest = 'passed';
			done();
	 	} );
	} );
} );
