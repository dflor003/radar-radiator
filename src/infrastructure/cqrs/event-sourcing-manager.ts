import {CommandHandler} from './command-handler';
import {IEventListener} from './event-handler';
import {CommandBus} from './command-bus';
import {CommandHandlerRegistry} from './command-registry';
import {EventDispatcher} from './event-dispatcher';
import {logger as mainLogger} from '../../common/logger';

const logger = mainLogger.named(`ES`);

export interface IEventingOptions {
    commandHandlers?: CommandHandler[];
    eventListeners?: IEventListener<any>[];
}
export class EventSourcingManager {
    private registry = CommandHandlerRegistry.instance;
    private bus = CommandBus.instance;
    private dispatcher = EventDispatcher.instance;

    start(opts: IEventingOptions): void {
        let handlers = opts.commandHandlers || [],
            listeners = opts.eventListeners || [],
            registry = this.registry,
            dispatcher = this.dispatcher;

        logger.debug(`Initializing EventSourcing subsystem...`);

        logger.debug(`Registering command handlers:`);
        registry.registerHandlers(...handlers);
        handlers.forEach(handler => logger.debug(` - ${handler.getCommandTypeName()} => ${handler.constructor.name}`));

        logger.debug(`Registering event listeners:`);
        dispatcher.registerListeners(...listeners);
        listeners.forEach(listener => logger.debug(` - ${listener.eventType} => ${listener.constructor.name}`));

        dispatcher.start();
        logger.debug('Dispatcher started');
    }
}

export let esManager = new EventSourcingManager();
