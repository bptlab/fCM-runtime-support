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
                // TODO get allowed inputs and outputs from semantic
                this._dropdownContainer.currentElement = element;

                const populateInputDropdown = () => {
                    this._inputDropdown.populate(
                        ["A", "B", "C"],
                        (input) => {
                            console.log(input)
                            this._selectedInput = input;
                            this._inputDropdown.getEntries().forEach(entry => entry.setSelected(input === entry.option));
                        },
                        element
                    );
                }
                const populateOutputDropdown = () => {
                    this._outputDropdown.populate(
                        ["X", "Y", "Z"],
                        (output) => {
                            console.log(output)
                            this._selectedOutput = output;
                            this._outputDropdown.getEntries().forEach(entry => entry.setSelected(output === entry.option));
                        },
                        element
                    );
                }
                
                populateInputDropdown();
                populateOutputDropdown();
                this._startButton.addEventListener("click", (event) => {
                    console.log("Start button clicked")
                    console.log(this._selectedInput)
                    console.log(this._selectedOutput)
                    this._fragmentInterface.executeStep(element, this._selectedInput, this._selectedOutput);
                    event.stopPropagation();
                });


                this._dropdownContainer.handleClick = (event) => {
                    console.log(event)
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
