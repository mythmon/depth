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

var objs = [];
var turns = [];
var camera;
var hero;


function init() {
  // Create a canvas
  var canvas = $('.game canvas')[0];
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  stats = new Stats();
  stats.setMode(0); // 0: fps, 1: ms
  $('body').append(stats.domElement);

  var cell;
  var opts;
  var x, y;
  var r;
  var image;

  ctx = canvas.getContext("2d");

  var level = game.level = cartographer.mazeRegions();
  objs = objs.concat(level.objs);

  r = utils.randChoice(level.regions);
  x = utils.rand(r.bounds.x, r.bounds.x + r.bounds.w) * 32;
  y = utils.rand(r.bounds.y, r.bounds.y + r.bounds.h) * 32;
  hero = new Hero({x: x, y: y});
  objs.push(hero);
  turns.push(hero);

  // Add two randoms to get a distribution that peaks in the middle.
  var gooCount = utils.rand(1, 2) + utils.rand(0, 2);
  var goo;
  for (i=0; i<gooCount; i++) {
    r = utils.randChoice(level.regions);
    x = utils.rand(r.bounds.x, r.bounds.x + r.bounds.w) * 32;
    y = utils.rand(r.bounds.y, r.bounds.y + r.bounds.h) * 32;
    goo = new Goo({x: x, y: y});
    objs.push(goo);
    turns.push(goo);
  }

  camera = new Camera({target: hero});

  tick();
  nextTurn();

  key.setScope('game');

  game.message('Welcome to Depth.');
  game.message('Find and kill the slimes.');
}


var currentTurn = 0;
function nextTurn() {
  if (turns.length === 0) return;
  while (turns[currentTurn].remove) {
    turns.splice(currentTurn, 1);
    currentTurn %= turns.length;
  }
  var actor = turns[currentTurn];
  var d = actor.turn();
  currentTurn = (currentTurn + 1) % turns.length;
  d.then(nextTurn);
}


var lastFrame = +new Date();
function tick() {
  stats.begin();

  var i, l;
  var thisFrame = +new Date();
  var dt = thisFrame - lastFrame;

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  camera.transform(ctx);

  for (i=0; i < objs.length; i++) {
    objs[i].tick(dt);
    objs[i].render(ctx);
  }

  for (i=objs.length - 1; i>=0; i--) {
    if (objs[i].remove) {
      objs.splice(i, 1);
    }
  }

  ctx.restore();

  if (game.countEnemies() === 0) {
    $('.win').show();
    key.setScope('gameover');
  }
  if (hero.health <= 0) {
    $('.lose').show();
    key.setScope('gameover');
  }

  requestAnimFrame(tick);

  lastFrame = thisFrame;
  stats.end();
}


$(init);


window.game = {
  WIDTH: WIDTH,
  HEIGHT: HEIGHT
};

window.game.walkable = function(x, y) {
  var i, tile = game.level.tiles[y][x];

  for (i=0; i<tile.occupants.length; i++) {
    if (!tile.occupants[i].walkable) {
      return false;
    }
  }

  return game.level.map[y][x] !== 1;
};

window.game.pixelToTile = function(x, y) {
  return [Math.floor(x / 32), Math.floor(y / 32)];
};

window.game.countEnemies = function() {
  var i, a, count = 0;
  for (i=0; i<turns.length; i++) {
    a = turns[i];
    if (!a.remove && a.name === 'goo') {
      count++;
    }
  }
  return count;
};


var $messageContainer = $('.game .messages');
window.game.message = function(msg, html_dict={}) {
  var $msg = $('<li/>').text(msg);

  if ('id' in html_dict) {
    $msg.attr('id', html_dict['id']);
  }

  if ('class' in html_dict) {
    $msg.addClass(html_dict['class']);
  }

  $messageContainer
    .append($msg)
    // XXX This is hack to scroll to bottom
    .scrollTop(99999999);
};

window.game.removeMessage = function(id) {
  $messageContainer.find('#' + id).remove();
};

})();
