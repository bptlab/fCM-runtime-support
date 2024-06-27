import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";
import getDropdown from "../../../util/Dropdown";
import {appendOverlayListeners} from "../../../util/HtmlUtil";
import {is} from "../../../util/Util";


export default class InputOutputSetPopover extends CommandInterceptor {
    constructor(eventBus, modeling, overlays, executionFragmentInterface) {
        super(eventBus);
        this._eventBus = eventBus;
        this._modeling = modeling;
        this._dropdownContainer = document.createElement('div');
        this._dropdownContainer.classList.add('dd-dropdown-multicontainer');

        this._inputDropdown = getDropdown("Input");
        this._dropdownContainer.appendChild(this._inputDropdown);
        this._selectedInput = undefined;

        this._outputDropdown = getDropdown("Output");
        this._dropdownContainer.appendChild(this._outputDropdown);
        this._selectedOutput = undefined;

        this._objectDropdown = getDropdown("Object");
        this._dropdownContainer.appendChild(this._objectDropdown);
        this._selectedObject = undefined;

        this._startButton = document.createElement("button");
        this._startButton.innerHTML = "Start";
        this._startButton.classList.add("startButton");
        this._dropdownContainer.appendChild(this._startButton);
        this._currentDropdownTarget = undefined;
        this._overlayId = undefined;
        this._overlays = overlays;
        this._fragmentInterface = executionFragmentInterface;

        eventBus.on(['element.dblclick'], e => {
            const element = e.element || e.shape || e.elements[0];
            if (is(element, 'bpmn:Task')) {
                const activity = element.businessObject;

                // This activity with input and output set
                const activityWithInputOutput =
                    this._fragmentInterface._mediator
                    .getEnabledActivities()
                    .filter(
                        (a) => a.id.split("###")[0] === activity.id &&
                        a.inputSet && a.outputSet
                    );
                // Input set (class, not object level)
                const inputSets = activityWithInputOutput.map(
                    (a) => a.inputSet.set
                );
                // Output set (class, not object level)
                const outputSets = activityWithInputOutput.map(
                    (a) => a.outputSet.set
                );
                
                
                const inputMap = new Map();
                inputSets.forEach((inputSet) => {
                  const key = inputSet
                    .map((input) => `${input.dataclass.name} [${input.state}]`)
                    .join(", ");
                  if (!inputMap.has(key)) {
                    inputMap.set(key, inputSet);
                  }
                });

                const outputMap = new Map();
                outputSets.forEach((outputSet) => {
                  const key = outputSet
                    .map(
                      (output) => `${output.dataclass.name} [${output.state}]`
                    )
                    .join(", ");
                  if (!outputMap.has(key)) {
                    outputMap.set(key, outputSet);
                  }
                });

                this._dropdownContainer.currentElement = element;

                const populateInputDropdown = () => {
                    this._inputDropdown.populate(
                        inputMap.keys(),
                        (input) => {
                            this._selectedInput = input;
                            this._inputDropdown.getEntries().forEach(entry => entry.setSelected(input === entry.option));
                            populateObjectDropdown();
                        },
                        element
                    );
                }
                const populateOutputDropdown = () => {
                    this._outputDropdown.populate(
                        outputMap.keys(),
                        (output) => {
                            this._selectedOutput = output;
                            this._outputDropdown.getEntries().forEach(entry => entry.setSelected(output === entry.option));
                            populateObjectDropdown();
                        },
                        element
                    );
                }

                const populateObjectDropdown = () => {
                    const selectedActivity = activityWithInputOutput.find(activity => activity.inputSet.set === inputMap.get(this._selectedInput) && activity.outputSet.set === outputMap.get(this._selectedOutput))
                    if(!selectedActivity) {
                        this._objectDropdown.populate([], () => {}, element);
                        return
                    }
                    const objects = this._fragmentInterface._mediator.getRelatedObjectGroupsForActivity(selectedActivity.id);
                    // TODO objects in the dropdown
                }

                populateInputDropdown();
                populateOutputDropdown();
                populateObjectDropdown();

                this._startButton.addEventListener("click", (event) => {
                    this._fragmentInterface.executeStep(element, inputMap.get(this._selectedInput), outputMap.get(this._selectedOutput));
                    event.stopPropagation();
                });


                this._dropdownContainer.handleClick = (event) => {
                    if (!this._dropdownContainer.contains(event.target)) {
                        return false;
                    } else if (event.target.classList.contains('dd-dropdown-entry')) {
                        this._inputDropdown.clearInput();
                        this._outputDropdown.clearInput();
                    } 
                    return true;
                }

                const closeOverlay = appendOverlayListeners(this._dropdownContainer);
                eventBus.once('element.contextmenu', event => {
                    if (this._currentDropdownTarget && ((event.element || event.shape).businessObject !== this._currentDropdownTarget)) {
                        closeOverlay(event);
                        event.preventDefault();
                    }
                });

                // Show the menu(e)
                this._overlayId = overlays.add(element.id, 'classSelection', {
                    position: {
                        bottom: 0,
                        right: 0
                    },
                    scale: false,
                    html: this._dropdownContainer
                });

                this._currentDropdownTarget = element.businessObject;
            }
        });
    }
}

InputOutputSetPopover.$inject = [
    'eventBus',
    'modeling',
    'overlays',
    'executionFragmentInterface'
];
