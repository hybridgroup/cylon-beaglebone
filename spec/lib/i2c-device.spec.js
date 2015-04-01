/* jshint expr:true */
"use strict";

var I2CDevice = source("i2c-device"),
    MockI2C = source("i2c");

var EventEmitter = require("events").EventEmitter;

describe("I2CDevice", function() {
  var device, wire;

  beforeEach(function() {
    device = new I2CDevice({
      address: 0x4A,
      "interface": "interface"
    });
  });

  it("is an EventEmitter", function() {
    expect(device).to.be.an.instanceOf(EventEmitter);
  });

  describe("constructor", function() {
    it("sets @address to the provided address", function() {
      expect(device.address).to.be.eql(0x4A);
    });

    it("sets @hdwInterface to the provided interface", function() {
      expect(device.hdwInterface).to.be.eql("interface");
    });

    it("sets @i2cWire to a new I2C interface", function() {
      var wire = device.i2cWire;
      expect(wire).to.be.an.instanceOf(MockI2C);
      expect(wire.address).to.be.eql(0x4A);
      expect(wire.device).to.be.eql("interface");
    });
  });

  describe("#write", function() {
    var callback;

    beforeEach(function() {
      callback = spy();
      wire = device.i2cWire = { writeBytes: spy() };
      device.write("command", [1, 2, 3], callback);
    });

    it("writes a set of bytes to the I2C connection", function() {
      expect(wire.writeBytes).to.be.calledWith("command", [1, 2, 3], callback);
    });
  });

  describe("#read", function() {
    var callback;

    beforeEach(function() {
      callback = spy();
      wire = device.i2cWire = { readBytes: spy() };
      device.read("command", 1024, callback);
    });

    it("reads a set of bytes from the I2C connection", function() {
      expect(wire.readBytes).to.be.calledWith("command", 1024, callback);
    });
  });

  describe("#writeByte", function() {
    var callback;

    beforeEach(function() {
      callback = spy();
      wire = device.i2cWire = { writeByte: spy() };
      device.writeByte(1, callback);
    });

    it("writes a single byte to the I2C connection", function() {
      expect(wire.writeByte).to.be.calledWith(1, callback);
    });
  });

  describe("#readByte", function() {
    var callback;

    beforeEach(function() {
      callback = spy();
      wire = device.i2cWire = { readByte: spy() };
      device.readByte(callback);
    });

    it("reads a single byte from the I2C connection", function() {
      expect(wire.readByte).to.be.calledWith(callback);
    });
  });
});
