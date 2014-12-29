/*
 * Cylonjs Beaglebone adaptor
 * http://cylonjs.com
 *
 * Copyright (c) 2013-2014 The Hybrid Group
 * Licensed under the Apache 2.0 license.
*/

'use strict';

var PwmPin = require('./pwm-pin'),
    I2CDevice = require('./i2c-device'),
    AnalogPin = require('./analog-pin');

var Cylon = require('cylon');

var Beaglebone = module.exports = function Beaglebone() {
  Beaglebone.__super__.constructor.apply(this, arguments);
  this.board = "";
  this.pins = {};
  this.pwmPins = {};
  this.analogPins = {};
  this.i2cDevices = {};

  this.events = [
    /**
     * Emitted when the Beaglebone has new analogRead data
     *
     * @event analogRead
     * @value val the value from the pin
     */
    "analogRead",

    /**
     * Emitted when the Beaglebone has new digitalRead data
     *
     * @event digitalRead
     * @value val the value from the pin
     */
    "digitalRead",

    /**
     * Emitted when the Beaglebone has written a value to a digital pin
     *
     * @event digitalWrite
     */
    "digitalWrite"
  ];
};

Cylon.Utils.subclass(Beaglebone, Cylon.Adaptor);

var PINS = {
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
  "P9_31": 110
};

var PWM_PINS = {
  "P9_14": 'P9_14',
  "P9_21": 'P9_21',
  "P9_22": 'P9_22',
  "P9_29": 'P9_29',
  "P9_42": 'P9_42',
  "P8_13": 'P8_13',
  "P8_34": 'P8_34',
  "P8_45": 'P8_45',
  "P8_46": 'P8_46'
};

var ANALOG_PINS = {
  "P9_39": "AIN0",
  "P9_40": "AIN1",
  "P9_37": "AIN2",
  "P9_38": "AIN3",
  "P9_33": "AIN4",
  "P8_36": "AIN5",
  "P8_35": "AIN6"
};

var I2C_INTERFACE = '/dev/i2c-1';

var DEFAULT_FREQ = 2000;

Beaglebone.prototype.commands = [
  'pins', 'analogRead', 'digitalRead', 'digitalWrite', 'pwmWrite',
  'servoWrite', 'firmwareName', 'i2cWrite', 'i2cRead'
];

/**
 * Connects to the Beaglebone
 *
 * @param {Function} callback to be triggered when connected
 * @return {null}
 */
Beaglebone.prototype.connect = function(callback) {
  callback();
};

/**
 * Disconnects from the Beaglebone and it's pins
 *
 * @param {Function} callback to be triggered when disconnected
 * @return {null}
 */
Beaglebone.prototype.disconnect = function(callback) {
  Cylon.Logger.debug("Disconnecting all pins...");
  this._disconnectPins();
  Cylon.Logger.debug("Disconnecting from board '" + this.name + "'...");
  this.emit('disconnect');

  callback();
};

/**
 * Returns the Beaglebone's firmware name
 *
 * @return {String} the firmware name
 */
Beaglebone.prototype.firmwareName = function() {
  return 'Beaglebone';
};

/**
 * Reads values from an analog pin on the board.
 *
 * When values are read from the pin, emits then as (err, val) to the provided
 * callback.
 *
 * Also emits values through the "analogRead" event.
 *
 * @param {Number} pinNum the analog pin to read from
 * @param {Function} callback a function to be triggered when a value is read
 * @return {null}
 * @publish
 */
Beaglebone.prototype.analogRead = function(pinNum, drCallback) {
  var pin;
  pin = this.pins[this._translateAnalogPin(pinNum)];
  if (pin == null) {
    pin = this._analogPin(pinNum);

    pin.on('analogRead', function(val) {
      this.emit('analogRead', val);
      drCallback(null, val);
    }.bind(this));

    pin.on('connect', function() {
      pin.analogRead();
    });

    pin.connect();
  }
  return true;
};

/**
 * Reads values from a digital pin on the board.
 *
 * When values are read from the pin, emits then as (err, val) to the provided
 * callback.
 *
 * Also emits values through the "digitalRead" event.
 *
 * @param {Number} pinNum the digital pin to read from
 * @param {Function} callback a function to be triggered when a value is read
 * @return {null}
 * @publish
 */
Beaglebone.prototype.digitalRead = function(pinNum, drCallback) {
  var pin;

  pin = this.pins[this._translatePin(pinNum)];

  if (pin == null) {
    pin = this._digitalPin(pinNum, 'r');

    pin.on('digitalRead', function(val) {
      this.emit('digitalRead', val);
      drCallback(null, val);
    }.bind(this));

    pin.on('connect', function() {
      pin.digitalRead(20);
    });

    pin.connect();
  }

  return true;
};

/**
 * Writes a value to a digital pin on the board.
 *
 * @param {Number} pinNum the digital pin to write to
 * @param {Number} value the value to be written to the pin
 * @return {null}
 * @publish
 */
Beaglebone.prototype.digitalWrite = function(pinNum, value) {
  var pin;

  pin = this.pins[this._translatePin(pinNum)];

  if (pin != null) {
    pin.digitalWrite(value);
  } else {
    pin = this._digitalPin(pinNum, 'w');

    pin.on('digitalWrite', function(val) {
      this.emit('digitalWrite', val);
    }.bind(this));

    pin.on('connect', function() {
      pin.digitalWrite(value);
    });

    pin.connect();
  }

  return value;
};

