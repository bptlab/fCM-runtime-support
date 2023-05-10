import {DataObjectInstance} from "../types/executionState/DataObjectInstance";
import {ExecutionState} from "../types/executionState/ExecutionState";
import {Activity} from "../types/fragments/Activity";
import {IOSet} from "../types/fragments/IOSet";
import {DataObjectReference} from "../types/fragments/DataObjectReference";
import {Role} from "../types/Role";
import {Resource} from "../types/Resource";
import {Dataclass} from "../types/Dataclass";

// Dataclasses
let house = new Dataclass("house");
let cable = new Dataclass("cable");

// Instances
let mapleStreetInit = new DataObjectInstance("mapleStreet", house, "init");
let mapleStreetPainted = new DataObjectInstance("mapleStreet", house, "painted");
let redCableAvailable = new DataObjectInstance("redCable", house, "available");

// Roles
let painter = new Role("painter");
let tiler = new Role("tiler");
let electrician = new Role("electrician");

// Resources
let picasso = new Resource("Picasso", painter, 1);
let michelangelo = new Resource("Michelangelo", tiler, 1);
let tesla = new Resource("Tesla", electrician, 1);

// DataObjectReferences
let houseInit = new DataObjectReference(house,["init"],false);
let housePainted = new DataObjectReference(house,["painted"], false);
let cableAvailable = new DataObjectReference( cable,["available"],false);

// IOSets
let inputSetPaint = new IOSet([houseInit]);
let inputSetTile = new IOSet([housePainted]);
let inputSetLay = new IOSet([housePainted, cableAvailable]);
let outputSet = new IOSet([]);

// Activities
let paint = new Activity("paint", 1, 1, painter, [inputSetPaint], outputSet);
let tile = new Activity("tile", 1, 1, tiler, [inputSetPaint, inputSetTile], outputSet);
let lay = new Activity("lay", 1, 1, electrician, [inputSetLay], outputSet);

// Project State
let activities: Activity[] = [paint];
let ressources: Resource[] = [picasso];
let currentState = new ExecutionState([mapleStreetInit], []);


describe('determining executable Activities', () => {

    test('activity with one inputSets set should be executable', () => {
        expect(currentState.executableActivities(activities, ressources)).toEqual([paint]);
    });

    test('activity with many inputSets sets should be executable', () => {
        activities = [paint, tile];
        ressources = [picasso, michelangelo];
        expect(currentState.executableActivities(activities, ressources)).toEqual([paint, tile]);
    });

    test('activity with many data objects within one set should be executable', () => {
        activities = [paint, lay];
        ressources = [picasso, tesla];
        currentState.dataObjectInstances = [mapleStreetPainted, redCableAvailable];
        console.log(currentState.executableActivities(activities, ressources));
        expect(currentState.executableActivities(activities, ressources)).toEqual([lay]);
    });
});