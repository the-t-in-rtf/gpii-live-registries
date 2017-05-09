/*

    Validate a file based on a schema Key and our corpus of schemas.

 */
"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

var gpii  = fluid.registerNamespace("gpii");

var fs = require("fs");

require("../../");
fluid.require("gpii-json-schema");
fluid.require("gpii-launcher");

fluid.registerNamespace("gpii.lsr.validator");

gpii.lsr.validator.validateFile = function (that, schemaKey, toValidate) {
    var resolvedFilePath  = fluid.module.resolvePath(toValidate);
    var contentToValidate = fs.readFileSync(resolvedFilePath);
    var validationErrors  = that.validate(schemaKey, contentToValidate);

    if (validationErrors) {
        fluid.log("Validation Errors:", JSON.stringify(validationErrors, null, 2));
    }
    else {
        fluid.log("No validation errors...");
    }
};

fluid.defaults("gpii.lsr.validator", {
    gradeNames: ["gpii.schema.validator.ajv.server"],
    schemaDirs: "%gpii-live-registries/src/schemas",
    listeners: {
        "onCreate.validateFile": {
            funcName: "gpii.lsr.validator.validateFile",
            args: ["{that}", "{that}.options.schemaKey", "{that}.options.inputFile"]
        }
    }
});

fluid.defaults("gpii.lsr.validator.launcher", {
    gradeNames: ["gpii.launcher"],
    yargsOptions: {
        describe: {
            "schemaKey": "The schema key (typically filename) to use to validate the document...",
            "inputFile": "The file to validate..."
        },
        demandOption: ["schemaKey", "inputFile"],
        defaults: {
            optionsFile: "%gpii-live-registries/configs/defaults.json"
        }
    }
});

gpii.lsr.validator.launcher();
