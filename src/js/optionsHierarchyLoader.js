/*

   Static functions and Fluid components to read in a hierarchy of subdirectories containing options files in
   JSON format, and register them as distinct namespaced grades using `fluid.defaults`.

 */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

var fs    = require("fs");
var path  = require("path");

fluid.registerNamespace("gpii.lsr.optionsLoader");

/**
 *
 * Search for options files in a starting path, including all subdirectories.  Create namespaced component grades for
 * all paths discovered.
 *
 * @param rootDir {String} - The starting directory, expressed as either a relative path, a full path, or a package-relative path such as `%package-name/path/to/dir`.
 *
 */
gpii.lsr.optionsLoader.loadAllOptions = function (rootDir) {
    if (!rootDir) {
        fluid.fail("You must specify the location of the root directory containing one or more options files.");
    }
    else {
        var resolvedPath = fluid.module.resolvePath(rootDir);

        if (fs.existsSync(resolvedPath)) {
            var optionsFilePaths = gpii.lsr.optionsLoader.getPathsFromDir(resolvedPath);
            gpii.lsr.optionsLoader.loadOptionsFromPaths(resolvedPath, optionsFilePaths);
        }
        else {
            fluid.fail("The specified root directory does not exist...");
        }
    }
};

/**
 *
 * Search `singlePath` for JSON/JSON5 files and return an array containing their paths relative to singlePath.  This
 * function calls itself recursively on any directories it encounters.
 *
 * @param singlePath {String} - The relative path to a directory we wish to scan for JSON files.
 * @returns {Array} - An array of relative paths to JSON files found in `singlePath` or its subdirectories.
 */
gpii.lsr.optionsLoader.getPathsFromDir = function (singlePath) {
    var files = fs.readdirSync(singlePath);
    var filteredPaths = [];
    fluid.each(files, function (file) {
        var subPath = path.resolve(singlePath, file);
        var stats = fs.statSync(subPath);
        if (stats.isDirectory()) {
            var subdirPaths = gpii.lsr.optionsLoader.getPathsFromDir(subPath);
            if (subdirPaths && subdirPaths.length > 0) {
                filteredPaths = filteredPaths.concat(subdirPaths);
            }
        }
        else if (file.match(/.json$/i)) {
            filteredPaths.push(subPath);
        }
        else {
            fluid.log("Skipping non-JSON file '", subPath, "'...");
        }
    });

    return filteredPaths;
};

/**
 *
 * Register a namespaced grade and default options for one or more relative paths to a JSON option file.
 *
 * @param rootDir {String} - The full path to the "root directory", which will be excluded from the gradeName.
 * @param {Array} - An array of paths to JSON options files.
 */
gpii.lsr.optionsLoader.loadOptionsFromPaths = function (rootDir, paths) {
    fluid.each(paths, function (singlePath) {
        var gradeName = gpii.lsr.optionsLoader.gradeNameFromPath(rootDir, singlePath);
        try {
            var options = require(singlePath);
            fluid.defaults(gradeName, options);
        }
        catch (error) {
            fluid.fail(error.message || error);
        }
    });
};

/**
 *
 * Return a component grade namespace based on a given path and filename.  Throws an error if any part of the path
 * contains an illegal character (spaces, colons, semicolons, dots).
 *
 * @param rootDir {String} - The full path to the "root directory", which will be excluded from the gradeName.
 * @param filePath {String} - The relative path to the individual file we are concerned with at the moment.
 * @return {String} - A gradename based on the path and filename (minus extension), for example `path.to.myFile`.
 */
gpii.lsr.optionsLoader.gradeNameFromPath = function (rootDir, filePath) {
    var relativePath = path.relative(rootDir, filePath);

    var legalCharsRegexp = /^[A-Za-z0-9]+$/;

    var pathSegments = relativePath.split(path.sep);
    var dirSegments = pathSegments.slice(0, pathSegments.length - 1);
    var fileSegment = pathSegments[pathSegments.length - 1];
    var fileSegmentMinusExtension = fileSegment.replace(/.json$/i, "");

    if (!fileSegmentMinusExtension.match(legalCharsRegexp)) {
        fluid.fail("Invalid file name '" + fileSegment + "'...");
    }

    fluid.each(dirSegments, function (dirSegment) {
        if (!dirSegment.match(legalCharsRegexp)) {
            fluid.fail("Invalid directory name '" + dirSegment + "'...");
        }
    });

    if (dirSegments.length) {
        var baseNamespace = dirSegments.join(".");
        return [baseNamespace, fileSegmentMinusExtension].join(".");
    }
    else {
        return fileSegmentMinusExtension;
    }
};
