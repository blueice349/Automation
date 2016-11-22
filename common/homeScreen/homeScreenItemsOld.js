'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../helpers/setup' );
	var alerts   = require( '../../helpers/alerts' );
	var caps     = require( '../../helpers/caps' );
	var config   = require( '../../helpers/Config' );
	var commons  = require( '../../helpers/Commons' );
	var elements = require( '../../helpers/elements' );
	var login    = require( '../../helpers/loginTable' );
	var Store    = require( '../../helpers/Store' );
	var driver   = config.driver;

	describe( 'Start Check homeScreenItems process using "homeScreenItems.js"'.green, function() {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();
		
		it( 'Should make sure all buttons are visble on homeScreen after intinal sync'.green, function () {
			var lastUser = Store.get( 'lastUser' );
	     	//Checks for buttons to be displayed on main menu after log on.
			if ( lastUser.userRole == 'admin' || lastUser.userRole == 'driver' ) {
				return driver
				.elementByXPath( commons.textToXPath( lastUser.name ) )
				.text().should.eventually.become( lastUser.name )
				.elementById( elements.homeScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.homeScreen.logout )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.homeScreen.syncAllowed )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.homeScreen.alerts )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.homeScreen.jobs )
				.isDisplayed().should.eventually.be.true
				.then( function () {

					if ( lastUser.tagButton == true ) {
						return driver
						.elementById( elements.homeScreen.expiredTags )
						.isDisplayed().should.eventually.be.true
					}
				} );

			} else if ( lastUser.userRole === 'client' || lastUser.userRole === 'AdminClient' ) {
				return driver
				.elementByXPath( commons.textToXPath( lastUser.name ) )
				.text().should.eventually.become( lastUser.name )
				.elementById( elements.homeScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.homeScreen.logout )
				.isDisplayed().should.eventually.be.true
				.waitForElementById( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true	
				.elementByIdIfExists( elements.homeScreen.alerts )
				.then( function ( alerts ) {

					if ( alerts ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} )
				.elementByIdIfExists( elements.homeScreen.expiredTags )
				.then( function ( expiredTags ) {

					if ( expiredTags ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} )
				.elementByIdIfExists( elements.homeScreen.jobs )
				.then( function ( jobs ) {

					if ( jobs ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} );
			} else {
				assert.fail( 'userRole needs to be updates.' );
			}
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'homeScreenItems test has Completed....'.green );
			done();
		} );
	} );
};