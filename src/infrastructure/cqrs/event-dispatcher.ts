import {CommandBus} from './command-bus';
import {Validate} from '../../common/validator';
import {IEventStore, InMemoryEventStore} from './event-store';
import {logger as mainLogger} from '../../common/logger';
import {IDomainEvent} from './domain-event';
import {IEventListener} from './event-handler';
import * as Enumerable from 'linq';

type ListenerMap = { [eventType: string]: IEventListener<any>[]; };

const logger = mainLogger.namespace('ES.EVT-DISPATCH');

export class EventDispatcher {
    private static _instance: EventDispatcher;
    private bus: CommandBus;
    private store: IEventStore;
    private listeners: ListenerMap = {};

    logEvents = true;

    constructor(bus: CommandBus = CommandBus.instance, store: IEventStore = new InMemoryEventStore()) {
        this.bus = Validate.notNull(bus);
        this.store = Validate.notNull(store);
    }

    static get instance(): EventDispatcher {
        return EventDispatcher._instance || (EventDispatcher._instance = new EventDispatcher());
    }

    start(): void {
        this.bus.on(CommandBus.Events.EventsGenerated, (events: IDomainEvent<any>[]) => this.processEvents(events));
    }

    registerListeners(...listeners: IEventListener<any>[]): this {
        listeners = listeners || [];
        listeners.forEach(listener => {
            let evtType = listener.eventType,
                listenerArray = this.listeners[evtType] || (this.listeners[evtType] = []);
            listenerArray.push(listener);
        });
        return this;
    }

    private async processEvents(events: IDomainEvent<any>[]): Promise<void> {
        // Save events in the event store
        logger.trace(`Storing ${events.length} events to the event store.`);
        this.store.saveEvents(events);

        for (let event of events) {
            // Log a message if configured to do so
            if (this.logEvents) logger.debug(`Event fired: ${event.eventType}`, event.data);

            // Get all listeners for that event type
            let listeners = this.listeners[event.eventType] || [];

            // Run all listeners
            for (let listener of listeners) {
                let listenerName = listener.constructor ? listener.constructor.name : 'anonymous';
                try {
                    await listener.handle(event.data);
                    logger.trace(`Event '${event.eventType}' handled by listener ${listenerName}.`);
                } catch(err) {
                    logger.error(`Failed processing event '${event.eventType}' for listener '${listenerName}': `, err.toString());
                }
            }
        }
    }
}