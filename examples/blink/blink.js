"use strict";

var Cylon = require("cylon");

Cylon.robot({
  connections: {
    beaglebone: { adaptor: "beaglebone" }
  },

  devices: {
    led: { driver: "led", pin: "P9_12" }
  },

  work: function(my) {
    every((1).second(), my.led.toggle);
  }
}).start();
