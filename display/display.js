
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

		this._ws.send('registerDisplay', {
			viewport: {
				width: $(window).width(),
				height: $(window).height()
			}
		});

	},

	_receiveMessage: function(e){

		var result = JSON.parse(e.originalEvent.data);
		console.log(result);
		if(this[result.type]){
			this[result.type](result.data);
		} else {
			console.log('Unknown message from server.');
		}
		
	},

	addPlayer: function(data){

		this._players[data.nr] = new m2pong.Player({
			nr: data.nr,
			name: data.name
		});

	},

	removePlayer: function(data){

		this._players[data.nr] && this._players[data.nr].destroy();
		delete this._players[data.nr];

	},

	movePlayer: function(data){

		this._players[data.nr].move(data.x, data.y);

	},

	addBall: function(data){

		this._balls.push(new m2pong.Ball({
			x: data.x,
			y: data.y
		}));

	},

	removeBall: function(data){

		this._balls.splice(data.id, 1)[0].destroy();

	},

	moveBall: function(data){

		this._balls[data.id].move(data.x, data.y);

	}

});
