###
 * cylon-beaglebone
 * http://cylonjs.com
 *
 * Copyright (c) 2013 The Hybrid Group
 * Licensed under the Apache 2.0 license.
###

'use strict'

require "cylon"
require "./beaglebone"
GPIO = require "cylon-gpio"

module.exports =
  adaptor: (args...) ->
    new Cylon.Adaptor.Beaglebone(args...)

  driver: (args...) ->
    GPIO.driver(args...)

  register: (robot) ->
    Logger.debug "Registering Beaglebone adaptor for #{robot.name}"
    robot.registerAdaptor 'cylon-beaglebone', 'beaglebone'

    GPIO.register robot
