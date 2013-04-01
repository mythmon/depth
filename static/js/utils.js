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

window.utils.randChoice = function(list) {
  return list[utils.rand(0, list.length)];
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
};

/* Python new-style string formatting.
 * > "Hello, {0}.".format('Mike');
 * Hello, Mike.
 * > "How is the weather in {citi}?".format({city: 'Mountain View'})
 * How is the weather in Mountain View?
 */
String.prototype.format = function(obj) {
  var str = this;
  // Support either an object, or a series.
  return str.replace(/\{[\w\d\._-]+\}/g, function(part) {
    // Strip off {}.
    part = part.slice(1, -1);
    var index = parseInt(part, 10);
    if (isNaN(index)) {
      return dottedGet(obj, part);
    } else {
      return arguments[index];
    }
  });
};

function dottedGet(obj, selector) {
  selector = selector.split('.');
  while (selector.length) {
    obj = obj[selector.splice(0, 1)[0]];
  }
  return obj;
}

})();