"use strict";

var Beaglebone = source('beaglebone');

describe('Cylon.Adaptors.Beaglebone', function() {
  var beaglebone;

  beforeEach(function(){
    beaglebone = new Beaglebone();
  });

  describe("constructor", function() {
    it("sets pins to an empty object", function(){
      expect(beaglebone.pins).to.be.eql({});
    });

    it("sets pwmPins to an empty object", function(){
      expect(beaglebone.pwmPins).to.be.eql({});
    });

    it("sets analogPins to an empty object", function(){
      expect(beaglebone.analogPins).to.be.eql({});
    });

    it("sets i2cDevices to an empty object", function(){
      expect(beaglebone.i2cDevices).to.be.eql({});
    });

    it("defines an array with events", function(){
      var events = ['analogRead', 'digitalRead', 'digitalWrite'];

      expect(beaglebone.events).to.be.eql(events);
    });
  });

  describe("#commands", function() {
    it("returns an array of command names(strings)", function() {
      var commands = beaglebone.commands;

      expect(commands).to.be.a('array');

      for (var i = 0; i < commands.length; i++) {
        expect(commands[i]).to.be.a('string');
      }
    });

    it('are part of a required commands list ', function() {
      var requiredCmds = [
        'pins', 'analogRead', 'digitalRead', 'digitalWrite', 'pwmWrite',
        'servoWrite', 'firmwareName', 'i2cWrite', 'i2cRead'
      ];

      var commands = beaglebone.commands;
      var j = 0;

      for (var i = 0; i < requiredCmds.length; i++) {
        j = commands.indexOf(requiredCmds[i]);
        expect(requiredCmds[i]).to.be.eql(commands[j]);
      }
    });
  });

  describe('#connect', function() {
    it('triggers the callback', function() {
      var callback = spy();

      beaglebone.connect(callback);

      expect(callback).to.be.calledOnce;
    });
  });

  describe('#disconnect', function() {
    var callback;

    beforeEach(function() {
      callback = spy();

      stub(beaglebone, '_disconnectPins');
      stub(beaglebone, 'emit');

      beaglebone.disconnect(callback);
    });

    it('triggers the callback', function() {
      expect(callback).to.be.calledOnce;
    });

    it('disconnects all pins by calling #_disconnectPins', function() {
      expect(beaglebone._disconnectPins).to.be.calledOnce;
    });

    it('emits the disconnect event', function() {
      expect(beaglebone.emit).to.be.calledWith('disconnect');
    });
  });

  describe('#firmwareName', function() {
    it('returns the name of the board(string)', function() {
      spy(beaglebone, 'firmwareName');
      beaglebone.firmwareName();
      expect(beaglebone.firmwareName).returned('Beaglebone');
    });
  });

  describe("#analogRead", function() {
    var callback, analogPin;

    beforeEach(function() {
      analogPin = {
        on: stub(),
        analogRead: spy(),
        connect: spy()
      };

      callback = spy();

      stub(beaglebone, '_analogPin').returns(analogPin);
      stub(beaglebone, 'emit');

      analogPin.on.yields(128);

      beaglebone.analogRead('P9_39', callback);
    });

    afterEach(function() {
      beaglebone.emit.restore();
      beaglebone._analogPin.restore();
    });

    it("triggers the callback", function() {
      expect(callback).to.be.calledWith(null, 128);
    });


    it("emits the analogRead event", function() {
      expect(beaglebone.emit).to.be.calledWith('analogRead', 128);
    });

    it("calls analogPin.connect", function() {
      expect(analogPin.connect).to.be.calledOnce;
    });

    it("calls analogPin.connect", function() {
      expect(analogPin.analogRead).to.be.calledOnce;
    });
  });
});
