(function() {
var key;

var names = {
  'wall_v': [3, 0],
  'wall_h': [4, 0],
  'wall_nw': [5, 0],
  'wall_ne': [6, 0],
  'wall_se': [8, 0],
  'wall_sw': [7, 0],
  'cobble': [21, 0],
  'unknown': [0, 6]
};

var size = 32;

for (key in names) {
  if (!names.hasOwnProperty(key)) continue;
  names[key][0] = names[key][0] * size;
  names[key][1] = names[key][1] * size;
}

/* class Sprite */
function Sprite(options) {
  var defaults = {
    url: 'img/tiles.png',
    name: 'unknown',

    ready: false,
    size: [size, size]
  };

  $.extend(this, defaults, options);

  this.offset = names[this.name];

  resource.load(this.url).then(function(img) {
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