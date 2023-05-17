"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeLink = void 0;
class NodeLink {
    constructor(first, second) {
        this.first = first;
        this.second = second;
    }
    isMatchedBy(instanceLink) {
        return (this.first.name === instanceLink.first.name && this.second.name === instanceLink.second.name) || (this.second.name === instanceLink.first.name && this.first.name === instanceLink.second.name);
    }
}
exports.NodeLink = NodeLink;
