/**
 * The Execution Interface class is a placeholder for the Execution Interface
 * It contains the fragment interface and the objec interface
 */
export default class ExecutionInterface {
    constructor(fragmentInterface, objectInterface) {
        this.fragmentInterface = fragmentInterface;
        this.objectInterface = objectInterface;
        this.id = 'EI';
        this.rank = 10;
    }

    name(contrsuctionMode) {
        return 'Execution Interface';
    }


}