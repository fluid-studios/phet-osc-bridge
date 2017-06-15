/*
 * PhET-OSC Bridge Event Filter
 * http://github.com/fluid-studios/phet-osc-bridge
 *
 * Copyright 2017, OCAD University
 * Licensed under the New BSD license.
 */

"use strict";

var fluid = fluid || require("infusion"),
    phetosc = phetosc || fluid.registerNamespace("phetosc");

fluid.defaults("phetosc.eventFilter", {
    gradeNames: "fluid.component",

    phetioIDPatterns: "*",

    members: {
        phetioIDRegExps: {
            expander: {
                funcName: "phetosc.eventFilter.compileRegexps",
                args: ["{that}.options.phetioIDPatterns"]
            }
        }
    },

    invokers: {
        filterEvent: {
            funcName: "phetosc.eventFilter.filterEvent",
            args: ["{that}.phetioIDRegExps", "{arguments}.0"]
        }
    }
});

phetosc.eventFilter.compileRegexps = function (phetioIDPatterns) {
    if (phetioIDPatterns === "*") {
        return [];
    }

    return fluid.transform(phetioIDPatterns, function (phetIOIDPattern) {
        return new RegExp(phetIOIDPattern);
    });
};

phetosc.eventFilter.filterEvent = function (phetioIDRegExps, str) {
    if (phetioIDRegExps.length === 0) {
        return true;
    }

    return fluid.find_if(phetioIDRegExps, function (phetioIDRegExp) {
        return phetioIDRegExp.test(str);
    });
};
