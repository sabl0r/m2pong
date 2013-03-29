
var m2pong = m2pong || {};

$.Class('m2pong.Client', {

	init: function(options){

		this._options = {
		};
		$.extend(true, this._options, options || {});

		this.nr = null;

		// Init websocket
		this._ws = $.websocket('ws://' + location.host, {
			open: $.proxy(this._initConnection, this),
			error: $.proxy(this._handleError, this),
			message: $.proxy(this._receiveMessage, this)
		}, 'm2pong-client');

		$(document).keydown($.proxy(function(e){

			if(e.which === 38){
				this._moveUp();
				e.preventDefault();
			} else if(e.which === 40){
				this._moveDown();
				e.preventDefault();
			}

		}, this));

	},

	_handleError: function(e){

		console.log(e);
		
	},

	_initConnection: function(e){

		var names = ['Mare', 'Babse', 'Vrenal', 'Traudl', 'Rosi', 'Hans', 'Sepp', 'Schorsch', 'Anda', 'Girgl'];
		var pos = Math.floor(Math.random() * names.length);
		this._ws.send('joinGame', {
			name: names.splice(pos, 1)[0]
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

	playerJoined: function(data){

		this.nr = data.nr;

	},

	_moveUp: function(){

		this._ws.send('playerMoveUp', {
			nr: this.nr
		});

	},

	_moveDown: function(){

		this._ws.send('playerMoveDown', {
			nr: this.nr
		});

	}

});
