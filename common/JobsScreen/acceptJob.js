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

var driver = config.driver;


describe( 'Start Accept New Job Process'.green, function () {

	it( 'Should update status to accept job from the jobs screen.'.green, function ( done ) {
		var lastUser = Store.get( 'lastUser' );
		driver
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 20000 )
		.sleep( 1000 )
		.then( function ( user ) {
			if ( lastUser.userRole != 'client' && lastUser.userRole != 'AdminClient' ) {
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
				.elementByName( elements.jobsScreen.newJobsTab.newJobsHeader )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.jobsScreen.openJobsTab.currentJobsHeader )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.jobsScreen.otherOpenJobsTab.otherOpenJobsHeader )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.jobsScreen.appointmentJobsTab.appointmentsHeader )
				.isDisplayed().should.eventually.be.true

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
						//config.synNeeded = no;
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
						return driver;
					}
					return driver;
				} ) 
			} else {
				console.log( 'user does not have acces to Jobs Screen'.red );
				return driver;
			}
		} )
		.elementByName( elements.mainMenuScreen.actions )
		.isDisplayed()
		.then( function ( sync ) {

			if ( sync ) {
				return driver
				.elementByName( elementByName.mainMenuScreen.actions )
				.should.eventually.be.true
				.waitForElementByName( elements.mainMenuScreen.syncAllowed, 30000 )
				.click()
				.sleep ( 2000 );

			} else {
				if ( commons.isIOS() ) {
					return driver
					.elementByName( elementByName.mainMenuScreen.actions )
					.should.eventually.be.true
					.elementByName( elementByName.mainMenuScreen.actions )
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
		.isDisplayed().should.eventually.be.true
		.then( function () {

                  //Checks for buttons to be displayed on main menu after log on.
			if ( lastUser.userRole == 'admin' || lastUser.userRole == 'driver' ) {
				return driver
				.elementByName( lastUser.name )
				.text().should.become( lastUser.name )
				.elementByName( elements.mainMenuScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mainMenuScreen.logout )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mainMenuScreen.syncAllowed )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mainMenuScreen.alerts )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mainMenuScreen.expiredTags )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mainMenuScreen.jobs )
				.isDisplayed().should.eventually.be.true

			} else if ( lastUser.userRole == 'client' || lastUser.userRole == 'AdminClient' ) {
				return driver
				.elementByName( elements.mainMenuScreen.name )
				.text().should.become( name )
				.elementByName( elements.mainMenuScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mainMenuScreen.logout )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mainMenuScreen.syncAllowed )
				.isDisplayed().should.eventually.be.true
			}
		} )
		.then( function () {

			console.log( 'Accepted a Job has Completed....'.green );
			config.currentTest = 'passed';
			done();
	 	} );
	} );
} );
