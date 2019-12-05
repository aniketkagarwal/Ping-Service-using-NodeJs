var http = require('http');
var url = require('url');

var server = http.createServer(function(req,res){
	var parsedUrl = url.parse(req.url, true); // get the url and parse it
	var path = parsedUrl.pathname; // get the path
	var trimmedPath = path.replace(/^\/+|\/+$/g, ''); // parsing trimmed path
	res.end('Hello World\n'); // send the response
	console.log('Request received on path: '+trimmedPath); // log the request path
});

server.listen(3000, function(){
	console.log("The server is listening on port 3000 now");
});
