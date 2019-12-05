var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

var httpServer = http.createServer(function(req, res){
	server(req, res);
});

var httpsServerOptions = {
	'key': fs.readFileSync('./https/key.pem'),
	'cert': fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, function(req, res){
	server(req, res);
});

var server = function(req, res){
	var parsedUrl = url.parse(req.url, true); // parsing the url
	var path = parsedUrl.pathname; // get the path
	var trimmedPath = path.replace(/^\/+|\/+$/g, ''); // trimming the path
	var queryStringObject = parsedUrl.query; // get the query string as an object
	var method = req.method.toLowerCase(); // get the http method
	var headers = req.headers; // get the headers as an object

	//getting the payload, if any
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	req.on('data', function(data){
		buffer += decoder.write(data);
	});
	req.on('end', function(){
		buffer += decoder.end();

		//checking the router for a matching path for a handler
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		//Data object to send to the handler
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : buffer
		};

		//routing the request to the handler
		chosenHandler(data, function(statusCode, payload){
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
			payload = typeof(payload) == 'object' ? payload : {};

			var payloadString = JSON.stringify(payload); // converting the payload to a string

			// returning the response
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);
			console.log(trimmedPath, statusCode);
		});
	});
};

httpServer.listen(config.httpPort, function(){
	console.log('The HTTP server is running on port '+config.httpPort);
});

httpsServer.listen(config.httpsPort, function(){
	console.log('The HTTPS server is running on port '+config.httpsPort);
});

var handlers = {}; // defining the handlers

//Ping handler
handlers.ping = function(data, callback){
	callback(200);
};

handlers.notFound = function(data, callback){
	callback(404);
};

// Defining the request router
var router = {
	'ping' : handlers.ping
};
