
var m2pong = m2pong || {};

$.Class('m2pong.Player', {

	init: function(options){

		this._element = null;

		this._label = null;

		this._options = {
			
			nr: null,

			name: null,

			width: null,

			height: null
	
		};
		$.extend(true, this._options, options || {});
		
		this._element = $('<div class="player" id="player_' + this._options.nr + '"></div>').css({
			width: this._options.width + 'vw',
			height: this._options.height + 'vh'
		}).appendTo('body');
		this._label = $('<div class="player_label" id="player_label_' + this._options.nr + '" />').appendTo('body');

		this.setScore(0);

	},

	destroy: function(){

		this._element.remove();
		this._label.remove();

	},

	move: function(x, y){

		this._element.css({
			left: x + 'vw',
			top: y + 'vh'
		});

	},

	setScore: function(score){

		this.score = score;
		this._label.text(this._options.name + ' (' + this.score + ')');

	}

});
