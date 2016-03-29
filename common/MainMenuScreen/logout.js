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

	it( 'should logout from Main Menu Screen.'.green, function( done ) {
		var lastUser = Store.get( 'lastUser' );
		console.log( 'LOGGING OUT...'.green );
		return driver
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 40000 )
		.elementByName( elements.mainMenuScreen.logout )
		.click()
		.sleep( 800 )
		.then( function () {
			
			if ( lastUser.truckOption === true && lastUser.userRole != 'client' ) {
				console.log( 'Log out with A inspection request'.red );
				if( commons.isAndroid() ) {
					return commons.alertText( driver, alerts.actionsScreenAlerts.companyVehicle.postInspection )
					.elementByName( elements.alertButtons.no, 3000 )
					.click()
					.elementByName( elements.alertButtons.logout )
					.click();

				} else if ( commons.isIOS() ) {
					return commons.alertText( driver, alerts.actionsScreenAlerts.companyVehicle.postInspection )
					.elementByName( elements.alertButtons.no, 3000 )
					.click()
					.elementByName( elements.alertButtons.logout )
					.click();
				}

			} else {
				console.log( 'Log out with no inspection request'.red );
					return commons.alertText( driver, alerts.actionsScreenAlerts.logOutNow.logOut )
					.elementByName( elements.alertButtons.logout )
					.click();
			}
			return driver;
		} )
		.elementByName( elements.loginScreen.client_account )
		.isDisplayed().should.eventually.be.true
		.elementByName( elements.loginScreen.user_name )
		.isDisplayed().should.eventually.be.true
		.elementByName( elements.loginScreen.password )
		.isDisplayed().should.eventually.be.true
		.elementByName( elements.loginScreen.login_button )
		.isDisplayed().should.eventually.be.true
		.elementByName( elements.loginScreen.accept_terms )
		.isDisplayed().should.eventually.be.true
		.then( function() {	

			console.log( 'Logout Completed...'.green );
			config.currentTest = 'passed';
		})
	 	.then( function() {
			done();
	 	});
	});

});