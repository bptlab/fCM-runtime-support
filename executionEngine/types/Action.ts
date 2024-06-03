import { ExecutionState } from "./ExecutionState";
import { Activity } from "./fragments/Activity";
import { DataObjectInstanceLink } from "./objects/DataObjectInstanceLink";
import { DataObjectInstanceWithState } from "./objects/DataObjectInstanceWithState";

/**
 * Represents the concrete execution of an {@link Activity} in context of a {@link ExecutionState}.
 */
export class Action {
    activity: Activity;
    inputList: DataObjectInstanceWithState[];
    outputList: DataObjectInstanceWithState[];
    addedInstanceLinks: DataObjectInstanceLink[];

    public constructor(activity: Activity, inputList: DataObjectInstanceWithState[], outputList: DataObjectInstanceWithState[], addedInstanceLinks: DataObjectInstanceLink[]) {
        this.activity = activity;
        this.inputList = inputList;
        this.outputList = outputList;
        this.addedInstanceLinks = addedInstanceLinks;
    }

    /**
     * Executes the action and returns the new {@link ExecutionState}.
     * Currently, there is no distinction between starting and finishing.
     */
    public execute(executionState: ExecutionState): ExecutionState {
        return this.computeStateChanges(executionState);
    }

    /**
     * Returns the concrete {@link DataObjectInstanceWithState} elements that were changed during the execution.
     */
    private getChangedExecutionDataObjectInstances(): DataObjectInstanceWithState[] {
        const changedExecutionDataObjectInstances: DataObjectInstanceWithState[] = [];
        for (const input of this.inputList) {
            if (this.outputList.some(output => output.instance === input.instance)) {
                changedExecutionDataObjectInstances.push(input);
            }
        }
        return changedExecutionDataObjectInstances;
    }

    /**
     * Computes the changed {@link ExecutionState} for the execution.
     */
    private computeStateChanges(executionState: ExecutionState): ExecutionState {
        const changedExecutionDataObjectInstances = this.getChangedExecutionDataObjectInstances();
        const newInstanceLinks = executionState.instanceLinks.concat(this.addedInstanceLinks);
        return new ExecutionState(changedExecutionDataObjectInstances, newInstanceLinks);
    }
}
