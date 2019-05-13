"use strict";
var fluid = require("infusion");
var my = fluid.registerNamespace("my");

require("./nesting-using-ioc");

fluid.registerNamespace("my.schemaGenerator");

my.schemaGenerator.generateIfNeeded = function (that) {
    return that.generatedSchema ? fluid.toPromise(that.generatedSchema) : that.generateSchema();
};

my.schemaGenerator.cacheSchema = function (that, schema) {
    that.generatedSchema = schema;
    return schema;
};

fluid.defaults("my.schemaGenerator", {
    gradeNames: ["my.schemaHolder"],
    events: {
        getSchema: null,
        generateSchema: null
    },
    members: {
        generatedSchema: false
    },
    schema: {
        properties: {
            wanted: { type: "string"},
            unwanted: { type: "boolean"}
        }
    },
    invokers: {
        getSchema: {
            funcName: "my.schemaGenerator.generateIfNeeded",
            args: ["{that}"]
        },
        generateSchema: {
            funcName: "fluid.promise.fireTransformEvent",
            args: ["{that}.events.generateSchema"]
        }
    },
    listeners: {
        "generateSchema.getOptions": {
            priority: "first",
            funcName: "fluid.identity",
            args: ["{that}.options.schema"]
        },
        "generateSchema.cacheSchema": {
            priority: "last",
            funcName: "my.schemaGenerator.cacheSchema",
            args: ["{that}", "{arguments}.0"]
        }
    }
});



fluid.defaults("my.filtering.schemaGenerator", {
    gradeNames: ["my.schemaGenerator"],
    transforms: {
        purgeUnwanted: {
            "": "",
            properties: {
                "": "properties",
                "unwanted": {
                    transform: {
                        type: "fluid.transforms.delete"
                    }
                }
            }
        }
    },
    listeners: {
        "getSchema.purgeUnwanted": {
            priority: "after:getOptions",
            funcName: "fluid.model.transformWithRules",
            args: ["{arguments}.0", "{that}.options.transforms.purgeUnwanted"] // source, rules
        }
    }
});

var component = my.filtering.schemaGenerator();

var start = Date.now();
component.getSchema().then(
    function (generatedSchema) {
        var postFirstPass = Date.now() - start;
        console.log("Generated schema in " + postFirstPass + " ms:\n" + JSON.stringify(generatedSchema, null, 2));

        var preSecondPass = Date.now();
        component.getSchema().then(
            function () {
                var secondPass = Date.now() - preSecondPass;
                console.log("Retrieved cached schema in " + secondPass + " ms.");
            }
        );
    }
);



