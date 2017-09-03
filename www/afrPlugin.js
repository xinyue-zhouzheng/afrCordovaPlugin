if (typeof jQuery === 'undefined') {
  	throw new Error('afrPlugin\'s JavaScript requires jQuery')
}

+function ($) {
	'use strict';
	var version = $.fn.jquery.split(' ')[0].split('.')
	if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
		throw new Error('afrPlugin\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4')
	}
}(jQuery);

  
var AfrPlugin = {
	defaults: {
	    "x-app-key": "",		//捷通开发者应用appkey,必填
	    "x-sdk-version": "5.1",	//sdk版本，必填
	    "x-request-date": "",	//请求日期，必填
	    //afr识别配置串，必填
	    "x-task-config": "capkey=afr.cloud.recog",
	    "x-session-key": "",	//验证码，必填
	    "x-udid": "101:1234567890",	//udid，必填
	},

	detectUrl: "http://test.api.hcicloud.com:8880/afr/detect",
	recogUrl: "http://test.api.hcicloud.com:8880/afr/recognise",
	accountTypeArray: [1, 2],	//1-JT测试帐号， 1-JT商用账号，默认为1
	version: "1.0.0",
	groupId: "",
	init: function(options) {
		this.options = this.getOptions(options);
		this.resetUrl(this.options);
		this.initGroupId(options);
	},

	getDefaults: function() {
		return this.defaults;
	},

	optionsVerify: function(options) {
		if (typeof options["appKey"] === "undefined" || !$.trim(options["appKey"])) {
			throw new Error("appKey couldn't be empty");
		} 

		if (typeof options["sessionKey"] === "undefined" || !$.trim(options["sessionKey"])) {
			throw new Error("sessionKey couldn't be empty");
		}

		if (typeof options["requestDate"] === "undefined" || !$.trim(options["requestDate"])) {
			throw new Error("requestDate couldn't be empty");
		}
		if (typeof options["groupId"] === "undefined" || !$.trim(options["groupId"])) {
			throw new Error("groupId couldn't be empty");
		}
		if (typeof options["accountType"] === "undefined" ||  
				$.inArray(options["accountType"], this.accountTypeArray) == -1) {
			throw new Error("accountType must be one of (1, 2)");
		}

	},

	getOptions: function(options) {

		this.optionsVerify(options);
		var newOption = {};
		newOption["x-app-key"] = $.trim(options["appKey"]);
		newOption["x-request-date"] = $.trim(options["requestDate"]);
		newOption["x-session-key"] = $.trim(options["sessionKey"]);

		options = $.extend({}, this.getDefaults(), newOption);

		return options;
	},
	initGroupId: function(options){
		this.groupId = options["groupId"];
	},
	resetUrl: function(options) {
		var accountType = $.trim(options["accountType"]);
		if (accountType == 2){
			this.recogUrl = "http://api.hcicloud.com:8880/afr/recognise";
			this.detectUrl = "http://api.hcicloud.com:8880/afr/detect";
		}
	},
	dataToBlob: function(data) {
				  
		var bstr = atob(data), n = bstr.length, u8arr = new Uint8Array(n);
		while(n--){
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new Blob([u8arr], {type:"image/jpeg"});
	},
	//convert string to xml object
	string2XML: function(xmlString) {
	    // for IE
	    if (window.ActiveXObject) {
	      var xmlobject = new ActiveXObject("Microsoft.XMLDOM");
	      xmlobject.async = "false";
	      xmlobject.loadXML(xmlstring);
	      return xmlobject;
	    }
	    // for other browsers
	    else {
	      var parser = new DOMParser();
	      var xmlobject = parser.parseFromString(xmlstring, "text/xml");
	      return xmlobject;
	    }
	 },
	 //convert xml object to string
	XML2String: function(xmlObject) {
	    // for IE
	    if (window.ActiveXObject) {       
	      return xmlobject.xml;
	    }
	    // for other browsers
	    else {        
	      return (new XMLSerializer()).serializeToString(xmlobject);
	    }
	 },
	detect: function(data){
		var result;
		// var data = this.dataToBlob(data);
		$.ajax({
			headers: this.options,
			processData: false,
			type: "POST",
			url: this.detectUrl,
			data: data,
			async:false,
			success: function(res){
				console.log(res);
				result = res;
			}
		})
		return result
	},
	recog: function(data){	
		var data = this.dataToBlob(data);
		var detectResult = this.detect(data);
		if (typeof(detectResult) == "string"){
			detectResult == this.string2XML(detectResult);
		}
		console.log(detectResult);
		if($(detectResult).find("ErroNo").text() == 0){
			var faceId = $(detectResult).find("FaceId").text();
			console.log(faceId);
			var groupId = this.options["groupId"];
			var newOptions = this.options;
			newOptions["x-task-config"] = "capkey=afr.cloud.recog,groupid=" + this.groupId + ",faceid=" + faceId;
			var result;
			$.ajax({
				headers: newOptions,
				processData: false,
				type: "POST",
				url: this.recogUrl,
				data: data,
				async:false,
				success: function(res){
					console.log(res);
					result = res;
				}
			})
			return result;
		}else{
			return detectResult;
		}		
	},

}













