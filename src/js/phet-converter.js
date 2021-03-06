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
    excludeParameters: [],
    addressMap: {},
    addressTemplate: "/%phetioID/%eventType/%event",

    jsToOSCTypes: {
        "number": "d",
        "string": "s"
    },

    invokers: {
        toOSC: "phetosc.converter.toOSC({arguments}.0, {that})"
    },

    components: {
        filter: {
            type: "phetosc.eventFilter"
        }
    },

    events: {
        onError: null
    },

    listeners: {
        "onError.logWarningMessage": {
            funcName: "fluid.log",
            args: [
                fluid.logLevel.WARN,
                "{arguments}.0", // Error message.
                " Address: ",
                "{arguments}.1",
                " Value: ",
                "{arguments}.2"
            ]
        }
    }
});

phetosc.converter.oscTypeForJSType = function (jsType, jsToOSCTypes) {
    return jsToOSCTypes[jsType];
};

phetosc.converter.toMessage = function (address, that, val, paramType) {
    var mappedAddress = that.options.addressMap[address];
    if (mappedAddress) {
        // Just in case users forget the OSC-required leading slash.
        address = mappedAddress.indexOf("/") !== 0 ?
            "/" + mappedAddress : mappedAddress;
    }

    var message = {
        address: address
    };

    var arg = val === undefined ? undefined :
        paramType === "boolean" ? phetosc.converter.toBooleanMessage(val) :
        phetosc.converter.toArgumentMessage(address, that, val, paramType);

    if (arg) {
        message.args = [arg];
    }

    return [message];
};

phetosc.converter.toBooleanMessage = function (val) {
    return {
        type: val ? "T" : "F"
    };
};

phetosc.converter.toArgumentMessage = function (address, that, val, paramType) {
    var oscType = phetosc.converter.oscTypeForJSType(paramType,
        that.options.jsToOSCTypes);

    if (!oscType) {
        that.events.onError.fire("A parameter property was found with a type of " +
            paramType + ", which is not OSC compatible. It was omitted.",
            address, val);

        return;
    }

    return {
        type: oscType,
        value: val
    };
};

phetosc.converter.parameterToMessages = function (addressPrefix, that, val, key) {
    if (fluid.isArrayable(val)) {
        that.events.onError.fire("An Array-typed event parameter was found; conversion of Array parameters to OSC messages is not yet supported. It was omitted.",
            val, key);

        return [];
    }

    if (that.options.excludeParameters.indexOf(key) > -1) {
        // Skip the parameter.
        return [];
    }

    var address = addressPrefix + "/" + key,
        paramType = typeof val;

    return paramType === "object" ?
        phetosc.converter.objectToMessages(address, that, val) :
        phetosc.converter.toMessage(address, that, val, paramType);
};

phetosc.converter.objectToMessages = function (addressPrefix, that, obj) {
    if (!obj || Object.keys(obj).length === 0) {
        return phetosc.converter.toMessage(addressPrefix, that);
    } else {
        var messages = [];

        fluid.each(obj, function (val, key) {
            var paramMessages = phetosc.converter.parameterToMessages(addressPrefix, that, val, key);
            messages.push(paramMessages);
        });

        return fluid.flatten(messages);
    }
};

phetosc.converter.messageAddressPrefix = function (phetEvent, that) {
    return fluid.stringTemplate(that.options.addressTemplate, phetEvent);
};

phetosc.converter.oscBundle = function (packets) {
    return {
        timeTag: {
            raw: [0, 0],
            native: 0
        },
        packets: packets
    };
};

phetosc.converter.eventToOSCMessages = function (phetEvent, that) {
    if (!that.filter.filterEvent(phetEvent.phetioID)) {
        return [];
    }

    var addressPrefix = phetosc.converter.messageAddressPrefix(phetEvent, that);

    var messages = phetosc.converter.objectToMessages(addressPrefix, that, phetEvent.parameters);

    return !that.options.bundleParameters ?
        messages : [phetosc.converter.oscBundle(messages)];
};

phetosc.converter.toOSC = function (phetEvent, that) {
    // Convert the event body to a set of OSC messages.
    var eventPackets = phetosc.converter.eventToOSCMessages(phetEvent, that);

    // Then convert all its child events.
    var childPackets = fluid.transform(phetEvent.children, function (child) {
        return phetosc.converter.toOSC(child, that);
    });

    // Return back a consolidated array of bundles/messages.
    return Array.prototype.concat.apply(eventPackets, childPackets);
};
