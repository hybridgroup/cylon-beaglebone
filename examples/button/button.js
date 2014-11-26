var Cylon = require('cylon');

Cylon.robot({
  connections: {
    beaglebone: { adaptor: 'beaglebone' }
  },

  devices: {
    led: { driver: 'led', pin: 'P9_12' },
    button: { driver: 'button', pin: 'P9_14' }
  },

  work: function(my) {
    my.button.on('push', my.led.toggle);
  }
}).start();
