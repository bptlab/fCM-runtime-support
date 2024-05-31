import { DataObjectInstance } from "./DataObjectInstance";

/**
 * Represents a link between two {@link DataObjectInstance} elements.
 */
export class DataObjectInstanceLink {
    first: DataObjectInstance;
    second: DataObjectInstance;

    public constructor(first: DataObjectInstance, second: DataObjectInstance) {
        this.first = first;
        this.second = second;
    }
}
