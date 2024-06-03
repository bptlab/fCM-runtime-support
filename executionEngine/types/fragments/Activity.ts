import { IOSet } from "./IOSet";
import { DataObjectInstance} from "../objects/DataObjectInstance";
import { DataObjectInstanceLink } from "../objects/DataObjectInstanceLink";
import { DataObjectInstanceWithState } from "../objects/DataObjectInstanceWithState";
import { Action } from "../Action";
import { ExecutionState } from "../ExecutionState";
import { cartesianProduct } from "../../../util/Util";

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
     * Returns whether the activity specifies an empty input set.
     */
    private needsNoInput(): boolean {
        return this.inputSet.set.length === 0;
    }

    /**
     * Based on a concrete {@link ExecutionState}, returns the possible execution {@link Action}s for this activity.
     */
    public getActions(executionState: ExecutionState): Action[] {
        if (this.needsNoInput()) {
            return [this.getActionForInput([], executionState)];
        }
        const inputCombinations: DataObjectInstanceWithState[][] = this.getPossibleInputCombinations(executionState);
        return inputCombinations.map(inputCombination => this.getActionForInput([...inputCombination], executionState));
    }

    /**
     * Returns whether this activity is enabled in a given {@link ExecutionState}.
     * In other words, is there a combination of objects that enables the activity?
     */
    public isEnabled(executionState: ExecutionState): boolean {
        const possibleInputCombinations: DataObjectInstanceWithState[][] = this.getPossibleInputCombinations(executionState);
        return possibleInputCombinations && possibleInputCombinations.length > 0;
    }

    /**
     * Aggregates all possible input combinations (combination of {@link DataObjectInstanceWithState} elements) for this activity.
     * Note that, an input set can obviously contain different object references, which need to be checked and that leads to the combinations.
     */
    public getPossibleInputCombinations(executionState: ExecutionState): DataObjectInstanceWithState[][] {
        const possibleStateInstances: DataObjectInstanceWithState[][] = [];
        for (const dataObjectReference of this.inputSet.set) {
            const matchingStateInstances = executionState.currentStateInstances.filter(stateInstance =>
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
        const outputList = this.getOutputForInput(inputList, executionState);
        const addedLinks = this.getAddedLinks(inputList.map(input => input.instance), outputList.map(output => output.instance));
        return new Action(this, inputList, outputList, addedLinks);
    }

    /**
     * Based on an input list of {@link DataObjectInstanceWithState} elements and a concrete {@link ExecutionState},
     * returns the output objects that are affected by executing the activity with the given input objects.
     */
    private getOutputForInput(inputList: DataObjectInstanceWithState[], executionState: ExecutionState): DataObjectInstanceWithState[] {
        return this.outputSet.set.map(output => {
            const stateInstance: DataObjectInstanceWithState | undefined = inputList.find(stateInstance =>
                stateInstance.instance.dataclass === output.dataclass
            );
            if (stateInstance) {
                return new DataObjectInstanceWithState(stateInstance.instance, output.state);
            } else {
                const newInstance: DataObjectInstance = executionState.getNewInstanceOfClass(output.dataclass);
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

        for (const addedInstance of addedInstances) {
            for (const instance of allInstances) {
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
