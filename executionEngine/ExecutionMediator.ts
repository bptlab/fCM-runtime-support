import ExecutionFragmentInterface from "../app/lib/executioninterface/FragmentInterface";
import ExecutionObjectInterface from "../app/lib/executioninterface/ObjectInterface";
import FragmentModeler from "../app/lib/fragmentmodeler/FragmentModeler";
import OlcModeler from "../app/lib/olcmodeler/OlcModeler";
import DataModelModeler from '../app/lib/datamodelmodeler/Modeler';

import { ExecutionEngine } from "./ExecutionEngine";
import DependencyModeler from "../app/lib/dependencymodeler/DependencyModeler";
import ModelerData from "./ModelerData";
import { ModelObjectParser } from "../planner/parser/ModelObjectParser";

export default class ExecutionMediator {
    // Execution interface and engine access
    //private _executor: ExecutionEngine;
    private _fragmentInterface: ExecutionFragmentInterface;
    private _objectInterface: ExecutionObjectInterface;
    private _modelerData: ModelerData;
    private _parser: ModelObjectParser;

    constructor(fragmentInterface: ExecutionFragmentInterface, objectInterface: ExecutionObjectInterface, modelerData: ModelerData, modelObjectParser: ModelObjectParser) {
        this._parser = modelObjectParser;
        this._fragmentInterface = fragmentInterface;
        fragmentInterface.setMediator(this);
        fragmentInterface.importXML(modelerData.fragmentModelXML);
        
        this._objectInterface = objectInterface;
        objectInterface.setMediator(this);

        //const activities = this._parser.activities
        //const state = this._parser.currentState
        //const executionEngine = new ExecutionEngine(state, activities, this);
        //this._executor = executionEngine;
        // this._objectInterface.update(state)
        this._modelerData = modelerData

    }

    initialize() {
    }

}