# Beaglebone Led Brightness

First, let's import Cylon:

    var Cylon = require('cylon');

Now that we have Cylon imported, we can start defining our robot

    Cylon.robot({

Let's define the connections and devices:

      connections: {
        beaglebone: { adaptor: 'beaglebone' }
      },

      devices: {
        led: { driver: 'led', pin: 'P9_14' }
      },

Now that Cylon knows about the necessary hardware we're going to be using, we'll
tell it what work we want to do:

      work: function(my) {
        var brightness = 0,
            fade = 5;

        every(0.05.seconds(), function() {
          brightness += fade;
          my.led.brightness(brightness);
          if ((brightness === 0) || (brightness === 255)) { fade = -fade; }
        });
      }

Now that our robot knows what work to do, and the work it will be doing that
hardware with, we can start it:

    }).start();
