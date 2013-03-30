(function() {

window.clamp = function(val, min, max) {
  return Math.max(min, Math.min(val, max));
};

})();