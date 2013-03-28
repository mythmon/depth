(function() {

/* Takes a map of 0 and 1 and convolutes it into NESW adjacencies. */
function convolute(map) {
  var y, x;
  var w = map[0].length, h = map.length;

  var output = [];

  for (y=0; y<h; y++) {
    output[y] = [];
    for (x=0; x<w; x++) {
      if (map[y][x]) {
        var adj = _convolveCell(map, x, y, w, h);
        output[y][x] = 'wall_' + adj;
      } else {
        output[y][x] = 'floor';
      }
    }
  }

  return output;
}

function _convolveCell(map, x, y, w, h) {
  var adj = [0, 0, 0, 0];

  if (y <= 0 || map[y-1][x]) {
    adj[0] = 1;
  }
  if (x >= (w-1) || map[y][x+1]) {
    adj[1] = 1;
  }
  if (y >= (h-1) || map[y+1][x]) {
    adj[2] = 1;
  }
  if (x <= 0 || map[y][x-1]) {
    adj[3] = 1;
  }

  return adj.join('');
}

window.cartographer = {
  convolute: convolute
};

})();