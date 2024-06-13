import { ExecutionState } from "../../../executionEngine/types/ExecutionState";

export default class ExecutionObjectInterface {

    objects = [];
    constructor(options) {
        this._container = options.container
        
    }

    setMediator(mediator) {
        this._mediator = mediator;
    }

    update(newExecutionState) {
        objects = newExecutionState.currentStateInstances
        references = newExecutionState.instanceLinks

        const objectsWithReferences = objects.map((object) => {
            const objectReferences = references.filter((reference) => reference.first === object.instance.id)
                .reduce((groupedReferences, reference) => {
                    const classOfOtherObject = reference.second.instance.className.id
                    if (!groupedReferences[classOfOtherObject]) {
                        groupedReferences[classOfOtherObject] = []
                    }
                    groupedReferences[classOfOtherObject].push(reference)
                    return groupedReferences
                }, {})

            return {
                id: object.instance.id,
                name: object.instance.name,
                className: object.instance.className.name,
                state: object.state,
                ...objectReferences
            }
        })
        
        const objectsGroupedByClass = objectsWithReferences.reduce((groupedObjects, object) => {
            if (!groupedObjects[object.className]) {
                groupedObjects[object.className] = []
            }
            groupedObjects[object.className].push(object)
            return groupedObjects
        }, {})

        document.getElementById(this._container).innerHTML = Object.keys(objectsGroupedByClass).map((className) => {
            return `<div class="object-class">
                <h2>${className}</h2>
                <div class="objects">
                    ${objectsGroupedByClass[className].map((object) => {
                        return `<div class="object">
                            <h3>${object.name}</h3>
                            <p>${object.state}</p>
                            <div class="references
                                ${Object.keys(object).filter((key) => key !== "id" && key !== "name" && key !== "className" && key !== "state").map((key) => {
                                    return `<div class="reference">
                                        <h4>${key}</h4>
                                        <ul>
                                            ${object[key].map((reference) => {
                                                return `<li>${reference.second.instance.name}</li>`
                                            }).join("")}
                                        </ul>
                                    </div>`
                                }).join("")}
                            </div>
                        </div>`
                            }).join("")}
                </div>
            </div>`
        }).join("")
    }

}
