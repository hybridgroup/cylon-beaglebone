"use strict";

var Cylon = require("cylon");

Cylon
  .robot()
  .connection("beaglebone", { adaptor: "beaglebone" })
  .device("led", { driver: "led", pin: "P9_12" })
  .device("button", { driver: "button", pin: "P9_14" })

  .on("ready", function(bot) {
    bot.button.on("push", function() {
      bot.led.toggle();
    });
  });

Cylon.start();
