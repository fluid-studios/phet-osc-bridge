/*
 * PhET-OSC Bridge Conversion Tester
 * http://github.com/fluid-studios/phet-osc-bridge
 *
 * Copyright 2017, OCAD University
 * Licensed under the New BSD license.
 */

"use strict";

var fluid = fluid || require("infusion"),
    jqUnit = jqUnit || fluid.require("node-jqunit"),
    phetosc = phetosc || fluid.registerNamespace("phetosc");

fluid.defaults("phetosc.conversionTester", {
    gradeNames: "fluid.component",

    moduleName: "",
    phetPath: "",
    oscPath: "",

    invokers: {
        runTests: {
            funcName: "fluid.mustBeOverridden",
            args: ["{that}", "{arguments}.0", "{arguments}.1"]
        }
    },

    events: {
        onPhETFileLoaded: null,
        onOSCFileLoaded: null,
        onError: null,
        onFilesLoaded: {
            events: {
                phet: "{that}.events.onPhETFileLoaded",
                osc: "{that}.events.onOSCFileLoaded"
            },
            args: ["{arguments}.phet.0", "{arguments}.osc.0"]
        }
    },

    listeners: {
        "onCreate.loadPhETFile": {
            funcName: "phetosc.conversionTester.loadFile",
            args: [
                "{that}.options.phetPath",
                "{that}.events.onPhETFileLoaded.fire",
                "{that}.events.onError.fire"
            ]
        },

        "onCreate.loadOSCFile": {
            funcName: "phetosc.conversionTester.loadFile",
            args: [
                "{that}.options.oscPath",
                "{that}.events.onOSCFileLoaded.fire",
                "{that}.events.onError.fire"
            ]
        },

        "onError": {
            "this": "console",
            method: "log",
            args: ["{arguments}.0.message"]
        },

        "onFilesLoaded.defineModule": {
            funcName: "jqUnit.module",
            args: "{that}.options.moduleName"
        },

        "onFilesLoaded.runTests": {
            priority: "after:defineModule",
            func: "{that}.runTests"
        }
    }
});

phetosc.conversionTester.loadFile = function (path, onLoaded, onError) {
    var loader = typeof $ !== "undefined" ? phetosc.conversionTester.browserLoadFile :
        phetosc.conversionTester.nodeLoadFile;

    loader(path, onLoaded, onError);
};

phetosc.conversionTester.browserLoadFile = function (path, onLoaded, onError) {
    $.ajax({
        url: path,
        success: onLoaded,
        error: onError,
        method: "GET",
        dataType: "json"
    });
};

phetosc.conversionTester.nodeLoadFile = function (path, onLoaded, onError) {
    try {
        var data = require(path);
        onLoaded(data);
    } catch (e) {
        onError(e);
    }
};
