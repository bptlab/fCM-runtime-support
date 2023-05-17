"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Planner = void 0;
class Planner {
    simulateUntil(startState, goal, activities, resources) {
        let queue = [];
        if (goal.isFulfilledBy(startState)) {
            return true;
        }
        else {
            queue.push(startState);
        }
        while (queue.length > 0) {
            let test = queue.pop();
            let node;
            if (test) {
                node = test;
            }
            else {
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
exports.Planner = Planner;
