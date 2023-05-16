import {IOSet} from "./IOSet";
import {Resource} from "../Resource";
import {DataObjectInstance} from "../executionState/DataObjectInstance";
import {ExecutionAction} from "../executionState/ExecutionAction";
import {Activity} from "./Activity";
import {ExecutionState} from "../executionState/ExecutionState";
import {Role} from "../Role";
import {DataObjectReference} from "./DataObjectReference";

export class Action {
    name: string;
    duration: number;
    NoP: number;
    role: Role | null;
    inputSet: IOSet;
    outputSet: IOSet;

    public constructor(name: string, duration: number = 1, NoP: number = 1, role: Role | null = null, inputSet: IOSet, outputSet: IOSet) {
        this.name = name;
        this.duration = duration;
        this.NoP = NoP;
        this.role = role;
        this.inputSet = inputSet;
        this.outputSet = outputSet;
    }

    public getExecutionActions(executionState: ExecutionState): ExecutionAction[] {
        let possibleInstances = [];
        for (let dataObjectReference of this.inputSet.set) {
            let matchingInstances = executionState.dataObjectInstances.filter(dataObjectInstance => dataObjectInstance.isAvailable && dataObjectReference.isMatchedBy(dataObjectInstance));
            possibleInstances.push(matchingInstances);
        }
        const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

        let inputs = cartesian(...possibleInstances);
    }

    private getExecutionActionForInput(inputList: DataObjectInstance[], resource: Resource) {
        let outputList = this.getOutputForInput(inputList);
        return new ExecutionAction(this, 0, resource, inputList, outputList,[]);
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