Beaglebone.prototype._pwmWrite = function(pinNum, period, duty, eventName) {
  var pin;

  pin = this._pwmPin(pinNum, period);

  if (pin.connected) {
    pin.pwmWrite(duty);
  } else {

    pin.on('pwmWrite', function() {
      this.emit(eventName + 'Write');
    }.bind(this));

    pin.on('connect', function() {
      this.emit(eventName + 'Connect');
      pin.pwmWrite(duty);
    }.bind(this));

    pin.connect();
  }
};

/**
 * Writes a PWM value to a pin on the board.
 *
 * @param {Number} pinNum the pin to write to
 * @param {Number} scaledDuty the scaled PWM duty to use
 * @param {Number} freq the frequency to use
 * @param {Number} pulseWidth the pulse width to use
 * @param {String} eventName
 * @return {null}
 * @publish
 */
Beaglebone.prototype.pwmWrite = function(pinNum, scaledDuty, freq, pulseWidth, eventName) {
  freq = freq || DEFAULT_FREQ;

  var pwm = Cylon.IO.Utils.periodAndDuty(scaledDuty, freq, pulseWidth, 'low');

  eventName = eventName || 'pwm';

  this._pwmWrite(pinNum, pwm.period, pwm.duty, eventName);
};

/**
 * Writes a Servo value to a pin on the board.
 *
 * @param {Number} pinNum the pin to write to
 * @param {Number} scaledDuty the scaled PWM duty to use
 * @param {Number} freq the frequency to use
 * @param {Number} pulseWidth the pulse width to use
 * @return {null}
 * @publish
 */
Beaglebone.prototype.servoWrite = function(pinNum, scaledDuty, freq, pulseWidth) {
  arguments.push('servo');

  this.pwmWrite.apply(this, arguments);
};

/**
 * Writes an I2C value to the board.
 *
 * @param {Number} address I2C address to write to
 * @param {Number} cmd I2C command to write
 * @param {Array} buff buffered data to write
 * @param {Function} callback
 * @return {null}
 * @publish
 */
Beaglebone.prototype.i2cWrite = function(address, cmd, buff, callback) {
  buff = buff != null ? buff : [];

  if('function' !== typeof(callback)) {
    callback = function(err, data) { return { err: err, data: data  }; };
  }

  this._i2cDevice(address).write(cmd, buff, callback);
};

/**
 * Reads an I2C value from the board.
 *
 * @param {Number} address I2C address to write to
 * @param {Number} cmd I2C command to write
 * @param {Number} length amount of data to read
 * @param {Function} callback
 * @return {null}
 * @publish
 */
Beaglebone.prototype.i2cRead = function(address, cmd, length, callback) {
  if('function' !== typeof(callback)) {
    callback = function(err, data) { return { err: err, data: data  }; };
  }

  this._i2cDevice(address).read(cmd, length, callback);
};

Beaglebone.prototype._i2cDevice = function(address) {
  if (this.i2cDevices[address] == null) {
    this.i2cDevices[address] = new I2CDevice({
      address: address,
      "interface": I2C_INTERFACE
    });
  }
  return this.i2cDevices[address];
};

Beaglebone.prototype._pwmPin = function(pinNum, period) {
  var pin, gpioPinNum;

  gpioPinNum = this._translatePwmPin(pinNum);
  pin = this.pwmPins[gpioPinNum];

  if (pin == null) {
    pin = this.pwmPins[gpioPinNum] = new PwmPin({
      pin: gpioPinNum,
      period: period
    });
  }

  return pin;
};

Beaglebone.prototype._analogPin = function(pinNum) {
  var gpioPinNum, size;
  gpioPinNum = this._translateAnalogPin(pinNum);
  if (this.analogPins[gpioPinNum] == null) {
    size = Object.keys(this.analogPins).length;
    this.analogPins[gpioPinNum] = new AnalogPin({
      pin: gpioPinNum
    });
  }
  return this.analogPins[gpioPinNum];
};

Beaglebone.prototype._digitalPin = function(pinNum, mode) {
  var gpioPinNum;
  gpioPinNum = this._translatePin(pinNum);
  if (this.pins[gpioPinNum] == null) {
    this.pins[gpioPinNum] = new Cylon.IO.DigitalPin({
      pin: gpioPinNum,
      mode: mode
    });
  }
  return this.pins[gpioPinNum];
};

Beaglebone.prototype._translatePin = function(pinNum) {
  return PINS[pinNum];
};

Beaglebone.prototype._translatePwmPin = function(pinNum) {
  return PWM_PINS[pinNum];
};
Beaglebone.prototype._translateAnalogPin = function(pinNum) {
  return ANALOG_PINS[pinNum];
};

Beaglebone.prototype._disconnectPins = function() {
  var key, pin, _ref, _results;

  _results = [];
  _ref = this.pins;

  for (key in _ref) {
    pin = _ref[key];
    _results.push(pin.closeSync());
  }

  _ref = this.pwmPins;

  for (key in _ref) {
    pin = _ref[key];
    _results.push(pin.closeSync());
  }
  return _results;
};
