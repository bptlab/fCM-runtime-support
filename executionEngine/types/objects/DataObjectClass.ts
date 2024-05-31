/**
 * Represents a class of data objects modeled in the Object Modeler.
 */
export class DataObjectClass {
    id: string
    name: string;

    public constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}
