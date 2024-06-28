import { DataObjectClass } from "./objects/DataObjectClass";
import { DataObjectInstance } from "./objects/DataObjectInstance";
import { DataObjectInstanceWithState } from "./objects/DataObjectInstanceWithState";
import { DataObjectInstanceLink } from "./objects/DataObjectInstanceLink";

/**
 * Represents a concrete state of the execution.
 */
export class ExecutionState {
    currentStateInstances: DataObjectInstanceWithState[];
    instanceLinks: DataObjectInstanceLink[];

    public constructor(currentStateInstances: DataObjectInstanceWithState[], instanceLinks: DataObjectInstanceLink[]) {
        this.currentStateInstances = currentStateInstances;
        this.instanceLinks = instanceLinks;
    }

    /**
     * Based on the state, creates a new instance of a {@link DataObjectClass} (so an {@link DataObjectInstance}).
     */
    public getNewInstanceOfClass(dataclass: DataObjectClass): DataObjectInstance {
        const alreadyPresentInstancesForClass = this.currentStateInstances.filter(stateInstance =>
            stateInstance.instance.dataclass === dataclass
        );
        const nameOfNewInstance = `${dataclass.name}${alreadyPresentInstancesForClass.length + 1}`;
        return new DataObjectInstance(nameOfNewInstance, nameOfNewInstance, dataclass);
    }
}
