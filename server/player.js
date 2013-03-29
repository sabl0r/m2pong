
var m2pong = require('./m2pong');

Player = function(connection, name, nr){

	this.connection = connection;
	this.name = name;
	this.nr = nr;

	this.x = 0;
	this.y = 0;
	this.height = 0;
	this.width = 0;

	this.score = 0;

	this.move = function(x, y){

		this.x = x;
		this.y = y;

		m2pong.sendToDisplays('movePlayer', {
			nr: this.nr,
			x: this.x,
			y: this.y
		});

	};

	this.setScore = function(score){

		this.score = score;

		m2pong.sendToDisplays('setScore', {
			nr: this.nr,
			score: score
		});

	};

};

exports.Player = Player;
