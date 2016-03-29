import {CommandHandler, IDomainEvent} from '../infrastructure/cqrs/index';
import {CreateServiceGroupCommand} from '../domain/commands/create-service-group-cmd';
import {ServiceGroup} from '../domain/service-group';

export class CreateServiceGroupHandler extends CommandHandler {
    constructor() {
        super(CreateServiceGroupCommand.name)
    }

    async handle(command: CreateServiceGroupCommand): Promise<IDomainEvent<any>[]> {
        let group = ServiceGroup.new(command.name);
        return group.getEvtStream().getNewEvents();
    }
}