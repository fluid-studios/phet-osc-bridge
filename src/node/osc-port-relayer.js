/*
 * PhET-OSC Bridge OSC Port Relayer
 * http://github.com/fluid-studios/phet-osc-bridge
 *
 * Copyright 2017, OCAD University
 * Licensed under the New BSD license.
 */

"use strict";

var fluid = fluid || require("infusion"),
    osc = fluid.require("osc", require, "osc"),
    phetosc = phetosc || fluid.registerNamespace("phetosc");

fluid.defaults("phetosc.oscPortRelayer", {
    gradeNames: "fluid.component",

    components: {
        inputPort: {
            type: "phetosc.port"
        },

        outputPort: {
            type: "phetosc.port"
        }
    }
});

fluid.defaults("phetosc.webSocketPortRelayer", {
    gradeNames: "phetosc.oscPortRelayer",

    mergePolicy: {
        "webSocket": "nomerge"
    },

    webSocket: null,

    components: {
        inputPort: {
            type: "phetosc.webSocketPort",
            options: {
                mergePolicy: {
                    "socket": "nomerge"
                },

                socket: "{webSocketPortRelayer}.options.webSocket"
            }
        }
    },

    events: {
        onInputClose: "{inputPort}.events.onClose",
        onOutputClose: "{outputPort}.events.onClose",
        onInputMessage: "{inputPort}.events.onRaw"
    },

    listeners: {
        "onCreate.log": {
            "this": "console",
            "method": "log",
            args: ["Relayer was created"]
        },
        "onInputClose.destroyRelay": "{that}.destroy()",
        "onOutputClose.destroyRelay": "{that}.destroy()",
        "onInputMessage.sendToOutputPort": "{outputPort}.sendRaw({arguments}.0)",
        "onInputMessage.debug": {
            priority: "before:sendToOutputPort",
            funcName: "phetosc.webSocketPortRelayer.logInputMessages",
            args: ["{arguments}.0"]
        }
    }
});

phetosc.webSocketPortRelayer.logInputMessages = function (rawMessage) {
    var parsed = osc.readPacket(rawMessage, {metadata: true});
    console.log(parsed);
};

fluid.defaults("phetosc.webSocketUDPPortRelayer", {
    gradeNames: "phetosc.webSocketPortRelayer",

    outputAddress: "127.0.0.1",
    outputPort: 57120,

    components: {
        outputPort: {
            type: "phetosc.udpPort",
            options: {
                remoteAddress: "{webSocketUDPPortRelayer}.options.outputAddress",
                remotePort: "{webSocketUDPPortRelayer}.options.outputPort"
            }
        }
    },

    listeners: {
        "onCreate.openOutputPort": {
            func: "{outputPort}.open"
        }
    }
});
