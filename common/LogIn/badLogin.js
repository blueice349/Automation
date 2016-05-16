'use strict';

module.exports = function () {

	require( 'colors' );
	var config   = require( '../../helpers/Config' );
	var elements = require( '../../helpers/elements' );
	var commons  = require( '../../helpers/Commons' );


	var driver = config.driver;
	var truck = false

	describe( 'Start try login with bad username & password Process'.green, function() {

		it( 'should not login'.green, function () {

			return driver
			.waitForElementByName( elements.loginScreen.client_account, 200000 )
			.then( function ( el ) {

				if ( commons.isIOS() ){
					return commons.sendKeys(el, elements.logins.iosSim1.client_account );
				} else if ( commons.isAndroid() ) {
					return commons.sendKeys(el, elements.logins.androidDriver.client_account );
				}
			})
			.elementByName( elements.loginScreen.user_name )
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
			.elementByName( elements.loginScreen.accept_terms )
				.click()
			.elementByName( elements.loginScreen.login_button )
				.click()
				.sleep( 3000 )
			.waitForElementByName( elements.alertButtons.ok, 180000 )
				.click()
				.sleep( 1000 )
			.elementByName( elements.loginScreen.user_name )
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
			.elementByName( elements.loginScreen.accept_terms )
				.click()
			.elementByName( elements.loginScreen.login_button )
				.click()
				.sleep( 3000 )
			.waitForElementByName( elements.alertButtons.ok, 180000 )
				.click()
				.sleep( 1000 )
			.waitForElementByName( elements.loginScreen.client_account, 200000 )
			.then( function ( el ) {

				if ( commons.isIOS() ){
					return commons.sendKeys(el, elements.logins.iosSim1.client_account );
				} else if ( commons.isAndroid() ) {
					return commons.sendKeys(el, elements.logins.androidDriver.client_account );
				}
			})
			.elementByName( elements.loginScreen.user_name )
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
			.elementByName( elements.loginScreen.login_button )
				.click()
				.sleep( 3000 )
			.waitForElementByName( elements.alertButtons.ok, 180000 )
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