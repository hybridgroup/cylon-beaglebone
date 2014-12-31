"use strict";

var Beaglebone = source('beaglebone');

var cylon = require('cylon');

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

    it("calls _analogPin to return an AnalogPin object", function() {
      expect(beaglebone._analogPin).to.be.calledWith('P9_39');
      expect(beaglebone._analogPin).returned(analogPin);
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

    it("calls analogPin.analogRead", function() {
      expect(analogPin.analogRead).to.be.calledOnce;
    });
  });

  describe("#digitalRead", function() {
    var callback, digitalPin;

    beforeEach(function() {
      digitalPin = {
        on: stub(),
        digitalRead: spy(),
        connect: spy()
      };

      callback = spy();

      stub(beaglebone, '_digitalPin').returns(digitalPin);
      stub(beaglebone, 'emit');

      digitalPin.on.yields(1);

      beaglebone.digitalRead('P8_3', callback);
    });

    afterEach(function() {
      beaglebone.emit.restore();
      beaglebone._digitalPin.restore();
    });

    it("calls _digitalPin to return a DigitalPin object", function() {
      expect(beaglebone._digitalPin).to.be.calledWith('P8_3', 'r');
      expect(beaglebone._digitalPin).returned(digitalPin);
    });

    it("triggers the callback", function() {
      expect(callback).to.be.calledWith(null, 1);
    });


    it("emits the digitalRead event", function() {
      expect(beaglebone.emit).to.be.calledWith('digitalRead', 1);
    });

    it("calls digitalPin.connect", function() {
      expect(digitalPin.connect).to.be.calledOnce;
    });

    it("calls digitalPin.digitalRead", function() {
      expect(digitalPin.digitalRead).to.be.calledOnce;
    });
  });

  describe("#digitalWrite", function() {
    var digitalPin;

    beforeEach(function() {
      digitalPin = {
        on: stub(),
        digitalWrite: spy(),
        connect: spy()
      };

      stub(beaglebone, '_translatePin').returns(38);
      stub(beaglebone, '_digitalPin').returns(digitalPin);
      stub(beaglebone, 'emit');

      digitalPin.on.yields(1);

      beaglebone.digitalWrite('P8_3', 1);
    });

    afterEach(function() {
      beaglebone._translatePin.restore();
      beaglebone._digitalPin.restore();
      beaglebone.emit.restore();
    });

    it("calls _digitalPin to return a DigitalPin object", function() {
      expect(beaglebone._digitalPin).to.be.calledWith('P8_3', 'w');
      expect(beaglebone._digitalPin).returned(digitalPin);
    });

    it("emits the digitalWrite event", function() {
      expect(beaglebone.emit).to.be.calledWith('digitalWrite', 1);
    });

    it("calls digitalPin.connect", function() {
      expect(digitalPin.connect).to.be.calledOnce;
    });

    it("calls digitalPin.digitalWrite", function() {
      expect(digitalPin.digitalWrite).to.be.calledOnce;
    });

    describe('if digitalPin already exists', function() {
      beforeEach(function() {
        digitalPin.digitalWrite.reset();
        beaglebone._digitalPin.reset();

        beaglebone.pins[38] = digitalPin;

        beaglebone.digitalWrite('P8_3', 1);
      });

      it("calls digitalWrite", function() {
        expect(digitalPin.digitalWrite).to.be.calledOnce;
      });

      it("calls does not call beaglebone._digitalPin", function() {
        expect(beaglebone._digitalPin).to.not.be.called;
      });
    });
  });

  describe("#_pwmWrite", function() {
    var pwmPin;

    beforeEach(function() {
      pwmPin = {
        on: stub(),
        pwmWrite: spy(),
        connect: spy(),
        connected: false
      };

      stub(beaglebone, '_pwmPin').returns(pwmPin);
      stub(beaglebone, 'emit');

      pwmPin.on.yields();

      beaglebone._pwmWrite('P9_14', 500000, 0.5, 'pwm');
    });

    afterEach(function() {
      beaglebone._pwmPin.restore();
      beaglebone.emit.restore();
    });

    it("calls _pwmPin to return a pwmPin object", function() {
      expect(beaglebone._pwmPin).to.be.calledWith('P9_14', 500000);
      expect(beaglebone._pwmPin).returned(pwmPin);
    });

    it("emits the pwmWrite event", function() {
      expect(beaglebone.emit).to.be.calledWith('pwmWrite');
    });

    it("calls pwmPin.connect", function() {
      expect(pwmPin.connect).to.be.calledOnce;
    });

    it("calls pwmPin.pwmWrite", function() {
      expect(pwmPin.pwmWrite).to.be.calledOnce;
    });

    it("registers a pwmPin listener for connect event", function() {
      expect(pwmPin.on).to.be.calledWith('connect');
    });

    it("registers a pwmPin listener for pwmWrite event", function() {
      expect(pwmPin.on).to.be.calledWith('connect');
    });

    describe('if pwmPin already exists', function() {
      beforeEach(function() {
        pwmPin.pwmWrite.reset();
        pwmPin.connect.reset();
        pwmPin.on.reset();

        pwmPin.connected = true;

        beaglebone._pwmWrite('P9_14', 500000, 0.5, 'pwm');
      });

      it("calls pwmPin.pwmWrite", function() {
        expect(pwmPin.pwmWrite).to.be.calledOnce;
      });

      it("do not call pwmPin.connect", function() {
        expect(pwmPin.connect).to.not.be.called;
      });

      it("do not add a new pwmWrite listener", function() {
        expect(pwmPin.on).to.not.be.called;
      });
    });
  });

  describe("#pwmWrite", function() {
    var pwm;

    beforeEach(function() {
      pwm = {
        duty: 250000,
        period: 500000
      };

      stub(cylon.IO.Utils, 'periodAndDuty').returns(pwm);
      stub(beaglebone, '_pwmWrite');

      beaglebone.pwmWrite('P9_14', 0.5, 2000, 50,'pwm');
    });

    afterEach(function() {
      beaglebone._pwmWrite.restore();
      cylon.IO.Utils.periodAndDuty.restore();
    });

    it("calls cylon.IO.Utils.periodAndDuty", function() {
      expect(cylon.IO.Utils.periodAndDuty).to.be.calledWith(0.5, 2000);
      expect(cylon.IO.Utils.periodAndDuty).returned(pwm);
    });

    it("calls this._pwmWrite with params", function() {
      expect(beaglebone._pwmWrite).to.be.calledWith('P9_14', 500000, 250000, 'pwm');
    });
  });

  describe("#servoWrite", function() {
    beforeEach(function() {
      stub(beaglebone, 'pwmWrite');

      beaglebone.servoWrite('P9_14', 0.5, 50, 50);
    });

    afterEach(function() {
      beaglebone.pwmWrite.restore();
    });

    it("calls this.pwmWrite with params", function() {
      expect(beaglebone.pwmWrite).to.be.calledWith('P9_14', 0.5, 50, 50, 'servo');
    });
  });

  describe("#i2cWrite", function() {
    var callback, i2cDevice;

    beforeEach(function() {
      callback = spy();

      i2cDevice = {
        write: spy()
      };

      stub(beaglebone, '_i2cDevice').returns(i2cDevice);

      beaglebone.i2cWrite(0x09, 0xfe, [0x00, 0xff, 0xff], callback);
    });

    afterEach(function() {
      beaglebone._i2cDevice.restore();
    });

    it("calls i2cDevice.write with params", function() {
      expect(i2cDevice.write).to.be.calledOnce;
      expect(i2cDevice.write).to.be.calledWith(0xfe, [0x00, 0xff, 0xff], callback);
    });
  });

  describe("#i2cRead", function() {
    var callback, i2cDevice;

    beforeEach(function() {
      callback = spy();

      i2cDevice = {
        read: spy()
      };

      stub(beaglebone, '_i2cDevice').returns(i2cDevice);

      beaglebone.i2cRead(0x09, 0xfe, 3, callback);
    });

    afterEach(function() {
      beaglebone._i2cDevice.restore();
    });

    it("calls i2cDevice.write with params", function() {
      expect(i2cDevice.read).to.be.calledOnce;
      expect(i2cDevice.read).to.be.calledWith(0xfe, 3, callback);
    });
  });

  describe("#_i2cDevice", function() {
    var i2cDevice;

    beforeEach(function() {
      i2cDevice = {
        address: 0x09,
        interface: '/dev/i2c-1'
      };

      stub(beaglebone, '_i2c').returns(i2cDevice);

      beaglebone._i2cDevice(0x09);
    });

    afterEach(function() {
      beaglebone._i2c.restore();
    });

    it("calls this._i2c with address", function() {
      expect(beaglebone._i2c).to.be.calledOnce;
      expect(beaglebone._i2c).to.be.calledWith(0x09);
    });

    it("returns an i2cDevice instance", function() {
      expect(beaglebone._i2c).returned(i2cDevice);
    });

    it("sets this.i2cDevices[address] to the returned device", function() {
      expect(beaglebone.i2cDevices[0x09]).to.be.eql(i2cDevice);
    });

    describe('when i2cDevice exists in this.i2cDevices array', function() {
      it("does not call this._i2c", function() {
        expect(beaglebone._i2c).to.be.calledOnce;
      });
    });
  });
});
