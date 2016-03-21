import {Validate} from '../common/validator';
import {Command} from '../domain/commands/command';
import {BaseEvent} from '../domain/events/base-event';

export abstract class CommandHandler {
    private commandTypeHandled: string;

    constructor(commandTypeHandled: string) {
        this.commandTypeHandled = Validate.notEmpty(commandTypeHandled, 'Command handler missing type handled');
    }

    getCommandTypeName(): string {
        return this.commandTypeHandled;
    }

    handles(cmdName: string): boolean {
        return this.commandTypeHandled === cmdName;
    }

    async abstract handle<TCommand extends Command>(command: TCommand): Promise<BaseEvent[]>;
}