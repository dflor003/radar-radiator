import {NotFoundError} from '../common/errors/not-found-error';
import * as Enumerable from 'linq';
import {IServiceGroup} from '../read-model/service-group';

const inMemoryGroups: IServiceGroup[] = []

export class ServiceGroupRepo {
    private groups: IServiceGroup[] = [];

    constructor(groups?: IServiceGroup[]) {
        this.groups = groups || inMemoryGroups;
    }

    create(group: IServiceGroup): IServiceGroup {
        this.groups.push(group);
        return group;
    }

    update(group: IServiceGroup): void {
        let index = this.groups.findIndex(grp => grp.id === group.id);
        if (index < 0) {
            throw new NotFoundError(`No tracking set with id ${group.id}`)
        }

        this.groups[index] = group;
    }

    delete(id: string): IServiceGroup {
        let index = this.groups.findIndex(grp => grp.id === id);
        let item  = this.groups[index];
        if (index >= 0) {
            this.groups.splice(index, 1);
        }

        return item || null;
    }

    getAll(): IServiceGroup[] {
        return this.groups;
    }

    getById(id: string): IServiceGroup {
        return Enumerable
            .from(this.groups)
            .firstOrDefault(group => group.id == id, null);
    }
}