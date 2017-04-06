/*

    Test the integrity of the "live" solutions data in this package.

 */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

fluid.require("%gpii-live-solutions-registry");
gpii.lsr.loadTestingSupport();

var jqUnit = require("node-jqUnit");

jqUnit.module("Data integrity checks for live data...");

jqUnit.test("The solutions and settings data should be valid and usable...", function () {
    gpii.test.lsr.checkOptions("%gpii-live-solutions-registry/data");

    jqUnit.assert("There should be no errors...");
});
