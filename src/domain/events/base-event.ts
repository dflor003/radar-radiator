import {Utils} from '../../common/utils';
import * as moment from 'moment';
import Moment = moment.Moment;

export abstract class BaseEvent {
    private id: string;
    private createdAt: Moment;

    constructor() {
        this.id = Utils.uuid();
        this.createdAt = moment();
    }

    getId(): string {
        return this.id;
    }

    getCreatedAt(): Moment {
        return this.createdAt;
    }
}