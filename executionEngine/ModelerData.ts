import ExecutionFragmentInterface from "../app/lib/executioninterface/FragmentInterface";
import ExecutionObjectInterface from "../app/lib/executioninterface/ObjectInterface";
import FragmentModeler from "../app/lib/fragmentmodeler/FragmentModeler";
import OlcModeler from "../app/lib/olcmodeler/OlcModeler";
import DataModelModeler from '../app/lib/datamodelmodeler/Modeler';
import DependencyModeler from "../app/lib/dependencymodeler/DependencyModeler";
import OmModeler from "../app/lib/objectivemodeler/OmModeler";

/**
 * The ModelerData class is a abstraction of the modeler and their data.
 * It is used to retrieve the data from the modeler and pass it to the ExecutionMediator.
 * TODO: Not every modeler might be needed
 */
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

    /**
     * Get the XML of the fragment modeler
     */
    fragmentModelXML(): Promise<{xml: string}> {
        // @ts-ignore -- saveXML does exists because of an inherit statement
        return this._fragmentModeler.saveXML({format: true})
    }

}