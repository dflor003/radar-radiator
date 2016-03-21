import {CommandHandler} from './command-handler';
import {CreateServiceGroupCommand} from '../domain/commands/create-service-group-cmd';
import {Command} from '../domain/commands/command';
import {BaseEvent} from '../domain/events/base-event';

export class CreateServiceGroupHandler extends CommandHandler {
    constructor() {
        super(CreateServiceGroupCommand.name)
    }

    handle<TCommand extends Command>(command: TCommand): Promise<BaseEvent[]> {
        return undefined;
    }
}