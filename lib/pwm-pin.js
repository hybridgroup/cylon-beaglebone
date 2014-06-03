/*
 * Beaglebone PWM lPin
 * cylonjs.com
 *
 * Copyright (c) 2013 The Hybrid Group
 * Licensed under the Apache 2.0 license.
*/

'use strict';

var Cylon = require('cylon');

var EventEmitter = require('events').EventEmitter,
    fs = require('fs');

var PwmPin = module.exports = function PwmPin(opts) {
  this.pinNum = opts.pin;
  this.period = opts.period;
  this.connected = false;
};

subclass(PwmPin, EventEmitter);

var CAPEMGR_DIR = "/sys/devices";

PwmPin.prototype.connect = function(callback) {
  var am33xx, _this = this;

  var connectPin = function(err) {
    if (err) {
      console.log('ERROR: ', err);
      _this.emit('error', 'Error while connecting pwm pin');
    } else {
      fs.appendFile(this._slotsPath(), "bone_pwm_" + this.pinNum + "\n", function(err) {
        if (!err) {
          console.log(' PIN ' + "bone_pwm_" + this.pinNum + ' REGISTERED!!');
          _this.connected = true;
          _this.emit('connect');
          callback();
        }
      });
    }
  }

  if (this.connected || this._pwmDir()) {
    if (typeof(callback) === 'function') {
      this.connected = true;
      callback();
    }
  } else {
    fs.readFile(this._slotsPath(), function(err, data) {
      var am33xx = data.toString().match(/am33xx_pwm/g);

      if (am33xx == null) {
        fs.appendFile(this._slotsPath(), "am33xx_pwm\n", connectPin);
      } else {
        this.connected = true;
        callback();
      }
    });
  }
};

PwmPin.prototype.close = function() {
  return true;
};

PwmPin.prototype.closeSync = function() {
  return this._releaseCallback(false);
};

PwmPin.prototype._releaseCallback = function(err) {
  if (err) {
    this.emit('error', 'Error while releasing pwm pin');
  } else {
    this.emit('release', this.pinNum);
  }
};

PwmPin.prototype.pwmWrite = function(duty) {
  var _this = this;

  this.connect(function() {
    console.log('PERIOD ==>', _this.period);
    console.log('DUTY ==>', duty);
    fs.appendFile(_this._periodPath(), _this.period, function(err) {
      if (err) {
        console.log('ERROR ===>', err);
        _this.emit('error', err);
      } else {
        console.log('DUTY ===>', duty);
        fs.appendFile(_this._dutyPath(), "" + duty + "\n", function(err) {
          if (err) {
            console.log('ERROR ====>', err);
            _this.emit('error', "Error occurred while writing value " + _this.pbVal + " to pin " + _this.pinNum);
          } else {
            _this.emit('pwmWrite', duty);
          }
        });
      }
    });
  });
};

PwmPin.prototype._capemgrDir = function() {
  var capemgr;
  if (this.capemgrDir == null) {
    capemgr = this._findFile(CAPEMGR_DIR, /^bone_capemgr\.\d+$/);
    if (capemgr != null) {
      this.capemgrDir = "" + CAPEMGR_DIR + "/" + capemgr;
    }
  }
  return this.capemgrDir;
};

PwmPin.prototype._slotsPath = function() {
  return "" + (this._capemgrDir()) + "/slots";
};

PwmPin.prototype._ocpDir = function() {
  var ocp;
  if (!this.ocpDir) {
    ocp = this._findFile(CAPEMGR_DIR, /^ocp\.\d+$/);
    if (ocp != null) {
      this.ocpDir = "" + CAPEMGR_DIR + "/" + ocp;
    }
  }
  return this.ocpDir;
};

PwmPin.prototype._pwmDir = function() {
  var pwm, regex;
  if (!this.pwmDir) {
    regex = new RegExp("^pwm_test_" + this.pinNum + "\\.\\d+$");
    pwm = this._findFile(this._ocpDir(), regex);
    if (pwm != null) {
      this.pwmDir = "" + (this._ocpDir()) + "/" + pwm;
    }
  }
  return this.pwmDir;
};

PwmPin.prototype._findFile = function(dirName, nameRegex) {
  var f, file, files, _i, _len;
  files = fs.readdirSync(dirName);
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

PwmPin.prototype._runPath = function() {
  return "" + (this._pwmDir()) + "/run";
};

PwmPin.prototype._periodPath = function() {
  return "" + (this._pwmDir()) + "/period";
};

PwmPin.prototype._dutyPath = function() {
  return "" + (this._pwmDir()) + "/duty";
};

PwmPin.prototype._polarityPath = function() {
  return "" + (this._pwmDir()) + "/polarity";
};

module.exports = PwmPin;
