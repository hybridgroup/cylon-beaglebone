'use strict';

var beaglebone = source("cylon-beaglebone");

describe("Cylon.Beaglebone", function() {
  it("should be able to register", function() {
    beaglebone.register.should.be.a('function');
  });

  it("should be able to create adaptor", function() {
    expect(beaglebone.adaptor()).to.be.a('object');
  });
});
