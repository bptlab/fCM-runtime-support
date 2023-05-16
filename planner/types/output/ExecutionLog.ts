import {OutputAction} from "./OutputAction";
import {DataObjectInstance} from "../executionState/DataObjectInstance";

export class ExecutionLog {
    actionList: OutputAction[];
    workSpaces: DataObjectInstance[];

    public constructor(actionList: OutputAction[] = [], workSpaces: DataObjectInstance[] = []) {
        this.actionList = actionList;
        this.workSpaces = workSpaces
    }
}