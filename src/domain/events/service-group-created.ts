import {IDomainEvent} from '../../infrastructure/cqrs/index';

export class ServiceGroupCreated extends IDomainEvent {
    private name: string;
    private id: string;

    constructor(name: string, id: string) {
        super(id);
        this.name = name;
        this.id = id;
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }
}
