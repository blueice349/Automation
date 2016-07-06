'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../helpers/setup' );
	var alerts   = require( '../../helpers/alerts' );
	var assert   = require( 'assert' );
	var caps     = require( '../../helpers/caps' );
	var config   = require( '../../helpers/Config' );
	var commons  = require( '../../helpers/Commons' );
	var elements = require( '../../helpers/elements' );
	var login    = require( '../../helpers/loginTable' );
	var Store    = require( '../../helpers/Store' );

	var driver   = config.driver;

	describe( 'Start updateStatus to Driving to Job using "drivingToJob.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		
		it( 'Should wait for actions button on homeScreen'.green, function () {

			return driver
			.waitForElementByName( elements.homeScreen.actions, 20000 )
			.isDisplayed().should.eventually.be.true
			.then( function () {
				
				config.currentTest = 'passed';
			} );
		} );

		it( 'should check userRole and go to jobsScreen'. green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.userRole != 'client' 
				&& lastUser.userRole != 'AdminClient' 
			) {
				return driver
				.waitForElementByName( elements.homeScreen.jobs, 20000 )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.homeScreen.jobs )
				.click()
				.sleep( 800 )
				.then( function ( isIOS ) {

					if( commons.isIOS() ) {
						return driver
						.elementByName( elements.jobsScreen.otherOptions.back )
						.isDisplayed().should.eventually.be.true;
					}
				} )
				.then( function () {
					
					config.currentTest = 'passed';
				} );
				
			} else {
				console.log( 'user does not have acces to Jobs Screen'.red );
				return driver
				.sleep( 60 )
				.then( function () {
					
					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'Sould look for jobs in "My open Jobs" and "Update Status" to "Driving to Job"'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.userRole != 'client' 
				&&  lastUser.userRole != 'AdminClient' 
			) {
				return driver
				.elementByNameIfExists( commons.getItem( elements.jobsScreen.openJobsTab.openJobs, 0 ) )
				.then( function ( openJobs ) {

					if ( openJobs ) {
						console.log( 'Open Jobs found'.red );
						return openJobs
						.click()
						.waitForElementByName( elements.jobsScreen.updateStatusOptions.updateStatus, 10000 )
						.isDisplayed().should.eventually.be.true
						.elementByName( elements.jobsScreen.updateStatusOptions.updateStatus )
						.click()
						.sleep ( 800 )
						.elementByNameIfExists( elements.jobsScreen.updateStatusOptions.driving )
						.then( function ( driving ) {

							if ( driving ) {
								console.log( ' Updated Statuse to "Driving to Job".'.red );
								return driving
								.click();

							} else {
								return driver
								.elementByNameIfExists( elements.jobsScreen.updateStatusOptions.drivingPlus )
								.then( function ( drivingPlus ) {

									if ( drivingPlus ) {
										console.log( 'Updated Status to "Driving to Job +"'.red );
										return drivingPlus
										.click()
										.sleep ( 1000 )
										.then( function () {

											if ( commons.isAndroid() ) {
												return driver
												.elementByNameIfExists( elements.mobile_MikeRecord.otherFields.textFieldCond )
												.isDisplayed()
												.then( function ( keyboard ) {
													
													if ( keyboard != true ) {
														console.log( 'keyboard is visible.'.red );
														return driver
														.hideKeyboard();
													}
												} )
											}
										} ) 
										.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond )
										.isDisplayed().should.eventually.be.true
										.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond )
										.text()
										.then( function ( textFieldCond ) {

											if ( textFieldCond === '' ) {
												 return commons.sendKeys( driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond ), lastUser.userName + ' Conditional Field' );

											} else {
												console.log( 'textFieldCond has the following data: ' + driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond ) );
											}
										} )
										.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq )
										.isDisplayed().should.eventually.be.true
										.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq )
										.text()
										.then( function ( textFieldReq ) {

											if ( textFieldReq === '' ) {
												 return commons.sendKeys( driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq ), lastUser.userName + ' Required Field' );

											} else {
												console.log( 'textFieldReq has the following data: ' + driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq ) );
											}
										} )
										.elementByNameIfExists( elements.formScreen.actions )
										.isDisplayed().should.eventually.be.true
										.elementByNameIfExists( elements.formScreen.actions )
										.click()
										.sleep ( 100 )
										.elementByName( elements.formScreen.save )
										.isDisplayed().should.eventually.be.true
										.elementByName( elements.formScreen.save )
										.click()
										.sleep( 1000 );

									} else {
										return driver
										.elementByNameIfExists( alerts.jobScreenAlerts.openJobs.updateFormInfo )
										.then( function ( updateFormInfo ) {

											if( updateFormInfo ) {
												console.log( 'No updateStatus go to updateFormInfo'.red );
												return driver
												.elementByName( elements.alertButtons.yes )
												.isDisplayed().should.eventually.be.true
												.elementByName( elements.alertButtons.yes )
												.click()
												.sleep ( 1000 )
												.then( function () {

													if ( commons.isAndroid() ) {
														return driver
														.elementByNameIfExists( elements.mobile_MikeRecord.otherFields.textFieldCond )
														.isDisplayed()
														.then( function ( keyboard ) {
															
															if ( keyboard != true ) {
																console.log( 'keyboard is visible.'.red );
																return driver
																.hideKeyboard();
															}
														} )
													}
												} ) 
												.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond )
												.isDisplayed().should.eventually.be.true
												.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond )
												.text()
												.then( function ( textFieldCond ) {

													if ( textFieldCond == '' ) {
														 return commons.sendKeys( driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond ), lastUser.userName + ' Conditional Field' );

													} else {
														console.log( 'textFieldCond has the following data: ' + driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond ) );
													}
												} )
												.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq )
												.isDisplayed().should.eventually.be.true
												.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq )
												.text()
												.then( function ( textFieldReq ) {

													if ( textFieldReq == '' ) {
														 return commons.sendKeys( driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq ), lastUser.userName + ' Conditional Field' );

													} else {
														console.log( 'textFieldReq has the following data: ' + driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq ) );
													}
												} )
												.elementByNameIfExists( elements.formScreen.actions )
												.isDisplayed().should.eventually.be.true
												.elementByNameIfExists( elements.formScreen.actions )
												.click()
												.sleep ( 100 )
												.elementByName( elements.formScreen.save )
												.isDisplayed().should.eventually.be.true
												.elementByName( elements.formScreen.save )
												.click()
												.sleep( 1000 );

											} else {
												console.log( 'Current Job does not need to updated to "Driving to Job" Status'.red );
												return driver
												.elementByName( elements.alertButtons.cancel )
												.isDisplayed().should.eventually.be.true
												.elementByName( elements.alertButtons.cancel )
												.click();
											}
										} )
									}
								} )
							}
						} )
						.then( function () {

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
						} )

					} else {
						console.log( 'No Open Jobs to Select.'.red);
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

			} else {
				console.log( 'user does not have acces to Jobs Screen'.red );
				config.currentTest = 'passed';
			}
		} );

		it( 'should go back to homeScreen'.green, function () {
					
			return driver
			.elementByNameIfExists( elements.homeScreen.actions )
			.isDisplayed()
			.then( function ( homeScreen ) {

				if ( homeScreen === true ) {
					return driver
					.elementByName( elements.homeScreen.actions )
					.isDisplayed().should.eventually.be.true
					.waitForElementByName( elements.homeScreen.syncAllowed, 30000 )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.homeScreen.syncAllowed )
					.click()
					.sleep ( 2000 );

				} else if ( homeScreen === false ){
					if ( commons.isIOS() ) {
						return driver
						.elementByName( elements.jobsScreen.otherOptions.back )
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
			.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
			.isDisplayed().should.eventually.be.true
			.then( function () {
				
				config.currentTest = 'passed';
			} );
		} );

		it( 'should set currentTest to "passed"'.green, function ( done ) {
			
			console.log( 'Driving to Job test has Passed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};