
var m2pong = m2pong || {};

$.Class('m2pong.Display', {

	init: function(options){

		this._options = {
		};
		$.extend(true, this._options, options || {});

		this._players = [];

		this._balls = [];

		// Init websocket
		this._ws = $.websocket('ws://' + location.host, {
			open: $.proxy(this._initConnection, this),
			error: $.proxy(this._handleError, this),
			message: $.proxy(this._receiveMessage, this)
		}, 'm2pong-display');
						
	},

	_handleError: function(e){

		console.log(e);
		
	},

	_initConnection: function(e){
	},

	_receiveMessage: function(e){

		var result = JSON.parse(e.originalEvent.data);
		switch(result.type){
			case 'initGame':
				break;
			case 'addPlayer':
				this.addPlayer(result.data.position, result.data.name);
				break;
			case 'removePlayer':
				this.removePlayer(result.data.position);
				break;
			case 'addBall':
				this.addBall(result.data.x, result.data.y);
				break;
			case 'removeBall':
				this.removeBall(result.data.id);
				break;
			case 'moveBall':
				this.moveBall(result.data.id, result.data.x, result.data.y);
				break;
			default:
				console.log('Unknown answer from server.');
				break;
		}
		
	},

	addPlayer: function(position, name){

		this._players[position] = new m2pong.Player({
			position: position,
			name: name
		});

	},

	removePlayer: function(position){

		this._players[position].destroy();
		delete this._players[position];

	},

	addBall: function(x, y){

		this._balls.push(new m2pong.Ball({
			x: x,
			y: y
		}));

	},

	removeBall: function(id){

		this._balls.splice(id, 1)[0].destroy();

	},

	moveBall: function(id, x, y){

		this._balls[id].move(x, y);

	}

});
