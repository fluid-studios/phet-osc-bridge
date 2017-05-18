/*
 * PhET-OSC Bridge Gruntfile
 * http://github.com/fluid-studios/phet-osc-bridge
 *
 * Copyright 2017, OCAD University
 * Licensed under the New BSD license.
 */

"use strict";

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        eslint: {
            all: [
                "src/**/*.js",
                "tests/**/*.js"
            ]
        },

        jsonlint: {
            all: [
                "src/**/*.json",
                "tests/**/*.json"
            ]
        },

    });

    grunt.loadNpmTasks("fluid-grunt-eslint");
    grunt.loadNpmTasks("grunt-jsonlint");

    grunt.registerTask("lint", "Apply ESLint and JSONLint", ["eslint", "jsonlint"]);
    grunt.registerTask("default", ["lint"]);
};
