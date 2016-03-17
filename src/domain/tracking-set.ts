import {ServiceState} from './service-state';
import {Service} from './service';
import {Validate} from '../common/validator';
import {Utils} from '../common/utils';
import * as Enumerable from 'linq';

export class TrackingSet {
    private services: Service[] = [];
    private id: string;

    name: string;

    constructor(name: string) {
        this.name = Validate.notEmpty(name, 'Name is required');
        this.id = Utils.uuid();
    }

    getId(): string {
        return this.id;
    }

    getServices(): Service[] {
        return this.services;
    }

    lastChecked(): Date {
        return null;
    }

    overallState(): ServiceState {
        let states = Enumerable
            .from(this.services)
            .select((x: Service) => x.state);

        if (states.any((x: ServiceState) => x == ServiceState.Unknown)) {
            return ServiceState.Unknown;
        }

        if (states.any((x: ServiceState) => x == ServiceState.Intermittent)) {
            return ServiceState.Intermittent;
        }

        if (states.any((x: ServiceState) => x == ServiceState.Down)) {
            return ServiceState.Down;
        }

        return ServiceState.Running;
    }
}