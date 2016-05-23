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

	describe( 'Start Delete Draft(s) Process'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'should wait for syncAllowed.'.green, function () {
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 20000 )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );
		
		it( 'Should go to Actions Screen'.green, function() {
			
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
			.elementByName( elements.homeScreen.actions )
			.click()
			.sleep( 800 )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should go to the drafts Screen from the actions screen.'.green, function () {

			return driver
			.elementByName( elements.actionsScreen.drafts )
			.click()
			.sleep( 800 )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should delete draft(s) from actions screen --> drafts screen.'.green, function () {

			return driver
			.elementByNameIfExists( commons.getItem( elements.draftsScreen.draft, 0 ) )
			.then( function ( drafts ) {

				if ( drafts ) {
					return drafts
					.click()
					.sleep( 1000 )
					.waitForElementByName( elements.alertButtons.deleteRecord, 10000 )
					.click()
					.sleep( 2000 )
					.then( function () {

						config.currentTest = 'passed';
					} );

				} else {
					console.log( 'No Drafts to Delete.'.red);
					config.currentTest = 'passed';
				}
			} )
		} );

		it( 'Should go back to the actionsScreen from draftsScreen.'.green, function () {
			
			if ( commons.isIOS() ) {
				return driver
				.elementByName( elements.draftsScreen.back )
				.click()
				.sleep( 1000 )
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( commons.isAndroid() ) {
				return driver
				.hideKeyboard().sleep ( 200 )
				.back()
				.sleep( 1000 )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'Should go back to the homeScreen from actionsScreen.'.green, function() {

			return driver
			.waitForElementByName( elements.actionsScreen.drafts, 120000 )
			.then( function () {

				if ( commons.isIOS() ) {
					return driver
					.elementByName( elements.actionsScreen.back )
					.click()
					.sleep( 1000 )
					.then( function () {

					config.currentTest = 'passed';
				} );

				} else if ( commons.isAndroid() ) {
					return driver
					.waitForElementByName( elements.actionsScreen.drafts, 3000 )
					.sleep( 200 )
					.back()
					.sleep( 1000 )
					.then( function () {

					config.currentTest = 'passed';
				} );
				}
			} )

			.waitForElementByName( elements.homeScreen.syncAllowed )
			.then( function ( sync ) {

				if ( sync ) {
					return driver
					.elementByName( elements.homeScreen.syncAllowed )
					.click()
					.sleep ( 2000 )
					.elementByName( elements.homeScreen.actions )
					.isDisplayed()
					.then( function ( homeScreen ) {

						if ( !homeScreen ) {
							if ( commons.isIOS() ) {
								return driver
								.waitForElementByName( elements.jobsScreen.otherOptions.back, 10000 )
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
			} )
			return driver
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should set currentTest to "passed"'.green, function ( done ) {
			
			console.log( 'Delete a Draft has Psssed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};