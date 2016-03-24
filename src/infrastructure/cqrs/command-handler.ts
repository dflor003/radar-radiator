import {Validate} from '../../common/validator';
import {Command} from './command';
import {IDomainEvent} from './domain-event';

export abstract class CommandHandler {
    private _commandTypeHandled: string;

    constructor(commandTypeHandled: string) {
        this._commandTypeHandled = Validate.notEmpty(commandTypeHandled, 'Command handler missing type handled');
    }

    getCommandTypeName(): string {
        return this._commandTypeHandled;
    }

    handles(cmdName: string): boolean {
        return this._commandTypeHandled === cmdName;
    }

    async abstract handle<TCommand extends Command>(command: TCommand): Promise<IDomainEvent<any>[]>;
}