"use strict";

var fs = require("fs"),
    EventEmitter = require("events").EventEmitter;

var Cylon = require("cylon");

var CAPEMGR_DIR = "/sys/devices";

var Pin = module.exports = function Pin() {
};

Cylon.Utils.subclass(Pin, EventEmitter);

Pin.prototype._findFile = function(dirName, regex) {
  var files = fs.readdirSync(dirName);

  for (var i = 0; i < files.length; i++) {
    if (regex.test(files[i])) {
      return files[i];
    }
  }

  return null;
};

Pin.prototype._capemgrDir = function() {
  if (this.capemgrDir == null) {
    var capemgr = this._findFile(CAPEMGR_DIR, /^bone_capemgr\.\d+$/);

    if (capemgr != null) {
      this.capemgrDir = CAPEMGR_DIR + "/" + capemgr;
    }
  }

  return this.capemgrDir;
};

Pin.prototype._ocpDir = function() {
  if (!this.ocpDir) {
    var ocp = this._findFile(CAPEMGR_DIR, /^ocp\.\d+$/);

    if (ocp != null) {
      this.ocpDir = CAPEMGR_DIR + "/" + ocp;
    }
  }

  return this.ocpDir;
};
