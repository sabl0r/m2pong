
var m2pong = m2pong || {};

$.Class('m2pong.Ball', {

	init: function(options){

		this._options = {
			_x: 0,
			_y: 0,
			_element: null
		};
		$.extend(true, this._options, options || {});
		
		this._element = $('<div class="ball"></div>').appendTo('#playground');

		this.move(this._options.x, this._options.y);
		
	},

	destroy: function(){

		this._element.remove();

	},

	move: function(x, y){

		this.x = x;
		this.y = y;

		this._element.css({
			left: x + "vw",
			top: y + "vh"
		});

	}

});
