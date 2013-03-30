
var m2pong = m2pong || {};

$.Class('m2pong.Display', {

	init: function(options){

		if(!m2pong.config.debug){
			console.log = function(){};
		}

		this._options = {
		};
		$.extend(true, this._options, options || {});

		this._players = [];

		this._balls = [];

		// Init websocket
		this._ws = $.websocket('ws://' + location.host, {
			open: $.proxy(this._initConnection, this),
			close: $.proxy(this._connectionClosed, this),
			message: $.proxy(this._receiveMessage, this)
		}, 'm2pong-display');

		$('#qr div.code').qrcode('http://' + location.host);

	},

	_connectionClosed: function(e){

		$('body').html('<div id="connection_lost">Connection lost. Please reload.</div>');
		
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

		if(this._players.length <= 1){
			$('#qr').hide();
		}

		this._players[data.nr] = new m2pong.Player({
			nr: data.nr,
			name: data.name,
			width: data.width,
			height: data.height
		});

	},

	removePlayer: function(data){

		this._players[data.nr] && this._players.splice(data.nr, 1)[0].destroy();
		$('#qr').show();

	},

	movePlayer: function(data){

		this._players[data.nr] && this._players[data.nr].move(data.x, data.y);

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

	},

	setScore: function(data){

		this._players[data.nr] && this._players[data.nr].setScore(data.score);

	}

});
