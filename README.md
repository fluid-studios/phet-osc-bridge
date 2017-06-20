# PhET to Open Sound Control Bridge

The PhET OSC Bridge provides a means for sending events fired by a [PhET](https://phet.colorado.edu/) physics simulation, [wrapped with PhET-iO](https://phet-io.colorado.edu/devguide/#documentation), to remote processes using the [Open Sound Control](http://opensoundcontrol.org/spec-1_0) protocol. The purpose of this bridge is to make it easier for sound designers to use familiar audio synthesis tools such as Max and SuperCollider, to quickly prototype sonifications for PhET.

## Useful Links
* Public [PhET.io Developer Guide](https://phet-io.colorado.edu/devguide/#documentation)
* The [Open Sound Control 1.0 Specification](http://opensoundcontrol.org/spec-1_0)
* [osc.js](https://github.com/colinbdclark/osc.js)

## Architecture

The PhET OSC Bridge includes several components:

1. A client-side JavaScript component, the <code>phetosc.bridge</code> that can be added to any PhET-iO wrapper HTML page to listen for sim events.
2. A web server that serves up PhET-iO wrapper HTML pages, and responds to incoming Web Socket requests from the client-side bridge component.
3. An OSC output port (configured to use UDP by default) that relays OSC messages to the the remote server (e.g. SuperCollider or Max).

## Using the PhET OSC Bridge

### Getting Set Up
First, follow the instructions provided with your PhET-iO license to generate an appropriate wrapper HTML page. More information is available in the [PhET-iO Developer's Guide](https://phet-io.colorado.edu/devguide/).

Secondly, install the <code>phet-osc-bridge</code> npm module:

    npm install -g phet-osc-bridge

### Adding the Bridge Component to your PhET-iO Wrapper
The PhET OSC Bridge web server will serve up the required client JavaScript file. You just need to add it to your PhET-iO wrapper's head using a <code>script</code> tag:

    <script type="text/javascript" src="/phet-osc-bridge/phet-osc-bridge.js"></script>

Next, you'll need to instantiate the bridge component and bind it to the PhET sim's <code>simIFrameClient</code> object. This will cause all events emitted from the sim to be available across the bridge. Paste this code into the <code>onSimInitialized</code> event handler function that is included in your wrapper's call to <code>simIFrameClient.launchSim()</code>:

    var simIFrameClient = new SimIFrameClient(document.getElementById("sim"));

    simIFrameClient.launchSim(sim.URL, {
        onSimInitialized: function () {
            var oscBridge = phetosc.bridge();
            oscBridge.bind(simIFrameClient);
        }
    });

### Starting the Bridge's Server
Lastly, you'll need to start the PhET OSC Bridge server. In your terminal, navigate to the directory in which your PhET-iO wrapper files are located, and run:

    phet-osc-bridge --phetPath .

By default, your wrapper file will be available in your web browser at ``http://localhost:8081/<wrapper-file-name>``.

## Server Configuration Options
Other configuration options can be specified on the command line. More information can be found by running the <code>phet-osc-bridge</code> command with the <code>--help</code> flag.

## Bridge Options

The <code>phetosc.bridge</code> component provides a variety of configuration options, which are described in the sections below.

### Filtering Events
In many cases, only a subset of events are relevant for a sonification. The <code>phetioIDPatterns</code> option allows you to specify an array of regular expression patterns that will be matched against the <code>phetioID</code> of events. Only those events with a <code>phetioID</code> matching one of the regular expressions specified in <code>phetiodIDPatterns</code> will be converted and sent via OSC (i.e. the patterns are ORed together).

#### Example: Listening Only for Particle Count Change Events

    var oscBridge = phetosc.bridge({
        phetioIDPatterns: [
            "buildAnAtom.atomScreen.model.particleAtom.particleCountProperty"
        ]
    });

### Excluding Parameters
Some parameters may not be relevant for sonification, such as the <code>oldValue</code> parameter that is specified whenever a property changes. The <code>excludeParameters</code> option can be specified to filter out parameters by name.

#### Example: Filtering out <code>oldValue</code> Parameters

    var oscBridge = phetosc.bridge({
        excludeParameters: [
            "oldValue"
        ]
    });

### Mapping OSC Addresses
 By default, PhET OSC Bridge will use a long-form address space like this:

``/<phetioID>/<event>/<name>/<parameter>/<parameter value key>``

In some cases, however, you may want to map the outgoing OSC messages to a simpler address space. The <code>addressMap</code> option allows you to provide alternative addresses for specified events. This option should provide, as key, the long-form OSC address you'd like to map; the value is the new address.

``<long form event address>: <mapped address>``

#### Example: Mapping the OSC Address for Particle Count Changes

    var oscBridge = phetosc.bridge({
        addressMap: {
            "/buildAnAtom.atomScreen.model.particleAtom.particleCountProperty/model/changed/newValue": "/particleCount"
        }
    });

## PhET -> OSC Implementation Details
Open Sound Control message payloads are flat; there is no way to send named parameters, dictionaries, or objects within an OSC message. PhET events, however, represent changes within a hierarchical value space consisting both of user interface components and model properties. When binding PhET events to OSC, a message denotes a change to a single value within an object that is uniquely identified by the structure of the OSC message's address.

### Types of PhET Events
* User: triggered by a user action
* Model: a change in the simulation's sate

### Structure of a PhET Event
* Events are hierarchical; they can contain ``children`` events that "were triggered while this event was being processed." In this OSC binding, we have flattened the parent/child event structure, treating them as a flat sequence of events.
* Events are fired by objects, which are uniquely identified by keypath-style structures ("foo.bar.baz").

### Binding PhET Events to OSC Addresses
In order to accurately map JSON objects to OSC messages, each event can be represented as an OSC bundle. Each property of each event parameter is a separate message within the bundle.

``/<phetioID>/<event>/<name>/<parameter>/<parameter value key>``

Since bundles can sometimes be inconvenient to work with in environments like SuperCollider or Max, the <code>bundleParameters</code> option can be set to <code>false</code> to send unbundled messages. This is the default.

### Example PhET to OSC Transformations

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
