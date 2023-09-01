# Goal Models for fCM-js

fCM-js is a modeling tool for fragment-based case management. It aims at supporting users at design time by providing a joint, visual user interface for all artifacts and by integrating automated guideline checking based on fCM guidelines.
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

The modeler is then served to [http://localhost:9005](http://localhost:9005).

When developing, the following can be run to automatically re-bundle on changes:
```shell
npm run dev
```

## Usage

This tool allows creating goal models that are within the scope of an fCM model. Analog to [fCM-js](https://github.com/bptlab/fCM-design-support), a modeler can model fragments, a data model, object lifecycles, and a termination condition in separate modelers to specify their process.
Additionally, this tool provides an `Objective Modeler` to model multiple objectives and a `Dependency Modeler` to model a goal. The different modelers can be accessed by choosing from the dropdown menu at the top right.

<img width="600" alt="Screenshot 2023-05-31 at 21 29 51" src="https://github.com/Noel-Bastubbe/for-Construction-Modeling/assets/32839252/4b0ff02d-7e56-4a64-b2da-92a24306f0eb">


To access the model presented in the paper "Data-centric Goal Modeling for Knowledge-intensive Processes", run the tool as described and click the `Open` button. Then select the file `example/construction.zip` in this repository. The example fCM is uploaded including the goal model presented in the paper.

### Objective Modeler

The objective modeler allows defining multiple objectives as UML object diagrams. The modeler can create new objects that are instances of the classes of the fCM's data model. Links can be created, that connect the objects. For each object, a class needs to be defined. For an object, an instance can be created.
Also, allowed states for the object can be defined. Per default, the state is defined as `any`. From the list of states as defined in the OLC for the selected class the desired states can be selected.

<img width="600" alt="Screenshot 2023-05-31 at 21 31 22" src="https://github.com/Noel-Bastubbe/for-Construction-Modeling/assets/32839252/f6dc464f-fdd4-46e8-9798-2fecf9cd26c4">

### Goal Modeler

The goal modeler allows to define the temporal order in which the objectives are ought to hold. It is a dependency graph and defines a partial order of objectives. All modeled objectives are represented as a node in the modeler. They can be connected with directed arcs to define the ordering constraints.

<img width="600" alt="Screenshot 2023-05-31 at 22 26 57" src="https://github.com/Noel-Bastubbe/for-Construction-Modeling/assets/32839252/1d8de9bc-fbc9-4cc2-8255-5cced37a016e">

### Generating State Space Queries

The modeler allows to generate state space queries that can be used to derive recommendations while executing the fCM in CPN Tools.
By clicking on the button in the bottom right corner, a state space query is compiled for the modeled goal. As a result, a text file is downloaded containing the query. This query can be used in CPN Tools.

<img width="600" alt="Screenshot 2023-05-31 at 21 33 34" src="https://github.com/Noel-Bastubbe/for-Construction-Modeling/assets/32839252/04e9a431-8913-424e-819c-04096c4e766d">

### Using a State Space Query in CPN Tools

The downloaded state space query can be used in CPN Tools. Download [CPN Tools](https://cpntools.org/category/downloads/) and run a CPN that is the result of the [fcm2cpn](https://github.com/bptlab/fcm2cpn) compiler or open the provided example from `example/construction.cpn`.
You can execute the CPN by choosing the simulation tool and selecting the enabled (green) transitions in the according tabs.

<img width="600" alt="CT1" src="https://github.com/Noel-Bastubbe/for-Construction-Modeling/assets/32839252/bee17adc-4ca1-4697-969c-e18f59ec802a">

For example, execute the following sequence of actions:
1. Execute the start event `construction site started`.
2. Execute the action `start house`.
3. Create two new apartments by executing `build apartment` twice.
4. Paint the second apartment yellow by executing the transition `paint_apartment0_0` in the `paint apartment` tab for the token with the id `assignment1`. This specific transition represents one of the possible 4 input-output-set combinations in the fCM (Apartments in init or with tiles can be painted either yellow or green).

<img width="600" alt="CT2" src="https://github.com/Noel-Bastubbe/for-Construction-Modeling/assets/32839252/6631edbe-ece6-4279-9f01-23b3270eaa4f"> 

Now the state of the case is that there is one house in the state started. It has two apartments. The first is in init. The second is painted with yellow paint. Now, different actions are available, for which a recommendation is needed.

For the current situation, the state space can be generated (1). Then the SCC Graph needs to be calculated (2). Afterward, the state space can be visualized by adding the current state (3) and its successor nodes (4). When clicking on the arcs, the information on the concrete actions is displayed.

<img width="600" alt="CT3" src="https://github.com/Noel-Bastubbe/for-Construction-Modeling/assets/32839252/2555833d-d5ef-430e-8aec-c7105af64b2e">

To receive recommendations for the current situation, the desired goals can be defined in the objective modeler and the dependency modeler and a state space query can be generated. It can be downloaded and pasted into a text field in CPN Tools. It can be executed as a Standard ML code snippet. The query returns a list of pairs of next actions and a boolean indicating whether or not it aligns with the defined goal.

<img width="600" alt="CT6" src="https://github.com/Noel-Bastubbe/for-Construction-Modeling/assets/32839252/76b5a31b-ca5b-406c-9f8f-73f1be4419cb">

For the given example, five actions are enabled.
(i) For `lay_tiles1_0`, i.e. laying tiles for the second apartment, it returns false. This action does not align with the goal.
(ii) For `lay_tiles0_0`, i.e. laying tiles for the first apartment, it returns ture, because it aligns with the goal.
(iii) For `paint_apartment0_1`, i.e. painting the first apartment green, it returns true. This action can be executed.
(iv) For `paint_apartment0_0`, i.e. painting the first apartment yellow, it returns false. This action should not be executed.
(v) For building a new apartment in `build_apartment0_0`, the query returns true. This is allowed to happen to still reach the goal.

## License

[MIT](LICENSE)

Contains parts of [bpmn-io](https://github.com/bpmn-io) released under the [bpmn.io license](http://bpmn.io/license), and [diagram-js](https://github.com/bpmn-io/diagram-js) and [object diagram modeler](https://github.com/timKraeuter/object-diagram-modeler/tree/master/modeler) released under the MIT license.
