import {CommandHandler, Command, IDomainEvent} from '../infrastructure/cqrs/index';
import {CreateServiceGroupCommand} from '../domain/commands/create-service-group-cmd';

export class CreateServiceGroupHandler extends CommandHandler {
    constructor() {
        super(CreateServiceGroupCommand.name)
    }

    handle<TCommand extends Command>(command: TCommand): Promise<IDomainEvent[]> {
        return undefined;
    }
}