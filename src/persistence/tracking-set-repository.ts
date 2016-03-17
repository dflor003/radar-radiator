import {TrackingSet} from '../domain/tracking-set';
import {NotFoundError} from '../common/errors/not-found-error';
import * as Enumerable from 'linq';

export class TrackingSetRepository {
    private sets: TrackingSet[] = [];

    constructor() {
    }

    create(trackingSet: TrackingSet): TrackingSet {
        this.sets.push(trackingSet);
        return trackingSet;
    }

    update(trackingSet: TrackingSet): void {
        let index = this.sets.findIndex(set => set.getId() === trackingSet.getId());
        if (index < 0) {
            throw new NotFoundError(`No tracking set with id ${trackingSet.getId()}`)
        }

        this.sets[index] = trackingSet;
    }

    delete(id: string): TrackingSet {
        let index = this.sets.findIndex(set => set.getId() === id);
        let item  = this.sets[index];
        if (index >= 0) {
            this.sets.splice(index, 1);
        }

        return item || null;
    }

    getAll(): TrackingSet[] {
        return this.sets;
    }

    getById(id: string): TrackingSet {
        return Enumerable
            .from(this.sets)
            .firstOrDefault((s: TrackingSet) => s.getId() === id, null);
    }
}