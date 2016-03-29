import {CommandHandler, IDomainEvent} from '../infrastructure/cqrs/index';
import {ServiceGroup} from '../domain/service-group';
import {Command} from '../infrastructure/cqrs/command';
import {Validate} from '../common/validator';

export class CreateServiceGroupCommand extends Command {
    name: string;

    constructor(name: string) {
        super();
        this.name = Validate.notEmpty(name, 'name is required');
    }
}

export class CreateServiceGroupHandler extends CommandHandler {
    constructor() {
        super(CreateServiceGroupCommand.name)
    }

    async handle(command: CreateServiceGroupCommand): Promise<IDomainEvent<any>[]> {
        let group = ServiceGroup.new(command.name);
        return group.getEvtStream().getNewEvents();
    }
}