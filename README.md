# Cylon.js For Firmata

Cylon.js (http://cylonjs.com) is a JavaScript framework for robotics and physical computing using Node.js

This module provides an adaptor for the Beaglebone Black single-board computer (http://beagleboard.org/Products/BeagleBone+Black/)

Want to use Ruby on robots? Check out our sister project Artoo (http://artoo.io)

Want to use the Go programming language to power your robots? Check out our sister project Gobot (http://gobot.io).

[![Build Status](https://secure.travis-ci.org/hybridgroup/cylon-beaglebone.png?branch=master)](http://travis-ci.org/hybridgroup/cylon-beaglebone)

## Getting Started
Install the module with: `npm install cylon-beaglebone`

## Examples

### JavaScript:
```javascript
var Cylon = require('cylon');

// Initialize the robot
Cylon.robot({
  connection: { name: 'beaglebone', adaptor: 'beaglebone' },
  devices: [{name: 'led', driver: 'led', pin: 'P9_12'},
            {name: 'button', driver: 'button', pin: 'P9_14'}],

  work: function(my) {
    my.button.on('push', function() {my.led.toggle()});
  }
}).start();
```

### CoffeeScript:
```
Cylon = require('cylon')

# Initialize the robot
Cylon.robot
  connection:
    name: 'beaglebone', adaptor: 'beaglebone'

  devices:
    [
      {name: 'led', driver: 'led', pin: 'P9_12'},
      {name: 'button', driver: 'button', pin: 'P9_14'}
    ]

  work: (my) ->
    my.button.on 'push', -> my.led.toggle()

.start()
```

## Documentation
We're busy adding documentation to our web site at http://cylonjs.com/ please check there as we continue to work on Cylon.js

Thank you!

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

[![NPM](https://nodei.co/npm/cylon-beaglebone.png?compact=true)](https://nodei.co/npm/cylon-beaglebone/)

Version 0.1.0 - Initial release

## License
Copyright (c) 2013 The Hybrid Group. Licensed under the Apache 2.0 license.
