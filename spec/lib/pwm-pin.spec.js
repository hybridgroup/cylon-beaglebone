"use strict";

var PwmPin = lib("pwm-pin");

describe("PwmPin", function() {
  var pin = new PwmPin({});

  it("needs specs", function() {
    expect(pin).to.be.an.instanceOf(PwmPin);
  });
});
