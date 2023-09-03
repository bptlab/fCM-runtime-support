# fCM-js

fCM-js is a modeling tool for fragment-based case management. It aims at supporting users at design time by providing a joint, visual user interface for all artifacts and by integrating automated guideline checking based on fCM guidelines.
This repository provides an extension of fCM-js that allows modeling roles and resources that are consistent with the fCM model and allows specifying the expected duration of activities.
Combined with goal models, these extensions allow to automatically compute plans for execution.

### ***[:rocket: Try it live! :rocket:](https://bpt-lab.org/fcm-js/)***

fcm-js is a modeling tool for fragment-based case management. It aims at supporting users at design time by providing a joint, visual user interface for all artifacts and by integrating automated guideline checking based on fCM guidelines.

The catalog of fCM guidelines is also available in this repository in [the wiki](../../wiki).

Further development took place in this [forked repository](https://github.com/Noel-Bastubbe/for-Construction-Modeling).
The initial fcm-js was extended to support the modeling of goals and case participants that have multiple roles. Furthermore it is possible to define the expected duration of activities and executive roles with capacities. Given a valid case model, the tool is able to generate an execution plan. Although the extensions by time, participants and goals are considered, the automated planning still has limitations as described in the forked repositories' [wiki](https://github.com/Noel-Bastubbe/for-Construction-Modeling/wiki/Planner).

## Content

The example that is discussed in the paper "Extending Case Models to Capture Organizational Aspects and Time" can be found in the `example` folder. It contains the zip folder `flat_renovation.zip` that can be opened and used in the tool.

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

The extensions for the automated planning are implemented in typescript. Therefore these file must be compiled to javascript. The previously described scripts should do this automatically. However the following command can be run manually:
```shell
npx tsc
```

## Usage
There is a [demo video](https://www.youtube.com/watch?v=bIDZUYBNms0) and a [use case tutorial](/.docs/Tutorial.md) to showcase how to use the initial fcm-js without extensions.

...

## License

[MIT](LICENSE)

Contains parts of [bpmn-io](https://github.com/bpmn-io) released under the [bpmn.io license](http://bpmn.io/license), and [diagram-js](https://github.com/bpmn-io/diagram-js) and [object diagram modeler](https://github.com/timKraeuter/object-diagram-modeler/tree/master/modeler) released under the MIT license.
