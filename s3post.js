var util = require("util");
var moment = require("moment");
var helpers = require("./helpers");
var crypto = require("crypto-js")

var ACCESS_KEY_FIELD_NAME = "AWSAccessKeyId";
var POLICY_FIELD_NAME = "policy";
var SIGNATURE_FIELD_NAME = "signature";

var V4_ALGORITHM_NAME = "X-Amz-Algorithm";
var V4_CREDENTIAL_NAME = "X-Amz-Credential";
var V4_DATE_NAME = "X-Amz-Date";
var V4_EXPIRES_NAME = "X-Amz-Expires";
var V4_SIGNED_HEADERS_NAME = "X-Amz-SignedHeaders";
var V4_SIGNATURE_NAME = "X-Amz-Signature";



class Policy {
	constructor(policyData) {
		this.policy = policyData;
		this.policy.expiration = moment().add(policyData.expiration).toJSON();
		console.log("policyData " + util.inspect(policyData, false, null));
	}
	generateEncodedPolicyDocument() {
		return helpers.encode(this.policy, 'base64');
	}
	getConditions() {
		return this.policy.conditions;
	}
	generateSignature(secretAccessKey) {
		return helpers.hmac("sha1", secretAccessKey, this.generateEncodedPolicyDocument(), 'base64');
	}
	getConditionValueByKey(key) {
		var condition = [];
		this.policy.conditions.forEach(function (elem) {
			if (Object.keys(elem)[0] === key)
				condition = elem[Object.keys(elem)[0]];
		});
		return condition;
	}
}

class S3Form {
	constructor(policy) {
		if (policy instanceof Policy)
			this.policy = policy;
		else {
			console.log("policy instanceof Policy");
			throw new Error("policy instanceof Policy");
		}
	}
	generateS3FormFields() {
		var conditions = this.policy.getConditions();
		var formFields = [];
		conditions.forEach(function (elem) {
			if (Array.isArray(elem)) {
				if (elem[1] === "$key")
					formFields.push(hiddenField("key", elem[2] + "${filename}"));
			}
			else {
				var key = Object.keys(elem)[0];
				var value = elem[key];
				if (key !== "bucket")
					formFields.push(hiddenField(key, value));
			}
		});
		return formFields;
	}
	addS3CredientalsFields(fields, awsConfig) {
		var encodedPolicy = this.policy.generateEncodedPolicyDocument();
		if (awsConfig.s3.signatureVersion == 'v4') {
			var currentDate = new Date();
			var utcDate = new Date(currentDate.valueOf() + currentDate.getTimezoneOffset() * 60000);
			var onlyDate = helpers.dateToString(utcDate, 'yyyyMMdd');
			var iso8601Date = helpers.dateToString(utcDate, 'yyyyMMddThhmmssZ');
			var credential = assembleV4CredentialValue(awsConfig.s3.accessKeyId, onlyDate, awsConfig.region);
			var date = iso8601Date;
			var expires = Math.round((new Date(this.policy.policy.expiration) - currentDate) / 1000);
			this.policy.policy.conditions.push(assembleObject(V4_ALGORITHM_NAME, awsConfig.s3.signatureAlgorithm));
			this.policy.policy.conditions.push(assembleObject(V4_CREDENTIAL_NAME, credential));
			this.policy.policy.conditions.push(assembleObject(V4_DATE_NAME, iso8601Date));
			this.policy.policy.conditions.push(assembleObject(V4_EXPIRES_NAME, expires.toString()));
			this.policy.policy.conditions.push(assembleObject(V4_SIGNED_HEADERS_NAME, "host"));
			encodedPolicy = this.policy.generateEncodedPolicyDocument();
			var signature = getSignatureKey(crypto, awsConfig.s3.secretAccessKey, onlyDate, awsConfig.region, "s3", encodedPolicy);
			fields.push(hiddenField(V4_ALGORITHM_NAME, awsConfig.s3.signatureAlgorithm));
			fields.push(hiddenField(V4_CREDENTIAL_NAME, credential));
			fields.push(hiddenField(V4_DATE_NAME, date));
			fields.push(hiddenField(V4_EXPIRES_NAME, expires));
			fields.push(hiddenField(V4_SIGNED_HEADERS_NAME, "host"));
			fields.push(hiddenField(V4_SIGNATURE_NAME, signature));
		}
		else {
			fields.push(hiddenField(ACCESS_KEY_FIELD_NAME, awsConfig.s3.accessKeyId));
			fields.push(hiddenField(SIGNATURE_FIELD_NAME, this.policy.generateSignature(awsConfig.s3.secretAccessKey)));
		}
		fields.push(hiddenField(POLICY_FIELD_NAME, encodedPolicy));
		return fields;
	}
}

var assembleObject = function(key, value) {
	var obj = {};
	obj[key] = value;
	return obj;
}

var assembleV4CredentialValue = function(accessKeyId, date, region) {
	return accessKeyId + "/" + date + "/" + region + "/s3/aws4_request";
}

var getSignatureKey = function(Crypto, key, dateStamp, regionName, serviceName, policy) {
    var kDate = Crypto.HmacSHA256(dateStamp, "AWS4" + key);
    var kRegion = Crypto.HmacSHA256(regionName, kDate);
    var kService = Crypto.HmacSHA256(serviceName, kRegion);
    var kSigning = Crypto.HmacSHA256("aws4_request", kService);
    return Crypto.HmacSHA256(policy, kSigning).toString();
}

var hiddenField = function(fieldName, value) {
	return {name: fieldName, value : value};
}

exports.Policy = Policy;
exports.S3Form = S3Form;