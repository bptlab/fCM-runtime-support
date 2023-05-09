"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.includesEvery = exports.Goal = exports.Objective = exports.ProjectState = exports.Association = exports.Instance = exports.State = exports.Dataclass = exports.Ressource = exports.Role = exports.InputSet = exports.Activity = void 0;
class Activity {
    constructor(name, duration, NoP, role, input, output) {
        this.name = name;
        this.duration = duration;
        this.NoP = NoP;
        this.role = role;
        this.input = input;
        this.output = output;
    }
    isExecutable(currentState, ressources) {
        return this.input.some(inputSet => inputSet.satisfiedBy(currentState)) && ressources.some(ressource => ressource.satisfies(this.role, this.NoP));
    }
}
exports.Activity = Activity;
class InputSet {
    constructor(set) {
        this.set = set;
    }
    satisfiedBy(currentState) {
        let satisfiedBy = true;
        this.set.forEach(function (State) {
            if (!currentState.includes(State.state)) {
                satisfiedBy = false;
            }
        });
        return satisfiedBy;
    }
}
exports.InputSet = InputSet;
class Role {
    constructor(name) {
        this.name = name;
    }
}
exports.Role = Role;
class Ressource {
    constructor(name, role, capacity) {
        this.name = name;
        this.role = role;
        this.capacity = capacity;
    }
    satisfies(role, NoP) {
        return role === this.role && NoP <= this.capacity;
    }
}
exports.Ressource = Ressource;
class Dataclass {
    constructor(name) {
        this.name = name;
    }
}
exports.Dataclass = Dataclass;
class State {
    constructor(name, dataclass) {
        this.name = name;
        this.dataclass = dataclass;
    }
}
exports.State = State;
class Instance {
    constructor(name, dataclass, state) {
        this.name = name;
        this.dataclass = dataclass;
        this.state = state;
    }
    matchesInstance(instance) {
        return this.state.every(state => instance.state.includes(state)) && this.dataclass === instance.dataclass;
    }
}
exports.Instance = Instance;
class Association {
    constructor(first, second) {
        this.first = first;
        this.second = second;
    }
}
exports.Association = Association;
class ProjectState {
    constructor(instances, associations) {
        this.instances = instances;
        this.associations = associations;
    }
    possibleActivites(activities, ressources) {
        return activities.filter(element => element.isExecutable(this.instances.map(element => element.state).flat(), ressources));
    }
    executeActiviy(activitiy, instance) {
        let indexInInstances = this.instances.indexOf(instance);
        let indexInOutput = activitiy.output.map(element => element.dataclass).indexOf(instance.state[0].dataclass);
        if (indexInOutput === -1) {
            console.error("This Activity does not change the state of this instance.");
        }
        if (indexInInstances === -1) {
            console.error("This instance does not exist at the current state.");
        }
        this.instances[indexInInstances].state.splice(indexInInstances, 1, activitiy.output[indexInOutput]);
    }
}
exports.ProjectState = ProjectState;
class Objective extends ProjectState {
    constructor(instances, associations, deadline) {
        super(instances, associations);
        this.deadline = deadline;
    }
}
exports.Objective = Objective;
class Goal {
    constructor(objectives) {
        this.objectives = objectives;
    }
}
exports.Goal = Goal;
function includesEvery(list, elements) {
    let includesEvery = true;
    elements.forEach(function (element) {
        if (!list.includes(element)) {
            includesEvery = false;
        }
    });
    return includesEvery;
}
exports.includesEvery = includesEvery;
