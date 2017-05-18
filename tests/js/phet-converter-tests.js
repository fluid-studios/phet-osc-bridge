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

    invokers: {
        runTests: "phetosc.tests.converter.runTests"
    }
});

phetosc.tests.converter.runTests = function (phetEvent, expected) {
    jqUnit.test("Primitive value changed", function () {
        jqUnit.assertTrue("Test not implemented!", expected);
    });
};

phetosc.tests.converter.primitiveValueChanged();
