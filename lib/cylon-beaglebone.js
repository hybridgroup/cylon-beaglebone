/*
 * cylon-beaglebone
 * http://cylonjs.com
 *
 * Copyright (c) 2013-2014 The Hybrid Group
 * Licensed under the Apache 2.0 license.
*/

"use strict";

var Adaptor = require("./beaglebone");

module.exports = {
  adaptors: ["beaglebone"],
  dependencies: ["cylon-gpio", "cylon-i2c"],

  adaptor: function(args) {
    return new Adaptor(args);
  }
};
