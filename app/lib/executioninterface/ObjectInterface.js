export default class ExecutionObjectInterface {

    objects = [];
    constructor(options) {
        this._container = options.container
        
    }

    setMediator(mediator) {
        this._mediator = mediator;
    }

    /**
     * Updates the object interface with the new execution state.
     * 
     * @param {ExecutionState} newExecutionState 
     */
    update(newExecutionState) {
        const objects = newExecutionState.currentStateInstances
        const references = newExecutionState.instanceLinks
        const objectsWithReferences = objects.map((object) => {
            const objectReferences = references.filter((reference) => reference.first.id === object.instance.id)
                .reduce((groupedReferences, reference) => {
                    const classOfOtherObject = reference.second.dataclass.name
                    if (!groupedReferences[classOfOtherObject]) {
                        groupedReferences[classOfOtherObject] = []
                    }
                    groupedReferences[classOfOtherObject].push(reference)
                    return groupedReferences
                }, {})
            return {
                id: object.instance.id,
                name: object.instance.name,
                dataclass: object.instance.dataclass.name,
                state: object.state,
                ...objectReferences
            }
        })
        
        const objectsGroupedByClass = objectsWithReferences.reduce((groupedObjects, object) => {
            if (!groupedObjects[object.dataclass]) {
                groupedObjects[object.dataclass] = []
            }
            groupedObjects[object.dataclass].push(object)
            return groupedObjects
        }, {})

        document.getElementById(this._container).innerHTML = Object.keys(objectsGroupedByClass).map((dataclass) => {
            return `<div class="object-class">
                <h2>Class: ${dataclass}</h2>
                <div class="objects">
                    ${objectsGroupedByClass[dataclass].map((object) => {
                        return `<div class="object">
                            <h3>Name: ${object.name}</h3>
                            <p>State: ${object.state}</p>
                            <div class="references
                                ${Object.keys(object).filter((key) => key !== "id" && key !== "name" && key !== "dataclass" && key !== "state").map((key) => {
                                    return `<div class="reference">
                                        <h4>References to class: ${key}</h4>
                                        <ul>
                                            ${object[key].map((reference) => {
                                                return `<li>${reference.second.name}</li>`
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
