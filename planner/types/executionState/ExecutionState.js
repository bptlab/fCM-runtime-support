"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionState = void 0;
class ExecutionState {
    constructor(dataObjects, links) {
        this.dataObjectInstances = dataObjects;
        this.links = links;
    }
    executableActivities(activities, resources) {
        return activities.filter(activity => activity.isExecutable(this.dataObjectInstances, resources));
    }
    getDataObjectInstanceOfClass(dataclass) {
        return this.dataObjectInstances.filter(DataObjectInstance => DataObjectInstance.dataclass === dataclass);
    }
}
exports.ExecutionState = ExecutionState;
