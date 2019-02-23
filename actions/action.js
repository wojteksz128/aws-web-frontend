var util = require("util");
var AWS = require("aws-sdk");
var helpers = require("../helpers");
var Policy = require("../s3post").Policy;
var S3Form = require("../s3post").S3Form;
var AWS_CONFIG_FILE = "config.json";
var APP_CONFIG_FILE = "app.json";
var POLICY_FILE = "policy.json";
var succ = "list.ejs";
var prefix = "/kovalchukbucket/";
var AWS = require("aws-sdk");
var Queue = require("queuemanager");
var message = 0;

var task = function(request, callback){
	//1. load configuration
	AWS.config.loadFromPath(AWS_CONFIG_FILE);
	var appConfig = helpers.readJSONFile(APP_CONFIG_FILE);
	listobject = require('./listobject');   
	var queue = new Queue(new AWS.SQS(), appConfig.QueueUrl);
	
	var klucz = request.param("klucz");
	var msg = klucz;
	queue.sendMessage(msg, function(err, data){
		if(err) { callback(err); return; }
		callback(null,{template: succ, params:{
			fields:listobject.Pola, bucket:"kovalchukbucket",names:listobject.Nazwy,adresy:listobject.Adresy,message:2
			}});
		});
   }	
   exports.action = task;
