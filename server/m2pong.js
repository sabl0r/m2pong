
var _ = require('underscore');
var WebSocketServer = require('websocket').server;
var Display = require('./display.js').Display;
var Player = require('./player.js').Player;
var Ball = require('./ball.js').Ball;

exports.config = {
	minPlayers: 2,
	maxPlayers: 2
};

var display_connection_id = 0;
var client_connection_id = 0;

var displays = [];

var players = {};
var players_numbers = [ 0, 1 ];
var players_positions = {
	'0': {
		x: 0,
		y: 50
	},
	'1': {
		x: 100,
		y: 50
	}
};

var balls = [];

var timer = null;

exports.start = function(httpServer){
	
	var wsServer = new WebSocketServer({
		httpServer: httpServer
	});

	wsServer.on('request', function(request){

		var connection = null;
		
		if(request.requestedProtocols[0] === 'm2pong-display'){
			
			connection = request.accept(null, request.origin);
			connection.type = 'display';
			connection.id = display_connection_id++;
			
			console.log('New display connection accepted.');

		} else if(request.requestedProtocols[0] === 'm2pong-client'){

			if(_(players).size() === exports.config.maxPlayers){
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
			var h = messageHandlers[result.type];

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

};

exports.sendToDisplays = function(type, data){

	_(displays).each(function(display){
		display.connection.send(JSON.stringify({
			type: type,
			data: data
		}));
	});

};

var messageHandlers = {

	registerDisplay: function(connection, data){

		displays.push(new Display(connection, data.viewport.width, data.viewport.height));

	},

	joinGame: function (connection, data){

		var nr = players_numbers.shift();
		players[nr] = new Player(connection, data.name, nr);

		exports.sendToDisplays('addPlayer', {
			nr: nr,
			name: data.name
		});

		players[nr].move(players_positions[nr].x, players_positions[nr].y);

		connection.send(JSON.stringify({
			type: 'playerJoined',
			data: {
				nr: nr
			}
		}));

		// start game
		if(_(players).size() === 2){
			startGame();
		}

	},
			
	playerMoveUp: function(connection, data){

		if(players[data.nr].y === 0){
			return;
		}

		players[data.nr].move(players[data.nr].x, players[data.nr].y - 1);

	},

	playerMoveDown: function(connection, data){

		if(players[data.nr].y === 100){
			return;
		}

		players[data.nr].move(players[data.nr].x, players[data.nr].y + 1);

	}

};

function removeDisplay(id){

	_(displays).each(function(d, i){

		if(d.connection.id === id){
			displays.splice(i, 1);
			return;
		}

	});

}

function removePlayer(id){

	_(players).each(function(p, i){
				
		if(p.connection.id === id){
			exports.sendToDisplays('removePlayer', {
				nr: p.nr
			});

			players_numbers.push(p.nr);
			players_numbers.sort();
			delete players[i];
			return;
		}
		
	});

	if(_(players).size() < exports.config.minPlayers){
		stopGame();
	}

}

function addBall(x, y){

	var ball = new Ball(balls.length, x, y);
	balls.push(ball);

	exports.sendToDisplays('addBall', {
		x: x,
		y: y
	});

	return ball;

}

function removeBall(id){

	balls.splice(id, 1)[0].destroy();

}

function startGame(){
	return;
	var ball = addBall(0, 0);

	timer = setInterval(function(){
		ball.move(ball.x + 5, ball.y);
	}, 10);

}

function stopGame(){

	clearInterval(timer);
	_(balls).each(function(b, i){
		removeBall(i);
	});

}
