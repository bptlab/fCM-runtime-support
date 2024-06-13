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