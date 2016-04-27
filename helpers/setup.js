var wd = require("wd");

require('colors');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var should = chai.should();
chai.config.includeStack = true;
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

exports.should = should;
