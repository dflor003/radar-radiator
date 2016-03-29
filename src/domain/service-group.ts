import {EventStream} from '../infrastructure/cqrs/index';
import {ServiceState} from './service-state';
import {Service} from './service';
import {Validate} from '../common/validator';
import {Utils} from '../common/utils';
import * as Enumerable from 'linq';

const Events = {
    ServiceGroupCreated: 'ServiceGroupCreated',
    ServiceAdded: 'ServiceAdded'
};

export interface ServiceGroupCreatedEvent {
    id: string;
    name: string;
}

export interface ServiceAddedEvent {
    id: string;
    name: string;
    url: string;
}

export class ServiceGroup {
    private evtStream: EventStream;
    private services: Service[] = [];
    private id: string;
    private name: string;

    static Events = Events;

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

        evtStream.publishEvent<ServiceGroupCreatedEvent>(group, Events.ServiceGroupCreated, {
            id: Utils.uuid(),
            name: Validate.notEmpty(name, 'Service group name is required')
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

    addService(name: string, url: string): void {
        this.evtStream.publishEvent<ServiceAddedEvent>(this, Events.ServiceAdded, {
            id: Utils.uuid(),
            name: Validate.notEmpty(name, 'Service name is required'),
            url: Validate.isValidUri(url, 'Service url must be a valid absolute URL')
        });
    }

    private onServiceGroupCreated(evt: ServiceGroupCreatedEvent): void {
        this.id = evt.id;
        this.name = evt.name;
    }
}