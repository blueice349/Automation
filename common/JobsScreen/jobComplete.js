'use strict';

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

describe( 'Start updateStatus to Arrived at Scene using "jobComplete.js"'.green, function () {

	commons.beforeEachDes();
	commons.beforeEachIt();
	commons.afterEachDes();
	
	it( 'Should wait for actions button on mainMenuScreen'.green, function () {

		return driver
		.waitForElementByName( elements.mainMenuScreen.actions, 20000 )
		.then( function () {
			
			config.currentTest = 'passed';
		} );
	} );

	it( 'should check userRole and go to jobsScreen'. green, function () {
		
		if ( Store.get( 'lastUser' ).userRole != 'client' && Store.get( 'lastUser' ).userRole != 'AdminClient' ) {
			return driver
			.waitForElementByName( elements.mainMenuScreen.jobs, 20000 )
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

	it( 'should check tabs on jobsScreen are there'.green, function () {
				
		if (  Store.get( 'lastUser' ).userRole != 'client' &&  Store.get( 'lastUser' ).userRole != 'AdminClient' ) {
			return driver
			.elementByName( elements.jobsScreen.newJobsTab.newJobsHeader )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.jobsScreen.openJobsTab.currentJobsHeader )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.jobsScreen.otherOpenJobsTab.otherOpenJobsHeader )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.jobsScreen.appointmentJobsTab.appointmentsHeader )
			.isDisplayed().should.eventually.be.true
			.then( function () {

				config.currentTest = 'passed';
			} );
		} else {
			console.log( 'current user does not have the jobsScreen'.green );
			return driver
			.elementByName( elements.mainMenuScreen.jobs )
			.isDisplayed().should.eventually.be.false
			.sleep( 10 )
			.then( function () {

				config.currentTest = 'passed';
			} );
		}
	} );

	it( 'Sould look for jobs in "My open Jobs" and "Update Status" to "Job Complete"'.green, function () {
		
		if (  Store.get( 'lastUser' ).userRole != 'client' &&  Store.get( 'lastUser' ).userRole != 'AdminClient' ) {

			return driver
			.elementByNameIfExists( commons.getItem( elements.jobsScreen.openJobsTab.openJobs, 0 ) )
			.then( function ( openJobs ) {

				if ( openJobs ) {
					console.log( 'Open Jobs found'.red );
					return openJobs
					.click()
					.waitForElementByName( elements.jobsScreen.updateStatusOptions.updateStatus, 10000 )
					.click()
					.sleep ( 800 )
					.elementByNameIfExists( elements.jobsScreen.updateStatusOptions.jobComplete )
					.then( function ( jobComplete ) {

						if ( jobComplete ) {
							console.log( ' Updated Statuse to "Job Complete".'.red );
							return jobComplete
							.click();

						} else {
							return driver
							.elementByNameIfExists( elements.jobsScreen.updateStatusOptions.jobCompletePlus )
							.then( function ( jobCompletePlus ) {

								if ( jobCompletePlus ) {
									console.log( 'Updated Status to "Job Complete +"'.red );
									return jobCompletePlus
									.click()
									.sleep ( 1000 )
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
									} )
									.elementByNameIfExists( elements.formScreen.actions )
									.click()
									.sleep ( 100 )
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
											.click()
											.sleep ( 1000 )
											.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond )
											.text()
											.then( function ( textFieldCond ) {

												if ( textFieldCond == '' ) {
													 return commons.sendKeys( driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond ), Store.get( 'lastUser' ).userName + ' Conditional Field' );

												} else {
													console.log( 'textFieldCond has the following data: ' + driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond ) );
												}
											} )
											.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq )
											.text()
											.then( function ( textFieldReq ) {

												if ( textFieldReq == '' ) {
													 return commons.sendKeys( driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq ), Store.get( 'lastUser' ).userName + ' Conditional Field' );

												} else {
													console.log( 'textFieldReq has the following data: ' + driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq ) );
												}
											} )
											.elementByNameIfExists( elements.formScreen.actions )
											.click()
											.sleep ( 100 )
											.elementByName( elements.formScreen.save )
											.click()
											.sleep( 1000 );

										} else {
											console.log( 'Current Job does not need to updated to "Job Complete" Status'.red );
											return driver
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
			return driver
			.sleep( 60 )
			.then( function () {

				config.currentTest = 'passed';
			} );
		}
	} );

	it( 'should go back to mainMenuScreen'.green, function () {
				
		return driver
		.elementByName( elements.mainMenuScreen.actions )
		.isDisplayed()
		.then( function ( mainMenuScreen ) {

			if ( mainMenuScreen ) {
				return driver
				.elementByName( elements.mainMenuScreen.actions )
				.isDisplayed().should.eventually.be.true
				.waitForElementByName( elements.mainMenuScreen.syncAllowed, 30000 )
				.click()
				.sleep ( 2000 );

			} else {
				if ( commons.isIOS() ) {
					return driver
					.elementByName( elementByName.jobsScreen.back )
					.isDisplayed().should.eventually.be.true
					.elementByName( elementByName.jobsScreen.back )
					.click()
					.sleep( 1000 );

				} else if ( commons.isAndroid() ) {
					return driver
					.back()
					.sleep( 1000 );
				}
			}
		} )
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
		.then( function () {
			
			config.currentTest = 'passed';
		} );
	} );
	
	it( 'should check mainMenuScreen for buttons'.green, function () {	
		
        //Checks for buttons to be displayed on main menu after log on.
		if (  Store.get( 'lastUser' ).userRole == 'admin' ||  Store.get( 'lastUser' ).userRole == 'driver' ) {
			return driver
			.elementByName(  Store.get( 'lastUser' ).name )
			.text().should.become(  Store.get( 'lastUser' ).name )
			.elementByName( elements.mainMenuScreen.actions )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.mainMenuScreen.logout )
			.isDisplayed().should.eventually.be.true
			.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.mainMenuScreen.alerts )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.mainMenuScreen.expiredTags )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.mainMenuScreen.jobs )
			.isDisplayed().should.eventually.be.true
			.then( function () {

				config.currentTest = 'passed';
			} );

		} else if (  Store.get( 'lastUser' ).userRole == 'client' ||  Store.get( 'lastUser' ).userRole == 'AdminClient' ) {
			return driver
			.elementByName(  Store.get( 'lastUser' ).name )
			.text().should.become(  Store.get( 'lastUser' ).name )
			.elementByName( elements.mainMenuScreen.actions )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.mainMenuScreen.logout )
			.isDisplayed().should.eventually.be.true
			.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.mainMenuScreen.alerts )
			.isDisplayed().should.eventually.be.false
			.elementByName( elements.mainMenuScreen.expiredTags )
			.isDisplayed().should.eventually.be.false
			.elementByName( elements.mainMenuScreen.jobs )
			.isDisplayed().should.eventually.be.false
			.then( function () {

				config.currentTest = 'passed';
			} );
		}
	} );

	it( 'should set currentTest to "passed"'.green, function ( done ) {
		
		console.log( 'Job Complete test has Passed....'.green );
		config.currentTest = 'passed';
		done();
	} );
} );
