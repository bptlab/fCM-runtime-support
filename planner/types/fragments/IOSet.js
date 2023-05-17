"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOSet = void 0;
class IOSet {
    constructor(set) {
        this.set = set;
    }
    isSatisfiedBy(executionState) {
        for (let dataObjectReference of this.set) {
            let foundCorrespondingDataObjectInstance = false;
            for (let dataObjectInstance of executionState) {
                if (dataObjectInstance.dataclass == dataObjectReference.dataclass && dataObjectReference.states.includes(dataObjectInstance.state)) {
                    foundCorrespondingDataObjectInstance = true;
                }
            }
            if (!foundCorrespondingDataObjectInstance) {
                return false;
            }
        }
        return true;
    }
}
exports.IOSet = IOSet;
