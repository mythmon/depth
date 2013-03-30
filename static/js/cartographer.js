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

    if (x < 0 || x >= w || y < 0 || y >= h) {
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

  if (_check('11000...')) { alt = 'a'; }
  if (_check('0110.0..')) { alt = 'a'; }
  if (_check('0011..0.')) { alt = 'a'; }
  if (_check('1001...0')) { alt = 'a'; }

  if (_check('11010..1')) { alt = 'a'; }
  if (_check('11011..0')) { alt = 'b'; }

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

var neighbors = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
function insertConvoluteExample(map, x, y, code) {
  var width = map[0].length;
  var height = map.length;
  var i;

  function _set(dx, dy, val) {
    var tx = x + dx;
    var ty = y + dy;

    if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
      map[ty][tx] = val;
    }
  }

  function _cell(c) {
    var n = parseInt(code.charAt(c), 10);
    if (isNaN(n)) {
      return 0;
    }
    return n;
  }

  _set(0, 0, _cell(0));
  for (i=0; i<neighbors.length; i++) {
    _set(neighbors[i][0], neighbors[i][1], _cell(i + 1));
  }
}

window.cartographer = {
  convolute: convolute,
  blankMap: blankMap,
  insertConvoluteExample: insertConvoluteExample
};

})();