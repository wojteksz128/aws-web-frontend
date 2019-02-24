var util = require("util");
var helpers = require("../helpers");
var Policy = require("../s3post").Policy;
var S3Form = require("../s3post").S3Form;
var AWS_CONFIG_FILE = "config.json";
var POLICY_FILE = "policy.json";
var template = "list.ejs";
var AWS = require("aws-sdk");
var fields = []; 
var nazwy =[];
var adresy =[];
var message = 0;

var task = function(request, callback) {	
	AWS.config.loadFromPath(AWS_CONFIG_FILE);
	new awsConfig = helpers.readJSONFile(AWS_CONFIG_FILE);
	var S3 = new AWS.S3();

	var params = {
		Bucket: awsConfig.s3.bucket,
		Prefix: awsConfig.s3.prefix
	};
	imageFiles = [];

	S3.listObjects(params, function(err, data) {	
		if (err) {
			console.log(err, err.stack);
			return;
		}

		for(var i = 0; i < data.Contents.length; ++i) {
			var object = data.Contents[i];
			if (object.Size == 0) continue;		// This is directory
			
			var image = {
				field: object.Key,
				fileName: getFileName(object.Key),
				url: S3.getSignedUrl('getObject', params={
					Bucket: awsConfig.s3.bucket,
					Key: data.Contents[i].Key
				})
			};

			imageFiles.push(image);
		}
		exports.Pola= fields;
		exports.Nazwy = nazwy;
		exports.Adresy = adresy;
	
		callback(null, {
			template: template, 
			params: {
				fields: fields, 
				bucket: awsConfig.s3.bucket,
				imageFiles: imageFiles,
				message: message
			}
		});
	});
}

function getFileName(path) {
	var parts = path.split('/');
	return parts[parts.length - 1];
}

exports.action = task;
