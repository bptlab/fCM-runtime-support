import { ExecutionState } from "./types/ExecutionState";
import { Activity } from "./types/fragments/Activity";
import { Action } from "./types/Action";
import { DataObjectInstanceWithState } from "./types/objects/DataObjectInstanceWithState";
import ExecutionMediator from "./ExecutionMediator";

/**
 * Engine for executing activities with their related data objects.
 */
export class ExecutionEngine {
    currentState: ExecutionState;
    activities: Activity[];
    executionHistory: Action[];
    mediator: ExecutionMediator;

    public constructor(currentState: ExecutionState, activities: Activity[], mediator: ExecutionMediator) {
        this.currentState = currentState;
        this.activities = activities;
        this.executionHistory = [];
        this.mediator = mediator;
    }

    private findActivityWithId(activityId: string): Activity | undefined {
        return this.activities.find(activity => activity.id === activityId);
    }

    /**
     * Returns currently enabled activities.
     */
    getEnabledActivities(): Activity[] {
        return this.activities
            .filter(activity =>  activity.isEnabled(this.currentState, this.executionHistory));
    }

    /**
     * Returns groups of related objects that can be used for executing the given activity.
     */
    getRelatedObjectGroupsForActivity(activityId: string): DataObjectInstanceWithState[][] {
        const activityToExecute = this.findActivityWithId(activityId);
        if (!activityToExecute) {
            // unknown activity
            return [];
        }

        // Aggregate all groups of objects that can be used for executing the activity.
        const relatedObjectGroupsForActivity: DataObjectInstanceWithState[][] = [];
        const inputCombinations: DataObjectInstanceWithState[][] = activityToExecute.getPossibleInputCombinations(this.currentState);
        for (const inputCombination of inputCombinations) {
            // For each possible input combination start a new object group in the output.
            const objectGroup: DataObjectInstanceWithState[] = [];
            for (const inputObject of inputCombination) {
                // The object itself is usable for executing the activity.
                objectGroup.push(inputObject);
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
                if (!objectGroup.includes(actionInputElement.instance.id)) {
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
    executeActivityWithRelatedObjectGroup(activityId: string, objectGroup: string[]): void {
        const activityToExecute = this.findActivityWithId(activityId);
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
