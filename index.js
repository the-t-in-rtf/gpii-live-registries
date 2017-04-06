"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

// Register our content so that it can be referenced in other packages using `fluid.module.resolvePath("%gpii-live-solutions-registry/path/to/content")`
fluid.module.register("gpii-live-solutions-registry", __dirname, require);

require("./src/js/");

fluid.registerNamespace("gpii.lsr");
gpii.lsr.loadTestingSupport = function () {
    require("./tests/js/lib");
};

module.exports = gpii.lsr;
