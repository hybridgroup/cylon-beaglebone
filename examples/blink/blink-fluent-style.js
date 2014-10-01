var Cylon = require('cylon');

Cylon.robot({
  connection: { name: 'beaglebone', adaptor: 'beaglebone' },
  device: { name: 'led', driver: 'led', pin: 'P9_12' }
})

.on('ready', function(robot) {
  setInterval(function() {
    robot.led.toggle();
  }, 1000);
})

.start();
