
var m2pong = m2pong || {};

$.Class('m2pong.Client', {

	init: function(options){

		if(!m2pong.config.debug){
			console.log = function(){};
		}

		if(!this._isBrowserSupported()){
			var download = this._isAndroid() ? ' like <a href="https://play.google.com/store/apps/details?id=org.mozilla.firefox">Firefox</a> or <a href="https://play.google.com/store/apps/details?id=com.android.chrome">Chrome</a>' : '';
			$('body').html('<div id="error">Your browser is not supported. Please use a decent browser' + download + '.</div>');
			return;
		}

		this._options = {
		};
		$.extend(true, this._options, options || {});

		this.nr = null;

		// Init websocket
		this._ws = $.websocket('ws://' + location.host, {
			open: $.proxy(this._joinGame, this),
			close: $.proxy(this._connectionClosed, this),
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

		// touch hold and click events
		this._longClick($('#up span'), this._moveUp);
		this._longClick($('#down span'), this._moveDown);

		// touch move events
		$(document).on('move', $.proxy(function(e){

			if(Math.abs(e.deltaY) < 2){
				return;
			}

			e.pageY < e.startY ? this._moveUp() : this._moveDown();
			
		}, this));
		
	},

	_longClick: function(el, f){

		var timeout = 0;
		el.on('vmousedown', $.proxy(function(e) {
			timeout = setInterval($.proxy(function(){
				f.call(this);
				e.preventDefault();
			}, this), 50);
		}, this)).on('vmouseup', function(e){
			clearInterval(timeout);
		});

	},

	_isBrowserSupported: function(){

		return Modernizr.websockets && Modernizr.cssvhunit && Modernizr.cssvwunit;

	},

	_isAndroid: function(){

		return navigator.userAgent.toLowerCase().indexOf('android') > -1;

	},

	_connectionClosed: function(e){

		$('body').html('<div id="error">Connection lost. Please reload.</div>');
		
	},

	_joinGame: function(e){

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

	changeName: function(data){

		this._joinGame();

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
