/// <reference path="../linq/linq.3.0.3-Beta4.d.ts" />
/**
 * linqjs adapter for the server-side. Necessary because the typings
 * for it assume client-side usage.
 */
declare module 'linq' {
    export = Enumerable;
}