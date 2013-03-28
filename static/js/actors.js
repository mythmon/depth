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
    sheet: 'img/sprites.png',
    image: 'hero_s',
    speed: 35
  };
  $.extend(defaults, options);
  Actor.call(this, defaults);
}

Hero.prototype = new Actor();

Hero.prototype.tick = function(dt) {
  Actor.prototype.tick.call(this, dt);

  var offset = [0, 0];

  if (window.keys(37, 64)) {
    offset[0] -= 1;
  }
  if (window.keys(39, 68)) {
    offset[0] += 1;
  }
  if (window.keys(38, 87)) {
    offset[1] -= 1;
  }
  if (window.keys(40, 63)) {
    offset[1] += 1;
  }

  this.x += offset[0] * this.speed * dt;
  this.y += offset[1] * this.speed * dt;
};
/* end Hero */

/* class Tile */
function Tile(options) {
  var defaults = {
    sheet: 'img/sprites.png'
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