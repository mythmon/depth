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
    speed: 0.2,
    anim_pos: []
  };
  $.extend(defaults, options);
  Actor.call(this, defaults);

  key('left, a', this.move.bind(this, -32, 0));
  key('right, d', this.move.bind(this, 32, 0));
  key('up, w', this.move.bind(this, 0, -32));
  key('down, s', this.move.bind(this, 0, 32));
}

Hero.prototype = new Actor();

Hero.prototype.move = function(dx, dy) {
  if (this.anim_pos.length >= 2) return false;

  var i;

  var target = [this.x, this.y];
  for (i = 0; i<this.anim_pos.length; i++) {
    target[0] += this.anim_pos[i][0];
    target[1] += this.anim_pos[i][1];
  }
  target[0] += dx;
  target[1] += dy;

  var tile = game.pixelToTile(target[0], target[1]);

  if (game.walkable(tile[0], tile[1])) {
    this.anim_pos.push({x: dx, y: dy});
  } else {
    console.log('hit');
    // Play a little animation.
    var _t = function(n) { return n === 0 ? 0 : n / Math.abs(n) * 2; };
    this.anim_pos.push({x: _t(dx), y: _t(dy)});
  }

  return false;
};

Hero.prototype.tick = function(dt) {
  if (this.anim_pos.length) {
    var dx = this.anim_pos[0].x;
    var dy = this.anim_pos[0].y;
    var ang = Math.atan2(dy, dx);

    var fx = Math.round(Math.cos(ang) * this.speed * dt);
    var fy = Math.round(Math.sin(ang) * this.speed * dt);

    if (Math.abs(fx) > Math.abs(dx)) fx = dx;
    if (Math.abs(fy) > Math.abs(dy)) fy = dy;

    this.x += fx;
    this.y += fy;
    this.anim_pos[0].x -= fx;
    this.anim_pos[0].y -= fy;

    if (Math.abs(dx) <= 1) {
      this.x += dx;
      dx = this.anim_pos[0].x = 0;
    }
    if (Math.abs(dy) <= 1) {
      this.y += dy;
      dy = this.anim_pos[0].y = 0;
    }

    if (dx === 0 && dy === 0) {
      this.anim_pos = this.anim_pos.slice(1);
    }
  } else {
    this.x = Math.round(this.x / 32) * 32;
    this.y = Math.round(this.y / 32) * 32;
  }
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