(function() {

var key;

var offsets = {
  // sprites.png
  'unknown': [0, 0],
  'cobble': [1, 0],
  'water': [2, 0],

  'chest': [3, 0],
  'goo': [4, 0],

  'hero_n': [0, 1],
  'hero_e': [1, 1],
  'hero_s': [2, 1],
  'hero_w': [3, 1],

  'hero_stab_n': [0, 2],
  'hero_stab_e': [1, 2],
  'hero_stab_s': [2, 2],
  'hero_stab_w': [3, 2],

  // tile_pieces.png
  'wall_ne_0': [0, 0],
  'wall_ne_1': [0, 1],
  'wall_ne_2': [0, 2],
  'wall_ne_3': [0, 3],
  'wall_ne_4': [0, 4],

  'wall_se_0': [1, 0],
  'wall_se_1': [1, 1],
  'wall_se_2': [1, 2],
  'wall_se_3': [1, 3],
  'wall_se_4': [1, 4],

  'wall_sw_0': [2, 0],
  'wall_sw_1': [2, 1],
  'wall_sw_2': [2, 2],
  'wall_sw_3': [2, 3],
  'wall_sw_4': [2, 4],

  'wall_nw_0': [3, 0],
  'wall_nw_1': [3, 1],
  'wall_nw_2': [3, 2],
  'wall_nw_3': [3, 3],
  'wall_nw_4': [3, 4]
};

var size = 32;

for (key in offsets) {
  if (!offsets.hasOwnProperty(key)) continue;
  offsets[key][0] = offsets[key][0] * size;
  offsets[key][1] = offsets[key][1] * size;
}

/* class Sprite */
function Sprite(options) {
  var defaults = {
    sheet: 'img/sprites.png',
    image: 'unknown',

    ready: false,
    size: [size, size]
  };

  $.extend(this, defaults, options);

  this.offset = offsets[this.image];
  if (this.offset === undefined) {
    console.error('image "' + this.image + '" unknown.');
    this.offset = offsets['unknown'];
  }

  resource.load(this.sheet).then(function(img) {
    this.img = img;
    this.ready = true;
  }.bind(this));
}

Sprite.prototype.render = function(ctx) {
  if (!this.ready) return;

  ctx.drawImage(this.img, this.offset[0], this.offset[1],
                          this.size[0], this.size[1],
                          0, 0,
                          this.size[0], this.size[1]);

};
/* end Sprite */

/* class MultiSprite */
function MultiSprite(options) {
  var defaults = {
    images: [],
    sheet: 'img/tile_pieces.png',
    ready: false,
    size: [size, size]
  };

  $.extend(this, defaults, options);

  this.img = document.createElement('canvas');
  this.img.width = this.size[0];
  this.img.height = this.size[1];
  this._imgCtx = this.img.getContext('2d');

  var i;
  resource.load(this.sheet).then(function(img) {
    for (i=0; i<this.images.length; i++) {
      var name = this.images[i];
      var offset = offsets[name];
      this._imgCtx.drawImage(img, offset[0], offset[1],
                             this.size[0], this.size[1],
                             0, 0,
                             this.size[0], this.size[1]);
    }
    this.ready = true;
  }.bind(this));
}

MultiSprite.prototype = new Sprite();
/* end MultiSprite */

Sprite.unknown = new Sprite();

$.extend(window, {
  Sprite: Sprite,
  MultiSprite: MultiSprite
});

})();