/*
 * PhET-OSC Bridge OSC Port Relayer
 * http://github.com/fluid-studios/phet-osc-bridge
 *
 * Copyright 2017, OCAD University
 * Licensed under the New BSD license.
 */

"use strict";

var fluid = fluid || require("infusion"),
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
        "onInputMessage.sendToOutputPort": "{outputPort}.sendRaw({arguments}.0)"
    }
});
