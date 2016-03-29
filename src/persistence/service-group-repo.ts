import {NotFoundError} from '../common/errors/not-found-error';
import {IServiceGroup} from '../evt-listeners/service-group-model-listener';
import * as Enumerable from 'linq';

const inMemoryGroups: IServiceGroup[] = []

export class ServiceGroupRepo {
    private groups: IServiceGroup[] = [];

    constructor(groups?: IServiceGroup[]) {
        this.groups = groups || inMemoryGroups;
    }

    async create(group: IServiceGroup): Promise<IServiceGroup> {
        this.groups.push(group);
        return group;
    }

    async update(group: IServiceGroup): Promise<void> {
        let index = this.groups.findIndex(grp => grp.id === group.id);
        if (index < 0) {
            throw new NotFoundError(`No tracking set with id ${group.id}`)
        }

        this.groups[index] = group;
    }

    async delete(id: string): Promise<IServiceGroup> {
        let index = this.groups.findIndex(grp => grp.id === id);
        let item  = this.groups[index];
        if (index >= 0) {
            this.groups.splice(index, 1);
        }

        return item || null;
    }

    async getAll(): Promise<IServiceGroup[]> {
        return this.groups;
    }

    async getById(id: string): Promise<IServiceGroup> {
        return Enumerable
            .from(this.groups)
            .firstOrDefault(group => group.id == id, null);
    }
}