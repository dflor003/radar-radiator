import {HttpStatus} from '../http-status';

export class HttpError extends Error {
    status: HttpStatus;

    constructor(message: string, status: HttpStatus = HttpStatus.InternalServerError) {
        super(message);
        this.status = status;
    }
}