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

	describe( 'Start check tabs on jobsScreen process using "jobScreenCheck.js"'.green, function () {

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

		it( 'should check tabs on jobsScreen are there'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );		
			if ( lastUser.userRole != 'client' 
				&&  lastUser.userRole != 'AdminClient' 
			) {
				return driver
				.elementByName( elements.jobsScreen.newJobsTab.newJobsHeader )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.jobsScreen.openJobsTab.currentJobsHeader )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.jobsScreen.otherOpenJobsTab.otherOpenJobsHeader )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.jobsScreen.appointmentJobsTab.appointmentsHeader )
				.isDisplayed().should.eventually.be.true
			
			} else {
				console.log( 'curren user does not have the jobsScreen'.green );
				return driver
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

				} else {
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
			
			console.log( 'jobScreenCheck test has Psssed....'.green );
			done();
		} );
	} );
};