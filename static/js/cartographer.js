(function() {


// This magic describes the kind of tile to use in any given
// arrangement. For example, _neighorMap[56] is 1023. 56 in binary is
// 00111000, which maps to a tile who's only neighbors are to the east,
// south-east, and south. 1023 means that the NE corner should use the
// 1st corner variant, the SE the 0th, the SW the 2nd, and the NW the
// 3rd.
// Neighbor order: clockwise from north: N, NE, E, SE, S, SW, W, NW
// Corner order: clockwise from north-east: NE, SE, SW, NW
//
// Maybe this could be simplified using some sort of regex don't care
// (for example _neighborMap[10] and _neighborMap[11] share the same
// corner pattern, so maybe the binary regex '0000101.' could be used to
// match both. This all sounds like too much work. neighbors

var _neighborMap = [
  '3333', '3333', '3311', '3311', '3333', '3333', '3311', '3311',
  '3223', '3223', '3241', '3241', '3223', '3223', '3201', '3201',
  '3333', '3333', '3311', '3311', '3333', '3333', '3311', '3311',
  '3223', '3223', '3241', '3241', '3223', '3223', '3201', '3201',
  '1133', '1133', '1111', '1111', '1133', '1133', '1111', '1111',
  '1423', '1423', '1441', '1441', '1423', '1423', '1401', '1401',
  '1133', '1133', '1111', '1111', '1133', '1133', '1111', '1111',
  '1023', '1023', '1041', '1041', '1023', '1023', '1001', '1001',

  '3333', '3333', '3311', '3311', '3333', '3333', '3311', '3311',
  '3223', '3223', '3241', '3241', '3223', '3223', '3201', '3201',
  '3333', '3333', '3311', '3311', '3333', '3333', '3311', '3311',
  '3223', '3223', '3241', '3241', '3223', '3223', '3201', '3201',
  '1133', '1133', '1111', '1111', '1133', '1133', '1111', '1111',
  '1423', '1423', '1441', '1441', '1423', '1423', '1401', '1401',
  '1133', '1133', '1111', '1111', '1133', '1133', '1111', '1111',
  '1023', '1023', '1041', '1041', '1023', '1023', '1001', '1001',

  '2332', '2332', '2314', '2310', '2332', '2332', '2314', '2310',
  '2222', '2222', '2244', '2240', '2222', '2222', '2204', '2200',
  '2332', '2332', '2314', '2310', '2332', '2332', '2314', '2310',
  '2222', '2222', '2244', '2240', '2222', '2222', '2204', '2200',
  '4132', '4132', '4114', '4110', '4132', '4132', '4114', '4110',
  '4422', '4422', '4444', '4440', '4422', '4422', '4404', '4400',
  '4132', '4132', '4114', '4110', '4132', '4132', '4114', '4110',
  '4022', '4022', '4044', '4040', '4022', '4022', '4004', '4000',

  '2332', '2332', '2314', '2310', '2332', '2332', '2314', '2310',
  '2222', '2222', '2244', '2240', '2222', '2222', '2204', '2200',
  '2332', '2332', '2314', '2310', '2332', '2332', '2314', '2310',
  '2222', '2222', '2244', '2240', '2222', '2222', '2204', '2200',
  '0132', '0132', '0114', '0110', '0132', '0132', '0114', '0110',
  '0422', '0422', '0444', '0440', '0422', '0422', '0404', '0400',
  '0132', '0132', '0114', '0110', '0132', '0132', '0114', '0110',
  '0022', '0022', '0044', '0040', '0022', '0022', '0004', '0000'
];


/* Takes a map of 0 and 1 and transforms it into tiles according to
   adjacency. */
function _convolute(map) {
  var y, x;
  var w = map[0].length, h = map.length;

  var output = [];

  for (y=0; y<h; y++) {
    output[y] = [];
    for (x=0; x<w; x++) {
      if (map[y][x] === 1) {
        output[y][x] = 'wall_' + _convolveCell(map, x, y, w, h);
      } else {
        output[y][x] = {
          0: 'cobble',
          2: 'water'
        }[map[y][x]];
      }
    }
  }

  return output;
}

function _convolveCell(map, x, y) {
  var code;

  function _get(x, y) {
    var w = map[0].length;
    var h = map.length;

    if (x < 0 || x >= w || y < 0 || y >= h) {
      return 1;
    }
    return map[y][x] == 1 ? 1 : 0;
  }

  var n = _get(x, y - 1);
  var s = _get(x, y + 1);
  var e = _get(x + 1, y);
  var w = _get(x - 1, y);
  var ne = _get(x + 1, y - 1);
  var se = _get(x + 1, y + 1);
  var sw = _get(x - 1, y + 1);
  var nw = _get(x - 1, y - 1);

  code = [n, ne, e, se, s, sw, w, nw].join('');

  return _neighborMap[parseInt(code, 2)];
}

var neighbors = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
function _insertConvolveGroup(map, x, y, code) {
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

function blank(w, h, walls) {
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

function convolutionExample() {
  var map = cartographer.blank(67, 67);
  var objs = [];

  var i = 0;

  for (y=3; y<map.length; y += 4) {
    for (x=3; x<map[0].length; x += 4, i++) {
      var code = '1' + utils.pad(i.toString(2), 8, '0');
      _insertConvolveGroup(map, x, y, code);
    }
  }

  var convoluted = _convolute(map);

  for (y = 0; y < map.length; y++) {
    for (x = 0; x < map[0].length; x++) {
      cell = convoluted[y][x];
      objs.push(new Tile({
        x: x * 32,
        y: y * 32,
        images: {0: cell}
      }));
    }
  }

  return {
    map: map,
    objs: objs
  };
}

window.cartographer = {
  blank: blank,
  convolutionExample: convolutionExample
};

})();