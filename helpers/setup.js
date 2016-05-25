var wd = require( 'wd' );

require( 'colors' );
var chai           = require( 'chai' );
var chaiAsPromised = require( 'chai-as-promised' );
var should         = chai.should();
var expect         = chai.expect;
var assert         = chai.assert;
chai.config.includeStack = true;
chaiAsPromised.transferPromiseness = wd.transferPromiseness;
chai.use(chaiAsPromised);

module.exports.should = should;
module.exports.expect = expect;
module.exports.assert = assert;