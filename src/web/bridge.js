/*
 * PhET-OSC Bridge Event Sender
 * http://github.com/fluid-studios/phet-osc-bridge
 *
 * Copyright 2017, OCAD University
 * Licensed under the New BSD license.
 */

"use strict";

var fluid = fluid || require("infusion"),
    phetosc = phetosc || fluid.registerNamespace("phetosc");

fluid.defaults("phetosc.bridge", {
    gradeNames: "fluid.component",

    url: "ws://localhost:8081",
    openImmediately: true,
    bundleParameters: true,
    excludeParameters: ["oldValue"],
    phetioIDs: "*",

    invokers: {
        bind: "phetosc.bridge.bind({that}, {arguments}.0)"
    },

    components: {
        converter: {
            type: "phetosc.converter",
            options: {
                bundleParameters: "{bridge}.bundleParameters",
                excludeParameters: "{bridge}.excludeParameters"
            }
        },

        sender: {
            type: "phetosc.webSocketSender",
            options: {
                portOptions: {
                    url: "{bridge}.options.url",
                    openImmediately: "{bridge}.options.openImmediately"
                }
            }
        }
    },

    events: {
        onEvent: null,
        afterEventConverted: null
    },

    listeners: {
        "onEvent.convert": {
            funcName: "phetosc.bridge.convertEvent",
            args: ["{that}", "{arguments}.0.args.0"]
        },

        "afterEventConverted.sendOSCPackets": {
            func: "{sender}.sendOSCPackets",
            args: ["{arguments}.0"]
        }
    }
});

phetosc.bridge.bind = function (that, sim) {
    var phetioIDs = that.options.phetioIDs,
        listener = that.events.onEvent.fire;

    if (phetioIDs === "*") {
        sim.addMessageListener(listener);
    } else if (fluid.isArrayable(phetioIDs)) {
        phetosc.bridge.linkInstances(phetioIDs, sim, listener)
    }
};

phetosc.bridge.linkInstances = function (phetioIDs, sim, listener) {
    fluid.each(phetioIDs, function (phetioID) {
        phetosc.bridge.linkInstance(phetioID, sim, listener);
    });
};

phetosc.bridge.linkInstance = function (phetioID, sim, listener) {
    sim.invoke(phetioID, "link", listener);
};

phetosc.bridge.convertEvent = function (that, phetEvent) {
    if (!phetEvent) {
        return;
    }

    var parsedEvent = JSON.parse(phetEvent);
    var oscPackets = that.converter.toOSC(parsedEvent);
    that.events.afterEventConverted.fire(oscPackets);
};

