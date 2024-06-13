import inherits from 'inherits';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import fragmentPaletteModule from '../fragmentmodeler/palette';
import customModelingModule from '../fragmentmodeler/modeling';
import bpmnExtension from '../fragmentmodeler/moddle/bpmnextension.json';
import {is} from 'bpmn-js/lib/util/ModelUtil';
import {without} from 'min-dash';
import taskLabelHandling from "../fragmentmodeler/taskLabelHandling";
import taskRenderer from "../fragmentmodeler/draw";

import {assign } from 'min-dash';

export default function ExecutionFragmentInterface(options) {
    const customModules = [
        //fragmentPaletteModule,
        //customModelingModule,
        //taskRenderer,
        //taskLabelHandling,
        {
            executionFragmentInterface: ['value', this]
        },
        {
            contextPad: ["value", {}],
            contextPadProvider: ["value", {}],
            palette: ["value", {}],
            paletteProvider: ["value", {}],
            dragging: ["value", {}],
            move: ["value", {}],
            create: ["value", {}],
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

ExecutionFragmentInterface.prototype.importXML = function (xml) {
    return BpmnModeler.prototype.importXML.call(this, xml);
}

ExecutionFragmentInterface.prototype.setMediator = function (mediator) {
    this._mediator = mediator;
}
ExecutionFragmentInterface.prototype.handleOlcListChanged = function (olcs, dryRun = false) {
    this._olcs = olcs;
}

ExecutionFragmentInterface.prototype.handleRoleListChanged = function (roles, dryRun = false) {
    this._roles = roles;
}

ExecutionFragmentInterface.prototype.handleRoleRenamed = function (role) {
    this.getTasksWithRole(role).forEach((element) =>
        this.get('eventBus').fire('element.changed', {
            element
        })
    );
}

ExecutionFragmentInterface.prototype.handleRoleDeleted = function (role) {
    this.getTasksWithRole(role).forEach((element, gfx) => {
        element.businessObject.role = undefined;
        this.get('eventBus').fire('element.changed', {
            element
        });
    });
}

ExecutionFragmentInterface.prototype.handleStateRenamed = function (olcState) {
    this.getDataObjectReferencesInState(olcState).forEach((element, gfx) =>
        this.get('eventBus').fire('element.changed', {
            element
        })
    );
}

ExecutionFragmentInterface.prototype.handleStateDeleted = function (olcState) {
    this.getDataObjectReferencesInState(olcState).forEach((element, gfx) => {
        element.businessObject.states = without(element.businessObject.states, olcState);
        this.get('eventBus').fire('element.changed', {
            element
        });
    });
}

ExecutionFragmentInterface.prototype.handleClassRenamed = function (clazz) {
    this.getDataObjectReferencesOfClass(clazz).forEach((element, gfx) =>
        this.get('eventBus').fire('element.changed', {
            element
        })
    );
}

ExecutionFragmentInterface.prototype.handleClassDeleted = function (clazz) {
    this.getDataObjectReferencesOfClass(clazz).forEach((element, gfx) =>
        this.get('modeling').removeElements([element])
    );
}

ExecutionFragmentInterface.prototype.getDataObjectReferencesInState = function (olcState) {
    return this.get('elementRegistry').filter((element, gfx) =>
        is(element, 'bpmn:DataObjectReference') &&
        element.type !== 'label' &&
        element.businessObject.states?.includes(olcState)
    );
}

ExecutionFragmentInterface.prototype.getDataObjectReferencesOfClass = function (clazz) {
    return this.get('elementRegistry').filter((element, gfx) =>
        is(element, 'bpmn:DataObjectReference') &&
        element.type !== 'label' &&
        clazz.id &&
        element.businessObject.dataclass?.id === clazz.id
    );
}

ExecutionFragmentInterface.prototype.getTasksWithRole = function (role) {
    let list = this.get('elementRegistry').filter((element, gfx) =>
        is(element, 'bpmn:Task') &&
        role.id &&
        element.businessObject.role?.id === role.id
    );
    return list;
}

ExecutionFragmentInterface.prototype.startDoCreation = function (event, elementShape, dataclass, isIncoming) {
    const shape = this.get('elementFactory').createShape({
        type: 'bpmn:DataObjectReference'
    });
    shape.businessObject.dataclass = dataclass;
    shape.businessObject.states = [];
    const hints = isIncoming ?
        {connectionTarget: elementShape}
        : undefined;
    this.get('autoPlace').append(elementShape, shape, hints);
    // The following works for outgoing data, but breaks the activity for incoming
    // executionFragmentModeler.get('create').start(event, shape, {
    //   source: activityShape,
    //   hints
    // });
}


var DEFAULT_OPTIONS = {
    width: '100%',
    height: '100%',
    position: 'relative'
};