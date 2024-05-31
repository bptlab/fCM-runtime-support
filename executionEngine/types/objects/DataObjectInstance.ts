import { DataObjectClass } from "./DataObjectClass";

/**
 * Represents a concrete instance of a {@link DataObjectClass}.
 */
export class DataObjectInstance {
    id: string;
    name: string;
    dataclass: DataObjectClass;

    public constructor(id: string, name: string, dataclass: DataObjectClass) {
        this.id = id;
        this.name = name;
        this.dataclass = dataclass;
    }
}
