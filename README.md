# PhET to Open Sound Control Bridge

This repository provides a library for sending the events fired by a [PhET](https://phet.colorado.edu/) physics simulation, [wrapped with PhETio](https://phet-io.colorado.edu/devguide/#documentation), to remote processes using [Open Sound Control](http://opensoundcontrol.org/spec-1_0). The purpose of this bridge is to make it easier for sound designers to use familiar audio synthesis tools such as Max and SuperCollider, to quickly prototype sonifications for PhET.

Open Sound Control message payloads are flat; there is no way to send named parameters, dictionaries, or objects within an OSC message. PhET events, however, represent changes within a hierarchical value space consisting both of user interface components and model properties. When binding PhET events to OSC, a message denotes a change to a single value within an object that is uniquely identified by the structure of the OSC message's address.

## Important Links
* Public [PhET.io Developer Guide](https://phet-io.colorado.edu/devguide/#documentation)
* The [Open Sound Control 1.0 Specification](http://opensoundcontrol.org/spec-1_0)
* [osc.js](https://github.com/colinbdclark/osc.js)

## Types of PhET Events
* User: triggered by a user action
* Model: a change in the simulation's sate

## Structure of a PhET Event
* Events are hierarchical; they can contain ``children`` events that "were triggered while this event was being processed." In this OSC binding, we have flattened the parent/child event structure, treating them as a flat sequence of events.
* Events are fired by objects, which are uniquely identified by keypath-style structures ("foo.bar.baz").

## Binding PhET Events to OSC Addresses

In order to accurately map JSON objects to OSC messages, each event is represented as an OSC bundle. Each property of each event parameter is a separate message within the bundle.

``/<phetioID>/<event>/<name>/<parameter>/<parameter value key>``

Since bundles can sometimes be less convenient to work with in environments like SuperCollider or Max, an option will be provided to send unbundled messages.

### Examples

#### Example 1: User Dragged a Proton Event
    {
      packets: [
        {
          address: "/buildAnAtom.atomScreen.view.nucleons_9.inputListener/user/dragged/x",
          args: [
            type: "d",
            value: "473"
          ]
        },
        {
          address: "/buildAnAtom.atomScreen.view.nucleons_9.inputListener/user/dragged/y",
          args: [
            type: "d",
            value: "148"
          ]
        }
      ]
    }

#### Example 2: Model "Proton No Longer Under User Control" Event
    {
      packets: [
        {
          address: "/buildAnAtom.atomScreen.model.protons_9.userControlledProperty/model/changed/oldValue",
          args: [
            type: "b",
            value: true
          ]
        },
        {
          address: "/buildAnAtom.atomScreen.model.protons_9.userControlledProperty/model/changed/newValue",
          args: [
            type: "b",
            value: false
          ]
        }
      ]
    }


### Example 3: A Primitive Property Value

#### PhET Event JSON Structure

    {
      "messageIndex": 179,
      "eventType": "model",
      "phetioID": "buildAnAtom.atomScreen.model.particleAtom.particleCountProperty",
      "componentType": "TDerivedProperty",
      "event": "changed",
      "time": 1490762584752,
      "parameters": {
        "oldValue": 0,
        "newValue": 1
      }
    }

#### OSC Bundle JSON Structure

    {
      packets: [
        {
          address: "/buildAnAtom.atomScreen.model.particleAtom.particleCountProperty/model/changed/newValue",
          args: [
            {
              type: "d",
              value: 1
            }
          ]
        }
    }

### Example 4: An Object Value

#### PhET Event JSON Structure

    {
      "messageIndex": 185,
      "eventType": "model",
      "phetioID": "buildAnAtom.atomScreen.model.protons_9.positionProperty",
      "componentType": "TProperty",
      "event": "changed",
      "time": 1490762584782,
      "parameters": {
        "oldValue": {
          "x": -26.402555910543136,
          "y": -26.2194249201278
        },
        "newValue": {
          "x": -20.016486181288922,
          "y": -19.8776496629066
        }
      }
    }

#### OSC Bundle: Object Value

    {
      packets: [
        {
          address: "/buildAnAtom.atomScreen.model.protons_9.positionProperty/model/changed/newValue/x",
          args: [
            {
              type: "d",
              value: -20.016486181288922
            }
          ]
        },
        {
          address: "/buildAnAtom.atomScreen.model.protons_9.positionProperty/model/changed/newValue/y",
          args: [
            {
              type: "d",
              value: -19.8776496629066
            }
          ]
        }
      ]
    }

## Filtering Events

In many cases, only a subset of events are relevant for a sonification. A simple mechanism for specifying which events are required, and a means for re-basing or aliasing those addresses, is provided.

<table>
  <tr>
    <th>Filter Property</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>phetioID</code></td>
    <td>The PhET io ID of the object from which you want listen for events</td>
  </tr>
  <tr>
    <td><code>event</code></td>
    <td>The event name to listen for</td>
  </tr>
  <tr>
    <td><code>address</code></td>
    <td>A custom OSC address to use</td>
  </tr>
  <tr>
    <td><code>parameters</code></td>
    <td>The parameter which, when changed, should cause an OSC message to be sent</td>
  </tr>
</table>

In the case that more than one ``parameter`` is specified and a custom ``address`` is also provided, the parameter name will be appended to the end of the specified ``address``. Otherwise, the standard addressing scheme is used.

### Example

Listen only for the following changes:
* the new proton count
* the new particle count
* the new charge property
* the new element name
* both the old and the new stability of the atom

#### Event Subscription Specification

    {
      eventSubscriptions: [
        {
          phetioID: "buildAnAtom.atomScreen.model.particleAtom.protonCountProperty",
          event: "changed",
          address: "/atom/protonCount",
          parameters: ["newValue"]
        },
        {
          phetioID: "buildAnAtom.atomScreen.model.particleAtom.chargeProperty",
          event: "changed",
          address: "/atom/charge",
          parameters: ["newValue"]
        },
        {
          phetioID: "buildAnAtom.atomScreen.model.particleAtom.particleCountProperty",
          event: "changed",
          address: "/atom/particleCount",
          parameters: ["newValue"]
        },
        {
          phetioID: "buildAnAtom.atomScreen.view.atomNode.stabilityIndicator",
          event: "textChanged",
          address: "/atom/elementName",
          parameters: ["newValue"]
        },
        {
          phetioID: "buildAnAtom.atomScreen.view.atomNode.stabilityIndicator",
          event: "textChanged",
          address: "/atom/stability",
          parameters: ["newValue", "oldValue"]
        }
      ]
    }
