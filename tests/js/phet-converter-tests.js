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

fluid.defaults("phetosc.tests.deepEqConversionTester", {
    gradeNames: "phetosc.conversionTester",

    components: {
        converter: {
            type: "phetosc.converter"
        }
    },

    invokers: {
        runTests: {
            funcName: "phetosc.tests.converter.runTests",
            args: ["{that}", "{arguments}.0.0", "{arguments}.1"]
        }
    }
});


fluid.defaults("phetosc.tests.withBundledConverter", {
    gradeNames: "fluid.component",

    components: {
        converter: {
            options: {
                bundleParameters: true
            }
        }
    }
});

fluid.defaults("phetosc.tests.withUnbundledConverter", {
    gradeNames: "fluid.component",

    components: {
        converter: {
            options: {
                bundleParameters: false
            }
        }
    }
});

fluid.defaults("phetosc.tests.converter.primitiveValueChanged", {
    gradeNames: [
        "phetosc.tests.withBundledConverter",
        "phetosc.tests.deepEqConversionTester"
    ],

    moduleName: "Primitive parameters, bundled",

    phetPath: "../data/phet/phet-particle-count-changed.json",
    oscPath: "../data/osc/osc-particle-count-changed-bundled.json",

    components: {
        converter: {
            options: {
                bundleParameters: true
            }
        }
    }
});

phetosc.tests.converter.runTests = function (that, phetEvent, expected) {
    jqUnit.test("Primitive value changed", function () {
        var actual = that.converter.toOSC(phetEvent);
        jqUnit.assertDeepEq("PhET event was correctly converted to OSC messages",
            expected, actual);
    });
};

fluid.defaults("phetosc.tests.converter.primitiveUnbundledValueChange", {
    gradeNames: [
        "phetosc.tests.converter.primitiveValueChanged",
        "phetosc.tests.withUnbundledConverter"
    ],

    moduleName: "Primitive parameters, not bundled",
    oscPath: "../data/osc/osc-particle-count-changed-unbundled.json"
});

fluid.defaults("phetosc.tests.converter.objectParameter", {
    gradeNames: [
        "phetosc.tests.withBundledConverter",
        "phetosc.tests.deepEqConversionTester"
    ],

    moduleName: "Object-valued parameters, bundled",

    phetPath: "../data/phet/phet-object-valued-parameter.json",
    oscPath: "../data/osc/osc-object-valued-parameter-bundled.json"
});

phetosc.tests.converter.primitiveValueChanged();
phetosc.tests.converter.primitiveUnbundledValueChange();
phetosc.tests.converter.objectParameter();
