var Cylon = require('cylon');

Cylon.robot({
  connection: { name: 'beaglebone', adaptor: 'beaglebone' },
  device: { name: 'led', driver: 'led', pin: 'P9_12' },

  work: function(my) {
    every((1).second(), my.led.toggle);
  }
}).start();
