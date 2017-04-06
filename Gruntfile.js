/* global module */
"use strict";
module.exports = function (grunt) {
    grunt.initConfig({
        eslint: {
            src: ["./src/**/*.js", "./tests/**/*.js", "./*.js"]
        },
        jsonlint: {
            // The double syntax for the tests is required because we intentionally have an invalid JSON file.
            src: ["src/**/*.json", "./*.json", "data/**/*.json", "tests/!(data)/**/*.json", "tests/data/loaderDirs/!(invalidOptionsFile)/**/*.json"]
        },
        json5lint: {
            options: {
                enableJSON5: true
            },
            src: ["data/**/*.json5", "tests/**/*.json5", "*.json5"]
        }
    });


    grunt.loadNpmTasks("fluid-grunt-eslint");
    grunt.loadNpmTasks("grunt-jsonlint");
    grunt.loadNpmTasks("fluid-grunt-json5lint");

    grunt.registerTask("lint", "Apply jshint, jsonlint and json5lint", ["eslint", "jsonlint", "json5lint"]);
};
