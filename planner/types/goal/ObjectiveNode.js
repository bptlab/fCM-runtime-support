"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectiveNode = void 0;
class ObjectiveNode {
    constructor(name, dataclass, states) {
        this.name = name;
        this.dataclass = dataclass;
        this.states = states;
    }
    isMatchedBy(dataObjectInstance) {
        return this.name === dataObjectInstance.name && this.dataclass === dataObjectInstance.dataclass && this.states.includes(dataObjectInstance.state);
    }
}
exports.ObjectiveNode = ObjectiveNode;
