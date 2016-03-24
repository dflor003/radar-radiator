import {Utils} from './utils';
import {ValidationError} from './errors/validation-error';

export class Validate {
    static notNull<T>(arg: T, message?: string | Error): T {
        if (Utils.isNullOrUndefined(arg)) {
            if(message instanceof Error) {
                throw message;
            } else if(typeof message === 'string') {
                throw new ValidationError(message);
            } else {
                throw new Error('Argument can not be null');
            }
        }

        return arg;
    }

    static notEmpty(arg: string, message?: string | Error): string {
        if (Utils.isNullOrUndefined(arg) || arg.trim() === '') {
            if(message instanceof Error) {
                throw message;
            } else if(typeof message === 'string') {
                throw new ValidationError(message);
            } else {
                throw new Error('Argument can not be null');
            }
        }

        return arg;
    }
}