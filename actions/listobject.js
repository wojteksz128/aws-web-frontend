var util = require("util");
var helpers = require("../helpers");
var Policy = require("../s3post").Policy;
var S3Form = require("../s3post").S3Form;
var AWS_CONFIG_FILE = "config.json";
var POLICY_FILE = "policy.json";
var template = "list.ejs";
var prefix = "/kovalchukbucket/";
var AWS = require("aws-sdk");
var fields = []; 
var nazwy =[];
var adresy =[];
var message = 0;

var task = function(request, callback){	
	AWS.config.loadFromPath(AWS_CONFIG_FILE);
	var S3 = new AWS.S3();

	var params = {
		      Bucket: 'kovalchukbucket', /* required */
			  Marker: 'zdjecia'
			  
	};
	fields = [];
	nazwy = [];
	adresy = [];
	S3.listObjects(params, function(err, data) {	
		if (err) console.log(err, err.stack); // an error occurred
		else{		 	
			for(var i=0; i<data.Contents.length;i++){
				fields[i] = data.Contents[i].Key;
			}
			for(var i=0; i<data.Contents.length;i++){
				nazwy[i] = data.Contents[i].Key.substring(8);
				S3.getSignedUrl('getObject', params={Bucket: 'kovalchukbucket',Key:data.Contents[i].Key}, function (err, url) {
					adresy[i]=url;
				});
			}
			exports.Pola= fields;
			exports.Nazwy = nazwy;
			exports.Adresy = adresy;
		
			callback(null, {template: template, params:{fields:fields, bucket:"kovalchukbucket",names:nazwy,adresy:adresy,message:message}});
		}
	});
}
exports.action = task;
