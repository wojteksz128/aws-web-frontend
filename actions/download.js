var util = require("util");
var AWS = require("aws-sdk");
var helpers = require("../helpers");
var Policy = require("../s3post").Policy;
var S3Form = require("../s3post").S3Form;
var AWS_CONFIG_FILE = "config.json";
var POLICY_FILE = "policy.json";
var succ = "success.ejs";
var prefix = "/kovalchukbucket/";
var message= "";
var haderr= false

var task = function(request, callback){
	//1. load configuration
	AWS.config.loadFromPath(AWS_CONFIG_FILE);
	var s3 = new AWS.S3();
	var klucz = request.param("klucz");
	console.log(klucz);
	var opcje = {
			Bucket: 'kovalchukbucket',
			Key : klucz
	};

   var file = require('fs').createWriteStream('./downloads/'+klucz.substring(8));
   var stream = s3.getObject(opcje).createReadStream().pipe(file);
   stream.on('error', function(err){
		haderr=true;
		message = "Blad sciagania pliku "+klucz.substring(8);
		callback(null, {template: succ, params:{message:message}});
	});
	stream.on('close', function(){
		if (!haderr) message = "Pobrano plik "+klucz.substring(8);
		callback(null, {template: succ, params:{message:message}});
	});
}
exports.action = task;
