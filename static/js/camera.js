(function() {

function Camera(opts) {
  var defaults = {
    target: null,
    x: 0, y: 0,
    width: 640, height: 480,
    clamp: {
      x: [-1504, 0],
      y: [-1664, 0]
    }
  };
  $.extend(this, defaults, opts);
}

Camera.prototype.transform = function(ctx) {
  if (this.target) {
    this.x = (this.width / 2) - this.target.x - 16;
    this.y = (this.height / 2) - this.target.y - 16;
    this.x = utils.clamp(this.x, this.clamp.x[0], this.clamp.x[1]);
    this.y = utils.clamp(this.y, this.clamp.y[0], this.clamp.y[1]);
  }

  ctx.translate(this.x, this.y);
};

window.Camera = Camera;

})();