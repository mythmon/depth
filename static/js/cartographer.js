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

function _convolveCell(map, x, y) {
  var code;

  function _check(r) {
    return !!(new RegExp(r).exec(code));
  }

  function _get(x, y) {
    var fallback = 1;
    var w = map[0].length;
    var h = map.length;

    if (x >= w || x < 0 || y >= h || y < 0) {
      return fallback;
    }
    return map[y][x];
  }

  var n = _get(x, y - 1);
  var s = _get(x, y + 1);
  var e = _get(x + 1, y);
  var w = _get(x - 1, y);
  var ne = _get(x + 1, y - 1);
  var se = _get(x + 1, y + 1);
  var sw = _get(x - 1, y + 1);
  var nw = _get(x - 1, y - 1);

  code = [n, e, s, w, ne, se, sw, nw].join('');
  var alt = '';

  if (_check('11000111')) { alt = 'a'; }
  if (_check('01101011')) { alt = 'b'; }
  if (_check('00111101')) { alt = 'c'; }
  if (_check('10011110')) { alt = 'd'; }
  if (_check('11110111')) { alt = 'a'; }
  if (_check('11111011')) { alt = 'b'; }
  if (_check('11111101')) { alt = 'c'; }
  if (_check('11111110')) { alt = 'd'; }

  return [n, e, s, w].join('') + alt;
}

function blankMap(w, h, walls) {
  var i;
  var row = [];
  var map = [];

  if (walls === undefined) {
    walls = true;
  }

  for (i=0; i<w; i++) {
    row[i] = 0;
  }
  if (walls) {
    row[0] = 1;
    row[w-1] = 1;
  }

  for (i=0; i<h; i++) {
    map[i] = row.slice();
  }

  if (walls) {
    for (i=0; i<w; i++) {
      map[0][i] = map[h-1][i] = 1;
    }
  }

  return map;
}

window.cartographer = {
  convolute: convolute,
  blankMap: blankMap
};

})();