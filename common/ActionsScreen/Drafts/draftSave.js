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

	describe( 'Start Save Draft(s) Process'.green, function () {

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

		it( 'Should edit draft(s) from actions screen --> drafts screen.'.green, function () {

			return driver
			.elementByNameIfExists( commons.getItem( elements.draftsScreen.draft, 0 ) )
			.then( function ( drafts ) {

				if ( drafts ) {
					return drafts
					.click()
					.sleep( 1000 )
					.waitForElementByName( elements.draftsScreen.edit, 10000 )
					.click()
					.sleep( 2000 )
					.then( function () {

						config.currentTest = 'passed';
					} );

				} else {
					console.log( 'No Drafts to edit.'.red);
					config.currentTest = 'passed';
				}
			} )
		} );

		it( 'Should check for text in required and conditionally required fields and add text where needed.'.green, function() {

			return driver
			.elementByNameIfExists( elements.formScreen.actions )
			.then( function ( actions ) {

				if ( actions ) {
					return driver
					.sleep( 1000 )
					.then( function () {

						if ( commons.isAndroid() ) {
							return driver
							.hideKeyboard();
						}
					} )
					.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond )
					.text()
					.then( function ( textFieldCond ) {

						if ( textFieldCond === '' ) {
							 return commons.sendKeys( driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond ), Store.get( 'lastUser' ).userName + ' Conditional Field' );

						} else {
							console.log( 'textFieldCond has the following data: ' + driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond ) );
						}
					} )
					.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq )
					.text()
					.then( function ( textFieldReq ) {

						if ( textFieldReq === '' ) {
							 return commons.sendKeys( driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq ), Store.get( 'lastUser' ).userName + ' Conditional Field' );

						} else {
							console.log( 'textFieldReq has the following data: ' + driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq ) );
						}
					} );
				} else {
					console.log( 'Not in a draft edit screen.'.red );
				}
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should save draft and/or go back to the actionsScreen from draftsScreen.'.green, function () {
			
			return driver
			.elementByNameIfExists( elements.formScreen.actions )
			.then( function ( formScreenActions ) {

				if( formScreenActions ) {
					return driver
					.elementByName( elements.formScreen.actions )
					.click()
					.elementByName( elements.formScreen.save )
					.click();

				} else {
					console.log( 'No Drafts to Save.'.red);
					if ( commons.isIOS() ) {
						return driver
						.elementByName( elements.draftsScreen.back )
						.click()
						.sleep( 1000 );

					} else if ( commons.isAndroid() ) {
						return driver
						.back()
						.sleep( 1000 );
					}
				}
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should go back to the homeScreen from actionsScreen.'.green, function () {

			if ( commons.isIOS() ) {
				return driver
				.waitForElementByName( elements.actionsScreen.drafts, 120000 )
				.elementByName( elements.actionsScreen.back )
				.click()
				.sleep( 1000 )
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( commons.isAndroid() ) {
				return driver
				.elementByNameIfExists( 'Space' )
				.then( function ( keyboard ) {

					if ( keyboard ) {
						return driver
						.hideKeyboard()
						.sleep ( 200 );
					}
				} )
				.waitForElementByName( elements.actionsScreen.drafts, 120000 )
				.back()
				.sleep( 1000 )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );
			
		it( 'Should wait for syncAllowed and press syncAllowed.'.green, function () {

			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 30000 )
			.then( function ( sync ) {

				if ( sync ) {
					return driver
					.elementByName( elements.homeScreen.syncAllowed )
					.click()
					.sleep ( 2000 )
					.elementByNameIfExists( elements.homeScreen.actions )
					.isDisplayed()
					.then( function ( homeScreen ) {

						if ( homeScreen === false ) {
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
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );	

		it( 'should set currentTest to "passed"'.green, function ( done ) {
			
			console.log( 'Save A Draft has Psssed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};