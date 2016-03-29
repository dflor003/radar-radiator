import {ServiceGroup} from '../domain/service-group';
import {ICreateServiceGroupCommand, IAddServiceCommand} from './service-group-commands';
import {IDomainEvent} from '../infrastructure/cqrs/domain-event';
import {IEventStore} from '../infrastructure/cqrs/event-store';
import {Validate} from '../common/validator';
import {NotFoundError} from '../common/errors/not-found-error';
import {esManager} from '../infrastructure/cqrs/event-sourcing-manager';

export class CreateServiceGroupHandler {
    async handle(command: ICreateServiceGroupCommand): Promise<IDomainEvent<any>[]> {
        let group = ServiceGroup.new(command.name);
        return group.getEvtStream().getNewEvents();
    }
}

export class AddServiceHandler {
    private eventStore: IEventStore;

    constructor(eventStore?: IEventStore) {
        this.eventStore = eventStore || esManager.getEventStore();
    }

    async handle(command: IAddServiceCommand): Promise<IDomainEvent<any>[]> {
        let groupId = Validate.notEmpty(command.groupId, 'Service group id is required'),
            evtStream = await this.eventStore.getEventsByEntityId(groupId);

        if (!evtStream) {
            throw new NotFoundError(`No service group with eventId ${groupId}`);
        }

        let group = new ServiceGroup(evtStream);
        group.addService(command.serviceName, command.url);

        return evtStream.getNewEvents();
    }
}