'use strict';

var module = source("cylon-beaglebone"),
    Beaglebone = source('beaglebone');

describe("Cylon.Beaglebone", function() {
  describe("#adaptors", function() {
    it('is an array of supplied adaptors', function() {
      expect(module.adaptors).to.be.eql(['beaglebone']);
    });
  });

  describe("#dependencies", function() {
    it('is an array of required modules', function() {
      expect(module.drivers).to.be.eql(['cylon-gpio', 'cylon-i2c']);
    });
  });

  describe("#adaptor", function() {
    it('returns a new Beaglebone adaptor instance', function() {
      expect(module.adaptor({})).to.be.an.instanceOf(Beaglebone);
    });
  });
});
