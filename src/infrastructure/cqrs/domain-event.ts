import {Utils} from '../../common/utils';
import * as moment from 'moment';
import Moment = moment.Moment;

export abstract class DomainEvent {
    private id: string;
    private createdAt: Moment;

    constructor(name: string) {
        this.id = Utils.uuid();
        this.createdAt = moment();
    }

    abstract getType(): string;

    getId(): string {
        return this.id;
    }

    getCreatedAt(): Moment {
        return this.createdAt;
    }
}