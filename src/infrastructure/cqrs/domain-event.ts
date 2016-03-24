import {Utils} from '../../common/utils';
import * as moment from 'moment';
import Moment = moment.Moment;

export abstract class DomainEvent {
    private _eventId: string;
    private _eventType: string;
    private _createdAt: Moment;

    constructor(eventType?: string) {
        this._eventId = Utils.uuid();
        this._eventType = eventType || this.constructor.name;
        this._createdAt = moment();
    }

    getEventType(): string {
        return this._eventType;
    }

    getEventId(): string {
        return this._eventId;
    }

    getCreatedAt(): Moment {
        return this._createdAt;
    }
}