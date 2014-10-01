var cylon = require('cylon');

cylon.robot({
  connection: { name: 'beaglebone', adaptor: 'beaglebone' },
  device: { name: 'led', driver: 'led', pin: 'P9_14' }
})

.on('ready', function(robot) {
  var brightness = 0,
      fade = 5;

  setInterval(function() {
    brightness += fade;

    robot.led.brightness(brightness);

    if ((brightness === 0) || (brightness === 255)) {
      fade = -fade;
    }
  }, 50);
})

.start();
