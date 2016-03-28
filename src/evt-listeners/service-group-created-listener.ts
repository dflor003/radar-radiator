import {IEventListener} from '../infrastructure/cqrs/event-handler';
import {ServiceGroupCreated, Events} from '../domain/service-group';
import {ServiceGroupRepo} from '../persistence/service-group-repo';

export class ServiceGroupCreatedListener implements IEventListener<ServiceGroupCreated> {
    private repo: ServiceGroupRepo;

    eventType = Events.ServiceGroupCreated;

    constructor(repo: ServiceGroupRepo = new ServiceGroupRepo()) {
        this.repo = repo;
    }

    async handle(evt: ServiceGroupCreated): Promise<void> {
        this.repo.create({
            id: evt.id,
            name: evt.name
        });
    }
}