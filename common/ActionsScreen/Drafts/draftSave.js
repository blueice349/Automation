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

	describe( 'Start Save Draft(s) Process using "draftSave.js"'.green, function () {

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

		it( 'Should edit a saved draft from actions screen --> drafts screen.'.green, function () {

			return driver
			.elementByIdIfExists( commons.getItem( elements.draftsScreen.draft, 0 ) )
			.then( function ( drafts ) {

				if ( drafts ) {
					return drafts
					.click()
					.sleep( 1000 )
					.waitForElementByXPath( commons.textToXPath( elements.draftsScreen.edit ), 10000 )
					.isDisplayed().should.eventually.be.true
					.elementByXPath( commons.textToXPath( elements.draftsScreen.view ) )
					.isDisplayed().should.eventually.be.true
					.elementByXPath( commons.textToXPath( elements.draftsScreen.cancel ) )
					.isDisplayed().should.eventually.be.true
					.elementByXPath( commons.textToXPath( elements.draftsScreen.edit ) )
					.isDisplayed().should.eventually.be.true
					.elementByXPath( commons.textToXPath( elements.draftsScreen.edit ) )
					.click()
					.sleep( 2000 )

				} else {
					console.log( 'No Drafts to edit.'.red);
				}
			} )
		} );

		it( 'should hideKeyboard if needed,'.green, function () {
			
			var alertDone = driver.elementByXPathIfExists( commons.textToXPath( elements.alertButtons.done ) ).isDisplayed()
			var lastUser  = Store.get( 'lastUser' );
			return driver
			.elementByIdIfExists( elements.formScreen.actions )
			.then( function ( actions ) {

				if ( actions ) {
					return driver
					.sleep( 1000 )
					.elementByIdIfExists( elements.mobile_MikeRecord.otherFields.textFieldCond )
					.isDisplayed()
					.then( function ( keyboard ) {
						
						if ( commons.isAndroid() 
							&& keyboard != true 
						) {
							console.log( 'Android keyboard is visible.'.red );
							return driver
							.hideKeyboard()
						
						} else if ( commons.isIOS() 
								   && alertDone === true 
					   	) {
							console.log( 'iOS keyboard is visible.'.red );
							return driver
							.elementByXPath( commons.textToXPath( elements.alertButtons.done ) )
							.click()

						} else {
							console.log( 'Keyboard does not need to be hidden at this time.'.red );
							config.currentTest = 'passed';
						}
					} );

				} else {
					console.log( 'Keyboard does not need to be hidden at this time.'.red );
				}
			} );
		} );

		it( 'Should check for text in integerFieldCond and add text where needed.'.green, function() {

			var lastUser = Store.get( 'lastUser' );
			return driver
			.elementByIdIfExists( elements.formScreen.actions )
			.then( function ( actions ) {

				if ( actions ) {
					return driver
					.sleep( 1000 )
					.elementById( elements.mobile_MikeRecord.otherFields.integerFieldCond )
					.isDisplayed().should.eventually.be.true
					.elementById( elements.mobile_MikeRecord.otherFields.integerFieldCond )
					.text()
					.then( function ( integerFieldCond ) {

						if ( integerFieldCond === '' ) {
							 return commons.sendKeys( driver.elementById( elements.mobile_MikeRecord.otherFields.integerFieldCond ), '12345' );
						
						} else {
							console.log( 'integerFieldCond has the following data: ' + integerFieldCond );
						}
					} )
				
				} else {
					console.log( 'Not in a draft edit screen.'.red );
				}
			} );
		} );

		it( 'Should check for text in textFieldReq and add text where needed.'.green, function() {

			var lastUser = Store.get( 'lastUser' );
			return driver
			.elementByIdIfExists( elements.formScreen.actions )
			.then( function ( actions ) {

				if ( actions ) {
					return driver
					.sleep( 1000 )
					.elementById( elements.mobile_MikeRecord.otherFields.textFieldReq )
					.isDisplayed().should.eventually.be.true
					.elementById( elements.mobile_MikeRecord.otherFields.textFieldReq )
					.text()
					.then( function ( textFieldReq ) {

						if ( textFieldReq === '' ) {
							 return commons.sendKeys( driver.elementById( elements.mobile_MikeRecord.otherFields.textFieldReq ), lastUser.userName + ' Conditional Field' );

						} else {
							console.log( 'textFieldReq has the following data: ' + textFieldReq );
						}
					} );
				
				} else {
					console.log( 'Not in a draft edit screen.'.red );
				}
			} );
		} );

		it( 'Should check for text in textFieldCond and add text where needed.'.green, function() {

			var lastUser = Store.get( 'lastUser' );
			return driver
			.elementByIdIfExists( elements.formScreen.actions )
			.then( function ( actions ) {

				if ( actions ) {
					return driver
					.sleep( 1000 )
					.elementById( elements.mobile_MikeRecord.otherFields.textFieldCond )
					.isDisplayed().should.eventually.be.true
					.elementById( elements.mobile_MikeRecord.otherFields.textFieldCond )
					.text()
					.then( function ( textFieldCond ) {

						if ( textFieldCond === '' ) {
							 return commons.sendKeys( driver.elementById( elements.mobile_MikeRecord.otherFields.textFieldCond ), lastUser.userName + ' Conditional Field' );

						} else {
							console.log( 'textFieldCond has the following data: ' + textFieldCond );
						}
					} )
				
				} else {
					console.log( 'Not in a draft edit screen.'.red );
				}
			} );
		} );

		it( 'Should save draft and/or go back to the actionsScreen from draftsScreen.'.green, function () {
			
			return driver
			.sleep( 1000 )
			.elementByIdIfExists( elements.formScreen.actions )
			.then( function ( formScreenActions ) {

				if ( formScreenActions ) {
					return driver
					.elementById( elements.formScreen.actions )
					.isDisplayed().should.eventually.be.true
					.elementById( elements.formScreen.actions )
					.click()
					.elementByXPath( commons.textToXPath( elements.formScreen.save ) )
					.isDisplayed().should.eventually.be.true
					.elementByXPath( commons.textToXPath( elements.formScreen.save ) )
					.click()
					.sleep( 1000 )
					.then( function () {

						if ( commons.isIOS() ) {
							return driver
							.elementById( elements.draftsScreen.back )
							.isDisplayed().should.eventually.be.true
							.elementById( elements.draftsScreen.back )
							.click()
							.sleep( 1000 );

						} else if ( commons.isAndroid() ) {
							return driver
							.sleep( 1000 )
							.back()
							.sleep( 1000 );
						}	
					} )

				} else {
					console.log( 'No Drafts to Save.'.red);
					if ( commons.isIOS() ) {
						return driver
						.elementById( elements.draftsScreen.back )
						.isDisplayed().should.eventually.be.true
						.elementById( elements.draftsScreen.back )
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

		it( 'Should go back to the homeScreen from actionsScreen.'.green, function () {

			if ( commons.isIOS() ) {
				return driver
				.waitForElementById( elements.actionsScreen.drafts, 120000 )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.actionsScreen.back )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.actionsScreen.back )
				.click()
				.sleep( 1000 )

			} else if ( commons.isAndroid() ) {
				return driver
				.waitForElementById( elements.actionsScreen.drafts, 120000 )
				.isDisplayed().should.eventually.be.true
				.back()
				.sleep( 1000 )
			}
		} );
			
		it( 'Should wait for syncAllowed and press syncAllowed.'.green, function () {

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