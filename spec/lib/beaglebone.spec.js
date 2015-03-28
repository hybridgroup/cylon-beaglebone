/* jshint expr:true */
"use strict";

var Beaglebone = source("beaglebone");

var cylon = require("cylon");

describe("Cylon.Adaptors.Beaglebone", function() {
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
      var events = ["analogRead", "digitalRead", "digitalWrite"];

      expect(beaglebone.events).to.be.eql(events);
    });
  });

  describe("#commands", function() {
    it("returns an array of command names(strings)", function() {
      var commands = beaglebone.commands;

      expect(commands).to.be.a("array");

      for (var i = 0; i < commands.length; i++) {
        expect(commands[i]).to.be.a("string");
      }
    });

    it("are part of a required commands list ", function() {
      var requiredCmds = [
        "pins", "analogRead", "digitalRead", "digitalWrite", "pwmWrite",
        "servoWrite", "firmwareName", "i2cWrite", "i2cRead"
      ];

      var commands = beaglebone.commands;
      var j = 0;

      for (var i = 0; i < requiredCmds.length; i++) {
        j = commands.indexOf(requiredCmds[i]);
        expect(requiredCmds[i]).to.be.eql(commands[j]);
      }
    });
  });

  describe("#connect", function() {
    it("triggers the callback", function() {
      var callback = spy();

      beaglebone.connect(callback);

      expect(callback).to.be.calledOnce;
    });
  });

  describe("#disconnect", function() {
    var callback;

    beforeEach(function() {
      callback = spy();

      stub(beaglebone, "_disconnectPins");
      stub(beaglebone, "emit");

      beaglebone.disconnect(callback);
    });

    it("triggers the callback", function() {
      expect(callback).to.be.calledOnce;
    });

    it("disconnects all pins by calling #_disconnectPins", function() {
      expect(beaglebone._disconnectPins).to.be.calledOnce;
    });

    it("emits the disconnect event", function() {
      expect(beaglebone.emit).to.be.calledWith("disconnect");
    });
  });

  describe("#firmwareName", function() {
    it("returns the name of the board(string)", function() {
      spy(beaglebone, "firmwareName");
      beaglebone.firmwareName();
      expect(beaglebone.firmwareName).returned("Beaglebone");
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

      stub(beaglebone, "_muxPin").returns(analogPin);
      stub(beaglebone, "emit");

      analogPin.on.yields(128);

      beaglebone.analogRead("P9_39", callback);
    });

    afterEach(function() {
      beaglebone.emit.restore();
      beaglebone._muxPin.restore();
    });

    it("calls _muxPin to return an AnalogPin object", function() {
      expect(beaglebone._muxPin).to.be.calledWith("analog", 
        { pinNum: "P9_39" });
      expect(beaglebone._muxPin).returned(analogPin);
    });

    it("triggers the callback", function() {
      expect(callback).to.be.calledWith(null, 128);
    });

    it("emits the analogRead event", function() {
      expect(beaglebone.emit).to.be.calledWith("analogRead", 128, "P9_39");
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

      stub(beaglebone, "_muxPin").returns(digitalPin);
      stub(beaglebone, "emit");

      digitalPin.on.yields(1);

      beaglebone.digitalRead("P8_3", callback);
    });

    afterEach(function() {
      beaglebone.emit.restore();
      beaglebone._muxPin.restore();
    });

    it("calls _digitalPin & returns DigitalPin object", function() {
      expect(beaglebone._muxPin).to.be.calledWith("digital", 
        { pinNum: "P8_3", mode: "r" });
      expect(beaglebone._muxPin).returned(digitalPin);
    });

    it("triggers the callback", function() {
      expect(callback).to.be.calledWith(null, 1);
    });


    it("emits the digitalRead event", function() {
      expect(beaglebone.emit).to.be.calledWith("digitalRead", 1, "P8_3");
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

      stub(beaglebone, "_translatePin").returns(38);
      stub(beaglebone, "_muxPin").returns(digitalPin);
      stub(beaglebone, "emit");

      digitalPin.on.yields(1);

      beaglebone.digitalWrite("P8_3", 1);
    });

    afterEach(function() {
      beaglebone._translatePin.restore();
      beaglebone._muxPin.restore();
      beaglebone.emit.restore();
    });

    it("calls _digitalPin to return a DigitalPin object", function() {
      expect(beaglebone._muxPin).to.be.calledWith("digital", 
        { pinNum: "P8_3", mode: "w" });
      expect(beaglebone._muxPin).returned(digitalPin);
    });

    it("emits the digitalWrite event", function() {
      expect(beaglebone.emit).to.be.calledWith("digitalWrite", 1, "P8_3");
    });

    it("calls digitalPin.connect", function() {
      expect(digitalPin.connect).to.be.calledOnce;
    });

    it("calls digitalPin.digitalWrite", function() {
      expect(digitalPin.digitalWrite).to.be.calledOnce;
    });

    describe("if digitalPin already exists", function() {
      beforeEach(function() {
        digitalPin.digitalWrite.reset();
        beaglebone._muxPin.reset();

        beaglebone.pins[38] = digitalPin;

        beaglebone.digitalWrite("P8_3", 1);
      });

      it("calls digitalWrite", function() {
        expect(digitalPin.digitalWrite).to.be.calledOnce;
      });

      it("calls does not call beaglebone._digitalPin", function() {
        expect(beaglebone._muxPin).to.not.be.called;
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

      stub(beaglebone, "_muxPin").returns(pwmPin);
      stub(beaglebone, "emit");

      pwmPin.on.yields();

      beaglebone._pwmWrite("P9_14", 500000, 0.5, "pwm");
    });

    afterEach(function() {
      beaglebone._muxPin.restore();
      beaglebone.emit.restore();
    });

    it("calls _muxPin to return a pwmPin object", function() {
      expect(beaglebone._muxPin).to.be.calledWith("pwm", 
        { pinNum: "P9_14", period: 500000 });
      expect(beaglebone._muxPin).returned(pwmPin);
    });

    it("emits the pwmWrite event", function() {
      expect(beaglebone.emit).to.be.calledWith("pwmWrite");
    });

    it("calls pwmPin.connect", function() {
      expect(pwmPin.connect).to.be.calledOnce;
    });

    it("calls pwmPin.pwmWrite", function() {
      expect(pwmPin.pwmWrite).to.be.calledOnce;
    });

    it("registers a pwmPin listener for connect event", function() {
      expect(pwmPin.on).to.be.calledWith("connect");
    });

    it("registers a pwmPin listener for pwmWrite event", function() {
      expect(pwmPin.on).to.be.calledWith("connect");
    });

    describe("if pwmPin already exists", function() {
      beforeEach(function() {
        pwmPin.pwmWrite.reset();
        pwmPin.connect.reset();
        pwmPin.on.reset();

        pwmPin.connected = true;

        beaglebone._pwmWrite("P9_14", 500000, 0.5, "pwm");
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

      stub(cylon.IO.Utils, "periodAndDuty").returns(pwm);
      stub(beaglebone, "_pwmWrite");

      beaglebone.pwmWrite("P9_14", 0.5, 2000, 50,"pwm");
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
      var fn = beaglebone._pwmWrite;
      expect(fn).to.be.calledWith("P9_14", 500000, 250000, "pwm");
    });
  });

  describe("#servoWrite", function() {
    beforeEach(function() {
      stub(beaglebone, "pwmWrite");

      beaglebone.servoWrite("P9_14", 0.5, 50, 50);
    });

    afterEach(function() {
      beaglebone.pwmWrite.restore();
    });

    it("calls this.pwmWrite with params", function() {
      var fn = beaglebone.pwmWrite;
      expect(fn).to.be.calledWith("P9_14", 0.5, 50, 50, "servo");
    });
  });

  describe("#i2cWrite", function() {
    var callback, i2cDevice;

    beforeEach(function() {
      callback = spy();

      i2cDevice = {
        write: spy()
      };

      stub(beaglebone, "_muxPin").returns(i2cDevice);

      beaglebone.i2cWrite(0x09, 0xfe, [0x00, 0xff, 0xff], callback);
    });

    afterEach(function() {
      beaglebone._muxPin.restore();
    });

    it("calls i2cDevice.write with params", function() {
      var fn = i2cDevice.write;

      expect(fn).to.be.calledOnce;
      expect(fn).to.be.calledWith(0xfe, [0x00, 0xff, 0xff], callback);
    });
  });

  describe("#i2cRead", function() {
    var callback, i2cDevice;

    beforeEach(function() {
      callback = spy();

      i2cDevice = {
        read: spy()
      };

      stub(beaglebone, "_muxPin").returns(i2cDevice);

      beaglebone.i2cRead(0x09, 0xfe, 3, callback);
    });

    afterEach(function() {
      beaglebone._muxPin.restore();
    });

    it("calls _muxPin to return a i2cDevice object", function() {
      expect(beaglebone._muxPin).to.be.calledWith("i2c", 
        { address: 0x09 });
      expect(beaglebone._muxPin).returned(i2cDevice);
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
        interface: "/dev/i2c-1"
      };

      stub(beaglebone, "_newI2CDevice").returns(i2cDevice);

      beaglebone._muxPin("i2c", { address: 0x09 });
    });

    afterEach(function() {
      beaglebone._newI2CDevice.restore();
    });

    it("calls this._newI2CDevice with address", function() {
      expect(beaglebone._newI2CDevice).to.be.calledOnce;
      expect(beaglebone._newI2CDevice).to.be.calledWith(0x09);
    });

    it("returns an i2cDevice instance", function() {
      expect(beaglebone._newI2CDevice).returned(i2cDevice);
    });

    it("sets this.i2cDevices[address] to the returned device", function() {
      expect(beaglebone.i2cDevices[0x09]).to.be.eql(i2cDevice);
    });

    describe("when i2cDevice exists in this.i2cDevices array", function() {
      it("does not call this._i2c", function() {
        expect(beaglebone._newI2CDevice).to.be.calledOnce;
      });
    });
  });

  describe("#_muxPin for pwmPins", function() {
    var pwmPin;

    beforeEach(function() {
      pwmPin = {
        pin: 38,
        period: 500000
      };

      stub(beaglebone, "_newPwmPin").returns(pwmPin);

      beaglebone._muxPin("pwm", { pinNum: "P9_14", period: 500000 });
    });

    afterEach(function() {
      beaglebone._newPwmPin.restore();
    });

    it("calls this._newPwmPin with params", function() {
      expect(beaglebone._newPwmPin).to.be.calledOnce;
      expect(beaglebone._newPwmPin).to.be.calledWith("P9_14", 500000);
    });

    it("returns a pwmPin instance", function() {
      expect(beaglebone._newPwmPin).returned(pwmPin);
    });

    it("sets this.pwmPin[gpioPinNum] to the returned device", function() {
      expect(beaglebone.pwmPins["P9_14"]).to.be.eql(pwmPin);
    });

    describe("when pwmPin exists in this.pwmPins array", function() {
      it("does not call this._newPwmPin", function() {
        expect(beaglebone._newPwmPin).to.be.calledOnce;
      });
    });
  });

  describe("#_muxPin for analogPins", function() {
    var analogPin;

    beforeEach(function() {
      analogPin = {
        pinNum: "P9_39",
        pin: "AIN0",
      };

      stub(beaglebone, "_newAnalogPin").returns(analogPin);

      beaglebone._muxPin("analog", { pinNum: "P9_39" });
    });

    afterEach(function() {
      beaglebone._newAnalogPin.restore();
    });

    it("calls this._newAnalogPin with params", function() {
      expect(beaglebone._newAnalogPin).to.be.calledOnce;
      expect(beaglebone._newAnalogPin).to.be.calledWith("AIN0");
    });

    it("returns an analogPin instance", function() {
      expect(beaglebone._newAnalogPin).returned(analogPin);
    });

    it("sets this.analogPins[gpioPinNum] to returned analogPin", function() {
      expect(beaglebone.analogPins["AIN0"]).to.be.eql(analogPin);
    });

    describe("when analogPin exists in this.analogPins array", function() {
      it("does not call this._newAnalogPin", function() {
        expect(beaglebone._newAnalogPin).to.be.calledOnce;
      });
    });
  });

  describe("#_muxPin for digitalPins", function() {
    var digitalPin;

    beforeEach(function() {
      digitalPin = {
        gpioPinNum: 38,
        pinNum: "P8_3"
      };

      stub(beaglebone, "_newDigitalPin").returns(digitalPin);

      beaglebone._muxPin("digital", { pinNum: "P8_3", mode: "w" });
    });

    afterEach(function() {
      beaglebone._newDigitalPin.restore();
    });

    it("calls this._newDigitalPin with params", function() {
      expect(beaglebone._newDigitalPin).to.be.calledOnce;
      expect(beaglebone._newDigitalPin).to.be.calledWith(38, "w");
    });

    it("returns a digitalPin instance", function() {
      expect(beaglebone._newDigitalPin).returned(digitalPin);
    });

    it("sets this.pins[gpioPinNum] to the returned digitalPin", function() {
      expect(beaglebone.pins[38]).to.be.eql(digitalPin);
    });

    describe("when digitalPin exists in this.pins array", function() {
      it("does not call this._newDigitalPin", function() {
        expect(beaglebone._newDigitalPin).to.be.calledOnce;
      });
    });
  });

  describe("translate functions", function() {
    var digitalPinNum, analogPinNum, pwmPinNum;

    beforeEach(function() {
      spy(beaglebone, "_translatePin");
      spy(beaglebone, "_translatePwmPin");
      spy(beaglebone, "_translateAnalogPin");

      digitalPinNum = beaglebone._translatePin("P8_3");
      pwmPinNum = beaglebone._translatePwmPin("P9_14");
      analogPinNum = beaglebone._translateAnalogPin("P9_39");
    });

    afterEach(function() {
      beaglebone._translatePin.restore();
      beaglebone._translatePwmPin.restore();
      beaglebone._translateAnalogPin.restore();
    });
    it("#_translatePin", function() {
      expect(beaglebone._translatePin).returned(38);
    });

    it("#_translatePwmPin", function() {
      expect(beaglebone._translatePwmPin).returned("P9_14");
    });

    it("#_translateAnalogPin", function() {
      expect(beaglebone._translateAnalogPin).returned("AIN0");
    });
  });

  describe("#_disconnectPins", function() {
    var pin, pwmPin;

    beforeEach(function() {
      pin = {
        closeSync: stub()
      };

      pwmPin = {
        closeSync: stub()
      };

      beaglebone.pins[38] = pin;
      beaglebone.pwmPins["P9_14"] = pwmPin;

      beaglebone._disconnectPins();
    });

    it("calls pin.closeSync for digitalPins", function() {
      expect(pin.closeSync).to.be.calledOnce;
    });

    it("calls pin.closeSync for digitalPins", function() {
      expect(pwmPin.closeSync).to.be.calledOnce;
    });
  });
});
