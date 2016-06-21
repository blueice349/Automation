'use strict';

module.exports = function () {

	require( 'colors' );
	var args    = [ 'Mocha.js' ]
	var assert  = require( 'chai' ).assert;
	var cmd     = require( 'node-cmd' );
	var commons = require( '../../helpers/Commons' );
	var config  = require( '../../helpers/Config' );
	var driver  = config.driver;

	describe( 'Omadi Mobile Build Request'.green, function () {
	    
	    describe( 'Build updated source code'.green, function () {
	        
	        it( 'check for updates and build any changes'.green, function ( done ) {

	            var output = "UPDATE THIS STRING WITH data";
				if ( commons.isIOS() 
					&& config.appUpdated === false 
					&& config.sim === true 
				) {
					console.log( 'IOS SIM COMMAND'.red );
					cmd.get( 'cd /Users/mikemeyer/Projects/omadi_mobile ; b i s', function ( data ) {
        			} );
        			done();

    			} else if ( commons.isIOS() 
    				       && config.appUpdated === false 
    				       && config.sim === false 
		       	) {
					console.log( 'IOS DEVICE COMMAND'.red );
					cmd.get( 'cd /Users/mikemeyer/Projects/omadi_mobile ; b i', function ( data ) {
        			} );
        			console.log( data );
        			done();
	            	
	            } else if ( commons.isAndroid() 
	            	       && config.appUpdated === false 
	            	       && config.sim === true 
    	       	) {
					console.log( 'ANDROID SIM COMMAND'.red );
					cmd.get( 'cd /Users/mikemeyer/Projects/omadi_mobile ; b a s', function ( data ) {
        			} );
        			console.log( data );
        			done();
				
				} else if ( commons.isAndroid() 
					       && config.appUpdated === false 
					       && config.sim === true 
		       	) {
					console.log( 'ANDROID SIM COMMAND'.red );
					cmd.get( 'cd /Users/mikemeyer/Projects/omadi_mobile ; b a', function ( data ) {
        			} );
        			console.log( data );
        			done();
            	
            	} else {
            		console.log( 'App already up-to-date.'.red );
            		done();
            	}
            } );
        } );
    } );
};