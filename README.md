# Goal Models for fCM-js

This repository is a fork of [fCM-js]{https://github.com/bptlab/fCM-design-support}. fCM-js is a modeling tool for fragment-based case management. It aims at supporting users at design time by providing a joint, visual user interface for all artifacts and by integrating automated guideline checking based on fCM guidelines.
This repository provides an extension of fCM-js that allows modeling goals that are consistent with the fCM model. Goals can be modeled as a dependency graph that orders objectives. Objectives can be modeled as UML object diagrams.
The tool [fcm2cpn](https://github.com/bptlab/fcm2cpn) allows to generate a colored Petri net (CPN) that represents the formal translational semantics of an fCM model. This CPN can be executed in [CPN Tools](http://cpntools.org).
The goals modeled in this tool, can be used to generate state space queries that can be used in the CPN representation of an fCM model to derive recommendations for the current state of execution. 

## Content

The example that is discussed in the paper "Data-centric Goal Modeling for Knowledge-intensive Processes" can be found in the `example` folder. It contains CPN file `construction.cpn` that can be run by CPN Tools and the zip folder `construction.zip` that can be opened and used in the tool.

## Installation
Node needs to be installed for the modeler to run.

To install the modeler, clone this repository on your machine. To start, navigate to the installation folder and enter the following into your command line:
```shell
npm install
npm run build
npm run serve
```

The modeler is then served to `http://localhost:9005`.

When developing, the following can be run to automatically re-bundle on changes:
```shell
npm run dev
```

## Usage

...

## License

[MIT](LICENSE)

Contains parts of [bpmn-io](https://github.com/bpmn-io) released under the [bpmn.io license](http://bpmn.io/license), and [diagram-js](https://github.com/bpmn-io/diagram-js) and [object diagram modeler](https://github.com/timKraeuter/object-diagram-modeler/tree/master/modeler) released under the MIT license.
