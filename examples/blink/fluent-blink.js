"use strict";

var Cylon = require("cylon");

Cylon
  .robot()
  .connection("beaglebone", { adaptor: "beaglebone" })
  .device("led", { driver: "led", pin: "P9_12" })
  .on("ready", function(bot) {
    setInterval(function() {
      bot.led.toggle();
    }, 1000);
  });

Cylon.start();
