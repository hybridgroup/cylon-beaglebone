"use strict";

var fs = require('fs'),
    EventEmitter = require('events').EventEmitter;

var Cylon = require('cylon');

var Pin = module.exports = function Pin() {
};

Cylon.Utils.subclass(Pin, EventEmitter);

Pin.prototype._findFile = function(dirName, nameRegex) {
  var files = fs.readdirSync(dirName),
      file = null;

  for (var i = 0; i < files.length; i++) {
    var f = files[i].match(nameRegex);

    if (f != null) {
      file = f[0];
      break;
    }
  }

  return file;
};
