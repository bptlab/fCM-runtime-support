"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Objective = void 0;
class Objective {
    constructor(dataObjectNodes, links, deadline = null) {
        this.dataObjectNodes = dataObjectNodes;
        this.objectiveLinks = links;
        this.deadline = deadline;
    }
    isFulfilledBy(executionState) {
        if (this.deadline && executionState.time > this.deadline) {
            return false;
        }
        for (let dataObjectNode of this.dataObjectNodes) {
            if (!executionState.allExecutionDataObjectInstances().some(executionDataObjectInstance => dataObjectNode.isMatchedBy(executionDataObjectInstance))) {
                return false;
            }
        }
        for (let objectiveLink of this.objectiveLinks) {
            if (!executionState.instanceLinks.some(instanceLink => objectiveLink.isMatchedBy(instanceLink))) {
                return false;
            }
        }
        return true;
    }
}
exports.Objective = Objective;
