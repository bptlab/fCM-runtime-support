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
        
        // Create Map from classes to a list of classes that are referenced
        const referencesGroupedByClass = references.reduce((groupedReferences, reference) => {
            const classOfObject = reference.first.dataclass.name
            const classOfOtherObject = reference.second.dataclass.name
            // Add the class of the other object to the list of referenced classes
            const referenceClassesList = groupedReferences.get(classOfObject) || []
            if (!referenceClassesList.includes(classOfOtherObject)) 
                referenceClassesList.push(classOfOtherObject)
            groupedReferences.set(classOfObject, referenceClassesList)
            // Because we display the references in both directions, we need to add the class of the object to the list of referenced classes of the other object
            const referenceClassesListOther = groupedReferences.get(classOfOtherObject) || []
            if (!referenceClassesListOther.includes(classOfObject))
                referenceClassesListOther.push(classOfObject)
            groupedReferences.set(classOfOtherObject, referenceClassesListOther)
            return groupedReferences
        }, new Map())

        // Collect all objects with their references
        const objectsWithReferences = objects.map((object) => {
          // Create Map from referenced classes to the referenced objects
          let objectReferenceMap = new Map();
          if (referencesGroupedByClass.has(object.instance.dataclass.name)) {
            objectReferenceMap = referencesGroupedByClass
              .get(object.instance.dataclass.name)
              .reduce((referenceMap, classOfOtherObject) => {
                // Set the reference map for the class of the other object
                // The reference map is a map from the class of the other object to the list of references
                // We show the references in both directions
                referenceMap.set(
                  classOfOtherObject,
                  references.filter((reference) => {
                    return (
                        // Either the current object is the first object in the reference and the second object is of the class of the other object
                        // Or the current object is the second object in the reference and the first object is of the class of the other object
                      (reference.first.id === object.instance.id &&
                        reference.second.dataclass.name ===
                          classOfOtherObject) ||
                      (reference.second.id === object.instance.id &&
                        reference.first.dataclass.name === classOfOtherObject)
                    );
                  })
                );
                return referenceMap;
              }, new Map());
          }
          return {
            id: object.instance.id,
            name: object.instance.name,
            dataclass: object.instance.dataclass.name,
            state: object.state,
            objectReferenceMap,
          };
        });
        
        const objectsGroupedByClass = objectsWithReferences.reduce((groupedObjects, object) => {
            if (!groupedObjects[object.dataclass]) {
                groupedObjects[object.dataclass] = []
            }
            groupedObjects[object.dataclass].push(object)
            return groupedObjects
        }, {})

        const dataTables = Object.keys(objectsGroupedByClass).toSorted().map((dataclass) => {
            return `<div class="object-class">
                <h2>Class: ${dataclass}</h2>
                <div class="objects">
                    <table class="object-interface-table">
                        <thead>
                            <tr>
                                <th>Id</th>
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
                                                    // Show the name of the object with the class of the current column
                                                    return reference.first.dataclass.name === classOfOtherObject ? reference.first.name : reference.second.name
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

        // Visualize the event log as an object centric event log
        const eventLog = this._mediator.getExecutionHistory()
        // get list of all classes in the event log
        const classesInEventLog = eventLog.reduce((classes, event) => {
            const inputClasses = event.inputList.map((data) => data.instance.dataclass.name)
            const outputClasses = event.outputList.map((data) => data.instance.dataclass.name)
            inputClasses.concat(outputClasses).forEach((dataclass) => {
                if (!classes.includes(dataclass)) {
                    classes.push(dataclass)
                }
            })
            return classes
        }, [])

        const eventLogTable = `<div class="event-log">
            <h2>Event Log</h2>
            <table class="object-interface-table">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Activity</th>
                        ${classesInEventLog.map((dataclass) => {
                            return `<th>${dataclass}</th>`
                        }).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${eventLog.map((event, index) => {
                        return `<tr>
                            <td>${index}</td>
                            <td>${event.activity.name}</td>
                            ${classesInEventLog.map((dataclass) => {
                                // get object of the class and unqiuefy them
                                const objectsGroupedByClass = event.inputList.concat(event.outputList).filter((data) => data.instance.dataclass.name === dataclass).map((data) => {
                                    return data.instance.name
                                })

                                return `<td>{
                                    ${[...new Set(objectsGroupedByClass)].join(", ")} }
                                </td>`
                            }).join("")}
                        </tr>`
                    }).join("")}
                </tbody>
            </table>
        </div>`

        document.getElementById(this._container).innerHTML = `<div class="execution-interface">
            <div class="objects">
                ${dataTables}
            </div>
            <div class="events">
                ${eventLog.length !==0 ? eventLogTable : ""}
            </div>
        </div>`
    }
}
