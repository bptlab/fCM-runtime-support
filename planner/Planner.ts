import {DataObjectInstance} from "./types/executionState/DataObjectInstance";
import {Activity} from "./types/fragments/Activity";
import {Resource} from "./types/Resource";
import {ExecutionState} from "./types/executionState/ExecutionState";
import {Objective} from "./types/goal/Objective";
import {ExecutionLog} from "./types/output/ExecutionLog";
import {Goal} from "./types/goal/Goal";
import {Action} from "./types/fragments/Action";

export class Planner {
    goal: Goal = new Goal();

    public simulateUntil(startState: ExecutionState, goal: Goal, activities: Action[], resources: Resource[]): ExecutionLog {
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
                return new ExecutionLog(node.actionHistory, node.allExecutionDataObjectInstances().map(executionDataObjectInstance => executionDataObjectInstance.dataObjectInstance));
            }
            let newNodes = node.getSuccessors(activities);

            queue.push(...newNodes);
        }
        return new ExecutionLog();
    }

    private setUpStartState(startState: ExecutionState){
        this.goal.objectives.forEach(objective => {
            startState.objectives.push(false);
        });
    }
}