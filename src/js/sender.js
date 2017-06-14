/*
 * PhET-OSC Bridge OSC Port
 * http://github.com/fluid-studios/phet-osc-bridge
 *
 * Copyright 2017, OCAD University
 * Licensed under the New BSD license.
 */

"use strict";

var fluid = fluid || require("infusion"),
    phetosc = phetosc || fluid.registerNamespace("phetosc");

fluid.defaults("phetosc.webSocketSender", {
    gradeNames: "fluid.component",

    portOptions: {
        url: "ws://localhost:8081"
    },

    openImmediately: true,

    invokers: {
        open: "{that}.port.open()",

        close: "{that}.port.close()",

        sendOSCPackets: {
            funcName: "phetosc.webSocketSender.sendOSCPackets",
            args: ["{that}", "{arguments}.0"]
        }
    },

    components: {
        port: {
            type: "phetosc.webSocketPort",
            options: "{webSocketSender}.options.portOptions"
        }
    },

    listeners: {
        "onCreate.open": {
            funcName: "phetosc.webSocketSender.openPortOnCreate",
            args: ["{port}", "{that}.options.openImmediately"]
        }
    }
});

phetosc.webSocketSender.openPortOnCreate = function (port, openImmediately) {
    if (openImmediately) {
        port.open();
    }
};

phetosc.webSocketSender.sendOSCPackets = function (that, packets) {
    fluid.each(packets, function (packet) {
        that.port.send(packet);
    });
};
