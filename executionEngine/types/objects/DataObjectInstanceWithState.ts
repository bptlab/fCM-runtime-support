import { DataObjectInstance } from "./DataObjectInstance";

/**
 * Represents a {@link DataObjectInstance} with a concrete state.
 */
export class DataObjectInstanceWithState {
    instance: DataObjectInstance;
    state: string;

    public constructor(instance: DataObjectInstance, state: string) {
      this.instance = instance;
      this.state = state;
    }
}
