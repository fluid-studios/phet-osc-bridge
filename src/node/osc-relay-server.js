/*
 * PhET-OSC Bridge OSC Relay Server
 * http://github.com/fluid-studios/phet-osc-bridge
 *
 * Copyright 2017, OCAD University
 * Licensed under the New BSD license.
 */

"use strict";

var express = require("express"),
    WebSocket = require("ws"),
    fluid = require("infusion"),
    phetosc = fluid.registerNamespace("phetosc");

fluid.require("%phetosc/src/js/port.js");
fluid.require("%phetosc/src/node/osc-port-relayer.js");

// A Relay Server is a combination of:
// 1. an Express-based Web server that serves up static resources
// 2. a Web Socket server that receives incoming OSC messages
// 3. a configurable OSC Port object to which outgoing OSC messages are relayed
fluid.defaults("phetosc.relayServer", {
    gradeNames: "fluid.component",

    port: 8081,
    resourcePath: __dirname + "/../../",

    members: {
        expressApp: {
            expander: {
                funcName: "phetosc.relayServer.createExpressStaticApp",
                args: ["{that}.options.resourcePath"]
            }
        },

        httpServer: {
            expander: {
                funcName: "phetosc.relayServer.createHTTPServer",
                args: ["{that}.expressApp", "{that}.options.port"]
            }
        },

        webSocketServer: {
            expander: {
                funcName: "phetosc.relayServer.createWebSocketServer",
                args: ["{that}.httpServer"]
            }
        }
    },

    components: {
        outputPort: {
            type: "phetosc.udpPort"
        }
    },

    dynamicComponents: {
        portRelayer: {
            type: "phetosc.webSocketPortRelayer",
            createOnEvent: "onConnection",
            options: {
                webSocket: "{arguments}.0",
                events: {
                    onDestroy: "{relayServer}.events.onClose"
                }
            }
        }
    },

    events: {
        onConnection: null,
        onClose: null
    },

    listeners: {
        "onCreate.bindWebSocketConnectionListener": {
            "this": "{that}.webSocketServer",
            method: "on",
            args: ["connection", "{that}.events.onConnection.fire"]
        },

        "onConnection.log": {
            priority: "first",
            "this": "console",
            method: "log",
            args: ["A Web Socket connection was established."]
        },

        "onClose.log": {
            priority: "last",
            "this": "console",
            method: "log",
            args: ["A Web Socket connection was closed."]
        }
    }
});

phetosc.relayServer.createExpressStaticApp = function (resourcePath) {
    var app = express();
    app.use("/", express["static"](resourcePath));

    return app;
};

phetosc.relayServer.createHTTPServer = function (app, port) {
    return app.listen(port);
};

phetosc.relayServer.createWebSocketServer = function (httpServer) {
    return new WebSocket.Server({
        server: httpServer
    });
};
