"use strict";

var Adaptor = require("./lib/beaglebone");

module.exports = {
  adaptors: ["beaglebone"],
  dependencies: ["cylon-gpio", "cylon-i2c"],

  adaptor: function(args) {
    return new Adaptor(args);
  }
};
