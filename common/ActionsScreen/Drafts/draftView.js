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

	describe( 'Start View Draft(s) Process'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'should wait for syncAllowed.'.green, function () {
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 20000 )
			.isDisplayed().should.eventually.be.true
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );
		
		it( 'Should go to Actions Screen from homeScreen'.green, function() {
			
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.actions )
			.isDisplayed().should.eventually.be.true
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
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.actionsScreen.drafts )
			.click()
			.sleep( 800 )
			.elementByNameIfExists( elements.draftsScreen.search )
			.then( function ( hideKeyboard ) {

				if ( hideKeyboard  && commons.isAndroid() ) {
					return driver	
					.hideKeyboard()
					.sleep ( 200 );
				}
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should click on first draft from actions screen --> drafts screen.'.green, function () {

			return driver
			.elementByNameIfExists( commons.getItem( elements.draftsScreen.draft, 0 ) )
			.then( function ( drafts ) {

				if ( drafts ) {
					return drafts
					.click()
					.sleep( 1000 )
					.then( function () {
						
						config.canView     = true; 
						config.currentTest = 'passed';
					} );

				} else {
					console.log( 'No Drafts to view.'.red);
					config.canView     = false;
					config.currentTest = 'passed';
				}
			} )
		} );

		it( 'Should check make sure "Edit, View & Delete" show once node has been clicked.'.green, function () {
			
			if ( config.canView === true ) {
				console.log( 'User has a draft to view.'.red );
				return driver
				.waitForElementByName( elements.draftsScreen.view, 10000 )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.draftsScreen.edit )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.draftsScreen.cancel )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.draftsScreen.edit )
				.isDisplayed().should.eventually.be.true
				.sleep( 2000 )
				.then( function () {

					config.currentTest = 'passed';
				} );
			} else {
				console.log( 'No Drafts to view.'.red);
				config.currentTest = 'passed';
			}
		} );

		it( 'Should click "View" on the current selected draft.'.green, function () {
			
			if ( config.canView === true ) {
				console.log( 'User has a draft to view.'.red );
				return driver
				.elementByName( elements.draftsScreen.view )
				.click()
				.then( function () {

					config.currentTest = 'passed';
				} );
			} else {
				console.log( 'No Drafts to view.'.red);
				config.currentTest = 'passed';
			}
		} );

		it( 'Should go back to the draftsScreen from nodeView.'.green, function () {
			
			if ( commons.isAndroid() && config.canView === true ) {
				return driver
				.back()
				.sleep( 1000 )
				.then( function () {

					config.canView     = false
					config.currentTest = 'passed';
				} )

			} else if ( commons.isIOS() && config.canView === true ) {
				return driver
				.elementByName( elements.formScreen.back )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.formScreen.back )
				.click()
				.sleep( 1000 )
				.then( function () {

					config.canView     = false
					config.currentTest = 'passed';
				} );

			} else {
				console.log( 'No drafts to view. User should already be on the draftsScreen'.red );
				config.canView     = false
				config.currentTest = 'passed';
			}
		} );

		it( 'Should go make sure user is on the actionsScreen and check for buttons.'.green, function () {

			if ( commons.isIOS() ) {
				return driver
				.waitForElementByName( elements.actionsScreen.drafts, 120000 )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.actionsScreen.back )
				.isDisplayed().should.eventually.be.true
				.sleep( 1000 )
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( commons.isAndroid() ) {
				return driver
				.waitForElementByName( elements.actionsScreen.drafts, 120000 )
				.isDisplayed().should.eventually.be.true
				.sleep( 1000 )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'Should go back to the homeScreen from actionsScreen.'.green, function () {

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
				.back()
				.sleep( 1000 )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );
			
		it( 'Should wait for syncAllowed and sync data.'.green, function () {

			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 30000 )
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
						.isDisplayed().should.eventually.be.true
						.elementByName( elements.jobsScreen.otherOptions.back )
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

		it( 'should set currentTest to "passed"'.green, function ( done ) {
			
			console.log( 'Save A Draft has Psssed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};