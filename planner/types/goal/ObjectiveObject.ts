import {Instance} from "../executionState/Instance";
import {StateInstance} from "../executionState/StateInstance";

export class ObjectiveObject {
    id: string;
    instance: Instance;
    states: string[];
    dataClass: string;
    instanceName: string | null;

    public constructor(id: string, instance: Instance, states: string[], dataClass: string, instanceName: string | null) {
        this.id = id;
        this.instance = instance;
        this.states = states;
        this.dataClass = dataClass
        this.instanceName = instanceName
    }

    public isMatchedBy(stateInstance: StateInstance) {
        return this.instance.dataclass == stateInstance.instance.dataclass
            && this.instance.name == stateInstance.instance.name
            && this.states.includes(stateInstance.state);
    }
}