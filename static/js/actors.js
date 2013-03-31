(function() {

/* class Actor */
function Actor(options) {
  var defaults = {
    x: 0, y: 0,
    speed: 0.2,
    images: {},
    sprites: {},
    sprite: Sprite.unknown,
    animNext: []
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
  if (this.sprite) {
    ctx.save();
    ctx.translate(this.x, this.y);
    this.sprite.render(ctx);
    ctx.restore();
  }
};

Actor.prototype.tick = function(dt) {
  if (this.animNext.length) {
    var anim = this.animNext[0];
    if (anim.sprite !== undefined) {
      this.sprite = anim.sprite;
    }
    var dx = anim.x;
    var dy = anim.y;
    var ang = Math.atan2(dy, dx);

    var fx = Math.round(Math.cos(ang) * this.speed * dt);
    var fy = Math.round(Math.sin(ang) * this.speed * dt);

    if (Math.abs(fx) > Math.abs(dx)) fx = dx;
    if (Math.abs(fy) > Math.abs(dy)) fy = dy;

    this.x += fx;
    this.y += fy;
    anim.x -= fx;
    anim.y -= fy;

    if (Math.abs(dx) <= 1) {
      this.x += dx;
      dx = anim.x = 0;
    }
    if (Math.abs(dy) <= 1) {
      this.y += dy;
      dy = anim.y = 0;
    }

    if (dx === 0 && dy === 0) {
      anim.deferred.resolve();
      this.animNext = this.animNext.slice(1);
    }
  } else {
    this.x = Math.round(this.x / 32) * 32;
    this.y = Math.round(this.y / 32) * 32;
  }
};

Actor.prototype.queueAnim = function(/* animList */) {
  var anim, i;
  var deferreds = [];
  for (i=0; i<arguments.length; i++) {
    anim = arguments[i];
    if (anim.deferred === undefined) {
      anim.deferred = $.Deferred();
    }
    this.animNext.push(anim);
    deferreds.push(anim.deferred);
  }
  return $.when.apply(this, deferreds);
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
    },
    myTurn: false,
    turnDeferred: null
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
  if (!this.myTurn) return false;

  var dx = directions[dir].x * 32;
  var dy = directions[dir].y * 32;

  var i;
  var target = [this.x, this.y];
  for (i = 0; i<this.animNext.length; i++) {
    target[0] += this.animNext[i].x;
    target[1] += this.animNext[i].y;
  }
  target[0] += dx;
  target[1] += dy;

  var tile = game.pixelToTile(target[0], target[1]);

  if (game.walkable(tile[0], tile[1])) {
    this.myTurn = false;
    this.queueAnim({
      x: dx,
      y: dy,
      sprite: this.sprites[dir],
      deferred: this.turnDeferred
    });
  } else {
    // Play a little animation.
    var _t = function(n) { return n === 0 ? 0 : n / Math.abs(n) * 2; };
    dx = _t(dx);
    dy = _t(dy);
    var s = this.sprites[dir];
    this.queueAnim({
      x: dx,
      y: dy,
      sprite: s
    }, {
      x: -dx,
      y: -dy,
      sprite: s
    });
  }

  // This tends to be used in key events, so returning false prevents
  // the default action.
  return false;
};

Hero.prototype.turn = function() {
  var d = $.Deferred();

  this.turnDeferred = d;
  this.myTurn = true;

  return d.promise();
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
  var original_images = o.images || {};
  o.images = {};
  for (key in original_images) {
    if (!original_images.hasOwnProperty(key)) continue;

    var image = original_images[key];
    var match = image.match(/^wall_(\d)(\d)(\d)(\d)$/);

    if (match) {
      // Wall sprites are made of several subsprites. Build a MultiSprite.
      o.sheet = 'img/tile_pieces.png';
      var ne = match[1];
      var se = match[2];
      var sw = match[3];
      var nw = match[4];

      var imgs = ['wall_ne_' + ne,
                  'wall_se_' + se,
                  'wall_sw_' + sw,
                  'wall_nw_' + nw];

      o.sprites[key] = new MultiSprite({
        sheet: o.sheet,
        images:  imgs
      });
      o.sprite = o.sprites[key];
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

Goo.prototype.turn = function() {
  var d = $.Deferred();
  while (true) {
    var dir = ['n', 's', 'e', 'w'][utils.rand(0, 3)];
    var dx = directions[dir].x * 32;
    var dy = directions[dir].y * 32;
    var tile = game.pixelToTile(this.x + dx, this.y + dy);

    if (game.walkable(tile[0], tile[1])) {
      this.queueAnim({
        x: dx,
        y: dy,
        deferred: d
      });
      return d.promise();
    }
  }
};
/* end Goo */

$.extend(window, {
  Actor: Actor,
  Hero: Hero,
  Goo: Goo,
  Tile: Tile
});

})();