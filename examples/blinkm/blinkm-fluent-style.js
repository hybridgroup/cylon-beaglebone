var cylon = require('cylon');

cylon.robot({
  connection: { name: 'beaglebone', adaptor: 'beaglebone' },
  device: { name: 'pixel', driver: 'blinkm', pin: 'P9_20' }
})

.on('ready', function(robot) {
  robot.pixel.stopScript();

  // You can pass a callback to all blinkm functions as the last param,
  // If you do the command would be executed asynchronously.
  // For write operations you get an (err) param passed back,
  // undefined for success, and containing the error if any encountered.
  //
  // Write BlimkM commands.
  robot.pixel.goToRGB(255, 0, 0);
  robot.pixel.fadeToRGB(0, 255, 0);
  robot.pixel.fadeToHSB(100, 180, 90);
  robot.pixel.fadeToRandomRGB(0, 0, 255);
  robot.pixel.fadeToRandomHSB(100, 180, 90);
  robot.pixel.playLightScript(1, 0, 0);
  robot.pixel.stopScript();
  robot.pixel.setFadeSpeed(50);
  robot.pixel.setTimeAdjust(50);

  // For read commands you get (err, data) passed back to the callback,
  // data contains the read data buffer, in case of Sync call (no callback)
  // you get a regular return.
  var color = robot.pixel.getRGBColor();

  console.log(color);

  // Example getting the color using async call and a callback
  robot.pixel.getRGBColor(function(err, data) {
    if (err == null) { console.log(data); }
  });
})

.start();
