import {CommandHandler} from './command-handler';
import {IEventListener} from './event-handler';
import {CommandBus} from './command-bus';
import {Registry} from './registry';
import {EventDispatcher} from './event-dispatcher';
import {logger as mainLogger} from '../../common/logger';
import {IEventStore, EventStoreManager} from './event-store';

const logger = mainLogger.namespace(`ES`);

export interface IEventingOptions {
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

    /**
     * If passed will use this event store to store events. Defaults to an in-memory event store.
     */
    eventStore?: IEventStore;
}
export class EventSourcingManager {
    private registry = Registry.instance;
    private bus = CommandBus.instance;
    private dispatcher = EventDispatcher.instance;

    start(opts?: IEventingOptions): void {
        opts = opts || {};
        let bus = this.bus,
            dispatcher = this.dispatcher;

        logger.debug(`Initializing EventSourcing subsystem...`);
        bus.warnOnNoEvents = typeof opts.warnOnNoEvents === 'boolean' ? opts.warnOnNoEvents : bus.warnOnNoEvents;
        dispatcher.logEvents = typeof opts.logEvents === 'boolean' ? opts.logEvents : dispatcher.logEvents;
        if(opts.eventStore) {
            EventStoreManager.setEventStore(opts.eventStore);
        }

        logger.debug('Starting dispatcher...');
        dispatcher.start();
    }

    getEventStore(): IEventStore {
        return EventStoreManager.getEventStore();
    }
    
    configure(registryConfigurator: (registry: Registry) => void): this {
        registryConfigurator(this.registry);
        return this;
    }
}

export let esManager = new EventSourcingManager();
