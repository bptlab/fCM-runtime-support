import { DataObjectReference } from "./DataObjectReference";
import { DataObjectInstanceWithState } from "../objects/DataObjectInstanceWithState";

/**
 * Represents an Input- or Output-Set for an activity modeled in the Fragment Modeler.
 * It consists of multiple {@link DataObjectReference} elements.
 */
export class IOSet {
    set: DataObjectReference[];

    public constructor(set: DataObjectReference[]) {
        this.set = set;
    }

    /**
     * Returns whether the set is matched by a set of {@link DataObjectInstanceWithState} elements.
     */
    public isSatisfiedBy(stateInstances: DataObjectInstanceWithState[]): boolean {
        for (let dataObjectReference of this.set) {
            let foundMatchingStateInstance: boolean = false;
            for (let stateInstance of stateInstances) {
                if (dataObjectReference.isMatchedBy(stateInstance)) {
                    foundMatchingStateInstance = true;
                    break;
                }
            }
            if (!foundMatchingStateInstance) {
                return false;
            }
        }
        return true;
    }
}
