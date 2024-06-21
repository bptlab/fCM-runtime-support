export function cartesianProduct(...list: Array<Array<any>>): Array<any> {
    return list.reduce((list, b) => list.flatMap(d => b.map(e => [d, e].flat())));
}

/**
 * Given a (flat) list, generate all possible subsets of the list.
 * Note that the result also contains the empty subset.
 */
export function getAllSubsets(list: Array<any>) {
    return list.reduce(
        // reduce function that concatenates subsets
        (subsets, value) => subsets.concat(subsets.map((set: any) => [value, ...set])),
        // empty subset to start with
        [[]]
    );
}
