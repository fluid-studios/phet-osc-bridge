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
    phetioIDPatterns: "*",

    invokers: {
        bind: "phetosc.bridge.bind({that}, {arguments}.0)"
    },

    components: {
        filter: {
            type: "phetosc.eventFilter",
            options: {
                phetioIDPatterns: "{bridge}.options.phetioIDPatterns"
            }
        },

        converter: {
            type: "phetosc.converter",
            options: {
                bundleParameters: "{bridge}.options.bundleParameters",
                excludeParameters: "{bridge}.options.excludeParameters",
                components: {
                    filter: "{filter}"
                }
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
        onFilteredEvent: null,
        afterEventConverted: null
    },

    listeners: {
        "onFilteredEvent.convert": {
            funcName: "phetosc.bridge.convertEvent",
            args: ["{that}", "{arguments}.0"]
        },

        "onEvent.filter": {
            funcName: "phetosc.bridge.filterEvent",
            args: ["{that}", "{arguments}.0.args.0"]
        },

        "afterEventConverted.sendOSCPackets": {
            func: "{sender}.sendOSCPackets",
            args: ["{arguments}.0"]
        }
    }
});

phetosc.bridge.bind = function (that, sim) {
    sim.addMessageListener(that.events.onEvent.fire);
};

phetosc.bridge.filterEvent = function (that, phetEventString) {
    if (!phetEventString) {
        return;
    }

    if (that.filter.filterEvent(phetEventString)) {
        that.events.onFilteredEvent.fire(phetEventString);
    }
};

phetosc.bridge.convertEvent = function (that, phetEventString) {
    if (!phetEventString) {
        return;
    }

    var parsedEvent = JSON.parse(phetEventString);
    var oscPackets = that.converter.toOSC(parsedEvent);
    that.events.afterEventConverted.fire(oscPackets);
};
