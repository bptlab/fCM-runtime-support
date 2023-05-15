import {DataObjectInstance} from "./types/executionState/DataObjectInstance";
import {Activity} from "./types/fragments/Activity";
import {Resource} from "./types/Resource";
import {ExecutionState} from "./types/executionState/ExecutionState";
import {Objective} from "./types/goal/Objective";
import {Dataclass} from "./types/Dataclass";
import {InstanceLink} from "./types/executionState/InstanceLink";
import {DataObjectReference} from "./types/fragments/DataObjectReference";
import {Role} from "./types/Role";

export class Planner {

    dataclasses: Dataclass[];
    activities: Activity[];
    resources: Resource[];
    roles: Role[];

    public simulateUntil(startState: ExecutionState, goal: Objective, activities: Activity[], resources: Resource[]): boolean {
        let queue: ExecutionState[] = [];
        if (goal.isFulfilledBy(startState)) {
            return true;
        } else {
            queue.push(startState);
        }
        while (queue.length > 0) {
            let test = queue.pop();
            let node;
            if (test) {
                node = test;
            } else {
                node = startState;
            }
            if (goal.isFulfilledBy(node)) {
                return true;
            }
            for (let activity of node.executableActivities(activities, resources)) {
                let simulatedState = startState;
                activity.execute(simulatedState, simulatedState.dataObjectInstances);
                queue.push(simulatedState);
            }
        }
        return false;
    }
}