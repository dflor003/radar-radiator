import {HttpError} from './http-error';
import {HttpStatus} from '../http-status';

export class NotFoundError extends HttpError{
    constructor(message: string) {
        super(message, HttpStatus.NotFound);
    }
}