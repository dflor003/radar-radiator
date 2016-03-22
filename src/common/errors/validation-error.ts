import {HttpError} from './http-error';
import {HttpStatus} from '../http-status';

export class ValidationError extends HttpError {
    constructor(message: string) {
        super(message, HttpStatus.BadRequest);
    }
}