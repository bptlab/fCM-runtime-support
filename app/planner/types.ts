export class Activity {
    name: string;
    duration: number;
    NoP: number;
    role: Role;
    input: InputSet[];
    output: State[];

    public constructor(name: string, duration: number, NoP: number, role: Role, input: InputSet[], output: State[]) {
        this.name = name;
        this.duration = duration;
        this.NoP = NoP;
        this.role = role;
        this.input = input;
        this.output = output;
    }

    public isExecutable(currentState: State[], ressources: Ressource[]): boolean {
        return this.input.some(inputSet => inputSet.satisfiedBy(currentState)) && ressources.some(ressource => ressource.satisfies(this.role, this.NoP));
    }
}

export class InputSet {
    set: Array<{ state: State, isList: boolean }>;

    public constructor(set: Array<{ state: State, isList: boolean }>) {
        this.set = set;
    }

    public satisfiedBy(currentState: State[]): boolean {
        let satisfiedBy = true;
        this.set.forEach(function (State) {
                if (!currentState.includes(State.state)) {
                    satisfiedBy = false;
                }
            }
        );
        return satisfiedBy;
    }
}

export class Role {
    name: string;

    public constructor(name: string) {
        this.name = name;
    }
}

export class Ressource {
    name: string;
    role: Role;
    capacity: number;

    public constructor(name: string, role: Role, capacity: number) {
        this.name = name;
        this.role = role;
        this.capacity = capacity;
    }

    public satisfies(role: Role, NoP: number): boolean {
        return role === this.role && NoP <= this.capacity;
    }
}

export class Dataclass {
    name: string;

    public constructor(name: string) {
        this.name = name;
    }
}

export class State {
    name: string;
    dataclass: Dataclass;

    public constructor(name: string, dataclass: Dataclass) {
        this.name = name;
        this.dataclass = dataclass;
    }
}

export class Instance {
    name: string;
    dataclass: Dataclass;
    state: State[];

    public constructor(name: string, dataclass: Dataclass, state: State[]) {
        this.name = name;
        this.dataclass = dataclass;
        this.state = state;
    }

    public matchesInstance(instance: Instance): boolean {
        return this.state.every(state => instance.state.includes(state)) && this.dataclass === instance.dataclass;
    }
}

export class Association {
    first: Instance;
    second: Instance;

    public constructor(first: Instance, second: Instance) {
        this.first = first;
        this.second = second;
    }
}

export class ProjectState {
    instances: Instance[];
    associations: Association[];

    public constructor(instances: Instance[], associations: Association[]) {
        this.instances = instances;
        this.associations = associations;
    }

    public executableActivites(activities: Activity[], ressources: Ressource[]): Activity[] {
        return activities.filter(element => element.isExecutable(this.instances.map(element => element.state).flat(), ressources));
    }

    public executeActiviy(activitiy: Activity, instance: Instance) {
        let indexInInstances = this.instances.indexOf(instance);
        let indexInOutput = activitiy.output.map(element => element.dataclass).indexOf(instance.state[0].dataclass);
        if (indexInOutput === -1) {
            console.error("This Activity does not change the state of this instance.")
        }
        if (indexInInstances === -1) {
            console.error("This instance does not exist at the current state.")
        }
        this.instances[indexInInstances].state.splice(indexInInstances, 1, activitiy.output[indexInOutput]);
    }
}

export class Objective extends ProjectState {
    deadline: number;

    public constructor(instances: Instance[], associations: Association[], deadline: number) {
        super(instances, associations);
        this.deadline = deadline;
    }
}

export class Goal {
    objectives: Objective[];

    public constructor(objectives: Objective[]) {
        this.objectives = objectives;
    }
}

export function includesEvery(list: any[], elements: any[]): boolean {
    let includesEvery = true;
    elements.forEach(function (element) {
        if (!list.includes(element)) {
            includesEvery = false;
        }
    });
    return includesEvery;
}