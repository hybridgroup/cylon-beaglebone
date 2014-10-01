var cylon = require('cylon');

cylon.robot({
  connection: { name: 'beaglbone', adaptor: 'beaglebone' },
  devices: [
    { name: 'sensor', driver: 'analogSensor', pin: "P9_33" },
    { name: 'led', driver: 'led', pin: "P9_14" },
  ]
})

.on('ready', function(robot) {
  var brightness = 0;
  setInterval(function() {
    brightness = robot.sensor.analogRead().fromScale(0, 1799).toScale(0, 255) | 0;
    console.log('brightness => ', brightness);
    robot.led.brightness(brightness);
  }, 100);
})

.start();
