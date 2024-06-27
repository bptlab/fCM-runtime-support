
import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";
import {is} from '../../../util/Util';
import {getSemantic} from 'bpmn-js/lib/draw/BpmnRenderUtil';
import {attr} from 'tiny-svg';
const HIGH_PRIORITY = 1500;

export default class EnabledActivityColor extends BaseRenderer {
    constructor(eventBus, bpmnRenderer) {
        super(eventBus, HIGH_PRIORITY);
        this.bpmnRenderer = bpmnRenderer;
    }

    canRender(element) {
        return is(element, 'bpmn:Task');
    }

    drawShape(parentNode, element) {
        const shape = this.bpmnRenderer.drawShape(parentNode, element);
        const semantic = getSemantic(element);
        if (semantic.isEnabled)
            attr(shape, 'fill', "#0096FF");
        return shape;
    }


}

EnabledActivityColor.$inject = ['eventBus', 'bpmnRenderer' ];
