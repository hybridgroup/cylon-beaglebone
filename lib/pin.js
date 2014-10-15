"use strict";

var fs = require('fs'),
    EventEmitter = require('events').EventEmitter;

var Cylon = require('cylon');

var CAPEMGR_DIR = "/sys/devices";

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

Pin.prototype._capemgrDir = function() {
  if (this.capemgrDir == null) {
    var capemgr = this._findFile(CAPEMGR_DIR, /^bone_capemgr\.\d+$/);
    if (capemgr != null) {
      this.capemgrDir = "" + CAPEMGR_DIR + "/" + capemgr;
    }
  }

  return this.capemgrDir;
};
