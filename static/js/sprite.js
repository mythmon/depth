(function() {

var key;

var offsets = {
  'hero_s': [1, 4],
  'hero_n': [2, 4],
  'hero_e': [1, 5],
  'hero_w': [2, 5],

  'goo': [3, 4],
  'chest': [3, 2],

  'floor': [3, 1],
  'water': [3, 0],

  'wall_0000': [3, 5],
  'wall_0001': [3, 3],
  'wall_0010': [0, 3],
  'wall_0011': [2, 0],
  'wall_0100': [1, 3],
  'wall_0101': [2, 3],
  'wall_0110': [0, 0],
  'wall_0111': [1, 0],
  'wall_1000': [0, 5],
  'wall_1001': [2, 2],
  'wall_1010': [0, 4],
  'wall_1011': [2, 1],
  'wall_1100': [0, 2],
  'wall_1101': [1, 2],
  'wall_1110': [0, 1],
  'wall_1111': [1, 1],

  'wall_1001a': [0, 6],
  'wall_0110a': [1, 6],
  'wall_0011a': [2, 6],
  'wall_1100a': [3, 6],

  'wall_1111a': [1, 1],
  'wall_1111b': [1, 1],
  'wall_1111c': [1, 1],
  'wall_1111d': [1, 1],

  'unknown': [0, 7]
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
    console.log('image name "' + this.image + '" unknown.');
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

window.Sprite = Sprite;

})();