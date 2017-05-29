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

    bundleParameters: true,

    addressTemplate: "/%phetioID/%eventType/%event",

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
    phetosc.converter.visitPhETEvents(phetEvent, options, packets,
        phetosc.converter.eventToOSCMessage);

    return packets;
};

phetosc.converter.visitPhETEvents = function (phetEvent, options, packets, eventVisitor) {
    eventVisitor(phetEvent, options, packets);

    fluid.each(phetEvent.children, function (childEvent) {
        phetosc.converter.visitPhETEvents(childEvent, options, packets, eventVisitor);
    });
};

phetosc.converter.eventToOSCMessage = function (phetEvent, options, packets) {
    var messageCollection,
        togo;

    if (options.bundleParameters) {
        var bundle = phetosc.converter.createBundleForEvent(phetEvent, packets);
        messageCollection = bundle.packets;
        togo = bundle;
    } else {
        messageCollection = packets;
        togo = messageCollection;
    }

    var addressPrefix = phetosc.converter.messageAddressPrefix(phetEvent, options);
    phetosc.converter.objectToMessages(phetEvent.parameters,
         addressPrefix, options, messageCollection);

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

phetosc.converter.objectToMessages = function (obj, addressPrefix, options, packets) {
    if (!obj || Object.keys(obj) < 1) {
        // TODO: Rearrange argument order?
        phetosc.converter.toMessage(undefined, addressPrefix, undefined, options, packets);
        return;
    }

    addressPrefix = addressPrefix + "/";
    fluid.each(obj, function (val, key) {
        phetosc.converter.parameterToMessages(val, key, addressPrefix, options, packets);
    });
};

phetosc.converter.parameterToMessages = function (val, key, addressPrefix, options, packets) {
    if (fluid.isArrayable(val)) {
        throw new Error("Array parameter value types are not yet supported. " +
        "Can't convert parameter to an OSC messagee. Parameter value was: " +
        fluid.prettyPrintJSON(val));
    }

    var address = addressPrefix + key,
        parameterType = typeof val;

    if (parameterType === "object") {
        return phetosc.converter.objectToMessages(val, address, options, packets);
    } else {
        return phetosc.converter.toMessage(val, address, parameterType, options, packets);
    }
};

phetosc.converter.toMessage = function (val, address, parameterType, options, packets) {
    var message = {
        address: address
    };

    if (val !== undefined) {
        message.args = [
            {
                type: phetosc.converter.oscTypeForJSType(parameterType, options.jsToOSCTypes),
                value: val
            }
        ]
    }

    packets.push(message);
};


phetosc.converter.oscTypeForJSType = function (jsType, jsToOSCTypes) {
    var oscType = jsToOSCTypes[jsType];

    if (!oscType) {
        throw new Error("An invalid JavaScript value type was found. Can't convert parameter to an OSC message. Parameter value was: " + fluid.prettyPrintJSON(val));
    }

    return oscType;
};
