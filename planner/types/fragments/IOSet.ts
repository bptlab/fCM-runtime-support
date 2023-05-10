import {DataObjectReference} from "./DataObjectReference";

export class IOSet {
    set: DataObjectReference[];

    public constructor(set: DataObjectReference[]) {
        this.set = set;
    }

    public satisfiedBy(currentState: string[]): boolean {
        let satisfiedBy = true;
        this.set.forEach(function (State) {
                if (!currentState.includes(State.state)) {
                    satisfiedBy = false;
                }
            }
        );
        return satisfiedBy;
    }
}