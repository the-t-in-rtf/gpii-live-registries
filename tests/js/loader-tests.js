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

jqUnit.test("We should be able to handle duplicated path segments...", function () {
    var testMatrix = [
        {
            message:          "Single duplicates should be removed...",
            leadingSegments:  [0,1,2],
            trailingSegments: [2,3,4],
            expected:         [0,1,2,3,4]
        },
        {
            message:          "Adjoining duplicates should be removed...",
            leadingSegments:  [0,1,2],
            trailingSegments: [1,2,3],
            expected:         [0,1,2,3]
        },
        {
            message:          "Segments without duplicates should be concatenated...",
            leadingSegments:  [1,2],
            trailingSegments: [3,4],
            expected:         [1,2,3,4]
        },
        {
            message:          "Completely duplicated groups of segments should be collapsed completely...",
            leadingSegments:  [0,1,2],
            trailingSegments: [0,1,2],
            expected:         [0,1,2]
        },
        {
            message:          "In repeating patterns, the longest set of duplicates should be removed...",
            leadingSegments:  [0,1,2,1],
            trailingSegments: [1,2,1,3],
            expected:         [0,1,2,1,3]
        }
    ];
    jqUnit.expect(testMatrix.length);
    fluid.each(testMatrix, function (singleTestDef) {
        var result = gpii.lsr.optionsLoader.concatUniqueSegments(singleTestDef.leadingSegments, singleTestDef.trailingSegments);
        jqUnit.assertDeepEq(singleTestDef.message, singleTestDef.expected, result);
    });
});

jqUnit.test("We should be able to resolve grade names from paths...", function () {
    var testMatrix = [
        {
            message: "The root path should be stripped from the file path...",
            rootDir: "root",
            filePath: "root/path/to/filename.json",
            expected: "path.to.filename"
        },
        {
            message:  "We should be able to work with JSON5 files as well...",
            rootDir:  "root",
            filePath: "root/path/to/filename.json5",
            expected: "path.to.filename"
        },
        {
            message:  "Duplicate information between the path and filename should be removed...",
            rootDir:  "root",
            filePath: "root/one/two/three/one.two.three.json",
            expected: "one.two.three"
        }
    ];
    jqUnit.expect(testMatrix.length);
    fluid.each(testMatrix, function (singleTestDef) {
        gpii.lsr.optionsLoader.gradeNameFromPath(singleTestDef.rootDir, singleTestDef.filePath).then(
            function (result) { jqUnit.assertEquals(singleTestDef.message, singleTestDef.expected, result); },
            function (error) { jqUnit.fail(error); }
        );
    });
});


jqUnit.test("We should be able to find paths to JSON files in a valid directory...", function () {
    var resolvedRootDir = fluid.module.resolvePath("%gpii-live-solutions-registry/tests/data/loaderDirs/valid");
    var expectedDirs = fluid.transform(["root.json", "subdir/base.json"], function (relativePath) { return path.resolve(resolvedRootDir, relativePath);});

    var paths = gpii.lsr.optionsLoader.getPathsFromDir(resolvedRootDir);
    jqUnit.assertDeepEq("The paths should be as expected", expectedDirs, paths.sort());
});

jqUnit.asyncTest("We should be able to load options from JSON files in a valid directory...", function () {
    var resolvedRootDir = fluid.module.resolvePath("%gpii-live-solutions-registry/tests/data/loaderDirs/valid");

    gpii.lsr.optionsLoader.loadAllOptions(resolvedRootDir).then(
        function () {
            jqUnit.start();
            var rootDefaults = fluid.defaults("root");
            jqUnit.assertLeftHand("The root grade's options should be as expected...", { rootOption: true}, rootDefaults);

            var derivedDefaults = fluid.defaults("subdir.base");
            jqUnit.assertLeftHand("The child grade's options should be as expected...", { rootOption: true, childOption: true}, derivedDefaults);

            // Attempt to create the two grades to confirm that they are complete enough to be at least constructed.
            // TODO: Discuss a more contained way of testing component creation with Antranig.
            fluid.invokeGlobalFunction("root");
            fluid.invokeGlobalFunction("subdir.base");
        },
        gpii.tests.lsr.failOnUnexpectedFailure(jqUnit)
    );
});

jqUnit.asyncTest("Options loading should require a root directory...", function () {
    jqUnit.expect(2);
    gpii.lsr.optionsLoader.loadAllOptions().then(
        gpii.tests.lsr.failOnUnexpectedSuccess(jqUnit),
        gpii.tests.lsr.generateExpectedResultHandler(jqUnit, "An error should be thrown...", "must specify the location")
    );
});

