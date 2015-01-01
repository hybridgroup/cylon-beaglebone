/* jshint expr:true */
"use strict";

var mod = source("cylon-beaglebone"),
    Beaglebone = source("beaglebone");

describe("Cylon.Beaglebone", function() {
  describe("#adaptors", function() {
    it("is an array of supplied adaptors", function() {
      expect(mod.adaptors).to.be.eql(["beaglebone"]);
    });
  });

  describe("#dependencies", function() {
    it("is an array of required mods", function() {
      expect(mod.dependencies).to.be.eql(["cylon-gpio", "cylon-i2c"]);
    });
  });

  describe("#adaptor", function() {
    it("returns a new Beaglebone adaptor instance", function() {
      expect(mod.adaptor({})).to.be.an.instanceOf(Beaglebone);
    });
  });
});
