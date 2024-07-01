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
        
        const referencesGroupedByClass = references.reduce((groupedReferences, reference) => {
            const classOfObject = reference.first.dataclass.name
            const classOfOtherObject = reference.second.dataclass.name
            if (!groupedReferences.has(classOfObject)) {
                groupedReferences.set(classOfObject, [])
            }
            const referenceClassesList = groupedReferences.get(classOfObject)
            if (!referenceClassesList.includes(classOfOtherObject)) 
                referenceClassesList.push(classOfOtherObject)
            groupedReferences.set(classOfObject, referenceClassesList)
            return groupedReferences
        }, new Map())

        const objectsWithReferences = objects.map((object) => {
            let objectReferenceMap = new Map()
            if(referencesGroupedByClass.has(object.instance.dataclass.name)) {
                objectReferenceMap = referencesGroupedByClass.get(object.instance.dataclass.name).reduce((referenceMap, classOfOtherObject) => {
                    referenceMap.set(classOfOtherObject, references.filter((reference) => {
                        return reference.first.id === object.instance.id && reference.second.dataclass.name === classOfOtherObject
                    }))
                    return referenceMap
                }, new Map())
            }
            return {
                id: object.instance.id,
                name: object.instance.name,
                dataclass: object.instance.dataclass.name,
                state: object.state,
                objectReferenceMap
            }
        })
        
        const objectsGroupedByClass = objectsWithReferences.reduce((groupedObjects, object) => {
            if (!groupedObjects[object.dataclass]) {
                groupedObjects[object.dataclass] = []
            }
            groupedObjects[object.dataclass].push(object)
            return groupedObjects
        }, {})

        document.getElementById(this._container).innerHTML = Object.keys(objectsGroupedByClass).toSorted().map((dataclass) => {
            return `<div class="object-class">
                <h2>Class: ${dataclass}</h2>
                <div class="objects">
                    <table class="object-interface-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>State</th>
                                ${referencesGroupedByClass.has(dataclass) ?referencesGroupedByClass.get(dataclass).toSorted().map((key) => {
                                    return `<th>${key}</th>`
                                }).join("")
                                : ""}
                            </tr>
                        </thead>
                        <tbody>
                            ${objectsGroupedByClass[dataclass].map((object) => {
                                return `<tr>
                                    <td>${object.name}</td>
                                    <td>${object.state}</td>

                                    ${referencesGroupedByClass.has(dataclass) ? referencesGroupedByClass.get(dataclass).toSorted().map((classOfOtherObject) => {
                                        return `<td>
                                                ${object.objectReferenceMap.get(classOfOtherObject).map((reference) => {
                                                    return reference.second.name
                                                }).join(", ")}
                                        </td>`
                                    }).join(""): ""}
                                </tr>`
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            </div>`
        }).join("");
    }
}
