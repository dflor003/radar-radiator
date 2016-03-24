import {IDomainEvent} from './domain-event';
import * as Enumerable from 'linq';

export class EventStream {
    private events: IDomainEvent<any>[] = [];
    private lastStoredEventIndex: number = -1;

    constructor(storedEvents?: IDomainEvent<any>[]) {
        this.events = storedEvents ? storedEvents.slice(0) : [];
        if (this.events.length) {
            this.lastStoredEventIndex = this.events.length - 1;
        }
    }

    applyTo(entity: Object): this {
        return this.applyEvents(entity, ...this.events);
    }

    applyEvents(entity: Object, ...events: IDomainEvent<any>[]): this {
        for(let event of events){
            let eventType = event.entityType,
                handlerName = `on${eventType}`;

            if (!entity.hasOwnProperty(handlerName) || typeof entity[handlerName] !== 'function') {
                throw new Error(`Entity missing handler for event type '${eventType}'. Implement method '${handlerName}' on entity.`);
            }

            entity[handlerName].call(entity, event);
        }
        return this;
    }

    publishEvents(entity: Object, ...events: IDomainEvent<any>[]): this {
        this.applyEvents(entity, ...events);
        this.events.push(...events);

        return this;
    }

    getEvents(): IDomainEvent[] {
        return this.events;
    }

    getNewEvents(): IDomainEvent[] {
        let indexOfLastStored = this.lastStoredEventIndex;
        if (indexOfLastStored < 0) {
            return this.getEvents();
        }
        return Enumerable
            .from(this.events)
            .where((evt, index) => index > indexOfLastStored)
            .toArray();
    }
}