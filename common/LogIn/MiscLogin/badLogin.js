'use strict';

module.exports = function () {

	require( 'colors' );
	var config   = require( '../../../helpers/Config' );
	var elements = require( '../../../helpers/elements' );
	var commons  = require( '../../../helpers/Commons' );


	var driver = config.driver;
	var truck = false

	describe( 'Start try login with bad username & password Process'.green, function() {

		it( 'should not login'.green, function () {

			return driver
			.waitForElementByName( elements.loginScreen.clientAccount, 200000 )
			.then( function ( el ) {

				if ( commons.isIOS() ){
					return commons.sendKeys(el, elements.logins.iosSim1.clientAccount );
				} else if ( commons.isAndroid() ) {
					return commons.sendKeys(el, elements.logins.androidDriver.clientAccount );
				}
			})
			.elementByName( elements.loginScreen.userName )
			.then( function ( el ) {

				if ( commons.isIOS() ){
					return commons.sendKeys( el, 'Bad User' );
				} else if ( commons.isAndroid() ) {
					return commons.sendKeys( el, 'Bad User' );
				}
			})
			.elementByName( elements.loginScreen.password )
			.then( function ( el ) {
				
				if ( commons.isIOS() ) {
					return commons.sendKeys( el, elements.logins.iosSim1.password );
				} else if ( commons.isAndroid() ) {
					return commons.sendKeys( el, elements.logins.androidDriver.password );
				}
			})
			.elementByName( elements.loginScreen.acceptTerms )
				.click()
			.elementByName( elements.loginScreen.loginButton )
				.click()
				.sleep( 3000 )
			.waitForElementByName( elements.alertButtons.ok, 120000 )
				.click()
				.sleep( 1000 )
			.elementByName( elements.loginScreen.userName )
			.then( function ( el ) {

				if ( commons.isIOS() ){
					return commons.sendKeys( el, elements.logins.iosSim1.username );
				} else if ( commons.isAndroid() ) {
					return commons.sendKeys( el, elements.logins.androidDriver.username );
				}
			})
			.elementByName( elements.loginScreen.password )
			.then( function ( el ) {
				
				if ( commons.isIOS() ) {
					return commons.sendKeys( el, 'Wrong password' );
				} else if ( commons.isAndroid() ) {
					return commons.sendKeys( el, 'Wrong Password' );
				}
			})
			.elementByName( elements.loginScreen.acceptTerms )
				.click()
			.elementByName( elements.loginScreen.loginButton )
				.click()
				.sleep( 3000 )
			.waitForElementByName( elements.alertButtons.ok, 120000 )
				.click()
				.sleep( 1000 )
			.waitForElementByName( elements.loginScreen.clientAccount, 200000 )
			.then( function ( el ) {

				if ( commons.isIOS() ){
					return commons.sendKeys(el, elements.logins.iosSim1.clientAccount );
				} else if ( commons.isAndroid() ) {
					return commons.sendKeys(el, elements.logins.androidDriver.clientAccount );
				}
			})
			.elementByName( elements.loginScreen.userName )
			.then( function ( el ) {

				if ( commons.isIOS() ){
					return commons.sendKeys( el, elements.logins.iosSim1.username );
				} else if ( commons.isAndroid() ) {
					return commons.sendKeys( el, elements.logins.androidDriver.username );
				}
			})
			.elementByName( elements.loginScreen.password )
			.then( function ( el ) {
				
				if ( commons.isIOS() ) {
					return commons.sendKeys( el, elements.logins.iosSim1.password );
				} else if ( commons.isAndroid() ) {
					return commons.sendKeys( el, elements.logins.androidDriver.password );
				}
			})
			.elementByName( elements.loginScreen.loginButton )
				.click()
				.sleep( 3000 )
			.waitForElementByName( elements.alertButtons.ok, 120000 )
				.click()
				.sleep( 1000 )
			.then( function() {
				console.log( 'Good Client Account, Username & Password, but SLA not Accepted'.red );
				console.log( 'Bad Login Completed...'.green );
				config.currentTest = 'passed';
			})
		});
	});
};