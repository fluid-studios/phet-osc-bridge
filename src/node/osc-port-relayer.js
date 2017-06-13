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
            type: "phetosc.webSocketPort"
        },

        outputPort: {
            type: "phetosc.udpPort"
        }
    }
});

fluid.defaults("phetosc.websocketPortRelayer", {
    gradeNames: "fluid.component",

    mergePolicy: {
        "socket": "nomerge"
    },

    webSocket: null,

    components: {
        inputPort: {
            options: {
                mergePolicy: {
                    "socket": "nomerge"
                },

                socket: "{websocketInputPortRelayer}.options.webSocket"
            }
        }
    },

    events: {
        onInputClose: "{inputPort}.events.onClose",
        onOutputClose: "{output}.events.onClose",
        onInputMessage: "{inputPort}.events.onRaw"
    },

    listeners: {
        "onInputClose.destroyRelay": "{that}.destroy()",
        "onOutputClose.destroyRelay": "{that}.destroy()",
        "onInputMessage": "{outputPort}.sendRaw({arguments}.0)"
    }
});
