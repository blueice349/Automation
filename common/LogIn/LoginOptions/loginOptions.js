'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../../helpers/setup' );
	var alerts   = require( '../../../helpers/alerts' );
	var caps     = require( '../../../helpers/caps' );
	var config   = require( '../../../helpers/Config' );
	var commons  = require( '../../../helpers/Commons' );
	var elements = require( '../../../helpers/elements' );
	var login    = require( '../../../helpers/loginTable' );
	var Store    = require( '../../../helpers/Store' );
	var driver   = config.driver;

	describe( 'Start Vehicle Inspection and/or clockInOption after login process using "loginOptions.js"'.green, function() {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'should check if current user vehicleOptions and clockInOption'.green, function () {
			var lastUser = Store.get( 'lastUser' );
			if ( commons.isIOS() ) {
				console.log( 'IOS Device or Simulator'.red );
				return driver
				.sleep( 600 )
				.then( function () {

					if ( lastUser.userRole === 'client' || lastUser.userRole === 'AdminClient' ) {
						console.log( lastUser.userRole.red + ' Is a Cleint login on A iOS Device'.red ); 
						return driver;


					} else if ( lastUser.clockInOption === true && lastUser.truckOption === false && lastUser.userRole != 'client' && lastUser.userRole != 'AdminClient' ) {
						console.log( lastUser.userRole.red + ' Has Clock in Only on A iOS Device'.red );
						return commons.alertText( alerts.loginAlerts.clockin )
						.waitForElementByName( elements.alertButtons.clockIn, 180000 )
					    .click()
					    .then( function () {
							
							config.clockedIn  = true;
					    } )
					    .sleep( 1000 )
						.elementByName( elements.mainMenuScreen.actions )
						.isDisplayed()
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.elementByName( elements.jobsScreen.otherOptions.back )
								.click();
							}
						} );

					} else if ( lastUser.clockInOption === true && lastUser.truckOption === true && lastUser.userRole != 'client' && lastUser.userRole != 'AdminClient' ) {
						console.log( lastUser.userRole.red + ' Has Clock in & Truck Option on A iOS Device'.red );
						return commons.alertText( alerts.loginAlerts.clockin )
						.waitForElementByName( elements.alertButtons.clockIn, 180000 )
					    .click()
					    .then( function () {
							
							config.clockedIn  = true;
					    } )
					    .sleep( 1000 )
					    .then( function () {
					    	return commons.alertText( alerts.loginAlerts.noInspectionReviewHeader );
					    } )
			    		.waitForElementByName( elements.alertButtons.ok, 180000 )
						.click()
						.sleep( 1000 )
						.elementByName( elements.mainMenuScreen.actions )
						.isDisplayed()
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.elementByName( elements.jobsScreen.otherOptions.back )
								.click();
							}
						} );

					} else if ( lastUser.truckOption === true  && lastUser.clockInOption === false && lastUser.userRole != 'client' && lastUser.userRole != 'AdminClient' ) {
						console.log( lastUser.userRole.red + ' Has Truck Optoin Only on A iOS Device'.red );
						driver.sleep( 600 )
						return commons.alertText( alerts.loginAlerts.noInspectionReviewHeader )
						.waitForElementByName( elements.alertButtons.ok, 180000 )
						.click()
						.sleep( 1000 )
						.elementByName( elements.mainMenuScreen.actions )
						.isDisplayed()
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.waitForElementByName( elements.jobsScreen.otherOptions.back, 10000 )
								.click();
							}
						} );
						
					} else if ( lastUser.truckOption === false  && lastUser.clockInOption === false && lastUser.userRole != 'client' && lastUser.userRole != 'AdminClient' ) {
						console.log( lastUser.userRole.red + ' Has No Clock in & No Truck Option on a iOS Device.'.red ); 
						return driver
						.elementByName( elements.mainMenuScreen.actions )
						.isDisplayed()
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.waitForElementByName( elements.jobsScreen.otherOptions.back, 10000 )
								.click();
							}
						} );
					}
				} )
				.sleep( 80 )
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( commons.isAndroid() ) {
				console.log( 'Android Device or Emulator'.red );
				return driver
				.sleep( 600 )
				.then( function ( Inspection ) {

					if ( lastUser.userRole === 'client' || lastUser.userRole === 'AdminClient' ) {
						console.log( lastUser.userRole.red + ' Is a Cleint login on A Android Device.'.red ); 
						return driver;						

					} else if ( lastUser.clockInOption === true && lastUser.truckOption === false && lastUser.userRole != 'client' && lastUser.userRole != 'AdminClient' ) { 
						console.log( lastUser.userRole + ' Has Clock in option only Andoid'.red );
						return commons.alertText( alerts.loginAlerts.clockin )
						.waitForElementByName( elements.alertButtons.clockIn )
						.click().sleep( 1000 )
						.then( function () {
							
							config.clockedIn  = true;
					    } )
						.elementByNameIfExists( elements.mainMenuScreen.actions )
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.back();
							}
						} );

					} else if ( lastUser.clockInOption === false && lastUser.truckOption === true && lastUser.userRole != 'client' && lastUser.userRole != 'AdminClient' ) { 
						console.log( lastUser.userRole + ' Has Truck option only on A Andoid Device'.red );
						return commons.alertText( alerts.loginAlerts.noInspectionReviewHeader )
						.waitForElementByName( elements.alertButtons.ok, 180000 )
						.click()
						.sleep( 1000 )
						.elementByNameIfExists( elements.mainMenuScreen.actions )
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.back();
							}
						} );						

					} else if ( lastUser.clockInOption === true && lastUser.truckOption === true && lastUser.userRole != 'client' && lastUser.userRole != 'AdminClient' ) {
						console.log( lastUser.userRole.red + ' Has Truck Option and Clock in Option on A Android Device'.red );
						return commons.alertText( alerts.loginAlerts.noInspectionReviewHeader )
						.elementByName( elements.alertButtons.ok, 180000 )
						.click()
						.sleep( 1000 )
						.then ( function () {

							return commons.alertText( alerts.loginAlerts.clockin );
						} )
						.waitForElementByName( elements.alertButtons.clockIn, 180000 )
						.click()
						.then( function () {
							
							config.clockedIn  = true;
					    } )
						.elementByNameIfExists( elements.mainMenuScreen.actions )
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.back();
							}
						} );

					} else if ( lastUser.truckOption === false  && lastUser.clockInOption === false && lastUser.userRole != 'client' && lastUser.userRole != 'AdminClient' ) {
						console.log( lastUser.userRole.red + ' Has No Clock in option and No Truck Option on A Andoid Device'.red );
						return driver
						.elementByNameIfExists( elements.mainMenuScreen.actions )
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.back();
							}
							return driver;
						} );
					}
				} )
				.sleep( 80 )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );
		
		it( 'should wait for syncAllowed'.green, function () {

			return driver
			.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
			.isDisplayed().should.eventually.be.true
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );
		
		it( 'Should make sure all buttons are visble on mainMenuScreen after intinal sync'.green, function () {
			var lastUser = Store.get( 'lastUser' );
	     	//Checks for buttons to be displayed on main menu after log on.
			if ( lastUser.userRole == 'admin' || lastUser.userRole == 'driver' ) {
				return driver
				.elementByName( lastUser.name )
				.text().should.eventually.become( lastUser.name )
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
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( lastUser.userRole === 'client' || lastUser.userRole === 'AdminClient' ) {
				return driver
				.elementByName( lastUser.name )
				.text().should.eventually.become( lastUser.name )
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

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'loginSelectVehicle and clockInOptions test has Completed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};