jqUnit.asyncTest("An error should be thrown if we try to load options from a non-existent directory...", function () {
    jqUnit.expect(2);
    var resolvedRootDir = fluid.module.resolvePath("%gpii-live-solutions-registry/missing");

    gpii.lsr.optionsLoader.loadAllOptions(resolvedRootDir).then(
        gpii.tests.lsr.failOnUnexpectedSuccess(jqUnit),
        gpii.tests.lsr.generateExpectedResultHandler(jqUnit, "An error should be thrown...", "does not exist")
    );
});

jqUnit.asyncTest("An error should be thrown if we try to load invalid options files...", function () {
    jqUnit.expect(2);
    var resolvedRootDir = fluid.module.resolvePath("%gpii-live-solutions-registry/tests/data/loaderDirs/invalidOptionsFile");

    gpii.lsr.optionsLoader.loadAllOptions(resolvedRootDir).then(
        gpii.tests.lsr.failOnUnexpectedSuccess(jqUnit),
        gpii.tests.lsr.generateExpectedResultHandler(jqUnit, "An error should be thrown...", "JSON parse error")
    );
});

jqUnit.asyncTest("An error should be thrown if we try to load a hierarchy with an invalid directory name...", function () {
    jqUnit.expect(2);
    var resolvedRootDir = fluid.module.resolvePath("%gpii-live-solutions-registry/tests/data/loaderDirs/invalidDirname");

    gpii.lsr.optionsLoader.loadAllOptions(resolvedRootDir).then(
        gpii.tests.lsr.failOnUnexpectedSuccess(jqUnit),
        gpii.tests.lsr.generateExpectedResultHandler(jqUnit, "An error should be thrown...", "Invalid directory name")
    );
});

jqUnit.asyncTest("An error should be thrown if we try to load a hierarchy with an invalid file name...", function () {
    jqUnit.expect(2);
    var resolvedRootDir = fluid.module.resolvePath("%gpii-live-solutions-registry/tests/data/loaderDirs/invalidFilename");

    gpii.lsr.optionsLoader.loadAllOptions(resolvedRootDir).then(
        gpii.tests.lsr.failOnUnexpectedSuccess(jqUnit),
        gpii.tests.lsr.generateExpectedResultHandler(jqUnit, "An error should be thrown...", "Invalid file name")
    );
});

jqUnit.asyncTest("A valid set of options should be should result in usable component grade definitions...", function () {
    jqUnit.expect(1);
    gpii.test.lsr.checkOptions("%gpii-live-solutions-registry/tests/data/loaderDirs/valid").then(
        gpii.tests.lsr.generateExpectedResultHandler(jqUnit, "The promise should be resolved..."),
        gpii.tests.lsr.failOnUnexpectedFailure(jqUnit)
    );
});

jqUnit.asyncTest("We should be able to confirm if there are any incomplete options files in a given hierarchy...", function () {
    jqUnit.expect(2);

    // Unhook the listener that turns fluid.fail calls into automatic test failures. Based on the approach used here:
    // https://github.com/fluid-project/infusion/blob/master/tests/test-core/jqUnit/js/jqUnit.js#L278
    // https://github.com/fluid-project/infusion/blob/master/tests/test-core/jqUnit/js/jqUnit.js#L39
    fluid.failureEvent.addListener(fluid.identity, "jqUnit");
    function removeListener() { fluid.failureEvent.removeListener("jqUnit"); }

    var checkPromise = gpii.test.lsr.checkOptions("%gpii-live-solutions-registry/tests/data/loaderDirs/missingGradeNames");
    checkPromise.then(
        gpii.tests.lsr.failOnUnexpectedSuccess(jqUnit),
        gpii.tests.lsr.generateExpectedResultHandler(jqUnit, "An error should be thrown...", "does not have an initFunction defined")
    );
    checkPromise.then(removeListener, removeListener);
});

jqUnit.asyncTest("We should be able to detect duplicates caused by files with the same name and different extensions...", function () {
    jqUnit.expect(2);

    var checkPromise = gpii.test.lsr.checkOptions("%gpii-live-solutions-registry/tests/data/loaderDirs/sameNameDifferentExtension");
    checkPromise.then(
        gpii.tests.lsr.failOnUnexpectedSuccess(jqUnit),
        gpii.tests.lsr.generateExpectedResultHandler(jqUnit, "There should be an error...", "duplicated gradeName")
    );
});

jqUnit.asyncTest("We should be able to detect duplicates caused by collisions between the directory structure and filename...", function () {
    jqUnit.expect(2);

    var checkPromise = gpii.test.lsr.checkOptions("%gpii-live-solutions-registry/tests/data/loaderDirs/dirAndFilenameCollision");
    checkPromise.then(
        gpii.tests.lsr.failOnUnexpectedSuccess(jqUnit),
        gpii.tests.lsr.generateExpectedResultHandler(jqUnit, "There should be an error...", "duplicated gradeName")
    );
});
