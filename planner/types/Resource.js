"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
class Resource {
    constructor(name, role, capacity) {
        this.name = name;
        this.role = role;
        this.capacity = capacity;
    }
    satisfies(role, NoP) {
        return role === this.role && NoP <= this.capacity;
    }
}
exports.Resource = Resource;
