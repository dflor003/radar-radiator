import {Utils} from './utils';
import {ValidationError} from './errors/validation-error';
import {isWebUri} from 'valid-url';

export class Validate {
    static notNull<T>(arg: T, message?: string | Error): T {
        if (Utils.isNullOrUndefined(arg)) {
            Validate.throwError(message || new Error('Argument can not be null'));
        }

        return arg;
    }

    static notEmpty(arg: string, message?: string | Error): string {
        if (Utils.isNullOrUndefined(arg) || arg.trim() === '') {
            Validate.throwError(message || new Error('Argument can not be empty'));
        }

        return arg;
    }

    static isValidUri(arg: string, message?: string | Error): string {
        arg = Validate.notEmpty(arg, message);
        if (!isWebUri(arg)) {
            Validate.throwError(message || 'Must be a valid url');
        }

        return arg;
    }

    private static throwError(message?: string | Error): void {
        if (message instanceof Error) {
            throw message;
        } else if (typeof message === 'string') {
            throw new ValidationError(message);
        }

        throw new Error('Invalid argument');
    }
}