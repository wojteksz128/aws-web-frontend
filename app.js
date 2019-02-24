var helpers = require("./helpers");
var ACTIONS_FOLDER = "./actions/";
var ACTIONS_CONFIG_FILE = "actions.json";
var PORT = 8080;



var actionsCfg = helpers.readJSONFile(ACTIONS_CONFIG_FILE);

actionsCfg.forEach(function(elem) {
	if(elem.action && elem.path) {
		if(!elem.action.template) {
			elem.action = require(ACTIONS_FOLDER + elem.action).action;
		}
	} else {
		console.log("Unknown configuration: " + JSON.stringify(elem));
	}
});

var service = require("webs-weeia").http(actionsCfg);

service(PORT);
console.log("Server start and listened at port " + PORT);