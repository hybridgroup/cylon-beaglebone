var Cylon = require('cylon');

Cylon
  .robot()
  .connection('beaglebone', { adaptor: 'beaglebone' })
  .device('sensor', { driver: 'analogSensor', pin: "P9_33" })
  .device('led', { driver: 'led', pin: "P9_14" })

  .on('ready', function(bot) {
    var brightness = 0;

    setInterval(function() {
      brightness = bot.sensor.analogRead().fromScale(0, 1799).toScale(0, 255) | 0;
      console.log('brightness => ', brightness);
      bot.led.brightness(brightness);
    }, 100);
  });

Cylon.start();
