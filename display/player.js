
var m2pong = m2pong || {};

$.Class('m2pong.Player', {

	init: function(options){

		this._element = null;

		this._label = null;

		this._options = {
			
			position: 1,

			name: null
	
		};
		$.extend(true, this._options, options || {});
		
		this._element = $('<div class="player" id="player_' + this._options.position + '"></div>').appendTo('body');
		//this._label = $('<div class="player_label" id="player_label_' + this._options.position + '">' + this._options.name + '</div>').appendTo('body');
		
	},

	destroy: function(){

		this._element.remove();

	},

	move: function(pos){

		this._element.css({
			top: pos
		});

	}

});
