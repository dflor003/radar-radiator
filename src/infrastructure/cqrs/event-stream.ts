import {DomainEvent} from './domain-event';
import * as Enumerable from 'linq';

export class EventStream {
    private events: DomainEvent[] = [];
    private lastStoredEventIndex: number = -1;

    constructor(storedEvents?: DomainEvent[]) {
        this.events = storedEvents ? storedEvents.slice(0) : [];
        if (this.events.length) {
            this.lastStoredEventIndex = this.events.length - 1;
        }
    }

    publishEvent(event: DomainEvent) {
        this.events.push(event);
    }

    getEvents(): DomainEvent[] {
        return this.events;
    }

    getNewEvents(): DomainEvent[] {
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