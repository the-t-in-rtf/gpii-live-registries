/*

   Static functions and Fluid components to read in a hierarchy of subdirectories containing options files in
   JSON format, and register them as distinct namespaced grades using `fluid.defaults`.

 */
"use strict";
var fluid  = require("infusion");
var gpii   = fluid.registerNamespace("gpii");

var fs     = require("fs");
var path   = require("path");

var kettle = fluid.require("%kettle");

fluid.registerNamespace("gpii.lsr.optionsLoader");

/**
 *
 * Search for options files in a starting path, including all subdirectories.  Create namespaced component grades for
 * all paths discovered.
 *
 * @param rootDir {String} - The starting directory, expressed as either a relative path, a full path, or a package-relative path such as `%package-name/path/to/dir`.
 * @returns {Promise} - A promise that will be resolved once all options are loaded, or rejected if there are errors.
 */
gpii.lsr.optionsLoader.loadAllOptions = function (rootDir) {
    var promise = fluid.promise();

    if (!rootDir) {
        promise.reject("You must specify the location of the root directory containing one or more options files.");
    }
    else {
        var resolvedPath = fluid.module.resolvePath(rootDir);

        if (fs.existsSync(resolvedPath)) {
            var optionsFilePaths = gpii.lsr.optionsLoader.getPathsFromDir(resolvedPath);
            var optionsLoadPromise = gpii.lsr.optionsLoader.loadOptionsFromPaths(resolvedPath, optionsFilePaths);
            optionsLoadPromise.then(promise.resolve, promise.reject);
        }
        else {
            promise.reject("The specified root directory does not exist...");
        }
    }

    return promise;
};

/**
 *
 * Search `singlePath` for JSON files and return an array containing their paths relative to singlePath.  This
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
        else if (file.match(/.json5?$/i)) {
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
    var promises = [];
    fluid.each(paths, function (singlePath) {
        promises.push(function () {
            var readPromise = kettle.JSON.readFileSync(singlePath, "Unable to read file '" + singlePath + "'.");
            var instantiatePromise = fluid.promise();
            readPromise.then(
                function (options) {
                    var gradeNamePromise = gpii.lsr.optionsLoader.gradeNameFromPath(rootDir, singlePath);
                    gradeNamePromise.then(
                        function (gradeName) {
                            fluid.defaults(gradeName, options);
                            instantiatePromise.resolve();
                        },
                        instantiatePromise.reject
                    );
                },
                function (error)  { instantiatePromise.reject(error.message || error); });
            return instantiatePromise;
        });
    });

    var sequence = fluid.promise.sequence(promises);
    return sequence;
};

/**
 *
 * A function to collapse duplicated segments in two arrays of segments.
 *
 * @param leadingSegments {Array} - The array of segments that will form the first part of the combined array.
 * @param trailingSegments {Array} - The array of segments that will form the second part of the combined array.
 * @returns {Array} - An array with all of the unique segments, in order.
 *
 */
gpii.lsr.optionsLoader.concatUniqueSegments = function (leadingSegments, trailingSegments) {
    var trailingSegmentsToSkip = 0;

    var matchingLeadingIndices = [];
    fluid.each(leadingSegments, function (leadingSegment, index) {
        if (leadingSegment === trailingSegments[0]) {
            matchingLeadingIndices.push(index);
        }
    });

    // [0,1,2] + [1,2,3] = [0,1,2,3]
    // [0,1,2] + [2,3,4] = [0,1,2,3,4]
    // [0,1,2] + [0,1,2] = [0,1,2]
    // [0,1,1] + [1,2,3] = [0,1,1,2,3]
    // [0,1,2,1] + [1,2,3] = [0,1,2,1,2,3]
    // [0,1,2,1,2] + [2] = [0,1,2,1,2]
    fluid.each(matchingLeadingIndices, function (index) {
        if (!trailingSegmentsToSkip) {
            var mismatchFound = false;
            for (var a = 0; a < leadingSegments.length - index; a++) {
                if (mismatchFound) {
                    if (leadingSegments[index + a] !== trailingSegments[a]) {
                        mismatchFound = true;
                    }
                }
            }
            if (!mismatchFound) {
                trailingSegmentsToSkip = leadingSegments.length - index;
            }
        }
    });

    return leadingSegments.concat(trailingSegments.slice(trailingSegmentsToSkip));
};

/**
 *
 * Return a component grade namespace based on a given path and filename.  For example, the path
 * `rootDir/path/to/filename.json` would return `path.to.filename`.
 *
 * Automatically removes namespace segments duplicated between the end of the path and the beginning of the filename.
 * For example:
 *
 * `rootDir/segment1/segment2/segment1.segment2.json` => `segment1.segment2
 * `rootDir/segment1/segment2/segment3/segment2.segment3.json` => `segment1.segment2.segment3`.
 *
 * Throws an error if any part of the path contains an illegal character (spaces, colons, semicolons, dots).
 *
 * @param rootDir {String} - The full path to the "root directory", which will be excluded from the gradeName.
 * @param filePath {String} - The relative path to the individual file we are concerned with at the moment.
 * @return {Promise} - A promise that will either be resolved with a gradename based on the path and filename (minus extension), for example `path.to.myFile`, or rejected if an error occurs.
 *
 */
gpii.lsr.optionsLoader.gradeNameFromPath = function (rootDir, filePath) {
    var promise = fluid.promise();

    var relativePath = path.relative(rootDir, filePath);

    var legalCharsRegexp = /^[A-Za-z0-9\.]+$/;

    var pathSegments = relativePath.split(path.sep);
    var dirSegments = pathSegments.slice(0, pathSegments.length - 1);
    var fileSegment = pathSegments[pathSegments.length - 1];
    var fileSegmentMinusExtension = fileSegment.replace(/.json5?$/i, "");

    if (!fileSegmentMinusExtension.match(legalCharsRegexp)) {
        promise.reject("Invalid file name '" + fileSegment + "'...");
    }
    else {
        fluid.each(dirSegments, function (dirSegment) {
            if (!dirSegment.match(legalCharsRegexp)) {
                promise.reject("Invalid directory name '" + dirSegment + "'...");
            }
        });
    }

    // TODO: Discuss this synchronous use of a promise with Antranig.  I want the clarity of outcome and the ease of integration with the upstream promise chain, but this check feels a little icky.
    if (!promise.disposition) {
        if (dirSegments.length) {
            var fileSubSegments = fileSegmentMinusExtension.split(".");
            var combinedSegments = gpii.lsr.optionsLoader.concatUniqueSegments(dirSegments, fileSubSegments);
            promise.resolve(combinedSegments.join("."));
        }
        else {
            promise.resolve(fileSegmentMinusExtension);
        }
    }

    return promise;
};
