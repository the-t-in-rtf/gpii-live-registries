"use strict";
var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");

fluid.registerNamespace("gpii.test.lsr");

/**
 *
 * Load the options in a given directory and confirm that we can succesfully instantiate each of the components.  Calls
 * `fluid.fail` if there are errors instantiating an expected grade name based on the given directory structure.
 *
 */
gpii.test.lsr.checkOptions = function (rootDir) {
    gpii.lsr.optionsLoader.loadAllOptions(rootDir);

    var expectedGradeNames = gpii.test.lsr.getExpectedGradeNames(rootDir);
    fluid.each(expectedGradeNames, function (expectedGradeName) {
        try {
            fluid.invokeGlobalFunction(expectedGradeName);
        }
        catch (error) {
            fluid.fail("The grade '" + expectedGradeName + "' could not be instantiated:\n" + (error.message || error));
        }
    });
};

gpii.test.lsr.getExpectedGradeNames = function (rootDir) {
    var resolvedRootDir = fluid.module.resolvePath(rootDir);
    var paths = gpii.lsr.optionsLoader.getPathsFromDir(resolvedRootDir);

    var gradeNames = fluid.transform(paths, function (singlePath) {
        return gpii.lsr.optionsLoader.gradeNameFromPath(resolvedRootDir, singlePath);
    });

    return gradeNames;
};
