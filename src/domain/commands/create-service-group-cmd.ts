import {Command} from '../../infrastructure/cqrs/index';
import {Validate} from '../../common/validator';

export class CreateServiceGroupCommand extends Command {
    name: string;

    constructor(name: string) {
        super();
        this.name = Validate.notEmpty(name, 'name is required');
    }
}