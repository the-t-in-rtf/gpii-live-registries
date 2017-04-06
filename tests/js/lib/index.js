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
