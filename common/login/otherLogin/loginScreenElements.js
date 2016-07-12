'use strict';

module.exports = function () {
	
	require( 'colors' );
	require( '../../../helpers/setup' );
	var apps     = require( '../../../helpers/apps' );
	var alerts   = require( '../../../helpers/alerts' );
	var caps     = require( '../../../helpers/caps' );
	var config   = require( '../../../helpers/Config' );
	var commons  = require( '../../../helpers/Commons' );
	var elements = require( '../../../helpers/elements' );
	var login    = require( '../../../helpers/loginTable' );
	var Store    = require( '../../../helpers/Store' );
	var driver   = config.driver;

	describe( 'Start check elements on loginScreen process using "loginScreenItems.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'should check fields on loginScreen'.green, function() {
			
			config.loginTest = true;
			return driver
			.waitForElementByName( elements.loginScreen.clientAccount, 120000 )
			.isDisplayed()
			.then( function ( el ) {

				if ( el === true ) {
					return driver
					.elementByName( elements.loginScreen.clientAccount )
					.isDisplayed().should.eventually.be.true

				} else {
					return driver
					.sleep( 4000 )
				}
			} )
			.elementByName( elements.loginScreen.userName )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.loginScreen.password )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.loginScreen.loginButton )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.loginScreen.acceptTerms )
			.isDisplayed().should.eventually.be.true
		} );
		
		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			config.loginTest = true;	
			console.log( 'appVersion check test has Completed....'.green );
			done();
		} );
	} );
};