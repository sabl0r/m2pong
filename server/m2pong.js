
var WebSocketServer = require('websocket').server;
var Display = require('./display.js').Display;
var Player = require('./player.js').Player;
var Ball = require('./ball.js').Ball;

exports.config = {
	minPlayers: 2,
	maxPlayers: 2
};

var msgHandlers = {
	joinGame: joinGame
};

var display_connection_id = 0;
var client_connection_id = 0;

var displays = [];

var players = [];
var players_positions = [ 0, 1 ];

var balls = [];

var timer = null;

function start(httpServer){
	
	var wsServer = new WebSocketServer({
		httpServer: httpServer
	});

	wsServer.on('request', function(request){

		var connection = null;
		
		if(request.requestedProtocols[0] === 'm2pong-display'){
			
			connection = request.accept(null, request.origin);
			connection.type = 'display';
			connection.id = display_connection_id++;
			displays.push(new Display(connection));

			console.log('New display connection accepted.');

		} else if(request.requestedProtocols[0] === 'm2pong-client'){

			if(players.length === exports.config.maxPlayers){
				request.reject(503, 'Too much players.');
				return;
			}

			connection = request.accept(null, request.origin);
			connection.type = 'client';
			connection.id = client_connection_id++;
			
			console.log('New client connection accepted.');
		}

		if(!connection){
			return;
		}

		connection.on('message', function(msg){
			console.log('Received Message: ' + msg.utf8Data);
			var result = JSON.parse(msg.utf8Data);
			var h = msgHandlers[result.type];
			if(h){
				h(connection, result.data);
			} else {
				console.log('Can\'t handle message of type ' + result.type + '.');
			}
		});

		connection.on('close', function(reasonCode, description) {
			if(connection.type === 'display'){
				removeDisplay(connection.id);
			} else if(connection.type === 'client'){
				removePlayer(connection.id);
			}

			console.log(connection.type.charAt(0).toUpperCase() + connection.type.slice(1) + ' (' + connection.remoteAddress + ') disconnected.');
		});

	});

}

function sendToDisplays(type, data){

	displays.forEach(function(display){
		display.connection.send(JSON.stringify({
			type: type,
			data: data
		}));
	});

}

function joinGame(connection, data){

	var position = players_positions.shift();
	players.push(new Player(connection, data.name, position));

	sendToDisplays('addPlayer', {
		position: position,
		name: data.name
	});

	// start game
	if(players.length === 2){
		startGame();
	}

}

function removeDisplay(id){

	displays.forEach(function(d, i){

		if(d.connection.id === id){
			displays.splice(i, 1);
			return;
		}

	});

}

function removePlayer(id){

	players.forEach(function(p, i){
		
		if(p.connection.id === id){
			sendToDisplays('removePlayer', {
				position: p.position
			});

			players_positions.push(p.position);
			players_positions.sort();
			players.splice(i, 1);
			return;
		}
	});

	if(players.length < exports.config.minPlayers){
		stopGame();
	}

}

function addBall(x, y){

	var ball = new Ball(balls.length, x, y);
	balls.push(ball);

	sendToDisplays('addBall', {
		x: x,
		y: y
	});

	return ball;

}

function removeBall(id){

	balls.splice(id, 1)[0].destroy();

}

function startGame(){

	var ball = addBall(0, 0);

	timer = setInterval(function(){
		ball.move(ball.x + 5, ball.y);
	}, 100);

}

function stopGame(){

	clearInterval(timer);
	balls.forEach(function(b, i){
		removeBall(i);
	});

}

exports.start = start;
exports.sendToDisplays = sendToDisplays;
