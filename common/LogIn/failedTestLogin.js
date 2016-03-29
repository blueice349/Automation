
var reSetLogin = function () {
	return driver
	.waitForElementByName( elements.loginScreen.client_account, 200000 )
	.then( function ( el ) {
			
		if ( commons.isIOS() ){
			return commons.sendKeys(el, elements.logins.iosSim1.client_account );
		} else if ( commons.isAndroid() ) {
			return commons.sendKeys(el, elements.logins.androidDriver.client_account );
		}
	} )
	.elementByName( elements.loginScreen.user_name )
	.then( function ( el ) {

		if ( commons.isIOS() ){
			return commons.sendKeys( el, elements.logins.iosSim1.username );
		} else if ( commons.isAndroid() ) {
			return commons.sendKeys( el, elements.logins.androidDriver.username );
		}
	} )
	.elementByName( elements.loginScreen.password )
	.then( function ( el ) {
		
		if ( commons.isIOS() ) {
			return commons.sendKeys( el, elements.logins.iosSim1.password );
		} else if ( commons.isAndroid() ) {
			return commons.sendKeys( el, elements.logins.androidDriver.password );
		}
	} )
	.elementByName( elements.loginScreen.accept_terms )
		.click()
	.elementByName( elements.loginScreen.login_button )
		.click()
		.sleep( 3000 )
	.then( function() {

		 if ( commons.isIOS() ) {
		 	return driver
	   		.elementByNameIfExists( elements.alertButtons.ok )
	   		.then( function ( ok ) {

	   			if ( ok ) {
	   				return ok
	   				.click();
	   			}
	   		} )
	   		.elementByNameIfExists( elements.alertButtons.allow )
	   		.then( function ( allow ) {

				if ( allow ) {
					return allow
					.click();
				}
				return driver;
			} )
		 }
	} )
	.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
	.sleep( 1000 )
	//.sleep( 80000 )
	.elementByNameIfExists( elements.companyVehicle.vehicle1 )
	.then( function ( vehicle ) {

		if ( vehicle ) {
			console.log( 'Select Vehicle'.red );
			truck = true;
			return vehicle
			.click().sleep( 1000 );
		}
	} )

	.then( function() {

		if ( commons.isIOS() ) {
			console.log( 'IOS Device or Simulator'.red );
			console.log( truck );
			return driver
			.sleep( 600 )
			.elementByNameIfExists( elements.alertButtons.clockIn )
			.then( function ( clockIn ) {

				if ( clockIn ) {
					console.log( 'Clock in option IOS'.red );
					return clockIn
				    .click()
				    .sleep( 1000 )
				    .elementByNameIfExists( elements.alertButtons.ok )
				    .then( function ( ok ) {

						if ( ok ) {
							console.log( 'Clock in & Inspection IOS'.red );
							return ok
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
						}
					} );

				} else {
					return driver
					.elementByNameIfExists( elements.alertButtons.ok )
					.then( function ( ok ) {

						if ( ok ) {
							console.log( 'Inspection Only IOS'.red );
							return ok
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
						
						} else {
							console.log( 'No Clock in & No Inspection Option IOS.'.red ); 
							return driver
							.elementByName( elements.mainMenuScreen.actions )
							.isDisplayed()
							.then( function ( mainMenuScreen ) {

								if ( !mainMenuScreen ) {
									return driver
									.waitForElementByName( elements.jobsScreen.otherOptions.back, 10000 )
									.click();
								}
								return driver;
							} );
						}
					} );					
				}
			} );

		} else if ( commons.isAndroid() ) {
			console.log( 'Android Device or Emulator'.red );
			return driver
			.elementByNameIfExists( elements.alertButtons.ok )
			.then( function ( ok ) {

				if ( ok ) {
					console.log( 'Inspection Option android'.red );
					return ok
					.click()
					.sleep( 1000 )
					.elementByNameIfExists( elements.alertButtons.clockIn )
					.then( function ( clockIn ) {
						if ( clockIn ) {
							console.log( 'Clock in & Inspection Android'.red );
							return clockIn
							.click();
						}
						return driver;
					} )
					.elementByNameIfExists( elements.mainMenuScreen.actions )
					.then( function ( mainMenuScreen ) {

						if ( !mainMenuScreen ) {
							return driver
							.back();
						}
						return driver;
					} );

				} else {
					return driver
					.elementByNameIfExists( elements.alertButtons.clockIn )
					.then( function ( clockIn ) {

						if ( clockIn ) { 
							console.log( 'Clock in option with No Inspection Andoid'.red );
							return clockIn
							.click().sleep( 1000 )
							.elementByNameIfExists( elements.mainMenuScreen.actions )
							.then( function ( mainMenuScreen ) {

								if ( !mainMenuScreen ) {
									return driver
									.back();
								}
							} )

						} else {
							console.log( 'No Clock in option and No Inspection Andoid'.red );
							return driver
							.elementByNameIfExists( elements.mainMenuScreen.actions )
							.then( function ( mainMenuScreen ) {

								if ( !mainMenuScreen ) {
									return driver
									.back();
								}
								return driver;
							} )
						}
					} )
				}
			} )
		}
	} )
	//.waitForElementByName( 'PPI' + elements.mainMenuScreen.plus_Button, 20000 )
	.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
	.then( function() {

		console.log( 'Failed Test Login Completed...'.red );
	})
};

exports.reSetLogin = reSetLogin;