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

				if ( hideKeyboard  
					&& commons.isAndroid() 
				) {
					return driver	
					.hideKeyboard()
					.sleep ( 200 );
				}
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should edit a saved draft from actions screen --> drafts screen.'.green, function () {

			return driver
			.elementByNameIfExists( commons.getItem( elements.draftsScreen.draft, 0 ) )
			.then( function ( drafts ) {

				if ( drafts ) {
					return drafts
					.click()
					.sleep( 1000 )
					.waitForElementByName( elements.draftsScreen.edit, 10000 )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.draftsScreen.view )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.draftsScreen.cancel )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.draftsScreen.edit )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.draftsScreen.edit )
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

		it( 'should hideKeyboard if needed,'.green, function () {
			
			var alertDone = driver.elementByNameIfExists( elements.alertButtons.done ).isDisplayed()
			var lastUser  = Store.get( 'lastUser' );
			return driver
			.elementByNameIfExists( elements.formScreen.actions )
			.then( function ( actions ) {

				if ( actions ) {
					return driver
					.sleep( 1000 )
					.elementByNameIfExists( elements.mobile_MikeRecord.otherFields.textFieldCond )
					.isDisplayed()
					.then( function ( keyboard ) {
						
						if ( commons.isAndroid() 
							&& keyboard != true 
						) {
							console.log( 'Android keyboard is visible.'.red );
							return driver
							.hideKeyboard()
							.then( function () {

								config.currentTest = 'passed';
							} );
						
						} else if ( commons.isIOS() 
								   && alertDone === true 
					   	) {
							console.log( 'iOS keyboard is visible.'.red );
							return driver
							.elementByName( elements.alertButtons.done )
							.click()
							.then( function () {

								config.currentTest = 'passed';
							} );
						} else {
							console.log( 'Keyboard does not need to be hidden at this time.'.red );
							config.currentTest = 'passed';
						}
					} );
				} else {
					console.log( 'Keyboard does not need to be hidden at this time.'.red );
					config.currentTest = 'passed';
				}
			} );
		} );

		it( 'Should check for text in integerFieldCond and add text where needed.'.green, function() {

			var lastUser = Store.get( 'lastUser' );
			return driver
			.elementByNameIfExists( elements.formScreen.actions )
			.then( function ( actions ) {

				if ( actions ) {
					return driver
					.sleep( 1000 )
					.elementByName( elements.mobile_MikeRecord.otherFields.integerFieldCond )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.mobile_MikeRecord.otherFields.integerFieldCond )
					.text()
					.then( function ( integerFieldCond ) {

						if ( integerFieldCond === '' ) {
							 return commons.sendKeys( driver.elementByName( elements.mobile_MikeRecord.otherFields.integerFieldCond ), '12345' );
						
						} else {
							console.log( 'integerFieldCond has the following data: ' + integerFieldCond );
						}
					} )
				
				} else {
					console.log( 'Not in a draft edit screen.'.red );
				}
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should check for text in textFieldReq and add text where needed.'.green, function() {

			var lastUser = Store.get( 'lastUser' );
			return driver
			.elementByNameIfExists( elements.formScreen.actions )
			.then( function ( actions ) {

				if ( actions ) {
					return driver
					.sleep( 1000 )
					.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq )
					.text()
					.then( function ( textFieldReq ) {

						if ( textFieldReq === '' ) {
							 return commons.sendKeys( driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq ), lastUser.userName + ' Conditional Field' );

						} else {
							console.log( 'textFieldReq has the following data: ' + textFieldReq );
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

		it( 'Should check for text in textFieldCond and add text where needed.'.green, function() {

			var lastUser = Store.get( 'lastUser' );
			return driver
			.elementByNameIfExists( elements.formScreen.actions )
			.then( function ( actions ) {

				if ( actions ) {
					return driver
					.sleep( 1000 )
					.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond )
					.text()
					.then( function ( textFieldCond ) {

						if ( textFieldCond === '' ) {
							 return commons.sendKeys( driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond ), lastUser.userName + ' Conditional Field' );

						} else {
							console.log( 'textFieldCond has the following data: ' + textFieldCond );
						}
					} )
				
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
			.sleep( 1000 )
			.elementByNameIfExists( elements.formScreen.actions )
			.then( function ( formScreenActions ) {

				if ( formScreenActions ) {
					return driver
					.elementByName( elements.formScreen.actions )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.formScreen.actions )
					.click()
					.elementByName( elements.formScreen.save )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.formScreen.save )
					.click()
					.sleep( 1000 )
					.then( function () {

						if ( commons.isIOS() ) {
							return driver
							.elementByName( elements.draftsScreen.back )
							.isDisplayed().should.eventually.be.true
							.elementByName( elements.draftsScreen.back )
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
						.elementByName( elements.draftsScreen.back )
						.isDisplayed().should.eventually.be.true
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
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.actionsScreen.back )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.actionsScreen.back )
				.click()
				.sleep( 1000 )
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( commons.isAndroid() ) {
				return driver
				.waitForElementByName( elements.actionsScreen.drafts, 120000 )
				.isDisplayed().should.eventually.be.true
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