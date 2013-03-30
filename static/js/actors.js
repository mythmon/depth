(function() {

/* class Actor */
function Actor(options) {
  var defaults = {
    x: 0, y: 0,
    speed: 0.2,
    images: {},
    sprites: {},
    sprite: Sprite.unknown,
    anim_next: []
  };
  $.extend(this, defaults, options);

  var key;
  for (key in this.images) {
    if (!this.images.hasOwnProperty(key)) continue;
    this.sprite = this.sprites[key] = new Sprite({
      sheet: this.sheet,
      image: this.images[key]
    });
  }
}

Actor.prototype.render = function(ctx) {
  ctx.save();
  ctx.translate(this.x, this.y);
  this.sprite.render(ctx);
  ctx.restore();
};

Actor.prototype.tick = function(dt) {
  if (this.anim_next.length) {
    var dx = this.anim_next[0].x;
    var dy = this.anim_next[0].y;
    var ang = Math.atan2(dy, dx);

    var fx = Math.round(Math.cos(ang) * this.speed * dt);
    var fy = Math.round(Math.sin(ang) * this.speed * dt);

    if (Math.abs(fx) > Math.abs(dx)) fx = dx;
    if (Math.abs(fy) > Math.abs(dy)) fy = dy;

    this.x += fx;
    this.y += fy;
    this.anim_next[0].x -= fx;
    this.anim_next[0].y -= fy;

    if (Math.abs(dx) <= 1) {
      this.x += dx;
      dx = this.anim_next[0].x = 0;
    }
    if (Math.abs(dy) <= 1) {
      this.y += dy;
      dy = this.anim_next[0].y = 0;
    }

    if (dx === 0 && dy === 0) {
      this.anim_next = this.anim_next.slice(1);
    }
  } else {
    this.x = Math.round(this.x / 32) * 32;
    this.y = Math.round(this.y / 32) * 32;
  }
};
/* end Actor */

/* class Hero */
function Hero(options) {
  var defaults = {
    images: {
      'n': 'hero_n',
      's': 'hero_s',
      'e': 'hero_e',
      'w': 'hero_w'
    }
  };
  $.extend(defaults, options);
  Actor.call(this, defaults);

  key('left, a', this.move.bind(this, 'w'));
  key('right, d', this.move.bind(this, 'e'));
  key('up, w', this.move.bind(this, 'n'));
  key('down, s', this.move.bind(this, 's'));
}

Hero.prototype = new Actor();

var directions = {
  n: {x: 0, y: -1},
  e: {x: 1, y: 0},
  s: {x: 0, y: 1},
  w: {x: -1, y: 0}
};

Hero.prototype.move = function(dir) {
  if (this.anim_next.length >= 2) return false;

  var dx = directions[dir].x * 32;
  var dy = directions[dir].y * 32;

  this.sprite = this.sprites[dir];

  var i;
  var target = [this.x, this.y];
  for (i = 0; i<this.anim_next.length; i++) {
    target[0] += this.anim_next[i].x;
    target[1] += this.anim_next[i].y;
  }
  target[0] += dx;
  target[1] += dy;

  var tile = game.pixelToTile(target[0], target[1]);

  if (game.walkable(tile[0], tile[1])) {
    this.anim_next.push({x: dx, y: dy});
  } else {
    // Play a little animation.
    var _t = function(n) { return n === 0 ? 0 : n / Math.abs(n) * 2; };
    this.anim_next.push({x: _t(dx), y: _t(dy)});
    this.anim_next.push({x: -_t(dx), y: -_t(dy)});
  }

  // This tends to be used in key events, so returning false prevents
  // the default action.
  return false;
};

Hero.prototype.draw = function(ctx) {
  Actor.prototype.draw.call(this, ctx);
};
/* end Hero */

/* class Tile */
function Tile(options) {
  var defaults = {
    sheet: 'img/sprites.png',
    sprites: {}
  };
  var o = $.extend({}, defaults, options);

  var key;
  var original_images = o.images || {}
  o.images = {};
  for (key in original_images) {
    if (!original_images.hasOwnProperty(key)) continue;

    var image = original_images[key];
    console.log(image);
    var match = image.match(/^wall_(\d)(\d)(\d)(\d)$/);

    if (match) {
      // Wall sprites are made of several subsprites. Build a MultiSprite.
      o.sheet = 'img/tile_pieces.png';
      var ne = match[1];
      var se = match[2];
      var sw = match[3];
      var nw = match[4];

      console.log(o.sheet);
      var imgs = ['wall_ne_' + ne,
                  'wall_se_' + se,
                  'wall_sw_' + sw,
                  'wall_nw_' + nw];
      console.log(imgs);

      o.sprites[key] = new MultiSprite({
        sheet: o.sheet,
        images:  imgs
      });
      o.sprite = o.sprites[key];
      console.log(o.sprite);
    } else {
      o.images[key] = image;
    }
  }

  Actor.call(this, o);
}

Tile.prototype = new Actor();
/* end Tile */

/* class Goo */
function Goo(options) {
  var defaults = {
    images: {0: 'goo'}
  };
  var o = $.extend({}, defaults, options);
  Actor.call(this, o);
}

Goo.prototype = new Actor();

Goo.prototype.tick = function(dt) {
  if (Math.pow(Math.random(), (dt / 100)) < 0.3) {
    var dir = ['n', 's', 'e', 'w'][Math.floor(Math.random() * 4)];
    var dx = directions[dir].x * 32;
    var dy = directions[dir].y * 32;
    var tile = game.pixelToTile(this.x + dx, this.y + dy);

    if (game.walkable(tile[0], tile[1])) {
      this.anim_next.push({x: dx, y: dy});
    } else {
      // Play a little animation.
      var _t = function(n) { return n === 0 ? 0 : n / Math.abs(n) * 2; };
      this.anim_next.push({x: _t(dx), y: _t(dy)});
      this.anim_next.push({x: -_t(dx), y: -_t(dy)});
    }
  }
  Actor.prototype.tick.call(this, dt);
};
/* end Goo */

$.extend(window, {
  Actor: Actor,
  Hero: Hero,
  Goo: Goo,
  Tile: Tile
});

})();