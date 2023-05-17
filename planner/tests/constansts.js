"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Dataclasses
const Dataclass_1 = require("../types/Dataclass");
const DataObjectInstance_1 = require("../types/executionState/DataObjectInstance");
const InstanceLink_1 = require("../types/executionState/InstanceLink");
const Role_1 = require("../types/Role");
const Resource_1 = require("../types/Resource");
const DataObjectReference_1 = require("../types/fragments/DataObjectReference");
const IOSet_1 = require("../types/fragments/IOSet");
const Activity_1 = require("../types/fragments/Activity");
const ObjectiveNode_1 = require("../types/goal/ObjectiveNode");
const Objective_1 = require("../types/goal/Objective");
const house = new Dataclass_1.Dataclass("house");
const wall = new Dataclass_1.Dataclass("wall");
const cable = new Dataclass_1.Dataclass("cable");
// Instances
const mapleStreetInit = new DataObjectInstance_1.DataObjectInstance("house:1", house, "init");
const mapleStreetPainted = new DataObjectInstance_1.DataObjectInstance("house:1", house, "painted");
const mapleStreetTiled = new DataObjectInstance_1.DataObjectInstance("house:1", house, "tiled");
const mapleStreetPlastered = new DataObjectInstance_1.DataObjectInstance("house:1", house, "plastered");
const wallNorthAvailable = new DataObjectInstance_1.DataObjectInstance("wall:1", wall, "available");
const wallNorthStanding = new DataObjectInstance_1.DataObjectInstance("wall:1", wall, "standing");
const wallSouthAvailable = new DataObjectInstance_1.DataObjectInstance("wall:2", wall, "available");
const wallSouthStanding = new DataObjectInstance_1.DataObjectInstance("wall:2", wall, "standing");
const redCableAvailable = new DataObjectInstance_1.DataObjectInstance("cable:1", cable, "available");
// Instance links
const wallNorthMapleStreetLink = new InstanceLink_1.InstanceLink(wallNorthStanding, mapleStreetPlastered);
const wallSouthMapleStreetLink = new InstanceLink_1.InstanceLink(wallSouthStanding, mapleStreetPlastered);
// Roles
const painter = new Role_1.Role("painter");
const tiler = new Role_1.Role("tiler");
const electrician = new Role_1.Role("electrician");
const builder = new Role_1.Role("builder");
// Resources
const picasso = new Resource_1.Resource("Picasso", painter, 1);
const michelangelo = new Resource_1.Resource("Michelangelo", tiler, 1);
const tesla = new Resource_1.Resource("Tesla", electrician, 1);
const bob = new Resource_1.Resource("Bob", builder, 1);
// DataObjectReferences
const houseInit = new DataObjectReference_1.DataObjectReference(house, ["init"], false);
const housePainted = new DataObjectReference_1.DataObjectReference(house, ["painted"], false);
const housePlastered = new DataObjectReference_1.DataObjectReference(house, ["plastered"], false);
const houseTiled = new DataObjectReference_1.DataObjectReference(house, ["tiled"], false);
const cableAvailable = new DataObjectReference_1.DataObjectReference(cable, ["available"], false);
const wallAvailable = new DataObjectReference_1.DataObjectReference(wall, ["available"], true);
const wallStanding = new DataObjectReference_1.DataObjectReference(wall, ["standing"], true);
// IOSets
const inputSetPaint = new IOSet_1.IOSet([houseInit]);
const outputSetPaint = new IOSet_1.IOSet([housePainted]);
const inputSetPlaster = new IOSet_1.IOSet([wallStanding]);
const outputSetPlaster = new IOSet_1.IOSet([housePlastered]);
const inputSetPutWalls = new IOSet_1.IOSet([wallAvailable]);
const outputSetPutWalls = new IOSet_1.IOSet([wallStanding]);
const inputSetTile = new IOSet_1.IOSet([housePainted]);
const outputSetTile = new IOSet_1.IOSet([houseTiled]);
const inputSetLay = new IOSet_1.IOSet([housePainted, cableAvailable]);
const outputSetLay = new IOSet_1.IOSet([]);
const outputSetBuyCables = new IOSet_1.IOSet([cableAvailable]);
// Activities
const paint = new Activity_1.Activity("paint", 1, 1, painter, [inputSetPaint], outputSetPaint);
const plaster = new Activity_1.Activity("plaster", 1, 1, painter, [inputSetPlaster], outputSetPlaster);
const putWalls = new Activity_1.Activity("putWalls", 1, 1, builder, [inputSetPutWalls], outputSetPutWalls);
const tile = new Activity_1.Activity("tile", 1, 1, tiler, [inputSetPaint, inputSetTile], outputSetTile);
const lay = new Activity_1.Activity("lay", 1, 1, electrician, [inputSetLay], outputSetLay);
const buyCables = new Activity_1.Activity("buyCables", 1, 1, electrician, [], outputSetBuyCables);
// ObjectiveNodes
const objectiveNode = new ObjectiveNode_1.ObjectiveNode("house:1", house, ["painted"]);
// Objectives
const objective = new Objective_1.Objective([objectiveNode], []);
