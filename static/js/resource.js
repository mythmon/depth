(function() {

_resourceCache = {};

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
  if (_resourceCache[url] !== undefined) {
    return;
  }

  var d = $.Deferred();

  img = new Image();
  img.onload = function resourceLoaded() {
    _resourceCache[url] = img;
    d.resolve(img);
  };
  img.onerror = img.onabort = function resourceError() {
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