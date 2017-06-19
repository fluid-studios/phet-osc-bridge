#!/usr/bin/env node

/*
 * PhET-OSC Bridge OSC Node.js Driver
 * http://github.com/fluid-studios/phet-osc-bridge
 *
 * Copyright 2017, OCAD University
 * Licensed under the New BSD license.
 */

"use strict";

var fluid = require("infusion");

fluid.require("%gpii-launcher");
fluid.require("%phetosc/src/js/port.js");
fluid.require("%phetosc/src/node/osc-port-relayer.js");
fluid.require("%phetosc/src/node/osc-relay-server.js");

var phetosc = fluid.registerNamespace("phetosc");

fluid.defaults("phetosc.launcher", {
    gradeNames: ["gpii.launcher"],
    yargsOptions: {
        describe: {
            phetPath: "The path to a directory containing one or more PhETio wrapper HTML files, which should be served by the PhET OSC Bridge.",
            webServerHost: "The IP address/hostname for phet-osc-bridge's web server. Defaults to 127.0.0.1.",
            webServerPort: "The port on which to bind phet-osc-bridge's web server. Defaults to 8081.",
            remoteAddress: "The IP address/hostname of the remote OSC server. Defaults to 127.0.0.1.",
            remotePort: "The port of the remote OSC server. Defaults to 57120.",
            localAddress: "The local IP address/hostname to which the OSC outputter should be bound. Defaults to 127.0.0.1.",
            localPort: "The local port to which to the OSC outputter should be bound. Defaults to 57121."
        },
        defaults: {
            "optionsFile": "%phetosc/phet-osc-bridge-config.json"
        }
    }
});

phetosc.launcher();
