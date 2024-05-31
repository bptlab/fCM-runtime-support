import { IOSet } from "./IOSet";
import { DataObjectInstance} from "../objects/DataObjectInstance";
import { DataObjectInstanceLink } from "../objects/DataObjectInstanceLink";
import { DataObjectInstanceWithState } from "../objects/DataObjectInstanceWithState";
import { Action } from "../Action";
import { ExecutionState } from "../ExecutionState";
import { cartesianProduct } from "../../../../fCM-design-support/planner/Util";

/**
 * Represents an activity that was modeled in the Fragment Modeler.
 */
export class Activity {
    name: string;
    inputSet: IOSet;
    outputSet: IOSet;

    public constructor(name: string, inputSet: IOSet, outputSet: IOSet) {
        this.name = name;
        this.inputSet = inputSet;
        this.outputSet = outputSet;
    }

    /**
     * Based on a concrete {@link ExecutionState}, returns the possible execution {@link Action}s for this activity.
     */
    public getActions(executionState: ExecutionState): Action[] {
        let actions: Action[] = [];
        let needsInput: boolean = this.inputSet.set.length > 0;

        if (needsInput) {
          let inputs: any[] = this.getPossibleInputs(executionState);
          for (let input of inputs) {
            actions.push(this.getActionForInput([...input], executionState));
          }
        } else {
          actions.push(this.getActionForInput([], executionState));
        }
        return actions;
    }

    /**
     * Aggregates all possible inputs (combination of {@link DataObjectInstanceWithState} elements) for this activity.
     */
    private getPossibleInputs(executionState: ExecutionState): any[] {
        let possibleStateInstances: DataObjectInstanceWithState[][] = [];
        for (let dataObjectReference of this.inputSet.set) {
            let matchingStateInstances = executionState.currentStateInstances.filter(stateInstance =>
                dataObjectReference.isMatchedBy(stateInstance)
            );
            possibleStateInstances.push(matchingStateInstances);
        }
        return cartesianProduct(...possibleStateInstances);
    }

    /**
     * Based on an input list of {@link DataObjectInstanceWithState} elements and a concrete {@link ExecutionState},
     * returns the action that is associated with executing the activity with the given input objects.
     */
    private getActionForInput(inputList: DataObjectInstanceWithState[], executionState: ExecutionState) {
        let outputList = this.getOutputForInput(inputList, executionState);
        let addedLinks = this.getAddedLinks(inputList.map(input => input.instance), outputList.map(output => output.instance));
        return new Action(this, inputList, outputList, addedLinks);
    }

    /**
     * Based on an input list of {@link DataObjectInstanceWithState} elements and a concrete {@link ExecutionState},
     * returns the output objects that are affected by executing the activity with the given input objects.
     */
    private getOutputForInput(inputList: DataObjectInstanceWithState[], executionState: ExecutionState): DataObjectInstanceWithState[] {
        return this.outputSet.set.map(output => {
            let stateInstance: DataObjectInstanceWithState | undefined = inputList.find(stateInstance =>
                stateInstance.instance.dataclass === output.dataclass
            );
            if (stateInstance) {
                return new DataObjectInstanceWithState(stateInstance.instance, output.state);
            } else {
                let newInstance: DataObjectInstance = executionState.getNewInstanceOfClass(output.dataclass);
                return new DataObjectInstanceWithState(newInstance, output.state);
            }
        });
    }

    /**
     * Based on both the input list and the output list of {@link DataObjectInstance} elements,
     * find out which {@link DataObjectInstanceLink}s were added by executing the activity.
     */
    private getAddedLinks(inputList: DataObjectInstance[], outputList: DataObjectInstance[]): DataObjectInstanceLink[] {
        const addedLinks: DataObjectInstanceLink[] = [];
        const addedInstances: DataObjectInstance[] = this.getAddedInstances(inputList, outputList);
        const readInstances: DataObjectInstance[] = inputList.filter(inputEntry => !outputList.find(outputEntry => inputEntry.dataclass === outputEntry.dataclass));
        const allInstances: DataObjectInstance[] = outputList.concat(readInstances);

        for (let addedInstance of addedInstances) {
            for (let instance of allInstances) {
                if (addedInstance != instance) {
                    addedLinks.push(new DataObjectInstanceLink(addedInstance, instance));
                }
            }
        }

        return addedLinks;
    }

    /**
     * Based on both the input list and the output list of {@link DataObjectInstance} elements,
     * find out which {@link DataObjectInstance}s were added by executing the activity.
     */
    private getAddedInstances(inputList: DataObjectInstance[], outputList: DataObjectInstance[]) {
        return outputList.filter(outputEntry => !inputList.find(inputEntry => inputEntry.dataclass === outputEntry.dataclass));
    }
}
