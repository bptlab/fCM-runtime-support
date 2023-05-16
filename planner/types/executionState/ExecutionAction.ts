import {DataObjectInstance} from "./DataObjectInstance";
import {Activity} from "../fragments/Activity";
import {Resource} from "../Resource";
import {ExecutionState} from "./ExecutionState";
import {OutputAction} from "../output/OutputAction";
import {InstanceLink} from "./InstanceLink";
import {Action} from "../fragments/Action";

export class ExecutionAction {
    action: Action;
    runningTime: number;
    resource: Resource | null
    inputList: DataObjectInstance[];
    outputList: DataObjectInstance[];
    addedInstanceLinks: InstanceLink[];
    //todo: newLinks: InstanceLink[];

    public constructor(action: Action, runningTime: number, resource: Resource, inputList: DataObjectInstance[], outputList: DataObjectInstance[], addedInstanceLinks: InstanceLink[]) {
        this.action = action;
        this.runningTime = runningTime;
        this.resource = resource;
        this.inputList = inputList;
        this.outputList = outputList;
        this.addedInstanceLinks = addedInstanceLinks;
    }

    private canFinish(): boolean {
        return this.runningTime >= this.action.duration;
    }

    public tryToFinish(executionState: ExecutionState): ExecutionState | null {
        if (this.canFinish()) {
            return this.finish(executionState);
        } else {
            return null;
        }
    }

    private finish(executionState: ExecutionState): ExecutionState {
        let dataObjects = this.getNewDataObjects(executionState);
        let instanceLinks = this.getNewInstanceLinks(executionState);
        let resources = this.getNewResources(executionState);
        let time = executionState.time;
        let runningActions = executionState.runningActions.filter((action) => action !== this);

        let actionHistory = this.getNewActionHistory(executionState);
        let objectiveArray = executionState.objectives.slice();
        return new ExecutionState(dataObjects, instanceLinks, resources, time, runningActions, actionHistory, objectiveArray);
    }

    private getNewDataObjects(executionState: ExecutionState): DataObjectInstance[] {
        let oldDataObjects = executionState.dataObjectInstances;
        let newDataObjects = oldDataObjects.filter((dataObject) => !this.outputList.includes(dataObject));
        newDataObjects = newDataObjects.concat(this.outputList);
        return newDataObjects;
    }

    private getNewInstanceLinks(executionState: ExecutionState): InstanceLink[] {
        let oldInstanceLinks = executionState.instanceLinks;
        let newInstanceLinks = oldInstanceLinks.filter((instanceLink) => !this.addedInstanceLinks.includes(instanceLink));
        newInstanceLinks = newInstanceLinks.concat(this.addedInstanceLinks);
        return newInstanceLinks;
    }

    private getNewResources(executionState: ExecutionState): Resource[] {
        let oldResources = executionState.resources;
        let newResources = oldResources.map((resource) => {
            if (resource === this.resource) {
                return new Resource(resource.name, resource.role, resource.capacity + this.action.NoP);
            } else {
                return resource;
            }
        });
        return newResources;
    }

    private getNewActionHistory(executionState: ExecutionState): OutputAction[] {
        let oldActionHistory = executionState.actionHistory;
        let newActionHistory = oldActionHistory.concat(new OutputAction(this.action, executionState.time - this.action.duration, executionState.time, this.resource, this.action.NoP, this.inputList, this.outputList));
        return newActionHistory;
    }
}