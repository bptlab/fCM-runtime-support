import {IOSet} from "./IOSet";
import {Resource} from "../Resource";
import {DataObjectInstance} from "../executionState/DataObjectInstance";
import {ExecutionAction} from "../executionState/ExecutionAction";
import {Activity} from "./Activity";
import {ExecutionState} from "../executionState/ExecutionState";

export class Action {
    activity: Activity;
    inputSet: IOSet;
    outputSet: IOSet;

    public constructor(activity: Activity, inputSet: IOSet, outputSet: IOSet) {
        this.activity = activity;
        this.inputSet = inputSet;
        this.outputSet = outputSet;
    }

    public getExecutionActions(currentState: ExecutionState): ExecutionAction[] {

    }

    private getExecutionActionForInput(inputList: DataObjectInstance[], resource: Resource) {
        let outputList = this.getOutputForInput(inputList);
        return new ExecutionAction(this, 0, resource, inputList, outputList);
    }

    private getOutputForInput(inputList: DataObjectInstance[]): DataObjectInstance[] {
        let output = this.outputSet.set.map(dataObjectReference => {
            let instance = inputList.find(dataObjectInstance => dataObjectInstance.dataclass === dataObjectReference.dataclass);
            if (instance) {
                return new DataObjectInstance(instance.name, instance.dataclass, dataObjectReference.states[0]);
            } else {
                return new DataObjectInstance("new", dataObjectReference.dataclass, dataObjectReference.states[0]);
            }
        });
        return output;
    }
}
