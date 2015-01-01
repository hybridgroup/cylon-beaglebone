"use strict";

var Cylon = require("cylon");

Cylon.robot({
  connections: {
    beaglebone: { adaptor: "beaglebone" }
  },

  devices: {
    servo: {
      driver: "servo",
      pin: "P9_14",
      freq: 50,
      // pulseWidth in MicroSeconds as per servo spec sheet
      // e.g. http://www.servodatabase.com/servo/towerpro/sg90
      pulseWidth: { min: 500, max: 2400 },
      limits: { bottom: 20, top: 160 }
    }
  },

  work: function(my) {
    // Be carefull with your servo angles or you might DAMAGE the servo!
    // Cylon uses a 50hz/s (20ms period) frequency and a Duty Cycle
    // of 0.500 microseconds to 2400 microseconds to control the servo
    // angle movement by default, you can change that as seen in the
    // above declaration.
    //
    // This means pulseWidth (e.g. Servo SG90):
    // 1. min = 500 micro seconds
    // 2. max = 2400 micro seconds
    // (It is usually safe to start with a 90 degree angle, 1.5ms duty
    // cycle in most servos)
    //
    // Please review your servo datasheet to make sure of correct
    // angle range and the Freq/MS Duty cycle it requires.
    // If more servo support is needed leave us a comment, raise an
    // issue or help us add more support.

    var angle = 0,
        increment = 20;

    every((1).seconds(), function() {
      angle += increment;
      my.servo.angle(angle);

      console.log("Current Angle: " + my.servo.currentAngle());

      if ((angle === 20) || (angle === 160)) { increment = -increment; }
    });
  }
}).start();

