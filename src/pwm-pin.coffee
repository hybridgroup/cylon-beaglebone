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

    constructor: (opts) ->
      @pinNum = opts.pin
      @loadPwmModule = if opts.loadPwmModule? then opts.loadPwmModule else false
      @freq = 2000
      @period = Math.round(1.0e9 / @freq)
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
          @emit('pwmWrite', value)
      )

    servoWrite: (angle) ->
      @pwmWrite(angle, true)

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
      calc = Math.round((((angle*0.20) / 180) + 0.05) * 100) / 100
      calc = if (calc > 0.249) then 0.249 else calc
      calc = if (calc < 0.05) then 0.05 else calc
      calc = @period - (@period * calc)
      calc
