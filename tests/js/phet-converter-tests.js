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
    jqUnit.test("Conversion from PhET event to OSC messages", function () {
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

fluid.defaults("phetosc.tests.converter.compositeEvent", {
    gradeNames: [
        "phetosc.tests.withBundledConverter",
        "phetosc.tests.deepEqConversionTester"
    ],

    moduleName: "Composite event with children, bundled",

    phetPath: "../data/phet/phet-composite-event-drag-ended.json",
    oscPath: "../data/osc/osc-composite-event-drag-ended-bundled.json"
});

fluid.defaults("phetosc.tests.withIDPatterns", {
    gradeNames: "fluid.component",

    components: {
        converter: {
            options: {
                components: {
                    filter: {
                        type: "phetosc.eventFilter",
                        options: {
                            phetioIDPatterns: "{withIDPatterns}.options.phetioIDPatterns"
                        }
                    }
                }
            }
        }
    }
});

fluid.defaults("phetosc.tests.converter.filterCompositeEventByID", {
    gradeNames: [
        "phetosc.tests.withBundledConverter",
        "phetosc.tests.withIDPatterns",
        "phetosc.tests.deepEqConversionTester"
    ],

    moduleName: "Composite event filtered by phetioID",

    phetioIDPatterns: [
        "buildAnAtom.atomScreen.model.particleAtom.particleCountProperty"
    ],

    phetPath: "../data/phet/phet-composite-event-drag-ended.json",
    oscPath: "../data/osc/osc-particle-count-changed-bundled.json"
});

fluid.defaults("phetosc.tests.converter.filterCompositeEventByPattern", {
    gradeNames: [
        "phetosc.tests.withBundledConverter",
        "phetosc.tests.withIDPatterns",
        "phetosc.tests.deepEqConversionTester"
    ],

    moduleName: "Composite event filtered by an ID regexp pattern",

    phetioIDPatterns: [
        "buildAnAtom.atomScreen.model.protons_[0-9]"
    ],

    phetPath: "../data/phet/phet-composite-event-drag-ended.json",
    oscPath: "../data/osc/osc-proton-events-bundled.json"
});

fluid.defaults("phetosc.tests.converter.filterCompositeEventParameters", {
    gradeNames: [
        "phetosc.tests.withBundledConverter",
        "phetosc.tests.deepEqConversionTester"
    ],

    moduleName: "Composite event excluding oldValue parameters",

    components: {
        converter: {
            options: {
                excludeParameters: [
                    "oldValue",
                    "oldText"
                ]
            }
        }
    },

    phetPath: "../data/phet/phet-composite-event-drag-ended.json",
    oscPath: "../data/osc/osc-composite-event-no-oldvalue-oldtext-bundled.json"
});

phetosc.tests.converter.primitiveValueChanged();
phetosc.tests.converter.primitiveUnbundledValueChange();
phetosc.tests.converter.objectParameter();
phetosc.tests.converter.compositeEvent();
phetosc.tests.converter.filterCompositeEventByID();
phetosc.tests.converter.filterCompositeEventByPattern();
phetosc.tests.converter.filterCompositeEventParameters();
