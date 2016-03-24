import {IDomainEvent} from './domain-event';
import {EventStream} from './event-stream';
import * as Enumerable from 'linq';

export interface IEventStore {
    saveEvents(events: IDomainEvent<any>[]): Promise<void>;
    getEventsByEntityId(entityId: string): Promise<EventStream>;
    getEventsByEntityType(entityType: string): Promise<EventStream[]>;
}

export class InMemoryEventStore implements IEventStore{
    private events: IDomainEvent<any>[];

    constructor(events?: IDomainEvent<any>[]) {
        this.events = events || [];
    }

    async saveEvents(events: IDomainEvent<any>[]): Promise<void> {
        this.events.push(...events);
    }

    async getEventsByEntityId(entityId: string): Promise<EventStream> {
        let domainEvents = Enumerable
            .from(this.events)
            .where(evt => evt.entityId === entityId)
            .toArray();

        return new EventStream(domainEvents);
    }

    async getEventsByEntityType(entityType: string): Promise<EventStream[]> {
        return Enumerable
            .from(this.events)
            .where(evt => evt.entityType === entityType)
            .groupBy((evt: IDomainEvent<any>) => evt.entityType)
            .select(grp => new EventStream(grp.toArray()))
            .toArray();
    }
}