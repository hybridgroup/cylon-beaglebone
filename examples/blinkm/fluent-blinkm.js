"use strict";

var Cylon = require("cylon");

Cylon
  .robot()
  .connection("beaglebone", { adaptor: "beaglebone" })
  .device("pixel", { name: "pixel", driver: "blinkm", pin: "P9_20" })
  .on("ready", function(bot) {
    bot.pixel.stopScript();

    // You can pass a callback to all blinkm functions as the last param,
    // If you do the command would be executed asynchronously.
    // For write operations you get an (err) param passed back,
    // undefined for success, and containing the error if any encountered.
    //
    // Write BlimkM commands.
    bot.pixel.goToRGB(255, 0, 0);
    bot.pixel.fadeToRGB(0, 255, 0);
    bot.pixel.fadeToHSB(100, 180, 90);
    bot.pixel.fadeToRandomRGB(0, 0, 255);
    bot.pixel.fadeToRandomHSB(100, 180, 90);
    bot.pixel.playLightScript(1, 0, 0);
    bot.pixel.stopScript();
    bot.pixel.setFadeSpeed(50);
    bot.pixel.setTimeAdjust(50);

    // For read commands you get (err, data) passed back to the callback,
    // data contains the read data buffer, in case of Sync call (no callback)
    // you get a regular return.
    var color = bot.pixel.getRGBColor();

    console.log(color);

    // Example getting the color using async call and a callback
    bot.pixel.getRGBColor(function(err, data) {
      if (err == null) { console.log(data); }
    });
  });

Cylon.start();
