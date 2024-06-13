import ExecutionFragmentInterface from "../app/lib/executioninterface/FragmentInterface";
import ExecutionObjectInterface from "../app/lib/executioninterface/ObjectInterface";
import FragmentModeler from "../app/lib/fragmentmodeler/FragmentModeler";
import OlcModeler from "../app/lib/olcmodeler/OlcModeler";
import DataModelModeler from '../app/lib/datamodelmodeler/Modeler';
import DependencyModeler from "../app/lib/dependencymodeler/DependencyModeler";
import OmModeler from "../app/lib/objectivemodeler/OmModeler";

export default class ModelerData {
    private _fragmentModeler: FragmentModeler;
    private _olcModeler: OlcModeler;
    private _dataModeler: DataModelModeler;
    private _dependencyModeler: DependencyModeler;
    private _objectModeler: OmModeler;

    constructor(fragmentModeler: FragmentModeler, olcModeler: OlcModeler, dataModeler: DataModelModeler, dependencyModeler: DependencyModeler, objectModeler: OmModeler) {
        this._fragmentModeler = fragmentModeler;
        this._olcModeler = olcModeler;
        this._dataModeler = dataModeler;
        this._dependencyModeler = dependencyModeler;
        this._objectModeler = objectModeler;
    }

    get fragmentModelXML() {
        return this._fragmentModeler.saveXML().xml
    }

}