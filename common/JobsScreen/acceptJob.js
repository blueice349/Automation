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

	describe( 'Start Accept New Job Process using "acceptJob.js"'.green, function () {

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
				console.log( 'curren user does not have the jobsScreen'.green );
				return driver
				sleep( 10 )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'Sould look for jobs to accept and accept if job is present'.green, function () {
			
			if (  Store.get( 'lastUser' ).userRole != 'client' &&  Store.get( 'lastUser' ).userRole != 'AdminClient' ) {
				return driver
				//.waitForElementByName( elements.jobsScreen.newJobs + 0 + '.', 20000 )
				.elementByNameIfExists( commons.getItem( elements.jobsScreen.newJobsTab.newJobs, 0 ) )
				.then( function ( newJobs ) {

					if ( newJobs ) {
						return newJobs
						.click()
						.sleep( 1000 )
						.waitForElementByName( elements.jobsScreen.updateStatusOptions.acceptJob, 10000 )
						.click().sleep( 1000 )
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
						} );

					} else {
						console.log( 'No New Jobs to Select.'.red);
						//config.syncNeeded = no;
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
				.waitForElementByName( elements.mainMenuScreen.actions, 180000 )
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
				.elementByNameIfExists( elements.mainMenuScreen.alerts )
				.then( function ( alerts ) {

					if ( alerts ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} )
				.elementByNameIfExists( elements.mainMenuScreen.expiredTags )
				.then( function ( expiredTags ) {

					if ( expiredTags ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} )
				.elementByNameIfExists( elements.mainMenuScreen.jobs )
				.then( function ( jobs ) {

					if ( jobs ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'should set currentTest to "passed"'.green, function ( done ) {
			
			console.log( 'Accepted a Job has Psssed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};