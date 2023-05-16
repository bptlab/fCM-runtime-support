import {Dataclass} from "../Dataclass";

export class DataObjectInstance {
    name: string;
    dataclass: Dataclass;
    state: string;
    isAvailable: boolean = true;

    public constructor(name: string, dataclass: Dataclass, state: string) {
        this.name = name;
        this.dataclass = dataclass;
        this.state = state;
    }
}