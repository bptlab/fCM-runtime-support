import {Activity} from "../fragments/Activity";
import {Resource} from "../Resource";
import {DataObjectInstance} from "./DataObjectInstance";
import {InstanceLink} from "./InstanceLink";
import {Dataclass} from "../Dataclass";
import {ExecutionAction} from "./ExecutionAction";
import {OutputAction} from "../output/OutputAction";
import {Action} from "../fragments/Action";

export class ExecutionState {
    dataObjectInstances: DataObjectInstance[];
    instanceLinks: InstanceLink[];
    resources: Resource[];
    time: number;
    objectives: boolean[] = [];
    runningActions: ExecutionAction[];
    actionHistory: OutputAction[];

    public constructor(dataObjects: DataObjectInstance[], instanceLinks: InstanceLink[], resources: Resource[], time: number, runningActions: ExecutionAction[] = [], actionHistory: OutputAction[] = [], objectives: boolean[] = []) {
        this.dataObjectInstances = dataObjects;
        this.instanceLinks = instanceLinks;
        this.resources = resources;
        this.time = time;
        this.runningActions = runningActions;
        this.actionHistory = actionHistory;
        this.objectives = objectives;
    }

    public executableActivities(activities: Activity[]): Activity[] {
        return activities.filter(activity => activity.isExecutable(this.dataObjectInstances, this.resources));
    }

    public getDataObjectInstancesOfClass(dataclass: Dataclass): DataObjectInstance[] {
        return this.dataObjectInstances.filter(DataObjectInstance => DataObjectInstance.dataclass === dataclass);
    }

    public getSuccessors(actions: Action[]): ExecutionState[] {
        let successors: ExecutionState[] = [];
        //get executable Actions from Actions
        //get ExecutionActions from executable Actions
        //for each ExecutionAction, start ExecutionAction and get new ExecutionState
        //waitAction executen and get new ExecutionState
        //push all to successors
        let executableActivities = this.executableActivities(activities);
        executableActivities.forEach((activity) => {
            let newState = this.executeActivity(activity);
            successors.push(newState);
        });
        return successors;
    }

    // public executeActiviy(activitiy: Activity, instance: DataObjectInstance) {
    //     let indexInInstances = this.dataObjectInstances.indexOf(instance);
    //     let indexInOutput = activitiy.outputSet.map(element => element.dataclass).indexOf(instance.state[0].dataclass);
    //     if (indexInOutput === -1) {
    //         console.error("This Activity does not change the state of this instance.")
    //     }
    //     if (indexInInstances === -1) {
    //         console.error("This instance does not exist at the current state.")
    //     }
    //     this.dataObjectInstances[indexInInstances].state.splice(indexInInstances, 1, activitiy.outputSet[indexInOutput]);
    // }
}