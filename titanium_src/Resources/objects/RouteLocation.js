/* jshint globalstrict:true */
'use strict';

var Node = require('objects/Node');

var RouteLocation = function(nid) {
	this.nid = nid;
	this.node = null;
};

RouteLocation.prototype.getData = function() {
	return this._getNode().nfc.dbValues;
};

RouteLocation.prototype.getName = function() {
	return this._getNode().name_0.textValues[0];
};

RouteLocation.prototype._getNode = function() {
	if (this.node === null) {
		this.node = Node.load(this.nid);
	}
	return this.node;
};

module.exports = RouteLocation;
