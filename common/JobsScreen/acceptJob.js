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
		commons.afterEachIt();
		
		it( 'Should wait for actions button on homeScreen'.green, function () {
			
			
			return driver
			.waitForElementByName( elements.homeScreen.actions, 20000 )
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
				} );
				
			} else {
				console.log( 'user does not have acces to Jobs Screen'.red );
				return driver
				.sleep( 60 )
			}
		} );

		it( 'Sould look for jobs to accept and accept if job is present'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.userRole != 'client' 
				&&  lastUser.userRole != 'AdminClient' 
				&& lastUser.performJob === true 
			) {
				return driver
				.elementByNameIfExists( commons.getItem( elements.jobsScreen.newJobsTab.newJobs, 0 ) )
				.then( function ( newJob ) {

					if( newJob ) {
						return newJob
						.click()
						.sleep( 1000 )
						.waitForElementByName( elements.jobsScreen.updateStatusOptions.acceptJob, 10000 )
						.isDisplayed().should.eventually.be.true
						.elementByName( elements.jobsScreen.updateStatusOptions.acceptJob )
						.click().sleep( 1000 )
						.then( function () {

							if ( commons.isIOS() ) {
								return driver
								.waitForElementByName( elements.jobsScreen.otherOptions.back, 10000 )
								.isDisplayed().should.eventually.be.true
								.elementByName( elements.jobsScreen.otherOptions.back )
								.click()
								.sleep( 1000 )

							} else if ( commons.isAndroid() ) {
								return driver
								.back()
								.sleep( 1000 )
							}
						} )
						
					} else {
						console.log( 'user does not have a newJob'.red );
					}
				} );
			
			} else {
				console.log( 'user does not have need to performJob'.red );
			}
		} );

		it( 'should go back to homeScreen'.green, function () {
					
			return driver
			.elementByNameIfExists( elements.homeScreen.actions )
			.isDisplayed()
			.then( function ( homeScreen ) {

				if ( homeScreen === true ) {
					console.log( 'App is already at the homeScreen.'.red );
					return driver
					.elementByName( elements.homeScreen.actions )
					.isDisplayed().should.eventually.be.true
					.waitForElementByName( elements.homeScreen.syncAllowed, 30000 )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.homeScreen.syncAllowed )
					.click()
					.sleep ( 2000 );

				} else if ( homeScreen === false ) {
					if ( commons.isIOS() ) {
						console.log( 'isIOS app is at the jobsScreen.'.red ); 
						return driver
						.elementByName( elements.jobsScreen.otherOptions.back )
						.isDisplayed().should.eventually.be.true
						.elementByName( elements.jobsScreen.otherOptions.back )
						.click()
						.sleep( 1000 );

					} else if ( commons.isAndroid() ) {
						console.log( 'isAndroid app is at the jobsScreen.'.red ); 
						return driver
						.back()
						.sleep( 1000 );
					}
				}
			} )
			.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
			.isDisplayed().should.eventually.be.true
		} );

		it( 'should set currentTest to "passed"'.green, function ( done ) {
			
			console.log( 'Accepted a Job has Psssed....'.green );
			done();
		} );
	} );
};