"use strict";
var fluid = require("infusion");

// Register our content so that it can be referenced in other packages using `fluid.module.resolvePath("%gpii-live-solutions-registry/path/to/content")`
fluid.module.register("gpii-live-solutions-registry", __dirname, require);
