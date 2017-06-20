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

    webServerHost: "127.0.0.1",
    webServerPort: 8081,
    remoteAddress: "127.0.0.1",
    remotePort: 57120,
    localAddress: "0.0.0.0",
    localPort: 57121,

    phetPath: {
        expander: {
            funcName: "fluid.module.resolvePath",
            args: "%phetosc/examples/"
        }
    },

    resourcePath: {
        expander: {
            funcName: "fluid.module.resolvePath",
            args: "%phetosc/dist/"
        }
    },

    members: {
        expressApp: {
            expander: {
                funcName: "phetosc.relayServer.createExpressStaticApp",
                args: ["{that}.options"]
            }
        },

        httpServer: {
            expander: {
                funcName: "phetosc.relayServer.createHTTPServer",
                args: [
                    "{that}.expressApp",
                    "{that}.options.webServerPort",
                    "{that}.options.webServerHost"
                ]
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
            type: "phetosc.udpPort",
            options: {
                remoteAddress: "{relayServer}.options.remoteAddress",
                remotePort: "{relayServer}.options.remotePort",
                localAddress: "{relayServer}.options.localAddress",
                localPort: "{relayServer}.options.localPort",

                listeners: {
                    "onCreate.openOutputPort": {
                        func: "{that}.open"
                    }
                }
            }
        }
    },

    dynamicComponents: {
        portRelayer: {
            type: "phetosc.webSocketPortRelayer",
            createOnEvent: "onConnection",
            options: {
                webSocket: "{arguments}.0",
                components: {
                    outputPort: "{relayServer}.outputPort"
                },
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

        "onCreate.logServerInfo": {
            funcName: "phetosc.relayServer.logServerInfo",
            args: ["{that}"]
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

phetosc.relayServer.createExpressStaticApp = function (options) {
    var app = express(),
        expressStatic = express["static"];

    app.use("/", expressStatic(options.phetPath));
    app.use("/phet-osc-bridge", expressStatic(options.resourcePath));

    return app;
};

phetosc.relayServer.createHTTPServer = function (app, webServerPort, webServerHost) {
    return app.listen(webServerPort, webServerHost);
};

phetosc.relayServer.createWebSocketServer = function (httpServer) {
    return new WebSocket.Server({
        server: httpServer
    });
};

phetosc.relayServer.logServerInfo = function (that) {
    var url = "http://" + that.options.webServerHost + ":" +
        that.options.webServerPort + "/";

    console.log("PhET OSC Bridge web server mounted at", url);
};
