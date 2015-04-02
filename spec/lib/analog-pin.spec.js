// jshint expr:true

"use strict";

var fs = require("fs");

var AnalogPin = source("analog-pin"),
    Pin = source("pin");

describe("AnalogPin", function() {
  var pin;

  beforeEach(function() {
    pin = new AnalogPin({
      pin: 10
    });
  });

  it("subclasses Pin", function() {
    expect(pin).to.be.an.instanceOf(AnalogPin);
    expect(pin).to.be.an.instanceOf(Pin);
  });

  describe("constructor", function() {
    it("sets @ready to false by default", function() {
      expect(pin.ready).to.be.eql(false);
    });

    it("sets @pinNum to the provided pin", function() {
      expect(pin.pinNum).to.be.eql(10);
    });
  });

  describe("#connect", function() {
    var event;

    beforeEach(function() {
      event = spy();

      stub(fs, "appendFileSync");
      pin._slotsPath = function() { return "slotspath"; };

      pin.on("connect", event);
    });

    afterEach(function() {
      fs.appendFileSync.restore();
    });

    it("appends to the slotspath", function() {
      pin.connect();

      expect(fs.appendFileSync).to.be.calledWith(
        "slotspath",
        "cape-bone-iio\n"
      );
    });

    it("triggers the 'connect' event", function() {
      pin.connect();
      expect(event).to.be.called;
    });
  });

  describe("#close", function() {
    it("returns true", function() {
      expect(pin.close()).to.be.eql(true);
    });
  });

  describe("#closeSync", function() {
    var event;

    beforeEach(function() {
      event = spy();
      pin.on("release", event);
      pin.closeSync();
    });

    it("emits 'release' with the pin number", function() {
      expect(event).to.be.calledWith(10);
    });
  });

  describe("#analogRead", function() {
    var clock;

    beforeEach(function() {
      clock = sinon.useFakeTimers();

      pin._helperDir = function() { return "helperdir"; };

      stub(fs, "readFile");
    });

    afterEach(function() {
      fs.readFile.restore();
    });

    it("reads from the pin every 20 milliseconds", function() {
      pin.analogRead();
      expect(fs.readFile).to.not.be.called;

      clock.tick(20);
      expect(fs.readFile).to.be.calledOnce;

      clock.tick(20);
      expect(fs.readFile).to.be.calledTwice;
    });

    context("if reading the pin results in an error", function() {
      var event;

      beforeEach(function() {
        event = spy();

        fs.readFile.yields("error message");
        pin.on("error", event);

        pin.analogRead();
        clock.tick(20);
      });

      it("emits an error", function() {
        expect(event).to.be.calledWith(
          "Error occurred while reading from pin 10"
        );
      });
    });

    context("if reading the pin is successful", function() {
      var event;

      beforeEach(function() {
        event = spy();

        fs.readFile.yields(null, 10);
        pin.on("analogRead", event);

        pin.analogRead();
        clock.tick(20);
      });

      it("emits the parsed value", function() {
        expect(event).to.be.calledWith(10);
      });
    });
  });

  describe("#_slotsPath", function() {
    beforeEach(function() {
      pin._capemgrDir = function() { return "capemgrDir"; };
    });

    it("returns the path to the slots dir", function() {
      expect(pin._slotsPath()).to.be.eql("capemgrDir/slots");
    });
  });

  describe("#_helperDir", function() {
    beforeEach(function() {
      pin._findFile = stub().returns("helper.1");
      pin._ocpDir = stub().returns("ocpdir");
    });

    it("finds the helper directory", function() {
      expect(pin._helperDir()).to.be.eql("ocpdir/helper.1");
      expect(pin._findFile).to.be.calledWith("ocpdir");
    });

    context("if @helperDir is already set", function() {
      it("doesn't bother re-finding it", function() {
        pin.helperDir = "helperdir";
        expect(pin._helperDir()).to.be.eql("helperdir");
        expect(pin._findFile).to.not.be.called;
      });
    });
  });

  describe("#_releaseCallback", function() {
    var error, release;

    beforeEach(function() {
      error = spy();
      release = spy();

      pin.on("error", error);
      pin.on("release", release);
    });

    context("if an error is provided", function() {
      it("emits an error", function() {
        pin._releaseCallback(true);
        expect(error).to.be.called;
        expect(release).to.not.be.called;
      });
    });

    context("if an error is provided", function() {
      it("emits 'release'", function() {
        pin._releaseCallback(false);
        expect(error).to.not.be.called;
        expect(release).to.be.calledWith(10);
      });
    });
  });
});
