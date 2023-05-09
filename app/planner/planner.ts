import {
    Activity,
    InputSet,
    Role,
    Ressource,
    Dataclass,
    Instance,
    State,
    Objective,
    Association,
    ProjectState,
    Goal
} from './types';

const haus = new Dataclass("Haus");
const hausInit = new State("init", haus);
const hausGemalert = new State("gemalert", haus);
const hausGefliest = new State("gefliest", haus);
const haus1Init = new Instance("1", haus, [hausInit]);
const haus1Gemalert = new Instance("1", haus, [hausGemalert]);
const maler = new Role("Maler");
const fliesenleger = new Role("Fliesenleger");
const meier = new Ressource("Meier", maler, 1);
const schulze = new Ressource("Schulze", fliesenleger, 1);
const inputSet = new InputSet([{state: hausInit, isList: false}]);
const inputSet2 = new InputSet([{state:hausGefliest, isList: false}])
const malern = new Activity("malern", 1, 1, maler, [inputSet], [hausGemalert]);
const fliesen = new Activity("fliesen", 1, 1, fliesenleger, [inputSet,inputSet2], [hausGefliest]);

const currentState = new ProjectState([haus1Init], []);
const objective1 = new Objective([haus1Gemalert], [], 1);
const goal = new Goal([objective1]);

const activities: Activity[] = [malern, fliesen];
const ressources: Ressource[] = [meier, schulze];

console.log(currentState.executableActivites(activities, ressources).map(element => element.name));