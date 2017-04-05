/* global module */
"use strict";
module.exports = function (grunt) {
    grunt.initConfig({
        eslint: {
            src: ["./src/**/*.js", "./tests/**/*.js", "./*.js"]
        },
        jsonlint: {
            // The double syntax for the tests is required because we intentionally have an invalid JSON file.
            src: ["src/**/*.json", "./*.json", "tests/!(data)/**/*.json", "tests/data/loaderDirs/!(invalidOptionsFile)/**/*.json"]
        }
    });

    grunt.loadNpmTasks("fluid-grunt-eslint");
    grunt.loadNpmTasks("grunt-jsonlint");

    grunt.registerTask("lint", "Apply jshint and jsonlint", ["eslint", "jsonlint"]);
};
