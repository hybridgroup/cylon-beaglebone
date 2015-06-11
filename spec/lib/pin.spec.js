"use strict";

var Pin = lib("pin");

var fs = require("fs"),
    EventEmitter = require("events").EventEmitter;

describe("Pin", function() {
  var pin;

  beforeEach(function() {
    pin = new Pin();
  });

  it("is an EventEmitter", function() {
    expect(pin).to.be.an.instanceOf(Pin);
    expect(pin).to.be.an.instanceOf(EventEmitter);
  });

  describe("#_findFile", function() {
    var files = [ "alpha", "bravo", "charlie", "delta", "echo" ];

    beforeEach(function() {
      stub(fs, "readdirSync").returns(files);
    });

    afterEach(function() {
      fs.readdirSync.restore();
    });

    it("finds a filename, in a directory, that matches a regex", function() {
      var res = pin._findFile("directory", /alpha/);

      expect(fs.readdirSync).to.be.calledWith("directory");
      expect(res).to.be.eql("alpha");
    });

    it("returns null if it can't find a file", function() {
      expect(pin._findFile("directory", /nope/)).to.be.eql(null);
    });
  });

  describe("#_capemgrDir", function() {
    beforeEach(function() {
      pin._findFile = stub().returns("bone_capemgr.1");
    });

    it("finds the cape manager directory", function() {
      expect(pin._capemgrDir()).to.be.eql("/sys/devices/bone_capemgr.1");
      expect(pin._findFile).to.be.calledWith("/sys/devices");
    });

    context("if @capemgrDir is already set", function() {
      it("doesn't bother re-finding it", function() {
        pin.capemgrDir = "capemgrdir";
        expect(pin._capemgrDir()).to.be.eql("capemgrdir");
        expect(pin._findFile).to.not.be.called;
      });
    });
  });

  describe("#_ocpDir", function() {
    beforeEach(function() {
      pin._findFile = stub().returns("ocp.1");
    });

    it("finds the ocp directory", function() {
      expect(pin._ocpDir()).to.be.eql("/sys/devices/ocp.1");
      expect(pin._findFile).to.be.calledWith("/sys/devices");
    });

    context("if @ocpDir is already set", function() {
      it("doesn't bother re-finding it", function() {
        pin.ocpDir = "ocpdir";
        expect(pin._ocpDir()).to.be.eql("ocpdir");
        expect(pin._findFile).to.not.be.called;
      });
    });
  });
});
