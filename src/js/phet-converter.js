/*
 * PhET-OSC Bridge PhET Event Converter
 * http://github.com/fluid-studios/phet-osc-bridge
 *
 * Copyright 2017, OCAD University
 * Licensed under the New BSD license.
 */

"use strict";

var fluid = fluid || require("infusion"),
    phetosc = phetosc || fluid.registerNamespace("phetosc");

fluid.defaults("phetosc.converter", {
    gradeNames: "fluid.component",

    shouldBundleParams: true,

    addressTemplate: "/%phetioID/%eventType/%event/",

    jsToOSCTypes: {
        "number": "d",
        "string": "s",
        "boolean": "b"
    },

    invokers: {
        toOSC: "phetosc.converter.toOSC({arguments}.0, {that}.options)"
    }
});

phetosc.converter.toOSC = function (phetEvent, options) {
    var packets = [];


    return phetosc.converter.eventToOSCMessage(phetEvent, options, packets);
};

phetosc.converter.visitPhETEvents = function (phetEvent) {

};

phetosc.converter.eventToOSCMessage = function (phetEvent, options, packets) {
    var messageCollection,
        togo;

    if (options.shouldBundleParams) {
        var bundle = phetosc.converter.createBundleForEvent(phetEvent, packets);
        messageCollection = bundle.packets;
        togo = bundle;
    } else {
        messageCollection = packets;
        togo = messageCollection;
    }

    var addressPrefix = phetosc.converter.messageAddressPrefix(phetEvent, options);
    phetosc.converter.parametersToMessages(phetEvent, addressPrefix, options, messageCollection);

    return togo;
};

phetosc.converter.createBundleForEvent = function (phetEvent, packets) {
    var bundle = {
        packets: []
    };

    packets.push(bundle);

    return bundle;
};

phetosc.converter.messageAddressPrefix = function (phetEvent, options) {
    return fluid.stringTemplate(options.addressTemplate, phetEvent);
};

phetosc.converter.parametersToMessages = function (phetEvent, addressTemplate, options, packets) {
    fluid.each(phetEvent.parameters, function (val, key) {
        var message = phetosc.converter.parameterToMessage(val, key, addressTemplate, options);
        packets.push(message);
    });
};

phetosc.converter.parameterToMessage = function (val, key, addressTemplate, options) {
    var message = {
        address: addressTemplate + key,
        args: [
            {
                type: phetosc.converter.oscTypeForArgument(val, options.jsToOSCTypes),
                value: val
            }
        ]
    };

    return message;
};

phetosc.converter.oscTypeForArgument = function (val, jsToOSCTypes) {
    var jsType = typeof val,
        oscType = jsToOSCTypes[jsType];

    if (!oscType) {
        throw new Error("An invalid JavaScript value type was found. Can't convert parameter to an OSC messagee. Parameter value was: " +
        fluid.prettyPrintJSON(val));
    }

    return oscType;
};
