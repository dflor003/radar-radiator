import {ServiceState} from './service-state';
import {DomainEvent, EventStream} from '../infrastructure/cqrs/index';
import {Service} from './service';
import {Validate} from '../common/validator';
import {Utils} from '../common/utils';
import * as Enumerable from 'linq';

export class ServiceGroup {
    private services: Service[] = [];
    private id: string;
    private evtStream: EventStream;

    name: string;

    constructor(evtStream: EventStream = new EventStream()) {
        this.evtStream = evtStream;
    }

    static new(name: string): EventStream {
        let group = new ServiceGroup();
        name = Validate.notEmpty(name, 'Name is required');
        applyEvents(group, [
            new ServiceGroupCreated(Utils.uuid())
        ]);
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