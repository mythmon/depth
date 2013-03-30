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
}

})();