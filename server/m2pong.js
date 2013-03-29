
var _ = require('underscore');
var WebSocketServer = require('websocket').server;
var Display = require('./display.js').Display;
var Player = require('./player.js').Player;
var Ball = require('./ball.js').Ball;
var Config = require('../config.js').Config;

if(!Config.debug){
	console.log = function(){};
}

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
		y: 44,
		height: 12,
		width: 1.5
	},
	'1': {
		x: 98.5,
		y: 44,
		height: 12,
		width: 1.5
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
				removePlayer(null, connection.id);
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
			name: data.name,
			width: players_positions[nr].width,
			height: players_positions[nr].height
		});

		players[nr].width = players_positions[nr].width;
		players[nr].height = players_positions[nr].height;
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

		if(players[data.nr].y <= 0){
			return;
		}

		players[data.nr].move(players[data.nr].x, players[data.nr].y - 2);

	},

	playerMoveDown: function(connection, data){

		if(players[data.nr].y >= 100 - players[data.nr].height){
			return;
		}

		players[data.nr].move(players[data.nr].x, players[data.nr].y + 2);

	}

};

function removeDisplay(id){

	_(displays).each(function(d, i){

		if(d.connection.id === id){
			displays.splice(i, 1);
			return;
		}

	});

	if(_(displays).size() === 0){
		resetGame();
	}

}

function removePlayer(nr, connection_id){

	_(players).each(function(p, i){
		
		if((nr !== null && nr === i) || (connection_id !== null && p.connection.id === connection_id)){
				
			exports.sendToDisplays('removePlayer', {
				nr: p.nr
			});

			p.connection.connected && p.connection.close();

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

function collision(p, b){

    return !(
        ((p.y + p.height) < (b.y)) ||
        (p.y > (b.y + b.height)) ||
        ((p.x + p.width) < b.x) ||
        (p.x > (b.x + b.width))
    );

}

function startGame(){

	console.log('Game started.');
	startRound();

}

function stopGame(){

	// stop timer
	clearInterval(timer);

	// remove all balls
	_(balls).each(function(b, i){
		removeBall(i);
	});

	// reset scores
	_(players).each(function(p){
		p.setScore(0);
	});

	console.log('Game stopped.');

}

function resetGame(){

	stopGame();

	// remove all players
	_(players).each(function(p, i){
		removePlayer(i);
	});

}

function restartGame(){

	resetGame();
	startGame();

}

function startRound(){

	// speed/direction
	var direction = _.random(0, 10);
	var speed = _.random(5, 10);
	var dX = (Math.random() < 0.5 ? -1 : 1) * speed / 100;
	var dY = (Math.random() < 0.5 ? -1 : 1) * (speed + direction) / 100;

	// new ball with random start position
	var ball = addBall(_.random(45, 55), _.random(45, 55));

	clearInterval(timer);
	timer = setInterval(function(){

		// ball hit roof or floor
		if(ball.y <= 0 || ball.y >= 100 - ball.height){
			dY *= -1;
		}

		// player 0 misses
		if(ball.x <= 0){
			players[1].setScore(players[1].score + 1);
			newRound();
		}

		// player 1 misses
		if(ball.x >= 100 - ball.width){
			players[0].setScore(players[0].score + 1);
			newRound();
		}

		// ball hit player
		_(players).each(function(el){

			if(collision(el, ball)){
				dX *= -1;
				return;
			}
			
		});

		ball.move(ball.x + dX, ball.y + dY);
		
	}, 5);

	console.log('Round started.');

}

function newRound(){

	// stop timer
	clearInterval(timer);

	// remove all balls
	_(balls).each(function(b, i){
		removeBall(i);
	});

	// start new round
	startRound();

}
