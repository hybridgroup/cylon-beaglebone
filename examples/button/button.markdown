# Beaglebone Button

First, let's import Cylon:

    var Cylon = require('cylon');

Now that we have Cylon imported, we can start defining our robot

    Cylon.robot({

Let's define the connections and devices:

      connections: {
        beaglebone: { adaptor: 'beaglebone' }
      },

      devices: {
        led: { driver: 'led', pin: 'P9_12' },
        button: { driver: 'button', pin: 'P9_14' }
      },

Now that Cylon knows about the necessary hardware we're going to be using, we'll
tell it what work we want to do:

      work: function(my) {
        my.button.on('push', my.led.toggle);
      }

Now that our robot knows what work to do, and the work it will be doing that
hardware with, we can start it:

    }).start();
