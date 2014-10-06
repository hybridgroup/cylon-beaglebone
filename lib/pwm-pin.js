/*
 * Beaglebone PWM Pin
 * cylonjs.com
 *
 * Copyright (c) 2013-2014 The Hybrid Group
 * Licensed under the Apache 2.0 license.
*/

'use strict';

var Cylon = require('cylon');

var fs = require('fs');

var Pin = require('./pin');

var PwmPin = module.exports = function PwmPin(opts) {
  this.pinNum = opts.pin;
  this.period = opts.period;
  this.connected = false;
  this.errCount = 0;
};

Cylon.Utils.subclass(PwmPin, Pin);

var CAPEMGR_DIR = "/sys/devices";

PwmPin.prototype.connect = function() {
  var am33xx;

  this.on('error', function(err) {
    err.count = ++this.errCount;

    if ((err.count < 10) && (err.code === 'ENOENT') && (err.errno === 34)) {
      this.pwmWrite(this.duty);
    } else {
      this.emit('err', this.duty);
      this.removeAllListeners('error', function() {
        this.emit('err', this.duty);
      });
    }
  }.bind(this));

  var registerPin = function(err) {
    if (err) {
      this.emit('error', 'Error while connecting pwm pin');
    } else {
      fs.appendFile(this._slotsPath(), "bone_pwm_" + this.pinNum + "\n", function(err) {
        if (!err) {
          this.connected = true;
          this.emit('connect');
        } else {
          this.emit('error', 'Error while registering pwm pin');
        }
      });
    }
  }.bind(this);

  if (this.connected || this._pwmDir()) {
    this.connected = true;
    fs.appendFile(this._dutyPath(), "" + this.period + "\n", function() {
      Cylon.Logger.info('duty has been reset.');
    });
  } else {
    fs.readFile(this._slotsPath(), function(err, data) {
      am33xx = data.toString().match(/am33xx_pwm/g);

      if (am33xx == null) {
        fs.appendFile(this._slotsPath(), "am33xx_pwm\n", registerPin);
      } else {
        registerPin(false);
      }
    }.bind(this));
  }
};

PwmPin.prototype.close = function() {
  return true;
};

PwmPin.prototype.closeSync = function() {
  this._releaseCallback(false);
};

PwmPin.prototype._releaseCallback = function(err) {
  if (err) {
    this.emit('error', 'Error while releasing pwm pin');
  } else {
    this.emit('release', this.pinNum);
  }
};

PwmPin.prototype.pwmWrite = function(duty) {
  this.duty = duty;

  fs.appendFile(this._periodPath(), "" + this.period + "\n", function(err) {
    if (err) {
     this.emit('error', err);
    } else {
      fs.appendFile(this._dutyPath(), "" + this.duty + "\n", function(err) {
        if (err) {
          this.emit('error', err);
        } else {
          this.emit('pwmWrite', duty);
        }
      }.bind(this));
    }
  }.bind(this));
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
