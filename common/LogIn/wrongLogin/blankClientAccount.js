'use strict';

module.exports = function () {

	require( 'colors' );
	var alerts   = require( '../../../helpers/alerts' );
	var config   = require( '../../../helpers/Config' );
	var elements = require( '../../../helpers/elements' );
	var commons  = require( '../../../helpers/Commons' );
	var login    = require( '../../../helpers/loginTable' );


	var driver = config.driver;

	describe( 'Start try login with blank ClientAccount process using blankClientAccount.js'.green, function() {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'Should make sure clientAccount is blank'.green, function () {
			
			config.loginTest = true;
			return driver
			.waitForElementById( elements.loginScreen.clientAccount, 200000 )
			.click()
			.clear()
		} );

		it( 'Should enter a good userName'.green, function () {

			config.loginTest = true;
			return driver
			.elementById( elements.loginScreen.userName )
			.then( function ( userName ) {

				if ( commons.isIOS() ) {
					return commons.sendKeys( userName, login.driverLogins.driver1.username );

				} else {
					return commons.sendKeys( userName, login.driverLogins.driver2.username );
				}
			} );
		} );

		it( 'Should enter a good password.'.green, function () {

			config.loginTest = true;
			return driver
			.elementById( elements.loginScreen.password )
			.then( function ( password ) {
				
				if ( commons.isIOS() ) {
					return commons.sendKeys( password, login.driverLogins.driver1.password );

				} else {
					return commons.sendKeys( password, login.driverLogins.driver2.password );
				}
			} );
		} );

		it( 'Should acceptTerms.'.green, function () {

			config.loginTest = true;
			return driver
			.elementById( elements.loginScreen.acceptTerms )
			.click()
		} );

		it( 'Should click the loginButton.'.green, function () {

			config.loginTest = true;
			return driver
			.elementById( elements.loginScreen.loginButton )
			.click()
		} );

		it( 'should get alert for blank clientAccount'.green, function () {

			config.loginTest = true;
			return driver
			.waitForElementByXPath( commons.textToXPath( elements.alertButtons.ok ), 120000 )
			.then( function ( el ) {

				commons.alertText( alerts.loginLogoutAlerts.blankClientAccount )
				return el
				.click()
				.sleep( 1000 );
			} );
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			config.loginTest = true;
			console.log( 'blankClientAccount test has Completed....'.green );
			done();
		} );
	});
};