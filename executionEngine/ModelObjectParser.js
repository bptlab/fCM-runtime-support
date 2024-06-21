import { is } from "bpmn-js/lib/util/ModelUtil";
import { ExecutionEngine } from "../dist/executionEngine/ExecutionEngine";
import { ExecutionState } from "../dist/executionEngine/types/ExecutionState";
import { Activity } from "../dist/executionEngine/types/fragments/Activity";
import { IOSet } from "../dist/executionEngine/types/fragments/IOSet";
import { DataObjectClass } from "../dist/executionEngine/types/objects/DataObjectClass";
import { DataObjectInstance } from "../dist/executionEngine/types/objects/DataObjectInstance";
import { DataObjectInstanceWithState } from "../dist/executionEngine/types/objects/DataObjectInstanceWithState";
import { DataObjectInstanceLink } from "../dist/executionEngine/types/objects/DataObjectInstanceLink";
import { DataObjectReference } from "../dist/executionEngine/types/fragments/DataObjectReference";
import { cartesianProduct } from "../dist/util/Util";

/**
 * Based on the Data (Class) modeler, the Fragment Modeler and the Data (Object) Modeler,
 * parses visible elements in these modelers into the needed object structures for
 * the Execution Engine in the backend.
 */
export class ModelObjectParser {
    constructor(dataClassModeler, fragmentModeler, objectModeler) {
        this.dataObjectClasses = this.parseDataObjectClasses(dataClassModeler);
        this.activities = this.parseActivities(fragmentModeler);
        this.dataObjectInstances = this.parseDataObjectInstances(objectModeler);
        this.currentState = this.parseCurrentState(objectModeler);
    }

    /**
     * Returns the Execution Engine (lazy initializes it if needed).
     */
    getExecutionEngine() {
        if (!this.executionEngine) {
            // Lazy init
            this.executionEngine = new ExecutionEngine(this.currentState, this.activities);
        }
        return this.executionEngine;
    }

    /**
     * Parses the currently available data object classes.
     */
    parseDataObjectClasses(dataClassModeler) {
        return dataClassModeler._definitions
            .get("rootElements")
            .flatMap(element => element.get("boardElements"))
            .filter(element => is(element, "od:Class"))
            .map(dataclass => new DataObjectClass(dataclass.id, dataclass.name));
    }

    /**
     * Parses the currently available data object instances.
     */
    parseDataObjectInstances(objectModeler) {
        return objectModeler._definitions
            .get("objectInstances")
            .filter(element => is(element, "om:ObjectInstance"))
            .map(instance => new DataObjectInstance(
                instance.id,
                instance.name,
                this.dataObjectClasses.find(dataclass => dataclass.id === instance.classRef.id)
            ));
    }

    /**
     * Extracts the current execution state based on the data object instances,
     * thereby enriching them with a state identifier and links between them.
     */
    parseCurrentState(objectModeler) {
        const rootBoardOfObjectModeler = objectModeler._definitions
            .get("rootElements")
            .find(element => element.id === "Board");

        const dataObjectInstancesWithState = rootBoardOfObjectModeler
            .get("boardElements")
            .filter(element => is(element, "om:Object"))
            .map(stateInstance => new DataObjectInstanceWithState(
                this.dataObjectInstances.find(instance =>
                    instance.id === stateInstance.instance.id && instance.dataclass.id === stateInstance.classRef.id
                ),
                stateInstance.states[0].name
            ));

        const dataObjectInstanceLinks = rootBoardOfObjectModeler
            .get("boardElements")
            .filter(element => is(element, "om:Link"))
            .map(instanceLink => new DataObjectInstanceLink(
                this.dataObjectInstances.find(instance =>
                    instance.id === instanceLink.sourceRef.instance.id &&
                    instance.dataclass.id === instanceLink.sourceRef.classRef.id),
                this.dataObjectInstances.find(instance =>
                    instance.id === instanceLink.targetRef.instance.id &&
                    instance.dataclass.id === instanceLink.targetRef.classRef.id
                )
            ));

        return new ExecutionState(dataObjectInstancesWithState, dataObjectInstanceLinks);
    }

    /**
     * Uses the modeled activity to extract input sets.
     * Thereby, a data object of a certain class can be referenced in different states.
     * That's why the function first extracts all references grouped by the class and
     * then constructs cartesian products in order to retrieve the "actual" input sets.
     */
    _parseInputSets(modelActivity) {
        const objectReferencesGroupedByClass = modelActivity
            .get("dataInputAssociations")
            .map(dataInputAssociationToClass => {
                const rootElementForAssociationsOfClass = dataInputAssociationToClass.get("sourceRef")[0];
                const objectReferencesOfClass = [];
                // For each data object class, there might be multiple states that can be part of an input set.
                for (let stateIndex = 0; stateIndex < rootElementForAssociationsOfClass.states.length; stateIndex++) {
                    objectReferencesOfClass.push(new DataObjectReference(
                        this.dataObjectClasses.find(dataclass =>
                            dataclass.id === rootElementForAssociationsOfClass.dataclass.id
                        ),
                        rootElementForAssociationsOfClass.states[stateIndex].name,
                        // List input associations currently not supported
                        false
                    ));
                }
                return objectReferencesOfClass;
            });

        return objectReferencesGroupedByClass.length > 0
            // Construct all combinations in order to retrieve "actual" meaningful input sets,
            // so sets actually containing objects of different classes.
            ? cartesianProduct(...objectReferencesGroupedByClass)
            // Only one "actual" input set which describes an empty one (no classes involved)
            : [[]];
    };

    /**
     * Uses the modeled activity to extract a distinct output set.
     * Note that currently, there is only one distinct output set possible, because the function assumes,
     * that a data object of a certain class can only be referenced in a single, distinct state in an output set.
     * TODO: check why this is the case and why they decided not to apply the same concept as with input sets above.
     */
    _parseOutputSet(modelActivity) {
        return modelActivity
            .get("dataOutputAssociations")
            .map(dataOutputAssociation => new DataObjectReference(
                this.dataObjectClasses.find(dataclass =>
                    dataclass.id === dataOutputAssociation.get("targetRef").dataclass.id
                ),
                // Currently, hardcodes the output state to the first one of this class.
                // There might be multiple states, but that is currently not supported.
                dataOutputAssociation.get("targetRef").states[0].name,
                // List output associations currently not supported
                false
            ));
    }

    /**
     * Parses modeled activities as well as input sets and the output set.
     */
    parseActivities(fragmentModeler) {
        // Get modelled activities
        const modelActivities = fragmentModeler._definitions
            .get("rootElements")[0]
            .get("flowElements")
            .filter(element => is(element, "bpmn:Task"))

        // For each modeled activity and each input set, create a new Activity instance.
        return modelActivities.flatMap(modelActivity => {
            const inputSets = this._parseInputSets(modelActivity);
            const outputSet = this._parseOutputSet(modelActivity);
            return inputSets.map(inputSet => new Activity(
                modelActivity.name, // TODO: better activity id
                modelActivity.name,
                new IOSet([].concat(inputSet)),
                new IOSet(outputSet)
            ));
        });
    }
}
