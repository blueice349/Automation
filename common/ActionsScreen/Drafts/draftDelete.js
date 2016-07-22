'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../../helpers/setup' );
	var alerts   = require( '../../../helpers/alerts' );
	var assert   = require( 'assert' );
	var caps     = require( '../../../helpers/caps' );
	var config   = require( '../../../helpers/Config' );
	var commons  = require( '../../../helpers/Commons' );
	var elements = require( '../../../helpers/elements' );
	var login    = require( '../../../helpers/loginTable' );
	var Store    = require( '../../../helpers/Store' );
	var driver = config.driver;

	describe( 'Start Delete Draft(s) Process using "draftDelete.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'should wait for syncAllowed.'.green, function () {
			return driver
			.waitForElementById( elements.homeScreen.syncAllowed, 20000 )
			.isDisplayed().should.eventually.be.true
		} );
		
		it( 'Should go to Actions Screen'.green, function() {
			
			return driver
			.waitForElementById( elements.homeScreen.syncAllowed, 120000 )
			.isDisplayed().should.eventually.be.true
			.elementById( elements.homeScreen.actions )
			.isDisplayed().should.eventually.be.true
			.elementById( elements.homeScreen.actions )
			.click()
			.sleep( 800 )
		} );

		it( 'Should go to the drafts Screen from the actions screen.'.green, function () {

			return driver
			.elementById( elements.actionsScreen.drafts )
			.isDisplayed().should.eventually.be.true
			.elementById( elements.actionsScreen.drafts )
			.click()
			.sleep( 800 )
			.elementByIdIfExists( elements.draftsScreen.search )
			.then( function ( hideKeyboard ) {

				if ( hideKeyboard && commons.isAndroid() ) {
					return driver
					.hideKeyboard()
					.sleep ( 200 );
				}
			} );
		} );

		it( 'Should delete draft(s) from actions screen --> drafts screen.'.green, function () {

			return driver
			.elementByIdIfExists( commons.getItem( elements.draftsScreen.draft, 0 ) )
			.then( function ( drafts ) {

				if ( drafts ) {
					return drafts
					.click()
					.sleep( 1000 )
					.waitForElementByXPath( commons.textToXPath( elements.alertButtons.deleteRecord ), 10000 )
					.isDisplayed().should.eventually.be.true
					.elementByXPath( commons.textToXPath( elements.alertButtons.deleteRecord ) )
					.click()
					.sleep( 2000 );

				} else {
					console.log( 'No Drafts to Delete.'.red);
				}
			} )
		} );

		it( 'Should go back to the actionsScreen from draftsScreen.'.green, function () {
			
			if ( commons.isIOS() ) {
				return driver
				.elementById( elements.draftsScreen.back )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.draftsScreen.back )
				.click()
				.sleep( 1000 )

			} else if ( commons.isAndroid() ) {
				return driver
				.back()
				.sleep( 1000 )
			}
		} );

		it( 'Should go back to the homeScreen from actionsScreen.'.green, function() {

			return driver
			.waitForElementById( elements.actionsScreen.drafts, 120000 )
			.then( function () {

				if ( commons.isIOS() ) {
					return driver
					.elementById( elements.actionsScreen.back )
					.isDisplayed().should.eventually.be.true
					.elementById( elements.actionsScreen.back )
					.click()
					.sleep( 1000 )

				} else if ( commons.isAndroid() ) {
					return driver
					.waitForElementById( elements.actionsScreen.drafts, 3000 )
					.isDisplayed().should.eventually.be.true
					.sleep( 200 )
					.back()
					.sleep( 1000 )
				}
			} )

			.waitForElementById( elements.homeScreen.syncAllowed )
			.then( function ( sync ) {

				if ( sync ) {
					return driver
					.elementById( elements.homeScreen.syncAllowed )
					.click()
					.sleep ( 2000 )
					.elementById( elements.homeScreen.actions )
					.isDisplayed()
					.then( function ( homeScreen ) {

						if ( !homeScreen ) {
							if ( commons.isIOS() ) {
								return driver
								.waitForElementById( elements.jobsScreen.otherOptions.back, 10000 )
								.click()
								.sleep( 1000 );

							} else if ( commons.isAndroid() ) {
								return driver
								.back()
								.sleep( 1000 );
							}
						}
					} );
				}
			} );
		} );

		it( 'should set currentTest to "passed"'.green, function ( done ) {
			
			console.log( 'Delete a Draft has Psssed....'.green );
			done();
		} );
	} );
};