Omadi.service = Omadi.service || {};

Omadi.service.setNodeViewed = function(nid){
	"use strict";
	/*global Omadi*/
	
	/** UPDATE the mobile database **/
	var db, http;
	db = Omadi.utils.openMainDatabase();
	db.execute("UPDATE node SET viewed = '" + Omadi.utils.getUTCTimestamp() + "' WHERE nid = " + nid);
	db.close();
	
	/** UPDATE the web server database **/
	http = Ti.Network.createHTTPClient();
	http.setTimeout(10000);
	http.open('POST', Omadi.DOMAIN_NAME + '/js-forms/custom_forms/viewed.json?nid=' + nid);
	
	Omadi.utils.setCookieHeader(http);
	http.setRequestHeader("Content-Type", "application/json");	
	http.send(); // We don't care about the response, as this is a very trivial thing
};