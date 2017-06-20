/*
 * PhET-OSC Bridge OSC Port
 * http://github.com/fluid-studios/phet-osc-bridge
 *
 * Copyright 2017, OCAD University
 * Licensed under the New BSD license.
 */

"use strict";

var fluid = fluid || require("infusion"),
    osc = osc || fluid.require("osc", require, "osc"),
    phetosc = phetosc || fluid.registerNamespace("phetosc");

fluid.defaults("phetosc.port", {
    gradeNames: "fluid.component",

    // portType can be any osc.js Port constructor name
    // in string form, e.g. "osc.UDPPort" or "osc.WebSocketPort".
    // See https://github.com/colinbdclark/osc.js
    // for more information and examples.
    portType: "fluid.mustBeOverridden",

    metadata: true,
    unpackSingleArgs: false,

    portEventMap: {
        open: "onOpen",
        ready: "onReady",
        error: "onError",
        close: "onClose",
        message: "onMessage",
        bundle: "onBundle",
        osc: "onOSC",
        raw: "onRaw"
    },

    members: {
        port: {
            expander: {
                funcName: "phetosc.port.createPort",
                args: ["{port}.options"]
            }
        }
    },

    invokers: {
        open: {
            "this": "{that}.port",
            method: "open"
        },

        send: {
            "this": "{that}.port",
            method: "send"
        },

        sendRaw: {
            "this": "{that}.port",
            method: "sendRaw"
        },

        close: {
            "this": "{that}.port",
            method: "close"
        }
    },

    events: {
        onOpen: null,
        onReady: null,
        onError: null,
        onClose: null,
        onMessage: null,
        onBundle: null,
        onOSC: null,
        onRaw: null
    },

    listeners: {
        "onCreate.bindPortEvents": {
            funcName: "phetosc.port.bindPortEvents",
            args: ["{that}"]
        }
    }
});

phetosc.port.bindPortEvents = function (that) {
    fluid.each(that.options.portEventMap, function (eventName, emitterName) {
        that.port.on(emitterName, that.events[eventName].fire);
    });
};

phetosc.port.createPort = function (options) {
    var optionsClone = fluid.copy(options),
        portType = optionsClone.portType,
        PortConstructor = fluid.getGlobalValue(portType);

    delete optionsClone[portType];
    return new PortConstructor(optionsClone);
};


fluid.defaults("phetosc.webSocketPort", {
    gradeNames: "phetosc.port",
    portType: "osc.WebSocketPort"
});


fluid.defaults("phetosc.udpPort", {
    gradeNames: "phetosc.port",
    portType: "osc.UDPPort"
});
