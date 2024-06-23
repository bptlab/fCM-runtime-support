/**
 * Contains information about the possible predecessor activities of an activity.
 */
export class ActivityPredecessorInformation {
    predecessors: string[]; // activity names
    hasParallelPredecessors: boolean = false;

    constructor(predecessors: string[], hasParallelPredecessors: boolean) {
        this.predecessors = predecessors;
        this.hasParallelPredecessors = hasParallelPredecessors;
    }
}
