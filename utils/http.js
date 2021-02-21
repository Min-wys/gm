var http = require('http');
var https = require('https');
var qs = require('querystring');
// var fibers = require('fibers');

var request = require('request');

// var log4js = require('log4js');
// log4js.configure({
//  appenders: {
//   out: { type: 'stdout' },
//   app: { type: 'file', filename: 'timecount.log' }
//  },
//  categories: {
//   default: { appenders: [
//   	// 'out',
//   	'app' 
//   	], level: 'debug' }
//  }
// });
// var logger = log4js.getLogger();


String.prototype.format = function(args) {
	var result = this;
	if (arguments.length > 0) {
		if (arguments.length == 1 && typeof (args) == "object") {
			for (var key in args) {
				if(args[key]!=undefined){
					var reg = new RegExp("({" + key + "})", "g");
					result = result.replace(reg, args[key]);
				}
			}
		}
		else {
			for (var i = 0; i < arguments.length; i++) {
				if (arguments[i] != undefined) {
					//var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出
					var reg = new RegExp("({)" + i + "(})", "g");
					result = result.replace(reg, arguments[i]);
				}
			}
		}
	}
	return result;
};



exports.newpost = function(host,port,path,data,callback){

	let postData = JSON.stringify(data);
	var content = data;  
	var options = {  
	  hostname: host,
	  timeout:60000,
	  port: port,
	  path: path,
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/json',
	    'Content-Length': Buffer.byteLength(postData)
	  }

	};  
          
	request(options, function (err, res, body) {
		let datastamp = new Date().getTime();
		//console.log(res);
		//console.log('Time: ' + datastamp+" postData=>"+postData);  
		//logger.debug('Time: ' + datastamp+" statusCode=>"+res.statusCode);
		if (err) {
		  console.log(err)
		}else {
		  console.log(body);
		}
	})
}



exports.post = function (host,port,path,data,callback) {
		
	let postData = JSON.stringify(data);
	var content = data;  
	var options = {  
	  hostname: host,
	  timeout:60000,
	  port: port,
	  path: path,
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/json',
	    'Content-Length': Buffer.byteLength(postData)
	  }

	};  

	var req = http.request(options, function (res) {  
		let datastamp = new Date().getTime();
		console.log('Time: ' + datastamp+" statusCode=>"+res.statusCode+" postData=>"+postData);  
		//logger.debug('Time: ' + datastamp+" statusCode=>"+res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));  
		res.setEncoding('utf8');  
		res.on('data', function (chunk) {  
			console.log('BODY: ' + chunk);
			callback(chunk);
		});  
	});
	  
	req.on('error', function (e) {  
		console.log('problem with request: ' + e.message);  
		callback(JSON.stringify(e));
	});  

	req.write(postData);
	req.end(); 
};

exports.get2 = function (url,data,callback,safe) {
	var content = qs.stringify(data);
	var url = url + '?' + content;
	var proto = http;
	if(safe){
		proto = https;
	}
	var req = proto.get(url, function (res) {  
		//console.log('STATUS: ' + res.statusCode);  
		//console.log('HEADERS: ' + JSON.stringify(res.headers));  
		res.setEncoding('utf8');  
		res.on('data', function (chunk) {  
			//console.log('BODY: ' + chunk);
			var json = JSON.parse(chunk);
			callback(true,json);
		});  
	});
	  
	req.on('error', function (e) {  
		console.log('problem with request: ' + e.message);
		callback(false,e);
	});  
	  
	req.end(); 
};

exports.get = function (host,port,path,data,callback,safe) {
	var content = qs.stringify(data);  
	var options = {  
		hostname: host,  
		path: path + '?' + content,  
		method:'GET'
	};
	if(port){
		options.port = port;
	}
	var proto = http;
	if(safe){
		proto = https;
	}
	//console.log(options);

	var req = proto.request(options, function (res) {  
		// console.log('STATUS: ' + res.statusCode);  
		//console.log('HEADERS: ' + JSON.stringify(res.headers));  
		let resData = '';
		res.setEncoding('utf8');  
		res.on('data', function (chunk) {  
			// console.log('BODY: '+chunk);
			//var json = JSON.parse(chunk);
			resData += chunk;
			
		});  

		res.on('end',function(){
           callback(true,resData);
        });



	});
	// return;
	req.on('error', function (e) {  
		console.log('problem with request: ' + e.message);
		callback(false,e);
	});  
	  
	req.end(); 
};

exports.getSync = function (url,data,safe,encoding,callback) {
	//console.log("== getSync ==");
	
	var content = qs.stringify(data);
	var url = url + '?' + content;
	var proto = http;
	if(safe){
		proto = https;
	}

	if(!encoding){
		encoding = 'utf8';
	}
	var ret = {
		err:null,
		data:null,
	};

	//var f = fibers.current;
	//console.log(url);
	var req = proto.get(url, function (res) {  
		//console.log('STATUS: ' + res.statusCode);  
		//console.log('HEADERS: ' + JSON.stringify(res.headers));  
		res.setEncoding(encoding);
		var body = '';

		ret.type = res.headers["content-type"];
		res.on('data', function (chunk) {
			body += chunk;
			
		});

		//console.log("body"+res);

		res.on('end',function(){
			if(encoding != 'binary'){
				try {
						
					ret.data = JSON.parse(body);
					//f.run();
				} catch(e) {
					//console.log('JSON parse error: ' + e + ', url: ' + url);
				}
			}
			else{
				ret.data = body;
				//f.run();
			}
			callback(ret);
			//console.log(ret);
		});





	});
	  
	req.on('error', function (e) {  
		//console.log('problem with request: ' + e.message);
		ret.err = e;
		//f.run();
	});
	  
	req.end();
	//console.log(ret);
	//fibers.yield();
	return ret;
};

exports.send = function(res,errcode,errmsg,data){

	if(data == null){
		data = {};
	}
	data.code = errcode;
	data.desc = errmsg;
	
	var jsonstr = JSON.stringify(data);
	//console.log(jsonstr);
	res.send(jsonstr);
};


exports.sendXML = function(res,xml){
	res.send(xml);
};