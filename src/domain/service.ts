import {ServiceState} from './service-state';
import {Validate} from '../common/validator';
import * as moment from 'moment';
import Moment = moment.Moment;

export class Service {
    name: string;
    url: string;
    state: ServiceState;

    constructor(name: string, url: string) {
        this.name = Validate.notEmpty(name, 'Service name is required');
        this.url = Validate.notEmpty(url, 'Service URL is required');
        this.state = ServiceState.Unknown;
    }
}