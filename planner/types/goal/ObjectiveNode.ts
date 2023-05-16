import {Dataclass} from "../Dataclass";
import {DataObjectInstance} from "../executionState/DataObjectInstance";
import {ExecutionDataObjectInstance} from "../executionState/ExecutionDataObjectInstance";

export class ObjectiveNode {
    dataObjectInstance: DataObjectInstance;
    states: string[];

    public constructor(dataObjectInstance: DataObjectInstance, states: string[]) {
        this.dataObjectInstance = dataObjectInstance;
        this.states = states;
    }

    public isMatchedBy (executionDataObjectInstance: ExecutionDataObjectInstance) {
        return this.dataObjectInstance === executionDataObjectInstance.dataObjectInstance && this.states.includes(executionDataObjectInstance.state);
    }
}