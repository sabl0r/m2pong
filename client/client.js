
var m2pong = m2pong || {};

$.Class('m2pong.Client', {

	init: function(options){

		this._options = {
		};
		$.extend(true, this._options, options || {});
		
		// Init websocket
		this._ws = $.websocket('ws://' + location.host, {
			open: $.proxy(this._initConnection, this),
			error: $.proxy(this._handleError, this),
			message: $.proxy(this._receiveMessage, this)
		}, 'm2pong-client');
		
	},

	_handleError: function(e){

		console.log(e);
		
	},

	_initConnection: function(e){

		this._ws.send('joinGame', {
			name: 'Hans'
		});

	},

	_receiveMessage: function(e){

		console.log(e.data);
		result = JSON.parse(e.data);
		switch(result.type){
			case 'playerJoined':
				break;
			default:
				console.log('Unknown answer from server.');
				break;
		}
		
	}

});
