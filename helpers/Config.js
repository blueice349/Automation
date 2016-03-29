'use strict';

var Config = function () {};

Config.prototype.set = function ( options ) {

	for ( var i in options ) {
		this[ i ] = options[ i ];
	}
};

module.exports = new Config();
