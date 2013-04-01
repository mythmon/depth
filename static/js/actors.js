(function() {

/* class Actor */
function Actor(options) {
  var defaults = {
    x: 0, y: 0,
    speed: 0.2,
    images: {},
    sprites: {},
    sprite: Sprite.unknown,
    animNext: [],
    currentTile: null,
    walkable: false,
    name: 'unknown actor'
  };
  $.extend(this, defaults, options);

  this.x += 16;
  this.y += 16;

  var key;
  for (key in this.images) {
    if (!this.images.hasOwnProperty(key)) continue;
    this.sprite = this.sprites[key] = new Sprite({
      sheet: this.sheet,
      image: this.images[key]
    });
  }

  if (options === undefined) return;

  this.updateTile();
}

Actor.prototype.render = function(ctx) {
  if (this.sprite) {
    ctx.save();
    ctx.translate(this.x - 16, this.y - 16);
    this.sprite.render(ctx);
    ctx.restore();
  }
};

Actor.prototype.tick = function(dt) {
  if (this.animNext.length) {
    var anim = this.animNext[0];
    if (anim === null) {
      return;
    }
    if (anim.sprite !== undefined) {
      this.sprite = anim.sprite;
    }
    var dx = anim.x;
    var dy = anim.y;
    var ang = Math.atan2(dy, dx);

    var fx = Math.cos(ang) * this.speed * dt;
    var fy = Math.sin(ang) * this.speed * dt;

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
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);

      this.updateTile();

      if (anim.delay) {
        this.animNext[0] = null;
        setTimeout(function() {
          this.animNext = this.animNext.slice(1);
          anim.deferred.resolve();
        }.bind(this), anim.delay);
      } else {
        this.animNext = this.animNext.slice(1);
        anim.deferred.resolve();
      }
    }
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

Actor.prototype.updateTile = function() {
  var tilePos = game.pixelToTile(this.x, this.y);
  var newTile = game.level.tiles[tilePos[1]][tilePos[0]];

  // First run
  if (this.currentTile === null) {
    newTile.enter(this);
    this.currentTile = newTile;
  } else if (newTile !== this.currentTile) {
    this.currentTile.exit(this);
    newTile.enter(this);
    this.currentTile = newTile;
  }
};
/* end Actor */

/* class Hero */
function Hero(options) {
  var defaults = {
    name: 'Hero',
    images: {
      'n': 'hero_n',
      's': 'hero_s',
      'e': 'hero_e',
      'w': 'hero_w',
      'stab_n': 'hero_stab_n',
      'stab_s': 'hero_stab_s',
      'stab_e': 'hero_stab_e',
      'stab_w': 'hero_stab_w'
    },
    myTurn: false,
    turnDeferred: null,
    dirInputDeferred: null,
    health: 10
  };
  $.extend(defaults, options);
  Actor.call(this, defaults);

  key('left', 'game', this.move.bind(this, 'w'));
  key('right', 'game', this.move.bind(this, 'e'));
  key('up', 'game', this.move.bind(this, 'n'));
  key('down', 'game', this.move.bind(this, 's'));
  key('space', 'game', this.attack.bind(this));
  key('w', 'game', this.wait.bind(this));
}

Hero.prototype = new Actor();

var directions = {
  n: {x: 0, y: -1},
  e: {x: 1, y: 0},
  s: {x: 0, y: 1},
  w: {x: -1, y: 0}
};

/* Handle directional movement for the character.
 *
 * If `this.dirInputDeferred` is not null, it is assumed to be a deferred. It
 * will be resolved with the direction of the key press, and this
 * function will return early.
 *
 * This should always return False, since it is used in key bindings.
 */
Hero.prototype.move = function(dir) {
  if (!this.myTurn) return false;

  if (this.dirInputDeferred) {
    this.dirInputDeferred.resolve(dir);
    this.dirInputDeferred = null;
    return false;
  }

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

Hero.prototype.attack = function() {
  if (!this.myTurn) return false;
  this.dirInputDeferred = $.Deferred();

  game.message('Pick a direction to attack.', 'attack-dir');

  this.dirInputDeferred.then(function(dir) {
    var i, tile, target = null;
    var delta = directions[dir];
    var o;
    var targetIndex = game.pixelToTile(this.x + delta.x * 32,
                                       this.y + delta.y * 32);

    tile = game.level.tiles[targetIndex[1]][targetIndex[0]];

    for (i=0; i<tile.occupants.length; i++) {
      o = tile.occupants[i];
      if (!o.walkable) {
        target = o;
      }
    }

    game.removeMessage('attack-dir');
    if (target === null) {
      game.message('You attack empty air!');
    } else {
      game.message('You attack the ' + target.name + '!');
      target.gotHit(1);
    }

    this.queueAnim({
      x: delta.x * 4,
      y: delta.y * 4,
      delay: 300,
      sprite: this.sprites['stab_' + dir]
    }, {
      x: delta.x * -4,
      y: delta.y * -4,
      sprite: this.sprites[dir],
      deferred: this.turnDeferred
    });
  }.bind(this));

  return false;
};

Hero.prototype.wait = function() {
  if (!this.myTurn) return;

  this.myTurn = false;
  this.turnDeferred.resolve();
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
    sprites: {},
    occupants: []
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

Tile.prototype.enter = function(actor) {
  this.occupants.push(actor);
};

Tile.prototype.exit = function(actor) {
  var index = this.occupants.indexOf(actor);
  this.occupants.splice(index, 1);


};

Tile.prototype.updateTile = function() {
  // This doesn't make sense for Tiles. Noop.
};
/* end Tile */

/* class Goo */
function Goo(options) {
  var defaults = {
    name: 'goo',
    images: {0: 'goo'},
    health: utils.rand(2,4)
  };
  var o = $.extend({}, defaults, options);
  Actor.call(this, o);
}

Goo.prototype = new Actor();

Goo.prototype.turn = function() {
  var d = $.Deferred();

  if (Math.random() < 0.1) {
    d.resolve();
    return d.promise();
  }

  while (true) {
    var dir = ['n', 's', 'e', 'w'][utils.rand(0, 4)];
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

Goo.prototype.gotHit = function(damage) {
  this.health -= damage;
  if (this.health <= 0) {
    this.remove = true;
    this.currentTile.exit(this);
    game.message('You killed the slime!');
    if (game.countEnemies() > 0) {
      game.message('There is more work to be done.');
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