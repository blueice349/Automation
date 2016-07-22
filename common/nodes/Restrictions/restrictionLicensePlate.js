'use strict';

module.exports = function () {

	require( 'colors' );
	var config   = require( '../../../helpers/Config' );
	var elements = require( '../../../helpers/elements' );
	var commons  = require( '../../../helpers/Commons' );
	var Store    = require( '../../../helpers/Store' );

	var driver = config.driver;

	describe( 'Start Create New Mobile Mike Node and Save to Drafts using "restrictionLicensePlate.js"'.green, function () {

		it( 'Should Create New Node from homeScreen Save to Drafts'.green, function () {
			var lastUser = Store.get( 'lastUser' );
			driver
			.waitForElementById( elements.homeScreen.syncAllowed, 20000 )
			.then( function ( mobileMike ) {

				if ( lastUser.userRole != 'client' 
					&& lastUser.userRole != 'AdminClient' 
				) {
					console.log( 'User is Has form View Permissions'.red );
					return driver
					.elementById( elements.mobile_MikeRecord.mobileMike + elements.homeScreen.button )
					.click()
					.sleep( 1000 )
					.elementById( elements.itemListScreen.newRecord )
					.click()
					.elementByIdIfExists( commons.getItem( elements.mobile_MikeRecord.propertyRef.property, 0 ) )
					.then( function ( propertyRef ) {

						if ( propertyRef ) {
							return driver
							.elementById( commons.getItem( elements.mobile_MikeRecord.propertyRef.property, 0 ) )
							.then( function ( property ) {
		
								return commons.sendKeys( property, 'Omadi Inc' );
							} )
							.elementById( elements.mobile_MikeRecord.otherFields.textFieldReq )
							.then( function ( textFieldReq ) {

								return commons.sendKeys( textFieldReq, lastUser.userName + ' Required Field' );
							} )
							.elementById( commons.getItem( elements.mobile_MikeRecord.otherFields.licensePlate, 0 ) )
							.then( function ( licensePlate ) {

								return commons.sendKeys( licensePlate, '1050' );
							} );
						}
					} )
					.sleep( 1000 )
					.elementById( elements.formScreen.actions )
					.click().sleep ( 100 )
					.elementByXPathIfExists( commons.textToXPath( elements.formScreen.save ) )
					.then( function ( save ) {

						if ( save ) {
							return save
							.click()
							.sleep( 1000 )
							.elementByXPathIfExists( commons.textToXPath( elements.alertButtons.ok ) )
							.then( function ( restriction ) {

								if  ( restriction ) {
									console.log( 'Vehicle is on Restriction'.red );
									return restriction
									.click()

									.then( function () {
										if ( commons.isIOS() ) {
											return driver
											.waitForElementById( elements.formScreen.back, 10000 )
											.click()
											.sleep( 1000 )
											.elementByXPath( commons.textToXPath( elements.alertButtons.exit ) )
											.click()
											.sleep( 1000 ); 


										} else if ( commons.isAndroid() ) {
											return driver
											.back()
											.sleep( 1000 )
											.elementByXPath( commons.textToXPath( elements.alertButtons.exit ) )
											.click()
											.sleep( 1000 ); 
										}
									} );
								
								} else {
									console.log( 'Vehicle not on Restriction'.red );
									return driver;
								}
							} )

							.then( function () {
								if ( commons.isIOS() ) {
									return driver
									.waitForElementById( elements.itemListScreen.back, 10000 )
									.click()
									.sleep( 1000 );

								} else if ( commons.isAndroid() ) {
									return driver
									.back()
									.sleep( 1000 );
								}
							} ); 

						} else {
							return driver
							.elementByXPath( commons.textToXPath( elements.formScreen.cancel ) )
							.click()
							.sleep( 1000 );
						}
					} );
				return driver;
				
				} else {
					console.log( 'Current User Does Not Have The Option to Add a Node to Restriction'.red );
				    driver
				    .elementByIdIfExists( elements.homeScreen.syncAllowed )
				    .isDisplayed()
					.then( function ( homeScreen ) {

						if ( !homeScreen ) {
							if ( commons.isIOS() ) {
								return driver
								.waitForElementById( elements.formScreen.back, 10000 )
								.click()
								.sleep( 1000 );

							} else if ( commons.isAndroid() ) {
								return driver
								.back()
								.sleep( 1000 );
							}
						}
					} );
				}
				return driver;
			} ) 
			// .then( function () {

			// 	if ( commons.isIOS() ) {
			// 		return driver
			// 		.waitForElementById( elements.formScreen.back, 10000 )
			// 		.click()
			// 		.sleep( 1000 );

			// 	} else {
			// 		return driver
			// 		.back()
			// 		.sleep( 1000 );
			// 	}
			// } )
			.waitForElementById( elements.homeScreen.syncAllowed, 20000 )
			.then( function ( sync ) {
				if ( sync ) {
					return driver
					.elementById( elements.homeScreen.syncAllowed )
					.click()
					.sleep ( 2000 );
				}
				return driver;
			} )
			.then( function () {

				console.log( 'Adding a New Node on Restriction has Completed....'.green );
		 	} );
		} );
	} );
};