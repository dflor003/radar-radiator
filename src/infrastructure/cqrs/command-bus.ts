import {Command} from './command';
import {EventEmitter} from 'events';
import {Registry} from './registry';
import {Validate} from '../../common/validator';
import {logger as mainLogger} from '../../common/logger';

const logger = mainLogger.namespace('ES.CMD-BUS');

export class CommandBus extends EventEmitter {
    private static _instance: CommandBus;

    // Constants for event emitter
    static Events = {
        EventsGenerated: 'events-generated',
        Error: 'error'
    };

    warnOnNoEvents = true;

    static get instance(): CommandBus {
        return CommandBus._instance || (CommandBus._instance = new CommandBus());
    }

    async processCommand(command: Command): Promise<void> {
        command = Validate.notNull(command, 'No command passed');

        // Get handler for command
        logger.trace(`Processing command '${command.commandType}'`);
        let handler = Registry.instance.getHandler(command.commandType);

        try {
            // Handle the command and capture any events it yields
            let events = await handler.handle(command);

            // Usually processing commands yields at least one event. Warn if not the case.
            if (!events.length && this.warnOnNoEvents) {
                logger.warn(`WARNING! Command '${command.commandType}' yielded no events!`)
            }

            // Emit those events to consumers
            this.emit(CommandBus.Events.EventsGenerated, events);
        } catch(err) {
            // Emit error if one is thrown
            logger.error(`Failed processing command '${command.commandType}'`, err);
            this.emit(CommandBus.Events.Error, err);
            throw err;
        }
    }
}