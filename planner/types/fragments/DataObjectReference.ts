import {Dataclass} from "../Dataclass";
import {DataObjectInstance} from "../executionState/DataObjectInstance";

export class DataObjectReference {
    dataclass: Dataclass;
    state: string;
    isList: boolean;

    public constructor(dataclass: Dataclass, states: string,  isList: boolean) {
        this.dataclass = dataclass;
        this.state = states;
        this.isList = isList;
    }

    public isMatchedBy (dataObjectInstance: DataObjectInstance) {
        return this.dataclass === dataObjectInstance.dataclass && this.state === dataObjectInstance.state;
    }
}