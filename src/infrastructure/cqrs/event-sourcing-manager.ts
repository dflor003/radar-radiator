import {CommandHandler} from './command-handler';
import {IEventListener} from './event-handler';
import {CommandBus} from './command-bus';
import {CommandHandlerRegistry} from './command-registry';
import {EventDispatcher} from './event-dispatcher';
import {logger as mainLogger} from '../../common/logger';

const logger = mainLogger.namespace(`ES`);

export interface IEventingOptions {
    /**
     * An array of one or more command handlers for processing commands that are submitted
     * to the command bus. Each command should have exactly one command handler.
     */
    commandHandlers?: CommandHandler[];

    /**
     * An array of one or more event listeners that should respond to events being fired
     * and act appropriately (i.e. generate a projection, etc.). Each event can have zero or more
     * command handlers associated with it.
     */
    eventListeners?: IEventListener<any>[];

    /**
     * If true, will log a warning whenever there is a command that yields zero events.
     * Defaults to true.
     */
    warnOnNoEvents?: boolean;

    /**
     * If true, will log every event that gets dispatched by the event dispatcher.
     * Defaults to true.
     */
    logEvents?: boolean;
}
export class EventSourcingManager {
    private registry = CommandHandlerRegistry.instance;
    private bus = CommandBus.instance;
    private dispatcher = EventDispatcher.instance;

    start(opts: IEventingOptions): void {
        let handlers = opts.commandHandlers || [],
            listeners = opts.eventListeners || [],
            registry = this.registry,
            bus = this.bus,
            dispatcher = this.dispatcher;

        logger.debug(`Initializing EventSourcing subsystem...`);
        bus.warnOnNoEvents = typeof opts.warnOnNoEvents === 'boolean' ? opts.warnOnNoEvents : bus.warnOnNoEvents;
        dispatcher.logEvents = typeof opts.logEvents === 'boolean' ? opts.logEvents : dispatcher.logEvents;

        logger.debug(`Registering command handlers:`);
        registry.registerHandlers(...handlers);
        handlers.forEach(handler => logger.debug(` - ${handler.getCommandTypeName()} => ${handler.constructor.name}`));

        logger.debug(`Registering event listeners:`);
        dispatcher.registerListeners(...listeners);
        listeners.forEach(listener => logger.debug(` - ${listener.eventType} => ${listener.constructor.name}`));

        logger.debug('Starting dispatcher...');
        dispatcher.start();
    }
}

export let esManager = new EventSourcingManager();
