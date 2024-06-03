import { ExecutionState } from "./types/ExecutionState";
import { Activity } from "./types/fragments/Activity";
import { Action } from "./types/Action";
import { DataObjectInstanceWithState } from "./types/objects/DataObjectInstanceWithState";

/**
 * Engine for executing activities with their related data objects.
 */
export class ExecutionEngine {
    currentState: ExecutionState;
    activities: Activity[];
    executionHistory: Action[];

    public constructor(currentState: ExecutionState, activities: Activity[]) {
        this.currentState = currentState;
        this.activities = activities;
        this.executionHistory = [];
    }

    private findActivityWithName(activityName: string): Activity | undefined {
        return this.activities.find(activity => activity.name === activityName);
    }

    /**
     * Returns the names of currently enabled activities.
     */
    getEnabledActivities(): string[] {
        return this.activities
            .filter(activity => activity.isEnabled(this.currentState))
            .map(enabledActivity => enabledActivity.name);
    }

    /**
     * Returns groups of related objects that can be used for executing the given activity.
     */
    getRelatedObjectGroupsForActivity(activityName: string): string[][] {
        const activityToExecute = this.findActivityWithName(activityName);
        if (!activityToExecute) {
            // unknown activity
            return [];
        }

        // Aggregate all groups of objects that can be used for executing the activity.
        // For now, just use the name of the objects involved.
        const relatedObjectGroupsForActivity: string[][] = [];
        const inputCombinations: DataObjectInstanceWithState[][] = activityToExecute.getPossibleInputCombinations(this.currentState);
        for (const inputCombination of inputCombinations) {
            // For each possible input combination start a new object group in the output.
            const objectGroup: string[] = [];
            for (const inputObject of inputCombination) {
                // The object itself is usable for executing the activity.
                objectGroup.push(inputObject.instance.name);
                // TODO: also retrieve objects that related to the input objects (see sketch of popover idea)?
            }
            relatedObjectGroupsForActivity.push(objectGroup);
        }

        return relatedObjectGroupsForActivity;
    }

    private findActivityActionReferencedByObjectGroup(activityToExecute: Activity, objectGroup: string[]): Action | undefined {
        // Get all possible actions for executing the activity
        const possibleExecutionActions = activityToExecute.getActions(this.currentState);
        // Find the action that is referenced by the selected object group
        return possibleExecutionActions.find(action => {
            // Note that no complete intersection is necessary. Just use the first action,
            // whose input requirements are met by the selection.
            let actionMatches = true;
            for (const actionInputElement of action.inputList) {
                if (!objectGroup.includes(actionInputElement.instance.name)) {
                    // At least one input requirement is not met
                    actionMatches = false;
                    break;
                }
            }
            return actionMatches;
        });
    }

    /**
     * Execute the given activity with the selected group of related objects.
     *
     */
    executeActivityWithRelatedObjectGroup(activityName: string, objectGroup: string[]): void {
        const activityToExecute = this.findActivityWithName(activityName);
        if (!activityToExecute) {
            // unknown activity
            return;
        }
        const actionToUse = this.findActivityActionReferencedByObjectGroup(activityToExecute, objectGroup);
        if (actionToUse) {
            // Really execute the action/activity.
            this.currentState = actionToUse.execute(this.currentState);
            // Track the execution.
            this.executionHistory.push(actionToUse);
        }
    }

    /**
     * React to changes of the objects (part of the state) or the activities of the underlying models.
     */
    processExternalChanges(newExecutionState: ExecutionState, newActivities: Activity[]) {
        // TODO: will this work out? Can we continue with the execution now?
        this.currentState = newExecutionState;
        this.activities = newActivities;
    }
}
