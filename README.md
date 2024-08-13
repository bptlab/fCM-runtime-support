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

### Design Time

There is a [demo video](https://www.youtube.com/watch?v=bIDZUYBNms0) and a [use case tutorial](/.docs/Tutorial.md) to showcase how to use the initial fcm-js without extensions.

In the top right corner, users can switch between the different modelers for fCM. The Fragment Modeler allows to model the process fragments that define the activities and their ordering constraints. Activities may specify a duration, a role, and a capacity. The expected duration is a fixed number of time units, the role corresponds to a role model, and the capacity determines how many resources of the specified role are required to execute the activity.
<img width="1439" alt="Screenshot 2023-09-03 at 08 11 06" src="https://github.com/bptlab/fCM-design-support/assets/32839252/ecddd337-25d8-4b3e-9280-7d6868ba2486">

The Data Model allows to specify the data classes and their relation in the process.
<img width="1440" alt="Screenshot 2023-09-03 at 08 11 18" src="https://github.com/bptlab/fCM-design-support/assets/32839252/a24caab2-5374-47f4-9b67-54a287215fa4">

The Object Life-Cycles (OLCs) describe the states and their transitions for every class of the data model.
<img width="1440" alt="Screenshot 2023-09-03 at 08 11 39" src="https://github.com/bptlab/fCM-design-support/assets/32839252/857b3651-77d8-4e44-b581-e83f7a3e50e4">

The Role Model allows for defining the possible roles for activities.
<img width="1440" alt="Screenshot 2023-09-03 at 08 11 53" src="https://github.com/bptlab/fCM-design-support/assets/32839252/4ec26c5e-3eb0-4644-b9ef-1bac8fcf5ff9">

The Resource Model allows to specify the available resources for the case. A resource may belong to multiple roles. It can have a capacity and an availability to specify if the resource incorporates multiple available resources and if there is a limited availability over time.
<img width="1440" alt="Screenshot 2023-09-03 at 08 12 04" src="https://github.com/bptlab/fCM-design-support/assets/32839252/b197f704-fc8e-4855-aef7-5696616ff110">

The Termination Condition states a logic expression under which the case can be terminated.
<img width="1440" alt="Screenshot 2023-09-03 at 08 12 14" src="https://github.com/bptlab/fCM-design-support/assets/32839252/57362aa9-5b15-4798-9228-e639530803c8">

### Run Time

You can see the option "Execution Interface" in the dropdown. In the following screenshot you can see it including the (1) fragment interface, (2) data object tables, (3) an enabled activity, (4) an enabled and selected activity, (5) the popover to select input-, output-set, and object data and (6) event log. The numbers are added to the figure.

![paper-ocpm-interface-annotated](https://github.com/user-attachments/assets/d2f1be25-d493-4eaf-8442-16408d20ec83)

By clicking an a enabled activity you can select the input-, output-set, and object data and execute the activity. It'll automatically update the event log, enabled activities and data object tables.

## License

[MIT](LICENSE)

Contains parts of [bpmn-io](https://github.com/bpmn-io) released under the [bpmn.io license](http://bpmn.io/license), and [diagram-js](https://github.com/bpmn-io/diagram-js) and [object diagram modeler](https://github.com/timKraeuter/object-diagram-modeler/tree/master/modeler) released under the MIT license.
