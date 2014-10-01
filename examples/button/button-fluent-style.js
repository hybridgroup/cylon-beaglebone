var cylon = require('cylon');

cylon.robot({
  connection: { name: 'beaglebone', adaptor: 'beaglebone' },
  devices: [
    { name: 'led', driver: 'led', pin: 'P9_12' },
    { name: 'button', driver: 'button', pin: 'P9_14' }
  ]
})

.on('ready', function(robot) {
  robot.button.on('push', function() {
    robot.led.toggle();
  });
})

.start();
