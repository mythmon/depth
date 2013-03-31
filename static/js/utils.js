(function() {

window.utils = window.utils || {};

window.utils.clamp = function(val, min, max) {
  return Math.max(min, Math.min(val, max));
};

window.utils.pad = function(str, width, pad) {
  var out = str;
  while (out.length < width) {
    out  = pad + out;
  }
  return out;
};

window.utils.rand = function(a, b) {
  if (b < a) {
    var temp = b;
    b = a;
    a = temp;
  }
  return Math.floor(Math.random() * (b - a) + a);
};

// Take an object which has an id and a links array, and count the size
// of it's graph.
window.utils.graphSize = function(startNode, trace) {
  var unexplored = [startNode];
  var explored = {};
  var size = 0;
  var node;
  var i;

  while (unexplored.length) {
    node = unexplored.pop();
    if (explored[node.id]) continue;

    if (trace) {
      console.log(node.index);
    }
    explored[node.id] = true;
    size++;

    for (i=0; i<node.links.length; i++) {
      var n = node.links[i];
      if (!explored[n.id]) {
        unexplored.push(n);
      }
    }
  }

  return size;
};

var __nextId = 0;
window.utils.getId = function() {
  return __nextId++;
};

window.utils.sign = function(n) {
  if (n < 0) return -1;
  if (n > 0) return +1;
  return 0;
}

})();