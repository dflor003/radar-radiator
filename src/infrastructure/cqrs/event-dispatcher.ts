import {CommandBus} from './command-bus';
import {Validate} from '../../common/validator';
import {IEventStore, InMemoryEventStore} from './event-store';
import {logger} from '../../common/logger';
import {IDomainEvent} from './domain-event';
import {IEventListener} from './event-handler';
import * as Enumerable from 'linq';

type ListenerMap = { [eventType: string]: IEventListener<any>[]; };

export class EventDispatcher {
    private static _instance;
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
        this.bus.on(CommandBus.EventsGeneratedEvent, (events: IDomainEvent<any>[]) => this.processEvents(events));
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

    private processEvents(events: IDomainEvent<any>[]): void {
        this.store.saveEvents(events);

        if (this.logEvents) {
            events.forEach(event => logger.debug(`Event fired: ${event.eventType}`, event.data));
        }

        for (let event of events) {
            let listeners = this.listeners[event.eventType] || [];
            for (let listener of listeners) {
                try {
                    listener.handle(event.data);
                } catch(err) {
                    let listenerName = listener.constructor ? listener.constructor.name : 'anonymous';
                    logger.error(`Failed processing event '${event.eventType}' for listener '${listenerName}': `, err.toString());
                }
            }
        }
    }
}