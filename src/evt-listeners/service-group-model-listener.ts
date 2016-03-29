import {ServiceGroupCreatedEvent, ServiceAddedEvent} from '../domain/service-group';
import {ServiceGroupRepo} from '../persistence/service-group-repo';

export interface IServiceGroup {
    name: string;
    id: string;
}

export class ServiceGroupModelListener {
    private repo: ServiceGroupRepo;

    constructor(repo: ServiceGroupRepo = new ServiceGroupRepo()) {
        this.repo = repo;
    }

    async handleCreated(evt: ServiceGroupCreatedEvent): Promise<void> {
        this.repo.create({
            id: evt.id,
            name: evt.name
        });
    }

    async handleServiceAdded(evt: ServiceAddedEvent): Promise<void> {
        
    }
}