import {DataObjectInstance} from "./types/executionState/DataObjectInstance";
import {Activity} from "./types/fragments/Activity";
import {Resource} from "./types/Resource";
import {ExecutionState} from "./types/executionState/ExecutionState";
import {Objective} from "./types/goal/Objective";
import {ExecutionLog} from "./types/output/ExecutionLog";
import {Goal} from "./types/goal/Goal";
import {Action} from "./types/fragments/Action";
import {Dataclass} from "./types/Dataclass";
import {InstanceLink} from "./types/executionState/InstanceLink";
import {DataObjectReference} from "./types/fragments/DataObjectReference";
import {Role} from "./types/Role";
import {ObjectiveNode} from "./types/goal/ObjectiveNode";
import {NodeLink} from "./types/goal/NodeLink";

export class Planner {

    dataclasses: Dataclass[];
    activities: Activity[];
    resources: Resource[];
    roles: Role[];
    objectiveNodes: ObjectiveNode[];
    objectiveNodeLinks: NodeLink[];
    objectives: Objective[];
    goal: Goal = new Goal();

    public simulateUntil(startState: ExecutionState, goal: Goal, activities: Action[], resources: Resource[]): ExecutionLog {
        this.goal = goal;
        this.setUpStartState(startState);
        let queue: ExecutionState[] = [startState];
        while (queue.length > 0) {
            let test = queue.shift();
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