"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Activity = void 0;
const DataObjectInstance_1 = require("../executionState/DataObjectInstance");
const InstanceLink_1 = require("../executionState/InstanceLink");
class Activity {
    constructor(name, duration = 1, NoP = 1, role = null, input, output) {
        this.name = name;
        this.duration = duration;
        this.NoP = NoP;
        this.role = role;
        this.inputSets = input;
        this.outputSet = output;
    }
    isExecutable(executionState, resources) {
        return this.inputSets.some(inputSet => inputSet.isSatisfiedBy(executionState)) && resources.some(resource => resource.satisfies(this.role, this.NoP));
    }
    getMatchingInputSet(DataObjectInstances) {
        return this.inputSets.find(inputSet => inputSet.isSatisfiedBy(DataObjectInstances));
    }
    createdDataObjectReferences() {
        let inputSet = [];
        if (this.inputSets.length > 0) {
            inputSet = this.inputSets[0].set;
        }
        let outputSet = this.outputSet.set;
        let createdDataObjectReferences = [];
        outputSet.forEach(function (DataObjectReference) {
            if (!inputSet.find(element => element.dataclass === DataObjectReference.dataclass)) {
                createdDataObjectReferences.push(DataObjectReference);
            }
        });
        return createdDataObjectReferences;
    }
    changedDataObjectReferences() {
        let inputSet = [];
        if (this.inputSets.length > 0) {
            inputSet = this.inputSets[0].set;
        }
        let outputSet = this.outputSet.set;
        let changedDataObjectReferences = [];
        for (let dataObjectReference of outputSet) {
            if (inputSet.find(element => element.dataclass === dataObjectReference.dataclass)) {
                changedDataObjectReferences.push(dataObjectReference);
            }
        }
        return changedDataObjectReferences;
    }
    execute(executionState, relevantDataObjectInstances) {
        let inputSet = this.getMatchingInputSet(relevantDataObjectInstances);
        if (!inputSet && relevantDataObjectInstances.length > 0) {
            console.error("Activity was not executable.");
        }
        let createdDataObjectReferences = this.createdDataObjectReferences();
        let changedDataObjectReferences = this.changedDataObjectReferences();
        for (let dataObjectReference of createdDataObjectReferences) {
            let newDataObjectInstanceName = dataObjectReference.dataclass.name + ":" + (executionState.getDataObjectInstanceOfClass(dataObjectReference.dataclass).length + 1);
            let newDataObjectInstance = new DataObjectInstance_1.DataObjectInstance(newDataObjectInstanceName, dataObjectReference.dataclass, dataObjectReference.states[0]);
            // This creates links to every DataObjectInstance that is part of the input and does not respect the restriction by the fcM to only link when there exists an association between the dataclasses
            for (let dataObjectInstance of relevantDataObjectInstances) {
                let newInstanceLink = new InstanceLink_1.InstanceLink(dataObjectInstance, newDataObjectInstance);
                executionState.links.push(newInstanceLink);
            }
            executionState.dataObjectInstances.push(newDataObjectInstance);
        }
        for (let dataObjectReference of changedDataObjectReferences) {
            if (dataObjectReference.isList) {
                let affectedDataObjectInstances = relevantDataObjectInstances.filter(DataObjectInstance => DataObjectInstance.dataclass === dataObjectReference.dataclass);
                for (let dataObjectInstance of affectedDataObjectInstances) {
                    dataObjectInstance.state = dataObjectReference.states[0];
                }
            }
            else {
                let affectedDataObjectInstance = relevantDataObjectInstances.find(DataObjectInstance => DataObjectInstance.dataclass === dataObjectReference.dataclass);
                if (affectedDataObjectInstance) {
                    affectedDataObjectInstance.state = dataObjectReference.states[0];
                }
                else {
                    console.error("Could not match a DataObjectReference to an affected DataObjectInstance");
                }
            }
        }
    }
}
exports.Activity = Activity;
