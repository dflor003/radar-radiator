import {Command} from '../infrastructure/cqrs/command';
import {Validate} from '../common/validator';
import {IDomainEvent} from '../infrastructure/cqrs/domain-event';
import {IEventStore} from '../infrastructure/cqrs/event-store';
import {esManager} from '../infrastructure/cqrs/event-sourcing-manager';
import {NotFoundError} from '../common/errors/not-found-error';
import {ServiceGroup} from '../domain/service-group';

export class AddServiceCommand extends Command {
    groupId: string;
    serviceName: string;
    url: string;

    constructor(groupId: string, serviceName: string, url: string) {
        super();
        this.groupId = groupId;;
        this.serviceName = serviceName;
        this.url = url;
    }
}

export class AddServiceHandler {
    private eventStore: IEventStore;

    constructor(eventStore?: IEventStore) {
        this.eventStore = eventStore || esManager.getEventStore();
    }

    async handle(command: AddServiceCommand): Promise<IDomainEvent<any>[]> {
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