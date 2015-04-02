/*
 * Beaglebone Analog Pin
 * cylonjs.com
 *
 * Copyright (c) 2013-2014 The Hybrid Group
 * Licensed under the Apache 2.0 license.
*/

"use strict";

var Cylon = require("cylon");

var FS = require("fs");

var Pin = require("./pin");

var AnalogPin = module.exports = function AnalogPin(opts) {
  this.pinNum = opts.pin;
  this.ready = false;
};

Cylon.Utils.subclass(AnalogPin, Pin);

AnalogPin.prototype.connect = function() {
  try {
    FS.appendFileSync(this._slotsPath(), "cape-bone-iio\n");
  } catch(ex) {
    // cape-bone-iio has already been loaded so we move along
  }
  this.emit("connect");
};

AnalogPin.prototype.close = function() {
  return true;
};

AnalogPin.prototype.closeSync = function() {
  this._releaseCallback(false);
};

AnalogPin.prototype.analogRead = function() {
  var pin = this._helperDir() + "/" + this.pinNum,
      self = this;

  setInterval(function() {
    FS.readFile(pin, function(err, data) {
      if (err) {
        self.emit(
          "error",
          "Error occurred while reading from pin " + self.pinNum
        );

        return;
      }

      self.emit("analogRead", parseInt(data.toString()));
    });
  }, 20);

  return true;
};

AnalogPin.prototype._slotsPath = function() {
  return this._capemgrDir() + "/slots";
};

AnalogPin.prototype._helperDir = function() {
  if (!this.helperDir) {
    var helper = this._findFile(this._ocpDir(), /^helper\.\d+$/);

    if (helper != null) {
      this.helperDir = "" + this._ocpDir() + "/" + helper;
    }
  }

  return this.helperDir;
};

AnalogPin.prototype._releaseCallback = function(err) {
  if (err) {
    this.emit("error", "Error while releasing pwm pin");
  } else {
    this.emit("release", this.pinNum);
  }
};
