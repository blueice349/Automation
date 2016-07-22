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

	describe( 'Start updateStatus to Arrived at Scene using "drivingToJob.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();
		
		it( 'Should wait for actions button on homeScreen'.green, function () {

			return driver
			.waitForElementById( elements.homeScreen.actions, 20000 )
			.isDisplayed().should.eventually.be.true
		} );

		it( 'should check userRole and go to jobsScreen'. green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.userRole != 'client' 
				&& lastUser.userRole != 'AdminClient' 
			) {
				return driver
				.waitForElementById( elements.homeScreen.jobs, 20000 )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.homeScreen.jobs )
				.click()
				.sleep( 800 )
				.then( function ( isIOS ) {

					if( commons.isIOS() ) {
						return driver
						.elementById( elements.jobsScreen.otherOptions.back )
						.isDisplayed().should.eventually.be.true;
					}
				} );
				
			} else {
				console.log( 'user does not have acces to Jobs Screen'.red );
				return driver
				.sleep( 60 )
			}
		} );

		it( 'Sould look for jobs in "My open Jobs" and "Update Status" to "Towing Job"'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.userRole != 'client' 
				&&  lastUser.userRole != 'AdminClient' 
			) {
				return driver
				.elementByIdIfExists( commons.getItem( elements.jobsScreen.openJobsTab.openJobs, 0 ) )
				.then( function ( openJobs ) {

					if ( openJobs ) {
						console.log( 'Open Jobs found'.red );
						return openJobs
						.click()
						.waitForElementByXPath( commons.textToXPath( elements.jobsScreen.updateStatusOptions.updateStatus ), 10000 )
						.isDisplayed().should.eventually.be.true
						.elementByXPath( commons.textToXPath( elements.jobsScreen.updateStatusOptions.updateStatus ) )
						.click()
						.sleep ( 800 )
						.elementByXPathIfExists( commons.textToXPath( elements.jobsScreen.updateStatusOptions.towing ) )
						.then( function ( towing ) {

							if ( towing ) {
								console.log( ' Updated Statuse to "Towing Job".'.red );
								return towing
								.click();

							} else {
								return driver
								.elementByXPathIfExists( commons.textToXPath( elements.jobsScreen.updateStatusOptions.towingPlus ) )
								.then( function ( towingPlus ) {

									if ( towingPlus ) {
										console.log( 'Updated Status to "Towing Job +"'.red );
										return towingPlus
										.click()
										.sleep ( 1000 )
										.then( function () {

											if ( commons.isAndroid() ) {
												return driver
												.elementByIdIfExists( elements.mobile_MikeRecord.otherFields.textFieldCond )
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
										.elementById( elements.mobile_MikeRecord.otherFields.textFieldCond )
										.isDisplayed().should.eventually.be.true
										.elementById( elements.mobile_MikeRecord.otherFields.textFieldCond )
										.text()
										.then( function ( textFieldCond ) {

											if ( textFieldCond === '' ) {
												 return commons.sendKeys( driver.elementById( elements.mobile_MikeRecord.otherFields.textFieldCond ), lastUser.userName + ' Conditional Field' );

											} else {
												console.log( 'textFieldCond has the following data: ' + driver.elementById( elements.mobile_MikeRecord.otherFields.textFieldCond ).text() );
											}
										} )
										.elementById( elements.mobile_MikeRecord.otherFields.textFieldReq )
										.isDisplayed().should.eventually.be.true
										.elementById( elements.mobile_MikeRecord.otherFields.textFieldReq )
										.text()
										.then( function ( textFieldReq ) {

											if ( textFieldReq === '' ) {
												 return commons.sendKeys( driver.elementById( elements.mobile_MikeRecord.otherFields.textFieldReq ), lastUser.userName + ' Required Field' );

											} else {
												console.log( 'textFieldReq has the following data: ' + driver.elementById( elements.mobile_MikeRecord.otherFields.textFieldReq ).text() );
											}
										} )
										.elementById( elements.mobile_MikeRecord.otherFields.integerFieldCond )
										.isDisplayed().should.eventually.be.true
										.elementById( elements.mobile_MikeRecord.otherFields.integerFieldCond )
										.text()
										.then( function ( integerFieldCond ) {

											if ( integerFieldCond === '' ) {
												 return commons.sendKeys( driver.elementById( elements.mobile_MikeRecord.otherFields.integerFieldCond ), '1234' );

											} else {
												console.log( 'textFieldCond has the following data: ' + driver.elementById( elements.mobile_MikeRecord.otherFields.integerFieldCond ).text() );
											}
										} )
										.elementByIdIfExists( elements.formScreen.actions )
										.isDisplayed().should.eventually.be.true
										.elementByIdIfExists( elements.formScreen.actions )
										.click()
										.sleep ( 100 )
										.elementByXPath( commons.textToXPath( elements.formScreen.save ) )
										.isDisplayed().should.eventually.be.true
										.elementByXPath( commons.textToXPath( elements.formScreen.save ) )
										.click()
										.sleep( 1000 );

									} else {
										return driver
										.elementByXPathIfExists( commons.textToXPath( alerts.jobScreenAlerts.openJobs.updateFormInfo ) )
										.then( function ( updateFormInfo ) {

											if( updateFormInfo ) {
												console.log( 'No updateStatus go to updateFormInfo'.red );
												return driver
												.elementByXPath( commons.textToXPath( elements.alertButtons.yes ) )
												.isDisplayed().should.eventually.be.true
												.elementByXPath( commons.textToXPath( elements.alertButtons.yes ) )
												.click()
												.sleep ( 100 )
												.then( function () {

													if ( commons.isAndroid() ) {
														return driver
														.elementByIdIfExists( elements.mobile_MikeRecord.otherFields.textFieldCond )
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
												.elementById( elements.mobile_MikeRecord.otherFields.textFieldCond )
												.isDisplayed().should.eventually.be.true
												.elementById( elements.mobile_MikeRecord.otherFields.textFieldCond )
												.text()
												.then( function ( textFieldCond ) {

													if ( textFieldCond == '' ) {
														 return commons.sendKeys( driver.elementById( elements.mobile_MikeRecord.otherFields.textFieldCond ), lastUser.userName + ' Conditional Field' );

													} else {
														console.log( 'textFieldCond has the following data: ' + driver.elementById( elements.mobile_MikeRecord.otherFields.textFieldCond ).text() );
													}
												} )
												.elementById( elements.mobile_MikeRecord.otherFields.textFieldReq )
												.isDisplayed().should.eventually.be.true
												.elementById( elements.mobile_MikeRecord.otherFields.textFieldReq )
												.text()
												.then( function ( textFieldReq ) {

													if ( textFieldReq == '' ) {
														 return commons.sendKeys( driver.elementById( elements.mobile_MikeRecord.otherFields.textFieldReq ), lastUser.userName + ' Conditional Field' );

													} else {
														console.log( 'textFieldReq has the following data: ' + driver.elementById( elements.mobile_MikeRecord.otherFields.textFieldReq ).text() );
													}
												} )
												.elementById( elements.mobile_MikeRecord.otherFields.integerFieldCond )
												.isDisplayed().should.eventually.be.true
												.elementById( elements.mobile_MikeRecord.otherFields.integerFieldCond )
												.text()
												.then( function ( integerFieldCond ) {

													if ( integerFieldCond === '' ) {
														 return commons.sendKeys( driver.elementById( elements.mobile_MikeRecord.otherFields.integerFieldCond ), '1234' );

													} else {
														console.log( 'textFieldCond has the following data: ' + driver.elementById( elements.mobile_MikeRecord.otherFields.integerFieldCond ).text() );
													}
												} )
												.elementByIdIfExists( elements.formScreen.actions )
												.isDisplayed().should.eventually.be.true
												.elementByIdIfExists( elements.formScreen.actions )
												.click()
												.sleep ( 100 )
												.elementByXPath( commons.textToXPath( elements.formScreen.save ) )
												.isDisplayed().should.eventually.be.true
												.elementByXPath( commons.textToXPath( elements.formScreen.save ) )
												.click()
												.sleep( 1000 );

											} else {
												console.log( 'Current Job does not need to updated to "Towing Job" Status'.red );
												return driver
												.elementByXPath( commons.textToXPath( elements.alertButtons.cancel ) )
												.isDisplayed().should.eventually.be.true
												.elementByXPath( commons.textToXPath( elements.alertButtons.cancel ) )
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
								.waitForElementById( elements.jobsScreen.otherOptions.back, 10000 )
								.isDisplayed().should.eventually.be.true
								.elementById( elements.jobsScreen.otherOptions.back )
								.click()
								.sleep( 1000 );

							} else if ( commons.isAndroid() ) {
								return driver
								.sleep( 100 )
								.back()
								.sleep( 1000 );
							}
						} )

					} else {
						console.log( 'No Open Jobs to Select.'.red);
						if ( commons.isIOS() ) {
							return driver
							.waitForElementById( elements.jobsScreen.otherOptions.back, 10000 )
							.isDisplayed().should.eventually.be.true
							.elementById( elements.jobsScreen.otherOptions.back )
							.click()
							.sleep( 1000 );

						} else if ( commons.isAndroid() ) {
							return driver
							.sleep( 100 )
							.back()
							.sleep( 1000 );
						}
					}
				} );

			} else {
				console.log( 'user does not have acces to Jobs Screen'.red );
				return driver
				.sleep( 60 )
			}
		} );

		it( 'should go back to homeScreen'.green, function () {
					
			return driver
			.elementByIdIfExists( elements.homeScreen.actions )
			.isDisplayed()
			.then( function ( homeScreen ) {

				if ( homeScreen === true ) {
					return driver
					.elementById( elements.homeScreen.actions )
					.isDisplayed().should.eventually.be.true
					.waitForElementById( elements.homeScreen.syncAllowed, 30000 )
					.isDisplayed().should.eventually.be.true
					.elementById( elements.homeScreen.syncAllowed )
					.click()
					.sleep ( 2000 );

				} else if ( homeScreen === false ) {
					if ( commons.isIOS() ) {
						return driver
						.elementById( elements.jobsScreen.otherOptions.back )
						.isDisplayed().should.eventually.be.true
						.elementById( elements.jobsScreen.otherOptions.back )
						.click()
						.sleep( 1000 );

					} else if ( commons.isAndroid() ) {
						return driver
						.sleep( 100 )
						.back()
						.sleep( 1000 );
					}
				}
			} )
			.waitForElementById( elements.homeScreen.syncAllowed, 120000 )
			.isDisplayed().should.eventually.be.true
		} );

		it( 'should set currentTest to "passed"'.green, function ( done ) {
			
			console.log( 'Towing Job test has Passed....'.green );
			done();
		} );
	} );
};