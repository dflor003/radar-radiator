export abstract class Command {
    private constructorName: string;

    constructor() {
        this.constructorName = this.constructor.name;
    }

    get commandType(): string {
        return this.constructorName;
    }
}