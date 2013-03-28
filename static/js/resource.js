(function() {

var _resourceCache = {};
var _resourceDeferreds = {};

function load(urls) {
  var i, l;
  var deferreds = [];

  if (!(urls instanceof Array)) {
    urls = [urls];
  }

  for (i=0, l=urls.length; i < l; i++) {
    deferreds.push(_loadOne(urls[i]));
  }

  return $.when.apply(this, deferreds);
}

var BASE_URL = '../';

function _loadOne(url) {
  var d = $.Deferred();
  var img;

  if (_resourceCache[url] !== undefined) {
    if (_resourceDeferreds[url] !== undefined) {
      return _resourceDeferreds[url].promise();
    } else {
      d.resolve(_resourceCache[url]);
      return d.promise();
    }
  }

  _resourceDeferreds[url] = d;
  _resourceCache[url] = false;
  img = new Image();

  img.onload = function resourceLoaded() {
    _resourceCache[url] = img;
    _resourceDeferreds[url] = undefined;
    d.resolve(img);
  };

  img.onerror = img.onabort = function resourceError() {
    _resourceDeferreds[url] = undefined;
    d.reject();
  };

  img.src = BASE_URL + url;

  return d.promise();
}

function get(url) {
  return _resourceCache[url];
}

window.resource = {
  load: load,
  get: get
};

})();