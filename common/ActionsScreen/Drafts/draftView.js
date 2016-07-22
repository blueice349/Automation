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

	describe( 'Start View Draft(s) Process using "draftView.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'should wait for syncAllowed.'.green, function () {
			return driver
			.waitForElementById( elements.homeScreen.syncAllowed, 20000 )
			.isDisplayed().should.eventually.be.true
		} );
		
		it( 'Should go to Actions Screen from homeScreen'.green, function() {
			
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

				if ( hideKeyboard  
					&& commons.isAndroid() 
				) {
					return driver	
					.hideKeyboard()
					.sleep ( 200 );
				}
			} );
		} );

		it( 'Should click on first draft from actions screen --> drafts screen.'.green, function () {

			return driver
			.elementByIdIfExists( commons.getItem( elements.draftsScreen.draft, 0 ) )
			.then( function ( drafts ) {

				if ( drafts ) {
					return drafts
					.click()
					.sleep( 1000 )
					.then( function () {
						
						config.canView = true;
					} );

				} else {
					console.log( 'No Drafts to view.'.red);
					config.canView = false;
				}
			} )
		} );

		it( 'Should check make sure "Edit, View & Delete" show once node has been clicked.'.green, function () {
			
			if ( config.canView === true ) {
				console.log( 'User has a draft to view.'.red );
				return driver
				.waitForElementByXPath( commons.textToXPath(  elements.draftsScreen.view ), 10000 )
				.isDisplayed().should.eventually.be.true
				.elementByXPath( commons.textToXPath( elements.draftsScreen.edit ) )
				.isDisplayed().should.eventually.be.true
				.elementByXPath( commons.textToXPath( elements.draftsScreen.cancel ) )
				.isDisplayed().should.eventually.be.true
				.elementByXPath( commons.textToXPath(  elements.draftsScreen.edit ) )
				.isDisplayed().should.eventually.be.true
				.sleep( 2000 )
			
			} else {
				console.log( 'No Drafts to view.'.red);
			}
		} );

		it( 'Should click "View" on the current selected draft.'.green, function () {
			
			if ( config.canView === true ) {
				console.log( 'User has a draft to view.'.red );
				return driver
				.elementByXPath( commons.textToXPath( elements.draftsScreen.view ) )
				.click()
			
			} else {
				console.log( 'No Drafts to view.'.red);
			}
		} );

		it( 'Should go back to the draftsScreen from nodeView.'.green, function () {
			
			if ( commons.isAndroid() 
				&& config.canView === true 
			) {
				return driver
				.back()
				.sleep( 1000 )
				.then( function () {

					config.canView = false
				} )

			} else if ( commons.isIOS() 
					   && config.canView === true 
			) {
				return driver
				.elementById( elements.formScreen.back )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.formScreen.back )
				.click()
				.sleep( 1000 )
				.then( function () {

					config.canView     = false
					config.currentTest = 'passed';
				} );

			} else {
				console.log( 'No drafts to view. User should already be on the draftsScreen'.red );
				config.canView = false
			}
		} );

		it( 'Should go make sure user is on the actionsScreen and check for buttons.'.green, function () {

			if ( commons.isIOS() ) {
				return driver
				.waitForElementById( elements.actionsScreen.drafts, 120000 )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.actionsScreen.back )
				.isDisplayed().should.eventually.be.true
				.sleep( 1000 )

			} else if ( commons.isAndroid() ) {
				return driver
				.waitForElementById( elements.actionsScreen.drafts, 120000 )
				.isDisplayed().should.eventually.be.true
				.sleep( 1000 )
			}
		} );

		it( 'Should go back to the homeScreen from actionsScreen.'.green, function () {

			if ( commons.isIOS() ) {
				return driver
				.elementById( elements.actionsScreen.back )
				.click()
				.sleep( 1000 )

			} else if ( commons.isAndroid() ) {
				return driver
				.back()
				.sleep( 1000 )
			}
		} );
			
		it( 'Should wait for syncAllowed and sync data.'.green, function () {

			return driver
			.waitForElementById( elements.homeScreen.syncAllowed, 30000 )
			.elementById( elements.homeScreen.syncAllowed )
			.click()
			.sleep ( 2000 )
			.elementByIdIfExists( elements.homeScreen.actions )
			.isDisplayed()
			.then( function ( homeScreen ) {

				if ( homeScreen === false ) {
					if ( commons.isIOS() ) {
						return driver
						.waitForElementById( elements.jobsScreen.otherOptions.back, 10000 )
						.isDisplayed().should.eventually.be.true
						.elementById( elements.jobsScreen.otherOptions.back )
						.click()
						.sleep( 1000 );

					} else if ( commons.isAndroid() ) {
						return driver
						.back()
						.sleep( 1000 );
					}
				}
			} );
		} );	

		it( 'should set currentTest to "passed"'.green, function ( done ) {
			
			console.log( 'Save A Draft has Psssed....'.green );
			done();
		} );
	} );
};