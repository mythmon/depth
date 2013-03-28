(function() {

/* class Actor */
function Actor(options) {
  var defaults = {
    x: 0, y: 0
  };
  $.extend(this, defaults, options);

  this.sprite = new Sprite({
    sheet: this.sheet,
    image: this.image
  });
}

Actor.prototype.render = function(ctx) {
  ctx.save();
  ctx.translate(this.x, this.y);
  this.sprite.render(ctx);
  ctx.restore();
};

Actor.prototype.tick = function(dt) {
};
/* end Actor */

/* class Hero */
function Hero(options) {
  var defaults = {
    sheet: 'img/author.png',
    image: 'hero_s'
  };
  $.extend(defaults, options);
  Actor.call(this, defaults);
}

Hero.prototype = new Actor();
/* end Hero */

/* class Tile */
function Tile(options) {
  var defaults = {
    sheet: 'img/author.png'
  };
  var o = $.extend({}, defaults, options);
  Actor.call(this, o);
}

Tile.prototype = new Actor();
/* end Tile */

$.extend(window, {
  Actor: Actor,
  Hero: Hero,
  Tile: Tile
});

})();