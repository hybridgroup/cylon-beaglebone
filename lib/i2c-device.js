/*
 * cylon-beaglebone - I2C Device
 * cylonjs.com
 *
 * Copyright (c) 2013 The Hybrid Group
 * Licensed under the Apache 2.0 license.
*/

"use strict";

var Cylon = require("cylon");

var EventEmitter = require("events").EventEmitter,
    I2C = require("./i2c");

var I2CDevice = module.exports = function I2CDevice(opts) {
  this.address = opts.address;
  this.hdwInterface = opts.interface;
  this.i2c1 = I2C.open(1, console.log)
  /*
  this.i2cWire = new I2C(this.address, {
    device: this.hdwInterface
  });
  */
};

Cylon.Utils.subclass(I2CDevice, EventEmitter);

I2CDevice.prototype.connect = function() {};

I2CDevice.prototype.disconnect = function() {};

I2CDevice.prototype.write = function(cmd, buff, callback) {
  //this.i2cWire.write(new Buffer([cmd].concat(buff)), callback);
  this.i2c1.write(this.address, new Buffer([cmd].concat(buff)), callback);
};

I2CDevice.prototype.read = function(cmd, length, callback) {
  var that = this;
  //this.i2cWire.write(new Buffer([cmd]), function(err) {
  this.i2c1.write(this.address, new Buffer([cmd]), function(err) {
    if (err) {
      callback(err, null);
    } else {
      //that.i2cWire.read(length, callback);
      that.i2c1.i2cRead(that.address, length, callback);
    }
  });
};

I2CDevice.prototype.writeByte = function(byte, callback) {
  //this.i2cWire.writeByte(byte, callback);
  this.i2c1.writeByte(this.address, byte, callback);
};

I2CDevice.prototype.readByte = function(callback) {
  //return this.i2cWire.readByte(callback);
  return this.i2c1.readByte(this.address, callback);
};
