###
 * Beaglebone PWM lPin
 * cylonjs.com
 *
 * Copyright (c) 2013 The Hybrid Group
 * Licensed under the Apache 2.0 license.
###

'use strict'

FS = require('fs')
EventEmitter = require('events').EventEmitter

namespace = require 'node-namespace'

# PwmPin class to interface with Beaglebone pwm kernel modules
#
namespace 'Cylon.IO', ->
  class @PwmPin extends EventEmitter

    CAPEMGR_DIR = "/sys/devices"
    SERVO_FREQ = 50

    constructor: (opts) ->
      @pinNum = opts.pin
      @loadPwmModule = if opts.loadPwmModule? then opts.loadPwmModule else false
      @freq = 2000
      @period = @_calcPeriod(@freq)
      @duty= 500000
      @ready = false

    connect: () ->
      if @loadPwmModule
        am33xx = @_findFile(@_ocpDir(), /^pwm_test_.+/)
        unless am33xx?
          FS.appendFileSync(@_slotsPath(), "am33xx_pwm\n")

      FS.appendFile(@_slotsPath(), "bone_pwm_#{ @pinNum }\n", (err) =>
        unless err
          FS.appendFile(@_periodPath(), @period, (err) =>
            if err
              @emit('error', err)
            else
              @emit('connect')
          )
      )
      true

    close: ->
      true

    closeSync: ->
      #FS.appendFileSync("#{ @_pwmPath() }/run", '0')
      @_releaseCallback(false)

    # Writes PWM value to the specified pin
    # Param value should be integer from 0 to 255
    pwmWrite: (value, servo = false) ->
      @value = value
      @pwmVal = if (servo?) then @_servoVal(value) else @_pwmVal(value)

      FS.appendFile(@_dutyPath(), "#{ @pwmVal }\n", (err) =>
        if (err)
          @emit('error', "Error occurred while writing value #{ @pbVal } to pin #{ @pinNum }")
        else
          if servo
            @emit('servoWrite', value)
          else
            @emit('pwmWrite', value)
      )

    servoWrite: (angle) ->
      if @freq is SERVO_FREQ
        @pwmWrite(angle, true)
      else
        @_setServoFreq()

    _setServoFreq: () ->
      servoPeriod = @_calcPeriod(SERVO_FREQ)
      FS.appendFile(@_periodPath(), servoPeriod, (err) =>
        if err
          @emit('error', err)
        else
          @freq = SERVO_FREQ
          @period = servoPeriod
          @pwmWrite(angle, true)
      )

    _capemgrDir: () ->
      unless @capemgrDir?
        capemgr = @_findFile(CAPEMGR_DIR, /^bone_capemgr\.\d+$/)
        @capemgrDir = "#{ CAPEMGR_DIR }/#{ capemgr }" if capemgr?
      @capemgrDir

    _slotsPath: () ->
      "#{ @_capemgrDir() }/slots"

    _ocpDir: () ->
      unless @ocpDir
        ocp = @_findFile(CAPEMGR_DIR, /^ocp\.\d+$/)
        @ocpDir = "#{ CAPEMGR_DIR }/#{ ocp }" if ocp?
      @ocpDir

    _pwmDir: () ->
      unless @pwmDir
        regex = new RegExp("^pwm_test_#{ @pinNum }\\.\\d+$")
        pwm = @_findFile(@_ocpDir(), regex)
        @pwmDir = "#{ @_ocpDir() }/#{ pwm }" if pwm?
      @pwmDir

    _findFile: (dirName, nameRegex) ->
      files = FS.readdirSync(dirName)
      file = null
      for f in files
        file = f.match(nameRegex)
        if file?
          file = file[0]
          break
      file

    _runPath: () ->
      "#{ @_pwmDir() }/run"

    _periodPath: () ->
      "#{ @_pwmDir() }/period"

    _dutyPath: () ->
      "#{ @_pwmDir() }/duty"

    _polarityPath: () ->
      "#{ @_pwmDir() }/polarity"

    _releaseCallback: (err) ->
      if(err)
        @emit('error', 'Error while releasing pwm pin')
      else
        @emit('release', @pinNum)

    _pwmVal: (value) ->
      calc = Math.round((@period - ((@period/255.0) * value)) * 100) / 100
      calc = if (calc > @period) then @period else calc
      calc = if (calc < 0) then 0 else calc
      calc

    _servoVal: (angle) ->
      # Servo DutyCycle should be 0.5ms to 2.5ms for full range servos
      # with a frequency of 50hz (period of 20ms) the 10% of the value
      # will give us full servo range (adding 0.5ms to account that
      # the range starts at 0.5 not 0)
      maxDutyCicle = @period * 0.10
      # We now calculate the 'ON' time or duty cicle based on the angle
      # parameter received.
      calc = Math.round(((maxDutyCycle / 180) * angle) + 500000) # We add 500000 which represent 0.5ms in nanoseconds
      calc = if (calc > 2500000) then 2500000 else calc
      calc = if (calc < 500000) then 500000 else calc
      # Since we are using inverted polarity we substract the calculated
      # value from the period to obtain the real duty value
      calc = @period - calc
      calc

    _calcPeriod: (freq) ->
      Math.round(1.0e9 / freq)
