/*

    Unit tests for the options loader provided by this package.

 */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

var path  = require("path");

fluid.require("%gpii-live-solutions-registry");
gpii.lsr.loadTestingSupport();

var jqUnit = require("node-jqUnit");

jqUnit.module("Unit tests for options loader...");

jqUnit.test("We should be able to find paths to JSON files in a valid directory...", function () {
    var resolvedRootDir = fluid.module.resolvePath("%gpii-live-solutions-registry/tests/data/loaderDirs/valid");
    var expectedDirs = fluid.transform(["root.json", "subdir/base.json"], function (relativePath) { return path.resolve(resolvedRootDir, relativePath);});

    var paths = gpii.lsr.optionsLoader.getPathsFromDir(resolvedRootDir);
    jqUnit.assertDeepEq("The paths should be as expected", expectedDirs, paths.sort());
});

jqUnit.test("We should be able to load options from JSON files in a valid directory...", function () {
    var resolvedRootDir = fluid.module.resolvePath("%gpii-live-solutions-registry/tests/data/loaderDirs/valid");

    gpii.lsr.optionsLoader.loadAllOptions(resolvedRootDir);

    var rootDefaults = fluid.defaults("root");
    jqUnit.assertLeftHand("The root grade's options should be as expected...", { rootOption: true}, rootDefaults);

    var derivedDefaults = fluid.defaults("subdir.base");
    jqUnit.assertLeftHand("The child grade's options should be as expected...", { rootOption: true, childOption: true}, derivedDefaults);

    // Attempt to create the two grades to confirm that they are complete enough to be at least constructed.
    // TODO: Discuss a more contained way of testing component creation with Antranig.
    fluid.invokeGlobalFunction("root");
    fluid.invokeGlobalFunction("subdir.base");
});

jqUnit.test("Options loading should require a root directory...", function () {
    var failingFunction = function () {
        gpii.lsr.optionsLoader.loadAllOptions();
    };

    jqUnit.expectFrameworkDiagnostic("An error should be thrown...", failingFunction, "must specify the location");
});

jqUnit.test("An error should be thrown if we try to load options from a non-existent directory...", function () {
    var resolvedRootDir = fluid.module.resolvePath("%gpii-live-solutions-registry/missing");

    var failingFunction = function () {
        gpii.lsr.optionsLoader.loadAllOptions(resolvedRootDir);
    };

    jqUnit.expectFrameworkDiagnostic("An error should be thrown...", failingFunction, "does not exist");
});

jqUnit.test("An error should be thrown if we try to load invalid options files...", function () {
    var resolvedRootDir = fluid.module.resolvePath("%gpii-live-solutions-registry/tests/data/loaderDirs/invalidOptionsFile");

    var failingFunction = function () {
        gpii.lsr.optionsLoader.loadAllOptions(resolvedRootDir);
    };

    jqUnit.expectFrameworkDiagnostic("An error should be thrown...", failingFunction, "Unexpected token");
});

jqUnit.test("An error should be thrown if we try to load a hierarchy with an invalid directory name...", function () {
    var resolvedRootDir = fluid.module.resolvePath("%gpii-live-solutions-registry/tests/data/loaderDirs/invalidDirname");

    var failingFunction = function () {
        gpii.lsr.optionsLoader.loadAllOptions(resolvedRootDir);
    };

    jqUnit.expectFrameworkDiagnostic("An error should be thrown...", failingFunction, "Invalid directory name");
});

jqUnit.test("An error should be thrown if we try to load a hierarchy with an invalid file name...", function () {
    var resolvedRootDir = fluid.module.resolvePath("%gpii-live-solutions-registry/tests/data/loaderDirs/invalidFilename");

    var failingFunction = function () {
        gpii.lsr.optionsLoader.loadAllOptions(resolvedRootDir);
    };

    jqUnit.expectFrameworkDiagnostic("An error should be thrown...", failingFunction, "Invalid file name");
});


jqUnit.test("We should be able to confirm if there are any incomplete options files in a given hierarchy...", function () {
    var failingFunction = function () {
        gpii.test.lsr.checkOptions("%gpii-live-solutions-registry/tests/data/loaderDirs/missingGradeNames");
    };

    jqUnit.expectFrameworkDiagnostic("An error should be thrown...", failingFunction, "does not have an initFunction defined");
});
