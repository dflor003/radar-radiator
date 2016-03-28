import {IDomainEvent} from './domain-event';
import {Validate} from '../../common/validator';
import * as Enumerable from 'linq';
import * as moment from 'moment';
import {Utils} from '../../common/utils';

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
        for (let event of events) {
            let eventType = event.eventType,
                handlerName = `on${eventType}`;

            if (typeof entity[handlerName] !== 'function') {
                throw new Error(`Entity missing handler for event type '${eventType}'. Implement method '${handlerName}' on entity.`);
            }

            entity[handlerName].call(entity, event.data);
        }
        return this;
    }

    publishEvent<TEvent>(entity: Object, eventType: string, payload: TEvent): this {
        Validate.notNull(entity);
        Validate.notEmpty(eventType);
        Validate.notNull(payload);

        let event: IDomainEvent<TEvent> = {
            entityId: null,
            entityType: entity.constructor.name,
            eventId: Utils.uuid(),
            createdAt: moment().utc().toDate(),
            eventType: eventType,
            data: payload
        };

        this.applyEvents(entity, event);
        event.entityId = this.getEntityId(entity);

        return this;
    }

    getEvents(): IDomainEvent<any>[] {
        return this.events;
    }

    getNewEvents(): IDomainEvent<any>[] {
        let indexOfLastStored = this.lastStoredEventIndex;
        if (indexOfLastStored < 0) {
            return this.getEvents();
        }
        return Enumerable
            .from(this.events)
            .where((evt, index) => index > indexOfLastStored)
            .toArray();
    }

    private getEntityId(entity: Object): string {
        if (typeof entity['getId'] === 'function') {
            return entity['getId'].call(entity);
        }

        if (entity && entity.constructor && typeof entity.constructor['getEntityId'] === 'function') {
            return entity.constructor['getEntityId'](entity);
        }

        throw new Error('Could not get id for entity!')
    }
}