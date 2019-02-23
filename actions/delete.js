var util = require("util");
var AWS = require("aws-sdk");
var helpers = require("../helpers");
var Policy = require("../s3post").Policy;
var S3Form = require("../s3post").S3Form;
var AWS_CONFIG_FILE = "config.json";
var POLICY_FILE = "policy.json";
var succ = "list.ejs";
var prefix = "/kovalchukbucket/";
var message= 0;
var haderr= false
var fields = []; 
var nazwy =[];
var adresy =[];

var task = function(request, callback){
	//1. load configuration
	AWS.config.loadFromPath(AWS_CONFIG_FILE);
	var s3 = new AWS.S3();
	var klucz = request.param("klucz");
	
	var object = {
			Bucket: 'kovalchukbucket',
			Key : klucz
	};

    listobject = require('./listobject');
	s3.deleteObject(object, function(err,data){
	if(err){
		message = 2;
		callback(null, {template: succ, params:{message:message}});
	}
	else{
		message = 1;
		callback(null, {template: succ, params:{fields:listobject.Pola, bucket:"kovalchukbucket",names:listobject.Nazwy,adresy:listobject.Adresy,message:message}});

	}});	
}
exports.action = task;
