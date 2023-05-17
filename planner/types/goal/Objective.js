"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Objective = void 0;
class Objective {
    constructor(dataObjectNodes, links, deadline = null) {
        this.dataObjectNodes = dataObjectNodes;
        this.objectiveLinks = links;
        this.deadline = deadline;
    }
    isFulfilledBy(state) {
        for (let dataObjectNode of this.dataObjectNodes) {
            if (!state.dataObjectInstances.some(dataObjectInstance => dataObjectNode.isMatchedBy(dataObjectInstance))) {
                return false;
            }
        }
        for (let objectiveLinks of this.objectiveLinks) {
            if (!state.links.some(instanceLink => objectiveLinks.isMatchedBy(instanceLink))) {
                return false;
            }
        }
        return true;
    }
}
exports.Objective = Objective;
