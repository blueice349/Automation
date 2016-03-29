'use strict';

require( 'colors' );
var config   = require( '../../helpers/Config' );
var elements = require( '../../helpers/elements' );
var commons  = require( '../../helpers/Commons' );
var Store    = require( '../../helpers/Store' );

var driver = config.driver;
var completePlus = false;

describe( 'Start Job Complete Process'.green, function () {

	it( 'Should updateStatus to job complete from the jobs screen.'.green, function ( done ) {
		var lastUser = Store.get( 'lastUser' );
		driver
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 20000 )
		.sleep( 1000 )
		.then( function ( user ) {
			if ( lastUser.userRole != 'client' && lastUser.userRole != 'AdminClient' ) {
				return driver
				.elementByName( elements.mainMenuScreen.jobs )
				.click()
				.sleep( 2000 )
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
				.elementByNameIfExists( commons.getItem( elements.jobsScreen.openJobsTab.openJobs, 0 ) )
				//Change the 0 to a 1 for the second job, etc...
				.elementByNameIfExists( commons.getItem( elements.jobsScreen.openJobsTab.openJobs, 0 ) )
				.then( function ( openJobs ) {

					if ( openJobs ) {
						console.log( 'Open Jobs found'.red );
						return openJobs
						.click()
						.sleep ( 100 )
						.waitForElementByName( elements.jobsScreen.updateStatusOptions.updateStatus, 10000 )
						.click()
						.sleep ( 800 )
						.elementByNameIfExists( elements.jobsScreen.updateStatusOptions.jobComplete )
						//.isDisplayed()
						.then( function ( jobComplete ) {

							if ( jobComplete ) {
								console.log( 'Job Conplete'.red );
								return jobComplete
								.click();

							} else {
								return driver
								.elementByNameIfExists( elements.jobsScreen.updateStatusOptions.jobCompletePlus )
								//.isDisplayed()
								.then( function ( jobCompletePlus ) {

									if ( jobCompletePlus ) {
										console.log( 'Job Complete +'.red );
										return driver
										.elementByName( elements.jobsScreen.updateStatusOptions.jobCompletePlus )
										.click()
										.sleep ( 1000 )
										.elementByNameIfExists( elements.formScreen.actions )
										.click()
										.sleep ( 100 )
										.elementByName( elements.formScreen.save )
										.click()
										.sleep( 1000 )
										completePlus = true;	

									} else {
										console.log( 'Job Complete Status'.red );
										return driver
										.elementByName( elements.jobsScreen.updateStatusOptions.cancel )
										.click();
									}
								} );
							}
						} )
						.then( function() {

							if ( commons.isIOS() ) {
								return driver
								.waitForElementByName( elements.jobsScreen.otherOptions.back, 10000 )
								.click().sleep( 100 );

							} else if ( commons.isAndroid() ) {
								return driver
								.back().sleep( 100 );
							}
						} );
			
					} else {
						console.log( 'No Open Jobs to Select.'.red);
						if ( commons.isIOS() ) {
							return driver
							.waitForElementByName( elements.jobsScreen.otherOptions.back, 10000 )
							.click();

						} else if ( commons.isAndroid() ) {
							return driver
							.back();
						}
					}
				} ) 
			} else { 
				console.log( 'user does not have acces to Jobs Screen'.red );
				return driver;
			}
		} )
		.elementByNameIfExists( elements.mainMenuScreen.syncAllowed )
		.then( function ( sync ) {

			if ( sync ) {
				return driver
				.elementByName( elements.mainMenuScreen.syncAllowed )
				.click()
				.sleep ( 2000 );
			}
			return driver;
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
		.then( function() {

			console.log( 'updateStatus To Job Complete has Completed....'.green );
			config.currentTest = 'passed';
			done();
	 	} );
	} );
} );
