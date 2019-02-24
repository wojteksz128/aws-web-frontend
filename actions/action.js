var AWS = require("aws-sdk");
var helpers = require("../helpers");
var AWS_CONFIG_FILE = "config.json";
var succ = "list.ejs";
var Queue = require("queuemanager");

var task = function(request, callback){
	//1. load configuration
	AWS.config.loadFromPath(AWS_CONFIG_FILE);
	var awsConfig = helpers.readJSONFile(AWS_CONFIG_FILE);  
	var queue = new Queue(new AWS.SQS(), awsConfig.sqs.url);
	
	var key = request.param("klucz");
	var msg = key;
	queue.sendMessage(msg, function(err, data){
		if(err) {
			callback(err);
			return;
		}

		callback(null, {
			template: succ, 
			params:{
				bucket:awsConfig.s3.bucket,
				message:2
			}});
		});
   }	
   exports.action = task;
