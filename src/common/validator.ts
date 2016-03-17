import {Utils} from './utils';
import {ValidationError} from './errors/validation-error';

export class Validate {
    static notNull<T>(arg: T, message: string): T {
        if (Utils.isNullOrUndefined(arg)) {
            throw new ValidationError(message);
        }

        return arg;
    }

    static notEmpty(arg: string, message: string): string {
        if (Utils.isNullOrUndefined(arg) || arg.trim() === '') {
            throw new ValidationError(message);
        }

        return arg;
    }
}