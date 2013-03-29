
var m2pong = require('./m2pong');

Ball = function(id, x, y){

	this.id = id;
	this.x = x;
	this.y = y;
	
	this.width = 2;
	this.height = 2;

	this.move = function(x, y){
		this.x = x;
		this.y = y;

		m2pong.sendToDisplays('moveBall', {
			id: this.id,
			x: this.x,
			y: this.y
		});

	};

	this.destroy = function(){

		m2pong.sendToDisplays('removeBall', {
			id: this.id
		});

	};

};

exports.Ball = Ball;
