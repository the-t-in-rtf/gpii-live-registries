"use strict";
var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");

fluid.registerNamespace("gpii.test.lsr");

/**
 *
 * Load the options in a given directory and confirm that we can succesfully instantiate each of the components.
 *
 * @param rootDir {String} - The path to the root directory to scan.
 * @returns {Promise} - A promise that will be resolved once the options have passed all checks, or that will be rejected if there are errors.
 *
 */
gpii.test.lsr.checkOptions = function (rootDir) {
    var outerPromise = fluid.promise();

    var loaderPromise = gpii.lsr.optionsLoader.loadAllOptions(rootDir);

    loaderPromise.then(
        function () {
            var gradeNamePromise = gpii.test.lsr.getExpectedGradeNames(rootDir);
            gradeNamePromise.then(
                function (expectedGradeNames)  {
                    if (gpii.test.lsr.hasDuplicatedGrades(expectedGradeNames)) {
                        outerPromise.reject("There is at least one duplicated gradeName.  Please check your options hierarchy to ensure that no directory contains the same filename with both the .json and .json5 extensions.");
                    }
                    else {
                        var promises = [];
                        fluid.each(expectedGradeNames, function (expectedGradeName) {
                            promises.push(function () {
                                var gradePromise = fluid.promise();
                                try {
                                    fluid.invokeGlobalFunction(expectedGradeName);
                                    gradePromise.resolve();
                                }
                                catch (error) {
                                    gradePromise.reject(error.message || error);
                                }
                                return gradePromise;
                            });
                        });

                        var sequence = fluid.promise.sequence(promises);
                        sequence.then(outerPromise.resolve, outerPromise.reject);
                    }
                }
            );
        },
        outerPromise.reject
    );

    return outerPromise;
};

/**
 *
 * Compile a list of grade names based on a hierarchy of subdirectories and options files.
 *
 * @param rootDir
 * @return {*|{type, expressions}}
 */
gpii.test.lsr.getExpectedGradeNames = function (rootDir) {
    var resolvedRootDir = fluid.module.resolvePath(rootDir);
    var paths = gpii.lsr.optionsLoader.getPathsFromDir(resolvedRootDir);

    var promises = [];
    fluid.each(paths, function (singlePath) {
        promises.push(function () {
            return gpii.lsr.optionsLoader.gradeNameFromPath(resolvedRootDir, singlePath);
        });
    });

    return fluid.promise.sequence(promises);
};

/**
 *
 * It is possible for gradeNames to collide if `filename.json` and `filename.json5` are found in the same directory.
 * This function checks for that as part of our standard sanity checks.
 *
 * @param gradeNames {Array} - An array of (string) gradeNames;
 * @returns {Boolean} - `true` if there are duplicates, `false` otherwise.
 */
gpii.test.lsr.hasDuplicatedGrades = function (gradeNames) {
    var gradeNamesAsHash = fluid.arrayToHash(gradeNames);
    return Object.keys(gradeNamesAsHash).length < gradeNames.length;
};


fluid.registerNamespace("gpii.tests.lsr");

gpii.tests.lsr.generateExpectedResultHandler = function (jqUnit, message, pattern) {
    return function (result) {
        jqUnit.start();
        jqUnit.assert(message + " (the promise reached the expected outcome)");
        if (pattern) {
            jqUnit.assertNotNull(message + " (the promise results were as expected)", result.match(pattern));
        }
    };
};

gpii.tests.lsr.generateUnexpectedResultHandler = function (jqUnit, message) {
    return function (result) {
        jqUnit.start();
        jqUnit.fail([message, result].join("\n"));
    };
};

gpii.tests.lsr.failOnUnexpectedSuccess = function (jqUnit) { return gpii.tests.lsr.generateUnexpectedResultHandler(jqUnit, "The promise should not have been resolved.");};
gpii.tests.lsr.failOnUnexpectedFailure = function (jqUnit) { return gpii.tests.lsr.generateUnexpectedResultHandler(jqUnit, "The promise should not have been rejected."); };
