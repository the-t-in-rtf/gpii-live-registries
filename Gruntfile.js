/* global module */
module.exports = function (grunt) {
    "use strict";
    grunt.initConfig({
        eslint: {
            src: ["./src/**/*.js", "./tests/**/*.js", "./*.js"]
        },
        jsonlint: {
            src: ["src/**/*.json", "tests/**/*.json", "./*.json"]
        }
    });

    grunt.loadNpmTasks("fluid-grunt-eslint");
    grunt.loadNpmTasks("grunt-jsonlint");

    grunt.registerTask("lint", "Apply jshint and jsonlint", ["eslint", "jsonlint"]);
};
