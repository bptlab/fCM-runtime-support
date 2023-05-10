import {
    Activity,
    IOSet,
    Role,
    Resource,
    Dataclass,
    Instance,
    State,
    ProjectState,
} from '../types';

// Dataclasses
let house = new Dataclass("house");
let cable = new Dataclass("cable");

//States
let houseInit = new State("init", house);
let housePainted = new State("painted", house);
let cableAvailable = new State("available", cable);

// Instances
let mapleStreetInit = new Instance("mapleStreet", house, [houseInit]);
let mapleStreetPainted = new Instance("mapleStreet", house, [housePainted]);
let redCableAvailable = new Instance("redCable", house, [cableAvailable]);

// Roles
let painter = new Role("painter");
let tiler = new Role("tiler");
let electrician = new Role("electrician");

// Resources
let picasso = new Resource("Picasso", painter, 1);
let michelangelo = new Resource("Michelangelo", tiler, 1);
let tesla = new Resource("Tesla", electrician, 1);

// IOSets
let inputSetPaint = new IOSet([{dataObject: houseInit, isList: false}]);
let inputSetTile = new IOSet([{dataObject: housePainted, isList: false}]);
let inputSetLay = new IOSet([{dataObject: housePainted, isList: false}, {dataObject: cableAvailable, isList: false}]);
let outputSet = new IOSet([]);

// Activities
let paint = new Activity("paint", 1, 1, painter, [inputSetPaint], [outputSet]);
let tile = new Activity("tiler", 1, 1, tiler, [inputSetPaint, inputSetTile], [outputSet]);
let lay = new Activity("lay", 1, 1, electrician, [inputSetLay], [outputSet]);

// Project State
let activities: Activity[] = [paint];
let ressources: Resource[] = [picasso];
let currentState = new ProjectState([mapleStreetInit], []);


describe('determining executable Activities', () => {

    test('activity with one input set should be executable', () => {
        expect(currentState.executableActivites(activities, ressources)).toEqual([paint]);
    });

    test('activity with many input sets should be executable', () => {
        activities = [paint, tile];
        ressources = [picasso, michelangelo];
        expect(currentState.executableActivites(activities, ressources)).toEqual([paint, tile]);
    });

    test('activity with many data objects within one set should be executable', () => {
        activities = [paint, lay];
        ressources = [picasso, tesla];
        currentState.instances = [mapleStreetPainted, redCableAvailable];
        expect(currentState.executableActivites(activities, ressources)).toEqual([lay]);
    });
});