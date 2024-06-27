export function cartesianProduct(...list: Array<Array<any>>): Array<any> {
    return list.reduce((list, b) => list.flatMap(d => b.map(e => [d, e].flat())));
}

/**
 * Use the {@link cartesianProduct} and improve its handling when called with only a single group of elements.
 */
export function extendedCartesianProduct(list: Array<any>) {
    if (list.length === 1) {
        // If we only have one group of things, there is nothing to compute the cartesian product against.
        // So just return each element of a group as a result group.
        return list.flatMap(elementGroup => elementGroup.map((element: any) => [element]));
    }
    // Otherwise, use the regular cartesian product
    return cartesianProduct(...list);
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
