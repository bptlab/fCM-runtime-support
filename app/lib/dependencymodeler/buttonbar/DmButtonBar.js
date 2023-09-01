import {classes as domClasses,} from 'min-dom';
import {ENABLE_STATE_SPACE_QUERIES} from '../../../featureFlags'


export default function DmButtonBar(canvas, eventBus, dependencyModeler) {
    var container = canvas.getContainer().parentElement;
    var buttonBar = document.createElement('div');
    domClasses(buttonBar).add('olc-buttonbar');
    container.appendChild(buttonBar);

    // export of state space queries
    const exportButton = document.createElement('button');
    exportButton.innerHTML = 'Export State Space Query'
    exportButton.addEventListener('click', function () {
        eventBus.fire('export.state-space-query');
    });
    if(ENABLE_STATE_SPACE_QUERIES) buttonBar.appendChild(exportButton);
}

DmButtonBar.$inject = [
    'canvas',
    'eventBus',
    'dependencyModeler'
];
