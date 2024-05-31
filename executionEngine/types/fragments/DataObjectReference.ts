import { DataObjectClass } from "../objects/DataObjectClass";
import { DataObjectInstanceWithState } from "../objects/DataObjectInstanceWithState";

/**
 * Represents a data object modeled in the Fragment Modeler.
 */
export class DataObjectReference {
    dataclass: DataObjectClass;
    state: string;
    isList: boolean;

    public constructor(dataclass: DataObjectClass, state: string, isList: boolean) {
        this.dataclass = dataclass;
        this.state = state;
        this.isList = isList;
    }

    /**
     * Returns whether this object reference from the fragment is matched by a given {@link DataObjectInstanceWithState}.
     */
    public isMatchedBy(stateInstance: DataObjectInstanceWithState) {
        return this.dataclass === stateInstance.instance.dataclass && this.state === stateInstance.state;
    }
}
