import {CommandBus} from './command-bus';
import {Validate} from '../../common/validator';
import {IEventStore, InMemoryEventStore, EventStoreManager} from './event-store';
import {logger as mainLogger} from '../../common/logger';
import {IDomainEvent} from './domain-event';
import {Registry} from './registry';

const logger = mainLogger.namespace('ES.EVT-DISPATCH');

export class EventDispatcher {
    private static _instance: EventDispatcher;
    private bus: CommandBus;
    private store: IEventStore;
    private registry: Registry;

    logEvents = true;

    constructor(bus: CommandBus = CommandBus.instance, registry: Registry = Registry.instance, store: IEventStore = EventStoreManager.getEventStore()) {
        this.bus = Validate.notNull(bus);
        this.registry = Validate.notNull(registry);
        this.store = Validate.notNull(store);
    }

    static get instance(): EventDispatcher {
        return EventDispatcher._instance || (EventDispatcher._instance = new EventDispatcher());
    }

    start(): void {
        this.bus.on(CommandBus.Events.EventsGenerated, (events: IDomainEvent<any>[]) => this.processEvents(events));
    }

    private async processEvents(events: IDomainEvent<any>[]): Promise<void> {
        // Save events in the event store
        logger.trace(`Storing ${events.length} events to the event store.`);
        this.store.saveEvents(events);

        for (let event of events) {
            // Log a message if configured to do so
            if (this.logEvents) logger.debug(`Event fired: ${event.eventType}`, event.data);

            // Get all listeners for that event type
            let listeners = this.registry.getListeners(event.eventType);

            // Run all listeners
            for (let listener of listeners) {
                try {
                    await listener.handle(event.data);
                    logger.trace(`Event '${event.eventType}' handled by listener.`);
                } catch(err) {
                    logger.error(`Failed processing event '${event.eventType}': `, err.toString());
                }
            }
        }
    }
}