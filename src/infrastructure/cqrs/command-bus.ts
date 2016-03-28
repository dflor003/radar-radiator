import {Command} from './command';
import {EventEmitter} from 'events';
import {CommandHandlerRegistry} from "./command-registry";
import {Validate} from '../../common/validator';
import {logger} from '../../common/logger';

export class CommandBus extends EventEmitter {
    private static _instance: CommandBus;
    static EventsGeneratedEvent = 'events-generated';
    static ErrorEvent = 'error';


    constructor(){
        super();
    }

    static get instance(): CommandBus {
        return CommandBus._instance || (CommandBus._instance = new CommandBus());
    }

    async processCommand(command: Command): Promise<void> {
        command = Validate.notNull(command, 'No command passed');

        // Get handler for command
        logger.trace(`Processing command '${command.commandType}'`);
        let handler = CommandHandlerRegistry.instance.getHandler(command.commandType);

        try {
            // Handle the command and capture any events it yields
            let events = await handler.handle(command);

            // Emit those events to consumers
            this.emit(CommandBus.EventsGeneratedEvent, events);
        } catch(err) {
            // Emit error if one is thrown
            logger.error(`Failed processing command '${command.commandType}'`, err);
            this.emit(CommandBus.ErrorEvent, err);
            throw err;
        }
    }
}