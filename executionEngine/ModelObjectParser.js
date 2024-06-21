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
import { getAllSubsets } from "../dist/util/Util";

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

    _parseDataAssociationElement(dataAssociationElement) {
        const objectReferences = [];
        // For each association, there might be multiple states encoded.
        // These are modeled by the "|" symbol (e.g. [A | B]).
        for (let stateIndex = 0; stateIndex < dataAssociationElement.states.length; stateIndex++) {
            objectReferences.push(new DataObjectReference(
                this.dataObjectClasses.find(dataclass =>
                    dataclass.id === dataAssociationElement.dataclass.id
                ),
                dataAssociationElement.states[stateIndex].name,
                // Multi-Instance (list) association currently not supported
                false
            ));
        }
        return objectReferences;
    }

    _generateAllPossibleIOSets(objectReferencesForIOSet) {
        if (objectReferencesForIOSet.length === 0) {
            // No associations were specified, so there is only one "actual" IO set,
            // which describes an empty one (no classes involved)
            return [[]];
        }

        // Otherwise, in theory, all possible subsets of object references could be a valid IO set.
        // Note that here, we need to filter out the empty subset as we definitively have data input/output.
        return getAllSubsets(objectReferencesForIOSet).filter(subset => subset.length > 0);
    }

    /**
     * Uses the modeled activity to extract all possible input sets.
     *
     * Currently, as the framework does not support any form of IOSet modeling,
     * we assume that all possible subsets of the modeled input associations
     * could be a valid input set specification!
     *
     * Also note that currently, no evaluation takes place, whether an input
     * association models a Multi-Instance-Object!
     */
    _parseAllPossibleInputSets(modelActivity) {
        const objectInputReferences = modelActivity
            .get("dataInputAssociations")
            .flatMap(dataInputAssociation => {
                const associationElement = dataInputAssociation.get("sourceRef")[0];
                return this._parseDataAssociationElement(associationElement);
            });

        return this._generateAllPossibleIOSets(objectInputReferences);
    };

    /**
     * Uses the modeled activity to extract all possible output sets.
     *
     * Currently, as the framework does not support any form of IOSet modeling,
     * we assume that all possible subsets of the modeled output associations
     * could be a valid output set specification!
     *
     * Also note that currently, no evaluation takes place, whether an output
     * association models a Multi-Instance-Object!
     */
    _parseAllPossibleOutputSets(modelActivity) {
        const objectOutputReferences = modelActivity
            .get("dataOutputAssociations")
            .flatMap(dataOutputAssociation => {
                const associationElement = dataOutputAssociation.get("targetRef");
                return this._parseDataAssociationElement(associationElement);
            });

        return this._generateAllPossibleIOSets(objectOutputReferences);
    }

    /**
     * Parses modeled activities as well as all possible input and outputs sets.
     *
     * Note that because of multiple input and output sets, the parsing results in multiple
     * instances of the same activity, each with a different input/output set.
     */
    parseActivities(fragmentModeler) {
        const modelActivities = fragmentModeler._definitions
            .get("rootElements")[0]
            .get("flowElements")
            .filter(element => is(element, "bpmn:Task"))

        // Convert all activities in the model to respective instances understood by the engine.
        return modelActivities.flatMap(modelActivity => {
            const result = [];
            const inputSets = this._parseAllPossibleInputSets(modelActivity);
            const outputSets = this._parseAllPossibleOutputSets(modelActivity);

            for (let i = 0; i < inputSets.length; i++) {
                const inputSet = inputSets[i];
                for (let o = 0; o < outputSets.length; o++) {
                    const outputSet = outputSets[o];
                    result.push(new Activity(
                        // Unique id: (activity name, input set, output set)
                        `${modelActivity.name}_i${i}_o${o}`,
                        modelActivity.name,
                        new IOSet(inputSet),
                        new IOSet(outputSet)
                    ));
                }
            }

            return result;
        });
    }
}
