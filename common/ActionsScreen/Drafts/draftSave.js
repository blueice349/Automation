'use strict';

require( 'colors' );
var config   = require( '../../../helpers/Config' );
var elements = require( '../../../helpers/elements' );
var commons  = require( '../../../helpers/Commons' );
var Store    = require( '../../../helpers/Store' );

var driver = config.driver;


describe( 'Start Save Draft(s) Process'.green, function () {

	it( 'Should Save draft(s) from the actions--> drafts screen.'.green, function ( done ) {
		var lastUser = Store.get( 'lastUser' );
		driver
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
		.elementByName( elements.mainMenuScreen.actions )
		.click()
		.sleep( 800 )
		.elementByName( elements.actionsScreen.drafts )
		.click()
		.sleep( 800 )
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

					if ( commons.isAndroid() ) {
						return driver
						.hideKeyboard();
					}
				} )
				.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq )
				.then( function ( textFieldReq ) {

						return commons.sendKeys( textFieldReq, lastUser.userName + ' Required Field' );
				} )
				.elementByName( elements.formScreen.actions )
				.click()
				.elementByName( elements.formScreen.save )
				.click()
				.sleep( 1000 )
				.then( function () {

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
				} );

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
				return driver;
			}
			return driver;
		} ) 
		.waitForElementByName( elements.actionsScreen.drafts, 180000 )
		.then( function () {

			if ( commons.isIOS() ) {
				return driver
				.elementByName( elements.actionsScreen.back )
				.click()
				.sleep( 1000 );

			} else if ( commons.isAndroid() ) {
				return driver
				.waitForElementByName( elements.actionsScreen.drafts, 3000 )
				.sleep( 200 )
				.back()
				.sleep( 1000 );
			}
		} )
		.waitForElementByName( elements.mainMenuScreen.syncAllowed )
		.then( function ( sync ) {

			if ( sync ) {
				return driver
				.elementByName( elements.mainMenuScreen.syncAllowed )
				.click()
				.sleep ( 2000 )
				.elementByName( elements.mainMenuScreen.actions )
				.isDisplayed()
				.then( function ( mainMenuScreen ) {

					if ( !mainMenuScreen ) {
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
			return driver;
			} )
		.then( function () {

			console.log( 'Draft Saved Test Completed....'.green );
			config.currentTest = 'passed';
			done();
	 	} );
	} );
} );
