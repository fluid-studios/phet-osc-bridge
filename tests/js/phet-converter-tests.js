/*
 * PhET-OSC Bridge PhET Event Converter Tests
 * http://github.com/fluid-studios/phet-osc-bridge
 *
 * Copyright 2017, OCAD University
 * Licensed under the New BSD license.
 */

"use strict";

var fluid = fluid || require("infusion"),
    jqUnit = jqUnit || fluid.require("node-jqunit"),
    phetosc = phetosc || fluid.registerNamespace("phetosc");

fluid.defaults("phetosc.tests.converter.primitiveValueChanged", {
    gradeNames: "phetosc.conversionTester",

    phetPath: "../data/phet/phet-particle-count-changed.json",
    oscPath: "../data/osc/osc-particle-count-changed.json",

    components: {
        converter: {
            type: "phetosc.converter"
        }
    },

    invokers: {
        runTests: {
            funcName: "phetosc.tests.converter.runTests",
            args: ["{that}", "{arguments}.0.0", "{arguments}.1.0"]
        }
    }
});

phetosc.tests.converter.runTests = function (that, phetEvent, expected) {
    jqUnit.test("Primitive value changed", function () {
        var actual = that.converter.toOSC(phetEvent);
        jqUnit.assertDeepEq("PhET event was correctly converted to an OSC bundle",
            expected, actual);
    });
};

phetosc.tests.converter.primitiveValueChanged();
