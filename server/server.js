
var http = require('http');
var send = require('send');
var path = require('path');
var os = require('os');
var m2pong = require('./m2pong');

function start(){

	var httpServer = http.createServer(function(req, res){

		if(req.url === '/'){
			req.url = '/client/';
		}

		send(req, req.url)
		.root(path.dirname(require.main.filename))
		.on('error', function(err){
			res.statusCode = err.status || 500;
			res.end(err.message);
		})
		.pipe(res);

	}).listen(8080);

	var ip = '0.0.0.0';
	os.networkInterfaces().eth0.forEach(function(e){
		if(!e.internal && e.family === 'IPv4'){
			ip = e.address;
			return;
		}
	});
	
	console.log('Server running at http://' + ip+ ':8080/');

	var m2pongServer = m2pong.start(httpServer);

}

exports.start = start;
