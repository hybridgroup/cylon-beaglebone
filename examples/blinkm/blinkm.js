"use strict";

var Cylon = require("cylon");

Cylon.robot({
  connections: {
    bbb: { adaptor: "beaglebone" }
  },

  devices: {
    blinkm: { driver: "blinkm" }
  },

  work: function(my) {
    my.blinkm.stopScript();

    my.blinkm.getFirmware(function(err, version) {
      console.log("Started BlinkM version " + version);
    });

    my.blinkm.goToRGB(0,0,0);
    my.blinkm.getRGBColor(function(err, data){
      console.log("Starting Color: ", data);
    });

    every((2).seconds(), function() {
      my.blinkm.getRGBColor(function(err, data){
        console.log("Current Color: ", data);
      });
      my.blinkm.fadeToRandomRGB(128, 128, 128);
    });
  }
}).start();
