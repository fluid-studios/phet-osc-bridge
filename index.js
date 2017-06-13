/*
 * PhET-OSC Bridge OSC Node.js Driver
 * http://github.com/fluid-studios/phet-osc-bridge
 *
 * Copyright 2017, OCAD University
 * Licensed under the New BSD license.
 */

"use strict";

var fluid = require("infusion");

fluid.require("%phetosc/src/js/port.js");
fluid.require("%phetosc/src/node/osc-port-relayer.js");
fluid.require("%phetosc/src/node/osc-relay-server.js");

var phetosc = fluid.registerNamespace("phetosc");

phetosc.relayServer();