import {ServiceGroup} from '../domain/service-group';
import {NotFoundError} from '../common/errors/not-found-error';
import * as Enumerable from 'linq';

export class ServiceGroupRepo {
    private groups: ServiceGroup[] = [];

    constructor() {
    }

    create(trackingSet: ServiceGroup): ServiceGroup {
        this.groups.push(trackingSet);
        return trackingSet;
    }

    update(trackingSet: ServiceGroup): void {
        let index = this.groups.findIndex(grp => grp.getId() === trackingSet.getId());
        if (index < 0) {
            throw new NotFoundError(`No tracking set with id ${trackingSet.getId()}`)
        }

        this.groups[index] = trackingSet;
    }

    delete(id: string): ServiceGroup {
        let index = this.groups.findIndex(grp => grp.getId() === id);
        let item  = this.groups[index];
        if (index >= 0) {
            this.groups.splice(index, 1);
        }

        return item || null;
    }

    getAll(): ServiceGroup[] {
        return this.groups;
    }

    getById(id: string): ServiceGroup {
        return Enumerable
            .from(this.groups)
            .firstOrDefault(group => group.getId() == id, null);
    }
}