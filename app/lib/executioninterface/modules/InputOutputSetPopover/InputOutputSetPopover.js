import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";
import { getSemantic } from "bpmn-js/lib/draw/BpmnRenderUtil";
import getDropdown from "../../../util/Dropdown";
import { appendOverlayListeners } from "../../../util/HtmlUtil";
import { is } from "../../../util/Util";

export default class InputOutputSetPopover extends CommandInterceptor {
  constructor(eventBus, overlays, executionFragmentInterface) {
    super(eventBus);
    this._eventBus = eventBus;

    // Popover container for the dropdowns
    this._dropdownContainer = document.createElement("div");
    this._dropdownContainer.classList.add("dd-dropdown-multicontainer");

    // Dropdown to select the input set (class based)
    this._inputDropdown = getDropdown("Input");
    this._dropdownContainer.appendChild(this._inputDropdown);
    this._selectedInput = undefined;

    // Dropdown to select the output set (class based)
    this._outputDropdown = getDropdown("Output");
    this._dropdownContainer.appendChild(this._outputDropdown);
    this._selectedOutput = undefined;

    // Dropdown to select the real objects for the input set
    // Only available after input and output set have been selected
    this._objectDropdown = getDropdown("Object");
    this._dropdownContainer.appendChild(this._objectDropdown);
    this._selectedObject = undefined;

    // Button to start the execution
    this._startButton = document.createElement("button");
    this._startButton.innerHTML = "Start";
    this._startButton.classList.add("startButton");
    this._dropdownContainer.appendChild(this._startButton);

    this._currentDropdownTarget = undefined;
    this._overlayId = undefined;
    this._overlays = overlays;
    this._fragmentInterface = executionFragmentInterface;

    eventBus.on(["element.dblclick"], (e) => {
      const element = e.element || e.shape || e.elements[0];
      const mediator = this._fragmentInterface._mediator;
      if (!is(element, "bpmn:Task")) return;
      // Task is not enabled
      if (!getSemantic(element).isEnabled) return;
      // Task is enabled --> show the popover
      this._dropdownContainer.currentElement = element;
      const activity = element.businessObject;
      // All possible combinations of the activity, input and output sets
      const activityWithInputOutput = mediator
        .getEnabledActivities()
        .filter(
          (a) =>
            a.id.split("###")[0] === activity.id && a.inputSet && a.outputSet
        );
      // All possible input sets (class, not object level)
      const inputSets = activityWithInputOutput.map((a) => a.inputSet.set);
      // Map between a string representation and the actual input set
      const inputMap = new Map();
      inputSets.forEach((inputSet) => {
        const key = inputSet
          .map((input) => `${input.dataclass.name} [${input.state}]`)
          .join(", ");
        if (!inputMap.has(key)) {
          inputMap.set(key, inputSet);
        }
      });
      // Show string representation in the dropdown
      // Update object dropdown based on the selected input and output
      const populateInputDropdown = () => {
        this._inputDropdown.populate(
          inputMap.keys(),
          (input) => {
            this._selectedInput = inputMap.get(input);
            // Set the selected entry to the selected option
            this._inputDropdown
              .getEntries()
              .forEach((entry) => entry.setSelected(input === entry.option));
            populateObjectDropdown();
          },
          element
        );
      };

      // Output set (class, not object level)
      const outputSets = activityWithInputOutput.map((a) => a.outputSet.set);
      // Map between a string representation and the actual output set
      const outputMap = new Map();
      outputSets.forEach((outputSet) => {
        const key = outputSet
          .map((output) => `${output.dataclass.name} [${output.state}]`)
          .join(", ");
        if (!outputMap.has(key)) {
          outputMap.set(key, outputSet);
        }
      });
      // Show string representation in the dropdown
      // Update object dropdown based on the selected input and output
      const populateOutputDropdown = () => {
        this._outputDropdown.populate(
          outputMap.keys(),
          (output) => {
            this._selectedOutput = outputMap.get(output);
            // Set the selected entry to the selected option
            this._outputDropdown
              .getEntries()
              .forEach((entry) => entry.setSelected(output === entry.option));
            populateObjectDropdown();
          },
          element
        );
      };

      // Update object dropdown based on the selected input and output
      // Options are only available after input and output set have been selected
      const populateObjectDropdown = () => {
        const selectedActivity = activityWithInputOutput.find(
          (activity) =>
            activity.inputSet.set === this._selectedInput &&
            activity.outputSet.set === this._selectedOutput
        );
        if (!selectedActivity) {
          this._objectDropdown.populate([], () => {}, element);
          return;
        }
        const objectInputSets = mediator.getRelatedObjectGroupsForActivity(
          selectedActivity.id
        );
        // Map between a string representation and the actual object input set
        const objectMap = new Map();
        objectInputSets.forEach((objectInputSet) => {
          const key = objectInputSet
            .map((object) => object.instance.name)
            .join(", ");
          if (!objectMap.has(key)) {
            objectMap.set(key, objectInputSet);
          }
        });
        // Show string representation in the dropdown
        this._objectDropdown.populate(
          objectMap.keys(),
          (object) => {
            this._selectedObject = objectMap.get(object);
            // Set the selected entry to the selected option
            this._objectDropdown
              .getEntries()
              .forEach((entry) => entry.setSelected(object === entry.option));
          },
          element
        );
      };

      populateInputDropdown();
      populateOutputDropdown();
      populateObjectDropdown();

      // Execute the step with the selected input and output set and object
      this._startButton.addEventListener("click", (event) => {
        // If no input, output or object is selected, do nothing
        if (
          !this._selectedInput ||
          !this._selectedOutput ||
          !this._selectedObject
        )
          return;
        const selectedActivity = activityWithInputOutput.find(
          (activity) =>
            activity.inputSet.set === this._selectedInput &&
            activity.outputSet.set === this._selectedOutput
        );
        const selectedObjects = this._selectedObject.map(
          (object) => object.instance.id
        );
        mediator.executeStep(selectedActivity.id, selectedObjects);
        event.stopPropagation();

        // Close popover after execution
        closeOverlay(event);
        // Remove selection
        this._selectedInput = undefined;
        this._selectedOutput = undefined;
        this._selectedObject = undefined;
      });

      this._dropdownContainer.handleClick = (event) => {
        // Remove selection if the click is outside of the dropdown
        if (!this._dropdownContainer.contains(event.target)) {
          this._selectedInput = undefined;
          this._selectedOutput = undefined;
          this._selectedObject = undefined;
          return false;
        }
        return true;
      };

      const closeOverlay = appendOverlayListeners(this._dropdownContainer);
      eventBus.once("element.contextmenu", (event) => {
        if (
          this._currentDropdownTarget &&
          (event.element || event.shape).businessObject !==
            this._currentDropdownTarget
        ) {
          closeOverlay(event);
          event.preventDefault();
        }
      });
      // Show the menu(e)
      this._overlayId = overlays.add(element.id, "classSelection", {
        position: {
          bottom: 0,
          right: 0,
        },
        scale: false,
        html: this._dropdownContainer,
      });

      this._currentDropdownTarget = element.businessObject;
    });
  }
}

InputOutputSetPopover.$inject = [
  "eventBus",
  "overlays",
  "executionFragmentInterface",
];
