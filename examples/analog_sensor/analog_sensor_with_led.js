var Cylon = require('cylon');

Cylon.robot({
  connection: { name: 'beaglbone', adaptor: 'beaglebone' },
  devices: [
    { name: 'sensor', driver: 'analogSensor', pin: "P9_33" },
    { name: 'led', driver: 'led', pin: "P9_14" },
  ],
  work: function(my) {
    every((0.1).seconds(), function() {
      brightness = my.sensor.analogRead().fromScale(0, 1799).toScale(0, 255) | 0;
      Cylon.Logger.info('brightness => ', brightness);
      my.led.brightness(brightness)
    });
  }
}).start();

