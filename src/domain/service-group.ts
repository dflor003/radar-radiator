import {EventStream} from '../infrastructure/cqrs/index';
import {ServiceState} from './service-state';
import {Service} from './service';
import {Validate} from '../common/validator';
import {Utils} from '../common/utils';
import * as Enumerable from 'linq';

export const Events = {
    ServiceGroupCreated: 'ServiceGroupCreated',
};

export interface ServiceGroupCreated {
    id: string;
    name: string;
}

export class ServiceGroup {
    private evtStream: EventStream;
    private services: Service[] = [];
    private id: string;
    private name: string;

    constructor(evtStream: EventStream) {
        if (!evtStream) {
            throw new Error('No event stream passed')
        }

        this.evtStream = evtStream;
        this.evtStream.applyTo(this);
    }

    static new(name: string): ServiceGroup {
        let evtStream = new EventStream(),
            group = new ServiceGroup(evtStream);

        name = Validate.notEmpty(name, 'Name is required');
        evtStream.publishEvent(group, Events.ServiceGroupCreated, {
            id: Utils.uuid(),
            name: name
        });

        return group;
    }

    getEvtStream(): EventStream {
        return this.evtStream;
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getServices(): Service[] {
        return this.services;
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

    private onServiceGroupCreated(evt: ServiceGroupCreated): void {
        this.id = evt.id;
        this.name = evt.name;
    }
}