import { ActivityPredecessorInformation } from "./ActivityPredecessorInformation";
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
    id: string;
    name: string;
    inputSet: IOSet;
    outputSet: IOSet;
    predecessorInformation: ActivityPredecessorInformation;

    public constructor(id: string, name: string, inputSet: IOSet, outputSet: IOSet, predecessorInformation: ActivityPredecessorInformation) {
        this.id = id;
        this.name = name;
        this.inputSet = inputSet;
        this.outputSet = outputSet;
        this.predecessorInformation = predecessorInformation;
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
     * Returns whether this activity is enabled in a given {@link ExecutionState},
     * also considering the respective execution history for control-flow analysis.
     */
    public isEnabled(executionState: ExecutionState, executionHistory: Action[]): boolean {
        return this.isControlFlowEnabled(executionState, executionHistory) && this.isDataFlowEnabled(executionState);
    }

    /**
     * Returns whether this activity is data-flow-enabled in a given {@link ExecutionState}.
     * In other words, is there a combination of objects that enables the activity?
     *
     * Obviously, if the activity needs to input, it is always data-flow-enabled.
     */
    private isDataFlowEnabled(executionState: ExecutionState): boolean {
        if (this.needsNoInput()) {
            return true;
        }
        const possibleInputCombinations: DataObjectInstanceWithState[][] = this.getPossibleInputCombinations(executionState);
        return possibleInputCombinations && possibleInputCombinations.length > 0;
    }

    /**
     * Returns whether this activity is control-flow-enabled in a given {@link ExecutionState},
     * by also considering the respective execution history.
     *
     * Obviously, if the activity has no predecessors, it is always control-flow-enabled.
     */
    private isControlFlowEnabled(executionState: ExecutionState, executionHistory: Action[]): boolean {
        const { predecessors, hasParallelPredecessors } = this.predecessorInformation;
        if (predecessors.length === 0) {
            return true;
        }

        const possibleInputCombinations: DataObjectInstanceWithState[][] = this.getPossibleInputCombinations(executionState);
        // For a given predecessor, checks if there is a suitable action for it in the history.
        const canPredecessorBeFoundInHistory = (predecessor: string): boolean => {
            const predicateForHistoricAction = (historicAction: Action): boolean => {
                const describesPredecessor = historicAction.activity.name === predecessor;
                // There needs to be an intersection between the input or output list of the historic action
                // and at least one input combination of the current activity.
                let hasIODataOverlap = false;
                for (const inputCombination of possibleInputCombinations) {
                    // Note that the intersection check needs to be made on the (primitive) id level, as JS/TS are reference-based.
                    const idsInHistoricInput = historicAction.inputList.map(stateInstance => stateInstance.instance.id);
                    const idsInHistoricOutput = historicAction.outputList.map(stateInstance => stateInstance.instance.id);
                    // Combine input and output ids of historic action and de-duplicate them
                    const idsOfHistoricAction = [...new Set([...idsInHistoricInput, ...idsInHistoricOutput])];
                    const idsInCurrentInput = inputCombination.map(stateInstance => stateInstance.instance.id);
                    const intersection = idsOfHistoricAction.filter(id => idsInCurrentInput.includes(id));
                    if (intersection.length >= 1) {
                        // overlap of at least one object
                        hasIODataOverlap = true;
                        break;
                    }
                }
                return describesPredecessor && hasIODataOverlap;
            }
            return Boolean(executionHistory.find(predicateForHistoricAction));
        }

        // parallel
        if (hasParallelPredecessors) {
            for (const predecessor of predecessors) {
                if (!canPredecessorBeFoundInHistory(predecessor)) {
                    // At least one of the parallel predecessors was not found in the history
                    return false;
                }
            }
            // All the parallel predecessors were found in the history
            return true;
        }

        // exclusive
        for (const predecessor of predecessors) {
            if (canPredecessorBeFoundInHistory(predecessor)) {
                // At least one of the exclusive predecessors was found in the history
                return true;
            }
        }
        // None of the exclusive predecessors were found in the history
        return false;
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
     * Thereby, if no input element can be found for an element in the output set, a new one is created.
     */
    private getOutputForInput(inputList: DataObjectInstanceWithState[], executionState: ExecutionState): DataObjectInstanceWithState[] {
        return this.outputSet.set.map(output => {
            const stateInstance: DataObjectInstanceWithState | undefined = inputList.find(stateInstance =>
                stateInstance.instance.dataclass === output.dataclass
            );
            if (stateInstance) {
                // Use found element in the input list
                return new DataObjectInstanceWithState(stateInstance.instance, output.state);
            } else {
                // Create a new object that was created by the executing the activity.
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
