(function() {

var requestAnimFrame = (function(){
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback){
        window.setTimeout(callback, 1000 / 60);
    };
})();

var ctx;
var WIDTH = 640, HEIGHT = 480;
var stats;

var map;
var sprites = [];
var objs = [];
var camera;

function init() {
  // Create a canvas
  var canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  document.body.appendChild(canvas);

  stats = new Stats();
  stats.setMode(0); // 0: fps, 1: ms
  document.body.appendChild(stats.domElement);

  var cell;
  var opts;
  var x, y;
  var image;

  ctx = canvas.getContext("2d");

  map = cartographer.blankMap(67, 67);

  var i = 0;

  for (y=3; y<map.length; y += 4) {
    for (x=3; x<map[0].length; x += 4, i++) {
      var code = '1' + utils.pad(i.toString(2), 8, '0');
      cartographer.insertConvoluteExample(map, x, y, code);
    }
  }

  var convoluted = cartographer.convolute(map);

  for (y = 0; y < map.length; y++) {
    for (x = 0; x < map[0].length; x++) {
      cell = convoluted[y][x];
      objs.push(new Tile({
        x: x * 32,
        y: y * 32,
        image: cell
      }));
    }
  }

  var h = new Hero({x: 320, y: 160});
  objs.push(h);

  camera = new Camera({target: h});

  requestAnimFrame(render);
}

var lastFrame = +new Date();
function render() {
  stats.begin();

  var i, l;
  var thisFrame = +new Date();
  var dt = thisFrame - lastFrame;

  ctx.fillStyle = 'black';
  ctx.rect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  camera.transform(ctx);

  for (i=0; i < objs.length; i++) {
    objs[i].tick(dt);
    objs[i].render(ctx);
  }

  ctx.restore();

  requestAnimFrame(render);

  lastFrame = thisFrame;
  stats.end();
}

window.game = {};

window.game.walkable = function(x, y) {
  return map[y][x] !== 1;
};

window.game.pixelToTile = function(x, y) {
  return [Math.floor(x / 32), Math.floor(y / 32)];
};


$(init);

})();