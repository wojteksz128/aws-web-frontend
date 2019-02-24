var AWS = require("aws-sdk");
var helpers = require("../helpers");
var AWS_CONFIG_FILE = "config.json";
var succ = "list.ejs";
var message= 0;

var task = function(request, callback){
	//1. load configuration
	AWS.config.loadFromPath(AWS_CONFIG_FILE);
	var awsConfig = helpers.readJSONFile(AWS_CONFIG_FILE);
	var s3 = new AWS.S3();
	var key = request.param("klucz");
	
	var object = {
		Bucket: awsConfig.s3.bucket,
		Key : key
	};

	s3.deleteObject(object, function(err, data) {
		if(err) 
			message = 2;
		else
			message = 1;

		callback(null, {
			template: succ,
			params: {
				bucket: awsConfig.s3.bucket,
				message: message
			}
		});
	});
}

exports.action = task;
