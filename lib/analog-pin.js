/*
 * Beaglebone Analog Pin
 * cylonjs.com
 *
 * Copyright (c) 2013-2014 The Hybrid Group
 * Licensed under the Apache 2.0 license.
*/

'use strict';

var Cylon = require('cylon');
var CAPEMGR_DIR = "/sys/devices";
var EventEmitter = require('events').EventEmitter;
var FS = require('fs');

var AnalogPin = module.exports = function AnalogPin(opts) {
  this.pinNum = opts.pin;
  this.ready = false;
};

subclass(AnalogPin, EventEmitter);

AnalogPin.prototype.connect = function() {
	try {
		FS.appendFileSync(this._slotsPath(), "cape-bone-iio\n");
	} catch(ex) {
		// cape-bone-iio has already been loaded so we move along
	}
	return this.emit('connect');
};

AnalogPin.prototype.close = function() {
  return true;
};

AnalogPin.prototype.closeSync = function() {
  return this._releaseCallback(false);
};

AnalogPin.prototype.analogRead = function() {
  var _this = this;
	every(20, function() {
	  FS.readFile(_this._helperDir() + "/" + _this.pinNum, function(err, data) {
	    if (err) {
	      var error = "Error occurred while reading from pin " + _this.pinNum;
	      _this.emit('error', error);
	    } else {
	      var readData = parseInt(data.toString());
	      _this.emit('analogRead', readData);
	    }
	  });
	});
  return true;
};

AnalogPin.prototype._capemgrDir = function() {
  var capemgr;
  if (this.capemgrDir == null) {
    capemgr = this._findFile(CAPEMGR_DIR, /^bone_capemgr\.\d+$/);
    if (capemgr != null) {
      this.capemgrDir = "" + CAPEMGR_DIR + "/" + capemgr;
    }
  }
  return this.capemgrDir;
};

AnalogPin.prototype._slotsPath = function() {
  return "" + (this._capemgrDir()) + "/slots";
};

AnalogPin.prototype._ocpDir = function() {
  var ocp;
  if (!this.ocpDir) {
    ocp = this._findFile(CAPEMGR_DIR, /^ocp\.\d+$/);
    if (ocp != null) {
      this.ocpDir = "" + CAPEMGR_DIR + "/" + ocp;
    }
  }
  return this.ocpDir;
};

AnalogPin.prototype._helperDir = function() {
  var helper;
  if (!this.helperDir) {
    helper = this._findFile(this._ocpDir(), /^helper\.\d+$/);
    if (helper != null) {
      this.helperDir = "" + this._ocpDir( )+ "/" + helper;
    }
  }
  return this.helperDir;
};


AnalogPin.prototype._findFile = function(dirName, nameRegex) {
  var f, file, files, _i, _len;
  files = FS.readdirSync(dirName);
  file = null;
  for (_i = 0, _len = files.length; _i < _len; _i++) {
    f = files[_i];
    file = f.match(nameRegex);
    if (file != null) {
      file = file[0];
      break;
    }
  }
  return file;
};

AnalogPin.prototype._releaseCallback = function(err) {
  if (err) {
    return this.emit('error', 'Error while releasing pwm pin');
  } else {
    return this.emit('release', this.pinNum);
  }
};
