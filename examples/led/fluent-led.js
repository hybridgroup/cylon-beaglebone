"use strict";

var Cylon = require("cylon");

Cylon
  .robot()
  .connection("beaglebone", { adaptor: "beaglebone" })
  .device("led", { driver: "led", pin: "P9_14" })

  .on("ready", function(bot) {
    var brightness = 0,
        fade = 5;

    setInterval(function() {
      brightness += fade;

      bot.led.brightness(brightness);

      if ((brightness === 0) || (brightness === 255)) {
        fade = -fade;
      }
    }, 50);
  });

Cylon.start();
