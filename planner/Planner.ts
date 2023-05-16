import {DataObjectInstance} from "./types/executionState/DataObjectInstance";
import {Activity} from "./types/fragments/Activity";
import {Resource} from "./types/Resource";
import {ExecutionState} from "./types/executionState/ExecutionState";
import {Objective} from "./types/goal/Objective";
import {ExecutionLog} from "./types/output/ExecutionLog";
import {Goal} from "./types/goal/Goal";

export class Planner {
    goal: Goal = new Goal();
    public simulateUntil(startState: ExecutionState, goal: Goal, activities: Activity[], resources: Resource[]): ExecutionLog {
        let queue: ExecutionState[] = [startState];
        while (queue.length > 0) {
            let test = queue.pop();
            let node;
            if (test) {
                node = test;
            } else {
                node = startState;
            }
            if (goal.isFulfilledBy(node)) {
                return new ExecutionLog(node.actionHistory, node.dataObjectInstances);
            }
            let newNodes = node.getSuccessors(activities);

            queue.push(...newNodes);

            for (let activity of node.executableActivities(activities)) {
                let simulatedState = startState;
                activity.execute(simulatedState, simulatedState.dataObjectInstances);
                queue.push(simulatedState);
            }
        }
        return new ExecutionLog();
    }

    private setUpStartState(startState: ExecutionState){
        this.goal.objectives.forEach(objective => {
            startState.objectives.push(false);
        });
    }
}