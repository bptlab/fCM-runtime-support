import {Dataclass} from "../Dataclass";

export class DataObjectReference {
    dataclass: Dataclass;
    state: string[];
    isList: boolean;

    public constructor(dataclass: Dataclass, state: string[],  isList: boolean) {
        this.dataclass = dataclass;
        this.state = state;
        this.isList = isList;
    }
}