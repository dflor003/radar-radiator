import * as uuid from 'node-uuid';

export class Utils {
    static isNullOrUndefined(val: any): boolean {
        return typeof val === 'undefined' || val === null;
    }

    static uuid(): string {
        return uuid.v4();
    }
}