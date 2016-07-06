'use strict';

module.exports = function () {

	require( 'colors' );
	var config   = require( '../../../helpers/Config' );
	var elements = require( '../../../helpers/elements' );
	var commons  = require( '../../../helpers/Commons' );
	var Store    = require( '../../../helpers/Store' );

	var driver = config.driver;

	describe( 'Start Create New Mobile Mike Node and Save to Drafts using "newDraft3.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'Should make sure lastUser is on homeScreen.'.green, function () {
			
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 20000 )
			.isDisplayed().should.eventually.be.true
		} );

		it( 'Should check permissions & click on the mobileMike plusButton on homeScreen if lastUser has permissions.'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			console.log( 'userName: ' + lastUser.userName + ' userRole: ' + lastUser.userRole ); 
			if ( lastUser.userRole != 'driver' 
				&& lastUser.userRole != 'admin'
			) {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );

			} else if ( lastUser.userRole === 'driver'
				      || lastUser.userRole === 'admin' 
			) {
				console.log( lastUser.userRole + ': User is allowed to create new node'.red );
				return driver
				.elementByName( elements.mobile_MikeRecord.mobileMike + elements.homeScreen.plusButton )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mobile_MikeRecord.mobileMike + elements.homeScreen.plusButton )
				.click()
				.sleep( 1000 )
				.then( function () {

					config.canCreate = true;
				} );
			}
		} );

		it( 'Should hideKeyboard on Android if open.'.green, function () {
	
			if ( config.canCreate != true ) {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );

			} else if ( config.canCreate === true  ) {
				console.log( 'Should check if textFieldReq field is visible, if not hideKeyboard.'.red );
				if ( commons.isAndroid() ) {
					return driver
					.sleep( 1000 ) 
					.elementByNameIfExists( elements.mobile_MikeRecord.otherFields.textFieldReq )
					.isDisplayed()
					.then( function ( keyboard ) {
						
						if ( keyboard != true ) {
							console.log( 'keyboard is visible.'.red );
							return driver
							.hideKeyboard()

						} else {
							console.log( 'isDisplayed, no need to hideKeyboard.'.red );
						}
					} );
				
				} else {
					console.log( 'isIOS'.red );
				}
			}
		} );

		it( 'Should add text in textFieldCond.'.green, function () {

			var lastUser = Store.get( 'lastUser' );

			if ( config.canCreate != true ) {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );

			} else if ( config.canCreate === true ) {
				console.log( 'User should add text in the textFieldCond field'.red );
				return driver
				.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond )
				.then( function ( textFieldCond ) {
					
					return commons.sendKeys( textFieldCond, lastUser.userName + ' Conditional Field' );
				} );
			}
		} );

		it( 'Should click Actions --> Save to Drafts.'.green, function () {

			if ( config.canCreate != true ) {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );

			} else if ( config.canCreate === true  ) {
				console.log( 'User should have click Actions --> Save 3rd time'.red );
				return driver
				.elementByName( elements.formScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.formScreen.actions )
				.click()
				.sleep ( 100 )
				.elementByName( elements.formScreen.saveAsDraft )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.formScreen.saveAsDraft )
				.click()
				.sleep( 2000 )
			}
		} );

		it( 'Should wait for syncAllowed.'.green, function () {

			console.log( 'User should be at the homeScreen and wait for the syncAllowed.'.red );
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 30000 )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.actions )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.syncAllowed )
			.click()
			.sleep ( 2000 )
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'newDraft test has Completed....'.green );
			done();
		} );
	} );
};