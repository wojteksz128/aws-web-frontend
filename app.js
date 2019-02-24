var helpers = require("./helpers");
var ACTIONS_FOLDER = "./actions/";
var SERVER_CONFIG_FILE = "server_conf.json";



var serverConfig = helpers.readJSONFile(SERVER_CONFIG_FILE);


serverConfig.endpoints.forEach(function(elem) {
	if(elem.action && elem.path) {
		if(!elem.action.template) {
			elem.action = require(ACTIONS_FOLDER + elem.action).action;
		}
	} else {
		console.log("Unknown configuration: " + JSON.stringify(elem));
	}
});

var service = require("webs-weeia").http(serverConfig.endpoints);

service(serverConfig.port);
console.log("Server start and listened at port " + serverConfig.port);