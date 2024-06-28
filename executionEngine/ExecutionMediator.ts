import ExecutionFragmentInterface from "../app/lib/executioninterface/FragmentInterface";
import ExecutionObjectInterface from "../app/lib/executioninterface/ObjectInterface";

import { ExecutionEngine } from "./ExecutionEngine";
import ModelerData from "./ModelerData";
import { ModelObjectParser } from "./ModelObjectParser";

/**
 * Mediator between the execution engine and the execution interfaces (fragment and object)
 * This class is responsible for the communication between the execution engine and the interfaces.
 * It is also responsible for the initialization of the execution engine and interfaces 
 * and for refreshing the interfaces after each execution step.
 */
export default class ExecutionMediator {
    // Execution interface and engine access
    private _executor: ExecutionEngine;
    private _fragmentInterface: ExecutionFragmentInterface;
    private _objectInterface: ExecutionObjectInterface;
    private _parser: ModelObjectParser;

    constructor(fragmentInterface: ExecutionFragmentInterface, objectInterface: ExecutionObjectInterface, modelerData: ModelerData, modelObjectParser: ModelObjectParser) {
        this._parser = modelObjectParser;
        const activities = this._parser.activities
        const state = this._parser.currentState
        const executionEngine = new ExecutionEngine(state, activities, this);
        this._executor = executionEngine;
        
        this._fragmentInterface = fragmentInterface;
        fragmentInterface.setMediator(this);
        modelerData.fragmentModelXML().then(async ({xml}) => {
            // @ts-ignore
            await fragmentInterface.importXML(xml)
            fragmentInterface.refresh()
        }).catch((e) => {
            console.error(e)
        })
        
        this._objectInterface = objectInterface;
        objectInterface.setMediator(this);
        this._objectInterface.update(state)
    }

    getEnabledActivities() {
        return this._executor.getEnabledActivities();
    }

    getRelatedObjectGroupsForActivity(activityId: string) {
        return this._executor.getRelatedObjectGroupsForActivity(activityId);
    }

    executeStep(activityId: string, objectIds: string[]) {
        this._executor.executeActivityWithRelatedObjectGroup(activityId, objectIds);
        const newState = this._executor.currentState;
        this._objectInterface.update(newState);
        this._fragmentInterface.refresh();
    }



}