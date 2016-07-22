"use strict";

exports.configure = function ( driver ) {
  // See whats going on
   driver.on( 'status', function ( info ) {
    
      console.log( info.cyan );
  } );

  driver.on( 'command', function ( meth, path, data ) {

    var timestamp   = require( 'console-timestamp' );
    var currentTime = timestamp( 'MM-DD hh:mm:ss:iii' );

    console.log( ' > '.yellow + currentTime.yellow + ' ' + meth.yellow, path.magenta, data || '' );
  } );

  driver.on( 'http', function ( meth, path, data ) {

    var timestamp   = require( 'console-timestamp' );
    var currentTime = timestamp( 'MM-DD hh:mm:ss:iii' );

    console.log( ' > '.magenta + currentTime.magenta + ' ' + meth.magenta, path.cyan, ( data || '' ).cyan );
  } );
};
