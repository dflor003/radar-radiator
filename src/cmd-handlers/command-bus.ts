import {Command} from '../domain/commands/command';
import {EventEmitter} from 'events';
import {CommandHandlerRegistry} from "./command-registry";
import {Validate} from '../common/validator';

export class CommandBus extends EventEmitter {
    private static _instance: CommandBus;

    constructor(){
        super();
    }

    static get instance(): CommandBus {
        return CommandBus._instance || (CommandBus._instance = new CommandBus());
    }

    async processCommand(command: Command): Promise<void> {
        command = Validate.notNull(command, 'No command passed');

        // Get handler for command
        let handler = CommandHandlerRegistry.instance.getHandler(command.commandType);

        try {
            // Handle the command and capture any events it yields
            let events = await handler.handle(command);

            // Emit those events to consumers
            this.emit('events-generated', events);
        } catch(err) {
            // Emit error if one is thrown
            this.emit('error', err);
        }
    }
}