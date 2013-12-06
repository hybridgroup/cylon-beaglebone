###
 * Cylonjs Beaglebone adaptor
 * http://cylonjs.com
 *
 * Copyright (c) 2013 The Hybrid Group
 * Licensed under the Apache 2.0 license.
###

'use strict'

require "./pwm-pin"
namespace = require 'node-namespace'

namespace "Cylon.Adaptor", ->
  class @Beaglebone extends Cylon.Basestar
    PINS= {
      "P8_3": 38,
      "P8_4": 39,
      "P8_5": 34,
      "P8_6": 35,
      "P8_7": 66,
      "P8_8": 67,
      "P8_9": 69,
      "P8_10": 68,
      "P8_11": 45,
      "P8_12": 44,
      "P8_13": 23,
      "P8_14": 26,
      "P8_15": 47,
      "P8_16": 46,
      "P8_17": 27,
      "P8_18": 65,
      "P8_19": 22,
      "P8_20": 63,
      "P8_21": 62,
      "P8_22": 37,
      "P8_23": 36,
      "P8_24": 33,
      "P8_25": 32,
      "P8_26": 61,
      "P8_27": 86,
      "P8_28": 88,
      "P8_29": 87,
      "P8_30": 89,
      "P8_31": 10,
      "P8_32": 11,
      "P8_33": 9,
      "P8_34": 81,
      "P8_35": 8,
      "P8_36": 80,
      "P8_37": 78,
      "P8_38": 79,
      "P8_39": 76,
      "P8_40": 77,
      "P8_41": 74,
      "P8_42": 75,
      "P8_43": 72,
      "P8_44": 73,
      "P8_45": 70,
      "P8_46": 71,
      "P9_11": 30,
      "P9_12": 60,
      "P9_13": 31,
      "P9_14": 50,
      "P9_15": 48,
      "P9_16": 51,
      "P9_17": 5,
      "P9_18": 4,
      "P9_19": 13,
      "P9_20": 12,
      "P9_21": 3,
      "P9_22": 2,
      "P9_23": 49,
      "P9_24": 15,
      "P9_25": 117,
      "P9_26": 14,
      "P9_27": 115,
      "P9_28": 113,
      "P9_29": 111,
      "P9_30": 112,
      "P9_31": 110,
    }

    constructor: (opts) ->
      super
      @connection = opts.connection
      @name = opts.name
      @board = ""
      @pins = {}
      @pwmPins = {}
      @myself

    commands: ->
      ['pins', 'digitalRead', 'digitalWrite', 'pwmWrite', 'servoWrite', 'firmwareName']
      #'sendI2CConfig', 'sendI2CWriteRequest', 'sendI2CReadRequest']

    connect: (callback) ->
      Logger.debug "Connecting to board '#{@name}'..."
      @connection.emit 'connect'
      (callback)(null)

      @proxyMethods @commands, @board, @myself

    disconnect: ->
      Logger.debug "Disconnecting all pins..."
      @_disconnectPins()
      Logger.debug "Disconnecting from board '#{@name}'..."
      @connection.emit 'disconnect'

    firmwareName: ->
      'Beaglebone'

    digitalRead: (pinNum, drCallback) ->
      pin = @pins[@_translatePin(pinNum)]
      unless pin?
        pin = @_digitalPin(pinNum, 'r')
        pin.on('digitalRead', (val) =>
          @connection.emit('digitalRead', val)
          (drCallback)(val)
        )
        pin.on('connect', (data) => pin.digitalRead(20))
        pin.connect()

      true

    digitalWrite: (pinNum, value) ->
      pin = @pins[@_translatePin(pinNum)]
      if pin?
        pin.digitalWrite(value)
      else
        pin = @_digitalPin(pinNum, 'w')
        pin.on('digitalWrite', (val) => @connection.emit('digitalWrite', val))
        pin.on('connect', (data) => pin.digitalWrite(value))
        pin.connect()

      value

    pwmWrite: (pinNum, value) ->
      pin = @_pwmPin(pinNum)
      pin.pwmWrite(value)

      value

    servoWrite: (pinNum, angle) ->
      pin = @_pwmPin(pinNum)
      pin.servoWrite(angle)

      angle

    _pwmPin: (pinNum) ->
      gpioPinNum = @_translatePin(pinNum)
      unless @pwmPins[gpioPinNum]?
        size = Object.keys(@pwmPins).length
        @pwmPins[gpioPinNum] = new Cylon.IO.PwmPin(pin: gpioPinNum, loadPwmModule: (size > 0))
      @pwmPins[gpioPinNum]

    _digitalPin: (pinNum, mode) ->
      gpioPinNum = @_translatePin(pinNum)
      @pins[gpioPinNum] = new Cylon.IO.DigitalPin(pin: gpioPinNum, mode: mode) unless @pins[gpioPinNum]?
      @pins[gpioPinNum]

    _translatePin: (pinNum) ->
      PINS[pinNum]

    _disconnectPins: ->
      for key, pin of @pins
        pin.closeSync()

      for key, pin of @pwmPins
        pin.closeSync()
