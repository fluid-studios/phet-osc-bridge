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
                "./*.js",
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

        clean: {
            all: {
                src: ["dist/"]
            }
        },

        concat: {
            options: {
                separator: ";",
                banner: "<%= phetoscbridge.banners.short %>"
            },

            js: {
                src: [
                    "node_modules/infusion/dist/infusion-framework.js",
                    "node_modules/osc/dist/osc-browser.js",
                    "src/js/event-filter.js",
                    "src/js/phet-converter.js",
                    "src/js/port.js",
                    "src/js/sender.js",
                    "src/web/bridge.js"
                ],
                dest: "dist/phet-osc-bridge.js"
            }
        },

        uglify: {
            options: {
                banner: "<%= phetoscbridge.banners.short %>",
                beautify: {
                    ascii_only: true
                }
            },
            all: {
                files: [
                    {
                        expand: true,
                        cwd: "dist/",
                        src: ["*.js"],
                        dest: "dist/",
                        ext: ".min.js"
                    }
                ]
            }
        },

        phetoscbridge: {
            banners: {
                short: "/*! PhET OSC Bridge <%= pkg.version %>, " +
                    "Copyright <%= grunt.template.today('yyyy') %> OCAD University | " +
                    "github.com/fluid-studios/phet-osc-bridge */\n\n"
            }
        }
    });

    grunt.loadNpmTasks("fluid-grunt-eslint");
    grunt.loadNpmTasks("grunt-jsonlint");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");

    grunt.registerTask("lint", "Apply ESLint and JSONLint", ["eslint", "jsonlint"]);
    grunt.registerTask("default", ["lint", "clean", "concat", "uglify"]);
};
