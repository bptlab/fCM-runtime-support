import inherits from 'inherits';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import bpmnExtension from '../fragmentmodeler/moddle/bpmnextension.json';
import {is} from 'bpmn-js/lib/util/ModelUtil';
import {without} from 'min-dash';
import taskRenderer from "../fragmentmodeler/draw"
import inputOutputSetPopover from "./modules/InputOutputSetPopover";
import enabledActivityColor from "./modules/EnabledActivityColor";

import {assign } from 'min-dash';
import { Activity } from '../../../dist/executionEngine/types/fragments/Activity';

export default function ExecutionFragmentInterface(options) {
    const customModules = [
        //fragmentPaletteModule,
        //customModelingModule,
        enabledActivityColor,
        // taskRenderer, TODO currently not possible because overwriting the renderer
        //taskLabelHandling,
        inputOutputSetPopover,
        {
            executionFragmentInterface: ['value', this]
        },
        {// Disable editing of the diagram
            contextPad: ["value", {}],
            contextPadProvider: ["value", {}],
            palette: ["value", {}],
            paletteProvider: ["value", {}],
            dragging: ["value", {}],
            move: ["value", {}],
            create: ["value", {}],
            labelEditingPreview: ["value", {}],
            labelEditingProvider: ["value", {}],
            // ...
          }
    ];

    options.additionalModules = [
        ...customModules,
        ...(options.additionalModules || [])
    ];

    options.moddleExtensions = {
        fcm: bpmnExtension
    };
    options = assign({}, DEFAULT_OPTIONS, options);

    BpmnModeler.call(this, options);
}
inherits(ExecutionFragmentInterface, BpmnModeler);

ExecutionFragmentInterface.prototype.id = "EFM";
ExecutionFragmentInterface.prototype.rank = 9;

ExecutionFragmentInterface.prototype.name = function (constructionMode) {
    return "Execution Fragments";
}

ExecutionFragmentInterface.prototype.setMediator = function (mediator) {
    this._mediator = mediator;
}

/**
 * Refreshing the fragment interface by updating the enabled activities
 */
ExecutionFragmentInterface.prototype.refresh = function () {
  this._enabledActivity = this._mediator.getEnabledActivities();
  const enabledActivityIds = this._enabledActivity.map(
    (activity) => activity.id.split("###")[0]
  );
  this.get("elementRegistry")
    .filter((element) => is(element, "bpmn:Task"))
    .forEach((element) => {
      element.businessObject.isEnabled = enabledActivityIds.includes(
        element.id
      );

      this.get("eventBus").fire("element.changed", {
        element,
      });
    });
};



var DEFAULT_OPTIONS = {
    width: '100%',
    height: '100%',
    position: 'relative'
};
