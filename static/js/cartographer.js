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
  var t;

  var convoluted = [];

  var out = {
    map: map,
    objs: [],
    tiles: []
  };

  for (y=0; y<h; y++) {
    convoluted[y] = [];
    for (x=0; x<w; x++) {
      if (map[y][x] === 1) {
        convoluted[y][x] = 'wall_' + _convolveCell(map, x, y, w, h);
      } else {
        convoluted[y][x] = {
          0: 'cobble',
          2: 'water'
        }[map[y][x]];
      }
    }
  }

  for (y = 0; y < map.length; y++) {
    out.tiles[y] = [];
    for (x = 0; x < map[0].length; x++) {
      cell = convoluted[y][x];
      t = new Tile({
        x: x * 32,
        y: y * 32,
        images: {0: cell}
      });
      out.tiles[y][x] = t;
      out.objs.push(t);
    }
  }

  return out;
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


function _blank(w, h, fill) {
  var i;
  var row = [];
  var map = [];

  // Make first row.
  for (i=0; i<w; i++) {
    row[i] = fill ? 1 : 0;
  }
  row[0] = 1;
  row[w-1] = 1;

  // Copy to the rest of the rows.
  for (i=0; i<h; i++) {
    map[i] = row.slice();
  }

  // Add walls
  for (i=0; i<w; i++) {
    map[0][i] = map[h-1][i] = 1;
  }

  return map;
}


function _rect(map, x, y, w, h, fill) {
  var i, j;

  for (i=0; i<h; i++) {
    for (j=0; j<w; j++) {
      map[y+i][x+j] = fill;
    }
  }
}


function emptyMap() {
  var map = _blank(32, 32);
  return _convolute(map);
}


function convolutionExample() {
  var map = cartographer._blank(67, 67);
  var objs = [];

  var i = 0;

  for (y=3; y<map.length; y += 4) {
    for (x=3; x<map[0].length; x += 4, i++) {
      var code = '1' + utils.pad(i.toString(2), 8, '0');
      _insertConvolveGroup(map, x, y, code);
    }
  }

  var convoluted = _convolute(map);
}


function mazeRegions(options) {
  var defaults = {
    regionCount: 5,
    width: 50,
    height: 50,
    minSize: 4
  };
  var opts = $.extend({}, options, defaults);

  var i, j, k;
  var x, y, w, h;
  var map = _blank(opts.width, opts.height, true);
  var mapSize = Math.min(opts.width, opts.height);
  var regionSize = (mapSize - opts.regionCount) / opts.regionCount;

  var regions = [];
  var left, top, right, bottom;

  for (i=0; i < opts.regionCount; i++) {
    regions[i] = [];
    for (j=0; j < opts.regionCount; j++) {
      left = j * regionSize + 1;
      top = i * regionSize + 1;
      right = left + regionSize - 2;
      bottom = top + regionSize - 2;

      x = utils.rand(left, right - opts.minSize);
      y = utils.rand(top, bottom - opts.minSize);
      w = utils.rand(opts.minSize, right - x);
      h = utils.rand(opts.minSize, bottom - y);

      _rect(map, x, y, w, h, 0);
      regions[i][j] = {
        bounds: {x: x, y: y, w: w, h: h},
        links: [],
        id: utils.getId(),
        index: [j, i]
      };
    }
  }

  var size;
  var x1, y1, x2, y2;
  var r1, r2;
  var dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  var dir;
  var doubled = false;

  w = regions[0].length;
  h = regions.length;

  while(utils.graphSize(regions[0][0]) < w * h) {
    x1 = utils.rand(0, w);
    y1 = utils.rand(0, h);
    dir = dirs[utils.rand(0, dirs.length)];
    x2 = x1 + dir[0];
    y2 = y1 + dir[1];

    if (x2 < 0 || x2 >= w || y2 < 0 || y2 >= h) {
      continue;
    }

    r1 = regions[y1][x1];
    r2 = regions[y2][x2];

    doubled = false;
    for (i=0; i<r1.links.length; i++) {
      if (r1.links[i].id == r2.id) {
        doubled = true;
      }
    }
    if (doubled) continue;

    r1.links.push(r2);
    r2.links.push(r1);
  }

  var linksMade = {};
  var start1, end1, start2, end2;
  var startInter, endInter;

  for (i=0; i<h; i++) {
    for (j=0; j<w; j++) {
      r1 = regions[j][i];
      for (k=0; k<r1.links.length; k++) {
        r2 = r1.links[k];

        // Check for double links.
        if (linksMade[r1.id + ',' + r2.id] || linksMade[r2.id + ',' + r1.id]) continue;
        linksMade[r1.id + ',' + r2.id] = true;
        linksMade[r2.id + ',' + r1.id] = true;

        // The direction from r1 to r2.
        var delta = [utils.sign(r2.index[0] - r1.index[0]),
                     utils.sign(r2.index[1] - r1.index[1])];

        if (delta[0]) {
          // horizontal link
          start1 = r1.bounds.y;
          end1 = r1.bounds.y + r1.bounds.h;
          start2 = r2.bounds.y;
          end2 = r2.bounds.y + r2.bounds.h;
        } else {
          // vertical link;
          start1 = r1.bounds.x;
          end1 = r1.bounds.x + r1.bounds.w;
          start2 = r2.bounds.x;
          end2 = r2.bounds.x + r2.bounds.w;
        }

        var start, length;
        // if the two ranges intersect
        if (start1 <= end2 && end1 >= start2) {
          // great, draw a straight line from r1 to r2.
          startInter = Math.max(start1, start2);
          endInter = Math.min(end1, end2);
          var doorPos = utils.rand(startInter, endInter);

          if (delta[0] > 0) {
            // horizontal link right.
            start = r1.bounds.x + r1.bounds.w;
            length = r2.bounds.x - start;
            _rect(map, start, doorPos, length, 1, 0);
          } else if (delta[1] > 0) {
            // vertical link down.
            start = r1.bounds.y + r1.bounds.h;
            length = r2.bounds.y - start;
            _rect(map, doorPos, start, 1, length, 0);
          } else {
            console.warn('Oops, we need backwards links: ' + delta);
          }
          // Left and Up links don't happen because of the order we
          // traverse links.
        } else {
          // ranges don't intersect. A Z-passage is needed.
          console.warn('Oops, we need z-passage linking');
        }
      }
    }
  }

  var output =  _convolute(map);

  output.regions = [];
  for (i=0; i<regions.length; i++) {
    output.regions = output.regions.concat(regions[i]);
  }

  return output;
}


window.cartographer = {
  blank: emptyMap,
  convolutionExample: convolutionExample,
  mazeRegions: mazeRegions
};

})();