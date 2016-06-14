'use strict';

module.exports = function () {

	require( 'colors' );
	var alerts   = require( '../../../helpers/alerts' );
	var config   = require( '../../../helpers/Config' );
	var elements = require( '../../../helpers/elements' );
	var commons  = require( '../../../helpers/Commons' );
	var config   = require( '../../../helpers/Config' );
	var Store    = require( '../../../helpers/Store' );

	var driver   = config.driver;

	describe( 'Start Create New Mobile Mike Node with required field blank and try to save'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'Should make sure lastUser is on homeScreen.'.green, function () {
			
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 20000 )
			.isDisplayed().should.eventually.be.true
			.then( function () {
				
				config.currentTest = 'passed';
			} );
		} );

		it( 'Should check permissions & click on the mobileMike plusButton on homeScreen if lastUser has permissions.'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			console.log( 'userName: ' + lastUser.userName + ' userRole: ' + lastUser.userRole ); 
			if ( lastUser.userRole != 'driver' 
				&& lastUser.userRole != 'admin'
				) {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
				config.currentTest = 'passed';	

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

					config.currentTest = 'passed';	
					config.canCreate   = true;
				} );
			}
		} );

		it( 'Should hideKeyboard on Android if open.'.green, function () {
	
			if ( config.canCreate != true ) {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
				config.currentTest = 'passed';

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
							.then( function () {

								config.currentTest = 'passed';
							} );

						} else {
							console.log( 'isDisplayed, no need to hideKeyboard.'.red );
							config.currentTest = 'passed';
						}
					} );
				} else {
					console.log( 'isIOS'.red );
					config.currentTest = 'passed';
				}
			}
		} );

		it( 'Should add text in textAreaCondReg.'.green, function () {

			var lastUser = Store.get( 'lastUser' );

			if ( config.canCreate != true ) {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
				config.currentTest = 'passed';

			} else if ( config.canCreate === true ) {
				console.log( 'User should add text in the textFieldCond field'.red );
				return driver
				.elementByName( elements.mobile_MikeRecord.otherFields.textAreaCondReg )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mobile_MikeRecord.otherFields.textAreaCondReg )
				.then( function ( textAreaCondReg ) {
					
					return commons.sendKeys( textAreaCondReg, lastUser.userName + ' Text Area Conditional Field' );
				} )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'Should add text in textFieldCond.'.green, function () {

			var lastUser = Store.get( 'lastUser' );

			if ( config.canCreate != true ) {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
				config.currentTest = 'passed';

			} else if ( config.canCreate === true ) {
				console.log( 'User should add text in the textFieldCond field'.red );
				return driver
				.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond )
				.then( function ( textFieldCond ) {
					
					return commons.sendKeys( textFieldCond, lastUser.userName + ' Conditional Field' );
				} )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'Should click Actions --> Save for the first time.'.green, function () {

			if ( config.canCreate != true ) {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
				config.currentTest = 'passed';
			
			} else if ( config.canCreate === true  ) {
				console.log( 'User should have click actions --> save 1st time'.red );
				return driver
				.elementByName( elements.formScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.formScreen.actions )
				.click()
				.sleep ( 100 )
				.elementByName( elements.formScreen.save )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.formScreen.save )
				.click()
				.sleep( 1000 )
				.then( function () {
					
					console.log( 'currentTest passed'.red );
					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'Should Make sure Alert for textFieldReq Field shows and click Ok.'.green, function () {

			if ( config.canCreate != true ) {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
				config.currentTest = 'passed';

			} else if ( config.canCreate === true  ) {
				console.log( 'User should get a alertText about the textFieldReq reguried field'.red );
				return commons.alertText( alerts.nodeEditScreenAlerts.requiredFields.required )
				.elementByName( elements.alertButtons.ok )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.alertButtons.ok )
				.click()
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'Should add text in textFieldReq.'.green, function () {

			var lastUser = Store.get( 'lastUser' );

			if ( config.canCreate != true ) {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
				config.currentTest = 'passed';

			} else if ( config.canCreate === true ) {
				console.log( 'User should enter text into textFieldReq'.red );
				return driver
				.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq )
				.then( function ( textFieldReq ) {
					
					return commons.sendKeys( textFieldReq, lastUser.userName + ' Required Field' );
				} )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'Should click Actions --> Save for the 2nd time.'.green, function () {

			if ( config.canCreate != true ) {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
				config.currentTest = 'passed';

			} else if ( config.canCreate === true  ) {
				console.log( 'User should have click Actions --> Save 3rd time'.red );
				return driver
				.elementByName( elements.formScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.formScreen.actions )
				.click()
				.sleep ( 100 )
				.elementByName( elements.formScreen.save )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.formScreen.save )
				.click()
				.sleep( 2000 )
				.then( function () {

					console.log( 'Node data should have saved.'.red ) ;
					config.currentTest = 'passed';
				} );
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
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'conditionallyRequired test has Completed....'.green );
			config.currentTest = 'passed'
			done();
		} );
	} );
};