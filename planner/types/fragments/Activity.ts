import {IOSet} from "./IOSet";
import {Role} from "../Role";
import {Resource} from "../Resource";

export class Activity {
    name: string;
    duration: number;
    NoP: number;
    role: Role | null;
    inputSets: IOSet[];
    outputSet: IOSet;

    public constructor(name: string, duration: number = 1, NoP: number = 1, role: Role | null = null, input: IOSet[], output: IOSet) {
        this.name = name;
        this.duration = duration;
        this.NoP = NoP;
        this.role = role;
        this.inputSets = input;
        this.outputSet = output;
    }

    public isExecutable(executionState: string[], resources: Resource[]): boolean {
        return this.inputSets.some(inputSet => inputSet.satisfiedBy(executionState)) && resources.some(resource => resource.satisfies(this.role, this.NoP));
    }
}